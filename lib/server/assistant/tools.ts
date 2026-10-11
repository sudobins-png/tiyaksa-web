import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { pricingTiers } from '@/data/pricing';
import { PRICE_NOTES } from '@/data/priceNotes';
import { PRICE_CATEGORY_NAMES, PRICE_CATEGORY_SLUGS, searchPriceList } from './priceSearch';
import { computeEstimatePricing, OFFER_DISCOUNT_RATE } from '@/lib/utils/offerPricing';
import { formatPromoDate, getPromoDeadline } from '@/lib/utils/promoDeadline';
import { formatMoney } from '@/lib/utils';
import { cleanLine } from '@/lib/utils/sanitize';
import {
  DESIGN_STATES,
  NO_ROOMS_TYPES,
  OBJECT_TYPES,
  REPAIR_TYPES,
  ROOMS,
  STYLES,
  TONES,
  areaBucket,
  type AssistantEvent,
  type AssistantPreferences,
} from '@/lib/assistant/types';

export interface ToolContext {
  prefs: AssistantPreferences;
  emit: (event: AssistantEvent) => void;
}

export interface ToolOutcome {
  content: string;
  isError?: boolean;
}

const areaSqm = z.number().min(10).max(1000);

export const preferencesSchema = z
  .object({
    aptType: z.enum(OBJECT_TYPES),
    rooms: z.enum(ROOMS),
    areaSqm,
    interiorStyle: z.enum(STYLES),
    colorTone: z.enum(TONES),
    hasDesign: z.enum(DESIGN_STATES),
    repairType: z.enum(REPAIR_TYPES),
    notes: z.string().max(300),
  })
  .partial()
  .strict();

const estimateSchema = z.object({
  area_sqm: areaSqm,
  property_type: z.enum(['Новостройка', 'Вторичное жильё']),
  repair_type: z.enum([...REPAIR_TYPES, 'все']).optional(),
  has_design_project: z.boolean().optional(),
});

const requestOfferSchema = z.object({ summary: z.string().min(1).max(500) });

const priceSearchSchema = z.object({
  query: z.string().min(1).max(80).optional(),
  category: z.enum(PRICE_CATEGORY_SLUGS as [string, ...string[]]).optional(),
});

const enumList = (values: readonly string[]) => ({ type: 'string', enum: [...values] });

export const ASSISTANT_TOOLS: Anthropic.Beta.Messages.BetaTool[] = [
  {
    name: 'compare_repair_types',
    description:
      'Сравнение трёх видов ремонта (косметический, капитальный, дизайнерский): описание, срок, цена от за м², что входит. Вызывай, когда клиент спрашивает о различиях или выбирает вид ремонта.',
    eager_input_streaming: true,
    input_schema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'estimate_cost',
    description:
      'Ориентировочная стоимость ремонта квартиры по прайсу: диапазон «от — до» и срок. Единственный источник цен — не считай сам. Нужны площадь и тип жилья.',
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: {
        area_sqm: { type: 'number', description: 'Площадь в м², от 10 до 1000' },
        property_type: enumList(['Новостройка', 'Вторичное жильё']),
        repair_type: {
          ...enumList([...REPAIR_TYPES, 'все']),
          description: 'Какой вид ремонта посчитать; по умолчанию «все» — три варианта',
        },
        has_design_project: {
          type: 'boolean',
          description: 'true, если у клиента уже есть готовый дизайн-проект (удешевляет дизайнерский ремонт)',
        },
      },
      required: ['area_sqm', 'property_type'],
      additionalProperties: false,
    },
  },
  {
    name: 'search_price_list',
    description: `Поиск цен на отдельные работы в прайс-листе сайта (демонтаж, стяжка, штукатурка, электрика, сантехника, дизайн-проект, клининг и т. д.). Единственный источник цен по позициям. Категории: ${PRICE_CATEGORY_NAMES.join(', ')}. Поиск по началу слов: если ничего не нашлось, переформулируй (например «оштукатуривание» вместо «штукатурка», «плитка» вместо «кафель»). Для общей стоимости ремонта используй estimate_cost, а не этот инструмент.`,
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Что ищем словами из названия работы, например «стяжка пола» или «демонтаж плитки»' },
        category: {
          ...enumList(PRICE_CATEGORY_SLUGS),
          description: `Ограничить поиск категорией: ${PRICE_CATEGORY_SLUGS.map((s, i) => `${s} — ${PRICE_CATEGORY_NAMES[i]}`).join('; ')}`,
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'save_preferences',
    description:
      'Запомнить пожелания клиента. Передавай только то, что клиент назвал сам; незаданные поля пропускай.',
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: {
        aptType: { ...enumList(OBJECT_TYPES), description: 'Тип объекта' },
        rooms: { ...enumList(ROOMS), description: 'Количество комнат' },
        areaSqm: { type: 'number', description: 'Площадь в м²' },
        interiorStyle: { ...enumList(STYLES), description: 'Желаемый стиль интерьера' },
        colorTone: { ...enumList(TONES), description: 'Желаемые тона' },
        hasDesign: { ...enumList(DESIGN_STATES), description: 'Есть ли дизайн-проект' },
        repairType: { ...enumList(REPAIR_TYPES), description: 'Вид ремонта, который интересует' },
        notes: { type: 'string', description: 'Важные пожелания своими словами, до 300 символов' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'request_personal_estimate',
    description:
      'Показать клиенту карточку «Персональный расчёт» с формой имени и контакта. Вызывай, когда известны тип жилья и площадь и клиент готов получить расчёт от управляющего. Сам ничего не отправляет.',
    eager_input_streaming: true,
    input_schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Кратко, 1–3 предложения: что клиент хочет и что важно знать управляющему (до 500 символов)',
        },
      },
      required: ['summary'],
      additionalProperties: false,
    },
  },
];

function range(low: number, high: number): string {
  return `от ${formatMoney(low)} до ${formatMoney(high)}`;
}

function mergePrefs(ctx: ToolContext, patch: AssistantPreferences) {
  ctx.prefs = { ...ctx.prefs, ...patch };
  ctx.emit({ t: 'prefs', v: ctx.prefs });
}

function compareRepairTypes(): ToolOutcome {
  return {
    content: JSON.stringify(
      pricingTiers.map((t) => ({
        вид: t.name,
        срок: t.term,
        цена_от: `${t.priceFrom} ${t.priceUnit}`,
        описание: t.description,
        входит: t.features,
      })),
    ),
  };
}

function estimateCost(input: unknown, ctx: ToolContext): ToolOutcome {
  const parsed = estimateSchema.safeParse(input);
  if (!parsed.success) return { content: 'Некорректные параметры расчёта: нужны площадь 10–1000 м² и тип жилья.', isError: true };
  const { area_sqm, property_type, repair_type = 'все', has_design_project } = parsed.data;

  const hasDesign = has_design_project ?? ctx.prefs.hasDesign === 'Да, уже есть';
  const tiers = computeEstimatePricing(area_sqm, property_type, hasDesign ? 'Да, уже есть' : undefined).filter(
    (t) => repair_type === 'все' || t.name === repair_type,
  );

  mergePrefs(ctx, { aptType: property_type, areaSqm: area_sqm });

  return {
    content: JSON.stringify({
      площадь_м2: area_sqm,
      тип_жилья: property_type,
      учтён_готовый_дизайн_проект: hasDesign,
      варианты: tiers.map((t) => ({
        вид: t.name,
        срок: t.term,
        стоимость: range(t.low, t.high),
        со_скидкой_персонального_расчёта: range(t.discountedLow, t.discountedHigh),
      })),
      скидка_персонального_расчёта: `−${Math.round(OFFER_DISCOUNT_RATE * 100)}% при оформлении персонального расчёта, действует до ${formatPromoDate(getPromoDeadline())}`,
      включено: 'Только работы. Материалы НЕ входят в эти суммы и считаются отдельно.',
      примечания_к_ценам: PRICE_NOTES,
      примечание:
        'Предварительная оценка, не оферта. Обязательно скажи клиенту, что материалы не входят, и упомяни минимальную стоимость заказа. Скидку упоминай только когда предлагаешь персональный расчёт.',
    }),
  };
}

function priceList(input: unknown): ToolOutcome {
  const parsed = priceSearchSchema.safeParse(input);
  if (!parsed.success) return { content: 'Некорректный запрос: нужны слова для поиска и/или категория из списка.', isError: true };
  const { query, category } = parsed.data;
  if (!query && !category) return { content: `Уточни, что искать. Категории прайса: ${PRICE_CATEGORY_NAMES.join(', ')}.`, isError: true };

  const result = searchPriceList(query, category);
  if (result.всего_найдено === 0) {
    return { content: `По запросу ничего не найдено. Попробуй другие слова или категорию: ${PRICE_CATEGORY_NAMES.join(', ')}.`, isError: true };
  }
  return { content: JSON.stringify(result) };
}

function savePreferences(input: unknown, ctx: ToolContext): ToolOutcome {
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) return { content: 'Некорректные значения: используй только допустимые варианты из описания полей.', isError: true };

  const patch = { ...parsed.data };
  if (patch.notes !== undefined) patch.notes = cleanLine(patch.notes, 300);
  mergePrefs(ctx, patch);
  return { content: 'Сохранено.' };
}

function requestPersonalEstimate(input: unknown, ctx: ToolContext): ToolOutcome {
  const parsed = requestOfferSchema.safeParse(input);
  if (!parsed.success) return { content: 'Нужно краткое описание пожеланий клиента (summary).', isError: true };

  const { aptType, areaSqm: area, rooms, interiorStyle, colorTone, hasDesign, repairType } = ctx.prefs;
  const missing = [!aptType && 'тип жилья', !area && 'площадь'].filter(Boolean);
  if (!aptType || !area) {
    return { content: `Не хватает данных: ${missing.join(' и ')}. Уточни у клиента и сохрани через save_preferences.`, isError: true };
  }

  ctx.emit({
    t: 'offer',
    v: {
      aptType,
      area: areaBucket(area),
      rooms: NO_ROOMS_TYPES.includes(aptType) ? undefined : rooms,
      interiorStyle,
      colorTone,
      hasDesign,
      repairType,
      summary: cleanLine(parsed.data.summary, 500),
    },
  });
  return {
    content:
      'Карточка с формой показана клиенту. Скажи в одной-двух фразах, что осталось ввести имя и контакт и что после этого управляющий пришлёт персональный расчёт. Телефон в чате не проси.',
  };
}

export function runTool(name: string, input: unknown, ctx: ToolContext): ToolOutcome {
  switch (name) {
    case 'compare_repair_types':
      return compareRepairTypes();
    case 'estimate_cost':
      return estimateCost(input, ctx);
    case 'search_price_list':
      return priceList(input);
    case 'save_preferences':
      return savePreferences(input, ctx);
    case 'request_personal_estimate':
      return requestPersonalEstimate(input, ctx);
    default:
      return { content: `Неизвестный инструмент: ${name}`, isError: true };
  }
}

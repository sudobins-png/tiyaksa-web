import { calcRates, pricingTiers } from '@/data/pricing';
import { MIN_ORDER_RUB } from '@/data/priceNotes';

/**
 * Price/term strings for the apartment landing pages' copy and FAQs, from the
 * same data as /price and the calculator — so a rate change in data/pricing.ts
 * updates every page's text, not just its price table.
 */
export type TierName = keyof typeof calcRates;

export const formatRub = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

export const rateOf = (tier: TierName) => calcRates[tier];

/** «от 7 500 ₽» per m². */
export const ratePerSqm = (tier: TierName) => formatRub(calcRates[tier]);

/** Starting price for an area, never below the minimum order. */
export const priceFor = (tier: TierName, area: number) => formatRub(Math.max(calcRates[tier] * area, MIN_ORDER_RUB));

export const termOf = (tier: TierName) => pricingTiers.find((t) => t.name === tier)?.term ?? '';

export const minOrder = () => formatRub(MIN_ORDER_RUB);

/** The standard «Сколько длится…» answer. */
export const termsAnswer = () =>
  `Косметический — ${termOf('Косметический')}, капитальный — ${termOf('Капитальный')}, дизайнерский — ${termOf('Дизайнерский')}. Точный срок и этапы закрепляем в договоре.`;

/** The standard «Материалы входят в стоимость?» FAQ item. */
export const materialsFaq = {
  q: 'Материалы входят в стоимость?',
  a: 'Нет, цена за м² — это работа. Материалы считаются отдельно: можем закупить сами или по вашему списку, каждую позицию согласуем с вами.',
} as const;

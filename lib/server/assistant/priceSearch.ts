import { PRICE_LIST, type PriceItem } from '@/data/priceList';

// Same site-wide promo as components/sections/PriceTable.tsx: every price on
// the page minus 12%, except Клининг (a separate vendor).
const DISCOUNT_RATE = 0.12;
const NO_DISCOUNT_CATEGORY = 'cleaning';
const MAX_RESULTS = 12;

export const PRICE_CATEGORY_SLUGS = PRICE_LIST.map((c) => c.slug);
export const PRICE_CATEGORY_NAMES = PRICE_LIST.map((c) => c.name);

const tokens = (s: string) =>
  s.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я0-9]+/).filter(Boolean);

const STOP_WORDS = new Set([
  'сколько', 'стоит', 'стоимость', 'цена', 'цены', 'цену', 'прайс', 'работа', 'работы', 'работу',
  'нужно', 'хочу', 'подскажите', 'скажите', 'назовите', 'сделать',
]);

// Russian inflects ("ванна" / "ванны" / "ванной", "стяжка" / "стяжки"), so a
// query word matches any text word that starts with its stem: the word minus
// its last one or two letters.
function stemOf(word: string): string {
  if (word.length >= 6) return word.slice(0, -2);
  if (word.length === 5) return word.slice(0, -1);
  return word;
}

function stems(query: string): string[] {
  return tokens(query)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
    .map(stemOf);
}

// Exact to the ruble, like PriceTable — lib/utils's formatMoney rounds to thousands.
const money = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`;

function priceLabel(item: PriceItem, discounted: boolean): string {
  if (item.price === undefined) return 'уточняется';
  const value = discounted ? item.price * (1 - DISCOUNT_RATE) : item.price;
  return `${item.approxFrom ? 'от ' : ''}${money(value)}`;
}

export interface PriceSearchResult {
  всего_найдено: number;
  позиции: {
    категория: string;
    раздел?: string;
    работа: string;
    единица: string;
    цена: string;
    цена_со_скидкой_12?: string;
  }[];
  примечание: string;
}

export function searchPriceList(query: string | undefined, category: string | undefined): PriceSearchResult {
  const words = query ? stems(query) : [];
  const categories = PRICE_LIST.filter((c) => !category || c.slug === category);

  const rows = categories.flatMap((c) =>
    c.items.map((item) => {
      const nameTokens = tokens(item.name);
      const allTokens = [...tokens(`${c.name} ${item.section ?? ''}`), ...nameTokens];
      const hits = (list: string[]) => words.filter((w) => list.some((t) => t.startsWith(w))).length;
      return { category: c, item, any: hits(allTokens), inName: hits(nameTokens) };
    }),
  );

  // Every word must appear somewhere; failing that, fall back to partial
  // matches rather than nothing. Words found in the work's own name outrank
  // ones found only in its category or section.
  const full = rows.filter((r) => r.any === words.length);
  const pool = words.length === 0 || full.length > 0 ? full : rows.filter((r) => r.any > 0);
  const matched = [...pool].sort((a, b) => b.any - a.any || b.inName - a.inName);

  return {
    всего_найдено: matched.length,
    позиции: matched.slice(0, MAX_RESULTS).map(({ category: c, item }) => ({
      категория: c.name,
      раздел: item.section,
      работа: item.name,
      единица: item.unit,
      цена: priceLabel(item, false),
      ...(c.slug !== NO_DISCOUNT_CATEGORY && item.price ? { цена_со_скидкой_12: priceLabel(item, true) } : {}),
    })),
    примечание:
      'Цены за единицу работы по прайсу сайта, материалы не входят. Это не итоговая цена: итог считается по смете после бесплатного замера, минимальная стоимость заказа 300 000 ₽. Не складывай позиции в общую смету.',
  };
}

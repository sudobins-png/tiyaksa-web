import { calcRates, secondaryMultiplier, highEstimateFactor } from '@/data/pricing';

// Same six buckets QuizInline/QuizModal's AREA_OPTIONS offer — the quiz
// only ever hands back one of these strings, never a number, so pricing has
// to work off a representative m² per bucket rather than an exact area.
const AREA_MIDPOINTS: Record<string, number> = {
  'До 30 м²': 25,
  '30–50 м²': 40,
  '50–70 м²': 60,
  '70–100 м²': 85,
  '100–150 м²': 125,
  '150 м² и выше': 160,
};
const DEFAULT_AREA_MIDPOINT = 50;

export const OFFER_DISCOUNT_RATE = 0.12;

export interface OfferPriceTier {
  name: string;
  term: string;
  low: number;
  high: number;
  discountedLow: number;
  discountedHigh: number;
}

const WORK_TYPES: { name: string; term: string }[] = [
  { name: 'Косметический', term: 'от 20 дней' },
  { name: 'Капитальный', term: 'от 45 дней' },
  { name: 'Дизайнерский', term: 'от 70 дней' },
];

/**
 * Same от/до spread as the homepage Calculator (low = area × rate,
 * high = low × highEstimateFactor), just run once per work type instead of
 * the one the visitor picked — an offer page shows all three side by side.
 */
export function computeOfferPricing(area: string, aptType: string): OfferPriceTier[] {
  const midpoint = AREA_MIDPOINTS[area] ?? DEFAULT_AREA_MIDPOINT;
  const mult = aptType.includes('Вторич') ? secondaryMultiplier : 1;

  return WORK_TYPES.map(({ name, term }) => {
    const rate = calcRates[name] ?? 0;
    const low = midpoint * rate * mult;
    const high = low * highEstimateFactor;
    return {
      name,
      term,
      low,
      high,
      discountedLow: low * (1 - OFFER_DISCOUNT_RATE),
      discountedHigh: high * (1 - OFFER_DISCOUNT_RATE),
    };
  });
}

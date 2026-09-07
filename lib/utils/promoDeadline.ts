const CYCLE_DAYS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/**
 * Rolling promo deadline — always 1 to 5 days ahead of `now`, and advances
 * to the next 5-day boundary on its own once the current one passes. No
 * stored state or cron needed: `daysSinceEpoch % CYCLE_DAYS` is the same
 * calculation whenever it runs, so "today" moving past a boundary is what
 * makes the next one become the answer — i.e. the owner's "automatically
 * extends by 5 days once the date is reached".
 */
export function getPromoDeadline(now: Date = new Date()): Date {
  const daysSinceEpoch = Math.floor(now.getTime() / DAY_MS);
  const daysIntoCycle = daysSinceEpoch % CYCLE_DAYS;
  const daysUntilBoundary = CYCLE_DAYS - daysIntoCycle;
  const deadline = new Date(now);
  deadline.setHours(0, 0, 0, 0);
  deadline.setDate(deadline.getDate() + daysUntilBoundary);
  return deadline;
}

/** "13 сентября" — no year, matches how the owner's own reference phrased it. */
export function formatPromoDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

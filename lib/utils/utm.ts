/**
 * Captures utm_* query params on first load and remembers them client-side so
 * a lead submitted minutes — or days — later can still be attributed to the
 * campaign that brought the visitor in. By the time someone fills out a
 * contact form, the query string that got them here is long gone from the
 * address bar.
 *
 * Re-capturing whenever the URL carries new utm_ params overwrites the
 * previously stored set — last-touch, not first-touch — matching Yandex
 * Metrika's own "последний значимый переход" model, so the two stay
 * consistent with each other.
 */

const STORAGE_KEY = 'tiyaksa_utm';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

interface StoredUtm { params: UtmParams; capturedAt: number }

/** Call once on page load (client only). Safe to call on every navigation —
 *  it's a no-op when the URL has no utm_ params. */
export function captureUtmParams(): void {
  if (typeof window === 'undefined') return;

  const search = new URLSearchParams(window.location.search);
  const found: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = search.get(key);
    if (value) found[key] = value.slice(0, 200);
  }
  if (Object.keys(found).length === 0) return;

  try {
    const record: StoredUtm = { params: found, capturedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch { /* private mode / storage disabled — attribution is best-effort */ }
}

/** Reads back whatever was last captured, if not older than 30 days. */
export function getStoredUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const record = JSON.parse(raw) as StoredUtm;
    if (!record?.params || Date.now() - record.capturedAt > MAX_AGE_MS) return {};
    return record.params;
  } catch {
    return {};
  }
}

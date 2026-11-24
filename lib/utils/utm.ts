/**
 * Last campaign context is held in page memory before analytics consent.
 * It is persisted for up to 30 days only after analytics acceptance. A form
 * may include in-memory UTM values under the separate application consent.
 */

import { getAnalyticsDecision } from '@/lib/analytics/consent';

const STORAGE_KEY = 'tiyaksa_utm';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

interface StoredUtm { params: UtmParams; capturedAt: number }
let sessionRecord: StoredUtm | null = null;

/** Call once on page load (client only). Safe to call on every navigation —
 *  it's a no-op when the URL has no utm_ params. */
export function captureUtmParams(): void {
  if (typeof window === 'undefined') return;

  let search = new URLSearchParams(window.location.search);
  // The root effect can run after a fast App Router navigation. Recover only
  // the entry context, not a history of navigation before consent.
  if (!sessionRecord && !UTM_KEYS.some((key) => search.has(key)) && window.__tiyaksaLanding) {
    search = new URL(window.__tiyaksaLanding.url).searchParams;
  }
  const found: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = search.get(key);
    if (value) found[key] = value.slice(0, 200);
  }
  if (Object.keys(found).length > 0) {
    sessionRecord = { params: found, capturedAt: Date.now() };
  }

  try {
    if (getAnalyticsDecision() === 'accepted' && sessionRecord) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionRecord));
    } else if (getAnalyticsDecision() !== 'accepted') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* private mode / storage disabled — attribution is best-effort */ }
}

/** Reads back whatever was last captured, if not older than 30 days. */
export function getStoredUtmParams(): UtmParams {
  if (typeof window === 'undefined') return {};
  if (!sessionRecord) captureUtmParams();
  if (sessionRecord && Date.now() - sessionRecord.capturedAt < MAX_AGE_MS) return sessionRecord.params;
  if (getAnalyticsDecision() !== 'accepted') return {};
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

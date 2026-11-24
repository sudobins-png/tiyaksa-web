import { ANALYTICS_CONSENT_VERSION } from '@/lib/config/privacy';

export const ANALYTICS_STORAGE_KEY = 'tiyaksa_analytics_consent';
export const ANALYTICS_CHANGED_EVENT = 'tiyaksa:analytics-changed';
export const ANALYTICS_SETTINGS_EVENT = 'tiyaksa:analytics-settings';
const MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;

type Decision = 'accepted' | 'rejected';
interface ConsentRecord { version: string; decision: Decision; decidedAt: number }
let memoryRecord: ConsentRecord | null = null;

export function getAnalyticsDecision(): Decision | null {
  if (typeof window === 'undefined') return null;
  let record: ConsentRecord | null = memoryRecord;
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    try { record = JSON.parse(raw || 'null'); } catch { return null; }
  } catch { /* When storage is disabled, honor the choice in this page session. */ }
  if (!record || record.version !== ANALYTICS_CONSENT_VERSION ||
      !['accepted', 'rejected'].includes(record.decision) ||
      !Number.isFinite(record.decidedAt) || record.decidedAt > Date.now() ||
      Date.now() - record.decidedAt >= MAX_AGE_MS) return null;
  return record.decision;
}

export function setAnalyticsDecision(decision: Decision): void {
  memoryRecord = { version: ANALYTICS_CONSENT_VERSION, decision, decidedAt: Date.now() };
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(memoryRecord));
    // The former banner did not control the counter: it is not a new consent.
    localStorage.removeItem('cookie_accepted');
  } catch { /* The current page can still honor the visitor's choice. */ }
  window.dispatchEvent(new Event(ANALYTICS_CHANGED_EVENT));
}

export function openAnalyticsSettings(): void {
  window.dispatchEvent(new Event(ANALYTICS_SETTINGS_EVENT));
}

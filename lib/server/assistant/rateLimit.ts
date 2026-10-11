// In-memory, per Node process — the production container runs a single one.
// A public LLM endpoint costs money per call and middleware.ts deliberately
// skips /api/, so abuse protection has to live here.
const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_MAX = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_MAX = 60;
const MAX_CONCURRENT_PER_IP = 2;
const MAX_TRACKED_IPS = 5000;

const GLOBAL_DAILY_MAX = Number(process.env.ASSISTANT_DAILY_LIMIT) || 400;

const hits = new Map<string, number[]>();
const inFlight = new Map<string, number>();
let globalDay = '';
let globalCount = 0;

export type LimitResult =
  | { ok: true; release: () => void }
  | { ok: false; reason: 'rate' | 'budget' };

function rollDay(now: number) {
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== globalDay) {
    globalDay = today;
    globalCount = 0;
  }
}

/** False once today's global message budget is spent. */
export function hasBudget(): boolean {
  rollDay(Date.now());
  return globalCount < GLOBAL_DAILY_MAX;
}

export function acquire(ip: string): LimitResult {
  const now = Date.now();

  if (!hasBudget()) return { ok: false, reason: 'budget' };

  if (hits.size > MAX_TRACKED_IPS) {
    hits.forEach((times, key) => {
      if (now - times[times.length - 1] > DAY_MS) hits.delete(key);
    });
  }

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < DAY_MS);
  const burst = recent.filter((t) => now - t < BURST_WINDOW_MS).length;
  if (burst >= BURST_MAX || recent.length >= DAY_MAX || (inFlight.get(ip) ?? 0) >= MAX_CONCURRENT_PER_IP) {
    hits.set(ip, recent);
    return { ok: false, reason: 'rate' };
  }

  recent.push(now);
  hits.set(ip, recent);
  globalCount += 1;
  inFlight.set(ip, (inFlight.get(ip) ?? 0) + 1);

  let released = false;
  return {
    ok: true,
    release: () => {
      if (released) return;
      released = true;
      const left = (inFlight.get(ip) ?? 1) - 1;
      if (left <= 0) inFlight.delete(ip);
      else inFlight.set(ip, left);
    },
  };
}

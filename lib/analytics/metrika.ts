import { getAnalyticsDecision } from '@/lib/analytics/consent';

const COUNTER_ID = 111307528;
const SCRIPT_ID = 'tiyaksa-metrika';
const QUERY_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid'];
type MetrikaFunction = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

declare global {
  interface Window {
    ym?: MetrikaFunction;
    __tiyaksaLanding?: { url: string; referrer: string };
  }
}

let initialized = false;
let lastUrl = '';
let landingSent = false;
let scriptReady = false;

/** Only the entry context is held in memory before consent, never behavior. */
export function captureLandingContext(): void {
  if (!window.__tiyaksaLanding) {
    window.__tiyaksaLanding = { url: window.location.href, referrer: document.referrer };
  }
}

export function analyticsUrl(raw: string, includeCampaign = true): string {
  if (!raw) return '';
  try {
    const url = new URL(raw, window.location.origin);
    const result = new URL(url.origin + url.pathname);
    // A personal offer token must not become an analytics identifier.
    if (result.pathname.startsWith('/offer/')) result.pathname = '/offer';
    if (includeCampaign) {
      for (const key of QUERY_KEYS) {
        const value = url.searchParams.get(key);
        if (value) result.searchParams.set(key, value.slice(0, 200));
      }
    }
    return result.href;
  } catch { return ''; }
}

export function syncMetrika(): void {
  captureLandingContext();
  if (getAnalyticsDecision() !== 'accepted') {
    if (initialized) {
      if (!scriptReady && window.ym?.a) {
        // A withdrawal during download must not flush queued hits later.
        window.ym.a.length = 0;
        landingSent = false;
      } else {
        window.ym?.(COUNTER_ID, 'destruct');
      }
    }
    initialized = false;
    lastUrl = '';
    return;
  }
  if (!initialized) {
    if (!window.ym) {
      const queue: MetrikaFunction = (...args: unknown[]) => { (queue.a ??= []).push(args); };
      queue.l = Date.now();
      window.ym = queue;
    }
    window.ym(COUNTER_ID, 'init', {
      defer: true, ssr: true, webvisor: true, clickmap: true,
      accurateTrackBounce: true, trackLinks: true, ecommerce: 'dataLayer',
    });
    initialized = true;

    // defer disables the automatic initial hit; send exactly one entry hit.
    if (!landingSent) {
      const landing = window.__tiyaksaLanding!;
      lastUrl = analyticsUrl(landing.url);
      window.ym(COUNTER_ID, 'hit', lastUrl, {
        referer: analyticsUrl(landing.referrer, false),
      });
      landingSent = true;
    }
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`;
      script.onload = () => { scriptReady = true; };
      script.onerror = () => {
        script.remove();
        initialized = false;
        lastUrl = '';
        landingSent = false;
        if (window.ym?.a) delete window.ym;
      };
      document.head.appendChild(script);
    }
  }
  const url = analyticsUrl(window.location.href);
  if (url !== lastUrl) {
    window.ym?.(COUNTER_ID, 'hit', url, { referer: lastUrl });
    lastUrl = url;
  }
}

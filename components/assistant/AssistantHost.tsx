'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const AssistantWidget = dynamic(() => import('./AssistantWidget').then((m) => m.AssistantWidget), { ssr: false });

const CACHE_KEY = 'tiyaksa_assistant_enabled';
const CACHE_MS = 5 * 60 * 1000;

function readCached(): boolean | null {
  try {
    const [flag, at] = (sessionStorage.getItem(CACHE_KEY) ?? '').split(':');
    return flag && Date.now() - Number(at) < CACHE_MS ? flag === '1' : null;
  } catch {
    return null;
  }
}

async function isAssistantEnabled(): Promise<boolean> {
  const cached = readCached();
  if (cached !== null) return cached;
  try {
    const res = await fetch('/api/assistant', { cache: 'no-store' });
    const enabled = res.ok && ((await res.json()) as { enabled?: boolean }).enabled === true;
    try {
      sessionStorage.setItem(CACHE_KEY, `${enabled ? 1 : 0}:${Date.now()}`);
    } catch {
      /* storage unavailable — just asks again next page */
    }
    return enabled;
  } catch {
    return false;
  }
}

/**
 * Mounted once in the root layout. After the page goes idle it asks the server
 * whether the assistant is switched on (API key present, daily budget left)
 * and only then loads the widget — so it never competes with the hero for
 * bandwidth, and a deploy without the key changes nothing for visitors.
 * Hidden where it would get in the way: the quiz itself and the personal
 * /offer/ pages (same exclusions as ExitIntentPromo).
 */
export function AssistantHost() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      void isAssistantEnabled().then((enabled) => {
        if (!cancelled && enabled) setReady(true);
      });
    };

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 4000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const id = setTimeout(start, 2500);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  if (!ready || pathname?.startsWith('/quiz') || pathname?.startsWith('/offer')) return null;
  return <AssistantWidget />;
}

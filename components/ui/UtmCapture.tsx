'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ANALYTICS_CHANGED_EVENT, ANALYTICS_STORAGE_KEY } from '@/lib/analytics/consent';
import { captureUtmParams } from '@/lib/utils/utm';

/** No UI — runs the capture-on-load side effect once per page load. */
export function UtmCapture() {
  const pathname = usePathname();
  useEffect(() => { captureUtmParams(); }, [pathname]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ANALYTICS_STORAGE_KEY || event.key === null) captureUtmParams();
    };
    window.addEventListener(ANALYTICS_CHANGED_EVENT, captureUtmParams);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ANALYTICS_CHANGED_EVENT, captureUtmParams);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return null;
}

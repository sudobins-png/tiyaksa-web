'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ANALYTICS_CHANGED_EVENT, ANALYTICS_STORAGE_KEY } from '@/lib/analytics/consent';
import { syncMetrika } from '@/lib/analytics/metrika';

export function MetrikaController() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => { syncMetrika(); }, [pathname, search]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ANALYTICS_STORAGE_KEY || event.key === null) syncMetrika();
    };
    window.addEventListener(ANALYTICS_CHANGED_EVENT, syncMetrika);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ANALYTICS_CHANGED_EVENT, syncMetrika);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return null;
}

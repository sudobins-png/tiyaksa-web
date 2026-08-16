'use client';

import { useEffect } from 'react';
import { captureUtmParams } from '@/lib/utils/utm';

/** No UI — runs the capture-on-load side effect once per page load. */
export function UtmCapture() {
  useEffect(() => { captureUtmParams(); }, []);
  return null;
}

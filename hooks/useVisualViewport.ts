'use client';

import { useEffect, useState } from 'react';

/**
 * The part of the screen the visitor can actually see. On phones the on-screen
 * keyboard covers the bottom of the layout viewport without resizing it, so a
 * full-height chat panel would hide its own input behind the keyboard; sizing
 * the panel to this box keeps the input visible. Null where unsupported or off.
 */
export function useVisualViewport(enabled: boolean): { top: number; height: number } | null {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!enabled || !vv) {
      setBox(null);
      return;
    }
    const sync = () => setBox({ top: Math.round(vv.offsetTop), height: Math.round(vv.height) });
    sync();
    vv.addEventListener('resize', sync);
    vv.addEventListener('scroll', sync);
    return () => {
      vv.removeEventListener('resize', sync);
      vv.removeEventListener('scroll', sync);
    };
  }, [enabled]);

  return box;
}

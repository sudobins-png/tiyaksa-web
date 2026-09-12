'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LEAD_SOURCES } from '@/lib/config/leadSources';
import { useQuizStore } from '@/stores/quizStore';
import { PromoModal } from '@/components/ui/PromoModal';

const SESSION_KEY     = 'tiyaksa_promo_shown';
const IDLE_TIMEOUT_MS = 10_000; // мобайл: 10 с бездействия

/**
 * Same exit-intent (desktop mouse leaving toward the address bar) and
 * idle-timeout (mobile) triggers this used to open the quiz popup with —
 * now opens the -12% promo instead (see PromoModal). Kept as its own local
 * `open` state (rather than routing through the shared quizStore like
 * Header/Hero/Pricing do) since this is the only trigger for this modal;
 * it still checks the quiz store so it won't pop the promo on top of an
 * already-open quiz popup.
 */
export function ExitIntentPromo() {
  const [open, setOpen] = useState(false);
  const quizOpen = useQuizStore((s) => s.open);
  const shownRef     = useRef(false);
  const quizOpenRef  = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // На /quiz страница уже целиком — квиз; всплывающий попап поверх неё
  // только путает. На /offer/[id] посетитель уже увидел персональный расчёт
  // со скидкой −12% и своим таймером — тот же попап поверх него избыточен.
  const pathname = usePathname();
  const excluded = pathname?.startsWith('/quiz') || pathname?.startsWith('/offer') || false;

  useEffect(() => { quizOpenRef.current = quizOpen; }, [quizOpen]);

  const maybeShow = useCallback(() => {
    if (shownRef.current) return;
    if (quizOpenRef.current) return; // не показываем поверх уже открытого квиза
    try { if (sessionStorage.getItem(SESSION_KEY)) return; } catch { /* ignore */ }
    shownRef.current = true;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (excluded) return;

    const isMobile = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    /* ── Desktop: мышь уходит вверх к адресной строке ── */
    let enteredOnce = false;
    const onMouseEnter = () => { enteredOnce = true; };
    const onMouseLeave = (e: MouseEvent) => {
      if (!enteredOnce) return;
      if (e.clientY <= 4) maybeShow();
    };

    /* ── Mobile: idle timeout ── */
    const resetIdle = () => {
      if (!isMobile()) return;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (shownRef.current) return;
      idleTimerRef.current = setTimeout(maybeShow, IDLE_TIMEOUT_MS);
    };

    const IDLE_EVENTS: (keyof WindowEventMap)[] = ['touchstart', 'touchmove', 'scroll'];

    if (isMobile()) {
      IDLE_EVENTS.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }));
      resetIdle();
    } else {
      document.addEventListener('mouseenter', onMouseEnter, { once: true });
      document.addEventListener('mouseleave', onMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      IDLE_EVENTS.forEach((ev) => window.removeEventListener(ev, resetIdle));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [maybeShow, excluded]);

  if (!open) return null;
  return <PromoModal onClose={() => setOpen(false)} source={LEAD_SOURCES.quizExitIntent} />;
}

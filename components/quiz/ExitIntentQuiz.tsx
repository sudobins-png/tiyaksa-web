'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { QuizModal } from './QuizModal';

const SESSION_KEY     = 'tiyaksa_quiz_shown';
const IDLE_TIMEOUT_MS = 10_000; // мобайл: 10 с бездействия

export function ExitIntentQuiz() {
  const [open, setOpen] = useState(false);
  const shownRef        = useRef(false);
  const openRef         = useRef(false); // актуальное состояние open без пересоздания хендлеров
  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // синхронизируем openRef с open
  useEffect(() => { openRef.current = open; }, [open]);

  const maybeShow = useCallback(() => {
    if (shownRef.current) return;
    if (openRef.current) return; // уже открыт
    try { if (sessionStorage.getItem(SESSION_KEY)) return; } catch { /* ignore */ }
    shownRef.current = true;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
    setOpen(true);
  }, []);

  useEffect(() => {
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
  }, [maybeShow]);

  if (!open) return null;
  return <QuizModal onClose={() => setOpen(false)} />;
}

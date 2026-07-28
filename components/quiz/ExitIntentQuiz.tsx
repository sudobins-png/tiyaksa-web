'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { QuizModal } from './QuizModal';

const SESSION_KEY       = 'tiyaksa_quiz_shown';
const MIN_PAGE_TIME_MS  = 12_000; // минимум 12 с на странице
const IDLE_TIMEOUT_MS   = 20_000; // мобайл: 20 с бездействия

export function ExitIntentQuiz() {
  const [open, setOpen]   = useState(false);
  const shownRef          = useRef(false);
  const startTimeRef      = useRef(Date.now());
  const idleTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maybeShow = useCallback(() => {
    if (shownRef.current) return;
    if (Date.now() - startTimeRef.current < MIN_PAGE_TIME_MS) return;
    try { if (sessionStorage.getItem(SESSION_KEY)) return; } catch { /* ignore */ }
    shownRef.current = true;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
    setOpen(true);
  }, []);

  useEffect(() => {
    const isMobile = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    /* ── Desktop: мышь уходит вверх к адресной строке / вкладкам ── */
    let enteredOnce = false;
    const onMouseEnter = () => { enteredOnce = true; };
    const onMouseLeave = (e: MouseEvent) => {
      if (!enteredOnce) return;
      if (e.clientY <= 4) maybeShow();
    };

    /* ── Desktop + Mobile: visibilitychange (переключение вкладки) */
    const onVisChange = () => {
      if (document.visibilityState === 'hidden') maybeShow();
    };

    /* ── Mobile: idle timeout — сбрасываем по любому взаимодействию */
    const resetIdle = () => {
      if (!isMobile()) return;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (shownRef.current) return;
      idleTimerRef.current = setTimeout(() => {
        if (Date.now() - startTimeRef.current >= MIN_PAGE_TIME_MS) maybeShow();
      }, IDLE_TIMEOUT_MS);
    };

    const IDLE_EVENTS: (keyof WindowEventMap)[] = ['touchstart', 'touchmove', 'scroll'];

    if (isMobile()) {
      IDLE_EVENTS.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }));
      resetIdle(); // запускаем таймер сразу
    } else {
      document.addEventListener('mouseenter', onMouseEnter, { once: true });
      document.addEventListener('mouseleave', onMouseLeave);
    }

    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisChange);
      IDLE_EVENTS.forEach((ev) => window.removeEventListener(ev, resetIdle));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [maybeShow]);

  if (!open) return null;
  return <QuizModal onClose={() => setOpen(false)} />;
}

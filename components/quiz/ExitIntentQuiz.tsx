'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { LEAD_SOURCES } from '@/lib/config/leadSources';
import { useQuizStore } from '@/stores/quizStore';

const SESSION_KEY     = 'tiyaksa_quiz_shown';
const IDLE_TIMEOUT_MS = 10_000; // мобайл: 10 с бездействия

export function ExitIntentQuiz() {
  const open      = useQuizStore((s) => s.open);
  const openQuiz  = useQuizStore((s) => s.openQuiz);
  const shownRef        = useRef(false);
  const openRef         = useRef(false); // актуальное состояние open без пересоздания хендлеров
  const idleTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // На /quiz страница уже целиком — квиз; всплывающая копия поверх неё
  // только путает и дублирует форму, которую пользователь и так видит.
  const pathname = usePathname();
  const excluded = pathname?.startsWith('/quiz') ?? false;

  // синхронизируем openRef с open (общий стор — открыт может быть и другой
  // триггер, не только этот, так что тоже считаем "уже открыт")
  useEffect(() => { openRef.current = open; }, [open]);

  const maybeShow = useCallback(() => {
    if (shownRef.current) return;
    if (openRef.current) return; // уже открыт (этот или любой другой попап квиза)
    try { if (sessionStorage.getItem(SESSION_KEY)) return; } catch { /* ignore */ }
    shownRef.current = true;
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
    openQuiz(LEAD_SOURCES.quizExitIntent);
  }, [openQuiz]);

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

  // Pure trigger — the actual popup is QuizModalHost, mounted once at the
  // root layout and shared by every trigger (see stores/quizStore.ts).
  return null;
}

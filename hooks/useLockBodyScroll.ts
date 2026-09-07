import { useEffect } from 'react';

/**
 * Locks page scroll while a modal is mounted. `overflow: hidden` on <body>
 * alone (the previous approach in every modal here) doesn't actually stop
 * touch-scrolling on iOS Safari — a long-standing WebKit quirk. The visible
 * symptom: the background page scrolls instead of the modal's own
 * overflow-y-auto content, so on a tall step (e.g. the quiz's final
 * "Куда отправить расчёт?" step) the name/phone fields can end up below the
 * fold with no way to reach them, since the swipe scrolls the page — which
 * has nothing further to reveal — rather than the modal.
 *
 * Pinning <body> with `position: fixed` and a negative `top` equal to the
 * current scroll offset is the standard fix that actually holds on iOS;
 * restoring `window.scrollTo` on cleanup returns the page to where it was.
 */
export function useLockBodyScroll() {
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);
}

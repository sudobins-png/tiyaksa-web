'use client';

import { useRef } from 'react';

/**
 * Horizontal drag-to-scroll row with desktop arrow controls. Touch/trackpad
 * users scroll natively; the arrows are a convenience for mouse users and
 * hide on touch devices via `md:flex`.
 */
export function HorizontalScroller({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 480);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Прокрутить назад"
        className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-card hover:shadow-card-hover items-center justify-center transition-shadow duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Прокрутить вперёд"
        className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow-card hover:shadow-card-hover items-center justify-center transition-shadow duration-200"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-forest" aria-hidden>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

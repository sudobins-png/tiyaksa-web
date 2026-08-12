'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';

const PHOTOS = Array.from({ length: 17 }, (_, i) => `/case/${i + 1}.jpg`);

/**
 * Column spans over a shared 6-column grid: [mobile, desktop].
 * 6 = full row, 3 = half (2-up), 2 = third (3-up).
 *
 * Mobile keeps the original 1 / 3 / 1 / 2 / 3 / 1 / 2 / 3 / 1 rhythm.
 * Desktop uses rows of 3 and 2 only — no full-width photos — grouped as
 * 3 / 3 / 3 / 2 / 3 / 3, which is exactly the 17 photos.
 */
const SPANS: Array<[mobile: number, desktop: number]> = [
  [6, 2],                    // 0
  [2, 2], [2, 2], [2, 2],    // 1–3
  [6, 2],                    // 4
  [3, 2], [3, 2],            // 5–6
  [2, 2], [2, 2], [2, 3],    // 7–9
  [6, 3],                    // 10
  [3, 2], [3, 2],            // 11–12
  [2, 2], [2, 2], [2, 2],    // 13–15
  [6, 2],                    // 16
];

const MOBILE_SPAN: Record<number, string> = {
  2: 'col-span-2', 3: 'col-span-3', 6: 'col-span-6',
};
const DESKTOP_SPAN: Record<number, string> = {
  2: 'md:col-span-2', 3: 'md:col-span-3',
};

const SPECS = [
  { label: 'Вид ремонта', value: 'Дизайнерский', icon: <IconType /> },
  { label: 'Площадь',     value: '96 м²',         icon: <IconArea /> },
  { label: 'Комнат',      value: '3',              icon: <IconRooms /> },
];

export function CaseSection() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const dirRef = useRef(1); // 1 = forward, -1 = back

  const close = useCallback(() => setLightbox(null), []);

  const prev = useCallback(() => {
    dirRef.current = -1;
    setLightbox((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const next = useCallback(() => {
    dirRef.current = 1;
    setLightbox((i) => (i !== null && i < PHOTOS.length - 1 ? i + 1 : i));
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, close, prev, next]);

  return (
    <>
      <section className="bg-site border-t border-[#eef1ee] py-14 md:py-[88px]">
        <div className="max-w-content mx-auto px-6">

          {/* Heading block — text stays at a readable measure inside the wide container */}
          <SectionHeading
            className="mb-7 md:mb-9 max-w-[760px] mx-auto"
            eyebrow="Объект №168"
            subtitle="Ремонт квартиры в Санкт-Петербурге с меблировкой и изготовлением мебели, с интерьером в стиле неоклассика, с прихожей, гардеробом, кухней-гостиной, спальней, кабинетом и санузлом."
          >
            Ремонт квартиры на наб. канала Грибоедова в Петербурге
          </SectionHeading>

          {/* Specs — 3 col grid */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-[760px] mx-auto mb-8 md:mb-12">
            {SPECS.map((s) => (
              <div key={s.label} className="bg-white border border-[#eef1ee] rounded-[14px] px-3 py-3 md:py-6 flex flex-col items-center text-center gap-1.5 md:gap-2">
                <div className="w-8 h-8 md:w-11 md:h-11 rounded-[8px] md:rounded-[10px] bg-grove-mint flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <p className="text-[10px] md:text-[12px] text-[#999] leading-none">{s.label}</p>
                <p className="font-bold text-[13px] md:text-[17px] text-ink leading-tight">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-6 gap-2 md:gap-4">
            {PHOTOS.map((src, idx) => {
              const [m, d] = SPANS[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setLightbox(idx)}
                  className={`relative block w-full overflow-hidden rounded-[10px] md:rounded-[14px] bg-[#ddd] cursor-zoom-in ${MOBILE_SPAN[m]} ${DESKTOP_SPAN[d]} ${m === 6 ? 'aspect-[16/9] md:aspect-[4/3]' : 'aspect-[4/3]'}`}
                  aria-label={`Фото ${idx + 1}`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes={`(max-width: 768px) ${Math.round((m / 6) * 100)}vw, ${Math.round((1200 * d) / 6)}px`}
                    className="object-cover transition-transform duration-200 hover:scale-[1.03]"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[300] bg-black/85 flex items-center justify-center"
            onClick={close}
          >
            {/* Sliding image */}
            <AnimatePresence mode="wait" custom={dirRef.current}>
              <motion.div
                key={lightbox}
                custom={dirRef.current}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 60 }),
                  center: { opacity: 1, x: 0 },
                  exit:  (d: number) => ({ opacity: 0, x: d * -60 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="relative w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={PHOTOS[lightbox]}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Close */}
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Prev */}
            {lightbox > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Предыдущее фото"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            {/* Next */}
            {lightbox < PHOTOS.length - 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Следующее фото"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}

            {/* Counter */}
            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-[13px] tabular-nums bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
              {lightbox + 1} / {PHOTOS.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconType() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconArea() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 9V5a2 2 0 0 1 2-2h4M15 3h4a2 2 0 0 1 2 2v4M21 15v4a2 2 0 0 1-2 2h-4M9 21H5a2 2 0 0 1-2-2v-4" />
    </svg>
  );
}

function IconRooms() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

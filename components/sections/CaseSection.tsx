'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const PHOTOS = Array.from({ length: 17 }, (_, i) => `/case/${i + 1}.jpg`);

// Photo grid layout: groups of rows
const LAYOUT: Array<{ cols: number; indices: number[] }> = [
  { cols: 1, indices: [0] },
  { cols: 3, indices: [1, 2, 3] },
  { cols: 1, indices: [4] },
  { cols: 2, indices: [5, 6] },
  { cols: 3, indices: [7, 8, 9] },
  { cols: 1, indices: [10] },
  { cols: 2, indices: [11, 12] },
  { cols: 3, indices: [13, 14, 15] },
  { cols: 1, indices: [16] },
];

const SPECS = [
  { label: 'Вид ремонта', value: 'Дизайнерский', icon: <IconType /> },
  { label: 'Площадь',     value: '96 м²',         icon: <IconArea /> },
  { label: 'Комнат',      value: '3',              icon: <IconRooms /> },
];

export function CaseSection() {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i !== null ? Math.max(0, i - 1) : null)), []);
  const next = useCallback(() => setLightbox((i) => (i !== null ? Math.min(PHOTOS.length - 1, i + 1) : null)), []);

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
      <section className="bg-[#f2f2f0] pt-10 pb-12">
        <div className="max-w-[680px] mx-auto px-4">

          {/* Label */}
          <p className="text-[12px] text-[#999] font-medium tracking-widest uppercase text-center mb-2">
            Объект №168
          </p>

          {/* Title */}
          <h2 className="font-extrabold text-[22px] sm:text-[30px] text-ink leading-tight text-center uppercase mb-4">
            Ремонт квартиры на наб. канала Грибоедова в Петербурге
          </h2>

          {/* Description */}
          <p className="text-[14px] sm:text-[15px] text-[#555] leading-relaxed text-center mb-6">
            Ремонт квартиры в Санкт-Петербурге с меблировкой и изготовлением мебели, с интерьером в стиле неоклассика, с прихожей, гардеробом, кухней-гостиной, спальней, кабинетом и санузлом.
          </p>

          {/* Specs — 3 col grid */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {SPECS.map((s) => (
              <div key={s.label} className="bg-white rounded-[14px] px-3 py-3 flex flex-col items-center text-center gap-1.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#e8e4db] flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <p className="text-[10px] text-[#999] leading-none">{s.label}</p>
                <p className="font-bold text-[13px] sm:text-[14px] text-ink leading-tight">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Photo grid */}
          <div className="flex flex-col gap-2">
            {LAYOUT.map((row, ri) => (
              <div
                key={ri}
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${row.cols}, 1fr)` }}
              >
                {row.indices.map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightbox(idx)}
                    className="relative block w-full overflow-hidden rounded-[10px] bg-[#ddd] cursor-zoom-in"
                    style={{ aspectRatio: row.cols === 1 ? '16/9' : '4/3' }}
                    aria-label={`Фото ${idx + 1}`}
                  >
                    <Image
                      src={PHOTOS[idx]}
                      alt=""
                      fill
                      sizes={row.cols === 1 ? '680px' : '(max-width: 680px) 33vw, 220px'}
                      className="object-cover transition-transform duration-200 hover:scale-[1.03]"
                      priority={idx === 0}
                    />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[300] bg-black/92 flex items-center justify-center"
          onClick={close}
        >
          {/* Image */}
          <div
            className="relative w-full h-full max-w-[100vw] max-h-[100dvh]"
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
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          {lightbox > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-[13px] tabular-nums">
            {lightbox + 1} / {PHOTOS.length}
          </p>
        </div>
      )}
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

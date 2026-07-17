'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { portfolioItems } from '@/data/content';

/* ── Lightbox ────────────────────────────────────────────────────── */
interface LightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

function Lightbox({ images, startIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фото"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Image */}
      <div
        className="relative w-full h-full max-w-5xl mx-auto px-12 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={idx}
          src={images[idx]}
          alt={`Фото ${idx + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label="Предыдущее фото"
        className="absolute left-2 md:left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label="Следующее фото"
        className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            aria-label={`Фото ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${i === idx ? 'bg-white scale-125' : 'bg-white/45 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Card slider ─────────────────────────────────────────────────── */
interface CardProps {
  item: typeof portfolioItems[number];
  onOpen: (idx: number) => void;
}

function PortfolioCard({ item, onOpen }: CardProps) {
  const [idx, setIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const { images } = item;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % images.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx < 0
        ? setIdx((i) => (i + 1) % images.length)
        : setIdx((i) => (i - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-card-hover">
      {/* Slider */}
      <div
        className="relative bg-[#e7ebe7] cursor-pointer select-none"
        style={{ aspectRatio: '4/3' }}
        onClick={() => onOpen(idx)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="button"
        aria-label="Открыть галерею"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(idx)}
      >
        {/* Images */}
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${item.name} — фото ${i + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className={`object-cover transition-opacity duration-300 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
            priority={i === 0}
          />
        ))}

        {/* Expand icon hint */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </div>

        {/* Prev arrow */}
        {images.length > 1 && (
          <button
            onClick={prev}
            aria-label="Предыдущее фото"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors opacity-0 hover:opacity-100 focus:opacity-100 [.group:hover_&]:opacity-100"
            style={{ opacity: undefined }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Next arrow */}
        {images.length > 1 && (
          <button
            onClick={next}
            aria-label="Следующее фото"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                aria-label={`Фото ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === idx ? 'bg-white scale-125' : 'bg-white/55 hover:bg-white/80'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-[22px] pb-6 pt-[22px]">
        <p className="font-bold text-xl text-ink">{item.name}</p>
        <div className="flex gap-[18px] flex-wrap my-[14px] text-muted text-[15px]">
          <span>{item.area}</span>
          <span>{item.term}</span>
        </div>
        <p className="font-bold text-[19px] text-forest">{item.price}</p>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */
export function Portfolio() {
  const [lightbox, setLightbox] = useState<{ itemIdx: number; photoIdx: number } | null>(null);

  return (
    <section id="portfolio" className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-10 text-ink"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Примеры готовых ремонтов
        </h2>

        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {portfolioItems.map((p, i) => (
            <PortfolioCard
              key={p.name}
              item={p}
              onOpen={(photoIdx) => setLightbox({ itemIdx: i, photoIdx })}
            />
          ))}
        </div>

        <div className="mt-9">
          <a
            href="#cta"
            className="inline-block border-[1.5px] border-forest text-forest hover:bg-forest hover:text-white font-semibold text-base px-7 py-[14px] rounded-xl transition-all duration-200"
          >
            Рассчитать стоимость
          </a>
        </div>
      </div>

      {lightbox && (
        <Lightbox
          images={portfolioItems[lightbox.itemIdx].images}
          startIndex={lightbox.photoIdx}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Lightbox } from '@/components/sections/Portfolio';

export interface SegmentCaseItem {
  images: string[];
  area?: string;
  term?: string;
  pricePerSqm?: string;
}

interface SegmentCaseProps {
  heading: string;
  subtitle: string;
  item: SegmentCaseItem;
  eyebrow?: string;
}

/**
 * Single relevant case for a commercial landing page, shown as a small
 * static photo grid (one large shot, two smaller below — same rhythm as
 * the homepage's CaseSection) rather than a single narrow slider card,
 * which read as undersized next to the rest of the page. Photos open in
 * the same Lightbox as the homepage Portfolio.
 */
export function SegmentCase({ heading, subtitle, item, eyebrow = 'Пример объекта' }: SegmentCaseProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const photos = item.images.slice(0, 3);
  // Price per m² intentionally left out here — it belongs to a specific
  // case, not to "what this kind of work costs for you", which is what the
  // quiz below actually answers.
  const hasSpecs = item.area || item.term;

  return (
    <section className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading eyebrow={eyebrow} subtitle={subtitle} className="mb-8 md:mb-10 max-w-[680px] mx-auto">
          {heading}
        </SectionHeading>

        <div className="max-w-[760px] mx-auto">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {photos[0] && (
              <button
                type="button"
                onClick={() => setLightbox(0)}
                aria-label="Открыть фото 1"
                className="col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden bg-[#e7ebe7] cursor-zoom-in group"
              >
                <Image
                  src={photos[0]}
                  alt=""
                  fill
                  sizes="760px"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  priority
                />
              </button>
            )}
            {photos.slice(1).map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setLightbox(i + 1)}
                aria-label={`Открыть фото ${i + 2}`}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#e7ebe7] cursor-zoom-in group"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 372px"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                />
              </button>
            ))}
          </div>

          {hasSpecs && (
            <div className="flex flex-wrap items-baseline justify-center gap-2 mt-5 text-[15px] text-muted">
              {item.area && <span>{item.area}</span>}
              {item.area && item.term && <span>·</span>}
              {item.term && <span>{item.term}</span>}
            </div>
          )}

          <div className="flex justify-center mt-7">
            <a
              href="#calc"
              className="inline-block bg-gold hover:bg-gold-dark text-ink font-bold text-[16px] px-9 py-[15px] rounded-[14px] shadow-gold-glow transition-all duration-200 hover:-translate-y-px"
            >
              Рассчитать стоимость
            </a>
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox images={item.images} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}

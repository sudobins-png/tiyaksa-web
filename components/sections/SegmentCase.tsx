'use client';

import { useState } from 'react';
import type { PortfolioItem } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PortfolioCard, Lightbox } from '@/components/sections/Portfolio';

interface SegmentCaseProps {
  heading: string;
  subtitle: string;
  item: PortfolioItem;
  eyebrow?: string;
}

/**
 * Single relevant case for a commercial landing page — same interactive
 * card/lightbox as the homepage's Portfolio grid, but showing one item
 * picked (and captioned) for the page's segment, rather than the whole
 * carousel.
 */
export function SegmentCase({ heading, subtitle, item, eyebrow = 'Пример объекта' }: SegmentCaseProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading eyebrow={eyebrow} subtitle={subtitle} className="mb-8 md:mb-10 max-w-[680px] mx-auto">
          {heading}
        </SectionHeading>

        <div className="max-w-[400px] mx-auto">
          <PortfolioCard item={item} onOpen={(photoIdx) => setLightbox(photoIdx)} />
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox images={item.images} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </section>
  );
}

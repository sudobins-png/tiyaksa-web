'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GridOverlay } from '@/components/ui/GridOverlay';
import { LeadModal } from '@/components/ui/LeadModal';
import { heroContent } from '@/data/content';

export function Hero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-forest">
      <GridOverlay />

      {/* Decorative rhombus */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: '-160px', top: '-60px',
          width: '440px', height: '440px',
          border: '2px solid rgba(255,255,255,.07)',
          borderRadius: '32px',
          transform: 'rotate(45deg)',
        }}
      />

      <div className="relative max-w-content mx-auto px-6 py-24 flex flex-wrap gap-14 items-center" style={{ paddingTop: '96px', paddingBottom: '100px' }}>
        {/* Text block */}
        <div className="flex-1 min-w-[300px]" style={{ flexBasis: '460px' }}>
          <p className="font-semibold text-[15px] tracking-[.1em] uppercase text-sage mb-6">
            {heroContent.eyebrow}
          </p>
          <h1
            className="font-extrabold leading-[1.02] tracking-[-0.02em] text-white mb-6 text-balance"
            style={{ fontSize: 'clamp(40px,6.2vw,64px)' }}
          >
            {heroContent.heading}
          </h1>
          <ul className="flex flex-col gap-3 mb-9">
            {heroContent.bullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/85" style={{ fontSize: 'clamp(16px,2vw,18px)' }}>
                <svg className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="10" cy="10" r="10" fill="#F0B429" fillOpacity=".18" />
                  <path d="M5.5 10.5 L8.5 13.5 L14.5 7" stroke="#F0B429" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-[14px]">
            <a
              href="#calc"
              className="bg-gold hover:bg-gold-dark text-ink font-bold text-[17px] px-[30px] py-[17px] rounded-[14px] shadow-gold-glow transition-all duration-200 hover:-translate-y-0.5 text-center"
            >
              {heroContent.ctaPrimary}
            </a>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="border-[1.5px] border-white text-white hover:bg-white hover:text-forest font-semibold text-[17px] px-[30px] py-[17px] rounded-[14px] transition-all duration-200 text-center cursor-pointer bg-transparent"
            >
              {heroContent.ctaSecondary}
            </button>
          </div>
        </div>

        {/* Hero image */}
        <div className="flex-1 min-w-[280px] relative" style={{ flexBasis: '380px', maxWidth: '460px', height: '420px' }}>
          <Image
            src={heroContent.heroImage}
            alt="Интерьер отремонтированной квартиры"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 460px"
            className="object-cover object-center rounded-[18px]"
          />
        </div>
      </div>

      {modalOpen && <LeadModal onClose={() => setModalOpen(false)} source="hero" />}
    </section>
  );
}

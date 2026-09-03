'use client';

import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { GridOverlay } from '@/components/ui/GridOverlay';
import { siteConfig } from '@/data/content';
import { PrivacyModal } from '@/components/ui/PrivacyModal';

export function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <footer className="relative overflow-hidden bg-forest">
      <GridOverlay />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: '-150px', top: '-100px',
          width: '400px', height: '400px',
          border: '2px solid rgba(255,255,255,.06)',
          borderRadius: '32px',
          transform: 'rotate(45deg)',
        }}
      />

      <div className="relative max-w-content mx-auto px-6" style={{ paddingTop: '40px', paddingBottom: '36px' }}>
        <Logo variant="light" className="mb-6" />

        <div className="border-t border-white/[0.14] pt-6 pb-6">
          <p className="m-0 mb-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/40">
            Соцсети
          </p>
          <a
            href="https://t.me/Masters_ZK"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-white/80 hover:text-white transition-colors text-[14px] font-semibold w-fit"
          >
            <svg width="22" height="22" viewBox="0 0 240 240" aria-hidden className="shrink-0">
              <circle cx="120" cy="120" r="120" fill="#2CA5E0" />
              <path fill="#fff" d="M54.3,118.8c35-15.2,58.3-25.3,70-30.2c33.3-13.9,40.3-16.3,44.8-16.4c1,0,3.2,0.2,4.7,1.4c1.2,1,1.5,2.3,1.7,3.3s0.4,3.1,0.2,4.7c-1.8,19-9.6,65.1-13.6,86.3c-1.7,9-5,12-8.2,12.3c-7,0.6-12.3-4.6-19-9c-10.6-6.9-16.5-11.2-26.8-18c-11.9-7.8-4.2-12.1,2.6-19.1c1.8-1.8,32.5-29.8,33.1-32.3c0.1-0.3,0.1-1.5-0.6-2.1c-0.7-0.6-1.7-0.4-2.5-0.2c-1.1,0.2-17.9,11.4-50.6,33.5c-4.8,3.3-9.1,4.9-13,4.8c-4.3-0.1-12.5-2.4-18.7-4.4c-7.5-2.4-13.5-3.7-13-7.9C45.7,123.3,48.7,121.1,54.3,118.8z" />
            </svg>
            Наш канал о ремонте
          </a>
        </div>

        <div className="border-t border-white/[0.14] pt-6 text-[13px] text-white/50 flex flex-col gap-1">
          <p className="m-0">{siteConfig.copyright}</p>
          <p className="m-0">{siteConfig.copyrightNote}</p>
          <p className="m-0 text-[11px] text-white/30 mt-1">ИП СУНАЙКИН Л.А. ИНН: 910812406492 · ОГРНИП: 326910000041032 · улица Строителей, д. 14, Республика Крым, р-н Кировский, село Владиславовка</p>
          <button
            onClick={() => setModalOpen(true)}
            className="text-white/50 hover:text-white/80 underline transition-colors w-fit bg-transparent border-none p-0 text-[13px] cursor-pointer"
          >
            {siteConfig.privacyText}
          </button>
        </div>
      </div>

      {modalOpen && <PrivacyModal onClose={() => setModalOpen(false)} />}
    </footer>
  );
}

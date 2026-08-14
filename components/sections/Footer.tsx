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

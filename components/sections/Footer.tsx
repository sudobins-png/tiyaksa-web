'use client';

import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { GridOverlay } from '@/components/ui/GridOverlay';
import { siteConfig, footerLinks } from '@/data/content';
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

      <div className="relative max-w-content mx-auto px-6" style={{ paddingTop: '64px', paddingBottom: '36px' }}>
        <div className="flex flex-wrap gap-10 justify-between mb-11">
          {/* Brand */}
          <div className="flex-1 min-w-[260px]" style={{ flexBasis: '300px' }}>
            <Logo variant="light" className="mb-[18px]" />
          </div>

          {/* Contacts */}
          <div className="flex-1 min-w-[200px]" style={{ flexBasis: '220px' }}>
            <p className="font-semibold text-[13px] tracking-[.1em] uppercase text-sage mb-4">Контакты</p>
            <div className="flex flex-col gap-[10px]">
              <a href={siteConfig.phoneHref} className="text-white font-semibold text-[17px] hover:text-sage transition-colors">
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="text-white/80 text-base hover:text-white transition-colors">
                {siteConfig.email}
              </a>
              <a href={`https://${siteConfig.website}`} className="text-white/80 text-base hover:text-white transition-colors">
                {siteConfig.website}
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex-1 min-w-[160px]" style={{ flexBasis: '180px' }}>
            <p className="font-semibold text-[13px] tracking-[.1em] uppercase text-sage mb-4">Меню</p>
            <div className="flex flex-col gap-2">
              {footerLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-white/80 text-base hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Social — временно скрыто */}
          {/* <div className="flex-none">
            <p className="font-semibold text-[13px] tracking-[.1em] uppercase text-sage mb-4">Мы в сети</p>
            <div className="flex gap-3">
              {(['VK', 'Telegram', 'YouTube'] as const).map((name) => (
                <a
                  key={name}
                  href="#"
                  aria-label={name}
                  className="w-[46px] h-[46px] rounded-full bg-grove hover:bg-grove-light flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          </div> */}
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

function SocialIcon({ name }: { name: string }) {
  // Placeholder diamond icon for all social networks
  return (
    <svg width="22" height="22" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path d="M22 5.5 L38 22 L22 38.5 L6 22 Z" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M22 13 L29 19 V29 H15 V19 Z" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="22" cy="23.5" r="2" fill="#F0B429" />
    </svg>
  );
}

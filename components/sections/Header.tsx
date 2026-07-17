'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { navItems, siteConfig } from '@/data/content';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#ecefec]"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}>

      <div className="max-w-content mx-auto px-6 py-[14px] flex items-center justify-between gap-5">
        <Link href="#top">
          <Logo variant="dark" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-ink font-medium text-[15px] hover:text-forest transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-[18px]">
          <a href={siteConfig.phoneHref} className="text-forest font-bold text-base whitespace-nowrap hover:text-grove transition-colors">
            {siteConfig.phone}
          </a>
          <a
            href="#calc"
            className="bg-gold hover:bg-gold-dark text-ink font-bold text-[15px] px-[22px] py-3 rounded-xl whitespace-nowrap transition-all duration-200 shadow-gold-glow hover:-translate-y-px"
          >
            Рассчитать ремонт онлайн
          </a>
        </div>

        {/* Phone number — tablet only (md–lg), pushed to the right */}
        <a
          href={siteConfig.phoneHref}
          className="hidden md:flex lg:hidden ml-auto items-center text-forest font-bold text-[15px] whitespace-nowrap hover:text-grove transition-colors"
        >
          {siteConfig.phone}
        </a>

        {/* Phone icon — mobile only */}
        <a
          href={siteConfig.phoneHref}
          aria-label={siteConfig.phone}
          className="flex md:hidden items-center justify-center w-10 h-10 rounded-[10px] bg-gold hover:bg-gold-dark transition-colors shadow-gold-glow"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M4.5 2C4.5 2 3 2 2 3.5C1 5 1.5 7 3 9C4.5 11 7 13.5 9 15C11 16.5 13 17 14.5 16C16 15 16 13.5 16 13.5L13.5 11L11.5 12.5C11.5 12.5 9.5 11.5 8 10C6.5 8.5 5.5 6.5 5.5 6.5L7 4.5L4.5 2Z"
              fill="#1A1D1A"
            />
          </svg>
        </a>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden border border-[#dfe4df] bg-white rounded-[10px] w-12 h-12 flex items-center justify-center cursor-pointer"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B4F1B" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B4F1B" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-t border-[#ecefec] bg-white px-6 pb-[22px] pt-4 flex flex-col gap-1"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-ink font-semibold text-[17px] py-3 border-b border-[#f2f4f2]"
              >
                {item.label}
              </a>
            ))}
            <a href={siteConfig.phoneHref} className="text-forest font-bold text-lg py-[14px]">
              {siteConfig.phone}
            </a>
            <a
              href="#cta"
              onClick={() => setMenuOpen(false)}
              className="bg-gold text-ink font-bold text-base py-[15px] rounded-xl text-center mt-1.5"
            >
              Рассчитать ремонт онлайн
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { siteConfig } from '@/data/content';

/**
 * Header for /offer/[id] pages — logo + a direct way to call, nothing else.
 * No nav, no hamburger, no quiz CTA: the visitor already finished the quiz
 * and is looking at their own price breakdown, so the only next step that
 * makes sense here is picking up the phone, not being routed back into
 * another quiz. Same phone icon/number treatment as the homepage Header.
 */
export function OfferHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#ecefec]"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}
    >
      <div className="max-w-content mx-auto px-6 py-[14px] flex items-center justify-between gap-5">
        <Link href="/">
          <Logo variant="dark" />
        </Link>

        {/* Desktop: phone number */}
        <a
          href={siteConfig.phoneHref}
          className="hidden sm:flex items-center text-forest font-bold text-base whitespace-nowrap hover:text-grove transition-colors"
        >
          {siteConfig.phone}
        </a>

        {/* Mobile: phone icon */}
        <a
          href={siteConfig.phoneHref}
          aria-label={siteConfig.phone}
          className="flex sm:hidden items-center justify-center w-10 h-10 rounded-[10px] bg-gold hover:bg-gold-dark transition-colors shadow-gold-glow shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M4.5 2C4.5 2 3 2 2 3.5C1 5 1.5 7 3 9C4.5 11 7 13.5 9 15C11 16.5 13 17 14.5 16C16 15 16 13.5 16 13.5L13.5 11L11.5 12.5C11.5 12.5 9.5 11.5 8 10C6.5 8.5 5.5 6.5 5.5 6.5L7 4.5L4.5 2Z"
              fill="#1A1D1A"
            />
          </svg>
        </a>
      </div>
    </header>
  );
}

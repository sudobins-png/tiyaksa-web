import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function BlogHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#ecefec]"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)' }}
    >
      <div className="max-w-content mx-auto px-6 py-[14px] flex items-center justify-between gap-5">
        <Link href="/">
          <Logo variant="dark" />
        </Link>

        <Link
          href="/"
          className="bg-gold hover:bg-gold-dark text-ink font-bold text-[13px] sm:text-[15px] px-4 sm:px-[22px] py-2.5 sm:py-3 rounded-xl whitespace-nowrap transition-all duration-200 shadow-gold-glow hover:-translate-y-px shrink-0"
        >
          {/* Full phrase doesn't fit next to the logo below ~sm: measured 138px
              available at 375px vs. 138px+ needed just for the text at any
              readable size — hence the shorter label on mobile. */}
          <span className="sm:hidden">Рассчитать</span>
          <span className="hidden sm:inline">Рассчитать стоимость</span>
        </Link>
      </div>
    </header>
  );
}

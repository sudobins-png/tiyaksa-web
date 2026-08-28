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
          className="bg-gold hover:bg-gold-dark text-ink font-bold text-[15px] px-[22px] py-3 rounded-xl whitespace-nowrap transition-all duration-200 shadow-gold-glow hover:-translate-y-px"
        >
          Рассчитать стоимость
        </Link>
      </div>
    </header>
  );
}

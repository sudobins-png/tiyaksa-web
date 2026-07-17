import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'dark' | 'light';
  className?: string;
}

export function Logo({ variant = 'dark', className }: LogoProps) {
  const dotCol  = '#F0B429';
  const nameCol = variant === 'dark' ? '#1B4F1B' : '#fff';
  const remCol  = variant === 'dark' ? '#2E7D32' : '#8DBE2E';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/logo-mini.png"
        alt=""
        width={42}
        height={42}
        priority
      />
      <span
        className="font-extrabold text-xl tracking-tight leading-none select-none"
        style={{ color: nameCol }}
      >
        ТиЯКСа
        <span style={{ color: dotCol }}>.</span>
        <span style={{ color: remCol }}>Ремонт</span>
      </span>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { EstimateModal } from '@/components/ui/EstimateModal';

export function EstimateAudit() {
  const [open, setOpen] = useState(false);

  return (
    <section id="estimate" className="bg-grove-mint">
      <div className="max-w-[720px] mx-auto px-6 py-14 md:py-[88px] text-center">
        <div className="w-14 h-14 mx-auto mb-6 md:mb-7 flex items-center justify-center text-forest">
          <IconReceipt />
        </div>

        <h2
          className="m-0 font-bold text-ink leading-[1.15] tracking-[-0.01em] text-balance"
          style={{ fontSize: 'clamp(26px,4vw,40px)' }}
        >
          Уже делали расчёт в других компаниях?
        </h2>

        <p className="m-0 mt-4 md:mt-5 mx-auto max-w-[540px] text-[16px] md:text-[18px] leading-relaxed text-subtle">
          Отправьте нам файл со сметой, и мы сделаем расчёт по нашему прайсу.
          А также проведём аудит на ошибки и скрытые работы.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-7 md:mt-9 w-full sm:w-auto bg-gold hover:bg-gold-dark text-ink font-bold text-[16px] md:text-[17px] px-9 py-[16px] rounded-[14px] shadow-gold-glow transition-all duration-200 hover:-translate-y-px border-none cursor-pointer"
        >
          Отправить свою смету
        </button>
      </div>

      {open && <EstimateModal onClose={() => setOpen(false)} />}
    </section>
  );
}

function IconReceipt() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 3h16v16.5l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3Z" />
      <path d="M8 8h8M8 12h8M8 15h5" />
    </svg>
  );
}

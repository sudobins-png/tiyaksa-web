'use client';

import { useState } from 'react';
import { LeadModal } from '@/components/ui/LeadModal';

export function ManagerCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-7 pt-7 border-t border-[#e4e9e4] flex flex-col md:flex-row md:items-center gap-5">
        <p className="m-0 flex-1 text-base md:text-lg leading-[1.6] text-subtle">
          Проконсультируйтесь бесплатно с управляющим ТиЯКСа.Ремонт — он поможет подобрать материалы и посчитает смету за 30 минут.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-none w-full md:w-auto bg-gold hover:bg-gold-dark text-ink font-bold text-[16px] px-8 py-[15px] rounded-[12px] shadow-gold-glow transition-all duration-200 hover:-translate-y-px border-none cursor-pointer"
        >
          Отправить заявку
        </button>
      </div>

      {open && <LeadModal onClose={() => setOpen(false)} source="quiz-manager" />}
    </>
  );
}

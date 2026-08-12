'use client';

import { useState } from 'react';
import { LeadModal } from '@/components/ui/LeadModal';

export function ManagerCta() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-7 md:mt-9 rounded-[16px] bg-forest-dark p-5 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10 text-center md:text-left">
        <div className="flex-1 min-w-0">
          {/* «ПРОКОНСУЛЬТИРУЙТЕСЬ» is a single 19-char word — the clamp floor keeps it
              inside the card at 375px, break-words is the safety net below that. */}
          <p
            className="m-0 font-extrabold uppercase text-white leading-[1.18] tracking-[-0.01em] break-words"
            style={{ fontSize: 'clamp(16px,2.6vw,30px)' }}
          >
            {/* pr compensates for the italic overhang, which otherwise collides with the next word */}
            Проконсультируйтесь <span className="italic text-gold pr-[0.09em]">бесплатно</span> с управляющим{' '}
            <span className="normal-case">ТиЯКСа.Ремонт</span>
          </p>
          <p className="m-0 mt-3 text-[15px] md:text-[17px] leading-snug text-white/75">
            Он поможет подобрать материалы и посчитает смету за 30 минут
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-none w-full md:w-auto bg-gold hover:bg-gold-dark text-ink font-bold text-[16px] md:text-[17px] px-8 py-[16px] rounded-[12px] shadow-gold-glow transition-all duration-200 hover:-translate-y-px border-none cursor-pointer"
        >
          Отправить заявку
        </button>
      </div>

      {open && <LeadModal onClose={() => setOpen(false)} source="quiz-manager" />}
    </>
  );
}

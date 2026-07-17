'use client';

import { useState } from 'react';
import { cn, formatMoney } from '@/lib/utils';
import { LeadModal } from '@/components/ui/LeadModal';
import {
  calcRates,
  calcAptTypes,
  calcWorkTypes,
  secondaryMultiplier,
  highEstimateFactor,
} from '@/data/pricing';

export function Calculator() {
  const [aptType, setAptType]     = useState<string>('Новостройка');
  const [area, setArea]           = useState<number>(60);
  const [workType, setWorkType]   = useState<string>('Капитальный');
  const [modalOpen, setModalOpen] = useState(false);

  const clampedArea = Math.max(20, Math.min(200, area));
  const mult        = aptType === 'Вторичка' ? secondaryMultiplier : 1;
  const low         = clampedArea * (calcRates[workType] ?? 12500) * mult;
  const high        = low * highEstimateFactor;

  return (
    <section id="calc" className="bg-site">
      <div className="max-w-[900px] mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-9 text-ink text-center"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Рассчитайте стоимость
        </h2>

        <div className="bg-white rounded-[20px] shadow-calc" style={{ padding: 'clamp(24px,4vw,44px)' }}>

          {/* Apartment type */}
          <p className="font-semibold text-[15px] tracking-[.1em] uppercase text-grove mb-[14px]">
            Тип квартиры
          </p>
          <div className="flex gap-3 flex-wrap mb-[34px]">
            {calcAptTypes.map((t) => (
              <Pill key={t} active={aptType === t} onClick={() => setAptType(t)}>
                {t}
              </Pill>
            ))}
          </div>

          {/* Area */}
          <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
            <p className="font-semibold text-[15px] tracking-[.1em] uppercase text-grove">Площадь</p>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                min={20}
                max={200}
                value={area}
                onChange={(e) => setArea(Math.max(20, Math.min(200, Number(e.target.value) || 20)))}
                className="w-24 font-extrabold text-[30px] text-forest border-0 border-b-2 border-[#dbe4db] text-right outline-none p-0 px-1 bg-transparent"
                aria-label="Площадь в квадратных метрах"
              />
              <span className="font-bold text-xl text-muted">м²</span>
            </div>
          </div>
          <input
            type="range"
            min={20}
            max={200}
            step={1}
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            className="mb-2"
            aria-label="Ползунок площади"
          />
          <div className="flex justify-between text-[13px] text-[#9aa39a] mb-[34px]">
            <span>20 м²</span>
            <span>200 м²</span>
          </div>

          {/* Work type */}
          <p className="font-semibold text-[15px] tracking-[.1em] uppercase text-grove mb-[14px]">
            Вид работ
          </p>
          <div className="flex gap-3 flex-wrap mb-9">
            {calcWorkTypes.map((t) => (
              <Pill key={t} active={workType === t} onClick={() => setWorkType(t)}>
                {t}
              </Pill>
            ))}
          </div>

          {/* Result */}
          <div className="bg-grove-mint rounded-2xl px-[26px] py-7 text-center mb-[26px]">
            <p className="text-[15px] text-muted mb-[10px]">Ориентировочно</p>
            <p
              className="font-extrabold text-forest tracking-[-0.02em] leading-[1.1]"
              style={{ fontSize: 'clamp(26px,4.5vw,38px)' }}
              aria-live="polite"
            >
              от {formatMoney(low)} до {formatMoney(high)}
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full bg-gold hover:bg-gold-dark text-ink font-bold text-[17px] py-[17px] border-none rounded-[14px] cursor-pointer shadow-[0_4px_16px_rgba(240,180,41,.3)] transition-all duration-200 hover:-translate-y-px"
          >
            Уточнить смету
          </button>

          <p className="mt-[18px] text-[13px] text-[#9aa39a] text-center leading-relaxed">
            Результат расчёта является предварительным и не является публичной офертой (ст. 437 ГК РФ). Итоговая стоимость ремонта определяется после выезда специалиста на замер и составления сметы с учётом фактического объёма и сложности работ.
          </p>
        </div>
      </div>

      {modalOpen && <LeadModal onClose={() => setModalOpen(false)} source="calculator" />}
    </section>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'font-semibold text-[15px] px-[22px] py-[13px] rounded-xl cursor-pointer transition-all duration-200 min-h-[48px] border-[1.5px]',
        active
          ? 'border-forest bg-forest text-white shadow-[0_3px_12px_rgba(27,79,27,.22)]'
          : 'border-[#d3ddd3] bg-white text-forest'
      )}
    >
      {children}
    </button>
  );
}

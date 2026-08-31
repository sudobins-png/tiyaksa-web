'use client';

import { useState } from 'react';
import { LeadModal } from '@/components/ui/LeadModal';
import { LEAD_SOURCES } from '@/lib/config/leadSources';
import { calcRates } from '@/data/pricing';

const RATE = calcRates['Капитальный'];

export function PriceCalculator() {
  const [area, setArea] = useState(60);
  const [modalOpen, setModalOpen] = useState(false);
  const clampedArea = Math.max(20, Math.min(300, area));
  const total = clampedArea * RATE;

  return (
    <div className="bg-cream border border-charcoal/10 p-7 lg:sticky lg:top-6">
      <h3 className="m-0 mb-1.5 font-unbounded font-medium text-[17px] text-charcoal">Быстрый расчёт</h3>
      <p className="m-0 mb-5 font-manrope text-[13px] leading-[1.5] text-taupe-light">
        Площадь квартиры — ориентировочная сумма ремонта под ключ.
      </p>

      <label className="flex items-center justify-between gap-3 bg-white border border-charcoal/[0.14] px-4 py-3.5 mb-4">
        <span className="font-manrope text-[14px] text-taupe-dark">Площадь, м²</span>
        <input
          type="number"
          min={20}
          max={300}
          value={area}
          onChange={(e) => setArea(Math.max(20, Math.min(300, Number(e.target.value) || 20)))}
          className="w-16 font-unbounded text-[16px] font-medium text-charcoal text-right outline-none border-0 bg-transparent"
          aria-label="Площадь в квадратных метрах"
        />
      </label>

      <div className="flex items-baseline justify-between mb-5">
        <span className="font-manrope text-[14px] text-taupe-dark">Ориентир</span>
        <span className="font-unbounded text-[24px] font-semibold text-charcoal" aria-live="polite">
          от {total.toLocaleString('ru-RU')} ₽
        </span>
      </div>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="w-full bg-charcoal hover:bg-charcoal-card text-cream text-center py-[15px] font-manrope text-[15px] font-semibold transition-colors cursor-pointer border-none"
      >
        Получить точную смету
      </button>

      {modalOpen && <LeadModal onClose={() => setModalOpen(false)} source={LEAD_SOURCES.priceCalculator} />}
    </div>
  );
}

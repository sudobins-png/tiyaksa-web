'use client';

import { useState } from 'react';
import { PRICE_LIST } from '@/data/priceList';

function formatPrice(item: { price?: number; approxFrom?: boolean }): string {
  if (item.price === undefined) return '';
  const prefix = item.approxFrom ? 'от ' : '';
  return `${prefix}${item.price.toLocaleString('ru-RU')} ₽`;
}

export function PriceTable() {
  const [active, setActive] = useState(PRICE_LIST[0].slug);
  const category = PRICE_LIST.find((c) => c.slug === active) ?? PRICE_LIST[0];

  return (
    <div>
      <div className="flex gap-2.5 flex-wrap mb-8" role="tablist" aria-label="Категории прайс-листа">
        {PRICE_LIST.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            role="tab"
            aria-selected={cat.slug === active}
            onClick={() => setActive(cat.slug)}
            className={
              cat.slug === active
                ? 'font-manrope text-[14px] font-semibold px-[18px] py-2.5 bg-charcoal text-cream border border-charcoal cursor-pointer'
                : 'font-manrope text-[14px] font-semibold px-[18px] py-2.5 bg-transparent text-taupe-dark border border-charcoal/[0.14] cursor-pointer hover:border-charcoal/30 transition-colors'
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      {category.items.length === 0 ? (
        <p className="font-manrope text-[15px] text-taupe-light">Раздел наполняется — прайс появится здесь в ближайшее время.</p>
      ) : (
        <table className="w-full border-collapse font-manrope">
          <thead>
            <tr>
              <th className="text-left text-[12px] tracking-[0.08em] uppercase text-taupe-light font-semibold pb-3 border-b border-charcoal/[0.12]">
                Работа
              </th>
              <th className="text-left text-[12px] tracking-[0.08em] uppercase text-taupe-light font-semibold pb-3 border-b border-charcoal/[0.12]">
                Ед. изм.
              </th>
              <th className="text-right text-[12px] tracking-[0.08em] uppercase text-taupe-light font-semibold pb-3 border-b border-charcoal/[0.12]">
                Цена
              </th>
            </tr>
          </thead>
          <tbody>
            {category.items.map((item) => (
              <tr key={item.name}>
                <td className="py-3.5 border-b border-charcoal/[0.08] text-[15px] text-charcoal">{item.name}</td>
                <td className="py-3.5 border-b border-charcoal/[0.08] text-[15px] text-taupe-light">{item.unit}</td>
                <td className="py-3.5 border-b border-charcoal/[0.08] text-[15px] text-charcoal font-semibold text-right whitespace-nowrap">
                  {item.price === undefined ? (
                    <span className="text-taupe-light font-normal italic">уточняется</span>
                  ) : (
                    formatPrice(item)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

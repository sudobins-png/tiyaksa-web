'use client';

import { Fragment, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PRICE_LIST } from '@/data/priceList';

function formatPrice(item: { price?: number; approxFrom?: boolean }): string {
  if (item.price === undefined) return '';
  const prefix = item.approxFrom ? 'от ' : '';
  return `${prefix}${item.price.toLocaleString('ru-RU')} ₽`;
}

export function PriceTable() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState(PRICE_LIST[0].slug);

  // Deep-link from the homepage teaser's «Все цены» links (?category=slug).
  useEffect(() => {
    const requested = searchParams.get('category');
    if (requested && PRICE_LIST.some((c) => c.slug === requested)) {
      setActive(requested);
    }
  }, [searchParams]);

  const category = PRICE_LIST.find((c) => c.slug === active) ?? PRICE_LIST[0];

  return (
    <div>
      <div
        className="no-scrollbar flex gap-2 overflow-x-auto -mx-6 px-6 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0 mb-8"
        role="tablist"
        aria-label="Категории прайс-листа"
      >
        {PRICE_LIST.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            role="tab"
            aria-selected={cat.slug === active}
            onClick={() => setActive(cat.slug)}
            className={
              cat.slug === active
                ? 'shrink-0 whitespace-nowrap text-[14px] font-semibold px-[18px] py-2.5 rounded-xl border-[1.5px] border-forest bg-forest text-white cursor-pointer shadow-[0_3px_12px_rgba(27,79,27,.22)]'
                : 'shrink-0 whitespace-nowrap text-[14px] font-semibold px-[18px] py-2.5 rounded-xl border-[1.5px] border-[#d3ddd3] bg-white text-forest cursor-pointer transition-colors hover:border-forest'
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      {category.items.length === 0 ? (
        <p className="text-[15px] text-muted">Раздел наполняется — прайс появится здесь в ближайшее время.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[12px] tracking-[0.08em] uppercase text-muted font-semibold pb-3 border-b border-[#eef1ee]">
                Работа
              </th>
              <th className="text-left text-[12px] tracking-[0.08em] uppercase text-muted font-semibold pb-3 border-b border-[#eef1ee]">
                Ед. изм.
              </th>
              <th className="text-right text-[12px] tracking-[0.08em] uppercase text-muted font-semibold pb-3 border-b border-[#eef1ee]">
                Цена
              </th>
            </tr>
          </thead>
          <tbody>
            {category.items.map((item, i) => {
              const prevSection = i > 0 ? category.items[i - 1].section : undefined;
              const showSectionHeader = item.section && item.section !== prevSection;
              return (
                <Fragment key={item.name}>
                  {showSectionHeader && (
                    <tr key={`${item.section}-header`}>
                      <td colSpan={3} className={`${i === 0 ? 'pt-0' : 'pt-8'} pb-3 text-[16px] font-bold uppercase tracking-[0.04em] text-forest`}>
                        {item.section}
                      </td>
                    </tr>
                  )}
                  <tr key={item.name}>
                    <td className="py-3.5 border-b border-[#eef1ee] text-[15px] text-ink">{item.name}</td>
                    <td className="py-3.5 border-b border-[#eef1ee] text-[15px] text-muted">{item.unit}</td>
                    <td className="py-3.5 border-b border-[#eef1ee] text-[15px] text-ink font-semibold text-right whitespace-nowrap">
                      {item.price === undefined ? (
                        <span className="text-muted font-normal italic">уточняется</span>
                      ) : (
                        formatPrice(item)
                      )}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

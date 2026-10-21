import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { PRICE_LIST, type PriceItem } from '@/data/priceList';
import { PriceCell } from '@/components/sections/PriceTable';

interface WorkPricesTableProps {
  heading: string;
  subtitle?: string;
  /** Exact item names from data/priceList.ts, in display order. */
  items: readonly string[];
}

// «за точку», not «за точка» — units from the price list in the accusative.
const UNIT_PER: Record<string, string> = { точка: 'точку', услуга: 'услугу', мп: 'м.п.' };
const perUnit = (unit: string) => (unit === '—' ? '' : `за ${UNIT_PER[unit] ?? unit}`);

const ALL_ITEMS: PriceItem[] = PRICE_LIST.filter((c) => c.slug !== 'cleaning').flatMap((c) => c.items);

/**
 * A short excerpt of the price list for a landing page — rendered with the
 * same PriceCell as /price (incl. the site-wide −12% promo), so the two pages
 * always show the same numbers. Unknown names throw at build time instead of
 * silently dropping a row.
 */
export function WorkPricesTable({ heading, subtitle, items }: WorkPricesTableProps) {
  const rows = items.map((name) => {
    const item = ALL_ITEMS.find((i) => i.name === name);
    if (!item) throw new Error(`WorkPricesTable: no price list item named «${name}»`);
    return item;
  });

  return (
    <section className="bg-white border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading className="mb-8 md:mb-12" subtitle={subtitle}>
          {heading}
        </SectionHeading>

        {/* Phones: no unit column (the unit sits under the name instead), so
            the price — the point of the table — stays on screen. */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full border-collapse text-[14px] sm:text-[15px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-muted">
                <th className="py-3 pr-4 font-semibold">Работа</th>
                <th className="hidden sm:table-cell py-3 pr-4 font-semibold">Ед.</th>
                <th className="py-3 font-semibold text-right">Цена</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.name} className="border-t border-[#eef1ee]">
                  <th scope="row" className="py-3.5 pr-3 sm:pr-4 text-left font-semibold text-ink">
                    {item.name}
                    <span className="sm:hidden block mt-0.5 text-[12px] font-normal text-muted">{perUnit(item.unit)}</span>
                  </th>
                  <td className="hidden sm:table-cell py-3.5 pr-4 text-muted whitespace-nowrap">{item.unit}</td>
                  <td className="py-3.5 text-ink text-right whitespace-nowrap font-semibold">
                    <PriceCell item={item} showDiscount />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="m-0 mt-6 text-[13px] text-muted leading-relaxed">
          Стоимость работ, материалы считаются отдельно. Полный список — в{' '}
          <Link href="/price" className="text-forest underline">прайс-листе</Link>. Точная смета — после бесплатного замера.
        </p>
      </div>
    </section>
  );
}

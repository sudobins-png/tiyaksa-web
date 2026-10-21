import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { calcRates, pricingTiers } from '@/data/pricing';
import { MIN_ORDER_RUB } from '@/data/priceNotes';

interface ApartmentPriceTableProps {
  heading: string;
  subtitle?: string;
  /** Typical areas for this apartment type, m² — one price column each. */
  areas: readonly number[];
}

const formatRub = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

/**
 * «Сколько стоит ремонт N-комнатной квартиры» — work prices for typical
 * areas, computed from the same per-m² rates as /price and the calculator
 * (data/pricing.ts), so the landing pages can't drift from the price list.
 * Prices below the minimum order are shown as the minimum.
 */
export function ApartmentPriceTable({ heading, subtitle, areas }: ApartmentPriceTableProps) {
  const rows = pricingTiers.map((tier) => {
    const rate = calcRates[tier.name];
    return {
      name: tier.name,
      rate,
      term: tier.term,
      prices: areas.map((area) => {
        const raw = rate * area;
        return { value: Math.max(raw, MIN_ORDER_RUB), isMinimum: raw < MIN_ORDER_RUB };
      }),
    };
  });
  const anyMinimum = rows.some((row) => row.prices.some((p) => p.isMinimum));

  return (
    <section className="bg-white border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading className="mb-8 md:mb-12" subtitle={subtitle}>
          {heading}
        </SectionHeading>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[560px] border-collapse text-[15px]">
            <thead>
              <tr className="text-left text-[12px] uppercase tracking-[0.08em] text-muted">
                <th className="py-3 pr-4 font-semibold">Вид ремонта</th>
                <th className="py-3 pr-4 font-semibold whitespace-nowrap">Цена за м²</th>
                {areas.map((area) => (
                  <th key={area} className="py-3 pr-4 font-semibold whitespace-nowrap">
                    {area} м²
                  </th>
                ))}
                <th className="py-3 font-semibold whitespace-nowrap">Срок</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-t border-[#eef1ee]">
                  <th scope="row" className="py-4 pr-4 text-left font-bold text-ink">
                    {row.name}
                  </th>
                  <td className="py-4 pr-4 text-ink whitespace-nowrap">от {formatRub(row.rate)}</td>
                  {row.prices.map((price, i) => (
                    <td key={areas[i]} className="py-4 pr-4 font-semibold text-ink whitespace-nowrap">
                      от {formatRub(price.value)}
                      {price.isMinimum ? <sup className="text-muted">*</sup> : null}
                    </td>
                  ))}
                  <td className="py-4 text-ink whitespace-nowrap">{row.term}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-1.5 text-[13px] text-muted leading-relaxed">
          <p className="m-0">
            Стоимость работ, материалы считаются отдельно. Во вторичке выше, чем в новостройке, — из-за демонтажа старой отделки. Точная сумма — после бесплатного замера, она фиксируется в договоре.
          </p>
          {anyMinimum ? (
            <p className="m-0">* Минимальная стоимость заказа — {formatRub(MIN_ORDER_RUB)}.</p>
          ) : null}
          <p className="m-0">
            Цены на отдельные работы — в <Link href="/price" className="text-forest underline">прайс-листе</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}

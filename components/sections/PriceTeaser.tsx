import Link from 'next/link';
import { PRICE_LIST } from '@/data/priceList';
import { SectionHeading } from '@/components/ui/SectionHeading';

const TEASER_CATEGORIES = ['walls', 'floor', 'ceiling', 'plumbing', 'electrics'];

function formatPrice(item: { price?: number; approxFrom?: boolean; unit: string }): string {
  if (item.price === undefined) return 'уточняется';
  const prefix = item.approxFrom ? 'от ' : '';
  return `${prefix}${item.price.toLocaleString('ru-RU')} ₽/${item.unit}`;
}

export function PriceTeaser() {
  const categories = PRICE_LIST.filter((c) => TEASER_CATEGORIES.includes(c.slug));

  return (
    <section className="bg-grove-mint">
      <div className="max-w-content mx-auto px-6 py-12 md:py-[88px]">
        <SectionHeading className="mb-8 md:mb-10">Прайс-лист на ремонт квартир</SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat.slug} className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
              <h3 className="m-0 font-bold text-[17px] text-ink">{cat.name}</h3>
              <div>
                {cat.items
                  .filter((item) => item.teaser)
                  .map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between gap-3 text-[13px] py-2.5 border-t border-[#eef1ee] first:border-t-0"
                    >
                      <span className="text-muted">{item.name}</span>
                      <span
                        className={
                          item.price === undefined
                            ? 'text-[#9aa39a] whitespace-nowrap italic'
                            : 'text-ink font-semibold whitespace-nowrap'
                        }
                      >
                        {formatPrice(item)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-9 md:mt-11">
          <Link
            href="/price"
            className="inline-flex items-center gap-2 border-[1.5px] border-forest text-forest hover:bg-gold hover:border-gold hover:text-ink font-bold text-[15px] px-7 py-3.5 rounded-xl transition-all duration-200"
          >
            Смотреть полный прайс-лист →
          </Link>
        </div>
      </div>
    </section>
  );
}

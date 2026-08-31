import Link from 'next/link';
import { PRICE_LIST } from '@/data/priceList';

const TEASER_CATEGORIES = ['walls', 'floor', 'ceiling', 'plumbing', 'electrics'];

function formatPrice(item: { price?: number; approxFrom?: boolean; unit: string }): string {
  if (item.price === undefined) return 'уточняется';
  const prefix = item.approxFrom ? 'от ' : '';
  return `${prefix}${item.price.toLocaleString('ru-RU')} ₽/${item.unit}`;
}

export function PriceTeaser() {
  const categories = PRICE_LIST.filter((c) => TEASER_CATEGORIES.includes(c.slug));

  return (
    <section className="bg-cream">
      <div className="max-w-content mx-auto px-5 sm:px-6 lg:px-20 py-14 lg:py-24">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 lg:mb-12">
          <div className="max-w-[640px]">
            <div className="font-manrope font-semibold text-[12px] tracking-[0.16em] text-terracotta uppercase mb-3.5">
              Цены
            </div>
            <h2 className="m-0 mb-3 font-unbounded font-semibold text-[26px] lg:text-[34px] leading-[1.2] text-charcoal">
              Сколько стоит ремонт
            </h2>
            <p className="m-0 font-manrope text-[15px] lg:text-[16px] leading-[1.6] text-taupe-dark">
              Цену за каждую работу знаете заранее — не только «от», а по конкретным позициям. Капитальный ремонт — от 12 500 ₽/м² под ключ.
            </p>
          </div>
          <Link
            href="/price"
            className="shrink-0 inline-flex items-center gap-2 font-manrope text-[15px] font-semibold text-terracotta border-b border-terracotta pb-0.5 w-fit"
          >
            Смотреть полный прайс-лист →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <div key={cat.slug} className="bg-white border border-charcoal/10 p-6 flex flex-col gap-4">
              <h3 className="m-0 font-unbounded font-medium text-[17px] text-charcoal">{cat.name}</h3>
              <div>
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between gap-3 font-manrope text-[13px] py-2.5 border-t border-charcoal/[0.08] first:border-t-0"
                  >
                    <span className="text-taupe-dark">{item.name}</span>
                    <span
                      className={
                        item.price === undefined
                          ? 'text-taupe-light whitespace-nowrap italic'
                          : 'text-charcoal font-semibold whitespace-nowrap'
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
      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import { OG_IMAGES, pageMetadata } from '@/lib/seo/metadata';
import { Suspense } from 'react';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { Stats } from '@/components/sections/Stats';
import { WhyUs } from '@/components/sections/WhyUs';
import { Manager } from '@/components/sections/Manager';
import { Reviews } from '@/components/sections/Reviews';
import { SegmentCase } from '@/components/sections/SegmentCase';
import { PriceTable } from '@/components/sections/PriceTable';
import { Calculator } from '@/components/sections/Calculator';
import { FAQ } from '@/components/sections/FAQ';
import { ServiceJsonLd } from '@/components/seo/ServiceJsonLd';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { LEAD_SOURCES } from '@/lib/config/leadSources';
import { pricingTiers } from '@/data/pricing';
import { portfolioItems } from '@/data/content';
import { PRICE_FAQ_ITEMS, PRICE_NOTES } from '@/data/priceNotes';

export const metadata: Metadata = pageMetadata({
  title: 'Прайс-лист на ремонт квартир — ТиЯКСа.Ремонт',
  description: 'Цены на ремонт квартир в Санкт-Петербурге по видам работ. Капитальный ремонт под ключ — от 12 500 ₽/м².',
  path: '/price',
  image: OG_IMAGES.case124,
});

export default function PricePage() {
  return (
    <>
      <Header />

      <div style={{ paddingTop: '71px' }}>
        <Stats />
      </div>

      <ServiceJsonLd
        name="Ремонт квартир под ключ"
        description="Расчёт стоимости ремонта квартир в Санкт-Петербурге: цены за м² по видам работ, онлайн-калькулятор, фиксация сметы в договоре."
        url="/price"
        priceFrom={7500}
      />
      <FaqJsonLd items={PRICE_FAQ_ITEMS} />

      <main className="min-h-dvh bg-site">
        <div className="max-w-content mx-auto px-6 pt-14 lg:pt-20">
          <Breadcrumbs
            className="mb-6"
            items={[
              { name: 'Главная', path: '/' },
              { name: 'Цены на ремонт', path: '/price' },
            ]}
          />
          <h1 className="m-0 mb-12 lg:mb-14 max-w-[720px] font-extrabold text-[28px] sm:text-[40px] text-ink tracking-tight leading-tight">
            Цены на ремонт квартир в Санкт-Петербурге
          </h1>

          <div className="article-content max-w-[720px] mb-14 lg:mb-16">
            <h2>Из чего складывается стоимость ремонта</h2>
            <p>
              Стоимость зависит от трёх вещей: площади квартиры, вида ремонта (косметический, капитальный или дизайнерский) и состояния объекта — новостройка с предчистовой отделкой обходится дешевле вторички, где сначала нужно демонтировать старую отделку. Все объёмы и материалы фиксируются в смете до начала работ — цена в договоре не меняется, доплата возможна только по отдельно подписанному соглашению.
            </p>
          </div>
        </div>

        <div className="max-w-content mx-auto px-6 pb-14 lg:pb-20">
          <Suspense fallback={null}>
            <PriceTable />
          </Suspense>

          <div className="mt-12 lg:mt-14 pt-8 border-t border-[#eef1ee]">
            <h2 className="m-0 mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
              Примечание
            </h2>
            <ul className="m-0 p-0 list-none flex flex-col gap-2.5">
              {PRICE_NOTES.map((note) => (
                <li key={note} className="flex gap-2.5 text-[14px] leading-relaxed text-muted">
                  <span className="shrink-0 text-[#c7cdc7]">—</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <div className="bg-site">
        <div className="max-w-content mx-auto px-6 pb-14 lg:pb-20">
          <div className="article-content max-w-[720px]">
            <h2>Ориентировочные цены за м²</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px]">
                <thead>
                  <tr>
                    <th className="text-left text-[12px] tracking-[0.08em] uppercase text-muted font-semibold pb-3 border-b border-[#eef1ee]">Вид ремонта</th>
                    <th className="text-right text-[12px] tracking-[0.08em] uppercase text-muted font-semibold pb-3 border-b border-[#eef1ee]">Цена за м²</th>
                    <th className="text-left text-[12px] tracking-[0.08em] uppercase text-muted font-semibold pb-3 pl-4 border-b border-[#eef1ee]">Срок</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier) => (
                    <tr key={tier.name}>
                      <td className="py-3.5 border-b border-[#eef1ee] text-ink font-semibold">{tier.name}</td>
                      <td className="py-3.5 border-b border-[#eef1ee] text-ink text-right whitespace-nowrap">от {tier.priceFrom} {tier.priceUnit}</td>
                      <td className="py-3.5 border-b border-[#eef1ee] text-muted pl-4 whitespace-nowrap">{tier.term}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Указанные цены — для стен высотой до 2,7 м, без учёта расходных материалов. Минимальная стоимость заказа — 300 000 ₽. Точная сумма — после бесплатного замера.
            </p>
          </div>
        </div>
      </div>

      <SegmentCase
        heading="Полный цикл ремонта под ключ"
        subtitle="124 м², 190 дней — наглядный пример объекта, где смета была зафиксирована на старте и не менялась до сдачи."
        item={portfolioItems[0]}
      />

      <WhyUs />

      <Calculator heading="Калькулятор ремонта квартиры" source={LEAD_SOURCES.priceCalculator} />

      <Manager />
      <Reviews />

      <FAQ items={PRICE_FAQ_ITEMS} />

      <Footer />
    </>
  );
}

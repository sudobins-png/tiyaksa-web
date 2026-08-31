import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { PriceTable } from '@/components/sections/PriceTable';
import { Calculator } from '@/components/sections/Calculator';

// Источник: раздел «Примечание» на https://www.prorabneva.ru/price — то же
// самое, что и остальные цены на этой странице; формулировки слегка
// причёсаны под наш тон.
const PRICE_NOTES = [
  'Цены указаны для стен высотой до 2,7 м.',
  'Минимальная стоимость заказа — 300 000 ₽.',
  'Стоимость работ не включает расходные материалы.',
  'Наценка на работы по индивидуальному дизайн-проекту — 20–30% в зависимости от сложности.',
];

export const metadata: Metadata = {
  title: 'Прайс-лист на ремонт квартир — ТиЯКСа.Ремонт',
  description: 'Цены на ремонт квартир в Санкт-Петербурге по видам работ. Капитальный ремонт под ключ — от 12 500 ₽/м².',
  alternates: { canonical: '/price' },
};

export default function PricePage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '71px' }} className="min-h-dvh bg-site">
        <div className="max-w-content mx-auto px-6 py-14 lg:py-20">
          <h1 className="m-0 mb-12 lg:mb-14 font-extrabold text-[28px] sm:text-[40px] text-ink tracking-tight leading-tight">
            Цены на ремонт квартир в Санкт-Петербурге
          </h1>

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

      <Calculator heading="Калькулятор ремонта квартиры" />

      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BlogHeader } from '@/components/sections/BlogHeader';
import { Footer } from '@/components/sections/Footer';
import { PriceTable } from '@/components/sections/PriceTable';
import { Calculator } from '@/components/sections/Calculator';

export const metadata: Metadata = {
  title: 'Прайс-лист на ремонт квартир — ТиЯКСа.Ремонт',
  description: 'Цены на ремонт квартир в Санкт-Петербурге по видам работ. Капитальный ремонт под ключ — от 12 500 ₽/м².',
  alternates: { canonical: '/price' },
};

export default function PricePage() {
  return (
    <>
      <BlogHeader />
      <main style={{ paddingTop: '71px' }} className="min-h-dvh bg-site">
        <div className="max-w-content mx-auto px-6 py-14 lg:py-20">
          <h1 className="m-0 mb-12 lg:mb-14 font-extrabold text-[28px] sm:text-[40px] text-ink tracking-tight leading-tight">
            Цены на ремонт квартир в Санкт-Петербурге
          </h1>

          <Suspense fallback={null}>
            <PriceTable />
          </Suspense>
        </div>
      </main>

      <Calculator heading="Калькулятор ремонта квартиры" />

      <Footer />
    </>
  );
}

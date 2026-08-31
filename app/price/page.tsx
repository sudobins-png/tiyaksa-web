import type { Metadata } from 'next';
import { BlogHeader } from '@/components/sections/BlogHeader';
import { Footer } from '@/components/sections/Footer';
import { PriceTable } from '@/components/sections/PriceTable';
import { PriceCalculator } from '@/components/sections/PriceCalculator';

export const metadata: Metadata = {
  title: 'Прайс-лист на ремонт квартир — ТиЯКСа.Ремонт',
  description: 'Цены на ремонт квартир в Санкт-Петербурге по видам работ. Капитальный ремонт под ключ — от 12 500 ₽/м².',
  alternates: { canonical: '/price' },
};

export default function PricePage() {
  return (
    <>
      <BlogHeader />
      <main style={{ paddingTop: '71px' }} className="min-h-dvh bg-white">
        <div className="max-w-content mx-auto px-5 sm:px-6 lg:px-20 py-14 lg:py-20">
          <div className="max-w-[760px] mb-12 lg:mb-14">
            <div className="font-manrope font-semibold text-[12px] tracking-[0.16em] text-terracotta uppercase mb-4">
              Прайс-лист
            </div>
            <h1 className="m-0 mb-4 font-unbounded font-semibold text-[30px] lg:text-[40px] leading-[1.15] text-charcoal">
              Цены на ремонт квартир в Санкт-Петербурге
            </h1>
            <p className="m-0 font-manrope text-[16px] lg:text-[17px] leading-[1.6] text-taupe-dark">
              Полный прайс по видам работ — без формы «рассчитайте смету» и звонка менеджера. Капитальный ремонт под ключ — от 12 500 ₽/м². Итоговая смета фиксируется в договоре после замера.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10 lg:gap-14 items-start">
            <PriceTable />
            <PriceCalculator />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

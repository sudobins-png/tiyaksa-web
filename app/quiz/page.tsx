import type { Metadata } from 'next';
import { QuizInline } from '@/components/quiz/QuizInline';
import { Footer } from '@/components/sections/Footer';
import { GridOverlay } from '@/components/ui/GridOverlay';

export const metadata: Metadata = {
  title: 'Расчёт стоимости ремонта — ТиЯКСа.Ремонт',
  description: 'Ответьте на вопросы и получите предварительный расчёт стоимости ремонта в Санкт-Петербурге.',
};

export default function QuizPage() {
  return (
    <div className="min-h-dvh bg-grove-mint flex flex-col">
      {/* Header */}
      <header className="bg-forest px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-extrabold text-white text-[18px] tracking-tight leading-none">
          ТиЯКСа<span className="text-gold">.</span>Ремонт
        </a>
        <a href="tel:+79818916602" className="text-white/80 hover:text-white text-[15px] font-semibold transition-colors">
          +7 (981) 891-66-02
        </a>
      </header>

      {/* Eyebrow banner */}
      <div className="relative bg-forest overflow-hidden">
        <GridOverlay />
        <div className="relative px-6 py-4">
          <p className="font-semibold text-[13px] tracking-[.12em] uppercase text-sage leading-none">
            Ремонт квартир под ключ&nbsp;·&nbsp;Санкт-Петербург
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[640px] lg:max-w-[1024px]">
          {/* Quiz card */}
          <QuizInline />
        </div>
      </main>

      <Footer />
    </div>
  );
}

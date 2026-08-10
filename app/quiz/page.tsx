import type { Metadata } from 'next';
import { QuizInline } from '@/components/quiz/QuizInline';
import { Footer } from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'Расчёт стоимости ремонта — ТиЯКСа.Ремонт',
  description: 'Ответьте на 3 вопроса и получите предварительный расчёт стоимости ремонта в Санкт-Петербурге.',
};

export default function QuizPage() {
  return (
    <div className="min-h-dvh bg-grove-mint flex flex-col">
      {/* Header */}
      <header className="bg-forest px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <span className="font-extrabold text-white text-[18px] tracking-tight leading-none">
            ТиЯКСа<span className="text-gold">.</span>Ремонт
          </span>
        </a>
        <a href="tel:+79818916602"
          className="text-white/80 hover:text-white text-[15px] font-semibold transition-colors">
          +7 (981) 891-66-02
        </a>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[640px] lg:max-w-[1024px]">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-extrabold text-forest text-[26px] sm:text-[32px] leading-tight tracking-tight mb-2">
              Рассчитайте стоимость ремонта
            </h1>
            <p className="text-[16px] text-subtle">
              3 вопроса — предварительная смета в течение часа
            </p>
          </div>

          {/* Quiz card */}
          <QuizInline />
        </div>
      </main>

      <Footer />
    </div>
  );
}

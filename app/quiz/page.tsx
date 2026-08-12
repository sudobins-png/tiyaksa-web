import type { Metadata } from 'next';
import { QuizInline } from '@/components/quiz/QuizInline';
import { Footer } from '@/components/sections/Footer';

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

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[640px] lg:max-w-[1024px]">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-extrabold text-[24px] sm:text-[32px] text-ink leading-tight tracking-tight mb-3">
              Ищете компанию для выполнения ремонта?
            </h1>
            <p className="text-[15px] sm:text-[16px] text-muted leading-snug">
              Рассчитайте стоимость Вашего ремонта и получите консультацию от нашего специалиста!
            </p>
            <p className="text-[15px] sm:text-[16px] text-muted leading-snug mt-1">
              Расчёт сметы и консультация <strong className="text-ink font-bold">бесплатные</strong> и ни к чему Вас не обязывают
            </p>
          </div>

          {/* Quiz card */}
          <QuizInline />
        </div>
      </main>

      <Footer hideMenu />
    </div>
  );
}

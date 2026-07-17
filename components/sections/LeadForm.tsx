import { GridOverlay } from '@/components/ui/GridOverlay';

export function LeadForm() {
  return (
    <section className="relative overflow-hidden bg-forest">
      <GridOverlay />
      <div className="relative max-w-[1000px] mx-auto px-6 py-20 text-center">
        <h2
          className="font-bold tracking-[-0.01em] text-white mb-8"
          style={{ fontSize: 'clamp(28px,4vw,40px)' }}
        >
          Получите смету за 24 часа
        </h2>
        <a
          href="#cta"
          className="inline-block bg-gold hover:bg-gold-dark text-ink font-bold text-[17px] px-[36px] py-[17px] rounded-[14px] border-none shadow-gold-glow transition-all duration-200 hover:-translate-y-px"
        >
          Рассчитать ремонт онлайн
        </a>
        <p className="mt-[22px] text-sm text-white/70">
          Без предоплаты. Замер бесплатно. Перезвоним в течение часа.
        </p>
      </div>
    </section>
  );
}

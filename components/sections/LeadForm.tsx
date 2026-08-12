import { GridOverlay } from '@/components/ui/GridOverlay';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function LeadForm() {
  return (
    <section className="relative overflow-hidden bg-forest">
      <GridOverlay />
      <div className="relative max-w-[1000px] mx-auto px-6 py-20 text-center">
        <SectionHeading tone="light" className="mb-8">
          Получите смету за 24 часа
        </SectionHeading>
        <a
          href="#cta"
          className="inline-flex flex-col items-center bg-gold hover:bg-gold-dark text-ink font-bold text-[17px] px-[36px] py-[5px] rounded-[14px] border-none shadow-gold-glow transition-all duration-200 hover:-translate-y-px"
        >
          Рассчитать стоимость
          <span className="text-[11px] font-light opacity-55 leading-none mt-[3px]">за 60 сек</span>
        </a>
        <p className="mt-[22px] text-sm text-white/70">
          Без предоплаты. Замер бесплатно. Перезвоним в течение часа.
        </p>
      </div>
    </section>
  );
}

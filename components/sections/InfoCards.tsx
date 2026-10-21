import { SectionHeading } from '@/components/ui/SectionHeading';

interface InfoCard {
  title: string;
  text: string;
}

interface InfoCardsProps {
  heading: string;
  subtitle?: string;
  items: readonly InfoCard[];
  columns?: 2 | 3;
}

/** Heading + grid of title/text cards — the plain content block of the landing pages. */
export function InfoCards({ heading, subtitle, items, columns = 2 }: InfoCardsProps) {
  return (
    <section className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading className="mb-8 md:mb-12" subtitle={subtitle}>
          {heading}
        </SectionHeading>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''} gap-4 md:gap-6`}>
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white px-6 py-5">
              <h3 className="m-0 font-bold text-[18px] text-ink leading-snug">{item.title}</h3>
              <p className="m-0 mt-2 text-[15px] text-muted leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

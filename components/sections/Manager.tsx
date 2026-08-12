import Image from 'next/image';
import type { ReactNode } from 'react';
import { managerInfo, siteConfig } from '@/data/content';
import { SectionHeading } from '@/components/ui/SectionHeading';

interface ManagerProps {
  /** Optional CTA rendered inside the card, below the description. */
  cta?: ReactNode;
}

export function Manager({ cta }: ManagerProps) {
  return (
    <section className="bg-white">
      <div className="max-w-content mx-auto px-6 py-14 md:py-[88px]">
        <SectionHeading className="mb-7 md:mb-10">
          Ваш личный управляющий
        </SectionHeading>

        <div
          className="bg-site border border-[#eef1ee] rounded-[20px]"
          style={{ padding: 'clamp(24px,4vw,48px)' }}
        >
          <div className="flex flex-col md:flex-row flex-wrap gap-6 md:gap-11 items-center">
            {/* Photo */}
            <div className="flex-none w-[132px] h-[132px] md:w-[180px] md:h-[180px] rounded-full overflow-hidden">
              <Image
                src="/lev-andreevich.jpeg"
                alt="Лев — личный управляющий"
                width={180}
                height={180}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="flex-1 w-full min-w-0 md:min-w-[280px] text-center md:text-left" style={{ flexBasis: '320px' }}>
              <h3 className="font-bold text-[22px] md:text-[26px] text-ink">{managerInfo.name}</h3>
              <p className="text-[15px] md:text-[17px] text-muted mt-1">{managerInfo.title}</p>

              <div className="inline-flex items-center gap-2 mt-[18px] mb-[18px] bg-white border border-[#e4e9e4] rounded-[10px] px-[14px] py-[9px] max-w-full">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden>
                  <rect x="2" y="2" width="16" height="16" rx="3" fill="#F0B429" />
                  <path d="M6 10l3 3 5-6" stroke="#1A1D1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-semibold text-[13px] md:text-[14px] text-forest min-w-0">{managerInfo.badge}</span>
                <a
                  href={siteConfig.phoneHref}
                  aria-label={`Позвонить: ${siteConfig.phone}`}
                  className="ml-1 flex-none flex items-center justify-center w-8 h-8 rounded-[8px] bg-gold hover:bg-gold-dark transition-colors shadow-gold-glow"
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M4.5 2C4.5 2 3 2 2 3.5C1 5 1.5 7 3 9C4.5 11 7 13.5 9 15C11 16.5 13 17 14.5 16C16 15 16 13.5 16 13.5L13.5 11L11.5 12.5C11.5 12.5 9.5 11.5 8 10C6.5 8.5 5.5 6.5 5.5 6.5L7 4.5L4.5 2Z" fill="#1A1D1A" />
                  </svg>
                </a>
              </div>

              <p className="m-0 text-base md:text-lg leading-[1.6] text-subtle max-w-[560px] mx-auto md:mx-0">{managerInfo.text}</p>
            </div>
          </div>

          {cta}
        </div>
      </div>
    </section>
  );
}

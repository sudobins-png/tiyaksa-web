import Image from 'next/image';
import { managerInfo, siteConfig } from '@/data/content';

export function Manager() {
  return (
    <section className="bg-white">
      <div className="max-w-content mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-10 text-ink"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Ваш личный управляющий
        </h2>

        <div
          className="flex flex-wrap gap-11 items-center bg-site border border-[#eef1ee] rounded-[20px]"
          style={{ padding: 'clamp(28px,4vw,48px)' }}
        >
          {/* Photo */}
          <div className="flex-none w-[180px] h-[180px] rounded-full overflow-hidden">
            <Image
              src="/lev-andreevich.jpeg"
              alt="Лев — личный управляющий"
              width={180}
              height={180}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex-1 min-w-[280px]" style={{ flexBasis: '320px' }}>
            <h3 className="font-bold text-[26px] text-ink">{managerInfo.name}</h3>
            <p className="text-[17px] text-muted mt-1">{managerInfo.title}</p>

            <div className="inline-flex items-center gap-2 mt-[18px] mb-[18px] bg-white border border-[#e4e9e4] rounded-[10px] px-[14px] py-[9px]">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                <rect x="2" y="2" width="16" height="16" rx="3" fill="#F0B429" />
                <path d="M6 10l3 3 5-6" stroke="#1A1D1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-semibold text-[14px] text-forest">{managerInfo.badge}</span>
            </div>

            <p className="m-0 text-lg leading-[1.6] text-subtle max-w-[560px]">{managerInfo.text}</p>

            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={siteConfig.phoneHref}
                className="inline-flex items-center gap-[10px] bg-gold hover:bg-gold-dark text-ink font-bold text-[15px] px-5 py-[13px] rounded-xl transition-all duration-200 shadow-gold-glow hover:-translate-y-px"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4.5 2C4.5 2 3 2 2 3.5C1 5 1.5 7 3 9C4.5 11 7 13.5 9 15C11 16.5 13 17 14.5 16C16 15 16 13.5 16 13.5L13.5 11L11.5 12.5C11.5 12.5 9.5 11.5 8 10C6.5 8.5 5.5 6.5 5.5 6.5L7 4.5L4.5 2Z" fill="#1A1D1A" />
                </svg>
                Позвонить Льву
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface EcosystemItem {
  title: string;
  description: string;
  icon: ReactNode;
}

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ITEMS: EcosystemItem[] = [
  {
    title: 'Ремонт под ключ',
    description: 'Демонтаж, черновые и чистовые работы, сантехника, электрика — один подрядчик от и до.',
    icon: (
      <svg {...iconProps}>
        <path d="M4 11l8-6 8 6" />
        <path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" />
        <circle cx="10.5" cy="15" r="1.6" />
        <path d="M12 15h4" />
      </svg>
    ),
  },
  {
    title: 'Демонтаж',
    description: 'Разборка перегородок и старой отделки, вывоз мусора — до начала чистовых работ.',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="7" rx="1" transform="rotate(-45 6.5 6.5)" />
        <path d="M9 9l8 8" />
        <path d="M15 15l4 4" />
      </svg>
    ),
  },
  {
    title: 'Перепланировка',
    description: 'Проект и согласование с БТИ и жилищной инспекцией — берём процесс на себя.',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="16" rx="1" />
        <path d="M3 12h8M11 4v8M11 12v8" />
        <path d="M15 8h3M15 16h3" />
      </svg>
    ),
  },
  {
    title: 'Напольные покрытия',
    description:
      'Для кухни, гостиной, спальни, ванной или загородного дома. Российские и зарубежные бренды — дешевле, чем в магазине.',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="6" width="8" height="4" />
        <rect x="13" y="6" width="8" height="4" />
        <rect x="3" y="14" width="8" height="4" />
        <rect x="13" y="14" width="8" height="4" />
      </svg>
    ),
  },
  {
    title: 'Умный дом',
    description: 'Управление светом, климатом и безопасностью со смартфона.',
    icon: (
      <svg {...iconProps}>
        <path d="M4 11l8-6 8 6" />
        <path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" />
        <path d="M9.5 16a3.5 3.5 0 015 0" />
        <circle cx="12" cy="19" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Мебелировка',
    description: 'Кухни и встроенная мебель по вашему или предложенному проекту.',
    icon: (
      <svg {...iconProps}>
        <rect x="5" y="3" width="14" height="18" rx="1" />
        <path d="M12 3v18" />
        <circle cx="9.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="12" r="0.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Клининг',
    description: 'Генеральная уборка после ремонта — заезжаете в чистую квартиру.',
    icon: (
      <svg {...iconProps}>
        <rect x="8" y="9" width="8" height="12" rx="1.5" />
        <path d="M11 9V6a1 1 0 011-1h1a1 1 0 011 1v3" />
        <path d="M13 3h3M15 3v2" />
        <path d="M11 13h4M11 17h4" />
      </svg>
    ),
  },
  {
    title: 'Недвижимость',
    description: 'Поможем найти квартиру под ремонт или сдать готовую.',
    icon: (
      <svg {...iconProps}>
        <circle cx="7" cy="15" r="3" />
        <path d="M9.5 12.5L19 3" />
        <path d="M16 6l2 2" />
        <path d="M18 4l2 2" />
      </svg>
    ),
  },
];

const SUBTITLE = 'Всё, что нужно от поиска объекта до ремонта под ключ — под контролем одной компании.';

function Card({ item, size = 'desktop' }: { item: EcosystemItem; size?: 'desktop' | 'mobile' }) {
  const mobile = size === 'mobile';
  return (
    <div
      className={
        mobile
          ? 'flex-none w-[240px] flex flex-col gap-3.5 bg-white rounded-2xl shadow-card p-5'
          : 'flex flex-col gap-4 bg-white rounded-2xl shadow-card p-7 transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-card-hover'
      }
      style={mobile ? { scrollSnapAlign: 'start' } : undefined}
    >
      <div className={mobile ? 'text-forest [&>svg]:w-6 [&>svg]:h-6' : 'text-forest [&>svg]:w-7 [&>svg]:h-7'}>
        {item.icon}
      </div>
      <h3 className={mobile ? 'm-0 font-bold text-[16px] leading-[1.3] text-ink' : 'm-0 font-bold text-[19px] text-ink'}>
        {item.title}
      </h3>
      <p className={mobile ? 'm-0 text-[13px] leading-[1.5] text-muted' : 'm-0 text-[14px] leading-[1.55] text-muted'}>
        {item.description}
      </p>
    </div>
  );
}

function BrandBlock() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center">
        <div className="font-extrabold text-[34px] tracking-[-0.01em] text-ink">ЭКОСИСТЕМА</div>
        <div className="mt-2 font-bold text-[13px] tracking-[0.18em] text-grove uppercase">ТиЯКСа</div>
        <div className="w-[60px] h-[3px] rounded-full bg-gold mt-4" />
        <p className="mt-4 max-w-[300px] text-[14px] leading-[1.5] text-subtle">{SUBTITLE}</p>
      </div>
    </div>
  );
}

function MobileSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Direct scroll-position math instead of IntersectionObserver: the
    // latter's recalculation is tied to the browser's own compositing pass,
    // which some environments throttle heavily (e.g. a backgrounded tab) —
    // a plain `scroll` listener always fires and gives a deterministic index.
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = slider.scrollLeft + slider.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const cardCenter = el.offsetLeft + el.offsetWidth / 2;
          const dist = Math.abs(cardCenter - center);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setActive(closest);
      });
    };

    slider.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      slider.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={sliderRef}
        className="no-scrollbar flex gap-3.5 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {ITEMS.map((item, i) => (
          <div key={item.title} ref={(el) => { cardRefs.current[i] = el; }}>
            <Card item={item} size="mobile" />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-5" aria-hidden>
        {ITEMS.map((_, i) => (
          <span
            key={i}
            className={
              i === active
                ? 'h-[5px] w-4 rounded-[3px] bg-forest transition-all duration-200'
                : 'h-[5px] w-[5px] rounded-full bg-[#d3ddd3] transition-all duration-200'
            }
          />
        ))}
      </div>
    </>
  );
}

export function Ecosystem() {
  return (
    <section className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-12 md:py-[88px]">
        {/* Mobile / tablet — title + subtitle + horizontal slider */}
        <div className="lg:hidden">
          <h2 className="m-0 mb-2 font-bold text-[26px] leading-[1.2] text-ink tracking-[-0.01em]">
            Экосистема ТиЯКСа
          </h2>
          <p className="m-0 mb-6 text-[15px] leading-[1.55] text-subtle">{SUBTITLE}</p>
          <MobileSlider />
        </div>

        {/* Desktop — 3×3 grid with center brand block */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          <Card item={ITEMS[0]} />
          <Card item={ITEMS[1]} />
          <Card item={ITEMS[2]} />
          <Card item={ITEMS[3]} />
          <BrandBlock />
          <Card item={ITEMS[4]} />
          <Card item={ITEMS[5]} />
          <Card item={ITEMS[6]} />
          <Card item={ITEMS[7]} />
        </div>
      </div>
    </section>
  );
}

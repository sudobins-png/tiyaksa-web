import { steps } from '@/data/content';

export function HowWeWork() {
  return (
    <section id="steps" className="bg-white">
      <div className="max-w-content mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-11 text-ink"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Как мы работаем
        </h2>

        <div className="relative">
          {/* Connecting line — hidden on mobile */}
          <div
            aria-hidden
            className="absolute hidden md:block border-t-2 border-dashed border-[#cdd8cd] z-0"
            style={{ top: '26px', left: '6%', right: '6%' }}
          />

          <div
            className="relative z-[1] grid gap-[22px]"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
          >
            {steps.map((s) => (
              <div
                key={s.num}
                className={s.highlight
                  ? 'text-center px-[14px] py-[22px] border-2 border-gold rounded-2xl bg-[#fffdf6] shadow-[0_4px_18px_rgba(240,180,41,.15)]'
                  : 'text-center px-2 py-2'}
              >
                {/* Badge */}
                <div
                  className={`w-[52px] h-[52px] mx-auto mb-[18px] rounded-[14px] flex items-center justify-center font-extrabold text-[19px] ${
                    s.highlight ? 'bg-gold text-ink' : 'bg-grove-mint text-forest'
                  }`}
                >
                  {s.num}
                </div>
                <p className="font-bold text-base text-ink leading-[1.3]">{s.title}</p>
                {s.tag && (
                  <p className="mt-[10px] font-semibold text-xs tracking-[.05em] uppercase text-[#b8860b]">
                    {s.tag}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

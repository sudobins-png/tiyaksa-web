import { steps } from '@/data/content';

export function HowWeWork() {
  return (
    <section id="steps" className="bg-white border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-12 text-ink"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Как мы работаем
        </h2>

        <div className="flex flex-col gap-0">
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={s.num} className="flex gap-5 md:gap-8">
                {/* Left: number + line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`w-11 h-11 rounded-[12px] flex items-center justify-center font-extrabold text-[15px] shrink-0 ${
                      s.highlight
                        ? 'bg-gold text-ink shadow-[0_3px_12px_rgba(240,180,41,.35)]'
                        : 'bg-[#f0f4f0] text-forest'
                    }`}
                  >
                    {s.num}
                  </div>
                  {!isLast && (
                    <div className="w-[2px] flex-1 mt-2 mb-2 bg-[#e2e8e2]" style={{ minHeight: '24px' }} />
                  )}
                </div>

                {/* Right: content */}
                <div className={`pb-8 flex-1 ${isLast ? '' : ''}`}>
                  <div
                    className={`rounded-2xl px-5 py-4 mb-0 ${
                      s.highlight
                        ? 'bg-[#fffdf3] border border-gold/40'
                        : 'bg-[#f8faf8]'
                    }`}
                  >
                    <p className={`font-bold text-[16px] leading-snug ${s.highlight ? 'text-ink' : 'text-ink'}`}>
                      {s.title}
                    </p>
                    {s.desc && (
                      <p className="mt-[6px] text-[14px] text-muted leading-relaxed">
                        {s.desc}
                      </p>
                    )}
                    {s.tag && (
                      <span className="inline-block mt-3 text-[11px] font-bold uppercase tracking-[.07em] text-[#b8860b] bg-gold/15 px-2 py-[3px] rounded-md">
                        {s.tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

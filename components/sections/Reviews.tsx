import { reviews } from '@/data/content';

function Stars() {
  return (
    <div className="flex gap-[3px] mb-4" aria-label="Оценка 5 из 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 20 20" fill="#F0B429" aria-hidden>
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.27l-4.94 2.43.94-5.49-4-3.9 5.53-.8z" />
        </svg>
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <section className="bg-white">
      <div className="max-w-content mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-10 text-ink"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Что говорят клиенты
        </h2>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))' }}
        >
          {reviews.map((r) => (
            <div key={r.name} className="bg-site border border-[#eef1ee] rounded-2xl p-7 flex flex-col">
              <Stars />
              <p className="m-0 text-base leading-[1.6] text-subtle flex-1">{r.text}</p>
              <div className="flex items-center gap-[14px] mt-6 pt-5 border-t border-[#eef1ee]">
                <div className="w-[40px] h-[40px] rounded-full bg-[#dde5dd] flex-none flex items-center justify-center">
                  <span className="font-bold text-[15px] text-forest">{r.name[0]}</span>
                </div>
                <p className="font-bold text-base text-ink">{r.name}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

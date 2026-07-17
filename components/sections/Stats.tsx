import { stats } from '@/data/content';

export function Stats() {
  return (
    <section className="bg-white">
      <div className="max-w-content mx-auto px-6 py-[72px] grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {stats.map((s) => (
          <div key={s.value} className="text-left px-1 py-2">
            <div
              className="font-extrabold leading-none text-forest tracking-[-0.02em]"
              style={{ fontSize: 'clamp(38px,4.5vw,52px)' }}
            >
              {s.value}
            </div>
            <div className="font-normal text-[17px] text-muted mt-3">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

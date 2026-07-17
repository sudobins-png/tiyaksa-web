import { whyUsFeatures } from '@/data/content';

const icons: Record<string, React.ReactNode> = {
  person: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden>
      <circle cx="16" cy="12" r="6" stroke="#1B4F1B" strokeWidth="2.2" />
      <path d="M6 33c0-6 4.5-10 10-10s10 4 10 10" stroke="#1B4F1B" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="28.5" cy="8.5" r="3.2" fill="#F0B429" />
    </svg>
  ),
  document: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="9" y="5" width="22" height="30" rx="3" stroke="#1B4F1B" strokeWidth="2.2" />
      <path d="M14 13h9M14 19h12M14 25h8" stroke="#1B4F1B" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="28" cy="25" r="2.6" fill="#F0B429" />
    </svg>
  ),
  video: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="5" y="11" width="22" height="18" rx="3" stroke="#1B4F1B" strokeWidth="2.2" />
      <path d="M27 17l8-4v14l-8-4" stroke="#1B4F1B" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M14 16l6 4-6 4z" fill="#F0B429" />
    </svg>
  ),
  remote: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="4" y="9" width="20" height="15" rx="3" stroke="#1B4F1B" strokeWidth="2.2" />
      <path d="M11 14l5 3-5 3z" fill="#F0B429" />
      <path d="M20 30h10a4 4 0 004-4v-9a4 4 0 00-4-4" stroke="#1B4F1B" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 33l-5 3v-6" stroke="#1B4F1B" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  ),
  checklist: (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="9" y="7" width="22" height="27" rx="3" stroke="#1B4F1B" strokeWidth="2.2" />
      <rect x="15" y="4" width="10" height="6" rx="2" stroke="#1B4F1B" strokeWidth="2.2" />
      <path d="M14 21l4 4 8-8" stroke="#F0B429" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function WhyUs() {
  return (
    <section className="bg-grove-mint">
      <div className="max-w-content mx-auto px-6 py-12 md:py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-6 md:mb-10 text-ink"
          style={{ fontSize: 'clamp(26px,4vw,40px)' }}
        >
          Почему ТиЯКСа.Ремонт
        </h2>

        {/* Mobile: compact list */}
        <div className="flex flex-col md:hidden divide-y divide-[#d4e3d4]">
          {whyUsFeatures.map((f) => (
            <div key={f.title} className="flex items-start gap-4 py-4">
              <div className="shrink-0 mt-0.5 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-card">
                {icons[f.icon]}
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-ink leading-snug mb-1">{f.title}</h3>
                <p className="m-0 text-[14px] leading-[1.5] text-subtle">{f.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: card grid */}
        <div
          className="hidden md:grid gap-[22px]"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {whyUsFeatures.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-[28px] shadow-card transition-all duration-[250ms] hover:-translate-y-1"
            >
              <div className="mb-4">
                <DesktopIcon name={f.icon} />
              </div>
              <h3 className="font-bold text-[19px] text-ink mb-[10px]">{f.title}</h3>
              <p className="m-0 text-base leading-[1.55] text-subtle">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DesktopIcon({ name }: { name: string }) {
  const map: Record<string, React.ReactNode> = {
    person: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
        <circle cx="16" cy="12" r="6" stroke="#1B4F1B" strokeWidth="2" />
        <path d="M6 33c0-6 4.5-10 10-10s10 4 10 10" stroke="#1B4F1B" strokeWidth="2" strokeLinecap="round" />
        <circle cx="28.5" cy="8.5" r="3.2" fill="#F0B429" />
      </svg>
    ),
    document: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect x="9" y="5" width="22" height="30" rx="3" stroke="#1B4F1B" strokeWidth="2" />
        <path d="M14 13h9M14 19h12M14 25h8" stroke="#1B4F1B" strokeWidth="2" strokeLinecap="round" />
        <circle cx="28" cy="25" r="2.6" fill="#F0B429" />
      </svg>
    ),
    video: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect x="5" y="11" width="22" height="18" rx="3" stroke="#1B4F1B" strokeWidth="2" />
        <path d="M27 17l8-4v14l-8-4" stroke="#1B4F1B" strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 16l6 4-6 4z" fill="#F0B429" />
      </svg>
    ),
    remote: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect x="4" y="9" width="20" height="15" rx="3" stroke="#1B4F1B" strokeWidth="2" />
        <path d="M11 14l5 3-5 3z" fill="#F0B429" />
        <path d="M20 30h10a4 4 0 004-4v-9a4 4 0 00-4-4" stroke="#1B4F1B" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 33l-5 3v-6" stroke="#1B4F1B" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
    checklist: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
        <rect x="9" y="7" width="22" height="27" rx="3" stroke="#1B4F1B" strokeWidth="2" />
        <rect x="15" y="4" width="10" height="6" rx="2" stroke="#1B4F1B" strokeWidth="2" />
        <path d="M14 21l4 4 8-8" stroke="#F0B429" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return <>{map[name]}</>;
}

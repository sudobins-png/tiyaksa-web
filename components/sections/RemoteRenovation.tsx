import { GridOverlay } from '@/components/ui/GridOverlay';
import { remoteContent } from '@/data/content';

const icons: Record<string, React.ReactNode> = {
  video: (
    <svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="5" y="11" width="22" height="18" rx="3" stroke="#fff" strokeWidth="2" />
      <path d="M27 17l8-4v14l-8-4" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M14 16l6 4-6 4z" fill="#F0B429" />
    </svg>
  ),
  checklist: (
    <svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="9" y="6" width="22" height="28" rx="3" stroke="#fff" strokeWidth="2" />
      <path d="M14 20l4 4 8-8" stroke="#F0B429" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chat: (
    <svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden>
      <path d="M6 10a3 3 0 013-3h22a3 3 0 013 3v14a3 3 0 01-3 3H16l-8 6v-6H9a3 3 0 01-3-3z" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="15" cy="17" r="1.8" fill="#fff" />
      <circle cx="22" cy="17" r="1.8" fill="#F0B429" />
      <circle cx="29" cy="17" r="1.8" fill="#fff" />
    </svg>
  ),
};

export function RemoteRenovation() {
  return (
    <section className="relative overflow-hidden bg-forest">
      <GridOverlay />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          left: '-150px', bottom: '-120px',
          width: '420px', height: '420px',
          border: '2px solid rgba(255,255,255,.07)',
          borderRadius: '32px',
          transform: 'rotate(45deg)',
        }}
      />

      <div className="relative max-w-content mx-auto px-6 py-[88px]">
        <p className="font-semibold text-[15px] tracking-[.1em] uppercase text-sage mb-[22px]">
          {remoteContent.eyebrow}
        </p>
        <h2
          className="font-bold leading-[1.12] tracking-[-0.01em] text-white mb-[18px] max-w-[800px] text-balance"
          style={{ fontSize: 'clamp(28px,4vw,40px)' }}
        >
          {remoteContent.heading}
        </h2>
        <p className="text-xl text-white/80 mb-12 max-w-[640px]">{remoteContent.subtext}</p>

        <div
          className="grid gap-[26px] mb-12"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
        >
          {remoteContent.features.map((f) => (
            <div key={f.title}>
              <div className="mb-4">{icons[f.icon]}</div>
              <h3 className="font-bold text-[19px] text-white mb-1">{f.title}</h3>
              <p className="mt-2 text-base text-white/65 leading-[1.5]">{f.text}</p>
            </div>
          ))}
        </div>

        <a
          href="#cta"
          className="inline-block bg-gold hover:bg-gold-dark text-ink font-bold text-[17px] px-[30px] py-[17px] rounded-[14px] shadow-gold-glow transition-all duration-200 hover:-translate-y-0.5"
        >
          {remoteContent.cta}
        </a>
      </div>
    </section>
  );
}

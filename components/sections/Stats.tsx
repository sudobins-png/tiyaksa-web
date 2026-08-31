import { stats } from '@/data/content';

const TRACK = [...stats, ...stats, ...stats];

export function Stats() {
  return (
    <div className="bg-[#162216] overflow-hidden relative">
      {/* Edge fades to the ticker's own dark bg — not mask-image: that fades
          the element itself to transparent, revealing the page's light bg
          behind it instead of staying dark. */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#162216] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#162216] to-transparent z-10" />
      <div
        className="flex whitespace-nowrap py-[14px] motion-reduce:[animation-play-state:paused]"
        style={{ animation: 'tiyaksa-marquee var(--ticker-dur, 4s) linear infinite' }}
      >
        {TRACK.map((s, i) => (
          <span key={i} className="inline-flex items-baseline shrink-0 gap-3 px-10">
            <span className="font-extrabold text-gold text-[22px] leading-none tracking-tight">
              {s.value}
            </span>
            <span className="text-[14px] font-medium text-white/65 leading-none">
              {s.label}
            </span>
            <span className="text-white/20 text-[8px] ml-2 self-center">◆</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes tiyaksa-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        :root { --ticker-dur: 4s; }
        @media (min-width: 768px) { :root { --ticker-dur: 12s; } }
      `}</style>
    </div>
  );
}

import { stats } from '@/data/content';

const TRACK = [...stats, ...stats, ...stats];

export function Stats() {
  return (
    <div
      className="bg-forest overflow-hidden relative"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)',
      }}
    >
      <div
        className="flex whitespace-nowrap py-[14px] motion-reduce:[animation-play-state:paused]"
        style={{ animation: 'tiyaksa-marquee 55s linear infinite' }}
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
      `}</style>
    </div>
  );
}

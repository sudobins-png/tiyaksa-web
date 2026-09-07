/**
 * CSS-only "3D" discount badge — no photo asset, built from layered
 * radial gradients + inset shadows to read as an embossed coin/sphere,
 * in the site's own forest/gold/sage palette rather than a stock photo.
 */
export function PromoBadge3D() {
  return (
    <div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] mx-auto" style={{ transform: 'rotate(-4deg)' }}>
      {/* soft glow behind the badge */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(240,180,41,0.35) 0%, transparent 70%)' }}
      />
      {/* gold outer ring */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 32% 28%, #ffe08a 0%, #F0B429 45%, #b9820f 85%, #8a5f09 100%)',
          boxShadow: '0 24px 50px rgba(0,0,0,0.35), inset 0 -10px 18px rgba(0,0,0,0.3), inset 0 10px 18px rgba(255,255,255,0.45)',
        }}
      />
      {/* inner green dome */}
      <div
        className="absolute inset-[10px] sm:inset-3 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 35% 28%, #3a9440 0%, #1B4F1B 65%, #10330f 100%)',
          boxShadow: 'inset 0 -12px 22px rgba(0,0,0,0.4), inset 0 10px 18px rgba(255,255,255,0.18)',
        }}
      >
        <div className="text-center" style={{ transform: 'rotate(4deg)' }}>
          <div
            className="font-extrabold text-white leading-none"
            style={{ fontSize: 'clamp(38px,9vw,52px)', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
          >
            −12%
          </div>
          <div className="font-bold text-gold text-[12px] sm:text-[13px] tracking-[0.18em] uppercase mt-2">
            Скидка
          </div>
        </div>
      </div>
      {/* glass highlight sweep */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 30%)',
        }}
      />
    </div>
  );
}

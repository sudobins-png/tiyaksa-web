export function GridOverlay({ opacity = 0.09 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: [
          `linear-gradient(rgba(255,255,255,${opacity}) 1px, transparent 1px)`,
          `linear-gradient(90deg, rgba(255,255,255,${opacity}) 1px, transparent 1px)`,
        ].join(','),
        backgroundSize: '46px 46px',
      }}
    />
  );
}

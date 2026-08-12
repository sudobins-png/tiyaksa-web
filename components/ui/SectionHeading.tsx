import type { ReactNode } from 'react';

interface SectionHeadingProps {
  children: ReactNode;
  /** Small uppercase label above the heading. */
  eyebrow?: ReactNode;
  /** Supporting line under the heading. */
  subtitle?: ReactNode;
  /** `light` for sections sitting on the dark forest background. */
  tone?: 'dark' | 'light';
  /** Bottom margin utilities — the only spacing a section is expected to tune. */
  className?: string;
}

/**
 * The single source of truth for section headers: centred, same size ramp,
 * same rhythm. Sections should not hand-roll an <h2> — alignment drifted
 * across the site precisely because they did.
 */
export function SectionHeading({
  children,
  eyebrow,
  subtitle,
  tone = 'dark',
  className = 'mb-8 md:mb-12',
}: SectionHeadingProps) {
  const light = tone === 'light';

  return (
    <div className={`text-center ${className}`}>
      {eyebrow && (
        <p className={`m-0 mb-3 font-semibold text-[13px] md:text-[15px] tracking-[.1em] uppercase ${light ? 'text-sage' : 'text-muted'}`}>
          {eyebrow}
        </p>
      )}

      <h2
        className={`m-0 font-bold leading-[1.12] tracking-[-0.01em] text-balance ${light ? 'text-white' : 'text-ink'}`}
        style={{ fontSize: 'clamp(26px,4vw,40px)' }}
      >
        {children}
      </h2>

      {subtitle && (
        <p className={`m-0 mt-4 mx-auto max-w-[680px] text-[16px] md:text-[19px] leading-relaxed ${light ? 'text-white/80' : 'text-subtle'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

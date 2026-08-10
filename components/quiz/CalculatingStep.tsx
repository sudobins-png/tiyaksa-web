'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DURATION_MS = 2200;
const MAX_PROGRESS = 88;

export function CalculatingStep() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      // ease-out: fast start, slow end
      const t = Math.min(1, elapsed / DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 2.5);
      setProgress(Math.round(eased * MAX_PROGRESS));
      if (t < 1) requestAnimationFrame(tick);
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      key="calculating"
      initial={{ opacity: 0, x: 44 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -44 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-10 select-none"
    >
      <p className="font-extrabold text-[18px] sm:text-[22px] tracking-[.12em] uppercase text-ink mb-8 text-center">
        Подождите, идёт расчёт…
      </p>

      {/* Track */}
      <div className="w-full max-w-[420px] h-[26px] bg-[#e8ede8] rounded-full overflow-hidden">
        {/* Fill with diagonal stripes */}
        <div
          className="h-full rounded-full transition-none"
          style={{
            width: `${progress}%`,
            background: 'repeating-linear-gradient(-45deg, #7dc47d 0px, #7dc47d 12px, #9dd89d 12px, #9dd89d 24px)',
            transition: 'width 0.08s linear',
          }}
        />
      </div>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faqItems } from '@/data/faq';
import { cn } from '@/lib/utils';

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <section id="faq" className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-[860px] mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-9 text-ink"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Частые вопросы
        </h2>

        <div className="flex flex-col gap-[14px]">
          {faqItems.map((f, i) => {
            const open = openIdx === i;
            return (
              <div
                key={i}
                className={cn(
                  'rounded-[14px] overflow-hidden transition-shadow duration-200',
                  open
                    ? 'bg-white border border-[#cfe0cf] shadow-[0_4px_18px_rgba(27,79,27,.08)]'
                    : 'bg-white border border-[#eef1ee]'
                )}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 bg-transparent border-none cursor-pointer px-6 py-[22px] text-left font-[inherit]"
                  aria-expanded={open}
                >
                  <span className="font-semibold text-[18px] text-ink leading-snug">{f.q}</span>
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="flex-none text-grove"
                    aria-hidden
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="m-0 px-6 pb-6 text-base leading-[1.6] text-subtle">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

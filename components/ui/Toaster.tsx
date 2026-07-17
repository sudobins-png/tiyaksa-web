'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/stores/toastStore';

export function Toaster() {
  const { message, hide } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(hide, 5000);
    return () => clearTimeout(t);
  }, [message, hide]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 bg-ink text-white text-[15px] font-medium px-5 py-[14px] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,.22)] whitespace-nowrap pointer-events-none"
          role="status"
          aria-live="polite"
        >
          <span className="w-6 h-6 rounded-full bg-grove flex items-center justify-center shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

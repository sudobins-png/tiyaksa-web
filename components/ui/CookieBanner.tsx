'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PrivacyModal } from '@/components/ui/PrivacyModal';

const STORAGE_KEY = 'cookie_accepted';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[300] flex justify-center px-4 pb-4 sm:pb-6"
          >
            <div className="w-full max-w-[720px] bg-ink/90 backdrop-blur-sm text-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-[0_8px_32px_rgba(0,0,0,.35)]">
              <p className="text-[13px] leading-relaxed text-white/80 flex-1">
                Для улучшения работы сайта мы используем cookie (куки). Продолжая пользоваться сайтом, вы соглашаетесь с нашей{' '}
                <button
                  type="button"
                  onClick={() => setPolicyOpen(true)}
                  className="underline text-white/80 hover:text-white transition-colors bg-transparent border-none p-0 text-[13px] cursor-pointer"
                >
                  политикой обработки данных
                </button>
                .
              </p>
              <button
                type="button"
                onClick={accept}
                className="shrink-0 bg-gold hover:bg-gold-dark text-ink font-bold text-[14px] px-6 py-[10px] rounded-xl border-none cursor-pointer transition-all duration-200 hover:-translate-y-px"
              >
                Принять
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {policyOpen && <PrivacyModal onClose={() => setPolicyOpen(false)} />}
    </>
  );
}

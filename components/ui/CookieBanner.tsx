'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PrivacyModal } from '@/components/ui/PrivacyModal';
import {
  ANALYTICS_CHANGED_EVENT, ANALYTICS_SETTINGS_EVENT, ANALYTICS_STORAGE_KEY,
  getAnalyticsDecision, setAnalyticsDecision,
} from '@/lib/analytics/consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(getAnalyticsDecision() === null);
    const open = () => setVisible(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === ANALYTICS_STORAGE_KEY || event.key === null) sync();
    };
    sync();
    window.addEventListener(ANALYTICS_SETTINGS_EVENT, open);
    window.addEventListener(ANALYTICS_CHANGED_EVENT, sync);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(ANALYTICS_SETTINGS_EVENT, open);
      window.removeEventListener(ANALYTICS_CHANGED_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const choose = (decision: 'accepted' | 'rejected') => {
    setAnalyticsDecision(decision);
    setVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-[300] flex justify-center px-4 pb-4 sm:pb-6">
            <div role="region" aria-label="Настройки аналитики"
              className="w-full max-w-[820px] bg-ink/95 text-white rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,.35)]">
              <p className="m-0 text-[14px] leading-relaxed text-white/90">
                С вашего согласия Яндекс Метрика использует cookie и Вебвизор для анализа посещений сайта.{' '}
                <button type="button" onClick={() => setPolicyOpen(true)} className="underline text-white">
                  Условия обработки данных
                </button>. Можно пользоваться сайтом без аналитики и изменить выбор в подвале.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={() => choose('accepted')}
                  className="bg-gold hover:bg-gold-dark text-ink font-bold text-[14px] px-5 py-3 rounded-xl">
                  Принять
                </button>
                <button type="button" onClick={() => choose('rejected')}
                  className="bg-white text-ink hover:bg-white/90 font-bold text-[14px] px-5 py-3 rounded-xl">
                  Без аналитики
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {policyOpen && <PrivacyModal document="analytics" onClose={() => setPolicyOpen(false)} />}
    </>
  );
}

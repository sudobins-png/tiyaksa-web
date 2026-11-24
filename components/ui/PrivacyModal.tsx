'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LegalDocument, legalDocumentInfo, type LegalDocumentKind } from '@/components/legal/LegalDocument';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

export function PrivacyModal({ onClose, document = 'policy' }: { onClose: () => void; document?: LegalDocumentKind }) {
  useLockBodyScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label={legalDocumentInfo[document].title}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#eef1ee] shrink-0">
          <h2 className="font-bold text-[17px] text-ink">{legalDocumentInfo[document].title}</h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-11 h-11 rounded-full hover:bg-[#f0f4f0] flex items-center justify-center transition-colors shrink-0 ml-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707A70" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-7 py-6 text-[14px] leading-relaxed text-subtle space-y-4">
          <a href={legalDocumentInfo[document].path} target="_blank" rel="noopener noreferrer"
            className="mb-4 inline-block text-[14px] text-forest underline">Открыть отдельной страницей</a>
          <LegalDocument kind={document} />
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-[#eef1ee] shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-forest hover:bg-forest-dark text-white font-semibold text-[15px] py-3 rounded-xl transition-colors"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

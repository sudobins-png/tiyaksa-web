'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { leadSchema, type LeadValues } from '@/lib/validators/contact';
import { useToastStore } from '@/stores/toastStore';
import { getStoredUtmParams } from '@/lib/utils/utm';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { getPromoDeadline, formatPromoDate } from '@/lib/utils/promoDeadline';
import { PromoBadge3D } from '@/components/ui/PromoBadge3D';
import { PrivacyModal } from '@/components/ui/PrivacyModal';

interface PromoModalProps {
  onClose: () => void;
  source?: string;
}

export function PromoModal({ onClose, source }: PromoModalProps) {
  const [policyOpen, setPolicyOpen] = useState(false);
  const showToast = useToastStore((s) => s.show);
  const deadlineLabel = useMemo(() => formatPromoDate(getPromoDeadline()), []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
  });

  const handleClose = useCallback(onClose, [onClose]);

  useLockBodyScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const onSubmit = async (data: LeadValues) => {
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source,
          message: ['Акция -12% от прайса', data.message].filter(Boolean).join(' · '),
          ...getStoredUtmParams(),
        }),
      });
      if (!res.ok) { showToast('Ошибка отправки. Позвоните нам напрямую.'); return; }
    } catch {
      showToast('Ошибка отправки. Проверьте соединение.');
      return;
    }
    onClose();
    showToast('Заявка принята! Перезвоним сами — как правило в течение часа.');
  };

  const inputCls = 'w-full bg-white/10 border border-white/20 focus:border-gold rounded-xl px-5 py-4 text-base text-white outline-none transition-colors duration-200 placeholder:text-white/40';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-forest w-full sm:max-w-[760px] rounded-t-[24px] sm:rounded-[24px] flex flex-col sm:flex-row max-h-[92dvh] shadow-[0_20px_60px_rgba(0,0,0,.35)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} aria-label="Закрыть"
          className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Visual — first in DOM so it's the top element on the mobile
            stacked layout (grabs attention immediately), pushed to the
            right column via sm:order-last once side-by-side on desktop. */}
        <div className="flex items-center justify-center sm:order-last flex-1 bg-[#143d14] px-8 py-8 sm:py-10">
          <PromoBadge3D />
        </div>

        {/* Text + form */}
        <div className="overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-6 sm:px-8 py-8 sm:py-10 flex-1 sm:max-w-[380px] sm:order-first">
          <h2 className="font-extrabold text-[26px] sm:text-[28px] leading-tight text-white mb-3">
            До <span className="bg-gold text-ink px-2 py-0.5 rounded-md whitespace-nowrap">{deadlineLabel}</span> скидка −12% от прайса!
          </h2>
          <p className="text-[15px] leading-relaxed text-white/70 mb-6">
            Посчитаем для вас смету с учётом скидки!
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
            <input {...register('website')} type="text" autoComplete="off" tabIndex={-1} aria-hidden
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />

            <div>
              <input {...register('name')} type="text" placeholder="Ваше имя" autoComplete="name"
                className={inputCls}
                aria-invalid={!!errors.name} aria-describedby={errors.name ? 'pm-name-err' : undefined} />
              {errors.name && <p id="pm-name-err" className="mt-1 text-xs text-red-300">{errors.name.message}</p>}
            </div>

            <div>
              <input {...register('phone')} type="tel" inputMode="tel" placeholder="Ваш телефон" autoComplete="tel"
                className={inputCls}
                aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'pm-phone-err' : undefined} />
              {errors.phone && <p id="pm-phone-err" className="mt-1 text-xs text-red-300">{errors.phone.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-bold text-[17px] py-[16px] border-none rounded-[14px] cursor-pointer shadow-gold-glow transition-all duration-200 hover:-translate-y-px mt-1">
              {isSubmitting ? 'Отправляем…' : 'Хочу скидку!'}
            </button>

            <p className="text-[12px] text-white/45 leading-relaxed">
              Нажимая на кнопку «Хочу скидку!», вы соглашаетесь на{' '}
              <button type="button" onClick={() => setPolicyOpen(true)}
                className="underline hover:text-white transition-colors bg-transparent border-none p-0 text-[12px] text-white/45 cursor-pointer">
                обработку персональных данных
              </button>
            </p>
          </form>
        </div>
      </motion.div>

      {policyOpen && <PrivacyModal onClose={() => setPolicyOpen(false)} />}
    </motion.div>
  );
}

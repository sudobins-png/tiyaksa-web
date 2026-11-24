'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { leadSchema, type LeadValues } from '@/lib/validators/contact';
import { useToastStore } from '@/stores/toastStore';
import { MessengerSelector, nextContactValue, MESSENGERS, type MessengerType } from '@/components/ui/MessengerSelector';
import { getStoredUtmParams } from '@/lib/utils/utm';
import { personalDataConsentFields } from '@/lib/config/privacy';
import { PrivacyModal } from '@/components/ui/PrivacyModal';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';



interface LeadModalProps {
  onClose: () => void;
  source?: string;
}

export function LeadModal({ onClose, source }: LeadModalProps) {
  const [policyOpen,  setPolicyOpen]  = useState(false);
  const [messenger,   setMessenger]   = useState<MessengerType>('phone');
  const [contactRaw,  setContactRaw]  = useState('');
  const showToast  = useToastStore((s) => s.show);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
  });

  const handleClose = useCallback(onClose, [onClose]);

  useLockBodyScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const onContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = nextContactValue(contactRaw, e.target.value, messenger);
    setContactRaw(f);
    setValue('phone', f, { shouldValidate: true });
  };

  const onMessengerChange = (m: MessengerType) => {
    setMessenger(m);
    setContactRaw('');
    setValue('phone', '', { shouldValidate: false });
  };

  const onSubmit = async (data: LeadValues) => {
    const messengerLabel = MESSENGERS.find((m) => m.id === messenger)?.label ?? '';
    const isTelegram = messenger === 'telegram';
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phone:   !isTelegram ? data.phone : '—',
          source,
          message: [
            data.message,
            isTelegram ? `Связь: ${messengerLabel} — ${data.phone}` : `Связь: ${messengerLabel}`,
          ].filter(Boolean).join(' · '),
          ...personalDataConsentFields(),
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

  const inputCls = 'w-full bg-[#f7f9f7] border border-[#e4e9e4] focus:border-grove rounded-xl px-5 py-4 text-base outline-none transition-colors duration-200 placeholder:text-[#b0b8b0]';

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full sm:max-w-[440px] rounded-t-[24px] sm:rounded-[24px] flex flex-col max-h-[92dvh] shadow-[0_20px_60px_rgba(0,0,0,.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0 shrink-0">
          <h2 className="font-bold text-[22px] text-ink leading-snug">
            Перезвоним сами —<br className="sm:hidden" /> как правило в течение часа
          </h2>
          <button onClick={onClose} aria-label="Закрыть"
            className="ml-auto w-11 h-11 rounded-full hover:bg-[#f0f4f0] flex items-center justify-center transition-colors shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707A70" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] px-6 pb-6 pt-5 flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="ym-hide-content flex flex-col gap-4" noValidate>
            <input {...register('website')} type="text" autoComplete="off" tabIndex={-1} aria-hidden
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} className="ym-disable-keys" />

            {/* Мессенджер */}
            <div>
              <p className="text-[12px] font-semibold text-muted uppercase tracking-[.08em] mb-2">Как удобнее связаться?</p>
              <MessengerSelector value={messenger} onChange={onMessengerChange} size="sm" />
            </div>

            {/* Имя */}
            <div>
              <input {...register('name')} type="text" placeholder="Ваше имя" autoComplete="name"
                className={"ym-disable-keys " + (inputCls)}
                aria-invalid={!!errors.name} aria-describedby={errors.name ? 'lm-name-err' : undefined} />
              {errors.name && <p id="lm-name-err" className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Контакт */}
            <div>
              <input
                type={messenger === 'phone' ? 'tel' : 'text'}
                inputMode={messenger === 'phone' ? 'tel' : 'text'}
                placeholder={messenger === 'telegram' ? '@username или номер телефона' : '+7 (___) ___-__-__'}
                autoComplete={messenger === 'phone' ? 'tel' : 'off'}
                value={contactRaw}
                onChange={onContactChange}
                className={"ym-disable-keys " + (inputCls)}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'lm-phone-err' : undefined}
              />
              {errors.phone && <p id="lm-phone-err" className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Кнопка */}
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-bold text-[17px] py-[16px] border-none rounded-[14px] cursor-pointer shadow-gold-glow transition-all duration-200 hover:-translate-y-px">
              {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
            </button>

            {/* Согласие */}
            <div className="text-[12px] text-[#9aa39a] leading-relaxed">
              <span>Нажимая на кнопку «Отправить заявку», </span>
              <button type="button"
                onClick={() => setPolicyOpen(true)}
                className="underline hover:text-forest transition-colors cursor-pointer bg-transparent border-none p-0 text-[12px] text-[#9aa39a] inline">
                я даю согласие на обработку своих персональных данных
              </button>
              <span>.</span>

            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
    {policyOpen && <PrivacyModal document="consent" onClose={() => setPolicyOpen(false)} />}
    </>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useToastStore } from '@/stores/toastStore';
import {
  ACCEPT_ATTR,
  ALLOWED_LABEL,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  extensionOf,
  isAllowedExtension,
  formatBytes,
} from '@/lib/config/upload';

const schema = z.object({
  name:    z.string().min(2, 'Введите имя (минимум 2 символа)'),
  phone:   z.string().min(3, 'Введите телефон для связи'),
  message: z.string().max(700, 'Слишком длинное сообщение').optional(),
  website: z.string().optional(), // honeypot — must stay empty
});
type Values = z.infer<typeof schema>;

interface EstimateModalProps {
  onClose: () => void;
}

export function EstimateModal({ onClose }: EstimateModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const showToast = useToastStore((s) => s.show);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const handleClose = useCallback(onClose, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  // Mirrors the server's checks so the user hears about a bad file before
  // spending an upload on it. The server repeats all of this — this is
  // convenience, not a control.
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    setFileError(null);

    if (!picked) { setFile(null); return; }

    if (!isAllowedExtension(extensionOf(picked.name))) {
      setFileError(`Такой формат не принимаем. Подойдёт ${ALLOWED_LABEL}.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (picked.size > MAX_UPLOAD_BYTES) {
      setFileError(`Файл ${formatBytes(picked.size)} — это больше ${MAX_UPLOAD_LABEL}.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(picked);
  };

  const clearFile = () => {
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: Values) => {
    const payload = new FormData();
    payload.append('name', data.name);
    payload.append('phone', data.phone);
    if (data.message) payload.append('message', data.message);
    if (data.website) payload.append('website', data.website);
    if (file) payload.append('file', file);

    let res: Response;
    try {
      res = await fetch('/api/estimate', { method: 'POST', body: payload });
    } catch {
      showToast('Ошибка отправки. Проверьте соединение.');
      return;
    }

    if (!res.ok) {
      if (res.status === 413) showToast(`Файл больше ${MAX_UPLOAD_LABEL}.`);
      else if (res.status === 415) showToast('Файл не прошёл проверку. Пришлите PDF или XLSX.');
      else if (res.status === 429) showToast('Слишком много заявок. Попробуйте через несколько минут.');
      else showToast('Ошибка отправки. Позвоните нам напрямую.');
      return;
    }

    onClose();
    showToast('Смета получена! Пересчитаем и свяжемся с вами.');
  };

  const inputCls =
    'w-full bg-[#f7f9f7] border border-[#e4e9e4] focus:border-grove rounded-xl px-5 py-4 text-base outline-none transition-colors duration-200 placeholder:text-[#b0b8b0]';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full sm:max-w-[460px] rounded-t-[24px] sm:rounded-[24px] flex flex-col max-h-[92dvh] shadow-[0_20px_60px_rgba(0,0,0,.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6 shrink-0">
          <h2 className="font-bold text-[22px] text-ink leading-snug">
            Заказать расчёт сметы<br className="hidden sm:block" /> по готовому проекту
          </h2>
          <button onClick={handleClose} aria-label="Закрыть"
            className="ml-auto w-11 h-11 rounded-full hover:bg-[#f0f4f0] flex items-center justify-center transition-colors shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707A70" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 pt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <input {...register('website')} type="text" autoComplete="off" tabIndex={-1} aria-hidden
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />

            <div>
              <input {...register('name')} type="text" placeholder="Ваше имя" autoComplete="name"
                className={inputCls}
                aria-invalid={!!errors.name} aria-describedby={errors.name ? 'em-name-err' : undefined} />
              {errors.name && <p id="em-name-err" className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <input {...register('phone')} type="tel" inputMode="tel" placeholder="+7 (___) ___-__-__"
                autoComplete="tel" className={inputCls}
                aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'em-phone-err' : undefined} />
              {errors.phone && <p id="em-phone-err" className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <textarea {...register('message')} rows={3} placeholder="Ваше сообщение"
                className={`${inputCls} resize-none`}
                aria-invalid={!!errors.message} aria-describedby={errors.message ? 'em-msg-err' : undefined} />
              {errors.message && <p id="em-msg-err" className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
            </div>

            {/* File */}
            <div>
              <p className="text-[13px] text-muted mb-2">
                Файл до {MAX_UPLOAD_LABEL} — {ALLOWED_LABEL}
              </p>

              <input ref={fileInputRef} type="file" accept={ACCEPT_ATTR} onChange={onPickFile}
                id="em-file" className="sr-only" />

              {!file ? (
                <label htmlFor="em-file"
                  className="inline-flex items-center gap-2 bg-[#eef3ee] hover:bg-[#e3ebe3] text-forest font-semibold text-[15px] px-5 py-3 rounded-xl cursor-pointer transition-colors">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  Загрузить файл
                </label>
              ) : (
                <div className="flex items-center gap-3 bg-[#eef3ee] rounded-xl px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-ink truncate">{file.name}</span>
                    <span className="block text-[12px] text-muted">{formatBytes(file.size)}</span>
                  </span>
                  <button type="button" onClick={clearFile} aria-label="Убрать файл"
                    className="shrink-0 w-8 h-8 rounded-full hover:bg-white flex items-center justify-center transition-colors bg-transparent border-none cursor-pointer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#707A70" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {fileError && <p className="mt-2 text-xs text-red-500">{fileError}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-bold text-[17px] py-[16px] border-none rounded-[14px] cursor-pointer shadow-gold-glow transition-all duration-200 hover:-translate-y-px">
              {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
            </button>

            <p className="text-[12px] text-[#9aa39a] leading-relaxed m-0">
              Нажимая на кнопку «Отправить заявку», я даю согласие на обработку своих персональных данных.
            </p>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useToastStore } from '@/stores/toastStore';

/* ─── Phone formatter ─────────────────────────────────────────── */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^7/, '').replace(/^8/, '');
  const d = digits.slice(0, 10);
  if (d.length === 0) return '';
  let out = '+7';
  if (d.length > 0) out += ' (' + d.slice(0, 3);
  if (d.length >= 3) out += ') ';
  if (d.length > 3) out += d.slice(3, 6);
  if (d.length >= 6) out += '-';
  if (d.length > 6) out += d.slice(6, 8);
  if (d.length >= 8) out += '-';
  if (d.length > 8) out += d.slice(8, 10);
  return out;
}

/* ─── Step 1: тип объекта ─────────────────────────────────────── */
const OBJECT_TYPE_OPTIONS = [
  {
    label: 'Новостройка',
    icon: (
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="8" y="20" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M4 22 L24 6 L44 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="19" y="30" width="10" height="12" rx="1" fill="#F0B429" fillOpacity=".5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="26" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="29" y="26" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Вторичное жильё',
    icon: (
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="6" y="16" width="36" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 18 L24 2 L46 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="13" y="26" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="26" y="26" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="33" width="12" height="11" rx="1" fill="#F0B429" fillOpacity=".45" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Частный дом',
    icon: (
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="10" y="24" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M6 26 L24 8 L42 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="20" y="32" width="8" height="12" rx="1" fill="#F0B429" fillOpacity=".45" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13" y="28" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="37" cy="20" r="4" fill="#F0B429" fillOpacity=".3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Офис / коммерция',
    icon: (
      <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect x="8" y="10" width="32" height="34" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="16" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="28" y="16" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="26" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="28" y="26" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="19" y="34" width="10" height="10" rx="1" fill="#F0B429" fillOpacity=".45" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10 L24 4 L40 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

/* ─── Step 2: площадь ─────────────────────────────────────────── */
const AREA_OPTIONS = [
  'До 30 м²',
  '30–50 м²',
  '50–70 м²',
  '70–100 м²',
  '100–150 м²',
  '150 м² и выше',
];

/* ─── Step 3: дизайн-проект ───────────────────────────────────── */
const DESIGN_OPTIONS = [
  { label: 'Да, уже есть',           sub: 'Готов приступить к реализации' },
  { label: 'Нет, нужно разработать', sub: 'Хочу получить дизайн-проект от вас' },
  { label: 'Хочу без проекта',       sub: 'Достаточно технической документации' },
];

/* ─── Step 4: тип ремонта ─────────────────────────────────────── */
const WORK_TYPE_OPTIONS = [
  {
    label: 'Косметический',
    sub:   'Обои, покраска, полы — без сноса',
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="4" y="20" width="24" height="4" rx="2" fill="#F0B429" fillOpacity=".5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 20V8M22 20V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="8" y="4" width="16" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Капитальный',
    sub:   'Перепланировка, стяжка, коммуникации',
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="3" y="14" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 18h26M3 22h26" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 14V4h18v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="2" fill="#F0B429" fillOpacity=".7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Под ключ',
    sub:   'Полный цикл от замера до финала',
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17 18 L28 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="13" r="3" fill="#F0B429" fillOpacity=".6" />
      </svg>
    ),
  },
  {
    label: 'С дизайн-проектом',
    sub:   'Авторский стиль + реализация',
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
        <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 22 L13 14 L17 18 L20 12 L23 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="23" cy="9" r="3" fill="#F0B429" fillOpacity=".6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

/* ─── Contact form schema ─────────────────────────────────────── */
const contactSchema = z.object({
  name:    z.string().min(2, 'Введите имя'),
  phone:   z.string().min(16, 'Введите телефон полностью'),
  website: z.string().optional(),
});
type ContactValues = z.infer<typeof contactSchema>;

/* ─── Slide animation ─────────────────────────────────────────── */
const slide = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 44 : -44 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -44 : 44 }),
};

/* ─── Props ───────────────────────────────────────────────────── */
export interface QuizModalProps {
  onClose: () => void;
}

/* ════════════════════════════════════════════════════════════════ */
export function QuizModal({ onClose }: QuizModalProps) {
  const [step, setStep] = useState(0);
  const [dir, setDir]   = useState(1);
  const [aptType,   setAptType]   = useState('');
  const [area,      setArea]      = useState('');
  const [hasDesign, setHasDesign] = useState('');
  const [workType,  setWorkType]  = useState('');
  const [phoneRaw,  setPhoneRaw]  = useState('');
  const showToast = useToastStore((s) => s.show);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const handleClose = useCallback(onClose, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [handleClose]);

  const next = () => { setDir(1);  setStep((s) => s + 1); };
  const back = () => { setDir(-1); setStep((s) => s - 1); };

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = formatPhone(e.target.value);
    setPhoneRaw(f);
    setValue('phone', f, { shouldValidate: true });
  };

  const onSubmit = async (data: ContactValues) => {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:     data.name,
        phone:    data.phone,
        website:  data.website,
        source:   'quiz',
        aptType,
        workType,
        message:  [area && `Площадь: ${area}`, hasDesign && `Дизайн-проект: ${hasDesign}`]
                    .filter(Boolean).join(' · ') || undefined,
      }),
    });
    if (!res.ok) { showToast('Ошибка отправки. Позвоните нам напрямую.'); return; }
    setDir(1); setStep(5);
  };

  const TOTAL = 4;
  const progress = step >= 5 ? 100 : Math.round((step / TOTAL) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full sm:max-w-[600px] rounded-t-[24px] sm:rounded-[24px] flex flex-col max-h-[92dvh] shadow-[0_20px_60px_rgba(0,0,0,.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#f0f3f0]">
          <div className="flex items-start justify-between mb-3 gap-3">
            <p className="text-[13px] text-muted font-medium leading-snug pt-0.5">
              {step < 5 ? 'Ответьте на 4 вопроса — получите предварительный расчёт' : ' '}
            </p>
            <button onClick={handleClose} aria-label="Закрыть"
              className="w-9 h-9 rounded-full hover:bg-[#f0f4f0] flex items-center justify-center transition-colors shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707A70" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step < 5 && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[6px] bg-[#eef1ee] rounded-full overflow-hidden">
                <motion.div className="h-full bg-gold rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }} />
              </div>
              <span className="text-[13px] font-semibold text-gold shrink-0">{progress}%</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-6 min-h-0">
          <AnimatePresence mode="wait" custom={dir}>

            {/* Step 0: тип объекта — photo-card style */}
            {step === 0 && (
              <StepWrap key="s0" dir={dir}>
                <StepTitle>Где планируете ремонт?</StepTitle>
                <div className="grid grid-cols-2 gap-3">
                  {OBJECT_TYPE_OPTIONS.map((opt) => (
                    <button key={opt.label} type="button"
                      onClick={() => { setAptType(opt.label); next(); }}
                      className="flex flex-col items-center gap-3 py-6 px-4 rounded-[16px] border-2 border-[#eef1ee] bg-site hover:border-grove hover:bg-[#edf5ed] transition-all duration-150 cursor-pointer text-center group text-[#1B4F1B]">
                      <span className="group-hover:scale-110 transition-transform duration-150">{opt.icon}</span>
                      <span className="font-semibold text-[15px] text-ink">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </StepWrap>
            )}

            {/* Step 1: площадь — radio list */}
            {step === 1 && (
              <StepWrap key="s1" dir={dir}>
                <StepTitle>Примерная площадь объекта?</StepTitle>
                <div className="flex flex-col gap-2">
                  {AREA_OPTIONS.map((opt) => (
                    <RadioRow key={opt} label={opt} onClick={() => { setArea(opt); next(); }} />
                  ))}
                </div>
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {/* Step 2: дизайн-проект — radio list */}
            {step === 2 && (
              <StepWrap key="s2" dir={dir}>
                <StepTitle>Есть ли у вас готовый дизайн-проект?</StepTitle>
                <div className="flex flex-col gap-2">
                  {DESIGN_OPTIONS.map((opt) => (
                    <RadioRow key={opt.label} label={opt.label} sub={opt.sub}
                      onClick={() => { setHasDesign(opt.label); next(); }} />
                  ))}
                </div>
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {/* Step 3: тип ремонта — card grid */}
            {step === 3 && (
              <StepWrap key="s3" dir={dir}>
                <StepTitle>Какой ремонт планируете?</StepTitle>
                <div className="grid grid-cols-2 gap-3">
                  {WORK_TYPE_OPTIONS.map((opt) => (
                    <button key={opt.label} type="button"
                      onClick={() => { setWorkType(opt.label); next(); }}
                      className="flex flex-col items-start gap-2 p-4 rounded-[16px] border-2 border-[#eef1ee] bg-site hover:border-grove hover:bg-[#edf5ed] transition-all duration-150 cursor-pointer group text-[#1B4F1B]">
                      <span className="group-hover:scale-110 transition-transform duration-150">{opt.icon}</span>
                      <span className="font-bold text-[15px] text-ink">{opt.label}</span>
                      <span className="text-[12px] text-muted leading-snug">{opt.sub}</span>
                    </button>
                  ))}
                </div>
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {/* Step 4: контакты */}
            {step === 4 && (
              <StepWrap key="s4" dir={dir}>
                <StepTitle>Куда отправить расчёт?</StepTitle>
                <p className="text-[15px] text-muted mb-5 -mt-1">
                  Перезвоним в течение часа и пришлём предварительную смету.
                </p>

                {/* Summary chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {aptType   && <Chip>{aptType}</Chip>}
                  {area      && <Chip>{area}</Chip>}
                  {hasDesign && <Chip>{hasDesign}</Chip>}
                  {workType  && <Chip>{workType}</Chip>}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
                  <input {...register('website')} type="text" autoComplete="off" tabIndex={-1} aria-hidden
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />

                  <div>
                    <input {...register('name')} type="text" placeholder="Ваше имя" autoComplete="name"
                      className="w-full bg-[#f7f9f7] border border-[#e4e9e4] focus:border-grove rounded-xl px-5 py-4 text-base outline-none transition-colors placeholder:text-[#b0b8b0]"
                      aria-invalid={!!errors.name} />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>

                  <div>
                    <input type="tel" inputMode="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel"
                      value={phoneRaw} onChange={onPhoneChange}
                      className="w-full bg-[#f7f9f7] border border-[#e4e9e4] focus:border-grove rounded-xl px-5 py-4 text-base outline-none transition-colors placeholder:text-[#b0b8b0]"
                      aria-invalid={!!errors.phone} />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-bold text-[17px] py-[16px] border-none rounded-[14px] cursor-pointer shadow-gold-glow transition-all duration-200 hover:-translate-y-px">
                    {isSubmitting ? 'Отправляем…' : 'Получить расчёт →'}
                  </button>

                  <p className="text-[12px] text-[#9aa39a] text-center leading-relaxed">
                    Нажимая кнопку, вы соглашаетесь на обработку персональных данных
                  </p>
                </form>

                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {/* Step 5: success */}
            {step === 5 && (
              <StepWrap key="s5" dir={dir}>
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-[72px] h-[72px] rounded-full bg-[#eef6ee] flex items-center justify-center mb-5">
                    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden>
                      <circle cx="20" cy="20" r="20" fill="#1B4F1B" fillOpacity=".12" />
                      <path d="M10 20 L16.5 27 L30 13" stroke="#1B4F1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-[24px] text-ink mb-3">Заявка принята!</h2>
                  <p className="text-[16px] text-muted max-w-[320px] leading-relaxed">
                    Перезвоним в течение часа и пришлём предварительный расчёт стоимости ремонта.
                  </p>
                  <button type="button" onClick={handleClose}
                    className="mt-7 bg-gold hover:bg-gold-dark text-ink font-bold text-[16px] px-8 py-[14px] rounded-[14px] shadow-gold-glow transition-all duration-200 border-none cursor-pointer hover:-translate-y-px">
                    Закрыть
                  </button>
                </div>
              </StepWrap>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */
function StepWrap({ children, dir }: { children: React.ReactNode; dir: number }) {
  return (
    <motion.div custom={dir} variants={slide} initial="enter" animate="center" exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold text-[22px] text-ink mb-5">{children}</h2>
  );
}

function RadioRow({ label, sub, onClick }: { label: string; sub?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-[14px] border-2 border-[#eef1ee] bg-site hover:border-grove hover:bg-[#edf5ed] transition-all duration-150 cursor-pointer text-left group">
      <span className="w-5 h-5 rounded-full border-2 border-[#c8d4c8] group-hover:border-grove flex items-center justify-center shrink-0 transition-colors">
        <span className="w-2 h-2 rounded-full bg-transparent group-hover:bg-grove transition-colors" />
      </span>
      <div>
        <p className="font-semibold text-[15px] text-ink leading-tight">{label}</p>
        {sub && <p className="text-[12px] text-muted mt-0.5">{sub}</p>}
      </div>
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="mt-4 text-[14px] text-muted hover:text-forest transition-colors cursor-pointer bg-transparent border-none p-0">
      ← Назад
    </button>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-white border border-[#dde5dd] rounded-full px-3 py-1 text-[13px] font-medium text-forest">
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="8" fill="#1B4F1B" fillOpacity=".15" />
        <path d="M4.5 8.5 L7 11 L11.5 5" stroke="#1B4F1B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}

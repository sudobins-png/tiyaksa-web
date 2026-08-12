'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useToastStore } from '@/stores/toastStore';
import { PrivacyModal } from '@/components/ui/PrivacyModal';
import { MessengerSelector, formatContact, MESSENGERS, type MessengerType } from '@/components/ui/MessengerSelector';
import { CalculatingStep } from '@/components/quiz/CalculatingStep';

const OBJECT_TYPE_OPTIONS = [
  { label: 'Новостройка',      photo: '/quiz/novostroyka.jpg'       },
  { label: 'Вторичное жильё',  photo: '/quiz/vtorichnoe_zhilye.jpg' },
  { label: 'Загородный дом',   photo: '/quiz/zagorodniy_dom.jpg'    },
  { label: 'Офис / коммерция', photo: '/quiz/ofis.jpg'              },
  { label: 'Комната / студия', photo: '/quiz/komnata.jpg'           },
  { label: 'Кухня',            photo: '/quiz/kukhnya.jpg'           },
];

const ROOMS_OPTIONS = ['1 комната', '2 комнаты', '3 комнаты', 'Более 3-х комнат'];

const AREA_OPTIONS = [
  'До 30 м²', '30–50 м²', '50–70 м²', '70–100 м²', '100–150 м²', '150 м² и выше',
];

// TODO: replace with actual interior style photos in /public/quiz/
const STYLE_OPTIONS = [
  { label: 'Более классическим', photo: '/quiz/style-classic.jpg' },
  { label: 'Баланс',             photo: '/quiz/style-balance.jpg' },
  { label: 'Более современным',  photo: '/quiz/style-modern.jpg'  },
];

// TODO: replace with actual tone photos in /public/quiz/
const TONE_OPTIONS = [
  { label: 'Тёмные',  photo: '/quiz/tone-dark.jpg'    },
  { label: 'Баланс',  photo: '/quiz/tone-balance.jpg' },
  { label: 'Светлые', photo: '/quiz/tone-light.jpg'   },
];

const DESIGN_OPTIONS = [
  { label: 'Да, уже есть',           sub: 'Готов приступить к реализации' },
  { label: 'Нет, нужно разработать', sub: 'Хочу получить дизайн-проект от вас' },
  { label: 'Хочу без проекта',       sub: 'Достаточно технической документации' },
];

const TOTAL_STEPS = 6;

const contactSchema = z.object({
  name:    z.string().min(2, 'Введите имя'),
  contact: z.string().min(3, 'Введите контакт'),
  website: z.string().optional(),
});
type ContactValues = z.infer<typeof contactSchema>;

const slide = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 44 : -44 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -44 : 44 }),
};

export function QuizInline() {
  const router = useRouter();
  const [step,          setStep]          = useState(0);
  const [dir,           setDir]           = useState(1);
  const [aptType,       setAptType]       = useState('');
  const [rooms,         setRooms]         = useState('');
  const [area,          setArea]          = useState('');
  const [interiorStyle, setInteriorStyle] = useState('');
  const [colorTone,     setColorTone]     = useState('');
  const [hasDesign,     setHasDesign]     = useState('');
  const [calculating,   setCalculating]   = useState(false);
  const [messenger,     setMessenger]     = useState<MessengerType | null>(null);
  const [privacyOpen,   setPrivacyOpen]   = useState(false);
  const [contactRaw,    setContactRaw]    = useState('');
  const calcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => () => { if (calcTimer.current) clearTimeout(calcTimer.current); }, []);

  const startCalculating = (designValue: string) => {
    setHasDesign(designValue);
    setCalculating(true);
    calcTimer.current = setTimeout(() => {
      setCalculating(false);
      setDir(1);
      setStep(6);
    }, 2200);
  };

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const next = () => { setDir(1);  setStep((s) => s + 1); };
  const back = () => { setDir(-1); setStep((s) => s - 1); };

  const onContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatContact(e.target.value, messenger!);
    setContactRaw(formatted);
    setValue('contact', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: ContactValues) => {
    const messengerLabel = MESSENGERS.find((m) => m.id === messenger)?.label ?? '';
    const isTelegram = messenger === 'telegram';
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    data.name,
          phone:   !isTelegram ? data.contact : '—',
          website: data.website,
          source:  'quiz-page',
          aptType,
          message: [
            rooms         && `Комнат: ${rooms}`,
            area          && `Площадь: ${area}`,
            interiorStyle && `Стиль: ${interiorStyle}`,
            colorTone     && `Тона: ${colorTone}`,
            hasDesign     && `Дизайн-проект: ${hasDesign}`,
            isTelegram ? `Связь: ${messengerLabel} — ${data.contact}` : `Связь: ${messengerLabel}`,
          ].filter(Boolean).join(' · ') || undefined,
        }),
      });
      if (!res.ok) { showToast('Ошибка отправки. Позвоните нам напрямую.'); return; }
    } catch {
      showToast('Ошибка отправки. Проверьте соединение.');
      return;
    }
    setDir(1); setStep(7);
  };

  const isAnswerStep = step < TOTAL_STEPS;
  const progress = (calculating || !isAnswerStep) ? 100 : Math.round(((step + 1) / TOTAL_STEPS) * 100);

  return (
    <>
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(27,79,27,.10)] overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-5 border-b border-[#f0f3f0]">
          <div className="flex items-start justify-between mb-4 gap-3">
            <h2 className="font-bold text-[18px] sm:text-[20px] text-ink leading-tight">
              Рассчитайте стоимость ремонта
            </h2>
            <a href="/" aria-label="На главную"
              className="w-9 h-9 rounded-full hover:bg-[#f0f4f0] flex items-center justify-center transition-colors shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707A70" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </a>
          </div>

          {(isAnswerStep || calculating) && (
            <div className="flex items-center gap-3">
              {!calculating && (
                <span className="shrink-0 whitespace-nowrap text-[11px] font-bold uppercase tracking-[.1em] text-forest/70">
                  Шаг {step + 1} из {TOTAL_STEPS}
                </span>
              )}
              <div className="flex-1 h-[5px] bg-[#eef1ee] rounded-full overflow-hidden">
                <motion.div className="h-full bg-gold rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: calculating ? 2.0 : 0.35, ease: 'easeOut' }} />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 pb-8 pt-6">
          <AnimatePresence mode="wait" custom={dir}>

            {step === 0 && (
              <StepWrap key="s0" dir={dir}>
                <StepTitle>Где планируете ремонт?</StepTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {OBJECT_TYPE_OPTIONS.map((opt) => (
                    <PhotoCard key={opt.label} label={opt.label} photo={opt.photo}
                      onClick={() => { setAptType(opt.label); next(); }} />
                  ))}
                </div>
              </StepWrap>
            )}

            {step === 1 && (
              <StepWrap key="s1" dir={dir}>
                <StepTitle>Количество комнат?</StepTitle>
                <div className="flex flex-col gap-2">
                  {ROOMS_OPTIONS.map((opt) => (
                    <RadioRow key={opt} label={opt} onClick={() => { setRooms(opt); next(); }} />
                  ))}
                </div>
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {step === 2 && (
              <StepWrap key="s2" dir={dir}>
                <StepTitle>Примерная площадь объекта?</StepTitle>
                <div className="flex flex-col gap-2">
                  {AREA_OPTIONS.map((opt) => (
                    <RadioRow key={opt} label={opt} onClick={() => { setArea(opt); next(); }} />
                  ))}
                </div>
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {step === 3 && (
              <StepWrap key="s3" dir={dir}>
                <StepTitle>Каким вы хотите видеть свой интерьер?</StepTitle>
                <div className="grid grid-cols-3 gap-3">
                  {STYLE_OPTIONS.map((opt) => (
                    <PhotoCard key={opt.label} label={opt.label} photo={opt.photo}
                      onClick={() => { setInteriorStyle(opt.label); next(); }} />
                  ))}
                </div>
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {step === 4 && (
              <StepWrap key="s4" dir={dir}>
                <StepTitle>Какие тона в интерьере вы предпочитаете?</StepTitle>
                <div className="grid grid-cols-3 gap-3">
                  {TONE_OPTIONS.map((opt) => (
                    <PhotoCard key={opt.label} label={opt.label} photo={opt.photo}
                      onClick={() => { setColorTone(opt.label); next(); }} />
                  ))}
                </div>
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {step === 5 && !calculating && (
              <StepWrap key="s5" dir={dir}>
                <StepTitle>Есть ли у вас готовый дизайн-проект?</StepTitle>
                <div className="flex flex-col gap-2">
                  {DESIGN_OPTIONS.map((opt) => (
                    <RadioRow key={opt.label} label={opt.label} sub={opt.sub}
                      onClick={() => startCalculating(opt.label)} />
                  ))}
                </div>
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {calculating && <CalculatingStep key="calc" />}

            {step === 6 && (
              <StepWrap key="s6" dir={dir}>
                <StepTitle>Ваш расчёт готов!</StepTitle>
                <div className="flex flex-wrap gap-2 mb-5">
                  {aptType       && <Chip>{aptType}</Chip>}
                  {rooms         && <Chip>{rooms}</Chip>}
                  {area          && <Chip>{area}</Chip>}
                  {interiorStyle && <Chip>{interiorStyle}</Chip>}
                  {colorTone     && <Chip>{colorTone}</Chip>}
                  {hasDesign     && <Chip>{hasDesign}</Chip>}
                </div>
                <div className="mb-5">
                  <p className="text-[13px] font-bold uppercase tracking-[.08em] text-forest mb-3">
                    Куда отправить расчёт?
                  </p>
                  <MessengerSelector value={messenger}
                    onChange={(m) => { setMessenger(m); setContactRaw(''); setValue('contact', ''); }} />
                </div>
                {messenger && (
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
                      <input
                        type={messenger === 'phone' ? 'tel' : 'text'}
                        inputMode={messenger === 'phone' ? 'tel' : 'text'}
                        placeholder={messenger === 'telegram' ? '@username или номер телефона' : '+7 (___) ___-__-__'}
                        autoComplete={messenger === 'phone' ? 'tel' : 'off'}
                        value={contactRaw} onChange={onContactChange}
                        className="w-full bg-[#f7f9f7] border border-[#e4e9e4] focus:border-grove rounded-xl px-5 py-4 text-base outline-none transition-colors placeholder:text-[#b0b8b0]"
                        aria-invalid={!!errors.contact} />
                      {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact.message}</p>}
                    </div>
                    <button type="submit" disabled={isSubmitting}
                      className="w-full bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-bold text-[17px] py-[16px] border-none rounded-[14px] cursor-pointer shadow-gold-glow transition-all duration-200 hover:-translate-y-px">
                      {isSubmitting ? 'Отправляем…' : 'Получить расчёт →'}
                    </button>
                    <p className="text-[12px] text-[#9aa39a] text-center leading-relaxed">
                      Нажимая кнопку, вы соглашаетесь на{' '}
                      <button type="button" onClick={() => setPrivacyOpen(true)}
                        className="underline hover:text-forest transition-colors bg-transparent border-none p-0 text-[12px] text-[#9aa39a] cursor-pointer">
                        обработку персональных данных
                      </button>
                    </p>
                  </form>
                )}
                <BackBtn onClick={back} />
              </StepWrap>
            )}

            {step === 7 && (
              <StepWrap key="s7" dir={dir}>
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-[72px] h-[72px] rounded-full bg-[#eef6ee] flex items-center justify-center mb-5">
                    <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden>
                      <circle cx="20" cy="20" r="20" fill="#1B4F1B" fillOpacity=".12" />
                      <path d="M10 20 L16.5 27 L30 13" stroke="#1B4F1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-[24px] text-ink mb-3">Заявка принята!</h2>
                  <p className="text-[16px] text-muted max-w-[320px] leading-relaxed">
                    Перезвоним в течение часа и пришлём предварительный расчёт.
                  </p>
                  <button type="button" onClick={() => router.push('/')}
                    className="mt-7 bg-gold hover:bg-gold-dark text-ink font-bold text-[16px] px-8 py-[14px] rounded-[14px] shadow-gold-glow transition-all duration-200 border-none cursor-pointer hover:-translate-y-px">
                    На главную
                  </button>
                </div>
              </StepWrap>
            )}

          </AnimatePresence>
        </div>
      </div>

      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </>
  );
}

function StepWrap({ children, dir }: { children: React.ReactNode; dir: number }) {
  return (
    <motion.div custom={dir} variants={slide} initial="enter" animate="center" exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-bold text-[22px] text-ink mb-5">{children}</h2>;
}

function PhotoCard({ label, photo, onClick }: { label: string; photo: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex flex-col rounded-[14px] overflow-hidden border-2 border-[#eef1ee] hover:border-grove transition-all duration-150 cursor-pointer group text-left">
      <div className="relative w-full aspect-[4/3] bg-[#eef1ee]">
        <Image src={photo} alt={label} fill sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.04] transition-transform duration-200" />
      </div>
      <div className="px-3 py-2.5 bg-white group-hover:bg-[#f5faf5] transition-colors flex items-start gap-2">
        <span className="w-4 h-4 mt-[2px] rounded-full border-2 border-[#c8d4c8] group-hover:border-grove shrink-0 transition-colors flex items-center justify-center">
          <span className="w-[6px] h-[6px] rounded-full bg-transparent group-hover:bg-grove transition-colors" />
        </span>
        <span className="font-semibold text-[13px] text-ink leading-tight min-w-0">{label}</span>
      </div>
    </button>
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

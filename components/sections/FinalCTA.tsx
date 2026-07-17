'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { leadSchema, type LeadValues } from '@/lib/validators/contact';
import { calcAptTypes, calcWorkTypes } from '@/data/pricing';
import { PrivacyModal } from '@/components/ui/PrivacyModal';
import { useToastStore } from '@/stores/toastStore';

/* ── Pill ────────────────────────────────────────────────────────── */
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'font-semibold text-[15px] px-[22px] py-[13px] rounded-xl cursor-pointer transition-all duration-200 min-h-[48px] border-[1.5px]',
        active
          ? 'border-forest bg-forest text-white shadow-[0_3px_12px_rgba(27,79,27,.22)]'
          : 'border-[#d3ddd3] bg-white text-forest hover:border-forest/60'
      )}
    >
      {children}
    </button>
  );
}

/* ── Section ─────────────────────────────────────────────────────── */
export function FinalCTA() {
  const [aptType, setAptType] = useState<string>('Новостройка');
  const [workType, setWorkType] = useState<string>('Капитальный');
  const [area, setArea] = useState<number>(60);
  const [modalOpen, setModalOpen] = useState(false);
  const showToast = useToastStore((s) => s.show);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
  });
  const messageLen = watch('message')?.length ?? 0;

  const onSubmit = async (data: LeadValues) => {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, source: 'cta-form', aptType, workType, area }),
    });
    if (!res.ok) {
      showToast('Ошибка отправки. Позвоните нам напрямую.');
      return;
    }
    reset();
    showToast('Заявка принята! Перезвоним в течение часа.');
  };

  return (
    <section id="cta" className="bg-grove-mint">
      <div className="max-w-[760px] mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] text-forest text-center mb-3"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Обсудим ваш объект
        </h2>
        <p className="text-[19px] text-subtle text-center mb-10">
          Расскажите о квартире — получите смету и ответы на вопросы.
        </p>

        <div className="bg-white rounded-[20px] shadow-[0_6px_30px_rgba(27,79,27,.1)]" style={{ padding: 'clamp(24px,4vw,40px)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7" noValidate>
            {/* Honeypot */}
            <input {...register('website')} type="text" autoComplete="off" tabIndex={-1} aria-hidden style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />

              {/* Тип квартиры */}
              <div>
                <p className="font-semibold text-[13px] tracking-[.1em] uppercase text-grove mb-[12px]">Тип квартиры</p>
                <div className="grid grid-cols-2 gap-3">
                  {calcAptTypes.map((t) => (
                    <Pill key={t} active={aptType === t} onClick={() => setAptType(t)}>{t}</Pill>
                  ))}
                </div>
              </div>

              {/* Площадь */}
              <div>
                <div className="flex justify-between items-end mb-4 flex-wrap gap-2">
                  <p className="font-semibold text-[13px] tracking-[.1em] uppercase text-grove">Площадь</p>
                  <div className="flex items-baseline gap-1.5">
                    <input
                      type="number" min={20} max={200} value={area}
                      onChange={(e) => setArea(Math.max(20, Math.min(200, Number(e.target.value) || 20)))}
                      className="w-20 font-extrabold text-[28px] text-forest border-0 border-b-2 border-[#dbe4db] text-right outline-none p-0 px-1 bg-transparent"
                      aria-label="Площадь в квадратных метрах"
                    />
                    <span className="font-bold text-lg text-muted">м²</span>
                  </div>
                </div>
                <input
                  type="range" min={20} max={200} step={1} value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  aria-label="Ползунок площади" className="mb-1"
                />
                <div className="flex justify-between text-[13px] text-[#9aa39a]">
                  <span>20 м²</span><span>200 м²</span>
                </div>
              </div>

              {/* Вид работ */}
              <div>
                <p className="font-semibold text-[13px] tracking-[.1em] uppercase text-grove mb-[12px]">Вид работ</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {calcWorkTypes.map((t) => (
                    <Pill key={t} active={workType === t} onClick={() => setWorkType(t)}>{t}</Pill>
                  ))}
                </div>
              </div>

              {/* Имя + телефон */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[160px]">
                  <input
                    {...register('name')} type="text" placeholder="Ваше имя"
                    className="w-full bg-site border border-[#e4e9e4] focus:border-grove rounded-xl px-[18px] py-4 text-base outline-none transition-colors duration-200"
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cta-name-err' : undefined}
                  />
                  {errors.name && <p id="cta-name-err" className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="flex-1 min-w-[160px]">
                  <input
                    {...register('phone')} type="tel" placeholder="Телефон"
                    className="w-full bg-site border border-[#e4e9e4] focus:border-grove rounded-xl px-[18px] py-4 text-base outline-none transition-colors duration-200"
                    aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'cta-phone-err' : undefined}
                  />
                  {errors.phone && <p id="cta-phone-err" className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Комментарий */}
              <div>
                <textarea
                  {...register('message')}
                  placeholder="Опишите ваш запрос — получите предварительную смету и ответы на вопросы."
                  maxLength={1500}
                  rows={4}
                  className="w-full bg-site border border-[#e4e9e4] focus:border-grove rounded-xl px-[18px] py-4 text-base outline-none transition-colors duration-200 resize-none placeholder:text-[#b0b8b0]"
                />
                <p className={cn('mt-1 text-right text-[12px] tabular-nums', messageLen > 1400 ? 'text-amber-500' : 'text-[#b0b8b0]')}>
                  {messageLen} / 1500
                </p>
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="bg-gold hover:bg-gold-dark disabled:opacity-60 text-ink font-bold text-[17px] py-[17px] border-none rounded-[14px] cursor-pointer shadow-gold-glow transition-all duration-200 hover:-translate-y-px"
              >
                {isSubmitting ? 'Отправляем…' : 'Рассчитать ремонт'}
              </button>

              <p className="text-[13px] text-[#9aa39a] text-center -mt-3">
                Нажимая на кнопку «Рассчитать ремонт», я{' '}
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="underline hover:text-forest transition-colors cursor-pointer bg-transparent border-none p-0 text-[13px] text-[#9aa39a]"
                >
                  даю согласие на обработку своих персональных данных
                </button>
                .
              </p>
          </form>
        </div>
      </div>

      {modalOpen && <PrivacyModal onClose={() => setModalOpen(false)} />}
    </section>
  );
}

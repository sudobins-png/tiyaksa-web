'use client';

import { useState } from 'react';
import { PrivacyModal } from '@/components/ui/PrivacyModal';
import { useToastStore } from '@/stores/toastStore';
import { LEAD_SOURCES } from '@/lib/config/leadSources';
import { getStoredUtmParams } from '@/lib/utils/utm';
import type { OfferDraft } from '@/lib/assistant/types';

interface OfferCardProps {
  offer: OfferDraft;
  sent: boolean;
  onSent: () => void;
}

function contactLooksValid(value: string): boolean {
  const v = value.trim();
  return v.replace(/\D/g, '').length >= 10 || /^@[A-Za-z0-9_]{4,}$/.test(v);
}

const inputClass =
  'w-full bg-[#f7f9f7] border border-[#e4e9e4] focus:border-grove rounded-xl px-4 py-3 text-base outline-none transition-colors placeholder:text-[#b0b8b0]';

export function OfferCard({ offer, sent, onSent }: OfferCardProps) {
  const showToast = useToastStore((s) => s.show);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const nameError = touched && name.trim().length < 2;
  const contactError = touched && !contactLooksValid(contact);

  const chips = [offer.aptType, offer.rooms, offer.area, offer.repairType, offer.hasDesign && `Дизайн-проект: ${offer.hasDesign.toLowerCase()}`]
    .filter(Boolean) as string[];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (name.trim().length < 2 || !contactLooksValid(contact) || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: contact.trim(),
          website: honeypot,
          source: LEAD_SOURCES.assistant,
          fromQuiz: true,
          aptType: offer.aptType,
          area: offer.area,
          rooms: offer.rooms,
          interiorStyle: offer.interiorStyle,
          colorTone: offer.colorTone,
          hasDesign: offer.hasDesign,
          message: [
            `Чат-ассистент: ${offer.summary}`,
            offer.repairType && `Интересует: ${offer.repairType}`,
            offer.rooms && `Комнат: ${offer.rooms}`,
            offer.interiorStyle && `Стиль: ${offer.interiorStyle}`,
            offer.colorTone && `Тона: ${offer.colorTone}`,
            offer.hasDesign && `Дизайн-проект: ${offer.hasDesign}`,
          ]
            .filter(Boolean)
            .join(' · '),
          ...getStoredUtmParams(),
        }),
      });
      if (!res.ok) {
        showToast('Ошибка отправки. Позвоните нам напрямую.');
        return;
      }
      onSent();
    } catch {
      showToast('Ошибка отправки. Проверьте соединение.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-2 rounded-2xl border border-[#dbe9db] bg-[#eef6ee] px-4 py-4 text-center">
        <p className="m-0 text-[15px] font-bold text-forest">Заявка принята</p>
        <p className="m-0 mt-1 text-[14px] leading-snug text-subtle">
          Перезвоним в течение часа и пришлём персональный расчёт.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={submit} noValidate className="mt-2 rounded-2xl border border-[#e4e9e4] bg-white p-4 shadow-card">
        <p className="m-0 text-[13px] font-bold uppercase tracking-[.08em] text-forest">Персональный расчёт</p>
        {chips.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <span key={chip} className="rounded-full bg-grove-mint px-2.5 py-1 text-[12px] font-medium text-forest">
                {chip}
              </span>
            ))}
          </div>
        )}

        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        />

        <div className="mt-3 flex flex-col gap-2.5">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              autoComplete="name"
              aria-invalid={nameError}
              className={inputClass}
            />
            {nameError && <p className="m-0 mt-1 text-xs text-red-500">Введите имя</p>}
          </div>
          <div>
            <input
              type="text"
              inputMode="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Телефон или @telegram"
              autoComplete="tel"
              aria-invalid={contactError}
              className={inputClass}
            />
            {contactError && <p className="m-0 mt-1 text-xs text-red-500">Укажите телефон или @имя в Telegram</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full cursor-pointer rounded-xl border-none bg-gold py-3 text-[16px] font-bold text-ink transition-all duration-200 hover:-translate-y-px hover:bg-gold-dark disabled:opacity-60"
          >
            {submitting ? 'Отправляем…' : 'Получить расчёт →'}
          </button>
          <p className="m-0 text-center text-[12px] leading-relaxed text-[#9aa39a]">
            Нажимая на кнопку, вы соглашаетесь на{' '}
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="cursor-pointer border-none bg-transparent p-0 text-[12px] text-[#9aa39a] underline transition-colors hover:text-forest"
            >
              обработку персональных данных
            </button>
          </p>
        </div>
      </form>
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </>
  );
}

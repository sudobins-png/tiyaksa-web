'use client';

import { useState } from 'react';
import { PrivacyModal } from '@/components/ui/PrivacyModal';
import { managerInfo, siteConfig } from '@/data/content';
import { buildTelegramHandoffUrl } from '@/lib/assistant/format';
import {
  MANAGER_TELEGRAM,
  type AssistantPreferences,
  type ChatMessage,
  type HandoffDraft,
} from '@/lib/assistant/types';
import { getStoredUtmParams } from '@/lib/utils/utm';

interface HandoffCardProps {
  draft: HandoffDraft;
  history: ChatMessage[];
  prefs: AssistantPreferences;
  sent: boolean;
  onSent: () => void;
}

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.9 4.3 18.6 19.6c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 12.1 1.1 10.6c-1.1-.3-1.1-1 .2-1.5L20.4 1.7c.9-.3 1.7.2 1.5 2.6Z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
    </svg>
  );
}

export function HandoffCard({ draft, history, prefs, sent, onSent }: HandoffCardProps) {
  const [contact, setContact] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [failed, setFailed] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const telegramUrl = buildTelegramHandoffUrl(draft.summary, prefs, history);

  // Runs from the link's own onClick, so the browser still follows the link
  // (opening Telegram or the dialer) — this only delivers the briefing.
  const deliver = () => {
    if (sent) return;
    onSent();
    void fetch('/api/handoff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        messages: history.slice(-40),
        preferences: prefs,
        reason: draft.reason,
        summary: draft.summary,
        contact: contact.trim() || undefined,
        website: honeypot,
        consent: true,
        ...getStoredUtmParams(),
      }),
    })
      .then((res) => {
        if (!res.ok) setFailed(true);
      })
      .catch(() => setFailed(true));
  };

  if (sent) {
    return (
      <div className="assistant-in mt-2 rounded-2xl border border-[#dbe9db] bg-[#eef6ee] px-4 py-4">
        <p className="m-0 text-[15px] font-bold text-forest">
          {failed ? 'Откройте чат с Львом' : `История передана — ${managerInfo.name} в курсе`}
        </p>
        <p className="m-0 mt-1 text-[14px] leading-snug text-subtle">
          {failed
            ? 'Автоматически передать переписку не получилось, но краткое содержание уже в сообщении для Telegram.'
            : 'Если Telegram не открылся, нажмите на ссылку ниже или позвоните.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px] font-bold">
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="text-forest underline">
            @{MANAGER_TELEGRAM}
          </a>
          <a href={siteConfig.phoneHref} className="text-forest underline">
            {siteConfig.phone}
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="assistant-in mt-2 rounded-2xl border border-[#e4e9e4] bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-[18px] font-extrabold text-white" aria-hidden>
            {managerInfo.name[0]}
          </span>
          <div className="min-w-0">
            <p className="m-0 text-[16px] font-extrabold leading-tight text-ink">{managerInfo.name}</p>
            <p className="m-0 text-[13px] leading-tight text-muted">{managerInfo.title}</p>
          </div>
        </div>
        <p className="m-0 mt-3 text-[14px] leading-snug text-subtle">
          Передам ему историю этой переписки, повторять ничего не придётся.
        </p>

        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          aria-hidden
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        />
        <input
          type="text"
          inputMode="tel"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Телефон или @telegram — по желанию"
          autoComplete="off"
          aria-label="Ваш контакт, чтобы менеджер мог написать первым (необязательно)"
          className="mt-3 w-full rounded-xl border border-[#e4e9e4] bg-[#f7f9f7] px-4 py-3 text-base outline-none transition-colors placeholder:text-[#b0b8b0] focus:border-grove"
        />

        <div className="mt-3 flex flex-col gap-2">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={deliver}
            className="flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-[15px] font-bold text-ink no-underline transition-all duration-200 hover:-translate-y-px hover:bg-gold-dark"
          >
            <TelegramIcon />
            Написать в Telegram @{MANAGER_TELEGRAM}
          </a>
          <a
            href={siteConfig.phoneHref}
            onClick={deliver}
            className="flex items-center justify-center gap-2 rounded-xl border border-forest/25 bg-white px-4 py-3 text-[15px] font-bold text-forest no-underline transition-colors hover:bg-grove-mint"
          >
            <PhoneIcon />
            Позвонить {siteConfig.phone}
          </a>
        </div>

        <p className="m-0 mt-3 text-center text-[12px] leading-relaxed text-[#9aa39a]">
          Нажимая кнопку, вы передаёте менеджеру историю чата и соглашаетесь на{' '}
          <button
            type="button"
            onClick={() => setPrivacyOpen(true)}
            className="cursor-pointer border-none bg-transparent p-0 text-[12px] text-[#9aa39a] underline transition-colors hover:text-forest"
          >
            обработку персональных данных
          </button>
        </p>
      </div>
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
    </>
  );
}

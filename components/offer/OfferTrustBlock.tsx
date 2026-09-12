'use client';

import { useEffect, useState } from 'react';
import { GridOverlay } from '@/components/ui/GridOverlay';
import { useToastStore } from '@/stores/toastStore';

const DEADLINE_KEY_PREFIX = 'tiyaksa_offer_deadline_';
const DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Persists the deadline in localStorage on first view so refreshing (or
 * coming back tomorrow) doesn't quietly reset the visitor's own 24h window —
 * "24 hours from when the page was opened" means the first time *they*
 * opened it, not every reload.
 */
function useOfferCountdown(offerId: string): number {
  const [remaining, setRemaining] = useState<number>(DURATION_MS);

  useEffect(() => {
    const key = DEADLINE_KEY_PREFIX + offerId;
    let deadline: number;
    try {
      const stored = localStorage.getItem(key);
      deadline = stored ? Number(stored) : Date.now() + DURATION_MS;
      if (!stored) localStorage.setItem(key, String(deadline));
    } catch {
      deadline = Date.now() + DURATION_MS; // private mode / storage disabled
    }

    const tick = () => setRemaining(Math.max(0, deadline - Date.now()));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [offerId]);

  return remaining;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return [
    Math.floor(totalSeconds / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60,
  ].map(pad).join(':');
}

interface OfferTrustBlockProps {
  offerId: string;
  promoCode: string;
}

export function OfferTrustBlock({ offerId, promoCode }: OfferTrustBlockProps) {
  const remaining = useOfferCountdown(offerId);
  const showToast = useToastStore((s) => s.show);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      showToast('Промокод скопирован');
    } catch {
      showToast('Не удалось скопировать — введите промокод вручную');
    }
  };

  return (
    <section className="relative overflow-hidden bg-forest">
      <GridOverlay />
      <div className="relative max-w-[680px] mx-auto px-6 py-14 md:py-[88px] text-center">
        <p className="m-0 mb-2 text-[13px] font-semibold uppercase tracking-[.1em] text-sage">
          Успейте закрепить скидку −12%
        </p>
        <p
          className="m-0 mb-6 font-extrabold text-white tabular-nums"
          style={{ fontSize: 'clamp(32px,6vw,48px)' }}
          aria-live="polite"
        >
          {remaining > 0 ? formatDuration(remaining) : '00:00:00'}
        </p>

        <p className="m-0 mb-7 text-[16px] md:text-[18px] leading-relaxed text-white/80">
          Чтобы закрепить скидку −12% и зафиксировать окончательную цену, оставьте заявку на замер —
          позвоните, напишите в Telegram или MAX управляющему, который отправил вам этот расчёт.
        </p>

        <div className="inline-flex items-center gap-3 flex-wrap justify-center bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
          <span className="text-white/60 text-[13px] uppercase tracking-[.08em] font-semibold">
            Промокод
          </span>
          <span className="font-extrabold text-[20px] text-gold tracking-wide">{promoCode}</span>
          <button
            type="button"
            onClick={copyCode}
            className="bg-gold hover:bg-gold-dark text-ink font-bold text-[14px] px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer border-none"
          >
            Скопировать промокод
          </button>
        </div>
      </div>
    </section>
  );
}

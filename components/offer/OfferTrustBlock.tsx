'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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

interface OfferTrustBlockProps {
  offerId: string;
  promoCode: string;
}

export function OfferTrustBlock({ offerId, promoCode }: OfferTrustBlockProps) {
  const remaining = useOfferCountdown(offerId);
  const showToast = useToastStore((s) => s.show);
  const shouldReduceMotion = useReducedMotion();

  const totalSeconds = Math.floor(Math.max(0, remaining) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      showToast('Промокод скопирован');
    } catch {
      showToast('Не удалось скопировать — введите промокод вручную');
    }
  };

  return (
    <section className="bg-site">
      <ScrollCue />

      <div className="max-w-[680px] mx-auto px-6 pb-14 md:pb-[88px] text-center">
        <p className="m-0 mb-3 text-[13px] font-semibold uppercase tracking-[.1em] text-muted">
          Успейте закрепить скидку −12%
        </p>
        <h2 className="m-0 mb-7 font-extrabold text-ink tracking-tight" style={{ fontSize: 'clamp(24px,4vw,32px)' }}>
          Скидка действует ограниченное время
        </h2>

        <div className="relative flex items-center justify-center gap-3 sm:gap-4 mb-8" aria-live="polite">
          {/* Soft ambient glow behind the timer — decorative, GPU-cheap
              (opacity only), gated behind motion-safe so it never runs for
              visitors who've asked for reduced motion. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 motion-safe:animate-pulse"
            style={{
              background: 'radial-gradient(closest-side, rgba(240,180,41,.25), transparent)',
              filter: 'blur(20px)',
            }}
          />
          <TimeUnit value={hours} label="часов" />
          <Colon />
          <TimeUnit value={minutes} label="минут" />
          <Colon />
          {/* Only the seconds unit animates on every tick — flipping all
              three every second read as busy rather than alive. */}
          <TimeUnit value={seconds} label="секунд" animated />
        </div>

        <p className="m-0 mb-7 text-[16px] md:text-[18px] leading-relaxed text-subtle">
          Чтобы закрепить скидку −12% и зафиксировать окончательную цену, оставьте заявку на замер —
          позвоните, напишите в Telegram или MAX управляющему, который отправил вам этот расчёт.
        </p>

        <div className="inline-flex items-center gap-3 flex-wrap justify-center bg-white border border-[#eef1ee] shadow-card rounded-2xl px-5 py-4">
          <span className="text-muted text-[13px] uppercase tracking-[.08em] font-semibold">
            Промокод
          </span>
          <span className="font-extrabold text-[20px] text-forest tracking-wide">{promoCode}</span>
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

/** Replaces a hard border between the price cards and this section with a
 *  minimal, gently bobbing "scroll down" cue instead of a static line. */
function ScrollCue() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex justify-center pt-8 pb-2 md:pt-10" aria-hidden>
      <motion.div
        className="w-10 h-10 rounded-full border border-[#dfe4df] bg-white shadow-card flex items-center justify-center text-forest"
        animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}
        transition={shouldReduceMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.div>
    </div>
  );
}

function Colon() {
  return (
    <span className="font-extrabold text-forest/40 self-start mt-2 sm:mt-3" style={{ fontSize: 'clamp(24px,4vw,36px)' }}>
      :
    </span>
  );
}

function TimeUnit({ value, label, animated = false }: { value: number; label: string; animated?: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const display = String(value).padStart(2, '0');
  const digitStyle = { fontSize: 'clamp(22px,4vw,32px)' } as const;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[64px] h-[64px] sm:w-[84px] sm:h-[84px] rounded-2xl bg-forest shadow-[0_8px_24px_rgba(27,79,27,.25)] overflow-hidden">
        {animated && !shouldReduceMotion ? (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={display}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center font-extrabold text-white tabular-nums"
              style={digitStyle}
            >
              {display}
            </motion.span>
          </AnimatePresence>
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center font-extrabold text-white tabular-nums"
            style={digitStyle}
          >
            {display}
          </span>
        )}
      </div>
      <span className="text-[11px] uppercase tracking-[.08em] text-muted font-semibold">{label}</span>
    </div>
  );
}

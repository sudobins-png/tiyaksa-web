'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { pricingTiers, type PricingTier } from '@/data/pricing';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadModal } from '@/components/ui/LeadModal';

const SHOW_LIMIT = 5;

function PricingCard({ tier, featured = false, onCta }: { tier: PricingTier; featured?: boolean; onCta: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = tier.features.length > SHOW_LIMIT;
  const always = tier.features.slice(0, SHOW_LIMIT);
  const hidden = tier.features.slice(SHOW_LIMIT);

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden flex flex-col',
        featured
          ? 'shadow-card-featured ring-2 ring-forest/20 -translate-y-1.5'
          : 'shadow-card hover:-translate-y-1 hover:shadow-card-hover transition-all duration-[250ms] bg-white'
      )}
    >
      {/* Header */}
      <div className={cn('px-7 pt-7 pb-6', featured ? 'bg-forest' : 'bg-white border-b border-[#eef1ee]')}>
        {featured && (
          <span className="inline-block bg-gold text-ink font-bold text-xs tracking-[.05em] uppercase px-3 py-[5px] rounded-lg mb-4">
            Популярный
          </span>
        )}
        <h3 className={cn('font-bold text-[22px] mb-2', featured ? 'text-white' : 'text-ink')}>
          {tier.name}
        </h3>
        <p className={cn('text-[14px] leading-relaxed', featured ? 'text-white/70' : 'text-muted')}>
          {tier.description}
        </p>
      </div>

      {/* Feature list */}
      <div className={cn('px-7 py-5 flex-1', featured ? 'bg-forest' : 'bg-white')}>
        <div className={cn('rounded-xl p-4', featured ? 'bg-white/10' : 'bg-[#f4f7f4]')}>
          <ul className="list-none m-0 p-0 flex flex-col gap-[10px]">
            {always.map((f) => (
              <li key={f} className={cn('flex gap-[10px] text-[14px] leading-snug', featured ? 'text-white/90' : 'text-ink')}>
                <span className={cn('mt-[3px] shrink-0 font-bold', featured ? 'text-gold' : 'text-grove')}>·</span>
                {f}
              </li>
            ))}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="extra"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden flex flex-col gap-[10px]"
                >
                  {hidden.map((f) => (
                    <li key={f} className={cn('flex gap-[10px] text-[14px] leading-snug pt-[10px]', featured ? 'text-white/90' : 'text-ink')}>
                      <span className={cn('mt-[3px] shrink-0 font-bold', featured ? 'text-gold' : 'text-grove')}>·</span>
                      {f}
                    </li>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </ul>

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className={cn(
                'mt-4 flex items-center gap-1.5 text-[13px] font-semibold transition-colors',
                featured ? 'text-white/70 hover:text-white' : 'text-grove hover:text-forest'
              )}
            >
              {expanded ? 'Скрыть' : `Показать все (${tier.features.length})`}
              <motion.svg
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            </button>
          )}
        </div>
      </div>

      {/* Footer: срок + цена + кнопка */}
      <div className={cn('px-7 pb-7 pt-4', featured ? 'bg-forest' : 'bg-white')}>
        <p className={cn('text-[14px] text-center mb-1', featured ? 'text-white/60' : 'text-muted')}>
          {tier.term}
        </p>
        <p className={cn('font-extrabold tracking-[-0.02em] text-center mb-5', featured ? 'text-white' : 'text-forest')}
          style={{ fontSize: '28px' }}>
          от {tier.priceFrom}{' '}
          <span className={cn('text-[16px] font-semibold', featured ? 'text-white/60' : 'text-muted')}>
            {tier.priceUnit}
          </span>
        </p>
        <button
          type="button"
          onClick={onCta}
          className={cn(
            'w-full block text-center font-bold text-base py-[15px] rounded-xl transition-all duration-200 hover:-translate-y-px cursor-pointer',
            featured
              ? 'bg-gold hover:bg-gold-dark text-ink shadow-[0_3px_14px_rgba(240,180,41,.3)] border-none'
              : 'border-[1.5px] border-forest text-forest hover:bg-gold hover:border-gold hover:text-ink'
          )}
        >
          Уточнить смету
        </button>
      </div>
    </div>
  );
}

export function Pricing() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="prices" className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-[88px]">
        <h2
          className="font-bold tracking-[-0.01em] mb-10 text-ink"
          style={{ fontSize: 'clamp(30px,4vw,40px)' }}
        >
          Стоимость ремонта
        </h2>

        <div
          className="grid gap-6 items-start"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} featured={tier.featured} onCta={() => setModalOpen(true)} />
          ))}
        </div>

        <p className="mt-7 text-muted text-[15px]">Точная стоимость — после бесплатного замера.</p>
      </div>

      {modalOpen && <LeadModal onClose={() => setModalOpen(false)} source="pricing" />}
    </section>
  );
}

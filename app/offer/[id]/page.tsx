import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogHeader } from '@/components/sections/BlogHeader';
import { Footer } from '@/components/sections/Footer';
import { Stats } from '@/components/sections/Stats';
import { OfferTrustBlock } from '@/components/offer/OfferTrustBlock';
import { getOffer } from '@/lib/server/offers';
import { computeOfferPricing, type OfferPriceTier } from '@/lib/utils/offerPricing';
import { buildOfferSummaryLine } from '@/lib/utils/offerSummary';
import { formatMoney } from '@/lib/utils';
import { getPromoDeadline, formatPromoDate } from '@/lib/utils/promoDeadline';

interface PageProps {
  params: { id: string };
}

// Personal, unlisted pages generated per lead — never meant to be found by
// search or crawled (see app/robots.ts's matching disallow entry).
export const metadata: Metadata = {
  title: 'Ваш расчёт стоимости ремонта — ТиЯКСа.Ремонт',
  robots: { index: false, follow: false },
};

export default async function OfferPage({ params }: PageProps) {
  const offer = await getOffer(params.id);
  if (!offer) notFound();

  const tiers = computeOfferPricing(offer.area, offer.aptType);
  const summary = buildOfferSummaryLine(offer);
  const deadlineLabel = formatPromoDate(getPromoDeadline());

  return (
    <>
      <BlogHeader />

      <div style={{ paddingTop: '71px' }}>
        <Stats />
      </div>

      <main className="min-h-dvh bg-site">
        <div className="max-w-content mx-auto px-6 py-14 lg:py-20 text-center">
          <p className="m-0 mb-3 text-[13px] font-semibold uppercase tracking-[.1em] text-muted">
            Персональный расчёт
          </p>
          <h1 className="m-0 mb-4 font-extrabold text-[28px] sm:text-[40px] text-ink tracking-tight leading-tight">
            Ваш расчёт стоимости ремонта готов
          </h1>
          <p className="m-0 text-[16px] text-subtle max-w-[620px] mx-auto">{summary}</p>
        </div>

        <div className="max-w-content mx-auto px-6 pb-14 lg:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <PriceCard key={tier.name} tier={tier} deadlineLabel={deadlineLabel} />
            ))}
          </div>
        </div>
      </main>

      <OfferTrustBlock offerId={offer.id} promoCode={offer.promoCode} />

      <Footer />
    </>
  );
}

function PriceCard({ tier, deadlineLabel }: { tier: OfferPriceTier; deadlineLabel: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-7 flex flex-col">
      <h2 className="m-0 mb-1 font-bold text-[20px] text-ink">{tier.name}</h2>
      <p className="m-0 mb-5 text-[13px] text-muted">{tier.term}</p>

      <p className="m-0 mb-1 text-[15px] text-muted line-through whitespace-nowrap">
        от {formatMoney(tier.low)} до {formatMoney(tier.high)}
      </p>
      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
        <span className="inline-flex items-center bg-gold text-ink text-[12px] font-bold px-2 py-0.5 rounded-md shrink-0">
          −12%
        </span>
        <p className="m-0 font-extrabold text-[21px] text-sage whitespace-nowrap">
          от {formatMoney(tier.discountedLow)} до {formatMoney(tier.discountedHigh)}
        </p>
      </div>

      <p className="m-0 mt-auto pt-3 text-[12px] text-muted">Скидка действует до {deadlineLabel}</p>
    </div>
  );
}

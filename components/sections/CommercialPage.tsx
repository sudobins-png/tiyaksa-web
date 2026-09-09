import type { ReactNode } from 'react';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { Stats } from '@/components/sections/Stats';
import { WhyUs } from '@/components/sections/WhyUs';
import { Manager } from '@/components/sections/Manager';
import { Reviews } from '@/components/sections/Reviews';
import { EstimateAudit } from '@/components/sections/EstimateAudit';
import { Contacts } from '@/components/sections/Contacts';
import { SegmentCase, type SegmentCaseItem } from '@/components/sections/SegmentCase';
import { QuizSection } from '@/components/sections/QuizSection';
import { FAQ } from '@/components/sections/FAQ';
import { ServiceJsonLd } from '@/components/seo/ServiceJsonLd';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';
import type { LeadSource } from '@/lib/config/leadSources';

interface FaqItem {
  q: string;
  a: string;
}

interface SegmentCaseProps {
  heading: string;
  subtitle: string;
  item: SegmentCaseItem;
  eyebrow?: string;
}

interface CommercialPageProps {
  path: string;
  h1: string;
  serviceName: string;
  serviceDescription: string;
  /** Article body — plain <h2>/<p>/<ul> markup, styled via .article-content. */
  children: ReactNode;
  segmentCase: SegmentCaseProps;
  calculatorHeading: string;
  calculatorSource: LeadSource;
  faqItems: readonly FaqItem[];
}

/**
 * Shared shell for the commercial SEO landing pages (/remont-*-spb) — same
 * full anatomy as the homepage (stats ribbon, trust cards, a segment case,
 * manager, reviews), reusing those exact components, so the pages read as
 * proper landing pages rather than bare articles. Only the article body
 * (`children`) and the case (`segmentCase`) differ per page — everything
 * else is the same trust content the homepage already carries.
 */
export function CommercialPage({
  path,
  h1,
  serviceName,
  serviceDescription,
  children,
  segmentCase,
  calculatorHeading,
  calculatorSource,
  faqItems,
}: CommercialPageProps) {
  return (
    <>
      <Header />

      {/* Directly under the fixed header, ahead of the H1 — its own top
          offset since it's a sibling of <main>, not inside it. */}
      <div style={{ paddingTop: '71px' }}>
        <Stats />
      </div>

      <ServiceJsonLd name={serviceName} description={serviceDescription} url={path} />
      <FaqJsonLd items={faqItems} />

      <main className="min-h-dvh bg-site">
        {/* Same max-w-content mx-auto container and centred heading style as
            every other section (e.g. WhyUs's "Почему ТиЯКСа.Ремонт") —
            centered, not narrowed into its own left-hugging column. */}
        {/* pb-14 on mobile matches the old py-14 there; lg:pb-0 removes the
            doubled gap on desktop, where this stacked with SegmentCase's own
            top padding (lg:py-20 + md:py-[88px] ≈ 168px of dead space). */}
        <div className="max-w-content mx-auto px-6 pt-14 lg:pt-20 pb-14 lg:pb-0 text-center">
          <h1 className="m-0 mb-10 lg:mb-12 font-extrabold text-[28px] sm:text-[40px] text-ink tracking-tight leading-tight">
            {h1}
          </h1>

          {/* Headings stay centered; body paragraphs read left-aligned like
              normal prose, per feedback. */}
          <div className="article-content text-center [&>p]:text-left">
            {children}
          </div>
        </div>
      </main>

      <SegmentCase
        eyebrow={segmentCase.eyebrow}
        heading={segmentCase.heading}
        subtitle={segmentCase.subtitle}
        item={segmentCase.item}
      />

      <WhyUs />

      <QuizSection heading={calculatorHeading} source={calculatorSource} />

      <Manager />
      <Reviews />
      <FAQ items={faqItems} />

      <EstimateAudit />
      <Contacts />

      <Footer />
    </>
  );
}

import type { ReactNode } from 'react';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { Stats } from '@/components/sections/Stats';
import { WhyUs } from '@/components/sections/WhyUs';
import { Manager } from '@/components/sections/Manager';
import { Reviews } from '@/components/sections/Reviews';
import { SegmentCase } from '@/components/sections/SegmentCase';
import { QuizSection } from '@/components/sections/QuizSection';
import { FAQ } from '@/components/sections/FAQ';
import { ServiceJsonLd } from '@/components/seo/ServiceJsonLd';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';
import type { LeadSource } from '@/lib/config/leadSources';
import type { PortfolioItem } from '@/data/content';

interface FaqItem {
  q: string;
  a: string;
}

interface SegmentCaseProps {
  heading: string;
  subtitle: string;
  item: PortfolioItem;
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
      <ServiceJsonLd name={serviceName} description={serviceDescription} url={path} />
      <FaqJsonLd items={faqItems} />

      <main style={{ paddingTop: '71px' }} className="min-h-dvh bg-site">
        <div className="max-w-[720px] mx-auto px-6 pt-14 lg:pt-20">
          <h1 className="m-0 mb-10 lg:mb-12 font-extrabold text-[28px] sm:text-[40px] text-ink tracking-tight leading-tight">
            {h1}
          </h1>
        </div>

        <div className="py-10 md:py-12">
          <Stats />
        </div>

        <div className="max-w-[720px] mx-auto px-6 pb-14 lg:pb-20">
          <div className="article-content">
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

      <Footer />
    </>
  );
}

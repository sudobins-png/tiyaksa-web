import type { ReactNode } from 'react';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { Calculator } from '@/components/sections/Calculator';
import { FAQ } from '@/components/sections/FAQ';
import { ServiceJsonLd } from '@/components/seo/ServiceJsonLd';
import { FaqJsonLd } from '@/components/seo/FaqJsonLd';
import type { LeadSource } from '@/lib/config/leadSources';

interface FaqItem {
  q: string;
  a: string;
}

interface CommercialPageProps {
  path: string;
  h1: string;
  serviceName: string;
  serviceDescription: string;
  /** Article body — plain <h2>/<p>/<ul> markup, styled via .article-content. */
  children: ReactNode;
  calculatorHeading: string;
  calculatorSource: LeadSource;
  faqItems: readonly FaqItem[];
}

/**
 * Shared shell for the commercial SEO landing pages (/remont-*-spb) — same
 * structural pattern as /price (Header → article body → Calculator → FAQ →
 * Footer), but the content passed as `children` is unique per page so the
 * pages read as genuinely different articles rather than one template with
 * a swapped H1 (anti-dorway requirement from the SEO ticket).
 */
export function CommercialPage({
  path,
  h1,
  serviceName,
  serviceDescription,
  children,
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
        <div className="max-w-[720px] mx-auto px-6 py-14 lg:py-20">
          <h1 className="m-0 mb-10 lg:mb-12 font-extrabold text-[28px] sm:text-[40px] text-ink tracking-tight leading-tight">
            {h1}
          </h1>

          <div className="article-content">
            {children}
          </div>
        </div>
      </main>

      <Calculator heading={calculatorHeading} source={calculatorSource} />
      <FAQ items={faqItems} />

      <Footer />
    </>
  );
}

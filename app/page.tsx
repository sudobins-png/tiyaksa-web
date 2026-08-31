import { Header }           from '@/components/sections/Header';
import { Hero }             from '@/components/sections/Hero';
import { Stats }            from '@/components/sections/Stats';
import { Ecosystem }        from '@/components/sections/Ecosystem';
import { Portfolio }        from '@/components/sections/Portfolio';
import { HowWeWork }        from '@/components/sections/HowWeWork';
import { Pricing }          from '@/components/sections/Pricing';
import { PriceTeaser }      from '@/components/sections/PriceTeaser';
import { WhyUs }            from '@/components/sections/WhyUs';
import { CaseSection }      from '@/components/sections/CaseSection';
import { Reviews }          from '@/components/sections/Reviews';
import { EstimateAudit }    from '@/components/sections/EstimateAudit';
import { Calculator }       from '@/components/sections/Calculator';
import { RemoteRenovation } from '@/components/sections/RemoteRenovation';
import { Manager }          from '@/components/sections/Manager';
import { FAQ }              from '@/components/sections/FAQ';
import { FinalCTA }         from '@/components/sections/FinalCTA';
import { BlogTeaser }       from '@/components/sections/BlogTeaser';
import { Contacts }         from '@/components/sections/Contacts';
import { Footer }           from '@/components/sections/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="top" style={{ paddingTop: '71px' }}>
        <Hero />
        <Stats />
        <Ecosystem />
        <Portfolio />
        <WhyUs />
        <CaseSection />
        <Pricing />
        <PriceTeaser />
        <HowWeWork />
        <Reviews />
        <EstimateAudit />
        <Manager />
        {/* <Calculator /> */}
        <RemoteRenovation />
        <FAQ />
        <FinalCTA />
        <BlogTeaser />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}

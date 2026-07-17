import { Header }           from '@/components/sections/Header';
import { Hero }             from '@/components/sections/Hero';
import { Stats }            from '@/components/sections/Stats';
import { Portfolio }        from '@/components/sections/Portfolio';
import { HowWeWork }        from '@/components/sections/HowWeWork';
import { Pricing }          from '@/components/sections/Pricing';
import { WhyUs }            from '@/components/sections/WhyUs';
import { Reviews }          from '@/components/sections/Reviews';
import { LeadForm }         from '@/components/sections/LeadForm';
import { Calculator }       from '@/components/sections/Calculator';
import { RemoteRenovation } from '@/components/sections/RemoteRenovation';
import { Manager }          from '@/components/sections/Manager';
import { FAQ }              from '@/components/sections/FAQ';
import { FinalCTA }         from '@/components/sections/FinalCTA';
import { Footer }           from '@/components/sections/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="top" style={{ paddingTop: '71px' }}>
        <Hero />
        <Stats />
        <Portfolio />
        <HowWeWork />
        <Pricing />
        <WhyUs />
        <Reviews />
        <LeadForm />
        <Calculator />
        <RemoteRenovation />
        <Manager />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

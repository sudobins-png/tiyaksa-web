import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { LegalDocument, legalDocumentInfo, type LegalDocumentKind } from './LegalDocument';

export function LegalPage({ kind }: { kind: LegalDocumentKind }) {
  return <>
    <Header />
    <main className="mx-auto min-h-dvh max-w-[850px] px-6 pt-32 pb-16">
      <h1 className="mb-8 text-[28px] sm:text-[36px] font-bold text-ink">{legalDocumentInfo[kind].title}</h1>
      <LegalDocument kind={kind} />
    </main>
    <Footer />
  </>;
}

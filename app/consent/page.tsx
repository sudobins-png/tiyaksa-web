import { LegalPage } from '@/components/legal/LegalPage';
import { legalDocumentInfo } from '@/components/legal/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: legalDocumentInfo.consent.title + ' — ТиЯКСа.Ремонт',
  description: legalDocumentInfo.consent.title + ' на сайте tiyaksa.ru.',
  path: '/consent',
});

export default function Page() {
  return <LegalPage kind="consent" />;
}

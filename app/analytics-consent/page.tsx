import { LegalPage } from '@/components/legal/LegalPage';
import { legalDocumentInfo } from '@/components/legal/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: legalDocumentInfo.analytics.title + ' — ТиЯКСа.Ремонт',
  description: legalDocumentInfo.analytics.title + ' на сайте tiyaksa.ru.',
  path: '/analytics-consent',
});

export default function Page() {
  return <LegalPage kind="analytics" />;
}

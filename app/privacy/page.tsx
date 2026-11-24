import { LegalPage } from '@/components/legal/LegalPage';
import { legalDocumentInfo } from '@/components/legal/LegalDocument';
import { pageMetadata } from '@/lib/seo/metadata';

export const metadata = pageMetadata({
  title: legalDocumentInfo.policy.title + ' — ТиЯКСа.Ремонт',
  description: legalDocumentInfo.policy.title + ' на сайте tiyaksa.ru.',
  path: '/privacy',
});

export default function Page() {
  return <LegalPage kind="policy" />;
}

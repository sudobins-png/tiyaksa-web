import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, organizationSchema, pricePerSqmOffer } from '@/lib/seo/schema';

interface ServiceJsonLdProps {
  name: string;
  description: string;
  url: string;
  /** Starting price per m² shown on the page — becomes Service.offers. */
  priceFrom?: number;
}

export function ServiceJsonLd({ name, description, url, priceFrom }: ServiceJsonLdProps) {
  return (
    <JsonLd
      data={{
        '@type': 'Service',
        serviceType: name,
        name,
        description,
        url: `${SITE_URL}${url}`,
        areaServed: {
          '@type': 'City',
          name: 'Санкт-Петербург',
        },
        // Full object (not just an @id reference): validators and Yandex
        // don't reliably join @id across separate <script> blocks.
        provider: organizationSchema(),
        ...(priceFrom ? { offers: pricePerSqmOffer(priceFrom) } : {}),
      }}
    />
  );
}

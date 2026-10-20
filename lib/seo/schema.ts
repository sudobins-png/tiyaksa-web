import { siteConfig } from '@/data/content';

/**
 * Schema.org building blocks shared by every JSON-LD block on the site, so
 * the organization is described once and identically everywhere — the
 * site-wide block in app/layout.tsx, Service.provider on the landing pages,
 * Article.publisher on blog posts.
 */
export const SITE_URL = `https://${siteConfig.website}`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

// siteConfig.address is written for humans ("Санкт-Петербург, Малый
// просп. …"); PostalAddress keeps the city in addressLocality instead.
const streetAddress = `${siteConfig.address.replace(/^Санкт-Петербург,\s*/, '')}, ${siteConfig.addressNote}`;

export function organizationSchema() {
  return {
    '@type': 'HomeAndConstructionBusiness',
    '@id': ORGANIZATION_ID,
    name: siteConfig.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-mini.png`,
    image: `${SITE_URL}/hero-pic.jpg`,
    telephone: [siteConfig.phone, siteConfig.consultantPhone],
    email: siteConfig.email,
    priceRange: 'от 7 500 ₽/м²',
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality: 'Санкт-Петербург',
      addressCountry: 'RU',
    },
    // Same point as the placemark on the contacts map (Contacts.tsx).
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 59.945938,
      longitude: 30.271473,
    },
    // siteConfig.workingHours: «Пн–Пт: 10:00 – 20:00».
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    areaServed: { '@type': 'City', name: 'Санкт-Петербург' },
    sameAs: ['https://t.me/Masters_ZK', 'https://dzen.ru/tiyaksa.ru'],
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Root-relative path, e.g. '/price'. */
  path: string;
}

export function breadcrumbSchema(items: readonly BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** A per-m² starting price as a schema.org Offer, for Service.offers. */
export function pricePerSqmOffer(priceFrom: number) {
  return {
    '@type': 'Offer',
    priceCurrency: 'RUB',
    availability: 'https://schema.org/InStock',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: priceFrom,
      minPrice: priceFrom,
      priceCurrency: 'RUB',
      unitText: 'м²',
      referenceQuantity: {
        '@type': 'QuantitativeValue',
        value: 1,
        unitCode: 'MTK',
      },
    },
  };
}

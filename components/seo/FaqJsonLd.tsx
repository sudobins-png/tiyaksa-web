import { JsonLd } from '@/components/seo/JsonLd';

interface FaqItem {
  q: string;
  a: string;
}

export function FaqJsonLd({ items }: { items: readonly FaqItem[] }) {
  return (
    <JsonLd
      data={{
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      }}
    />
  );
}

import type { Metadata } from 'next';
import { siteConfig } from '@/data/content';

/**
 * Link-preview images (Telegram, WhatsApp, VK, Dzen) — 1200×630 crops of the
 * site's own photos in public/og/. A page with a portfolio case uses that
 * case's photo; everything else uses the team photo.
 */
const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_IMAGES = {
  default:  { url: '/og/default.jpg',      alt: 'Команда ТиЯКСа.Ремонт на объекте в Санкт-Петербурге', ...OG_SIZE },
  case124:  { url: '/og/case-124.jpg',     alt: 'Дизайнерский ремонт трёхкомнатной квартиры 124 м²', ...OG_SIZE },
  case96:   { url: '/og/case-96.jpg',      alt: 'Дизайнерский ремонт трёхкомнатной квартиры 96 м²', ...OG_SIZE },
  kitchen:  { url: '/og/case-kukhnya.jpg', alt: 'Ремонт кухни 25 м²', ...OG_SIZE },
  bathroom: { url: '/og/vannaya.jpg',      alt: 'Санузел из проекта ТиЯКСа.Ремонт', ...OG_SIZE },
  demolition: { url: '/og/demontazh.jpg',  alt: 'Демонтаж в квартире: мусор собран в мешки перед вывозом', ...OG_SIZE },
} as const;

/** width/height only when known — a blog post's featured image has no fixed size. */
export type OgImage = { url: string; alt: string; width?: number; height?: number };

interface PageMetadataInput {
  title: string;
  description: string;
  /** Root-relative canonical path, e.g. '/price'. Omitted for noindex pages without a stable URL. */
  path?: string;
  image?: OgImage;
}

/**
 * Title, description, canonical and the full Open Graph / Twitter set for a
 * page (the og:images carry the logo and phone — scripts/make-og-images.py).
 * Next.js replaces the layout's `openGraph` wholesale as soon as a page
 * sets its own — and a page that sets none inherits the homepage's og:title —
 * so every page builds the complete object here instead.
 */
export function pageMetadata({ title, description, path, image = OG_IMAGES.default }: PageMetadataInput): Metadata {
  // Previews only: the phone, so it can be tapped/copied straight from the
  // messenger. The search snippet (meta description) stays as written.
  const previewDescription = `${description} Тел. ${siteConfig.phone}`;
  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      siteName: siteConfig.name,
      ...(path ? { url: path } : {}),
      title,
      description: previewDescription,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: previewDescription,
      images: [image.url],
    },
  };
}

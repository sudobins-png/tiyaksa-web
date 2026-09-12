import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // WP service paths — /wp-json is JSON only, /wp-admin and
      // /wp-login.php are also IP-allowlisted at the nginx level (see
      // memory), but excluding them here keeps crawlers from wasting
      // budget on them regardless.
      // /offer/ pages are personal per-lead price breakdowns (unguessable
      // id, own noindex/nofollow meta too — belt and braces) and were never
      // meant to be found by search.
      disallow: ['/blog/wp-json/', '/blog/wp-admin/', '/blog/wp-login.php', '/offer/'],
    },
    sitemap: 'https://tiyaksa.ru/sitemap.xml',
  };
}

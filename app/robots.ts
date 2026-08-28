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
      disallow: ['/blog/wp-json/', '/blog/wp-admin/', '/blog/wp-login.php'],
    },
    sitemap: 'https://tiyaksa.ru/sitemap.xml',
  };
}

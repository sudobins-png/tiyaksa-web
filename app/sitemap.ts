import type { MetadataRoute } from 'next';
import { fetchAllPostSlugs } from '@/lib/server/wordpress';

const BASE_URL = 'https://tiyaksa.ru';

// Caches the generated sitemap.xml itself, on top of the fetch-level cache
// in fetchAllPostSlugs — new posts (published via n8n, no Next.js deploy)
// show up here within this window without hammering WP on every crawl.
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/quiz`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
  ];

  const posts = await fetchAllPostSlugs();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.modified_gmt,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}

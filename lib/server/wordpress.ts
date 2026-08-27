/**
 * Server-side client for the headless WordPress instance at tiyaksa.ru/blog.
 * WordPress is content-storage only — it is never shown to visitors directly
 * (see infra: only /blog/wp-json/* is publicly routed to it, everything else
 * under /blog is rendered by this Next.js app). Posts are published there by
 * an n8n flow, so there is no build-time list of slugs — pages are rendered
 * on demand and cached via fetch's `next.revalidate`.
 *
 * In production WORDPRESS_API_URL must point at an internal address (e.g.
 * http://127.0.0.1:8091/blog/wp-json) rather than the public domain: this
 * app runs on the same VPS as WordPress, and that VPS cannot hairpin a
 * request back to its own public IP (confirmed with a raw curl from the
 * host itself — a distinct issue from the Telegram IP-range block, see
 * telegram.ts). The public-domain default below only works for local dev.
 */
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL ?? 'https://tiyaksa.ru/blog/wp-json';

const REVALIDATE_SECONDS = 300;

export interface WpMedia {
  source_url: string;
  alt_text?: string;
}

export interface WpPost {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  meta?: Record<string, unknown>;
  _embedded?: {
    'wp:featuredmedia'?: WpMedia[];
  };
}

export interface WpPostList {
  posts: WpPost[];
  totalPages: number;
}

export async function fetchPosts(page = 1, perPage = 12): Promise<WpPostList> {
  const url = `${WORDPRESS_API_URL}/wp/v2/posts?_embed&per_page=${perPage}&page=${page}`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });

  // WP returns 400 (rest_post_invalid_page_number) once `page` exceeds the
  // real total — treat that as "no posts" rather than an error.
  if (res.status === 400) return { posts: [], totalPages: 0 };
  if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);

  const posts = (await res.json()) as WpPost[];
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? '1');
  return { posts, totalPages };
}

export async function fetchPostBySlug(slug: string): Promise<WpPost | null> {
  const url = `${WORDPRESS_API_URL}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);

  const posts = (await res.json()) as WpPost[];
  return posts[0] ?? null;
}

export function getFeaturedImage(post: WpPost): WpMedia | null {
  return post._embedded?.['wp:featuredmedia']?.[0] ?? null;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * RankMath's own meta description, if the n8n flow's "Set RankMath Meta"
 * step wrote one and RankMath has that field registered for REST output.
 * WordPress doesn't expose it by default, so this falls back to the excerpt.
 */
export function getMetaDescription(post: WpPost): string {
  const rankMath = post.meta?.rankMathDescription;
  if (typeof rankMath === 'string' && rankMath.trim()) return rankMath.trim();
  return stripHtml(post.excerpt.rendered).slice(0, 160).trim();
}

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
import sanitizeHtml from 'sanitize-html';
import { QUARANTINED_SLUG_RE } from '@/lib/config/quarantine';
import { siteConfig } from '@/data/content';
import { SITE_URL } from '@/lib/seo/schema';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL ?? 'https://tiyaksa.ru/blog/wp-json';

const REVALIDATE_SECONDS = 300;

/**
 * On 2026-10-12 two defacement pages ("Hacked by CoupDeGrace") showed up as
 * regular WP posts (slugs b7ad9721d55e-htm / b43124f1d8e9-htm — an uploaded
 * .htm file turned into a post) and went straight into the sitemap, the
 * homepage teaser and the feed, since every post WP returns is trusted here.
 * Until WP itself is cleaned and locked down this is the frontend's own
 * quarantine: a post that matches is treated as nonexistent everywhere.
 * middleware.ts answers 410 for the slug pattern so search engines drop
 * the URLs instead of retrying them as a soft 404.
 */
const DEFACEMENT_TEXT_RE = /hacked\s+by|defaced\s+by|\bgreetz\b/i;

export function isQuarantinedPost(post: { slug: string; title?: { rendered: string }; content?: { rendered: string } }): boolean {
  if (QUARANTINED_SLUG_RE.test(post.slug)) return true;
  const text = `${post.title?.rendered ?? ''} ${post.content?.rendered ?? ''}`;
  return DEFACEMENT_TEXT_RE.test(text);
}

/**
 * Post bodies are rendered with dangerouslySetInnerHTML, so anyone able to
 * write to WP could otherwise inject scripts or a full-page overlay into
 * tiyaksa.ru itself. Allows only the markup the n8n content flow actually
 * produces (see .article-content in globals.css): headings with ids for the
 * .toc anchors, lists, tables, links, images, the .toc nav and
 * .tiyaksa-note blocks. No style attributes, no scripts/iframes/forms.
 */
export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption', 'nav', 'div', 'span',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'code', 'pre',
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const next = { ...attribs };
        if (next.href) next.href = normalizeInternalHref(next.href);
        if (next.target === '_blank') next.rel = 'noopener noreferrer';
        return { tagName, attribs: next };
      },
    },
  });
}

/**
 * The n8n flow links between articles as https://tiyaksa.ru/blog/<slug>/ —
 * with a trailing slash, while the canonical URLs (sitemap, <link
 * rel=canonical>) have none, so every such link cost a 308 hop. Rewrites
 * links to this site into root-relative, slash-less paths; anything else is
 * returned untouched.
 */
export function normalizeInternalHref(href: string): string {
  const match = href.match(/^(?:https?:\/\/(?:www\.)?tiyaksa\.ru)?(\/[^?#]*)([?#].*)?$/i);
  if (!match) return href;
  const [, path, rest = ''] = match;
  const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return `${trimmed}${rest}`;
}

/** title.rendered is also injected as HTML (to keep WP's entities) — strip every tag. */
export function sanitizeTitleHtml(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
}

export interface WpMedia {
  source_url: string;
  alt_text?: string;
}

export interface WpPost {
  id: number;
  slug: string;
  date: string;
  date_gmt: string;
  modified_gmt: string;
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

  const posts = ((await res.json()) as WpPost[]).filter((post) => !isQuarantinedPost(post));
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? '1');
  return { posts, totalPages };
}

export interface WpPostSitemapEntry {
  slug: string;
  modified_gmt: string;
}

/**
 * Every post's slug + last-modified date, for sitemap.ts. Paginates through
 * the full set at 100/page (there are 100+ posts already and it keeps
 * growing via n8n) and asks WP for only these two fields to keep each page
 * small — the sitemap route itself is cached (see app/sitemap.ts's own
 * `revalidate`), so this only actually hits WP a few times an hour.
 */
export async function fetchAllPostSlugs(): Promise<WpPostSitemapEntry[]> {
  const all: WpPostSitemapEntry[] = [];
  let page = 1;

  while (true) {
    // title is fetched only for the quarantine check — content would make
    // these pages far heavier, and the slug + title catch the known pattern.
    const url = `${WORDPRESS_API_URL}/wp/v2/posts?per_page=100&page=${page}&_fields=slug,modified_gmt,title`;
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (res.status === 400) break; // past the last page
    if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);

    const posts = (await res.json()) as (WpPostSitemapEntry & { title?: { rendered: string } })[];
    for (const post of posts) {
      if (!isQuarantinedPost(post)) all.push({ slug: post.slug, modified_gmt: post.modified_gmt });
    }

    const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? '1');
    if (page >= totalPages) break;
    page += 1;
  }

  return all;
}

export async function fetchPostBySlug(slug: string): Promise<WpPost | null> {
  const url = `${WORDPRESS_API_URL}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`;
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) throw new Error(`WordPress API error: ${res.status}`);

  const posts = (await res.json()) as WpPost[];
  const post = posts[0];
  return post && !isQuarantinedPost(post) ? post : null;
}

export function getFeaturedImage(post: WpPost): WpMedia | null {
  return post._embedded?.['wp:featuredmedia']?.[0] ?? null;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * The n8n content-generation pipeline occasionally leaks a literal
 * "<html>" token into the stored post body (rendered as its own
 * `<p><html></p>`, usually right after the intro paragraph) — a leftover
 * from whatever wrapped its output before WP stored it. Browsers silently
 * swallow the stray tag (only one <html> root is allowed, so it's just
 * discarded), which is why it was never noticed on-site, but RSS/XML
 * consumers (Dzen, VK) don't get that same leniency.
 */
export function stripHtmlArtifact(html: string): string {
  return html
    .replace(/<p>\s*<\/?html>\s*<\/p>\s*/gi, '')
    .replace(/<\/?html>/gi, '');
}

/**
 * WP's `.rendered` fields are real HTML, so plain text extracted from them
 * (title, excerpt) keeps entity references like `&#8220;`/`&amp;` — fine
 * when handed to dangerouslySetInnerHTML (the browser decodes them), wrong
 * for a field that gets XML-escaped afterwards for the RSS feed (double-
 * encodes into `&amp;amp;`). Decodes the handful WP actually produces.
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * A short plain-text preview of the article body, for card excerpts and as
 * the meta-description fallback. Built from content.rendered rather than
 * WP's own excerpt.rendered: the n8n content prompt opens every article with
 * a `.toc` block (a literal "Содержание" heading + the section list), and
 * WordPress's auto-excerpt is just the first N words of the raw content —
 * so excerpt.rendered is "Содержание <section titles...> <real intro>"
 * with no way to separate the two. Stripping the .toc block first, here,
 * gets the same text a human summary would start with.
 */
export function getPreviewText(post: WpPost, maxLength = 160): string {
  const withoutToc = post.content.rendered.replace(/<nav[^>]*\bclass="[^"]*\btoc\b[^"]*"[^>]*>[\s\S]*?<\/nav>/i, '');
  const text = stripHtml(withoutToc);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
}

/**
 * RankMath's own meta description, if the n8n flow's "Set RankMath Meta"
 * step wrote one — see wp-content/mu-plugins/rankmath-rest.php on the WP
 * server, which registers this field (and rank_math_title/focus_keyword)
 * for REST. Falls back to the article preview when it's empty.
 */
export function getMetaDescription(post: WpPost): string {
  const rankMath = post.meta?.rank_math_description;
  if (typeof rankMath === 'string' && rankMath.trim()) return rankMath.trim();
  return getPreviewText(post);
}

interface JsonLdGraphNode {
  '@type'?: string;
  [key: string]: unknown;
}

interface JsonLdSchema {
  '@context'?: string;
  '@graph'?: JsonLdGraphNode[];
  [key: string]: unknown;
}

interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * JSON-LD for a post's `<script type="application/ld+json">`.
 *
 * Article is built here from the post itself, for every post (its
 * BreadcrumbList comes from <Breadcrumbs> on the page): the n8n flow's own `tiyaksa_schema` (see mu-plugins/tiyaksa-schema-rest.php)
 * only exists on newer posts and lacks dates, author and image, and its
 * breadcrumb pointed «Главная» at /blog — so its Article/BreadcrumbList nodes
 * are dropped. Anything else it carries is kept, plus the FAQPage built from
 * the `tiyaksa_faq` meta. Bad JSON in either field just means that part is
 * skipped, never a broken page.
 */
export function getArticleJsonLd(post: WpPost): JsonLdSchema {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const image = getFeaturedImage(post);

  const graph: JsonLdGraphNode[] = [
    {
      '@type': 'Article',
      headline: title.length > 110 ? `${title.slice(0, 109)}…` : title,
      description: decodeHtmlEntities(getMetaDescription(post)),
      datePublished: toIsoUtc(post.date_gmt),
      dateModified: toIsoUtc(post.modified_gmt || post.date_gmt),
      inLanguage: 'ru',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      ...(image ? { image: [image.source_url] } : {}),
      author: { '@type': 'Organization', name: BLOG_AUTHOR, url: `${SITE_URL}/blog` },
      publisher: {
        '@type': 'Organization',
        name: siteConfig.name,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo-mini.png` },
      },
    },
  ];

  const rawSchema = post.meta?.tiyaksa_schema;
  if (typeof rawSchema === 'string' && rawSchema.trim()) {
    try {
      const schema = JSON.parse(rawSchema) as JsonLdSchema;
      const extra = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
      graph.push(...extra.filter((node) => node['@type'] !== 'Article' && node['@type'] !== 'BreadcrumbList'));
    } catch {
      // ignore — the Article above still stands
    }
  }

  const rawFaq = post.meta?.tiyaksa_faq;
  if (typeof rawFaq === 'string' && rawFaq.trim()) {
    try {
      const faq = JSON.parse(rawFaq) as FaqEntry[];
      if (Array.isArray(faq) && faq.length > 0) {
        graph.push({
          '@type': 'FAQPage',
          mainEntity: faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        });
      }
    } catch {
      // ignore
    }
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Byline for every blog post — visible on the page and in Article.author. */
export const BLOG_AUTHOR = 'Редакция ТиЯКСа.Ремонт';

/** WP's *_gmt fields are UTC without an offset ("2026-08-28T12:34:56"). */
export function toIsoUtc(gmt: string): string {
  return gmt.endsWith('Z') ? gmt : `${gmt}Z`;
}

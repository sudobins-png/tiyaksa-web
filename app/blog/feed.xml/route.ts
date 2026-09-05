import {
  fetchPosts,
  getFeaturedImage,
  getMetaDescription,
  stripHtml,
  decodeHtmlEntities,
} from '@/lib/server/wordpress';

// RSS feed built for Yandex Zen (Dzen) ingestion — see
// https://dzen.ru/help/ru/website/rss-modify.html for the field/category
// requirements this follows. WP's own /feed/ isn't publicly routed (see
// wordpress.ts's header comment), so this is a from-scratch feed built on
// the same wp-json data the rest of the blog already uses.
const BASE_URL = 'https://tiyaksa.ru';
const REVALIDATE_SECONDS = 300;
const MAX_ITEMS = 50;

export const revalidate = REVALIDATE_SECONDS;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// WP's `date`/`date_gmt` come back with no timezone suffix — date_gmt is
// always UTC, so appending "Z" and using toUTCString gives a correct RFC822
// string once GMT is swapped for the numeric offset Dzen's example uses.
function toRfc822(dateGmt: string): string {
  const iso = dateGmt.endsWith('Z') ? dateGmt : `${dateGmt}Z`;
  return new Date(iso).toUTCString().replace('GMT', '+0000');
}

function imageMimeType(url: string): string {
  const ext = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

export async function GET() {
  const { posts } = await fetchPosts(1, MAX_ITEMS);

  const items = posts
    .map((post) => {
      const link = `${BASE_URL}/blog/${post.slug}`;
      const title = escapeXml(decodeHtmlEntities(stripHtml(post.title.rendered)));
      const description = escapeXml(decodeHtmlEntities(getMetaDescription(post)));
      const image = getFeaturedImage(post);
      const pubDate = toRfc822(post.date_gmt);
      // Belt-and-braces: our own content never contains a literal "]]>",
      // but a broken CDATA would corrupt every item after it in the feed.
      const contentHtml = post.content.rendered.replace(/]]>/g, ']]&gt;');

      const enclosure = image
        ? `<enclosure url="${escapeXml(image.source_url)}" type="${imageMimeType(image.source_url)}"/>`
        : '';

      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <pdalink>${link}</pdalink>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
      <author>ТиЯКСа.Ремонт</author>
      <media:rating scheme="urn:simple">nonadult</media:rating>
      <category>native-draft</category>
      <category>format-article</category>
      <category>index</category>
      <category>comment-none</category>
      ${enclosure}
      <content:encoded><![CDATA[${contentHtml}]]></content:encoded>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ТиЯКСа.Ремонт — Блог о ремонте квартир в Санкт-Петербурге</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Статьи о ремонте: советы, разбор материалов, цены и реальные кейсы от ТиЯКСа.Ремонт.</description>
    <language>ru</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BlogHeader } from '@/components/sections/BlogHeader';
import { Footer } from '@/components/sections/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BLOG_AUTHOR, decodeHtmlEntities, fetchPostBySlug, getArticleJsonLd, getFeaturedImage, getMetaDescription, sanitizePostHtml, sanitizeTitleHtml, stripHtml, stripHtmlArtifact, toIsoUtc } from '@/lib/server/wordpress';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);
  if (!post) return {};

  const title = stripHtml(post.title.rendered);
  const description = getMetaDescription(post);
  const image = getFeaturedImage(post);

  return {
    title: `${title} — ТиЯКСа.Ремонт`,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image.source_url] : undefined,
    },
    // No trailing slash — matches app/sitemap.ts's `${BASE_URL}/blog/${slug}`
    // and next.config.mjs's default (unset) trailingSlash.
    alternates: { canonical: `/blog/${params.slug}` },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await fetchPostBySlug(params.slug);
  if (!post) notFound();

  const image = getFeaturedImage(post);
  const jsonLd = getArticleJsonLd(post);
  const published = toIsoUtc(post.date_gmt);

  return (
    <>
      <BlogHeader />
      <JsonLd data={jsonLd} />
      <main style={{ paddingTop: '71px' }} className="min-h-dvh bg-site">
        <article className="max-w-[760px] mx-auto px-6 py-12 sm:py-16">
          <Breadcrumbs
            className="mb-6"
            items={[
              { name: 'Главная', path: '/' },
              { name: 'Блог', path: '/blog' },
              { name: decodeHtmlEntities(stripHtml(post.title.rendered)), path: `/blog/${post.slug}` },
            ]}
          />
          {image ? (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-grove-mint">
              <Image
                src={image.source_url}
                alt={image.alt_text || ''}
                fill
                className="object-cover"
                sizes="760px"
                priority
              />
            </div>
          ) : null}

          <h1
            className="font-extrabold text-[26px] sm:text-[34px] text-ink leading-tight tracking-tight mb-3"
            dangerouslySetInnerHTML={{ __html: sanitizeTitleHtml(post.title.rendered) }}
          />
          <p className="m-0 mb-8 text-[14px] text-muted">
            {BLOG_AUTHOR} · <time dateTime={published}>{formatPostDate(published)}</time>
          </p>

          <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizePostHtml(stripHtmlArtifact(post.content.rendered)) }} />
        </article>
      </main>
      <Footer />
    </>
  );
}

function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  }).format(new Date(iso));
}

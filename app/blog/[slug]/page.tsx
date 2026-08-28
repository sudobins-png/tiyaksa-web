import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { BlogHeader } from '@/components/sections/BlogHeader';
import { Footer } from '@/components/sections/Footer';
import { fetchPostBySlug, getArticleJsonLd, getFeaturedImage, getMetaDescription, stripHtml } from '@/lib/server/wordpress';

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
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await fetchPostBySlug(params.slug);
  if (!post) notFound();

  const image = getFeaturedImage(post);
  const jsonLd = getArticleJsonLd(post);

  return (
    <>
      <BlogHeader />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <main style={{ paddingTop: '71px' }} className="min-h-dvh bg-site">
        <article className="max-w-[760px] mx-auto px-6 py-12 sm:py-16">
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
            className="font-extrabold text-[26px] sm:text-[34px] text-ink leading-tight tracking-tight mb-8"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
        </article>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BlogHeader } from '@/components/sections/BlogHeader';
import { Footer } from '@/components/sections/Footer';
import { fetchPosts, getFeaturedImage, getPreviewText } from '@/lib/server/wordpress';

interface BlogPageProps {
  searchParams: { page?: string };
}

// Self-referencing canonical per page, not everything collapsed onto page 1:
// paginated listings genuinely differ in content, and Google's own guidance
// (since dropping rel=next/prev in 2019) is to canonicalize each page to
// itself. Collapsing /blog?page=2 onto /blog would just recreate the
// "duplicate, no canonical chosen" problem this ticket exists to fix.
export function generateMetadata({ searchParams }: BlogPageProps): Metadata {
  const page = Math.max(1, Number(searchParams.page) || 1);
  return {
    title: 'Блог о ремонте квартир в Санкт-Петербурге — ТиЯКСа.Ремонт',
    description:
      'Статьи о ремонте: советы, разбор материалов, цены и реальные кейсы от ТиЯКСа.Ремонт.',
    alternates: { canonical: page > 1 ? `/blog?page=${page}` : '/blog' },
  };
}

export default async function BlogPage({
  searchParams,
}: BlogPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, totalPages } = await fetchPosts(page);

  return (
    <>
      <BlogHeader />
      <main style={{ paddingTop: '71px' }} className="min-h-dvh bg-site">
        <div className="max-w-content mx-auto px-6 py-12 sm:py-16">
          <h1 className="font-extrabold text-[28px] sm:text-[36px] text-ink tracking-tight mb-2">
            Блог о ремонте
          </h1>
          <p className="text-muted text-[15px] sm:text-base mb-10">
            Статьи, советы и разборы для тех, кто делает ремонт в Санкт-Петербурге
          </p>

          {posts.length === 0 ? (
            <p className="text-muted">Пока здесь пусто — заходите позже.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const image = getFeaturedImage(post);
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200"
                  >
                    <div className="relative aspect-[16/10] bg-grove-mint">
                      {image ? (
                        <Image
                          src={image.source_url}
                          alt={image.alt_text || ''}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
                        />
                      ) : null}
                    </div>
                    <div className="p-5">
                      <h2
                        className="font-bold text-[17px] text-ink leading-snug mb-2 group-hover:text-forest transition-colors"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      <p className="text-muted text-[14px] leading-relaxed line-clamp-3">
                        {getPreviewText(post)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Страницы">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={n === 1 ? '/blog' : `/blog?page=${n}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg text-[14px] font-semibold transition-colors ${
                    n === page ? 'bg-forest text-white' : 'bg-white text-ink hover:bg-grove-mint'
                  }`}
                  aria-current={n === page ? 'page' : undefined}
                >
                  {n}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}

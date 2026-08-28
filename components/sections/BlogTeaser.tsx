import Link from 'next/link';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { HorizontalScroller } from '@/components/ui/HorizontalScroller';
import { fetchPosts, getFeaturedImage, getPreviewText } from '@/lib/server/wordpress';

export async function BlogTeaser() {
  const { posts } = await fetchPosts(1, 10);
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-[88px]">
        <SectionHeading className="mb-8 md:mb-10" subtitle="Статьи о ремонте: советы, разбор материалов и реальные кейсы.">
          Полезные советы
        </SectionHeading>

        <HorizontalScroller>
          {posts.map((post) => {
            const image = getFeaturedImage(post);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group shrink-0 snap-start w-[260px] sm:w-[280px] bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200"
              >
                <div className="relative aspect-[4/3] bg-grove-mint">
                  {image ? (
                    <Image
                      src={image.source_url}
                      alt={image.alt_text || ''}
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  ) : null}
                </div>
                <div className="p-5">
                  <h3
                    className="font-bold text-[16px] text-ink leading-snug line-clamp-3 group-hover:text-forest transition-colors"
                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                  />
                  <p className="mt-2 text-muted text-[13px] leading-relaxed line-clamp-2">
                    {getPreviewText(post, 90)}
                  </p>
                </div>
              </Link>
            );
          })}
        </HorizontalScroller>

        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center font-semibold text-[15px] px-7 py-[13px] rounded-xl border-[1.5px] border-forest text-forest hover:bg-forest hover:text-white transition-colors duration-200"
          >
            ТиЯКСа.Блог
          </Link>
        </div>
      </div>
    </section>
  );
}

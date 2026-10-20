import Link from 'next/link';
import { cn } from '@/lib/utils';
import { breadcrumbSchema, type BreadcrumbItem } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/JsonLd';

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  className?: string;
  center?: boolean;
}

/**
 * Visible breadcrumb trail plus its BreadcrumbList JSON-LD, from the same
 * items so the two can't drift apart. The last item is the current page and
 * is rendered as plain text.
 */
export function Breadcrumbs({ items, className, center = false }: BreadcrumbsProps) {
  return (
    <>
      <JsonLd data={breadcrumbSchema(items)} />
      <nav aria-label="Хлебные крошки" className={cn('text-[13px] text-muted', className)}>
        <ol className={cn('m-0 p-0 list-none flex flex-wrap items-center gap-x-1.5 gap-y-1', center && 'justify-center')}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5 min-w-0">
                {isLast ? (
                  <span aria-current="page" className="text-ink/70 truncate max-w-[60vw] sm:max-w-none">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="hover:text-forest transition-colors">
                      {item.name}
                    </Link>
                    <span aria-hidden className="text-muted/60">›</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

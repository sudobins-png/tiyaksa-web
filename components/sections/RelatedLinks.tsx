import Link from 'next/link';
import { relatedLinksFor } from '@/data/relatedPages';

/** «Смотрите также» — contextual links to related commercial pages (data/relatedPages.ts). */
export function RelatedLinks({ path }: { path: string }) {
  const links = relatedLinksFor(path);
  if (links.length === 0) return null;

  return (
    <nav aria-label="Смотрите также" className="bg-site border-t border-[#eef1ee]">
      <div className="max-w-content mx-auto px-6 py-10 md:py-14">
        <p className="m-0 mb-4 text-center text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">
          Смотрите также
        </p>
        <ul className="m-0 p-0 list-none flex flex-wrap justify-center gap-2.5 md:gap-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center rounded-full border border-[#dfe6df] bg-white px-4 py-2 text-[14px] md:text-[15px] font-semibold text-forest hover:border-forest hover:bg-grove-mint transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

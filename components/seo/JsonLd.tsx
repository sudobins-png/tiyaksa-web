/**
 * One `<script type="application/ld+json">` block. `<` is escaped so a value
 * containing "</script>" (e.g. text pulled from WordPress) can't close the
 * tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

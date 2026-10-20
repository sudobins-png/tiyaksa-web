/**
 * Blog slugs WordPress derives from an uploaded .htm/.html file (e.g. the
 * 2026-10-12 defacement posts b7ad9721d55e-htm / b43124f1d8e9-htm). No real
 * article is ever published under such a slug. Kept in its own module so
 * middleware.ts can import it without pulling lib/server/wordpress.ts (and
 * sanitize-html) into the edge bundle.
 */
export const QUARANTINED_SLUG_RE = /-html?$/i;

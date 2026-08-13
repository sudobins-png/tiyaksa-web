/**
 * Single source of truth for the estimate upload limits — imported by both the
 * modal and the API route so the client can never advertise something the
 * server will reject.
 *
 * The allowlist is deliberately narrow. Every entry here has a verifiable file
 * signature, so the server can check what a file *is* rather than trust the
 * extension or the browser-supplied MIME type. Legacy .doc/.xls are excluded
 * on purpose: OLE containers carry VBA macros, which is the classic route to a
 * trojan on the recipient's machine. Archives are excluded for the same reason
 * — we cannot see inside them.
 */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = '20 МБ';

export const ALLOWED_EXTENSIONS = ['pdf', 'xlsx', 'docx', 'jpg', 'jpeg', 'png'] as const;
export type AllowedExtension = (typeof ALLOWED_EXTENSIONS)[number];

/** For the file input's `accept` attribute — a hint to the picker, never a check. */
export const ACCEPT_ATTR = '.pdf,.xlsx,.docx,.jpg,.jpeg,.png';

export const ALLOWED_LABEL = 'PDF, XLSX, DOCX, JPG, PNG';

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase();
}

export function isAllowedExtension(ext: string): ext is AllowedExtension {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

import type { NextRequest } from 'next/server';

const ALLOWED_HOSTS = new Set(['tiyaksa.ru', 'www.tiyaksa.ru', 'localhost', '127.0.0.1']);

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : 'unknown';
}

/** Browsers always send Origin on a cross-site POST; a foreign one is refused. */
export function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return ALLOWED_HOSTS.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

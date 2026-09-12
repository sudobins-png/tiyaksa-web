import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

/**
 * Personal price-offer pages (/offer/[id]) generated right after someone
 * completes the quiz — see app/api/lead/route.ts. Same durable volume as
 * leadLog.ts (LEAD_LOG_DIR, mounted outside the container in
 * docker-compose.yml), one JSON file per offer rather than an append-only
 * log, since each offer is read back by id rather than scanned in bulk.
 */
const DATA_DIR = process.env.LEAD_LOG_DIR || '/app/data';
const OFFERS_DIR = join(DATA_DIR, 'offers');

export interface OfferData {
  id: string;
  createdAt: string;
  promoCode: string;
  aptType: string;
  rooms?: string;
  area: string;
  interiorStyle?: string;
  colorTone?: string;
  hasDesign?: string;
}

// base64url, not a sequential counter — /offer/1, /offer/2… would let anyone
// walk the id space and read a stranger's quiz answers (and, if collected
// later, contact details). 8 random bytes is 11 chars, well past the point
// of being guessable.
function generateId(): string {
  return randomBytes(8).toString('base64url');
}

// One Latin letter + one digit, as asked for — a handful of visually
// confusable letters (I/O) are left out so it's easy to read back over a
// phone call.
const PROMO_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
function generatePromoCode(): string {
  const letter = PROMO_LETTERS[Math.floor(Math.random() * PROMO_LETTERS.length)];
  const digit = Math.floor(Math.random() * 10);
  return `ТИЯКСА-${letter}${digit}`;
}

export async function createOffer(
  data: Omit<OfferData, 'id' | 'createdAt' | 'promoCode'>
): Promise<OfferData> {
  const offer: OfferData = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    promoCode: generatePromoCode(),
    ...data,
  };
  await mkdir(OFFERS_DIR, { recursive: true });
  await writeFile(join(OFFERS_DIR, `${offer.id}.json`), JSON.stringify(offer), 'utf8');
  return offer;
}

// The id lands here straight from the URL segment — reject anything outside
// generateId()'s own charset before it ever reaches the filesystem, so a
// path-traversal id (e.g. "../../../etc/passwd") can't escape OFFERS_DIR.
const ID_PATTERN = /^[A-Za-z0-9_-]{6,20}$/;

export async function getOffer(id: string): Promise<OfferData | null> {
  if (!ID_PATTERN.test(id)) return null;
  try {
    const raw = await readFile(join(OFFERS_DIR, `${id}.json`), 'utf8');
    return JSON.parse(raw) as OfferData;
  } catch {
    return null;
  }
}

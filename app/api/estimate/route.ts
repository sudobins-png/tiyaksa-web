import { NextRequest, NextResponse } from 'next/server';
import {
  MAX_UPLOAD_BYTES,
  extensionOf,
  isAllowedExtension,
  type AllowedExtension,
} from '@/lib/config/upload';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* ------------------------------------------------------------------ *
 * Rate limiting
 *
 * In-memory and therefore per-container, which is fine: there is one
 * container. It exists to stop someone looping 20 MB uploads at us — without
 * it the endpoint is a free memory-exhaustion lever.
 * ------------------------------------------------------------------ */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 2000) {
    const stale: string[] = [];
    hits.forEach((stamps, key) => {
      if (stamps.every((t: number) => now - t >= WINDOW_MS)) stale.push(key);
    });
    stale.forEach((key) => hits.delete(key));
  }
  return recent.length > MAX_PER_WINDOW;
}

/* ------------------------------------------------------------------ *
 * Content sniffing
 *
 * The browser-supplied MIME type and the extension are both attacker
 * controlled, so neither is trusted: the bytes have to match the extension.
 * This is what stops `payload.exe` renamed to `smeta.pdf`.
 * ------------------------------------------------------------------ */
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const OOXML_MARKER = Buffer.from('[Content_Types].xml', 'latin1');

function looksLikeOoxml(buf: Buffer): boolean {
  // OOXML is a zip; every conforming file carries this part.  Checking for it
  // keeps a plain .zip that was renamed to .xlsx from sailing through on the
  // shared "PK" signature alone.
  if (buf[0] !== 0x50 || buf[1] !== 0x4b) return false;
  return buf.includes(OOXML_MARKER);
}

const SIGNATURE_CHECKS: Record<AllowedExtension, (buf: Buffer) => boolean> = {
  pdf:  (b) => b.subarray(0, 5).toString('latin1') === '%PDF-',
  jpg:  (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png:  (b) => b.subarray(0, 8).equals(PNG_MAGIC),
  xlsx: looksLikeOoxml,
  docx: looksLikeOoxml,
};

/* ------------------------------------------------------------------ *
 * Sanitising
 * ------------------------------------------------------------------ */

/** Strips control characters, collapses whitespace, caps the length. */
function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, max);
}

/**
 * The uploaded name is never used for a filesystem path — nothing is written to
 * disk — but it is still echoed into Telegram, so the name is rebuilt from an
 * allowlist of letters, digits, space, dot, underscore and hyphen. That drops
 * path separators along with bidi overrides — the trick behind a file that
 * displays as `smeta_fdp.exe` while really ending in `.pdf`, and vice versa.
 */
function safeFilename(original: string, ext: AllowedExtension): string {
  const base = original
    .replace(/\.[^.]*$/, '')
    // Latin, Cyrillic, digits, space, dot, underscore, hyphen. Spelled out
    // rather than via \p{L} so it type-checks without an es6 target.
    .replace(/[^a-zA-Z0-9Ѐ-ӿ ._-]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return `${base || 'smeta'}.${ext}`;
}

/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  // Reject oversized bodies before buffering them. formData() would otherwise
  // pull the whole thing into memory first.
  const declared = Number(req.headers.get('content-length') ?? 0);
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) {
    return NextResponse.json({ error: 'file too large' }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  // Honeypot — a bot fills the hidden field. Answer 200 so it cannot probe.
  if (cleanText(form.get('website'), 200)) {
    console.warn('[estimate] honeypot triggered from', ip);
    return NextResponse.json({ ok: true });
  }

  const name    = cleanText(form.get('name'), 100);
  const phone   = cleanText(form.get('phone'), 60);
  const message = cleanText(form.get('message'), 700);

  if (name.length < 2 || phone.length < 3) {
    return NextResponse.json({ error: 'invalid fields' }, { status: 400 });
  }

  const entry = form.get('file');
  let document: { buffer: Buffer; filename: string } | null = null;

  if (entry && typeof entry === 'object' && 'arrayBuffer' in entry) {
    const file = entry as File;

    if (file.size === 0) {
      return NextResponse.json({ error: 'empty file' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'file too large' }, { status: 413 });
    }

    const ext = extensionOf(file.name);
    if (!isAllowedExtension(ext)) {
      return NextResponse.json({ error: 'file type not allowed' }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'file too large' }, { status: 413 });
    }
    if (!SIGNATURE_CHECKS[ext](buffer)) {
      console.warn('[estimate] signature mismatch for .%s from %s', ext, ip);
      return NextResponse.json({ error: 'file content does not match its type' }, { status: 415 });
    }

    document = { buffer, filename: safeFilename(file.name, ext) };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  // No parse_mode anywhere below, so user text is never interpreted as markup.
  const text = [
    '📄 Смета на пересчёт — ТиЯКСа.Ремонт',
    '',
    `Имя: ${name}`,
    `Контакт: ${phone}`,
    message ? `Комментарий: ${message}` : null,
    document ? `Файл: ${document.filename}` : 'Файл: не приложен',
    '',
    'Источник: estimate-audit',
  ].filter(Boolean).join('\n');

  try {
    if (document) {
      const payload = new FormData();
      payload.append('chat_id', chatId);
      payload.append('caption', text.slice(0, 1024));
      payload.append(
        'document',
        new Blob([new Uint8Array(document.buffer)]),
        document.filename,
      );

      const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
        method: 'POST',
        body: payload,
      });
      if (!res.ok) {
        console.error('[estimate] Telegram sendDocument failed:', res.status, await res.text());
        return NextResponse.json({ error: 'telegram error' }, { status: 502 });
      }
    } else {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      if (!res.ok) {
        console.error('[estimate] Telegram sendMessage failed:', res.status, await res.text());
        return NextResponse.json({ error: 'telegram error' }, { status: 502 });
      }
    }
  } catch (err) {
    console.error('[estimate] fetch error:', err);
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

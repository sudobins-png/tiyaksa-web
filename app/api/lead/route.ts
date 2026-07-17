import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/* ── Rate limiter (in-memory, per IP, 60s TTL) ──────────────────── */
const RATE_LIMIT = 5;
const RATE_TTL = 60_000;
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_TTL });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

/* ── Request schema ─────────────────────────────────────────────── */
const bodySchema = z.object({
  name:    z.string().min(2).max(100),
  phone:   z.string().min(6).max(30),
  message: z.string().max(1500).optional(),
  source:  z.string().max(60).optional(),
  aptType: z.string().max(40).optional(),
  workType: z.string().max(40).optional(),
  area:    z.number().optional(),
  website: z.string().optional(), // honeypot
});

/* ── Telegram helper ────────────────────────────────────────────── */
function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error('Telegram env vars missing');

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error ${res.status}: ${err}`);
  }
}

/* ── POST /api/lead ─────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* Rate limit */
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRate(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  /* Parse & validate */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, phone, message, source, aptType, workType, area, website } = parsed.data;

  /* Honeypot — silent 200 for bots */
  if (website) {
    return NextResponse.json({ ok: true });
  }

  /* Format message */
  const now = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const contextLines: string[] = [];
  if (aptType)  contextLines.push(`<b>Тип:</b> ${esc(aptType)}`);
  if (workType) contextLines.push(`<b>Вид работ:</b> ${esc(workType)}`);
  if (area)     contextLines.push(`<b>Площадь:</b> ${area} м²`);

  const text = [
    '📋 <b>Новая заявка — ТиЯКСа.Ремонт</b>',
    '',
    `<b>Имя:</b> ${esc(name)}`,
    `<b>Телефон:</b> ${esc(phone)}`,
    ...(message ? [`<b>Комментарий:</b> ${esc(message)}`] : []),
    ...(contextLines.length ? ['', ...contextLines] : []),
    '',
    `<b>Источник:</b> ${esc(source ?? 'сайт')}`,
    `<b>Время:</b> ${now} (МСК)`,
  ].join('\n');

  /* Send */
  try {
    await sendTelegram(text);
  } catch (err) {
    console.error('[lead] Telegram send failed:', err);
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

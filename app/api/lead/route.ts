import { NextRequest, NextResponse } from 'next/server';
import { leadSourceLabel } from '@/lib/config/leadSources';
import { cleanText, cleanLine } from '@/lib/utils/sanitize';
import { UTM_KEYS } from '@/lib/utils/utm';
import { telegramFetch } from '@/lib/server/telegram';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const raw = body as Record<string, unknown>;

  const website = cleanLine(raw.website, 200);

  // Honeypot. Every form ships a hidden `website` field that only a bot fills in.
  // Answer 200 so the bot cannot tell it was filtered, but send nothing.
  if (website) {
    console.warn('[lead] honeypot triggered, dropping submission from', raw.source ?? 'unknown');
    return NextResponse.json({ ok: true });
  }

  const name    = cleanLine(raw.name, 100);
  const phone   = cleanLine(raw.phone, 60);
  const message = cleanText(raw.message, 1500); // the one field that's allowed to be multi-line
  const source  = cleanLine(raw.source, 60);
  const aptType  = cleanLine(raw.aptType, 100);
  const workType = cleanLine(raw.workType, 100);
  const area     = cleanLine(raw.area, 60);

  if (!name && !phone) {
    return NextResponse.json({ error: 'empty submission' }, { status: 400 });
  }

  // These arrive as top-level fields from the quiz and the CTA form; they used to
  // be destructured away here, so the answers never reached Telegram.
  const params = [
    aptType  && `Объект: ${aptType}`,
    workType && `Тип работ: ${workType}`,
    area     && `Площадь: ${area}`,
  ].filter(Boolean).join(' · ');

  // Whatever utm_* the visitor's landing URL carried, captured client-side on
  // first load and replayed here — see lib/utils/utm.ts. It's a URL query
  // string, i.e. fully attacker-controlled, so cleanLine (not cleanText):
  // a newline inside a UTM value must not be able to forge an extra line
  // — e.g. its own fake "Источник:" — in the Telegram message below.
  const utm = UTM_KEYS
    .map((key) => {
      const value = cleanLine(raw[key], 150);
      return value && `${key}=${value}`;
    })
    .filter(Boolean)
    .join(' · ');

  const text = [
    '📋 Новая заявка — ТиЯКСа.Ремонт',
    '',
    `Имя: ${name || '—'}`,
    `Контакт: ${phone || '—'}`,
    params  ? `Параметры: ${params}`    : null,
    message ? `Комментарий: ${message}` : null,
    utm     ? `UTM-метки: ${utm}`       : null,
    '',
    `Источник: ${leadSourceLabel(source)}`,
  ].filter(Boolean).join('\n');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  try {
    const tgRes = await telegramFetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const tgBody = await tgRes.text();
    if (!tgRes.ok) {
      console.error('[lead] Telegram error:', tgRes.status, tgBody);
      return NextResponse.json({ error: 'telegram error', detail: tgBody }, { status: 500 });
    }
  } catch (err) {
    console.error('[lead] fetch error:', err);
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { leadSourceLabel } from '@/lib/config/leadSources';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const { name, phone, message, source, website, aptType, workType, area } =
    body as Record<string, string>;

  // Honeypot. Every form ships a hidden `website` field that only a bot fills in.
  // Answer 200 so the bot cannot tell it was filtered, but send nothing.
  if (website) {
    console.warn('[lead] honeypot triggered, dropping submission from', source ?? 'unknown');
    return NextResponse.json({ ok: true });
  }

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

  const text = [
    '📋 Новая заявка — ТиЯКСа.Ремонт',
    '',
    `Имя: ${name ?? '—'}`,
    `Контакт: ${phone ?? '—'}`,
    params  ? `Параметры: ${params}`    : null,
    message ? `Комментарий: ${message}` : null,
    '',
    `Источник: ${leadSourceLabel(source)}`,
  ].filter(Boolean).join('\n');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

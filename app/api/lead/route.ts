import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const { name, phone, message, source } = body as Record<string, string>;

  const text = [
    '📋 Новая заявка — ТиЯКСа.Ремонт',
    '',
    `Имя: ${name ?? '—'}`,
    `Контакт: ${phone ?? '—'}`,
    message ? `Комментарий: ${message}` : null,
    '',
    `Источник: ${source ?? 'сайт'}`,
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

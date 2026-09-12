import { NextRequest, NextResponse } from 'next/server';
import { leadSourceLabel } from '@/lib/config/leadSources';
import { cleanText, cleanLine } from '@/lib/utils/sanitize';
import { UTM_KEYS } from '@/lib/utils/utm';
import { telegramFetch } from '@/lib/server/telegram';
import { appendLeadLog } from '@/lib/server/leadLog';
import { createOffer } from '@/lib/server/offers';
import { buildOfferSummaryLine } from '@/lib/utils/offerSummary';

export const runtime = 'nodejs'; // appendLeadLog/createOffer need node:fs

const BASE_URL = 'https://tiyaksa.ru';

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

  // Quiz-only fields — present only when this submission came from the full
  // quiz flow (QuizInline/QuizModal), which is also the only source with
  // enough structured data to build a personal /offer/ page from. aptType
  // and area are the two required to even attempt one; the rest are optional
  // (e.g. a kitchen-only quiz never asks room count).
  const rooms         = cleanLine(raw.rooms, 60);
  const interiorStyle = cleanLine(raw.interiorStyle, 60);
  const colorTone     = cleanLine(raw.colorTone, 60);
  const hasDesign     = cleanLine(raw.hasDesign, 100);

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

  const logBase = {
    route: 'lead' as const,
    source: leadSourceLabel(source),
    name, phone, message, params, utm,
  };

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    await appendLeadLog({ ...logBase, delivered: false, error: 'TELEGRAM_BOT_TOKEN/CHAT_ID not configured' });
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
      await appendLeadLog({ ...logBase, delivered: false, error: `telegram ${tgRes.status}: ${tgBody.slice(0, 300)}` });
      return NextResponse.json({ error: 'telegram error', detail: tgBody }, { status: 500 });
    }
  } catch (err) {
    console.error('[lead] fetch error:', err);
    await appendLeadLog({ ...logBase, delivered: false, error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }

  await appendLeadLog({ ...logBase, delivered: true });

  // A personal /offer/ page only makes sense for a real quiz completion.
  // fromQuiz is the actual gate — QuizInline/QuizModal are the only forms
  // that send it; FinalCTA's own inline calculator sends aptType+area too
  // (different shape: a raw slider number, not one of the quiz's six area
  // buckets) but never this flag, so it can't accidentally trigger this.
  // aptType/area are re-checked as a sanity backstop. Best-effort and after
  // the main notification has already gone out: a failure here must never
  // turn an otherwise-successful lead submission into an error response.
  if (raw.fromQuiz === true && aptType && area) {
    try {
      const offer = await createOffer({
        aptType,
        area,
        rooms: rooms || undefined,
        interiorStyle: interiorStyle || undefined,
        colorTone: colorTone || undefined,
        hasDesign: hasDesign || undefined,
      });

      const summary = buildOfferSummaryLine({ aptType, rooms, area, interiorStyle, hasDesign });
      const offerText = [
        'Здравствуйте, это Лев из ТиЯКСа.Ремонт. Ваш расчет стоимости ремонта готов.',
        '',
        'Вы ввели параметры:',
        summary,
        '',
        'Смотрите подробную разбивку по стоимости и срокам здесь:',
        `👉 ${BASE_URL}/offer/${offer.id}`,
        '',
        'Останутся вопросы — пишите прямо сюда, ответим в течение часа.',
      ].join('\n');

      const offerRes = await telegramFetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: offerText }),
      });
      if (!offerRes.ok) {
        console.error('[lead] offer message Telegram error:', offerRes.status, await offerRes.text());
      }
    } catch (err) {
      console.error('[lead] offer creation failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}

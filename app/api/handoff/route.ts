import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { HANDOFF_REASONS, MAX_MESSAGE_CHARS } from '@/lib/assistant/types';
import { allowHandoff, buildHandoffMessage } from '@/lib/server/assistant/handoff';
import { getClientIp, originAllowed } from '@/lib/server/assistant/http';
import { preferencesSchema } from '@/lib/server/assistant/tools';
import { telegramFetch } from '@/lib/server/telegram';
import { cleanLine, cleanText } from '@/lib/utils/sanitize';
import { UTM_KEYS } from '@/lib/utils/utm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 60_000;
const MAX_CHAT_MESSAGES = 40;

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(MAX_MESSAGE_CHARS * 4) }))
    .min(1)
    .max(60),
  preferences: preferencesSchema.optional(),
  reason: z.enum(HANDOFF_REASONS),
  summary: z.string().max(500).default(''),
  name: z.string().max(100).optional(),
  contact: z.string().max(100).optional(),
  website: z.string().optional(),
  consent: z.literal(true),
});

/**
 * "Talk to a human": posts the visitor's chat history into the leads channel
 * so Lev has the context before — or without — the visitor writing to his
 * Telegram account. The visitor's own click on the t.me link is what actually
 * opens the conversation; this is only the briefing that goes with it.
 */
export async function POST(req: NextRequest) {
  if (!originAllowed(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'too large' }, { status: 413 });

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success || !parsed.data.messages.some((m) => m.role === 'user')) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  // Honeypot — same convention as /api/lead: answer 200, send nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  if (!allowHandoff(getClientIp(req))) {
    return NextResponse.json({ error: 'rate' }, { status: 429, headers: { 'Retry-After': '3600' } });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const utm = UTM_KEYS.map((key) => {
    const value = cleanLine((json as Record<string, unknown>)[key], 150);
    return value && `${key}=${value}`;
  })
    .filter(Boolean)
    .join(' · ');

  const text = buildHandoffMessage({
    messages: parsed.data.messages
      .slice(-MAX_CHAT_MESSAGES)
      .map((m) => ({ role: m.role, content: cleanText(m.content, MAX_MESSAGE_CHARS) }))
      .filter((m) => m.content),
    preferences: parsed.data.preferences ?? {},
    reason: parsed.data.reason,
    summary: parsed.data.summary,
    name: parsed.data.name,
    contact: parsed.data.contact,
    utm,
  });

  try {
    const res = await telegramFetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      console.error('[handoff] Telegram error:', res.status, (await res.text()).slice(0, 300));
      return NextResponse.json({ error: 'telegram error' }, { status: 502 });
    }
  } catch (err) {
    console.error('[handoff] fetch error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

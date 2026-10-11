import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MAX_HISTORY_MESSAGES, MAX_MESSAGE_CHARS, type AssistantEvent } from '@/lib/assistant/types';
import { getAnthropic } from '@/lib/server/assistant/client';
import { acquire, hasBudget } from '@/lib/server/assistant/rateLimit';
import { preferencesSchema } from '@/lib/server/assistant/tools';
import { MSG_UNAVAILABLE, runAssistant } from '@/lib/server/assistant/run';
import { cleanText } from '@/lib/utils/sanitize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 40_000;
const ALLOWED_HOSTS = new Set(['tiyaksa.ru', 'www.tiyaksa.ru', 'localhost', '127.0.0.1']);

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(MAX_MESSAGE_CHARS * 4),
      }),
    )
    .min(1)
    .max(60),
  preferences: preferencesSchema.optional(),
});

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  return xff ? xff.split(',')[0].trim() : 'unknown';
}

function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return ALLOWED_HOSTS.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

// The widget asks this before loading at all, so without ANTHROPIC_API_KEY
// (or once today's budget is spent) visitors never see a chat that can't answer.
export async function GET() {
  return NextResponse.json(
    { enabled: getAnthropic() !== null && hasBudget() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: NextRequest) {
  if (!originAllowed(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'too large' }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const client = getAnthropic();
  if (!client) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  // The model sees only the tail of a long chat, trimmed to start on a user turn.
  let history = parsed.data.messages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: cleanText(m.content, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content);
  while (history.length > 0 && history[0].role !== 'user') history = history.slice(1);
  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const slot = acquire(getClientIp(req));
  if (!slot.ok) {
    return NextResponse.json(
      { error: slot.reason },
      { status: slot.reason === 'budget' ? 503 : 429, headers: { 'Retry-After': '60' } },
    );
  }

  const encoder = new TextEncoder();
  const abort = new AbortController();
  req.signal.addEventListener('abort', () => abort.abort());

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: AssistantEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'));
        } catch {
          /* client already gone */
        }
      };
      try {
        await runAssistant({
          client,
          messages: history,
          prefs: parsed.data.preferences ?? {},
          emit,
          signal: abort.signal,
        });
      } catch (err) {
        console.error('[assistant] route error', err);
        emit({ t: 'error', v: MSG_UNAVAILABLE });
      } finally {
        slot.release();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      abort.abort();
      slot.release();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

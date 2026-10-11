import { siteConfig } from '@/data/content';
import { preferencesLine } from '@/lib/assistant/format';
import {
  HANDOFF_REASON_LABELS,
  MANAGER_TELEGRAM,
  type AssistantPreferences,
  type ChatMessage,
  type HandoffReason,
} from '@/lib/assistant/types';
import { cleanLine } from '@/lib/utils/sanitize';

export interface HandoffInput {
  messages: ChatMessage[];
  preferences: AssistantPreferences;
  reason: HandoffReason;
  summary: string;
  name?: string;
  contact?: string;
  utm?: string;
}

// Telegram's hard cap is 4096 characters per message.
const TELEGRAM_LIMIT = 3900;
const LINE_MAX = 400;

/**
 * The note Lev sees in the leads channel when a visitor asks for a human.
 * Plain text (no parse_mode) and every chat line is flattened to one line
 * with a fixed "Клиент:" / "Помощник:" prefix — the visitor controls the
 * text, so it must not be able to forge a field like "Контакт:" of its own.
 */
export function buildHandoffMessage(input: HandoffInput): string {
  const head = [
    '🙋 Клиент просит связаться — чат-ассистент ТиЯКСа.Ремонт',
    '',
    `Причина: ${HANDOFF_REASON_LABELS[input.reason]}`,
    input.name ? `Имя: ${cleanLine(input.name, 100)}` : null,
    `Контакт: ${input.contact ? cleanLine(input.contact, 100) : `не указан — клиент мог сам написать вам в Telegram (@${MANAGER_TELEGRAM}) или позвонить на ${siteConfig.phone}`}`,
    preferencesLine(input.preferences) ? `Параметры: ${preferencesLine(input.preferences)}` : null,
    input.summary ? `Кратко: ${cleanLine(input.summary, 500)}` : null,
  ].filter((line): line is string => line !== null);

  const tail = [
    '',
    input.utm ? `UTM-метки: ${input.utm}` : null,
    'Источник: Чат-ассистент на сайте — запрос менеджера',
  ].filter((line): line is string => line !== null);

  const transcript = input.messages.map(
    (m) => `${m.role === 'user' ? 'Клиент' : 'Помощник'}: ${cleanLine(m.content, LINE_MAX)}`,
  );

  // Keep the most recent exchange when the whole chat doesn't fit.
  const fixedLength = [...head, '', 'Переписка:', ...tail].join('\n').length + 40;
  const kept: string[] = [];
  let used = fixedLength;
  for (let i = transcript.length - 1; i >= 0; i--) {
    if (used + transcript[i].length + 1 > TELEGRAM_LIMIT) break;
    kept.unshift(transcript[i]);
    used += transcript[i].length + 1;
  }
  const trimmed = kept.length < transcript.length;

  return [...head, '', trimmed ? 'Переписка (начало опущено):' : 'Переписка:', ...kept, ...tail].join('\n');
}

// A spam guard on top of the origin check: this endpoint posts into the
// leads channel, so one visitor must not be able to flood it.
const HOUR_MS = 60 * 60 * 1000;
const PER_IP_PER_HOUR = 4;
const GLOBAL_PER_DAY = 60;

const hits = new Map<string, number[]>();
let day = '';
let dayCount = 0;

export function allowHandoff(ip: string): boolean {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  if (today !== day) {
    day = today;
    dayCount = 0;
  }
  if (dayCount >= GLOBAL_PER_DAY) return false;

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < HOUR_MS);
  if (recent.length >= PER_IP_PER_HOUR) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  dayCount += 1;
  return true;
}

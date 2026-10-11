import { MANAGER_TELEGRAM, type AssistantPreferences, type ChatMessage } from './types';

export function preferencesLine(p: AssistantPreferences): string {
  return [
    p.aptType,
    p.rooms,
    p.areaSqm && `${p.areaSqm} м²`,
    p.repairType && `ремонт: ${p.repairType.toLowerCase()}`,
    p.interiorStyle && `стиль: ${p.interiorStyle}`,
    p.colorTone && `тона: ${p.colorTone}`,
    p.hasDesign && `дизайн-проект: ${p.hasDesign}`,
    p.notes && `заметка: ${p.notes}`,
  ]
    .filter(Boolean)
    .join(' · ');
}

const PREFILL_MAX = 700;
const QUESTION_MAX = 140;

/**
 * Link that opens Lev's Telegram chat with a short briefing already typed in.
 * Kept short on purpose: Cyrillic URL-encodes to ~6 characters per letter, and
 * the full history travels separately through /api/handoff.
 */
export function buildTelegramHandoffUrl(summary: string, prefs: AssistantPreferences, history: ChatMessage[]): string {
  const lastQuestions = history
    .filter((m) => m.role === 'user')
    .slice(-2)
    .map((m) => `«${m.content.replace(/\s+/g, ' ').trim().slice(0, QUESTION_MAX)}»`);
  const params = preferencesLine(prefs);

  const text = [
    'Здравствуйте, Лев! Пишу с сайта tiyaksa.ru после чата с помощником.',
    summary.trim(),
    params && `Параметры: ${params}.`,
    lastQuestions.length > 0 && `Мои последние вопросы: ${lastQuestions.join('; ')}.`,
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, PREFILL_MAX);

  return `https://t.me/${MANAGER_TELEGRAM}?text=${encodeURIComponent(text)}`;
}

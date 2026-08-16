/**
 * Every value the frontend can put in a lead's `source` field, and the
 * human-readable label shown in the Telegram notification in its place —
 * a manager reading the channel shouldn't have to know what "quiz-page"
 * means. Components import the keys from here rather than hardcoding the
 * string, so a typo can't silently produce a source the report doesn't
 * recognise (leadSourceLabel() falls back to "Сайт" for anything unlisted).
 */
export const LEAD_SOURCES = {
  hero:           'hero',
  calculator:     'calculator',
  quizManager:    'quiz-manager',
  ctaForm:        'cta-form',
  quizPage:       'quiz-page',
  quizPricingCta: 'pricing-cta',
  quizExitIntent: 'exit-intent',
  estimateAudit:  'estimate-audit',
} as const;

export type LeadSource = (typeof LEAD_SOURCES)[keyof typeof LEAD_SOURCES];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  [LEAD_SOURCES.hero]:           'Главный экран — кнопка «Узнать стоимость»',
  [LEAD_SOURCES.calculator]:     'Калькулятор стоимости',
  [LEAD_SOURCES.quizManager]:    'Блок «Личный управляющий»',
  [LEAD_SOURCES.ctaForm]:        'Форма «Обсудим ваш объект»',
  [LEAD_SOURCES.quizPage]:       'Страница расчёта стоимости (квиз)',
  [LEAD_SOURCES.quizPricingCta]: 'Блок «Стоимость ремонта» — кнопка в тарифе',
  [LEAD_SOURCES.quizExitIntent]: 'Всплывающий квиз при уходе с сайта',
  [LEAD_SOURCES.estimateAudit]:  'Форма «Уже делали расчёт» — загрузка сметы',
};

export function leadSourceLabel(source: string | undefined | null): string {
  if (!source) return 'Сайт';
  return (LEAD_SOURCE_LABELS as Record<string, string>)[source] ?? 'Сайт';
}

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
  priceCalculator: 'price-calculator',
  priceTeaser:     'price-teaser',
  heroPricingCta: 'hero-pricing-cta',
  headerCta:      'header-cta',
  landingBathroom:    'landing-bathroom',
  landingRoom:        'landing-room',
  landingNewBuilding: 'landing-new-building',
  landingSecondary:   'landing-secondary',
  landingCosmetic:    'landing-cosmetic',
  landingCapital:     'landing-capital',
  landingDesign:      'landing-design',
} as const;

export type LeadSource = (typeof LEAD_SOURCES)[keyof typeof LEAD_SOURCES];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  [LEAD_SOURCES.hero]:           'Главный экран — кнопка «Бесплатный замер»',
  [LEAD_SOURCES.calculator]:     'Калькулятор стоимости',
  [LEAD_SOURCES.quizManager]:    'Блок «Личный управляющий»',
  [LEAD_SOURCES.ctaForm]:        'Форма «Обсудим ваш объект»',
  [LEAD_SOURCES.quizPage]:       'Страница расчёта стоимости (квиз)',
  [LEAD_SOURCES.quizPricingCta]: 'Блок «Стоимость ремонта» — кнопка в тарифе',
  [LEAD_SOURCES.quizExitIntent]: 'Попап со скидкой -12% (уход с сайта / бездействие)',
  [LEAD_SOURCES.estimateAudit]:  'Форма «Уже делали расчёт» — загрузка сметы',
  [LEAD_SOURCES.priceCalculator]: 'Страница /price — блок «Быстрый расчёт»',
  [LEAD_SOURCES.priceTeaser]:     'Главная — тизер прайс-листа',
  [LEAD_SOURCES.heroPricingCta]:  'Главный экран — кнопка «Рассчитать стоимость»',
  [LEAD_SOURCES.headerCta]:       'Хедер — кнопка «Рассчитать стоимость»',
  [LEAD_SOURCES.landingBathroom]:    'Страница /remont-vannoy-spb',
  [LEAD_SOURCES.landingRoom]:        'Страница /remont-komnaty-spb',
  [LEAD_SOURCES.landingNewBuilding]: 'Страница /remont-novostroyki-spb',
  [LEAD_SOURCES.landingSecondary]:   'Страница /remont-vtorichki-spb',
  [LEAD_SOURCES.landingCosmetic]:    'Страница /remont-kosmeticheskiy-spb',
  [LEAD_SOURCES.landingCapital]:     'Страница /remont-kapitalnyy-spb',
  [LEAD_SOURCES.landingDesign]:      'Страница /remont-dizainerskiy-spb',
};

export function leadSourceLabel(source: string | undefined | null): string {
  if (!source) return 'Сайт';
  return (LEAD_SOURCE_LABELS as Record<string, string>)[source] ?? 'Сайт';
}

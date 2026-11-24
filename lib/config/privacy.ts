export const PRIVACY_VERSION = '2026-11-24';
export const PERSONAL_DATA_CONSENT_VERSION = '2026-11-24';
export const ANALYTICS_CONSENT_VERSION = '2026-11-24';

// Published operator details, shared by the footer and legal documents.
export const personalDataOperator = {
  name: 'Индивидуальный предприниматель Сунайкин Л. А.',
  inn: '910812406492',
  ogrnip: '326910000041032',
  address: 'Республика Крым, Кировский район, село Владиславовка, улица Строителей, д. 14',
  email: 'remont@tiyaksa.ru',
} as const;

export function personalDataConsentFields() {
  return { personalDataConsentVersion: PERSONAL_DATA_CONSENT_VERSION };
}

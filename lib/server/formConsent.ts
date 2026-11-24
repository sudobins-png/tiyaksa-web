import { PERSONAL_DATA_CONSENT_VERSION } from '@/lib/config/privacy';

export interface FormConsentEvidence {
  version: string;
  method: 'submit_button';
  receivedAt: string;
}

/** Do not retrospectively attribute the new consent to cached old forms. */
export function readFormConsent(version: unknown): FormConsentEvidence | undefined {
  if (version !== PERSONAL_DATA_CONSENT_VERSION) return undefined;
  return { version: PERSONAL_DATA_CONSENT_VERSION, method: 'submit_button', receivedAt: new Date().toISOString() };
}

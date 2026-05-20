export const COOKIE_CONSENT_STORAGE_KEY = 'acesso_cookie_consent';

export type CookieConsentValue = 'analytics' | 'essential';

export type CookieConsentStatus = CookieConsentValue | 'pending';

/**
 * Parses stored consent value from localStorage.
 */
export function parseConsentValue(raw: string | null): CookieConsentStatus {
  if (raw === 'analytics' || raw === 'essential') {
    return raw;
  }
  return 'pending';
}

/**
 * Returns whether analytics (PostHog) may run for the stored choice.
 */
export function hasAnalyticsConsent(status: CookieConsentStatus) {
  return status === 'analytics';
}

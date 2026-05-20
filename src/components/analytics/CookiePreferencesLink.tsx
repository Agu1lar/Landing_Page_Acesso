'use client';

import { useTranslations } from 'next-intl';
import { useAnalyticsConsent } from '@/components/analytics/AnalyticsConsentContext';

/**
 * Footer control to change cookie preferences and reopen the banner.
 */
export function CookiePreferencesLink() {
  const t = useTranslations('CookieConsent');
  const consent = useAnalyticsConsent();

  return (
    <button
      className="hover:text-white"
      onClick={() => {
        consent.reopenBanner();
      }}
      type="button"
    >
      {t('manage_link')}
    </button>
  );
}

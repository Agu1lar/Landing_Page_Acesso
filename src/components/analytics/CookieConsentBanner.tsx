'use client';

import { useTranslations } from 'next-intl';
import { useAnalyticsConsent } from '@/components/analytics/AnalyticsConsentContext';
import { Button } from '@/components/ui/Button';
import { Link } from '@/libs/I18nNavigation';

/**
 * Bottom banner to accept or reject analytics cookies (PostHog).
 */
export function CookieConsentBanner() {
  const t = useTranslations('CookieConsent');
  const consent = useAnalyticsConsent();

  return (
    <div
      aria-labelledby="cookie-consent-title"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-neutral-700 bg-neutral-900 px-4 py-4 text-neutral-200 shadow-lg sm:px-6"
      role="dialog"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl text-sm leading-relaxed">
          <p className="font-semibold text-white" id="cookie-consent-title">
            {t('title')}
          </p>
          <p className="mt-1">{t('description')}</p>
          <p className="mt-2 text-xs text-neutral-400">
            <Link className="underline hover:text-white" href="/privacidade">
              {t('privacy_link')}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            className="!bg-neutral-700 !text-white hover:!bg-neutral-600"
            onClick={() => {
              consent.rejectAnalytics();
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            {t('reject')}
          </Button>
          <Button
            onClick={() => {
              consent.acceptAnalytics();
            }}
            size="sm"
            type="button"
            variant="primary"
          >
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}

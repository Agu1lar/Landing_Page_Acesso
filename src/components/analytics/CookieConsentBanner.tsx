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
            <span aria-hidden className="mx-1.5 text-neutral-600">
              ·
            </span>
            <button
              className="text-neutral-500 transition-colors hover:text-neutral-400"
              onClick={() => {
                consent.rejectAnalytics();
              }}
              type="button"
            >
              {t('reject')}
            </button>
          </p>
        </div>
        <div className="flex shrink-0">
          <Button
            className="!bg-emerald-600 !text-white hover:!bg-emerald-500"
            onClick={() => {
              consent.acceptAnalytics();
            }}
            size="md"
            type="button"
            variant="secondary"
          >
            {t('accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}

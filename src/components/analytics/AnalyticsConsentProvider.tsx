'use client';

import { Suspense, useEffect, useState } from 'react';
import { AnalyticsConsentContext } from '@/components/analytics/AnalyticsConsentContext';
import { CookieConsentBanner } from '@/components/analytics/CookieConsentBanner';
import { PostHogAttributionSync } from '@/components/analytics/PostHogAttributionSync';
import { PostHogPageView } from '@/components/analytics/PostHogPageView';
import { COOKIE_CONSENT_STORAGE_KEY, parseConsentValue } from '@/lib/cookie-consent';
import type { CookieConsentStatus, CookieConsentValue } from '@/lib/cookie-consent';
import { initPostHog } from '@/lib/posthog-client';

type AnalyticsConsentProviderProps = {
  children: React.ReactNode;
};

function readStoredConsent(): CookieConsentStatus {
  if (typeof window === 'undefined') {
    return 'pending';
  }
  return parseConsentValue(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

function persistConsent(value: CookieConsentValue) {
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
}

/**
 * Gates PostHog behind analytics cookie consent and shows the consent banner.
 */
export function AnalyticsConsentProvider(props: AnalyticsConsentProviderProps) {
  const [status, setStatus] = useState<CookieConsentStatus>('pending');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStatus(readStoredConsent());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (status === 'analytics') {
      initPostHog();
    }
  }, [status]);

  const acceptAnalytics = () => {
    persistConsent('analytics');
    setStatus('analytics');
    initPostHog();
  };

  const rejectAnalytics = () => {
    persistConsent('essential');
    setStatus('essential');
  };

  const reopenBanner = () => {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    setStatus('pending');
  };

  const showBanner = hydrated && status === 'pending';
  const analyticsOn = status === 'analytics';

  return (
    <AnalyticsConsentContext
      value={{
        status,
        acceptAnalytics,
        rejectAnalytics,
        reopenBanner,
      }}
    >
      {props.children}
      {showBanner ? <CookieConsentBanner /> : null}
      {analyticsOn ? (
        <>
          <PostHogAttributionSync />
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
        </>
      ) : null}
    </AnalyticsConsentContext>
  );
}

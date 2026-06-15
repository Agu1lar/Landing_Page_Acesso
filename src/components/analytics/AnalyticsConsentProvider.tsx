'use client';

import { Suspense, useEffect, useState } from 'react';
import { AnalyticsConsentContext } from '@/components/analytics/AnalyticsConsentContext';
import { CookieConsentBanner } from '@/components/analytics/CookieConsentBanner';
import { CookieConsentGoogleLead } from '@/components/analytics/CookieConsentGoogleLead';
import { GaPageView } from '@/components/analytics/GaPageView';
import { GoogleAnalyticsScripts } from '@/components/analytics/GoogleAnalyticsScripts';
import { PostHogAttributionSync } from '@/components/analytics/PostHogAttributionSync';
import { PageEngagementTracker } from '@/components/analytics/PageEngagementTracker';
import { PostHogPageView } from '@/components/analytics/PostHogPageView';
import { COOKIE_CONSENT_STORAGE_KEY, parseConsentValue } from '@/lib/cookie-consent';
import type { CookieConsentStatus, CookieConsentValue } from '@/lib/cookie-consent';
import {
  denyGoogleAnalyticsConsent,
  grantGoogleAnalyticsConsent,
  isGoogleAnalyticsConfigured,
} from '@/lib/google-analytics';
import { initPostHog } from '@/lib/posthog-client';
import { recordAnalyticsConsent } from '@/lib/record-analytics-consent';

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
    if (readStoredConsent() === 'analytics' && isGoogleAnalyticsConfigured()) {
      grantGoogleAnalyticsConsent();
    }
  }, []);

  useEffect(() => {
    if (status === 'analytics') {
      initPostHog();
      grantGoogleAnalyticsConsent();
    }
  }, [status]);

  const acceptAnalytics = () => {
    persistConsent('analytics');
    setStatus('analytics');
    initPostHog();
    grantGoogleAnalyticsConsent();
    void recordAnalyticsConsent('accept');
  };

  const rejectAnalytics = () => {
    persistConsent('essential');
    setStatus('essential');
    denyGoogleAnalyticsConsent();
    void recordAnalyticsConsent('reject');
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
      <GoogleAnalyticsScripts />
      {props.children}
      {showBanner ? <CookieConsentBanner /> : null}
      {analyticsOn ? (
        <>
          <CookieConsentGoogleLead />
          <PostHogAttributionSync />
          <Suspense fallback={null}>
            <GaPageView />
            <PageEngagementTracker />
            <PostHogPageView />
          </Suspense>
        </>
      ) : null}
    </AnalyticsConsentContext>
  );
}

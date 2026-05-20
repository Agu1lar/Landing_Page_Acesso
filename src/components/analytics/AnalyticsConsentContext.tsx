'use client';

import { createContext, useContext } from 'react';
import type { CookieConsentStatus } from '@/lib/cookie-consent';

type AnalyticsConsentContextValue = {
  status: CookieConsentStatus;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  reopenBanner: () => void;
};

const AnalyticsConsentContext = createContext<AnalyticsConsentContextValue | null>(null);

/**
 * Reads analytics consent state and actions from context.
 */
export function useAnalyticsConsent() {
  const value = useContext(AnalyticsConsentContext);
  if (!value) {
    throw new Error('useAnalyticsConsent must be used within AnalyticsConsentProvider');
  }
  return value;
}

export { AnalyticsConsentContext };

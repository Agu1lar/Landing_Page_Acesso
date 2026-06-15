/**
 * Google Analytics 4 + Consent Mode v2 (optional — requires NEXT_PUBLIC_GA_MEASUREMENT_ID).
 */

export const GA_CONVERSION_EVENTS = {
  whatsappClick: 'whatsapp_click',
  phoneClick: 'phone_click',
  generateLead: 'generate_lead',
} as const;

let consentGranted = false;

export function getGaMeasurementId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;
}

export function isGoogleAnalyticsConfigured() {
  return Boolean(getGaMeasurementId());
}

export function isGoogleAnalyticsConsentGranted() {
  return consentGranted;
}

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }
  window.gtag(...args);
}

/**
 * Called after the user accepts analytics cookies (same moment as PostHog).
 */
export function grantGoogleAnalyticsConsent() {
  if (!isGoogleAnalyticsConfigured()) {
    return;
  }

  gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'denied',
  });

  consentGranted = true;
}

/**
 * Revokes ad/analytics storage (essential cookies remain).
 */
export function denyGoogleAnalyticsConsent() {
  if (!isGoogleAnalyticsConfigured()) {
    return;
  }

  gtag('consent', 'update', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  consentGranted = false;
}

export type GaEventParams = Record<string, string | number | undefined>;

/**
 * Sends a conversion event to GA4 (only after consent is granted).
 */
export function captureGaEvent(eventName: string, params?: GaEventParams) {
  if (!consentGranted || !isGoogleAnalyticsConfigured()) {
    return;
  }

  const cleaned: Record<string, string | number> = {};
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
  }

  gtag('event', eventName, cleaned);
}

/**
 * Sends a page_view to GA4 after consent.
 */
export function captureGaPageView(pagePath: string, pageTitle?: string) {
  if (!consentGranted || !isGoogleAnalyticsConfigured()) {
    return;
  }

  gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle ?? document.title,
  });
}

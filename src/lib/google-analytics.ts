/**
 * Google Analytics 4 + Google Ads (gtag) with Consent Mode v2.
 * GA4: NEXT_PUBLIC_GA_MEASUREMENT_ID (G-…)
 * Ads: NEXT_PUBLIC_GOOGLE_ADS_ID (AW-…)
 * Optional conversion labels (full send_to): NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LEAD / _WHATSAPP
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

export function getGoogleAdsId() {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || null;
}

/** Full `send_to` value, e.g. AW-11323862073/AbCdEfGh */
export function getGoogleAdsLeadConversionSendTo() {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LEAD?.trim() || null;
}

export function getGoogleAdsWhatsAppConversionSendTo() {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_WHATSAPP?.trim() || null;
}

export function isGoogleAnalyticsConfigured() {
  return Boolean(getGaMeasurementId() || getGoogleAdsId());
}

export function isGoogleAnalyticsConsentGranted() {
  return consentGranted;
}

/** Primary ID used to load gtag.js (GA4 preferred, else Ads). */
export function getGtagBootstrapId() {
  return getGaMeasurementId() || getGoogleAdsId();
}

/**
 * Queues gtag calls even before the afterInteractive shim defines window.gtag.
 * Dropping early calls left Consent Mode on default denied while consentGranted was true.
 */
function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag(...args);
    return;
  }

  const win = window as Window & { dataLayer?: unknown[] };
  win.dataLayer = win.dataLayer || [];
  win.dataLayer.push(args);
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
 * Sends an event to GA4 (only after consent is granted).
 */
export function captureGaEvent(eventName: string, params?: GaEventParams) {
  if (!consentGranted || !getGaMeasurementId()) {
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
 * Fires a Google Ads conversion when a send_to label is configured.
 */
export function captureGoogleAdsConversion(sendTo: string | null | undefined, params?: GaEventParams) {
  if (!consentGranted || !sendTo?.trim()) {
    return;
  }

  const cleaned: Record<string, string | number> = {
    send_to: sendTo.trim(),
    // Survive same-tab navigations (e.g. wa.me without target=_blank).
    transport_type: 'beacon',
  };
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    }
  }

  gtag('event', 'conversion', cleaned);
}

export function captureGoogleAdsLeadConversion(params?: GaEventParams) {
  captureGoogleAdsConversion(getGoogleAdsLeadConversionSendTo(), params);
}

export function captureGoogleAdsWhatsAppConversion(params?: GaEventParams) {
  captureGoogleAdsConversion(getGoogleAdsWhatsAppConversionSendTo(), params);
}

/**
 * Sends a page_view to GA4 after consent.
 */
export function captureGaPageView(pagePath: string, pageTitle?: string) {
  if (!consentGranted || !getGaMeasurementId()) {
    return;
  }

  gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle ?? document.title,
  });
}

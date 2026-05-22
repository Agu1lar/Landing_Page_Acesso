import { getPostHog } from '@/lib/posthog-client';

export type WhatsAppClickInput = {
  origin: string;
  equipmentSlug?: string;
  equipmentName?: string;
};

/**
 * Sends whatsapp_click to PostHog when a tracked WhatsApp link is used.
 */
export function captureWhatsAppClick(input: WhatsAppClickInput) {
  const posthog = getPostHog();
  if (!posthog) {
    return;
  }

  posthog.capture('whatsapp_click', {
    origin: input.origin,
    equipment_slug: input.equipmentSlug,
    equipment_name: input.equipmentName,
    pathname: typeof window === 'undefined' ? undefined : window.location.pathname,
  });
}

export type SearchEventInput = {
  query: string;
  resultsCount: number;
};

/**
 * Sends search event to PostHog when the user searches equipment.
 */
export function captureSearch(input: SearchEventInput) {
  const posthog = getPostHog();
  if (!posthog) {
    return;
  }

  const query = input.query.trim();
  if (query.length < 2) {
    return;
  }

  posthog.capture('search', {
    query,
    results_count: input.resultsCount,
    pathname: typeof window === 'undefined' ? undefined : window.location.pathname,
  });
}

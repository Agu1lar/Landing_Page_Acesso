import { readStoredAttribution } from '@/lib/attribution';
import { GA_CONVERSION_EVENTS, captureGaEvent } from '@/lib/google-analytics';
import { captureWhatsAppClick, type WhatsAppClickInput } from '@/lib/posthog-events';

/**
 * Detects mobile vs desktop for analytics device breakdown.
 */
function detectDevice() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
}

/**
 * Sends whatsapp_click to PostHog and persists the event in Neon.
 */
export function trackWhatsAppClick(input: WhatsAppClickInput) {
  captureWhatsAppClick(input);

  captureGaEvent(GA_CONVERSION_EVENTS.whatsappClick, {
    origin: input.origin,
    equipment_slug: input.equipmentSlug,
    equipment_name: input.equipmentName,
  });

  if (typeof window === 'undefined') {
    return;
  }

  const attribution = readStoredAttribution();
  const pathname = window.location.pathname;

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'whatsapp_click',
      origin: input.origin,
      equipmentSlug: input.equipmentSlug,
      equipmentName: input.equipmentName,
      pathname,
      device: detectDevice(),
      attribution: attribution ?? undefined,
    }),
    keepalive: true,
  });
}

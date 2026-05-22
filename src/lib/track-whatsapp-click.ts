import { readStoredAttribution } from '@/lib/attribution';
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

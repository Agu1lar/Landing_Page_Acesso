import { readStoredAttribution } from '@/lib/attribution';
import { readStoredVisitorGeo } from '@/lib/visitor-geo';

export type PersistAnalyticsEventInput = {
  eventType: string;
  origin?: string;
  equipmentSlug?: string;
  equipmentName?: string;
  pathname?: string;
  device?: 'mobile' | 'desktop';
};

function detectDevice() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.matchMedia('(max-width: 768px)').matches ? 'mobile' : 'desktop';
}

/**
 * Persists a funnel or engagement event in Neon (sendBeacon when possible).
 */
export function persistAnalyticsEvent(input: PersistAnalyticsEventInput) {
  if (typeof window === 'undefined') {
    return;
  }

  const attribution = readStoredAttribution();
  const visitorGeo = readStoredVisitorGeo();
  const pathname = input.pathname ?? window.location.pathname;

  const body = JSON.stringify({
    eventType: input.eventType,
    origin: input.origin,
    equipmentSlug: input.equipmentSlug,
    equipmentName: input.equipmentName,
    pathname,
    device: input.device ?? detectDevice(),
    attribution: attribution ?? undefined,
    visitorGeo: visitorGeo ?? undefined,
  });

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon(
      '/api/analytics',
      new Blob([body], { type: 'application/json' }),
    );
    return;
  }

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  });
}

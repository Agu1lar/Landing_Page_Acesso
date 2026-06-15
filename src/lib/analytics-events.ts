import { db } from '@/libs/DB';
import { analyticsEventsSchema } from '@/models/Schema';
import type { AttributionInput } from '@/lib/attribution';

export type RecordAnalyticsEventInput = {
  eventType: 'whatsapp_click' | 'quote_submit';
  origin?: string;
  equipmentSlug?: string;
  equipmentName?: string;
  pathname?: string;
  device?: string;
  attribution?: AttributionInput;
};

/**
 * Persists a conversion event for the operational dashboard.
 */
export async function recordAnalyticsEvent(input: RecordAnalyticsEventInput) {
  const attribution = input.attribution;

  const [row] = await db
    .insert(analyticsEventsSchema)
    .values({
      eventType: input.eventType,
      origin: input.origin ?? null,
      equipmentSlug: input.equipmentSlug ?? null,
      equipmentName: input.equipmentName ?? null,
      pathname: input.pathname ?? null,
      device: input.device ?? null,
      utmSource: attribution?.utmSource ?? null,
      utmMedium: attribution?.utmMedium ?? null,
      utmCampaign: attribution?.utmCampaign ?? null,
      utmContent: attribution?.utmContent ?? null,
      utmTerm: attribution?.utmTerm ?? null,
      gclid: attribution?.gclid ?? null,
      gbraid: attribution?.gbraid ?? null,
      wbraid: attribution?.wbraid ?? null,
      referrer: attribution?.referrer ?? null,
      landingPage: attribution?.landingPage ?? null,
    })
    .returning({ id: analyticsEventsSchema.id });

  return row;
}

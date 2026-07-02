import { NextResponse } from 'next/server';
import * as z from 'zod';
import { recordAnalyticsEvent } from '@/lib/analytics-events';
import { AttributionSchema } from '@/lib/attribution';
import { VisitorGeoSchema } from '@/lib/visitor-geo';
import { logger } from '@/libs/Logger';

const VisitorGeoPayloadSchema = VisitorGeoSchema.extend({
  pathname: z.string().max(500).optional(),
  attribution: AttributionSchema.optional(),
});

export const POST = async (request: Request) => {
  try {
    const json = await request.json();
    const parsed = VisitorGeoPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    if (!parsed.data.geoCity?.trim() && !parsed.data.geoRegion?.trim()) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const row = await recordAnalyticsEvent({
      eventType: 'visitor_geo',
      origin: 'site-analytics-geo',
      pathname: parsed.data.pathname,
      attribution: parsed.data.attribution,
      visitorGeo: {
        geoCity: parsed.data.geoCity,
        geoRegion: parsed.data.geoRegion,
        geoCountry: parsed.data.geoCountry,
      },
    });

    return NextResponse.json({ ok: true, id: row?.id });
  } catch (error) {
    logger.error('Failed to record visitor geo', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to record visitor geo' }, { status: 500 });
  }
};

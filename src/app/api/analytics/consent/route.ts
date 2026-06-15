import { fixedWindow } from '@arcjet/next';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { recordAnalyticsEvent } from '@/lib/analytics-events';
import { AttributionSchema } from '@/lib/attribution';
import arcjet from '@/libs/Arcjet';
import { logger } from '@/libs/Logger';

const aj = arcjet.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: '15m',
    max: 30,
  }),
);

const AnalyticsConsentSchema = z.object({
  action: z.enum(['accept', 'reject']),
  pathname: z.string().max(500).optional(),
  attribution: AttributionSchema.optional(),
});

export const POST = async (request: Request) => {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await request.json();
    const parsed = AnalyticsConsentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const row = await recordAnalyticsEvent({
      eventType: 'analytics_consent',
      origin: parsed.data.action === 'accept' ? 'site-analytics-accept' : 'site-analytics-reject',
      pathname: parsed.data.pathname,
      attribution: parsed.data.attribution,
    });

    return NextResponse.json({ ok: true, id: row?.id });
  } catch (error) {
    logger.error('Failed to record analytics consent', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to record consent' }, { status: 500 });
  }
};

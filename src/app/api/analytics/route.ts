import { fixedWindow } from '@arcjet/next';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { recordAnalyticsEvent } from '@/lib/analytics-events';
import arcjet from '@/libs/Arcjet';
import { logger } from '@/libs/Logger';
import { AnalyticsEventSchema } from '@/validations/analytics';

const aj = arcjet.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: '15m',
    max: 60,
  }),
);

export const POST = async (request: Request) => {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await request.json();
    const parsed = AnalyticsEventSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const data = parsed.data;
    await recordAnalyticsEvent({
      eventType: data.eventType,
      origin: data.origin,
      equipmentSlug: data.equipmentSlug,
      equipmentName: data.equipmentName,
      pathname: data.pathname,
      device: data.device,
      attribution: data.attribution,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Failed to record analytics event', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
};

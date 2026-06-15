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
    max: 60,
  }),
);

const OneTapPromptSchema = z.object({
  outcome: z.enum(['not_displayed', 'skipped', 'dismissed', 'registered']),
  reason: z.string().max(120),
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
    const parsed = OneTapPromptSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const row = await recordAnalyticsEvent({
      eventType: 'one_tap_prompt',
      origin: `${parsed.data.outcome}:${parsed.data.reason}`,
      pathname: parsed.data.pathname,
      attribution: parsed.data.attribution,
    });

    return NextResponse.json({ ok: true, id: row?.id });
  } catch (error) {
    logger.error('Failed to record One Tap prompt outcome', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to record prompt outcome' }, { status: 500 });
  }
};

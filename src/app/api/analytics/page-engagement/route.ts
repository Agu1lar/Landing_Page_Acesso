import { fixedWindow } from '@arcjet/next';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { recordPageEngagement } from '@/lib/page-engagement-server';
import arcjet from '@/libs/Arcjet';
import { logger } from '@/libs/Logger';
import { PageEngagementSchema } from '@/validations/page-engagement';

const aj = arcjet.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: '15m',
    max: 120,
  }),
);

export const POST = async (request: Request) => {
  try {
    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await request.json();
    const parsed = PageEngagementSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    await recordPageEngagement(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Failed to record page engagement', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to record engagement' }, { status: 500 });
  }
};

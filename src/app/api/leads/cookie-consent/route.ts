import { fixedWindow } from '@arcjet/next';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { AttributionSchema } from '@/lib/attribution';
import { verifyGoogleIdToken } from '@/lib/google-id-token';
import { createCookieConsentLead } from '@/lib/leads';
import arcjet from '@/libs/Arcjet';
import { logger } from '@/libs/Logger';

const aj = arcjet.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: '15m',
    max: 12,
  }),
);

const CookieConsentLeadSchema = z.object({
  credential: z.string().min(20).max(8_000),
  attribution: AttributionSchema.optional(),
});

export const POST = async (request: Request) => {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      return NextResponse.json({ error: 'Google sign-in not configured' }, { status: 503 });
    }

    const decision = await aj.protect(request);
    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const json = await request.json();
    const parsed = CookieConsentLeadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: z.treeifyError(parsed.error) },
        { status: 422 },
      );
    }

    const profile = await verifyGoogleIdToken(parsed.data.credential, clientId);
    if (!profile) {
      return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 });
    }

    const result = await createCookieConsentLead({
      profile,
      attribution: parsed.data.attribution,
    });

    if (result.reason === 'quote_exists') {
      return NextResponse.json({ ok: true, skipped: 'quote_exists' });
    }

    return NextResponse.json({
      ok: true,
      id: result.lead?.id,
      created: result.reason === 'created',
    });
  } catch (error) {
    logger.error('Failed to create cookie-consent lead', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to register lead' }, { status: 500 });
  }
};

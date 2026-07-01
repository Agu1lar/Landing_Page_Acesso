import { NextResponse } from 'next/server';
import * as z from 'zod';
import { verifyGoogleIdToken } from '@/lib/google-id-token';
import { updateCookieConsentLeadPhone } from '@/lib/leads';
import { CookieConsentPhoneSchema, normalizeCookieConsentPhone } from '@/validations/cookie-consent-contact';
import { logger } from '@/libs/Logger';

const CookieConsentPhoneBodySchema = z.object({
  credential: z.string().min(20).max(8_000),
  phone: CookieConsentPhoneSchema.shape.phone,
});

export const POST = async (request: Request) => {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      return NextResponse.json({ error: 'Google sign-in not configured' }, { status: 503 });
    }

    const json = await request.json();
    const parsed = CookieConsentPhoneBodySchema.safeParse(json);

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

    const phone = normalizeCookieConsentPhone(parsed.data.phone);
    const result = await updateCookieConsentLeadPhone({ profile, phone });

    if (result.reason === 'not_found') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      id: result.lead?.id,
      updated: result.reason === 'updated',
      skipped: result.reason === 'already_has_phone' ? 'already_has_phone' : undefined,
    });
  } catch (error) {
    logger.error('Failed to update cookie-consent lead phone', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to update phone' }, { status: 500 });
  }
};

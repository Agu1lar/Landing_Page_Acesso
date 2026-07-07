import { NextResponse } from 'next/server';
import * as z from 'zod';
import {
  AUTH_FORGOT_PASSWORD_RATE_LIMIT,
  enforceAuthRateLimits,
} from '@/lib/dashboard-auth-rate-limit';
import { isAllowedDashboardEmail, normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import { requestDashboardPasswordReset } from '@/lib/dashboard-password-reset';

const BodySchema = z.object({
  email: z
    .string()
    .trim()
    .max(320)
    .transform(normalizeAllowlistEmail)
    .refine(isAllowedDashboardEmail, { message: 'invalid_email' }),
});

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 422 });
  }

  const allowed = await enforceAuthRateLimits(
    request,
    AUTH_FORGOT_PASSWORD_RATE_LIMIT,
    parsed.data.email,
  );
  if (!allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const result = await requestDashboardPasswordReset(parsed.data.email);

  if (!result.ok) {
    if (result.reason === 'user_not_found') {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'email_send_failed' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

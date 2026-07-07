import { NextResponse } from 'next/server';
import * as z from 'zod';
import {
  AUTH_RESET_PASSWORD_RATE_LIMIT,
  enforceAuthRateLimits,
} from '@/lib/dashboard-auth-rate-limit';
import { isAllowedDashboardEmail, normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import {
  isValidResetCodeFormat,
  normalizeResetCode,
  validateDashboardPassword,
} from '@/lib/dashboard-password-policy';
import { completeDashboardPasswordReset } from '@/lib/dashboard-password-reset';

const BodySchema = z.object({
  email: z
    .string()
    .trim()
    .max(320)
    .transform(normalizeAllowlistEmail)
    .refine(isAllowedDashboardEmail, { message: 'invalid_email' }),
  code: z.string().transform(normalizeResetCode).refine(isValidResetCodeFormat, {
    message: 'invalid_code',
  }),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message;
    if (issue === 'invalid_code') {
      return NextResponse.json({ error: 'invalid_code' }, { status: 422 });
    }
    return NextResponse.json({ error: 'invalid_email' }, { status: 422 });
  }

  const passwordIssue = validateDashboardPassword(parsed.data.password);
  if (passwordIssue === 'too_short') {
    return NextResponse.json({ error: 'password_too_short' }, { status: 422 });
  }
  if (passwordIssue === 'too_long') {
    return NextResponse.json({ error: 'password_too_long' }, { status: 422 });
  }

  const allowed = await enforceAuthRateLimits(
    request,
    AUTH_RESET_PASSWORD_RATE_LIMIT,
    parsed.data.email,
  );
  if (!allowed) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const result = await completeDashboardPasswordReset(
    parsed.data.email,
    parsed.data.code,
    parsed.data.password,
  );

  if (!result.ok) {
    const status =
      result.reason === 'user_not_found'
        ? 404
        : result.reason === 'too_many_attempts'
          ? 429
          : 400;
    return NextResponse.json({ error: result.reason }, { status });
  }

  return NextResponse.json({ ok: true });
}

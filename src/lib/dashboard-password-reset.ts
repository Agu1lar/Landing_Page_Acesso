import { randomInt } from 'node:crypto';
import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { hashDashboardPassword, verifyDashboardPassword } from '@/lib/dashboard-password';
import { isValidResetCodeFormat } from '@/lib/dashboard-password-policy';
import { normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import { db } from '@/libs/DB';
import { dashboardAllowlistSchema, dashboardPasswordResetSchema } from '@/models/Schema';
import { sendDashboardPasswordResetEmail } from '@/lib/dashboard-auth-email';
import { updateAllowlistPassword } from '@/lib/dashboard-allowlist';

const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

function generateResetCode() {
  return String(randomInt(100_000, 1_000_000));
}

/**
 * Looks up a dashboard user by e-mail (registered in the allowlist).
 */
export async function findDashboardUserByEmail(email: string) {
  const normalized = normalizeAllowlistEmail(email);
  const [row] = await db
    .select({
      id: dashboardAllowlistSchema.id,
      email: dashboardAllowlistSchema.email,
    })
    .from(dashboardAllowlistSchema)
    .where(eq(dashboardAllowlistSchema.email, normalized))
    .limit(1);

  return row ?? null;
}

/**
 * Creates a reset code and e-mails it when the user exists.
 */
export async function requestDashboardPasswordReset(email: string) {
  const user = await findDashboardUserByEmail(email);
  if (!user) {
    return { ok: false as const, reason: 'user_not_found' as const };
  }

  const code = generateResetCode();
  const codeHash = hashDashboardPassword(code);
  const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MS);

  await db
    .delete(dashboardPasswordResetSchema)
    .where(eq(dashboardPasswordResetSchema.email, user.email));

  await db.insert(dashboardPasswordResetSchema).values({
    email: user.email,
    codeHash,
    expiresAt,
    attemptCount: 0,
  });

  const sent = await sendDashboardPasswordResetEmail(user.email, code);
  if (!sent.ok) {
    await db
      .delete(dashboardPasswordResetSchema)
      .where(eq(dashboardPasswordResetSchema.email, user.email));
    return { ok: false as const, reason: sent.reason };
  }

  return { ok: true as const, email: user.email };
}

export type CompletePasswordResetResult =
  | { ok: true; email: string }
  | {
      ok: false;
      reason:
        | 'user_not_found'
        | 'no_active_code'
        | 'code_expired'
        | 'invalid_code'
        | 'too_many_attempts';
    };

/**
 * Verifies reset code and updates the user's password.
 */
export async function completeDashboardPasswordReset(
  email: string,
  code: string,
  newPassword: string,
): Promise<CompletePasswordResetResult> {
  if (!isValidResetCodeFormat(code)) {
    return { ok: false, reason: 'invalid_code' };
  }

  const user = await findDashboardUserByEmail(email);
  if (!user) {
    return { ok: false, reason: 'user_not_found' };
  }

  const now = new Date();
  const [resetRow] = await db
    .select()
    .from(dashboardPasswordResetSchema)
    .where(
      and(
        eq(dashboardPasswordResetSchema.email, user.email),
        gt(dashboardPasswordResetSchema.expiresAt, now),
      ),
    )
    .orderBy(desc(dashboardPasswordResetSchema.createdAt))
    .limit(1);

  if (!resetRow) {
    return { ok: false, reason: 'no_active_code' };
  }

  if (resetRow.attemptCount >= MAX_VERIFY_ATTEMPTS) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  const codeValid = verifyDashboardPassword(code, resetRow.codeHash);

  if (!codeValid) {
    await db
      .update(dashboardPasswordResetSchema)
      .set({ attemptCount: sql`${dashboardPasswordResetSchema.attemptCount} + 1` })
      .where(eq(dashboardPasswordResetSchema.id, resetRow.id));

    if (resetRow.attemptCount + 1 >= MAX_VERIFY_ATTEMPTS) {
      return { ok: false, reason: 'too_many_attempts' };
    }

    return { ok: false, reason: 'invalid_code' };
  }

  const updated = await updateAllowlistPassword({ id: user.id, password: newPassword });
  if (!updated.ok) {
    return { ok: false, reason: 'user_not_found' };
  }

  await db
    .delete(dashboardPasswordResetSchema)
    .where(eq(dashboardPasswordResetSchema.email, user.email));

  return { ok: true, email: user.email };
}

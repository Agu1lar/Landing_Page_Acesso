import { asc, count, eq } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import type { DashboardRole } from '@/lib/auth-roles';
import { db } from '@/libs/DB';
import { dashboardAllowlistSchema } from '@/models/Schema';

export type AllowlistEntry = InferSelectModel<typeof dashboardAllowlistSchema>;

/** Normalizes e-mail for allowlist matching. */
export function normalizeAllowlistEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseAllowlistRole(role: string | null | undefined): DashboardRole | undefined {
  if (role === 'admin' || role === 'comercial') {
    return role;
  }
  return undefined;
}

/** Total rows in the allowlist table. */
export async function countAllowlistEntries() {
  const [row] = await db.select({ count: count() }).from(dashboardAllowlistSchema);
  return row?.count ?? 0;
}

/** Lists authorized e-mails ordered by creation date. */
export async function listAllowlistEntries() {
  return db.select().from(dashboardAllowlistSchema).orderBy(asc(dashboardAllowlistSchema.createdAt));
}

/** Resolves dashboard role for a signed-in user's e-mail. */
export async function getAllowlistRoleByEmail(email: string) {
  const normalized = normalizeAllowlistEmail(email);
  const [row] = await db
    .select()
    .from(dashboardAllowlistSchema)
    .where(eq(dashboardAllowlistSchema.email, normalized))
    .limit(1);

  return parseAllowlistRole(row?.role);
}

export type AddAllowlistEntryInput = {
  email: string;
  role: DashboardRole;
  addedByEmail?: string;
};

export async function addAllowlistEntry(input: AddAllowlistEntryInput) {
  const email = normalizeAllowlistEmail(input.email);

  const [existing] = await db
    .select({ id: dashboardAllowlistSchema.id })
    .from(dashboardAllowlistSchema)
    .where(eq(dashboardAllowlistSchema.email, email))
    .limit(1);

  if (existing) {
    return { ok: false as const, reason: 'duplicate' as const };
  }

  const [row] = await db
    .insert(dashboardAllowlistSchema)
    .values({
      email,
      role: input.role,
      addedByEmail: input.addedByEmail ? normalizeAllowlistEmail(input.addedByEmail) : null,
    })
    .returning();

  return { ok: true as const, entry: row };
}

export type RemoveAllowlistEntryInput = {
  id: number;
  actorEmail: string;
};

export async function removeAllowlistEntry(input: RemoveAllowlistEntryInput) {
  const actorEmail = normalizeAllowlistEmail(input.actorEmail);

  const [target] = await db
    .select()
    .from(dashboardAllowlistSchema)
    .where(eq(dashboardAllowlistSchema.id, input.id))
    .limit(1);

  if (!target) {
    return { ok: false as const, reason: 'not_found' as const };
  }

  const [adminCountRow] = await db
    .select({ count: count() })
    .from(dashboardAllowlistSchema)
    .where(eq(dashboardAllowlistSchema.role, 'admin'));

  const adminCount = adminCountRow?.count ?? 0;

  if (target.role === 'admin' && adminCount <= 1) {
    return { ok: false as const, reason: 'last_admin' as const };
  }

  if (normalizeAllowlistEmail(target.email) === actorEmail && target.role === 'admin' && adminCount <= 1) {
    return { ok: false as const, reason: 'self_last_admin' as const };
  }

  await db.delete(dashboardAllowlistSchema).where(eq(dashboardAllowlistSchema.id, input.id));

  return { ok: true as const, email: target.email };
}

/** Counts admins in the allowlist — used for guard rails. */
export async function countAllowlistAdmins() {
  const [row] = await db
    .select({ count: count() })
    .from(dashboardAllowlistSchema)
    .where(eq(dashboardAllowlistSchema.role, 'admin'));
  return row?.count ?? 0;
}

/** True when allowlist mode is active (at least one e-mail registered). */
export async function isAllowlistEnforced() {
  return (await countAllowlistEntries()) > 0;
}

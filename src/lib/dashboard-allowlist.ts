import { asc, count, eq, isNotNull } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import type { DashboardRole } from '@/lib/auth-roles';
import { hashDashboardPassword, verifyDashboardPassword } from '@/lib/dashboard-password';
import { normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import { db } from '@/libs/DB';
import { dashboardAllowlistSchema } from '@/models/Schema';

export type { AllowlistEntry } from '@/lib/dashboard-allowlist-email';
export { isAllowedDashboardEmail, normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';

export type AllowlistRecord = InferSelectModel<typeof dashboardAllowlistSchema>;

export type DashboardUserListItem = {
  id: number;
  email: string;
  role: DashboardRole;
  addedByEmail: string | null;
  createdAt: Date;
  hasPassword: boolean;
};

function parseAllowlistRole(role: string | null | undefined): DashboardRole | undefined {
  if (role === 'admin' || role === 'comercial') {
    return role;
  }
  return undefined;
}

function toListItem(row: AllowlistRecord): DashboardUserListItem {
  return {
    id: row.id,
    email: row.email,
    role: row.role as DashboardRole,
    addedByEmail: row.addedByEmail,
    createdAt: row.createdAt,
    hasPassword: Boolean(row.passwordHash),
  };
}

/** Total rows in the dashboard users table. */
export async function countAllowlistEntries() {
  const [row] = await db.select({ count: count() }).from(dashboardAllowlistSchema);
  return row?.count ?? 0;
}

/** Lists dashboard users ordered by creation date. */
export async function listAllowlistEntries(): Promise<DashboardUserListItem[]> {
  const rows = await db
    .select()
    .from(dashboardAllowlistSchema)
    .orderBy(asc(dashboardAllowlistSchema.createdAt));

  return rows.map(toListItem);
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

/** Authenticates e-mail + password against dashboard users. */
export async function authenticateDashboardUser(email: string, password: string) {
  const normalized = normalizeAllowlistEmail(email);
  const [row] = await db
    .select()
    .from(dashboardAllowlistSchema)
    .where(eq(dashboardAllowlistSchema.email, normalized))
    .limit(1);

  if (!row?.passwordHash) {
    return null;
  }

  const role = parseAllowlistRole(row.role);
  if (!role || !verifyDashboardPassword(password, row.passwordHash)) {
    return null;
  }

  return { id: row.id, email: row.email, role };
}

export type AddAllowlistEntryInput = {
  email: string;
  role: DashboardRole;
  password: string;
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
      passwordHash: hashDashboardPassword(input.password),
      addedByEmail: input.addedByEmail ? normalizeAllowlistEmail(input.addedByEmail) : null,
    })
    .returning();

  if (!row) {
    return { ok: false as const, reason: 'duplicate' as const };
  }

  return { ok: true as const, entry: toListItem(row) };
}

export type UpdateAllowlistPasswordInput = {
  id: number;
  password: string;
};

export async function updateAllowlistPassword(input: UpdateAllowlistPasswordInput) {
  const [row] = await db
    .update(dashboardAllowlistSchema)
    .set({ passwordHash: hashDashboardPassword(input.password) })
    .where(eq(dashboardAllowlistSchema.id, input.id))
    .returning();

  if (!row) {
    return { ok: false as const, reason: 'not_found' as const };
  }

  return { ok: true as const, entry: toListItem(row) };
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

/** Counts admins — used for guard rails. */
export async function countAllowlistAdmins() {
  const [row] = await db
    .select({ count: count() })
    .from(dashboardAllowlistSchema)
    .where(eq(dashboardAllowlistSchema.role, 'admin'));
  return row?.count ?? 0;
}

/** True when at least one dashboard user has a password set. */
export async function isAllowlistEnforced() {
  const [row] = await db
    .select({ count: count() })
    .from(dashboardAllowlistSchema)
    .where(isNotNull(dashboardAllowlistSchema.passwordHash));
  return (row?.count ?? 0) > 0;
}

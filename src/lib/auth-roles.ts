import { auth, clerkClient } from '@clerk/nextjs/server';
import {
  countAllowlistEntries,
  getAllowlistRoleByEmail,
  normalizeAllowlistEmail,
} from '@/lib/dashboard-allowlist';

const DASHBOARD_ROLES = ['admin', 'comercial'] as const;

export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

type PublicMetadata = {
  role?: unknown;
};

/**
 * Reads dashboard role from Clerk public metadata.
 *
 * @param metadata - Clerk user public metadata object.
 * @returns Valid dashboard role or undefined.
 */
export function parseDashboardRoleFromMetadata(
  metadata: PublicMetadata | null | undefined,
): DashboardRole | undefined {
  const role = metadata?.role;
  if (role === 'admin' || role === 'comercial') {
    return role;
  }
  return undefined;
}

/**
 * Reads dashboard role from JWT session claims when present.
 *
 * @param sessionClaims - Clerk session JWT claims.
 * @returns Valid dashboard role or undefined.
 */
export function parseDashboardRoleFromSessionClaims(
  sessionClaims: Record<string, unknown> | null | undefined,
): DashboardRole | undefined {
  if (!sessionClaims) {
    return undefined;
  }
  const { publicMetadata } = sessionClaims;
  if (publicMetadata && typeof publicMetadata === 'object') {
    return parseDashboardRoleFromMetadata(publicMetadata as PublicMetadata);
  }
  return undefined;
}

/**
 * Reads the primary e-mail from a Clerk user record.
 */
export async function getClerkUserEmail(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? undefined;
  return email ? normalizeAllowlistEmail(email) : undefined;
}

/**
 * Resolves role from session claims, falling back to Clerk user public metadata.
 *
 * When the allowlist table has entries, only e-mails listed there may access the dashboard.
 *
 * @param userId - Clerk user id.
 * @param sessionClaims - Clerk session JWT claims.
 * @returns Valid dashboard role or undefined.
 */
export async function resolveDashboardRole(
  userId: string,
  sessionClaims: Record<string, unknown> | null | undefined,
) {
  const allowlistActive = (await countAllowlistEntries()) > 0;
  const email = await getClerkUserEmail(userId);

  if (allowlistActive) {
    if (!email) {
      return undefined;
    }
    return getAllowlistRoleByEmail(email);
  }

  const fromClaims = parseDashboardRoleFromSessionClaims(sessionClaims);
  if (fromClaims) {
    return fromClaims;
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return parseDashboardRoleFromMetadata(user.publicMetadata as PublicMetadata);
}

type DashboardAccessResult =
  | { ok: true; userId: string; role: DashboardRole }
  | { ok: false; status: 401 | 403 };

/**
 * Ensures the request is from an authenticated user with a dashboard role.
 *
 * @returns Access result with role or HTTP status to return.
 */
export async function requireDashboardAccess(): Promise<DashboardAccessResult> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { ok: false, status: 401 };
  }

  const role = await resolveDashboardRole(userId, sessionClaims as Record<string, unknown> | null);
  if (!role) {
    return { ok: false, status: 403 };
  }

  return { ok: true, userId, role };
}

/**
 * Ensures the user has admin role (equipment CRUD, settings).
 */
export async function requireAdminAccess(): Promise<DashboardAccessResult> {
  const access = await requireDashboardAccess();
  if (!access.ok) {
    return access;
  }
  if (access.role !== 'admin') {
    return { ok: false, status: 403 };
  }
  return access;
}

/**
 * Returns true when pathname is restricted to admin role only.
 */
export function isAdminOnlyDashboardPath(pathname: string) {
  return (
    /\/dashboard\/equipamentos/u.test(pathname)
    || /\/dashboard\/acesso/u.test(pathname)
  );
}

/**
 * Returns true for dashboard modules not yet shipped (blocked in middleware).
 */
export function isDeferredDashboardPath(pathname: string) {
  return (
    /\/dashboard\/exportacoes/u.test(pathname)
    || /\/dashboard\/configuracoes/u.test(pathname)
  );
}

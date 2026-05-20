import { auth, clerkClient } from '@clerk/nextjs/server';

export const DASHBOARD_ROLES = ['admin', 'comercial'] as const;

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
 * Resolves role from session claims, falling back to Clerk user public metadata.
 *
 * @param userId - Clerk user id.
 * @param sessionClaims - Clerk session JWT claims.
 * @returns Valid dashboard role or undefined.
 */
export async function resolveDashboardRole(
  userId: string,
  sessionClaims: Record<string, unknown> | null | undefined,
) {
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

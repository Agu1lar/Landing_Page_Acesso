import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import type { DashboardRole } from '@/lib/auth-roles';

export const DASHBOARD_SESSION_COOKIE = 'dashboard_session';
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

export type DashboardSession = {
  userId: number;
  email: string;
  role: DashboardRole;
  exp: number;
};

function readSessionSecret() {
  const secret = process.env.DASHBOARD_SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('DASHBOARD_SESSION_SECRET must be set in production (min 32 chars)');
  }

  return 'dev-dashboard-session-secret-min-32-chars!!';
}

function signPayload(payloadB64: string) {
  return createHmac('sha256', readSessionSecret()).update(payloadB64).digest('base64url');
}

/**
 * Encodes a signed dashboard session token for the httpOnly cookie.
 */
export function encodeDashboardSession(
  session: Omit<DashboardSession, 'exp'>,
  maxAgeSec = MAX_AGE_SEC,
) {
  const payload: DashboardSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + maxAgeSec,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

/**
 * Decodes and validates a dashboard session token.
 */
export function decodeDashboardSession(token: string | undefined | null): DashboardSession | null {
  if (!token) {
    return null;
  }

  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) {
    return null;
  }

  try {
    const expected = signPayload(payloadB64);
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    ) as DashboardSession;

    if (!session.userId || !session.email || !session.role || !session.exp) {
      return null;
    }

    if (session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (session.role !== 'admin' && session.role !== 'comercial') {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/** Reads the dashboard session from server cookies. */
export async function getDashboardSession() {
  const cookieStore = await cookies();
  return decodeDashboardSession(cookieStore.get(DASHBOARD_SESSION_COOKIE)?.value);
}

/** Reads the dashboard session from a middleware request. */
export function getDashboardSessionFromRequest(request: NextRequest) {
  return decodeDashboardSession(request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value);
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/** Sets the dashboard session cookie on a response. */
export function setDashboardSessionCookie(
  response: NextResponse,
  session: Omit<DashboardSession, 'exp'>,
) {
  response.cookies.set(DASHBOARD_SESSION_COOKIE, encodeDashboardSession(session), {
    ...cookieOptions,
    maxAge: MAX_AGE_SEC,
  });
}

/** Clears the dashboard session cookie on a response. */
export function clearDashboardSessionCookie(response: NextResponse) {
  response.cookies.set(DASHBOARD_SESSION_COOKIE, '', {
    ...cookieOptions,
    maxAge: 0,
  });
}

/** Sets the dashboard session cookie in a Server Action / route handler. */
export async function setDashboardSession(session: Omit<DashboardSession, 'exp'>) {
  const cookieStore = await cookies();
  cookieStore.set(DASHBOARD_SESSION_COOKIE, encodeDashboardSession(session), {
    ...cookieOptions,
    maxAge: MAX_AGE_SEC,
  });
}

/** Clears the dashboard session cookie in a Server Action / route handler. */
export async function clearDashboardSession() {
  const cookieStore = await cookies();
  cookieStore.set(DASHBOARD_SESSION_COOKIE, '', {
    ...cookieOptions,
    maxAge: 0,
  });
}

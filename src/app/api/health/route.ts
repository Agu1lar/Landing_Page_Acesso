import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { clerkKeyMode, isClerkProductionKeyMismatch } from '@/lib/clerk-env';
import { legacyRedirectStats } from '@/lib/legacy-redirects';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';

/**
 * Lightweight operational health for go-live checks (Clerk, DB, redirects, Resend).
 */
export async function GET() {
  const clerkMode = clerkKeyMode(Env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const clerkProductionMismatch = isClerkProductionKeyMismatch({
    vercelEnv: Env.VERCEL_ENV,
    publishableKey: Env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });

  let database: 'ok' | 'error' = 'error';
  try {
    await db.execute(sql`select 1`);
    database = 'ok';
  } catch {
    database = 'error';
  }

  const resendConfigured = Boolean(Env.RESEND_API_KEY?.startsWith('re_') && Env.LEADS_NOTIFY_EMAIL);
  const arcjetConfigured = Boolean(Env.ARCJET_KEY?.startsWith('ajkey_'));
  const databaseUsesPooler = Env.DATABASE_URL.includes('-pooler');

  const redirectStats = legacyRedirectStats();

  return NextResponse.json({
    ok: database === 'ok' && !clerkProductionMismatch,
    vercelEnv: Env.VERCEL_ENV ?? 'unknown',
    clerk: {
      mode: clerkMode,
      productionMismatch: clerkProductionMismatch,
    },
    legacyRedirects: {
      exactCount: redirectStats.exact,
      prefixCount: redirectStats.prefix,
      generatedAt: redirectStats.generatedAt,
    },
    database,
    databaseUsesPooler,
    resendConfigured,
    arcjetConfigured,
    leadsRateLimit: '8 requests / 15 min per IP (Arcjet)',
  });
}

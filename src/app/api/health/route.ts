import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { brand } from '@/lib/brand';
import { clerkKeyMode, isClerkProductionKeyMismatch } from '@/lib/clerk-env';
import { legacyRedirectStats } from '@/lib/legacy-redirects';
import { db } from '@/libs/DB';
import { Env } from '@/libs/Env';
import { getBaseUrl } from '@/utils/Helpers';

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
  let dashboardAllowlistTable: 'ok' | 'missing' | 'error' = 'error';
  try {
    await db.execute(sql`select 1`);
    database = 'ok';
  } catch {
    database = 'error';
  }

  if (database === 'ok') {
    try {
      await db.execute(sql`select 1 from dashboard_allowlist limit 1`);
      dashboardAllowlistTable = 'ok';
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dashboardAllowlistTable =
        /does not exist|relation/u.test(message) || /42P01/u.test(message) ? 'missing' : 'error';
    }
  }

  const resendConfigured = Boolean(Env.RESEND_API_KEY?.startsWith('re_') && Env.LEADS_NOTIFY_EMAIL);
  const arcjetConfigured = Boolean(Env.ARCJET_KEY?.startsWith('ajkey_'));
  const googleClientIdConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
  const ga4Configured = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
  const posthogConfigured = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
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
    dashboardAllowlistTable,
    resendConfigured,
    arcjetConfigured,
    googleClientIdConfigured,
    googleOneTap: {
      clientIdConfigured: googleClientIdConfigured,
      requiresAnalyticsConsentBeforePrompt: true,
      leadEndpoint: 'POST /api/leads/cookie-consent',
      promptTelemetryEndpoint: 'POST /api/analytics/one-tap',
      checklistDoc: 'docs/GOOGLE-ONE-TAP.md',
      authorizedOriginsHint: Array.from(
        new Set([getBaseUrl(), brand.officialSiteUrl, 'http://localhost:3000']),
      ),
    },
    ga4Configured,
    posthogConfigured,
    leadTracking: {
      cookieConsentLeadRequiresGoogleOneTap: true,
      clerkDashboardLoginDoesNotCreateLead: true,
      analyticsAcceptRecordsEvent: 'POST /api/analytics/consent',
    },
    leadsRateLimit: 'POST /api/leads only — 8 req / 15 min per IP + bot block (Arcjet)',
    aiDiscovery: {
      llmsTxt: '/llms.txt',
      publicCatalog: '/catalog.json',
      doc: 'docs/GEO-AI-SEARCH.md',
      aiCrawlersAllowed: [
        'GPTBot',
        'OAI-SearchBot',
        'ClaudeBot',
        'PerplexityBot',
        'Google-Extended',
      ],
    },
  });
}

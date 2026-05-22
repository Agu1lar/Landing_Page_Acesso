import { detectBot } from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  isAdminOnlyDashboardPath,
  isDeferredDashboardPath,
  resolveDashboardRole,
} from '@/lib/auth-roles';
import { resolveLegacyRedirect } from '@/lib/legacy-redirects';
import arcjet from '@/libs/Arcjet';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/:locale/dashboard(.*)']);

const isSignUpPage = createRouteMatcher(['/sign-up(.*)', '/:locale/sign-up(.*)']);

const isAuthPage = createRouteMatcher([
  '/sign-in(.*)',
  '/:locale/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/sign-up(.*)',
  '/unauthorized(.*)',
  '/:locale/unauthorized(.*)',
]);

function localePrefixFromPath(pathname: string) {
  return pathname.match(/(\/.*)\/(?:dashboard|sign-in|sign-up|unauthorized)/u)?.at(1) ?? '';
}

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const legacyDestination = resolveLegacyRedirect(request.nextUrl.pathname);
  if (legacyDestination) {
    return NextResponse.redirect(new URL(legacyDestination, request.url), 301);
  }

  if (isSignUpPage(request)) {
    const locale = localePrefixFromPath(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`${locale}/sign-in`, request.url));
  }

  // Clerk keyless mode doesn't work with i18n, this is why we need to run the middleware conditionally
  if (isAuthPage(request) || isProtectedRoute(request)) {
    return await clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const locale = localePrefixFromPath(req.nextUrl.pathname);
        const signInUrl = new URL(`${locale}/sign-in`, req.url);
        const unauthorizedUrl = new URL(`${locale}/unauthorized`, req.url);

        await auth.protect({
          unauthenticatedUrl: signInUrl.toString(),
        });

        const { userId, sessionClaims } = await auth();
        if (!userId) {
          return NextResponse.redirect(signInUrl);
        }

        const role = await resolveDashboardRole(
          userId,
          sessionClaims as Record<string, unknown> | null,
        );
        if (!role) {
          return NextResponse.redirect(unauthorizedUrl);
        }

        const pathname = req.nextUrl.pathname;

        if (isAdminOnlyDashboardPath(pathname) && role !== 'admin') {
          return NextResponse.redirect(unauthorizedUrl);
        }

        if (isDeferredDashboardPath(pathname)) {
          const target =
            role === 'admin' ? `${locale}/dashboard/equipamentos` : `${locale}/dashboard/leads`;
          return NextResponse.redirect(new URL(target, req.url));
        }
      }

      return handleI18nRouting(req);
    })(request, event);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/_next`, `/_vercel` or `monitoring`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!_next|_vercel|monitoring|api|.*\\..*).*)',
};

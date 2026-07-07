import createMiddleware from 'next-intl/middleware';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  isAdminOnlyDashboardPath,
  isDeferredDashboardPath,
  requireDashboardAccessFromRequest,
} from '@/lib/auth-roles';
import { resolveLegacyRedirect } from '@/lib/legacy-redirects';
import { routing } from './libs/I18nRouting';

const handleI18nRouting = createMiddleware(routing);

const isProtectedRoute = (pathname: string) =>
  /\/dashboard(?:\/|$)/u.test(pathname) || /^\/[a-z]{2}(?:-[A-Z]{2})?\/dashboard(?:\/|$)/u.test(pathname);

const isSignUpPage = (pathname: string) =>
  /\/sign-up(?:\/|$)/u.test(pathname) || /^\/[a-z]{2}(?:-[A-Z]{2})?\/sign-up(?:\/|$)/u.test(pathname);

const isSignInPage = (pathname: string) =>
  /\/sign-in(?:\/|$)/u.test(pathname) || /^\/[a-z]{2}(?:-[A-Z]{2})?\/sign-in(?:\/|$)/u.test(pathname);

function localePrefixFromPath(pathname: string) {
  return pathname.match(/(\/.*)\/(?:dashboard|sign-in|sign-up|unauthorized)/u)?.at(1) ?? '';
}

export default async function proxy(request: NextRequest, _event: NextFetchEvent) {
  const legacyDestination = resolveLegacyRedirect(request.nextUrl.pathname);
  if (legacyDestination) {
    return NextResponse.redirect(new URL(legacyDestination, request.url), 301);
  }

  const { pathname } = request.nextUrl;

  if (isSignUpPage(pathname)) {
    const locale = localePrefixFromPath(pathname);
    return NextResponse.redirect(new URL(`${locale}/sign-in`, request.url));
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (isSignInPage(pathname)) {
    const access = requireDashboardAccessFromRequest(request);
    if (access.ok) {
      const locale = localePrefixFromPath(pathname);
      return NextResponse.redirect(new URL(`${locale}/dashboard/leads`, request.url));
    }
  }

  if (isProtectedRoute(pathname)) {
    const locale = localePrefixFromPath(pathname);
    const signInUrl = new URL(`${locale}/sign-in`, request.url);
    const unauthorizedUrl = new URL(`${locale}/unauthorized`, request.url);

    const access = requireDashboardAccessFromRequest(request);
    if (!access.ok) {
      return NextResponse.redirect(signInUrl);
    }

    if (isAdminOnlyDashboardPath(pathname) && access.role !== 'admin') {
      return NextResponse.redirect(unauthorizedUrl);
    }

    if (isDeferredDashboardPath(pathname)) {
      const target =
        access.role === 'admin' ? `${locale}/dashboard/equipamentos` : `${locale}/dashboard/leads`;
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
};

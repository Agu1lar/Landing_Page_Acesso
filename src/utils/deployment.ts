import { Env } from '@/libs/Env';

/**
 * Returns true when the URL hostname is a Vercel deployment subdomain.
 */
export function isVercelAppHostUrl(url: string) {
  try {
    return /\.vercel\.app$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Whether the deployment should be hidden from search engines (Vercel preview only).
 */
export function isPreviewDeployment() {
  return Env.VERCEL_ENV === 'preview';
}

/**
 * Production still served from *.vercel.app before the official domain go-live.
 */
export function isPreLaunchVercelAppProduction() {
  if (Env.VERCEL_ENV !== 'production') {
    return false;
  }

  const configured = Env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) {
    return false;
  }

  return isVercelAppHostUrl(configured);
}

/**
 * Blocks indexing for preview deployments and pre-launch production on *.vercel.app.
 */
export function shouldBlockSearchIndexing() {
  return isPreviewDeployment() || isPreLaunchVercelAppProduction();
}

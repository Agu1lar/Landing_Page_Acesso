import { brand } from '@/lib/brand';
import { Env } from '@/libs/Env';
import { routing } from '@/libs/I18nRouting';

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

function isVercelAppHost(url: string) {
  try {
    return /\.vercel\.app$/i.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/**
 * Resolves the public base URL of the application.
 * Production uses the official domain even when `NEXT_PUBLIC_APP_URL` still points at `*.vercel.app`.
 */
export const getBaseUrl = () => {
  const configured = Env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    if (Env.VERCEL_ENV === 'production' && isVercelAppHost(configured)) {
      return brand.officialSiteUrl;
    }
    return normalizeBaseUrl(configured);
  }

  if (Env.VERCEL_ENV === 'production') {
    return brand.officialSiteUrl;
  }

  return 'http://localhost:3000';
};

/**
 * Builds a locale-aware path by prefixing non-default locales.
 * @param url The base application-relative path starting with a slash.
 * @param locale The active locale identifier.
 * @returns The localized path, prefixed when the locale is not the default locale.
 */
export const getI18nPath = (url: string, locale: string) => {
  if (locale === routing.defaultLocale) {
    return url;
  }

  return `/${locale}${url}`;
};

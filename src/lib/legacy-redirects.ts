import legacyRedirectsData from '@/data/legacy-redirects.json';

type LegacyRedirectEntry = {
  source: string;
  destination: string;
  note?: string;
};

type LegacyPrefixRedirectEntry = {
  sourcePrefix: string;
  destination: string;
  note?: string;
};

/** Normalizes pathname for legacy lookup (lowercase, no trailing slash). */
export function normalizeLegacyPathname(pathname: string) {
  const lower = pathname.toLowerCase();
  if (lower.length > 1 && lower.endsWith('/')) {
    return lower.slice(0, -1);
  }
  return lower;
}

const exactMap = new Map<string, string>();

for (const entry of legacyRedirectsData.redirects as LegacyRedirectEntry[]) {
  exactMap.set(normalizeLegacyPathname(entry.source), entry.destination);
}

const prefixRules = (legacyRedirectsData.prefixRedirects as LegacyPrefixRedirectEntry[]).map(
  (entry) => ({
    prefix: normalizeLegacyPathname(entry.sourcePrefix),
    destination: entry.destination,
  }),
);

/**
 * Resolves a permanent redirect destination for WordPress legacy URLs.
 * @param pathname Request pathname (with or without trailing slash).
 * @returns Destination path on this site, or null if no rule matches.
 */
export function resolveLegacyRedirect(pathname: string) {
  const normalized = normalizeLegacyPathname(pathname);

  const exact = exactMap.get(normalized);
  if (exact) {
    return exact;
  }

  for (const rule of prefixRules) {
    if (normalized === rule.prefix || normalized.startsWith(`${rule.prefix}/`)) {
      return rule.destination;
    }
  }

  return null;
}

/** Exposes redirect count for docs and tests. */
export function legacyRedirectStats() {
  return {
    exact: legacyRedirectsData.redirects.length,
    prefix: legacyRedirectsData.prefixRedirects.length,
    generatedAt: legacyRedirectsData.generatedAt,
    source: legacyRedirectsData.source,
  };
}

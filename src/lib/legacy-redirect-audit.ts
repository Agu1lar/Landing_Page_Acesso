import { normalizeLegacyPathname, resolveLegacyRedirect } from '@/lib/legacy-redirects';

/**
 * Extracts pathname from a GSC export row or full URL.
 */
export function extractAuditPath(urlOrPath: string) {
  const trimmed = urlOrPath.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return normalizeLegacyPathname(new URL(trimmed).pathname);
  }

  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return normalizeLegacyPathname(withSlash.split('?')[0]?.split('#')[0] ?? withSlash);
}

/**
 * Audits legacy redirect coverage for a list of paths (GSC export or sitemap).
 */
export function auditLegacyRedirectPaths(paths: string[]) {
  const uniquePaths = [...new Set(paths.map(extractAuditPath).filter(Boolean))];
  const covered: string[] = [];
  const missing: string[] = [];

  for (const path of uniquePaths) {
    if (path === '/' || resolveLegacyRedirect(path)) {
      covered.push(path);
    } else {
      missing.push(path);
    }
  }

  const coveragePct =
    uniquePaths.length === 0 ? 100 : Math.round((covered.length / uniquePaths.length) * 100);

  return {
    total: uniquePaths.length,
    coveredCount: covered.length,
    missingCount: missing.length,
    coveragePct,
    covered,
    missing,
  };
}

/**
 * Suggests a redirect destination for common WordPress URL patterns.
 */
export function suggestLegacyRedirectDestination(path: string) {
  const normalized = extractAuditPath(path);

  if (normalized.includes('franna') || normalized.includes('fr17')) {
    return '/equipamentos/franna-fr17';
  }
  if (normalized.includes('munck')) {
    return '/categorias/guindaste-industrial';
  }
  if (normalized.includes('guindaste')) {
    return '/categorias/guindaste-industrial';
  }
  if (normalized.includes('plataforma') || normalized.includes('elevatoria')) {
    return '/categorias/plataformas-elevatorias';
  }
  if (normalized.includes('andaime')) {
    return '/categorias/andaimes';
  }
  if (normalized.includes('compactador')) {
    return '/categorias/ferramentas-combustao';
  }
  if (normalized.includes('gerador')) {
    return '/categorias/ferramentas-combustao';
  }
  if (normalized.includes('martelete')) {
    return '/categorias/ferramentas-eletricas';
  }
  if (normalized.includes('manipulador') || normalized.includes('telescop')) {
    return '/categorias/manipuladores-telescopicos';
  }
  if (normalized.includes('privacidade') || normalized.includes('cookies')) {
    return '/privacidade';
  }
  if (normalized.includes('blog') || normalized.includes('web-stories')) {
    return '/dicas';
  }

  return '/equipamentos';
}

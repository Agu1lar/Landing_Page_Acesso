/**
 * Strips optional locale prefix from pathname (pt-BR only today).
 */
export function stripLocalePath(pathname: string): string {
  const stripped = pathname.replace(/^\/pt-BR(?=\/|$)/, '');
  return stripped || '/';
}

/**
 * Routes that use the mobile conversion dock (floating WhatsApp is hidden there).
 */
export function usesMobileConversionDock(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }

  const path = stripLocalePath(pathname);

  if (path === '/') {
    return true;
  }

  if (path === '/equipamentos') {
    return true;
  }

  if (path.includes('/categorias/')) {
    return true;
  }

  return /^\/equipamentos\/[^/]+/.test(path);
}

/**
 * Whether the quote cart mini-bar can appear (any marketing page except orçamento).
 */
export function usesQuoteCartMobileBar(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false;
  }

  return !stripLocalePath(pathname).startsWith('/orcamento');
}

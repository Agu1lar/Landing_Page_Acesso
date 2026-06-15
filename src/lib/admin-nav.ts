/**
 * Strips optional locale prefix from a dashboard pathname.
 */
export function stripLocaleFromPath(pathname: string) {
  return pathname.replace(/^\/(pt-BR|en|fr)(?=\/)/, '') || pathname;
}

/**
 * Returns true when the sidebar item should appear active.
 */
export function isAdminNavActive(pathname: string, href: string) {
  const path = stripLocaleFromPath(pathname);

  if (href === '/dashboard/leads') {
    return path === '/dashboard/leads' || path.startsWith('/dashboard/leads/');
  }

  if (href === '/dashboard/acesso') {
    return path === '/dashboard/acesso';
  }

  return path === href || path.startsWith(`${href}/`);
}

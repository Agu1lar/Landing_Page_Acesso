/**
 * Strips optional locale prefix from a dashboard pathname.
 */
export function stripLocaleFromPath(pathname: string) {
  return pathname.replace(/^\/(pt-BR|en|fr)(?=\/)/, '') || pathname;
}

/**
 * Returns true when the sidebar item should appear active.
 */
export function isAdminNavActive(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  const path = stripLocaleFromPath(pathname);

  if (href === '/dashboard/leads') {
    return (
      path === '/dashboard/leads'
      || (path.startsWith('/dashboard/leads/') && !path.startsWith('/dashboard/leads/consulta'))
    );
  }

  if (href === '/dashboard/leads/consulta') {
    return path === '/dashboard/leads/consulta' || path.startsWith('/dashboard/leads/consulta?');
  }

  if (href === '/dashboard/clientes') {
    return (
      path === '/dashboard/clientes'
      || path.startsWith('/dashboard/clientes?')
      || (path.startsWith('/dashboard/clientes/') && !path.endsWith('/clientes'))
    );
  }

  if (href === '/dashboard/acesso') {
    return path === '/dashboard/acesso';
  }

  return path === href || path.startsWith(`${href}/`);
}

/**
 * Returns true for admin/auth paths that should not appear in marketing analytics.
 */
export function isInternalAnalyticsPath(path: string) {
  const withoutLocale = path.replace(/^\/pt-BR/i, '').split('?')[0] || '/';
  const normalized = withoutLocale === '' ? '/' : withoutLocale;

  if (normalized.includes('sso-callback')) {
    return true;
  }

  return (
    normalized.startsWith('/sign-in') ||
    normalized.startsWith('/dashboard') ||
    normalized.startsWith('/api') ||
    normalized.startsWith('/monitoring')
  );
}

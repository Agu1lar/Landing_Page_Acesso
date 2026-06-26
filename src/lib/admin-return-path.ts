const ADMIN_PATH_PREFIX = '/dashboard/';

type ListQueryParams = Record<string, string | undefined>;

/**
 * Builds a query string for admin list filters (omits empty and "all").
 */
export function buildAdminListQuery(params: ListQueryParams) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === 'all') {
      continue;
    }
    search.set(key, trimmed);
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * Returns a safe in-app dashboard path or the fallback.
 */
export function resolveAdminReturnPath(path: string | null | undefined, fallback: string) {
  if (!path?.startsWith(ADMIN_PATH_PREFIX) || path.includes('://')) {
    return fallback;
  }
  return path;
}

/**
 * Reads returnTo from form data with validation.
 */
export function returnPathFromFormData(formData: FormData, fallback: string) {
  return resolveAdminReturnPath(String(formData.get('returnTo') ?? ''), fallback);
}

/**
 * Extracts the query suffix (?a=b) from a return path for edit-page URLs.
 */
export function adminListFiltersSuffix(formData: FormData) {
  const returnTo = returnPathFromFormData(formData, '');
  const queryIndex = returnTo.indexOf('?');
  if (queryIndex === -1) {
    return '';
  }
  return returnTo.slice(queryIndex);
}

/**
 * List path for equipment admin with optional filters.
 */
export function equipmentAdminListPath(params: ListQueryParams) {
  return `/dashboard/equipamentos${buildAdminListQuery(params)}`;
}

/**
 * List path for blog admin with optional filters.
 */
export function blogAdminListPath(params: ListQueryParams) {
  return `/dashboard/dicas${buildAdminListQuery(params)}`;
}

/**
 * Redirect target after archiving equipment — keeps filters and shows archived tab.
 */
export function equipmentAdminListPathAfterArchive(formData: FormData) {
  const suffix = adminListFiltersSuffix(formData);
  const url = new URL(`/dashboard/equipamentos${suffix}`, 'http://local');
  url.searchParams.set('status', 'archived');
  return `${url.pathname}${url.search}`;
}

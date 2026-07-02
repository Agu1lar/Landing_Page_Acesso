export type LeadsFilterQueryInput = {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  city?: string;
  origin?: string;
  campaignKey?: string;
  q?: string;
  page?: number;
};

/**
 * Builds query string for list filters (export link and pagination).
 */
export function buildLeadsFilterQuery(filters: LeadsFilterQueryInput) {
  const params = new URLSearchParams();
  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.city) {
    params.set('city', filters.city);
  }
  if (filters.origin) {
    params.set('origin', filters.origin);
  }
  if (filters.campaignKey) {
    params.set('campaignKey', filters.campaignKey);
  }
  if (filters.q) {
    params.set('q', filters.q);
  }
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

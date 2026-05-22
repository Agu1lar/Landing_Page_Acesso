/**
 * Resolves inclusive UTC date range from filter strings or defaults to last 30 days.
 */
export function resolveAnalyticsPeriod(filters: { dateFrom?: string; dateTo?: string }) {
  const today = new Date();
  const defaultTo = formatDateOnly(today);
  const defaultFrom = formatDateOnly(addDays(today, -29));

  const dateFrom = filters.dateFrom?.trim() || defaultFrom;
  const dateTo = filters.dateTo?.trim() || defaultTo;

  return {
    dateFrom,
    dateTo,
    from: startOfDayUtc(dateFrom),
    to: endOfDayUtc(dateTo),
  };
}

/**
 * Returns the previous period of equal length immediately before the current range.
 */
export function previousPeriodRange(dateFrom: string, dateTo: string) {
  const from = startOfDayUtc(dateFrom);
  const to = endOfDayUtc(dateTo);
  const lengthMs = to.getTime() - from.getTime() + 1;
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - lengthMs + 1);

  return {
    dateFrom: formatDateOnly(prevFrom),
    dateTo: formatDateOnly(prevTo),
    from: prevFrom,
    to: prevTo,
  };
}

/**
 * Builds query string for analytics dashboard date filters.
 */
export function buildAnalyticsFilterQuery(filters: { dateFrom?: string; dateTo?: string }) {
  const params = new URLSearchParams();
  if (filters.dateFrom?.trim()) {
    params.set('dateFrom', filters.dateFrom.trim());
  }
  if (filters.dateTo?.trim()) {
    params.set('dateTo', filters.dateTo.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function startOfDayUtc(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function endOfDayUtc(dateStr: string) {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

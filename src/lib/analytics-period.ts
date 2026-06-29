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

export type ComparisonPeriod = {
  comparisonMode: 'auto' | 'custom';
  dateFrom: string;
  dateTo: string;
  from: Date;
  to: Date;
};

/**
 * Resolves the comparison range: custom dates when both are set, otherwise the auto previous period.
 */
export function resolveComparisonPeriod(
  period: { dateFrom: string; dateTo: string },
  filters: { compareDateFrom?: string; compareDateTo?: string },
): ComparisonPeriod {
  const compareFrom = filters.compareDateFrom?.trim();
  const compareTo = filters.compareDateTo?.trim();

  if (compareFrom && compareTo) {
    return {
      comparisonMode: 'custom',
      dateFrom: compareFrom,
      dateTo: compareTo,
      from: startOfDayUtc(compareFrom),
      to: endOfDayUtc(compareTo),
    };
  }

  const auto = previousPeriodRange(period.dateFrom, period.dateTo);
  return {
    comparisonMode: 'auto',
    dateFrom: auto.dateFrom,
    dateTo: auto.dateTo,
    from: auto.from,
    to: auto.to,
  };
}

/**
 * Returns the inclusive UTC range for a calendar month (month 1 = January).
 */
export function calendarMonthRange(year: number, month: number) {
  const from = new Date(Date.UTC(year, month - 1, 1));
  const to = new Date(Date.UTC(year, month, 0));
  return {
    dateFrom: formatDateOnly(from),
    dateTo: formatDateOnly(to),
  };
}

/**
 * Returns the current calendar month range (UTC date parts).
 */
export function currentCalendarMonthRange(reference = new Date()) {
  return calendarMonthRange(reference.getUTCFullYear(), reference.getUTCMonth() + 1);
}

/**
 * Returns the calendar month immediately before the month of `reference`.
 */
export function previousCalendarMonthRange(reference = new Date()) {
  const anchor = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
  anchor.setUTCMonth(anchor.getUTCMonth() - 1);
  return calendarMonthRange(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1);
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
export function buildAnalyticsFilterQuery(filters: {
  dateFrom?: string;
  dateTo?: string;
  compareDateFrom?: string;
  compareDateTo?: string;
}) {
  const params = new URLSearchParams();
  if (filters.dateFrom?.trim()) {
    params.set('dateFrom', filters.dateFrom.trim());
  }
  if (filters.dateTo?.trim()) {
    params.set('dateTo', filters.dateTo.trim());
  }
  if (filters.compareDateFrom?.trim()) {
    params.set('compareDateFrom', filters.compareDateFrom.trim());
  }
  if (filters.compareDateTo?.trim()) {
    params.set('compareDateTo', filters.compareDateTo.trim());
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

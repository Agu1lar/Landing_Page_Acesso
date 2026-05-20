/**
 * Formats a date as YYYY-MM-DD for HTML date inputs and filter query params.
 */
export function toIsoDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns dateFrom/dateTo for the last N calendar days (UTC date parts).
 */
export function lastDaysRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - days);
  return {
    dateFrom: toIsoDateInput(from),
    dateTo: toIsoDateInput(to),
  };
}

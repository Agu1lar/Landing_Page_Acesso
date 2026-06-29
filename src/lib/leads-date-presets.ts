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

/** Monday–Sunday range for the week containing `reference` (UTC date parts). */
export function currentWeekRange(reference = new Date()) {
  const date = new Date(reference);
  const weekday = date.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;

  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - daysFromMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    dateFrom: toIsoDateInput(monday),
    dateTo: toIsoDateInput(sunday),
  };
}

/** Monday–Sunday range for the week before the week containing `reference`. */
export function previousWeekRange(reference = new Date()) {
  const anchor = new Date(reference);
  anchor.setUTCDate(anchor.getUTCDate() - 7);
  return currentWeekRange(anchor);
}

/** Human-readable week label for admin headers (pt-BR). */
export function formatWeekRangeLabel(range: { dateFrom: string; dateTo: string }) {
  const from = new Date(`${range.dateFrom}T12:00:00.000Z`);
  const to = new Date(`${range.dateTo}T12:00:00.000Z`);
  const formatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
  return `${formatter.format(from)} – ${formatter.format(to)}`;
}

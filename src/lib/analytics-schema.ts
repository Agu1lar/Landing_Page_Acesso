const ENGAGEMENT_TABLE = 'page_engagement_events';
const LEAD_KIND_COLUMN = 'lead_kind';

/**
 * Returns true when Postgres reports a missing analytics table or column.
 */
export function isAnalyticsSchemaMissingError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes('does not exist') &&
    (message.includes(ENGAGEMENT_TABLE) || message.includes(LEAD_KIND_COLUMN))
  );
}

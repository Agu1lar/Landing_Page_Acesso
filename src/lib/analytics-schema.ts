const ANALYTICS_SCHEMA_MARKERS = [
  'page_engagement_events',
  'analytics_events',
  'analytics_daily',
  'lead_kind',
  'google_sub',
  'gclid',
  'gbraid',
  'wbraid',
  'last_activity_at',
] as const;

/**
 * Flattens nested Drizzle/pg error messages for schema detection.
 */
export function flattenDbErrorMessage(error: unknown) {
  const parts: string[] = [];
  let current: unknown = error;

  for (let depth = 0; depth < 6 && current instanceof Error; depth += 1) {
    parts.push(current.message);
    current = current.cause;
  }

  if (parts.length === 0) {
    parts.push(String(error));
  }

  return parts.join(' | ');
}

function flattenDbErrorMessageLower(error: unknown) {
  return flattenDbErrorMessage(error).toLowerCase();
}

export type DbErrorDetails = {
  summary: string;
  cause?: string;
};

/**
 * Formats a database error for logs and admin diagnostics.
 */
export function formatDbErrorDetails(error: unknown): DbErrorDetails {
  const summary = flattenDbErrorMessage(error);
  const cause =
    error instanceof Error && error.cause instanceof Error ? error.cause.message : undefined;

  return { summary, cause };
}

/**
 * Returns true when Postgres reports a missing analytics table or column.
 */
export function isAnalyticsSchemaMissingError(error: unknown) {
  const message = flattenDbErrorMessageLower(error);

  const schemaSignal =
    message.includes('does not exist') ||
    message.includes('undefined column') ||
    message.includes('unknown column') ||
    message.includes('column') && message.includes('of relation');

  if (!schemaSignal) {
    return false;
  }

  return ANALYTICS_SCHEMA_MARKERS.some((marker) => message.includes(marker));
}

/**
 * Runs an analytics query and returns fallback when schema is incomplete.
 */
export async function withAnalyticsSchema<T>(fallback: T, run: () => Promise<T>) {
  try {
    return await run();
  } catch (error) {
    if (isAnalyticsSchemaMissingError(error)) {
      return fallback;
    }
    throw error;
  }
}

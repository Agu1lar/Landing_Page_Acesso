import { db } from '@/libs/DB';
import { pageEngagementEventsSchema } from '@/models/Schema';
import type { PageEngagementInput } from '@/validations/page-engagement';

/**
 * Persists one page visit with active (non-idle) seconds.
 */
export async function recordPageEngagement(input: PageEngagementInput) {
  const [row] = await db
    .insert(pageEngagementEventsSchema)
    .values({
      pathname: input.pathname,
      activeSeconds: input.activeSeconds,
      device: input.device ?? null,
      sessionId: input.sessionId ?? null,
    })
    .returning({ id: pageEngagementEventsSchema.id });

  return row;
}

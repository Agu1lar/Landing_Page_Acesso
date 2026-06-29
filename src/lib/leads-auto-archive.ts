import { and, eq, lt, sql } from 'drizzle-orm';
import { currentWeekRange } from '@/lib/leads-date-presets';
import { db } from '@/libs/DB';
import { leadsSchema } from '@/models/Schema';

const leadActivityOrder = sql`coalesce(${leadsSchema.lastActivityAt}, ${leadsSchema.createdAt})`;

/**
 * Returns Monday 00:00 UTC for the week that contains `reference`.
 */
export function currentWeekStartUtc(reference = new Date()) {
  const { dateFrom } = currentWeekRange(reference);
  return new Date(`${dateFrom}T00:00:00.000Z`);
}

/**
 * Archives unattended new leads from previous weeks so the commercial queue stays current.
 */
export async function archiveStaleCommercialLeads(reference = new Date()) {
  const weekStart = currentWeekStartUtc(reference);

  const archived = await db
    .update(leadsSchema)
    .set({ status: 'archived' })
    .where(and(eq(leadsSchema.status, 'new'), lt(leadActivityOrder, weekStart)))
    .returning({ id: leadsSchema.id });

  return archived.length;
}

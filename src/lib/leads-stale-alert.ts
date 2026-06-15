import { and, asc, count, eq, lte } from 'drizzle-orm';
import { scoreLeadIntent } from '@/lib/lead-intent-score';
import { db } from '@/libs/DB';
import { leadsSchema } from '@/models/Schema';
import type { LeadWithIntent } from '@/lib/leads-admin';

/** Hours a lead can stay "new" before the stale alert appears. */
export const STALE_LEAD_HOURS = 24;

export type StaleLeadsSummary = {
  leads: LeadWithIntent[];
  total: number;
  thresholdHours: number;
};

/**
 * Lists new leads older than the stale threshold without contact.
 */
export async function listStaleNewLeads(limit = 10): Promise<StaleLeadsSummary> {
  const cutoff = new Date(Date.now() - STALE_LEAD_HOURS * 60 * 60 * 1000);
  const where = and(eq(leadsSchema.status, 'new'), lte(leadsSchema.createdAt, cutoff));

  const [rows, countRow] = await Promise.all([
    db
      .select()
      .from(leadsSchema)
      .where(where)
      .orderBy(asc(leadsSchema.createdAt))
      .limit(limit),
    db.select({ count: count() }).from(leadsSchema).where(where),
  ]);

  return {
    leads: rows.map((lead) => ({
      ...lead,
      ...scoreLeadIntent(lead),
    })),
    total: countRow[0]?.count ?? 0,
    thresholdHours: STALE_LEAD_HOURS,
  };
}

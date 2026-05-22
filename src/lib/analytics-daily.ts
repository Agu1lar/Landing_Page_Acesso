import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { analyticsDailySchema, analyticsEventsSchema } from '@/models/Schema';

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Aggregates conversion events for one calendar day into analytics_daily.
 */
export async function aggregateAnalyticsDailyForDate(day: Date) {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  const dateKey = formatDateKey(dayStart);

  const [whatsappRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, 'whatsapp_click'),
        gte(analyticsEventsSchema.createdAt, dayStart),
        lte(analyticsEventsSchema.createdAt, dayEnd),
      ),
    );

  const [quoteRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, 'quote_submit'),
        gte(analyticsEventsSchema.createdAt, dayStart),
        lte(analyticsEventsSchema.createdAt, dayEnd),
      ),
    );

  const sourceRows = await db
    .select({
      source: sql<string>`coalesce(${analyticsEventsSchema.utmSource}, 'direto')`,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(analyticsEventsSchema)
    .where(
      and(
        gte(analyticsEventsSchema.createdAt, dayStart),
        lte(analyticsEventsSchema.createdAt, dayEnd),
      ),
    )
    .groupBy(sql`coalesce(${analyticsEventsSchema.utmSource}, 'direto')`);

  const topSources: Record<string, number> = {};
  for (const row of sourceRows) {
    topSources[row.source] = row.count;
  }

  const whatsappClicks = whatsappRow?.count ?? 0;
  const quoteSubmits = quoteRow?.count ?? 0;
  const engagement = whatsappClicks + quoteSubmits;

  await db
    .insert(analyticsDailySchema)
    .values({
      date: dateKey,
      pageViews: engagement,
      uniqueSessions: engagement > 0 ? Math.max(1, Math.ceil(engagement / 2)) : 0,
      whatsappClicks,
      quoteSubmits,
      topSources,
    })
    .onConflictDoUpdate({
      target: analyticsDailySchema.date,
      set: {
        pageViews: engagement,
        uniqueSessions: engagement > 0 ? Math.max(1, Math.ceil(engagement / 2)) : 0,
        whatsappClicks,
        quoteSubmits,
        topSources,
      },
    });

  return { date: dateKey, whatsappClicks, quoteSubmits };
}

/**
 * Backfills analytics_daily for the last N days from Neon events.
 */
export async function aggregateAnalyticsDailyRange(daysBack = 90) {
  const results = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < daysBack; offset += 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    results.push(await aggregateAnalyticsDailyForDate(day));
  }

  return results.length;
}

/**
 * Sums daily aggregates for a date range (inclusive ISO dates).
 */
export async function sumAnalyticsDailyForPeriod(dateFrom: string, dateTo: string) {
  const rows = await db
    .select()
    .from(analyticsDailySchema)
    .where(and(gte(analyticsDailySchema.date, dateFrom), lte(analyticsDailySchema.date, dateTo)));

  return rows.reduce(
    (acc, row) => ({
      pageViews: acc.pageViews + row.pageViews,
      uniqueSessions: acc.uniqueSessions + row.uniqueSessions,
      whatsappClicks: acc.whatsappClicks + row.whatsappClicks,
      quoteSubmits: acc.quoteSubmits + row.quoteSubmits,
    }),
    { pageViews: 0, uniqueSessions: 0, whatsappClicks: 0, quoteSubmits: 0 },
  );
}

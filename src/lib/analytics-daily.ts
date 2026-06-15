import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { analyticsDailySchema, analyticsEventsSchema, pageEngagementEventsSchema } from '@/models/Schema';

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

  const [pageViewsRow] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(pageEngagementEventsSchema)
    .where(
      and(
        gte(pageEngagementEventsSchema.createdAt, dayStart),
        lte(pageEngagementEventsSchema.createdAt, dayEnd),
      ),
    );

  const [sessionsRow] = await db
    .select({
      count: sql<number>`cast(count(distinct ${pageEngagementEventsSchema.sessionId}) as int)`,
    })
    .from(pageEngagementEventsSchema)
    .where(
      and(
        gte(pageEngagementEventsSchema.createdAt, dayStart),
        lte(pageEngagementEventsSchema.createdAt, dayEnd),
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
  const pageViews = pageViewsRow?.count ?? 0;
  const uniqueSessions = sessionsRow?.count ?? 0;

  await db
    .insert(analyticsDailySchema)
    .values({
      date: dateKey,
      pageViews,
      uniqueSessions: uniqueSessions > 0 ? uniqueSessions : pageViews > 0 ? 1 : 0,
      whatsappClicks,
      quoteSubmits,
      topSources,
    })
    .onConflictDoUpdate({
      target: analyticsDailySchema.date,
      set: {
        pageViews,
        uniqueSessions: uniqueSessions > 0 ? uniqueSessions : pageViews > 0 ? 1 : 0,
        whatsappClicks,
        quoteSubmits,
        topSources,
      },
    });

  return { date: dateKey, whatsappClicks, quoteSubmits, pageViews };
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

import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { previousPeriodRange, resolveAnalyticsPeriod } from '@/lib/analytics-period';
import { db } from '@/libs/DB';
import { analyticsEventsSchema, leadsSchema } from '@/models/Schema';

export type AnalyticsDashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
};

type CountRow = { label: string; count: number };

export type OperationalDashboard = {
  period: { dateFrom: string; dateTo: string };
  previousPeriod: { dateFrom: string; dateTo: string };
  whatsappClicks: number;
  quoteSubmits: number;
  whatsappClicksPrevious: number;
  quoteSubmitsPrevious: number;
  whatsappByOrigin: CountRow[];
  trafficBySource: CountRow[];
  campaigns: { campaign: string; whatsapp: number; leads: number }[];
  topEquipmentWhatsapp: CountRow[];
  topEquipmentLeads: CountRow[];
  landingPages: CountRow[];
  deviceSplit: CountRow[];
  posthogHint: boolean;
};

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Math.round(((current - previous) / previous) * 100);
}

async function countEvents(
  eventType: string,
  from: Date,
  to: Date,
) {
  const [row] = await db
    .select({ count: count() })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, eventType),
        gte(analyticsEventsSchema.createdAt, from),
        lte(analyticsEventsSchema.createdAt, to),
      ),
    );

  return row?.count ?? 0;
}

async function whatsappByOrigin(from: Date, to: Date) {
  const rows = await db
    .select({
      label: analyticsEventsSchema.origin,
      count: count(),
    })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, 'whatsapp_click'),
        gte(analyticsEventsSchema.createdAt, from),
        lte(analyticsEventsSchema.createdAt, to),
      ),
    )
    .groupBy(analyticsEventsSchema.origin)
    .orderBy(desc(count()));

  return rows
    .filter((row) => row.label)
    .map((row) => ({ label: row.label!, count: row.count }));
}

async function trafficBySourceSimple(from: Date, to: Date) {
  const leadRows = await db
    .select({
      label: sql<string>`coalesce(${leadsSchema.utmSource}, 'direto')`,
      count: count(),
    })
    .from(leadsSchema)
    .where(and(gte(leadsSchema.createdAt, from), lte(leadsSchema.createdAt, to)))
    .groupBy(sql`coalesce(${leadsSchema.utmSource}, 'direto')`);

  const eventRows = await db
    .select({
      label: sql<string>`coalesce(${analyticsEventsSchema.utmSource}, 'direto')`,
      count: count(),
    })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, 'whatsapp_click'),
        gte(analyticsEventsSchema.createdAt, from),
        lte(analyticsEventsSchema.createdAt, to),
      ),
    )
    .groupBy(sql`coalesce(${analyticsEventsSchema.utmSource}, 'direto')`);

  const merged = new Map<string, number>();

  for (const row of [...leadRows, ...eventRows]) {
    merged.set(row.label, (merged.get(row.label) ?? 0) + row.count);
  }

  return [...merged.entries()]
    .map(([label, countValue]) => ({ label, count: countValue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

async function campaignTable(from: Date, to: Date) {
  const whatsappRows = await db
    .select({
      campaign: sql<string>`coalesce(${analyticsEventsSchema.utmCampaign}, '(sem campanha)')`,
      count: count(),
    })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, 'whatsapp_click'),
        gte(analyticsEventsSchema.createdAt, from),
        lte(analyticsEventsSchema.createdAt, to),
      ),
    )
    .groupBy(sql`coalesce(${analyticsEventsSchema.utmCampaign}, '(sem campanha)')`);

  const leadRows = await db
    .select({
      campaign: sql<string>`coalesce(${leadsSchema.utmCampaign}, '(sem campanha)')`,
      count: count(),
    })
    .from(leadsSchema)
    .where(and(gte(leadsSchema.createdAt, from), lte(leadsSchema.createdAt, to)))
    .groupBy(sql`coalesce(${leadsSchema.utmCampaign}, '(sem campanha)')`);

  const merged = new Map<string, { whatsapp: number; leads: number }>();

  for (const row of whatsappRows) {
    merged.set(row.campaign, { whatsapp: row.count, leads: 0 });
  }

  for (const row of leadRows) {
    const existing = merged.get(row.campaign) ?? { whatsapp: 0, leads: 0 };
    merged.set(row.campaign, { ...existing, leads: row.count });
  }

  return [...merged.entries()]
    .map(([campaign, stats]) => ({ campaign, ...stats }))
    .sort((a, b) => b.whatsapp + b.leads - (a.whatsapp + a.leads))
    .slice(0, 12);
}

async function topEquipment(
  eventType: 'whatsapp_click' | 'quote_submit',
  from: Date,
  to: Date,
) {
  const rows = await db
    .select({
      label: sql<string>`coalesce(${analyticsEventsSchema.equipmentName}, ${analyticsEventsSchema.equipmentSlug}, '—')`,
      count: count(),
    })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, eventType),
        gte(analyticsEventsSchema.createdAt, from),
        lte(analyticsEventsSchema.createdAt, to),
      ),
    )
    .groupBy(
      sql`coalesce(${analyticsEventsSchema.equipmentName}, ${analyticsEventsSchema.equipmentSlug}, '—')`,
    )
    .orderBy(desc(count()))
    .limit(8);

  return rows.map((row) => ({ label: row.label, count: row.count }));
}

async function topEquipmentLeads(from: Date, to: Date) {
  const rows = await db
    .select({
      label: sql<string>`coalesce(${leadsSchema.equipmentName}, ${leadsSchema.equipmentSlug}, '—')`,
      count: count(),
    })
    .from(leadsSchema)
    .where(and(gte(leadsSchema.createdAt, from), lte(leadsSchema.createdAt, to)))
    .groupBy(sql`coalesce(${leadsSchema.equipmentName}, ${leadsSchema.equipmentSlug}, '—')`)
    .orderBy(desc(count()))
    .limit(8);

  return rows.map((row) => ({ label: row.label, count: row.count }));
}

async function landingPagesSimple(from: Date, to: Date) {
  const eventRows = await db
    .select({
      label: sql<string>`coalesce(${analyticsEventsSchema.landingPage}, '—')`,
      count: count(),
    })
    .from(analyticsEventsSchema)
    .where(
      and(
        gte(analyticsEventsSchema.createdAt, from),
        lte(analyticsEventsSchema.createdAt, to),
        sql`${analyticsEventsSchema.landingPage} is not null`,
      ),
    )
    .groupBy(analyticsEventsSchema.landingPage)
    .orderBy(desc(count()));

  const leadRows = await db
    .select({
      label: sql<string>`coalesce(${leadsSchema.landingPage}, '—')`,
      count: count(),
    })
    .from(leadsSchema)
    .where(
      and(
        gte(leadsSchema.createdAt, from),
        lte(leadsSchema.createdAt, to),
        sql`${leadsSchema.landingPage} is not null`,
      ),
    )
    .groupBy(leadsSchema.landingPage)
    .orderBy(desc(count()));

  const merged = new Map<string, number>();

  for (const row of [...eventRows, ...leadRows]) {
    merged.set(row.label, (merged.get(row.label) ?? 0) + row.count);
  }

  return [...merged.entries()]
    .map(([label, countValue]) => ({ label, count: countValue }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

async function deviceSplit(from: Date, to: Date) {
  const rows = await db
    .select({
      label: sql<string>`coalesce(${analyticsEventsSchema.device}, 'desconhecido')`,
      count: count(),
    })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, 'whatsapp_click'),
        gte(analyticsEventsSchema.createdAt, from),
        lte(analyticsEventsSchema.createdAt, to),
      ),
    )
    .groupBy(analyticsEventsSchema.device)
    .orderBy(desc(count()));

  return rows.map((row) => ({ label: row.label, count: row.count }));
}

/**
 * Loads operational dashboard metrics from Neon conversion tables.
 */
export async function getOperationalDashboard(
  filters: AnalyticsDashboardFilters = {},
): Promise<OperationalDashboard> {
  const period = resolveAnalyticsPeriod(filters);
  const previous = previousPeriodRange(period.dateFrom, period.dateTo);

  const [
    whatsappClicks,
    quoteSubmits,
    whatsappClicksPrevious,
    quoteSubmitsPrevious,
    whatsappByOriginRows,
    trafficBySource,
    campaigns,
    topEquipmentWhatsapp,
    topEquipmentLeadsRows,
    landingPages,
    deviceSplitRows,
  ] = await Promise.all([
    countEvents('whatsapp_click', period.from, period.to),
    countEvents('quote_submit', period.from, period.to),
    countEvents('whatsapp_click', previous.from, previous.to),
    countEvents('quote_submit', previous.from, previous.to),
    whatsappByOrigin(period.from, period.to),
    trafficBySourceSimple(period.from, period.to),
    campaignTable(period.from, period.to),
    topEquipment('whatsapp_click', period.from, period.to),
    topEquipmentLeads(period.from, period.to),
    landingPagesSimple(period.from, period.to),
    deviceSplit(period.from, period.to),
  ]);

  return {
    period: { dateFrom: period.dateFrom, dateTo: period.dateTo },
    previousPeriod: { dateFrom: previous.dateFrom, dateTo: previous.dateTo },
    whatsappClicks,
    quoteSubmits,
    whatsappClicksPrevious,
    quoteSubmitsPrevious,
    whatsappByOrigin: whatsappByOriginRows,
    trafficBySource,
    campaigns,
    topEquipmentWhatsapp,
    topEquipmentLeads: topEquipmentLeadsRows,
    landingPages,
    deviceSplit: deviceSplitRows,
    posthogHint: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
  };
}

export { percentChange };

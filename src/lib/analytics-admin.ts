import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { sumAnalyticsDailyForPeriod } from '@/lib/analytics-daily';
import {
  formatDevice,
  formatEquipmentAnalyticsLabel,
  formatSitePath,
  formatTrafficSource,
  formatWhatsAppOrigin,
} from '@/lib/analytics-display-labels';
import { previousPeriodRange, resolveAnalyticsPeriod } from '@/lib/analytics-period';
import {
  getCampaignPerformanceReport,
  type CampaignDailyLeadsRow,
  type CampaignPerformanceRow,
} from '@/lib/campaign-analytics';
import {
  mergeEquipmentConversionRows,
  type EquipmentConversionRow,
} from '@/lib/equipment-conversion-analytics';
import { db } from '@/libs/DB';
import { analyticsEventsSchema, leadsSchema, pageEngagementEventsSchema } from '@/models/Schema';

export type AnalyticsDashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
};

type CountRow = { label: string; count: number };

export type PageEngagementRow = {
  pathname: string;
  /** Original URL when the display label differs (tooltip). */
  pathnameDetail?: string;
  views: number;
  totalActiveSeconds: number;
  avgActiveSeconds: number;
};

export type OperationalDashboard = {
  period: { dateFrom: string; dateTo: string };
  previousPeriod: { dateFrom: string; dateTo: string };
  pageViews: number;
  uniqueSessions: number;
  pageViewsPrevious: number;
  uniqueSessionsPrevious: number;
  totalActiveSeconds: number;
  totalActiveSecondsPrevious: number;
  whatsappClicks: number;
  quoteSubmits: number;
  cookieConsentLeads: number;
  whatsappClicksPrevious: number;
  quoteSubmitsPrevious: number;
  whatsappByOrigin: CountRow[];
  trafficBySource: CountRow[];
  campaignPerformance: CampaignPerformanceRow[];
  campaignDailyLeads: CampaignDailyLeadsRow[];
  topEquipmentWhatsapp: CountRow[];
  topEquipmentLeads: CountRow[];
  topPages: PageEngagementRow[];
  equipmentConversion: EquipmentConversionRow[];
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

function humanizeCountRows(
  rows: CountRow[],
  formatLabel: (label: string) => string,
): CountRow[] {
  return rows.map((row) => ({ ...row, label: formatLabel(row.label) }));
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

async function pageEngagementSummary(from: Date, to: Date) {
  const [row] = await db
    .select({
      views: count(),
      totalActiveSeconds: sql<number>`coalesce(sum(${pageEngagementEventsSchema.activeSeconds}), 0)`,
      uniqueSessions: sql<number>`count(distinct ${pageEngagementEventsSchema.sessionId})`,
    })
    .from(pageEngagementEventsSchema)
    .where(
      and(
        gte(pageEngagementEventsSchema.createdAt, from),
        lte(pageEngagementEventsSchema.createdAt, to),
      ),
    );

  return {
    views: row?.views ?? 0,
    totalActiveSeconds: Number(row?.totalActiveSeconds ?? 0),
    uniqueSessions: Number(row?.uniqueSessions ?? 0),
  };
}

async function topPagesByEngagement(from: Date, to: Date) {
  const rows = await db
    .select({
      pathname: pageEngagementEventsSchema.pathname,
      views: count(),
      totalActiveSeconds: sql<number>`coalesce(sum(${pageEngagementEventsSchema.activeSeconds}), 0)`,
    })
    .from(pageEngagementEventsSchema)
    .where(
      and(
        gte(pageEngagementEventsSchema.createdAt, from),
        lte(pageEngagementEventsSchema.createdAt, to),
      ),
    )
    .groupBy(pageEngagementEventsSchema.pathname)
    .orderBy(desc(count()))
    .limit(12);

  return rows.map((row) => {
    const views = row.views;
    const totalActiveSeconds = Number(row.totalActiveSeconds);
    return {
      pathname: row.pathname,
      views,
      totalActiveSeconds,
      avgActiveSeconds: views > 0 ? Math.round(totalActiveSeconds / views) : 0,
    };
  });
}

async function countCookieConsentLeads(from: Date, to: Date) {
  const [row] = await db
    .select({ count: count() })
    .from(leadsSchema)
    .where(
      and(
        eq(leadsSchema.leadKind, 'cookie_consent'),
        gte(leadsSchema.createdAt, from),
        lte(leadsSchema.createdAt, to),
      ),
    );

  return row?.count ?? 0;
}

const equipmentSlugFromPath = sql<string>`substring(${pageEngagementEventsSchema.pathname} from '/equipamentos/([^/?]+)')`;

async function equipmentConversionTable(from: Date, to: Date) {
  const pageViewRows = await db
    .select({
      slug: equipmentSlugFromPath,
      views: count(),
    })
    .from(pageEngagementEventsSchema)
    .where(
      and(
        gte(pageEngagementEventsSchema.createdAt, from),
        lte(pageEngagementEventsSchema.createdAt, to),
        sql`${pageEngagementEventsSchema.pathname} like '%/equipamentos/%'`,
        sql`${equipmentSlugFromPath} is not null`,
      ),
    )
    .groupBy(equipmentSlugFromPath)
    .orderBy(desc(count()));

  const whatsappRows = await db
    .select({
      slug: analyticsEventsSchema.equipmentSlug,
      name: sql<string>`max(${analyticsEventsSchema.equipmentName})`,
      count: count(),
    })
    .from(analyticsEventsSchema)
    .where(
      and(
        eq(analyticsEventsSchema.eventType, 'whatsapp_click'),
        gte(analyticsEventsSchema.createdAt, from),
        lte(analyticsEventsSchema.createdAt, to),
        sql`${analyticsEventsSchema.equipmentSlug} is not null`,
      ),
    )
    .groupBy(analyticsEventsSchema.equipmentSlug);

  const leadRows = await db
    .select({
      slug: sql<string>`nullif(trim(split_part(${leadsSchema.equipmentSlug}, ',', 1)), '')`,
      name: sql<string>`max(${leadsSchema.equipmentName})`,
      count: count(),
    })
    .from(leadsSchema)
    .where(
      and(
        gte(leadsSchema.createdAt, from),
        lte(leadsSchema.createdAt, to),
        sql`nullif(trim(split_part(${leadsSchema.equipmentSlug}, ',', 1)), '') is not null`,
      ),
    )
    .groupBy(sql`nullif(trim(split_part(${leadsSchema.equipmentSlug}, ',', 1)), '')`);

  return mergeEquipmentConversionRows({
    pageViews: pageViewRows
      .filter((row) => row.slug)
      .map((row) => ({ slug: row.slug!, name: row.slug!, count: row.views })),
    whatsapp: whatsappRows
      .filter((row) => row.slug)
      .map((row) => ({
        slug: row.slug!,
        name: row.name ?? row.slug!,
        count: row.count,
      })),
    leads: leadRows
      .filter((row) => row.slug)
      .map((row) => ({
        slug: row.slug!,
        name: row.name ?? row.slug!,
        count: row.count,
      })),
    limit: 15,
  });
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
    dailyCurrent,
    dailyPrevious,
    engagementCurrent,
    engagementPrevious,
    whatsappClicks,
    quoteSubmits,
    cookieConsentLeads,
    whatsappClicksPrevious,
    quoteSubmitsPrevious,
    whatsappByOriginRows,
    trafficBySource,
    campaignReport,
    topEquipmentWhatsapp,
    topEquipmentLeadsRows,
    topPagesRows,
    equipmentConversionRows,
    landingPages,
    deviceSplitRows,
  ] = await Promise.all([
    sumAnalyticsDailyForPeriod(period.dateFrom, period.dateTo),
    sumAnalyticsDailyForPeriod(previous.dateFrom, previous.dateTo),
    pageEngagementSummary(period.from, period.to),
    pageEngagementSummary(previous.from, previous.to),
    countEvents('whatsapp_click', period.from, period.to),
    countEvents('quote_submit', period.from, period.to),
    countCookieConsentLeads(period.from, period.to),
    countEvents('whatsapp_click', previous.from, previous.to),
    countEvents('quote_submit', previous.from, previous.to),
    whatsappByOrigin(period.from, period.to),
    trafficBySourceSimple(period.from, period.to),
    getCampaignPerformanceReport(period.from, period.to),
    topEquipment('whatsapp_click', period.from, period.to),
    topEquipmentLeads(period.from, period.to),
    topPagesByEngagement(period.from, period.to),
    equipmentConversionTable(period.from, period.to),
    landingPagesSimple(period.from, period.to),
    deviceSplit(period.from, period.to),
  ]);

  const pageViews = engagementCurrent.views || dailyCurrent.pageViews;
  const pageViewsPrevious = engagementPrevious.views || dailyPrevious.pageViews;
  const uniqueSessions = engagementCurrent.uniqueSessions || dailyCurrent.uniqueSessions;
  const uniqueSessionsPrevious =
    engagementPrevious.uniqueSessions || dailyPrevious.uniqueSessions;

  return {
    period: { dateFrom: period.dateFrom, dateTo: period.dateTo },
    previousPeriod: { dateFrom: previous.dateFrom, dateTo: previous.dateTo },
    pageViews,
    uniqueSessions,
    pageViewsPrevious,
    uniqueSessionsPrevious,
    totalActiveSeconds: engagementCurrent.totalActiveSeconds,
    totalActiveSecondsPrevious: engagementPrevious.totalActiveSeconds,
    whatsappClicks,
    quoteSubmits,
    cookieConsentLeads,
    whatsappClicksPrevious,
    quoteSubmitsPrevious,
    whatsappByOrigin: humanizeCountRows(whatsappByOriginRows, formatWhatsAppOrigin),
    trafficBySource: humanizeCountRows(trafficBySource, formatTrafficSource),
    campaignPerformance: campaignReport.campaigns,
    campaignDailyLeads: campaignReport.dailyLeads,
    topEquipmentWhatsapp: humanizeCountRows(topEquipmentWhatsapp, (label) =>
      formatEquipmentAnalyticsLabel(label, 'whatsapp'),
    ),
    topEquipmentLeads: humanizeCountRows(topEquipmentLeadsRows, (label) =>
      formatEquipmentAnalyticsLabel(label, 'lead'),
    ),
    topPages: topPagesRows.map((row) => {
      const formatted = formatSitePath(row.pathname);
      return {
        ...row,
        pathname: formatted,
        pathnameDetail: formatted !== row.pathname ? row.pathname : undefined,
      };
    }),
    equipmentConversion: equipmentConversionRows,
    landingPages: humanizeCountRows(landingPages, formatSitePath),
    deviceSplit: humanizeCountRows(deviceSplitRows, formatDevice),
    posthogHint: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
  };
}

export { percentChange };

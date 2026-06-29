import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { formatCampaignName } from '@/lib/analytics-display-labels';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/lead-status';
import { db } from '@/libs/DB';
import { analyticsEventsSchema, leadsSchema } from '@/models/Schema';

export const NO_CAMPAIGN_KEY = '__no_campaign__';
export const GOOGLE_ADS_NO_UTM_KEY = '__google_ads_no_utm__';

export type CampaignStatusCounts = Record<LeadStatus | 'other', number>;

export type CampaignPerformanceRow = {
  campaignKey: string;
  campaignLabel: string;
  utmSource: string;
  utmMedium: string;
  whatsappClicks: number;
  totalLeads: number;
  quoteLeads: number;
  cookieLeads: number;
  withGclid: number;
  statusCounts: CampaignStatusCounts;
};

export type CampaignDailyLeadsRow = {
  date: string;
  campaignKey: string;
  campaignLabel: string;
  totalLeads: number;
};

export type CampaignPerformanceReport = {
  campaigns: CampaignPerformanceRow[];
  dailyLeads: CampaignDailyLeadsRow[];
};

type LeadAggregateRow = {
  campaignKey: string;
  utmSource: string | null;
  utmMedium: string | null;
  status: string;
  leadKind: string;
  gclidCount: number;
  count: number;
};

function emptyStatusCounts(): CampaignStatusCounts {
  return {
    new: 0,
    contacted: 0,
    quoted: 0,
    won: 0,
    lost: 0,
    archived: 0,
    other: 0,
  };
}

/**
 * Internal campaign bucket for leads with or without UTM campaign.
 */
export function resolveCampaignKey(
  utmCampaign: string | null | undefined,
  gclid: string | null | undefined,
) {
  const trimmed = utmCampaign?.trim();
  if (trimmed) {
    return trimmed;
  }
  if (gclid?.trim()) {
    return GOOGLE_ADS_NO_UTM_KEY;
  }
  return NO_CAMPAIGN_KEY;
}

export type CampaignFilterOption = {
  key: string;
  label: string;
};

/** Distinct UTM campaigns plus special buckets for the leads consulta filter. */
export async function listCampaignFilterOptions(): Promise<CampaignFilterOption[]> {
  const rows = await db
    .selectDistinct({ utmCampaign: leadsSchema.utmCampaign })
    .from(leadsSchema)
    .where(sql`nullif(trim(${leadsSchema.utmCampaign}), '') is not null`)
    .orderBy(leadsSchema.utmCampaign);

  const utmOptions = rows
    .map((row) => row.utmCampaign?.trim())
    .filter((value): value is string => Boolean(value))
    .map((key) => ({
      key,
      label: formatCampaignKey(key),
    }));

  return [
    ...utmOptions,
    {
      key: GOOGLE_ADS_NO_UTM_KEY,
      label: formatCampaignKey(GOOGLE_ADS_NO_UTM_KEY),
    },
    {
      key: NO_CAMPAIGN_KEY,
      label: formatCampaignKey(NO_CAMPAIGN_KEY),
    },
  ];
}

/** Display label for a campaign bucket key. */
export function formatCampaignKey(key: string) {
  if (key === NO_CAMPAIGN_KEY) {
    return '(sem campanha)';
  }
  if (key === GOOGLE_ADS_NO_UTM_KEY) {
    return '(Google Ads — sem UTM campaign)';
  }
  return formatCampaignName(key);
}

function incrementStatus(statusCounts: CampaignStatusCounts, status: string, amount: number) {
  if (LEAD_STATUSES.includes(status as LeadStatus)) {
    statusCounts[status as LeadStatus] += amount;
    return;
  }
  statusCounts.other += amount;
}

/**
 * Merges raw lead rows into campaign performance rows (unit-testable).
 */
export function mergeCampaignLeadAggregates(rows: LeadAggregateRow[]): CampaignPerformanceRow[] {
  const byCampaign = new Map<
    string,
    CampaignPerformanceRow & { sourceCounts: Map<string, number>; mediumCounts: Map<string, number> }
  >();

  for (const row of rows) {
    const existing = byCampaign.get(row.campaignKey) ?? {
      campaignKey: row.campaignKey,
      campaignLabel: formatCampaignKey(row.campaignKey),
      utmSource: '—',
      utmMedium: '—',
      whatsappClicks: 0,
      totalLeads: 0,
      quoteLeads: 0,
      cookieLeads: 0,
      withGclid: 0,
      statusCounts: emptyStatusCounts(),
      sourceCounts: new Map<string, number>(),
      mediumCounts: new Map<string, number>(),
    };

    existing.totalLeads += row.count;
    if (row.leadKind === 'cookie_consent') {
      existing.cookieLeads += row.count;
    } else {
      existing.quoteLeads += row.count;
    }
    existing.withGclid += row.gclidCount;
    incrementStatus(existing.statusCounts, row.status, row.count);

    if (row.utmSource?.trim()) {
      const source = row.utmSource.trim();
      existing.sourceCounts.set(source, (existing.sourceCounts.get(source) ?? 0) + row.count);
    }
    if (row.utmMedium?.trim()) {
      const medium = row.utmMedium.trim();
      existing.mediumCounts.set(medium, (existing.mediumCounts.get(medium) ?? 0) + row.count);
    }

    byCampaign.set(row.campaignKey, existing);
  }

  return [...byCampaign.values()]
    .map(({ sourceCounts, mediumCounts, ...row }) => {
      const topSource = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      const topMedium = [...mediumCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      return {
        ...row,
        utmSource: topSource ?? '—',
        utmMedium: topMedium ?? '—',
      };
    })
    .sort((a, b) => b.totalLeads - a.totalLeads || b.whatsappClicks - a.whatsappClicks);
}

const campaignKeySql = sql<string>`case
  when nullif(trim(${leadsSchema.utmCampaign}), '') is not null then trim(${leadsSchema.utmCampaign})
  when nullif(trim(${leadsSchema.gclid}), '') is not null then ${GOOGLE_ADS_NO_UTM_KEY}
  else ${NO_CAMPAIGN_KEY}
end`;

const leadDaySql = sql<string>`to_char((${leadsSchema.createdAt} at time zone 'America/Sao_Paulo'), 'YYYY-MM-DD')`;

async function leadAggregatesByCampaign(from: Date, to: Date) {
  const rows = await db
    .select({
      campaignKey: campaignKeySql,
      utmSource: leadsSchema.utmSource,
      utmMedium: leadsSchema.utmMedium,
      status: leadsSchema.status,
      leadKind: leadsSchema.leadKind,
      gclidCount: sql<number>`count(*) filter (where nullif(trim(${leadsSchema.gclid}), '') is not null)`,
      count: count(),
    })
    .from(leadsSchema)
    .where(and(gte(leadsSchema.createdAt, from), lte(leadsSchema.createdAt, to)))
    .groupBy(campaignKeySql, leadsSchema.utmSource, leadsSchema.utmMedium, leadsSchema.status, leadsSchema.leadKind);

  return rows.map((row) => ({
    campaignKey: row.campaignKey,
    utmSource: row.utmSource,
    utmMedium: row.utmMedium,
    status: row.status,
    leadKind: row.leadKind,
    gclidCount: Number(row.gclidCount),
    count: row.count,
  }));
}

async function whatsappByCampaign(from: Date, to: Date) {
  const rows = await db
    .select({
      campaignKey: sql<string>`coalesce(nullif(trim(${analyticsEventsSchema.utmCampaign}), ''), ${NO_CAMPAIGN_KEY})`,
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
    .groupBy(sql`coalesce(nullif(trim(${analyticsEventsSchema.utmCampaign}), ''), ${NO_CAMPAIGN_KEY})`);

  return new Map(rows.map((row) => [row.campaignKey, row.count]));
}

async function dailyLeadsByCampaign(from: Date, to: Date) {
  const rows = await db
    .select({
      date: leadDaySql,
      campaignKey: campaignKeySql,
      totalLeads: count(),
    })
    .from(leadsSchema)
    .where(and(gte(leadsSchema.createdAt, from), lte(leadsSchema.createdAt, to)))
    .groupBy(leadDaySql, campaignKeySql)
    .orderBy(desc(leadDaySql), desc(count()))
    .limit(120);

  return rows.map((row) => ({
    date: row.date,
    campaignKey: row.campaignKey,
    campaignLabel: formatCampaignKey(row.campaignKey),
    totalLeads: row.totalLeads,
  }));
}

/**
 * Campaign performance from persisted leads (all statuses) plus WhatsApp clicks.
 */
export async function getCampaignPerformanceReport(from: Date, to: Date): Promise<CampaignPerformanceReport> {
  const [leadRows, whatsappMap, dailyLeads] = await Promise.all([
    leadAggregatesByCampaign(from, to),
    whatsappByCampaign(from, to),
    dailyLeadsByCampaign(from, to),
  ]);

  const campaigns = mergeCampaignLeadAggregates(leadRows).map((row) => ({
    ...row,
    whatsappClicks: whatsappMap.get(row.campaignKey) ?? 0,
  }));

  for (const [campaignKey, whatsappClicks] of whatsappMap.entries()) {
    if (campaigns.some((row) => row.campaignKey === campaignKey)) {
      continue;
    }
    campaigns.push({
      campaignKey,
      campaignLabel: formatCampaignKey(campaignKey),
      utmSource: '—',
      utmMedium: '—',
      whatsappClicks,
      totalLeads: 0,
      quoteLeads: 0,
      cookieLeads: 0,
      withGclid: 0,
      statusCounts: emptyStatusCounts(),
    });
  }

  campaigns.sort((a, b) => b.totalLeads - a.totalLeads || b.whatsappClicks - a.whatsappClicks);

  return { campaigns, dailyLeads };
}

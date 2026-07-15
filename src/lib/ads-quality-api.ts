import 'server-only';

import { and, count, desc, eq, gte, lte, ne, sql } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import {
  brasiliaDayEndUtc,
  brasiliaDayStartUtc,
  formatBrasiliaDateOnly,
} from '@/lib/app-datetime';
import { db } from '@/libs/DB';
import { analyticsEventsSchema, leadsSchema } from '@/models/Schema';

export const ADS_QUALITY_MAX_PAGE_SIZE = 100;
export const ADS_QUALITY_DEFAULT_PAGE_SIZE = 50;

export type AdsQualityFilters = {
  dateFrom: string;
  dateTo: string;
  fromUtc: Date;
  toUtc: Date;
  campaignPrefix: string;
  source?: string;
  medium?: string;
  page: number;
  pageSize: number;
};

export type AdsQualityFilterResult =
  | { ok: true; filters: AdsQualityFilters }
  | { ok: false; status: 400; error: string };

export type AdsQualityCampaign = {
  campaign: string;
  utmSource: string | null;
  utmMedium: string | null;
  leads: number;
  whatsappClicks: number;
  whatsappOpened: number;
  whatsappReplied: number;
  won: number;
  withGclid: number;
  openRate: number;
  replyRate: number;
  wonRate: number;
  gclidRate: number;
};

export type AdsQualitySummary = {
  period: {
    dateFrom: string;
    dateTo: string;
    timezone: 'America/Sao_Paulo';
  };
  filters: {
    campaignPrefix: string;
    source: string | null;
    medium: string | null;
  };
  totals: Omit<AdsQualityCampaign, 'campaign' | 'utmSource' | 'utmMedium'> & {
    campaigns: number;
  };
};

export type AdsQualityLead = {
  leadId: number;
  createdAt: string;
  utmCampaign: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  gclidPresent: boolean;
  city: string | null;
  geoCity: string | null;
  geoRegion: string | null;
  equipmentSlug: string | null;
  equipmentName: string | null;
  landingPage: string | null;
  leadKind: string;
  status: string;
  whatsappOpened: boolean | null;
  whatsappRepliedAt: string | null;
  won: boolean;
};

type LeadAggregateRow = {
  campaign: string;
  utmSource: string | null;
  utmMedium: string | null;
  leads: number;
  whatsappOpened: number;
  whatsappReplied: number;
  won: number;
  withGclid: number;
};

function defaultDateRange(reference = new Date()) {
  const today = formatBrasiliaDateOnly(reference);
  return {
    dateFrom: `${today.slice(0, 8)}01`,
    dateTo: today,
  };
}

function parseDateParam(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/u.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeOptionalFilter(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 120) : undefined;
}

function ratio(part: number, whole: number) {
  if (whole <= 0) {
    return 0;
  }
  return Number((part / whole).toFixed(4));
}

function campaignPrefixWhere(column: typeof leadsSchema.utmCampaign | typeof analyticsEventsSchema.utmCampaign, prefix: string) {
  return sql`lower(trim(coalesce(${column}, ''))) like ${`${prefix.toLowerCase()}%`}`;
}

function optionalExactTextWhere(
  column: typeof leadsSchema.utmSource | typeof leadsSchema.utmMedium | typeof analyticsEventsSchema.utmSource | typeof analyticsEventsSchema.utmMedium,
  value: string | undefined,
) {
  if (!value) {
    return;
  }
  return sql`lower(trim(coalesce(${column}, ''))) = ${value.toLowerCase()}`;
}

function compactConditions(conditions: (SQL | undefined)[]) {
  const compacted: SQL[] = [];
  for (const condition of conditions) {
    if (condition) {
      compacted.push(condition);
    }
  }
  return compacted;
}

function leadWhere(filters: AdsQualityFilters) {
  return and(
    ...compactConditions([
      ne(leadsSchema.leadKind, 'cookie_consent'),
      gte(leadsSchema.createdAt, filters.fromUtc),
      lte(leadsSchema.createdAt, filters.toUtc),
      campaignPrefixWhere(leadsSchema.utmCampaign, filters.campaignPrefix),
      optionalExactTextWhere(leadsSchema.utmSource, filters.source),
      optionalExactTextWhere(leadsSchema.utmMedium, filters.medium),
    ]),
  );
}

function whatsappClickWhere(filters: AdsQualityFilters) {
  return and(
    ...compactConditions([
      eq(analyticsEventsSchema.eventType, 'whatsapp_click'),
      gte(analyticsEventsSchema.createdAt, filters.fromUtc),
      lte(analyticsEventsSchema.createdAt, filters.toUtc),
      campaignPrefixWhere(analyticsEventsSchema.utmCampaign, filters.campaignPrefix),
      optionalExactTextWhere(analyticsEventsSchema.utmSource, filters.source),
      optionalExactTextWhere(analyticsEventsSchema.utmMedium, filters.medium),
    ]),
  );
}

function campaignKey(value: string | null) {
  return value?.trim() || '(sem campanha)';
}

function emptyCampaign(campaign: string): AdsQualityCampaign {
  return {
    campaign,
    utmSource: null,
    utmMedium: null,
    leads: 0,
    whatsappClicks: 0,
    whatsappOpened: 0,
    whatsappReplied: 0,
    won: 0,
    withGclid: 0,
    openRate: 0,
    replyRate: 0,
    wonRate: 0,
    gclidRate: 0,
  };
}

function finalizeCampaign(row: AdsQualityCampaign): AdsQualityCampaign {
  return {
    ...row,
    openRate: ratio(row.whatsappOpened, row.leads),
    replyRate: ratio(row.whatsappReplied, row.leads),
    wonRate: ratio(row.won, row.leads),
    gclidRate: ratio(row.withGclid, row.leads),
  };
}

export function parseAdsQualityFilters(searchParams: URLSearchParams, referenceDate = new Date()): AdsQualityFilterResult {
  const defaults = defaultDateRange(referenceDate);
  const dateFrom = parseDateParam(searchParams.get('dateFrom') ?? searchParams.get('from')) ?? defaults.dateFrom;
  const dateTo = parseDateParam(searchParams.get('dateTo') ?? searchParams.get('to')) ?? defaults.dateTo;
  const fromUtc = brasiliaDayStartUtc(dateFrom);
  const toUtc = brasiliaDayEndUtc(dateTo);

  if (Number.isNaN(fromUtc.getTime()) || Number.isNaN(toUtc.getTime()) || fromUtc > toUtc) {
    return { ok: false, status: 400, error: 'invalid_date_range' };
  }

  const campaignPrefix = searchParams.get('campaignPrefix')?.trim();
  if (!campaignPrefix) {
    return { ok: false, status: 400, error: 'campaign_prefix_required' };
  }
  if (!/^[\dA-Za-z_-]{1,80}$/u.test(campaignPrefix)) {
    return { ok: false, status: 400, error: 'invalid_campaign_prefix' };
  }

  const page = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = Math.min(
    ADS_QUALITY_MAX_PAGE_SIZE,
    parsePositiveInt(searchParams.get('pageSize'), ADS_QUALITY_DEFAULT_PAGE_SIZE),
  );

  return {
    ok: true,
    filters: {
      dateFrom,
      dateTo,
      fromUtc,
      toUtc,
      campaignPrefix,
      source: normalizeOptionalFilter(searchParams.get('source')),
      medium: normalizeOptionalFilter(searchParams.get('medium')),
      page,
      pageSize,
    },
  };
}

export async function getAdsQualityCampaigns(filters: AdsQualityFilters): Promise<AdsQualityCampaign[]> {
  const [leadRows, whatsappRows] = await Promise.all([
    db
      .select({
        campaign: leadsSchema.utmCampaign,
        utmSource: leadsSchema.utmSource,
        utmMedium: leadsSchema.utmMedium,
        leads: count(),
        whatsappOpened: sql<number>`cast(count(*) filter (where ${leadsSchema.whatsappOpened} is true) as int)`,
        whatsappReplied: sql<number>`cast(count(*) filter (where ${leadsSchema.whatsappRepliedAt} is not null) as int)`,
        won: sql<number>`cast(count(*) filter (where ${leadsSchema.status} = 'won') as int)`,
        withGclid: sql<number>`cast(count(*) filter (where nullif(trim(${leadsSchema.gclid}), '') is not null) as int)`,
      })
      .from(leadsSchema)
      .where(leadWhere(filters))
      .groupBy(leadsSchema.utmCampaign, leadsSchema.utmSource, leadsSchema.utmMedium),
    db
      .select({
        campaign: analyticsEventsSchema.utmCampaign,
        whatsappClicks: count(),
      })
      .from(analyticsEventsSchema)
      .where(whatsappClickWhere(filters))
      .groupBy(analyticsEventsSchema.utmCampaign),
  ]);

  const campaigns = new Map<string, AdsQualityCampaign>();

  for (const row of leadRows as LeadAggregateRow[]) {
    const key = campaignKey(row.campaign);
    const existing = campaigns.get(key) ?? emptyCampaign(key);
    existing.utmSource ??= row.utmSource?.trim() || null;
    existing.utmMedium ??= row.utmMedium?.trim() || null;
    existing.leads += Number(row.leads);
    existing.whatsappOpened += Number(row.whatsappOpened);
    existing.whatsappReplied += Number(row.whatsappReplied);
    existing.won += Number(row.won);
    existing.withGclid += Number(row.withGclid);
    campaigns.set(key, existing);
  }

  for (const row of whatsappRows) {
    const key = campaignKey(row.campaign);
    const existing = campaigns.get(key) ?? emptyCampaign(key);
    existing.whatsappClicks += Number(row.whatsappClicks);
    campaigns.set(key, existing);
  }

  return [...campaigns.values()]
    .map(finalizeCampaign)
    .toSorted((a, b) => b.leads - a.leads || b.whatsappReplied - a.whatsappReplied || b.whatsappClicks - a.whatsappClicks);
}

export function summarizeAdsQualityCampaigns(
  filters: AdsQualityFilters,
  campaigns: AdsQualityCampaign[],
): AdsQualitySummary {
  const totals = {
    leads: 0,
    whatsappClicks: 0,
    whatsappOpened: 0,
    whatsappReplied: 0,
    won: 0,
    withGclid: 0,
    openRate: 0,
    replyRate: 0,
    wonRate: 0,
    gclidRate: 0,
    campaigns: campaigns.length,
  };

  for (const row of campaigns) {
    totals.leads += row.leads;
    totals.whatsappClicks += row.whatsappClicks;
    totals.whatsappOpened += row.whatsappOpened;
    totals.whatsappReplied += row.whatsappReplied;
    totals.won += row.won;
    totals.withGclid += row.withGclid;
  }

  return {
    period: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      timezone: 'America/Sao_Paulo',
    },
    filters: {
      campaignPrefix: filters.campaignPrefix,
      source: filters.source ?? null,
      medium: filters.medium ?? null,
    },
    totals: {
      ...totals,
      openRate: ratio(totals.whatsappOpened, totals.leads),
      replyRate: ratio(totals.whatsappReplied, totals.leads),
      wonRate: ratio(totals.won, totals.leads),
      gclidRate: ratio(totals.withGclid, totals.leads),
    },
  };
}

export async function getAdsQualitySummary(filters: AdsQualityFilters) {
  const campaigns = await getAdsQualityCampaigns(filters);
  return summarizeAdsQualityCampaigns(filters, campaigns);
}

export async function listAdsQualityLeads(filters: AdsQualityFilters) {
  const offset = (filters.page - 1) * filters.pageSize;
  const where = leadWhere(filters);

  const [rows, countRows] = await Promise.all([
    db
      .select({
        leadId: leadsSchema.id,
        createdAt: leadsSchema.createdAt,
        utmCampaign: leadsSchema.utmCampaign,
        utmSource: leadsSchema.utmSource,
        utmMedium: leadsSchema.utmMedium,
        utmContent: leadsSchema.utmContent,
        utmTerm: leadsSchema.utmTerm,
        gclid: leadsSchema.gclid,
        city: leadsSchema.city,
        geoCity: leadsSchema.geoCity,
        geoRegion: leadsSchema.geoRegion,
        equipmentSlug: leadsSchema.equipmentSlug,
        equipmentName: leadsSchema.equipmentName,
        landingPage: leadsSchema.landingPage,
        leadKind: leadsSchema.leadKind,
        status: leadsSchema.status,
        whatsappOpened: leadsSchema.whatsappOpened,
        whatsappRepliedAt: leadsSchema.whatsappRepliedAt,
      })
      .from(leadsSchema)
      .where(where)
      .orderBy(desc(leadsSchema.createdAt))
      .limit(filters.pageSize)
      .offset(offset),
    db.select({ total: count() }).from(leadsSchema).where(where),
  ]);

  const total = countRows[0]?.total ?? 0;
  const leads: AdsQualityLead[] = rows.map((row) => ({
    leadId: row.leadId,
    createdAt: row.createdAt.toISOString(),
    utmCampaign: row.utmCampaign,
    utmSource: row.utmSource,
    utmMedium: row.utmMedium,
    utmContent: row.utmContent,
    utmTerm: row.utmTerm,
    gclidPresent: Boolean(row.gclid?.trim()),
    city: row.city,
    geoCity: row.geoCity,
    geoRegion: row.geoRegion,
    equipmentSlug: row.equipmentSlug,
    equipmentName: row.equipmentName,
    landingPage: row.landingPage,
    leadKind: row.leadKind,
    status: row.status,
    whatsappOpened: row.whatsappOpened,
    whatsappRepliedAt: row.whatsappRepliedAt?.toISOString() ?? null,
    won: row.status === 'won',
  }));

  return {
    period: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      timezone: 'America/Sao_Paulo' as const,
    },
    filters: {
      campaignPrefix: filters.campaignPrefix,
      source: filters.source ?? null,
      medium: filters.medium ?? null,
    },
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    },
    leads,
  };
}

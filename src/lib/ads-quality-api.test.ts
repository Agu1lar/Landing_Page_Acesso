import { describe, expect, it } from 'vitest';
import { parseAdsQualityFilters, summarizeAdsQualityCampaigns } from '@/lib/ads-quality-api';

describe('parseAdsQualityFilters', () => {
  it('requires a campaign prefix to avoid exposing old campaigns by accident', () => {
    const parsed = parseAdsQualityFilters(new URLSearchParams('dateFrom=2026-07-01&dateTo=2026-07-15'));

    expect(parsed).toEqual({
      ok: false,
      status: 400,
      error: 'campaign_prefix_required',
    });
  });

  it('parses aliases, pagination and optional source filters', () => {
    const parsed = parseAdsQualityFilters(
      new URLSearchParams('from=2026-07-01&to=2026-07-15&campaignPrefix=nova_&source=google&medium=cpc&page=2&pageSize=999'),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    expect(parsed.filters.dateFrom).toBe('2026-07-01');
    expect(parsed.filters.dateTo).toBe('2026-07-15');
    expect(parsed.filters.campaignPrefix).toBe('nova_');
    expect(parsed.filters.source).toBe('google');
    expect(parsed.filters.medium).toBe('cpc');
    expect(parsed.filters.page).toBe(2);
    expect(parsed.filters.pageSize).toBe(100);
  });

  it('defaults to the current Brasilia month when dates are omitted', () => {
    const parsed = parseAdsQualityFilters(
      new URLSearchParams('campaignPrefix=exp_'),
      new Date('2026-07-15T15:00:00.000Z'),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    expect(parsed.filters.dateFrom).toBe('2026-07-01');
    expect(parsed.filters.dateTo).toBe('2026-07-15');
  });
});

describe('summarizeAdsQualityCampaigns', () => {
  it('sums campaigns and returns rates as ratios', () => {
    const parsed = parseAdsQualityFilters(
      new URLSearchParams('dateFrom=2026-07-01&dateTo=2026-07-15&campaignPrefix=nova_'),
    );

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }

    const summary = summarizeAdsQualityCampaigns(parsed.filters, [
      {
        campaign: 'nova_plataformas',
        utmSource: 'google',
        utmMedium: 'cpc',
        leads: 10,
        whatsappClicks: 14,
        whatsappOpened: 8,
        whatsappReplied: 5,
        won: 2,
        withGclid: 9,
        openRate: 0.8,
        replyRate: 0.5,
        wonRate: 0.2,
        gclidRate: 0.9,
      },
    ]);

    expect(summary.totals).toMatchObject({
      campaigns: 1,
      leads: 10,
      whatsappClicks: 14,
      whatsappOpened: 8,
      whatsappReplied: 5,
      won: 2,
      withGclid: 9,
      openRate: 0.8,
      replyRate: 0.5,
      wonRate: 0.2,
      gclidRate: 0.9,
    });
  });
});

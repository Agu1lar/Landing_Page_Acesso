import { describe, expect, it } from 'vitest';
import {
  formatCampaignKey,
  mergeCampaignLeadAggregates,
  NO_CAMPAIGN_KEY,
  resolveCampaignKey,
} from '@/lib/campaign-analytics';

describe('resolveCampaignKey', () => {
  it('uses utm campaign when present', () => {
    expect(resolveCampaignKey('obra-maio', 'abc')).toBe('obra-maio');
  });

  it('falls back to google ads bucket without utm', () => {
    expect(resolveCampaignKey(null, 'gclid-123')).toBe('__google_ads_no_utm__');
  });

  it('uses no campaign bucket otherwise', () => {
    expect(resolveCampaignKey('', null)).toBe('__no_campaign__');
  });
});

describe('mergeCampaignLeadAggregates', () => {
  it('counts all statuses and lead kinds for the same campaign', () => {
    const rows = mergeCampaignLeadAggregates([
      {
        campaignKey: 'google-ads',
        utmSource: 'google',
        utmMedium: 'cpc',
        status: 'new',
        leadKind: 'quote',
        gclidCount: 2,
        count: 2,
      },
      {
        campaignKey: 'google-ads',
        utmSource: 'google',
        utmMedium: 'cpc',
        status: 'won',
        leadKind: 'quote',
        gclidCount: 1,
        count: 1,
      },
      {
        campaignKey: 'google-ads',
        utmSource: 'google',
        utmMedium: 'cpc',
        status: 'new',
        leadKind: 'cookie_consent',
        gclidCount: 0,
        count: 1,
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.totalLeads).toBe(4);
    expect(rows[0]?.quoteLeads).toBe(3);
    expect(rows[0]?.cookieLeads).toBe(1);
    expect(rows[0]?.statusCounts.new).toBe(3);
    expect(rows[0]?.statusCounts.won).toBe(1);
    expect(rows[0]?.withGclid).toBe(3);
    expect(rows[0]?.utmSource).toBe('google');
  });
});

describe('formatCampaignKey', () => {
  it('labels special buckets in portuguese', () => {
    expect(formatCampaignKey(NO_CAMPAIGN_KEY)).toBe('(sem campanha)');
  });
});

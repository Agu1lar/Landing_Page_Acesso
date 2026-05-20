import { describe, expect, it } from 'vitest';
import {
  buildAttributionFromVisit,
  hasAttributionData,
  parseUtmsFromSearch,
} from '@/lib/attribution';

describe('parseUtmsFromSearch', () => {
  it('maps standard utm query keys', () => {
    const result = parseUtmsFromSearch('?utm_source=google&utm_medium=cpc&utm_campaign=obra');
    expect(result.utmSource).toBe('google');
    expect(result.utmMedium).toBe('cpc');
    expect(result.utmCampaign).toBe('obra');
  });
});

describe('buildAttributionFromVisit', () => {
  it('includes referrer and landing path', () => {
    const result = buildAttributionFromVisit({
      search: '?utm_source=meta',
      referrer: 'https://google.com/',
      landingPath: '/equipamentos/betoneira?utm_source=meta',
    });
    expect(result.utmSource).toBe('meta');
    expect(result.referrer).toContain('google.com');
    expect(result.landingPage).toContain('betoneira');
  });
});

describe('hasAttributionData', () => {
  it('returns false for empty object', () => {
    expect(hasAttributionData({})).toBe(false);
  });

  it('returns true when utm source is set', () => {
    expect(hasAttributionData({ utmSource: 'google' })).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { parseAnalyticsSection } from '@/lib/analytics-sections';

describe('parseAnalyticsSection', () => {
  it('defaults to visao-geral', () => {
    expect(parseAnalyticsSection(undefined)).toBe('visao-geral');
  });

  it('accepts valid section ids', () => {
    expect(parseAnalyticsSection('executivo')).toBe('executivo');
  });

  it('rejects unknown sections', () => {
    expect(parseAnalyticsSection('invalid')).toBe('visao-geral');
  });
});

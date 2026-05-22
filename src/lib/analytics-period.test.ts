import { describe, expect, it } from 'vitest';
import { previousPeriodRange, resolveAnalyticsPeriod } from '@/lib/analytics-period';

describe('resolve analytics period', () => {
  it('defaults to last 30 days when filters are empty', () => {
    const period = resolveAnalyticsPeriod({});
    expect(period.dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(period.dateTo).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    expect(period.from.getTime()).toBeLessThanOrEqual(period.to.getTime());
  });

  it('uses explicit date filters', () => {
    const period = resolveAnalyticsPeriod({
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
    });
    expect(period.dateFrom).toBe('2026-01-01');
    expect(period.dateTo).toBe('2026-01-31');
  });
});

describe('previous period range', () => {
  it('returns a range immediately before the current period', () => {
    const previous = previousPeriodRange('2026-02-01', '2026-02-07');
    expect(previous.to.getTime()).toBeLessThan(
      new Date('2026-02-01T00:00:00.000Z').getTime(),
    );
  });
});

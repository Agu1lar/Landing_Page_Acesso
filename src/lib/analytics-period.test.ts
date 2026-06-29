import { describe, expect, it } from 'vitest';
import {
  calendarMonthRange,
  currentCalendarMonthRange,
  previousCalendarMonthRange,
  previousPeriodRange,
  resolveAnalyticsPeriod,
  resolveComparisonPeriod,
} from '@/lib/analytics-period';

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
    expect(previous.dateFrom).toBe('2026-01-25');
    expect(previous.dateTo).toBe('2026-01-31');
  });
});

describe('resolve comparison period', () => {
  it('uses custom compare dates when both are set', () => {
    const period = resolveAnalyticsPeriod({
      dateFrom: '2026-06-01',
      dateTo: '2026-06-30',
    });
    const comparison = resolveComparisonPeriod(period, {
      compareDateFrom: '2026-05-01',
      compareDateTo: '2026-05-31',
    });

    expect(comparison.comparisonMode).toBe('custom');
    expect(comparison.dateFrom).toBe('2026-05-01');
    expect(comparison.dateTo).toBe('2026-05-31');
  });

  it('falls back to auto previous period when compare dates are missing', () => {
    const period = resolveAnalyticsPeriod({
      dateFrom: '2026-06-01',
      dateTo: '2026-06-30',
    });
    const comparison = resolveComparisonPeriod(period, {});

    expect(comparison.comparisonMode).toBe('auto');
    expect(comparison.dateTo).toBe('2026-05-31');
  });
});

describe('calendar month range', () => {
  it('returns full june 2026', () => {
    expect(calendarMonthRange(2026, 6)).toEqual({
      dateFrom: '2026-06-01',
      dateTo: '2026-06-30',
    });
  });

  it('links current and previous calendar months', () => {
    const reference = new Date('2026-06-15T12:00:00.000Z');
    expect(currentCalendarMonthRange(reference).dateFrom).toBe('2026-06-01');
    expect(previousCalendarMonthRange(reference).dateTo).toBe('2026-05-31');
  });
});

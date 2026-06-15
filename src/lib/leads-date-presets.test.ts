import { describe, expect, it } from 'vitest';
import { lastDaysRange, currentWeekRange, toIsoDateInput } from '@/lib/leads-date-presets';

describe('leads-date-presets', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toIsoDateInput(new Date('2026-05-20T15:00:00.000Z'))).toBe('2026-05-20');
  });

  it('returns a 7-day inclusive range ending today', () => {
    const range = lastDaysRange(7);
    expect(range.dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.dateTo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.dateFrom <= range.dateTo).toBeTruthy();
  });

  it('returns monday through sunday for the current week', () => {
    const range = currentWeekRange(new Date('2026-06-17T12:00:00.000Z'));
    expect(range.dateFrom).toBe('2026-06-15');
    expect(range.dateTo).toBe('2026-06-21');
  });
});

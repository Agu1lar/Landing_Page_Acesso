import { describe, expect, it } from 'vitest';
import { getSaoPauloClock, isCommercialHoursOpen } from '@/lib/business-hours';

/** Fixed instant interpreted in America/Sao_Paulo via formatToParts. */
function bhTime(isoUtc: string) {
  return new Date(isoUtc);
}

describe('business hours', () => {
  it('is open on weekday during desk hours', () => {
    // 2026-06-15 is Monday; 15:00 in São Paulo ≈ 18:00 UTC (BRT = UTC-3)
    expect(isCommercialHoursOpen(bhTime('2026-06-15T18:00:00.000Z'))).toBe(true);
  });

  it('is closed before opening', () => {
    expect(isCommercialHoursOpen(bhTime('2026-06-15T10:00:00.000Z'))).toBe(false);
  });

  it('is closed after 17:15', () => {
    expect(isCommercialHoursOpen(bhTime('2026-06-15T20:30:00.000Z'))).toBe(false);
  });

  it('is open exactly at 17:15', () => {
    expect(isCommercialHoursOpen(bhTime('2026-06-15T20:15:00.000Z'))).toBe(true);
  });

  it('is closed on Saturday', () => {
    expect(isCommercialHoursOpen(bhTime('2026-06-13T15:00:00.000Z'))).toBe(false);
  });

  it('reads São Paulo clock parts', () => {
    const clock = getSaoPauloClock(bhTime('2026-06-15T18:00:00.000Z'));
    expect(clock.weekday).toBe(1);
    expect(clock.hour).toBe(15);
    expect(clock.minute).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { formatDateTimeBrasilia, formatDateTimeBrasiliaExport, brasiliaDayStartUtc } from '@/lib/app-datetime';

describe('formatDateTimeBrasilia', () => {
  it('formats UTC instant in America/Sao_Paulo', () => {
    const instant = new Date('2026-06-08T14:30:00.000Z');
    expect(formatDateTimeBrasilia(instant)).toContain('11:30');
    expect(formatDateTimeBrasilia(instant)).toContain('08/06/2026');
  });

  it('rolls calendar day near midnight Brasília', () => {
    const instant = new Date('2026-06-08T02:30:00.000Z');
    expect(formatDateTimeBrasilia(instant)).toContain('07/06/2026');
    expect(formatDateTimeBrasilia(instant)).toContain('23:30');
  });
});

describe('formatDateTimeBrasiliaExport', () => {
  it('returns sortable local timestamp', () => {
    const instant = new Date('2026-06-08T14:30:00.000Z');
    expect(formatDateTimeBrasiliaExport(instant)).toBe('2026-06-08 11:30:00');
  });
});

describe('brasiliaDayStartUtc', () => {
  it('maps local midnight to 03:00 UTC', () => {
    expect(brasiliaDayStartUtc('2026-06-08').toISOString()).toBe('2026-06-08T03:00:00.000Z');
  });
});

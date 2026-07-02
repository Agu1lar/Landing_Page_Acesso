import { describe, expect, it } from 'vitest';
import { percentChange } from '@/lib/analytics-percent';

describe('percent change', () => {
  it('returns 100 when previous is zero and current is positive', () => {
    expect(percentChange(5, 0)).toBe(100);
  });

  it('returns 0 when both periods are zero', () => {
    expect(percentChange(0, 0)).toBe(0);
  });

  it('rounds relative change', () => {
    expect(percentChange(15, 10)).toBe(50);
  });
});

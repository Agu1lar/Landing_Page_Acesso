import { describe, expect, it } from 'vitest';
import { isInternalAnalyticsPath } from '@/lib/analytics-internal-paths';

describe('isInternalAnalyticsPath', () => {
  it('flags clerk sso callback', () => {
    expect(isInternalAnalyticsPath('/sign-in/create/sso-callback')).toBe(true);
  });

  it('allows marketing homepage', () => {
    expect(isInternalAnalyticsPath('/')).toBe(false);
    expect(isInternalAnalyticsPath('/pt-BR/equipamentos')).toBe(false);
  });
});

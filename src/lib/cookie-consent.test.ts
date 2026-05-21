import { describe, expect, it } from 'vitest';
import { hasAnalyticsConsent, parseConsentValue } from '@/lib/cookie-consent';

describe('parse consent value', () => {
  it('returns pending for missing or invalid storage', () => {
    expect(parseConsentValue(null)).toBe('pending');
    expect(parseConsentValue('')).toBe('pending');
    expect(parseConsentValue('unknown')).toBe('pending');
  });

  it('returns stored analytics or essential choice', () => {
    expect(parseConsentValue('analytics')).toBe('analytics');
    expect(parseConsentValue('essential')).toBe('essential');
  });
});

describe('has analytics consent', () => {
  it('allows PostHog only when analytics was accepted', () => {
    expect(hasAnalyticsConsent('analytics')).toBeTruthy();
    expect(hasAnalyticsConsent('essential')).toBeFalsy();
    expect(hasAnalyticsConsent('pending')).toBeFalsy();
  });
});

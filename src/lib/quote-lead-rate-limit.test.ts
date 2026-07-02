import { describe, expect, it } from 'vitest';
import {
  isQuoteLeadRateLimitExceeded,
  QUOTE_LEAD_RATE_LIMIT,
  quoteLeadWindowStart,
  resolveClientIp,
} from '@/lib/quote-lead-rate-limit';

describe('resolve client ip', () => {
  it('reads the first forwarded address', () => {
    const request = new Request('https://example.com/api/leads', {
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
    });

    expect(resolveClientIp(request)).toBe('203.0.113.10');
  });

  it('falls back to x-real-ip', () => {
    const request = new Request('https://example.com/api/leads', {
      headers: { 'x-real-ip': '198.51.100.4' },
    });

    expect(resolveClientIp(request)).toBe('198.51.100.4');
  });
});

describe('quote lead window start', () => {
  it('aligns timestamps to the fixed window', () => {
    const windowMs = QUOTE_LEAD_RATE_LIMIT.windowMs;
    const now = windowMs * 3 + 1_000;

    expect(quoteLeadWindowStart(now).getTime()).toBe(windowMs * 3);
  });
});

describe('is quote lead rate limit exceeded', () => {
  it('allows up to eight requests per window', () => {
    expect(isQuoteLeadRateLimitExceeded(8)).toBe(false);
    expect(isQuoteLeadRateLimitExceeded(9)).toBe(true);
  });
});

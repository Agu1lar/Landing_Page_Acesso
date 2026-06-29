import { describe, expect, it } from 'vitest';
import { isAnalyticsSchemaMissingError } from '@/lib/analytics-schema';

describe('isAnalyticsSchemaMissingError', () => {
  it('detects missing page_engagement_events table', () => {
    expect(
      isAnalyticsSchemaMissingError(new Error('relation "page_engagement_events" does not exist')),
    ).toBeTruthy();
  });

  it('detects missing lead_kind column', () => {
    expect(
      isAnalyticsSchemaMissingError(new Error('column leads.lead_kind does not exist')),
    ).toBeTruthy();
  });

  it('ignores unrelated database errors', () => {
    expect(isAnalyticsSchemaMissingError(new Error('connection refused'))).toBeFalsy();
  });
});

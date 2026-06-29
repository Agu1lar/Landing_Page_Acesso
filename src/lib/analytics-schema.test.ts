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

  it('detects missing gclid column in nested cause', () => {
    const cause = new Error('column "gclid" does not exist');
    const error = new Error('Failed query', { cause });
    expect(isAnalyticsSchemaMissingError(error)).toBeTruthy();
  });

  it('detects missing analytics_events table', () => {
    expect(
      isAnalyticsSchemaMissingError(new Error('relation "analytics_events" does not exist')),
    ).toBeTruthy();
  });

  it('ignores unrelated database errors', () => {
    expect(isAnalyticsSchemaMissingError(new Error('connection refused'))).toBeFalsy();
  });
});

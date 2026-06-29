import { describe, expect, it } from 'vitest';
import {
  AnalyticsDashboardStepError,
  parseAnalyticsDashboardFailure,
  runAnalyticsDashboardStep,
} from '@/lib/analytics-dashboard-errors';

describe('parseAnalyticsDashboardFailure', () => {
  it('extracts step id from AnalyticsDashboardStepError', () => {
    const cause = new Error('column "utm_campaign" must appear in the GROUP BY clause');
    const error = new AnalyticsDashboardStepError('campaign_report', 'Desempenho por campanha', cause);
    const failure = parseAnalyticsDashboardFailure(error);

    expect(failure.stepId).toBe('campaign_report');
    expect(failure.stepLabel).toBe('Desempenho por campanha');
    expect(failure.message).toContain('GROUP BY');
  });
});

describe('runAnalyticsDashboardStep', () => {
  it('wraps failures with step metadata', async () => {
    await expect(
      runAnalyticsDashboardStep('top_pages', 'Páginas', async () => {
        throw new Error('timeout');
      }),
    ).rejects.toBeInstanceOf(AnalyticsDashboardStepError);
  });
});

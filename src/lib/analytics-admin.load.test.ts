import { describe, expect, it } from 'vitest';
import { getOperationalDashboard } from '@/lib/analytics-admin';

const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabase)('getOperationalDashboard load', () => {
  it('loads metrics without throwing', async () => {
    let error: unknown;
    let dashboard;

    try {
      dashboard = await getOperationalDashboard();
    } catch (caught) {
      error = caught;
    }

    if (error) {
      const message =
        error instanceof Error
          ? `${error.message}${error.cause instanceof Error ? ` | cause: ${error.cause.message}` : ''}`
          : String(error);
      throw new Error(`Dashboard failed: ${message}`);
    }

    expect(dashboard?.period.dateFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

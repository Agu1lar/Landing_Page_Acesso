import { NextResponse } from 'next/server';
import { probeAnalyticsDashboard } from '@/lib/analytics-admin';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { logger } from '@/libs/Logger';

/**
 * Runs analytics dashboard queries step-by-step for admin diagnostics.
 */
export async function GET(request: Request) {
  const access = await requireDashboardAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 401 ? 'Não autenticado' : 'Sem permissão' },
      { status: access.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get('dateFrom') ?? undefined;
  const dateTo = searchParams.get('dateTo') ?? undefined;

  const result = await probeAnalyticsDashboard({ dateFrom, dateTo });

  if (!result.ok) {
    logger.warn('Analytics smoke test failed', {
      failedStepId: result.failedStepId,
      steps: result.steps,
    });
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}

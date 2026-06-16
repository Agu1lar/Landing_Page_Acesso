import { NextResponse } from 'next/server';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { listLeadsForExport, parseLeadListFiltersFromSearchParams } from '@/lib/leads-admin';

/**
 * Exports filtered leads as JSON for authenticated dashboard users.
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
  const filters = parseLeadListFiltersFromSearchParams({
    dateFrom: searchParams.get('dateFrom'),
    dateTo: searchParams.get('dateTo'),
    status: searchParams.get('status'),
    city: searchParams.get('city'),
    origin: searchParams.get('origin'),
    campaignKey: searchParams.get('campaignKey'),
    q: searchParams.get('q'),
  });

  const leads = await listLeadsForExport(filters);
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(leads, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

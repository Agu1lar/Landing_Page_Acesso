import { NextResponse } from 'next/server';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { buildLeadsCsv, listLeadsForExport } from '@/lib/leads-admin';
import type { LeadListFilters } from '@/lib/leads-admin';

type ExportSearchParams = {
  dateFrom?: string | null;
  dateTo?: string | null;
  status?: string | null;
  city?: string | null;
  origin?: string | null;
  q?: string | null;
};

function filtersFromSearchParams(params: ExportSearchParams): LeadListFilters {
  return {
    dateFrom: params.dateFrom ?? undefined,
    dateTo: params.dateTo ?? undefined,
    status: params.status ?? undefined,
    city: params.city ?? undefined,
    origin: params.origin ?? undefined,
    q: params.q ?? undefined,
  };
}

/**
 * Exports filtered leads as CSV for authenticated dashboard users.
 *
 * @param request - Incoming request with optional filter query params.
 * @returns CSV attachment or 401 when unauthenticated.
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
  const filters = filtersFromSearchParams({
    dateFrom: searchParams.get('dateFrom'),
    dateTo: searchParams.get('dateTo'),
    status: searchParams.get('status'),
    city: searchParams.get('city'),
    origin: searchParams.get('origin'),
    q: searchParams.get('q'),
  });

  const leads = await listLeadsForExport(filters);
  const csv = buildLeadsCsv(leads);
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

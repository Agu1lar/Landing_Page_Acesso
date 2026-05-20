import { NextResponse } from 'next/server';
import * as z from 'zod';
import { requireDashboardAccess } from '@/lib/auth-roles';
import { isLeadStatus } from '@/lib/lead-status';
import { updateLeadStatus } from '@/lib/leads-admin';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const BodySchema = z.object({
  status: z.string().trim().min(1).max(40),
});

/**
 * Updates lead status for authenticated dashboard users.
 *
 * @param request - PATCH body with status.
 * @param context - Route params with lead id.
 * @returns Updated lead or error response.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const access = await requireDashboardAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 401 ? 'Não autenticado' : 'Sem permissão' },
      { status: access.status },
    );
  }

  const { id } = await context.params;
  const leadId = Number.parseInt(id, 10);
  if (Number.isNaN(leadId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const json: unknown = await request.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 });
  }

  if (!isLeadStatus(parsed.data.status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 422 });
  }

  const lead = await updateLeadStatus(leadId, parsed.data.status);
  if (!lead) {
    return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead });
}

import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logAdminActivity } from '@/lib/admin-activity';
import { getClerkUserEmail, requireAdminAccess } from '@/lib/auth-roles';
import { addAllowlistEntry } from '@/lib/dashboard-allowlist';

const BodySchema = z.object({
  email: z.string().trim().email().max(320),
  role: z.enum(['admin', 'comercial']),
});

export async function POST(request: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 401 ? 'Não autenticado' : 'Sem permissão' },
      { status: access.status },
    );
  }

  const json: unknown = await request.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 });
  }

  const actorEmail = await getClerkUserEmail(access.userId);
  const result = await addAllowlistEntry({
    email: parsed.data.email,
    role: parsed.data.role,
    addedByEmail: actorEmail,
  });

  if (!result.ok) {
    return NextResponse.json({ error: 'E-mail já autorizado' }, { status: 409 });
  }

  await logAdminActivity({
    userId: access.userId,
    action: 'allowlist_add',
    entityType: 'dashboard_allowlist',
    details: `${result.entry?.email} (${result.entry?.role})`,
  });

  return NextResponse.json({ ok: true, entry: result.entry });
}

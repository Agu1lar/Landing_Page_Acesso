import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logAdminActivity } from '@/lib/admin-activity';
import { getClerkUserEmail, requireAdminAccess } from '@/lib/auth-roles';
import { addAllowlistEntry } from '@/lib/dashboard-allowlist';
import { isAllowedDashboardEmail, normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import { logger } from '@/libs/Logger';

const BodySchema = z.object({
  email: z
    .string()
    .trim()
    .max(320)
    .transform(normalizeAllowlistEmail)
    .refine(isAllowedDashboardEmail, { message: 'E-mail inválido' }),
  role: z.enum(['admin', 'comercial']),
});

export async function POST(request: Request) {
  try {
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
      return NextResponse.json({ error: 'Informe um e-mail válido' }, { status: 422 });
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

    try {
      await logAdminActivity({
        userId: access.userId,
        action: 'allowlist_add',
        entityType: 'dashboard_allowlist',
        details: `${result.entry?.email} (${result.entry?.role})`,
      });
    } catch (auditError) {
      logger.warn('Allowlist entry saved but audit log failed', {
        message: auditError instanceof Error ? auditError.message : String(auditError),
      });
    }

    return NextResponse.json({ ok: true, entry: result.entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to add dashboard allowlist entry', { message });

    const missingTable =
      /dashboard_allowlist/u.test(message) &&
      (/does not exist|relation/u.test(message) || /42P01/u.test(message));

    return NextResponse.json(
      {
        error: missingTable
          ? 'Erro ao salvar e-mail. Verifique se a migração 0012 foi aplicada no banco.'
          : 'Erro ao salvar e-mail. Tente de novo em instantes.',
      },
      { status: 500 },
    );
  }
}

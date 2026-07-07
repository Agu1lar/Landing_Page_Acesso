import { NextResponse } from 'next/server';
import * as z from 'zod';
import { logAdminActivity } from '@/lib/admin-activity';
import { getDashboardUserEmail, requireAdminAccess } from '@/lib/auth-roles';
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
  password: z.string().min(8).max(200),
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
      return NextResponse.json({ error: 'Informe e-mail e senha válidos (mín. 8 caracteres)' }, { status: 422 });
    }

    const actorEmail = await getDashboardUserEmail(access.userId);
    const result = await addAllowlistEntry({
      email: parsed.data.email,
      role: parsed.data.role,
      password: parsed.data.password,
      addedByEmail: actorEmail,
    });

    if (!result.ok) {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
    }

    try {
      await logAdminActivity({
        userId: access.userId,
        action: 'allowlist_add',
        entityType: 'dashboard_allowlist',
        details: `${result.entry?.email} (${result.entry?.role})`,
      });
    } catch (auditError) {
      logger.warn('Dashboard user saved but audit log failed', {
        message: auditError instanceof Error ? auditError.message : String(auditError),
      });
    }

    return NextResponse.json({ ok: true, entry: result.entry });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to add dashboard user', { message });

    return NextResponse.json(
      { error: 'Erro ao salvar usuário. Tente de novo em instantes.' },
      { status: 500 },
    );
  }
}

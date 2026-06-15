import { NextResponse } from 'next/server';
import { logAdminActivity } from '@/lib/admin-activity';
import { getClerkUserEmail, requireAdminAccess } from '@/lib/auth-roles';
import { removeAllowlistEntry } from '@/lib/dashboard-allowlist';
import { logger } from '@/libs/Logger';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const access = await requireAdminAccess();
    if (!access.ok) {
      return NextResponse.json(
        { error: access.status === 401 ? 'Não autenticado' : 'Sem permissão' },
        { status: access.status },
      );
    }

    const { id } = await context.params;
    const entryId = Number.parseInt(id, 10);
    if (Number.isNaN(entryId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const actorEmail = await getClerkUserEmail(access.userId);
    if (!actorEmail) {
      return NextResponse.json({ error: 'Conta sem e-mail' }, { status: 422 });
    }

    const result = await removeAllowlistEntry({ id: entryId, actorEmail });
    if (!result.ok) {
      if (result.reason === 'not_found') {
        return NextResponse.json({ error: 'E-mail não encontrado' }, { status: 404 });
      }
      if (result.reason === 'last_admin') {
        return NextResponse.json(
          { error: 'Não é possível remover o último administrador' },
          { status: 409 },
        );
      }
      return NextResponse.json({ error: 'Operação não permitida' }, { status: 409 });
    }

    await logAdminActivity({
      userId: access.userId,
      action: 'allowlist_remove',
      entityType: 'dashboard_allowlist',
      details: result.email,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Failed to remove dashboard allowlist entry', {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Erro ao remover e-mail' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import * as z from 'zod';
import { requireAdminAccess } from '@/lib/auth-roles';
import { deleteClientsByIds } from '@/lib/clients';

const BodySchema = z.object({
  clientIds: z
    .array(z.number().int().positive())
    .min(1, 'Selecione pelo menos um cliente.')
    .max(20, 'É possível excluir no máximo 20 clientes por vez.')
    .refine((ids) => new Set(ids).size === ids.length, 'IDs duplicados na seleção.'),
});

/**
 * Deletes client records (admin only). Linked leads remain; client_id is cleared.
 */
export async function POST(request: Request) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 401 ? 'Não autenticado' : 'Sem permissão' },
      { status: access.status },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 422 },
    );
  }

  try {
    const result = await deleteClientsByIds(parsed.data.clientIds);
    return NextResponse.json({ ok: true, deletedCount: result.deletedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível excluir os clientes.';
    const status = message.includes('não foram encontrados') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextResponse } from 'next/server';
import * as z from 'zod';
import { requireAdminAccess } from '@/lib/auth-roles';
import { mergeClientsByIds } from '@/lib/clients';

const BodySchema = z.object({
  clientIds: z
    .array(z.number().int().positive())
    .min(2, 'Selecione pelo menos dois clientes.')
    .max(20, 'É possível mesclar no máximo 20 clientes por vez.')
    .refine((ids) => new Set(ids).size === ids.length, 'IDs duplicados na seleção.'),
});

/**
 * Merges multiple client records into the oldest id (admin only).
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
    const result = await mergeClientsByIds(parsed.data.clientIds);
    return NextResponse.json({
      ok: true,
      primaryClientId: result.primaryClientId,
      mergedCount: result.mergedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível mesclar os clientes.';
    const status = message.includes('não foram encontrados') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

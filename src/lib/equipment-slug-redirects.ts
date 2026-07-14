import 'server-only';

import { eq, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { equipmentSlugRedirectsSchema } from '@/models/Schema';

const MAX_REDIRECT_HOPS = 5;

/**
 * Returns the final equipment slug after following slug redirects.
 */
export async function getEquipmentSlugRedirectTarget(fromSlug: string) {
  let current = fromSlug;

  try {
    for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
      const [row] = await db
        .select({ toSlug: equipmentSlugRedirectsSchema.toSlug })
        .from(equipmentSlugRedirectsSchema)
        .where(eq(equipmentSlugRedirectsSchema.fromSlug, current))
        .limit(1);

      if (!row || row.toSlug === current) {
        break;
      }

      current = row.toSlug;
    }
  } catch {
    return null;
  }

  return current === fromSlug ? null : current;
}

/**
 * Registers a permanent redirect when an equipment slug changes.
 */
export async function registerEquipmentSlugRedirect(input: {
  fromSlug: string;
  toSlug: string;
  equipmentId?: number;
}) {
  if (!input.fromSlug || input.fromSlug === input.toSlug) {
    return;
  }

  await db
    .update(equipmentSlugRedirectsSchema)
    .set({ toSlug: input.toSlug })
    .where(eq(equipmentSlugRedirectsSchema.toSlug, input.fromSlug));

  await db
    .insert(equipmentSlugRedirectsSchema)
    .values({
      fromSlug: input.fromSlug,
      toSlug: input.toSlug,
      equipmentId: input.equipmentId,
    })
    .onConflictDoUpdate({
      target: equipmentSlugRedirectsSchema.fromSlug,
      set: {
        toSlug: input.toSlug,
        equipmentId: input.equipmentId,
        createdAt: sql`NOW()`,
      },
    });
}

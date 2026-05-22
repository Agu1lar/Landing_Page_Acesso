import { desc } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { adminActivitySchema } from '@/models/Schema';

type LogAdminActivityInput = {
  userId: string;
  action: string;
  entityType: string;
  entitySlug?: string;
  details?: string;
};

/**
 * Records an admin panel action for audit trail.
 */
export async function logAdminActivity(input: LogAdminActivityInput) {
  await db.insert(adminActivitySchema).values({
    userId: input.userId,
    action: input.action,
    entityType: input.entityType,
    entitySlug: input.entitySlug ?? null,
    details: input.details ?? null,
  });
}

/**
 * Lists recent admin audit entries.
 */
export async function listAdminActivity(limit = 50) {
  return db
    .select()
    .from(adminActivitySchema)
    .orderBy(desc(adminActivitySchema.createdAt))
    .limit(limit);
}

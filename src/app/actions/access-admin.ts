'use server';

import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { logAdminActivity } from '@/lib/admin-activity';
import { getClerkUserEmail, requireAdminAccess } from '@/lib/auth-roles';
import { addAllowlistEntry, removeAllowlistEntry } from '@/lib/dashboard-allowlist';
import { isAllowedDashboardEmail, normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import { logger } from '@/libs/Logger';

export type AllowlistActionResult =
  | { ok: true; email?: string }
  | {
      ok: false;
      code: 'unauthorized' | 'invalid' | 'duplicate' | 'last_admin' | 'not_found' | 'generic';
    };

const AddAllowlistSchema = z.object({
  email: z
    .string()
    .trim()
    .max(320)
    .transform(normalizeAllowlistEmail)
    .refine(isAllowedDashboardEmail, { message: 'invalid' }),
  role: z.enum(['admin', 'comercial']),
});

function revalidateAccessPage() {
  revalidatePath('/dashboard/acesso');
}

export async function addAllowlistEmailAction(input: {
  email: string;
  role: 'admin' | 'comercial';
}): Promise<AllowlistActionResult> {
  try {
    const access = await requireAdminAccess();
    if (!access.ok) {
      return { ok: false, code: 'unauthorized' };
    }

    const parsed = AddAllowlistSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, code: 'invalid' };
    }

    const actorEmail = await getClerkUserEmail(access.userId);
    const result = await addAllowlistEntry({
      email: parsed.data.email,
      role: parsed.data.role,
      addedByEmail: actorEmail,
    });

    if (!result.ok) {
      return { ok: false, code: 'duplicate' };
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

    revalidateAccessPage();
    return { ok: true, email: result.entry?.email };
  } catch (error) {
    logger.error('Failed to add dashboard allowlist entry via action', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, code: 'generic' };
  }
}

export async function removeAllowlistEmailAction(id: number): Promise<AllowlistActionResult> {
  try {
    const access = await requireAdminAccess();
    if (!access.ok) {
      return { ok: false, code: 'unauthorized' };
    }

    const actorEmail = await getClerkUserEmail(access.userId);
    if (!actorEmail) {
      return { ok: false, code: 'invalid' };
    }

    const result = await removeAllowlistEntry({ id, actorEmail });
    if (!result.ok) {
      if (result.reason === 'not_found') {
        return { ok: false, code: 'not_found' };
      }
      return { ok: false, code: 'last_admin' };
    }

    await logAdminActivity({
      userId: access.userId,
      action: 'allowlist_remove',
      entityType: 'dashboard_allowlist',
      details: result.email,
    });

    revalidateAccessPage();
    return { ok: true, email: result.email };
  } catch (error) {
    logger.error('Failed to remove dashboard allowlist entry via action', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, code: 'generic' };
  }
}

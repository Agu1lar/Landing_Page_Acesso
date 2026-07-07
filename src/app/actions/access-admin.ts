'use server';

import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { logAdminActivity } from '@/lib/admin-activity';
import { getDashboardUserEmail, requireAdminAccess } from '@/lib/auth-roles';
import {
  addAllowlistEntry,
  removeAllowlistEntry,
  updateAllowlistPassword,
} from '@/lib/dashboard-allowlist';
import { isAllowedDashboardEmail, normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';
import { logger } from '@/libs/Logger';

export type AllowlistActionResult =
  | { ok: true; email?: string }
  | {
      ok: false;
      code: 'unauthorized' | 'invalid' | 'duplicate' | 'last_admin' | 'not_found' | 'generic';
    };

const PasswordSchema = z.string().min(8).max(200);

const AddAllowlistSchema = z.object({
  email: z
    .string()
    .trim()
    .max(320)
    .transform(normalizeAllowlistEmail)
    .refine(isAllowedDashboardEmail, { message: 'invalid' }),
  role: z.enum(['admin', 'comercial']),
  password: PasswordSchema,
});

const UpdatePasswordSchema = z.object({
  id: z.number().int().positive(),
  password: PasswordSchema,
});

function revalidateAccessPage() {
  revalidatePath('/dashboard/acesso');
}

export async function addAllowlistEmailAction(input: {
  email: string;
  role: 'admin' | 'comercial';
  password: string;
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

    const actorEmail = await getDashboardUserEmail(access.userId);
    const result = await addAllowlistEntry({
      email: parsed.data.email,
      role: parsed.data.role,
      password: parsed.data.password,
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
      logger.warn('Dashboard user saved but audit log failed', {
        message: auditError instanceof Error ? auditError.message : String(auditError),
      });
    }

    revalidateAccessPage();
    return { ok: true, email: result.entry?.email };
  } catch (error) {
    logger.error('Failed to add dashboard user via action', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, code: 'generic' };
  }
}

export async function updateAllowlistPasswordAction(input: {
  id: number;
  password: string;
}): Promise<AllowlistActionResult> {
  try {
    const access = await requireAdminAccess();
    if (!access.ok) {
      return { ok: false, code: 'unauthorized' };
    }

    const parsed = UpdatePasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, code: 'invalid' };
    }

    const result = await updateAllowlistPassword(parsed.data);
    if (!result.ok) {
      return { ok: false, code: 'not_found' };
    }

    await logAdminActivity({
      userId: access.userId,
      action: 'allowlist_password_reset',
      entityType: 'dashboard_allowlist',
      details: result.entry.email,
    });

    revalidateAccessPage();
    return { ok: true, email: result.entry.email };
  } catch (error) {
    logger.error('Failed to update dashboard user password via action', {
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

    const actorEmail = await getDashboardUserEmail(access.userId);
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
    logger.error('Failed to remove dashboard user via action', {
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, code: 'generic' };
  }
}

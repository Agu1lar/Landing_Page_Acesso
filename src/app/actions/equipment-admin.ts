'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { logAdminActivity } from '@/lib/admin-activity';
import { requireAdminAccess } from '@/lib/auth-roles';
import { EQUIPMENT_CATALOG_TAG, EQUIPMENT_IMAGE_MAP_TAG } from '@/lib/equipment-cache-tags';
import {
  archiveEquipmentBySlug,
  duplicateEquipmentAsDraft,
  saveEquipmentWithImages,
  seedEquipmentFromJson,
} from '@/lib/equipment-db';
import { syncPriorityEquipmentFromJson } from '@/lib/equipment-sync';
import { slugifyEquipmentName } from '@/lib/equipment-slug';
import { ALL_EQUIPMENT_CATEGORIES } from '@/lib/categories-seo';
import {
  EquipmentAdminFormSchema,
  parseImagesJson,
  specSchema,
} from '@/validations/equipment-admin';
import * as z from 'zod';

function revalidateEquipmentPaths(slug: string, category?: string) {
  updateTag(EQUIPMENT_CATALOG_TAG);
  updateTag(EQUIPMENT_IMAGE_MAP_TAG);
  revalidatePath('/');
  revalidatePath('/equipamentos');
  revalidatePath(`/equipamentos/${slug}`);
  revalidatePath('/sitemap.xml');

  if (category) {
    revalidatePath(`/categorias/${category}`);
  } else {
    for (const categorySlug of ALL_EQUIPMENT_CATEGORIES) {
      revalidatePath(`/categorias/${categorySlug}`);
    }
  }
}

/**
 * Imports JSON catalog into Postgres when table is empty.
 */
export async function importEquipmentCatalogAction() {
  const access = await requireAdminAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const result = await seedEquipmentFromJson(access.userId);
  const sync = await syncPriorityEquipmentFromJson(access.userId);
  await logAdminActivity({
    userId: access.userId,
    action: 'import_catalog',
    entityType: 'equipment',
    details: `inserted=${result.inserted}; priority=${sync.map((row) => `${row.slug}:${row.action}`).join(',')}`,
  });

  revalidatePath('/dashboard/equipamentos');
  revalidatePath('/equipamentos');
  revalidatePath('/categorias/guindastes-remocoes');
  redirect('/dashboard/equipamentos');
}

/**
 * Upserts priority catalog items (guindaste/Munck) from equipamentos.json.
 */
export async function syncPriorityCatalogAction() {
  const access = await requireAdminAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const sync = await syncPriorityEquipmentFromJson(access.userId);
  await logAdminActivity({
    userId: access.userId,
    action: 'sync_priority_catalog',
    entityType: 'equipment',
    details: sync.map((row) => `${row.slug}:${row.action}`).join(','),
  });

  for (const row of sync) {
    if (row.action !== 'skipped') {
      revalidateEquipmentPaths(row.slug, 'guindastes-remocoes');
    }
  }

  revalidatePath('/dashboard/equipamentos');
  redirect('/dashboard/equipamentos');
}

/**
 * Saves equipment from admin form.
 */
export async function saveEquipmentAction(formData: FormData) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const nameFromForm = String(formData.get('name') ?? '').trim();
  const slugFromForm = String(formData.get('slug') ?? '').trim();
  const resolvedSlug = slugFromForm || slugifyEquipmentName(nameFromForm);

  if (!resolvedSlug) {
    redirect('/dashboard/equipamentos');
  }

  const parsed = EquipmentAdminFormSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    slug: resolvedSlug,
    name: nameFromForm,
    featured: formData.get('featured') === 'true',
    available: formData.get('available') === 'true',
    published: formData.get('published') === 'true',
  });
  if (!parsed.success) {
    redirect('/dashboard/equipamentos');
  }

  const data = parsed.data;
  const existingId = formData.get('existingId');
  const specsResult = safeParseSpecsJson(data.specsJson);
  const imagesResult = safeParseImagesJson(data.imagesJson);
  if (!specsResult.ok || !imagesResult.ok) {
    redirect('/dashboard/equipamentos');
  }
  const specs = specsResult.data;
  const images = imagesResult.data;
  const tags = data.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (images.length === 0) {
    images.push({
      url: `/equipamentos/${data.slug}.webp`,
      alt: data.name,
      sortOrder: 0,
      isPrimary: true,
    });
  } else if (!images.some((image) => image.isPrimary)) {
    images[0]!.isPrimary = true;
  }

  await saveEquipmentWithImages({
    input: {
      slug: data.slug,
      name: data.name,
      category: data.category,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription,
      specs,
      tags,
      featured: data.featured,
      available: data.available,
      published: data.published,
    },
    images,
    userId: access.userId,
    existingId: existingId ? Number.parseInt(String(existingId), 10) : undefined,
  });

  await logAdminActivity({
    userId: access.userId,
    action: existingId ? 'update' : 'create',
    entityType: 'equipment',
    entitySlug: data.slug,
  });

  revalidateEquipmentPaths(data.slug, data.category);
  redirect(`/dashboard/equipamentos/${data.slug}/edit`);
}

function safeParseSpecsJson(raw: string) {
  if (!raw.trim()) {
    return { ok: true as const, data: [] as z.infer<typeof specSchema>[] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false as const };
  }
  const result = z.array(specSchema).safeParse(parsed);
  if (!result.success) {
    return { ok: false as const };
  }
  return { ok: true as const, data: result.data };
}

function safeParseImagesJson(raw: string) {
  if (!raw.trim()) {
    return { ok: true as const, data: [] as ReturnType<typeof parseImagesJson> };
  }
  try {
    return { ok: true as const, data: parseImagesJson(raw) };
  } catch {
    return { ok: false as const };
  }
}

/**
 * Duplicates equipment from a form with hidden slug field.
 */
export async function duplicateEquipmentFormAction(formData: FormData) {
  const slug = String(formData.get('slug') ?? '');
  if (!slug) {
    redirect('/dashboard/equipamentos');
  }
  await duplicateEquipmentAction(slug);
}

/**
 * Archives equipment from a form with hidden slug field.
 */
export async function archiveEquipmentFormAction(formData: FormData) {
  const slug = String(formData.get('slug') ?? '');
  if (!slug) {
    redirect('/dashboard/equipamentos');
  }
  await archiveEquipmentAction(slug);
}

/**
 * Archives equipment (soft delete).
 */
export async function archiveEquipmentAction(slug: string) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  await archiveEquipmentBySlug(slug, access.userId);
  await logAdminActivity({
    userId: access.userId,
    action: 'archive',
    entityType: 'equipment',
    entitySlug: slug,
  });

  revalidateEquipmentPaths(slug);
  revalidatePath('/dashboard/equipamentos');
  redirect('/dashboard/equipamentos');
}

/**
 * Duplicates equipment as draft.
 */
export async function duplicateEquipmentAction(slug: string) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    return { error: 'Sem permissão' };
  }

  const copy = await duplicateEquipmentAsDraft(slug, access.userId);
  if (!copy) {
    return { error: 'Equipamento não encontrado' };
  }

  await logAdminActivity({
    userId: access.userId,
    action: 'duplicate',
    entityType: 'equipment',
    entitySlug: copy.slug,
    details: `from=${slug}`,
  });

  revalidatePath('/dashboard/equipamentos');
  redirect(`/dashboard/equipamentos/${copy.slug}/edit`);
}

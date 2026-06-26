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
import {
  consolidateMangoteVibradorInDb,
  MANGOTE_VIBRADOR_SLUG,
  syncEquipmentCategoryCopyFromJson,
  syncPriorityEquipmentFromJson,
  upsertEquipmentFromJsonBySlug,
} from '@/lib/equipment-sync';
import { applyPlatformKindToCatalogItem, isPlatformKind } from '@/lib/platform-kind-admin';
import { applyWorkHeightToSpecs, parseWorkHeightMeters } from '@/lib/platform-height-admin';
import {
  adminListFiltersSuffix,
  equipmentAdminListPathAfterArchive,
} from '@/lib/admin-return-path';
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
  revalidatePath('/catalog.json');
  revalidatePath('/llms.txt');

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
  revalidatePath('/categorias/guindaste-industrial');
  redirect('/dashboard/equipamentos');
}

/**
 * Upserts priority catalog items (guindaste industrial) from equipamentos.json.
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
      revalidateEquipmentPaths(row.slug, 'guindaste-industrial');
    }
  }

  revalidatePath('/dashboard/equipamentos');
  redirect('/dashboard/equipamentos');
}

/**
 * Updates ferramentas elétricas text fields in Postgres from equipamentos.json.
 */
export async function syncFerramentasEletricasCopyAction() {
  const access = await requireAdminAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const sync = await syncEquipmentCategoryCopyFromJson('ferramentas-eletricas', access.userId);
  const mangote = await consolidateMangoteVibradorInDb(access.userId, { overwriteFromJson: true });
  const updated = sync.filter((row) => row.action === 'updated');

  await logAdminActivity({
    userId: access.userId,
    action: 'sync_ferramentas_eletricas_copy',
    entityType: 'equipment',
    details: `updated=${updated.length}; skipped=${sync.length - updated.length}; mangote=${mangote.consolidated}; archived=${mangote.archived.length}`,
  });

  for (const row of updated) {
    revalidateEquipmentPaths(row.slug, 'ferramentas-eletricas');
  }

  if (mangote.consolidated !== 'skipped') {
    revalidateEquipmentPaths(MANGOTE_VIBRADOR_SLUG, 'ferramentas-eletricas');
  }

  for (const slug of mangote.archived) {
    revalidateEquipmentPaths(slug, 'ferramentas-eletricas');
  }

  revalidatePath('/dashboard/equipamentos');
  revalidatePath('/categorias/ferramentas-eletricas');
  redirect('/dashboard/equipamentos');
}

/**
 * Archives legacy mangote slugs and keeps a single published mangote-vibrador item.
 */
export async function consolidateMangoteVibradorAction() {
  const access = await requireAdminAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const mangote = await consolidateMangoteVibradorInDb(access.userId);

  await logAdminActivity({
    userId: access.userId,
    action: 'consolidate_mangote_vibrador',
    entityType: 'equipment',
    details: `consolidated=${mangote.consolidated}; archived=${mangote.archived.join(',') || 'none'}`,
  });

  if (mangote.consolidated !== 'skipped') {
    revalidateEquipmentPaths(MANGOTE_VIBRADOR_SLUG, 'ferramentas-eletricas');
  }

  for (const slug of mangote.archived) {
    revalidateEquipmentPaths(slug, 'ferramentas-eletricas');
  }

  revalidatePath('/dashboard/equipamentos');
  revalidatePath('/categorias/ferramentas-eletricas');
  redirect('/dashboard/equipamentos?category=ferramentas-eletricas&q=mangote');
}

/**
 * Imports one JSON catalog item into Postgres so it can be edited in the admin.
 */
export async function importEquipmentFromJsonAction(formData: FormData) {
  const access = await requireAdminAccess();
  if (!access.ok) {
    redirect('/unauthorized');
  }

  const slug = String(formData.get('slug') ?? '').trim();
  if (!slug) {
    redirect('/dashboard/equipamentos');
  }

  const result = await upsertEquipmentFromJsonBySlug(slug, access.userId);

  await logAdminActivity({
    userId: access.userId,
    action: 'import_from_json',
    entityType: 'equipment',
    entitySlug: slug,
    details: result.action,
  });

  revalidateEquipmentPaths(slug);
  revalidatePath('/dashboard/equipamentos');

  const filters = adminListFiltersSuffix(formData);
  if (result.action === 'skipped') {
    redirect(`/dashboard/equipamentos${filters}`);
  }

  redirect(`/dashboard/equipamentos/${slug}/edit${filters}`);
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
  let specs = specsResult.data;
  const images = imagesResult.data;
  let tags = data.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (data.category === 'plataformas-elevatorias') {
    const kindRaw = String(formData.get('platformKind') ?? '');
    const workHeightRaw = String(formData.get('platformWorkHeight') ?? '');
    const workHeightMeters = parseWorkHeightMeters(workHeightRaw);
    if (!isPlatformKind(kindRaw) || workHeightMeters === null) {
      redirect('/dashboard/equipamentos');
    }
    const applied = applyPlatformKindToCatalogItem({
      specs,
      tags,
      kind: kindRaw,
    });
    specs = applyWorkHeightToSpecs({
      specs: applied.specs,
      workHeightMeters,
    });
    tags = applied.tags;
  }

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
  const filters = adminListFiltersSuffix(formData);
  redirect(`/dashboard/equipamentos/${data.slug}/edit${filters}`);
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
  await duplicateEquipmentAction(slug, formData);
}

/**
 * Archives equipment from a form with hidden slug field.
 */
export async function archiveEquipmentFormAction(formData: FormData) {
  const slug = String(formData.get('slug') ?? '');
  if (!slug) {
    redirect('/dashboard/equipamentos');
  }
  await archiveEquipmentAction(slug, formData);
}

/**
 * Archives equipment (soft delete).
 */
export async function archiveEquipmentAction(slug: string, formData?: FormData) {
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
  if (formData) {
    redirect(equipmentAdminListPathAfterArchive(formData));
  }
  redirect('/dashboard/equipamentos?status=archived');
}

/**
 * Duplicates equipment as draft.
 */
export async function duplicateEquipmentAction(slug: string, formData?: FormData) {
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
  const filters = formData ? adminListFiltersSuffix(formData) : '';
  redirect(`/dashboard/equipamentos/${copy.slug}/edit${filters}`);
}

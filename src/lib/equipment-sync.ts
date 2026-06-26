import { eq } from 'drizzle-orm';
import equipmentJson from '@/data/equipamentos.json';
import {
  archiveEquipmentBySlug,
  getEquipmentRowBySlug,
  getEquipmentRowBySlugIncludingArchived,
  listEquipmentImages,
} from '@/lib/equipment-db';
import { defaultEquipmentImageUrl } from '@/lib/admin-gallery-image';
import {
  MANGOTE_VIBRADOR_SLUG,
  RETIRED_MANGOTE_VIBRADOR_SLUGS,
} from '@/lib/equipment-retired-slugs';
import { db } from '@/libs/DB';
import { equipmentImagesSchema, equipmentSchema } from '@/models/Schema';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

const jsonCatalog = equipmentJson as Equipment[];

/** Slugs that must exist in Postgres with correct category and visibility. */
export const PRIORITY_CATALOG_SLUGS = ['franna-fr17'] as const;

export { MANGOTE_VIBRADOR_SLUG, RETIRED_MANGOTE_VIBRADOR_SLUGS } from '@/lib/equipment-retired-slugs';

export type PrioritySyncResult = {
  slug: string;
  action: 'inserted' | 'updated' | 'skipped';
};

export type CategoryCopySyncResult = {
  slug: string;
  action: 'updated' | 'skipped';
};

function primaryImageUrl(slug: string) {
  return defaultEquipmentImageUrl(slug);
}

async function ensurePrimaryImage(equipmentId: number, slug: string, name: string) {
  const images = await listEquipmentImages(equipmentId);
  if (images.some((image) => image.isPrimary)) {
    return;
  }

  await db.insert(equipmentImagesSchema).values({
    equipmentId,
    url: primaryImageUrl(slug),
    alt: name,
    sortOrder: 0,
    isPrimary: true,
  });
}

/**
 * Upserts priority catalog items from equipamentos.json into Postgres.
 */
export async function syncPriorityEquipmentFromJson(updatedBy?: string) {
  const results: PrioritySyncResult[] = [];

  for (const slug of PRIORITY_CATALOG_SLUGS) {
    results.push(await upsertEquipmentFromJsonBySlug(slug, updatedBy));
  }

  return results;
}

/**
 * Inserts or updates one catalog item from equipamentos.json into Postgres.
 */
export async function upsertEquipmentFromJsonBySlug(
  slug: string,
  updatedBy?: string,
): Promise<PrioritySyncResult> {
  const jsonItem = jsonCatalog.find((item) => item.slug === slug);
  if (!jsonItem) {
    return { slug, action: 'skipped' };
  }

  const existing = await getEquipmentRowBySlugIncludingArchived(slug);
  const actor = updatedBy ?? 'sync-json';

  if (existing) {
    await db
      .update(equipmentSchema)
      .set({
        name: jsonItem.name,
        category: jsonItem.category,
        shortDescription: jsonItem.shortDescription,
        longDescription: jsonItem.longDescription,
        specs: jsonItem.specs,
        tags: jsonItem.tags,
        featured: jsonItem.featured,
        available: true,
        published: true,
        deletedAt: null,
        updatedBy: actor,
        updatedAt: new Date(),
      })
      .where(eq(equipmentSchema.id, existing.id));

    await ensurePrimaryImage(existing.id, jsonItem.slug, jsonItem.name);
    return { slug, action: 'updated' };
  }

  const [row] = await db
    .insert(equipmentSchema)
    .values({
      slug: jsonItem.slug,
      name: jsonItem.name,
      category: jsonItem.category,
      shortDescription: jsonItem.shortDescription,
      longDescription: jsonItem.longDescription,
      specs: jsonItem.specs,
      tags: jsonItem.tags,
      featured: jsonItem.featured,
      available: true,
      published: true,
      updatedBy: actor,
    })
    .returning({ id: equipmentSchema.id });

  if (row?.id) {
    await ensurePrimaryImage(row.id, jsonItem.slug, jsonItem.name);
  }

  return { slug, action: 'inserted' };
}

/**
 * Updates short/long descriptions and specs in Postgres from equipamentos.json for one category.
 */
export async function syncEquipmentCategoryCopyFromJson(
  category: EquipmentCategory,
  updatedBy?: string,
) {
  const results: CategoryCopySyncResult[] = [];
  const actor = updatedBy ?? 'sync-json';

  for (const jsonItem of jsonCatalog.filter((item) => item.category === category)) {
    const existing = await getEquipmentRowBySlug(jsonItem.slug);
    if (!existing) {
      results.push({ slug: jsonItem.slug, action: 'skipped' });
      continue;
    }

    await db
      .update(equipmentSchema)
      .set({
        shortDescription: jsonItem.shortDescription,
        longDescription: jsonItem.longDescription,
        specs: jsonItem.specs,
        updatedBy: actor,
        updatedAt: new Date(),
      })
      .where(eq(equipmentSchema.id, existing.id));

    results.push({ slug: jsonItem.slug, action: 'updated' });
  }

  return results;
}

export type MangoteConsolidationResult = {
  archived: string[];
  consolidated: 'inserted' | 'updated' | 'published' | 'skipped';
};

type ConsolidateMangoteOptions = {
  /** When true, overwrites text fields from equipamentos.json on an existing row. */
  overwriteFromJson?: boolean;
};

/**
 * Archives retired mangote slugs and upserts the consolidated catalog item in Postgres.
 */
export async function consolidateMangoteVibradorInDb(
  updatedBy?: string,
  options?: ConsolidateMangoteOptions,
) {
  const overwriteFromJson = options?.overwriteFromJson ?? false;
  const actor = updatedBy ?? 'sync-json';
  const archived: string[] = [];

  for (const slug of RETIRED_MANGOTE_VIBRADOR_SLUGS) {
    const [row] = await db
      .select({ id: equipmentSchema.id, deletedAt: equipmentSchema.deletedAt })
      .from(equipmentSchema)
      .where(eq(equipmentSchema.slug, slug))
      .limit(1);

    if (!row?.id || row.deletedAt) {
      continue;
    }

    await archiveEquipmentBySlug(slug, actor);
    archived.push(slug);
  }

  const jsonItem = jsonCatalog.find((item) => item.slug === MANGOTE_VIBRADOR_SLUG);
  if (!jsonItem) {
    return { archived, consolidated: 'skipped' as const };
  }

  const existing = await getEquipmentRowBySlug(MANGOTE_VIBRADOR_SLUG);

  if (existing) {
    if (overwriteFromJson) {
      await db
        .update(equipmentSchema)
        .set({
          name: jsonItem.name,
          category: jsonItem.category,
          shortDescription: jsonItem.shortDescription,
          longDescription: jsonItem.longDescription,
          specs: jsonItem.specs,
          tags: jsonItem.tags,
          featured: jsonItem.featured,
          available: true,
          published: true,
          deletedAt: null,
          updatedBy: actor,
          updatedAt: new Date(),
        })
        .where(eq(equipmentSchema.id, existing.id));

      await ensurePrimaryImage(existing.id, jsonItem.slug, jsonItem.name);
      return { archived, consolidated: 'updated' as const };
    }

    await db
      .update(equipmentSchema)
      .set({
        available: true,
        published: true,
        deletedAt: null,
        updatedBy: actor,
        updatedAt: new Date(),
      })
      .where(eq(equipmentSchema.id, existing.id));

    await ensurePrimaryImage(existing.id, jsonItem.slug, jsonItem.name);
    return { archived, consolidated: 'published' as const };
  }

  const [row] = await db
    .insert(equipmentSchema)
    .values({
      slug: jsonItem.slug,
      name: jsonItem.name,
      category: jsonItem.category,
      shortDescription: jsonItem.shortDescription,
      longDescription: jsonItem.longDescription,
      specs: jsonItem.specs,
      tags: jsonItem.tags,
      featured: jsonItem.featured,
      available: true,
      published: true,
      updatedBy: actor,
    })
    .returning({ id: equipmentSchema.id });

  if (row?.id) {
    await ensurePrimaryImage(row.id, jsonItem.slug, jsonItem.name);
  }

  return { archived, consolidated: 'inserted' as const };
}

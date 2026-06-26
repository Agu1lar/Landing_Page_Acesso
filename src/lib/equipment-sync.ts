import { eq } from 'drizzle-orm';
import equipmentJson from '@/data/equipamentos.json';
import {
  archiveEquipmentBySlug,
  getEquipmentRowBySlug,
  listEquipmentImages,
} from '@/lib/equipment-db';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { db } from '@/libs/DB';
import { equipmentImagesSchema, equipmentSchema } from '@/models/Schema';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

const jsonCatalog = equipmentJson as Equipment[];

/** Slugs that must exist in Postgres with correct category and visibility. */
export const PRIORITY_CATALOG_SLUGS = ['franna-fr17'] as const;

/** Retired mangote slugs merged into {@link MANGOTE_VIBRADOR_SLUG}. */
export const RETIRED_MANGOTE_VIBRADOR_SLUGS = [
  'mangote-25mm-5m-vibr-port',
  'mangote-35mm-3m-makita',
  'mangote-35mm-3m-bosch',
  'mangote-vibrador-25mm',
  'mangote-vibrador-35mm',
  'mangote-vibrador-45mm',
  'mangote-vibrador-60mm',
] as const;

export const MANGOTE_VIBRADOR_SLUG = 'mangote-vibrador';

export type PrioritySyncResult = {
  slug: string;
  action: 'inserted' | 'updated' | 'skipped';
};

export type CategoryCopySyncResult = {
  slug: string;
  action: 'updated' | 'skipped';
};

function primaryImageUrl(slug: string) {
  return getManifestImageSrc(slug) ?? `/equipamentos/${slug}.webp`;
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
    const jsonItem = jsonCatalog.find((item) => item.slug === slug);
    if (!jsonItem) {
      results.push({ slug, action: 'skipped' });
      continue;
    }

    const existing = await getEquipmentRowBySlug(slug);
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
      results.push({ slug, action: 'updated' });
      continue;
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

    results.push({ slug, action: 'inserted' });
  }

  return results;
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
  consolidated: 'inserted' | 'updated' | 'skipped';
};

/**
 * Archives retired mangote slugs and upserts the consolidated catalog item in Postgres.
 */
export async function consolidateMangoteVibradorInDb(updatedBy?: string) {
  const actor = updatedBy ?? 'sync-json';
  const archived: string[] = [];

  for (const slug of RETIRED_MANGOTE_VIBRADOR_SLUGS) {
    const existing = await getEquipmentRowBySlug(slug);
    if (!existing) {
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

import { eq } from 'drizzle-orm';
import equipmentJson from '@/data/equipamentos.json';
import {
  getEquipmentRowBySlug,
  listEquipmentImages,
} from '@/lib/equipment-db';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { db } from '@/libs/DB';
import { equipmentImagesSchema, equipmentSchema } from '@/models/Schema';
import type { Equipment } from '@/types/equipment';

const jsonCatalog = equipmentJson as Equipment[];

/** Slugs that must exist in Postgres with correct category and visibility. */
export const PRIORITY_CATALOG_SLUGS = ['guindaste-industrial-munck-remocao-bh'] as const;

export type PrioritySyncResult = {
  slug: string;
  action: 'inserted' | 'updated' | 'skipped';
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

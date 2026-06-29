import 'server-only';

import { and, asc, desc, eq, ilike, isNotNull, isNull, or, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import equipmentJson from '@/data/equipamentos.json';
import { defaultEquipmentImageUrl } from '@/lib/admin-gallery-image';
import { formatEquipmentName } from '@/lib/equipment-name';
import { db } from '@/libs/DB';
import { equipmentImagesSchema, equipmentSchema } from '@/models/Schema';
import type { Equipment, EquipmentCategory, EquipmentSpec } from '@/types/equipment';
import { isEquipmentCategory } from '@/types/equipment';

export type EquipmentRow = InferSelectModel<typeof equipmentSchema>;
export type EquipmentImageRow = InferSelectModel<typeof equipmentImagesSchema>;

const jsonFallback = equipmentJson as Equipment[];

export type EquipmentAdminFilters = {
  q?: string;
  category?: string;
  status?: 'all' | 'active' | 'draft' | 'archived';
};

export type EquipmentFormInput = {
  slug: string;
  name: string;
  category: EquipmentCategory;
  shortDescription: string;
  longDescription: string;
  specs: EquipmentSpec[];
  tags: string[];
  featured: boolean;
  available: boolean;
  published: boolean;
};

export type EquipmentImageInput = {
  url: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
};

/**
 * Maps a database row to the public Equipment type.
 */
export function rowToEquipment(row: EquipmentRow): Equipment {
  return {
    slug: row.slug,
    name: formatEquipmentName(row.name),
    category: row.category as EquipmentCategory,
    shortDescription: row.shortDescription,
    longDescription: row.longDescription,
    specs: row.specs ?? [],
    tags: row.tags ?? [],
    featured: row.featured,
    available:
      row.available && row.published && !row.deletedAt && isEquipmentCategory(row.category),
  };
}

/**
 * Returns published equipment from Postgres, or empty when not seeded.
 */
export async function loadPublishedEquipmentFromDb() {
  const rows = await db
    .select()
    .from(equipmentSchema)
    .where(
      and(
        isNull(equipmentSchema.deletedAt),
        eq(equipmentSchema.published, true),
        eq(equipmentSchema.available, true),
      ),
    )
    .orderBy(asc(equipmentSchema.name));

  return rows.map(rowToEquipment);
}

export type EquipmentSitemapEntry = {
  slug: string;
  category: string;
  updatedAt: Date;
};

/**
 * Returns slug, category and updatedAt for published catalog rows (sitemap lastmod).
 */
export async function loadPublishedEquipmentSitemapEntries() {
  return db
    .select({
      slug: equipmentSchema.slug,
      category: equipmentSchema.category,
      updatedAt: equipmentSchema.updatedAt,
    })
    .from(equipmentSchema)
    .where(
      and(
        isNull(equipmentSchema.deletedAt),
        eq(equipmentSchema.published, true),
        eq(equipmentSchema.available, true),
      ),
    );
}

/**
 * Returns all equipment slugs managed in Postgres (including archived).
 */
export async function loadDbEquipmentSlugs() {
  const rows = await db.select({ slug: equipmentSchema.slug }).from(equipmentSchema);

  return new Set(rows.map((row) => row.slug));
}

/**
 * Returns count of equipment rows in Postgres (any status).
 */
export async function countEquipmentInDb() {
  const [row] = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(equipmentSchema);
  return row?.count ?? 0;
}

/**
 * Loads one equipment row by slug, including archived rows.
 */
export async function getEquipmentRowBySlugIncludingArchived(slug: string) {
  const [row] = await db
    .select()
    .from(equipmentSchema)
    .where(eq(equipmentSchema.slug, slug))
    .limit(1);

  return row;
}

/**
 * Lists JSON catalog items not yet stored in Postgres (visible on site via fallback).
 */
export async function listJsonOnlyEquipmentForAdmin(filters: EquipmentAdminFilters = {}) {
  if (filters.status === 'draft' || filters.status === 'archived') {
    return [] as Equipment[];
  }

  const dbSlugs = await loadDbEquipmentSlugs();
  let items = jsonFallback.filter((item) => !dbSlugs.has(item.slug));

  const categoryFilter = filters.category?.trim();
  if (categoryFilter) {
    items = items.filter((item) => item.category === categoryFilter);
  }

  const queryFilter = filters.q?.trim();
  if (queryFilter) {
    const term = queryFilter.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.slug.toLowerCase().includes(term),
    );
  }

  if (filters.status === 'active') {
    items = items.filter((item) => item.available);
  }

  return items.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
}

/**
 * Loads one equipment by slug including non-published rows (admin).
 */
export async function getEquipmentRowBySlug(slug: string) {
  const [row] = await db
    .select()
    .from(equipmentSchema)
    .where(and(eq(equipmentSchema.slug, slug), isNull(equipmentSchema.deletedAt)))
    .limit(1);

  return row;
}

/**
 * Lists equipment for admin with filters.
 */
export async function listEquipmentForAdmin(filters: EquipmentAdminFilters = {}) {
  const conditions = [];

  if (filters.status === 'archived') {
    conditions.push(isNotNull(equipmentSchema.deletedAt));
  } else {
    conditions.push(isNull(equipmentSchema.deletedAt));

    if (filters.status === 'active') {
      conditions.push(eq(equipmentSchema.published, true));
      conditions.push(eq(equipmentSchema.available, true));
    } else if (filters.status === 'draft') {
      conditions.push(eq(equipmentSchema.published, false));
    }
  }

  const categoryFilter = filters.category?.trim();
  if (categoryFilter) {
    conditions.push(eq(equipmentSchema.category, categoryFilter));
  }

  const queryFilter = filters.q?.trim();
  if (queryFilter) {
    const term = `%${queryFilter}%`;
    conditions.push(
      or(ilike(equipmentSchema.name, term), ilike(equipmentSchema.slug, term))!,
    );
  }

  const rows = await db
    .select()
    .from(equipmentSchema)
    .where(and(...conditions))
    .orderBy(desc(equipmentSchema.updatedAt));

  return rows;
}

/**
 * Loads images for one equipment id.
 */
export async function listEquipmentImages(equipmentId: number) {
  return db
    .select()
    .from(equipmentImagesSchema)
    .where(eq(equipmentImagesSchema.equipmentId, equipmentId))
    .orderBy(asc(equipmentImagesSchema.sortOrder), asc(equipmentImagesSchema.id));
}

/**
 * Primary image URL map for all equipment (admin + public resolver).
 */
export async function loadPrimaryImageMap() {
  const rows = await db
    .select({
      slug: equipmentSchema.slug,
      url: equipmentImagesSchema.url,
    })
    .from(equipmentImagesSchema)
    .innerJoin(equipmentSchema, eq(equipmentImagesSchema.equipmentId, equipmentSchema.id))
    .where(eq(equipmentImagesSchema.isPrimary, true));

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.slug] = row.url;
  }
  return map;
}

/**
 * Inserts equipment from JSON file when database is empty.
 */
export async function seedEquipmentFromJson(updatedBy?: string) {
  const existing = await countEquipmentInDb();
  if (existing > 0) {
    return { inserted: 0, skipped: true };
  }

  for (const item of jsonFallback) {
    const [row] = await db
      .insert(equipmentSchema)
      .values({
        slug: item.slug,
        name: formatEquipmentName(item.name),
        category: item.category,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        specs: item.specs,
        tags: item.tags,
        featured: item.featured,
        available: item.available,
        published: true,
        updatedBy: updatedBy ?? 'import-json',
      })
      .returning({ id: equipmentSchema.id });

    const manifestUrl = defaultEquipmentImageUrl(item.slug);
    if (row?.id && manifestUrl) {
      await db.insert(equipmentImagesSchema).values({
        equipmentId: row.id,
        url: manifestUrl,
        alt: item.name,
        sortOrder: 0,
        isPrimary: true,
      });
    }
  }

  return { inserted: jsonFallback.length, skipped: false };
}

/**
 * Creates or updates equipment and replaces gallery images.
 */
export async function saveEquipmentWithImages(options: {
  input: EquipmentFormInput;
  images: EquipmentImageInput[];
  userId: string;
  existingId?: number;
}) {
  const values = {
    slug: options.input.slug,
    name: formatEquipmentName(options.input.name),
    category: options.input.category,
    shortDescription: options.input.shortDescription,
    longDescription: options.input.longDescription,
    specs: options.input.specs,
    tags: options.input.tags,
    featured: options.input.featured,
    available: options.input.available,
    published: options.input.published,
    updatedBy: options.userId,
  };

  let equipmentId = options.existingId;

  if (equipmentId) {
    await db.update(equipmentSchema).set(values).where(eq(equipmentSchema.id, equipmentId));
    await db.delete(equipmentImagesSchema).where(eq(equipmentImagesSchema.equipmentId, equipmentId));
  } else {
    const [row] = await db.insert(equipmentSchema).values(values).returning({ id: equipmentSchema.id });
    equipmentId = row?.id;
  }

  if (!equipmentId) {
    throw new Error('Failed to save equipment');
  }

  if (options.images.length > 0) {
    await db.insert(equipmentImagesSchema).values(
      options.images.map((image) => ({
        equipmentId,
        url: image.url,
        alt: image.alt ?? null,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),
    );
  }

  return equipmentId;
}

/**
 * Soft-deletes equipment (archive).
 */
export async function archiveEquipmentBySlug(slug: string, userId: string) {
  await db
    .update(equipmentSchema)
    .set({
      available: false,
      published: false,
      deletedAt: new Date(),
      updatedBy: userId,
    })
    .where(eq(equipmentSchema.slug, slug));
}

/**
 * Duplicates equipment as draft with a new slug suffix.
 */
export async function duplicateEquipmentAsDraft(sourceSlug: string, userId: string) {
  const source = await getEquipmentRowBySlug(sourceSlug);
  if (!source) {
    return null;
  }

  const newSlug = `${source.slug}-copia-${Date.now().toString(36).slice(-4)}`;
  const images = await listEquipmentImages(source.id);

  const newId = await saveEquipmentWithImages({
    input: {
      slug: newSlug,
      name: formatEquipmentName(`${source.name} (cópia)`),
      category: source.category as EquipmentCategory,
      shortDescription: source.shortDescription,
      longDescription: source.longDescription,
      specs: source.specs ?? [],
      tags: source.tags ?? [],
      featured: false,
      available: source.available,
      published: false,
    },
    images: images.map((image, index) => ({
      url: image.url,
      alt: image.alt ?? undefined,
      sortOrder: index,
      isPrimary: image.isPrimary,
    })),
    userId,
  });

  return { id: newId, slug: newSlug };
}

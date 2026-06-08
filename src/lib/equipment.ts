import { cache } from 'react';
import equipmentData from '@/data/equipamentos.json';
import { countEquipmentInDb, loadPublishedEquipmentFromDb } from '@/lib/equipment-db';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

export { getEquipmentQuoteCartKind } from '@/lib/equipment-quote-cart';

const jsonFallback = equipmentData as Equipment[];

/**
 * Merges DB catalog with JSON entries missing from Postgres (e.g. guindaste before admin seed).
 */
export function mergeCatalogWithJsonFallback(fromDb: Equipment[]) {
  const bySlug = new Map(fromDb.map((item) => [item.slug, item]));

  for (const jsonItem of jsonFallback) {
    if (!jsonItem.available) {
      continue;
    }
    if (!bySlug.has(jsonItem.slug)) {
      bySlug.set(jsonItem.slug, jsonItem);
    }
  }

  return Array.from(bySlug.values());
}

/**
 * Lists equipment for a category, always including JSON catalog entries for that category.
 */
export function mergeCategoryEquipment(fromCatalog: Equipment[], category: EquipmentCategory) {
  const jsonForCategory = jsonFallback.filter(
    (item) => item.category === category && item.available,
  );
  const bySlug = new Map(fromCatalog.map((item) => [item.slug, item]));

  for (const jsonItem of jsonForCategory) {
    bySlug.set(jsonItem.slug, jsonItem);
  }

  return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

const loadCatalog = cache(async () => {
  try {
    const dbCount = await countEquipmentInDb();
    if (dbCount === 0) {
      return jsonFallback;
    }
    const fromDb = await loadPublishedEquipmentFromDb();
    return mergeCatalogWithJsonFallback(fromDb);
  } catch {
    return jsonFallback;
  }
});

export async function getAllEquipment() {
  const items = await loadCatalog();
  return items.filter((item) => item.available);
}

export async function getEquipmentBySlug(slug: string) {
  const items = await loadCatalog();
  return items.find((item) => item.slug === slug);
}

export async function getFeaturedEquipment(limit = 6) {
  const items = await loadCatalog();
  return items.filter((item) => item.featured && item.available).slice(0, limit);
}

/** Counts available items in one category (home highlights). */
export async function countEquipmentInCategory(category: EquipmentCategory) {
  const items = await loadCatalog();
  return items.filter((item) => item.category === category && item.available).length;
}

export async function getEquipmentByCategory(category: EquipmentCategory) {
  const items = await loadCatalog();
  const fromCatalog = items.filter((item) => item.category === category && item.available);
  return mergeCategoryEquipment(fromCatalog, category);
}

export async function getAllSlugs() {
  const items = await loadCatalog();
  return items.filter((item) => item.available).map((item) => item.slug);
}

/** Related items in the same category (excludes current slug). */
export async function getRelatedEquipment(slug: string, limit = 4) {
  const items = await loadCatalog();
  const current = items.find((item) => item.slug === slug);
  if (!current) {
    return [];
  }
  return items
    .filter((item) => item.available && item.slug !== slug && item.category === current.category)
    .slice(0, limit);
}

/** Compact index for client-side global search. */
export async function getSearchIndex() {
  const items = await getAllEquipment();
  return items.map(({ slug, name, category, tags }) => ({
    slug,
    name,
    category,
    tags,
  }));
}

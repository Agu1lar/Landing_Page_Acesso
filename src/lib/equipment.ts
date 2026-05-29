import { cache } from 'react';
import equipmentData from '@/data/equipamentos.json';
import { countEquipmentInDb, loadPublishedEquipmentFromDb } from '@/lib/equipment-db';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

export { getEquipmentQuoteCartKind } from '@/lib/equipment-quote-cart';

const jsonFallback = equipmentData as Equipment[];

const loadCatalog = cache(async () => {
  try {
    const dbCount = await countEquipmentInDb();
    if (dbCount === 0) {
      return jsonFallback;
    }
    return loadPublishedEquipmentFromDb();
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
  return items.filter((item) => item.category === category && item.available);
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

import { cache } from 'react';
import equipmentData from '@/data/equipamentos.json';
import {
  countEquipmentInDb,
  loadDbEquipmentSlugs,
  loadPublishedEquipmentFromDb,
  loadPublishedEquipmentSitemapEntries,
} from '@/lib/equipment-db';
import type { Equipment, EquipmentCategory } from '@/types/equipment';

export { getEquipmentQuoteCartKind } from '@/lib/equipment-quote-cart';

const jsonFallback = equipmentData as Equipment[];

/** Public site only lists items open for quote — not live stock. */
export function isPublicCatalogItem(item: Equipment) {
  return item.available;
}

function filterPublicCatalog(items: Equipment[]) {
  return items.filter(isPublicCatalogItem);
}

/**
 * Merges DB catalog with JSON entries not yet managed in Postgres.
 */
export function mergeCatalogWithJsonFallback(fromDb: Equipment[], dbSlugs: Set<string>) {
  const bySlug = new Map(fromDb.map((item) => [item.slug, item]));

  for (const jsonItem of jsonFallback) {
    if (!isPublicCatalogItem(jsonItem) || dbSlugs.has(jsonItem.slug)) {
      continue;
    }
    if (!bySlug.has(jsonItem.slug)) {
      bySlug.set(jsonItem.slug, jsonItem);
    }
  }

  return filterPublicCatalog(Array.from(bySlug.values()));
}

const loadCatalog = cache(async () => {
  try {
    const dbCount = await countEquipmentInDb();
    if (dbCount === 0) {
      return filterPublicCatalog(jsonFallback);
    }

    const [fromDb, dbSlugs] = await Promise.all([
      loadPublishedEquipmentFromDb(),
      loadDbEquipmentSlugs(),
    ]);

    return mergeCatalogWithJsonFallback(fromDb, dbSlugs);
  } catch {
    return filterPublicCatalog(jsonFallback);
  }
});

export async function getAllEquipment() {
  return loadCatalog();
}

export async function getEquipmentBySlug(slug: string) {
  const items = await loadCatalog();
  return items.find((item) => item.slug === slug);
}

export async function getFeaturedEquipment(limit = 6) {
  const items = await loadCatalog();
  return items.filter((item) => item.featured).slice(0, limit);
}

/** Counts public catalog items in one category (home highlights). */
export async function countEquipmentInCategory(category: EquipmentCategory) {
  const items = await loadCatalog();
  return items.filter((item) => item.category === category).length;
}

export async function getEquipmentByCategory(category: EquipmentCategory) {
  const items = await loadCatalog();
  return items
    .filter((item) => item.category === category)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function getAllSlugs() {
  const items = await loadCatalog();
  return items.map((item) => item.slug);
}

/** Stable lastmod for JSON-only catalog items (no Postgres row). */
const JSON_ONLY_SITEMAP_LAST_MODIFIED = new Date('2026-05-21');

/**
 * Maps equipment slug to last content update for sitemap lastModified.
 */
export async function getEquipmentSitemapLastModifiedBySlug() {
  const map = new Map<string, Date>();

  try {
    const dbCount = await countEquipmentInDb();

    if (dbCount === 0) {
      for (const item of jsonFallback.filter(isPublicCatalogItem)) {
        map.set(item.slug, JSON_ONLY_SITEMAP_LAST_MODIFIED);
      }
      return map;
    }

    const [entries, dbSlugs] = await Promise.all([
      loadPublishedEquipmentSitemapEntries(),
      loadDbEquipmentSlugs(),
    ]);

    for (const entry of entries) {
      map.set(entry.slug, entry.updatedAt);
    }

    for (const item of jsonFallback) {
      if (isPublicCatalogItem(item) && !dbSlugs.has(item.slug) && !map.has(item.slug)) {
        map.set(item.slug, JSON_ONLY_SITEMAP_LAST_MODIFIED);
      }
    }
  } catch {
    for (const item of jsonFallback.filter(isPublicCatalogItem)) {
      map.set(item.slug, JSON_ONLY_SITEMAP_LAST_MODIFIED);
    }
  }

  return map;
}

/** Related items in the same category (excludes current slug). */
export async function getRelatedEquipment(slug: string, limit = 4) {
  const items = await loadCatalog();
  const current = items.find((item) => item.slug === slug);
  if (!current) {
    return [];
  }
  return items
    .filter((item) => item.slug !== slug && item.category === current.category)
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

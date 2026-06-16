import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import equipmentData from '@/data/equipamentos.json';
import { FEATURED_EQUIPMENT_SLUGS } from '@/data/featured-equipment';
import {
  countEquipmentInDb,
  loadDbEquipmentSlugs,
  loadPublishedEquipmentFromDb,
  loadPublishedEquipmentSitemapEntries,
} from '@/lib/equipment-db';
import { EQUIPMENT_CATALOG_TAG } from '@/lib/equipment-cache-tags';
import type { Equipment, EquipmentCategory } from '@/types/equipment';
import { isEquipmentCategory } from '@/types/equipment';

export { getEquipmentQuoteCartKind } from '@/lib/equipment-quote-cart';
export { EQUIPMENT_CATALOG_TAG } from '@/lib/equipment-cache-tags';

const jsonFallback = equipmentData as Equipment[];

/** Public site only lists items open for quote — not live stock. */
export function isPublicCatalogItem(item: Equipment) {
  return item.available && isEquipmentCategory(item.category);
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

async function fetchCatalog() {
  try {
    const [fromDb, dbSlugs] = await Promise.all([
      loadPublishedEquipmentFromDb(),
      loadDbEquipmentSlugs(),
    ]);

    if (fromDb.length === 0 && dbSlugs.size === 0) {
      return filterPublicCatalog(jsonFallback);
    }

    return mergeCatalogWithJsonFallback(fromDb, dbSlugs);
  } catch {
    return filterPublicCatalog(jsonFallback);
  }
}

const getCachedCatalog = unstable_cache(fetchCatalog, ['equipment-catalog'], {
  revalidate: 300,
  tags: [EQUIPMENT_CATALOG_TAG],
});

const loadCatalog = cache(async () => getCachedCatalog());

export async function getAllEquipment() {
  return loadCatalog();
}

export async function getEquipmentBySlug(slug: string) {
  const items = await loadCatalog();
  return items.find((item) => item.slug === slug);
}

export async function getFeaturedEquipment(limit = FEATURED_EQUIPMENT_SLUGS.length) {
  const items = await loadCatalog();
  const bySlug = new Map(items.map((item) => [item.slug, item]));

  const ordered = FEATURED_EQUIPMENT_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (item): item is Equipment => Boolean(item),
  );

  if (ordered.length > 0) {
    return ordered.slice(0, limit);
  }

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

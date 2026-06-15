import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import manifest from '@/data/equipment-image-manifest.json';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { resolveEquipmentImageSrc } from '@/lib/equipment-image-resolve';
import { EQUIPMENT_IMAGE_MAP_TAG } from '@/lib/equipment-cache-tags';
import { loadPrimaryImageMap } from '@/lib/equipment-db';

export { EQUIPMENT_IMAGE_MAP_TAG } from '@/lib/equipment-cache-tags';

const manifestMap = manifest as Record<string, string>;

async function buildResolvedImageMap() {
  let dbMap: Record<string, string> = {};

  try {
    dbMap = await loadPrimaryImageMap();
  } catch {
    // Use manifest-only when DB is unavailable.
  }

  const slugs = new Set([...Object.keys(manifestMap), ...Object.keys(dbMap)]);
  const result: Record<string, string> = {};

  for (const slug of slugs) {
    const resolved = resolveEquipmentImageSrc(manifestMap[slug], dbMap[slug]);
    if (resolved) {
      result[slug] = resolved;
    }
  }

  return result;
}

const getCachedImageMap = unstable_cache(buildResolvedImageMap, ['equipment-image-map'], {
  revalidate: 300,
  tags: [EQUIPMENT_IMAGE_MAP_TAG],
});

/** Slug → image URL map, cached across requests (5 min). */
export const getResolvedEquipmentImageMap = cache(getCachedImageMap);

/**
 * Returns equipment photo URL (manifest + optional DB primary, with Blob override).
 */
export async function getEquipmentImageSrc(slug: string) {
  const map = await getResolvedEquipmentImageMap();
  return map[slug] ?? getManifestImageSrc(slug);
}

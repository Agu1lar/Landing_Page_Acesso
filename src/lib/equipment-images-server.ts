import 'server-only';

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import manifest from '@/data/equipment-image-manifest.json';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { resolveEquipmentImageSrc } from '@/lib/equipment-image-resolve';
import { EQUIPMENT_IMAGE_MAP_TAG } from '@/lib/equipment-cache-tags';
import {
  getEquipmentRowBySlug,
  listEquipmentImages,
  loadPrimaryImageMap,
} from '@/lib/equipment-db';
import {
  sortEquipmentGalleryRows,
  type EquipmentGalleryImage,
} from '@/lib/equipment-gallery';

export { EQUIPMENT_IMAGE_MAP_TAG } from '@/lib/equipment-cache-tags';
export type { EquipmentGalleryImage } from '@/lib/equipment-gallery';

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
    const resolved = resolveEquipmentImageSrc(manifestMap[slug], dbMap[slug], slug);
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

async function buildEquipmentGalleryImages(slug: string, equipmentName: string) {
  const manifestSrc = getManifestImageSrc(slug);

  try {
    const row = await getEquipmentRowBySlug(slug);
    if (row) {
      const rows = sortEquipmentGalleryRows(await listEquipmentImages(row.id));
      const gallery = rows
        .map((image) => {
          const src = resolveEquipmentImageSrc(manifestSrc, image.url, slug);
          if (!src) {
            return null;
          }

          return {
            src,
            alt: image.alt?.trim() || equipmentName,
          } satisfies EquipmentGalleryImage;
        })
        .filter((image): image is EquipmentGalleryImage => image !== null);

      if (gallery.length > 0) {
        return gallery;
      }
    }
  } catch {
    // Fall back to primary/manifest below.
  }

  const primary = await getEquipmentImageSrc(slug);
  if (primary) {
    return [{ src: primary, alt: equipmentName }];
  }

  return [];
}

/** Resolved gallery images for one equipment slug (primary first). */
export async function getEquipmentGalleryImages(slug: string, equipmentName: string) {
  return buildEquipmentGalleryImages(slug, equipmentName);
}

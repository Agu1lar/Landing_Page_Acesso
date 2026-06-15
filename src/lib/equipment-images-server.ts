import 'server-only';

import { cache } from 'react';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { resolveEquipmentImageSrc } from '@/lib/equipment-image-resolve';
import { loadPrimaryImageMap } from '@/lib/equipment-db';

const loadPrimaryImageMapCached = cache(loadPrimaryImageMap);

/**
 * Returns equipment photo URL (manifest + optional DB primary, with Blob override).
 */
export async function getEquipmentImageSrc(slug: string) {
  const manifestSrc = getManifestImageSrc(slug);

  try {
    const dbMap = await loadPrimaryImageMapCached();
    return resolveEquipmentImageSrc(manifestSrc, dbMap[slug]);
  } catch {
    return manifestSrc;
  }
}

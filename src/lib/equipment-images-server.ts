import 'server-only';

import { cache } from 'react';
import manifest from '@/data/equipment-image-manifest.json';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { loadPrimaryImageMap } from '@/lib/equipment-db';

const manifestMap = manifest as Record<string, string>;

const loadImageMap = cache(async () => {
  try {
    const dbMap = await loadPrimaryImageMap();
    return { ...manifestMap, ...dbMap };
  } catch {
    return manifestMap;
  }
});

/**
 * Returns equipment photo URL (DB primary overrides manifest).
 */
export async function getEquipmentImageSrc(slug: string) {
  const map = await loadImageMap();
  return map[slug] ?? getManifestImageSrc(slug);
}

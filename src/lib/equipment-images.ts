import manifest from '@/data/equipment-image-manifest.json';

const slugToSrc = manifest as Record<string, string>;

/**
 * Returns public URL for equipment photo from build-time manifest, or undefined.
 */
export function getEquipmentImageSrc(slug: string) {
  return slugToSrc[slug];
}


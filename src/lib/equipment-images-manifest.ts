import manifest from '@/data/equipment-image-manifest.json';

const manifestMap = manifest as Record<string, string>;

/**
 * Returns manifest-only image URL (sync, safe for client components).
 */
export function getManifestImageSrc(slug: string) {
  return manifestMap[slug];
}

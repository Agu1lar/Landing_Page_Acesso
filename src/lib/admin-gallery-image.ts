import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { resolveEquipmentImageSrc } from '@/lib/equipment-image-resolve';

/**
 * Resolves equipment gallery image URL for admin preview and persistence.
 */
export function resolveAdminGalleryImageSrc(props: { url: string; slug: string }) {
  const trimmed = props.url.trim();
  if (!trimmed) {
    return '';
  }

  const manifestSrc = getManifestImageSrc(props.slug);
  return resolveEquipmentImageSrc(manifestSrc, trimmed) ?? trimmed;
}

/**
 * Returns the best default image URL when the admin gallery is empty on save.
 */
export function defaultEquipmentImageUrl(slug: string) {
  return getManifestImageSrc(slug) ?? `/equipamentos/${slug}.webp`;
}

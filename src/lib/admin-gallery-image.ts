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
  return resolveEquipmentImageSrc(manifestSrc, trimmed, props.slug) ?? trimmed;
}

/**
 * Returns manifest image URL when available; otherwise undefined (no fake placeholder).
 */
export function defaultEquipmentImageUrl(slug: string) {
  return getManifestImageSrc(slug);
}

/**
 * Returns true when the URL points to an admin upload (Blob or local uploads folder).
 */
export function isAdminUploadedImageUrl(url: string | undefined) {
  if (!url?.trim()) {
    return false;
  }

  if (url.includes('blob.vercel-storage.com')) {
    return true;
  }

  return /\/uploads\//u.test(url);
}

/**
 * Returns true when the DB row still has the generic slug-based placeholder path.
 */
export function isGenericEquipmentPlaceholderUrl(url: string, slug: string) {
  const normalized = url.trim().toLowerCase();
  const base = `/equipamentos/${slug.trim().toLowerCase()}`;

  return (
    normalized === `${base}.webp` ||
    normalized === `${base}.png` ||
    normalized === `${base}.jpg` ||
    normalized === `${base}.jpeg`
  );
}

/**
 * Picks the best image URL for an equipment slug.
 * Admin uploads (Blob or /uploads/) win; manifest replaces stale placeholders.
 */
export function resolveEquipmentImageSrc(
  manifestSrc: string | undefined,
  dbSrc: string | undefined,
  slug?: string,
) {
  if (isAdminUploadedImageUrl(dbSrc)) {
    return dbSrc;
  }

  if (manifestSrc) {
    if (!dbSrc) {
      return manifestSrc;
    }

    if (slug && isGenericEquipmentPlaceholderUrl(dbSrc, slug)) {
      return manifestSrc;
    }

    if (dbSrc.startsWith('/equipamentos/') && !dbSrc.includes('/uploads/')) {
      return manifestSrc;
    }
  }

  return dbSrc ?? manifestSrc;
}

/**
 * Uses the Next.js image optimizer only for static files under /equipamentos/.
 */
export function shouldUnoptimizeEquipmentImage(url: string) {
  return isAdminUploadedImageUrl(url) || url.startsWith('http');
}

/**
 * Picks the best image URL for an equipment slug.
 * Manifest paths are preferred over stale DB rows; Vercel Blob uploads win when present.
 */
export function resolveEquipmentImageSrc(
  manifestSrc: string | undefined,
  dbSrc: string | undefined,
): string | undefined {
  if (dbSrc?.includes('blob.vercel-storage.com')) {
    return dbSrc;
  }

  if (manifestSrc) {
    return manifestSrc;
  }

  return dbSrc;
}

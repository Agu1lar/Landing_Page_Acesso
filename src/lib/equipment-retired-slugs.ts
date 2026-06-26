/** Retired mangote slugs merged into mangote-vibrador — never show on the public site. */
export const RETIRED_MANGOTE_VIBRADOR_SLUGS = [
  'mangote-25mm-5m-vibr-port',
  'mangote-35mm-3m-makita',
  'mangote-35mm-3m-bosch',
  'mangote-vibrador-25mm',
  'mangote-vibrador-35mm',
  'mangote-vibrador-45mm',
  'mangote-vibrador-60mm',
] as const;

export const MANGOTE_VIBRADOR_SLUG = 'mangote-vibrador';

const retiredSlugSet = new Set<string>(RETIRED_MANGOTE_VIBRADOR_SLUGS);

/**
 * Returns true when the slug was retired from the public catalog.
 */
export function isRetiredEquipmentSlug(slug: string) {
  return retiredSlugSet.has(slug);
}

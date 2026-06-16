import type { Equipment, EquipmentCategory } from '@/types/equipment';
import { EQUIPMENT_CATEGORY_ORDER } from '@/types/equipment';

const MAX_IMAGES_PER_CATEGORY = 16;

/**
 * Builds deduplicated image URL lists per category from the public catalog.
 */
export function buildHomeCategoryImagePools(
  equipment: Equipment[],
  imageBySlug: Record<string, string>,
): Record<EquipmentCategory, string[]> {
  const pools = Object.fromEntries(
    EQUIPMENT_CATEGORY_ORDER.map((category) => [category, [] as string[]]),
  ) as Record<EquipmentCategory, string[]>;

  for (const item of equipment) {
    const src = imageBySlug[item.slug];
    if (!src) {
      continue;
    }

    const bucket = pools[item.category];
    if (!bucket.includes(src)) {
      bucket.push(src);
    }
  }

  for (const category of EQUIPMENT_CATEGORY_ORDER) {
    pools[category] = pools[category].slice(0, MAX_IMAGES_PER_CATEGORY);
  }

  return pools;
}

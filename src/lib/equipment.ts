import equipmentData from '@/data/equipamentos.json';
import type { Equipment, EquipmentCategory } from '@/types/equipment';
import type { QuoteCartItemKind } from '@/types/quote-cart';

const items = equipmentData as Equipment[];

/** Maps catalog category to quote-cart item kind. */
export function getEquipmentQuoteCartKind(
  equipment: Pick<Equipment, 'category'>,
): QuoteCartItemKind {
  return equipment.category === 'acessorios' ? 'accessory' : 'equipment';
}

export function getAllEquipment(): Equipment[] {
  return items.filter((e) => e.available);
}

export function getEquipmentBySlug(slug: string): Equipment | undefined {
  return items.find((e) => e.slug === slug);
}

export function getFeaturedEquipment(limit = 6): Equipment[] {
  return items.filter((e) => e.featured && e.available).slice(0, limit);
}

export function getEquipmentByCategory(category: EquipmentCategory): Equipment[] {
  return items.filter((e) => e.category === category && e.available);
}

export function getAllSlugs(): string[] {
  return items.filter((e) => e.available).map((e) => e.slug);
}

/** Outros itens da mesma categoria (exclui o atual) */
export function getRelatedEquipment(slug: string, limit = 4): Equipment[] {
  const current = getEquipmentBySlug(slug);
  if (!current) {
    return [];
  }
  return items
    .filter((e) => e.available && e.slug !== slug && e.category === current.category)
    .slice(0, limit);
}

/** Compact index for client-side global search */
export function getSearchIndex(): Pick<Equipment, 'slug' | 'name' | 'category' | 'tags'>[] {
  return getAllEquipment().map(({ slug, name, category, tags }) => ({
    slug,
    name,
    category,
    tags,
  }));
}

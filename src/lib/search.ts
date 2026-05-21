import { CATEGORY_LABELS } from '@/types/equipment';
import type { EquipmentCategory } from '@/types/equipment';

export type SearchableItem = {
  slug: string;
  name: string;
  category: EquipmentCategory;
  tags: string[];
};

export function normalizeSearchText(value: string): string {
  return value.normalize('NFD').replaceAll(/\p{M}/gu, '').toLowerCase().trim();
}

export function buildSearchHaystack(item: SearchableItem): string {
  return normalizeSearchText(
    [
      item.name,
      item.slug.replaceAll('-', ' '),
      item.category.replaceAll('-', ' '),
      CATEGORY_LABELS[item.category],
      ...item.tags,
    ].join(' '),
  );
}

/** Aceita texto incompleto, ignora acentos e combina várias palavras. */
export function matchesSearchQuery(haystack: string, rawQuery: string): boolean {
  const query = normalizeSearchText(rawQuery);
  if (!query) {
    return false;
  }
  if (haystack.includes(query)) {
    return true;
  }
  const tokens = query.split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}

export function searchRelevance(item: SearchableItem, rawQuery: string): number {
  const query = normalizeSearchText(rawQuery);
  if (!query) {
    return -1;
  }

  const haystack = buildSearchHaystack(item);
  if (!matchesSearchQuery(haystack, rawQuery)) {
    return -1;
  }

  const name = normalizeSearchText(item.name);
  if (name.startsWith(query)) {
    return 100;
  }
  if (name.includes(query)) {
    return 80;
  }
  if (haystack.startsWith(query)) {
    return 60;
  }
  return 40;
}

export function filterSearchItems<T extends SearchableItem>(
  items: T[],
  rawQuery: string,
  limit = 8,
): T[] {
  const query = rawQuery.trim();
  if (!query) {
    return [];
  }

  return items
    .map((item) => ({ item, score: searchRelevance(item, query) }))
    .filter(({ score }) => score >= 0)
    .toSorted((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'pt-BR'))
    .slice(0, limit)
    .map(({ item }) => item);
}

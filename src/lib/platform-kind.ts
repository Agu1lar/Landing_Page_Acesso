import type { Equipment } from '@/types/equipment';
import { readPlatformKindFromSpecs } from '@/lib/platform-kind-admin';

export type PlatformKind = 'tesoura' | 'articulada' | 'telescopica' | 'mastro';

export type PlatformKindFilter = 'all' | PlatformKind;

/**
 * Classifies aerial platform equipment for category filters.
 */
export function getPlatformKind(item: Equipment): PlatformKind | null {
  if (item.category !== 'plataformas-elevatorias') {
    return null;
  }

  if (item.tags.includes('telescopica') || item.tags.includes('aerea')) {
    return 'telescopica';
  }
  if (item.tags.includes('articulada')) {
    return 'articulada';
  }
  if (item.tags.includes('tesoura')) {
    return 'tesoura';
  }
  if (item.tags.includes('mastro')) {
    return 'mastro';
  }

  if (item.slug.includes('lanca-articulada')) {
    return 'articulada';
  }

  const inferred = readPlatformKindFromSpecs({
    specs: item.specs,
    tags: item.tags,
    name: item.name,
    slug: item.slug,
  });
  if (inferred) {
    return inferred;
  }

  return null;
}

export function matchesPlatformKindFilter(
  item: Equipment,
  filter: PlatformKindFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }
  return getPlatformKind(item) === filter;
}

import type { Equipment } from '@/types/equipment';

export type PlatformKind = 'aerea' | 'articulada';

export type PlatformKindFilter = 'all' | PlatformKind;

function tipoSpecValue(item: Equipment): string {
  return item.specs.find((spec) => spec.label === 'Tipo')?.value.toLowerCase() ?? '';
}

/**
 * Classifies aerial platform equipment for category filters.
 * Telescopic booms are "aérea"; knuckle booms are "articulada".
 */
export function getPlatformKind(item: Equipment): PlatformKind | null {
  if (item.tags.includes('aerea')) {
    return 'aerea';
  }
  if (item.tags.includes('articulada')) {
    return 'articulada';
  }

  if (item.slug.includes('lanca-articulada')) {
    return 'articulada';
  }

  const tipo = tipoSpecValue(item);
  if (tipo.includes('lança articulada') || tipo.includes('lanca articulada')) {
    return 'articulada';
  }
  if (tipo.includes('telescóp') || tipo.includes('telescop')) {
    return 'aerea';
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

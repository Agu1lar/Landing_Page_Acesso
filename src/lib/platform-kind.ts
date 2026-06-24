import type { Equipment } from '@/types/equipment';

export type PlatformKind = 'tesoura' | 'articulada' | 'telescopica';

export type PlatformKindFilter = 'all' | PlatformKind;

function tipoSpecValue(item: Equipment): string {
  return item.specs.find((spec) => spec.label === 'Tipo')?.value.toLowerCase() ?? '';
}

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

  if (item.slug.includes('lanca-articulada')) {
    return 'articulada';
  }

  const tipo = tipoSpecValue(item);

  if (tipo.includes('tesoura')) {
    return 'tesoura';
  }
  if (tipo.includes('articulada')) {
    return 'articulada';
  }
  if (tipo.includes('telescóp') || tipo.includes('telescop')) {
    return 'telescopica';
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

import type { Equipment } from '@/types/equipment';

export type PlatformHeightFilter =
  | 'all'
  | 'up-to-10'
  | 'from-10-to-16'
  | 'from-16-to-26'
  | 'above-26';

const DECIMAL_NUMBER_REGEX = /\d+(?:[,.]\d+)?/;

function parseMeters(value: string): number | null {
  const match = value.match(DECIMAL_NUMBER_REGEX);

  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[0].replace(',', '.'));
  return Number.isNaN(parsed) ? null : parsed;
}

export function getPlatformHeightMeters(item: Equipment): number | null {
  const workHeight = item.specs.find((spec) =>
    spec.label.toLocaleLowerCase('pt-BR').startsWith('altura de trabalho'),
  );

  if (workHeight) {
    return parseMeters(workHeight.value);
  }

  const platformHeight = item.specs.find((spec) =>
    spec.label.toLocaleLowerCase('pt-BR').startsWith('altura da plataforma'),
  );

  return platformHeight ? parseMeters(platformHeight.value) : null;
}

export function matchesPlatformHeightFilter(
  item: Equipment,
  filter: PlatformHeightFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }

  const height = getPlatformHeightMeters(item);

  if (height === null) {
    return false;
  }

  if (filter === 'up-to-10') {
    return height <= 10;
  }

  if (filter === 'from-10-to-16') {
    return height > 10 && height <= 16;
  }

  if (filter === 'from-16-to-26') {
    return height > 16 && height <= 26;
  }

  return height > 26;
}

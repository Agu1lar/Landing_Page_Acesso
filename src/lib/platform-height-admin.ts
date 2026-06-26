import type { PlatformHeightFilter } from '@/lib/platform-height';
import type { EquipmentSpec } from '@/types/equipment';

export const PLATFORM_WORK_HEIGHT_SPEC_LABEL = 'Altura de trabalho';

const DECIMAL_NUMBER_REGEX = /\d+(?:[,.]\d+)?/;

/**
 * Parses a work-height input (meters) from admin text or spec value.
 */
export function parseWorkHeightMeters(input: string) {
  const match = input.trim().match(DECIMAL_NUMBER_REGEX);
  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[0].replace(',', '.'));
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

/**
 * Reads work height in meters from equipment specs.
 */
export function readWorkHeightMetersFromSpecs(specs: EquipmentSpec[]) {
  const workHeight = specs.find((spec) =>
    spec.label.trim().toLocaleLowerCase('pt-BR').startsWith('altura de trabalho'),
  );
  if (workHeight) {
    return parseWorkHeightMeters(workHeight.value);
  }

  const platformHeight = specs.find((spec) =>
    spec.label.trim().toLocaleLowerCase('pt-BR').startsWith('altura da plataforma'),
  );
  return platformHeight ? parseWorkHeightMeters(platformHeight.value) : null;
}

/**
 * Returns the public height filter bucket for a work height in meters.
 */
export function getPlatformHeightFilterKey(meters: number): PlatformHeightFilter {
  if (meters <= 10) {
    return 'up-to-10';
  }
  if (meters <= 16) {
    return 'from-10-to-16';
  }
  if (meters <= 26) {
    return 'from-16-to-26';
  }
  return 'above-26';
}

function formatWorkHeightSpec(meters: number) {
  const formatted = Number.isInteger(meters)
    ? String(meters)
    : meters.toFixed(1).replace('.', ',');
  return `~${formatted} m`;
}

/**
 * Upserts Altura de trabalho spec so height filters work on the public site.
 */
export function applyWorkHeightToSpecs(props: { specs: EquipmentSpec[]; workHeightMeters: number }) {
  const specsWithoutHeight = props.specs.filter((spec) => {
    const label = spec.label.trim().toLocaleLowerCase('pt-BR');
    return !label.startsWith('altura de trabalho');
  });

  return [
    { label: PLATFORM_WORK_HEIGHT_SPEC_LABEL, value: formatWorkHeightSpec(props.workHeightMeters) },
    ...specsWithoutHeight,
  ] satisfies EquipmentSpec[];
}

/**
 * Locale key suffix under Categoria namespace for height filter preview.
 */
export function platformHeightFilterLocaleKey(filter: PlatformHeightFilter) {
  if (filter === 'up-to-10') {
    return 'filter_height_up_to_10';
  }
  if (filter === 'from-10-to-16') {
    return 'filter_height_10_to_16';
  }
  if (filter === 'from-16-to-26') {
    return 'filter_height_16_to_26';
  }
  return 'filter_height_above_26';
}

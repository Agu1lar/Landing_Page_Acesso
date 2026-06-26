import type { PlatformKind } from '@/lib/platform-kind';
import type { EquipmentSpec } from '@/types/equipment';

export const PLATFORM_TIPO_SPEC_LABEL = 'Tipo';

export const PLATFORM_KIND_OPTIONS: {
  value: PlatformKind;
  tipoValue: string;
  tag: string;
}[] = [
  {
    value: 'tesoura',
    tipoValue: 'Tesoura',
    tag: 'tesoura',
  },
  {
    value: 'articulada',
    tipoValue: 'Lança articulada',
    tag: 'articulada',
  },
  {
    value: 'telescopica',
    tipoValue: 'Lança telescópica',
    tag: 'telescopica',
  },
];

const platformKindSet = new Set<PlatformKind>(PLATFORM_KIND_OPTIONS.map((option) => option.value));

/**
 * Returns true when the value is a valid platform kind filter key.
 */
export function isPlatformKind(value: string): value is PlatformKind {
  return platformKindSet.has(value as PlatformKind);
}

/**
 * Reads platform kind from specs/tags for admin form defaults.
 */
export function readPlatformKindFromSpecs(props: {
  specs: EquipmentSpec[];
  tags: string[];
  name?: string;
  slug?: string;
}) {
  const tipo =
    props.specs
      .find((spec) => spec.label.trim().toLowerCase() === PLATFORM_TIPO_SPEC_LABEL.toLowerCase())
      ?.value.toLowerCase() ?? '';

  if (tipo.includes('tesoura')) {
    return 'tesoura' as const;
  }
  if (tipo.includes('articulada')) {
    return 'articulada' as const;
  }
  if (tipo.includes('telescóp') || tipo.includes('telescop')) {
    return 'telescopica' as const;
  }

  if (props.tags.includes('tesoura')) {
    return 'tesoura' as const;
  }
  if (props.tags.includes('articulada')) {
    return 'articulada' as const;
  }
  if (props.tags.includes('telescopica') || props.tags.includes('aerea')) {
    return 'telescopica' as const;
  }

  const haystack = `${props.name ?? ''} ${props.slug ?? ''}`.toLowerCase();
  if (haystack.includes('articulada') || /\bz[\d/-]/u.test(haystack)) {
    return 'articulada' as const;
  }
  if (/\bgs[\s-]?\d/u.test(haystack) || haystack.includes('tesoura')) {
    return 'tesoura' as const;
  }
  if (haystack.includes('telescop') || haystack.includes('sjp')) {
    return 'telescopica' as const;
  }

  return '' as const;
}

/**
 * Applies platform kind to specs and tags so category filters work on the public site.
 */
export function applyPlatformKindToCatalogItem(props: {
  specs: EquipmentSpec[];
  tags: string[];
  kind: PlatformKind;
}) {
  const option = PLATFORM_KIND_OPTIONS.find((entry) => entry.value === props.kind);
  if (!option) {
    return { specs: props.specs, tags: props.tags };
  }

  const specsWithoutTipo = props.specs.filter(
    (spec) => spec.label.trim().toLowerCase() !== PLATFORM_TIPO_SPEC_LABEL.toLowerCase(),
  );

  const specs: EquipmentSpec[] = [
    { label: PLATFORM_TIPO_SPEC_LABEL, value: option.tipoValue },
    ...specsWithoutTipo,
  ];

  const filterTags = new Set(PLATFORM_KIND_OPTIONS.map((entry) => entry.tag));
  const tags = props.tags.filter((tag) => !filterTags.has(tag));
  tags.push(option.tag);

  if (!tags.includes('plataforma')) {
    tags.unshift('plataforma');
  }

  return { specs, tags };
}

/**
 * Returns the public category filter label for a platform kind.
 */
export function platformKindFilterLabel(kind: PlatformKind) {
  const match = PLATFORM_KIND_OPTIONS.find((option) => option.value === kind);
  return match?.tipoValue ?? kind;
}

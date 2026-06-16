import { describe, expect, it } from 'vitest';
import { getPlatformKind, matchesPlatformKindFilter } from '@/lib/platform-kind';
import type { Equipment } from '@/types/equipment';

function item(partial: Partial<Equipment> & Pick<Equipment, 'slug'>): Equipment {
  return {
    name: partial.slug,
    category: 'plataformas-elevatorias',
    shortDescription: '',
    longDescription: '',
    specs: [],
    tags: [],
    featured: false,
    available: true,
    ...partial,
  };
}

describe('platform-kind', () => {
  it('detects articulated platforms from tipo spec', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-s60',
      specs: [{ label: 'Tipo', value: 'Lança articulada' }],
    });
    expect(getPlatformKind(platform)).toBe('articulada');
  });

  it('detects aerial platforms from tipo spec', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-s80',
      specs: [{ label: 'Tipo', value: 'Lança telescópica' }],
    });
    expect(getPlatformKind(platform)).toBe('aerea');
  });

  it('filters only matching platform kind', () => {
    const articulated = item({
      slug: 'plataforma-elevatoria-z45',
      specs: [{ label: 'Tipo', value: 'Lança articulada' }],
    });
    const aerial = item({
      slug: 'plataforma-elevatoria-1350sjp',
      specs: [{ label: 'Tipo', value: 'Lança telescópica' }],
    });
    const scissor = item({
      slug: 'plataforma-elevatoria-gs4655',
      specs: [{ label: 'Tipo', value: 'Tesoura' }],
    });

    expect(matchesPlatformKindFilter(articulated, 'articulada')).toBe(true);
    expect(matchesPlatformKindFilter(aerial, 'aerea')).toBe(true);
    expect(matchesPlatformKindFilter(scissor, 'aerea')).toBe(false);
    expect(matchesPlatformKindFilter(scissor, 'all')).toBe(true);
  });
});

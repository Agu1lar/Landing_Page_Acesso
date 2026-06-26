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
  it('detects tesoura platforms from tipo spec', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-gs4655',
      specs: [{ label: 'Tipo', value: 'Tesoura' }],
    });
    expect(getPlatformKind(platform)).toBe('tesoura');
  });

  it('detects articulated platforms from tipo spec', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-z45',
      specs: [{ label: 'Tipo', value: 'Lança articulada' }],
    });
    expect(getPlatformKind(platform)).toBe('articulada');
  });

  it('detects telescopic platforms from tipo spec', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-s80',
      specs: [{ label: 'Tipo', value: 'Lança telescópica' }],
    });
    expect(getPlatformKind(platform)).toBe('telescopica');
  });

  it('detects mast platforms from tipo spec', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-awp-30s',
      specs: [{ label: 'Tipo', value: 'Mastro vertical (AWP)' }],
    });
    expect(getPlatformKind(platform)).toBe('mastro');
  });

  it('maps legacy aerea tag to telescopica', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-1350sjp',
      tags: ['aerea'],
      specs: [{ label: 'Tipo', value: 'Lança telescópica' }],
    });
    expect(getPlatformKind(platform)).toBe('telescopica');
  });

  it('filters only matching platform kind', () => {
    const scissor = item({
      slug: 'plataforma-elevatoria-gs4655',
      specs: [{ label: 'Tipo', value: 'Tesoura' }],
    });
    const articulated = item({
      slug: 'plataforma-elevatoria-z45',
      specs: [{ label: 'Tipo', value: 'Lança articulada' }],
    });
    const telescopic = item({
      slug: 'plataforma-elevatoria-1350sjp',
      specs: [{ label: 'Tipo', value: 'Lança telescópica' }],
    });
    const mast = item({
      slug: 'plataforma-elevatoria-awp-30s',
      specs: [{ label: 'Tipo', value: 'Mastro vertical (AWP)' }],
    });

    expect(matchesPlatformKindFilter(scissor, 'tesoura')).toBe(true);
    expect(matchesPlatformKindFilter(articulated, 'articulada')).toBe(true);
    expect(matchesPlatformKindFilter(telescopic, 'telescopica')).toBe(true);
    expect(matchesPlatformKindFilter(mast, 'mastro')).toBe(true);
    expect(matchesPlatformKindFilter(scissor, 'articulada')).toBe(false);
    expect(matchesPlatformKindFilter(telescopic, 'tesoura')).toBe(false);
    expect(matchesPlatformKindFilter(mast, 'tesoura')).toBe(false);
    expect(matchesPlatformKindFilter(mast, 'all')).toBe(true);
  });
});

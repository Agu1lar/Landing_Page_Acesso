import { describe, expect, it } from 'vitest';
import {
  applyPlatformKindToCatalogItem,
  readPlatformKindFromSpecs,
} from '@/lib/platform-kind-admin';
import { getPlatformKind } from '@/lib/platform-kind';
import type { Equipment } from '@/types/equipment';

describe('read platform kind from specs', () => {
  it('infers tesoura from Genie GS model name', () => {
    expect(
      readPlatformKindFromSpecs({
        specs: [],
        tags: [],
        name: 'PLATAFORMA AEREA GS 3246',
        slug: 'plataforma-aerea-gs-3246',
      }),
    ).toBe('tesoura');
  });

  it('infers articulada from Z34 model name', () => {
    expect(
      readPlatformKindFromSpecs({
        specs: [],
        tags: [],
        name: 'PLATAFORMA AÉREA ARTICULADA Z34',
        slug: 'plataforma-aerea-articulada-z34',
      }),
    ).toBe('articulada');
  });

  it('infers mastro from AWP model name', () => {
    expect(
      readPlatformKindFromSpecs({
        specs: [],
        tags: [],
        name: 'Plataforma elevatória AWP 30S',
        slug: 'plataforma-elevatoria-awp-30s',
      }),
    ).toBe('mastro');
  });
});

describe('apply platform kind to catalog item', () => {
  it('writes tipo spec and filter tag', () => {
    const result = applyPlatformKindToCatalogItem({
      specs: [{ label: 'Altura de trabalho', value: '~12 m' }],
      tags: ['plataforma'],
      kind: 'articulada',
    });

    expect(result.specs[0]).toEqual({ label: 'Tipo', value: 'Lança articulada' });
    expect(result.tags).toContain('articulada');
  });
});

describe('get platform kind for new fleet models', () => {
  function item(partial: Partial<Equipment> & Pick<Equipment, 'slug' | 'name'>): Equipment {
    return {
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

  it('classifies GS 3246 as tesoura filter', () => {
    const platform = item({
      slug: 'plataforma-aerea-gs-3246',
      name: 'PLATAFORMA AEREA GS 3246',
    });
    expect(getPlatformKind(platform)).toBe('tesoura');
  });

  it('classifies Z34 as articulada filter', () => {
    const platform = item({
      slug: 'plataforma-aerea-articulada-z34',
      name: 'PLATAFORMA AÉREA ARTICULADA Z34',
    });
    expect(getPlatformKind(platform)).toBe('articulada');
  });

  it('classifies AWP 30S as mastro filter', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-awp-30s',
      name: 'Plataforma elevatória AWP 30S',
      specs: [{ label: 'Tipo', value: 'Mastro vertical (AWP)' }],
    });
    expect(getPlatformKind(platform)).toBe('mastro');
  });
});

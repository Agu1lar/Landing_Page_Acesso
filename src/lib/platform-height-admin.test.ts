import { describe, expect, it } from 'vitest';
import {
  applyWorkHeightToSpecs,
  getPlatformHeightFilterKey,
  parseWorkHeightMeters,
  readWorkHeightMetersFromSpecs,
} from '@/lib/platform-height-admin';
import { matchesPlatformHeightFilter } from '@/lib/platform-height';
import { getPlatformKind as classifyPlatformKind } from '@/lib/platform-kind';
import type { Equipment } from '@/types/equipment';

describe('parse work height meters', () => {
  it('parses decimal comma input', () => {
    expect(parseWorkHeightMeters('11,8')).toBe(11.8);
  });
});

describe('apply work height to specs', () => {
  it('writes altura de trabalho spec', () => {
    const specs = applyWorkHeightToSpecs({
      specs: [{ label: 'Tipo', value: 'Tesoura' }],
      workHeightMeters: 11.8,
    });

    expect(specs[0]).toEqual({ label: 'Altura de trabalho', value: '~11,8 m' });
  });
});

describe('fleet models height filters', () => {
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

  it('places GS 3246 in 10 to 16 m filter', () => {
    const specs = applyWorkHeightToSpecs({ specs: [], workHeightMeters: 11.8 });
    const platform = item({
      slug: 'plataforma-aerea-gs-3246',
      name: 'PLATAFORMA ELEVATÓRIA GS 3246',
      specs,
      tags: ['tesoura'],
    });

    expect(getPlatformHeightFilterKey(11.8)).toBe('from-10-to-16');
    expect(matchesPlatformHeightFilter(platform, 'from-10-to-16')).toBe(true);
    expect(classifyPlatformKind(platform)).toBe('tesoura');
  });

  it('places Z34 in 10 to 16 m filter', () => {
    const specs = applyWorkHeightToSpecs({ specs: [], workHeightMeters: 12 });
    const platform = item({
      slug: 'plataforma-aerea-articulada-z34',
      name: 'PLATAFORMA ELEVATÓRIA ARTICULADA Z34',
      specs,
      tags: ['articulada'],
    });

    expect(readWorkHeightMetersFromSpecs(specs)).toBe(12);
    expect(matchesPlatformHeightFilter(platform, 'from-10-to-16')).toBe(true);
    expect(classifyPlatformKind(platform)).toBe('articulada');
  });
});

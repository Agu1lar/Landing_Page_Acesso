import { describe, expect, it } from 'vitest';
import {
  getPlatformHeightMeters,
  matchesPlatformHeightFilter,
} from '@/lib/platform-height';
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

describe('platform-height', () => {
  it('reads work height with decimal comma', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-gs4655',
      specs: [{ label: 'Altura de trabalho', value: '15,95 m' }],
    });

    expect(getPlatformHeightMeters(platform)).toBe(15.95);
  });

  it('falls back to platform height', () => {
    const platform = item({
      slug: 'plataforma-elevatoria-1350sjp',
      specs: [{ label: 'Altura da plataforma', value: '41,30 m' }],
    });

    expect(getPlatformHeightMeters(platform)).toBe(41.3);
  });

  it('filters platforms by height range', () => {
    const low = item({
      slug: 'plataforma-elevatoria-sj-iii-3219',
      specs: [{ label: 'Altura de trabalho', value: '~7,6 m (25 ft)' }],
    });
    const medium = item({
      slug: 'plataforma-elevatoria-z45',
      specs: [{ label: 'Altura de trabalho', value: '~15,9 m' }],
    });
    const high = item({
      slug: 'plataforma-elevatoria-s80',
      specs: [{ label: 'Altura de trabalho', value: '27,91 m' }],
    });

    expect(matchesPlatformHeightFilter(low, 'up-to-10')).toBe(true);
    expect(matchesPlatformHeightFilter(medium, 'from-10-to-16')).toBe(true);
    expect(matchesPlatformHeightFilter(high, 'above-26')).toBe(true);
    expect(matchesPlatformHeightFilter(low, 'from-16-to-26')).toBe(false);
  });
});

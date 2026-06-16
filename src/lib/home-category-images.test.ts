import { describe, expect, it } from 'vitest';
import { buildHomeCategoryImagePools } from '@/lib/home-category-images';
import type { Equipment } from '@/types/equipment';

const item = (partial: Partial<Equipment> & Pick<Equipment, 'slug' | 'category'>): Equipment => ({
  name: partial.slug,
  shortDescription: '',
  longDescription: '',
  specs: [],
  tags: [],
  featured: false,
  available: true,
  ...partial,
});

describe('buildHomeCategoryImagePools', () => {
  it('groups catalog images by category without duplicates', () => {
    const equipment = [
      item({ slug: 'a', category: 'ferramentas-eletricas' }),
      item({ slug: 'b', category: 'ferramentas-eletricas' }),
      item({ slug: 'c', category: 'andaimes' }),
    ];
    const imageBySlug = {
      a: '/equipamentos/a.webp',
      b: '/equipamentos/b.webp',
      c: '/equipamentos/c.webp',
    };

    const pools = buildHomeCategoryImagePools(equipment, imageBySlug);

    expect(pools['ferramentas-eletricas']).toEqual([
      '/equipamentos/a.webp',
      '/equipamentos/b.webp',
    ]);
    expect(pools.andaimes).toEqual(['/equipamentos/c.webp']);
    expect(pools['plataformas-elevatorias']).toEqual([]);
  });

  it('skips equipment without a resolved image', () => {
    const pools = buildHomeCategoryImagePools(
      [item({ slug: 'sem-foto', category: 'andaimes' })],
      {},
    );

    expect(pools.andaimes).toEqual([]);
  });
});

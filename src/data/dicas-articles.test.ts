import { describe, expect, it } from 'vitest';
import { DICAS_ARTICLES, getAllDicaSlugs, getDicaBySlug } from '@/data/dicas-articles';

describe('dicas articles', () => {
  it('lists four published articles', () => {
    expect(DICAS_ARTICLES).toHaveLength(4);
  });

  it('uses unique slugs', () => {
    const slugs = getAllDicaSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('resolves article by slug', () => {
    expect(getDicaBySlug('como-escolher-plataforma-elevatoria-bh')?.title).toContain(
      'plataforma elevatória',
    );
    expect(getDicaBySlug('missing')).toBeUndefined();
  });
});

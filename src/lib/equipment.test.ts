import { describe, expect, it } from 'vitest';
import { isPublicCatalogItem, mergeCatalogWithJsonFallback } from '@/lib/equipment';
import type { Equipment } from '@/types/equipment';

const guindasteJson: Equipment = {
  slug: 'guindaste-industrial-munck-remocao-bh',
  name: 'Guindaste Munck',
  category: 'guindaste-industrial',
  shortDescription: 'Locação de guindaste Munck em BH.',
  longDescription: 'Solução para içamento.',
  specs: [],
  tags: ['guindaste', 'munck'],
  featured: true,
  available: true,
};

describe('public catalog item', () => {
  it('excludes unavailable equipment', () => {
    expect(isPublicCatalogItem({ ...guindasteJson, available: false })).toBe(false);
  });

  it('excludes equipment in removed categories', () => {
    expect(
      isPublicCatalogItem({
        ...guindasteJson,
        category: 'ferramentas-bateria' as Equipment['category'],
      }),
    ).toBe(false);
  });
});

describe('merge catalog with JSON fallback', () => {
  it('adds JSON item when slug is not managed in Postgres', () => {
    const items = mergeCatalogWithJsonFallback([], new Set());

    expect(items.some((item) => item.slug === 'guindaste-industrial-munck-remocao-bh')).toBe(true);
  });

  it('skips JSON item when slug exists in Postgres (even if hidden from catalog)', () => {
    const items = mergeCatalogWithJsonFallback([], new Set(['guindaste-industrial-munck-remocao-bh']));

    expect(items.some((item) => item.slug === 'guindaste-industrial-munck-remocao-bh')).toBe(false);
  });

  it('never merges unavailable JSON items', () => {
    const hidden: Equipment = { ...guindasteJson, available: false };
    const items = mergeCatalogWithJsonFallback([hidden], new Set());

    expect(items.some((item) => item.slug === guindasteJson.slug)).toBe(false);
  });
});

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
    expect(isPublicCatalogItem({ ...guindasteJson, available: false })).toBeFalsy();
  });

  it('excludes equipment in removed categories', () => {
    expect(
      isPublicCatalogItem({
        ...guindasteJson,
        category: 'ferramentas-bateria' as Equipment['category'],
      }),
    ).toBeFalsy();
  });

  it('excludes retired mangote slugs from public catalog', () => {
    expect(
      isPublicCatalogItem({
        ...guindasteJson,
        slug: 'mangote-vibrador-35mm',
        name: 'Mangote Vibrador 35mm',
      }),
    ).toBeFalsy();
  });
});

describe('merge catalog with JSON fallback', () => {
  it('adds JSON item when slug is not managed in Postgres', () => {
    const items = mergeCatalogWithJsonFallback([], new Set());

    expect(items.some((item) => item.slug === 'franna-fr17')).toBeTruthy();
  });

  it('skips JSON item when slug exists in Postgres (even if hidden from catalog)', () => {
    const items = mergeCatalogWithJsonFallback([], new Set(['franna-fr17']));

    expect(items.some((item) => item.slug === 'franna-fr17')).toBeFalsy();
  });

  it('never merges unavailable JSON items', () => {
    const hidden: Equipment = { ...guindasteJson, available: false };
    const items = mergeCatalogWithJsonFallback([hidden], new Set());

    expect(items.some((item) => item.slug === guindasteJson.slug)).toBeFalsy();
  });

  it('never merges retired mangote slugs from postgres', () => {
    const retired: Equipment = {
      ...guindasteJson,
      slug: 'mangote-vibrador-45mm',
      name: 'Mangote Vibrador 45mm',
    };
    const items = mergeCatalogWithJsonFallback([retired], new Set());

    expect(items.some((item) => item.slug === 'mangote-vibrador-45mm')).toBeFalsy();
  });
});

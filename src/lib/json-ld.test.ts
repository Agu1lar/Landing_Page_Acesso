import { describe, expect, it } from 'vitest';
import { FAQ_ITEMS } from '@/data/faq';
import { brand } from '@/lib/brand';
import { getCategorySeo } from '@/lib/categories-seo';
import {
  buildCategoryPageJsonLd,
  buildEquipmentCatalogJsonLd,
  buildEquipmentPageJsonLd,
  buildFaqPageJsonLd,
  buildLocalBusinessJsonLd,
  buildMarketingGraphJsonLd,
  buildProductJsonLd,
  buildTrainingCourseJsonLd,
} from '@/lib/json-ld';
import type { Equipment } from '@/types/equipment';

const equipment: Equipment = {
  slug: 'betoneira',
  name: 'Betoneira',
  category: 'concretagem',
  shortDescription: 'Locação de betoneira em Belo Horizonte — sob consulta.',
  longDescription: 'Descrição longa.',
  specs: [],
  tags: [],
  featured: true,
  available: true,
};

describe('buildMarketingGraphJsonLd', () => {
  it('includes Organization, LocalBusiness and WebSite with SearchAction', () => {
    const json = buildMarketingGraphJsonLd();
    const graph = json['@graph'] as Record<string, unknown>[];

    expect(graph).toHaveLength(3);
    expect(graph.some((node) => node['@type'] === 'Organization')).toBeTruthy();
    expect(graph.some((node) => node['@type'] === 'LocalBusiness')).toBeTruthy();

    const webSite = graph.find((node) => node['@type'] === 'WebSite') as {
      potentialAction?: { '@type'?: string };
    };
    expect(webSite?.potentialAction?.['@type']).toBe('SearchAction');
  });
});

describe('buildLocalBusinessJsonLd', () => {
  it('includes NAP fields aligned with brand', () => {
    const json = buildLocalBusinessJsonLd();

    expect(json['@type']).toBe('LocalBusiness');
    expect(json.name).toBe(brand.name);
    expect(json.telephone).toBe(`+55${brand.phone}`);
    expect(json.email).toBe(brand.email);
  });
});

describe('buildProductJsonLd', () => {
  it('maps equipment to Product schema with sku and offer', () => {
    const json = buildProductJsonLd(equipment);

    expect(json['@type']).toBe('Product');
    expect(json.name).toBe('Betoneira');
    expect(json.sku).toBe('betoneira');
    expect(json.offers).toMatchObject({
      '@type': 'Offer',
      priceCurrency: 'BRL',
    });
  });
});

describe('buildEquipmentPageJsonLd', () => {
  it('combines Product and BreadcrumbList in a graph', () => {
    const json = buildEquipmentPageJsonLd(equipment);
    const graph = json['@graph'] as Record<string, unknown>[];

    expect(graph.some((node) => node['@type'] === 'Product')).toBeTruthy();
    expect(graph.some((node) => node['@type'] === 'BreadcrumbList')).toBeTruthy();
  });
});

describe('buildCategoryPageJsonLd', () => {
  it('exposes CollectionPage, BreadcrumbList and ItemList', () => {
    const seo = getCategorySeo('concretagem');
    const json = buildCategoryPageJsonLd({
      slug: 'concretagem',
      seo,
      equipment: [equipment],
    });
    const graph = json['@graph'] as Record<string, unknown>[];

    expect(graph.some((node) => node['@type'] === 'CollectionPage')).toBeTruthy();
    expect(graph.some((node) => node['@type'] === 'BreadcrumbList')).toBeTruthy();

    const itemList = graph.find((node) => node['@type'] === 'ItemList') as {
      numberOfItems?: number;
    };
    expect(itemList?.numberOfItems).toBe(1);
  });
});

describe('buildEquipmentCatalogJsonLd', () => {
  it('lists catalog items in ItemList', () => {
    const json = buildEquipmentCatalogJsonLd([equipment]);
    const graph = json['@graph'] as Record<string, unknown>[];
    const itemList = graph.find((node) => node['@type'] === 'ItemList') as {
      itemListElement?: unknown[];
    };

    expect(itemList?.itemListElement).toHaveLength(1);
  });
});

describe('buildFaqPageJsonLd', () => {
  it('maps FAQ items to Question entities', () => {
    const json = buildFaqPageJsonLd(FAQ_ITEMS.slice(0, 2));
    const graph = json['@graph'] as Record<string, unknown>[];
    const faq = graph.find((node) => node['@type'] === 'FAQPage') as {
      mainEntity?: unknown[];
    };

    expect(faq?.mainEntity).toHaveLength(2);
  });
});

describe('buildTrainingCourseJsonLd', () => {
  it('includes Course schema with provider', () => {
    const json = buildTrainingCourseJsonLd();
    const graph = json['@graph'] as Record<string, unknown>[];

    expect(graph.some((node) => node['@type'] === 'Course')).toBeTruthy();
  });
});

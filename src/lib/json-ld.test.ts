import { describe, expect, it } from 'vitest';
import { DICAS_ARTICLES } from '@/data/dicas-articles';
import { FAQ_ITEMS } from '@/data/faq';
import { brand } from '@/lib/brand';
import { getCategorySeo } from '@/lib/categories-seo';
import {
  buildCategoryPageJsonLd,
  buildEquipmentCatalogJsonLd,
  buildEquipmentPageJsonLd,
  buildDicaArticleJsonLd,
  buildDicasIndexJsonLd,
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

describe('build marketing graph json-ld', () => {
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

describe('build local business json-ld', () => {
  it('includes NAP fields aligned with brand', () => {
    // Deprecated export kept for backward compatibility in tests
    const json = buildLocalBusinessJsonLd();

    expect(json['@type']).toBe('LocalBusiness');
    expect(json.name).toBe(brand.name);
    expect(json.telephone).toBe(`+55${brand.phone}`);
    expect(json.email).toBe(brand.email);
  });
});

describe('build product json-ld', () => {
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

describe('build equipment page json-ld', () => {
  it('combines Product and BreadcrumbList in a graph', () => {
    const json = buildEquipmentPageJsonLd(equipment);
    const graph = json['@graph'] as Record<string, unknown>[];

    expect(graph.some((node) => node['@type'] === 'Product')).toBeTruthy();
    expect(graph.some((node) => node['@type'] === 'BreadcrumbList')).toBeTruthy();
  });
});

describe('build category page json-ld', () => {
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
      itemListElement?: { url?: string; position?: number }[];
    };
    expect(itemList?.numberOfItems).toBe(1);
    expect(itemList?.itemListElement?.[0]?.url).toContain('/equipamentos/betoneira');
    expect(itemList?.itemListElement?.[0]?.position).toBe(1);
  });

  it('links CollectionPage to breadcrumb and item list entities', () => {
    const seo = getCategorySeo('concretagem');
    const json = buildCategoryPageJsonLd({
      slug: 'concretagem',
      seo,
      equipment: [equipment],
    });
    const graph = json['@graph'] as Record<string, unknown>[];

    const collectionPage = graph.find((node) => node['@type'] === 'CollectionPage') as {
      breadcrumb?: { '@id'?: string };
      mainEntity?: { '@id'?: string };
      name?: string;
    };
    const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList') as {
      '@id'?: string;
      itemListElement?: { name?: string }[];
    };

    expect(collectionPage?.name).toBe(seo.h1);
    expect(collectionPage?.breadcrumb?.['@id']).toContain('#breadcrumb');
    expect(collectionPage?.mainEntity?.['@id']).toContain('#itemlist');
    expect(breadcrumb?.['@id']).toContain('#breadcrumb');
    expect(breadcrumb?.itemListElement?.map((item) => item.name)).toEqual([
      'Início',
      'Equipamentos',
      'Concretagem',
    ]);
  });
});

describe('build equipment catalog json-ld', () => {
  it('lists catalog items in ItemList', () => {
    const json = buildEquipmentCatalogJsonLd([equipment]);
    const graph = json['@graph'] as Record<string, unknown>[];
    const itemList = graph.find((node) => node['@type'] === 'ItemList') as {
      itemListElement?: unknown[];
    };

    expect(itemList?.itemListElement).toHaveLength(1);
  });
});

describe('build faq page json-ld', () => {
  it('maps FAQ items to Question entities', () => {
    const json = buildFaqPageJsonLd(FAQ_ITEMS.slice(0, 2));
    const graph = json['@graph'] as Record<string, unknown>[];
    const faq = graph.find((node) => node['@type'] === 'FAQPage') as {
      mainEntity?: unknown[];
    };

    expect(faq?.mainEntity).toHaveLength(2);
  });
});

describe('build training course json-ld', () => {
  it('includes Course schema with provider', () => {
    const json = buildTrainingCourseJsonLd();
    const graph = json['@graph'] as Record<string, unknown>[];

    expect(graph.some((node) => node['@type'] === 'Course')).toBeTruthy();
  });
});

describe('build dicas json-ld', () => {
  it('includes BlogPosting for article pages', () => {
    const json = buildDicaArticleJsonLd(DICAS_ARTICLES[0]!);
    const graph = json['@graph'] as Record<string, unknown>[];

    expect(graph.some((node) => node['@type'] === 'BlogPosting')).toBeTruthy();
  });

  it('includes CollectionPage and ItemList for index', () => {
    const json = buildDicasIndexJsonLd(DICAS_ARTICLES);
    const graph = json['@graph'] as Record<string, unknown>[];

    expect(graph.some((node) => node['@type'] === 'CollectionPage')).toBeTruthy();
    expect(graph.some((node) => node['@type'] === 'ItemList')).toBeTruthy();
  });
});

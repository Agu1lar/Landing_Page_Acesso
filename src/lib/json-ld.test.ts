import { describe, expect, it } from 'vitest';
import { brand } from '@/lib/brand';
import { buildLocalBusinessJsonLd, buildProductJsonLd } from '@/lib/json-ld';
import type { Equipment } from '@/types/equipment';

const equipment: Equipment = {
  slug: 'betoneira',
  name: 'Betoneira',
  category: 'concretagem',
  shortDescription: 'Locação de betoneira — sob consulta.',
  longDescription: 'Descrição longa.',
  specs: [],
  tags: [],
  featured: true,
  available: true,
};

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
  it('maps equipment to Product schema', () => {
    const json = buildProductJsonLd(equipment);

    expect(json['@type']).toBe('Product');
    expect(json.name).toBe('Betoneira');
    expect(json.offers).toMatchObject({
      '@type': 'Offer',
      priceCurrency: 'BRL',
    });
  });
});

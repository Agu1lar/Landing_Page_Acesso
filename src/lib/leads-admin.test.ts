import { describe, expect, it } from 'vitest';
import { buildLeadsCsv, formatLeadCartItems, parseLeadCartItems } from '@/lib/leads-admin';

describe('parse lead cart items', () => {
  it('parses valid cart json', () => {
    const items = parseLeadCartItems(
      JSON.stringify([{ slug: 'betoneira', name: 'Betoneira', kind: 'equipment', quantity: 2 }]),
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(2);
  });

  it('returns empty array for invalid json', () => {
    expect(parseLeadCartItems('not-json')).toStrictEqual([]);
  });
});

describe('format lead cart items', () => {
  it('formats multiple lines with quantity', () => {
    const text = formatLeadCartItems(
      JSON.stringify([
        { slug: 'a', name: 'Item A', kind: 'equipment', quantity: 1 },
        { slug: 'b', name: 'Item B', kind: 'accessory', quantity: 3 },
      ]),
    );
    expect(text).toContain('Item A');
    expect(text).toContain('×3');
  });
});

describe('build leads csv', () => {
  it('prefixes utf-8 bom for excel', () => {
    const csv = buildLeadsCsv([
      {
        id: 1,
        name: 'Maria',
        email: 'm@ex.com',
        phone: '31999999999',
        company: null,
        equipmentSlug: null,
        equipmentName: null,
        rentalPeriod: 'diaria',
        city: 'BH',
        message: null,
        itemsJson: null,
        origin: 'site-orcamento',
        leadKind: 'quote',
        googleSub: null,
        status: 'new',
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: null,
        utmContent: null,
        utmTerm: null,
        gclid: null,
        gbraid: null,
        wbraid: null,
        referrer: null,
        landingPage: '/orcamento',
        internalNotes: 'Ligou pela manhã',
        createdAt: new Date('2026-05-20T12:00:00.000Z'),
      },
    ]);
    expect(csv.startsWith('\uFEFF')).toBeTruthy();
    expect(csv).toContain('Maria');
    expect(csv).toContain('m@ex.com');
    expect(csv).toContain('Ligou pela manhã');
  });
});

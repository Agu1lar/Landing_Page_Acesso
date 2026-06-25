import { describe, expect, it, vi } from 'vitest';
import { getEquipmentSitemapLastModifiedBySlug } from '@/lib/equipment';

vi.mock('@/lib/equipment-db', () => ({
  countEquipmentInDb: vi.fn(),
  loadPublishedEquipmentSitemapEntries: vi.fn(),
  loadDbEquipmentSlugs: vi.fn(),
}));

import {
  countEquipmentInDb,
  loadDbEquipmentSlugs,
  loadPublishedEquipmentSitemapEntries,
} from '@/lib/equipment-db';

describe('get equipment sitemap last modified by slug', () => {
  it('uses Postgres updatedAt for published equipment rows', async () => {
    vi.mocked(countEquipmentInDb).mockResolvedValue(2);
    vi.mocked(loadPublishedEquipmentSitemapEntries).mockResolvedValue([
      {
        slug: 'betoneira',
        category: 'ferramentas-eletricas',
        updatedAt: new Date('2026-04-10T12:00:00.000Z'),
      },
      {
        slug: 'guindaste-industrial-munck-remocao-bh',
        category: 'guindaste-industrial',
        updatedAt: new Date('2026-06-08T09:30:00.000Z'),
      },
    ]);
    vi.mocked(loadDbEquipmentSlugs).mockResolvedValue(
      new Set(['betoneira', 'guindaste-industrial-munck-remocao-bh']),
    );

    const map = await getEquipmentSitemapLastModifiedBySlug();

    expect(map.get('betoneira')?.toISOString()).toBe('2026-04-10T12:00:00.000Z');
    expect(map.get('guindaste-industrial-munck-remocao-bh')?.toISOString()).toBe(
      '2026-06-08T09:30:00.000Z',
    );
  });

  it('uses stable lastmod for JSON-only items not in Postgres', async () => {
    vi.mocked(countEquipmentInDb).mockResolvedValue(1);
    vi.mocked(loadPublishedEquipmentSitemapEntries).mockResolvedValue([
      {
        slug: 'betoneira',
        category: 'ferramentas-eletricas',
        updatedAt: new Date('2026-04-10T12:00:00.000Z'),
      },
    ]);
    vi.mocked(loadDbEquipmentSlugs).mockResolvedValue(new Set(['betoneira']));

    const map = await getEquipmentSitemapLastModifiedBySlug();

    expect(map.get('betoneira')?.toISOString()).toBe('2026-04-10T12:00:00.000Z');
    expect(map.get('compactador-eletrico')?.toISOString()).toBe('2026-05-21T00:00:00.000Z');
  });
});

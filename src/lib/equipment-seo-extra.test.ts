import { describe, expect, it } from 'vitest';
import { FEATURED_EQUIPMENT_SLUGS } from '@/data/featured-equipment';
import catalog from '@/data/equipamentos.json';
import { buildEquipmentMetaDescription } from '@/lib/equipment-meta-description';
import { getEquipmentSeoExtra } from '@/lib/equipment-seo-extra';
import type { Equipment } from '@/types/equipment';

const bySlug = new Map((catalog as Equipment[]).map((item) => [item.slug, item]));

describe('featured equipment page seo', () => {
  it('has tailored meta descriptions under 160 characters', () => {
    for (const slug of FEATURED_EQUIPMENT_SLUGS) {
      const equipment = bySlug.get(slug);
      expect(equipment, slug).toBeDefined();

      const meta = buildEquipmentMetaDescription(equipment!);

      expect(meta.length).toBeLessThanOrEqual(160);
      expect(meta).toMatch(/BH|Belo Horizonte|orçamento|WhatsApp/i);
      expect(meta).not.toBe(equipment!.shortDescription);
    }
  });

  it('has slug-specific on-page seo blocks for homepage highlights', () => {
    for (const slug of FEATURED_EQUIPMENT_SLUGS) {
      const equipment = bySlug.get(slug);
      const extra = getEquipmentSeoExtra(equipment!);

      expect(extra?.paragraphs.length, slug).toBeGreaterThan(0);
      if (extra?.commercialOnly) {
        expect(extra.paragraphs.join(' '), slug).toMatch(/orçamento|consulta|proposta/i);
      } else {
        expect(extra?.title, slug).toContain('Belo Horizonte');
      }
    }
  });

  it('drops spec-heavy seo paragraph when technical description is already on page', () => {
    const equipment = bySlug.get('franna-fr17');
    expect(equipment).toBeDefined();

    const extra = getEquipmentSeoExtra(equipment!);

    expect(extra?.commercialOnly).toBe(true);
    expect(extra?.paragraphs.join(' ')).not.toMatch(/pick and carry da Terex/i);
    expect(extra?.paragraphs.join(' ')).toMatch(/orçamento|proposta/i);
  });
});

const aerialEquipment: Equipment = {
  slug: 'plataforma-elevatoria-hb-1430',
  name: 'Plataforma elevatória HB 1430',
  category: 'plataformas-elevatorias',
  shortDescription: 'Locação de plataforma.',
  longDescription: 'Descrição técnica.',
  specs: [{ label: 'Altura de trabalho', value: '~6,1 m' }],
  tags: [],
  featured: true,
  available: true,
};

describe('equipment seo extra', () => {
  it('returns long-tail block for aerial platforms', () => {
    const extra = getEquipmentSeoExtra(aerialEquipment);

    expect(extra?.title).toContain('Belo Horizonte');
    expect(extra?.paragraphs.join(' ')).toContain('NR-18');
  });

  it('returns category block for ferramentas elétricas without technical body', () => {
    const extra = getEquipmentSeoExtra({
      slug: 'betoneira',
      category: 'ferramentas-eletricas',
      name: 'Betoneira',
      shortDescription: 'Locação de betoneira.',
      longDescription: '',
      specs: [],
      tags: [],
      featured: false,
      available: true,
    });

    expect(extra?.title).toContain('ferramentas elétricas');
  });
});

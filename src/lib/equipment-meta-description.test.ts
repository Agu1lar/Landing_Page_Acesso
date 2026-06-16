import { describe, expect, it } from 'vitest';
import { formatBrandServiceArea } from '@/lib/brand';
import {
  buildEquipmentMetaDescription,
  getEquipmentPageBodyDescription,
} from '@/lib/equipment-meta-description';
import { resolveEquipmentLongDescription } from '@/lib/equipment-long-description';
import type { Equipment } from '@/types/equipment';

const betoneira: Equipment = {
  slug: 'betoneira',
  name: 'Betoneira',
  category: 'ferramentas-eletricas',
  shortDescription: 'Locação de betoneira.',
  longDescription:
    'Betoneira: Equipamento para concretagem e misturas em obra civil. Aplicação em fundações, lajes e serviços de alvenaria.',
  specs: [{ label: 'Aplicação', value: 'Concretagem, argamassa e misturas' }],
  tags: [],
  featured: true,
  available: true,
};

describe('build equipment meta description', () => {
  it('returns click-oriented copy distinct from shortDescription', () => {
    const meta = buildEquipmentMetaDescription(betoneira);

    expect(meta).not.toBe(betoneira.shortDescription);
    expect(meta).toContain('Betoneira');
    expect(meta).toMatch(/orçamento|WhatsApp/i);
  });

  it('stays within meta description length budget', () => {
    const meta = buildEquipmentMetaDescription(betoneira);

    expect(meta.length).toBeLessThanOrEqual(160);
  });
});

describe('equipment page body description', () => {
  it('uses enriched long copy for thin catalog entries', () => {
    const body = getEquipmentPageBodyDescription(betoneira);

    expect(body).toBe(resolveEquipmentLongDescription(betoneira));
    expect(body.length).toBeGreaterThan(betoneira.longDescription.length);
  });

  it('enriches from specs when stored long copy is empty', () => {
    const item = { ...betoneira, longDescription: '   ' };

    expect(getEquipmentPageBodyDescription(item)).toContain('Betoneira');
    expect(getEquipmentPageBodyDescription(item)).toContain('Características técnicas');
  });
});

describe('format brand service area', () => {
  it('lists core RMBH municipalities for SEO copy', () => {
    const area = formatBrandServiceArea();

    expect(area).toContain('Contagem');
    expect(area).toContain('Betim');
    expect(area).toContain('Nova Lima');
  });
});

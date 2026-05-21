import { describe, expect, it } from 'vitest';
import { getEquipmentSeoExtra } from '@/lib/equipment-seo-extra';
import type { Equipment } from '@/types/equipment';

const aerialEquipment: Equipment = {
  slug: 'plataforma-elevatoria-hb-1430',
  name: 'Plataforma elevatória HB 1430',
  category: 'equipamentos-aereos',
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
    expect(extra?.paragraphs.join(' ')).toContain('~6,1 m');
    expect(extra?.paragraphs.join(' ')).toContain('NR-12');
  });

  it('returns category block for concretagem', () => {
    const extra = getEquipmentSeoExtra({
      ...aerialEquipment,
      category: 'concretagem',
      name: 'Betoneira',
    });

    expect(extra?.title).toContain('concretagem');
  });
});

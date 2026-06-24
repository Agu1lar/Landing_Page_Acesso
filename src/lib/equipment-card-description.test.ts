import { describe, expect, it } from 'vitest';
import { getEquipmentCardDescription } from '@/lib/equipment-card-description';
import type { Equipment } from '@/types/equipment';

const platform160Atj: Equipment = {
  slug: 'plataforma-elevatoria-160-atj-lanca-articulada',
  name: 'Plataforma elevatória 160 ATJ',
  category: 'plataformas-elevatorias',
  shortDescription: 'Locação de plataforma elevatória 160 ATJ.',
  longDescription: '',
  specs: [{ label: 'Altura de trabalho', value: '~16 m' }],
  tags: [],
  featured: true,
  available: true,
};

describe('get equipment card description', () => {
  it('appends work height to platform card copy', () => {
    expect(getEquipmentCardDescription(platform160Atj)).toBe(
      'Locação de plataforma elevatória 160 ATJ. Altura de trabalho: ~16 m.',
    );
  });

  it('leaves non-platform cards unchanged', () => {
    const betoneira: Equipment = {
      ...platform160Atj,
      slug: 'betoneira',
      category: 'ferramentas-eletricas',
      shortDescription: 'Locação de betoneira.',
      specs: [{ label: 'Altura de trabalho', value: '~16 m' }],
    };

    expect(getEquipmentCardDescription(betoneira)).toBe('Locação de betoneira.');
  });

  it('does not duplicate height when already in shortDescription', () => {
    const item: Equipment = {
      ...platform160Atj,
      shortDescription: 'Plataforma com altura de trabalho de 16 m para obra externa.',
    };

    expect(getEquipmentCardDescription(item)).toBe(item.shortDescription);
  });
});

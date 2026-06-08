import { describe, expect, it } from 'vitest';
import { mergeCategoryEquipment } from '@/lib/equipment';
import type { Equipment } from '@/types/equipment';

const guindasteJson: Equipment = {
  slug: 'guindaste-industrial-munck-remocao-bh',
  name: 'Guindaste industrial, Munck e remoção técnica',
  category: 'guindastes-remocoes',
  shortDescription: 'Locação de guindaste industrial, caminhão Munck e remoção técnica em BH.',
  longDescription: 'Solução para içamento.',
  specs: [],
  tags: ['guindaste', 'munck'],
  featured: true,
  available: true,
};

describe('merge category equipment', () => {
  it('includes JSON guindaste when category catalog is empty', () => {
    const items = mergeCategoryEquipment([], 'guindastes-remocoes');

    expect(items).toHaveLength(1);
    expect(items[0]?.slug).toBe('guindaste-industrial-munck-remocao-bh');
  });

  it('prefers JSON entry when slug exists in catalog with another category', () => {
    const wrongCategory: Equipment = {
      ...guindasteJson,
      category: 'outros',
    };

    const items = mergeCategoryEquipment([wrongCategory], 'guindastes-remocoes');

    expect(items).toHaveLength(1);
    expect(items[0]?.category).toBe('guindastes-remocoes');
  });
});

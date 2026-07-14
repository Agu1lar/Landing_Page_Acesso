import { describe, expect, it } from 'vitest';
import { getEquipmentSlugVariants } from '@/lib/equipment-slug-aliases';
import { slugifyEquipmentName } from '@/lib/equipment-slug';

describe('slugifyEquipmentName', () => {
  it('builds expected slug for tubo e braçadeira', () => {
    expect(slugifyEquipmentName('ANDAIME TIPO TUBO E BRAÇADEIRA')).toBe(
      'andaime-tipo-tubo-e-bracadeira',
    );
  });
});

describe('equipment slug aliases for tubo e braçadeira', () => {
  it('links legacy diagonal slug to the new catalog slug', () => {
    const variants = getEquipmentSlugVariants('andaime-tipo-tubo-e-bracadeira');
    expect(variants.has('diagonal-1-00')).toBe(true);
  });
});

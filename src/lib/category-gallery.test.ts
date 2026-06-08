import { describe, expect, it } from 'vitest';
import { getCategoryGallery } from '@/lib/category-gallery';

describe('get category gallery', () => {
  it('returns Munck and guindaste images for guindastes-remocoes', () => {
    const images = getCategoryGallery('guindastes-remocoes');

    expect(images).toHaveLength(2);
    expect(images[0]?.src).toContain('guindaste-industrial-operacao');
    expect(images[1]?.src).toContain('munck-icamento-carga');
  });

  it('returns empty array for categories without gallery', () => {
    expect(getCategoryGallery('concretagem')).toEqual([]);
  });
});

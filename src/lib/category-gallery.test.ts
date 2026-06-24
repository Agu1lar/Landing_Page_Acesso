import { describe, expect, it } from 'vitest';
import { getCategoryGallery } from '@/lib/category-gallery';

describe('get category gallery', () => {
  it('returns guindaste operation image for guindaste-industrial', () => {
    const images = getCategoryGallery('guindaste-industrial');

    expect(images).toHaveLength(1);
    expect(images[0]?.src).toContain('guindaste-industrial-operacao');
  });

  it('returns empty array for categories without gallery', () => {
    expect(getCategoryGallery('plataformas-elevatorias')).toEqual([]);
  });
});

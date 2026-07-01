import { describe, expect, it } from 'vitest';
import { nextGalleryIndex, sortEquipmentGalleryRows } from '@/lib/equipment-gallery';

describe('sort equipment gallery rows', () => {
  it('places primary image first', () => {
    const sorted = sortEquipmentGalleryRows([
      { id: 2, isPrimary: false, sortOrder: 0 },
      { id: 1, isPrimary: true, sortOrder: 2 },
      { id: 3, isPrimary: false, sortOrder: 1 },
    ]);

    expect(sorted.map((row) => row.id)).toEqual([1, 2, 3]);
  });
});

describe('next gallery index', () => {
  it('wraps forward and backward', () => {
    expect(nextGalleryIndex(0, 3, 'next')).toBe(1);
    expect(nextGalleryIndex(2, 3, 'next')).toBe(0);
    expect(nextGalleryIndex(0, 3, 'prev')).toBe(2);
  });

  it('returns zero when gallery has one image', () => {
    expect(nextGalleryIndex(0, 1, 'next')).toBe(0);
  });
});

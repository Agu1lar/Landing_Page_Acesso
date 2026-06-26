import { describe, expect, it } from 'vitest';
import {
  defaultEquipmentImageUrl,
  resolveAdminGalleryImageSrc,
} from '@/lib/admin-gallery-image';

describe('resolve admin gallery image src', () => {
  it('prefers blob upload over manifest path', () => {
    const blob = 'https://abc.public.blob.vercel-storage.com/equipment/photo.webp';
    expect(
      resolveAdminGalleryImageSrc({
        url: blob,
        slug: 'plataforma-aerea-gs-3246',
      }),
    ).toBe(blob);
  });

  it('uses manifest when db has stale webp placeholder', () => {
    const slug = 'plataforma-elevatoria-z45-25j-dc-lanca-articulada';
    expect(
      resolveAdminGalleryImageSrc({
        url: '/equipamentos/plataforma-elevatoria-z45-25j-dc-lanca-articulada.webp',
        slug,
      }),
    ).toBe('/equipamentos/plataforma-elevatoria-z45-25j-dc-lanca-articulada.png');
  });

  it('falls back to slug webp when manifest is missing', () => {
    expect(
      resolveAdminGalleryImageSrc({
        url: '/equipamentos/item-sem-foto.webp',
        slug: 'item-sem-foto-inexistente',
      }),
    ).toBe('/equipamentos/item-sem-foto.webp');
  });
});

describe('default equipment image url', () => {
  it('uses manifest path when available', () => {
    const url = defaultEquipmentImageUrl('plataforma-elevatoria-awp-30s');
    expect(url).toContain('plataforma-elevatoria-awp-30s');
  });
});

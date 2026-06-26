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

  it('keeps admin upload path when manifest is missing', () => {
    expect(
      resolveAdminGalleryImageSrc({
        url: '/equipamentos/uploads/item-sem-foto.jpg',
        slug: 'item-sem-foto-inexistente',
      }),
    ).toBe('/equipamentos/uploads/item-sem-foto.jpg');
  });

  it('prefers admin upload over manifest for same slug', () => {
    const upload = '/equipamentos/uploads/lavadora-nova.jpg';
    expect(
      resolveAdminGalleryImageSrc({
        url: upload,
        slug: 'lavadora-de-alta-pressao',
      }),
    ).toBe(upload);
  });
});

describe('default equipment image url', () => {
  it('uses manifest path when available', () => {
    const url = defaultEquipmentImageUrl('plataforma-elevatoria-awp-30s');
    expect(url).toContain('plataforma-elevatoria-awp-30s');
  });

  it('returns undefined when manifest is missing', () => {
    expect(defaultEquipmentImageUrl('item-sem-foto-inexistente')).toBeUndefined();
  });
});

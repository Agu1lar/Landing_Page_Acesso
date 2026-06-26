import { describe, expect, it } from 'vitest';
import {
  isAdminUploadedImageUrl,
  isGenericEquipmentPlaceholderUrl,
  resolveEquipmentImageSrc,
  shouldUnoptimizeEquipmentImage,
} from '@/lib/equipment-image-resolve';

describe('resolveEquipmentImageSrc', () => {
  it('prefers admin uploads folder over manifest', () => {
    const upload = '/equipamentos/uploads/lavadora-karcher-123.jpg';
    expect(
      resolveEquipmentImageSrc('/equipamentos/lavadora-de-alta-pressao.jpg', upload, 'lavadora-karcher'),
    ).toBe(upload);
  });

  it('prefers manifest over stale static DB path when both exist', () => {
    expect(
      resolveEquipmentImageSrc(
        '/equipamentos/plataforma-elevatoria-hb-1430.png',
        '/equipamentos/plataforma-elevatoria-hb-1430.webp',
        'plataforma-elevatoria-hb-1430',
      ),
    ).toBe('/equipamentos/plataforma-elevatoria-hb-1430.png');
  });

  it('uses Vercel Blob URL from admin upload', () => {
    const blob = 'https://abc.public.blob.vercel-storage.com/photo.webp';
    expect(resolveEquipmentImageSrc('/equipamentos/old.png', blob, 'custom-item')).toBe(blob);
  });

  it('falls back to DB when manifest is missing', () => {
    expect(resolveEquipmentImageSrc(undefined, '/equipamentos/custom.png')).toBe(
      '/equipamentos/custom.png',
    );
  });

  it('replaces generic slug placeholder with manifest', () => {
    expect(
      resolveEquipmentImageSrc(
        '/equipamentos/plataforma-elevatoria-z45-25j-dc-lanca-articulada.png',
        '/equipamentos/plataforma-elevatoria-z45-25j-dc-lanca-articulada.webp',
        'plataforma-elevatoria-z45-25j-dc-lanca-articulada',
      ),
    ).toBe('/equipamentos/plataforma-elevatoria-z45-25j-dc-lanca-articulada.png');
  });
});

describe('equipment image url helpers', () => {
  it('detects admin upload urls', () => {
    expect(isAdminUploadedImageUrl('https://abc.public.blob.vercel-storage.com/x.webp')).toBe(true);
    expect(isAdminUploadedImageUrl('/equipamentos/uploads/x.jpg')).toBe(true);
    expect(isAdminUploadedImageUrl('/equipamentos/foo.webp')).toBe(false);
  });

  it('detects generic placeholder urls', () => {
    expect(isGenericEquipmentPlaceholderUrl('/equipamentos/item-x.webp', 'item-x')).toBe(true);
    expect(isGenericEquipmentPlaceholderUrl('/equipamentos/uploads/item-x.jpg', 'item-x')).toBe(
      false,
    );
  });

  it('unoptimizes blob and upload urls', () => {
    expect(shouldUnoptimizeEquipmentImage('https://abc.public.blob.vercel-storage.com/x.webp')).toBe(
      true,
    );
    expect(shouldUnoptimizeEquipmentImage('/equipamentos/uploads/x.jpg')).toBe(true);
    expect(shouldUnoptimizeEquipmentImage('/equipamentos/foo.webp')).toBe(false);
  });
});

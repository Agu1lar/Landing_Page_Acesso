import { describe, expect, it } from 'vitest';
import { resolveEquipmentImageSrc } from '@/lib/equipment-image-resolve';

describe('resolveEquipmentImageSrc', () => {
  it('prefers manifest over local DB path when both exist', () => {
    expect(
      resolveEquipmentImageSrc(
        '/equipamentos/plataforma-elevatoria-hb-1430.png',
        '/equipamentos/uploads/wrong.png',
      ),
    ).toBe('/equipamentos/plataforma-elevatoria-hb-1430.png');
  });

  it('uses Vercel Blob URL from admin upload', () => {
    const blob = 'https://abc.public.blob.vercel-storage.com/photo.webp';
    expect(
      resolveEquipmentImageSrc('/equipamentos/old.png', blob),
    ).toBe(blob);
  });

  it('falls back to DB when manifest is missing', () => {
    expect(resolveEquipmentImageSrc(undefined, '/equipamentos/custom.png')).toBe(
      '/equipamentos/custom.png',
    );
  });
});

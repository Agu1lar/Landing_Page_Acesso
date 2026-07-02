import { describe, expect, it } from 'vitest';
import { isAllowedEquipmentLaudoUrl } from '@/lib/equipment-laudo-upload';

describe('isAllowedEquipmentLaudoUrl', () => {
  it('allows empty URL', () => {
    expect(isAllowedEquipmentLaudoUrl('')).toBe(true);
    expect(isAllowedEquipmentLaudoUrl('   ')).toBe(true);
  });

  it('allows local laudo path', () => {
    expect(isAllowedEquipmentLaudoUrl('/equipamentos/laudos/plataforma-laudo-123.pdf')).toBe(true);
  });

  it('allows Vercel Blob PDF', () => {
    expect(
      isAllowedEquipmentLaudoUrl(
        'https://abc.public.blob.vercel-storage.com/equipment/laudos/plataforma-laudo-123.pdf',
      ),
    ).toBe(true);
  });

  it('rejects external URLs', () => {
    expect(isAllowedEquipmentLaudoUrl('https://example.com/laudo.pdf')).toBe(false);
  });
});

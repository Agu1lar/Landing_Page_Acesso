import { describe, expect, it } from 'vitest';
import { resolveAdminImageMime } from '@/lib/admin-image-upload';

describe('resolve admin image mime', () => {
  it('uses file type when present', () => {
    expect(resolveAdminImageMime({ name: 'photo.jpg', type: 'image/jpeg' })).toBe('image/jpeg');
  });

  it('infers mime from extension when type is empty', () => {
    expect(resolveAdminImageMime({ name: 'photo.JPG', type: '' })).toBe('image/jpeg');
    expect(resolveAdminImageMime({ name: 'cover.png', type: '' })).toBe('image/png');
  });

  it('returns null for unsupported files', () => {
    expect(resolveAdminImageMime({ name: 'doc.pdf', type: 'application/pdf' })).toBeNull();
  });
});

describe('pick image files', () => {
  it('accepts files with image extension and empty mime', async () => {
    const { pickImageFiles } = await import('@/lib/admin-image-upload-client');
    const file = new File(['x'], 'foto.jpg', { type: '' });
    expect(pickImageFiles([file])).toHaveLength(1);
  });
});

import { describe, expect, it } from 'vitest';
import {
  adminListFiltersSuffix,
  buildAdminListQuery,
  equipmentAdminListPathAfterArchive,
  resolveAdminReturnPath,
} from '@/lib/admin-return-path';

describe('build admin list query', () => {
  it('omits empty and all values', () => {
    expect(buildAdminListQuery({ q: 'betoneira', status: 'all', category: '' })).toBe('?q=betoneira');
  });
});

describe('resolve admin return path', () => {
  it('rejects external urls', () => {
    expect(resolveAdminReturnPath('https://evil.com/dashboard', '/fallback')).toBe('/fallback');
  });

  it('accepts dashboard paths', () => {
    expect(resolveAdminReturnPath('/dashboard/equipamentos?q=a', '/fallback')).toBe(
      '/dashboard/equipamentos?q=a',
    );
  });
});

describe('admin list filters suffix', () => {
  it('extracts query from returnTo field', () => {
    const formData = new FormData();
    formData.set('returnTo', '/dashboard/equipamentos?q=aspirador&status=active');

    expect(adminListFiltersSuffix(formData)).toBe('?q=aspirador&status=active');
  });
});

describe('equipment admin list path after archive', () => {
  it('forces archived status while keeping search', () => {
    const formData = new FormData();
    formData.set('returnTo', '/dashboard/equipamentos?q=aspirador&status=active');

    expect(equipmentAdminListPathAfterArchive(formData)).toBe(
      '/dashboard/equipamentos?q=aspirador&status=archived',
    );
  });
});

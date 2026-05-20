import { describe, expect, it } from 'vitest';
import {
  parseDashboardRoleFromMetadata,
  parseDashboardRoleFromSessionClaims,
} from '@/lib/auth-roles';

describe(parseDashboardRoleFromMetadata, () => {
  it('accepts admin role', () => {
    expect(parseDashboardRoleFromMetadata({ role: 'admin' })).toBe('admin');
  });

  it('accepts comercial role', () => {
    expect(parseDashboardRoleFromMetadata({ role: 'comercial' })).toBe('comercial');
  });

  it('rejects missing or invalid role', () => {
    expect(parseDashboardRoleFromMetadata({})).toBeUndefined();
    expect(parseDashboardRoleFromMetadata({ role: 'guest' })).toBeUndefined();
  });
});

describe(parseDashboardRoleFromSessionClaims, () => {
  it('reads role from publicMetadata on claims', () => {
    expect(
      parseDashboardRoleFromSessionClaims({
        publicMetadata: { role: 'comercial' },
      }),
    ).toBe('comercial');
  });
});

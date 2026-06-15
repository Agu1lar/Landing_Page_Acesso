import { describe, expect, it } from 'vitest';
import {
  isDeferredDashboardPath,
  parseDashboardRoleFromMetadata,
  parseDashboardRoleFromSessionClaims,
} from '@/lib/auth-roles';

describe('parse dashboard role from metadata', () => {
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

describe('parse dashboard role from session claims', () => {
  it('reads role from publicMetadata on claims', () => {
    expect(
      parseDashboardRoleFromSessionClaims({
        publicMetadata: { role: 'comercial' },
      }),
    ).toBe('comercial');
  });
});

describe('isDeferredDashboardPath', () => {
  it('allows analytics dashboard', () => {
    expect(isDeferredDashboardPath('/dashboard/analytics')).toBe(false);
    expect(isDeferredDashboardPath('/pt-BR/dashboard/analytics')).toBe(false);
  });

  it('blocks unshipped export and settings routes', () => {
    expect(isDeferredDashboardPath('/dashboard/exportacoes')).toBe(true);
    expect(isDeferredDashboardPath('/dashboard/configuracoes')).toBe(true);
  });
});

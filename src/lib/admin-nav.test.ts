import { describe, expect, it } from 'vitest';
import { isAdminNavActive, stripLocaleFromPath } from '@/lib/admin-nav';

describe('admin nav', () => {
  it('strips locale prefix from path', () => {
    expect(stripLocaleFromPath('/pt-BR/dashboard/leads')).toBe('/dashboard/leads');
  });

  it('marks leads detail as leads nav active', () => {
    expect(isAdminNavActive('/pt-BR/dashboard/leads/42', '/dashboard/leads')).toBe(true);
  });

  it('marks analytics path as active', () => {
    expect(isAdminNavActive('/dashboard/analytics', '/dashboard/analytics')).toBe(true);
  });

  it('marks access page as active', () => {
    expect(isAdminNavActive('/dashboard/acesso', '/dashboard/acesso')).toBe(true);
  });
});

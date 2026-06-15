import { describe, expect, it } from 'vitest';
import { isAllowedDashboardEmail, normalizeAllowlistEmail } from '@/lib/dashboard-allowlist-email';

describe('normalizeAllowlistEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeAllowlistEmail('  Admin@Empresa.COM  ')).toBe('admin@empresa.com');
  });
});

describe('isAllowedDashboardEmail', () => {
  it('accepts corporate subdomain addresses', () => {
    expect(isAllowedDashboardEmail('comercial1@acessoequipamentos.com.br')).toBe(true);
  });

  it('rejects invalid addresses', () => {
    expect(isAllowedDashboardEmail('sem-arroba')).toBe(false);
    expect(isAllowedDashboardEmail('@dominio.com')).toBe(false);
  });
});

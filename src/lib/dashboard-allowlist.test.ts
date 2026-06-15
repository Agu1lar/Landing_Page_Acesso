import { describe, expect, it } from 'vitest';
import { normalizeAllowlistEmail } from '@/lib/dashboard-allowlist';

describe('normalizeAllowlistEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeAllowlistEmail('  Admin@Empresa.COM  ')).toBe('admin@empresa.com');
  });
});

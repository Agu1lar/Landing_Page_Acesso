import { describe, expect, it } from 'vitest';
import {
  getEquipmentSlugVariants,
  isSlugManagedInPostgres,
} from '@/lib/equipment-slug-aliases';

describe('equipment slug aliases', () => {
  it('links nivel-laser and nível-laser', () => {
    const variants = getEquipmentSlugVariants('nível-laser');

    expect(variants.has('nivel-laser')).toBe(true);
    expect(variants.has('nível-laser')).toBe(true);
  });

  it('detects postgres slug when json uses accented alias', () => {
    const managed = new Set(['nivel-laser']);

    expect(isSlugManagedInPostgres('nível-laser', managed)).toBe(true);
    expect(isSlugManagedInPostgres('nivel-laser', managed)).toBe(true);
  });

  it('returns false for json-only slug', () => {
    const managed = new Set(['nivel-laser']);

    expect(isSlugManagedInPostgres('franna-fr17', managed)).toBe(false);
  });
});

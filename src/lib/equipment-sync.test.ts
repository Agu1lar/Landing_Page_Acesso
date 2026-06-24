import { describe, expect, it } from 'vitest';
import { PRIORITY_CATALOG_SLUGS } from '@/lib/equipment-sync';

describe('priority catalog slugs', () => {
  it('includes guindaste industrial service slug', () => {
    expect(PRIORITY_CATALOG_SLUGS).toContain('guindaste-industrial-munck-remocao-bh');
  });
});

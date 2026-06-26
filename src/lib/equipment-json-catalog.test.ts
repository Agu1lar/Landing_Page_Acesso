import { describe, expect, it } from 'vitest';
import equipmentJson from '@/data/equipamentos.json';
import type { Equipment } from '@/types/equipment';

const catalog = equipmentJson as Equipment[];

describe('json-only catalog lookup', () => {
  it('finds Genie Z-80/60 by name with legacy slug s60', () => {
    const item = catalog.find((entry) => entry.name.includes('Genie Z-80/60'));
    expect(item?.slug).toBe('plataforma-elevatoria-s60');
    expect(item?.specs.some((spec) => spec.label === 'Tipo' && spec.value.includes('articulada'))).toBe(
      true,
    );
  });
});

import { describe, expect, it } from 'vitest';
import {
  fillEquipmentFromCartItems,
  summarizeCartEquipment,
} from '@/validations/quote';

describe('summarizeCartEquipment', () => {
  it('joins multiple cart lines into slug and name fields', () => {
    const summary = summarizeCartEquipment([
      { slug: 'plataforma-10m', name: 'Plataforma 10m', kind: 'equipment', quantity: 1 },
      { slug: 'capacete', name: 'Capacete', kind: 'accessory', quantity: 2 },
    ]);

    expect(summary.equipmentSlug).toBe('plataforma-10m,capacete');
    expect(summary.equipmentName).toBe('Plataforma 10m · Capacete (×2)');
  });
});

describe('fillEquipmentFromCartItems', () => {
  it('derives equipment columns from itemsJson when empty', () => {
    const filled = fillEquipmentFromCartItems({
      equipmentSlug: undefined,
      equipmentName: undefined,
      itemsJson: JSON.stringify([
        { slug: 'guindaste', name: 'Guindaste', kind: 'equipment', quantity: 1 },
      ]),
    });

    expect(filled.equipmentSlug).toBe('guindaste');
    expect(filled.equipmentName).toBe('Guindaste');
  });
});

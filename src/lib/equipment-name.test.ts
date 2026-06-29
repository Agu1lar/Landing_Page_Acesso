import { describe, expect, it } from 'vitest';
import { formatEquipmentName } from '@/lib/equipment-name';

describe('formatEquipmentName', () => {
  it('uppercases lowercase input', () => {
    expect(formatEquipmentName('nível laser')).toBe('NÍVEL LASER');
  });

  it('collapses extra spaces', () => {
    expect(formatEquipmentName('  plataforma   aérea   gs 3246  ')).toBe('PLATAFORMA AÉREA GS 3246');
  });

  it('keeps already uppercase names stable', () => {
    expect(formatEquipmentName('NÍVEL LASER')).toBe('NÍVEL LASER');
  });

  it('returns empty string for blank input', () => {
    expect(formatEquipmentName('   ')).toBe('');
  });
});

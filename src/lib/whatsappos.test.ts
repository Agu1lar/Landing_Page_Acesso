import { describe, expect, it } from 'vitest';
import { normalizeBrazilPhoneDigits } from '@/lib/whatsappos';

describe('normalizeBrazilPhoneDigits', () => {
  it('strips formatting and adds country code for local numbers', () => {
    expect(normalizeBrazilPhoneDigits('(31) 99999-0000')).toBe('5531999990000');
  });

  it('keeps numbers that already include country code', () => {
    expect(normalizeBrazilPhoneDigits('5531987654321')).toBe('5531987654321');
  });
});

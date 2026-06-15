import { describe, expect, it } from 'vitest';
import { CookieConsentPhoneSchema } from '@/validations/cookie-consent-contact';

describe('CookieConsentPhoneSchema', () => {
  it('accepts a Brazilian phone with formatting', () => {
    const parsed = CookieConsentPhoneSchema.safeParse({ phone: '(31) 99999-1234' });
    expect(parsed.success).toBe(true);
  });

  it('rejects phones that are too short', () => {
    const parsed = CookieConsentPhoneSchema.safeParse({ phone: '31999' });
    expect(parsed.success).toBe(false);
  });
});

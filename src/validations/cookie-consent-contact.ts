import * as z from 'zod';

export const CookieConsentPhoneSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, 'Informe um telefone com DDD')
    .max(40)
    .regex(/^[\d\s()+-]+$/, 'Telefone inválido'),
});

export type CookieConsentPhoneInput = z.infer<typeof CookieConsentPhoneSchema>;

export function normalizeCookieConsentPhone(phone: string) {
  return phone.trim();
}

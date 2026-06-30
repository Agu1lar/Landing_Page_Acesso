import * as z from 'zod';
import { AttributionSchema } from '@/lib/attribution';

export const rentalPeriodOptions = ['diaria', 'semanal', 'mensal', 'ainda_nao_sei'] as const;

export const QuoteCartItemSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(300),
  kind: z.enum(['equipment', 'accessory']),
  quantity: z.number().int().min(1).max(99),
  /** Compact technical specs for WhatsApp (altura, carga). Filled server-side when absent. */
  specsSummary: z.string().trim().max(240).optional(),
});

export const QuoteFormSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo').max(200),
  email: z.email('E-mail inválido').max(320),
  phone: z
    .string()
    .trim()
    .min(10, 'Informe um telefone com DDD')
    .max(40)
    .regex(/^[\d\s()+-]+$/, 'Telefone inválido'),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  equipmentSlug: z.string().trim().max(120).optional().or(z.literal('')),
  equipmentName: z.string().trim().max(300).optional().or(z.literal('')),
  rentalPeriod: z.string().max(80).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Informe a cidade da obra').max(120),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  cartItems: z.array(QuoteCartItemSchema).max(40).optional(),
  origin: z.string().trim().max(80),
  attribution: AttributionSchema.optional(),
  /** Honeypot — deve permanecer vazio; bots que preenchem são ignorados na API */
  website: z.string().max(200).optional().or(z.literal('')),
});

export type QuoteFormInput = z.infer<typeof QuoteFormSchema>;
export type QuoteCartItemInput = z.infer<typeof QuoteCartItemSchema>;

/** Builds equipment slug/name summary from cart lines for leads and analytics. */
export function summarizeCartEquipment(cartItems: QuoteCartItemInput[] | undefined) {
  if (!cartItems?.length) {
    return { equipmentSlug: undefined, equipmentName: undefined };
  }

  return {
    equipmentSlug: cartItems
      .map((item) => item.slug)
      .join(',')
      .slice(0, 120),
    equipmentName: cartItems
      .map((item) => (item.quantity > 1 ? `${item.name} (×${item.quantity})` : item.name))
      .join(' · ')
      .slice(0, 300),
  };
}

/** Parses persisted cart JSON from a lead row. */
export function parseQuoteCartItemsFromJson(itemsJson: string | undefined) {
  if (!itemsJson?.trim()) {
    return undefined;
  }

  try {
    const parsed = z.array(QuoteCartItemSchema).safeParse(JSON.parse(itemsJson));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/** Fills missing equipment fields from itemsJson when the cart was saved but columns were empty. */
export function fillEquipmentFromCartItems<
  T extends {
    equipmentSlug?: string;
    equipmentName?: string;
    itemsJson?: string;
  },
>(input: T) {
  if (input.equipmentSlug?.trim() && input.equipmentName?.trim()) {
    return input;
  }

  const cartItems = parseQuoteCartItemsFromJson(input.itemsJson);
  const summary = summarizeCartEquipment(cartItems);

  return {
    ...input,
    equipmentSlug: input.equipmentSlug?.trim() || summary.equipmentSlug,
    equipmentName: input.equipmentName?.trim() || summary.equipmentName,
  };
}

export function normalizeQuotePayload(data: QuoteFormInput) {
  const period = data.rentalPeriod?.trim();
  const validPeriod =
    period && rentalPeriodOptions.includes(period as (typeof rentalPeriodOptions)[number])
      ? period
      : undefined;

  const cartItems = data.cartItems?.length ? data.cartItems : undefined;
  const equipmentFromCart = summarizeCartEquipment(cartItems);
  const equipmentSlug = equipmentFromCart.equipmentSlug ?? data.equipmentSlug?.trim() ?? undefined;
  const equipmentName = equipmentFromCart.equipmentName ?? data.equipmentName?.trim() ?? undefined;

  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    company: data.company?.trim() ?? undefined,
    equipmentSlug,
    equipmentName,
    rentalPeriod: validPeriod,
    city: data.city.trim(),
    message: data.message?.trim() ?? undefined,
    itemsJson: cartItems ? JSON.stringify(cartItems) : undefined,
    origin: data.origin?.trim() || 'site-orcamento',
    utmSource: data.attribution?.utmSource,
    utmMedium: data.attribution?.utmMedium,
    utmCampaign: data.attribution?.utmCampaign,
    utmContent: data.attribution?.utmContent,
    utmTerm: data.attribution?.utmTerm,
    gclid: data.attribution?.gclid,
    gbraid: data.attribution?.gbraid,
    wbraid: data.attribution?.wbraid,
    referrer: data.attribution?.referrer,
    landingPage: data.attribution?.landingPage,
  };
}

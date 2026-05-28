import { Env } from '@/libs/Env';
import type { AttributionInput } from '@/lib/attribution';
import type { QuoteCartItemInput } from '@/validations/quote';

export type WhatsAppOSConfig = {
  apiUrl: string;
  widgetKey: string;
};

export type WhatsAppOSCaptureInput = {
  phone: string;
  name: string;
  email: string;
  message: string;
  cartItems?: QuoteCartItemInput[];
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  tags?: ReadonlyArray<string>;
};

/**
 * Returns CRM widget config when both public env vars are set.
 */
export function getWhatsAppOSConfig(): WhatsAppOSConfig | null {
  const apiUrl = Env.NEXT_PUBLIC_WHATSAPPOS_API_URL?.trim();
  const widgetKey = Env.NEXT_PUBLIC_WHATSAPPOS_WIDGET_KEY?.trim();

  if (!apiUrl || !widgetKey) {
    return null;
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ''),
    widgetKey,
  };
}

/**
 * Normalizes a Brazilian phone to digits with country code 55.
 */
export function normalizeBrazilPhoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('55') && digits.length >= 12) {
    return digits;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits.startsWith('55') ? digits : `55${digits}`;
}

/**
 * Public URL of the CRM widget loader script.
 */
export function getWhatsAppOSWidgetScriptUrl(config: WhatsAppOSConfig) {
  return `${config.apiUrl}/widgets/${config.widgetKey}.js`;
}

/**
 * POST lead capture to whatsappOS CRM (browser → CRM API).
 */
export async function captureQuoteLeadToWhatsAppOS(input: WhatsAppOSCaptureInput) {
  const config = getWhatsAppOSConfig();
  if (!config) {
    return { ok: false as const, skipped: true as const };
  }

  const response = await fetch(
    `${config.apiUrl}/widgets/${config.widgetKey}/capture`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizeBrazilPhoneDigits(input.phone),
        name: input.name,
        email: input.email,
        message: input.message,
        cartItems: input.cartItems ?? [],
        pageUrl: input.pageUrl,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        tags: input.tags ?? ['acesso', 'orcamento'],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`WhatsAppOS capture failed: ${response.status}`);
  }

  return { ok: true as const, skipped: false as const };
}

/**
 * Builds capture payload from quote form fields and attribution.
 */
export function buildWhatsAppOSCaptureInput(options: {
  phone: string;
  name: string;
  email: string;
  message: string;
  cartItems?: QuoteCartItemInput[];
  attribution?: AttributionInput | null;
  pageUrl?: string;
}) {
  return {
    phone: options.phone,
    name: options.name,
    email: options.email,
    message: options.message,
    cartItems: options.cartItems,
    pageUrl: options.pageUrl,
    utmSource: options.attribution?.utmSource,
    utmMedium: options.attribution?.utmMedium,
    utmCampaign: options.attribution?.utmCampaign,
    tags: ['acesso', 'orcamento'] as const,
  };
}

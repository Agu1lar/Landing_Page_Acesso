import * as z from 'zod';
import { QuoteCartItemSchema } from '@/validations/quote';
import type { QuoteCartItemInput } from '@/validations/quote';

/**
 * Parses cart line items stored on a lead row.
 *
 * @param itemsJson - Serialized cart from the quote form.
 * @returns Validated cart items, or an empty array when invalid.
 */
export function parseLeadCartItems(itemsJson: string | null | undefined) {
  if (!itemsJson?.trim()) {
    return [] as QuoteCartItemInput[];
  }
  try {
    const raw: unknown = JSON.parse(itemsJson);
    const parsed = z.array(QuoteCartItemSchema).safeParse(raw);
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/**
 * Formats cart items for CSV or table display.
 *
 * @param itemsJson - Serialized cart from the quote form.
 * @returns Human-readable summary for admin views and export.
 */
export function formatLeadCartItems(itemsJson: string | null | undefined) {
  const items = parseLeadCartItems(itemsJson);
  if (items.length === 0) {
    return '';
  }
  return items
    .map((item) => {
      const kind = item.kind === 'accessory' ? 'Acessório' : 'Equipamento';
      const qty = item.quantity > 1 ? ` ×${item.quantity}` : '';
      return `${item.name} (${kind})${qty}`;
    })
    .join('; ');
}

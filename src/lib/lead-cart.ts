import * as z from 'zod';
import { QuoteCartItemSchema } from '@/validations/quote';
import type { QuoteCartItemInput } from '@/validations/quote';
import { CATEGORY_LABELS, isEquipmentCategory } from '@/types/equipment';

export type LeadCartItemDisplay = {
  subtitle: string;
  catalogNameNote?: string;
};

/** Builds admin-friendly cart line labels (category + specs, not raw slug). */
export function buildLeadCartItemDisplay(
  item: QuoteCartItemInput,
  catalog?: { name: string; category: string; shortDescription?: string } | null,
): LeadCartItemDisplay {
  const kindLabel = item.kind === 'accessory' ? 'Acessório' : 'Equipamento';
  const parts = [kindLabel];

  if (catalog?.category && isEquipmentCategory(catalog.category)) {
    parts.push(CATEGORY_LABELS[catalog.category]);
  }

  if (item.specsSummary?.trim()) {
    parts.push(item.specsSummary.trim());
  } else if (catalog?.shortDescription?.trim()) {
    const short = catalog.shortDescription.trim();
    parts.push(short.length > 120 ? `${short.slice(0, 117)}…` : short);
  }

  const catalogNameNote =
    catalog?.name && catalog.name.trim().toLowerCase() !== item.name.trim().toLowerCase()
      ? catalog.name.trim()
      : undefined;

  return {
    subtitle: parts.join(' · '),
    catalogNameNote,
  };
}

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

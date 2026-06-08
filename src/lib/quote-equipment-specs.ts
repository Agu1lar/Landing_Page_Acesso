import { getEquipmentBySlug } from '@/lib/equipment';
import type { EquipmentSpec } from '@/types/equipment';
import type { QuoteCartItemInput } from '@/validations/quote';

const quoteSpecRules = [
  { pattern: /altura de trabalho/i, label: 'Altura de trabalho' },
  { pattern: /capacidade(\s*\/\s*peso na plataforma|\s+de\s+carga)?/i, label: 'Capacidade de carga' },
] as const;

export type QuoteCartItemWithSpecs = QuoteCartItemInput & {
  specsSummary?: string;
};

/**
 * Builds a compact specs line for WhatsApp quotes (aerial platforms and similar).
 */
export function formatQuoteSpecsLine(specs: EquipmentSpec[]) {
  const parts: string[] = [];

  for (const rule of quoteSpecRules) {
    const match = specs.find((spec) => rule.pattern.test(spec.label));
    if (match?.value.trim()) {
      parts.push(`${rule.label}: ${match.value.trim()}`);
    }
  }

  return parts.length > 0 ? parts.join(' · ') : undefined;
}

/**
 * Resolves technical specs from the catalog for cart equipment items.
 */
export async function enrichQuoteCartItemsWithSpecs(
  cartItems: QuoteCartItemInput[],
): Promise<QuoteCartItemWithSpecs[]> {
  return Promise.all(
    cartItems.map(async (item) => {
      if (item.specsSummary?.trim()) {
        return item;
      }

      if (item.kind !== 'equipment') {
        return item;
      }

      const equipment = await getEquipmentBySlug(item.slug);
      const specsSummary = equipment ? formatQuoteSpecsLine(equipment.specs) : undefined;

      return specsSummary ? { ...item, specsSummary } : item;
    }),
  );
}

/**
 * Resolves specs for a single equipment slug (detail page / manual field fallback).
 */
export async function resolveEquipmentSpecsSummary(slug: string | undefined) {
  if (!slug?.trim()) {
    return undefined;
  }

  const equipment = await getEquipmentBySlug(slug.trim());
  return equipment ? formatQuoteSpecsLine(equipment.specs) : undefined;
}

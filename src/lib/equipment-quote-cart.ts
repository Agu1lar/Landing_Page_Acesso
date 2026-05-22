import type { Equipment } from '@/types/equipment';
import type { QuoteCartItemKind } from '@/types/quote-cart';

/** Maps catalog category to quote-cart item kind. */
export function getEquipmentQuoteCartKind(
  equipment: Pick<Equipment, 'category'>,
): QuoteCartItemKind {
  return equipment.category === 'acessorios' ? 'accessory' : 'equipment';
}

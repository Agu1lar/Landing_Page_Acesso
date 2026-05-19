export type QuoteCartItemKind = 'equipment' | 'accessory';

export const QUOTE_CART_MIN_QUANTITY = 1;
export const QUOTE_CART_MAX_QUANTITY = 99;

export type QuoteCartItem = {
  slug: string;
  name: string;
  kind: QuoteCartItemKind;
  quantity: number;
};

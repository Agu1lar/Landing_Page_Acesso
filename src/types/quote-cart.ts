export type QuoteCartItemKind = 'equipment' | 'accessory';

export type QuoteCartItem = {
  slug: string;
  name: string;
  kind: QuoteCartItemKind;
};

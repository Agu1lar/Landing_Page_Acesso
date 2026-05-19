'use client';

import { Button } from '@/components/ui/Button';
import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';
import type { QuoteCartItem } from '@/types/quote-cart';

type AddToQuoteButtonProps = {
  item: QuoteCartItem;
  className?: string;
  size?: 'sm' | 'md';
};

/**
 * Adiciona equipamento ou acessório ao carrinho de orçamento.
 */
export function AddToQuoteButton(props: AddToQuoteButtonProps) {
  const cart = useQuoteCart();
  const inCart = cart.hasItem(props.item.slug);

  return (
    <Button
      className={props.className}
      onClick={() => {
        if (!inCart) {
          cart.addItem(props.item);
        }
      }}
      size={props.size ?? 'sm'}
      type="button"
      variant={inCart ? 'outline' : 'primary'}
    >
      {inCart ? 'No orçamento' : 'Adicionar ao orçamento'}
    </Button>
  );
}

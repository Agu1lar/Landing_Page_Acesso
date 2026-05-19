'use client';

import { useState } from 'react';
import { QuoteCartQuantityStepper } from '@/components/quote-cart/QuoteCartQuantityStepper';
import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';
import { Button } from '@/components/ui/Button';
import type { QuoteCartItemKind } from '@/types/quote-cart';
import { QUOTE_CART_MIN_QUANTITY } from '@/types/quote-cart';

type AddToQuoteButtonProps = {
  item: {
    slug: string;
    name: string;
    kind: QuoteCartItemKind;
  };
  className?: string;
  size?: 'sm' | 'md';
};

/**
 * Adiciona equipamento ou acessório ao carrinho de orçamento com quantidade.
 */
export function AddToQuoteButton(props: AddToQuoteButtonProps) {
  const cart = useQuoteCart();
  const inCart = cart.hasItem(props.item.slug);
  const [draftQuantity, setDraftQuantity] = useState(QUOTE_CART_MIN_QUANTITY);
  const stepperValue = inCart ? cart.getItemQuantity(props.item.slug) : draftQuantity;
  const Wrapper = 'div' as const;

  return (
    <Wrapper className={`flex flex-col gap-2 ${props.className ?? ''}`}>
      <Wrapper className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-neutral-600">Quantidade</span>
        <QuoteCartQuantityStepper
          ariaLabel={`Quantidade de ${props.item.name}`}
          onChange={(quantity) => {
            if (inCart) {
              cart.setItemQuantity(props.item.slug, quantity);
            } else {
              setDraftQuantity(quantity);
            }
          }}
          size={props.size ?? 'sm'}
          value={stepperValue}
        />
      </Wrapper>
      <Button
        onClick={() => {
          cart.addItem({ ...props.item, quantity: stepperValue });
        }}
        size={props.size ?? 'sm'}
        type="button"
        variant={inCart ? 'outline' : 'primary'}
      >
        {inCart ? `No orçamento (${stepperValue})` : 'Adicionar ao orçamento'}
      </Button>
    </Wrapper>
  );
}

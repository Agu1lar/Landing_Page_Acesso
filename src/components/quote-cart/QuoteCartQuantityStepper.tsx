'use client';

import { QUOTE_CART_MAX_QUANTITY, QUOTE_CART_MIN_QUANTITY } from '@/types/quote-cart';

type QuoteCartQuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
  ariaLabel?: string;
};

/**
 * Controle de quantidade para o carrinho de orçamento.
 */
export function QuoteCartQuantityStepper(props: QuoteCartQuantityStepperProps) {
  const size = props.size ?? 'md';
  const buttonClass = size === 'sm' ? 'h-8 w-8 text-base' : 'h-9 w-9 text-lg';
  const inputClass = size === 'sm' ? 'h-8 w-10 text-sm' : 'h-9 w-12 text-sm';

  const clamp = (next: number) =>
    Math.min(QUOTE_CART_MAX_QUANTITY, Math.max(QUOTE_CART_MIN_QUANTITY, next));

  return (
    <div
      aria-label={props.ariaLabel ?? 'Quantidade'}
      className="inline-flex items-center rounded-lg border border-neutral-200 bg-surface"
      role="group"
    >
      <button
        aria-label="Diminuir quantidade"
        className={`${buttonClass} rounded-l-lg font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-40`}
        disabled={props.value <= QUOTE_CART_MIN_QUANTITY}
        onClick={() => props.onChange(clamp(props.value - 1))}
        type="button"
      >
        −
      </button>
      <input
        aria-label="Quantidade"
        className={`${inputClass} border-x border-neutral-200 text-center font-medium text-neutral-900 tabular-nums`}
        inputMode="numeric"
        max={QUOTE_CART_MAX_QUANTITY}
        min={QUOTE_CART_MIN_QUANTITY}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          if (Number.isNaN(parsed)) {
            return;
          }
          props.onChange(clamp(parsed));
        }}
        type="number"
        value={props.value}
      />
      <button
        aria-label="Aumentar quantidade"
        className={`${buttonClass} rounded-r-lg font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-40`}
        disabled={props.value >= QUOTE_CART_MAX_QUANTITY}
        onClick={() => props.onChange(clamp(props.value + 1))}
        type="button"
      >
        +
      </button>
    </div>
  );
}

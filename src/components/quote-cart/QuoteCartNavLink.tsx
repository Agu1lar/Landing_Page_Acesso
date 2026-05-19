'use client';

import { Link } from '@/libs/I18nNavigation';
import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';

type QuoteCartNavLinkProps = {
  label: string;
  className?: string;
};

/**
 * Link para /orcamento com contador de itens no carrinho.
 */
export function QuoteCartNavLink(props: QuoteCartNavLinkProps) {
  const cart = useQuoteCart();

  return (
    <Link
      className={`relative inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-800 hover:border-primary hover:text-primary ${props.className ?? ''}`}
      href="/orcamento"
    >
      {props.label}
      {cart.count > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-white">
          {cart.count}
        </span>
      ) : null}
    </Link>
  );
}

'use client';

import { Link } from '@/libs/I18nNavigation';
import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';

type QuoteCartPanelProps = {
  showCheckoutHint?: boolean;
};

/**
 * Lista itens do carrinho de orçamento com opção de remover.
 */
export function QuoteCartPanel(props: QuoteCartPanelProps) {
  const cart = useQuoteCart();

  if (cart.count === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-neutral-300 bg-background-muted p-6 text-center">
        <p className="font-heading text-base font-semibold text-neutral-900">Seu orçamento está vazio</p>
        <p className="mt-2 text-sm text-neutral-600">
          Navegue pelo{' '}
          <Link className="font-medium text-primary hover:underline" href="/equipamentos">
            catálogo
          </Link>{' '}
          e use &quot;Adicionar ao orçamento&quot; em cada item. Valores e disponibilidade serão informados
          pelo comercial após o envio.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="quote-cart-title"
      className="rounded-[var(--radius-card)] border border-neutral-200 bg-surface p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold text-neutral-900" id="quote-cart-title">
          Itens no orçamento ({cart.count})
        </h2>
        <button
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => cart.clearCart()}
          type="button"
        >
          Limpar lista
        </button>
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        Envie o formulário abaixo para receber proposta com valores e prazo. Acessórios podem ser
        incluídos quando estiverem no catálogo.
      </p>
      <ul className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        {cart.items.map((item) => (
          <li className="flex items-start justify-between gap-3 px-4 py-3 text-sm" key={item.slug}>
            <div>
              <p className="font-medium text-neutral-900">{item.name}</p>
              <p className="text-xs text-neutral-500 capitalize">{item.kind === 'accessory' ? 'Acessório' : 'Equipamento'}</p>
            </div>
            <button
              className="shrink-0 text-sm font-medium text-red-600 hover:underline"
              onClick={() => cart.removeItem(item.slug)}
              type="button"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
      {props.showCheckoutHint ? (
        <p className="mt-4 text-xs text-neutral-500">
          Os valores serão enviados pelo comercial após análise do pedido.
        </p>
      ) : null}
    </section>
  );
}

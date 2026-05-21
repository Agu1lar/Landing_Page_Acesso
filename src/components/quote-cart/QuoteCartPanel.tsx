'use client';

import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';
import { QuoteCartQuantityStepper } from '@/components/quote-cart/QuoteCartQuantityStepper';
import { Link } from '@/libs/I18nNavigation';

type QuoteCartPanelProps = {
  showCheckoutHint?: boolean;
};

/**
 * Lista itens do carrinho de orçamento com quantidade e opção de remover.
 */
export function QuoteCartPanel(props: QuoteCartPanelProps) {
  const cart = useQuoteCart();

  if (cart.lineCount === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-neutral-300 bg-background-muted p-6 text-center">
        <p className="font-heading text-base font-semibold text-neutral-900">
          Seu orçamento está vazio
        </p>
        <p className="mt-2 text-sm text-neutral-600">
          Navegue pelo{' '}
          <Link className="font-medium text-primary hover:underline" href="/equipamentos">
            catálogo
          </Link>{' '}
          e use &quot;Adicionar ao orçamento&quot; em cada item. Valores e disponibilidade serão
          informados pelo comercial após o envio.
        </p>
      </div>
    );
  }

  const countLabel =
    cart.count === cart.lineCount
      ? `${cart.count} ${cart.count === 1 ? 'item' : 'itens'}`
      : `${cart.lineCount} itens · ${cart.count} unidades`;

  return (
    <section
      aria-labelledby="quote-cart-title"
      className="rounded-[var(--radius-card)] border border-neutral-200 bg-surface p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold text-neutral-900" id="quote-cart-title">
          Itens no orçamento ({countLabel})
        </h2>
        <button
          className="text-sm font-medium text-primary hover:underline"
          onClick={() =>{  cart.clearCart(); }}
          type="button"
        >
          Limpar lista
        </button>
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        Ajuste a quantidade de cada item. Envie o formulário abaixo para receber proposta com
        valores e prazo.
      </p>
      <ul className="mt-4 divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        {cart.items.map((item) => (
          <li
            className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            key={item.slug}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900">{item.name}</p>
              <p className="text-xs text-neutral-500 capitalize">
                {item.kind === 'accessory' ? 'Acessório' : 'Equipamento'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <QuoteCartQuantityStepper
                ariaLabel={`Quantidade de ${item.name}`}
                onChange={(quantity) =>{  cart.setItemQuantity(item.slug, quantity); }}
                size="sm"
                value={item.quantity}
              />
              <button
                className="text-sm font-medium text-red-600 hover:underline"
                onClick={() =>{  cart.removeItem(item.slug); }}
                type="button"
              >
                Remover
              </button>
            </div>
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

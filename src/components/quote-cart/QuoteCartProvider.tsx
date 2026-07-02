'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { captureAddToQuote, captureRemoveFromQuote } from '@/lib/posthog-events';
import { persistAnalyticsEvent } from '@/lib/track-analytics-event';
import { QUOTE_CART_MAX_QUANTITY, QUOTE_CART_MIN_QUANTITY } from '@/types/quote-cart';
import type { QuoteCartItem } from '@/types/quote-cart';

const STORAGE_KEY = 'acesso-quote-cart-v2';

type QuoteCartContextValue = {
  items: QuoteCartItem[];
  addItem: (item: Omit<QuoteCartItem, 'quantity'> & { quantity?: number }) => void;
  setItemQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  hasItem: (slug: string) => boolean;
  getItemQuantity: (slug: string) => number;
  /** Total de unidades (soma das quantidades). */
  count: number;
  /** Quantidade de linhas distintas no carrinho. */
  lineCount: number;
};

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

function clampQuantity(quantity: number) {
  return Math.min(QUOTE_CART_MAX_QUANTITY, Math.max(QUOTE_CART_MIN_QUANTITY, quantity));
}

function normalizeItem(item: QuoteCartItem): QuoteCartItem {
  return {
    slug: item.slug,
    name: item.name,
    kind: item.kind,
    quantity: clampQuantity(item.quantity ?? QUOTE_CART_MIN_QUANTITY),
  };
}

function readStoredItems(): QuoteCartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = window.localStorage.getItem('acesso-quote-cart');
      if (!legacy) {
        return [];
      }
      const parsed = JSON.parse(legacy) as QuoteCartItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item.slug === 'string' &&
            typeof item.name === 'string' &&
            (item.kind === 'equipment' || item.kind === 'accessory'),
        )
        .map((item) => normalizeItem(item));
    }
    const parsed = JSON.parse(raw) as QuoteCartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.slug === 'string' &&
          typeof item.name === 'string' &&
          (item.kind === 'equipment' || item.kind === 'accessory'),
      )
      .map((item) => normalizeItem(item));
  } catch {
    return [];
  }
}

function totalUnits(items: QuoteCartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Carrinho de orçamento persistido no navegador (equipamentos e acessórios).
 */
export function QuoteCartProvider(props: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>([]);

  useEffect(() => {
    setItems(readStoredItems());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value: QuoteCartContextValue = {
    items,
    count: totalUnits(items),
    lineCount: items.length,
    addItem: (item) => {
      const quantity = clampQuantity(item.quantity ?? QUOTE_CART_MIN_QUANTITY);
      setItems((current) => {
        const existing = current.find((entry) => entry.slug === item.slug);
        let next: QuoteCartItem[];
        if (existing) {
          next = current.map((entry) =>
            entry.slug === item.slug
              ? {
                  ...entry,
                  quantity: clampQuantity(entry.quantity + quantity),
                }
              : entry,
          );
        } else {
          next = [...current, { ...item, quantity }];
        }

        const line = next.find((entry) => entry.slug === item.slug);
        if (line) {
          captureAddToQuote({
            slug: line.slug,
            name: line.name,
            kind: line.kind,
            quantity: line.quantity,
            cartLineCount: next.length,
            cartTotalUnits: totalUnits(next),
          });
          persistAnalyticsEvent({
            eventType: 'add_to_quote',
            origin: 'add_to_quote',
            equipmentSlug: line.slug,
            equipmentName: line.name,
          });
        }

        return next;
      });
    },
    setItemQuantity: (slug, quantity) => {
      const next = clampQuantity(quantity);
      setItems((current) => {
        if (next < QUOTE_CART_MIN_QUANTITY) {
          const removed = current.find((entry) => entry.slug === slug);
          if (removed) {
            captureRemoveFromQuote({
              slug: removed.slug,
              name: removed.name,
              kind: removed.kind,
            });
            persistAnalyticsEvent({
              eventType: 'remove_from_quote',
              origin: 'remove_from_quote',
              equipmentSlug: removed.slug,
              equipmentName: removed.name,
            });
          }
          return current.filter((entry) => entry.slug !== slug);
        }
        return current.map((entry) => (entry.slug === slug ? { ...entry, quantity: next } : entry));
      });
    },
    removeItem: (slug) => {
      setItems((current) => {
        const removed = current.find((entry) => entry.slug === slug);
        if (removed) {
          captureRemoveFromQuote({
            slug: removed.slug,
            name: removed.name,
            kind: removed.kind,
          });
          persistAnalyticsEvent({
            eventType: 'remove_from_quote',
            origin: 'remove_from_quote',
            equipmentSlug: removed.slug,
            equipmentName: removed.name,
          });
        }
        return current.filter((entry) => entry.slug !== slug);
      });
    },
    clearCart: () => {
      setItems([]);
    },
    hasItem: (slug) => items.some((entry) => entry.slug === slug),
    getItemQuantity: (slug) => items.find((entry) => entry.slug === slug)?.quantity ?? 0,
  };

  return <QuoteCartContext.Provider value={value}>{props.children}</QuoteCartContext.Provider>;
}

/**
 * Acesso ao carrinho de orçamento.
 */
export function useQuoteCart() {
  const context = useContext(QuoteCartContext);
  if (!context) {
    throw new Error('useQuoteCart must be used within QuoteCartProvider');
  }
  return context;
}

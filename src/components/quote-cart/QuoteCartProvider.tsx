'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { QuoteCartItem } from '@/types/quote-cart';

const STORAGE_KEY = 'acesso-quote-cart';

type QuoteCartContextValue = {
  items: QuoteCartItem[];
  addItem: (item: QuoteCartItem) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  hasItem: (slug: string) => boolean;
  count: number;
};

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

function readStoredItems(): QuoteCartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as QuoteCartItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item) =>
        item &&
        typeof item.slug === 'string' &&
        typeof item.name === 'string' &&
        (item.kind === 'equipment' || item.kind === 'accessory'),
    );
  } catch {
    return [];
  }
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
    count: items.length,
    addItem: (item) => {
      setItems((current) => {
        if (current.some((entry) => entry.slug === item.slug)) {
          return current;
        }
        return [...current, item];
      });
    },
    removeItem: (slug) => {
      setItems((current) => current.filter((entry) => entry.slug !== slug));
    },
    clearCart: () => {
      setItems([]);
    },
    hasItem: (slug) => items.some((entry) => entry.slug === slug),
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

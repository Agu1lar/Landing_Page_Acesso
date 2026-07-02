'use client';

import { useEffect } from 'react';
import { useAnalyticsConsent } from '@/components/analytics/AnalyticsConsentContext';
import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';
import { persistAnalyticsEvent } from '@/lib/track-analytics-event';

const SUBMIT_FLAG_KEY = 'acesso-quote-submitted';

/**
 * Marks that a quote form was submitted in this browser session.
 */
export function markQuoteSubmitted() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(SUBMIT_FLAG_KEY, '1');
}

/**
 * Fires quote_abandon when the visitor leaves with items in the cart and no submit.
 */
export function QuoteAbandonTracker() {
  const cart = useQuoteCart();
  const { status } = useAnalyticsConsent();

  useEffect(() => {
    if (status !== 'analytics') {
      return;
    }

    const handlePageHide = () => {
      if (cart.lineCount === 0) {
        return;
      }

      if (window.sessionStorage.getItem(SUBMIT_FLAG_KEY) === '1') {
        return;
      }

      persistAnalyticsEvent({
        eventType: 'quote_abandon',
        origin: 'quote_abandon',
        equipmentName: `${cart.lineCount} itens`,
        pathname: window.location.pathname,
      });
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [cart.lineCount, status]);

  return null;
}

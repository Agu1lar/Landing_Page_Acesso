'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAnalyticsConsent } from '@/components/analytics/AnalyticsConsentContext';
import { BusinessHoursBadge } from '@/components/marketing/BusinessHoursBadge';
import { useMobileDockConfig } from '@/components/marketing/mobile-dock-config';
import { useQuoteCart } from '@/components/quote-cart/QuoteCartProvider';
import { Button } from '@/components/ui/Button';
import { brand, buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import { usesMobileConversionDock } from '@/lib/mobile-conversion-dock';
import { trackPhoneClick } from '@/lib/track-phone-click';
import { Link } from '@/libs/I18nNavigation';

function isOrcamentoPath(pathname: string) {
  return pathname.includes('/orcamento');
}

function PhoneIcon() {
  return (
    <svg aria-hidden className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M3 5a2 2 0 012-2h2.28a1 1 0 01.948.684l1.12 3.358a1 1 0 01-.502 1.21l-1.546.773a11.042 11.042 0 005.516 5.516l.773-1.546a1 1 0 011.21-.502l3.358 1.12a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

/**
 * Unified mobile bottom bar: hours, quote cart, phone, WhatsApp.
 * Hidden while cookie consent is pending and on the orçamento page.
 */
export function MarketingMobileBottomBar() {
  const pathname = usePathname();
  const consent = useAnalyticsConsent();
  const cart = useQuoteCart();
  const { config } = useMobileDockConfig();
  const t = useTranslations('QuoteCart');
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  const dockRoute = usesMobileConversionDock(pathname);
  const hasCart = cart.count > 0;
  const phoneHref = `tel:+${brand.phone}`;
  const phoneOrigin = config?.whatsappOrigin?.replace(/-sticky$/, '-ligar') ?? 'site-mobile-ligar';

  useEffect(() => {
    if (!dockRoute || !config?.sentinelId) {
      setScrolledPastHero(false);
      return;
    }

    const sentinel = document.getElementById(config.sentinelId);
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setScrolledPastHero(!entry.isIntersecting);
        }
      },
      { rootMargin: '0px', threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dockRoute, config?.sentinelId]);

  if (consent.status === 'pending' || !pathname || isOrcamentoPath(pathname)) {
    return null;
  }

  const showDock = dockRoute && config && scrolledPastHero;
  const visible = hasCart || showDock;

  if (!visible) {
    return null;
  }

  const whatsappHref =
    config?.whatsappHref ??
    buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-carrinho-mobile' }));
  const whatsappLabel = config?.whatsappLabel ?? t('mobile_whatsapp');
  const whatsappOrigin = config?.whatsappOrigin ?? 'site-carrinho-mobile';
  const quoteLabel = config?.quoteLabel ?? t('mobile_quote');
  const quoteHref = config?.quoteHref ?? '/orcamento';

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-surface/95 px-3 pt-2 pb-3 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto max-w-lg space-y-2">
        <BusinessHoursBadge />

        <div className="flex gap-2">
          <a
            aria-label={t('mobile_call')}
            className="inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-800 shadow-sm transition-colors hover:border-primary hover:text-primary"
            href={phoneHref}
            onClick={() => trackPhoneClick({ origin: phoneOrigin })}
          >
            <PhoneIcon />
          </a>

          {hasCart ? (
            <Link
              className="inline-flex min-h-11 flex-[1.2] items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
              href="/orcamento"
            >
              {t('mobile_finish', { count: cart.count })}
            </Link>
          ) : (
            <Button
              className="min-h-11 flex-[1.2] px-2"
              equipmentName={config?.equipmentName}
              equipmentSlug={config?.equipmentSlug}
              href={quoteHref}
              size="md"
              variant="outline"
            >
              {quoteLabel}
            </Button>
          )}

          <Button
            className="min-h-11 min-w-0 flex-1 px-2"
            equipmentName={config?.equipmentName}
            equipmentSlug={config?.equipmentSlug}
            href={whatsappHref}
            size="md"
            variant="whatsapp"
            whatsappOrigin={whatsappOrigin}
          >
            {whatsappLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

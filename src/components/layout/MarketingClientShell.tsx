'use client';

import { QuoteCartProvider } from '@/components/quote-cart/QuoteCartProvider';
import type { SearchIndexItem } from '@/components/marketing/GlobalSearch';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

type MarketingClientShellProps = {
  children: React.ReactNode;
  searchIndex: SearchIndexItem[];
};

/**
 * Client shell with quote cart context for marketing pages.
 */
export function MarketingClientShell(props: MarketingClientShellProps) {
  return (
    <QuoteCartProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader searchIndex={props.searchIndex} />
        <main className="flex-1">{props.children}</main>
        <SiteFooter />
        <WhatsAppButton />
      </div>
    </QuoteCartProvider>
  );
}

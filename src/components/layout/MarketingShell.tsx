import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { QuoteCartProvider } from '@/components/quote-cart/QuoteCartProvider';
import { getSearchIndex } from '@/lib/equipment';

type MarketingShellProps = {
  children: React.ReactNode;
};

export async function MarketingShell(props: MarketingShellProps) {
  const searchIndex = getSearchIndex();

  return (
    <div className="flex min-h-screen flex-col">
      <QuoteCartProvider>
        <SiteHeader searchIndex={searchIndex} />
        <main className="flex-1">{props.children}</main>
      </QuoteCartProvider>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

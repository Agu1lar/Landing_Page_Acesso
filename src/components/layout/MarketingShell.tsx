import { AnalyticsConsentProvider } from '@/components/analytics/AnalyticsConsentProvider';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { SkipToMainLink } from '@/components/ui/SkipToMainLink';
import { AttributionCapture } from '@/components/marketing/AttributionCapture';
import { QuoteCartProvider } from '@/components/quote-cart/QuoteCartProvider';
import { getSearchIndex } from '@/lib/equipment';

type MarketingShellProps = {
  children: React.ReactNode;
};

export async function MarketingShell(props: MarketingShellProps) {
  const searchIndex = await getSearchIndex();

  return (
    <AnalyticsConsentProvider>
      <div className="flex min-h-screen flex-col">
        <SkipToMainLink />
        <AttributionCapture />
        <QuoteCartProvider>
          <SiteHeader searchIndex={searchIndex} />
          <main className="flex-1" id="main-content">
            {props.children}
          </main>
        </QuoteCartProvider>
        <SiteFooter />
        <WhatsAppButton />
      </div>
    </AnalyticsConsentProvider>
  );
}

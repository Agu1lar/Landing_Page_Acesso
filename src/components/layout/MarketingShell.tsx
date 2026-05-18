import { getSearchIndex } from '@/lib/equipment';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { WhatsAppButton } from './WhatsAppButton';

type MarketingShellProps = {
  children: React.ReactNode;
};

export async function MarketingShell({ children }: MarketingShellProps) {
  const searchIndex = getSearchIndex();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader searchIndex={searchIndex} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

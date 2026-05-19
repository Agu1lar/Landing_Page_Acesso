import { MarketingClientShell } from '@/components/layout/MarketingClientShell';
import { getSearchIndex } from '@/lib/equipment';

type MarketingShellProps = {
  children: React.ReactNode;
};

export async function MarketingShell(props: MarketingShellProps) {
  const searchIndex = getSearchIndex();

  return <MarketingClientShell searchIndex={searchIndex}>{props.children}</MarketingClientShell>;
}

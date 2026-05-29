import { setRequestLocale } from 'next-intl/server';
import { MarketingShell } from '@/components/layout/MarketingShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMarketingGraphJsonLd } from '@/lib/json-ld';
import { routing } from '@/libs/I18nRouting';
import { resolveAppLocale } from '@/utils/locale';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = resolveAppLocale((await props.params)?.locale ?? routing.defaultLocale);
  setRequestLocale(locale);

  return (
    <>
      <JsonLd data={buildMarketingGraphJsonLd()} />
      <MarketingShell>{props.children}</MarketingShell>
    </>
  );
}

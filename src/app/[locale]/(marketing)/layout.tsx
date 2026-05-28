import { setRequestLocale } from 'next-intl/server';
import Script from 'next/script';
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

  const widgetApiUrl = process.env.NEXT_PUBLIC_WHATSAPPOS_API_URL?.trim().replace(/\/$/, '');
  const widgetKey = process.env.NEXT_PUBLIC_WHATSAPPOS_WIDGET_KEY?.trim();

  return (
    <>
      <JsonLd data={buildMarketingGraphJsonLd()} />
      {widgetApiUrl && widgetKey ? (
        <Script
          async
          src={`${widgetApiUrl}/widgets/${widgetKey}.js`}
          strategy="afterInteractive"
        />
      ) : null}
      <MarketingShell>{props.children}</MarketingShell>
    </>
  );
}

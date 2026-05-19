import { setRequestLocale } from 'next-intl/server';
import { MarketingShell } from '@/components/layout/MarketingShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildLocalBusinessJsonLd } from '@/lib/json-ld';
import { resolveAppLocale } from '@/utils/locale';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  return (
    <>
      <JsonLd data={buildLocalBusinessJsonLd()} />
      <MarketingShell>{props.children}</MarketingShell>
    </>
  );
}

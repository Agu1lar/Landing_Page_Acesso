import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { FAQ_ITEMS } from '@/data/faq';
import { brand, buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type FaqPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: FaqPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'Faq',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function FaqPage(props: FaqPageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'Faq',
  });

  const whatsappHref = buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-faq' }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-900">{t('title')}</h1>
      <p className="mt-4 text-neutral-600">{t('intro')}</p>

      <div className="mt-10">
        <FaqAccordion items={FAQ_ITEMS} />
      </div>

      <aside className="mt-12 rounded-[var(--radius-card)] border border-neutral-200 bg-background-muted p-6">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('cta_title')}</h2>
        <p className="mt-2 text-sm text-neutral-600">{t('cta_text')}</p>
        <ConversionCtas
          className="mt-4"
          quoteLabel={t('cta_quote')}
          whatsappHref={whatsappHref}
          whatsappLabel={t('cta_whatsapp')}
        />
        <p className="mt-4 text-xs text-neutral-500">
          {brand.hours} · {brand.phoneDisplay}
        </p>
      </aside>

      <p className="mt-8 text-center text-sm text-neutral-600">
        <Link className="font-semibold text-primary hover:underline" href="/contato">
          {t('contact_link')}
        </Link>
      </p>
    </div>
  );
}

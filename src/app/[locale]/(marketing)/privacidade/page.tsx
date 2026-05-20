import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { brand } from '@/lib/brand';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type PrivacidadePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PrivacidadePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'PrivacidadePage',
  });

  return buildMarketingMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    path: '/privacidade',
  });
}

export default async function PrivacidadePage(props: PrivacidadePageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'PrivacidadePage',
  });

  const sections = ['controller', 'data', 'purpose', 'sharing', 'rights', 'contact'] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-900">{t('title')}</h1>
      <p className="mt-4 text-sm text-neutral-500">{t('updated_at')}</p>
      <p className="mt-6 leading-relaxed text-neutral-700">{t('intro')}</p>

      <div className="mt-10 space-y-8">
        {sections.map((key) => (
          <section key={key}>
            <h2 className="font-heading text-xl font-semibold text-neutral-900">
              {t(`sections.${key}.title`)}
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-700">{t(`sections.${key}.body`)}</p>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-neutral-600">
        {t('contact_line')}{' '}
        <a className="font-medium text-primary hover:underline" href={`mailto:${brand.email}`}>
          {brand.email}
        </a>
        . {t('orcamento_link_prefix')}{' '}
        <Link className="font-medium text-primary hover:underline" href="/orcamento">
          {t('orcamento_link')}
        </Link>
        .
      </p>
    </div>
  );
}

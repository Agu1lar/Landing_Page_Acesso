import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { DICAS_ARTICLES } from '@/data/dicas-articles';
import { buildDicasIndexJsonLd } from '@/lib/json-ld';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type DicasPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DicasPageProps): Promise<Metadata> {
  const locale = resolveAppLocale((await props.params)?.locale);
  const t = await getTranslations({
    locale,
    namespace: 'DicasPage',
  });
  return buildMarketingMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    path: '/dicas',
  });
}

export default async function DicasPage(props: DicasPageProps) {
  const locale = resolveAppLocale((await props.params)?.locale);
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DicasPage',
  });

  return (
    <>
      <JsonLd data={buildDicasIndexJsonLd(DICAS_ARTICLES)} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-900">{t('title')}</h1>
        <p className="mt-4 text-lg text-neutral-600">{t('intro')}</p>

        <ul className="mt-10 space-y-6">
          {DICAS_ARTICLES.map((article) => (
            <li
              className="rounded-[var(--radius-card)] border border-neutral-200 bg-surface p-6 shadow-sm"
              key={article.slug}
            >
              <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
                {t('reading_time', { minutes: article.readingMinutes })}
              </p>
              <h2 className="mt-2 font-heading text-xl font-bold text-neutral-900">
                <Link className="hover:text-primary" href={`/dicas/${article.slug}`}>
                  {article.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">{article.excerpt}</p>
              <Link
                className="mt-4 inline-block text-sm font-semibold text-primary hover:underline"
                href={`/dicas/${article.slug}`}
              >
                {t('read_more')}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

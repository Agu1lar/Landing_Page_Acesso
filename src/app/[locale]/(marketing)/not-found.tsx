import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/libs/I18nNavigation';
import { ALL_EQUIPMENT_CATEGORIES } from '@/lib/categories-seo';
import { CATEGORY_LABELS } from '@/types/equipment';
import { resolveAppLocale } from '@/utils/locale';

type NotFoundPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MarketingNotFoundPage(props: NotFoundPageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'NotFoundPage',
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">{t('eyebrow')}</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-4 text-neutral-600">{t('description')}</p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
          href="/"
        >
          {t('home_cta')}
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-800 hover:border-primary hover:text-primary"
          href="/equipamentos"
        >
          {t('catalog_cta')}
        </Link>
      </div>

      <section className="mt-12 text-left">
        <h2 className="font-heading text-lg font-semibold text-neutral-900">{t('categories_title')}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ALL_EQUIPMENT_CATEGORIES.map((category) => (
            <li key={category}>
              <Link
                className="block rounded-md border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-800 hover:border-primary hover:text-primary"
                href={`/categorias/${category}`}
              >
                {CATEGORY_LABELS[category]}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

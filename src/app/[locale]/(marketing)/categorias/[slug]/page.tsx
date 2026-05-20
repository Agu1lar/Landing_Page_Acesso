import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { EquipmentCard } from '@/components/marketing/EquipmentCard';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import {
  ALL_EQUIPMENT_CATEGORIES,
  getCategorySeo,
  isEquipmentCategory,
} from '@/lib/categories-seo';
import { getEquipmentByCategory } from '@/lib/equipment';
import { buildCategoryPageJsonLd } from '@/lib/json-ld';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { Link } from '@/libs/I18nNavigation';
import { CATEGORY_LABELS } from '@/types/equipment';
import { resolveAppLocale } from '@/utils/locale';

type CategoryPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return ALL_EQUIPMENT_CATEGORIES.map((slug) => ({ slug }));
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  if (!isEquipmentCategory(slug)) {
    return { title: 'Categoria' };
  }
  const seo = getCategorySeo(slug);
  return buildMarketingMetadata({
    title: seo.metaTitle,
    description: seo.metaDescription,
    path: `/categorias/${slug}`,
  });
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  if (!isEquipmentCategory(slug)) {
    notFound();
  }

  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'Categoria',
  });
  const seo = getCategorySeo(slug);
  const equipment = getEquipmentByCategory(slug);
  const whatsappHref = buildWhatsAppUrl(
    buildWhatsAppMessage({
      equipmentName: CATEGORY_LABELS[slug],
      equipmentSlug: slug,
      origin: 'site-categoria',
    }),
  );

  return (
    <>
      <JsonLd data={buildCategoryPageJsonLd({ slug, seo, equipment })} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link className="hover:text-primary" href="/">
              {t('breadcrumb_home')}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link className="hover:text-primary" href="/equipamentos">
              {t('breadcrumb_equipment')}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-neutral-900">{CATEGORY_LABELS[slug]}</li>
        </ol>
      </nav>

      <header className="mt-6 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          {seo.h1}
        </h1>
        <p className="mt-4 text-lg text-neutral-600">{seo.metaDescription}</p>
      </header>

      <article className="prose-category mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-neutral-700">
        {seo.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </article>

      <section
        aria-labelledby="category-catalog-title"
        className="mt-14 border-t border-neutral-200 pt-12"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="font-heading text-2xl font-bold text-neutral-900"
              id="category-catalog-title"
            >
              {t('catalog_title', { category: CATEGORY_LABELS[slug] })}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {t('results_count', { count: equipment.length })}
            </p>
          </div>
          <ConversionCtas
            equipmentName={CATEGORY_LABELS[slug]}
            equipmentSlug={slug}
            quoteLabel={t('cta_quote')}
            size="sm"
            whatsappHref={whatsappHref}
            whatsappLabel={t('cta_whatsapp')}
            whatsappOrigin="site-categoria"
          />
        </div>

        {equipment.length === 0 ? (
          <p className="mt-10 text-center text-neutral-600">{t('empty')}</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {equipment.map((item) => (
              <EquipmentCard equipment={item} key={item.slug} />
            ))}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-neutral-600">
          <Link className="font-semibold text-primary hover:underline" href="/equipamentos">
            {t('view_all_catalog')}
          </Link>
        </p>
      </section>
    </div>
    </>
  );
}

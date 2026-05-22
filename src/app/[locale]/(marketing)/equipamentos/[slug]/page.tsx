import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { EquipmentViewTracker } from '@/components/analytics/EquipmentViewTracker';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { EquipmentCard } from '@/components/marketing/EquipmentCard';
import { EquipmentPhoto } from '@/components/marketing/EquipmentPhoto';
import { SpecTable } from '@/components/marketing/SpecTable';
import { AddToQuoteButton } from '@/components/quote-cart/AddToQuoteButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildEquipmentWhatsAppUrl, equipmentSeoTitle } from '@/lib/brand';
import {
  getAllSlugs,
  getEquipmentBySlug,
  getEquipmentQuoteCartKind,
  getRelatedEquipment,
} from '@/lib/equipment';
import { getEquipmentSeoExtra } from '@/lib/equipment-seo-extra';
import { buildEquipmentPageJsonLd } from '@/lib/json-ld';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { Link } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';
import { CATEGORY_LABELS } from '@/types/equipment';
import { resolveAppLocale } from '@/utils/locale';

type EquipmentDetailProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata(props: EquipmentDetailProps): Promise<Metadata> {
  const slug = (await props.params)?.slug;
  if (!slug) {
    return { title: 'Equipamento' };
  }
  const equipment = await getEquipmentBySlug(slug);
  if (!equipment) {
    return { title: 'Equipamento' };
  }
  return buildMarketingMetadata({
    title: equipmentSeoTitle(equipment.name),
    description: equipment.shortDescription,
    path: `/equipamentos/${equipment.slug}`,
    ogPath: `/equipamentos/${equipment.slug}/opengraph-image`,
  });
}

export default async function EquipmentDetailPage(props: EquipmentDetailProps) {
  const params = await props.params;
  const locale = resolveAppLocale(params?.locale ?? routing.defaultLocale);
  const slug = params?.slug;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'EquipamentoDetail',
  });

  if (!slug) {
    notFound();
  }
  const equipment = await getEquipmentBySlug(slug);

  if (!equipment) {
    notFound();
  }

  const whatsappHref = buildEquipmentWhatsAppUrl(equipment);
  const related = await getRelatedEquipment(slug);
  const seoExtra = getEquipmentSeoExtra(equipment);

  return (
    <>
      <EquipmentViewTracker name={equipment.name} slug={equipment.slug} />
      <JsonLd data={buildEquipmentPageJsonLd(equipment)} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link className="text-sm font-medium text-primary hover:underline" href="/equipamentos">
          ← {t('back')}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <EquipmentPhoto name={equipment.name} slug={equipment.slug} variant="detail" />

          <div>
            <Link
              className="text-sm font-semibold tracking-wide text-primary uppercase hover:underline"
              href={`/categorias/${equipment.category}`}
            >
              {CATEGORY_LABELS[equipment.category]}
            </Link>
            <h1 className="mt-2 font-heading text-3xl font-bold text-neutral-900">
              {equipment.name}
            </h1>
            <p className="mt-4 text-neutral-600">{equipment.shortDescription}</p>

            {equipment.longDescription ? (
              <section className="mt-6">
                <h2 className="font-heading text-lg font-semibold text-neutral-900">
                  {t('technical_description_title')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {equipment.longDescription}
                </p>
              </section>
            ) : null}

            {seoExtra ? (
              <section className="mt-8 max-w-prose">
                <h2 className="font-heading text-lg font-semibold text-neutral-900">
                  {seoExtra.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600">
                  {seoExtra.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="mt-8">
              <SpecTable
                specs={equipment.specs}
                title={t('specs_title')}
                variant={equipment.category === 'equipamentos-aereos' ? 'aerial' : 'default'}
              />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <AddToQuoteButton
                item={{
                  slug: equipment.slug,
                  name: equipment.name,
                  kind: getEquipmentQuoteCartKind(equipment),
                }}
                size="md"
              />
              <ConversionCtas
                equipmentName={equipment.name}
                equipmentSlug={equipment.slug}
                quoteHref="/orcamento"
                quoteLabel="Ver orçamento"
                whatsappHref={whatsappHref}
                whatsappLabel={t('cta_whatsapp')}
                whatsappOrigin="site-detalhe"
              />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-neutral-200 pt-12">
            <h2 className="font-heading text-2xl font-bold text-neutral-900">
              {t('related_title')}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <EquipmentCard equipment={item} key={item.slug} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

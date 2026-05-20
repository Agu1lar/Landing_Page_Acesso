import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { EquipmentCatalog } from '@/components/marketing/EquipmentCatalog';
import { getAllEquipment } from '@/lib/equipment';
import { buildEquipmentCatalogJsonLd } from '@/lib/json-ld';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { resolveAppLocale } from '@/utils/locale';

type EquipamentosPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; categoria?: string }>;
};

export async function generateMetadata(props: EquipamentosPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'Equipamentos',
  });
  return buildMarketingMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    path: '/equipamentos',
  });
}

export default async function EquipamentosPage(props: EquipamentosPageProps) {
  const { locale } = await props.params;
  const { q, categoria } = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'Equipamentos',
  });
  const equipment = getAllEquipment();

  return (
    <>
      <JsonLd data={buildEquipmentCatalogJsonLd(equipment)} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-900">{t('title')}</h1>
      <EquipmentCatalog
        equipment={equipment}
        initialCategory={categoria ?? ''}
        initialQuery={q ?? ''}
      />
    </div>
    </>
  );
}

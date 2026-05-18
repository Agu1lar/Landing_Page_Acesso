import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { EquipmentCard } from '@/components/marketing/EquipmentCard';
import { SpecTable } from '@/components/marketing/SpecTable';
import { buildEquipmentWhatsAppUrl, equipmentSeoTitle } from '@/lib/brand';
import { getAllSlugs, getEquipmentBySlug, getRelatedEquipment } from '@/lib/equipment';
import { Link } from '@/libs/I18nNavigation';
import { CATEGORY_LABELS } from '@/types/equipment';
import { resolveAppLocale } from '@/utils/locale';

type EquipmentDetailProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: EquipmentDetailProps): Promise<Metadata> {
  const { slug } = await props.params;
  const equipment = getEquipmentBySlug(slug);
  if (!equipment) {
    return { title: 'Equipamento' };
  }
  return {
    title: equipmentSeoTitle(equipment.name),
    description: equipment.shortDescription,
  };
}

export default async function EquipmentDetailPage(props: EquipmentDetailProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'EquipamentoDetail',
  });
  const equipment = getEquipmentBySlug(slug);

  if (!equipment) {
    notFound();
  }

  const whatsappHref = buildEquipmentWhatsAppUrl(equipment);
  const showSpecs = equipment.specs.length > 0 || equipment.category === 'equipamentos-aereos';
  const related = getRelatedEquipment(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link className="text-sm font-medium text-primary hover:underline" href="/equipamentos">
        ← {t('back')}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 text-neutral-400">
          <span className="text-sm">Imagem em breve</span>
        </div>

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
          <p className="mt-2 text-sm font-medium text-neutral-500">Valores sob consulta</p>

          {showSpecs && (
            <div className="mt-8">
              <SpecTable
                specs={equipment.specs}
                title={t('specs_title')}
                variant={equipment.category === 'equipamentos-aereos' ? 'aerial' : 'default'}
              />
            </div>
          )}

          <ConversionCtas
            className="mt-8"
            quoteHref={`/orcamento?equipamento=${equipment.slug}`}
            quoteLabel={t('cta_quote')}
            whatsappHref={whatsappHref}
            whatsappLabel={t('cta_whatsapp')}
          />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-12">
          <h2 className="font-heading text-2xl font-bold text-neutral-900">{t('related_title')}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <EquipmentCard equipment={item} key={item.slug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

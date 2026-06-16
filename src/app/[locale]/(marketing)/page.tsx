import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { EquipmentCard } from '@/components/marketing/EquipmentCard';
import { SetMobileDockConfig } from '@/components/marketing/mobile-dock-config';
import { PrimaryLinesSection } from '@/components/marketing/PrimaryLinesSection';
import { ServiceAreaSection } from '@/components/marketing/ServiceAreaSection';
import { StepsSection } from '@/components/marketing/StepsSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import { getManifestImageSrc } from '@/lib/equipment-images-manifest';
import { countEquipmentInCategory, getEquipmentBySlug, getFeaturedEquipment } from '@/lib/equipment';
import { getResolvedEquipmentImageMap } from '@/lib/equipment-images-server';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { Link } from '@/libs/I18nNavigation';
import { CATEGORY_LABELS } from '@/types/equipment';
import type { EquipmentCategory } from '@/types/equipment';
import { resolveAppLocale } from '@/utils/locale';

const categories: EquipmentCategory[] = [
  'equipamentos-aereos',
  'guindastes-remocoes',
  'concretagem',
  'andaimes-acesso',
  'ferramentas-eletricas',
  'demolicao-perfuracao',
  'compactacao',
  'energia',
];

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IndexPageProps): Promise<Metadata> {
  const locale = resolveAppLocale((await props.params)?.locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });
  return buildMarketingMetadata({
    title: t('meta_title'),
    description: t('meta_description'),
    path: '/',
  });
}

export default async function HomePage(props: IndexPageProps) {
  const locale = resolveAppLocale((await props.params)?.locale);
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });
  const tLayout = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });
  const tServiceArea = await getTranslations({
    locale,
    namespace: 'ServiceArea',
  });
  const featured = await getFeaturedEquipment(6);
  const imageBySlug = await getResolvedEquipmentImageMap();
  const aerialCount = await countEquipmentInCategory('equipamentos-aereos');
  const guindaste = await getEquipmentBySlug('guindaste-industrial-munck-remocao-bh');
  const whatsappHome = buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-home' }));

  const primaryLineCards = [
    {
      badge: t('primary_aerial_badge', { count: aerialCount }),
      title: t('primary_aerial_title'),
      description: t('primary_aerial_description'),
      href: '/categorias/equipamentos-aereos',
      cta: t('primary_aerial_cta'),
      imageSrc: getManifestImageSrc('plataforma-elevatoria-hb-1430'),
      imageAlt: 'Plataforma elevatória para locação em BH',
    },
    {
      badge: t('primary_crane_badge'),
      title: t('primary_crane_title'),
      description: t('primary_crane_description'),
      href: guindaste
        ? `/equipamentos/${guindaste.slug}`
        : '/categorias/guindastes-remocoes',
      cta: t('primary_crane_cta'),
      imageSrc: guindaste ? getManifestImageSrc(guindaste.slug) : undefined,
      imageAlt: guindaste?.name,
    },
  ];

  return (
    <>
      <section className="border-b border-neutral-200 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-heading text-2xl leading-snug font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl">
              {t('hero_title')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:mt-6 sm:text-lg">
              {t('hero_subtitle')}
            </p>
            <ConversionCtas
              className="mt-6 justify-center sm:mt-8"
              quoteLabel={t('hero_cta_quote')}
              size="lg"
              whatsappHref={whatsappHome}
              whatsappLabel={t('hero_cta_whatsapp')}
              whatsappOrigin="site-home"
            />
            <div aria-hidden className="h-0" id="page-hero-sentinel" />
          </div>
        </div>
      </section>

      <ServiceAreaSection
        eyebrow={tServiceArea('eyebrow')}
        primaryLabel={tServiceArea('primary_label')}
        title={tServiceArea('title')}
      />

      <PrimaryLinesSection
        cards={primaryLineCards}
        subtitle={t('primary_lines_subtitle')}
        title={t('primary_lines_title')}
      />

      <section className="cv-auto mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold text-neutral-900">
          {t('categories_title')}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => (
            <Link
              className="rounded-[var(--radius-card)] border border-neutral-200 bg-surface p-5 transition-all hover:border-primary hover:shadow-md"
              href={`/categorias/${cat}`}
              key={cat}
            >
              <span className="font-heading font-semibold text-neutral-900">
                {CATEGORY_LABELS[cat]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="cv-auto bg-neutral-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-heading text-2xl font-bold text-neutral-900">
              {t('featured_title')}
            </h2>
            <Link
              className="text-sm font-semibold text-primary hover:underline"
              href="/equipamentos"
            >
              Ver todos →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((equipment, index) => (
              <EquipmentCard
                equipment={equipment}
                imagePriority={index < 2}
                imageSrc={imageBySlug[equipment.slug]}
                key={equipment.slug}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-primary/20 bg-primary-light">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">
              Capacitação
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-neutral-900">
              {t('training_title')}
            </h2>
            <p className="mt-3 leading-relaxed text-neutral-700">{t('training_description')}</p>
          </div>
          <Link
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
            href="/treinamento-plataformas-aereas"
          >
            {t('training_cta')} →
          </Link>
        </div>
      </section>

      <StepsSection
        steps={[
          {
            number: t('step1_number'),
            title: t('step1_title'),
            description: t('step1_description'),
          },
          {
            number: t('step2_number'),
            title: t('step2_title'),
            description: t('step2_description'),
          },
          {
            number: t('step3_number'),
            title: t('step3_title'),
            description: t('step3_description'),
          },
        ]}
        subtitle={t('steps_subtitle')}
        title={t('steps_title')}
      />

      <TestimonialsSection
        subtitle={t('testimonials_subtitle')}
        title={t('testimonials_title')}
        viewAllLabel={t('testimonials_view_all')}
      />

      <section className="cv-auto mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-neutral-900">
          {t('trust_title')}
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[t('trust_founded'), t('trust_team'), t('trust_delivery'), t('trust_compliance')].map(
            (item) => (
              <li
                className="rounded-[var(--radius-card)] border border-neutral-200 bg-surface p-6 text-center text-sm font-medium text-neutral-700"
                key={item}
              >
                {item}
              </li>
            ),
          )}
        </ul>
      </section>

      <section className="bg-neutral-900 px-4 py-16 text-center sm:px-6">
        <h2 className="font-heading text-2xl font-bold text-white">{t('cta_final_title')}</h2>
        <p className="mx-auto mt-3 max-w-lg text-neutral-400">{t('cta_final_subtitle')}</p>
        <ConversionCtas
          className="mt-8 justify-center"
          onDark
          quoteLabel={t('hero_cta_quote')}
          size="lg"
          whatsappHref={whatsappHome}
          whatsappLabel={t('hero_cta_whatsapp')}
          whatsappOrigin="site-home"
        />
      </section>

      <SetMobileDockConfig
        quoteLabel={t('hero_cta_quote')}
        sentinelId="page-hero-sentinel"
        whatsappHref={whatsappHome}
        whatsappLabel={tLayout('whatsapp_link')}
        whatsappOrigin="site-home-sticky"
      />
    </>
  );
}

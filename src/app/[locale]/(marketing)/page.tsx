import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { EquipmentCard } from '@/components/marketing/EquipmentCard';
import { StepsSection } from '@/components/marketing/StepsSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import { getFeaturedEquipment } from '@/lib/equipment';
import { Link } from '@/libs/I18nNavigation';
import { CATEGORY_LABELS } from '@/types/equipment';
import type { EquipmentCategory } from '@/types/equipment';
import { resolveAppLocale } from '@/utils/locale';

const categories: EquipmentCategory[] = [
  'equipamentos-aereos',
  'concretagem',
  'andaimes-acesso',
  'ferramentas-eletricas',
  'acessorios',
  'demolicao-perfuracao',
  'compactacao',
  'energia',
];

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'Index',
  });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function HomePage(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'Index',
  });
  const featured = getFeaturedEquipment(6);
  const whatsappHome = buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-home' }));

  return (
    <>
      <section className="border-b border-neutral-200 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold tracking-wider text-primary uppercase">
              Desde 2013 · Região metropolitana de BH
            </p>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
              {t('hero_title')}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">{t('hero_subtitle')}</p>
            <ConversionCtas
              className="mt-8 justify-center"
              quoteLabel={t('hero_cta_quote')}
              size="lg"
              whatsappHref={whatsappHome}
              whatsappLabel={t('hero_cta_whatsapp')}
              whatsappOrigin="site-home"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

      <section className="bg-neutral-100">
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
            {featured.map((equipment) => (
              <EquipmentCard equipment={equipment} key={equipment.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-primary/20 bg-primary-light">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
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

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
    </>
  );
}

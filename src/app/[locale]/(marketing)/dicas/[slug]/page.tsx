import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAllDicaSlugs, getDicaBySlug } from '@/data/dicas-articles';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import { buildDicaArticleJsonLd } from '@/lib/json-ld';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { Link } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';
import { resolveAppLocale } from '@/utils/locale';

type DicaArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllDicaSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata(props: DicaArticlePageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getDicaBySlug(slug);
  if (!article) {
    return { title: 'Dica' };
  }
  return buildMarketingMetadata({
    title: article.metaTitle,
    description: article.metaDescription,
    path: `/dicas/${article.slug}`,
  });
}

export default async function DicaArticlePage(props: DicaArticlePageProps) {
  const { locale, slug } = await props.params;
  setRequestLocale(resolveAppLocale(locale));
  const article = getDicaBySlug(slug);

  if (!article) {
    notFound();
  }

  const t = await getTranslations({
    locale: resolveAppLocale(locale),
    namespace: 'DicasPage',
  });
  const whatsappHref = buildWhatsAppUrl(
    buildWhatsAppMessage({
      equipmentName: article.title,
      origin: 'site-dica',
    }),
  );

  return (
    <>
      <JsonLd data={buildDicaArticleJsonLd(article)} />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link className="hover:text-primary" href="/">
                {t('breadcrumb_home')}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link className="hover:text-primary" href="/dicas">
                {t('breadcrumb_dicas')}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-neutral-900">{article.title}</li>
          </ol>
        </nav>

        <header className="mt-6">
          <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
            {t('reading_time', { minutes: article.readingMinutes })}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-neutral-900 sm:text-4xl">
            {article.title}
          </h1>
        </header>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-neutral-700">
          {article.sections.map((section, sectionIndex) => (
            <section key={sectionIndex}>
              {section.heading ? (
                <h2 className="font-heading text-xl font-semibold text-neutral-900">
                  {section.heading}
                </h2>
              ) : null}
              <div className={section.heading ? 'mt-3 space-y-4' : 'space-y-4'}>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {article.relatedLinks.length > 0 ? (
          <aside className="mt-10 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6">
            <h2 className="font-heading text-lg font-semibold text-neutral-900">
              {t('related_title')}
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {article.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link className="font-medium text-primary hover:underline" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <div className="mt-10 border-t border-neutral-200 pt-10">
          <ConversionCtas
            equipmentName={article.title}
            quoteLabel={t('cta_quote')}
            size="sm"
            whatsappHref={whatsappHref}
            whatsappLabel={t('cta_whatsapp')}
            whatsappOrigin="site-dica"
          />
        </div>

        <p className="mt-8">
          <Link className="text-sm font-semibold text-primary hover:underline" href="/dicas">
            ← {t('back_to_list')}
          </Link>
        </p>
      </article>
    </>
  );
}

import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { ServiceAreaSection } from '@/components/marketing/ServiceAreaSection';
import { brand, buildWhatsAppMessage, buildWhatsAppUrl, seoTitle } from '@/lib/brand';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { resolveAppLocale } from '@/utils/locale';

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = buildMarketingMetadata({
  title: seoTitle('Contato e orçamento'),
  description: `Telefone, WhatsApp e endereço da ${brand.name} em Belo Horizonte. Atendimento comercial em horário útil para locação de equipamentos na região metropolitana.`,
  path: '/contato',
});

export default async function ContatoPage(props: PageProps) {
  const locale = resolveAppLocale((await props.params)?.locale);
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'ServiceArea',
  });

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-900">Contato</h1>
        <ul className="mt-8 space-y-4 text-neutral-700">
          <li>
            <strong className="text-neutral-900">Telefone:</strong>{' '}
            <a className="text-primary hover:underline" href={`tel:+${brand.phone}`}>
              {brand.phoneDisplay}
            </a>
          </li>
          <li>
            <strong className="text-neutral-900">E-mail:</strong>{' '}
            <a className="text-primary hover:underline" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>
          </li>
          <li>
            <strong className="text-neutral-900">Endereço:</strong> {brand.address.full}
          </li>
          <li>
            <strong className="text-neutral-900">Horário:</strong> {brand.hours}
          </li>
        </ul>
        <ConversionCtas
          className="mt-8"
          quoteLabel="Solicitar orçamento"
          whatsappHref={buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-contato' }))}
          whatsappLabel="Falar no WhatsApp"
          whatsappOrigin="site-contato"
        />
      </div>

      <ServiceAreaSection
        className="border-t-0"
        eyebrow={t('eyebrow')}
        note={t('note')}
        primaryLabel={t('primary_label')}
        subtitle={t('subtitle')}
        title={t('title')}
      />
    </>
  );
}

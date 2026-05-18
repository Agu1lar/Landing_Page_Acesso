import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ConversionCtas } from '@/components/marketing/ConversionCtas';
import { brand, buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/brand';
import { resolveAppLocale } from '@/utils/locale';

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: 'Contato',
  description: `Fale com a ${brand.name} — telefone, WhatsApp e endereço em Belo Horizonte.`,
};

export default async function ContatoPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  return (
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
      />
    </div>
  );
}

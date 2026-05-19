import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { OrcamentoFormSection } from '@/components/forms/OrcamentoFormSection';
import { brand, seoTitle } from '@/lib/brand';
import { getEquipmentBySlug } from '@/lib/equipment';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ equipamento?: string }>;
};

export const metadata: Metadata = {
  title: seoTitle('Solicitar orçamento'),
  description: `Solicite orçamento de locação com a ${brand.name}. Resposta em horário comercial.`,
};

export default async function OrcamentoPage(props: PageProps) {
  const { locale } = await props.params;
  const { equipamento } = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));

  const equipment = equipamento ? getEquipmentBySlug(equipamento) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-900">Solicitar orçamento</h1>
      <p className="mt-4 text-neutral-600">
        Preencha o formulário abaixo. Nossa equipe comercial retorna em horário útil ({brand.hours}
        ). Valores sob consulta, conforme equipamento e período de locação.
      </p>

      {equipamento && !equipment && (
        <p className="mt-4 rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
          Referência do equipamento: <strong>{equipamento}</strong>
        </p>
      )}

      <OrcamentoFormSection
        initialEquipment={
          equipment ? { slug: equipment.slug, name: equipment.name } : undefined
        }
      />

      <p className="mt-8 text-sm text-neutral-600">
        Dúvidas frequentes? Consulte a{' '}
        <Link className="font-semibold text-primary hover:underline" href="/faq">
          página de perguntas frequentes
        </Link>
        .
      </p>
    </div>
  );
}

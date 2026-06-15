import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { OrcamentoFormSection } from '@/components/forms/OrcamentoFormSection';
import { BusinessHoursBadge } from '@/components/marketing/BusinessHoursBadge';
import { brand, seoTitle } from '@/lib/brand';
import { getEquipmentBySlug } from '@/lib/equipment';
import { buildMarketingMetadata } from '@/lib/seo-metadata';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ equipamento?: string }>;
};

const orcamentoDescription = `Solicite orçamento de locação de equipamentos com a ${brand.name} em Belo Horizonte e região metropolitana. Resposta em horário comercial.`;

export const metadata: Metadata = buildMarketingMetadata({
  title: seoTitle('Solicitar orçamento de locação'),
  description: orcamentoDescription,
  path: '/orcamento',
});

export default async function OrcamentoPage(props: PageProps) {
  const locale = resolveAppLocale((await props.params)?.locale);
  const { equipamento } = await props.searchParams;
  setRequestLocale(locale);

  const equipment = equipamento ? await getEquipmentBySlug(equipamento) : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
        Solicitar orçamento
      </h1>
      <div className="mt-3">
        <BusinessHoursBadge className="!justify-start" />
      </div>
      <p className="mt-4 text-sm text-neutral-600 sm:text-base">
        Preencha os dados essenciais e envie pelo WhatsApp. A equipe retorna em horário útil com
        valores, disponibilidade e prazo de locação.
      </p>

      {equipamento && !equipment && (
        <p className="mt-4 rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
          O equipamento informado na URL não foi encontrado. Você pode escolher itens no{' '}
          <Link className="font-medium text-primary hover:underline" href="/equipamentos">
            catálogo
          </Link>
          .
        </p>
      )}

      <OrcamentoFormSection
        initialEquipment={equipment ? { slug: equipment.slug, name: equipment.name } : undefined}
      />
    </div>
  );
}

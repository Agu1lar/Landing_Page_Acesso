import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/Button';
import {
  brand,
  buildEquipmentWhatsAppUrl,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from '@/lib/brand';
import { getEquipmentBySlug } from '@/lib/equipment';
import { Link } from '@/libs/I18nNavigation';
import { resolveAppLocale } from '@/utils/locale';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ equipamento?: string }>;
};

export const metadata: Metadata = {
  title: 'Solicitar orçamento',
  description: `Solicite orçamento de locação com a ${brand.name}.`,
};

export default async function OrcamentoPage(props: PageProps) {
  const { locale } = await props.params;
  const { equipamento } = await props.searchParams;
  setRequestLocale(resolveAppLocale(locale));

  const equipment = equipamento ? getEquipmentBySlug(equipamento) : undefined;
  const whatsappHref = equipment
    ? buildEquipmentWhatsAppUrl(equipment, 'site-orcamento')
    : buildWhatsAppUrl(buildWhatsAppMessage({ origin: 'site-orcamento' }));

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-900">Solicitar orçamento</h1>
      <p className="mt-4 text-neutral-600">
        Formulário em implementação (Sprint 5). Enquanto isso, utilize o WhatsApp ou telefone{' '}
        {brand.phoneDisplay}.
      </p>
      {equipment && (
        <p className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-neutral-800">
          Equipamento de interesse: <strong>{equipment.name}</strong>
        </p>
      )}
      {equipamento && !equipment && (
        <p className="mt-4 rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
          Referência: <strong>{equipamento}</strong>
        </p>
      )}
      <div className="mt-8">
        <Button href={whatsappHref} variant="whatsapp">
          Falar no WhatsApp
        </Button>
      </div>
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

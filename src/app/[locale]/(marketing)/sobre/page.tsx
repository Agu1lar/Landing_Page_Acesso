import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { brand } from '@/lib/brand';
import { resolveAppLocale } from '@/utils/locale';

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: 'Sobre nós',
  description: `Conheça a ${brand.name} — locação de equipamentos desde ${brand.foundedYear}.`,
};

export default async function SobrePage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(resolveAppLocale(locale));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-900">
        Sobre a Acesso Equipamentos
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-600">
        Fundada em {brand.foundedYear}, a Acesso Equipamentos conta com uma equipe que soma mais de
        20 anos de experiência em locação de equipamentos para construção civil e obras na{' '}
        {brand.seoRegion}.
      </p>
      <p className="mt-4 leading-relaxed text-neutral-600">
        Oferecemos plataformas elevatórias, andaimes, máquinas e ferramentas com foco em segurança,
        conformidade normativa e atendimento ágil. Entrega e retirada na obra conforme o
        equipamento.
      </p>
    </div>
  );
}

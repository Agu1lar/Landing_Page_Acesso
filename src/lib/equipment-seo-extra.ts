import type { Equipment } from '@/types/equipment';

export type EquipmentSeoExtra = {
  title: string;
  paragraphs: string[];
};

const BH_REGION =
  'Belo Horizonte, Contagem, Betim, Nova Lima e demais municípios da região metropolitana';

/**
 * Builds long-tail SEO copy for aerial platform rental pages.
 *
 * @param equipment - Equipment record from catalog.
 * @returns Extra paragraphs for the equipment detail page.
 */
function buildAerialPlatformExtra(equipment: Equipment): EquipmentSeoExtra {
  const workHeight = equipment.specs.find((spec) => spec.label === 'Altura de trabalho')?.value;
  const heightPhrase = workHeight ? ` com altura de trabalho em torno de ${workHeight}` : '';

  return {
    title: `Locação de ${equipment.name} em Belo Horizonte`,
    paragraphs: [
      `A locação de ${equipment.name}${heightPhrase} atende obras e manutenções em ${BH_REGION}. A Acesso Equipamentos dimensiona o modelo conforme espaço no canteiro, tipo de piso, voltagem disponível e carga prevista na plataforma — fatores que impactam segurança e produtividade.`,
      `Para serviços em altura, combine o equipamento com treinamento de operadores alinhado à NR-12 quando necessário. Entrega e retirada são programadas com o responsável pela obra; valores e período mínimo de locação sob consulta com nossa equipe comercial.`,
      `Solicite orçamento informando endereço da obra, datas e descrição do serviço. Se preferir resposta imediata, use o WhatsApp com o nome deste equipamento — o atendimento funciona em horário útil com foco em construção civil e indústria em Minas Gerais.`,
    ],
  };
}

const CATEGORY_EXTRA: Partial<Record<Equipment['category'], EquipmentSeoExtra>> = {
  concretagem: {
    title: 'Locação para concretagem em Belo Horizonte',
    paragraphs: [
      `Equipamentos de concretagem em locação reduzem custo fixo em obras com pico de demanda em ${BH_REGION}. Informe volume estimado de concreto, voltagem no canteiro e período de uso para montarmos proposta com betoneira, vibrador ou mangote compatíveis.`,
      'Entrega e retirada conforme disponibilidade da frota; condições comerciais transparentes no contato com o comercial.',
    ],
  },
  'andaimes-acesso': {
    title: 'Locação de andaimes e acesso em Belo Horizonte',
    paragraphs: [
      `Sistemas de andaime e acesso temporário para obras em ${BH_REGION}. Envie quantitativos ou descrição da frente de serviço para apoio na indicação de peças disponíveis; montagem deve seguir projeto e normas, com equipe habilitada no canteiro.`,
    ],
  },
  'guindastes-remocoes': {
    title: 'Guindaste industrial, Munck e remoção técnica em BH',
    paragraphs: [
      `Serviços de içamento e remoção técnica para máquinas, estruturas, geradores, transformadores e cargas pesadas em ${BH_REGION}. A indicação depende de peso, dimensões, acesso ao local e raio de operação.`,
      'Informe fotos do ponto de carga e descarga, endereço, prazo desejado e características da carga para que a equipe comercial confirme disponibilidade e monte a proposta.',
    ],
  },
  compactacao: {
    title: 'Locação de equipamentos de compactação em BH',
    paragraphs: [
      `Compactadores e placas vibratórias para preparação de base, calçadas e valas em ${BH_REGION}. Indique área a compactar e tipo de material para escolha do modelo adequado.`,
    ],
  },
};

/**
 * Returns optional long-tail block for equipment detail SEO.
 *
 * @param equipment - Equipment record from catalog.
 * @returns Extra content or null when not applicable.
 */
export function getEquipmentSeoExtra(equipment: Equipment): EquipmentSeoExtra | null {
  if (equipment.category === 'equipamentos-aereos') {
    return buildAerialPlatformExtra(equipment);
  }

  return CATEGORY_EXTRA[equipment.category] ?? null;
}

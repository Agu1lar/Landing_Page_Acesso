import type { Equipment } from '@/types/equipment';

const BH_REGION = 'Belo Horizonte e região metropolitana';

type EquipmentSeoExtra = {
  title: string;
  paragraphs: string[];
};

const CATEGORY_EXTRA: Partial<Record<Equipment['category'], EquipmentSeoExtra>> = {
  'ferramentas-eletricas': {
    title: 'Locação de ferramentas elétricas em Belo Horizonte',
    paragraphs: [
      `Ferramentas elétricas em locação reduzem custo fixo em obras com demanda variável em ${BH_REGION}. Informe voltagem no canteiro, tipo de serviço e período de uso para montarmos proposta com o equipamento compatível.`,
    ],
  },
  andaimes: {
    title: 'Locação de andaimes em Belo Horizonte',
    paragraphs: [
      `Andaimes e componentes de acesso temporário para fachadas e frentes de obra em ${BH_REGION}. Envie lista de peças, altura e prazo para orçamento com entrega programada.`,
    ],
  },
  'guindaste-industrial': {
    title: 'Locação de guindaste industrial em Belo Horizonte',
    paragraphs: [
      `Guindaste industrial, Munck e içamento técnico em ${BH_REGION}. Informe peso da carga, raio de operação e endereço da obra para proposta com equipe especializada.`,
    ],
  },
  'ferramentas-combustao': {
    title: 'Locação de ferramentas à combustão em Belo Horizonte',
    paragraphs: [
      `Geradores, compactadores e máquinas à combustão para obras sem rede elétrica em ${BH_REGION}. Informe autonomia, tipo de serviço e local de uso.`,
    ],
  },
};

/**
 * Optional extra SEO block on equipment detail pages (category-specific copy).
 */
export function getEquipmentSeoExtra(equipment: Equipment): EquipmentSeoExtra | null {
  if (equipment.category === 'plataformas-elevatorias') {
    return {
      title: 'Locação de plataformas elevatórias em Belo Horizonte',
      paragraphs: [
        `Para serviços em altura, combine o equipamento com treinamento de operadores alinhado à NR-18 quando necessário. Entrega e retirada são programadas com o responsável pela obra; valores e período mínimo de locação sob consulta com nossa equipe comercial.`,
        `Solicite orçamento informando endereço da obra, datas e descrição do serviço. Se preferir resposta imediata, use o WhatsApp com o nome deste equipamento — o atendimento funciona em horário útil com foco em construção civil e indústria em Minas Gerais.`,
      ],
    };
  }

  return CATEGORY_EXTRA[equipment.category] ?? null;
}

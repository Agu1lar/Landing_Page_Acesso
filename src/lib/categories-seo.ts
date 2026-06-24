import type { EquipmentCategory } from '@/types/equipment';
import { EQUIPMENT_CATEGORY_ORDER } from '@/types/equipment';

export type CategorySeoContent = {
  slug: EquipmentCategory;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  paragraphs: string[];
};

/** Textos originais para SEO local por linha de negócio. */
const CATEGORIES_SEO: Record<EquipmentCategory, CategorySeoContent> = {
  'plataformas-elevatorias': {
    slug: 'plataformas-elevatorias',
    h1: 'Locação de plataformas elevatórias em Belo Horizonte',
    metaTitle: 'Locação de plataformas elevatórias em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de plataformas elevatórias — tesouras, lanças articuladas e telescópicas (aéreas) — para obras em BH, Minas Gerais e todo o Brasil. Frota revisada e orçamento rápido.',
    paragraphs: [
      'A locação de plataformas elevatórias é essencial em obras que exigem trabalho em altura com segurança e produtividade — desde manutenção de fachadas e instalações elétricas até montagem de estruturas metálicas e serviços em galpões industriais. Em Belo Horizonte e em todo o território nacional, a Acesso Equipamentos oferece plataformas elevatórias para empresas, construtoras e empreiteiras que precisam de agilidade sem comprometer a conformidade com as normas de segurança.',
      'Nossa frota inclui plataformas tipo tesoura, lança articulada e lança telescópica, além de mastros verticais, adequadas a diferentes alturas de trabalho e capacidades de carga. Use os filtros do catálogo para ver tesouras, articuladas ou telescópicas. Cada equipamento é indicado conforme o tipo de terreno, o espaço disponível na obra e a necessidade de deslocamento — fatores que nossa equipe comercial avalia ao montar sua proposta. Os valores são informados sob consulta, de acordo com o período de locação e a logística de entrega e retirada.',
      'Trabalhar em altura exige planejamento: análise do solo, delimitação da área, capacitação de operadores e uso de EPIs compatíveis com a atividade. A Acesso Equipamentos orienta o cliente sobre documentação e requisitos usuais para locação de máquinas aéreas, alinhados às boas práticas do setor e à legislação vigente. Fundada em 2013, a empresa conta com profissionais com mais de vinte anos de experiência no mercado de locação para construção civil.',
      'Oferecemos ainda treinamento em operação segura de plataformas elevatórias, com conteúdo alinhado à NR-18 e ao trabalho em altura. Consulte o catálogo abaixo, a página de treinamento, solicite orçamento pelo formulário ou fale diretamente com nossa equipe comercial.',
    ],
  },
  'guindaste-industrial': {
    slug: 'guindaste-industrial',
    h1: 'Locação de guindaste industrial e remoção técnica em BH',
    metaTitle: 'Locação de guindaste industrial em BH | Acesso Equipamentos',
    metaDescription:
      'Locação de guindaste industrial e remoção técnica de cargas pesadas em Belo Horizonte, Minas Gerais e em todo o Brasil.',
    paragraphs: [
      'A locação de guindaste industrial e equipamentos para remoção técnica atende operações que exigem movimentação segura de cargas pesadas, máquinas industriais, estruturas metálicas, geradores, transformadores e materiais de grande porte. Em Belo Horizonte e em todo o território nacional, a Acesso Equipamentos apoia empresas que precisam de içamento, carga, descarga e transporte com equipe especializada.',
      'O dimensionamento do serviço considera peso da carga, raio de operação, acesso ao local, interferências no entorno e necessidade de programação logística. Esses dados ajudam a definir o equipamento mais adequado e reduzem riscos em remoções industriais, manutenções, montagens de estruturas, obras civis e movimentações emergenciais.',
      'Locar guindaste evita investimento em equipamento próprio e permite contratar a solução conforme a demanda de cada projeto. A operação deve ser planejada com responsáveis técnicos, isolamento de área, acessórios compatíveis e profissionais habilitados para garantir produtividade e segurança.',
      'Solicite orçamento informando cidade, endereço de atendimento, peso aproximado da carga, dimensões, fotos do local e prazo desejado. Nossa equipe comercial retorna com disponibilidade, condições e orientações para programar o serviço.',
    ],
  },
  'manipuladores-telescopicos': {
    slug: 'manipuladores-telescopicos',
    h1: 'Locação de manipuladores telescópicos em Belo Horizonte',
    metaTitle: 'Locação de manipuladores telescópicos | Acesso Equipamentos',
    metaDescription:
      'Aluguel de manipuladores telescópicos para movimentação de cargas em obra, indústria e logística em BH, Minas Gerais e em todo o Brasil.',
    paragraphs: [
      'Manipuladores telescópicos — também conhecidos como telehandlers — combinam alcance, elevação e capacidade de carga para movimentar materiais em canteiros, galpões, pátios logísticos e ambientes industriais. A locação permite dimensionar o equipamento conforme altura, peso e tipo de acessório necessário em cada fase da obra.',
      'A Acesso Equipamentos atende demandas de manipuladores telescópicos em Belo Horizonte, Minas Gerais e em todo o território nacional. Na cotação, informe altura de trabalho, carga máxima, tipo de terreno e período de locação para indicarmos o modelo disponível na frota ou a alternativa mais próxima.',
      'A operação segura exige operador capacitado, inspeção pré-uso, estabilização adequada e respeito aos limites de carga e alcance indicados pelo fabricante. Nossa equipe comercial orienta sobre documentação, logística de entrega e retirada e condições de locação sob consulta.',
      'Consulte o catálogo desta linha abaixo ou fale com o comercial para verificar disponibilidade e datas. Empresa fundada em 2013, com atendimento ágil por telefone, e-mail e WhatsApp em horário útil.',
    ],
  },
  andaimes: {
    slug: 'andaimes',
    h1: 'Locação de andaimes em Belo Horizonte',
    metaTitle: 'Locação de andaimes em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de andaimes, tubos, escoras e sistemas de acesso para obras em Belo Horizonte, Minas Gerais e em todo o Brasil.',
    paragraphs: [
      'Andaimes tubulares, escoras metálicas, treliças e componentes de acesso vertical são a base para execução segura de serviços em fachadas, caixas de elevador, passarelas temporárias e diversas frentes de obra. Em Belo Horizonte e em todo o território nacional, a locação de andaimes atende desde reformas residenciais até empreendimentos de médio porte que exigem montagem planejada e fornecimento em quantidade.',
      'A Acesso Equipamentos trabalha com linha ampla de peças para montagem de andaimes e estruturas de apoio, com catálogo que inclui tubos, pisos metálicos, rodas, diagonais e acessórios. O dimensionamento da quantidade deve considerar altura, carga de trabalho e normas técnicas aplicáveis ao tipo de montagem — recomendamos envolver profissional habilitado no projeto do andaime.',
      'A montagem e desmontagem de andaimes são atividades de risco e devem ser executadas por equipe treinada, com projeto quando exigido. Fornecemos os componentes em locação; a responsabilidade pela montagem conforme normas e pelo uso seguro permanece com o contratante da obra, salvo disposição contratual específica.',
      'Veja os itens de andaimes listados abaixo. Para demandas grandes ou longo período, solicite proposta formal com lista de peças e cronograma de entrega.',
    ],
  },
  'ferramentas-eletricas': {
    slug: 'ferramentas-eletricas',
    h1: 'Locação de ferramentas elétricas para obra em Belo Horizonte',
    metaTitle: 'Locação de ferramentas elétricas em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de marteletes, serras, betoneiras, compressores e ferramentas elétricas para construção civil em BH, Minas Gerais e em todo o Brasil.',
    paragraphs: [
      'Ferramentas elétricas — marteletes, serras, lixadeiras, compressores, betoneiras, vibradores e equipamentos portáteis — são o coração da produtividade em reformas e obras de acabamento. Locar esses itens é prática comum entre pedreiros, empreiteiras e equipes de manutenção que precisam de ferramenta confiável por dias ou semanas, não por anos.',
      'A Acesso Equipamentos oferece em Belo Horizonte, Minas Gerais e em todo o território nacional um catálogo extenso de ferramentas elétricas para locação, com valores sob consulta conforme modelo e período. Ao pedir orçamento, indique voltagem disponível no local, tipo de serviço e se há necessidade de acessórios (brocas, discos, mangueiras).',
      'Revise o estado do equipamento na retirada ou na entrega, utilize EPIs adequados e respeite as instruções de uso. Devoluções fora do prazo ou com danos podem gerar cobranças adicionais conforme contrato — nossa equipe comercial esclarece as condições no momento da locação.',
      'Por concentrar também plataformas elevatórias, andaimes e guindastes, a Acesso reduz a fragmentação de fornecedores em obras que exigem máquinas leves e pesadas ao mesmo tempo. Atendimento em horário comercial e contato via WhatsApp para demandas urgentes dentro da disponibilidade da frota.',
    ],
  },
  'ferramentas-combustao': {
    slug: 'ferramentas-combustao',
    h1: 'Locação de ferramentas à combustão em Belo Horizonte',
    metaTitle: 'Locação de ferramentas à combustão em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de geradores, compactadores, roçadeiras e ferramentas à combustão para obras em BH, Minas Gerais e em todo o Brasil.',
    paragraphs: [
      'Ferramentas e máquinas à combustão — geradores, placas vibratórias, roçadeiras e cortadoras a gasolina — atendem obras sem rede elétrica disponível ou que exigem mobilidade e potência em campo. A locação permite usar o equipamento no período necessário, com custo previsível e sem imobilizar capital em compra.',
      'Na Acesso Equipamentos, esta linha reúne equipamentos para compactação, geração de energia e serviços externos em Belo Horizonte, Minas Gerais e em todo o território nacional. Informe tipo de serviço, autonomia desejada, local de uso e período de locação para montarmos a proposta.',
      'O uso seguro exige operador capacitado, ventilação adequada em ambientes fechados, abastecimento correto e manutenção conforme manual do fabricante. EPIs e isolamento da área de trabalho são obrigatórios conforme a atividade.',
      'Consulte o catálogo de ferramentas à combustão abaixo e solicite orçamento pelo formulário, telefone ou WhatsApp comercial.',
    ],
  },
};

export { isEquipmentCategory } from '@/types/equipment';

export function getCategorySeo(slug: EquipmentCategory): CategorySeoContent {
  return CATEGORIES_SEO[slug];
}

export const ALL_EQUIPMENT_CATEGORIES = EQUIPMENT_CATEGORY_ORDER;

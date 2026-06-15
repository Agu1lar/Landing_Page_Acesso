import type { EquipmentCategory } from '@/types/equipment';

export type CategorySeoContent = {
  slug: EquipmentCategory;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  paragraphs: string[];
};

/** Textos originais para SEO local (mín. ~300 palavras por categoria principal) */
const CATEGORIES_SEO: Record<EquipmentCategory, CategorySeoContent> = {
  'equipamentos-aereos': {
    slug: 'equipamentos-aereos',
    h1: 'Locação de plataformas elevatórias em Belo Horizonte',
    metaTitle: 'Locação de plataformas elevatórias em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de plataformas elevatórias e tesouras para obras em BH e região metropolitana. Frota revisada, entrega na obra e orçamento rápido.',
    paragraphs: [
      'A locação de plataformas elevatórias é essencial em obras que exigem trabalho em altura com segurança e produtividade — desde manutenção de fachadas e instalações elétricas até montagem de estruturas metálicas e serviços em galpões industriais. Em Belo Horizonte e na região metropolitana, a Acesso Equipamentos oferece plataformas elevatórias para empresas, construtoras e empreiteiras que precisam de agilidade sem comprometer a conformidade com as normas de segurança.',
      'Nossa frota inclui plataformas tipo tesoura e outros modelos adequados a diferentes alturas de trabalho e capacidades de carga. Cada equipamento é indicado conforme o tipo de terreno, o espaço disponível na obra e a necessidade de deslocamento — fatores que nossa equipe comercial avalia ao montar sua proposta. Os valores são informados sob consulta, de acordo com o período de locação e a logística de entrega e retirada.',
      'Trabalhar em altura exige planejamento: análise do solo, delimitação da área, capacitação de operadores e uso de EPIs compatíveis com a atividade. A Acesso Equipamentos orienta o cliente sobre documentação e requisitos usuais para locação de máquinas aéreas, alinhados às boas práticas do setor e à legislação vigente. Fundada em 2013, a empresa conta com profissionais com mais de vinte anos de experiência no mercado de locação para construção civil.',
      'Atendemos obras em Belo Horizonte e cidades da região metropolitana, com entrega e retirada programadas conforme a disponibilidade da frota. O atendimento comercial funciona em horário útil, com resposta ágil por telefone, e-mail ou WhatsApp — canais que facilitam o orçamento mesmo para demandas de curto prazo.',
      'Ao escolher a Acesso para a locação de plataforma elevatória em BH, você centraliza o relacionamento com uma locadora que também disponibiliza andaimes, equipamentos de concretagem, compactação e ferramentas elétricas — reduzindo a necessidade de múltiplos fornecedores na mesma obra. Oferecemos ainda treinamento em operação segura de plataformas elevatórias, para empresas que desejam capacitar operadores com conteúdo alinhado à NR-12 e ao trabalho em altura. Consulte o catálogo abaixo, a página de treinamento, solicite orçamento pelo formulário ou fale diretamente com nossa equipe.',
    ],
  },
  'guindastes-remocoes': {
    slug: 'guindastes-remocoes',
    h1: 'Locação de guindaste industrial, Munck e remoção em BH',
    metaTitle: 'Locação de guindaste industrial e Munck em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de guindaste industrial, caminhão Munck e remoção técnica de cargas pesadas em Belo Horizonte e região metropolitana.',
    paragraphs: [
      'A locação de guindaste industrial, caminhão Munck e equipamentos para remoção técnica atende operações que exigem movimentação segura de cargas pesadas, máquinas industriais, estruturas metálicas, geradores, transformadores e materiais de grande porte. Em Belo Horizonte e região metropolitana, a Acesso Equipamentos apoia empresas que precisam de içamento, carga, descarga e transporte com equipe especializada.',
      'O dimensionamento do serviço considera peso da carga, raio de operação, acesso ao local, interferências no entorno e necessidade de programação logística. Esses dados ajudam a definir o equipamento mais adequado e reduzem riscos em remoções industriais, manutenções, montagens de estruturas, obras civis e movimentações emergenciais.',
      'Locar guindaste ou Munck evita investimento em equipamento próprio e permite contratar a solução conforme a demanda de cada projeto. A operação deve ser planejada com responsáveis técnicos, isolamento de área, acessórios compatíveis e profissionais habilitados para garantir produtividade e segurança.',
      'Solicite orçamento informando cidade, endereço de atendimento, peso aproximado da carga, dimensões, fotos do local e prazo desejado. Nossa equipe comercial retorna com disponibilidade, condições e orientações para programar o serviço.',
    ],
  },
  concretagem: {
    slug: 'concretagem',
    h1: 'Locação de equipamentos para concretagem em Belo Horizonte',
    metaTitle: 'Locação de equipamentos para concretagem em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de betoneiras, vibradores, bombas e equipamentos para concreto em BH e RMBH. Entrega na obra, frota ampla e orçamento sob consulta.',
    paragraphs: [
      'Betoneiras, vibradores de imersão, bombas de mangote e demais equipamentos de concretagem são itens recorrentes em fundações, lajes, contrapisos e reformas estruturais. Na região de Belo Horizonte, a locação permite que empreiteiras e construtoras dimensionem o maquinário conforme o volume de concreto e o cronograma da obra, sem imobilizar capital em compra de ativos.',
      'A Acesso Equipamentos mantém variedade de modelos de betoneiras e acessórios para atender obras de pequeno, médio e grande porte. A escolha do equipamento considera capacidade em litros, tipo de alimentação (monofásica ou trifásica), altura de lançamento quando aplicável e a necessidade de peças complementares, como mangotes e agulhas vibratórias.',
      'O uso correto dos equipamentos de concretagem impacta diretamente a qualidade do concreto e a segurança da equipe. Recomendamos verificar previamente a disponibilidade de energia no canteiro, o acesso para entrega e as condições de armazenamento. Nossa equipe informa valores e prazos de locação sob consulta, com transparência sobre períodos mínimos e logística de retirada.',
      'Com sede em Belo Horizonte e atuação na região metropolitana, realizamos entrega e retirada nos horários acordados com o responsável pela obra. Empresa fundada em 2013, a Acesso reúne experiência de mercado e atendimento próximo — inclusive para obras que demandam renovação de contrato ou ampliação da frota locada ao longo do cronograma.',
      'Além da concretagem, disponibilizamos compactadores, ferramentas elétricas, andaimes e plataformas elevatórias, o que simplifica a contratação quando a obra exige mais de uma linha de equipamento. Navegue pelo catálogo desta categoria ou solicite um orçamento personalizado com a descrição dos itens e o período desejado.',
    ],
  },
  compactacao: {
    slug: 'compactacao',
    h1: 'Locação de equipamentos de compactação em Belo Horizonte',
    metaTitle: 'Locação de compactadores e placas vibratórias em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de placas vibratórias, sapatas e equipamentos de compactação para obras em BH. Entrega na região metropolitana e orçamento rápido.',
    paragraphs: [
      'A compactação adequada do solo, de bases de pavimento e de aterros é etapa crítica para a estabilidade de qualquer obra civil. Placas vibratórias, sapatas compactadoras e equipamentos correlatos permitem atingir a densidade exigida em projetos de calçadas, reformas, ampliações e preparação de terreno — com custo previsível quando contratados por locação.',
      'Em Belo Horizonte e região metropolitana, a Acesso Equipamentos disponibiliza equipamentos de compactação para autônomos, empreiteiras e construtoras que buscam prazo curto de mobilização. A indicação do modelo depende da área a compactar, do tipo de material (solo argiloso, brita, etc.) e das restrições de acesso no canteiro.',
      'Locar em vez de comprar faz sentido quando o equipamento será usado em janelas curtas ou em obras esporádicas. Informamos condições comerciais sob consulta, incluindo período de locação, responsabilidades de transporte e orientações básicas de operação segura — sempre reforçando o uso de EPIs e a leitura do manual do fabricante.',
      'Nossa operação combina frota diversificada com equipe comercial que conhece a rotina de obras na capital mineira e municípios vizinhos. Desde 2013 no mercado, a Acesso Equipamentos valoriza a relação de confiança com clientes que retornam em diferentes fases de um mesmo empreendimento ou em novas obras.',
      'Explore os itens disponíveis nesta categoria. Para orçamentos com vários equipamentos — por exemplo, compactador e martelete na mesma obra — utilize o formulário de orçamento ou o WhatsApp comercial, informando cidade, prazo e lista de máquinas desejadas.',
    ],
  },
  'demolicao-perfuracao': {
    slug: 'demolicao-perfuracao',
    h1: 'Locação de marteletes e equipamentos de demolição em Belo Horizonte',
    metaTitle: 'Locação de marteletes e rompedores em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de marteletes, rompedores e equipamentos de demolição e perfuração para obras em BH e região metropolitana.',
    paragraphs: [
      'Marteletes, rompedores e ferramentas de demolição leve são indispensáveis em reformas, adequações de layout, remoção de revestimentos e pequenas demolições controladas. A locação evita o desgaste de comprar equipamento para uso intermitente e garante acesso a modelos com potência adequada ao material a ser rompido.',
      'A Acesso Equipamentos atende obras em Belo Horizonte e região metropolitana com frota que inclui diferentes tipos de marteletes e acessórios, conforme disponibilidade. Na solicitação de orçamento, informe o tipo de serviço (concreto, alvenaria, piso), a voltagem disponível no local e o período estimado de uso — dados que ajudam a indicar o equipamento correto.',
      'A segurança na demolição e perfuração depende de técnica adequada, proteção auditiva e respiratória quando necessário, além do isolamento da área de trabalho. Orientamos nossos clientes sobre cuidados gerais; a operação deve seguir as normas aplicáveis e a supervisão da obra.',
      'Integrar a locação de ferramentas de demolição com outros itens — como compressores, geradores ou andaimes — na mesma locadora reduz logística e simplifica o faturamento. A Acesso, fundada em 2013, oferece atendimento comercial em horário útil e canais digitais para orçamento ágil.',
      'Confira abaixo os equipamentos desta linha disponíveis para locação. Valores sob consulta; entre em contato para reservar datas e combinar entrega no canteiro.',
    ],
  },
  'andaimes-acesso': {
    slug: 'andaimes-acesso',
    h1: 'Locação de andaimes e equipamentos de acesso em Belo Horizonte',
    metaTitle: 'Locação de andaimes em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de andaimes, tubos, escoras e sistemas de acesso para obras em Belo Horizonte e região metropolitana.',
    paragraphs: [
      'Andaimes tubulares, escoras metálicas, treliças e componentes de acesso vertical são a base para execução segura de serviços em fachadas, caixas de elevador, passarelas temporárias e diversas frentes de obra. Em Belo Horizonte, a locação de andaimes atende desde reformas residenciais até empreendimentos de médio porte que exigem montagem planejada e fornecimento em quantidade.',
      'A Acesso Equipamentos trabalha com linha ampla de peças para montagem de andaimes e estruturas de apoio, com catálogo que inclui tubos, pisos metálicos, rodas, diagonais e acessórios. O dimensionamento da quantidade deve considerar altura, carga de trabalho e normas técnicas aplicáveis ao tipo de montagem — recomendamos envolver profissional habilitado no projeto do andaime.',
      'A montagem e desmontagem de andaimes são atividades de risco e devem ser executadas por equipe treinada, com projeto quando exigido. Fornecemos os componentes em locação; a responsabilidade pela montagem conforme normas e pelo uso seguro permanece com o contratante da obra, salvo disposição contratual específica.',
      'Com experiência acumulada desde 2013 e equipe comercial que conhece o mercado de construção em MG, atendemos clientes que buscam fornecedor local com entrega na região metropolitana de BH. Orçamentos sob consulta, com prazos alinhados à disponibilidade de estoque.',
      'Veja os itens de andaimes e acesso listados abaixo. Para demandas grandes ou longo período, solicite proposta formal com lista de peças e cronograma de entrega.',
    ],
  },
  energia: {
    slug: 'energia',
    h1: 'Locação de geradores e equipamentos de energia em Belo Horizonte',
    metaTitle: 'Locação de geradores em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de geradores e equipamentos de energia para obras e eventos em Belo Horizonte e região metropolitana.',
    paragraphs: [
      'Geradores e soluções temporárias de energia mantêm obras e serviços em funcionamento quando a rede elétrica ainda não está disponível ou quando é necessária potência adicional para equipamentos específicos. A locação permite dimensionar potência e autonomia conforme a fase da obra, sem investimento permanente.',
      'Na Acesso Equipamentos, a categoria de energia reúne modelos de geradores e itens correlatos para atendimento em Belo Horizonte e cidades da região metropolitana. Na cotação, informe a potência estimada, o tipo de carga (motores, iluminação, ferramentas) e o local de instalação — dados essenciais para uma indicação segura.',
      'O uso de geradores exige atenção à ventilação, aterramento, proteção contra choque e abastecimento adequado. Recomendamos operação por pessoal capacitado e cumprimento das normas do fabricante e da concessionária local quando houver interligação ou proximidade com a rede.',
      'Combinar a locação de gerador com ferramentas elétricas, iluminação de obra ou equipamentos de compactação na mesma proposta simplifica a gestão do canteiro. Fundada em 2013, a Acesso mantém relacionamento de longo prazo com construtoras e empreiteiras da região.',
      'Consulte o catálogo de energia abaixo e solicite orçamento com data de início e duração prevista da locação.',
    ],
  },
  'ferramentas-eletricas': {
    slug: 'ferramentas-eletricas',
    h1: 'Locação de ferramentas elétricas para obra em Belo Horizonte',
    metaTitle: 'Locação de ferramentas elétricas em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de marteletes, serras, compressores e ferramentas elétricas para construção civil em BH e RMBH.',
    paragraphs: [
      'Ferramentas elétricas — marteletes, serras, lixadeiras, compressores e equipamentos portáteis — são o coração da produtividade em reformas e obras de acabamento. Locar esses itens é prática comum entre pedreiros, empreiteiras e equipes de manutenção que precisam de ferramenta confiável por dias ou semanas, não por anos.',
      'A Acesso Equipamentos oferece em Belo Horizonte e região metropolitana um catálogo extenso de ferramentas para locação, com valores sob consulta conforme modelo e período. Ao pedir orçamento, indique voltagem disponível no local, tipo de serviço e se há necessidade de acessórios (brocas, discos, mangueiras).',
      'Revise o estado do equipamento na retirada ou na entrega, utilize EPIs adequados e respeite as instruções de uso. Devoluções fora do prazo ou com danos podem gerar cobranças adicionais conforme contrato — nossa equipe comercial esclarece as condições no momento da locação.',
      'Por concentrar também andaimes, betoneiras, plataformas elevatórias e compactadores, a Acesso reduz a fragmentação de fornecedores em obras que exigem máquinas leves e pesadas ao mesmo tempo. Atendimento em horário comercial e contato via WhatsApp para demandas urgentes dentro da disponibilidade da frota.',
      'Navegue pelos equipamentos listados nesta página. Para busca rápida por nome, utilize a busca global no topo do site (atalho Ctrl+K).',
    ],
  },
  acessorios: {
    slug: 'acessorios',
    h1: 'Locação de acessórios para obra em Belo Horizonte',
    metaTitle: 'Locação de acessórios para construção civil em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de ponteiras, punhos, cabos, mangueiras e acessórios para equipamentos de locação em BH e região metropolitana.',
    paragraphs: [
      'Acessórios complementam a locação de ferramentas, guinchos, bombas e demais equipamentos — ponteiras e talhadeiras por peso, punhos para furadeira ou martelo, cabos, mangueiras, chaves e peças para máquina de solda, entre outros itens do dia a dia da obra.',
      'Na Acesso Equipamentos, em Belo Horizonte e região metropolitana, os acessórios são locados conforme disponibilidade de frota. Ao solicitar orçamento, informe o equipamento principal, o modelo ou peso desejado e o período de uso para que a equipe comercial confirme compatibilidade.',
      'Fotos e especificações detalhadas podem variar conforme o lote disponível; valores sob consulta. A entrega e retirada seguem as mesmas condições da locação de equipamentos.',
      'Combine acessórios com ferramentas elétricas, guinchos de coluna, bombas e andaimes na mesma proposta para simplificar a logística do canteiro.',
      'Navegue pelo catálogo abaixo ou use a busca global (Ctrl+K) para localizar o item pelo nome.',
    ],
  },
  outros: {
    slug: 'outros',
    h1: 'Locação de equipamentos diversos para obra em Belo Horizonte',
    metaTitle: 'Locação de equipamentos para obra em BH | Acesso Equipamentos',
    metaDescription:
      'Aluguel de equipamentos diversos para construção civil em Belo Horizonte. Catálogo completo e orçamento sob consulta.',
    paragraphs: [
      'Além das linhas principais — plataformas aéreas, andaimes, concretagem, compactação e ferramentas — a Acesso Equipamentos mantém itens complementares que atendem demandas específicas de cada obra. Esta categoria reúne equipamentos que não se enquadram nas famílias tradicionais, mas são igualmente importantes para a execução do serviço.',
      'Em Belo Horizonte e região metropolitana, atendemos construtoras, síndicos de obras, industrias e prestadores de serviço que buscam locadora com variedade e resposta comercial ágil. Os valores são sempre informados sob consulta, respeitando a política comercial da empresa e a sazonalidade da demanda.',
      'Se não encontrar o item desejado na listagem abaixo, entre em contato: nossa equipe pode verificar disponibilidade ou sugerir alternativa equivalente na frota. A busca global do site facilita localizar equipamentos pelo nome.',
      'Empresa fundada em 2013, com equipe experiente no setor de locação para construção civil em Minas Gerais. Oferecemos entrega e retirada programadas, documentação de locação e canais claros de comunicação com o comercial.',
      'Confira os equipamentos disponíveis e solicite orçamento informando local da obra, prazo e descrição do serviço a ser executado.',
    ],
  },
};

export function isEquipmentCategory(slug: string): slug is EquipmentCategory {
  return slug in CATEGORIES_SEO;
}

export function getCategorySeo(slug: EquipmentCategory): CategorySeoContent {
  return CATEGORIES_SEO[slug];
}

export const ALL_EQUIPMENT_CATEGORIES = Object.keys(CATEGORIES_SEO) as EquipmentCategory[];

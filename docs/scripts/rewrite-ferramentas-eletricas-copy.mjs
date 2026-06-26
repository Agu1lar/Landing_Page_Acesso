/**
 * Rewrites short/long descriptions and specs for ferramentas-eletricas in equipamentos.json.
 *
 * Usage: node docs/scripts/rewrite-ferramentas-eletricas-copy.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const JSON_PATH = resolve(ROOT, 'src/data/equipamentos.json');

const LOGISTICS =
  'Locação com entrega e retirada na região metropolitana de Belo Horizonte e operações sob consulta em todo o território nacional. Período mínimo, disponibilidade e valores sob consulta com a Acesso Equipamentos.';

const DELIVERY = {
  label: 'Entrega',
  value: 'Região metropolitana de BH e operações nacionais sob consulta',
};

function long(body) {
  return `${body} ${LOGISTICS}`;
}

function powerToolSpecs(aplicacao, extra = []) {
  return [
    { label: 'Aplicação', value: aplicacao },
    { label: 'Alimentação', value: '220 V monofásica, conforme modelo disponível' },
    { label: 'Segurança', value: 'EPI obrigatório e acessório compatível com o serviço' },
    ...extra,
    DELIVERY,
  ];
}

/** @type {Record<string, { short: string; long: string; specs: { label: string; value: string }[] }>} */
const COPY = {
  'argamassadeira': {
    short: 'Locação de argamassadeira elétrica para mistura de concreto, argamassa e reboco em obra.',
    long: long(
      'Argamassadeira elétrica indicada para preparo homogêneo de concreto, argamassa, reboco e massas em obras e reformas. Reduz esforço manual e acelera a produção no canteiro, com capacidade conforme o modelo locado.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Mistura de concreto, argamassa, reboco e massas' },
      { label: 'Acionamento', value: 'Elétrico 220 V, conforme modelo disponível' },
      { label: 'Uso indicado', value: 'Obras, reformas, contrapisos e alvenaria' },
      DELIVERY,
    ],
  },
  'aspirador-de-po': {
    short: 'Locação de aspirador de pó industrial para limpeza pesada de pó e resíduos secos em obra.',
    long: long(
      'Aspirador de pó industrial indicado para aspiração de pó fino, pó de concreto, gesso e entulho leve em reformas, demolições controladas e acabamento. Equipamento de alta sucção, com reservatório reforçado e filtros para uso intenso no canteiro — não é aspirador doméstico. Auxilia na limpeza após corte, lixamento, furação e desbaste, mantendo o ambiente mais seguro para a equipe.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Aspiração de pó e resíduos secos em obra' },
      { label: 'Tipo', value: 'Industrial, alto fluxo e reservatório reforçado' },
      { label: 'Alimentação', value: 'Elétrica 220 V, conforme modelo disponível' },
      { label: 'Uso indicado', value: 'Reformas, demolições leves e limpeza de canteiro' },
      DELIVERY,
    ],
  },
  'betoneira': {
    short: 'Locação de betoneira elétrica para preparo de concreto, argamassa e massas em obra.',
    long: long(
      'Betoneira elétrica indicada para preparo homogêneo de concreto, argamassa, reboco e massas em obras e reformas. Permite dosagem e mistura contínua no canteiro, com capacidade do tambor conforme o modelo locado.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Mistura de concreto, argamassa, reboco e massas' },
      { label: 'Acionamento', value: 'Elétrico, conforme modelo disponível' },
      { label: 'Uso indicado', value: 'Obras, reformas, contrapisos e alvenaria' },
      DELIVERY,
    ],
  },
  'bomba-lameira': {
    short: 'Locação de bomba lameira para drenagem, esgotamento e bombeamento de água com sólidos.',
    long: long(
      'Bomba lameira indicada para esgotamento de valas, caixas e áreas alagadas, com bombeamento de água suja, lama e sólidos em suspensão conforme capacidade do modelo locado.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Drenagem, esgotamento e bombeamento de água com resíduos' },
      { label: 'Conexão', value: 'Mangote conforme modelo disponível' },
      { label: 'Acionamento', value: 'Conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'bomba-mangote': {
    short: 'Locação de bomba mangote para drenagem e transferência de água em obra.',
    long: long(
      'Bomba mangote indicada para esgotamento, drenagem e transferência de água com sólidos ou lama em fundações, valas e serviços de contenção, conforme vazão do modelo locado.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Drenagem, esgotamento e bombeamento de água com resíduos' },
      { label: 'Conexão', value: 'Mangote conforme modelo disponível' },
      { label: 'Acionamento', value: 'Conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'bomba-mangote-75': {
    short: 'Locação de bomba mangote 75 mm para drenagem e bombeamento em obra.',
    long: long(
      'Bomba mangote 75 mm indicada para esgotamento e transferência de água com sólidos em valas, caixas e áreas de escavação, com mangote de 75 mm conforme disponibilidade de frota.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Drenagem, esgotamento e bombeamento de água com resíduos' },
      { label: 'Conexão', value: 'Mangote 75 mm, conforme disponibilidade' },
      { label: 'Acionamento', value: 'Conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'chave-de-impacto': {
    short: 'Locação de chave de impacto elétrica para aperto e desaperto de parafusos e porcas.',
    long: long(
      'Chave de impacto elétrica indicada para aperto e desaperto rápido de parafusos, porcas e fixações em montagens metálicas, estruturas e manutenção industrial. Uso com soquetes compatíveis, torque adequado ao serviço e EPIs de proteção.',
    ),
    specs: powerToolSpecs('Aperto e desaperto de parafusos e porcas'),
  },
  'compactador-eletrico': {
    short: 'Locação de compactador elétrico para compactação de solo e base em obra.',
    long: long(
      'Compactador elétrico indicado para compactação localizada de solo, base e reaterro em valas, calçadas, calçamentos e áreas de assentamento, com operação conforme capacidade do modelo locado.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Compactação de solo, base e reaterro' },
      { label: 'Alimentação', value: 'Elétrica, conforme modelo disponível' },
      { label: 'Uso indicado', value: 'Valas, calçadas e pequenos canteiros' },
      DELIVERY,
    ],
  },
  'compactador-eletrico-unidade-2': {
    short: 'Locação de compactador elétrico (unidade 2) para compactação de solo em obra.',
    long: long(
      'Compactador elétrico indicado para compactação localizada de solo, base e reaterro em valas, calçadas e frentes de serviço, ampliando a disponibilidade de frota para obras simultâneas.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Compactação de solo, base e reaterro' },
      { label: 'Alimentação', value: 'Elétrica, conforme modelo disponível' },
      { label: 'Uso indicado', value: 'Valas, calçadas e pequenos canteiros' },
      DELIVERY,
    ],
  },
  'compressor-220v': {
    short: 'Locação de compressor 220 V para ar comprimido em pintura e ferramentas pneumáticas.',
    long: long(
      'Compressor 220 V indicado para fornecimento de ar comprimido em pintura, limpeza, calibração e acionamento de ferramentas pneumáticas compatíveis com a vazão e pressão do modelo locado.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Ar comprimido para pintura, limpeza e ferramentas pneumáticas' },
      { label: 'Alimentação', value: '220 V monofásica, conforme modelo disponível' },
      { label: 'Dimensionamento', value: 'Conforme vazão e pressão necessárias' },
      DELIVERY,
    ],
  },
  'cortadora': {
    short: 'Locação de cortadora elétrica para corte de pisos, revestimentos e alvenaria.',
    long: long(
      'Cortadora elétrica indicada para corte de pisos cerâmicos, porcelanato, revestimentos e alvenaria com disco diamantado compatível. Uso com guia, refrigeração quando necessário e EPIs para proteção contra pó e estilhaços.',
    ),
    specs: powerToolSpecs('Corte de pisos, revestimentos e alvenaria com disco diamantado'),
  },
  'escada-fibra-6m-extensiva': {
    short: 'Locação de escada extensiva de fibra 6 m para acesso temporário em altura.',
    long: long(
      'Escada extensiva de fibra de 6 m indicada para acesso temporário em manutenção elétrica, predial e industrial. A fibra reduz condução elétrica, mas o uso deve seguir análise de risco, apoio correto e limite do fabricante.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Acesso temporário e manutenção em altura' },
      { label: 'Material', value: 'Fibra' },
      { label: 'Comprimento', value: '6 m extensiva' },
      DELIVERY,
    ],
  },
  'esmerilhadeira-4-5-220v': {
    short: 'Locação de esmerilhadeira 4,5" 220 V para corte e desbaste com disco 4,5 polegadas.',
    long: long(
      'Esmerilhadeira 4,5" 220 V indicada para corte, desbaste e acabamento em metal, concreto e alvenaria com disco de 4,5 polegadas. Ferramenta compacta para serviços em altura e frentes de obra com acesso limitado.',
    ),
    specs: powerToolSpecs('Corte, desbaste e acabamento com disco 4,5 polegadas'),
  },
  'esmerilhadeira-7-m-220v': {
    short: 'Locação de esmerilhadeira 7" 220 V para corte e desbaste com disco 7 polegadas.',
    long: long(
      'Esmerilhadeira 7" 220 V indicada para corte, desbaste e acabamento pesado em metal, concreto e alvenaria com disco de 7 polegadas. Maior capacidade de remoção de material para serviços exigentes no canteiro.',
    ),
    specs: powerToolSpecs('Corte, desbaste e acabamento com disco 7 polegadas'),
  },
  'furadeira-5-8-220v': {
    short: 'Locação de furadeira 5/8" 220 V para furação em madeira, metal e alvenaria.',
    long: long(
      'Furadeira 5/8" 220 V indicada para furação em madeira, metal, alvenaria e concreto com brocas compatíveis. Uso com fixação estável da peça, controle de profundidade e EPIs contra pó e projeção de partículas.',
    ),
    specs: powerToolSpecs('Furação em madeira, metal e alvenaria com broca 5/8"'),
  },
  'furadeira-1-2-200v': {
    short: 'Locação de furadeira 1/2" 220 V para furação e parafusamento em obra.',
    long: long(
      'Furadeira 1/2" 220 V indicada para furação leve a média em madeira, metal e alvenaria, além de parafusamento com bits compatíveis. Ferramenta versátil para montagens e instalações no canteiro.',
    ),
    specs: powerToolSpecs('Furação e parafusamento com mandril 1/2"'),
  },
  'lavador-de-alta-pressao': {
    short: 'Locação de lavadora de alta pressão elétrica para limpeza pesada em obra e fachadas.',
    long: long(
      'Lavadora de alta pressão elétrica indicada para remoção de sujeira, lama, tinta solta e resíduos em pisos, fachadas, máquinas e áreas externas. Uso com bico e pressão adequados ao revestimento para evitar danos à superfície.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Limpeza com jato de alta pressão em obra e fachadas' },
      { label: 'Alimentação', value: '220 V, conforme modelo disponível' },
      { label: 'Segurança', value: 'EPI obrigatório e distância segura do jato' },
      DELIVERY,
    ],
  },
  'lixadeira-7-220v': {
    short: 'Locação de lixadeira 7" 220 V para lixamento e acabamento de superfícies.',
    long: long(
      'Lixadeira 7" 220 V indicada para lixamento, nivelamento e acabamento de madeira, metal e superfícies preparatórias para pintura. Uso com lixa de granulometria adequada e extração de pó quando disponível.',
    ),
    specs: powerToolSpecs('Lixamento e acabamento de superfícies com disco 7"'),
  },
  'lixadeira': {
    short: 'Locação de lixadeira elétrica para lixamento e acabamento de superfícies.',
    long: long(
      'Lixadeira elétrica indicada para lixamento, nivelamento e acabamento de madeira, massa corrida, verniz e superfícies metálicas. Uso com lixa compatível e proteção contra pó.',
    ),
    specs: powerToolSpecs('Lixamento e acabamento de superfícies'),
  },
  'makitao': {
    short: 'Locação de makitão (serra circular portátil) para corte de madeira e chapas.',
    long: long(
      'Makitão — serra circular portátil — indicado para corte reto de madeira, compensado, MDF e chapas em bancada ou guia. Uso com disco adequado à espessura, profundidade de corte regulada e EPIs de proteção.',
    ),
    specs: powerToolSpecs('Corte de madeira e chapas com serra circular portátil'),
  },
  'mangote-vibrador': {
    short: 'Locação de mangote vibrador em vários diâmetros (25 a 60 mm) para adensamento de concreto.',
    long: long(
      'Mangote vibrador para adensamento de concreto em vigas, pilares, lajes e fundações. Trabalhamos com vários diâmetros — 25 mm, 35 mm, 45 mm e 60 mm — e comprimentos de 3 m e 5 m, para motores vibradores e vibradores portáteis (Makita e Bosch). Informe diâmetro, comprimento e tipo de acoplamento no orçamento para reservarmos o modelo compatível com o serviço.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Adensamento de concreto com motor vibrador ou vibrador portátil' },
      { label: 'Diâmetros disponíveis', value: '25 mm, 35 mm, 45 mm e 60 mm' },
      { label: 'Comprimentos', value: '3 m e 5 m conforme modelo' },
      { label: 'Compatibilidade', value: 'Motores vibradores; vibradores portáteis Makita e Bosch' },
      { label: 'Disponibilidade', value: 'Consulte diâmetro, comprimento e marca na cotação' },
      DELIVERY,
    ],
  },
  'máquina-de-solda': {
    short: 'Locação de máquina de solda elétrica para soldagem em obra e manutenção.',
    long: long(
      'Máquina de solda elétrica indicada para soldagem de aço carbono e estruturas metálicas em obra, manutenção e montagens temporárias. Uso com eletrodo ou arame compatível, aterramento adequado e EPIs de soldador.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Soldagem de aço e estruturas metálicas' },
      { label: 'Alimentação', value: '220 V, conforme modelo disponível' },
      { label: 'Segurança', value: 'EPI de soldador e área ventilada' },
      DELIVERY,
    ],
  },
  'martelo-10-kg': {
    short: 'Locação de martelo demolidor 10 kg para demolição leve em alvenaria e reboco.',
    long: long(
      'Martelo demolidor de 10 kg indicado para demolição leve de reboco, azulejo, concreto fino e remoção de revestimentos. Peso intermediário entre ferramentas de quebra, com boa manobrabilidade em reformas.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Demolição leve de reboco, revestimentos e concreto fino' },
      { label: 'Peso', value: '10 kg' },
      { label: 'Alimentação', value: '220 V, conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'martelete-sds-combinado': {
    short: 'Locação de martelete SDS combinado para perfuração e leve demolição.',
    long: long(
      'Martelete SDS combinado indicado para perfuração em concreto e alvenaria com brocas SDS, além de modo cinzel para quebra leve. Ferramenta versátil para instalações elétricas, hidráulicas e fixações em parede.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Perfuração e leve demolição com encaixe SDS' },
      { label: 'Funções', value: 'Perfuração, impacto e combinação' },
      { label: 'Alimentação', value: '220 V, conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'martelo-5kg': {
    short: 'Locação de martelo demolidor 5 kg para demolição pontual e acabamento.',
    long: long(
      'Martelo demolidor de 5 kg indicado para demolição pontual de reboco, rejunte, azulejo e concreto fino em reformas com acesso restrito. Menor peso facilita trabalho em altura e frentes estreitas.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Demolição pontual de reboco e revestimentos' },
      { label: 'Peso', value: '5 kg' },
      { label: 'Alimentação', value: '220 V, conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'martelo-demolidor-15-kg': {
    short: 'Locação de martelo demolidor 15 kg para quebra de concreto e alvenaria.',
    long: long(
      'Martelo demolidor de 15 kg indicado para quebra de concreto, alvenaria estrutural e remoção de pisos e revestimentos pesados. Maior energia de impacto para demolições de média intensidade.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Quebra de concreto, alvenaria e pisos' },
      { label: 'Peso', value: '15 kg' },
      { label: 'Alimentação', value: '220 V, conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'martelo-demolidor-18kg': {
    short: 'Locação de martelo demolidor 18 kg para demolição pesada em obra.',
    long: long(
      'Martelo demolidor de 18 kg indicado para demolição pesada de concreto, vigas, lajes e fundações em reformas estruturais. Requer operador treinado, apoio firme e EPIs completos.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Demolição pesada de concreto e estruturas' },
      { label: 'Peso', value: '18 kg' },
      { label: 'Alimentação', value: '220 V, conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'martelo-demolidor-30-kg': {
    short: 'Locação de martelo demolidor 30 kg para demolição estrutural pesada.',
    long: long(
      'Martelo demolidor de 30 kg indicado para demolição estrutural pesada de concreto armado, pisos industriais e elementos de grande espessura. Equipamento de alto impacto para serviços que exigem produtividade em quebra de massa.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Demolição estrutural pesada de concreto armado' },
      { label: 'Peso', value: '30 kg' },
      { label: 'Alimentação', value: '220 V, conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'misturador-argamassa-portatil': {
    short: 'Locação de misturador portátil de argamassa para pequenas batidas em obra.',
    long: long(
      'Misturador portátil de argamassa indicado para preparo de pequenas quantidades de argamassa colante, rejunte, gesso e massas em reformas e acabamento, com hélice compatível ao material.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Mistura de argamassa colante, rejunte e massas' },
      { label: 'Acionamento', value: 'Elétrico, conforme modelo disponível' },
      { label: 'Uso indicado', value: 'Revestimentos, rejuntamento e acabamento' },
      DELIVERY,
    ],
  },
  'motor-weg': {
    short: 'Locação de motor elétrico WEG para acionamento de bombas e equipamentos.',
    long: long(
      'Motor elétrico WEG indicado para acionamento de bombas, misturadores e equipamentos auxiliares em obra e manutenção industrial. Potência e rotação conforme modelo disponível na frota.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Acionamento de bombas e equipamentos auxiliares' },
      { label: 'Fabricante', value: 'WEG' },
      { label: 'Alimentação', value: 'Conforme modelo disponível' },
      DELIVERY,
    ],
  },
  'motor-vibrador': {
    short: 'Locação de motor vibrador para adensamento de concreto com mangote.',
    long: long(
      'Motor vibrador indicado para acionamento de mangotes em adensamento de concreto em vigas, pilares, lajes e fundações, reduzindo vazios e melhorando resistência da massa.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Adensamento de concreto com mangote' },
      { label: 'Acionamento', value: 'Elétrico, conforme modelo disponível' },
      { label: 'Conexão', value: 'Mangote conforme diâmetro do serviço' },
      DELIVERY,
    ],
  },
  'nível-laser': {
    short: 'Locação de nível laser para marcação e nivelamento em obra.',
    long: long(
      'Nível laser indicado para marcação de níveis, prumos e alinhamentos em alvenaria, instalações e acabamento. Uso em ambiente com referência estável e proteção contra poeira excessiva.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Nivelamento, prumo e alinhamento em obra' },
      { label: 'Alimentação', value: 'Bateria ou elétrica, conforme modelo' },
      { label: 'Uso indicado', value: 'Alvenaria, instalações e acabamento' },
      DELIVERY,
    ],
  },
  'painel-de-comando': {
    short: 'Locação de painel de comando elétrico para distribuição e proteção em obra.',
    long: long(
      'Painel de comando elétrico indicado para distribuição, proteção e acionamento de equipamentos em obra temporária. Dimensionamento conforme carga instalada e normas de instalação elétrica.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Distribuição e comando elétrico em obra' },
      { label: 'Alimentação', value: 'Conforme projeto e modelo disponível' },
      { label: 'Segurança', value: 'Instalação por eletricista habilitado' },
      DELIVERY,
    ],
  },
  'parafusadeira': {
    short: 'Locação de parafusadeira elétrica para parafusamento e montagem.',
    long: long(
      'Parafusadeira elétrica indicada para parafusamento em montagens de drywall, madeira, estruturas leves e instalações. Uso com bits e parafusos compatíveis, controle de profundidade e EPIs.',
    ),
    specs: powerToolSpecs('Parafusamento e montagem em obra'),
  },
  'plaina-220v': {
    short: 'Locação de plaina elétrica 220 V para desbaste e acabamento em madeira.',
    long: long(
      'Plaina elétrica 220 V indicada para desbaste, nivelamento e acabamento em madeira, compensado e batentes. Uso com lâmina afiada, passadas uniformes e proteção contra estilhaços.',
    ),
    specs: powerToolSpecs('Desbaste e acabamento em madeira'),
  },
  'retifica-220v': {
    short: 'Locação de retífica 220 V para corte, desbaste e rebarbação de metal.',
    long: long(
      'Retífica 220 V indicada para corte, desbaste e rebarbação de metal, soldas e peças em manutenção industrial e montagens metálicas. Uso com disco fino compatível e proteção contra faíscas.',
    ),
    specs: powerToolSpecs('Corte, desbaste e rebarbação de metal'),
  },
  'serra-circular-7-220v': {
    short: 'Locação de serra circular 7" 220 V para corte de madeira e chapas.',
    long: long(
      'Serra circular 7" 220 V indicada para corte reto de madeira, compensado e chapas com disco de 7 polegadas. Uso com guia, profundidade regulada e proteção contra rebarbas.',
    ),
    specs: powerToolSpecs('Corte de madeira e chapas com disco 7"'),
  },
  'serra-circular-9-220v': {
    short: 'Locação de serra circular 9" 220 V para corte de madeira e chapas grossas.',
    long: long(
      'Serra circular 9" 220 V indicada para corte de madeira maciça, vigas e chapas mais espessas com disco de 9 polegadas. Maior profundidade de corte para carpintaria e montagens no canteiro.',
    ),
    specs: powerToolSpecs('Corte de madeira e chapas com disco 9"'),
  },
  'serra-de-bancada': {
    short: 'Locação de serra de bancada para corte seriado de madeira e peças apoiadas.',
    long: long(
      'Serra de bancada indicada para corte seriado de madeira, ripas e peças apoiadas em bancada, com maior estabilidade e precisão que serras portáteis. Uso com guia, empurrador e proteção da lâmina.',
    ),
    specs: powerToolSpecs('Corte seriado de madeira em bancada'),
  },
  'serra-de-marmore-220v': {
    short: 'Locação de serra de mármore 220 V para corte de revestimentos e pedras.',
    long: long(
      'Serra de mármore 220 V indicada para corte de porcelanato, granito, mármore e revestimentos com disco diamantado e refrigeração. Uso com guia, corte contínuo e EPIs contra pó e estilhaços.',
    ),
    specs: powerToolSpecs('Corte de revestimentos, pedras e alvenaria'),
  },
  'serra-policorte-14-220v': {
    short: 'Locação de serra policorte 14" 220 V para corte de metal e perfis.',
    long: long(
      'Serra policorte 14" 220 V indicada para corte de barras, tubos, perfis metálicos e chapas com disco abrasivo de 14 polegadas. Uso com fixação da peça, proteção contra faíscas e ventilação adequada.',
    ),
    specs: powerToolSpecs('Corte de barras, perfis e metais com disco 14"'),
  },
  'serra-tico-tico-220v': {
    short: 'Locação de serra tico-tico 220 V para cortes retos e curvos em madeira.',
    long: long(
      'Serra tico-tico 220 V indicada para cortes retos e curvos em madeira, compensado, MDF e chapas finas. Ideal para recortes, aberturas e acabamentos que exigem manobrabilidade.',
    ),
    specs: powerToolSpecs('Cortes retos e curvos em madeira e chapas'),
  },
  'serra-sabre': {
    short: 'Locação de serra sabre para corte em demolição, tubos e madeira.',
    long: long(
      'Serra sabre indicada para corte em demolição, tubos, madeira embutida e materiais variados com lâmina compatível. Ferramenta versátil para serviços de manutenção e desmontagem no canteiro.',
    ),
    specs: powerToolSpecs('Corte em demolição, tubos, madeira e materiais variados'),
  },
  'transformador': {
    short: 'Locação de transformador para adequação de tensão em obra.',
    long: long(
      'Transformador indicado para adequação de tensão e alimentação de equipamentos compatíveis em obra temporária. Dimensionamento conforme potência demandada e instalação por profissional habilitado.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Adequação de tensão para equipamentos em obra' },
      { label: 'Alimentação', value: 'Conforme modelo e carga instalada' },
      { label: 'Segurança', value: 'Instalação por eletricista habilitado' },
      DELIVERY,
    ],
  },
  'vibrador-conc-port-makita': {
    short: 'Locação de vibrador de concreto portátil Makita para adensamento.',
    long: long(
      'Vibrador de concreto portátil Makita indicado para adensamento em vigas, pilares, lajes e fundações, reduzindo vazios e melhorando o acabamento da concretagem. Acoplamento de mangotes conforme diâmetro do serviço.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Adensamento de concreto' },
      { label: 'Fabricante', value: 'Makita' },
      { label: 'Acionamento', value: 'Elétrico portátil' },
      DELIVERY,
    ],
  },
  'vibrador-conc-port-bosh': {
    short: 'Locação de vibrador de concreto portátil Bosch para adensamento.',
    long: long(
      'Vibrador de concreto portátil Bosch indicado para adensamento em vigas, pilares, lajes e fundações, reduzindo vazios e melhorando o acabamento da concretagem. Acoplamento de mangotes conforme diâmetro do serviço.',
    ),
    specs: [
      { label: 'Aplicação', value: 'Adensamento de concreto' },
      { label: 'Fabricante', value: 'Bosch' },
      { label: 'Acionamento', value: 'Elétrico portátil' },
      DELIVERY,
    ],
  },
};

const catalog = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
let updated = 0;

for (const item of catalog) {
  if (item.category !== 'ferramentas-eletricas') {
    continue;
  }

  const patch = COPY[item.slug];
  if (!patch) {
    console.warn(`missing copy for slug: ${item.slug}`);
    continue;
  }

  item.shortDescription = patch.short;
  item.longDescription = patch.long;
  item.specs = patch.specs;
  updated += 1;
}

writeFileSync(JSON_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(`Updated ${updated} ferramentas-eletricas entries in ${JSON_PATH}`);

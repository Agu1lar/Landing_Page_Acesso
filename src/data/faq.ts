export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'orcamento',
    question: 'Como solicito um orçamento de locação?',
    answer:
      'Pelo formulário em Orçamento (nome, telefone, e-mail, cidade e equipamento), pelo WhatsApp comercial ou pelo telefone (31) 3376-3377, em horário de segunda a sexta, das 7h30 às 17h15. Quanto mais detalhes sobre o período e o local da obra, mais rápida será a proposta.',
  },
  {
    id: 'precos',
    question: 'Os preços aparecem no site?',
    answer:
      'Não. Os valores de locação são informados sob consulta, pois dependem do equipamento, do período (diária, semanal ou mensal), da logística de entrega e da disponibilidade da frota. Após o contato, o comercial envia a proposta com as condições vigentes.',
  },
  {
    id: 'entrega',
    question: 'Vocês entregam e retiram o equipamento na obra?',
    answer:
      'Sim. A Acesso Equipamentos realiza entrega e retirada na obra na região metropolitana de Belo Horizonte e em cidades do entorno, conforme o tipo de equipamento e a programação da frota. Equipamentos de maior porte podem exigir avaliação logística específica — nossa equipe orienta no orçamento.',
  },
  {
    id: 'regiao',
    question: 'Qual área geográfica é atendida?',
    answer:
      'A sede fica em Belo Horizonte (Praça Chuí, 100 — João Pinheiro). Atendemos a região metropolitana de BH e algumas cidades do interior de Minas Gerais. Na dúvida se atendemos sua obra, consulte o comercial antes de fechar o período.',
  },
  {
    id: 'periodo',
    question: 'Quais são os períodos de locação?',
    answer:
      'Trabalhamos com locação por diária, semanal e mensal, além de contratos B2B para construtoras e empreiteiras com demanda recorrente. O período mínimo e as condições de renovação são definidos na proposta comercial.',
  },
  {
    id: 'documentacao',
    question: 'Quais documentos são necessários para locar?',
    answer:
      'Para pessoa jurídica, costumam ser solicitados CNPJ, contrato social ou documentos da empresa e dados do responsável pela obra. Para pessoa física, documento de identificação e comprovantes conforme política comercial. A equipe informa a lista completa no momento da proposta. Podem ser exigidas garantias ou caução conforme o equipamento e o valor da locação.',
  },
  {
    id: 'nr',
    question: 'Os equipamentos atendem às normas de segurança (NR)?',
    answer:
      'A frota é mantida com revisões e política de qualidade alinhada às boas práticas do setor. Equipamentos aéreos e de acesso exigem planejamento de uso seguro, operadores capacitados e EPIs adequados — responsabilidades que devem ser observadas pelo contratante conforme NR-35, NR-18 e demais normas aplicáveis à atividade. Em caso de dúvida técnica, consulte nosso comercial.',
  },
  {
    id: 'plataformas',
    question: 'Preciso de operador para plataforma elevatória?',
    answer:
      'A locação é do equipamento; a operação deve ser feita por profissional habilitado, conforme a legislação e as normas de trabalho em altura. A Acesso não inclui operador na locação padrão (conforme escopo do serviço). Orientamos sobre requisitos gerais; o planejamento de segurança da obra é de responsabilidade do contratante.',
  },
  {
    id: 'treinamento',
    question: 'A Acesso oferece treinamento em plataformas elevatórias?',
    answer:
      'Sim. Além da locação, oferecemos treinamento para operação segura de plataformas elevatórias (tesoura, lança articulada e mastro), com conteúdo alinhado à NR-18 e boas práticas de trabalho em altura. Consulte a página Treinamento — plataformas aéreas ou fale com o comercial para turmas, certificado e valores.',
  },
  {
    id: 'prazos',
    question: 'Em quanto tempo recebo resposta do orçamento?',
    answer:
      'Buscamos responder em horário comercial (segunda a sexta, 7h30–17h15) o mais rápido possível. Demandas urgentes podem ser tratadas preferencialmente pelo WhatsApp, sujeitas à disponibilidade do equipamento na data solicitada.',
  },
  {
    id: 'retirada-loja',
    question: 'Posso retirar o equipamento na base?',
    answer:
      'Sim, quando acordado com o comercial, é possível retirada na sede em Belo Horizonte. A maioria dos clientes opta por entrega na obra para ganhar tempo no canteiro.',
  },
];

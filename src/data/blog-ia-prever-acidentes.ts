import { createBlogEditorImage, parseBlogTagMarkup } from '@/lib/blog-tag-markup';
import { estimateReadingMinutes } from '@/lib/blog-tiptap';
import type { BlogRelatedLink } from '@/types/blog-article';

const IMG_BASE = '/blog/ia-prever-acidentes-construcao';

const images = [
  createBlogEditorImage(
    `${IMG_BASE}/cena-risco.jpg`,
    'Canteiro de obras com visão computacional detectando risco de EPI e proximidade de máquinas',
  ),
  createBlogEditorImage(
    `${IMG_BASE}/deteccao-epi.jpg`,
    'Câmeras e IA identificando uso correto de capacete, colete e óculos de proteção',
  ),
  createBlogEditorImage(
    `${IMG_BASE}/plataforma-sensores.jpg`,
    'Plataforma elevatória com sensores de inclinação, vento, carga e proximidade',
  ),
  createBlogEditorImage(
    `${IMG_BASE}/iot-manutencao.jpg`,
    'Sensores IoT e painel de manutenção preditiva em equipamento de construção',
  ),
  createBlogEditorImage(
    `${IMG_BASE}/drones-obra.jpg`,
    'Drone com IA sobrevoando obra para levantamento, estoque e comparação com BIM',
  ),
];

const markup = `
Imagine o seguinte cenário em um canteiro movimentado: um funcionário entra em uma área de risco. Ele esqueceu o capacete. Outro operador caminha atrás de uma escavadeira em movimento. Há uma carga suspensa. Uma plataforma elevatória avançou para uma zona em que o vento já ultrapassou o limite permitido pelo fabricante.

Nenhum técnico percebeu a sequência completa. A Inteligência Artificial, sim — em menos de um segundo.

Essa capacidade já existe comercialmente e ainda é pouco difundida no Brasil. Construtoras e locadoras estão combinando [negrito]visão computacional[/negrito], drones, IoT e modelos preditivos para identificar riscos em tempo real e reduzir acidentes antes que se concretizem.

[img1]

[h2]Como a IA enxerga o canteiro[/h2]

A Inteligência Artificial não substitui o técnico de segurança. Ela amplia a cobertura do olhar humano, cruzando dados que nenhuma equipe consegue monitorar 24 horas por dia, ao mesmo tempo, em todos os pontos da obra.

As fontes mais comuns incluem:

[lista]
- Câmeras fixas e móveis
- Drones com câmeras e sensores
- Dispositivos IoT embarcados nas máquinas
- GPS e geofencing do canteiro
- Acelerômetros e sensores de vibração
- Sensores de inclinação e de carga
- Anemômetros (vento)
- Sensores de proximidade e de pessoa
[/lista]

O sistema compara o que “vê” e o que “sente” com regras de segurança, manuais de operação e o histórico daquela obra. Padrões sutis — como aproximação recorrente de um ponto cego ou inclinação perto do limite — geram alertas antes da falha ou da colisão.

[h2]Exemplos reais de prevenção[/h2]

[h3]1. Falta de EPI[/h3]

Câmeras com visão computacional identificam automaticamente a ausência de capacete, colete refletivo, óculos de proteção ou cinto/talabarte e disparam alertas para a equipe de segurança — muitas vezes ainda no momento em que a pessoa entra na zona controlada.

[img2]

[h3]2. Plataforma elevatória[/h3]

Em um modelo como uma lança articulada (por exemplo, uma Genie Z60), a IA integrada a sensores pode monitorar:

[lista]
- Excesso de inclinação do chassi ou da cesta
- Vento acima do limite operacional
- Operador sem talabarte
- Aproximação de rede elétrica
- Excesso de carga na plataforma
- Pessoa sob a área de trabalho elevada
[/lista]

[img3]

Tudo de forma contínua, sem depender apenas da atenção pontual de quem está no solo.

[h3]3. Caminhões e veículos leves na obra[/h3]

Sistemas de detecção ajudam a sinalizar risco de atropelamento, motorista distraído, velocidade acima do permitido no canteiro e ponto cego em manobras de ré — cenários clássicos de acidente grave em obras urbanas e industriais.

[h3]4. Escavações e bordas[/h3]

A IA também apoia a segurança em valas e cortes: pessoas próximas demais da borda, máquinas operando em distância crítica, movimentação de terra atípica e indícios de instabilidade que merecem inspeção imediata.

[h2]O papel do IoT: a obra que fala com o gestor[/h2]

Sensores enviam dados o tempo todo. Temperatura de motor, inclinação, horímetro, vibração, pressão hidráulica, velocidade do vento, nível de óleo, posição GPS e carga deixam de ser “números soltos” e viram indicadores de risco e de saúde do ativo.

A Inteligência Artificial transforma essa telemetria em decisão: quem precisa intervir, quando a máquina deve parar e qual manutenção antecipar.

[img4]

[h2]Manutenção preditiva: menos quebra, menos parada[/h2]

Em vez de esperar o equipamento falhar no meio do serviço, a IA aprende o comportamento normal da máquina. Quando o padrão muda — vibração fora da curva, temperatura atípica, ciclo hidráulico irregular —, o sistema avisa com antecipação.

[citacao]Exemplo de alerta: “Há 87% de probabilidade de falha na bomba hidráulica nas próximas 40 horas de operação.”[/citacao]

Isso reduz custo de emergência, retrabalho e, principalmente, evita situações em que a falha mecânica coincide com trabalho em altura ou carga suspensa. A manutenção preditiva com sensores e IA é uma das tendências mais fortes da construção civil rumo a [negrito]canteiros inteligentes[/negrito] em 2026.

[h2]Produtividade sob o mesmo radar[/h2]

Além da segurança, câmeras e modelos analíticos acompanham a dinâmica da obra. Atraso de frentes, acúmulo indevido de materiais, baixa produtividade em setores críticos e risco de colisão entre frentes podem gerar notificação automática para o engenheiro ou encarregado — sem planilha manual no fim do dia.

[h2]Drones com Inteligência Artificial[/h2]

Drones equipados com IA já conseguem, com pouca intervenção manual:

[lista]
- Contar e estimar estoque de materiais
- Gerar modelo 3D do canteiro
- Detectar fissuras e anomalias em estruturas
- Medir avanço físico da obra
- Comparar o executado com o projeto BIM
[/lista]

[img5]

O resultado é um registro objetivo do andamento e uma base visual para fiscalização e planejamento.

[h2]O que isso significa para plataformas elevatórias[/h2]

Essa mesma lógica se aplica diretamente às plataformas elevatórias — equipamentos em que estabilidade, vento, carga e proximidade de obstáculos definem a margem entre operação segura e incidente.

Imagine uma plataforma elevatória equipada com sensores inteligentes capazes de monitorar horímetro, inclinação, carga, nível do óleo, localização e proximidade de obstáculos. Integrados a um sistema de Inteligência Artificial, esses dados permitiriam prever falhas mecânicas, alertar sobre riscos operacionais e programar manutenções antes de uma parada inesperada. Essa tendência já faz parte da evolução da construção civil rumo aos canteiros inteligentes — e reforça a importância de frota bem mantida, operadores capacitados e planejamento de uso seguro no canteiro.

Na Acesso Equipamentos, o foco continua sendo disponibilizar plataformas e outros equipamentos com manutenção em dia, orientação técnica e treinamentos alinhados às boas práticas de trabalho em altura. Tecnologia preditiva e cultura de segurança caminham juntas: a IA antecipa riscos; a operação responsável evita que eles se concretizem.

[botao url="/orcamento"]Solicitar orçamento de plataformas[/botao]
`.trim();

export const BLOG_IA_PREVER_ACIDENTES = {
  slug: 'como-ia-pode-prever-acidentes-construcao-civil',
  title: 'Como a Inteligência Artificial pode prever acidentes antes que eles aconteçam na construção civil',
  excerpt:
    'Visão computacional, drones, IoT e manutenção preditiva já ajudam canteiros a detectar falta de EPI, riscos em plataformas elevatórias e falhas mecânicas em tempo real.',
  metaTitle: 'IA na construção civil: prever acidentes | Acesso',
  metaDescription:
    'Como visão computacional, IoT e IA ajudam a prever acidentes em obras: EPI, plataformas elevatórias, escavações, drones e manutenção preditiva no Brasil.',
  coverImageUrl: `${IMG_BASE}/cover.jpg`,
  publishedAt: '2026-07-14',
  relatedLinks: [
    { label: 'Plataformas elevatórias', href: '/categorias/plataformas-elevatorias' },
    { label: 'Treinamento em plataformas aéreas', href: '/treinamento-plataformas-aereas' },
    { label: 'Solicitar orçamento', href: '/orcamento' },
  ] satisfies BlogRelatedLink[],
  content: parseBlogTagMarkup(markup, images),
};

export const BLOG_IA_PREVER_ACIDENTES_READING_MINUTES = Math.max(
  8,
  estimateReadingMinutes(BLOG_IA_PREVER_ACIDENTES.content),
);

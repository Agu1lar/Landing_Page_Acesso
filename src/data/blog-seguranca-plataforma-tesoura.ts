import { createBlogEditorImage, parseBlogTagMarkup } from '@/lib/blog-tag-markup';
import { estimateReadingMinutes } from '@/lib/blog-tiptap';
import type { BlogRelatedLink } from '@/types/blog-article';

const IMG_BASE = '/blog/seguranca-plataforma-tesoura-anti-esmagamento';
const GITHUB_URL =
  'https://github.com/Agu1lar/Sistema-de-seguran-a-contra-esmagamento---Plataforma-Tesoura-prototipo-';

const images = [
  createBlogEditorImage(
    `${IMG_BASE}/tof-vista-geral.png`,
    'Vista geral da plataforma tesoura com três cones ToF apontando para cima',
  ),
  createBlogEditorImage(
    `${IMG_BASE}/tof-detalhe-cesto.png`,
    'Detalhe do cesto com sensores ToF VL53L1X e cones de leitura de 27 graus',
  ),
  createBlogEditorImage(
    `${IMG_BASE}/mvp-instalacao-cesto.png`,
    'Exemplo de instalação MVP no cesto com caixa, cabos e zona de extensão móvel',
  ),
  createBlogEditorImage(
    `${IMG_BASE}/comparativo-us-tof.png`,
    'Comparativo visual entre sensores ultrassônicos e ToF na mesma plataforma',
  ),
  createBlogEditorImage(
    `${IMG_BASE}/safealert-mvp-protoboard.png`,
    'Arranjo SafeAlert MVP na protoboard com ESP32, mux I2C e três VL53L1X',
  ),
];

const markup = `
Oi — quem escreve aqui é o criador deste site da Acesso Equipamentos. Além de cuidar da locação de plataformas no dia a dia, eu também prototipo coisas de segurança no tempo livre. Este post é sobre um projeto meu: um sistema anti-esmagamento para plataforma tesoura.

Não é produto certificado. É protótipo — Blender + ESP32 + sensores — para entender o problema de verdade: [negrito]geometria[/negrito]. Onde apontar o sensor, o que o campo de visão enxerga, e como cobrir o volume do cesto sem confundir parede, teto ou o próprio operador.

[img1]

[h2]O problema que eu queria resolver[/h2]

Na elevação, o risco clássico é o cesto (ou o operador) se aproximar demais de um teto, uma viga ou uma estrutura acima. Muita gente pensa “é só medir distância”. Na prática, um sensor 1D só devolve um número — e esse número pode ser parede ao lado, sol no FoV, ou ferramenta dentro do cesto.

Minha premissa desde o começo: a montagem eletrônica é viável. O que define se o sistema funciona no campo é [negrito]onde[/negrito] o feixe olha e [negrito]como[/negrito] você interpreta o hit.

Por isso os sensores ficam no [negrito]topo do guarda-corpo[/negrito], apontando para cima. Operador e ferramentas dentro do cesto ficam, em regra, abaixo do plano de emissão — isso reduz (não elimina) falso positivo por ocupação do cesto.

[h2]Máquina de referência e cobertura do cesto[/h2]

Usei as dimensões oficiais da [negrito]Skyjack SJIII 3226[/negrito] no Blender. O MVP cobre o [negrito]volume total do cesto[/negrito] — fixo + ponta — com três ToF VL53L1X (~27° de FoV):

[lista]
- Ponta_A no deck fixo (traseira)
- Meio no deck fixo
- Ponta_B na extensão (roll-out) — anda com o deck, com cabo em folga
[/lista]

Essa última decisão parece detalhe, mas não é: se a ponta abre e o sensor fica para trás, você perde a cobertura exatamente onde o operador costuma trabalhar.

[img2]

[h2]Como eu “penso” o obstáculo (sem trilateração clássica)[/h2]

Trilateração clássica assume três sensores vendo o [negrito]mesmo[/negrito] ponto. Com teto plano, cada ToF vê um ponto diferente do mesmo plano. Com parede lateral, muitas vezes só um FoV “raspa” a fachada.

Então o firmware faz outra coisa:

[lista]
- Calcula o ponto de impacto a partir da pose do sensor e da distância
- Pergunta se esse ponto está no envelope (prisma) acima do cesto
- Classifica teto × parede × fora de escopo
- Só então aplica faixas de severidade
[/lista]

Em português claro: parede ao lado [negrito]não[/negrito] deve travar a subida. Teto fechando com a elevação, sim — e o bloqueio só quando a colisão está iminente.

[h2]Faixas pensadas para o operador conseguir trabalhar[/h2]

A máquina [negrito]não pode[/negrito] travar na altura normal de serviço. O operador de ~1,80 m precisa alcançar o que está acima. Por isso as faixas (fonte da verdade no firmware) são:

[lista]
- Livre: distância > 2,50 m
- Amarelo: ≤ 2,50 m — atenção, ainda sobe
- Vermelho: ≤ 1,20 m — aperto + buzzer, ainda sobe
- Bloqueio: ≤ 0,60 m — colisão iminente, trava a subida
[/lista]

Bloqueio só no extremo. Antes disso, aviso. Histerese de liberação em 0,75 m para não ficar “piscando” o relé.

[img3]

[h2]Ultrassônico × ToF — por que o MVP vai de VL53L1X[/h2]

No Blender eu modelei os dois: lóbulo ultrassônico mais “largo” versus cone óptico do ToF (~27°). O ToF encaixa melhor no volume do cesto e spamma menos o entorno. Ultrassônico ficou como referência visual / comparativo.

[img4]

[h2]O hardware do SafeAlert MVP[/h2]

Do lado eletrônico, o arranjo é bem direto:

[lista]
- ESP32-S3 como cérebro
- TCA9548A (mux I2C) porque os três VL53L1X compartilham endereço
- LEDs de estado, buzzer e relé a contatos secos para [negrito]simular[/negrito] o bloqueio de subida
[/lista]

Orçamento-alvo de hardware na casa dos R$ 300–400. Caixa IP65 perto do painel do cesto; sensores no rail com cabo Cat; Ponta_B com laço de folga ≥ ~0,9 m na extensão.

[img5]

[h2]O que ainda é desafio de campo[/h2]

Alguns limites eu já documentei de propósito, para não romantizar o protótipo:

[lista]
- Sol direto em ~940 nm mata alcance do VL53L1X — capuz/sombra ajudam mais que “só filtro”
- Chuva e poeira na janela óptica viram leitura fantasma ou falha muda
- Protoboard aberta = bancada; campo pede housing e cover glass
- Isso [negrito]não[/negrito] é função de segurança certificada (EN 280 / ISO 13849 / SIL-PL ficam no roadmap de produto)
[/lista]

[citacao]Regra de projeto: leitura inválida ou ambient saturado → tratar como ameaça / bloquear, nunca como “livre”.[/citacao]

[h2]Por que isso aparece no blog da Acesso[/h2]

Porque vivemos de plataforma elevatória. Quanto mais a gente entende geometria de risco, envelope do cesto e limites reais de sensor, melhor conversamos com cliente, operador e técnico de segurança — mesmo quando a solução do dia a dia ainda é frota bem mantida, NR e treinamento.

Se quiser explorar o modelo 3D, o firmware e o README completo, o repositório está aberto no GitHub:

[link url="${GITHUB_URL}" nova-aba]Ver o projeto no GitHub[/link]

E se precisar locar plataforma para obra (com ou sem conversa sobre segurança embarcada), o caminho comercial continua aqui:

[botao url="/orcamento"]Solicitar orçamento de plataformas[/botao]
`.trim();

export const BLOG_SEGURANCA_PLATAFORMA_TESOURA = {
  slug: 'prototipo-anti-esmagamento-plataforma-tesoura',
  title: 'Protótipo de segurança anti-esmagamento em plataforma tesoura (ToF + ESP32)',
  excerpt:
    'Eu, criador deste site da Acesso, conto em primeira pessoa um protótipo meu: sensores ToF no cesto, geometria de FoV e bloqueio só na iminência — com Blender e ESP32.',
  metaTitle: 'Anti-esmagamento em plataforma tesoura | Acesso',
  metaDescription:
    'Protótipo didático de segurança em plataforma tesoura: ToF VL53L1X, ESP32, cobertura do cesto, faixas de alerta e limites de campo. Código aberto no GitHub.',
  coverImageUrl: `${IMG_BASE}/cover.png`,
  publishedAt: '2026-07-24',
  relatedLinks: [
    { label: 'Plataformas elevatórias', href: '/categorias/plataformas-elevatorias' },
    { label: 'Treinamento em plataformas aéreas', href: '/treinamento-plataformas-aereas' },
    { label: 'Solicitar orçamento', href: '/orcamento' },
  ] satisfies BlogRelatedLink[],
  content: parseBlogTagMarkup(markup, images),
};

export const BLOG_SEGURANCA_PLATAFORMA_TESOURA_READING_MINUTES = Math.max(
  8,
  estimateReadingMinutes(BLOG_SEGURANCA_PLATAFORMA_TESOURA.content),
);

export const BLOG_SEGURANCA_PLATAFORMA_TESOURA_GITHUB_URL = GITHUB_URL;

# Roadmap — Landing Page & Plataforma de Locação de Equipamentos

> **Arquivo temporário** — planejamento interno. Pode ser removido ou movido para `/docs` após validação com stakeholders.
>
> **Projeto:** Site institucional + conversão (leads) para empresa de locação de equipamentos aéreos e de construção (máquinas, betoneiras, marteletes, compactadores, etc.)
>
> **Stack base:** Next.js 16 (App Router), TypeScript, Tailwind CSS, next-intl, Drizzle ORM, PostgreSQL/PGlite, Zod, React Hook Form.
>
> **Última atualização:** 2026-05-18 (hospedagem adiada; melhorias concorrentes mapeadas)

---

## Índice

1. [Visão e objetivos](#1-visão-e-objetivos)
2. [Princípios de arquitetura](#2-princípios-de-arquitetura)
3. [Fases do produto](#3-fases-do-produto)
4. [Roadmap por sprint (detalhado)](#4-roadmap-por-sprint-detalhado)
5. [Estrutura de páginas e rotas](#5-estrutura-de-páginas-e-rotas)
6. [Modelo de dados](#6-modelo-de-dados)
7. [Design system e UX](#7-design-system-e-ux)
8. [SEO, performance e acessibilidade](#8-seo-performance-e-acessibilidade)
9. [Integrações e operações](#9-integrações-e-operações)
10. [Qualidade, testes e deploy](#10-qualidade-testes-e-deploy)
11. [Riscos e mitigações](#11-riscos-e-mitigações)
12. [Critérios de pronto (Definition of Done)](#12-critérios-de-pronto-definition-of-done)
13. [Backlog futuro (pós-MVP)](#13-backlog-futuro-pós-mvp)
14. [Checklist de kickoff](#14-checklist-de-kickoff)

---

## 1. Visão e objetivos

### 1.1 Visão do produto

Construir uma presença digital **profissional, rápida e orientada a conversão** que apresente o catálogo de equipamentos, transmita confiança (frota real, certificações, obras atendidas) e capture **orçamentos qualificados** com o mínimo de fricção — especialmente em mobile, onde o público de obras costuma navegar.

### 1.2 Objetivos de negócio (mensuráveis)

| Objetivo | Métrica sugerida | Meta inicial (90 dias) |
|----------|------------------|------------------------|
| Gerar leads qualificados | Envios de formulário + cliques WhatsApp | Baseline + crescimento mês a mês |
| Aumentar visibilidade local | Impressões/cliques orgânicos (GSC) | Indexação de todas as páginas de equipamento |
| Reduzir tempo de resposta comercial | % leads com equipamento + período preenchidos | > 70% dos formulários completos |
| Transmitir credibilidade | Taxa de rejeição, tempo na página | < 55% rejeição na home |
| Performance técnica | LCP, INP, CLS (Core Web Vitals) | “Bom” em mobile (PageSpeed) |

### 1.3 Público-alvo

- Construtoras, empreiteiras e autônomos (pedreiros, equipes de obra).
- Responsáveis por compras/locação em obras civis, reformas e infraestrutura.
- Clientes que buscam equipamentos **aéreos** (plataformas, tesouras) e **terra/compactação** (betoneiras, marteletes, compactadores, etc.).

### 1.4 Fora de escopo (MVP / Fase 1)

- Reserva online com calendário de disponibilidade em tempo real.
- Pagamento online e assinatura digital de contrato.
- Portal do cliente com histórico de locações.
- ERP completo (faturamento, manutenção de frota, NF).
- App mobile nativo.

---

## 2. Princípios de arquitetura

### 2.1 Decisões estruturais

| Decisão | Escolha recomendada | Motivo |
|---------|---------------------|--------|
| Framework | Manter Next.js App Router | SEO, SSG/ISR, ecossistema maduro |
| Site público vs admin | Rotas separadas `(marketing)` / `(admin)` futuro | Segurança e clareza |
| Catálogo (Fase 1) | Conteúdo em `src/content/` (JSON/MDX) | Simples, versionado, rápido para lançar |
| Leads (Fase 1) | API Route + Drizzle + PostgreSQL | Persistência e relatórios básicos |
| Autenticação | Sem Clerk no MVP | Landing não exige login |
| UI | Tailwind + shadcn/ui (Radix) | Consistência e acessibilidade |
| i18n | `pt-BR` default; EN opcional depois | Mercado principal Brasil |
| Imagens | `next/image` + pasta `public/` ou CDN | Performance e LCP |

### 2.2 Estrutura de pastas alvo

```
src/
├── app/[locale]/(marketing)/       # Site público
│   ├── page.tsx
│   ├── equipamentos/
│   ├── categorias/
│   ├── orcamento/
│   ├── sobre/
│   └── contato/
├── app/api/                        # leads, webhooks
├── components/
│   ├── ui/                         # shadcn (Button, Card, Input…)
│   ├── marketing/                  # Hero, CategoryGrid, EquipmentCard
│   ├── forms/                      # QuoteForm, ContactForm
│   └── layout/                     # Header, Footer, MobileNav
├── content/
│   ├── equipamentos/*.json
│   ├── categorias.json
│   └── depoimentos.json
├── lib/
│   ├── equipment.ts                # loaders do catálogo
│   ├── leads.ts
│   └── whatsapp.ts
├── types/
│   └── equipment.ts
├── validations/
│   └── quote.ts
└── utils/
    └── AppConfig.ts
```

### 2.3 Fluxo de conversão

```
Descoberta (SEO/ads) → Home/Categoria → Lista → Detalhe do equipamento
                              ↓
              Orçamento (form) ou WhatsApp (mensagem pré-preenchida)
                              ↓
                    Lead no banco + notificação (email/CRM)
```

---

## 3. Fases do produto

### Fase 0 — Fundação (Semanas 1–2)

Preparar repositório, identidade, conteúdo mínimo e remover demos do boilerplate.

**Entregáveis:** projeto limpo, `pt-BR`, design tokens, inventário aprovado. **Sem** domínio/hospedagem oficial nesta fase.

---

### Fase 1 — MVP Landing + Catálogo + Leads (Semanas 3–8)

Site público completo para lançamento comercial.

**Entregáveis:**

- Home, categorias, listagem e detalhe de equipamentos
- Formulário de orçamento e contato
- Persistência de leads
- SEO básico, sitemap, analytics
- **Preview para aprovação do cliente** (Vercel `*.vercel.app`, sem domínio oficial)
- Deploy produção e domínio **somente após sign-off** (ver Sprint 10)

---

### Fase 2 — Consolidação e conteúdo (Semanas 9–12)

Escala de catálogo, prova social, otimizações e ferramentas para o time comercial.

**Entregáveis:**

- Catálogo expandido (30+ itens ou integração CMS)
- Páginas de confiança (obras, certificações, FAQ)
- Dashboard interno simples de leads (opcional)
- Melhorias de performance e testes E2E críticos

---

### Fase 3 — Plataforma (Trimestre 2+)

Somente se o negócio exigir: disponibilidade, reservas, integração ERP, área logada.

**Entregáveis possíveis:** admin de frota, status disponível/indisponível, integração Omie/similar, portal cliente.

---

## 4. Roadmap por sprint (detalhado)

> **Convenção:** sprints de 2 semanas. Ajuste datas conforme capacidade da equipe (1 dev full-stack ≈ roadmap abaixo).

---

### Sprint 0 — Kickoff e alinhamento (3–5 dias)

| ID | Tarefa | Responsável | Saída |
|----|--------|-------------|-------|
| 0.1 | Workshop com stakeholders: serviços, regiões atendidas, diferenciais | Negócio + Dev | ✅ `docs/REQUISITOS.md` v1.0 (2026-05-18) |
| 0.2 | Inventário de equipamentos (planilha: nome, categoria, specs, foto, preço “a partir de”) | Cliente | ✅ Aprovado — 110 itens (`inventario-equipamentos.csv`) |
| 0.3 | Definir tom de voz, cores, logo, tipografia | Design/Cliente | ✅ `docs/BRAND-GUIDE.md` + `docs/brand/` (validação §6 — Cezar pendente) |
| 0.4 | ~~Registrar domínio/hospedagem~~ | Ops | ⏸ **Adiado → Sprint 10** (após aprovação da landing) |
| 0.5 | Mapear concorrentes locais (3–5 sites) | Marketing | ✅ `docs/CONCORRENTES-REFERENCIAS.md` (5 concorrentes) |

**Critério de saída:** planilha de equipamentos + identidade visual aprovada. Domínio e DNS **não** bloqueiam Sprints 1–9.

> **Ordem de prioridade:** construir e validar a landing em preview → cliente aprova (Sprint 8) → só então domínio, SSL e go-live (Sprint 10).

---

### Sprint 1 — Limpeza do boilerplate e fundação técnica (em andamento)

**Direção UX:** reformulação profissional — ver [docs/DESIGN-UX.md](docs/DESIGN-UX.md). Não replicar layout do site legado.


| ID | Tarefa | Detalhes técnicos |
|----|--------|-------------------|
| 1.1 | Remover demos | Excluir/adaptar: `counter`, `portfolio`, `Sponsors`, `DemoBanner`, `DemoBadge` |
| 1.2 | Configurar `pt-BR` | `AppConfig`, `src/locales/pt-BR.json`, routing next-intl |
| 1.3 | Atualizar `AppConfig` | Nome empresa, URLs, redes sociais, telefone, WhatsApp |
| 1.4 | Instalar shadcn/ui | Button, Card, Input, Textarea, Select, Badge, Sheet (menu mobile) |
| 1.5 | Design tokens Tailwind | Cores primária/secundária, radius, sombras em `globals.css` |
| 1.6 | Layout base | `Header` (logo, nav, CTA), `Footer` (contato, mapa, links) |
| 1.7 | Template marketing | Refatorar `BaseTemplate` → layout locadora |
| 1.8 | Variáveis de ambiente | Documentar `.env.local`: contato, WhatsApp, email API |
| 1.9 | **Busca global** | ✅ `GlobalSearch` (Ctrl+K) — diferencial vs concorrentes (0.5) |

**Critério de saída:** `npm run dev` com home esqueleto profissional, sem conteúdo de boilerplate visível.

---

### Sprint 2 — Modelo de conteúdo e catálogo (backend leve)

| ID | Tarefa | Detalhes técnicos |
|----|--------|-------------------|
| 2.1 | Tipos TypeScript | `Equipment`, `Category`, `Specification`, `PricingUnit` |
| 2.2 | Schema JSON | `src/content/equipamentos/*.json`, `categorias.json` |
| 2.3 | Loaders | `getAllEquipment()`, `getBySlug()`, `getByCategory()`, `getFeatured()` |
| 2.4 | Validar conteúdo com Zod | Schema de runtime para JSON (evitar deploy quebrado) |
| 2.5 | Seed inicial | 8–12 equipamentos reais (mix aéreo + construção) |
| 2.6 | Imagens | Convenção de nomes, placeholders até fotos reais |

**Critério de saída:** catálogo consumível via funções tipadas, sem banco ainda.

---

### Sprint 3 — Páginas de catálogo (front)

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 3.1 | `/equipamentos` | Grid responsivo, filtros por categoria (client ou searchParams) |
| 3.2 | `/equipamentos/[slug]` | Galeria, specs tabela, CTA orçamento/WhatsApp, breadcrumbs |
| 3.3 | `/categorias/[slug]` | ✅ Landing por categoria + SSG |
| 3.4 | Componentes | `EquipmentCard`, `EquipmentGallery`, `SpecTable`, `PriceHint` |
| 3.5 | Estados vazios | Mensagem amigável se filtro não retornar itens |
| 3.6 | generateStaticParams | SSG para slugs de equipamento e categoria |
| 3.7 | **SpecTable em plataformas aéreas** | ✅ `SpecTable` + variant `aerial` no detalhe |
| 3.8 | **Texto SEO por categoria** | ✅ `categories-seo.ts` (~300+ palavras × 8 categorias) |
| 3.9 | **Equipamentos relacionados** | ✅ `getRelatedEquipment` + grid no detalhe |

**Critério de saída:** navegação completa catálogo → detalhe em mobile e desktop.

---

### Sprint 4 — Home e páginas institucionais

| ID | Tarefa | Seções / conteúdo |
|----|--------|-------------------|
| 4.1 | Home — Hero | Headline, sub, CTA duplo (Orçamento + WhatsApp), imagem frota |
| 4.2 | Home — Categorias | Cards clicáveis (Aéreos, Concretagem, Compactação, Demolição…) |
| 4.3 | Home — Destaques | 6 equipamentos em destaque (`featured: true`) |
| 4.4 | Home — Confiança | Números: **desde 2013**, **equipe 20+ anos**, **110 equipamentos**, categorias — ref. Lokaforte |
| 4.5 | Home — Como funciona | ✅ `StepsSection` — escolhe → orça → entrega/retirada |
| 4.6 | Home — CTA final | Banner repetindo conversão |
| 4.7 | `/sobre` | História, missão, frota, **NR / documentação locação** (autoridade vs LOMAQ/Santos) |
| 4.8 | `/contato` | Endereço, mapa embed, horário, telefones |
| 4.9 | **Depoimentos Google** | ✅ `TestimonialsSection` + 3 avaliações Google (pt-BR) |
| 4.10 | **Âncora geo RMBH** | Menção região metropolitana / entrega em obras BH — SEO local |

**Critério de saída:** home comunica proposta de valor em < 10s de leitura.

---

### Sprint 5 — Formulários e captura de leads

| ID | Tarefa | Detalhes técnicos |
|----|--------|-------------------|
| 5.1 | Schema DB Drizzle | Tabela `leads`: nome, email, telefone, empresa, equipamento, período, cidade, mensagem, origem, createdAt |
| 5.2 | Migration | `npm run db:generate` + `db:migrate` |
| 5.3 | API `POST /api/leads` | Validação Zod, rate limit (Arcjet já no projeto) |
| 5.4 | `QuoteForm` | Pré-preencher `?equipamento=slug` na URL |
| 5.5 | `ContactForm` | Assunto opcional |
| 5.6 | Feedback UX | Toast sucesso/erro, loading states |
| 5.7 | Notificação | Email (Resend/SendGrid) ou webhook para planilha/CRM |
| 5.8 | Página `/orcamento` | Form principal + resumo lateral (FAQ link para `/faq`) |
| 5.9 | **WhatsApp contextual** | ✅ `buildWhatsAppMessage` + slug + origem por página |

**Critério de saída:** lead salvo no banco + e-mail/notificação recebida em ambiente de teste.

---

### Sprint 6 — WhatsApp, SEO e legal

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 6.1 | Helper WhatsApp | `buildWhatsAppUrl({ equipment, city })` com encode |
| 6.2 | Botão flutuante mobile | Fixo canto inferior, acessível |
| 6.3 | Metadata | `generateMetadata` por página e equipamento |
| 6.4 | Open Graph | Imagem por equipamento (1200×630) |
| 6.5 | `sitemap.ts` | Incluir equipamentos e categorias dinamicamente |
| 6.6 | `robots.ts` | Produção index, preview noindex |
| 6.7 | JSON-LD | `LocalBusiness` + `Product` nos detalhes |
| 6.8 | Páginas legais | Privacidade (LGPD), Termos (se necessário) |
| 6.9 | Cookie banner | Se usar analytics com cookies |
| 6.10 | **Página `/faq`** | ✅ 10 perguntas + accordion + link no orçamento/rodapé |
| 6.11 | **Títulos SEO padronizados** | ✅ `equipmentSeoTitle` no detalhe; categorias já tinham meta |
| 6.12 | **Google Meu Negócio** | Alinhar NAP (nome, endereço, telefone) com rodapé e schema LocalBusiness |

**Critério de saída:** compartilhar link de equipamento no WhatsApp com preview correto.

---

### Sprint 7 — Polish, acessibilidade e performance

| ID | Tarefa | Meta |
|----|--------|------|
| 7.1 | Auditoria a11y | Focus visible, labels, contraste WCAG AA |
| 7.2 | Otimizar imagens | WebP/AVIF, sizes corretos, lazy below fold |
| 7.3 | Fontes | `next/font` — evitar layout shift |
| 7.4 | Skeleton / loading | Lista e detalhe |
| 7.5 | 404 customizada | Sugestão de categorias populares |
| 7.6 | PageSpeed | LCP < 2.5s mobile (alvo) |
| 7.7 | Revisão copy | Ortografia, termos técnicos corretos (betoneira, plataforma…) |
| 7.8 | **Hierarquia de CTA** | ✅ `ConversionCtas` + header WhatsApp primeiro |

**Critério de saída:** Lighthouse Performance ≥ 85 mobile (alvo interno).

---

### Sprint 8 — Aprovação da landing (preview, sem domínio oficial)

> **Objetivo:** cliente valida UX, textos e fluxos antes de qualquer custo de domínio/DNS.

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 8.1 | Deploy **preview** | Guia: `docs/DEPLOY-PREVIEW-VERCEL.md` + `vercel.json` (`build:next`) |
| 8.2 | Roteiro de validação | ✅ `docs/PREVIEW-VALIDACAO.md` (checklist Cezar + sign-off) |
| 8.3 | Ajustes do feedback | Copy, ordem de seções, fotos placeholder → reais conforme disponível |
| 8.4 | **Sign-off** | Cezar / Flaviano aprovam versão para go-live |
| 8.5 | Testes E2E Playwright | Fluxos: home → detalhe → orçamento; envio form mock |
| 8.6 | CI verde | lint, types, test, build |

**Critério de saída:** aprovação formal registrada; lista de ajustes bloqueantes zerada ou aceita como pós-go-live.

---

### Sprint 9 — Conteúdo e diferenciação (pós-aprovação preview)

| ID | Tarefa | Prioridade | Ref. concorrentes |
|----|--------|------------|-------------------|
| 9.1 | Fotos reais da frota | Alta | Todos (gap vs Acesso) |
| 9.2 | Cases de obra / logos clientes | Alta | Santos, Lokaforte |
| 9.3 | Expandir textos long-tail | Alta | Central Loc, Loca Exata |
| 9.4 | Blog ou `/dicas` (SEO informacional) | Média | Lokaforte |
| 9.5 | Avaliar CMS (Sanity/Payload) | Média | — |
| 9.6 | Painel `/admin/leads` | Média | — |
| 9.7 | Landing por bairro/região RMBH (opcional) | Baixa | Lokaforte |
| 9.8 | Testes A/B de CTA (PostHog) | Baixa | — |

**Critério de saída:** conteúdo diferenciado publicado no preview; pronto para apontar domínio.

---

### Sprint 10 — Hospedagem, domínio e go-live (último)

> Reúne a antiga tarefa **0.4** e o deploy de produção. **Só iniciar após Sprint 8 aprovado.**

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 10.1 | Registrar domínio / e-mail comercial | Ops — se ainda não existir |
| 10.2 | Vercel produção + Neon (Postgres) | `DATABASE_URL` produção |
| 10.3 | Migrations em produção | `db:migrate` no pipeline |
| 10.4 | DNS + SSL + redirect `www` | Apontar para Vercel |
| 10.5 | PostHog / GA4 produção | Eventos: `quote_submit`, `whatsapp_click`, `equipment_view` |
| 10.6 | Google Search Console | Sitemap no domínio oficial |
| 10.7 | Checklist go-live | Seção 14 (itens de produção) |
| 10.8 | Redirect site legado (se houver) | `acessoequipamentos.com.br` → novo |

**Critério de saída:** site no ar em domínio oficial, formulário e WhatsApp funcionando em produção.

---

### Melhorias dos concorrentes → mapa no roadmap

Fonte: [docs/CONCORRENTES-REFERENCIAS.md](docs/CONCORRENTES-REFERENCIAS.md)

| Recomendação (0.5) | Status no projeto | Sprint |
|--------------------|-------------------|--------|
| Busca global no header | ✅ Implementado | Sprint 1 |
| Specs em tabela (plataformas aéreas) | Parcial | 3.7 |
| WhatsApp + mensagem com equipamento | Parcial | 5.9, 6.1 |
| FAQ (entrega, NR, documentação) | ✅ | 6.10 |
| Texto SEO por categoria (300+ palavras) | Pendente | 3.8 |
| Páginas por equipamento (long-tail) | ✅ 110 slugs SSG | Sprint 3 |
| Números na home (credibilidade) | Parcial | 4.4 |
| Depoimentos Google pt-BR | ✅ | 4.9 |
| Equipamentos relacionados | Pendente | 3.9 |
| Hierarquia CTA (sem excesso de canais) | ✅ | 7.8 |
| Alinhar Google Meu Negócio (NAP) | Pendente | 6.12 |
| Domínio / hospedagem / SSL | Adiado | **10** (não Sprint 0) |

---

## 5. Estrutura de páginas e rotas

### 5.1 Mapa de rotas (Fase 1)

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | SSG | Home |
| `/equipamentos` | SSG | Catálogo completo |
| `/equipamentos/[slug]` | SSG | Detalhe |
| `/categorias/[slug]` | SSG | Listagem filtrada + texto SEO |
| `/orcamento` | SSR/SSG + client form | Formulário principal |
| `/sobre` | SSG | Institucional |
| `/contato` | SSG | Contato + mapa |
| `/privacidade` | SSG | LGPD |
| `/faq` | SSG | Entrega, NR, documentação, prazos (ref. Santos) |
| `/api/leads` | API | POST leads |

### 5.2 Categorias sugeridas (inicial)

1. **Equipamentos aéreos** — plataformas elevatórias, tesouras, articulados
2. **Concretagem** — betoneiras, vibradores, mangotes
3. **Compactação** — placas vibratórias, sapatas, rolos (se houver)
4. **Demolição / perfuração** — marteletes, rompedores, britadeiras
5. **Energia e iluminação** — geradores, torres (se aplicável)
6. **Acesso e andaimes** — treliças, escadas, linhas de vida (se aplicável)

*Ajustar conforme frota real da empresa.*

---

## 6. Modelo de dados

### 6.1 Equipamento (conteúdo — JSON)

```json
{
  "slug": "betoneira-400l",
  "nome": "Betoneira 400L",
  "categoria": "concretagem",
  "descricaoCurta": "Ideal para obras de médio porte.",
  "descricaoLonga": "…",
  "especificacoes": [
    { "label": "Capacidade", "valor": "400 litros" },
    { "label": "Motor", "valor": "2CV monofásico" }
  ],
  "imagens": ["/assets/equipamentos/betoneira-400l-01.webp"],
  "precoAPartirDe": 120,
  "unidadePreco": "dia",
  "destaque": true,
  "tags": ["obra", "concreto"],
  "disponivel": true
}
```

### 6.2 Lead (banco — Drizzle)

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| id | serial | auto |
| nome | string | sim |
| email | string | sim |
| telefone | string | sim |
| empresa | string | não |
| equipamentoSlug | string | não |
| equipamentoNome | string | não |
| dataInicio | date | não |
| dataFim | date | não |
| cidade | string | sim |
| mensagem | text | não |
| origem | enum | sim (`orcamento`, `contato`, `whatsapp_redirect`) |
| status | enum | default `novo` |
| createdAt | timestamp | auto |

---

## 7. Design system e UX

### 7.1 Diretrizes visuais

- **Estética:** industrial moderna — limpa, robusta, sem “template genérico de IA”.
- **Fotografia:** frota real > banco de imagens; mesma proporção nos cards.
- **Hierarquia:** título forte → benefício → spec → preço “a partir de” → CTA.
- **Mobile first:** menu hamburger (Sheet), botão WhatsApp fixo, formulários curtos.

### 7.2 Componentes obrigatórios

- `SiteHeader`, `SiteFooter`, `MobileNav`
- `HeroSection`, `CategoryGrid`, `EquipmentCard`, `EquipmentGallery`
- `QuoteForm`, `ContactForm`, `WhatsAppButton`, `TrustBar`, `StepsSection`
- `Breadcrumbs`, `PageHeader`, `EmptyState`

### 7.3 Microcopy de CTA (padrão)

- Primário: **Solicitar orçamento**
- Secundário: **Falar no WhatsApp**
- Detalhe: **Tenho interesse neste equipamento**

---

## 8. SEO, performance e acessibilidade

### 8.1 SEO

- Título: `{Equipamento} para locação em {Cidade} | {Marca}`
- URLs limpas: `/equipamentos/betoneira-400l`
- Texto único por categoria (mín. 300 palavras em páginas de categoria)
- Internal linking: home → categorias → equipamentos relacionados
- Alt text descritivo em todas as imagens

### 8.2 Performance (metas)

| Métrica | Meta |
|---------|------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| TTFB | < 600ms (com CDN) |

### 8.3 Acessibilidade

- Navegação por teclado completa
- `aria-label` em ícones
- Contraste mínimo 4.5:1 para texto
- Formulários com `label` associado e mensagens de erro claras

---

## 9. Integrações e operações

| Integração | Fase | Uso |
|------------|------|-----|
| WhatsApp (`wa.me`) | 1 | Conversão rápida |
| Resend / SendGrid | 1 | Email de novo lead |
| PostHog / GA4 | 1 | Analytics |
| Google Search Console | 1 | SEO |
| Google Maps embed | 1 | Contato |
| Sentry | 1 | Erros produção |
| Neon / Postgres | 1 | Leads |
| CRM (RD, Pipedrive, webhook) | 2 | Automação comercial |
| CMS headless | 2 | Cliente edita catálogo |
| Clerk / Better Auth | 3 | Área admin |

### 9.1 Eventos de analytics (nomenclatura)

- `page_view` (automático)
- `equipment_view` — `{ slug }`
- `quote_form_start`
- `quote_form_submit` — `{ slug, cidade }`
- `whatsapp_click` — `{ origem, slug? }`
- `category_filter` — `{ categoria }`

---

## 10. Qualidade, testes e deploy

### 10.1 Pirâmide de testes

| Camada | O quê | Ferramenta |
|--------|-------|------------|
| Unit | Zod, loaders, helpers | Vitest |
| Component | Formulários críticos | Vitest + Testing Library |
| E2E | Fluxos de conversão | Playwright |
| Visual | Regressão UI (opcional) | Storybook + Chromatic |

### 10.2 Ambientes

| Ambiente | URL | Banco | Quando |
|----------|-----|-------|--------|
| Local | localhost:3000 | PGlite `local.db` | Desenvolvimento |
| Preview | `*.vercel.app` | Neon branch / preview | **Sprint 8 — aprovação cliente** |
| Produção | domínio oficial | Neon produção | **Sprint 10 — após sign-off** |

### 10.3 Pipeline de deploy

1. PR → CI (lint, types, test, build)
2. Preview URL → **validação e aprovação** (Sprint 8)
3. Ajustes de conteúdo/UX (Sprint 9, se necessário)
4. Domínio + DNS + deploy produção (Sprint 10)

---

## 11. Riscos e mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Fotos/conteúdo atrasam | Alto | Lançar com subset da frota + placeholders profissionais |
| Catálogo grande sem CMS | Médio | Migrar para CMS na Fase 2; manter schema JSON |
| Spam em formulários | Médio | Arcjet rate limit + honeypot |
| SEO lento no início | Médio | GSC + páginas de categoria + blog depois |
| Escopo creep (reservas, pagamento) | Alto | Roadmap em fases; MVP = leads apenas |
| Clerk/config extra no boilerplate | Baixo | Remover auth do MVP |
| Preços desatualizados no site | Médio | Usar “a partir de” + “consulte”; revisão mensal |

---

## 12. Critérios de pronto (Definition of Done)

Uma tarefa só está **Done** quando:

- [ ] Código revisado (PR ou self-review checklist)
- [ ] TypeScript sem erros (`npm run check:types`)
- [ ] Lint passando (`npm run lint`)
- [ ] Responsivo testado (375px, 768px, 1280px)
- [ ] Textos em `pt-BR` (sem strings do boilerplate)
- [ ] Acessibilidade básica (labels, foco, contraste)
- [ ] SEO: title + description na página
- [ ] Sem regressão nos fluxos E2E críticos (se aplicável)

**MVP Aprovação (Sprint 8) Done** quando:

- [ ] Preview publicado (`*.vercel.app`)
- [ ] Cliente validou home, catálogo, busca, detalhe aéreo, mobile
- [ ] Sign-off Cezar/Flaviano

**MVP Go-live (Sprint 10) Done** quando:

- [ ] Todas as rotas da Fase 1 no domínio oficial
- [ ] Mínimo 8 equipamentos com foto real ou aprovada
- [ ] Formulário salva lead + notificação funciona
- [ ] WhatsApp testado em iOS e Android
- [ ] Sitemap no Search Console
- [ ] Lighthouse mobile Performance ≥ 85 (alvo)
- [ ] Página de privacidade publicada

---

## 13. Backlog futuro (pós-MVP)

### Produto

- [x] Busca global no header (Ctrl+K) — **diferencial vs concorrentes**
- [ ] Comparador de equipamentos (2–3 itens)
- [ ] Calculadora rápida de período (dias × diária estimada)
- [ ] “Equipamentos relacionados” no detalhe → **Sprint 3.9**
- [ ] Multi-unidade / filiais por cidade
- [ ] Disponibilidade (`disponivel: false` com badge “consulte prazo”)

### Tecnologia

- [ ] CMS headless (Sanity/Payload)
- [ ] Admin de leads com login
- [ ] Integração ERP (estoque/disponibilidade)
- [ ] Geração de PDF de proposta
- [ ] PWA para equipe comercial
- [ ] Internacionalização EN/ES

### Marketing

- [ ] Landing pages por cidade (`/locacao-betoneira-curitiba`)
- [ ] Google Ads conversion tracking
- [ ] Meta Pixel
- [ ] Programa de indicação

---

## 14. Checklists

### 14.1 Kickoff (Sprint 0 — concluído em grande parte)

- [x] Nome oficial e slogan
- [x] Logo
- [x] Paleta e fontes
- [x] Telefone, WhatsApp, endereço
- [x] Inventário 110 equipamentos
- [ ] Fotos por equipamento (mín. 1) — Sprint 9
- [ ] Certificações / NR (texto para `/sobre` e `/faq`)
- [ ] Depoimentos Google exportáveis
- [ ] Responsável por aprovar textos (Cezar)

### 14.2 Aprovação da landing (Sprint 8 — antes do domínio)

- [ ] Link preview enviado ao cliente
- [ ] Home, equipamentos, busca, orçamento testados no celular
- [ ] WhatsApp abre com mensagem correta a partir do detalhe
- [ ] Textos e tom formal aprovados
- [ ] Sign-off por escrito (e-mail/WhatsApp)

### 14.3 Go-live (Sprint 10 — após aprovação)

- [ ] Domínio registrado e DNS configurado
- [ ] SSL ativo, redirect `www`
- [ ] Banco produção + migrations
- [ ] Analytics e Search Console
- [ ] Redirect do site legado (se aplicável)

---

## Cronograma resumido (visão executiva)

| Fase | Duração estimada | Entrega principal |
|------|------------------|-------------------|
| Fase 0 — Kickoff | Concluído | Requisitos, inventário, concorrentes, marca |
| Fase 1 — MVP (Sprints 1–7) | 6–8 semanas | Landing completa em local/preview |
| **Aprovação (Sprint 8)** | 3–7 dias | Sign-off cliente no `*.vercel.app` |
| Conteúdo (Sprint 9) | 2–4 semanas | Fotos, cases, SEO (opcional antes do go-live) |
| **Hospedagem (Sprint 10)** | 2–5 dias | Domínio, SSL, produção — **último passo** |
| Fase 3 — Plataforma | 3+ meses | Admin, ERP, reservas (se necessário) |

---

## Próxima ação imediata

1. **Deploy preview:** seguir `docs/DEPLOY-PREVIEW-VERCEL.md` e colar URL em `docs/PREVIEW-VALIDACAO.md`.
2. Enviar **PREVIEW-VALIDACAO.md** ao Cezar (checklist §14.2).
3. Ajustes (Sprint 8.3) → sign-off (8.4) → **Sprint 10** domínio/go-live.

---

*Documento gerado para planejamento. Após aprovação, considerar mover conteúdo estável para `docs/ROADMAP.md` e remover `ROADMAP.temp.md`.*

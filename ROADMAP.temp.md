# Roadmap — Landing Page & Plataforma de Locação de Equipamentos

> **Arquivo temporário** — planejamento interno. Pode ser removido ou movido para `/docs` após validação com stakeholders.
>
> **Projeto:** Site institucional + conversão (leads) para empresa de locação de equipamentos aéreos e de construção (máquinas, betoneiras, marteletes, compactadores, etc.)
>
> **Stack base:** Next.js 16 (App Router), TypeScript, Tailwind CSS, next-intl, Drizzle ORM, PostgreSQL/PGlite, Zod, React Hook Form.
>
> **Última atualização:** 2026-05-20 (catálogo 148 itens, carrinho, WhatsApp orçamento, fotos ~125, acessórios)
>
> ### Status rápido (implementado no código)
> | Sprint | Status |
> |--------|--------|
> | 0–4 | ✅ Catálogo base 110 itens, home, sobre, contato, FAQ, busca, CTAs, depoimentos, treinamento, **relacionados no detalhe** |
> | 5 | ✅ Formulário + leads + Resend + **carrinho multi-item** + **`items_json`** + **orçamento via WhatsApp** (e-mail interno) |
> | 6 | ✅ JSON-LD, Privacidade, OG, robots preview noindex (cookie banner ⏳ se PostHog) |
> | 7 | 🟡 Parcial (CTA hierarquia ✅; a11y, skeleton, PageSpeed alvo ⏳) |
> | **7.9** | 📋 **Planejado** — Docker Compose (app, db, studio por serviço) |
> | 8 | ✅ Preview · E2E · sign-off **Flaviano** (2026-05-19) — ver `docs/SPRINT-8-STATUS.md` |
> | 9 | 🟡 **Parcial** — fotos ~125/148; **38 acessórios**; specs plataformas revisadas; cases/logos ⏳ |
> | 10 | ⏳ Domínio oficial + go-live (`acessoequipamentos.com.br`) |
> | **11** | 📋 **Planejado** — Painel administrativo + analytics (ver seção dedicada) |
>
> ### Entregas incrementais (pós sign-off Sprint 8)
>
> | Entrega | Status | Referência |
> |---------|--------|------------|
> | Carrinho com quantidade por item | ✅ | `QuoteCartProvider`, `QuoteCartQuantityStepper` |
> | Lead com vários itens (`items_json`) | ✅ | `migrations/0002_leads_cart_items.sql` |
> | Orçamento: WhatsApp (cliente) + e-mail interno | ✅ | `quote-whatsapp.ts`, `QuoteForm.tsx` |
> | Shell marketing (server/client) | ✅ | `MarketingShell.tsx` (sem `MarketingClientShell`) |
> | Fotos: sync + aliases + multi-cópia (pesos) | ✅ | `sync-equipment-photos.py`, `equipment-photo-aliases.json` |
> | Nomes padronizados no catálogo | ✅ | `normalize-equipment-names.py` |
> | Specs 14 plataformas aéreas corrigidas | ✅ | `fix-platform-specs.py`, `equipamentos.json` |
> | Categoria **acessorios** (38 itens) | ✅ | `seed-acessorios.py` — 34 com foto |
> | Deploy Vercel `main` | ✅ | `landing-page-acesso.vercel.app` — commit `73ad35b`+ |
>
> **Ainda sem foto (acessórios):** `punho-para-esmerilhadeira`, `prato-de-borracha`, `maleta`, `pinca-para-maquina-de-solda`.

---

## Índice

1. [Visão e objetivos](#1-visão-e-objetivos)
2. [Princípios de arquitetura](#2-princípios-de-arquitetura)
3. [Fases do produto](#3-fases-do-produto)
4. [Roadmap por sprint (detalhado)](#4-roadmap-por-sprint-detalhado)
4.1. [Sprint 7.9 — Docker e ambiente local](#sprint-79--docker-e-ambiente-local)
4.2. [Sprint 11 — Painel administrativo e analytics](#sprint-11--painel-administrativo-e-analytics-fase-2)
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

### Fase 3 — Painel administrativo e analytics (Trimestre 2+)

**Sprint 11** — área logada para o time Acesso gerenciar catálogo, leads e métricas de conversão, sem depender de desenvolvedor para cada alteração de equipamento ou exportação manual.

**Entregáveis principais:** CRUD de equipamentos com fotos, exportação CSV de leads com filtro por período, dashboard de visitas, cliques no WhatsApp, origem de tráfego (UTM/referrer) e funil de conversão.

**Entregáveis futuros (pós-Sprint 11):** disponibilidade em tempo real, reservas, integração ERP (Omie/similar), portal do cliente.

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
| 4.11 | **`/treinamento-plataformas-aereas`** | ✅ Página institucional + menu + faixa na home |

**Critério de saída:** home comunica proposta de valor em < 10s de leitura.

---

### Sprint 5 — Formulários e captura de leads

| ID | Tarefa | Detalhes técnicos |
|----|--------|-------------------|
| 5.1 | Schema DB Drizzle | ✅ Tabela `leads` em `src/models/Schema.ts` |
| 5.2 | Migration | ✅ `migrations/0001_high_wild_child.sql` |
| 5.3 | API `POST /api/leads` | ✅ Zod + Arcjet `fixedWindow` (8 req / 15 min) |
| 5.4 | `QuoteForm` | ✅ `src/components/forms/QuoteForm.tsx` + `?equipamento=slug` |
| 5.5 | `ContactForm` | ⏳ Opcional — contato ainda só dados estáticos |
| 5.6 | Feedback UX | ✅ Sucesso/erro inline + loading |
| 5.7 | Notificação | ✅ E-mail via Resend (`RESEND_API_KEY` + `LEADS_NOTIFY_EMAIL`) |
| 5.8 | Página `/orcamento` | ✅ Formulário funcional |
| 5.9 | **WhatsApp contextual** | ✅ `buildWhatsAppMessage` + slug + origem por página |
| 5.10 | **Carrinho multi-item** | ✅ `QuoteCartProvider` — equipamento + acessório, persistência v2 |
| 5.11 | **Quantidade por item** | ✅ Stepper no card e detalhe; totais no painel `/orcamento` |
| 5.12 | **`items_json` no lead** | ✅ Migration `0002_leads_cart_items.sql` + API + e-mail |
| 5.13 | **Orçamento via WhatsApp** | ✅ POST `/api/leads` → e-mail `[Registro interno]` → `wa.me` com mensagem 1ª pessoa |

**Critério de saída:** lead salvo no banco (com itens/quantidades) + e-mail interno + cliente redirecionado ao WhatsApp. **Configurar** `RESEND_*` e `LEADS_NOTIFY_EMAIL` na Vercel para produção.

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

### Sprint 7.9 — Docker e ambiente local

> **Objetivo:** subir cada parte do stack com `docker compose` (sem conflito de portas 3000/5433 no Windows). Pode rodar **em paralelo** ao Sprint 8 — melhora DX da equipe; **não bloqueia** sign-off do cliente.
>
> **Motivação:** hoje `bun run dev` sobe PGlite (5433) + Next (3000) + Spotlight (8969) no host; processos órfãos geram `EADDRINUSE`. Docker isola serviços e padroniza Postgres (igual Neon em produção).

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 7.9.1 | `Dockerfile` | Multi-stage: `deps` → `dev` (hot reload) → `runner` (produção `next start`) |
| 7.9.2 | `docker-compose.yml` | Serviços separados + **profiles** para ligar só o que precisar |
| 7.9.3 | Serviço **`db`** | `postgres:16-alpine`, volume nomeado, porta host `5432`, healthcheck |
| 7.9.4 | Serviço **`app`** | Next.js dev; `DATABASE_URL` apontando para `db`; mount do código; porta `3000` |
| 7.9.5 | Serviço **`migrate`** | One-shot: `drizzle-kit migrate` após `db` healthy (`depends_on`) |
| 7.9.6 | Profile **`tools`** → **`studio`** | Drizzle Studio (`db:studio`) sob demanda, porta `4983` |
| 7.9.7 | Profile **`prod`** | `app-prod`: `next build` + `next start` (smoke test local de produção) |
| 7.9.8 | Variáveis | `.env.docker.example` (Clerk, `DATABASE_URL`, Arcjet); documentar cópia para `.env.local` |
| 7.9.9 | Documentação | `docs/DOCKER.md` — comandos abaixo |
| 7.9.10 | `.dockerignore` | Excluir `node_modules`, `.next`, `local.db`, `.env*` |

**Serviços previstos no Compose:**

| Serviço | Profile | Comando típico | Porta |
|---------|---------|----------------|-------|
| `db` | *(default)* | `docker compose up db -d` | 5432 |
| `migrate` | *(default)* | `docker compose run --rm migrate` | — |
| `app` | `dev` | `docker compose --profile dev up app` | 3000 |
| `studio` | `tools` | `docker compose --profile tools up studio` | 4983 |
| `app-prod` | `prod` | `docker compose --profile prod up app-prod` | 3000 |

**Notas técnicas:**

- Em Docker, preferir **Postgres** no serviço `db` em vez de PGlite (mesmo driver Drizzle/`pg` que Neon).
- **Spotlight/Sentry** e **PostHog** permanecem opcionais no host (dev) ou só em produção (Vercel) — não obrigatório no Compose inicial.
- Produção real continua **Vercel + Neon** (Sprint 10); imagem Docker `prod` serve para teste local e futuro self-host, se necessário.

**Critério de saída:** qualquer dev clona o repo, roda `docker compose up db -d` + `docker compose --profile dev up app` e acessa o site com migrations aplicadas, sem instalar Postgres no Windows.

---

### Sprint 8 — Aprovação da landing (preview, sem domínio oficial)

> **Objetivo:** cliente valida UX, textos e fluxos antes de qualquer custo de domínio/DNS.

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 8.1 | Deploy **preview** | ✅ `https://landing-page-acesso.vercel.app/` — guia `docs/DEPLOY-PREVIEW-VERCEL.md` |
| 8.2 | Roteiro de validação | ✅ `docs/PREVIEW-VALIDACAO.md` |
| 8.3 | Ajustes do feedback | ✅ Sem bloqueantes (2026-05-19) |
| 8.4 | **Sign-off** | ✅ Flaviano Queiroz — Opção A (2026-05-19) |
| 8.5 | Testes E2E Playwright | ✅ `tests/e2e/Marketing.conversion.e2e.ts` + `Sanity.check.e2e.ts` (marketing) |
| 8.6 | CI verde | ⏳ `lint`, `check:types`, `test:e2e` no push/PR |

**Critério de saída:** aprovação formal registrada; lista de ajustes bloqueantes zerada ou aceita como pós-go-live.

---

### Sprint 9 — Conteúdo e diferenciação (pós-aprovação preview)

| ID | Tarefa | Prioridade | Status |
|----|--------|------------|--------|
| 9.1 | Fotos reais da frota | Alta | 🟡 **~125/148** com foto (`equipment-image-manifest.json`); script + aliases |
| 9.1a | **Acessórios no catálogo** | Alta | ✅ 38 itens, categoria `acessorios`, 34 fotos |
| 9.1b | **4 fotos pendentes (acessórios)** | Alta | ⏳ punho esmerilhadeira, prato borracha, maleta, pinça solda |
| 9.1c | Nomes e specs plataformas | Alta | ✅ `normalize-equipment-names.py`, `fix-platform-specs.py` |
| 9.2 | Cases de obra / logos clientes | Alta | ⏳ |
| 9.3 | Expandir textos long-tail | Alta | ⏳ |
| 9.4 | Blog ou `/dicas` (SEO informacional) | Média | ⏳ |
| 9.5 | Avaliar CMS (Sanity/Payload) | Média | 📋 Substituído por **Sprint 11** |
| 9.6 | ~~Painel `/admin/leads`~~ | — | → **Sprint 11** |
| 9.7 | Landing por bairro/região RMBH (opcional) | Baixa | ⏳ |
| 9.8 | Testes A/B de CTA (PostHog) | Baixa | ⏳ |

**Critério de saída:** conteúdo diferenciado no preview; **fotos críticas** sem placeholder nos destaques; pronto para Sprint 10 (domínio).

---

### Sprint 10 — Hospedagem, domínio e go-live (último)

> Reúne a antiga tarefa **0.4** e o deploy de produção. **Só iniciar após Sprint 8 aprovado.**

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 10.1 | Registrar domínio / e-mail comercial | Ops — se ainda não existir |
| 10.2 | Vercel produção + Neon (Postgres) | `DATABASE_URL` produção |
| 10.3 | Migrations em produção | `db:migrate` no pipeline |
| 10.4 | DNS + SSL + redirect `www` | Apontar para Vercel |
| 10.5 | PostHog / GA4 produção | **PostHog = volume bruto:** `page_view`, `equipment_view`, sessões, UTM/referrer. GA4 opcional em paralelo |
| 10.6 | Google Search Console | Sitemap no domínio oficial |
| 10.7 | Checklist go-live | Seção 14 (itens de produção) |
| 10.8 | Redirect site legado (se houver) | `acessoequipamentos.com.br` → novo |

**Critério de saída:** site no ar em domínio oficial, formulário e WhatsApp funcionando em produção.

---

### Sprint 11 — Painel administrativo e analytics (Fase 2)

> **Objetivo:** o time Acesso passa a operar catálogo, leads e indicadores sem editar JSON ou pedir exportação manual. **Pré-requisito:** Sprint 10 (domínio oficial) + instrumentação básica de eventos (11.4) ativa em produção.

#### Visão do painel

| Módulo | Rota sugerida | Quem usa |
|--------|---------------|----------|
| Dashboard | `/admin` | Gestão / comercial |
| Equipamentos | `/admin/equipamentos` | Comercial / marketing |
| Leads | `/admin/leads` | Comercial |
| Relatórios / CSV | `/admin/exportacoes` | Comercial / financeiro |
| Analytics | `/admin/analytics` | Gestão / marketing |
| Configurações | `/admin/configuracoes` | Admin |

**Autenticação:** Clerk (já no projeto). Papéis via `publicMetadata.role` — **sem** tabelas de permissões no Postgres (time enxuto).

---

#### 11.1 — Fundação do admin

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 11.1.1 | Layout admin | Sidebar, header, breadcrumbs; tema alinhado à marca; responsivo tablet |
| 11.1.2 | Proteção de rotas | `src/proxy.ts` (middleware): rotas `/admin(.*)` exigem login Clerk; usuário sem `role` válido → 403 |
| 11.1.3 | Papéis (RBAC) | **`publicMetadata` do Clerk** — ver matriz abaixo; validar no middleware + checagem leve em Server Actions/API |
| 11.1.4 | Auditoria básica | `created_at` / `updated_at` / `updated_by` em alterações críticas |

**Critério de saída:** login → dashboard vazio acessível apenas para equipe Acesso.

**RBAC simplificado (11.1.3) — implementação recomendada:**

1. No **Clerk Dashboard**, definir em cada usuário: `publicMetadata: { "role": "admin" }` ou `{ "role": "comercial" }`.
2. Garantir que o **session token** inclua `publicMetadata` (padrão do Clerk ou custom claims mínimos).
3. No **`src/proxy.ts`**, após `auth.protect()` em rotas `/admin`: ler `role` dos claims; bloquear rotas sensíveis se `role !== 'admin'`.
4. **Não** criar tabelas `roles`, `permissions`, `user_roles` — o time é pequeno; ajuste de papel é operação manual no Clerk.

| Módulo / ação | `admin` | `comercial` |
|---------------|---------|-------------|
| Dashboard `/admin` | ✅ | ✅ |
| Leads — listar / detalhe | ✅ | ✅ |
| Leads — exportar CSV | ✅ | ✅ |
| Analytics — visualizar | ✅ | ✅ |
| Equipamentos — CRUD / fotos | ✅ | ❌ |
| Configurações `/admin/configuracoes` | ✅ | ❌ |

```ts
// Exemplo (proxy.ts / Server Action)
const role = sessionClaims?.publicMetadata?.role as 'admin' | 'comercial' | undefined;
if (!role || !['admin', 'comercial'].includes(role)) {
  return NextResponse.redirect(new URL('/403', req.url));
}
if (isAdminOnlyRoute(req) && role !== 'admin') {
  return NextResponse.redirect(new URL('/403', req.url));
}
```

---

#### 11.2 — Catálogo: CRUD de equipamentos

> Hoje o catálogo está em `equipamentos.json`. O admin deve **migrar para PostgreSQL** (tabela `equipment` + `equipment_specs` + `equipment_images`) com job de importação do JSON atual e rebuild/ISR ao publicar.

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 11.2.1 | Modelo DB equipamentos | Slug, nome, categoria, descrições, tags, `featured`, `available`, SEO meta |
| 11.2.2 | Listagem admin | Busca, filtro por categoria, status (ativo/inativo), ordenação |
| 11.2.3 | Criar equipamento | Formulário validado (Zod); geração de slug; preview antes de publicar |
| 11.2.4 | Editar equipamento | Todos os campos + specs (tabela dinâmica, variant aéreo) |
| 11.2.5 | Excluir / arquivar | Soft delete (`deleted_at`) — não quebrar URLs antigas; redirect 301 opcional |
| 11.2.6 | Duplicar item | Clonar equipamento como rascunho |
| 11.2.7 | Sincronização site | Ao salvar: invalidar cache / revalidar páginas SSG do slug e listagens |

**Critério de saída:** criar, editar e despublicar equipamento reflete no site público em &lt; 2 min.

---

#### 11.3 — Fotos e mídia

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 11.3.1 | Upload de imagens | Vercel Blob, S3 ou Cloudinary; múltiplos arquivos; JPG/WebP |
| 11.3.2 | Galeria por equipamento | Ordenar (drag-and-drop), definir **foto principal**, texto alternativo (SEO/a11y) |
| 11.3.3 | Remover foto | Excluir do storage + registro DB |
| 11.3.4 | Recorte / redimensionamento | Opcional: preset 4:3 e 1200×630 (OG) |
| 11.3.5 | Placeholder | Fallback quando sem foto (categoria ou genérico) |

**Critério de saída:** equipamento com 3+ fotos exibidas corretamente no detalhe público e no card.

---

#### 11.4 — Leads e exportação de dados

| ID | Tarefa | Detalhes |
|----|--------|----------|
| 11.4.1 | Lista de leads | Tabela paginada: data, nome, telefone, e-mail, equipamento, cidade, origem, status |
| 11.4.2 | Detalhe do lead | Histórico, notas internas, marcar como `contacted` / `quoted` / `won` / `lost` |
| 11.4.3 | Filtros | Período (**calendário: data início → data fim**), origem (`site-orcamento`, `site-header`, etc.), cidade, equipamento, status |
| 11.4.4 | **Exportar CSV** | Exportar resultado filtrado (UTF-8 BOM para Excel); colunas configuráveis |
| 11.4.5 | Exportar JSON (opcional) | Backup / integração CRM |
| 11.4.6 | Notificação e-mail | Retomar Sprint 5.7 — e-mail ao comercial em cada lead novo |

**Critério de saída:** exportar CSV de janeiro/2026 com todos os leads do mês em um clique.

---

#### 11.5 — Instrumentação de analytics (site público)

> Base para gráficos do admin. **Arquitetura híbrida** (ver também Sprint **10.5**):
>
> | Destino | O quê gravar | Por quê |
> |---------|----------------|---------|
> | **PostHog** (principal) | `page_view`, `equipment_view`, `search`, sessões, UTM/referrer, funil de navegação | Alto volume (ex.: Google Ads); não infla o Neon |
> | **Neon** (`analytics_events` + `leads`) | `whatsapp_click`, `quote_submit` | Conversões de fundo de funil; volume baixo e acionável no painel |
>
> **Ponto de atenção:** registrar cada page view no Postgres transacional pode estourar storage/custo no tier serverless do Neon. O banco interno não deve ser o “data lake” de tráfego.

| ID | Evento | Quando disparar | Onde persistir |
|----|--------|-----------------|----------------|
| E1 | `page_view` | Cada página marketing | **PostHog** |
| E2 | `whatsapp_click` | Qualquer botão WhatsApp | **Neon** (`analytics_events`) |
| E3 | `quote_submit` | Formulário enviado com sucesso | **Neon** (`leads` + opcional `analytics_events`) |
| E4 | `equipment_view` | Abrir detalhe | **PostHog** |
| E5 | `search` | Busca global (opcional) | **PostHog** (query hash/anônimo) |

**Atribuição de tráfego (campanhas pagas no domínio futuro):** capturar UTM/referrer/landing no **PostHog** (sessão). Para `whatsapp_click` e `quote_submit` no Neon, copiar UTM da sessão no momento da conversão.

| Campo | Origem |
|-------|--------|
| `utm_source` | Google Ads, Meta, etc. |
| `utm_medium` | cpc, social, email |
| `utm_campaign` | nome da campanha |
| `utm_content` | variação de anúncio |
| `referrer` | document.referrer (domínio de origem) |
| `landing_page` | primeira URL da sessão |

**Agregação para o admin (11.6):** `analytics_daily` preenchida por job noturno — visitas/sessões via **API PostHog** (ou export); WhatsApp/leads via consulta ao Neon. Evitar `INSERT` por page view em produção.

**Critério de saída:** clique no WhatsApp gera registro no Neon visível no admin em até 5 min; visitas do período consultáveis no painel via agregado PostHog (mesmo dia ou D+1).

---

#### 11.6 — Dashboard: gráficos e métricas

> Métricas de **volume** (visitas, sessões, origem UTM, top páginas) leem de **PostHog** (ou `analytics_daily` sincronizado). Métricas de **conversão** (WhatsApp, leads, funil final) leem do **Neon**.

| ID | Métrica / gráfico | Descrição |
|----|-------------------|-----------|
| 11.6.1 | **Visitantes / sessões** | Total e únicos no período (filtro calendário) |
| 11.6.2 | **Cliques WhatsApp** | Total + taxa WhatsApp ÷ visitas; breakdown por `origin` |
| 11.6.3 | **Leads formulário** | Envios no período + taxa conversão |
| 11.6.4 | **Funil** | Visita → equipamento visto → WhatsApp ou orçamento |
| 11.6.5 | **Origem do tráfego** | Pizza/bar: UTM source, referrer, direto, orgânico |
| 11.6.6 | **Campanhas pagas** | Tabela: campanha (utm_campaign) × visitas × WhatsApp × leads |
| 11.6.7 | **Top equipamentos** | Mais visualizados e mais citados em leads/WhatsApp |
| 11.6.8 | **Páginas de entrada** | Landing pages mais frequentes (home vs categoria vs detalhe) |
| 11.6.9 | **Dispositivo** | Mobile vs desktop (user-agent resumido) |
| 11.6.10 | Comparativo períodos | “Últimos 7 dias” vs “7 dias anteriores” (% variação) |

**UI:** filtros globais de data (presets: hoje, 7d, 30d, mês, custom); gráficos com Recharts ou Chart.js; cards KPI no topo.

**Critério de saída:** gestor responde “quantas pessoas entraram e quantas foram ao WhatsApp em março?” só pelo painel.

---

#### 11.7 — Extras úteis (prioridade média/baixa)

| ID | Funcionalidade | Valor |
|----|----------------|-------|
| 11.7.1 | Log de atividades admin | Quem alterou qual equipamento e quando |
| 11.7.2 | Rascunhos | Publicar equipamento só quando aprovado |
| 11.7.3 | Import CSV equipamentos | Carga em massa a partir da planilha do cliente |
| 11.7.4 | Alertas | E-mail semanal: leads da semana + top campanha |
| 11.7.5 | Integração Google Ads / Meta | Importar custo por campanha (ROAS) — fase posterior |
| 11.7.6 | API read-only | Token para BI externo (Power BI) |

---

#### Dependências técnicas (Sprint 11)

| Decisão | Recomendação |
|---------|----------------|
| Catálogo | Migrar JSON → Postgres; site lê do DB (ISR) |
| Imagens | Vercel Blob + `next/image` |
| Auth admin | Clerk `publicMetadata.role` (`admin` \| `comercial`); validação em `src/proxy.ts` — sem RBAC em tabelas |
| Analytics | **PostHog** = tráfego/volume; **Neon** = conversões (`whatsapp_click`, `quote_submit`); `analytics_daily` = agregados |
| CSV export | `papaparse` ou gerar no servidor com streaming |
| Gráficos | Recharts (React) |

---

#### Cronograma estimado Sprint 11

| Sub-sprint | Duração | Entrega |
|------------|---------|---------|
| 11.1 Fundação | 1 semana | Login + layout admin |
| 11.2–11.3 Catálogo + fotos | 2–3 semanas | CRUD completo com mídia |
| 11.4 Leads + CSV | 1 semana | Lista, filtros, exportação |
| 11.5 Tracking | 1 semana | Eventos no site público |
| 11.6 Dashboard | 2 semanas | Gráficos e KPIs |
| **Total** | **7–8 semanas** | Painel operacional |

---

**Critério de saída global (Sprint 11):** equipe Acesso consegue, sem desenvolvedor: (1) cadastrar equipamento com fotos, (2) exportar leads do mês em CSV, (3) ver visitas e cliques WhatsApp por campanha UTM no período escolhido.

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
| Equipamentos relacionados | ✅ | 3.9 / `getRelatedEquipment` |
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
| `/treinamento-plataformas-aereas` | SSG | Treinamento NR / plataformas |
| `/admin` | SSR (auth) | Dashboard — **Sprint 11** |
| `/admin/equipamentos` | SSR (auth) | CRUD catálogo — **Sprint 11** |
| `/admin/leads` | SSR (auth) | Leads + export CSV — **Sprint 11** |
| `/admin/analytics` | SSR (auth) | Métricas e gráficos — **Sprint 11** |
| `/api/analytics` | API | POST eventos (page_view, whatsapp_click…) — **Sprint 11** |

### 5.2 Categorias sugeridas (inicial)

1. **Equipamentos aéreos** — plataformas elevatórias, tesouras, articulados
2. **Concretagem** — betoneiras, vibradores, mangotes
3. **Compactação** — placas vibratórias, sapatas, rolos (se houver)
4. **Demolição / perfuração** — marteletes, rompedores, britadeiras
5. **Energia e iluminação** — geradores, torres (se aplicável)
6. **Acesso e andaimes** — treliças, escadas, linhas de vida (se aplicável)
7. **Acessórios** — ponteiras, punhos, cabos, mangueiras, peças para solda, etc. (**38 itens**)

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

### 6.3 Equipamento no admin (PostgreSQL — Sprint 11)

| Tabela | Campos principais |
|--------|-------------------|
| `equipment` | slug, name, category, descriptions, featured, available, deleted_at, seo_title, seo_description |
| `equipment_spec` | equipment_id, label, value, sort_order |
| `equipment_image` | equipment_id, url, alt, sort_order, is_primary |

### 6.4 Analytics (PostgreSQL — Sprint 11)

| Tabela | Campos principais | Escopo |
|--------|-------------------|--------|
| `analytics_events` | event_type (`whatsapp_click`, `quote_submit`), session_id, origin, equipment_slug, utm_*, referrer, device, created_at | **Só conversões** — não usar para `page_view` em massa |
| `analytics_daily` | date, page_views, unique_sessions, whatsapp_clicks, quote_submits, top_sources (JSON) | Agregados: visitas via sync PostHog; conversões via Neon |

> Tráfego bruto (`page_view`, `equipment_view`, funil de navegação) fica no **PostHog** (Sprint 10.5). Ver aviso na seção [11.5](#115--instrumentação-de-analytics-site-público).

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
| PostHog / GA4 | 1 | Tráfego, sessões, UTM (volume); Neon só conversões |
| Google Search Console | 1 | SEO |
| Google Maps embed | 1 | Contato |
| Sentry | 1 | Erros produção |
| Neon / Postgres | 1 | Leads |
| CRM (RD, Pipedrive, webhook) | 2 | Automação comercial |
| CMS headless | 2 | Cliente edita catálogo |
| Clerk / Better Auth | 3 | Área admin |

### 9.1 Eventos de analytics (nomenclatura)

| Evento | Destino recomendado |
|--------|---------------------|
| `page_view` (automático) | PostHog |
| `equipment_view` — `{ slug }` | PostHog |
| `quote_form_start` | PostHog (opcional) |
| `quote_form_submit` — `{ slug, cidade }` | Neon (`leads`) |
| `whatsapp_click` — `{ origem, slug? }` | Neon (`analytics_events`) |
| `category_filter` — `{ categoria }` | PostHog |

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
| Local (host) | localhost:3000 | PGlite `local.db` :5433 ou Neon via `.env.local` | `bun run dev` |
| Local (Docker) | localhost:3000 | Postgres container :5432 | **Sprint 7.9** — `docker compose` |
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
- [x] Sign-off preview (Flaviano Queiroz — 2026-05-19)

**MVP Go-live (Sprint 10) Done** quando:

- [ ] Todas as rotas da Fase 1 no domínio oficial
- [x] Maioria da frota com foto (~125 itens) — revisar destaques sem imagem antes do domínio
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
- [x] “Equipamentos relacionados” no detalhe — **implementado**
- [ ] Multi-unidade / filiais por cidade
- [ ] Disponibilidade (`disponivel: false` com badge “consulte prazo”)

### Tecnologia

- [ ] **Ambiente Docker (Compose)** → **Sprint 7.9** (app, db, migrate, studio por serviço)
- [ ] **Painel admin completo** → **Sprint 11** (CRUD, fotos, CSV, analytics)
- [ ] CMS headless (Sanity/Payload) — só se não usar admin próprio
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
- [x] Aprovação de textos/preview (Flaviano Queiroz — Sprint 8)

### 14.2 Aprovação da landing (Sprint 8 — concluída)

- [x] Link preview: https://landing-page-acesso.vercel.app/
- [x] Fluxos validados (home, equipamentos, busca, orçamento, E2E)
- [x] Sign-off Flaviano Queiroz — 2026-05-19

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
| **Docker (Sprint 7.9)** | 2–4 dias | Compose: db + app + migrate (+ studio) — **paralelo** |
| **Aprovação (Sprint 8)** | Concluída | Sign-off Flaviano (2026-05-19) |
| Conteúdo (Sprint 9) | 2–4 semanas | Fotos, cases, SEO (opcional antes do go-live) |
| **Hospedagem (Sprint 10)** | 2–5 dias | Domínio, SSL, produção — **último passo** |
| **Painel admin (Sprint 11)** | 7–8 semanas | CRUD, fotos, CSV, métricas, campanhas UTM |
| Fase 3+ — ERP / reservas | 3+ meses | Estoque, portal cliente (se necessário) |

---

## Próxima ação imediata

### Recomendação de prioridade (negócio + técnica)

| Ordem | Sprint | Por quê |
|-------|--------|---------|
| **1** | **5.7** + **6** (e-mail lead, JSON-LD, Privacidade) | Próximo após Sprint 8 ✅ — confiança e SEO antes do domínio |
| **2** | **10** (domínio + PostHog + produção) | Go-live no domínio oficial |
| **3** | **9** (fotos reais) | Paralelo ao 5.7/6 ou antes do go-live |
| **4** | **7.9** (Docker) | Opcional — DX local, Postgres no Compose |
| **5** | **11** (painel admin) | Fase 2 — após tráfego real em produção |

### Checklist imediato

1. ~~Sprint 8~~ — preview aprovado (Flaviano, 2026-05-19).
2. ~~Sprint 5.7 + 6~~ — e-mail Resend, JSON-LD, `/privacidade`, OG.
3. **Sprint 10** — domínio oficial e go-live (após `RESEND_*` na Vercel).
4. **Paralelo:** Sprint **9** (fotos) e/ou **7.9** (Docker).
5. **Sprint 11** — painel admin (após produção).

---

*Documento gerado para planejamento. Após aprovação, considerar mover conteúdo estável para `docs/ROADMAP.md` e remover `ROADMAP.temp.md`.*

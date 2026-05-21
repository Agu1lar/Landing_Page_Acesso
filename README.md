# Acesso Equipamentos — Site institucional e captação de orçamentos

[![CI](https://github.com/Agu1lar/Landing_Page_Acesso/actions/workflows/CI.yml/badge.svg)](https://github.com/Agu1lar/Landing_Page_Acesso/actions/workflows/CI.yml)

Site da **Acesso Equipamentos** (locação de equipamentos para construção civil e plataformas aéreas). O visitante consulta o catálogo, monta um orçamento com vários itens e quantidades, e envia o pedido pelo **WhatsApp** (fluxo principal). O lead é salvo no **PostgreSQL**, o comercial recebe **e-mail interno** (Resend) e a equipe acompanha tudo no **painel administrativo**.

**Produção (sempre a versão mais nova):** [https://landing-page-acesso.vercel.app/](https://landing-page-acesso.vercel.app/)

**Repositório:** [github.com/Agu1lar/Landing_Page_Acesso](https://github.com/Agu1lar/Landing_Page_Acesso)

> Use só a URL de **Production** na Vercel (ou o domínio oficial quando estiver no ar). Deploys antigos na lista da Vercel ficam congelados naquela versão.

**Planejamento técnico:** [ROADMAP.temp.md](ROADMAP.temp.md)

**Fluxo solo (commit direto na `main`):** [docs/FLUXO-SOLO.md](docs/FLUXO-SOLO.md)

---

## Números do catálogo (atual)

| Métrica | Valor |
|---------|------:|
| Itens no catálogo | **148** (110 equipamentos + **38 acessórios**) |
| Categorias | 9 (inclui **Acessórios**) |
| Fotos publicadas | **144 / 148** (`src/data/equipment-image-manifest.json`) |
| Sem foto ainda | **5:** `carregador`, `bateria`, `maleta`, `pinca-para-maquina-de-solda`, `rodape-de-0-20-x-3-00-m` |

---

## O que já está implementado

### Páginas públicas (marketing)

| Página | Rota | Conteúdo |
|--------|------|----------|
| Início | `/` | Apresentação, categorias, depoimentos, como funciona |
| Equipamentos | `/equipamentos` | Catálogo com busca e filtro por categoria |
| Detalhe | `/equipamentos/[slug]` | Ficha, specs (plataformas aéreas), foto, relacionados, carrinho |
| Categorias | `/categorias/[slug]` | SEO por linha + listagem (ex.: `/categorias/acessorios`) |
| Orçamento | `/orcamento` | Formulário + painel do carrinho |
| Treinamento NR | `/treinamento-plataformas-aereas` | Plataformas aéreas / NR |
| Sobre, Contato, FAQ, Privacidade | `/sobre`, `/contato`, `/faq`, `/privacidade` | Institucional e LGPD |

### Carrinho de orçamento

- Vários **equipamentos e acessórios** no mesmo pedido.
- **Quantidade** por item (stepper no card e na página de detalhe).
- Persistência no navegador (`localStorage`, migração automática de versões antigas).
- Painel do carrinho em `/orcamento` com edição de quantidades.

### Envio do orçamento (WhatsApp + registro interno)

1. Cliente preenche o formulário e clica em **Enviar orçamento pelo WhatsApp**.
2. O site grava o lead no **PostgreSQL** (`items_json` com itens e quantidades).
3. **UTMs** da sessão (`utm_source`, `utm_medium`, etc.) são capturadas e salvas no lead.
4. Dispara **e-mail interno** ao comercial (Resend), assunto `[Registro interno]`.
5. Abre o **WhatsApp** com mensagem em primeira pessoa para o cliente enviar ao comercial.

### Catálogo e conteúdo

- **110 equipamentos** do inventário original + **38 acessórios**.
- **Especificações das 14 plataformas aéreas** revisadas no JSON.
- **Nomes padronizados** (`docs/scripts/normalize-equipment-names.py`).
- **Fotos da frota:** `public/equipamentos/{slug}.ext` + `docs/scripts/sync-equipment-photos.py` + aliases em `equipment-photo-aliases.json`.

### SEO (metadata + dados estruturados)

- **`buildMarketingMetadata`** em todas as rotas de marketing: canonical absoluto, Open Graph, Twitter Card, robots e dicas `googleBot`.
- **JSON-LD** por tipo de página:
  - Layout: `@graph` com Organization, LocalBusiness, WebSite e **SearchAction** (busca em `/equipamentos?q=…`).
  - Equipamento: **Product** + **BreadcrumbList**.
  - Categoria: **CollectionPage** + **ItemList** + **BreadcrumbList** (`buildCategoryPageJsonLd`).
  - FAQ: **FAQPage**; treinamento: **Course**.
- **Sitemap** com prioridades de crawl (home, categorias, catálogo, fichas).
- Testes unitários em `src/lib/seo-metadata.test.ts` e `src/lib/json-ld.test.ts`.

### Analytics e LGPD

- **PostHog** (opcional via env): `page_view`, `equipment_view`, `whatsapp_click`.
- **UTMs** como super properties no PostHog quando o visitante aceita analytics.
- **Banner de cookies**: PostHog só inicia após consentimento (`AnalyticsConsentProvider`).
- Política de privacidade atualizada (menção a analytics).

### Painel administrativo (Clerk)

Rotas protegidas por **Clerk** + papel em `publicMetadata.role` (`admin` ou `comercial`):

| Recurso | Rota / API |
|---------|------------|
| Login | `/sign-in` (cadastro público desativado → redireciona) |
| Lista de leads | `/dashboard/leads` |
| Detalhe do lead | `/dashboard/leads/[id]` |
| Filtros | Data, status, cidade, origem, busca textual |
| Atalhos de data | Últimos 7 / 30 dias |
| Status do lead | `PATCH /api/admin/leads/[id]/status` |
| Notas internas | `PATCH /api/admin/leads/[id]/notes` |
| Export CSV | `GET /api/admin/leads/export` |

Guia completo: [docs/CLERK-ACESSO-ADMIN.md](docs/CLERK-ACESSO-ADMIN.md)

### UX e conversão

- Busca global no header + **Ctrl+K**.
- WhatsApp contextual com rastreamento (`TrackedWhatsAppLink`).
- Layout marketing estável (server components + `next-intl`).
- Mobile-first; CTAs com WhatsApp em destaque.
- Link **Área restrita** no footer → `/sign-in`.

### Infraestrutura

- Deploy automático na **Vercel** a cada push em `main`.
- **Build:** `npm run build` (roda `db:migrate` antes do `next build` — ver `vercel.json`).
- Banco **Neon** (produção) + **PGlite** local (porta 5433 no `npm run dev`).
- Migrações Drizzle: `leads` com `items_json`, status, UTMs, `internal_notes`.
- Rate limit no `POST /api/leads` (Arcjet).
- Testes: unitários (Vitest) e E2E Playwright.

---

## O que ainda falta (resumo)

Detalhamento por sprint em [ROADMAP.temp.md](ROADMAP.temp.md).

| Prioridade | Item |
|------------|------|
| Alta | **Domínio oficial** `acessoequipamentos.com.br` + Clerk **Production** (`pk_live_` / `sk_live_`) |
| Alta | **301 do blog WordPress** — posts indexados no Google; mapa de URLs antes do DNS — [ROADMAP § 10.10](ROADMAP.temp.md#blog-wordpress--redirecionamentos-301-no-go-live) |
| Baixa | **5 fotos** pendentes (lista acima) |
| Alta | **CI completo (gate de produção)** — branch protection, `check:types`, E2E leads/orçamento, build+migrate — **antes** dos Sprints 12–13 — [ROADMAP § 8.7](ROADMAP.temp.md#sprint-87--ci-completo-gate-de-produção-prioridade-alta) |
| Alta | **Casos de Sucesso** — logos por setor em `public/clientes/{setor}/` — [docs/CLIENT-LOGOS.md](docs/CLIENT-LOGOS.md) |
| Média | **Dicas / SEO** — `/dicas` (4 artigos) + textos long-tail nas fichas de equipamento |
| Média | Polish Sprint 7 (a11y, skeletons, PageSpeed alvo) |
| Planejado | **Sprints 12–13** — analytics avançado, dashboard executivo |
| Planejado | **Sprints 14–15** — SEO por cidade, prova social ampliada |
| Planejado | **Sprints 16–18** — CRM, inteligência de catálogo, disponibilidade frota |
| Backlog | **Sprints 19–22** — PWA, IA comercial, área do cliente, blog técnico |
| Opcional | Docker local (Sprint 7.9) |

---

## Fotos e acessórios (operacional)

1. Coloque arquivos em `public/equipamentos/_incoming/` (pasta no `.gitignore`; não vai para o Git).
2. Rode: `python docs/scripts/sync-equipment-photos.py`
3. Commit das imagens em `public/equipamentos/` e do `src/data/equipment-image-manifest.json`.

Guia: [docs/SPRINT-9-FOTOS.md](docs/SPRINT-9-FOTOS.md)

Novos acessórios no catálogo: `python docs/scripts/seed-acessorios.py` (idempotente).

Validação do preview: [docs/PREVIEW-VALIDACAO.md](docs/PREVIEW-VALIDACAO.md)

---

## Como rodar localmente

### Requisitos

- **Node.js 20+** (recomendado 22+)
- **Clerk** — chaves no `.env.local` (visitante do site não precisa login; admin usa `/sign-in`)
- **PostgreSQL** — PGlite sobe com `npm run dev` na porta 5433, ou **Neon** via `DATABASE_URL`

### Passos

```shell
# 1. Copiar ambiente
cp .env.example .env.local   # Windows: copie manualmente

# 2. Instalar e subir
npm install
npm run dev
```

Abrir **http://localhost:3000**

Migrações: aplicadas no `dev` ou manualmente com `npm run db:migrate` quando `DATABASE_URL` aponta para Neon/local.

### E-mail de leads (opcional)

No `.env.local` / Vercel:

- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL`

### PostHog (opcional)

- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (ex.: `https://us.i.posthog.com`)
- Sem chave, o site funciona; com chave, analytics só após aceitar cookies.

### Painel local

1. Crie usuário no [Clerk Dashboard](https://dashboard.clerk.com) (Development).
2. Em **Public metadata**: `{ "role": "admin" }` ou `"comercial"`.
3. Acesse `/sign-in` → `/dashboard/leads`.

### Comandos úteis

| Comando | Uso |
|---------|-----|
| `npm run dev` | Desenvolvimento (PGlite + Next) |
| `npm run build` | Migrações + build de produção |
| `npm run build-local` | Build local sem Neon |
| `npm run check:types` | TypeScript |
| `npm run lint` | ESLint (Ultracite) |
| `npm run test` | Testes unitários |
| `npm run test:e2e` | Playwright |

---

## Publicação (Vercel)

- **Branch de produção:** `main`
- **Build:** `npm run build` (inclui `db:migrate` — ver `vercel.json`)
- **URL estável:** `https://landing-page-acesso.vercel.app`

### Variáveis (Production + Preview)

| Variável | Obrigatória | Notas |
|----------|:-----------:|-------|
| `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sim | Preview: `pk_test_`; **domínio oficial: `pk_live_`** |
| `DATABASE_URL` (Neon) | Sim | |
| `NEXT_PUBLIC_APP_URL` | Recomendada | Canonical e OG |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL` | Para e-mail de leads | |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | Opcional | Analytics após consentimento |
| `NEXT_PUBLIC_SENTRY_DISABLED=true` | Preview | Sem Sentry no preview |
| `ARCJET_KEY` | Opcional | Rate limit em `/api/leads` |

Guia: [docs/DEPLOY-PREVIEW-VERCEL.md](docs/DEPLOY-PREVIEW-VERCEL.md)

### Atualizar produção

```shell
git push origin main
```

Aguarde deploy **Ready** no topo da lista (**Production**, commit mais recente). Não use **Redeploy** em deploys antigos da lista.

### Validar SEO após deploy

- [Google Rich Results Test](https://search.google.com/test/rich-results) — equipamento, categoria, FAQ
- Search Console — reenviar `/sitemap.xml`

---

## Documentação no repositório

| Arquivo | Conteúdo |
|---------|----------|
| [ROADMAP.temp.md](ROADMAP.temp.md) | Sprints, feito vs pendente |
| [docs/PREVIEW-VALIDACAO.md](docs/PREVIEW-VALIDACAO.md) | Checklist de validação |
| [docs/SPRINT-9-FOTOS.md](docs/SPRINT-9-FOTOS.md) | Fluxo de fotos |
| [docs/DEPLOY-PREVIEW-VERCEL.md](docs/DEPLOY-PREVIEW-VERCEL.md) | Deploy Vercel |
| [docs/CI.md](docs/CI.md) | Pipeline CI e branch protection (Sprint 8.7) |
| [docs/MIGRACAO-SEO-WP.md](docs/MIGRACAO-SEO-WP.md) | Mapa 301 blog WordPress (Sprint 10.10) |
| [docs/CLERK-ACESSO-ADMIN.md](docs/CLERK-ACESSO-ADMIN.md) | Painel, papéis e Clerk Production no go-live |
| [docs/inventario-equipamentos.csv](docs/inventario-equipamentos.csv) | Inventário base (110 itens) |
| [.env.example](.env.example) | Variáveis de ambiente |

---

## Base técnica

**Next.js 16** (App Router), **TypeScript**, **Tailwind v4**, **next-intl** (pt-BR), **Drizzle** + **PostgreSQL** (Neon / PGlite), **Zod**, **React Hook Form**, **Resend**, **Arcjet**, **Clerk** (auth do painel), **PostHog** (analytics com consentimento), hospedagem **Vercel**.

---

## Licença

Código sob [MIT License](LICENSE). Conteúdo institucional e marca pertencem à Acesso Equipamentos.

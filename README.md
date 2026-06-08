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
| Categorias | `/categorias/[slug]` | SEO por linha, galeria (ex.: guindaste/Munck), listagem do catálogo |
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
5. A API enriquece itens com **specs técnicas** (altura de trabalho, capacidade de carga) a partir do catálogo.
6. Abre o **WhatsApp** com mensagem em primeira pessoa — URL gerada no servidor (`whatsappUrl` na resposta de `/api/leads`).
7. Integração opcional **whatsappOS** no servidor (`WHATSAPPOS_*`).

### Catálogo público (não é estoque)

- O site **não controla disponibilidade de frota** — só exibe itens marcados como **Exibir no site** no admin (`available: true`).
- Itens ocultos no painel **não aparecem** em catálogo, categorias, busca nem ficha pública (404).
- Postgres + JSON: itens só no JSON entram no site até existirem no admin; slug no Postgres **não** é sobrescrito pelo JSON.
- **Guindaste / Munck:** migration `0007`, sync em `src/lib/equipment-sync.ts`, botão **Sincronizar guindaste / Munck** em `/dashboard/equipamentos`.

### Catálogo e conteúdo

- **110 equipamentos** do inventário original + **38 acessórios**.
- **Especificações das 14 plataformas aéreas** revisadas no JSON.
- **Nomes padronizados** (`docs/scripts/normalize-equipment-names.py`).
- **Fotos da frota:** `public/equipamentos/{slug}.ext` + `docs/scripts/sync-equipment-photos.py` + aliases em `equipment-photo-aliases.json`.
- **Guindastes e remoções:** galeria em `public/categorias/guindastes-remocoes/` + ficha `guindaste-industrial-munck-remocao-bh`.

### Migração WordPress → Next.js (301)

- Mapa versionado: `src/data/legacy-redirects.json` (posts, páginas WP, prefixos `/category`, `/tag`, `/web-stories`, `/wp-content`, etc.).
- **301 no primeiro request** via `src/proxy.ts` (antes do roteamento i18n).
- Baseline **jun/2026:** sitemap Yoast (46 URLs) e URLs de **Google Ads Pesquisa** auditadas — cobertura **100%** no mapa atual.
- Scripts de auditoria:
  - `node docs/scripts/audit-legacy-redirects.mjs` — sitemap WP + `src/data/gsc-top-urls.json`
  - `node docs/scripts/import-gsc-urls.mjs caminho/export-gsc.csv` — Search Console
  - `node docs/scripts/import-google-ads-urls.mjs caminho/relatorio-ads.csv` — Google Ads (UTF-16)
- Relatórios versionados: `src/data/gsc-top-urls.json`, `src/data/google-ads-landing-urls.json`.
- Guia: [docs/MIGRACAO-SEO-WP.md](docs/MIGRACAO-SEO-WP.md) · passos manuais: [docs/PASSOS-MANUAIS.md](docs/PASSOS-MANUAIS.md) §10–11.

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
- **Banner de cookies**: PostHog só inicia após consentimento (`AnalyticsConsentProvider`); botão aceitar em verde (não usa vermelho de marca).
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
- Migrações Drizzle: leads, equipamentos admin, **`0007_sync_guindaste_catalog`** (guindaste/Munck).
- Rate limit no `POST /api/leads` (Arcjet: 8 req / 15 min por IP).
- Pool Postgres limitado por instância serverless (`max: 5`); Resend em 429 não bloqueia lead no Neon.
- **`GET /api/health`** — Clerk live vs test, DB, contagem de redirects, flags Resend/Arcjet.
- Alerta no startup se Production Vercel usar Clerk `pk_test_` (`src/lib/clerk-env.ts`).
- Testes: unitários (Vitest) e E2E Playwright.

---

## Go-live — domínio oficial

**Domínio:** `acessoequipamentos.com.br` · **Registro:** [Registro.br](https://registro.br) (titular/contato) · **DNS atual:** Task (`ns2.task.com.br`, `ns3`, `ns4`) — alterações de A/CNAME/TXT no **painel Task**, não só no Registro.br.

| Etapa | O quê |
|-------|--------|
| Antes do DNS | Clerk **Production** (`pk_live_` / `sk_live_`), Neon **pooler**, `NEXT_PUBLIC_APP_URL` oficial, redeploy Vercel |
| DNS | Apontar domínio na Task para registros da Vercel |
| Search Console | TXT `google-site-verification=...` na zona DNS da Task; enviar `/sitemap.xml` |
| Google Ads | Manter **Pesquisa**; pausar **Display**; URLs oficiais já cobertas por 301 ou home |
| Após propagar | `curl -I` top URLs · `GET /api/health` · teste orçamento + `/dashboard/leads` |

Checklists: [docs/GO-LIVE-GATE.md](docs/GO-LIVE-GATE.md) · [docs/PASSOS-MANUAIS.md](docs/PASSOS-MANUAIS.md)

---

## O que ainda falta (resumo)

Detalhamento por sprint em [ROADMAP.temp.md](ROADMAP.temp.md). **Passos manuais (Vercel, domínio, CRM, logos):** [docs/PASSOS-MANUAIS.md](docs/PASSOS-MANUAIS.md).

| Prioridade | Item |
|------------|------|
| Alta | **DNS Task** → Vercel + Clerk **Production** + `DATABASE_URL` Neon pooler |
| Alta | **Acesso painel Task** (ou técnico na call) para TXT Search Console e corte DNS |
| Média | Export **GSC** (90 dias) e revalidar com `import-gsc-urls.mjs` se surgirem URLs fora do sitemap |
| Baixa | **5 fotos** pendentes (lista acima) |
| Média | **Casos de Sucesso** — logos em `public/clientes/{setor}/` — [docs/CLIENT-LOGOS.md](docs/CLIENT-LOGOS.md) |
| Média | Polish Sprint 7 (a11y, PageSpeed mobile) |
| Planejado | Sprints 12–22 (analytics, SEO programático, CRM, disponibilidade frota) |

**Já no código (go-live):** mapa 301 WP, scripts auditoria GSC/Ads, guindaste no Postgres, health check, specs no WhatsApp, catálogo sem “estoque”.

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
| `WHATSAPPOS_API_URL`, `WHATSAPPOS_WIDGET_KEY` | Opcional | CRM whatsappOS (capture server-side) |

Guia: [docs/DEPLOY-PREVIEW-VERCEL.md](docs/DEPLOY-PREVIEW-VERCEL.md) · go-live: [docs/PASSOS-MANUAIS.md](docs/PASSOS-MANUAIS.md)

### Atualizar produção

```shell
git push origin main
```

Aguarde deploy **Ready** no topo da lista (**Production**, commit mais recente). Não use **Redeploy** em deploys antigos da lista.

### Validar SEO e go-live após deploy

```shell
node docs/scripts/audit-legacy-redirects.mjs
curl -s https://landing-page-acesso.vercel.app/api/health
```

- [Google Rich Results Test](https://search.google.com/test/rich-results) — equipamento, categoria, FAQ
- Search Console — TXT na Task + reenviar `/sitemap.xml` após DNS oficial

---

## Documentação no repositório

| Arquivo | Conteúdo |
|---------|----------|
| [ROADMAP.temp.md](ROADMAP.temp.md) | Sprints, feito vs pendente |
| [docs/PREVIEW-VALIDACAO.md](docs/PREVIEW-VALIDACAO.md) | Checklist de validação |
| [docs/SPRINT-9-FOTOS.md](docs/SPRINT-9-FOTOS.md) | Fluxo de fotos |
| [docs/DEPLOY-PREVIEW-VERCEL.md](docs/DEPLOY-PREVIEW-VERCEL.md) | Deploy Vercel |
| [docs/CI.md](docs/CI.md) | Pipeline CI e branch protection (Sprint 8.7) |
| [docs/MIGRACAO-SEO-WP.md](docs/MIGRACAO-SEO-WP.md) | Mapa 301 WordPress + auditoria GSC/Ads |
| [docs/PASSOS-MANUAIS.md](docs/PASSOS-MANUAIS.md) | Go-live, DNS Task, Clerk, Neon, Resend, reunião domínio |
| [docs/GO-LIVE-GATE.md](docs/GO-LIVE-GATE.md) | Gate pré-domínio (CI, 301, health) |
| [docs/CLERK-ACESSO-ADMIN.md](docs/CLERK-ACESSO-ADMIN.md) | Painel, papéis e Clerk Production no go-live |
| `docs/scripts/audit-legacy-redirects.mjs` | Valida cobertura 301 (sitemap + GSC) |
| `docs/scripts/import-google-ads-urls.mjs` | Audita URLs finais dos anúncios |
| `src/data/legacy-redirects.json` | Mapa 301 versionado |
| `src/data/google-ads-landing-urls.json` | Última auditoria Google Ads |
| [docs/inventario-equipamentos.csv](docs/inventario-equipamentos.csv) | Inventário base (110 itens) |
| [.env.example](.env.example) | Variáveis de ambiente |

---

## Base técnica

**Next.js 16** (App Router), **TypeScript**, **Tailwind v4**, **next-intl** (pt-BR), **Drizzle** + **PostgreSQL** (Neon / PGlite), **Zod**, **React Hook Form**, **Resend**, **Arcjet**, **Clerk** (auth do painel), **PostHog** (analytics com consentimento), hospedagem **Vercel**.

---

## Licença

Código sob [MIT License](LICENSE). Conteúdo institucional e marca pertencem à Acesso Equipamentos.

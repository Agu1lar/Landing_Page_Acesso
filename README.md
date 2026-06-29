# Acesso Equipamentos — Site institucional e captação de orçamentos

[![CI](https://github.com/Agu1lar/Landing_Page_Acesso/actions/workflows/CI.yml/badge.svg)](https://github.com/Agu1lar/Landing_Page_Acesso/actions/workflows/CI.yml)

Site da **Acesso Equipamentos** (locação de equipamentos para construção civil e plataformas aéreas). O visitante consulta o catálogo, monta um orçamento com vários itens e quantidades, e envia o pedido pelo **WhatsApp** (fluxo principal). O lead é salvo no **PostgreSQL**, o comercial recebe **e-mail interno** (Resend) e a equipe acompanha tudo no **painel administrativo**.

**Produção:** [https://acessoequipamentos.com.br/](https://acessoequipamentos.com.br/) · Preview Vercel: [landing-page-acesso.vercel.app](https://landing-page-acesso.vercel.app/)

**Repositório:** [github.com/Agu1lar/Landing_Page_Acesso](https://github.com/Agu1lar/Landing_Page_Acesso)

> Use só a URL de **Production** na Vercel (ou o domínio oficial quando estiver no ar). Deploys antigos na lista da Vercel ficam congelados naquela versão.

**Planejamento técnico:** [ROADMAP.temp.md](ROADMAP.temp.md)

**Fluxo solo (commit direto na `main`):** [docs/FLUXO-SOLO.md](docs/FLUXO-SOLO.md)

---

## Changelog — 15 jun 2026 (GEO / descoberta por IAs)

Preparação para **buscas generativas** (ChatGPT, Perplexity, Gemini, Copilot) — funciona na URL Vercel e migra automaticamente quando o domínio oficial estiver no ar.

| Recurso | URL | Descrição |
|---------|-----|-----------|
| **llms.txt** | `/llms.txt` | Mapa em texto para LLMs: resumo da empresa, categorias, contato, links principais |
| **Catálogo JSON** | `/catalog.json` | Equipamentos publicados com specs e URLs absolutas (cache 5 min) |
| **robots.txt** | `/robots.txt` | Regras explícitas para `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc. |
| **Head + HTML** | — | `<link rel="alternate">` no `<head>` e hints ocultos no HTML (sem link no rodapé) |
| **Sitemap** | `/sitemap.xml` | Inclui `/llms.txt` e `/catalog.json` |

Guia completo: [docs/GEO-AI-SEARCH.md](docs/GEO-AI-SEARCH.md) · health check: `GET /api/health` → `aiDiscovery`.

---

## Changelog — jun 2026 (CMS, catálogo admin, plataformas)

Resumo das entregas de conteúdo e operação comercial no painel.

### CMS de blog / dicas (`/dicas`)

- Artigos migrados de TypeScript estático para **Postgres** (`migrations/0021_blog_articles.sql`).
- Painel em **`/dashboard/dicas`**: criar, editar, **publicar** e **tirar do ar** (rascunho / arquivado).
- Editor **TipTap** com formatação, imagens, **vídeo** (YouTube, Vimeo ou upload MP4/WebM até 50 MB), **links** (redirect, nova aba, download) e **botão CTA**.
- Capa do artigo com upload drag-and-drop (Blob Vercel ou `public/blog/uploads/` local).
- Páginas públicas: **`/dicas`** (listagem) e **`/dicas/[slug]`** (artigo com HTML rico).
- Upload de mídia: `POST /api/admin/blog/upload` · biblioteca: `src/lib/blog-tiptap-extensions.ts`.

### Admin de equipamentos (CRUD completo)

- **`/dashboard/equipamentos`**: lista com busca, filtro por categoria e status (ativo / rascunho / arquivado).
- **`/dashboard/equipamentos/new`** e **`/dashboard/equipamentos/[slug]/edit`**: formulário comercial (nome, slug, categoria, descrições, specs, tags, visibilidade).
- **Galeria de fotos**: drag-and-drop, foto principal, texto alternativo; upload via **`POST /api/admin/equipment/upload`** → **fonte oficial** de fotos (Blob + Postgres).
- Armazenamento: **Vercel Blob Public** em produção; em dev, `public/equipamentos/uploads/` (sem Blob).
- Prévia no painel resolve URLs como o site público (`src/lib/admin-gallery-image.ts` — Blob + DB; manifest só como fallback).
- **Nomes em MAIÚSCULAS** ao salvar e nos cards (`src/lib/equipment-name.ts`).
- **Arquivar** e **duplicar** equipamento; botões com feedback de carregamento (`AdminPendingButton`).
- **Voltar para lista** mantém filtros da busca (`admin-return-path.ts`).
- Linhas **「Só no site (JSON)」**: itens que aparecem no catálogo público mas ainda não estão no Postgres — botão **Trazer para o painel**.
- Ações de sync (barra superior):
  - **Sincronizar catálogo prioritário** (`syncPriorityCatalogAction`)
  - **Consolidar mangotes** — unifica `mangote-vibrador` e arquiva slugs legados (`consolidateMangoteVibradorAction`)
  - **Sincronizar textos ferramentas elétricas** — copia do JSON para o Postgres (`syncFerramentasEletricasCopyAction`)
- Auditoria do catálogo: `node docs/scripts/audit-equipment-catalog.mjs` · lib: `src/lib/equipment-catalog-audit.ts`.

### Filtros de plataformas elevatórias (site + admin)

- Na categoria **`/categorias/plataformas-elevatorias`**: filtros por **tipo** (Tesoura, Articulada, Telescópica, **Mastro vertical**) e por **faixa de altura de trabalho**.
- No admin, campo **Filtro na aba Plataformas elevatórias** + **Altura de trabalho (metros)** — grava spec `Tipo`, tag de filtro e altura automaticamente.
- Bibliotecas: `src/lib/platform-kind.ts`, `src/lib/platform-kind-admin.ts`, `src/lib/platform-height-admin.ts`.

### Sitemap e SEO

- **`lastModified` real** no sitemap: datas de `equipment.updated_at` e `publishedAt` dos artigos (não mais `new Date()` em todo build).
- Itens só no JSON usam data estável quando não há linha no Postgres.

### UX do painel

- Navegação com **estado de loading** nos formulários (salvar, arquivar, importar, sync).
- Item arquivado **some da lista** ativa (não fica editável como ativo).
- Ajuda contextual (`AdminHelpLauncher`) inclui fotos de equipamentos e editor de blog.

---

## Changelog — jun 2026 (leads da semana, fotos, catálogo)

### Leads da semana e fila comercial

- **`/dashboard/leads`** — visão operacional da **semana atual** (segunda–domingo): fila comercial, tabela resumida e alertas.
- **`/dashboard/leads/consulta`** — consulta completa com filtros, paginação e export CSV (histórico e campanhas).
- **Prioridade com bônus de recência** — leads das últimas 6h/24h/48h sobem na fila além do score quente/morno/frio.
- **Arquivamento automático** — leads com status *Novo* de semanas anteriores passam para **Arquivado** ao abrir o painel (recuperáveis na consulta).
- Alerta de leads parados (+24h) **só na semana corrente**.
- Status **`archived`** (Arquivado) no funil comercial.
- Libs: `src/lib/leads-auto-archive.ts`, `src/lib/leads-stale-alert.ts`.

### Fotos de equipamentos — fluxo atual

- **Canal oficial:** galeria no painel (`/dashboard/equipamentos/[slug]/edit`) → **Vercel Blob Public** (produção) ou `public/equipamentos/uploads/` (dev).
- URLs gravadas no Postgres (`equipment_images`); o site prioriza upload do admin sobre qualquer legado.
- **Legado no repositório** (não é mais o fluxo de cadastro):
  - `public/equipamentos/{slug}.ext` — poucas fotos commitadas de migrações antigas.
  - `src/data/equipment-image-manifest.json` — índice estático usado como **fallback** quando não há foto no painel.
  - `docs/scripts/sync-equipment-photos.py` — só para manutenção pontual do legado; **novas fotos devem ir pelo admin**.
- Resolução: `src/lib/equipment-image-resolve.ts` (Blob/DB > manifest > placeholder).

### Catálogo e nomes

- **Nomes em MAIÚSCULAS** nos cards e no banco (`formatEquipmentName` + migration `0022_uppercase_equipment_names.sql`).
- **Aliases de slug** (`equipment-photo-aliases.json`, `equipment-slug-aliases.ts`) — evita duplicata JSON/Postgres (ex.: `nivel-laser` vs `nível-laser`) e itens arquivados que sumem do catálogo público.
- Revalidação de paths ao arquivar equipamento inclui variantes de slug.

### Métricas e migrations

- Migration idempotente **`0023_ensure_analytics_engagement_schema`** — garante `page_engagement_events` e `lead_kind` em bancos que não aplicaram a `0009`.
- Dashboard de métricas tolera schema pendente (KPIs principais continuam; engajamento por página fica vazio até migrar).

### Painel de acesso (admin)

- **`/dashboard/acesso`** — allowlist de e-mails autorizados no painel (`migrations/0012_dashboard_allowlist.sql`).

---

## Changelog — 15 jun 2026

Resumo do que foi projetado e entregue nesta sessão (commits `c2d7f1b` … `main`).

### Google Analytics 4 e conversões Google Ads

- Integração **GA4** com consentimento de cookies (só dispara após aceitar analytics).
- Eventos de conversão: `whatsapp_click`, `phone_click`, `generate_lead` (orçamento).
- Captura de **gclid / gbraid / wbraid** na sessão e gravação no lead (`migrations/0010_google_click_ids.sql`).
- Guia de configuração manual (Vercel + importação no Google Ads): [docs/GOOGLE-ADS-GA4.md](docs/GOOGLE-ADS-GA4.md).
- **Env necessária:** `NEXT_PUBLIC_GA_MEASUREMENT_ID` na Vercel (Production).

### Painel comercial (leads)

- **`/dashboard/leads`** — **Leads da semana**: fila do comercial (status *Novo*), tabela resumida e alertas da semana corrente.
- **`/dashboard/leads/consulta`** — consulta completa, filtros, paginação e export CSV (histórico).
- **Score de intenção** (quente / morno / frio) com **bônus de recência** (últimas horas sobem na fila).
- **Arquivamento automático** de leads *Novos* não atendidos de semanas anteriores (status **Arquivado**).
- **Alerta de leads parados** (+24 h sem contato, só na semana atual).
- Export CSV, filtros, notas internas e atribuição UTM/gclid na ficha do lead.
- Leads **Google (cookies)** e **Google One Tap** opcional (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`) — ver [docs/GOOGLE-ONE-TAP.md](docs/GOOGLE-ONE-TAP.md).
- Correção de crash ao abrir o painel (ícones server → client na navegação).

### Métricas operacionais (`/dashboard/analytics`)

- Dashboard com KPIs: visualizações, tempo ativo, cliques WhatsApp, leads no período.
- Tabelas: páginas mais acessadas, equipamento × conversão, origem do WhatsApp, tráfego UTM, campanhas, dispositivo, landing pages.
- Filtro por período (7 / 30 dias ou intervalo customizado).
- **Ajuda contextual:** botão **?** em cada card + guia flutuante no canto da tela (`AdminHelpLauncher`).
- **Rótulos em português claro** — códigos internos (`site-header`, `direto`, `/`) viram textos legíveis (`Topo do site (menu principal)`, `Acesso direto`, `Página inicial`).
- Biblioteca: `src/lib/analytics-display-labels.ts`.

### Catálogo e performance

- Categoria **plataformas-elevatorias** exibida como **Plataformas elevatórias** (slug da URL mantido).
- **Cache de 5 min** no catálogo e no mapa de imagens (`unstable_cache` + tags em `equipment-cache-tags.ts`).
- Cards do catálogo **síncronos no client** com `imageSrc` pré-resolvido no servidor (sem round-trip de DB por card).
- Resolução de fotos: **upload admin (Blob/DB)** com fallback no manifest legado (`equipment-image-resolve.ts`).
- Página de detalhe usa `EquipmentDetailImage` (sem `pg` no bundle do browser — fix build Vercel).

### Mobile e conversão

- **Barra fixa inferior** no celular (WhatsApp, orçamento, ligar) com origens rastreadas por página.
- CTAs de conversão unificados com tracking PostHog + GA4.

### Infra e build

- `server-only` em módulos de DB; `serverExternalPackages: ['pg']` no Next.js.
- Migração `0010` registrada no journal Drizzle (corrige 500 ao listar leads em produção).
- Rota `/dashboard/analytics` liberada no middleware para papel `comercial` e `admin`.

### SEO local — área de atendimento

- Bloco visual **`ServiceAreaSection`** com as 16 cidades da RMBH (lista única em `brand.serviceAreaCities`, alinhada ao JSON-LD).
- Exibido na **home** (abaixo do hero), **contato** e **sobre**.
- Belo Horizonte destacada como **Sede**; meta description da home cita Contagem, Betim e Nova Lima.

---

## Números do catálogo (referência)

| Métrica | Valor |
|---------|------:|
| Itens no catálogo (JSON base) | **148** (110 equipamentos + **38 acessórios**) |
| Categorias | 9 (inclui **Acessórios**) |
| Fotos no manifest legado | **~150 entradas** em `src/data/equipment-image-manifest.json` (fallback estático) |
| Fotos no repositório (`public/equipamentos/`) | **Poucas dezenas** commitadas — legado de migração; **não** é o fluxo atual |
| Fotos em produção | **Painel admin + Vercel Blob** (Postgres `equipment_images`) — fonte de verdade para itens editados no CMS |

> **Operação:** novas fotos → `/dashboard/equipamentos` → editar item → galeria. O manifest/script Python só serve para manutenção do acervo antigo ainda não migrado ao painel.

---

## O que já está implementado

### Páginas públicas (marketing)

| Página | Rota | Conteúdo |
|--------|------|----------|
| Início | `/` | Apresentação, área de atendimento (RMBH), categorias, depoimentos Google, como funciona |
| Equipamentos | `/equipamentos` | Catálogo com busca e filtro por categoria |
| Detalhe | `/equipamentos/[slug]` | Ficha, specs (plataformas aéreas), foto, relacionados, carrinho |
| Categorias | `/categorias/[slug]` | SEO por linha, galeria (ex.: guindaste/Munck), filtros de plataforma (tipo + altura), listagem do catálogo |
| Dicas / blog | `/dicas`, `/dicas/[slug]` | Artigos publicados via CMS (Postgres + TipTap) |
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
- **Plataformas elevatórias:** filtros públicos por tipo (tesoura, articulada, telescópica, mastro vertical) e altura de trabalho na página de categoria.
- **Guindaste / Munck:** migration `0007`, sync em `src/lib/equipment-sync.ts`, botão **Sincronizar catálogo prioritário** em `/dashboard/equipamentos`.
- **Mangote vibrador:** item consolidado `mangote-vibrador`; slugs legados arquivados — botão **Consolidar mangotes** no admin.

### Catálogo e conteúdo

- **110 equipamentos** do inventário original + **38 acessórios** (`src/data/equipamentos.json` — seed/fallback até existir no Postgres).
- **Especificações das 14 plataformas aéreas** revisadas no JSON.
- **Nomes padronizados** em MAIÚSCULAS no site e no admin (`src/lib/equipment-name.ts`).
- **Fotos (fluxo atual):** painel admin → Blob Vercel → Postgres; manifest + `public/equipamentos/` são **fallback legado** (ver seção [Fotos e mídia](#fotos-e-mídia-operacional)).
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
- **Sitemap** com prioridades de crawl (home, categorias, catálogo, fichas, **dicas**) e `lastModified` a partir do Postgres.
- **GEO / IAs:** [`/llms.txt`](docs/GEO-AI-SEARCH.md), [`/catalog.json`](docs/GEO-AI-SEARCH.md), robots para crawlers de IA — ver [docs/GEO-AI-SEARCH.md](docs/GEO-AI-SEARCH.md).
- Testes unitários em `src/lib/seo-metadata.test.ts`, `src/lib/json-ld.test.ts` e `src/lib/ai-discovery.test.ts`.

### Analytics e LGPD

- **PostHog** (opcional via env): `page_view`, `equipment_view`, `whatsapp_click`, UTMs como super properties.
- **Google Analytics 4** (opcional): page views e eventos de conversão após consentimento — ver [docs/GOOGLE-ADS-GA4.md](docs/GOOGLE-ADS-GA4.md).
- **Tempo ativo por página** (`page_engagement_events`) — só conta aba visível com interação recente.
- **Banner de cookies**: PostHog e GA4 só iniciam após consentimento (`AnalyticsConsentProvider`).
- Política de privacidade atualizada (menção a analytics).

### Painel administrativo (Clerk)

Rotas protegidas por **Clerk** + papel em `publicMetadata.role` (`admin` ou `comercial`):

| Recurso | Rota / API |
|---------|------------|
| Login | `/sign-in` (cadastro público desativado → redireciona) |
| **Leads da semana** | `/dashboard/leads` — fila, alertas e resumo da semana |
| **Consulta de leads** | `/dashboard/leads/consulta` — histórico, filtros, CSV |
| Detalhe do lead | `/dashboard/leads/[id]` |
| **Métricas operacionais** | `/dashboard/analytics` |
| Fila comercial + prioridade | `/dashboard/leads` (status *Novo*, score + recência) |
| Arquivamento automático | Leads *Novos* de semanas anteriores → status **Arquivado** |
| Filtros (consulta) | Data, status, cidade, origem, campanha UTM, busca textual |
| Atalhos de data | Últimos 7 / 30 dias |
| Status do lead | `PATCH /api/admin/leads/[id]/status` (`new`, `contacted`, `quoted`, `won`, `lost`, `archived`) |
| Notas internas | `PATCH /api/admin/leads/[id]/notes` |
| Export CSV | `GET /api/admin/leads/export` |
| **Equipamentos (admin)** | `/dashboard/equipamentos` — CRUD, galeria (Blob), specs, filtros de plataforma, sync JSON |
| **Blog / dicas (admin)** | `/dashboard/dicas` — editor TipTap, capa, publicar / tirar do ar |
| **Acesso ao painel** | `/dashboard/acesso` — allowlist de e-mails (só `admin`) |
| Upload de fotos (equip.) | `POST /api/admin/equipment/upload` |
| Upload de mídia (blog) | `POST /api/admin/blog/upload` (imagem até 5 MB · vídeo até 50 MB) |
| Ajuda contextual | Botão **?** flutuante + **?** em cada métrica |

Guia completo: [docs/CLERK-ACESSO-ADMIN.md](docs/CLERK-ACESSO-ADMIN.md)

### UX e conversão

- Busca global no header + **Ctrl+K**.
- WhatsApp contextual com rastreamento (`TrackedWhatsAppLink`) — origens legíveis no painel de métricas.
- **Barra fixa mobile** (WhatsApp, orçamento, ligar) com origem por página.
- Layout marketing estável (server components + `next-intl`).
- Mobile-first; CTAs com WhatsApp em destaque.
- Link **Área restrita** no footer → `/sign-in`.

### Infraestrutura

- Deploy automático na **Vercel** a cada push em `main`.
- **Build:** `npm run build` (roda `db:migrate` antes do `next build` — ver `vercel.json`).
- Banco **Neon** (produção) + **PGlite** local (porta 5433 no `npm run dev`).
- Migrações Drizzle: leads, equipamentos admin (`0006`), blog (`0021`), guindaste/Munck (`0007`), analytics (`0009`, `0023`), gclid (`0010`), nomes maiúsculos (`0022`), allowlist (`0012`), etc.
- **Vercel Blob Public** para fotos de equipamentos e mídia do blog (`BLOB_STORE_ID`, `BLOB_ACCESS=public`).
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
| Média | **Fotos faltantes** — enviar pelo **painel admin** (galeria + Blob); manifest/script Python só para legado |
| Média | **Casos de Sucesso** — logos em `public/clientes/{setor}/` — [docs/CLIENT-LOGOS.md](docs/CLIENT-LOGOS.md) |
| Média | Polish Sprint 7 (a11y, PageSpeed mobile) |
| Manual | Configurar **GA4** na Vercel (`NEXT_PUBLIC_GA_MEASUREMENT_ID`) e importar conversões no Google Ads — [docs/GOOGLE-ADS-GA4.md](docs/GOOGLE-ADS-GA4.md) |
| Planejado | Sprints 12–22 (CRM, disponibilidade frota, SEO programático) |

**Já no código (go-live):** mapa 301 WP, scripts auditoria GSC/Ads, guindaste no Postgres, health check, specs no WhatsApp, catálogo sem “estoque”, painel comercial com **leads da semana** + arquivamento automático, GA4 + gclid nos leads, **CMS de blog**, **CRUD de equipamentos com fotos via Blob**, **filtros de plataformas elevatórias**, nomes em maiúsculas nos cards, aliases de slug, allowlist de acesso.

---

## Fotos e mídia (operacional)

### Equipamentos — fluxo recomendado (produção)

1. Acesse **`/dashboard/equipamentos`** → editar o item (ou **Trazer para o painel** se ainda estiver só no JSON).
2. Na **galeria**, arraste JPG, PNG ou WebP (foto principal + alternativas + texto `alt`).
3. Salve — em produção a imagem vai para **Vercel Blob Public** e a URL fica no Postgres.
4. O site público usa essa URL com prioridade (`equipment-image-resolve.ts`).

**Requisito Vercel:** Blob store **Public** (`BLOB_STORE_ID`, `BLOB_ACCESS=public`) — [docs/GO-LIVE-GATE.md](docs/GO-LIVE-GATE.md) § Blob.

### Legado no código (fallback, não cadastrar fotos novas assim)

| Artefato | Função hoje |
|----------|-------------|
| `src/data/equipment-image-manifest.json` | Índice estático ~150 slugs → caminho local; usado quando **não** há upload no painel |
| `public/equipamentos/*.webp` (etc.) | Dezenas de arquivos commitados na migração inicial; poucos itens |
| `src/data/equipment-photo-aliases.json` | Nomes de arquivo que não batem com o slug |
| `docs/scripts/sync-equipment-photos.py` | Atualiza manifest + copia de `_incoming/` — **manutenção pontual** do legado |

**Não** é necessário commitar novas fotos em `public/equipamentos/` para o site funcionar em produção — use o painel.

### Blog / dicas

- Capa e imagens no corpo: upload no editor TipTap ou `POST /api/admin/blog/upload`.
- Local dev: `public/blog/uploads/`; produção: Blob.

### Acessórios e auditoria

Novos acessórios no catálogo JSON: `python docs/scripts/seed-acessorios.py` (idempotente).

Auditoria catálogo (JSON vs Postgres, filtros de plataforma, destaques): `node docs/scripts/audit-equipment-catalog.mjs`

Guia legado de fotos (script Python): [docs/SPRINT-9-FOTOS.md](docs/SPRINT-9-FOTOS.md) — consulte só para acervo antigo.

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
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Opcional | GA4 + conversões Google Ads — [docs/GOOGLE-ADS-GA4.md](docs/GOOGLE-ADS-GA4.md) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Opcional | Google One Tap para identificar leads — [docs/GOOGLE-ONE-TAP.md](docs/GOOGLE-ONE-TAP.md) |
| `NEXT_PUBLIC_SENTRY_DISABLED=true` | Preview | Sem Sentry no preview |
| `ARCJET_KEY` | Opcional | Rate limit em `/api/leads` |
| `BLOB_STORE_ID`, `BLOB_ACCESS=public` | Produção (fotos/blog) | Conectar **Blob Public** ao projeto na Vercel — ver [docs/GO-LIVE-GATE.md](docs/GO-LIVE-GATE.md) § Blob |
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
| [docs/GO-LIVE-GATE.md](docs/GO-LIVE-GATE.md) | Gate pré-domínio (CI, 301, health, Blob, DNS Task) |
| [docs/CLERK-ACESSO-ADMIN.md](docs/CLERK-ACESSO-ADMIN.md) | Painel, papéis e Clerk Production no go-live |
| [docs/GOOGLE-ADS-GA4.md](docs/GOOGLE-ADS-GA4.md) | GA4, eventos de conversão e gclid no Google Ads |
| [docs/GOOGLE-ONE-TAP.md](docs/GOOGLE-ONE-TAP.md) | Google One Tap para leads (opcional) |
| [docs/GEO-AI-SEARCH.md](docs/GEO-AI-SEARCH.md) | llms.txt, catalog.json e crawlers de IA |
| [docs/FLUXO-SOLO.md](docs/FLUXO-SOLO.md) | Commit direto na `main` (fluxo solo) |
| `docs/scripts/audit-equipment-catalog.mjs` | Auditoria catálogo (JSON, Postgres, plataformas) |
| `docs/scripts/audit-legacy-redirects.mjs` | Valida cobertura 301 (sitemap + GSC) |
| `docs/scripts/import-google-ads-urls.mjs` | Audita URLs finais dos anúncios |
| `src/data/legacy-redirects.json` | Mapa 301 versionado |
| `src/data/google-ads-landing-urls.json` | Última auditoria Google Ads |
| [docs/inventario-equipamentos.csv](docs/inventario-equipamentos.csv) | Inventário base (110 itens) |
| [.env.example](.env.example) | Variáveis de ambiente |

---

## Base técnica

**Next.js 16** (App Router), **TypeScript**, **Tailwind v4**, **next-intl** (pt-BR), **Drizzle** + **PostgreSQL** (Neon / PGlite), **Zod**, **React Hook Form**, **TipTap** (CMS blog), **Resend**, **Arcjet**, **Clerk** (auth do painel), **Vercel Blob** (fotos e mídia), **PostHog** + **GA4** (analytics com consentimento), hospedagem **Vercel**.

---

## Licença

Código sob [MIT License](LICENSE). Conteúdo institucional e marca pertencem à Acesso Equipamentos.

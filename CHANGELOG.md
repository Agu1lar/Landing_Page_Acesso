# Changelog

Histórico de entregas do projeto. Detalhes operacionais e guias estão em [`docs/`](docs/) — aqui só o que mudou e links.

Formato: mais recente primeiro.

---

## 2026-07 — Métricas avançadas, geo e painel analytics

Instrumentação comercial, reorganização do painel de métricas, geolocalização opcional (LGPD) e correções de build/deploy.

### Painel `/dashboard/analytics` (Sprint 12–13)

- **7 abas:** Visão geral, Conversão, Campanhas, Catálogo, Tráfego, Comportamento, Executivo (`?section=`)
- Funil, abandono de carrinho, scroll, busca, equipamento × conversão
- Funil comercial de WhatsApp: lead de orçamento → cliente respondeu no WhatsApp (ChatPro) → ganho
- Aba **Executivo:** série diária, leads por cidade, tops, export CSV
- Filtros: padrão = mês atual (dia 1 → hoje, Brasília); comparação opcional para % dos KPIs
- `AnalyticsMetricSection`, `AdminHelpLauncher`, libs em `src/lib/analytics-*.ts`

### WhatsApp confirmado via ChatPro

- `whatsapp_opened`: registra quando o navegador abriu o WhatsApp após o envio do orçamento (`0030_leads_whatsapp_opened.sql`)
- `whatsapp_replied_at`: registra quando o ChatPro envia webhook de mensagem recebida do cliente (`0034_leads_whatsapp_replied.sql`)
- Webhook `POST /api/webhooks/chatpro` com segredo `CHATPRO_WEBHOOK_SECRET`
- Match por telefone normalizado, dentro de janela de 45 dias, ignorando abertura de sessão sem mensagem recebida

### API privada para novas campanhas

- Endpoints somente leitura em `/api/internal/v1/ads-quality/*`
- Autenticação server-to-server com `INTERNAL_API_SECRET`
- Contratos para resumo, campanhas e leads redigidos por `campaignPrefix`
- Base para app externo analisar qualidade comercial sem acessar o banco diretamente

### Geolocalização (após aceitar analytics)

- Prompt opcional do navegador → `geo_city` / `geo_region` em leads e eventos
- Migration `0026_visitor_geo.sql` · `src/lib/visitor-geo.ts` · `POST /api/analytics/visitor-geo`
- Export CSV de leads com gclid e colunas geo

### Correções técnicas

- Build Vercel: tipos client-safe (`analytics-admin-types.ts`, `leads-filter-query.ts`, etc.)
- Allowlist `/dashboard/acesso` via Server Actions (`access-admin.ts`)
- Journal Drizzle: migrations `0025`, `0026` registradas

**Docs:** [GOOGLE-ADS-GA4.md](docs/GOOGLE-ADS-GA4.md) · [GO-LIVE-GATE.md](docs/GO-LIVE-GATE.md)

---

## 2026-06-15 — GEO / descoberta por IAs

- `/llms.txt`, `/catalog.json`, `robots.txt` (crawlers de IA), hints no HTML
- Sitemap inclui llms + catalog

**Doc:** [GEO-AI-SEARCH.md](docs/GEO-AI-SEARCH.md)

---

## 2026-06-15 — GA4, painel comercial e SEO local

- **GA4** com consentimento; eventos `whatsapp_click`, `phone_click`, `generate_lead`
- **gclid** / gbraid / wbraid nos leads (`0010_google_click_ids.sql`)
- **`/dashboard/leads`** (semana) e **`/dashboard/leads/consulta`** (histórico + CSV)
- Score quente/morno/frio, arquivamento automático, alerta +24h, status `archived`
- Google One Tap opcional
- **`ServiceAreaSection`** (16 cidades RMBH) na home, contato e sobre
- Cache catálogo 5 min; barra fixa mobile; `server-only` + `pg` no server

**Docs:** [GOOGLE-ADS-GA4.md](docs/GOOGLE-ADS-GA4.md) · [GOOGLE-ONE-TAP.md](docs/GOOGLE-ONE-TAP.md) · [CLERK-ACESSO-ADMIN.md](docs/CLERK-ACESSO-ADMIN.md)

---

## 2026-06 — CMS, catálogo admin e operação

### Blog / dicas (`/dicas`)

- Postgres + TipTap (imagem, vídeo, links, CTA) · painel `/dashboard/dicas`
- Migration `0021_blog_articles.sql` · upload `POST /api/admin/blog/upload`

### Equipamentos (CRUD admin)

- `/dashboard/equipamentos` — lista, criar, editar, arquivar, duplicar
- Galeria → **Vercel Blob Public** + Postgres (`equipment_images`)
- Filtros de **plataformas elevatórias** (tipo + altura) no site e no admin
- Sync JSON → Postgres (prioritário, mangotes, ferramentas elétricas)
- Nomes em MAIÚSCULAS (`0022_uppercase_equipment_names.sql`)

### Leads da semana

- Fila comercial semana corrente vs consulta histórica
- `leads-auto-archive.ts`, `leads-stale-alert.ts`
- Allowlist e-mails painel (`0012_dashboard_allowlist.sql`) · `/dashboard/acesso`

### Fotos e catálogo

- Fluxo oficial: painel admin → Blob → Postgres (`equipment-image-resolve.ts`)
- Manifest JSON + `public/equipamentos/` = **fallback legado** apenas
- Aliases de slug; sitemap com `lastModified` real do Postgres

### Métricas (base)

- Dashboard operacional; migration `0023_ensure_analytics_engagement_schema`

**Docs:** [SPRINT-9-FOTOS.md](docs/SPRINT-9-FOTOS.md) · [MIGRACAO-SEO-WP.md](docs/MIGRACAO-SEO-WP.md) · [PREVIEW-VALIDACAO.md](docs/PREVIEW-VALIDACAO.md)

---

## Referência rápida (estado atual do produto)

Para inventário completo de rotas, APIs e pendências de go-live, ver [README.md](README.md) e [ROADMAP.temp.md](ROADMAP.temp.md).

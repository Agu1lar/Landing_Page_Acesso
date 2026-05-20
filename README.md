# Acesso Equipamentos — Site institucional e captação de orçamentos

Site da **Acesso Equipamentos** (locação de equipamentos para construção civil e plataformas aéreas). O visitante consulta o catálogo, monta um orçamento com vários itens e quantidades, e envia o pedido pelo **WhatsApp** (fluxo principal para o cliente). O lead é salvo no banco e o comercial recebe **e-mail interno** de registro.

**URL de produção / preview (sempre a versão mais nova):** [https://landing-page-acesso.vercel.app/](https://landing-page-acesso.vercel.app/)

> Use só este domínio (ou o domínio oficial em Production na Vercel). Links de deploys antigos na lista da Vercel ficam congelados naquela versão — não atualizam sozinhos.

**Planejamento técnico:** [ROADMAP.temp.md](ROADMAP.temp.md)

---

## Números do catálogo (atual)

| Métrica | Valor |
|---------|------:|
| Itens no catálogo | **148** (110 equipamentos + **38 acessórios**) |
| Categorias | 9 (inclui **Acessórios**) |
| Fotos publicadas | **~144** itens com imagem (`equipment-image-manifest.json`) |
| Acessórios com foto | **36 / 38** (faltam maleta e pinça — futuro) |

---

## O que já está implementado

### Páginas públicas

| Página | Rota | Conteúdo |
|--------|------|----------|
| Início | `/` | Apresentação, categorias (incl. acessórios), depoimentos, como funciona |
| Equipamentos | `/equipamentos` | Catálogo completo com busca e filtro por categoria |
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
3. Dispara **e-mail interno** ao comercial (Resend), assunto `[Registro interno]`.
4. Abre o **WhatsApp** com mensagem em primeira pessoa para o cliente enviar ao comercial.

### Catálogo e conteúdo

- **110 equipamentos** do inventário original (betoneiras, plataformas, andaimes, ferramentas, etc.).
- **38 acessórios** (ponteiras/talhadeiras por peso, punhos, cabo, mangueira, chaves, peças de solda, etc.).
- **Especificações das 14 plataformas aéreas** revisadas no JSON (alturas/tipos corrigidos).
- **Nomes padronizados** no catálogo (`normalize-equipment-names.py`).
- **Fotos da frota:** pasta `public/equipamentos/{slug}.ext` + script `sync-equipment-photos.py` + aliases em `equipment-photo-aliases.json` (nomes de arquivo com instruções, ex.: “adicionar para todos os tamanhos”).

### UX, SEO e conversão

- Busca global no header + **Ctrl+K**.
- WhatsApp contextual (página, equipamento, origem).
- JSON-LD (empresa e produtos), Open Graph, sitemap, robots (preview **noindex**).
- Layout marketing corrigido (footer/server components sem erro de `getTranslations` no client).
- Mobile-first; CTAs com WhatsApp em destaque.

### Infraestrutura

- Deploy automático na **Vercel** a cada push em `main`.
- Banco **Neon** (produção) + migrações Drizzle (`leads`, `items_json`).
- Rate limit no `POST /api/leads` (Arcjet).
- Testes: unitários (`quote-whatsapp`, etc.) e E2E Playwright (fluxos de marketing).

---

## O que ainda falta (resumo)

Detalhamento por sprint em [ROADMAP.temp.md](ROADMAP.temp.md).

| Prioridade | Item |
|------------|------|
| Alta | **Domínio oficial** `acessoequipamentos.com.br` (Sprint 10) |
| Baixa | **2 fotos de acessórios (futuro):** maleta, pinça solda — demais itens críticos já com foto |
| Alta | Cases / logos de clientes na home |
| Média | Analytics em produção (PostHog / GA) + banner de cookies |
| Média | CI completo no GitHub (lint + types + e2e em todo PR) |
| Média | Polish Sprint 7 (a11y, skeletons, PageSpeed alvo) |
| Planejado | **Sprint 11** — admin: CRUD, leads, CSV |
| Planejado | **Sprints 12–13** — analytics avançado, dashboard executivo, ROI |
| Planejado | **Sprints 14–15** — SEO por cidade, prova social (cases/logos) |
| Planejado | **Sprints 16–18** — CRM, inteligência de catálogo, disponibilidade frota |
| Backlog | **Sprints 19–22** — PWA, IA comercial, área do cliente, blog técnico |
| Opcional | Docker local (Sprint 7.9) |

---

## Fotos e acessórios (operacional)

1. Coloque arquivos em `public/equipamentos/_incoming/` (o nome pode trazer instruções, ex.: `ponteira (adicionar para todos os tamanhos).webp`).
2. Rode: `python docs/scripts/sync-equipment-photos.py`
3. Commit das imagens em `public/equipamentos/` e do `equipment-image-manifest.json`.

Guia: [docs/SPRINT-9-FOTOS.md](docs/SPRINT-9-FOTOS.md)

Novos acessórios no catálogo: `python docs/scripts/seed-acessorios.py` (idempotente).

Validação do preview: [docs/PREVIEW-VALIDACAO.md](docs/PREVIEW-VALIDACAO.md)

---

## Como rodar localmente

### Requisitos

- **Node.js 22+**
- **Clerk** (chaves no `.env.local` — boilerplate; visitante do site não precisa login)
- **PostgreSQL** (PGlite sobe com `npm run dev` na porta 5433) ou **Neon** via `DATABASE_URL`

### Passos

```shell
# 1. Copiar ambiente
cp .env.example .env.local   # Windows: copie manualmente

# 2. Instalar e subir
npm install
npm run dev
```

Abrir **http://localhost:3000**

Migrações: aplicadas no `dev` ou `npm run db:migrate` com `DATABASE_URL` apontando para Neon/local.

### E-mail de leads (opcional)

No `.env.local` / Vercel:

- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL`

### Comandos úteis

| Comando | Uso |
|---------|-----|
| `npm run dev` | Desenvolvimento |
| `npm run build-local` | Build de produção local |
| `npm run check:types` | TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | Testes unitários |
| `npm run test:e2e` | Playwright |

---

## Publicação (Vercel)

- **Branch de produção:** `main`
- **Build:** `npm run build:next` (ver `vercel.json`)
- **URL estável:** `https://landing-page-acesso.vercel.app`

### Variáveis (Production + Preview)

| Variável | Obrigatória |
|----------|:-----------:|
| `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sim — preview: `pk_test_`; **domínio oficial: `pk_live_` (Clerk Production)** |
| `DATABASE_URL` (Neon) | Sim |
| `NEXT_PUBLIC_APP_URL` | Recomendada |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL` | Para e-mail de leads |
| `NEXT_PUBLIC_SENTRY_DISABLED=true` | Preview sem Sentry |

Guia: [docs/DEPLOY-PREVIEW-VERCEL.md](docs/DEPLOY-PREVIEW-VERCEL.md)

### Atualizar produção

```shell
git push origin main
```

Aguarde deploy **Ready** no topo da lista (**Production**, commit mais recente). Não use **Redeploy** em deploys antigos da lista.

---

## Documentação no repositório

| Arquivo | Conteúdo |
|---------|----------|
| [ROADMAP.temp.md](ROADMAP.temp.md) | Sprints, feito vs pendente |
| [docs/PREVIEW-VALIDACAO.md](docs/PREVIEW-VALIDACAO.md) | Checklist de validação |
| [docs/SPRINT-9-FOTOS.md](docs/SPRINT-9-FOTOS.md) | Fluxo de fotos |
| [docs/DEPLOY-PREVIEW-VERCEL.md](docs/DEPLOY-PREVIEW-VERCEL.md) | Deploy Vercel |
| [docs/CLERK-ACESSO-ADMIN.md](docs/CLERK-ACESSO-ADMIN.md) | Painel, papéis e Clerk Production no go-live |
| [docs/inventario-equipamentos.csv](docs/inventario-equipamentos.csv) | Inventário base (110 itens) |
| [.env.example](.env.example) | Variáveis de ambiente |

---

## Base técnica

**Next.js** (App Router), **TypeScript**, **Tailwind v4**, **next-intl** (pt-BR), **Drizzle** + **PostgreSQL**, **Zod**, **React Hook Form**, **Resend**, **Arcjet**, **Clerk** (admin futuro), hospedagem **Vercel**, banco **Neon**.

---

## Licença

Código sob [MIT License](LICENSE). Conteúdo institucional e marca pertencem à Acesso Equipamentos.

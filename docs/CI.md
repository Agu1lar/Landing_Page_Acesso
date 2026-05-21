# CI — gate de produção (Sprint 8.7)

Pipeline em [`.github/workflows/CI.yml`](../.github/workflows/CI.yml). Objetivo: impedir merge em `main` com regressões em **orçamento**, **API de leads** e **build com migrate**.

## Jobs obrigatórios (recomendado no branch protection)

| Job | O que valida |
|-----|----------------|
| **Build with 22.x / 24.x** | `npm run build-local` (Next + PGlite em memória) |
| **Build with db migrate** | `npm run build` — mesmo caminho da Vercel (`db:migrate` + `next build`) |
| **Run static checks** | `lint`, `check:types`, `check:deps`, `check:i18n`, commitlint (PR) |
| **Run unit tests** | Vitest + coverage (thresholds em `quote-whatsapp`, `leads-admin`) |
| **Run E2E tests** | Playwright — marketing, **301 legado**, **API leads** |

Chromatic e Crowdin não bloqueiam o gate de produção.

## Secrets no GitHub (Settings → Secrets → Actions)

| Secret | Uso |
|--------|-----|
| `CLERK_SECRET_KEY` | Build migrate + E2E (servidor) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Build migrate + E2E |
| `CODECOV_TOKEN` | Upload de cobertura (opcional) |
| `CHROMATIC_PROJECT_TOKEN` | Regressão visual (opcional) |

Sem `CLERK_*`, o job **Build with db migrate** falha na validação de `Env.ts`.

## Rodar localmente (paridade com CI)

```bash
npm run lint
npm run check:types
npm run test
npm run test:e2e
npm run build-local
```

Com Postgres local (paridade com Vercel):

```bash
# DATABASE_URL apontando para Postgres com schema vazio
npm run build
```

## Testes críticos de negócio

| Arquivo | Fluxo |
|---------|--------|
| `tests/e2e/Marketing.conversion.e2e.ts` | Home, catálogo, formulário orçamento, WhatsApp |
| `tests/e2e/Legacy.redirects.e2e.ts` | 301 do blog WordPress |
| `tests/integration/Leads.api.integ.ts` | `POST /api/leads` — validação, honeypot, criação |
| `src/lib/legacy-redirects.test.ts` | Mapa de redirects |
| `src/lib/quote-whatsapp.test.ts` | Mensagem e URL WhatsApp |

Smoke do painel `/dashboard/leads` (login Clerk) fica para quando houver usuário de teste documentado em `docs/CLERK-ACESSO-ADMIN.md`.

## Branch protection em `main`

Configurar no GitHub (**Settings → Branches → Branch protection**):

1. Require status checks: **Build with 22.x**, **Build with 24.x**, **Build with db migrate**, **Run static checks**, **Run unit tests**, **Run E2E tests**
2. Desabilitar bypass para administradores (produção)
3. Vercel Production deploy apenas a partir de `main` com CI verde

## Adicionar redirect WordPress

Ver [MIGRACAO-SEO-WP.md](./MIGRACAO-SEO-WP.md) — editar `src/data/legacy-redirects.json` e rodar testes.

# Deploy preview na Vercel (Sprint 8.1)

Guia interno para publicar a landing em `*.vercel.app` **sem domínio customizado**, para validação do cliente.

---

## Pré-requisitos

- [ ] Conta em [vercel.com](https://vercel.com)
- [ ] Repositório Git do projeto (GitHub/GitLab/Bitbucket) — **não** usar só o remote do boilerplate ixartz
- [ ] Chaves Clerk (app de teste) — [dashboard.clerk.com](https://dashboard.clerk.com)
- [ ] `DATABASE_URL` PostgreSQL (recomendado: [Neon](https://neon.tech) free tier) — necessário para o build validar env

---

## Opção A — Vercel + Git (recomendado)

1. Crie repositório privado, por exemplo `LandPage-Acesso`, e faça push do projeto.
2. No Vercel: **Add New Project** → importe o repositório.
3. **Root Directory:** se o repo tiver pasta pai, aponte para `LandPage-Acesso`.
4. **Framework Preset:** Next.js (detectado automaticamente).

### Build settings (preview marketing)

| Campo | Valor |
|-------|--------|
| **Build Command** | `npm run build:next` |
| **Install Command** | `npm install` |
| **Output Directory** | _(padrão Next.js)_ |

> Usamos `build:next` no preview para não exigir migration no CI. O formulário de leads (Sprint 5) voltará a usar `npm run build` com `db:migrate` em produção.

### Variáveis de ambiente (Vercel → Settings → Environment Variables)

Copie de `.env.local` / Clerk / Neon. Mínimo para build:

| Variável | Preview | Produção |
|----------|---------|----------|
| `CLERK_SECRET_KEY` | ✓ | ✓ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✓ | ✓ |
| `DATABASE_URL` | ✓ (Neon) | ✓ |
| `NEXT_PUBLIC_APP_URL` | `https://SEU-PROJETO.vercel.app` | domínio oficial |
| `NEXT_PUBLIC_SENTRY_DISABLED` | `true` | opcional |

Opcional (desativar ruído no preview):

```
NEXT_PUBLIC_SENTRY_DISABLED=true
```

5. **Deploy** → aguarde build verde.
6. Copie a URL `https://….vercel.app` e cole em `docs/PREVIEW-VALIDACAO.md` (campo do link).
7. Envie ao Cezar o arquivo [PREVIEW-VALIDACAO.md](./PREVIEW-VALIDACAO.md).

---

## Opção B — Vercel CLI (rápido, local)

Na pasta `LandPage-Acesso`:

```bash
npm install
npx vercel login
npx vercel link
npx vercel env pull .env.vercel.preview
# Configure as variáveis no dashboard se faltar
npx vercel --prod=false
```

A CLI imprime a URL de preview. Para produção futura: `npx vercel --prod` (Sprint 10).

---

## Verificação pós-deploy

```bash
# Local (antes de subir)
npm run build:next
npm run check:types
```

No preview, testar manualmente:

- [ ] `/` home
- [ ] `/equipamentos`
- [ ] `/equipamentos/plataforma-elevatoria-hb-1430`
- [ ] `/categorias/equipamentos-aereos`
- [ ] `/faq`
- [ ] WhatsApp abre com mensagem contextual

---

## Problemas comuns

| Erro | Solução |
|------|---------|
| Build falha em `Env.ts` | Faltam `CLERK_*` ou `DATABASE_URL` no painel Vercel |
| `db:migrate` falha no build padrão | Trocar Build Command para `npm run build:next` |
| Página 404 em rotas | Confirmar `pt-BR` na URL: `/pt-BR` ou redirect do next-intl |
| Clerk em páginas sign-in | Normal no MVP; marketing não depende de login |

---

## Após aprovação do cliente

1. Registrar aprovação (e-mail/WhatsApp) — Sprint 8.4.
2. Sprint 9: fotos e ajustes de copy.
3. Sprint 10: domínio, `npm run build` completo, Neon produção, Search Console.

Ver [ROADMAP.temp.md](../ROADMAP.temp.md) §14.2 e §14.3.

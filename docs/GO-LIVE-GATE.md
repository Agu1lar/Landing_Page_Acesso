# Gate pré-domínio (Parte 3)

Checklist antes de apontar `acessoequipamentos.com.br` para a landing Next.js.

## CI e qualidade

| Item | Status | Referência |
|------|--------|------------|
| Lint + types + unit no PR | Obrigatório | [CI.md](./CI.md) |
| Build `main` (migrate + E2E) | Após push | `.github/workflows/CI.yml` |
| Orçamento E2E | ✅ | `tests/e2e/Marketing.conversion.e2e.ts` |
| API leads | ✅ | `tests/integration/Leads.api.integ.ts` |

## SEO e migração WordPress

| Item | Status | Referência |
|------|--------|------------|
| Mapa 301 versionado | ✅ | `src/data/legacy-redirects.json` |
| `/blog` → `/dicas` | ✅ | Atualizado 2026-05-21 |
| Posts WP → artigos `/dicas` | ✅ | 3 posts principais |
| Sitemap com `/dicas` | ✅ | `src/app/sitemap.ts` |
| Top URLs GSC | ⏳ | Exportar e completar JSON antes do DNS |

Validação:

```bash
npm run test -- src/lib/legacy-redirects.test.ts
npm run test:e2e -- tests/e2e/Legacy.redirects.e2e.ts
```

## UX (Sprint 7 — início)

| Item | Status |
|------|--------|
| 404 com categorias | ✅ |
| Skeleton catálogo | ✅ |
| Skip link a11y | ✅ |
| PageSpeed ≥ 85 mobile | ⏳ medir Lighthouse em produção |

## Conteúdo (Sprint 9)

| Item | Status |
|------|--------|
| `/dicas` (4 artigos) | ✅ |
| Long-tail fichas equipamento | ✅ |
| Logos clientes (carrossel) | ✅ |
| Fotos pendentes catálogo | ⏳ ver README |

## Go-live (Sprint 10)

- Domínio + DNS Vercel
- Clerk **Production** (`pk_live_` / `sk_live_`)
- `DATABASE_URL` Neon produção
- Google Search Console no domínio oficial
- Redirect site legado (se host antigo permanecer ativo)

Ver [ROADMAP.temp.md](../ROADMAP.temp.md) Sprint 10 e [MIGRACAO-SEO-WP.md](./MIGRACAO-SEO-WP.md).

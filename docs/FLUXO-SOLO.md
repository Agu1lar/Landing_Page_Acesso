# Fluxo solo (um desenvolvedor)

Guia mínimo para commitar sem PR, branch protection leve e Vercel só em **Production**.

## Git no dia a dia

```bash
git checkout main
git pull origin main
# ... editar arquivos ...
git add .
git commit -m "feat: descreva o que mudou em uma frase"
git push origin main
```

Mensagem de commit: `tipo: resumo em minúsculas` — exemplos: `feat:`, `fix:`, `chore:`, `docs:`.

**Não precisa abrir PR** se você é o único no repositório e a `main` aceita push direto.

## O que roda sozinho

| Quando | O quê |
|--------|--------|
| **Cada push** (PR ou `main`) | Build 24.x, lint, types, knip, i18n, testes unitários |
| **Só push na `main`** | Build com migrate, Storybook, E2E |
| **Vercel** | Deploy de **Production** (variáveis só lá) |
| **Ignorar** | Check Vercel no PR, Crowdin, Checkly |

## Branch protection (recomendado — 3 checks)

Em **Settings → Branches → `main`**, marque só:

1. `Build with 24.x`
2. `Run static checks`
3. `Run unit tests`

Opcional: exigir PR — para solo costuma ser mais simples **desligar** “Require pull request” e permitir push direto na `main`.

Não marque: `Build with 22.x`, `Build with db migrate`, `Run E2E tests`, `Run Storybook`, Vercel, Crowdin.

## Antes do push (opcional, ~1 min)

```bash
npm run lint
npm run check:types
npm run test
```

Só rode `npm run test:e2e` antes de mudanças grandes (formulário, 301, API leads).

## Hooks locais (lefthook)

Se `git commit` ficar lento ou falhar, desative temporariamente:

```bash
git commit -m "fix: algo" --no-verify
```

Ou desinstale hooks: `npx lefthook uninstall`

## Vercel

Variáveis **apenas em Production** — ver [DEPLOY-PREVIEW-VERCEL.md](./DEPLOY-PREVIEW-VERCEL.md#só-production-sem-preview-no-pr).

Preview de PR pode falhar no GitHub; isso não impede deploy em produção.

## Referência completa do CI

[CI.md](./CI.md)

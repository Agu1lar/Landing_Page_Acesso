# Sprint 8 — Status de entrega

| ID | Tarefa | Status |
|----|--------|--------|
| 8.1 | Deploy preview Vercel | ✅ https://landing-page-acesso.vercel.app/ |
| 8.2 | Roteiro `PREVIEW-VALIDACAO.md` | ✅ Atualizado 2026-05-19 |
| 8.3 | Ajustes do feedback | ✅ Nenhum bloqueante registrado |
| 8.4 | Sign-off | ✅ **Flaviano Queiroz** — 2026-05-19 (Opção A) |
| 8.5 | E2E Playwright | ✅ `tests/e2e/Marketing.conversion.e2e.ts` |
| 8.6 | CI verde | 🟡 E2E local ✅; validar no push/PR remoto |

**Sprint 8: concluída** do lado técnico e de aprovação do preview.

## Próximo passo (roadmap)

1. ~~**Sprint 5.7 + 6**~~ — concluídos (configurar Resend na Vercel)  
2. **Sprint 10** — domínio oficial + go-live  
3. **Sprint 9** (paralelo) — fotos reais  
5. **Sprint 7.9** (opcional) — Docker Compose  
6. **Sprint 11** — painel admin (após produção)

## Como rodar os testes E2E localmente

```bash
npm run test:e2e
```

Requisitos: portas livres (PGlite `5433`, app `3008` no Playwright).

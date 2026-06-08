# Migração SEO — WordPress → Next.js (301)

**Domínio legado:** `https://acessoequipamentos.com.br`  
**Destino:** landing Next.js (mesmo host no go-live)  
**Última atualização do mapa:** 2026-05-20

## Objetivo

Preservar URLs indexadas no Google (posts de blog, landing pages WP) com **redirect 301 permanente** para páginas equivalentes na nova estrutura — evitar 404 em massa no Search Console após o corte do DNS.

## Inventário (fonte)

| Fonte | URL |
|-------|-----|
| Sitemap índice | `https://acessoequipamentos.com.br/wp-sitemap.xml` (6 filhos) |
| Posts | `post-sitemap.xml` — 7 posts + hub `/blog` |
| Páginas | `page-sitemap.xml` — 16 páginas |
| Web Stories | `web-story-sitemap.xml` → prefixo `/web-stories` → `/dicas` |
| Categorias WP | `category-sitemap.xml` → prefixo `/category` → `/equipamentos` |
| Tags WP | `post_tag-sitemap.xml` → prefixo `/tag` → `/equipamentos` |
| Autores | `author-sitemap.xml` → prefixo `/author` → `/sobre` |

Complementar antes do go-live: **Google Search Console** (top URLs por cliques, últimos 90–365 dias) e adicionar entradas faltantes em `src/data/legacy-redirects.json`.

**Baseline 2026-06-08:** sitemap Yoast (46 URLs) com **100% cobertura** no JSON atual. Rode `node docs/scripts/audit-legacy-redirects.mjs` para validar e `node docs/scripts/import-gsc-urls.mjs seu-export.csv` após exportar o GSC.

**Google Ads (jun/2026):** export analisado — 4/4 URLs em `acessoequipamentos.com.br` cobertas (301 ou home). **Ação manual:** campanha Display aponta para `fornecedoresdaindustria.com.br` — atualizar URL final no Ads. Ver `src/data/google-ads-landing-urls.json` e `node docs/scripts/import-google-ads-urls.mjs`.

## Implementação no código

| Artefato | Função |
|----------|--------|
| `src/data/legacy-redirects.json` | Mapa versionado (`source` → `destination`) |
| `src/lib/legacy-redirects.ts` | Lookup + prefixos (`/category`, `/tag`, …) |
| `src/proxy.ts` | Responde **301** antes do roteamento i18n |

### Regras de destino (estratégia)

| Tipo WP | Destino na landing |
|---------|-------------------|
| Posts sobre plataformas / obras | `/categorias/equipamentos-aereos` ou artigo em `/dicas/[slug]` |
| Post NR-12 / segurança | `/dicas/nr-12-trabalho-em-altura-locacao` |
| Post tesoura (exemplo) | `/dicas/como-escolher-plataforma-elevatoria-bh` |
| Post andaimes fachada | `/dicas/andaime-ou-plataforma-elevatoria-reforma` |
| Índice `/blog/` | `/dicas` (Sprint 9.4) |
| Páginas de produto (compactador, gerador, …) | Categoria correspondente |
| Guindaste / manipulador (sem categoria dedicada) | `/equipamentos` |
| Políticas | `/privacidade` ou `/sobre` |
| Categoria/tag WP | `/equipamentos` |
| Autor WP | `/sobre` |
| Feed `/feed/` | `/` |

## Validação local

```bash
# Com o dev server rodando (porta padrão do projeto)
curl -I http://localhost:3000/blog/
curl -I http://localhost:3000/plataforma-elevatoria-tesoura-a-solucao-ideal-para-trabalhos-em-altura/
curl -I http://localhost:3000/category/plataformas/
```

Esperado: `HTTP/1.1 301` e header `Location:` com o destino correto.

Testes automatizados: `src/lib/legacy-redirects.test.ts`, `tests/e2e/Legacy.redirects.e2e.ts`.

## Checklist go-live

- [ ] Exportar top URLs do GSC e conferir cobertura no JSON (meta ≥ 95% das URLs com cliques)
- [ ] `curl -I` nas top 20 URLs orgânicas em produção
- [ ] Monitorar relatório **Páginas** / 404 no GSC por 4 semanas
- [ ] Atualizar sitemap novo (`src/app/sitemap.ts`)
- [ ] Quando existir `/blog` no Next (Sprint 22), revisar destinos que hoje apontam para `/faq` ou categorias

## Manutenção

1. Editar `src/data/legacy-redirects.json` (campo `note` documenta o motivo).
2. Rodar `bun run test` e `bun run test:e2e` (spec de redirects).
3. Registrar data da alteração em `generatedAt` no JSON.

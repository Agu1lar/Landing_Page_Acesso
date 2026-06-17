# GEO — descoberta por IAs (ChatGPT, Perplexity, Gemini, Copilot)

Recursos para que **crawlers e buscas generativas** encontrem, leiam e citem o site com clareza — antes e depois do domínio oficial.

---

## Endpoints públicos

| URL | Formato | Uso |
|-----|---------|-----|
| `/llms.txt` | Markdown/texto | Mapa para LLMs ([padrão llms.txt](https://llmstxt.org/)): resumo, categorias, contato, links |
| `/catalog.json` | JSON | Catálogo publicado: slug, nome, categoria, specs, URL absoluta |
| `/sitemap.xml` | XML | Todas as páginas indexáveis |
| `/robots.txt` | Texto | Permite crawlers gerais + bots de IA listados abaixo |

**Preview Vercel:** `/llms.txt` e `/catalog.json` retornam **404** quando `VERCEL_ENV=preview` (deploy temporário de branch/PR). Produção em `*.vercel.app` continua disponível.

**Cache:** `llms.txt` 1 h · `catalog.json` 5 min (alinhado ao catálogo).

---

## Robots — bots de IA permitidos

Explicitamente liberados em `src/app/robots.ts` (mesmas regras do site público):

- `GPTBot`, `OAI-SearchBot`, `ChatGPT-User` (OpenAI)
- `ClaudeBot`, `anthropic-ai` (Anthropic)
- `PerplexityBot`
- `Google-Extended` (Gemini / AI Overviews)

**Bloqueado:** `/dashboard`, `/sign-in`, `/api/*`.

---

## Verificação rápida

```bash
curl -s https://landing-page-acesso.vercel.app/llms.txt | head -20
curl -s https://landing-page-acesso.vercel.app/catalog.json | jq '.counts'
curl -s https://landing-page-acesso.vercel.app/api/health | jq '.aiDiscovery'
```

---

## Após apontar o domínio oficial

1. Atualizar `NEXT_PUBLIC_APP_URL` na Vercel (Production) → redeploy.
2. URLs em `llms.txt` e `catalog.json` passam a usar o domínio `.com.br` automaticamente.
3. Search Console + Bing Webmaster: enviar `/sitemap.xml`.
4. Testar citação manual: Perplexity / ChatGPT — *“locação plataforma elevatória Belo Horizonte”*.

---

## Código

| Arquivo | Função |
|---------|--------|
| `src/lib/ai-discovery.ts` | Gera conteúdo de `llms.txt` e payload JSON |
| `src/app/llms.txt/route.ts` | Rota HTTP |
| `src/app/catalog.json/route.ts` | Rota HTTP |
| `src/app/robots.ts` | Regras para crawlers de IA |
| `src/lib/ai-discovery.test.ts` | Testes unitários |

Alterações no catálogo (admin) revalidam `/catalog.json` e `/llms.txt`.

---

## Próximos passos (conteúdo, não código)

- Artigos em `/dicas` com títulos = perguntas que usuários fazem à IA.
- Páginas locais (“locação em Contagem”, “Betim”).
- Manter specs e descrições técnicas atualizadas (já favorecem citação).

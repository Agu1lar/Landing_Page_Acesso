# Passos manuais — go-live, CRM e operação

Tarefas que **não são código** e precisam ser feitas por você (ou pela equipe) no painel Vercel, Clerk, Neon, CRM e DNS.

---

## 1. Variáveis de ambiente na Vercel

**Onde:** Vercel → projeto `Landing_Page_Acesso` → **Settings** → **Environment Variables**

Configure em **Production** (e Preview, se quiser testar antes):

| Variável | Obrigatória | Exemplo / nota |
|----------|-------------|----------------|
| `DATABASE_URL` | Sim | Connection string do **Neon** (com `?sslmode=require`) |
| `CLERK_SECRET_KEY` | Sim | `sk_live_...` no domínio oficial |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Sim | `pk_live_...` no domínio oficial |
| `NEXT_PUBLIC_APP_URL` | Sim | `https://acessoequipamentos.com.br` |
| `WHATSAPPOS_API_URL` | CRM | URL HTTPS da API do whatsappOS |
| `WHATSAPPOS_WIDGET_KEY` | CRM | ex.: `acesso-orcamento-site` |
| `RESEND_API_KEY` | E-mail leads | `re_...` |
| `RESEND_FROM_EMAIL` | E-mail leads | Após verificar domínio no Resend |
| `LEADS_NOTIFY_EMAIL` | E-mail leads | ex.: `comercial@acessoequipamentos.com.br` |
| `ARCJET_KEY` | Recomendado | Rate limit do formulário |
| `NEXT_PUBLIC_POSTHOG_KEY` | Opcional | Analytics após cookie consent |

**Depois de salvar:** Deployments → último deploy → **⋯** → **Redeploy** (para aplicar as env vars).

**Erro comum:** `Please provide required params for Postgres driver: url: ''` → falta `DATABASE_URL` no ambiente de **Build** da Vercel.

---

## 2. Domínio oficial (`acessoequipamentos.com.br`)

### 2.1 Adicionar domínio na Vercel

1. Vercel → **Settings** → **Domains**
2. Add → `acessoequipamentos.com.br` e `www.acessoequipamentos.com.br`
3. Anote os registros DNS que a Vercel pedir (geralmente `A` ou `CNAME`)

### 2.2 Configurar DNS no registrador

1. Acesse o painel onde o domínio está registrado
2. Crie/edite os registros conforme a Vercel indicou
3. Aguarde propagação (minutos a 48 h)
4. Na Vercel, confirme status **Valid**

### 2.3 Redirecionar www → raiz (ou o contrário)

Na Vercel, defina qual é o **primary domain** e ative redirect do alternativo.

### 2.4 Atualizar `NEXT_PUBLIC_APP_URL`

Troque de `landing-page-acesso.vercel.app` para `https://acessoequipamentos.com.br` em **Production** e redeploy.

---

## 3. Clerk (painel admin em produção)

1. [Clerk Dashboard](https://dashboard.clerk.com) → crie/use instância **Production**
2. Gere `pk_live_` e `sk_live_`
3. Em **Domains**, adicione `acessoequipamentos.com.br`
4. Cole as chaves na Vercel (passo 1)
5. Convide usuários admin/comercial (sign-up público continua desativado)
6. Em cada usuário → **Public metadata**: `{ "role": "admin" }` ou `"comercial"`

Guia completo: [CLERK-ACESSO-ADMIN.md](./CLERK-ACESSO-ADMIN.md)

---

## 4. CRM whatsappOS

### 4.1 No painel do CRM

1. Crie o widget **`acesso-orcamento-site`**
2. Número WhatsApp da Acesso Equipamentos
3. Domínios permitidos:
   - `landing-page-acesso.vercel.app`
   - `acessoequipamentos.com.br` (quando estiver no ar)
4. Anote a **URL pública HTTPS** da API

### 4.2 Na Vercel

- `WHATSAPPOS_API_URL` = base da API (sem barra no final)
- `WHATSAPPOS_WIDGET_KEY` = `acesso-orcamento-site`

### 4.3 Teste ponta a ponta

1. Abra `/orcamento` em produção
2. Envie orçamento de teste
3. Confirme:
   - Lead no dashboard `/dashboard/leads` (Neon)
   - Lead no CRM em **Atendimentos**
   - WhatsApp abre com texto completo do orçamento

A captura roda **no servidor** (`POST /api/leads`) — não depende de script no navegador.

---

## 5. E-mail de leads (Resend)

1. Crie conta em [resend.com](https://resend.com)
2. Verifique o domínio `acessoequipamentos.com.br` (DNS TXT/CNAME)
3. Configure na Vercel: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL`
4. Envie um orçamento teste e confira a caixa do comercial

---

## 6. Google Search Console (SEO pós-migração)

1. Acesse [Google Search Console](https://search.google.com/search-console)
2. Adicione propriedade `https://acessoequipamentos.com.br`
3. Valide via DNS ou arquivo HTML
4. Envie o sitemap: `https://acessoequipamentos.com.br/sitemap.xml`
5. Exporte **top URLs por cliques** (últimos 90 dias)
6. Compare com `src/data/legacy-redirects.json` — URLs faltando entram no JSON
7. Por 4 semanas, monitore **Páginas** → erros 404

Detalhes: [MIGRACAO-SEO-WP.md](./MIGRACAO-SEO-WP.md)

---

## 7. Logos de clientes na Home (manual)

A seção **só aparece** quando existem arquivos em `public/clientes/`.

1. Obtenha **autorização por escrito** de cada marca
2. Exporte logos com **fundo transparente** (PNG ou WebP)
3. Coloque nas pastas:

| Pasta | Setor |
|-------|--------|
| `public/clientes/construcao/` | Construção civil |
| `public/clientes/industria/` | Indústria |
| `public/clientes/mineracao/` | Mineração |
| `public/clientes/varejo/` | Varejo / corporativo |
| `public/clientes/logistica/` | Logística |
| `public/clientes/infraestrutura/` | Infraestrutura |

4. Commit + push das imagens
5. A Home passa a exibir o carrossel automaticamente

Guia: [CLIENT-LOGOS.md](./CLIENT-LOGOS.md)

---

## 8. Site WordPress antigo (se ainda estiver no ar)

Quando o DNS apontar para a Vercel:

- Desative o WordPress no host antigo **ou** configure redirect 301 de todo o host antigo para o domínio novo
- Evite dois sites iguais indexados (conteúdo duplicado)

---

## 9. Checklist rápido antes de anunciar o site novo

- [ ] `DATABASE_URL` na Vercel Production (preferir connection string **pooler** do Neon — hostname com `-pooler`)
- [ ] Clerk `pk_live_` / `sk_live_` em Production (Preview pode manter `pk_test_`)
- [ ] Domínio oficial validado na Vercel
- [ ] `NEXT_PUBLIC_APP_URL` com domínio oficial
- [ ] CRM whatsappOS testado (Neon + Inbox)
- [ ] Resend entregando e-mail interno
- [ ] Orçamento E2E passando no CI
- [ ] Top 20 URLs do GSC retornam 301 ou 200
- [ ] Logos (se aplicável) com autorização jurídica
- [ ] `GET /api/health` retorna `"ok": true` e `"clerk": { "mode": "live" }` em Production

Referência técnica: [GO-LIVE-GATE.md](./GO-LIVE-GATE.md)

---

## 10. Reunião de go-live (domínio amanhã)

Ordem sugerida — **não inverta Clerk e DNS**:

1. **Antes do DNS:** Clerk Dashboard → **Production** → copiar `pk_live_` / `sk_live_` → Vercel **Production** → redeploy.
2. **Clerk Production → Domains:** adicionar `acessoequipamentos.com.br`.
3. **Clerk Production → Users:** convidar equipe com `{ "role": "admin" }` ou `"comercial"`.
4. **Neon:** usar `DATABASE_URL` do branch **Production** com **pooler** (`-pooler` no host).
5. **Apontar DNS** para a Vercel (A/CNAME conforme painel).
6. **Imediatamente após propagar:** validar redirects WordPress:
   ```bash
   curl -I https://acessoequipamentos.com.br/blog/
   curl -I https://acessoequipamentos.com.br/plataforma-elevatoria-tesoura-a-solucao-ideal-para-trabalhos-em-altura/
   ```
   Esperado: `HTTP/2 301` com `Location` correto.
7. **Health check:** `curl https://acessoequipamentos.com.br/api/health` — `"ok": true`, `"clerk.productionMismatch": false`.
8. **Teste comercial:** `/sign-in` → `/dashboard/leads` + orçamento com plataforma (WhatsApp deve listar altura e carga).

Se algo falhar no passo 6, **prioridade máxima** — Google Ads reprova destino quebrado.

---

## 11. Monitoramento Neon + Resend (pós-go-live)

O código já limita pool Postgres (`max: 5` por instância) e rate limit de leads (8 req / 15 min por IP via Arcjet). E-mail Resend em 429 não bloqueia o lead no Neon.

### Neon (Postgres)

| O quê | Onde | Ação |
|-------|------|------|
| Conexões ativas | [Neon Console](https://console.neon.tech) → projeto → **Monitoring** | Alerta se > 80% do plano |
| Compute | Neon → **Usage** | Upgrade se CPU/memória estourar em pico |
| Connection string | Vercel `DATABASE_URL` | Usar URL **pooler** (`…-pooler…neon.tech`) |

### Resend (e-mail interno de leads)

| O quê | Onde | Ação |
|-------|------|------|
| Envios/dia | [Resend Dashboard](https://resend.com/emails) | Plano free: 100/dia — suficiente para ~1k cliques/mês se só 1 e-mail/lead |
| Rate limit 429 | Logs Vercel / Sentry | Lead continua salvo; reenvio manual pelo dashboard `/dashboard/leads` |
| Domínio verificado | Resend → **Domains** | Obrigatório para `RESEND_FROM_EMAIL` no domínio oficial |

### Arcjet (formulário)

- Configure `ARCJET_KEY` na Vercel Production.
- Em pico de tráfego pago, bots podem consumir cota — monitore 429 no `/api/leads`.

### Rotina semanal (5 min)

1. Neon → Usage (conexões + compute).
2. Resend → Emails (volume e bounces).
3. GSC → Páginas com 404 (URLs WP faltando no JSON).
4. `GET /api/health` em produção.


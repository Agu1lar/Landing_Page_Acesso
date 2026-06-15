# Google Analytics 4 + Google Ads — configuração pós-deploy

O site envia **conversões para o GA4** quando o visitante aceita cookies de analytics. Use o GA4 para alimentar o **Google Ads** (o problema de “0 conversões” no site antigo era ausência de tag no clique WhatsApp/orçamento).

## O que o código faz

| Evento GA4 | Quando dispara | Uso no Ads |
|------------|----------------|------------|
| `whatsapp_click` | Clique em qualquer botão WhatsApp rastreado | Conversão primária (contato) |
| `phone_click` | Clique em `tel:` (barra mobile, orçamento) | Conversão secundária |
| `generate_lead` | Orçamento enviado com sucesso (formulário) | Conversão primária (lead) |

Além disso:

- **`gclid` / `gbraid` / `wbraid`** da URL são guardados no lead (Neon) e nos eventos internos — para cruzar com campanhas.
- **Consent Mode v2**: GA4 só grava após “Aceitar analytics” (mesmo banner do PostHog).
- Tag automática do Google Ads (`gclid` na URL) deve permanecer **ativada** na conta.

---

## Passo 1 — Criar propriedade GA4 (manual)

1. Acesse [Google Analytics](https://analytics.google.com/)
2. **Admin** → **Criar propriedade** → nome: `Acesso Equipamentos — Site`
3. Fluxo de dados: **Web** → URL: `https://acessoequipamentos.com.br`
4. Copie o **ID de medição** (formato `G-XXXXXXXXXX`)

---

## Passo 2 — Variável na Vercel (manual)

Em **Production** (e Preview se quiser testar):

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Redeploy após salvar.

Opcional: manter PostHog em paralelo (`NEXT_PUBLIC_POSTHOG_KEY`) — são complementares.

---

## Passo 3 — Marcar eventos como conversões no GA4 (manual)

1. GA4 → **Admin** → **Eventos**
2. Aguarde 24–48h após tráfego real **ou** use **DebugView** (extensão [Tag Assistant](https://tagassistant.google.com/))
3. Registre como conversões (toggle **Marcar como conversão**):
   - `whatsapp_click` — **recomendado como principal** (espelha o que o comercial vê)
   - `generate_lead` — orçamento completo
   - `phone_click` — opcional

---

## Passo 4 — Vincular GA4 ao Google Ads (manual)

1. [Google Ads](https://ads.google.com/) → **Ferramentas** → **Gerenciador de dados** → **Vinculações de produtos**
2. **Google Analytics (GA4)** → vincular a propriedade criada
3. **Ferramentas** → **Conversões** → **Nova ação de conversão** → **Importar** → **Google Analytics 4**
4. Importe `whatsapp_click` e/ou `generate_lead`
5. Defina **whatsapp_click** como conversão **primária** para campanhas de Pesquisa (se o objetivo for contato)

---

## Passo 5 — Conferir tag automática no Ads (manual)

1. Google Ads → **Configurações da conta** → **Configurações da conta**
2. **Tag automática** = **Ativada**
3. URLs finais devem ser do domínio `acessoequipamentos.com.br` (corrigir campanha Display que aponta para `fornecedoresdaindustria.com.br` — ver `src/data/google-ads-landing-urls.json`)

---

## Passo 6 — Testar antes de confiar nos números

### Teste rápido (produção ou preview com GA_ID)

1. Abra o site com:  
   `?utm_source=google&utm_medium=cpc&utm_campaign=teste&gclid=test_gclid_123`
2. Aceite cookies de analytics
3. Clique em **WhatsApp** ou envie um orçamento teste
4. GA4 → **Relatórios** → **Tempo real** ou **DebugView** — deve aparecer `whatsapp_click` ou `generate_lead`

### Conferir gclid no lead

1. Painel `/dashboard/leads` → abrir o lead de teste
2. Na seção de campanha deve constar `gclid` (se veio da URL)

---

## Passo 7 — Política de privacidade (manual)

Atualize `/privacidade` se necessário: medição com **Google Analytics / Google Ads** após consentimento, dados nos EUA (Google), finalidade de medição de campanhas.

O banner de cookies já bloqueia GA até o aceite (Consent Mode).

---

## Por que o site antigo mostrava 0 conversões

O Google Ads só conta conversão se:

1. Existe **tag ou evento** no site (agora: GA4), **e**
2. O usuário **aceita** cookies de medição (ou usa modelagem do Google), **e**
3. A ação está **importada/vinculada** no Google Ads

Clicar no WhatsApp sem disparar evento = **0 conversões** no painel, mesmo com dezenas de cliques reais.

---

## Referências no repositório

- `src/lib/google-analytics.ts` — Consent Mode + eventos
- `src/lib/attribution.ts` — `gclid` first-touch
- `src/lib/track-whatsapp-click.ts` — Neon + PostHog + GA4
- `migrations/0010_google_click_ids.sql` — colunas no banco

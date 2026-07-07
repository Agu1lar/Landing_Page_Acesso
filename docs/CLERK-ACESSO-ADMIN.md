# Acesso ao painel (Clerk)

O painel (`/dashboard`, `/dashboard/leads`) **não aceita cadastro público**. Apenas usuários com papel no Clerk entram.

## 1. Desativar cadastro aberto no Clerk (recomendado)

No [Clerk Dashboard](https://dashboard.clerk.com) → seu aplicativo:

1. **User & authentication** → **Restrictions**
2. **Sign-up mode:** **Restricted** (somente convite / criação manual)

Isso impede novas contas mesmo fora do site.

## 2. Criar usuário da equipe

1. **Users** → **Create user**
2. Informe o e-mail do comercial/gestão
3. Em **Public metadata** (JSON), defina o papel:

```json
{
  "role": "admin"
}
```

ou

```json
{
  "role": "comercial"
}
```

| Papel | Acesso |
|-------|--------|
| `admin` | Painel, leads, export CSV |
| `comercial` | Painel, leads, export CSV |

## 3. Sua conta (primeiro acesso)

Se você já tinha conta **sem** `role`, após o deploy verá `/unauthorized`. Edite seu usuário no Clerk e adicione `"role": "admin"` em **Public metadata**.

## 4. URLs

- Login: `/sign-in`
- Leads: `/dashboard/leads`
- Cadastro público: `/sign-up` → redireciona para `/sign-in`

## 5. Ambientes Clerk (Development vs Production)

| Ambiente Clerk | Chaves | Uso atual |
|----------------|--------|-----------|
| **Development** | `pk_test_` / `sk_test_` | Preview Vercel (`landing-page-acesso.vercel.app`) e testes locais |
| **Production** | `pk_live_` / `sk_live_` | Obrigatório no domínio oficial |

Papéis (`publicMetadata.role`) vivem no Clerk **por ambiente**. Usuário criado só em Development não entra automaticamente em Production.

## 6. Go-live — domínio oficial (`acessoequipamentos.com.br`)

> **Lembrete:** ao apontar o domínio oficial, troque o Clerk para **Production**. Se a Vercel Production continuar com `pk_test_`, o login do painel pode **parar de funcionar** ou exibir **avisos de ambiente de teste** para os administradores.

Checklist:

1. Clerk Dashboard → seletor **Production** (não Development).
2. **API Keys** → copiar `pk_live_…` e `sk_live_…`.
3. Vercel → projeto → **Settings** → **Environment Variables** → escopo **Production**:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_…`
   - `CLERK_SECRET_KEY` = `sk_live_…`
4. Clerk Production → **Domains** → incluir `acessoequipamentos.com.br` (e `www` se aplicável).
5. **Users** (ambiente Production) → criar/convidar equipe e `publicMetadata`: `{ "role": "admin" }` ou `"comercial"`.
6. Redeploy Production na Vercel e testar `/sign-in` + `/dashboard/leads` no domínio oficial.

Preview na Vercel pode manter chaves `pk_test_` no escopo **Preview**, separado de Production.

## 7. Variáveis na Vercel (resumo)

- **Production (domínio oficial):** chaves **live**.
- **Preview:** pode usar chaves **test** (Development).
- **Local (`.env.local`):** em geral `pk_test_` alinhado ao Development do Clerk.

## 8. Login com Google (SSO) no painel — Production

No Clerk **Production**, o Google **exige credenciais próprias** (não usa as credenciais compartilhadas do Development).

### Clerk

1. **User & authentication** → **SSO connections** → **Google**
2. **Enabled**
3. **Use custom credentials** → cole **Client ID** e **Client Secret** do Google Cloud
4. **Enable for sign-up and sign-in** — ligado
5. Copie o **Authorized Redirect URI** que o Clerk mostra (ex.: `https://clerk.acessoequipamentos.com.br/v1/oauth_callback`)

### Google Cloud Console

1. **APIs e serviços** → **Credenciais** → OAuth **Aplicativo da Web**
2. **Origens JavaScript autorizadas** — só domínio, **sem caminho**:
   - `https://acessoequipamentos.com.br`
   - `https://www.acessoequipamentos.com.br`
   - `https://clerk.acessoequipamentos.com.br`
3. **URIs de redirecionamento autorizados** — **aqui** vai a URL completa do Clerk:
   - `https://clerk.acessoequipamentos.com.br/v1/oauth_callback`
4. Salvar

> **Erro comum:** colocar `/v1/oauth_callback` em *Origens JavaScript* → Google rejeita e o login quebra (400 / tela branca).

### Separado do One Tap (leads no site)

| Uso | Onde configura |
|-----|----------------|
| Login `/sign-in` | Clerk SSO + redirect URI acima |
| Leads “Google (cookies)” | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` na Vercel — ver `docs/GOOGLE-ONE-TAP.md` |

Pode ser o **mesmo** OAuth Client ID no Google Cloud, desde que tenha **origens** e **redirect** corretos nos dois campos.

### Carregamento infinito após “Continuar com Google”

1. **Mesmo e-mail no Clerk** — em Production → **Users**, o usuário deve existir **antes** do login Google, com o **mesmo e-mail** da conta Google.
2. **Papel no metadata** — nesse usuário: `{ "role": "admin" }` ou `"comercial"`.
3. **Lista de acesso** — se há e-mails em `/dashboard/acesso`, o seu e-mail Google precisa estar na lista (ou ser `admin` no Clerk).
4. **Cadastro via Google** — com **Restrictions → Restricted**, desligue **Enable for sign-up and sign-in** no Google e use só contas já criadas no Clerk; ou crie o usuário manualmente antes.
5. **Client ID completo** — no Clerk, confira se termina em `.apps.googleusercontent.com` (sem corte ao colar).
6. Após login, se não tiver permissão, deve ir para `/unauthorized` (não ficar girando).

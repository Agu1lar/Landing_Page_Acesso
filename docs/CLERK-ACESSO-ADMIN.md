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

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

## 5. Produção (Vercel)

Use as mesmas chaves Clerk (`CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`) no projeto Vercel. Papéis vivem no Clerk, não no código.

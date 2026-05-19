# Acesso Equipamentos — Site institucional e captação de orçamentos

Site da **Acesso Equipamentos** (locação de equipamentos para construção e plataformas aéreas). O visitante consulta o catálogo, entende os serviços e solicita orçamento pelo formulário ou WhatsApp. Os pedidos são salvos no banco e o comercial pode receber aviso por e-mail.

**Preview atual (validação):** [https://landing-page-acesso.vercel.app/](https://landing-page-acesso.vercel.app/)

**Planejamento técnico detalhado:** [ROADMAP.temp.md](ROADMAP.temp.md) (mantido para a equipe de desenvolvimento)

---

## O que o site já oferece hoje

### Páginas públicas

| Página | Endereço (exemplo) | O que o visitante encontra |
|--------|-------------------|----------------------------|
| Início | `/` | Apresentação da empresa, categorias, depoimentos, como funciona |
| Equipamentos | `/equipamentos` | Lista com **110 itens** do inventário |
| Detalhe do equipamento | `/equipamentos/[nome]` | Ficha técnica, especificações (plataformas aéreas), equipamentos relacionados |
| Categorias | `/categorias/[categoria]` | Páginas por tipo (betoneiras, compactadores, plataformas, etc.) |
| Solicitar orçamento | `/orcamento` | Formulário completo (cidade, período, equipamento de interesse) |
| Treinamento NR | `/treinamento-plataformas-aereas` | Informações sobre treinamento em plataformas aéreas |
| Sobre | `/sobre` | História, região atendida (RMBH), credenciais |
| Contato | `/contato` | Telefone, WhatsApp, horário comercial |
| FAQ | `/faq` | Perguntas frequentes |
| Privacidade | `/privacidade` | Política de dados (LGPD) |

### Funcionalidades de conversão

- **Carrinho de orçamento** — adicione vários equipamentos (e depois acessórios) e envie um único formulário; valores informados só pelo comercial após o contato.
- **Formulário de orçamento** — dados salvos no banco (PostgreSQL na nuvem).
- **E-mail ao comercial** — quando configurado no servidor (Resend); o lead continua salvo mesmo se o e-mail falhar.
- **WhatsApp** — botão no site com mensagem contextual (página, equipamento, origem).
- **Busca** — barra no topo e atalho **Ctrl+K** no computador.
- **Mobile** — layout pensado para quem acessa da obra pelo celular.

### SEO e confiança

- Títulos e descrições por página e por equipamento.
- Dados estruturados para buscadores (empresa e produtos).
- Imagens de compartilhamento (redes sociais).
- Mapa do site e regras para robôs de busca.
- Preview no Vercel **não é indexado** como site final (evita duplicar conteúdo antes do domínio oficial).

### Validação do preview

- Roteiro de testes: [docs/PREVIEW-VALIDACAO.md](docs/PREVIEW-VALIDACAO.md)

### Fotos da frota (Sprint 9)

- Guia rápido: [docs/SPRINT-9-FOTOS.md](docs/SPRINT-9-FOTOS.md) — coloque `public/equipamentos/{slug}.webp` ou use o script `sync-equipment-photos.py`

---

## Como rodar o projeto no seu computador

### O que você precisa

- **Node.js 22** ou superior
- Conta **Clerk** (login — usada pelo boilerplate; o site público não exige login do visitante)
- Banco **PostgreSQL** local (automático ao rodar `dev`) ou URL do **Neon** para apontar à nuvem

### Passo a passo

1. **Clonar o repositório** e entrar na pasta do projeto.

2. **Copiar variáveis de ambiente:**
   ```text
   Copie .env.example para .env.local e preencha os valores.
   ```
   O arquivo `.env.example` lista tudo com comentários. O mínimo para subir localmente:
   - `CLERK_SECRET_KEY` e `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `DATABASE_URL` (local: o exemplo com porta 5433; nuvem: Neon com `sslmode=require`)

3. **Instalar dependências:**
   ```shell
   npm install
   ```

4. **Subir o site em modo desenvolvimento:**
   ```shell
   npm run dev
   ```

5. Abrir no navegador: **http://localhost:3000**

Na primeira execução, o projeto sobe um banco PostgreSQL local e aplica as migrações sozinho. Não é necessário Docker para o dia a dia (há plano opcional de Docker no roadmap).

### E-mail de leads (opcional no local)

Para testar notificações por e-mail, configure no `.env.local`:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (em teste: `Acesso Equipamentos <onboarding@resend.dev>`)
- `LEADS_NOTIFY_EMAIL` — com domínio de teste do Resend, use o **mesmo e-mail da conta Resend**; depois de verificar `acessoequipamentos.com.br`, use o e-mail comercial.

### Comandos úteis (desenvolvimento)

| Comando | Para quê |
|---------|----------|
| `npm run dev` | Site local com atualização automática |
| `npm run build-local` | Simular build de produção no PC |
| `npm run lint` | Verificar qualidade do código |
| `npm run check:types` | Verificar tipos TypeScript |
| `npm run test` | Testes automatizados unitários |
| `npm run test:e2e` | Testes do fluxo no navegador (Playwright) |

---

## Publicação (Vercel)

O site está hospedado na **Vercel**. Cada push na branch `main` gera um novo deploy do preview.

**Variáveis obrigatórias no Vercel** (ambientes **Production** e **Preview**):

- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `DATABASE_URL` (Neon)

**Recomendadas:**

- `NEXT_PUBLIC_APP_URL` — URL do preview ou domínio oficial
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL` — aviso de novos orçamentos
- `NEXT_PUBLIC_SENTRY_DISABLED=true` — desliga monitoramento de erros no preview, se não estiver em uso

Guia de deploy: [docs/DEPLOY-PREVIEW-VERCEL.md](docs/DEPLOY-PREVIEW-VERCEL.md) (se existir no repositório)

---

## Próximas entregas (roadmap resumido)

Detalhes, datas e tarefas técnicas estão em [ROADMAP.temp.md](ROADMAP.temp.md). Visão para negócio e stakeholders:

### Em breve — conteúdo e go-live

| Entrega | Descrição |
|---------|-----------|
| **Fotos reais da frota** | Substituir placeholders pelas fotos dos equipamentos |
| **Cases e logos de clientes** | Prova social em home e sobre |
| **Domínio oficial** | Apontar `acessoequipamentos.com.br` para o site novo (SSL, redirects) |
| **Analytics em produção** | PostHog / Google Analytics para campanhas e origem do tráfego |

### Melhorias de experiência (em andamento)

- Ajustes finos de layout no celular e no header.
- Banner de cookies, se analytics for ativado.
- Pequenos refinamentos de acessibilidade e performance.

### Fase 2 — Painel administrativo

Área logada para a equipe Acesso, sem depender de desenvolvedor para tudo:

| Módulo | O que permite |
|--------|----------------|
| **Leads** | Ver pedidos de orçamento, exportar planilha (CSV) |
| **Equipamentos** | Cadastrar, editar e publicar fotos no catálogo |
| **Analytics** | Visitas, cliques no WhatsApp, origem das campanhas |
| **Configurações** | Ajustes gerais (perfil administrador) |

Papéis previstos: **admin** (tudo) e **comercial** (leads e relatórios, sem alterar catálogo).

### Futuro (após o site estável)

- Disponibilidade de equipamentos em tempo real e reservas online.
- Integração com ERP (ex.: Omie).
- Portal do cliente com histórico de locações.
- Blog ou dicas para SEO.
- Ambiente **Docker** opcional para quem preferir subir banco e app em containers no PC.

---

## Documentação no repositório

| Arquivo / pasta | Conteúdo |
|-----------------|----------|
| [ROADMAP.temp.md](ROADMAP.temp.md) | Roadmap completo por sprint |
| [docs/PREVIEW-VALIDACAO.md](docs/PREVIEW-VALIDACAO.md) | Checklist de validação do preview |
| [docs/SPRINT-8-STATUS.md](docs/SPRINT-8-STATUS.md) | Status do preview (Sprint 8) |
| [docs/inventario-equipamentos.csv](docs/inventario-equipamentos.csv) | Inventário de 110 equipamentos |
| [.env.example](.env.example) | Modelo de variáveis de ambiente |

---

## Base técnica (referência)

O projeto foi iniciado a partir do **Next.js Boilerplate** (React, TypeScript, Tailwind). Serviços em uso ou previstos: **Vercel** (hospedagem), **Neon** (banco), **Clerk** (autenticação futura do admin), **Resend** (e-mail), **Arcjet** (proteção contra abuso no formulário).

---

## Licença

Código sob [MIT License](LICENSE). Conteúdo institucional e marca pertencem à Acesso Equipamentos.

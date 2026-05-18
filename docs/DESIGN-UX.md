# Design & UX — Nova experiência Acesso Equipamentos

| Versão | 1.0 |
|--------|-----|
| Data | 2026-05-18 |
| Princípio | **Reformulação profissional** — não é cópia do site WordPress legado |

---

## 1. Objetivos de UX

1. **Credibilidade B2B** — visual industrial moderno, limpo, hierarquia clara.
2. **Encontrar equipamento em segundos** — busca global sempre acessível.
3. **Conversão** — WhatsApp e orçamento visíveis sem poluir.
4. **Mobile first** — obras acessam pelo celular.
5. **Não quebrar o que funciona** — catálogo, leads, i18n, SEO, 110 itens do inventário.

---

## 2. O que muda vs site legado

| Legado | Novo site |
|--------|-------------|
| Layout denso, banners empilhados | Seções com respiro, grid consistente |
| Menu simples sem busca | **Busca global** no header + atalho teclado |
| Vermelho em excesso | Vermelho marca como **acento**; base neutra slate |
| Tipografia genérica Elementor | Plus Jakarta Sans + Inter |
| Múltiplos CTAs competindo | Hierarquia: WhatsApp flutuante + orçamento no header |

---

## 3. Arquitetura de informação

```
Header [Logo | Nav | Busca global | CTA Orçamento]
│
├── Home
├── Equipamentos (catálogo + filtros + busca na página)
│   └── /equipamentos/[slug]
├── Categorias /categorias/[slug]  (fase 1.1)
├── Sobre
├── Contato
└── Orçamento
```

---

## 4. Busca global

### Comportamento

- Campo no **header** (desktop: expandido; mobile: ícone → painel).
- Atalhos: `/` ou `Ctrl+K` / `Cmd+K` focam a busca.
- Busca em: nome, slug, tags, categoria (110 itens — índice em memória no cliente).
- Resultados em dropdown (máx. 8) + link “Ver todos os resultados”.
- Enter ou “Ver todos” → `/equipamentos?q={termo}`.
- Sem backend de busca no MVP (performance ok para 110 itens).

### Estados

| Estado | UI |
|--------|-----|
| Vazio | Placeholder: “Buscar equipamentos…” |
| Digitando | Lista filtrada ao vivo |
| Sem resultados | “Nenhum equipamento encontrado” + sugestão de categorias |
| Selecionado | Navega para `/equipamentos/[slug]` |

---

## 5. Componentes de layout

| Componente | Responsabilidade |
|------------|------------------|
| `SiteHeader` | Logo, nav, `GlobalSearch`, CTA orçamento, menu mobile |
| `SiteFooter` | Contatos, endereço, horário, links legais |
| `WhatsAppButton` | Fixo mobile/desktop, mensagem pré-preenchida |
| `MarketingShell` | Header + main + footer + WhatsApp |

---

## 6. Páginas-chave (MVP visual)

### Home

1. Hero — proposta de valor + 2 CTAs (Orçamento, WhatsApp).
2. Busca em destaque (réplica da global, maior).
3. Categorias — grid 7 cards.
4. Destaques — 6 equipamentos (`destaque_home`).
5. Confiança — desde 2013, NR, entrega.
6. CTA final.

### Catálogo `/equipamentos`

- Barra: busca + filtro categoria (tabs ou select).
- Grid responsivo de cards.
- Query `?q=` sincronizada com busca global.

### Detalhe `/equipamentos/[slug]`

- Galeria placeholder, nome, **tabela de specs** (4 linhas máx. em aéreos).
- “Valores sob consulta”.
- CTAs: WhatsApp com equipamento + link orçamento.

---

## 7. Design tokens (resumo)

Ver [BRAND-GUIDE.md](./BRAND-GUIDE.md) v2 — paleta refinada:

- Fundo: `neutral-50` (#F8FAFC slate-50)
- Superfície: branco com borda `neutral-200`
- Texto: `neutral-900` / `neutral-600`
- Marca: `primary` #C41E24 (vermelho mais sóbrio)
- Header: branco com sombra sutil (não barra vermelha inteira)

---

## 8. Acessibilidade e performance

- Contraste AA em textos e botões.
- `aria-label` na busca e WhatsApp.
- Imagens `next/image` lazy below fold.
- Catálogo SSG por slug.

---

## 9. Fora desta entrega (próximas iterações)

- Filtros avançados (altura, tipo plataforma).
- Comparador de equipamentos.
- CMS para editar catálogo.
- Remoção completa Clerk do bundle.

---

_Aprovado para implementação Sprint 1 — reformulação UX/UI._

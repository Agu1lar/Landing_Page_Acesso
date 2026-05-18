# Brand Guide — Acesso Equipamentos

| Campo | Valor |
|-------|-------|
| **Versão** | 1.0 |
| **Data** | 2026-05-18 |
| **Versão** | 2.0 |
| **Empresa** | Acesso Equipamentos LTDA |
| **Status** | v2 — identidade para **novo site** (ver [DESIGN-UX.md](./DESIGN-UX.md)) |
| **Referências** | [REQUISITOS.md](./REQUISITOS.md) · [DESIGN-UX.md](./DESIGN-UX.md) |

---

## 1. Tom de voz

**Perfil:** formal, B2B, técnico quando necessário, foco em segurança e confiança.

### Fazer

- Frases diretas e objetivas.
- Vocabulário do setor quando fizer sentido: *plataforma tesoura*, *lança articulada*, *NR-12*, *andaime multidirecional*.
- Destacar entrega na obra, frota revisada e conformidade.
- CTAs claros: **Solicitar orçamento**, **Falar no WhatsApp**, **Tenho interesse neste equipamento**.
- Preços sempre **sob consulta** (sem valores no site).

### Evitar

- Gírias e tom excessivamente casual.
- Muitas exclamações ou superlativos vazios (“o melhor do Brasil”).
- Promessas sem evidência (cases, certificações, tempo de mercado).
- Confundir **fundada em 2013** com “20 anos de empresa”.

### Mensagem institucional (aprovada em requisitos)

> Fundada em 2013, a Acesso Equipamentos conta com uma equipe que soma mais de 20 anos de experiência em locação de equipamentos para construção civil e obras na região metropolitana de Belo Horizonte.

| Afirmação | Uso correto |
|-----------|-------------|
| Empresa (LTDA) | “Desde 2013” / “Mais de uma década” |
| Sócios / equipe | “Mais de 20 anos de experiência no setor” |

### Microcopy padrão

| Contexto | Texto |
|----------|--------|
| CTA primário | Solicitar orçamento |
| CTA secundário | Falar no WhatsApp |
| Preço no catálogo | Valores sob consulta |
| WhatsApp (pré-preenchido) | Olá! Tenho interesse na locação de {equipamento} para obra em {cidade}. Poderiam enviar um orçamento? |
| Rodapé — experiência | Equipe com mais de 20 anos de experiência · Empresa desde 2013 |
| Formulário — sucesso | Recebemos sua solicitação. Em breve nossa equipe entrará em contato. |
| Formulário — erro | Não foi possível enviar. Tente novamente ou fale conosco pelo WhatsApp. |

---

## 2. Paleta de cores

**Direção v2:** manter **vermelho da marca** como acento; base **neutra slate** para aspecto corporativo moderno (ver [DESIGN-UX.md](./DESIGN-UX.md)).

### Cores principais

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#C41E24` | CTAs, links ativos, ícones de destaque |
| `primary-hover` | `#A0181E` | Hover de botões |
| `primary-light` | `#FEF2F2` | Fundo suave de badge/alerta marca |
| `primary-foreground` | `#FFFFFF` | Texto sobre botão primary |

### Neutros (slate)

| Token | Hex | Uso |
|-------|-----|-----|
| `neutral-900` | `#0F172A` | Títulos |
| `neutral-800` | `#1E293B` | Texto forte |
| `neutral-600` | `#475569` | Texto secundário |
| `neutral-400` | `#94A3B8` | Placeholders |
| `neutral-200` | `#E2E8F0` | Bordas |
| `neutral-100` | `#F1F5F9` | Fundos alternados |
| `neutral-50` | `#F8FAFC` | Fundo da página |
| `surface` | `#FFFFFF` | Cards, header |

### Acentos e utilitários

| Token | Hex | Uso |
|-------|-----|-----|
| `accent` | `#1EA0C3` | Links informativos, detalhes (uso pontual) |
| `cta-whatsapp` | `#25D366` | Botão flutuante e CTAs WhatsApp |
| `cta-whatsapp-hover` | `#20BD5A` | Hover WhatsApp |
| `success` | `#02E49B` | Confirmação de formulário (opcional) |
| `destructive` | `#E21B24` | Erros de validação |

### Contraste (WCAG AA)

- Texto `#000000` ou `#1E1F26` sobre fundo `#FFFFFF` ou `#F0F0F0`: aprovado.
- Texto `#FFFFFF` sobre `#E21B24` ou `#CF0000`: verificar tamanho mínimo 16px / bold 14px.
- Não usar `#949494` em textos longos sobre branco (apenas legendas).

### Amostra visual (referência)

```
primary      ███  #E21B24
primary-hover ███ #CF0000
neutral-900  ███  #1E1F26
neutral-100  ███  #F0F0F0
whatsapp     ███  #25D366
```

---

## 3. Tipografia

**Proposta para o novo site** (Google Fonts, gratuitas). Validar com cliente.

| Papel | Família | Pesos | Uso |
|-------|---------|-------|-----|
| **Títulos** | Plus Jakarta Sans | 600, 700 | H1–H4, navegação |
| **Corpo** | Inter | 400, 500 | Parágrafos, formulários, cards |

**Fallback:** `system-ui, -apple-system, Segoe UI, sans-serif`

### Escala tipográfica (desktop)

| Elemento | Tamanho | Peso | Line-height |
|----------|---------|------|-------------|
| H1 | 2.25rem (36px) | 700 | 1.2 |
| H2 | 1.875rem (30px) | 700 | 1.25 |
| H3 | 1.5rem (24px) | 600 | 1.3 |
| H4 | 1.25rem (20px) | 600 | 1.35 |
| Body | 1rem (16px) | 400 | 1.6 |
| Small | 0.875rem (14px) | 400 | 1.5 |
| Label / botão | 0.875–1rem | 600 | 1.4 |

### Regras

- Máximo 2 famílias no site.
- Títulos em sentence case ou title case (não ALL CAPS exceto siglas: NR-12, BH).
- Números de telefone com máscara: (31) 3376-3377.

---

## 4. Logo e ícones

### Arquivos no repositório

| Arquivo | Local | Notas |
|---------|-------|-------|
| Logo compacto | [`brand/logo-primary.webp`](./brand/logo-primary.webp) | Extraído do site legado |
| Logo horizontal | [`brand/logo-header.png`](./brand/logo-header.png) | 1024×375 px |

Ver também [`brand/README.md`](./brand/README.md).

### Uso no site (Sprint 1)

| Contexto | Arquivo recomendado | Altura máx. header |
|----------|---------------------|-------------------|
| Header desktop | `logo-header.png` ou SVG futuro | 48–56 px |
| Header mobile | `logo-primary.webp` | 40 px |
| Footer | versão branca (quando existir) | 40 px |
| Favicon | derivado de `logo-primary` | 32×32 |

### Regras

- Área de respiro: mínimo ½ da altura do logo em todos os lados.
- Largura mínima no header: **120 px**.
- Não distorcer, rotacionar ou alterar cores do logo.
- Fundos permitidos: branco, `#F0F0F0`, `#1E1F26` (com versão clara do logo).
- Fundos proibidos: fotos busy sem contraste, gradientes que prejudiquem leitura.

### Favicon (gerar na Sprint 1)

- `favicon.ico` · `favicon-32x32.png` · `apple-touch-icon.png` (180×180)

---

## 5. Tokens — implementação Sprint 1

Mapeamento para Tailwind CSS v4 em [`src/styles/global.css`](../src/styles/global.css):

```css
@theme {
  /* Brand v2 */
  --color-primary: #c41e24;
  --color-primary-hover: #a0181e;
  --color-primary-light: #fef2f2;
  --color-primary-foreground: #ffffff;

  --color-neutral-900: #0f172a;
  --color-neutral-800: #1e293b;
  --color-neutral-600: #475569;
  --color-neutral-400: #94a3b8;
  --color-neutral-200: #e2e8f0;
  --color-neutral-100: #f1f5f9;
  --color-neutral-50: #f8fafc;
  --color-surface: #ffffff;

  --color-accent: #1ea0c3;
  --color-cta-whatsapp: #25d366;
  --color-cta-whatsapp-hover: #20bd5a;

  --color-success: #02e49b;
  --color-destructive: #e21b24;

  /* Typography — applied via next/font in layout */
  --font-heading: var(--font-plus-jakarta-sans), system-ui, sans-serif;
  --font-body: var(--font-inter), system-ui, sans-serif;
}
```

Classes utilitárias esperadas: `bg-primary`, `text-primary`, `font-heading`, `font-body`, `bg-cta-whatsapp`.

---

## 6. Validação do cliente

Preencha com **OK** ou indique correção. Sem esta etapa, o Sprint 1 usa valores provisórios.

| # | Item | Resposta Cezar |
|---|------|----------------|
| 1 | Tom de voz (seção 1) | ☐ OK · ☐ Ajustes: _____ |
| 2 | Cores hex (seção 2) | ☐ OK · ☐ Enviar manual: _____ |
| 3 | Tipografia Plus Jakarta + Inter | ☐ OK · ☐ Outra: _____ |
| 4 | Logos em `docs/brand/` | ☐ OK provisório · ☐ Enviarei SVG oficial |
| 5 | Autorização geral do guia | ☐ Aprovado para Sprint 1 |

**Assinatura**

| Nome | Papel | Data |
|------|-------|------|
| Cezar | Negócio | |
| Flaviano Queiroz | Técnico | 2026-05-18 |

---

## Histórico

| Versão | Data | Alteração |
|--------|------|-----------|
| 1.0 | 2026-05-18 | Guia inicial — cores do site legado, logos extraídos, tipografia proposta |

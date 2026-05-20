# Logos de clientes na Home

Seção: `ClientLogosSection` logo após o hero em `/`.

## Adicionar logo real

1. Arquivo em `public/clientes/{slug}.webp` (fundo transparente, ~320px largura).
2. Atualizar `src/data/client-logos.ts`:

```ts
{
  slug: 'vale',
  name: 'Vale',
  segment: 'mineracao',
  logoSrc: '/clientes/vale.webp',
},
```

3. Remover ou manter o wordmark do mesmo segmento conforme aprovado pelo cliente.

## Site legado

O site `acessoequipamentos.com.br` usa faixas de imagem (ex. `Design-sem-nome-28.png`). Baixe com autorização e recorte logos individuais quando possível — evite usar a faixa inteira sem separar marcas.

## i18n

Chaves em `Index`: `clients_title`, `clients_subtitle`, `clients_footnote`.

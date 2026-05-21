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

Faixa usada: `Design-sem-nome-31.png` em `acessoequipamentos.com.br/wp-content/uploads/2023/06/`.

Recorte automatizado (grade 3×2 → 6 slugs):

```bash
curl -sL -o public/clientes/_legacy-strip-source.png \
  https://acessoequipamentos.com.br/wp-content/uploads/2023/06/Design-sem-nome-31.png
python docs/scripts/split-client-logos.py
```

Revise visualmente cada `.webp` e confirme autorização comercial antes de campanhas pagas.

## i18n

Chaves em `Index`: `clients_title`, `clients_subtitle`, `clients_footnote`.

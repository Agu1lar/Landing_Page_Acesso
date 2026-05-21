# Logos de clientes na Home

Seção: `ClientLogosSection` logo após o hero em `/`.

## Pastas por setor

Coloque logos com **fundo transparente** (PNG ou WebP) em:

| Pasta | Setor |
|-------|--------|
| `public/clientes/construcao/` | Construção civil |
| `public/clientes/industria/` | Indústria |
| `public/clientes/mineracao/` | Mineração |
| `public/clientes/varejo/` | Varejo e corporativo |
| `public/clientes/logistica/` | Logística |
| `public/clientes/infraestrutura/` | Infraestrutura |

Exemplo:

```
public/clientes/mineracao/vale.webp
public/clientes/construcao/empreiteira-xyz.png
```

- Nome do arquivo vira texto alternativo (`vale` → alt "vale").
- Vários logos por pasta são exibidos na mesma linha do setor.
- Pasta **vazia** não aparece na Home.

Não é necessário editar `src/data/client-logos.ts` ao adicionar arquivos — a lista é lida do disco no build.

## i18n

Chaves em `Index`: `clients_title`, `clients_subtitle`, `clients_footnote`.

## Jurídico

Só use marcas com autorização de uso. Remova o arquivo da pasta se o contrato expirar.

# Logos de clientes na Home

Seção: `ClientLogosSection` logo após o hero em `/`.

## Organização em pastas (não aparece na Home)

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
- A Home exibe **4 logos coloridas** por vez, em rotação a cada 5 s (sem título de setor).
- Arquivos duplicados (mesmo nome em pastas diferentes) são deduplicados automaticamente.
- Pastas vazias são ignoradas; basta ter arquivos em qualquer subpasta.

Não é necessário editar `src/data/client-logos.ts` ao adicionar arquivos — a lista é lida do disco no build.

## i18n

Chaves em `Index`: `clients_title`, `clients_subtitle`.

## Jurídico

Só use marcas com autorização de uso. Remova o arquivo da pasta se o contrato expirar.

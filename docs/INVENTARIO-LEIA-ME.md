# Inventário de equipamentos (tarefa 0.2)

## Status

| Item | Status |
|------|--------|
| Fonte | [`ITENS.xlsx`](./ITENS.xlsx) |
| Inventário gerado | [`inventario-equipamentos.csv`](./inventario-equipamentos.csv) — **110 itens** |
| Revisão | ☑ Aprovado por Cezar (2026-05-18) |
| Script de reimportação | [`scripts/import-itens.py`](./scripts/import-itens.py) |
| Plataformas aéreas | **14** modelos com **4 specs compactas** (sem descrição longa) |

**Reimportar após editar o Excel:** `python docs/scripts/import-itens.py`

---

## Arquivo principal

**[`inventario-equipamentos.csv`](./inventario-equipamentos.csv)** — catálogo validado para o site.

---

## Como enviar o manifesto

Escolha **uma** opção:

| Opção | O que fazer |
|-------|-------------|
| **1. Colar no chat** | Copie a lista do manifesto (Excel, PDF, Word) e cole na conversa |
| **2. Arquivo no projeto** | Salve como `docs/manifesto-original.xlsx` (ou `.csv`) na pasta `docs/` e avise |
| **3. Preencher o CSV** | Abra `inventario-equipamentos.csv` no Excel, uma linha por equipamento |

Quando o manifesto chegar, o dev:

1. Mapeia colunas do manifesto → este CSV  
2. Gera slugs e categorias  
3. Marca destaques para a home (6 itens)  
4. Valida com você antes do Sprint 2  

---

## Colunas do CSV

| Coluna | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| `slug` | Sim | URL amigável: `plataforma-tesoura-12m` (sem acentos, minúsculas) |
| `nome` | Sim | Nome exibido no site |
| `categoria` | Sim | Ver lista abaixo |
| `descricao_curta` | Sim | 1–2 frases (card do catálogo) |
| `descricao_longa` | Não | Texto da página de detalhe |
| `spec_1_label` … `spec_4_valor` | Não | Até 4 especificações (altura, capacidade, etc.) |
| `tags` | Não | Palavras-chave separadas por vírgula |
| `destaque_home` | Não | `sim` ou `nao` (máx. ~6 com `sim`) |
| `disponivel` | Sim | `sim` ou `nao` |
| `entrega_obra` | Não | `sim` / `nao` / `consulte` |
| `foto_disponivel` | Não | `sim` / `nao` / `pendente` |
| `observacoes` | Não | Uso interno |

### Categorias válidas (`categoria`)

Use **exatamente** um destes valores:

- `equipamentos-aereos`
- `concretagem`
- `compactacao`
- `demolicao-perfuracao`
- `andaimes-acesso`
- `energia`
- `ferramentas-eletricas`
- `outros` (só se não couber nas anteriores)

---

## Plataformas aéreas — especificações

Cada plataforma tem **até 4 linhas de spec** (sem texto longo):

| Spec | Exemplo |
|------|---------|
| Tipo | Tesoura / Lança articulada |
| Altura ou alcance | ~14 m |
| Capacidade ou alcance horizontal | ~230 kg |
| Alimentação | Elétrica / Diesel |

Valores com **~** ou **Consulte** devem ser validados com a ficha técnica da unidade (coluna `observacoes`).

**Destaques na home (6):** HB 1430, HB P830, PEP P590, GS 1930s, AWP 30S, SJ III 4740 — ajuste no CSV se quiser outros.

---

## Preços

Conforme [`REQUISITOS.md`](./REQUISITOS.md): **não** incluir preço no CSV — tudo **sob consulta** no site.

---

## Fotos

Não é obrigatório no CSV. Depois organizamos em:

`public/assets/equipamentos/{slug}-01.webp`

---

## Critério de conclusão (0.2)

- [x] Manifesto importado (todas as linhas da frota ativa)
- [x] Sem linhas de exemplo
- [x] Categorias revisadas
- [x] 6 equipamentos marcados `destaque_home=sim`
- [x] Cezar ou responsável comercial aprovou a lista

"""
Preenche descricao_longa e especificacoes tecnicas em src/data/equipamentos.json.

Uso: python docs/scripts/enrich-equipment-specs.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JSON_PATH = ROOT / "src" / "data" / "equipamentos.json"

CATEGORY_LONG = {
    "equipamentos-aereos": (
        "Plataforma elevatória para trabalho em altura com operação segura e estável. "
        "Indicada para manutenção, montagem e serviços em fachadas e galpões na região metropolitana de BH. "
        "Unidade revisada; classificação e documentação conforme NR-12 e ficha do fabricante."
    ),
    "concretagem": (
        "Equipamento para concretagem e misturas em obra civil. "
        "Aplicação em fundações, lajes e serviços de alvenaria. Entrega e retirada combinadas com a locação."
    ),
    "compactacao": (
        "Equipamento de compactação de solo para preparação de base e acabamento em obra. "
        "Uso em calçadas, valas e áreas de assentamento. Operação com EPI e manual do fabricante."
    ),
    "demolicao-perfuracao": (
        "Equipamento para demolição, perfuração ou corte em obra. "
        "Indicado para serviços pontuais com operador treinado e proteção adequada."
    ),
    "andaimes-acesso": (
        "Solução de acesso e estrutura temporária para obra. "
        "Montagem conforme projeto e normas de segurança; consulte nossa equipe para quantitativos."
    ),
    "energia": (
        "Equipamento de geração ou ar comprimido para canteiro de obras. "
        "Dimensionamento conforme demanda do serviço; valores e autonomia sob consulta."
    ),
    "ferramentas-eletricas": (
        "Ferramenta elétrica para locação em obra e reforma. "
        "Tensão e acessórios conforme modelo; uso com EPI e instalação elétrica adequada (220 V)."
    ),
    "outros": (
        "Equipamento para locação em obra civil na região metropolitana de Belo Horizonte. "
        "Disponibilidade e condições comerciais conforme período de locação."
    ),
}

CATEGORY_SPECS: dict[str, list[tuple[str, str]]] = {
    "concretagem": [
        ("Aplicação", "Concretagem, argamassa e misturas"),
        ("Alimentação", "220 V monofásica (conforme modelo)"),
        ("Entrega", "Região metropolitana de BH"),
    ],
    "compactacao": [
        ("Aplicação", "Compactação de solo e base"),
        ("Alimentação", "Elétrica ou manual (conforme modelo)"),
        ("Entrega", "Região metropolitana de BH"),
    ],
    "demolicao-perfuracao": [
        ("Aplicação", "Demolição, perfuração ou corte"),
        ("Segurança", "EPI obrigatório · NR-12 quando aplicável"),
        ("Entrega", "Região metropolitana de BH"),
    ],
    "andaimes-acesso": [
        ("Aplicação", "Acesso e estrutura temporária"),
        ("Montagem", "Sob consulta técnica"),
        ("Entrega", "Região metropolitana de BH"),
    ],
    "energia": [
        ("Aplicação", "Geração ou ar comprimido em obra"),
        ("Alimentação", "Conforme modelo (diesel, 220 V, etc.)"),
        ("Entrega", "Região metropolitana de BH"),
    ],
    "ferramentas-eletricas": [
        ("Aplicação", "Obra civil e reforma"),
        ("Alimentação", "220 V monofásica"),
        ("Entrega", "Região metropolitana de BH"),
    ],
    "outros": [
        ("Aplicação", "Locação para construção civil"),
        ("Condição", "Unidade conforme disponibilidade de frota"),
        ("Entrega", "Região metropolitana de BH"),
    ],
}


def spec_list(pairs: list[tuple[str, str]]) -> list[dict[str, str]]:
    return [{"label": label, "value": value} for label, value in pairs]


def abnt_class(tipo: str) -> str:
    """Classificação NBR 16776 (PEMT) a partir do tipo mecânico."""
    t = tipo.lower()
    if "empurrar" in t:
        return "Tipo 1 · Grupo A (tesoura empurrar — só desloca retraída · NBR 16776)"
    if "lança" in t or "lanca" in t:
        return "Tipo 3 · Grupo B (lança articulada — comando no cesto · NBR 16776)"
    if "mastro" in t or "awp" in t:
        return "Tipo 3 · Grupo A (mastro vertical autopropelido — comando no cesto · NBR 16776)"
    if "tesoura" in t:
        return "Tipo 3 · Grupo A (tesoura autopropelida — comando no cesto · NBR 16776)"
    return "Conforme ficha da unidade (NBR 16776)"


def enrich_aerial_specs(specs: list[dict[str, str]]) -> list[dict[str, str]]:
    by_label = {s["label"]: s["value"] for s in specs}
    tipo = by_label.get("Tipo", "Plataforma elevatória")

    altura = by_label.get("Altura de trabalho") or by_label.get("Alcance vertical", "Sob consulta")
    capacidade = by_label.get("Capacidade", by_label.get("Capacidade / peso na plataforma", "Sob consulta"))
    alimentacao = by_label.get("Alimentação", "Sob consulta")
    peso_total = by_label.get("Peso total operacional", "Sob consulta na proposta")

    pairs: list[tuple[str, str]] = [
        ("Tipo", tipo),
        ("Altura de trabalho", altura),
        ("Capacidade / peso na plataforma", capacidade),
        ("Peso total operacional", peso_total),
        ("Alimentação", alimentacao),
        ("Classificação ABNT (NBR 16776)", abnt_class(tipo)),
    ]

    if by_label.get("Alcance horizontal"):
        pairs.insert(4, ("Alcance horizontal", by_label["Alcance horizontal"]))

    return spec_list(pairs)


def enrich_item(item: dict) -> dict:
    category = item["category"]
    name = item["name"]

    if not item.get("longDescription", "").strip():
        template = CATEGORY_LONG.get(category, CATEGORY_LONG["outros"])
        item["longDescription"] = f"{name.strip().capitalize()}: {template}"

    short = item.get("shortDescription", "")
    short = short.replace(" — valores sob consulta.", ".").replace(" — sob consulta.", ".")
    if short and not short.endswith("."):
        short += "."
    item["shortDescription"] = short

    if category == "equipamentos-aereos":
        item["specs"] = enrich_aerial_specs(item.get("specs") or [])
    elif not item.get("specs"):
        defaults = CATEGORY_SPECS.get(category, CATEGORY_SPECS["outros"])
        item["specs"] = spec_list(defaults)

    return item


def main() -> None:
    items = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    enriched = [enrich_item(dict(item)) for item in items]
    JSON_PATH.write_text(json.dumps(enriched, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    aerial = sum(1 for i in enriched if i["category"] == "equipamentos-aereos")
    with_specs = sum(1 for i in enriched if i.get("specs"))
    with_long = sum(1 for i in enriched if i.get("longDescription"))

    print(f"Atualizado {len(enriched)} itens em {JSON_PATH.relative_to(ROOT)}")
    print(f"  Plataformas aéreas: {aerial}")
    print(f"  Com especificações: {with_specs}")
    print(f"  Com descrição técnica: {with_long}")


if __name__ == "__main__":
    main()

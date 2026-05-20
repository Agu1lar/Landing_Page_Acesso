"""
Atualiza especificações das plataformas elevatórias em equipamentos.json
com dados alinhados a fichas de fabricante / modelos da frota.

Classificação ABNT conforme NBR 16776 (PEMT):
- Grupo A: centro da plataforma permanece dentro das linhas de tombamento (tesoura, mastro vertical).
- Grupo B: carga pode projetar fora dos apoios (lanças articuladas / telescópicas).
- Tipo 1: deslocamento somente com PEMT retraída (ex.: tesoura empurrar).
- Tipo 3: deslocamento elevada com comando no cesto (autopropelidas).

Uso: python docs/scripts/fix-platform-specs.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JSON_PATH = ROOT / "src" / "data" / "equipamentos.json"

# NBR 16776 — referência NR-18 (PEMT)
ABNT_1A_PUSH = "Tipo 1 · Grupo A (tesoura empurrar — só desloca retraída · NBR 16776)"
ABNT_3A_TESOURA = "Tipo 3 · Grupo A (tesoura autopropelida — comando no cesto · NBR 16776)"
ABNT_3A_MASTRO = "Tipo 3 · Grupo A (mastro vertical autopropelido — comando no cesto · NBR 16776)"
ABNT_3B_LANCA = "Tipo 3 · Grupo B (lança articulada — comando no cesto · NBR 16776)"

# Alturas = altura de trabalho aproximada; conferir unidade da frota quando houver dúvida.
PLATFORM_DATA: dict[str, dict] = {
    "plataforma-elevatoria-hb-1430": {
        "name": "Plataforma elevatória HB 1430",
        "tipo": "Tesoura (laje)",
        "altura": "~6,1 m (20 ft)",
        "capacidade": "~300 kg",
        "peso": "~770 kg",
        "alimentacao": "Elétrica (bateria)",
        "alcance_h": None,
        "abnt": ABNT_3A_TESOURA,
        "long": (
            "Tesoura elétrica Hy-Brid HB 1430 para trabalho em altura em ambientes internos "
            "e lajes. Altura de trabalho em torno de 6 m, ideal para manutenção predial e "
            "montagens leves na região metropolitana de BH."
        ),
    },
    "plataforma-elevatoria-hb-p830": {
        "name": "Plataforma elevatória HB P830",
        "tipo": "Tesoura compacta (empurrar)",
        "altura": "~4,3 m (14 ft)",
        "capacidade": "~227 kg",
        "peso": "~360 kg",
        "alimentacao": "Elétrica (bateria)",
        "alcance_h": None,
        "abnt": ABNT_1A_PUSH,
        "long": (
            "Plataforma tipo tesoura compacta HB P830, indicada para corredores estreitos e "
            "manutenção em altura moderada (~4 m de trabalho)."
        ),
    },
    "plataforma-elevatoria-pep-p590": {
        "name": "Plataforma elevatória PEP 590",
        "tipo": "Tesoura (low level)",
        "altura": "~6,0 m",
        "capacidade": "~140 kg (1 operador)",
        "peso": "~420 kg",
        "alimentacao": "Elétrica (bateria 12 V)",
        "alcance_h": None,
        "abnt": ABNT_1A_PUSH,
        "long": (
            "Plataforma elevatória Hydrolift PEP 590, fabricação nacional, para trabalhos "
            "em até cerca de 6 m. Indicada para manutenção predial e instalações leves."
        ),
    },
    "plataforma-elevatoria-gs-1930s": {
        "name": "Plataforma elevatória GS 1930s",
        "tipo": "Tesoura",
        "altura": "~7,9 m (interior) / ~6,5 m (exterior)",
        "capacidade": "227 kg",
        "peso": "~1.456 kg",
        "alimentacao": "Elétrica (bateria)",
        "alcance_h": None,
        "abnt": ABNT_3A_TESOURA,
        "long": (
            "Tesoura elétrica Genie GS-1930 para passagens estreitas e pisos delicados. "
            "Altura de trabalho de cerca de 7,9 m em ambiente interno."
        ),
    },
    "plataforma-elevatoria-awp-30s": {
        "name": "Plataforma elevatória AWP 30S",
        "tipo": "Mastro vertical (AWP)",
        "altura": "~11 m",
        "capacidade": "~159 kg",
        "peso": "~390 kg",
        "alimentacao": "Elétrica",
        "alcance_h": None,
        "abnt": ABNT_3A_MASTRO,
        "long": (
            "Plataforma de mastro vertical Genie AWP-30S, leve e manobrável, para "
            "manutenção e instalações em altura média (~11 m de trabalho)."
        ),
    },
    "plataforma-elevatoria-sj-iii-4740": {
        "name": "Plataforma elevatória SJ III 4740",
        "tipo": "Tesoura",
        "altura": "~13,8 m (47 ft)",
        "capacidade": "227 kg",
        "peso": "Sob consulta na proposta",
        "alimentacao": "Elétrica (bateria)",
        "alcance_h": None,
        "abnt": ABNT_3A_TESOURA,
        "long": (
            "Tesoura elétrica Skyjack SJ III 4740, uma das maiores tesouras da linha, "
            "com cerca de 13,8 m de altura de trabalho para montagens e manutenção em galpões."
        ),
    },
    "plataforma-elevatoria-20-mvl": {
        "name": "Plataforma elevatória 20 MVL",
        "tipo": "Mastro vertical",
        "altura": "~7,6 m (25 ft)",
        "capacidade": "Sob consulta",
        "peso": "Sob consulta na proposta",
        "alimentacao": "Elétrica",
        "alcance_h": None,
        "abnt": ABNT_3A_MASTRO,
        "long": (
            "Mastro vertical JLG 20MVL, dirigível em altura, para corredores estreitos e "
            "manutenção com cerca de 7,6 m de altura de trabalho."
        ),
    },
    "plataforma-elevatoria-am-36": {
        "name": "Plataforma elevatória AM-36",
        "tipo": "Lança articulada",
        "altura": "~11 m (36 ft)",
        "capacidade": "Sob consulta",
        "peso": "Sob consulta na proposta",
        "alimentacao": "Diesel ou elétrica (conforme unidade)",
        "alcance_h": "Sob consulta",
        "abnt": ABNT_3B_LANCA,
        "long": (
            "Plataforma com lança articulada AM-36 para trabalho em altura com alcance "
            "horizontal. Especificações da unidade disponíveis na proposta."
        ),
    },
    "plataforma-elevatoria-z45-25j-dc-lanca-articulada": {
        "name": "Plataforma elevatória Z45/25J DC",
        "tipo": "Lança articulada",
        "altura": "~15,9 m",
        "capacidade": "227 kg",
        "peso": "Sob consulta na proposta",
        "alimentacao": "Elétrica (DC)",
        "alcance_h": "~7,6 m",
        "abnt": ABNT_3B_LANCA,
        "long": (
            "Lança articulada elétrica Genie Z-45/25J DC, com cerca de 15,9 m de altura "
            "de trabalho e alcance horizontal aproximado de 7,6 m."
        ),
    },
    "plataforma-elevatoria-sj-iii-3219": {
        "name": "Plataforma elevatória SJ III 3219",
        "tipo": "Tesoura",
        "altura": "~7,6 m (25 ft)",
        "capacidade": "~249 kg",
        "peso": "~1.170 kg",
        "alimentacao": "Elétrica (bateria)",
        "alcance_h": None,
        "abnt": ABNT_3A_TESOURA,
        "long": (
            "Tesoura elétrica compacta Skyjack SJ III 3219 para uso interno, com cerca de "
            "7,6 m de altura de trabalho."
        ),
    },
    "plataforma-elevatoria-sj-iii-3226": {
        "name": "Plataforma elevatória SJ III 3226",
        "tipo": "Tesoura",
        "altura": "~9,75 m (32 ft)",
        "capacidade": "227 kg",
        "peso": "Sob consulta na proposta",
        "alimentacao": "Elétrica (bateria)",
        "alcance_h": None,
        "abnt": ABNT_3A_TESOURA,
        "long": (
            "Tesoura elétrica Skyjack SJ III 3226 com cerca de 9,75 m de altura de trabalho, "
            "indicada para galpões e manutenção industrial."
        ),
    },
    "plataforma-elevatoria-sj-iii-4632": {
        "name": "Plataforma elevatória SJ III 4632",
        "tipo": "Tesoura",
        "altura": "~14 m (46 ft)",
        "capacidade": "227 kg",
        "peso": "Sob consulta na proposta",
        "alimentacao": "Elétrica (bateria)",
        "alcance_h": None,
        "abnt": ABNT_3A_TESOURA,
        "long": (
            "Tesoura elétrica Skyjack SJ III 4632 para grandes alturas em ambiente coberto, "
            "com cerca de 14 m de altura de trabalho."
        ),
    },
    "plataforma-elevatoria-z60-37-dc-lanca-articulada": {
        "name": "Plataforma elevatória Z60/37 DC",
        "tipo": "Lança articulada",
        "altura": "~20,2 m",
        "capacidade": "227 kg",
        "peso": "Sob consulta na proposta",
        "alimentacao": "Elétrica (DC)",
        "alcance_h": "~11,2 m",
        "abnt": ABNT_3B_LANCA,
        "long": (
            "Lança articulada Genie Z-60/37 DC para trabalhos em grande altura (~20 m) "
            "com alcance horizontal estendido."
        ),
    },
    "plataforma-elevatoria-160-atj-lanca-articulada": {
        "name": "Plataforma elevatória 160 ATJ",
        "tipo": "Lança articulada",
        "altura": "~16 m",
        "capacidade": "230 kg",
        "peso": "Sob consulta na proposta",
        "alimentacao": "Diesel",
        "alcance_h": "~8,3 m",
        "abnt": ABNT_3B_LANCA,
        "long": (
            "Lança articulada Manitou 160 ATJ, tração 4x4, para obra externa e terrenos "
            "irregulares, com cerca de 16 m de altura de trabalho."
        ),
    },
}


def build_specs(data: dict) -> list[dict[str, str]]:
    pairs: list[tuple[str, str]] = [
        ("Tipo", data["tipo"]),
        ("Altura de trabalho", data["altura"]),
        ("Capacidade / peso na plataforma", data["capacidade"]),
        ("Peso total operacional", data["peso"]),
    ]
    if data.get("alcance_h"):
        pairs.append(("Alcance horizontal", data["alcance_h"]))
    pairs.extend(
        [
            ("Alimentação", data["alimentacao"]),
            ("Classificação ABNT (NBR 16776)", data["abnt"]),
        ],
    )
    return [{"label": label, "value": value} for label, value in pairs]


def main() -> None:
    items = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    updated = 0
    for item in items:
        slug = item.get("slug", "")
        if slug not in PLATFORM_DATA:
            continue
        data = PLATFORM_DATA[slug]
        item["name"] = data["name"]
        item["shortDescription"] = f"Locação de {data['name']}."
        item["longDescription"] = data["long"]
        item["specs"] = build_specs(data)
        updated += 1
    JSON_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Plataformas atualizadas: {updated} / {len(PLATFORM_DATA)}")


if __name__ == "__main__":
    main()

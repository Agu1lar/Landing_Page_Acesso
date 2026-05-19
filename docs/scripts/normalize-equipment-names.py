"""
Padroniza o campo name em src/data/equipamentos.json (primeira letra maiúscula, restante minúscula,
com exceções para siglas e modelos).

Uso: python docs/scripts/normalize-equipment-names.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JSON_PATH = ROOT / "src" / "data" / "equipamentos.json"

PARTICLES = {
    "a",
    "ao",
    "aos",
    "as",
    "ate",
    "até",
    "com",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "na",
    "no",
    "o",
    "ou",
    "para",
    "por",
}

ACRONYMS = {
    "hb",
    "dc",
    "atj",
    "awp",
    "pep",
    "gs",
    "sj",
    "iii",
    "nr",
    "epi",
    "bh",
    "sp",
    "cp",
    "weg",
    "av",
    "mvl",
    "am",
    "makita",
    "bosch",
    "bosh",
    "fch",
    "mecan",
    "p830",
    "1430",
    "p590",
    "1930s",
    "30s",
    "3219",
    "3226",
    "4632",
    "4740",
    "z45",
    "z60",
    "25j",
    "37",
    "160",
    "20",
    "36",
    "220v",
    "200v",
    "1t",
    "nr-12",
}


def format_token(token: str, is_first: bool) -> str:
    lower = token.lower()
    if lower in ACRONYMS:
        return lower.upper() if len(lower) <= 4 else lower.capitalize()
    if re.fullmatch(r"\d+([.,]\d+)?", lower):
        return token
    if re.fullmatch(r"\d+([.,]\d+)?[a-z]*", lower):
        return token.upper() if lower.endswith("v") else token
    if not is_first and lower in PARTICLES:
        return lower
    if token.isupper() and len(token) > 2:
        return token.capitalize()
    if len(token) <= 1:
        return token.upper()
    return token[0].upper() + token[1:].lower()


ACCENT_FIXES = (
    (" Po", " Pó"),
    (" Eletrico", " Elétrico"),
    (" eletrico", " elétrico"),
    (" -220v", " 220V"),
    ("\"m ", "\" "),
)


def normalize_name(name: str) -> str:
    if name.startswith("Plataforma elevatória"):
        return name
    parts = re.split(r"(\s+)", name.strip())
    word_index = 0
    result: list[str] = []
    for part in parts:
        if part.isspace():
            result.append(part)
            continue
        result.append(format_token(part, word_index == 0))
        word_index += 1
    text = "".join(result)
    for old, new in ACCENT_FIXES:
        text = text.replace(old, new)
    return text


def rental_sentence(name: str) -> str:
    return f"Locação de {name[0].lower()}{name[1:]}." if name else ""


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    updated = 0
    for item in data:
        old_name = item.get("name", "")
        new_name = normalize_name(old_name)
        if new_name != old_name:
            item["name"] = new_name
            updated += 1
        expected_short = rental_sentence(new_name)
        if item.get("shortDescription", "").startswith("Locação de ") and item["shortDescription"] != expected_short:
            item["shortDescription"] = expected_short
    JSON_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Nomes atualizados: {updated} / {len(data)}")


if __name__ == "__main__":
    main()

"""Append accessory catalog entries to src/data/equipamentos.json."""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JSON_PATH = ROOT / "src" / "data" / "equipamentos.json"


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")[:80] or "acessorio"


def make_entry(name: str, *, spec_label: str | None = None, spec_value: str | None = None) -> dict:
    slug = slugify(name)
    short = f"Locação de {name}."
    long_desc = (
        f"{name}: Acessório para locação em obra civil na região metropolitana de Belo Horizonte. "
        "Compatibilidade e modelo conforme disponibilidade de frota; consulte na solicitação de orçamento."
    )
    specs: list[dict[str, str]] = [
        {"label": "Aplicação", "value": "Complemento para equipamentos de locação"},
        {"label": "Condição", "value": "Unidade conforme disponibilidade de frota"},
        {"label": "Entrega", "value": "Região metropolitana de BH"},
    ]
    if spec_label and spec_value:
        specs.insert(0, {"label": spec_label, "value": spec_value})
    return {
        "slug": slug,
        "name": name,
        "category": "acessorios",
        "shortDescription": short,
        "longDescription": long_desc,
        "specs": specs,
        "tags": ["acessorios"],
        "featured": False,
        "available": True,
    }


def build_items() -> list[dict]:
    items: list[dict] = []

    for peso in ("5 kg", "11 kg", "15 kg", "30 kg"):
        peso_slug = peso.replace(" ", "")
        items.append(
            make_entry(f"Ponteira {peso}", spec_label="Peso", spec_value=peso),
        )
        items.append(
            make_entry(f"Talhadeira {peso}", spec_label="Peso", spec_value=peso),
        )

    punhos = [
        ("Punho para furadeira", "Ferramenta", "Furadeira"),
        ("Punho para lixadeira", "Ferramenta", "Lixadeira"),
        ("Punho para esmerilhadeira", "Ferramenta", "Esmerilhadeira"),
        ("Punho misturador", "Ferramenta", "Misturador"),
    ]
    for name, label, value in punhos:
        items.append(make_entry(name, spec_label=label, spec_value=value))

    for peso in ("5 kg", "10 kg", "15 kg", "16 kg", "18 kg", "19 kg"):
        items.append(
            make_entry(f"Punho martelo {peso}", spec_label="Peso", spec_value=peso),
        )

    singles = [
        "Botoeira para guincho de coluna",
        "Cabo de aço",
        "Tripé / pedestal",
        "Caçamba",
        "Cesto",
        "Abraçadeira para guincho",
        "Rabicho gerador",
        "Adaptador para lavadora",
        "Chave 2 pinos",
        "Chave Allen",
        "Chave de mandril",
        "Mangueira",
        "Niple para bomba",
        "Proteção de cremalheira",
        "Plug Steck 2 pinos + terra 220 V",
        "Coifa",
        "Prato de borracha",
        "Maleta",
        "Pinça para máquina de solda",
        "Garra para máquina de solda",
    ]
    for name in singles:
        items.append(make_entry(name))

    return items


def main() -> None:
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    existing_slugs = {item["slug"] for item in data}
    new_items = build_items()
    added = 0
    for item in new_items:
        if item["slug"] in existing_slugs:
            print(f"skip existing slug: {item['slug']}")
            continue
        data.append(item)
        existing_slugs.add(item["slug"])
        added += 1
        print(f"added: {item['slug']}")
    JSON_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"\n{added} acessórios adicionados ({len(new_items)} no script). Total catálogo: {len(data)}")


if __name__ == "__main__":
    main()

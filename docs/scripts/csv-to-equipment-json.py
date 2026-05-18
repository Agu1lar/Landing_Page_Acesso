"""Convert inventario-equipamentos.csv -> src/data/equipamentos.json"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CSV_PATH = ROOT / "docs" / "inventario-equipamentos.csv"
OUT_PATH = ROOT / "src" / "data" / "equipamentos.json"


def row_to_item(row: dict[str, str]) -> dict:
    specs = []
    for i in range(1, 5):
        label = row.get(f"spec_{i}_label", "").strip()
        value = row.get(f"spec_{i}_valor", "").strip()
        if label and value:
            specs.append({"label": label, "value": value})
    tags = [t.strip() for t in row.get("tags", "").split(",") if t.strip()]
    return {
        "slug": row["slug"].strip(),
        "name": row["nome"].strip(),
        "category": row["categoria"].strip(),
        "shortDescription": row["descricao_curta"].strip(),
        "longDescription": row.get("descricao_longa", "").strip(),
        "specs": specs,
        "tags": tags,
        "featured": row.get("destaque_home", "nao").strip().lower() == "sim",
        "available": row.get("disponivel", "sim").strip().lower() == "sim",
    }


def main() -> None:
    items = []
    with CSV_PATH.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            if row.get("slug", "").strip():
                items.append(row_to_item(row))
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(items)} items to {OUT_PATH}")


if __name__ == "__main__":
    main()

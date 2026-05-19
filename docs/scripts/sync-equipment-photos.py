"""
Copia fotos de public/equipamentos/_incoming/ para public/equipamentos/{slug}.ext

Nome do arquivo = slug do equipamento (ex.: betoneira.jpg, plataforma-tesoura-12m.webp).
O script normaliza nomes (minúsculas, sem acento, espaços -> hífen) e avisa se o slug não existe no catálogo.

Uso:
  python docs/scripts/sync-equipment-photos.py
  python docs/scripts/sync-equipment-photos.py --dry-run
  python docs/scripts/sync-equipment-photos.py --list-missing
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INCOMING = ROOT / "public" / "equipamentos" / "_incoming"
OUT_DIR = ROOT / "public" / "equipamentos"
CATALOG = ROOT / "src" / "data" / "equipamentos.json"
MANIFEST = ROOT / "src" / "data" / "equipment-image-manifest.json"
ALLOWED = {".webp", ".jpg", ".jpeg", ".png"}
EXT_PRIORITY = [".webp", ".jpg", ".jpeg", ".png"]


def slugify(name: str) -> str:
    text = unicodedata.normalize("NFKD", name)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def load_slugs() -> set[str]:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    return {item["slug"] for item in data if item.get("slug")}


def write_manifest() -> int:
    """Scan public/equipamentos and write src/data/equipment-image-manifest.json."""
    manifest: dict[str, str] = {}
    rank: dict[str, int] = {}

    if OUT_DIR.exists():
        for path in OUT_DIR.iterdir():
            if not path.is_file() or path.name.startswith("_") or path.name.startswith("."):
                continue
            ext = path.suffix.lower()
            if ext not in ALLOWED:
                continue
            slug = path.stem
            ext_index = EXT_PRIORITY.index(ext)
            prev = rank.get(slug)
            if prev is None or ext_index < prev:
                manifest[slug] = f"/equipamentos/{path.name}"
                rank[slug] = ext_index

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(
        json.dumps(dict(sorted(manifest.items())), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Manifest atualizado: {len(manifest)} imagens -> {MANIFEST.relative_to(ROOT)}")
    return len(manifest)


def sync(dry_run: bool) -> None:
    if not INCOMING.exists():
        INCOMING.mkdir(parents=True, exist_ok=True)
        print(f"Pasta criada: {INCOMING}")
        print("Coloque as fotos lá e rode o script de novo.")
        return

    slugs = load_slugs()
    copied = 0
    skipped = 0
    unknown: list[str] = []

    for path in sorted(INCOMING.iterdir()):
        if not path.is_file() or path.name.startswith("."):
            continue
        ext = path.suffix.lower()
        if ext not in ALLOWED:
            print(f"  ignorado (formato): {path.name}")
            skipped += 1
            continue

        slug = slugify(path.stem)
        if slug not in slugs:
            unknown.append(path.name)
            continue

        dest = OUT_DIR / f"{slug}{ext}"
        if dry_run:
            print(f"  [dry-run] {path.name} -> equipamentos/{slug}{ext}")
        else:
            shutil.copy2(path, dest)
            print(f"  ok: {path.name} -> equipamentos/{slug}{ext}")
        copied += 1

    print()
    print(f"Processados: {copied} | Ignorados: {skipped} | Slug desconhecido: {len(unknown)}")
    if unknown:
        print("\nArquivos sem slug no catálogo (renomeie ou ajuste o inventário):")
        for name in unknown:
            print(f"  - {name}  (tentativa: {slugify(Path(name).stem)})")


def list_missing() -> None:
    slugs = load_slugs()
    with_photo = set()
    if OUT_DIR.exists():
        for path in OUT_DIR.iterdir():
            if path.is_file() and not path.name.startswith("_"):
                ext = path.suffix.lower()
                if ext in ALLOWED:
                    with_photo.add(path.stem)

    missing = sorted(slugs - with_photo)
    featured = json.loads(CATALOG.read_text(encoding="utf-8"))
    featured_slugs = [e["slug"] for e in featured if e.get("featured")]

    print(f"Com foto: {len(with_photo)} / {len(slugs)}")
    print(f"Sem foto: {len(missing)}")
    print("\nDestaques na home ainda sem foto:")
    for slug in featured_slugs:
        if slug in missing:
            print(f"  - {slug}")
    print("\nPróximos 20 sem foto (ordem alfabética):")
    for slug in missing[:20]:
        print(f"  - {slug}")
    if len(missing) > 20:
        print(f"  ... e mais {len(missing) - 20}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Sincroniza fotos da frota com o catálogo")
    parser.add_argument("--dry-run", action="store_true", help="Só mostra o que faria")
    parser.add_argument(
        "--list-missing",
        action="store_true",
        help="Lista slugs sem foto em public/equipamentos/",
    )
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if args.list_missing:
        write_manifest()
        list_missing()
        return

    sync(dry_run=args.dry_run)
    if not args.dry_run:
        write_manifest()


if __name__ == "__main__":
    main()

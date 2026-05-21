"""
Recorta a faixa de logos do site legado (Design-sem-nome-31) em 6 WebPs.

Uso (na raiz do projeto, com Pillow instalado):
  curl -sL -o public/clientes/_legacy-strip-source.png \\
    https://acessoequipamentos.com.br/wp-content/uploads/2023/06/Design-sem-nome-31.png
  python docs/scripts/split-client-logos.py

Layout assumido: grade 3 colunas x 2 linhas (6 células), alinhada aos slugs em client-logos.ts.
Revise visualmente os recortes; ajuste o layout no script se a faixa mudar.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / 'public' / 'clientes'
SOURCE = OUT_DIR / '_legacy-strip-source.png'

LAYOUT: list[tuple[str, int, int]] = [
    ('mineracao-siderurgia', 0, 0),
    ('construtoras-empreiteiras', 1, 0),
    ('industria-manufatura', 2, 0),
    ('shoppings-centros-comerciais', 0, 1),
    ('galpoes-logisticos', 1, 1),
    ('infraestrutura-energia', 2, 1),
]


def main() -> None:
    im = Image.open(SOURCE).convert('RGBA')
    width, height = im.size
    cols, rows = 3, 2
    cell_w, cell_h = width // cols, height // rows

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for slug, col, row in LAYOUT:
        x0 = col * cell_w
        y0 = row * cell_h
        x1 = width if col == cols - 1 else (col + 1) * cell_w
        y1 = height if row == rows - 1 else (row + 1) * cell_h
        crop = im.crop((x0, y0, x1, y1))
        bbox = crop.getbbox()
        if bbox:
            crop = crop.crop(bbox)
        pad = 12
        canvas = Image.new('RGBA', (crop.width + pad * 2, crop.height + pad * 2), (0, 0, 0, 0))
        canvas.paste(crop, (pad, pad), crop)
        target = OUT_DIR / f'{slug}.webp'
        canvas.save(target, 'WEBP', quality=90)
        print(f'wrote {target.relative_to(ROOT)} ({canvas.width}x{canvas.height})')


if __name__ == '__main__':
    main()

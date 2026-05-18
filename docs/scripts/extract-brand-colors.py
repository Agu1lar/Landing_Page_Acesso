"""Extract colors and logo URLs from acessoequipamentos.com.br (one-off)."""
import re
import urllib.request
from collections import Counter

URLS = [
    "https://acessoequipamentos.com.br",
    "https://www.acessoequipamentos.com.br",
]
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def main() -> None:
    html = ""
    base = URLS[0]
    for url in URLS:
        try:
            html = fetch(url)
            base = url.rstrip("/")
            break
        except Exception as e:
            print(f"skip {url}: {e}")
    if not html:
        raise SystemExit("Could not fetch site")
    css_urls = re.findall(r'href=["\']([^"\']+\.css[^"\']*)["\']', html)
    print("=== Stylesheets ===")
    for u in css_urls[:10]:
        print(u if u.startswith("http") else f"{base}/{u.lstrip('/')}")

    all_hex: Counter[str] = Counter()
    for css_url in css_urls[:5]:
        full = css_url if css_url.startswith("http") else f"{base}/{css_url.lstrip('/')}"
        try:
            css = fetch(full)
            for h in re.findall(r"#[0-9a-fA-F]{6}\b", css):
                all_hex[h.lower()] += 1
        except Exception as e:
            print(f"skip {full}: {e}")

    for h in re.findall(r"#[0-9a-fA-F]{6}\b", html):
        all_hex[h.lower()] += 1

    print("\n=== Top hex colors ===")
    for color, count in all_hex.most_common(25):
        print(f"{color}  ({count})")

    print("\n=== Logo candidates ===")
    for src in re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.I):
        if any(k in src.lower() for k in ("logo", "acesso", "brand", "header")):
            print(src)


if __name__ == "__main__":
    main()

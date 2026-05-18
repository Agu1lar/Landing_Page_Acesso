import pathlib

for p in pathlib.Path("src").rglob("*.tsx"):
    t = p.read_text(encoding="utf-8")
    if "setRequestLocale(locale)" not in t or "resolveAppLocale" in t:
        continue
    old = "import { setRequestLocale } from 'next-intl/server';"
    new = old + "\nimport { resolveAppLocale } from '@/utils/locale';"
    if old in t:
        t = t.replace(old, new, 1)
    t = t.replace("setRequestLocale(locale)", "setRequestLocale(resolveAppLocale(locale))")
    p.write_text(t, encoding="utf-8")
    print(p)

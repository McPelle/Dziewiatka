#!/usr/bin/env python3
"""Poprawia jakość herbów w assets/herby (in place).

Użycie: python3 -I popraw-herby.py <katalog_gry> <tm_herby.json> <katalog_herbow_TM>

1) Kluby z herbem z Transfermarktu (przezroczyste PNG, czyste krawędzie): przycięcie, wyśrodkowanie, 128×128.
2) Pozostałe (nadesłane herby regionalne / regiowyniki, ~55–100 px):
   - białe elementy WEWNĄTRZ herbu, wycięte razem z tłem, wracają (tło = tylko to, co styka się z krawędzią),
   - wygładzona krawędź (anti-aliasing) i usunięta biała obwódka po starym tle,
   - powiększenie Lanczos do 128 px + lekkie wyostrzenie, kontrast i nasycenie.
Wynik: pełne kolory RGBA (bez redukcji palety), 128 px.
"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROZ = 128


def zapisz(img: Image.Image, p: str):
    """Paleta 256 kolorów z przezroczystością (wizualnie bez straty, ~4× mniej niż pełny RGBA)."""
    q = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    q.save(p, optimize=True)


def kanwa(img: Image.Image, roz: int = 0) -> Image.Image:
    """Przycina przezroczyste marginesy i wyśrodkowuje na kwadracie ROZ×ROZ (z 4 px oddechu)."""
    bbox = img.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if bbox:
        img = img.crop(bbox)
    R = roz or ROZ
    w, h = img.size
    s = (R - 6) / max(w, h)
    img = img.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    out = Image.new("RGBA", (R, R), (0, 0, 0, 0))
    out.paste(img, ((R - img.width) // 2, (R - img.height) // 2), img)
    return out


def tlo_od_krawedzi(przezr: np.ndarray) -> np.ndarray:
    """Maska przezroczystych pikseli połączonych z krawędzią obrazu (prawdziwe tło)."""
    tlo = np.zeros_like(przezr)
    tlo[0, :] = przezr[0, :]; tlo[-1, :] = przezr[-1, :]; tlo[:, 0] = przezr[:, 0]; tlo[:, -1] = przezr[:, -1]
    while True:
        r = tlo.copy()
        r[1:, :] |= tlo[:-1, :]; r[:-1, :] |= tlo[1:, :]; r[:, 1:] |= tlo[:, :-1]; r[:, :-1] |= tlo[:, 1:]
        r &= przezr
        if (r == tlo).all():
            return tlo
        tlo = r


def popraw_regionalny(img: Image.Image) -> Image.Image:
    a = np.asarray(img).astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    przezr = al < 128
    tlo = tlo_od_krawedzi(przezr)
    dziury = przezr & ~tlo
    # Dziury wewnątrz herbu: większe niż pojedynczy piksel = wycięta biel → przywróć białe, nieprzezroczyste.
    if dziury.sum() > 3:
        rgb[dziury] = 255.0
        al[dziury] = 255.0
    # Obwódka po białym tle: piksele półprzezroczyste / przy tle — „odbielenie" (unpremultiply względem bieli).
    a01 = np.clip(al / 255.0, 0, 1)[..., None]
    bliskie = (a01[..., 0] > 0.05) & (a01[..., 0] < 0.98)
    if bliskie.any():
        c = (rgb - (1 - a01) * 255.0) / np.maximum(a01, 0.05)
        rgb = np.where(bliskie[..., None], np.clip(c, 0, 255), rgb)
    # Jasne piksele brzegowe (1 px od tła) — zwykle resztki tła: lekko przyciemnij alfę, by krawędź nie świeciła.
    brzeg = np.zeros_like(tlo)
    brzeg[1:, :] |= tlo[:-1, :]; brzeg[:-1, :] |= tlo[1:, :]; brzeg[:, 1:] |= tlo[:, :-1]; brzeg[:, :-1] |= tlo[:, 1:]
    brzeg &= ~tlo
    jasne = brzeg & (rgb.min(axis=2) > 225)
    al[jasne] *= 0.35
    al[tlo] = 0
    rgb[tlo] = 0
    img = Image.fromarray(np.dstack([rgb, al]).clip(0, 255).astype(np.uint8), "RGBA")
    # Powiększenie z premultiplikacją (bez ciemnych/jasnych obwódek), potem wygładzona alfa.
    w, h = img.size
    R = min(112, max(96, 2 * max(w, h)))
    s = (R - 6) / max(w, h)
    big = (max(1, round(w * s)), max(1, round(h * s)))
    pre = np.asarray(img).astype(np.float32)
    pa = pre[..., 3:4] / 255.0
    prem = Image.fromarray(np.dstack([pre[..., :3] * pa, pre[..., 3]]).astype(np.uint8), "RGBA").resize(big, Image.LANCZOS)
    p2 = np.asarray(prem).astype(np.float32)
    a2 = p2[..., 3:4] / 255.0
    rgb2 = np.where(a2 > 0.01, p2[..., :3] / np.maximum(a2, 0.01), 0)
    alpha = Image.fromarray(p2[..., 3].astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.6))
    # krzywa alfy: pewne wnętrze, miękkie 1–2 px krawędzi
    alpha = alpha.point(lambda v: 0 if v < 40 else 255 if v > 200 else int((v - 40) * 255 / 160))
    kolor = Image.fromarray(rgb2.clip(0, 255).astype(np.uint8), "RGB")
    kolor = kolor.filter(ImageFilter.UnsharpMask(radius=1.1, percent=70, threshold=2))
    kolor = ImageEnhance.Contrast(kolor).enhance(1.07)
    kolor = ImageEnhance.Color(kolor).enhance(1.1)
    out = kolor.convert("RGBA"); out.putalpha(alpha)
    return kanwa(out, R)


def main():
    gra, tm_json, tm_kat = sys.argv[1:4]
    herby_ts = open(os.path.join(gra, "src/data/herby.ts"), encoding="utf-8").read()
    sciezki = dict(re.findall(r'^\s*"([^"]+)": require\("\.\./\.\./(assets/herby/[^"]+)"\)', herby_ts, re.M))
    tm = json.load(open(tm_json, encoding="utf-8"))  # nazwa → [tmId, kluczHerbu]
    z_tm = {}
    for nazwa, (tid, klucz) in tm.items():
        z_tm[klucz] = os.path.join(tm_kat, f"{tid}.png")
    n_tm = n_reg = 0
    for klucz, rel in sciezki.items():
        p = os.path.join(gra, rel)
        if not os.path.exists(p):
            continue
        if klucz in z_tm and os.path.exists(z_tm[klucz]):
            zapisz(kanwa(Image.open(z_tm[klucz]).convert("RGBA")), p)
            n_tm += 1
        else:
            zapisz(popraw_regionalny(Image.open(p).convert("RGBA")), p)
            n_reg += 1
    print(f"herby z Transfermarktu: {n_tm}, poprawione pozostałe: {n_reg}")


if __name__ == "__main__":
    main()

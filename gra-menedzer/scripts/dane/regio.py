#!/usr/bin/env python3
"""Pobiera z regiowyniki.pl składy (oryginalne nazwy + herby) dla całej Małopolski
i generuje src/data/malopolska.ts + src/data/herby.ts + assets/herby/*.jpg.

Użycie:
  python3 regio.py fetch   — pobiera strony grup i herby (wolno) do scratchpad
  python3 regio.py build   — z pobranych stron generuje pliki gry
"""
import glob, json, os, re, sys, time, html, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # .../gra-menedzer
CACHE = os.environ.get("REGIO_CACHE", "/tmp/claude-0/-home-user-system-sprzedawcy/4d7b5bfc-5a10-5112-9990-70eeb7de9658/scratchpad/regio/cache")
HERBY_DIR = os.path.join(ROOT, "assets", "herby")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36"
BASE = "https://regiowyniki.pl/kalendarz/Pilka_Nozna/2026/2027"
SEZON = "2026/2027"

# Wspólna góra piramidy (te same dla wszystkich regionów).
GORA = [
    ("Ekstraklasa",        "Polska/Ekstraklasa"),
    ("I liga",             "Polska/1_Liga"),
    ("II liga",            "Polska/2_Liga"),
    ("III liga, gr. IV",   "Polska/3_Liga/grupa_IV"),
    ("IV liga małopolska", "Malopolskie/4_Liga/malopolska"),
]

# Regiony = 8 grup okręgowych Małopolski. Każdy: V liga (zach/wsch) + okręgówka + klasa A + klasa B.
# (nazwa_poziomu, ścieżka_regiowyniki)
REGIONY = [
    ("krakow-i", "Małopolska — Kraków I", [
        ("V liga (zachód)", "Malopolskie/5_Liga/malopolska_zachod"),
        ("Klasa okręgowa (Kraków I)", "Malopolskie/Liga_okregowa/Krakow_I"),
        ("Klasa A (Kraków I)", "Malopolskie/Klasa_A/Krakow_I"),
        ("Klasa B (Kraków I)", "Malopolskie/Klasa_B/Krakow_I"),
    ]),
    ("krakow-ii", "Małopolska — Kraków II", [
        ("V liga (zachód)", "Malopolskie/5_Liga/malopolska_zachod"),
        ("Klasa okręgowa (Kraków II)", "Malopolskie/Liga_okregowa/Krakow_II"),
        ("Klasa A (Kraków II)", "Malopolskie/Klasa_A/Krakow_II"),
        ("Klasa B (Kraków II)", "Malopolskie/Klasa_B/Krakow_II"),
    ]),
    ("krakow-iii-myslenice", "Małopolska — Kraków III / Myślenice", [
        ("V liga (zachód)", "Malopolskie/5_Liga/malopolska_zachod"),
        ("Klasa okręgowa (Kraków III / Myślenice)", "Malopolskie/Liga_okregowa/Krakow_III__Myslenice_"),
        ("Klasa A (Myślenice)", "Malopolskie/Klasa_A/Myslenice"),
        ("Klasa B (Myślenice)", "Malopolskie/Klasa_B/Myslenice"),
    ]),
    ("chrzanow-oswiecim", "Małopolska — Chrzanów / Oświęcim", [
        ("V liga (zachód)", "Malopolskie/5_Liga/malopolska_zachod"),
        ("Klasa okręgowa (Chrzanów)", "Malopolskie/Liga_okregowa/Chrzanow"),
        ("Klasa A (Chrzanów)", "Malopolskie/Klasa_A/Chrzanow"),
        ("Klasa B (Chrzanów)", "Malopolskie/Klasa_B/Chrzanow"),
    ]),
    ("nowy-sacz-gorlice", "Małopolska — Nowy Sącz / Gorlice", [
        ("V liga (wschód)", "Malopolskie/5_Liga/malopolska_wschod"),
        ("Klasa okręgowa (Nowy Sącz-Gorlice)", "Malopolskie/Liga_okregowa/Nowy_Sacz_I__Nowy_Sacz-Gorlice_"),
        ("Klasa A (Nowy Sącz-Gorlice)", "Malopolskie/Klasa_A/Nowy_Sacz-Gorlice"),
        ("Klasa B (Nowy Sącz)", "Malopolskie/Klasa_B/Nowy_Sacz"),
    ]),
    ("limanowa-podhale", "Małopolska — Limanowa / Podhale", [
        ("V liga (wschód)", "Malopolskie/5_Liga/malopolska_wschod"),
        ("Klasa okręgowa (Limanowa-Podhale)", "Malopolskie/Liga_okregowa/Nowy_Sacz_II__Limanowa-Podhale_"),
        ("Klasa A (Limanowa)", "Malopolskie/Klasa_A/Limanowa"),
        ("Klasa B (Limanowa)", "Malopolskie/Klasa_B/Limanowa"),
    ]),
    ("bochnia-brzesko", "Małopolska — Bochnia / Brzesko", [
        ("V liga (wschód)", "Malopolskie/5_Liga/malopolska_wschod"),
        ("Klasa okręgowa (Bochnia-Brzesko)", "Malopolskie/Liga_okregowa/Tarnow_I__Bochnia-Brzesko_"),
        ("Klasa A (Bochnia)", "Malopolskie/Klasa_A/Tarnow_I__Bochnia_"),
        ("Klasa B (Bochnia)", "Malopolskie/Klasa_B/Tarnow_I__Bochnia_"),
    ]),
    ("zabno-tarnow", "Małopolska — Żabno / Tarnów", [
        ("V liga (wschód)", "Malopolskie/5_Liga/malopolska_wschod"),
        ("Klasa okręgowa (Żabno-Tarnów)", "Malopolskie/Liga_okregowa/Tarnow_II__Zabno-Tarnow_"),
        ("Klasa A (Żabno)", "Malopolskie/Klasa_A/Tarnow_III__Zabno_"),
        ("Klasa B (Żabno)", "Malopolskie/Klasa_B/Tarnow_III__Zabno_"),
    ]),
]


def sciezki_wszystkie():
    s = {}
    for nazwa, path in GORA:
        s[path] = nazwa
    for _, _, ligi in REGIONY:
        for nazwa, path in ligi:
            s[path] = nazwa
    return s  # path -> nazwa poziomu


def pobierz(url, plik, binary=False):
    if os.path.exists(plik) and os.path.getsize(plik) > 200:
        return True
    for proba in range(6):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                data = r.read()
            with open(plik, "wb") as f:
                f.write(data)
            time.sleep(1.4)
            return True
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return False
            time.sleep(8)
        except Exception:
            time.sleep(6)
    return False


RX_TEAM = re.compile(r'/druzyna/Pilka_Nozna/[^"]*"[^>]*>\s*<img src="/static/flags/(\d+)\.jpg" alt="([^"]+)"')


def parsuj(plik):
    """Zwraca listę (crestId, nazwa) unikalnych drużyn z tabeli grupy."""
    if not os.path.exists(plik):
        return []
    h = open(plik, encoding="utf-8", errors="replace").read()
    out, widziane = [], set()
    for cid, nazwa in RX_TEAM.findall(h):
        nazwa = html.unescape(re.sub(r"\s+", " ", nazwa)).strip()
        if nazwa and nazwa not in widziane:
            widziane.add(nazwa)
            out.append((cid, nazwa))
    return out


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    os.makedirs(HERBY_DIR, exist_ok=True)
    paths = sciezki_wszystkie()
    crest_ids = set()
    for path in paths:
        plik = os.path.join(CACHE, path.replace("/", "__") + ".html")
        ok = pobierz(f"{BASE}/{path}/", plik)
        teams = parsuj(plik) if ok else []
        for cid, _ in teams:
            crest_ids.add(cid)
        print(f"{'OK' if ok else 'BRAK'} {path}: {len(teams)} drużyn", flush=True)
    print(f"herbów do pobrania: {len(crest_ids)}", flush=True)
    for i, cid in enumerate(sorted(crest_ids), 1):
        plik = os.path.join(HERBY_DIR, f"{cid}.jpg")
        pobierz(f"https://regiowyniki.pl/static/flags/{cid}.jpg", plik, binary=True)
        if i % 50 == 0:
            print(f"  herby {i}/{len(crest_ids)}", flush=True)
    print("fetch gotowe", flush=True)


def miasto(n):
    sl = [w for w in n.split() if w]
    ROMAN = {"I", "II", "III", "IV", "V", "VI"}
    PRZYM2 = {"Małe","Mała","Wielkie","Wielka","Mały","Wielki","Dolne","Dolna","Górne","Górna","Zdrój","Tatrzańska","Podhalański","Rzędzińska","Sącz","Targ","Wola","Nowy","Nowa"}
    PRZED1 = {"Nowy","Nowa","Nowe","Biała","Stara","Stare","Góra","Zielona"}
    while len(sl) > 1 and (sl[-1] in ROMAN or sl[-1].isdigit() or sl[-1].lower() in ("rezerwy", "b")):
        sl = sl[:-1]
    if len(sl) >= 2 and sl[-1] in PRZYM2:
        return sl[-2] + " " + sl[-1]
    if len(sl) >= 2 and sl[-2] in PRZED1:
        return sl[-2] + " " + sl[-1]
    return sl[-1] if sl else n


def skrot(n):
    sl = [w for w in re.sub(r"[^\w ]", "", n, flags=re.U).split() if w]
    s = "".join(w[0] for w in sl).upper()
    return s[:3] if len(s) >= 2 else n[:3].upper()


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


_BEZ_OGONKOW = str.maketrans("ąćęłńóśźżĄĆĘŁŃÓŚŹŻ", "acelnoszzACELNOSZZ")


def norm(nazwa):
    return re.sub(r"\s+", " ", nazwa.translate(_BEZ_OGONKOW).lower()).strip()


# Globalna mapa „nazwa klubu → id herbu" (tylko kluby z herbem) — do podstawienia rezerwom.
_GLOBAL_CREST = {}


def zbuduj_global_crest():
    _GLOBAL_CREST.clear()
    for f in glob.glob(os.path.join(CACHE, "*.html")):
        h = open(f, encoding="utf-8", errors="replace").read()
        for cid, nz in parsuj_surowo(h):
            if cid != "0" and os.path.exists(os.path.join(HERBY_DIR, f"{cid}.png")):
                _GLOBAL_CREST.setdefault(norm(nz), cid)


RX_SUROWY = re.compile(r'/druzyna/Pilka_Nozna/[^"]*"[^>]*>\s*<img src="/static/flags/(\d+)\.jpg" alt="([^"]+)"')


def parsuj_surowo(h):
    out = []
    for cid, nazwa in RX_SUROWY.findall(h):
        out.append((cid, html.unescape(re.sub(r"\s+", " ", nazwa)).strip()))
    return out


def herb_rezerwy(nazwa):
    """Dla rezerwy (nazwa z 'II'/'III') zwraca id herbu pierwszego zespołu, albo None."""
    tokeny = nazwa.split()
    if not any(t in ("II", "III", "IV") for t in tokeny):
        return None
    glowny = " ".join(t for t in tokeny if t not in ("II", "III", "IV"))
    return _GLOBAL_CREST.get(norm(glowny))


def liga_ts(nazwa, path, ind):
    teams = parsuj(os.path.join(CACHE, path.replace("/", "__") + ".html"))
    L = [f'{{ nazwa: "{esc(nazwa)}", kluby: [']
    for cid, nz in teams:
        herb = cid if cid != "0" and os.path.exists(os.path.join(HERBY_DIR, f"{cid}.png")) else None
        if not herb:
            herb = herb_rezerwy(nz)  # rezerwa → herb pierwszego zespołu
        h = f', herb: "{herb}"' if herb else ""
        L.append(f'  {{ nazwa: "{esc(nz)}", skrot: "{esc(skrot(nz))}", miasto: "{esc(miasto(nz))}"{h} }},')
    L.append("] }")
    pad = "  " * ind
    return pad + ("\n" + pad).join(L)


def build():
    zbuduj_global_crest()
    out = [
        "// WYGENEROWANE z regiowyniki.pl, sezon 2026/2027 — oryginalne nazwy i herby klubów.",
        "// Dane faktograficzne (nazwy). Herby = pliki w assets/herby (znaki klubów; użytek prywatny).",
        'import type { Sciezka } from "./kluby";',
        "",
        "const GORA = [",
    ]
    for nazwa, path in GORA:
        out.append(liga_ts(nazwa, path, 1) + ",")
    out.append("];")
    out.append("")
    out.append("export const MALOPOLSKA_REGIONY: Sciezka[] = [")
    for rid, nz, ligi in REGIONY:
        out.append(f'  {{ id: "{esc(rid)}", nazwa: "{esc(nz)}", ligi: [')
        out.append("    ...GORA,")
        for nazwa, path in ligi:
            out.append(liga_ts(nazwa, path, 2) + ",")
        out.append("  ] },")
    out.append("];")
    out.append("")
    out.append("export const MALOPOLSKA = MALOPOLSKA_REGIONY[0];")
    open(os.path.join(ROOT, "src", "data", "malopolska.ts"), "w").write("\n".join(out) + "\n")

    # herby.ts — statyczne require() dla każdego pobranego herbu
    ids = sorted(int(f[:-4]) for f in os.listdir(HERBY_DIR) if f.endswith(".png"))
    hl = [
        "// WYGENEROWANE — mapowanie id herbu → plik. Herby z regiowyniki.pl (użytek prywatny).",
        'import type { ImageSourcePropType } from "react-native";',
        "",
        "export const HERBY: Record<string, ImageSourcePropType> = {",
    ]
    for i in ids:
        if i == 0:
            continue
        hl.append(f'  "{i}": require("../../assets/herby/{i}.png"),')
    hl.append("};")
    open(os.path.join(ROOT, "src", "data", "herby.ts"), "w").write("\n".join(hl) + "\n")
    print(f"zapisano malopolska.ts ({len(REGIONY)} regionów) i herby.ts ({len(ids)} herbów)")


if __name__ == "__main__":
    tryb = sys.argv[1] if len(sys.argv) > 1 else "fetch"
    if tryb == "fetch":
        fetch()
    elif tryb == "build":
        build()
    elif tryb == "test":
        for p, nz in sciezki_wszystkie().items():
            t = parsuj(os.path.join(CACHE, p.replace("/", "__") + ".html"))
            print(f"{p}: {len(t)}")

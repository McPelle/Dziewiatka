#!/usr/bin/env python3
"""Wsadowe pobieranie danych klubów z Wikipedii (pl) — Action API, po 50 tytułów na raz.
Zapisuje assets/stadiony.json. Tylko realne dane z artykułu; brak artykułu = pomijany."""
import json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KLUBY = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/-home-user-system-sprzedawcy/4d7b5bfc-5a10-5112-9990-70eeb7de9658/scratchpad/stad/kluby.txt"
UA = "gra-menedzer/0.1 (prywatny projekt)"
API = "https://pl.wikipedia.org/w/api.php"


def zapytanie(tytuly):
    params = {
        "action": "query", "prop": "revisions", "rvprop": "content", "rvslots": "main",
        "titles": "|".join(tytuly), "format": "json", "formatversion": "2", "redirects": "1",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    for _ in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40) as r:
                time.sleep(2.5)
                time.sleep(4)
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(45); continue
            time.sleep(8)
        except Exception:
            time.sleep(6)
    return None


def pole(t, *nazwy):
    for n in nazwy:
        m = re.search(r"\|\s*" + n + r"\s*=\s*([^\n|}]+)", t, re.I)
        if m:
            v = re.sub(r"\[\[([^\]|]*\|)?|\]\]|<[^>]+>|'''|\{\{[^}]*\}\}|&nbsp;", " ", m.group(1))
            v = re.sub(r"\s+", " ", v).strip(" ,")
            if v and v.lower() not in ("brak", "nieznana", "-", "n/d"):
                return v
    return None


def dane_z_tekstu(t):
    if not re.search(r"infobox", t, re.I) or not re.search(r"pi[łl]k", t, re.I):
        return None
    d = {}
    s = pole(t, "stadion", "obiekt", "stadion domowy")
    pj = pole(t, "pojemność", "pojemnosc")
    a = pole(t, "adres")
    pn = pole(t, "pełna nazwa", "pelna nazwa")
    rok = pole(t, "rok założenia", "założony", "data założenia")
    if s: d["stadion"] = s
    if pj:
        c = re.sub(r"[^\d]", "", pj.split("(")[0])
        if c.isdigit() and 50 <= int(c) <= 120000: d["pojemnosc"] = int(c)
    if a: d["adres"] = re.sub(r"(\d)(\d{2}-\d{3})", r"\1, \2", a)
    if pn: d["pelna"] = pn
    if rok:
        mr = re.search(r"\d{4}", rok)
        if mr: d["rok"] = int(mr.group(0))
    return d or None


def main():
    nazwy = [l.strip() for l in open(KLUBY, encoding="utf-8") if l.strip()]
    out_path = os.path.join(ROOT, "assets", "stadiony.json")
    wynik = {}
    # mapowanie znormalizowanego tytułu -> oryginalna nazwa klubu (po redirectach)
    norm = {n.replace("_", " "): n for n in nazwy}
    for i in range(0, len(nazwy), 50):
        partia = nazwy[i:i + 50]
        d = zapytanie(partia)
        if not d:
            continue
        # redirecty: mapuj 'to' z powrotem na zapytaną nazwę
        redir = {r["to"]: r["from"] for r in d.get("query", {}).get("redirects", [])}
        for strona in d.get("query", {}).get("pages", []):
            if strona.get("missing"):
                continue
            tytul = strona.get("title", "")
            zapytany = redir.get(tytul, tytul)
            orig = norm.get(zapytany) or norm.get(tytul)
            if not orig:
                continue
            try:
                tekst = strona["revisions"][0]["slots"]["main"]["content"]
            except Exception:
                continue
            dd = dane_z_tekstu(tekst)
            if dd:
                wynik[orig] = dd
        print(f"  {min(i+50,len(nazwy))}/{len(nazwy)} — z danymi: {len(wynik)}", flush=True)
        json.dump(wynik, open(out_path, "w", encoding="utf-8"), ensure_ascii=False)
    stad = sum(1 for v in wynik.values() if "stadion" in v)
    poj = sum(1 for v in wynik.values() if "pojemnosc" in v)
    adr = sum(1 for v in wynik.values() if "adres" in v)
    print(f"gotowe: {len(wynik)} klubów (stadion {stad}, pojemność {poj}, adres {adr})", flush=True)


if __name__ == "__main__":
    main()

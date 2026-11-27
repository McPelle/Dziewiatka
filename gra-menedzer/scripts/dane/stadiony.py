#!/usr/bin/env python3
"""Pobiera z Wikipedii (pl) prawdziwe dane klubów: stadion, pojemność, adres, pełna nazwa, rok założenia.
Zapisuje assets/stadiony.json { "Nazwa klubu": {stadion?, pojemnosc?, adres?, pelna?, rok?} }.
Tylko to, co jest w artykule — bez zmyślania. Kluby bez artykułu pomija (gra generuje domyślne)."""
import json, os, re, sys, time, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KLUBY = sys.argv[1] if len(sys.argv) > 1 else "/tmp/claude-0/-home-user-system-sprzedawcy/4d7b5bfc-5a10-5112-9990-70eeb7de9658/scratchpad/stad/kluby.txt"
UA = "gra-menedzer/0.1 (prywatny projekt; powolne pobieranie)"


def pobierz(tytul):
    enc = urllib.parse.quote(tytul.replace(" ", "_"), safe="")
    url = f"https://pl.wikipedia.org/w/rest.php/v1/page/{enc}"
    for _ in range(8):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r:
                time.sleep(1.6)
                return json.load(r).get("source", "")
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(12)
        except Exception:
            time.sleep(8)
    return None


def pole(t, *nazwy):
    for n in nazwy:
        m = re.search(r"\|\s*" + n + r"\s*=\s*([^\n|}]+)", t, re.I)
        if m:
            v = re.sub(r"\[\[([^\]|]*\|)?|\]\]|<[^>]+>|'''|\{\{[^}]*\}\}", "", m.group(1)).strip()
            v = re.sub(r"\s+", " ", v).strip(" ,")
            if v and v.lower() not in ("brak", "nieznana", "-"):
                return v
    return None


def pojemnosc(t):
    v = pole(t, "pojemność", "pojemnosc")
    if not v:
        return None
    cyfry = re.sub(r"[^\d]", "", v.split("(")[0])
    return int(cyfry) if cyfry.isdigit() and 50 <= int(cyfry) <= 120000 else None


def czyKlubPilkarski(t):
    return bool(re.search(r"infobox", t, re.I)) and bool(re.search(r"pi[łl]k[aię]", t, re.I))


def dane(tytul):
    for kand in (tytul, f"{tytul} (piłka nożna)", f"{tytul} (klub piłkarski)"):
        t = pobierz(kand)
        if not t:
            continue
        if not czyKlubPilkarski(t):
            continue
        d = {}
        s = pole(t, "stadion", "obiekt", "stadion domowy")
        p = pojemnosc(t)
        a = pole(t, "adres")
        pn = pole(t, "pełna nazwa", "pelna nazwa")
        rok = pole(t, "rok założenia", "założony", "data założenia")
        if s: d["stadion"] = s
        if p: d["pojemnosc"] = p
        if a: d["adres"] = a
        if pn: d["pelna"] = pn
        if rok:
            mr = re.search(r"\d{4}", rok)
            if mr: d["rok"] = int(mr.group(0))
        if d:
            return d
    return None


def main():
    nazwy = [l.strip() for l in open(KLUBY, encoding="utf-8") if l.strip()]
    out_path = os.path.join(ROOT, "assets", "stadiony.json")
    wynik = json.load(open(out_path, encoding="utf-8")) if os.path.exists(out_path) else {}
    print(f"klubów: {len(nazwy)}, już mam: {len(wynik)}", flush=True)
    for i, n in enumerate(nazwy, 1):
        if n in wynik:
            continue
        d = dane(n)
        if d:
            wynik[n] = d
        if i % 25 == 0:
            json.dump(wynik, open(out_path, "w", encoding="utf-8"), ensure_ascii=False)
            print(f"  {i}/{len(nazwy)} — z danymi: {len(wynik)}", flush=True)
    json.dump(wynik, open(out_path, "w", encoding="utf-8"), ensure_ascii=False)
    stad = sum(1 for v in wynik.values() if "stadion" in v)
    poj = sum(1 for v in wynik.values() if "pojemnosc" in v)
    print(f"gotowe: {len(wynik)} klubów z danymi (stadion: {stad}, pojemność: {poj}) → assets/stadiony.json", flush=True)


if __name__ == "__main__":
    main()

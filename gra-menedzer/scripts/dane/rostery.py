#!/usr/bin/env python3
"""Pobiera prawdziwe składy (nazwiska) klubów z regiowyniki.pl (podstrona /kadra/)
i zapisuje assets/rostery.json: { "<idHerbu>": [["Imię","Nazwisko"], ...] }.
Nazwiska zawodników amatorskich — użytek PRYWATNY (RODO). Czyta strony grup z REGIO_CACHE."""
import glob, html, json, os, re, sys, time, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = os.environ.get("REGIO_CACHE", "/tmp/claude-0/-home-user-system-sprzedawcy/4d7b5bfc-5a10-5112-9990-70eeb7de9658/scratchpad/regio/cache")
KADRA_CACHE = os.path.join(CACHE, "kadra")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36"

# (ścieżka /druzyna/.../, idHerbu) z tabel grup
RX_KLUB = re.compile(r'href="(/druzyna/Pilka_Nozna/[^"]*?/)"\s*>\s*<img src="/static/flags/(\d+)\.jpg"')


def kluby_z_cache():
    """Zwraca { idHerbu: druzynaPath } ze wszystkich zapisanych stron grup."""
    out = {}
    for f in glob.glob(os.path.join(CACHE, "*.html")):
        h = open(f, encoding="utf-8", errors="replace").read()
        for path, cid in RX_KLUB.findall(h):
            if cid != "0":
                out.setdefault(cid, path)
    return out


def pobierz(url, plik):
    if os.path.exists(plik) and os.path.getsize(plik) > 500:
        return open(plik, encoding="utf-8", errors="replace").read()
    for _ in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40) as r:
                data = r.read().decode("utf-8", "replace")
            open(plik, "w", encoding="utf-8").write(data)
            time.sleep(1.3)
            return data
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return ""
            time.sleep(7)
        except Exception:
            time.sleep(6)
    return ""


def parsuj_kadre(h):
    """Lista [imie, nazwisko] z tabeli playerstable (format 'Nazwisko Imię')."""
    i = h.find('id="playerstable"')
    if i < 0:
        return []
    seg = h[i:i + 12000]
    out = []
    for row in re.findall(r"<tr[^>]*>(.*?)</tr>", seg, re.S):
        cell = re.search(r"<td[^>]*>(.*?)</td>", row, re.S)
        if not cell:
            continue
        nazwa = html.unescape(re.sub(r"<[^>]+>", " ", cell.group(1)))
        nazwa = re.sub(r"\s+", " ", nazwa).strip()
        if not nazwa or len(nazwa) > 40 or not re.search(r"[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]", nazwa):
            continue
        slowa = nazwa.split()
        if len(slowa) < 2:
            continue
        imie = slowa[-1]          # regiowyniki: "Nazwisko Imię"
        nazwisko = " ".join(slowa[:-1])
        out.append([imie, nazwisko])
        if len(out) >= 24:
            break
    return out


def main():
    os.makedirs(KADRA_CACHE, exist_ok=True)
    kluby = kluby_z_cache()
    print(f"klubów do pobrania kadr: {len(kluby)}", flush=True)
    rostery = {}
    for i, (cid, path) in enumerate(sorted(kluby.items()), 1):
        plik = os.path.join(KADRA_CACHE, f"{cid}.html")
        h = pobierz(f"https://regiowyniki.pl{path}kadra/", plik)
        gracze = parsuj_kadre(h) if h else []
        if gracze:
            rostery[cid] = gracze
        if i % 40 == 0:
            print(f"  {i}/{len(kluby)} (z kadrą: {len(rostery)})", flush=True)
    out = os.path.join(ROOT, "assets", "rostery.json")
    json.dump(rostery, open(out, "w", encoding="utf-8"), ensure_ascii=False)
    ile = sum(len(v) for v in rostery.values())
    print(f"gotowe: {len(rostery)} klubów, {ile} zawodników → assets/rostery.json", flush=True)


if __name__ == "__main__":
    main()

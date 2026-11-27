"""Powolny klient Wikipedii (pl): wyszukiwanie i pobieranie wikitekstu. Przerwy między zapytaniami, ponawianie przy 429.
Użycie: python3 wiki.py szukaj "fraza" [...]  |  python3 wiki.py pobierz KATALOG "Tytuł" [...]"""
import json, os, sys, time, urllib.parse, urllib.request

API = "https://pl.wikipedia.org/w/api.php"
UA = "gra-menedzer/0.1 (prywatny projekt; powolne pobieranie)"

def get(params):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json", "formatversion": "2"})
    for proba in range(12):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r:
                time.sleep(2.5)
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(30)
                continue
            raise
        except Exception:
            time.sleep(10)
    raise RuntimeError("Wikipedia nie odpowiada: " + url)

def szukaj(fraza, ile=30):
    d = get({"action": "query", "list": "search", "srsearch": fraza, "srlimit": ile})
    return [r["title"] for r in d["query"]["search"]]

def pobierz(tytul):
    d = get({"action": "query", "prop": "revisions", "rvprop": "content", "rvslots": "main", "titles": tytul, "redirects": 1})
    strona = d["query"]["pages"][0]
    if "missing" in strona:
        return None
    return strona["revisions"][0]["slots"]["main"]["content"]

if __name__ == "__main__":
    tryb = sys.argv[1]
    if tryb == "szukaj":
        for f in sys.argv[2:]:
            print("==", f)
            for t in szukaj(f):
                print("  ", t)
            sys.stdout.flush()
    else:
        kat = sys.argv[2]
        os.makedirs(kat, exist_ok=True)
        for t in sys.argv[3:]:
            tekst = pobierz(t)
            plik = os.path.join(kat, t.replace("/", "_") + ".wiki")
            if tekst is None:
                print("BRAK:", t)
            else:
                open(plik, "w").write(tekst)
                print("OK:", t, len(tekst))
            sys.stdout.flush()

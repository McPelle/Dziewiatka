# Czyta strony wiki (JSON z REST) i wyciąga listy drużyn sezonu 2026/2027 per poziom.
import json, os, re, sys

KAT = sys.argv[1]  # katalog z plikami .json

def zrodlo(nazwa):
    p = os.path.join(KAT, nazwa.replace("/", "_") + ".json")
    return json.load(open(p))["source"] if os.path.exists(p) else None

def sekcja(t, naglowek):
    """Zwraca tekst od danego nagłówka do następnego nagłówka tego samego lub wyższego poziomu."""
    m = re.search(r'^(=+)\s*' + re.escape(naglowek) + r'[^\n]*=+\s*$', t, re.M)
    if not m:
        return ""
    poziom = len(m.group(1))
    start = m.end()
    for n in re.finditer(r'^(=+)[^\n]+=+\s*$', t[start:], re.M):
        if len(n.group(1)) <= poziom:
            return t[start:start + n.start()]
    return t[start:]

def uczestnicy(seg):
    """Lista drużyn z szablonu 'Fb uczestnicy drużyna |t=...'."""
    out = []
    for m in re.finditer(r'Fb uczestnicy drużyna([^}]*)', seg):
        mt = re.search(r'\|\s*t\s*=\s*([^|}\n]+)', m.group(1))
        if mt:
            out.append(mt.group(1).strip())
    return out

def przed_sezonem(t):
    """Fragment strony przed pierwszym nagłówkiem '== Sezon ...' = bieżący sezon."""
    m = re.search(r'^==\s*Sezon', t, re.M)
    return t[:m.start()] if m else t

def z_mapy(seg):
    """Drużyny z szablonu Fb map: 1=Nazwa|2=Nazwa|... (pomija pos/label/nt/map/width)."""
    m = re.search(r'\{\{Fb map(.*?)\}\}', seg, re.S)
    if not m:
        return []
    out = []
    for p in re.finditer(r'\|\s*(\d+)\s*=\s*([^|}\n]+)', m.group(1)):
        out.append(p.group(2).strip())
    return out

def z_tabeli(seg):
    """Lista drużyn z tabeli 'Fb cl team|p=..|t=..' (kolejność = miejsce)."""
    pary = re.findall(r'Fb cl team\|p=(\d+)\|t=([^|}\n]+)', seg)
    pary.sort(key=lambda x: int(x[0]))
    return [t.strip() for _, t in pary]

def druzyny(nazwa, naglowek=None, tabela=False):
    t = zrodlo(nazwa)
    if not t:
        return []
    seg = sekcja(t, naglowek) if naglowek else t
    if not seg:
        seg = t
    lista = z_tabeli(seg) if tabela else uczestnicy(seg)
    if not lista:  # awaryjnie druga metoda
        lista = uczestnicy(seg) if tabela else z_tabeli(seg)
    # odfiltruj puste/duplikaty zachowując kolejność
    widziane, wynik = set(), []
    for d in lista:
        d = re.sub(r'<[^>]+>', '', d).strip()
        if d and d not in widziane:
            widziane.add(d); wynik.append(d)
    return wynik

if __name__ == "__main__":
    import pprint
    tests = [
        ("Ekstraklasa w piłce nożnej (2026/2027)", None, False),
        ("I liga polska w piłce nożnej (2026/2027)", None, False),
        ("II liga polska w piłce nożnej (2026/2027)", None, False),
        ("III liga polska w piłce nożnej (2026/2027)", "Grupa IV", False),
        ("IV liga polska w piłce nożnej (2026/2027)", "Grupa VI (małopolska)", False),
        ("V liga polska w piłce nożnej (grupa małopolska zachodnia)", "Sezon 2026/2027", True),
        ("V liga polska w piłce nożnej (grupa małopolska wschodnia)", "Sezon 2026/2027", True),
    ]
    for n, h, tab in tests:
        d = druzyny(n, h, tab)
        print(f"\n== {n}  [{h}]  ({len(d)})")
        print("   " + " | ".join(d))

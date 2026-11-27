"""Parsuje strony kadr Transfermarkt (plus/1) -> JSON z pełnymi danymi zawodników."""
import sys, re, json, html, os
MIES = {"sty":1,"lut":2,"mar":3,"kwi":4,"maj":5,"cze":6,"lip":7,"sie":8,"wrz":9,"paź":10,"paz":10,"lis":11,"gru":12}
POZ = {  # Transfermarkt PL -> (kategoria, pozS)
 "Bramkarz":("BR","BR"),
 "Środkowy obrońca":("OBR","SO"),"Lewy obrońca":("OBR","LO"),"Prawy obrońca":("OBR","PO"),
 "Defensywny pomocnik":("POM","DP"),"Środkowy pomocnik":("POM","SP"),"Ofensywny pomocnik":("POM","OP"),
 "Lewy pomocnik":("POM","LP"),"Prawy pomocnik":("POM","PP"),
 "Lewy napastnik":("NAP","LS"),"Prawy napastnik":("NAP","PS"),"Środkowy napastnik":("NAP","NAP"),
 "Cofnięty napastnik":("NAP","DN"),
 # ogólne (gdy TM nie podaje szczegółu)
 "Obrońca":("OBR","SO"),"Pomocnik":("POM","SP"),"Napastnik":("NAP","NAP"),
}
NOGA = {"prawonożny":"prawa","lewonożny":"lewa","obunożny":"obie"}
def txt(s): return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>"," ",s))).strip()
def data(s):
    m = re.match(r"(\d{1,2}) (\w{3}) (\d{4})", s.strip())
    if not m or m.group(2) not in MIES: return None
    return f"{int(m.group(1)):02d}.{MIES[m.group(2)]:02d}.{m.group(3)}"
def wartosc(s):
    s = s.replace("€","").strip()
    m = re.match(r"([\d,]+)\s*(mln|tys)", s)
    if not m: return None
    v = float(m.group(1).replace(",", "."))
    return int(v * (1_000_000 if m.group(2)=="mln" else 1_000))
def parsuj(h):
    i = h.find('class="items"'); seg = h[i:]
    j = seg.find("</tbody>"); seg = seg[:j]
    out, nieznane = [], set()
    for row in re.split(r'<tr class="(?:odd|even)">', seg)[1:]:
        tds = re.findall(r'<td class="(zentriert|rechts hauptlink)[^"]*"[^>]*>(.*?)</td>', row, re.S)
        nr = re.search(r'rn_nummer>([^<]*)<', row)
        nm = re.search(r'<td class="hauptlink">\s*<a href="/[^/]+/profil/spieler/(\d+)"[^>]*>(.*?)</a>', row, re.S)
        pz = re.search(r'</tr>\s*<tr>\s*<td>\s*([^<]+?)\s*</td>', row)
        if not nm: continue
        imie_nazw = txt(nm.group(2)); pozt = pz.group(1).strip() if pz else ""
        z = [t for c,t in tds]
        # kolumny po nazwisku: data ur., narodowości, wzrost, noga, w klubie od, poprzedni klub, kontrakt do, wartość
        rest = z[1:] if z else []
        dob = data(txt(rest[0])) if len(rest)>0 else None
        kraje = re.findall(r'title="([^"]+)" alt="[^"]*" class="flaggenrahmen"', rest[1]) if len(rest)>1 else []
        wz = txt(rest[2]) if len(rest)>2 else ""
        wzrost = int(round(float(wz.replace("m","").replace(",","."))*100)) if re.match(r"\d,\d+m", wz) else None
        noga = NOGA.get(txt(rest[3])) if len(rest)>3 else None
        kdo = data(txt(rest[6])) if len(rest)>6 else None
        wart = wartosc(txt(rest[7])) if len(rest)>7 else None
        if pozt not in POZ: nieznane.add(pozt)
        kat, pozS = POZ.get(pozt, (None, None))
        num = nr.group(1).strip() if nr else ""
        out.append({"tm": int(nm.group(1)), "pelne": imie_nazw, "numer": int(num) if num.isdigit() else None,
                    "pozTM": pozt, "poz": kat, "pozS": pozS, "ur": dob, "kraje": kraje, "wzrost": wzrost,
                    "noga": noga, "kontraktDo": kdo, "wartosc": wart})
    return out, nieznane
if __name__ == "__main__":
    kat = sys.argv[1]; wynik = {}; nz = set()
    for f in sorted(os.listdir(kat)):
        z, n = parsuj(open(os.path.join(kat,f),encoding="utf-8").read()); nz |= n
        wynik[f.split(".")[0]] = z
    json.dump(wynik, open(sys.argv[2],"w",encoding="utf-8"), ensure_ascii=False, indent=0)
    print("klubów:", len(wynik), "zawodników:", sum(len(v) for v in wynik.values()), "nieznane pozycje:", nz)

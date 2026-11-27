"""Buduje assets/rostery-pelne.json z danych Transfermarkt.
Format: { "<nazwa klubu w grze>": [[imie, nazwisko, pozS, dataUr, numer, kraj|"", noga|"", kontraktDoSezon|0, wartoscEUR|0, wzrost|0], ...] }"""
import sys, json, re
parsed = json.load(open(sys.argv[1], encoding="utf-8"))
kluby = [l.rstrip("\n").split("|") for l in open(sys.argv[2], encoding="utf-8") if l.strip()]
ALIAS = {"Resovia Rzeszów": "Resovia", "Śląsk Wrocław II": "Śląsk II Wrocław", "Legia Warszawa II": "Legia II Warszawa"}
KRAJ_FIX = {"Stany Zjednaczone": "Stany Zjednoczone", "Wyspy Świętego Tomasza i Ksążęca": "Wyspy Świętego Tomasza i Książęca"}
# Daty urodzenia brakujące na Transfermarkcie — uzupełnione z regiowyniki.pl (/kadra/)
DOB_FIX = {"Igor Ziębiński": "13.08.2009", "Szymon Mendalski": "12.07.2009", "Bartosz Sławiński": "31.07.2009", "Szymon Puchalski": "05.01.2010"}
def sezon_kontraktu(d):
    if not d: return 0
    dd, mm, rr = map(int, d.split("."))
    return rr - 1 if mm <= 7 else rr
out, braki = {}, []
for tid, slug, nazwa in kluby:
    gra = ALIAS.get(nazwa, nazwa)
    lista = []
    for z in parsed.get(tid, []):
        if not z["pozS"]: braki.append((gra, z["pelne"], "pozycja")); continue
        if not z["ur"] and z["pelne"] in DOB_FIX: z["ur"] = DOB_FIX[z["pelne"]]
        if not z["ur"]: braki.append((gra, z["pelne"], "data ur."))
        slowa = z["pelne"].split()
        imie, nazw = (slowa[0], " ".join(slowa[1:])) if len(slowa) > 1 else ("", slowa[0])
        kraj = KRAJ_FIX.get(z["kraje"][0], z["kraje"][0]) if z["kraje"] else ""
        if kraj == "Polska": kraj = ""
        lista.append([imie, nazw, z["pozS"], z["ur"] or "", z["numer"] or 0, kraj, z["noga"] or "",
                      sezon_kontraktu(z["kontraktDo"]), z["wartosc"] or 0, z["wzrost"] or 0])
    out[gra] = lista
json.dump(out, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("klubów:", len(out), "zawodników:", sum(map(len, out.values())))
print("bez daty/pozycji:", len(braki)); [print("  ", b) for b in braki]

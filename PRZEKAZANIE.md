# DZIEWIĄTKA — notatka przekazania (punkt zapisu projektu)

Ten plik to „punkt zapisu" całej dotychczasowej pracy nad grą. Jeśli czytasz go w nowej sesji/na nowym
koncie: przeczytaj go w całości, potem powiedz użytkownikowi „gotowe, kontynuujemy" i działaj dalej od
sekcji **„CO JEST W TOKU"**. Cała gra jest w folderze `gra-menedzer/`.

## Co to jest
**DZIEWIĄTKA** — polski menedżer piłkarski (nazwa = „9" napastnika + 9 szczebli rozgrywek: Ekstraklasa → klasa B).
Gra **wyłącznie po polsku**. Silnik w czystym TypeScript (`src/engine/`), interfejs React Native + Expo (`src/ui/`).
Działa jako jeden plik `index.html` (cała gra + herby + ikona w środku) — otwiera się w przeglądarce bez instalacji.

## Gdzie co żyje
- **Kod źródłowy (warsztat do poprawek):** repo GitHub `TheKacperos4/system-sprzedawcy`, folder `gra-menedzer/`,
  gałąź **`claude/relaxed-archimedes-89sen1`** (na tę gałąź commitujemy).
- **Gra do grania (gotowiec):** `index.html` — jeden samowystarczalny plik (buduje go `scripts/build-html.mjs`).
- **Hosting publiczny:** Netlify `tubular-torrone-fda949.netlify.app` (aktualizacja: Netlify → + → „Upload a new version" → wybierz nowy `index.html`; ten sam adres, za darmo).
- **Podgląd prywatny:** Artifact Claude `https://claude.ai/artifact/6N8xYFx3618RTpYqoagVU4` (ostatnio Wersja 12) — przypięty do starego konta; na nowym koncie nieistotny, bo gra jest w repo + pliku.

## Jak zbudować nową wersję (po zmianach w kodzie)
```
cd gra-menedzer
npm install                      # tylko za pierwszym razem na nowej maszynie
npx tsc --noEmit                 # typecheck (musi być czysty)
npx expo export --platform web   # build web → folder dist/
# (opcjonalna kompresja herbów, zmniejsza plik ~2x):
find dist/assets -name '*.png' -print0 | xargs -0 -P4 -I{} convert "{}" -resize '96x96>' -colors 64 -strip "{}"
node scripts/build-html.mjs dist index.html   # składa index.html (gra + herby + ikona)
```
Testy balansu (opcjonalnie): `npx tsx scripts/test-wyniki.ts` (cel ~4.0 gole/mecz).
Ikona aplikacji: `assets/ikona/` (źródło SVG + PNG 180/512/1024). `build-html.mjs` sam wstrzykuje apple-touch-icon.

## Zasady stałe (nie łamać)
- **Tylko język polski** w całej grze.
- **Nie ruszać** strony/rzeczy RB Home / `rbhome.pl` ani reszty systemu sprzedawcy — pracujemy wyłącznie w `gra-menedzer/`.
- Nie zmyślać realnych danych — jeśli brak źródła, zostaje generowane (oznaczyć).
- Commity na gałąź `claude/relaxed-archimedes-89sen1`. Nie commitować `node_modules`, `dist`, `*.db`, `.env`.
- Stopka commitów: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` + `Claude-Session: ...`.

## CO JUŻ ZROBIONE (najważniejsze z ostatnich sesji)
- Etykieta siły drużyny → **OVR** (średnia 11 najlepszych) wszędzie, też kolumna OVR w tabeli ligi.
- **Zapis/wczytywanie** gry (sloty), menu startowe (ekran tytułowy), wybór kariery: Ligi krajowe + Województwa.
- Herby wszystkich lig/klubów, wycięte bez tła, wykontrastowane.
- **Konkretne pozycje** (LO/ŚO/PO/DP/SP/LS/NAP…) dla wszystkich zawodników generowanych i juniorów, 4 województwa.
- **Okna transferowe wg PZPN** (`kalendarz.ts`): zawodowe (Ekstraklasa/I/II liga) letnie 1 VII–8 IX, zimowe do poł. marca;
  amatorskie (III liga→klasa B) letnie 1 VII–30 IX, zimowe do pocz. kwietnia. **Wolni zawodnicy — podpis też poza oknem.**
- **Rynek transferowy przerobiony** (`src/ui/Transfery.tsx`): widoczność naprawiona (cała lista w `FlatList` + `ListHeaderComponent`),
  filtry: pozycja (kategoria + szczegółowa), wiek (≤19…31+), cena max, „tylko wygasające", sortowanie (OVR/potencjał/najmłodsi/najtańsi/talent).
  **Wystawianie własnego zawodnika na sprzedaż** z kwotą wywoławczą (zakładka „🏷 Sprzedaj") — AI składa oferty tym chętniej, im rozsądniejsza cena
  (`wystawNaSprzedaz`/`zdejmijZeSprzedazy` w `sezon.ts`, pole `Zawodnik.wystawiony`, oferty w generowaniu ofert AI).
- **Kontrakty urealnione** (`swiat.ts`): konkretna data końca „do 30 czerwca RRRR" (`dataKontraktu`), typy wg szczebla:
  zawodowy (1–3), półprofesjonalny (4–5), amatorski (6+).
- **Edytor składu** (`src/ui/BoiskoEdytor.tsx`): przeciąganie zastąpione pewnym „dotknij zawodnika → dotknij pozycji"
  (PanResponder na webie miał zawodne współrzędne); przycisk „‹ Wstecz" + „⬇ Na ławkę".
- **Ikona aplikacji** „9" (złota na murawie) — `assets/ikona/`.

## CO JEST W TOKU (tu stanęliśmy — następny krok)
**Realne nazwiska + konkretne pozycje + aktualny wiek dla wszystkich klubów II liga → Ekstraklasa (poziom 1–3).**
Stan:
- Większość klubów poziomu 1–3 ma już realne **nazwiska** w `assets/rostery.json`, ALE **~70 klubów NIE MA** (stąd zmyślone nazwiska).
  Brakuje m.in.: **Legia Warszawa (herb 305), Lechia Gdańsk (313), Pogoń Szczecin (317), Ruch Chorzów (304), Piast Gliwice (310),
  Zagłębie Lubin (314), Stal Mielec (301), Warta Poznań (332), ŁKS Łódź (3948), Arka Gdynia (329), Miedź Legnica (327)** i inne.
- **Pozycje** realne są tylko dla 7 klubów w `assets/rostery-poz.json`. **Wiek** realny — jeszcze nigdzie (teraz generowany).
- Jak policzyć listę braków:
  ```
  cd gra-menedzer && python3 -c "
  import json,re
  rost=set(json.load(open('assets/rostery.json')).keys())
  src=open('src/data/malopolska.ts').read()   # ligi krajowe 1-3 są tu zdefiniowane
  pairs=re.findall(r'nazwa:\s*\"([^\"]+)\"[^}]*?herb:\s*\"([^\"]+)\"', src)
  for n,h in pairs:
      if h not in rost: print(h, n)"
  ```

### Źródło danych i mechanika
- `herb` w danych klubów (np. `src/data/malopolska.ts`) = **ID flagi na regiowyniki.pl** (`/static/flags/<id>.jpg`).
- `assets/rostery.json` = `{ "<idHerbu>": [["Imię","Nazwisko"], ...] }`. Klucz = herb.
- `assets/rostery-poz.json` = `{ "<idHerbu|nazwaHerbu>": [["Imię","Nazwisko","POZ"], ...] }` (POZ = BR/OBR/POM/NAP).
- Silnik (`src/engine/swiat.ts`, ~linia 484): dla `poziom<=3` jeśli jest `ROSTERY_POZ[klub.herb]` → buduje z realnych pozycji;
  w przeciwnym razie `ROSTERY[klub.herb]` → realne nazwiska na szablonie `KADRA`. **Wiek trzeba będzie dołożyć** do danych i użyć w `nowyZawodnik`.
- **Źródło na żywo:** regiowyniki.pl, strona kadry klubu:
  `https://regiowyniki.pl/druzyna/Pilka_Nozna/<Województwo>/<Nazwa_Klubu>/<liga>/kadra/`
  Tabela `id="playerstable"`: pierwsza kolumna „Nazwisko Imię", druga kolumna **data urodzenia** `RRRR/MM/DD` (→ wiek).
  **DO USTALENIA:** która kolumna trzyma pozycję (sprawdzone: Legia odpowiada 200, tabela się czyta; trzeba dojrzeć kolumnę pozycji — ostatni test to pokazywał).
  regiowyniki jest osiągalne z tego środowiska (HTTP 200). Scraper bazowy: `scripts/dane/rostery.py` (czyta zapisane strony grup z `REGIO_CACHE`, pobiera `/kadra/`).
- **Plan dokończenia:** dla ~54 klubów poziomu 1–3 pobrać `/kadra/` z regiowyniki → wyciągnąć nazwisko + pozycję + datę urodzenia →
  zapisać wzbogacony `rostery-poz.json` z wiekiem (np. `[[imie, nazwisko, poz, rokUrodzenia]]`) → podpiąć w `swiat.ts` (nazwisko+pozycja+wiek dla poziom≤3) → build → wysłać nowy `index.html`.

## Następne drobne pomysły (po realnych składach)
- Dodać realny wiek także tam, gdzie są same nazwiska (ROSTERY) — jeśli regiowyniki poda datę urodzenia.
- Ewentualnie realne składy również III liga (poziom 4), jeśli użytkownik poprosi.

— Punkt zapisu na 27.11.2026. Po wgraniu zmian dopisz tu, co doszło, i skróć „CO JEST W TOKU".

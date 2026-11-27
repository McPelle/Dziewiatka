# DZIEWIĄTKA — notatka przekazania (punkt zapisu projektu)

Ten plik to „punkt zapisu" całej dotychczasowej pracy nad grą. Jeśli czytasz go w nowej sesji/na nowym
koncie: przeczytaj go w całości, potem powiedz użytkownikowi „gotowe, kontynuujemy" i działaj dalej od
sekcji **„CO JEST W TOKU"**. Cała gra jest w folderze `gra-menedzer/`.

## Co to jest
**DZIEWIĄTKA** — polski menedżer piłkarski (nazwa = „9" napastnika + 9 szczebli rozgrywek: Ekstraklasa → klasa B).
Gra **wyłącznie po polsku**. Silnik w czystym TypeScript (`src/engine/`), interfejs React Native + Expo (`src/ui/`).
Działa jako jeden plik `index.html` (cała gra + herby + ikona w środku) — otwiera się w przeglądarce bez instalacji.

## Gdzie co żyje
- **Kod źródłowy (warsztat do poprawek):** repo GitHub `McPelle/Dziewiatka`, folder `gra-menedzer/`,
  gałąź **`claude/zrodla-gry`** (na tę gałąź commitujemy).
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
(herby są już zoptymalizowane w assets/herby — NIE kompresować ich przy buildzie; popraw-herby.py robi to raz)
node scripts/build-html.mjs dist index.html   # składa index.html (gra + herby + ikona)
```
Testy balansu (opcjonalnie): `npx tsx scripts/test-wyniki.ts` (cel ~4.0 gole/mecz).
Ikona aplikacji: `assets/ikona/` (źródło SVG + PNG 180/512/1024). `build-html.mjs` sam wstrzykuje apple-touch-icon.

## Zasady stałe (nie łamać)
- **Tylko język polski** w całej grze.
- **Nie ruszać** strony/rzeczy RB Home / `rbhome.pl` ani reszty systemu sprzedawcy — pracujemy wyłącznie w `gra-menedzer/`.
- Nie zmyślać realnych danych — jeśli brak źródła, zostaje generowane (oznaczyć).
- Commity na gałąź `claude/zrodla-gry`. Nie commitować `node_modules`, `dist`, `*.db`, `.env`.
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

## ZROBIONE 27.11.2026 — PRAWDZIWE SKŁADY Ekstraklasa → II liga
- **Nowe repo:** GitHub `McPelle/Dziewiatka`, gałąź robocza **`claude/zrodla-gry`** (kod w `gra-menedzer/`, gotowa gra `index.html` w katalogu głównym).
  Stare repo `TheKacperos4/system-sprzedawcy` jest już nieaktualne.
- **Wszystkie 54 kluby poziomu 1–3, 1595 prawdziwych zawodników** (sezon 2026/27, źródło: Transfermarkt `/kader/.../plus/1`):
  imię i nazwisko, **konkretna pozycja** (BR/SO/LO/PO/DP/SP/OP/LP/PP/LS/PS/NAP/DN), **pełna data urodzenia** (→ wiek),
  **oryginalny numer**, narodowość (80 krajów z flagami i statusem UE), lepsza noga, wzrost, koniec kontraktu.
  Plik: `assets/rostery-pelne.json` (klucz = nazwa klubu w grze). Ma pierwszeństwo przed `rostery.json`/`rostery-poz.json`.
- 4 daty brakujące na Transfermarkcie uzupełnione z regiowyniki.pl. **Brak daty w żadnym źródle:** Patryk Pieślak (Świt Szczecin),
  Witold Wałęga (Sandecja) — mają wiek juniora i wygenerowaną datę.
- Numery: rezerwy (Legia II, Śląsk II) nie mają numerów u źródła (~30 zawodników w całej lidze) → gra nadaje wolne numery.
- **Siła (OVR)** realnych zawodników = percentyl ich realnej wyceny w lidze + renoma klubu (młodzi: niższy OVR, wyższy potencjał).
  Balans sprawdzony: 3,95 gola/mecz.
- **Profil zawodnika:** linia „🎂 ur. DD.MM.RRRR (wiek) · wzrost · realna wycena”. **III liga → klasa B (zawodnicy generowani):**
  data urodzenia generowana, stała i zgodna z wiekiem (`dataUrodzenia()` w `swiat.ts`).
- Odświeżenie danych w przyszłości: pobrać strony kadr TM → `scripts/dane/kadry-tm-parsuj.py <katalog> parsed.json` →
  `scripts/dane/kadry-tm-zbuduj.py parsed.json <lista id|slug|nazwa> assets/rostery-pelne.json`. Test: `npx tsx scripts/test-realne-sklady.ts`.


## ZROBIONE 27.11.2026 — WERSJA 1: MECZ NA ŻYWO + 3D
- Transfery rozłożone w dniach: `src/engine/transfery.ts` (oferta → klub 1–3 dni → kontrakt/agent → badania → rejestracja; umowy wstępne, wypożyczenia z wykupem, obserwowani, premie za gole/występy). UI: `src/ui/NegocjacjePanel.tsx`.
- Budowy z przetargiem: `src/engine/budowy.ts` (fikcyjne firmy, czas, opóźnienia, aneksy, usterki, utrudnienia dla kibiców). UI: `src/ui/Budowy.tsx`.
- Mecz na żywo: silnik `src/engine/meczNaZywo.ts` (minuta po minucie; karne z obronami, wolne, rożne, VAR tylko poziom ≤2, spalone, słupki, kartki, urazy, okrzyki, mowa w przerwie, oceny na żywo, podpowiedzi asystenta). Limity zmian wg PZPN/ZPN w `zasadyZmian`. Wynik rozliczany w kolejce przez `meczZeScenariusza` (mecz.ts), `s.meczLive`. Zapis w trakcie meczu w localStorage (`dz_mecz_live`) i wznowienie.
- 3D (three.js): `src/ui/three/` — `stadion3d.ts` (stadion z danych klubu), `zawodnik3d.ts` (postacie z przegubami, stroje), `Mecz3D.tsx` (realizacja TV, powtórki, bloom/DOF, pogoda), `Stadion3DWidok.tsx` (menu + zakładka klubu), `dzwiek.ts` (dźwięk Web Audio). Ustawienia: Więcej → Grafika (`dz_3d`, `dz_lekka`).
- Stroje na mecz wg uchwały PZPN IX/140 § 13: `src/ui/strojeDane.ts` (gość dostosowuje się; kolizja → zmienia gospodarz, karę płaci gość; bramkarz kontrastuje; sędzia w innym kolorze). Wybór kompletu i stroju BR przed meczem.
- Postacie 3D są proceduralne (bez zewnętrznych modeli) — ewentualna podmiana na modele CC0 z animacjami to dalszy krok.

## PLAN (zatwierdzony przez użytkownika) — 141 punktów
6 zaległych z pierwszej listy (reprezentacje, 64 herby, logo lig, grafika/stroje, kalendarz miesiąca, dokończenie meczu) + 135 nowych (3D, realizm, żywy świat, przepisy PZPN). Lista zadań: #24–#32 w sesji; robione etapami, po każdym etapie plik index.html dla użytkownika.


## PUBLIKACJA GRY (od 27.11.2026) — GitHub Pages
- Adres gry: **https://mcpelle.github.io/Dziewiatka/** (publiczny, bez logowania, bez znaczka hostingu).
- Gra jest aplikacją webową (PWA): ikona na ekranie, pełny ekran, offline, aktualizacje w tle (komunikat „Nowa wersja gotowa").
- Wydanie nowej wersji:
  1. `cd gra-menedzer && rm -rf dist && npx expo export --platform web && node scripts/build-strona.mjs dist ../strona && node scripts/build-html.mjs dist ../index.html && rm -rf dist`
  2. commit + push gałęzi roboczej,
  3. skopiować zawartość `strona/` do osobnego repo-katalogu i wypchnąć jako gałąź **gh-pages** (root = zawartość strony, z plikiem `.nojekyll`). GitHub Pages publikuje sam w 1–2 min.
- Ścieżki w buildzie są WZGLĘDNE (`./assets/...`, `./sw.js`) — gra działa w podkatalogu `/Dziewiatka/`.
- Netlify (tubular-torrone-fda949) — stara strona, NIE aktualizujemy (kredyty, znaczek „Powered by Netlify" na darmowym koncie). Użytkownik usunie ją po przeniesieniu zapisu.
- iPhone: aplikacja z ekranu ma osobną pamięć niż Safari → zapisy przenosi się eksportem/importem.

## CO JEST W TOKU
Nic otwartego — użytkownik ma listę kolejnych poprawek, zapytać o nie.

## Następne drobne pomysły (po realnych składach)
- Dodać realny wiek także tam, gdzie są same nazwiska (ROSTERY) — jeśli regiowyniki poda datę urodzenia.
- Ewentualnie realne składy również III liga (poziom 4), jeśli użytkownik poprosi.

— Punkt zapisu na 27.11.2026. Po wgraniu zmian dopisz tu, co doszło, i skróć „CO JEST W TOKU".

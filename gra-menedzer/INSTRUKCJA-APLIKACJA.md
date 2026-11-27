# Jak zbudować i zainstalować grę na telefonie (wersja BETA)

Gra „Menedżer Piłkarski" jest napisana w Expo (React Native) i jest **w całości po polsku**.
Masz dwie drogi: szybki podgląd przez **Expo Go** (bez budowania) albo **własna aplikacja beta**
(plik APK na Androida / instalka na iPhone), którą można pobrać na telefon.

---

## A. Najszybciej — podgląd przez Expo Go (bez budowania)

1. Na telefonie zainstaluj **Expo Go** (Google Play / App Store).
2. Na komputerze, w folderze `gra-menedzer`, uruchom:
   ```
   npm install
   npx expo start
   ```
3. Zeskanuj telefonem kod QR z terminala (Android: aparatem / w Expo Go; iPhone: aparatem).
4. Gra otworzy się w Expo Go. Telefon i komputer muszą być w tej samej sieci Wi‑Fi.

To działa dopóki serwer na komputerze chodzi. Do grania „na stałe" potrzebna jest własna aplikacja — niżej.

---

## B. Aplikacja BETA na Androida (plik APK do pobrania) — zalecane

Buduje się w chmurze Expo (EAS), nie potrzeba Android Studio.

1. Załóż darmowe konto na https://expo.dev (jeśli nie masz).
2. W folderze `gra-menedzer`:
   ```
   npm install
   npx eas-cli@latest login
   npx eas-cli@latest build -p android --profile beta
   ```
3. Build idzie w chmurze (~10–20 min). Na końcu dostaniesz **link do pliku .apk** (i kod QR).
4. Otwórz link na telefonie, pobierz APK i uruchom. Android zapyta o zgodę na instalację
   z nieznanego źródła — zezwól.
5. Gra instaluje się jak zwykła aplikacja: ikona, tryb ciemny, działa bez internetu, zapis na telefonie.

Przy kolejnych wersjach powtarzasz tylko ostatnią komendę z kroku 2 i instalujesz nowy APK.

---

## C. Aplikacja BETA na iPhone

iOS nie pozwala tak po prostu pobrać i zainstalować pliku — Apple tego pilnuje. Opcje:

- **Z kontem Apple Developer** (99 USD/rok) — pełna beta przez TestFlight:
  ```
  npx eas-cli@latest build -p ios --profile beta
  ```
  EAS poprowadzi przez logowanie do Apple i podpisywanie; gotowy build wrzucasz na TestFlight,
  a testerzy dostają zaproszenie i instalują aplikację na swoich iPhone'ach.
- **Bez konta Apple Developer** — zostań przy **Expo Go** (punkt A). Pełnej instalki na iPhone
  nie da się zrobić bez konta dewelopera — to wymóg Apple, nie gry.

Na własny użytek najprościej: **Android = APK beta (B)**, iPhone = **Expo Go (A)**
albo TestFlight, jeśli masz konto Apple Developer.

---

## Co jest już przygotowane

- `app.json` — nazwa „Menedżer piłkarski", identyfikator `pl.menedzer.gra`, tryb ciemny, ekran pionowy, cała gra po polsku.
- `eas.json` — profil **beta** (APK/TestFlight do testów), **preview** (APK) i **production** (do sklepu, na przyszłość).
- Ikony w `assets/` — możesz podmienić na własne (te same rozmiary i nazwy plików).
- Menu gry: ekran startowy z marką, nagłówek klubu z herbem (liga · kolejka · sezon · budżet)
  i hub **„Więcej"** ze wszystkimi działami (Trening, Akademia, Sztab, Stroje, Finanse, Sponsorzy, Mój klub, Kariera, Puchar).

## Uwaga o herbach (ważne przy publikacji)

Herby klubów są znakami klubów. Dopóki grasz sam na swoim telefonie (beta, testy) — w porządku.
Gdybyś kiedyś chciał grę **opublikować** (Google Play / App Store), herby trzeba usunąć
albo zdobyć zgodę klubów. Gra działa też bez herbów (rysuje tarczę w barwach klubu).

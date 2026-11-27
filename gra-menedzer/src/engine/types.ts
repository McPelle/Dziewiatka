export type Pozycja = "BR" | "OBR" | "POM" | "NAP"; // kategoria (używana przez formacje i silnik meczu)
/** Szczegółowa pozycja boiskowa (nad kategorią). Każda mapuje się na jedną z 4 kategorii. */
export type PozycjaSzczegolowa =
  | "BR"                                  // bramkarz
  | "LO" | "SO" | "PO" | "LWA" | "PWA"    // obrona: lewy/środkowy/prawy obrońca, lewy/prawy wahadłowy
  | "DP" | "SP" | "LP" | "PP" | "OP"      // pomoc: defensywny/środkowy/lewy/prawy/ofensywny pomocnik
  | "LS" | "PS" | "NAP" | "DN";           // atak: lewy/prawy skrzydłowy, napastnik, drugi napastnik
export type Nastawienie = "autobus" | "obronne" | "zrownowazone" | "ofensywne";
/** Cecha specjalna zawodnika (wpływa na mecz/rozwój). */
export type Cecha =
  | "snajper" | "egzekutor" | "lider" | "talent" | "mur" | "szybki" | "weteran"
  // behawioralne (wpływ na mecz, kontuzje, formę, transfery):
  | "nerwowy"          // więcej kartek
  | "kontuzjogenny"    // częstsze urazy
  | "bigmecz"          // lepszy w derbach i pucharze
  | "profesjonalista"  // wolniej traci formę/kondycję, dłuższa kariera
  | "lojalny"          // trzyma się klubu — rzadziej prosi o transfer
  | "niespokojny";     // szybciej się frustruje — częściej chce odejść

/** Atrybuty składowe (0–99). Overall (umiej) = ich ważone złożenie wg pozycji.
 *  „prz" (przywództwo) nie wchodzi do overall — decyduje o kapitaństwie i wsparciu drużyny. */
export interface Atrybuty {
  br: number;  // bramkarstwo (refleks, interwencje) — kluczowe dla BR
  obr: number; // obrona (odbiór, krycie)
  czy: number; // czytanie gry / pozycjonowanie
  pod: number; // podanie (rozegranie)
  dry: number; // drybling / technika
  str: number; // wykończenie (strzał)
  szy: number; // szybkość
  fiz: number; // fizyczność (siła, wytrzymałość)
  prz: number; // przywództwo (kapitańskość) — poza overall
}

export type AtrybutKlucz = keyof Atrybuty;

export interface Rekordy {
  najlepszeMiejsce?: { sezon: number; liga: string; miejsce: number };
  najwiecejPkt?: { sezon: number; liga: string; pkt: number };
  topStrzelec?: { sezon: number; imie: string; nazwisko: string; gole: number };
  najwieksza?: { sezon: number; wynik: string; rywal: string; uSiebie: boolean };
  rekordFrekwencji?: { sezon: number; widzowie: number; rywal: string }; // rekord frekwencji na meczu u siebie
}

export type KatJun = "U19" | "U17";
export interface WierszJun { klubId: string; m: number; w: number; r: number; p: number; bz: number; bs: number; pkt: number }
export interface WynikJun { dom: string; gosc: string; gd: number; gg: number }
export interface LigaJun { kat: KatJun; poziom: number; nazwa: string; kluby: string[]; terminarz: [string, string][][]; wyniki: WynikJun[][] }
export interface ParaJun { a: string; b: string | null; gd?: number; gg?: number; kolejka?: number }
export interface PucharJun { kat: KatJun; nazwa: string; runda: number; pary: ParaJun[]; zwyciezca?: string }
export interface RozgrywkiJun { ligi: LigaJun[]; puchary: PucharJun[] }

export interface Zawodnik {
  id: string;
  imie: string;
  nazwisko: string;
  poz: Pozycja; // kategoria (formacje/silnik)
  pozS?: PozycjaSzczegolowa; // szczegółowa pozycja boiskowa (np. „LO", „OP", „LS")
  pozycjeDodatkowe?: PozycjaSzczegolowa[]; // wyuczone dodatkowe pozycje (gra na nich z pełną siłą, nie tracąc podstawowej)
  treningIndywidualny?: AtrybutKlucz | null; // atrybut rozwijany w treningu indywidualnym (ponad trening drużyny)
  naukaPozycji?: { poz: PozycjaSzczegolowa; postep: number } | null; // nauka nowej pozycji (postęp 0–100)
  juniorMacierzysty?: boolean; // wypożyczony junior — po powrocie wraca do akademii (jeśli dalej U-19)
  kadraStat?: { kraj: string; mecze: number; gole: number; debiut?: string }; // kariera reprezentacyjna
  reprezentant?: string; // ostatnie powołanie do kadry (np. „Polska", „Polska U-21", kraj) — prestiż
  wychowanek?: string; // klub, którego jest wychowankiem (homegrown) — prestiż i premia zarządu
  test?: { do: number; obs: number; min: number; max: number; werdykt?: string }; // okres testowy: narastająca ocena skauta (przedział szac. OVR zwęża się z obserwacjami)
  meczeKariera?: number; // łączne mecze w karierze (do jubileuszy)
  goleKariera?: number; // łączne gole w karierze (do jubileuszy)
  cechy?: Cecha[]; // cechy specjalne (snajper, egzekutor, lider…)
  atrybuty?: Atrybuty; // oceny składowe (overall = ich ważone złożenie wg pozycji)
  wiek: number;
  realny?: boolean; // prawdziwy zawodnik (Ekstraklasa → II liga) — oryginalne dane osobowe i numer
  dataUr?: string; // prawdziwa data urodzenia „DD.MM.RRRR" (zawodnicy Ekstraklasa → II liga; źródło: Transfermarkt)
  wzrost?: number; // wzrost w cm (prawdziwy, gdy znany)
  wartoscReal?: number; // realna wartość rynkowa w EUR w chwili startu gry (Transfermarkt) — tylko informacyjnie
  umiej: number; // OVERALL 1–100 — liczony z atrybutów (ułamki = postęp treningu)
  potencjal: number;
  kondycja: number; // 0–100
  forma: number; // -5..+5
  pensja: number; // zł za kolejkę
  klubId: string | null;
  kontuzja: number; // kolejki do wyleczenia
  podatnosc?: number; // podatność na urazy (mnożnik ~0.8–1.6; wyższy = częstsze i dłuższe kontuzje)
  urazy?: number; // historia: liczba doznanych urazów w karierze
  gole: number;
  asysty: number;
  czysteKonta: number; // czyste konta (bramkarze)
  mecze: number;
  kontraktTyp: KontraktTyp;
  kontraktDo: number;
  wystawiony?: number; // kwota wywoławcza, gdy klub gracza wystawił go na sprzedaż (brak = nie na rynku)
  kartki: number; // żółte kartki w sezonie
  zawieszenie: number; // kolejki zawieszenia (czerwona / kumulacja żółtych)
  morale: number; // 0–100 — zadowolenie (gra, wyniki, pensja, ambicja)
  prosiOTransfer: boolean; // zawodnik chce odejść (niskie morale)
  noga: Noga; // lepsza noga
  kraj?: string; // narodowość (brak = Polska); obcokrajowcy wg przepisów PZPN o cudzoziemcach
  numer: number; // numer na koszulce
  kariera: WpisKariery[]; // historia kariery (generowana — realne staty amatorów nie istnieją)
  zdjecie?: string; // wgrane zdjęcie (data URI) — wgrywa użytkownik, trzymane lokalnie
  twarz?: TwarzCechy; // nadpisania wyglądu generowanego awatara
  agent?: string; // agent piłkarski (profesjonaliści) — negocjuje kontrakt
  klauzula?: number; // klauzula wykupu (zł) — zapłacenie jej wymusza negocjacje z zawodnikiem, klub nie może zablokować
  odsprzedaz?: { klubId: string; proc: number }; // klauzula odsprzedaży: % z przyszłego transferu dla klubu-sprzedawcy
  jun?: { sezon: number; kat: KatJun; m: number; g: number; a: number; oc: number; wyr: number }; // statystyki w lidze juniorów (sezon): mecze, gole, asysty, suma ocen, wyróżnienia
  junKariera?: { sezon: number; kat: KatJun; m: number; g: number; a: number; sr: number }[]; // historia sezonów juniorskich
  meczeJesien?: number; // mecze rozegrane do końca rundy jesiennej (limity gry w rezerwach liczone per runda)
  meczeRezerwy?: number; // mecze w niższym zespole klubu w sezonie (zasada >50% po zakończeniu sezonu wyższego zespołu)
  przyszlyKlub?: { klubId: string; warunki: import("./transfery").WarunkiKontraktu }; // umowa wstępna — przejdzie latem za darmo
  bonusy?: { gol: number; mecz: number };
  bonusLicz?: { g: number; m: number }; // stan goli/meczów przy ostatnim rozliczeniu premii // premie kontraktowe (zł) za gola / występ
  wykup?: { kwota: number; obowiazek: boolean; klubId: string }; // wypożyczenie z opcją / obowiązkiem wykupu
  relacja?: number; // zaufanie zawodnika do trenera 0–100 (rozmowy, dotrzymane/złamane obietnice); brak = 60
  ostatniaRozmowa?: number; // sezon*100+kolejka ostatniej rozmowy (druga rozmowa w tygodniu waży mniej)
  obietnica?: { typ: "minuty" | "kontrakt"; doKolejki: number; mecze: number; kontraktDo: number }; // obietnica trenera do rozliczenia
  ocenaMeczu?: number; // ocena z ostatniego rozegranego meczu (1–10)
  rozwoj?: number[]; // historia umiejętności (próbka co sezon) — do wykresu rozwoju
  macierzysty?: string; // klub właściciel, gdy zawodnik jest na wypożyczeniu (klubId)
  wypozyczenieDo?: number; // sezon, po którym wraca do klubu macierzystego
  pensjaPelna?: number; // pełna pensja na czas wypożyczenia (do przywrócenia po powrocie)
  doplataMacierzystego?: number; // zł/kolejkę, które klub macierzysty dopłaca za wypożyczonego (gdy biedniejszy nie daje rady)
  zgranie?: number; // chemia/zgranie z drużyną 0–100 (nowy transfer startuje nisko, rośnie z meczami); brak = zgrany skład (C3)
  pochodzenie?: string; // miasto pochodzenia (wychowankowie akademii — miasto z województwa klubu) (B2)
}

/** Cechy generowanego awatara (indeksy do palet w Twarz.tsx). */
export interface TwarzCechy {
  skora: number;
  wlosy: number;
  stylWlosow: number;
  zarost: number;
}

/** Jeden etap kariery: klub, sezony, rozegrane mecze i gole (narasta w trakcie gry). */
export interface WpisKariery {
  klub: string;
  od: number; // sezon rozpoczęcia
  do: number | null; // sezon odejścia; null = klub obecny
  mecze: number;
  gole: number;
}

export type Noga = "prawa" | "lewa" | "obie";

export interface Obiekty {
  gastronomia: number; // stoiska z jedzeniem
  parking: number;
  sklep: number; // sklep klubowy
  // Nowe obiekty (opcjonalne — stare zapisy ich nie mają, brak = poziom 0)
  toalety?: number; // sanitariaty
  kasy?: number; // kasy biletowe i bramki wejściowe
  strefaKibica?: number; // fan zone przed stadionem
  loze?: number; // loże VIP / skyboxy
  telebim?: number; // telebim i bandy LED
  zadaszenie?: number; // dach nad trybunami
  muzeum?: number; // muzeum klubu / sala trofeów
  hotel?: number; // hotel klubowy / centrum konferencyjne
  baza?: number; // boiska treningowe (baza treningowa przy stadionie)
}

export type KontraktTyp = "zawodowy" | "polprofesjonalny" | "amator";

// Model własności klubu (polskie realia): samorządowy (miejski/gminny), społeczny (stowarzyszenie kibiców),
// prywatny inwestor, spółka akcyjna. Każdy ma inny przepływ pieniędzy, nastroje trybun i ryzyka.
export type WlasnoscKlubu = "samorzad" | "stowarzyszenie" | "inwestor" | "spolka";

export interface Klub {
  id: string;
  nazwa: string;
  skrot: string;
  miasto: string;
  poziom: number; // 1 = Ekstraklasa … 9 = klasa C
  renoma: number; // 0..1
  kasa: number;
  zawodnicy: string[];
  prawdziwy: boolean;
  wycofany?: { sezon: number; powrot: number }; // wycofał się z rozgrywek (finanse) — może reaktywować się w sezonie `powrot` (od najniższej klasy)
  wlasny?: boolean; // klub stworzony przez gracza
  barwyWlasne?: [string, string]; // barwy klubu gracza (podstawowa, dodatkowa)
  pozaPiramida?: boolean; // klub spadł/awansował do ligi swojego regionu poza symulowaną piramidą (gra dalej, ale nie w Twoich ligach)
  pozaLiga?: boolean; // drużyna spoza rozgrywek ligowych (zgłoszona tylko do regionalnego Pucharu Polski)
  opisPozaLiga?: string; // kim jest drużyna spoza lig (orlikowa, firmowa, OSP, oldboje…)
  herb?: string;
  rezerwaId?: string; // id zespołu rezerw (dla pierwszego zespołu)
  juniorzy?: string[]; // skład U-21 (akademia) — id zawodników poza kadrą pierwszego zespołu (Twój klub)
  testowani?: string[]; // zawodnicy na testach (niższe ligi): obserwowani przed decyzją o transferze
  juniorPoziom?: number; // szczebel w piramidzie juniorskiej (niezależny od seniorów; awanse/spadki wg wyników juniorów)
  raty?: { kwota: number; sezonow: number }[]; // zaległe raty transferowe (płacone co sezon)
  rezerwaDla?: string; // id pierwszego zespołu (dla rezerw)
  znajomoscFormacji?: Record<string, number>; // zgranie z ustawieniem: ile meczów rozegrano w danej formacji (rośnie znajomość)
  karaPunktowa?: number; // ujemne punkty nałożone przez PZPN w TYM sezonie (zadłużenie/licencja) — odejmowane w tabeli
  stadion: string; // nazwa stadionu
  murawa?: "podgrzewana" | "naturalna" | "sztuczna"; // rodzaj boiska: podgrzewana (Ekstraklasa/I liga), naturalna (środek), sztuczna (niższe ligi — gra zimą)
  pojemnosc: number; // pojemność stadionu
  adres: string; // adres klubu (edytowalny)
  obiekty: Obiekty; // obiekty wokół stadionu (poziomy 0–4)
  akademia?: number; // poziom akademii młodzieży 1–5 (wpływa na liczbę i jakość wychowanków)
  numeryZastrzezone?: number[]; // numery zastrzeżone po legendach klubu (nie nadawane nowym zawodnikom)
  trybunaImienia?: string; // trybuna/stadion nazwany po zasłużonej legendzie (duma, atmosfera)
  wlasciciel?: WlasnoscKlubu; // model własności klubu (realia PL): wpływa na kasę, nastroje kibiców i ryzyka
  inwestorCierpliwosc?: number; // 0–100, tylko dla inwestora: wyniki poniżej celu obniżają; przy 0 wycofuje się z klubu
  oswietlenie?: boolean; // maszty oświetleniowe (wymóg licencyjny II ligi+; umożliwiają mecze pod światłami)
  monitoring?: boolean; // monitoring stadionu / system identyfikacji kibiców (wymóg licencyjny wyższych szczebli)
  zalozony?: number; // rok założenia klubu (jeśli znany — fakt publiczny)
  seria?: number; // passa: dodatnia = seria zwycięstw, ujemna = seria porażek (0 = brak / po remisie)
  sztab?: Sztab; // sztab szkoleniowy (tylko klub gracza) — zatrudniani specjaliści
  // Trener rywala (pierwszy szkoleniowiec klubu) — realny gdzie udokumentowany, inaczej wygenerowany.
  trenerImie?: string;
  trenerNazwisko?: string;
  trenerOd?: number; // sezon (rok) objęcia zespołu
  trenerReal?: boolean; // true = realny, udokumentowany szkoleniowiec; false = wygenerowany
  trenerLicencja?: "C" | "B" | "A" | "PRO"; // licencja UEFA trenera klubu
  trenerHistoria?: { klub: string; od: number; do: number | null }[]; // wcześniejsze kluby (najnowsze pierwsze)
  trenerKontraktTyp?: KontraktTyp; // kontrakt trenera z klubem — jak u piłkarzy (zawodowy/półprof./amator wg szczebla)
  trenerKontraktDo?: number; // ostatni sezon umowy trenera (po wygaśnięciu bez przedłużenia — odchodzi)
  trenerWiek?: number;
  trenerPensja?: number; // zł/kolejkę
}

export interface Wynik {
  dom: string;
  gosc: string;
  gd: number;
  gg: number;
  zdarzenia?: Zdarzenie[]; // tylko mecze gracza
  kara?: number; // kara dyscyplinarna Twojego klubu za kartki w tym meczu (zł, PZPN)
  staty?: { pos: [number, number]; strz: [number, number]; celne: [number, number]; rozne: [number, number]; xg?: [number, number]; faule?: [number, number]; spalone?: [number, number]; slupki?: [number, number]; obronione?: [number, number] }; // statystyki meczu (posiadanie %, strzały, celne, rożne, xG, faule, spalone, słupki, obrony)
  sedzia?: { glowny: string; styl: "łagodny" | "normalny" | "surowy"; asystenci: string[]; techniczny?: string; var: boolean; avar: boolean; klasa?: string; varSedzia?: string; avarSedzia?: string; fifa?: boolean; real?: boolean; region?: string }; // obsada sędziowska meczu (PZPN): komplet + uprawnienia/klasa + VAR/AVAR; realni na szczeblu centralnym
  doliczony?: [number, number]; // doliczony czas gry [I połowa, II połowa] w minutach
}

export interface Zdarzenie {
  min: number;
  klubId: string;
  typ: "gol" | "kontuzja" | "zolta" | "czerwona" | "zawieszenie" | "zmiana" | "karny" | "samoboj" | "var";
  zawodnikId: string;
  opis: string;
}

export interface Liga {
  poziom: number;
  nazwa: string;
  kluby: string[];
  terminarz: [string, string][][]; // kolejki → pary [gospodarz, gość]
  wyniki: Wynik[][]; // wyniki per kolejka
}

export interface Taktyka {
  formacja: string; // np. "4-4-2"
  nastawienie: Nastawienie;
  sklad: string[]; // 11 id
  reczneSloty?: boolean; // true = kolejność `sklad` = sloty formacji ustawione ręcznie w edytorze boiska (bez przetasowań)
  auto: boolean; // true = asystent co kolejkę wybiera najlepszą jedenastkę (wg formy i kondycji)
  tempo?: "wolne" | "normalne" | "szybkie"; // tempo gry: szybkie = więcej bramek i zmęczenia
  pressing?: "niski" | "sredni" | "wysoki"; // pressing: wysoki = więcej odbiorów wysoko, ale ryzyko z tyłu i zmęczenie
  stylAtaku?: "posiadanie" | "skrzydla" | "dlugie" | "kontra" | "normalny"; // sposób rozegrania/ataku
  liniaObrony?: "niska" | "normalna" | "wysoka"; // ustawienie linii obrony (pułapka ofsajdowa vs blok)
  szerokosc?: "waska" | "normalna" | "szeroka"; // szerokość gry
  krycie?: "strefowe" | "za_czlowiekiem"; // sposób krycia w obronie
  role?: Record<string, string>; // rola taktyczna zawodnika: id → kod roli (np. NAP: "falszywa9", SP: "box2box")
}

export interface Wiadomosc {
  sezon: number;
  kolejka: number;
  tekst: string;
}

export interface Oferta {
  zawodnikId: string;
  klubId: string;
  kwota: number;
}

export interface Historia {
  sezon: number;
  liga: string;
  miejsce: number;
  wynik: "awans" | "spadek" | "utrzymanie" | "mistrz";
  puchar?: "region" | "glowny"; // zdobyty puchar w tym sezonie
  wyroznienia?: string[]; // indywidualne nagrody Twoich zawodników (król strzelców, jedenastka itd.)
}

/** Najlepsza jedenastka kolejki (liczona po każdej kolejce dla Twojej ligi). */
export interface GraczXI {
  id: string;
  imie: string;
  nazwisko: string;
  klub: string;
  poz: Pozycja;
  ocena: number; // ocena meczu 1–10
}
export interface XIKolejki {
  kolejka: number; // numer kolejki (1-indeksowany)
  liga: string;
  gracze: GraczXI[];
}

export interface Puchar {
  faza: "regionalny" | "glowny" | "odpadl" | "zdobyty" | "kwalifikacja"; // kwalifikacja = zdobyty PP regionu → 1/32 STS PP w następnym sezonie
  runda: number;
  harmonogram: number[]; // indeksy kolejek, w których gra się rundę
  przeciwnik: string | null;
  ostatniMecz: Wynik | null;
  nazwaRundy: string;
  zdobywcaRegion: string | null;
  zdobywcaGlowny: string | null;
  sciezka?: { nazwa: string; przeciwnik: string; wynik: string; awans: boolean; uSiebie: boolean }[]; // drabinka: przebyte rundy
  pole?: string[]; // pełne pole uczestników (id klubów) wciąż w grze — do losowania par
  pary?: { dom: string; gosc: string; wynik: string }[]; // pełne losowanie par ostatniej rundy (wszystkie mecze, nie tylko mój)
}

/** Jeden etap pracy trenera: klub, sezony i statystyki (narasta w trakcie gry). */
export interface WpisTrenera {
  klub: string;
  od: number; // sezon rozpoczęcia pracy
  do: number | null; // sezon odejścia; null = klub obecny
  mecze: number;
  w: number; // wygrane
  r: number; // remisy
  p: number; // porażki
  bz: number; // bramki zdobyte
  bp: number; // bramki stracone
  awanse: number;
  spadki: number;
  tytuly: number; // mistrzostwa ligi
}

/** Konferencja prasowa: pytanie dziennikarza + opcje odpowiedzi z efektami. */
export interface Konferencja {
  pytanie: string;
  kontekst: string; // krótki nagłówek (np. "Po wygranej")
  opcje: { tekst: string; morale: number; zarzad: number; kibice?: number; motywacja?: number; zawodnik?: { id: string; morale: number }; odzew: string }[];
  typ?: "przed" | "po";
  media?: string; // redakcja prowadząca pytania
  kolejne?: { kontekst: string; pytanie: string; opcje: Konferencja["opcje"] }[]; // pozostałe pytania
  nr?: number; ile?: number;
}

/** Realne dane europejskiego rywala (fakty publiczne + barwy klubu — bez herbu/składu). */
export interface EuroRywal {
  nazwa: string;
  kraj: string;
  miasto: string;
  stadion: string;
  pojemnosc: number;
  zalozony: number;
  kolor: string;
  kolor2: string;
}

/** Jeden mecz fazy ligowej (nowy format 36 drużyn). */
export interface MeczLigowy {
  przeciwnik: string;
  wynik: string;
  uSiebie: boolean;
  dane?: EuroRywal;
  sedzia?: string; // realny sędzia międzynarodowy (główny + VAR)
}

/** Europejska kampania pucharowa (Liga Mistrzów / Europy / Konferencji) — format od sezonu 2024/25. */
export interface Europa {
  rozgrywki: "LM" | "LE" | "LK";
  faza: "w_toku" | "odpadl" | "zdobyty";
  runda: number; // indeks bieżącego etapu
  przeciwnik: string | null; // nazwa europejskiego rywala (tekstowo)
  przeciwnikDane?: EuroRywal; // realne dane bieżącego rywala
  nazwaRundy: string;
  harmonogram: number[];
  fazaLigowa?: MeczLigowy[]; // mecze fazy ligowej (8 lub 6)
  pktLigowe?: number; // punkty zdobyte w fazie ligowej
  miejsceLigowe?: number; // miejsce w tabeli fazy ligowej (1–36)
  sciezka?: { nazwa: string; przeciwnik: string; wynik: string; awans: boolean; uSiebie: boolean; dane?: EuroRywal; sedzia?: string }[];
}

export interface StanGry {
  kadraOkna?: string[]; // przerwy FIFA już rozegrane („sezon-miesiąc")
  kadraMecze?: import("./reprezentacje").MeczKadry[]; // ostatnie mecze reprezentacji
  meczLive?: import("./meczNaZywo").MeczLive; // mecz obejrzany na żywo — czeka na rozliczenie w kolejce
  przetarg?: import("./budowy").Przetarg; // otwarty przetarg na budowę
  budowy?: import("./budowy").Budowa[]; // trwające budowy na stadionie
  slotId?: string; // id slotu zapisu tej kariery („Zapisz grę" nadpisuje ten slot)
  wersja: 1;
  trener: string;
  trenerZdjecie?: string; // wgrane zdjęcie trenera (data URI) — lokalnie
  trenerKariera?: WpisTrenera[]; // historia prowadzonych klubów ze statystykami
  treningiTydzien?: number; // wybrana liczba treningów w tygodniu Twojego klubu (domyślnie wg poziomu)
  obozSezon?: number; // sezon, w którym wykorzystano już obóz (zgrupowanie) w przerwie
  trenerKontraktDo?: number; // ostatni sezon objęty kontraktem trenera
  trenerPensja?: number; // wartość kontraktu trenera (zł/sezon)
  trenerAgent?: string; // agent trenera — negocjuje kontrakt i załatwia kluby
  trenerLicencja?: "C" | "B" | "A" | "PRO"; // licencja trenerska UEFA (rośnie z doświadczeniem)
  powodWolny?: "zwolniony" | "wygasl"; // dlaczego trener jest bez klubu
  ofertyTrenera?: { klubId: string; sezon: number; pensja: number; lata?: number; obecny?: boolean }[];
  kwalifikacjaPP?: number; // sezon, w którym klub gracza (zdobywca PP na szczeblu ZPN) startuje w 1/32 STS Pucharu Polski
  propozycjaTrenera?: { pensja: number; lata: number; rundy: number; status: "otwarta" | "wycofana" | "odrzucona"; ostatniaProsba?: { pensja: number; lata: number } }; // przedłużenie od zarządu (ostatni sezon umowy) // oferty pracy od innych klubów (gdy masz dobre wyniki)
  skauting?: { region: string; kolejkiDo: number }; // aktywna misja skautingowa (region + kolejka zakończenia)
  odkryci?: string[]; // id odkrytych talentów (bezklubowi, obserwowani — watchlista skauta)
  sciezka: string; // nazwa ścieżki (region)
  wymiana: number[]; // [i] = ile drużyn awansuje z poziomu i+2 do i+1 (= ile spada)
  sezon: number;
  kolejka: number; // indeks najbliższej kolejki
  mojKlub: string;
  kluby: Record<string, Klub>;
  zawodnicy: Record<string, Zawodnik>;
  ligi: Liga[];
  wolni: string[]; // bez klubu
  taktyka: Taktyka;
  niedostepni: Record<string, string>; // id → powód (amatorzy)
  zarzad: number; // zaufanie zarządu 0–100
  cenaBiletu?: number; // mnożnik ceny biletu klubu gracza (0,7–1,7; 1 = normalnie) — wpływa na frekwencję i wpływy z biletów (B3)
  karnety?: number; // udział pojemności sprzedany jako karnety (0–0,5) — gwarantowana frekwencja + wpływ z góry na start sezonu (B3)
  zaufanieKibicow?: number; // zaufanie/entuzjazm kibiców 0–100 (wpływa na frekwencję i presję)
  zakazTrybun?: number; // liczba najbliższych meczów u siebie do rozegrania przy pustych/ograniczonych trybunach (kara ZPN za oprawy)
  celPodniesiony?: boolean; // czy zarząd podniósł już cel w tym sezonie (dynamiczne oczekiwania)
  cel: string;
  celDlugo?: { opis: string; typ: "awans" | "gornapolowa" | "stabilizacja"; doSezonu: number; startPoziom: number }; // wieloletni cel zarządu (np. awans w ciągu 3 sezonów)
  wiadomosci: Wiadomosc[];
  oferty: Oferta[];
  historia: Historia[];
  xiKolejki?: XIKolejki; // najlepsza jedenastka ostatniej kolejki (Twoja liga)
  xiHistoria?: XIKolejki[]; // archiwum jedenastek kolejek z sezonu
  konferencja?: Konferencja;
  motywacjaMeczu?: number;
  negocjacje?: import("./transfery").Negocjacja[]; // transfery w toku (etapy rozłożone w dniach)
  licznikDni?: number; // licznik dni gry (kalendarz)
  obserwowani?: string[]; // lista obserwowanych zawodników
  jesienZapisana?: number; // sezon, w którym zapisano stan meczów po rundzie jesiennej
  okres?: import("./okres").Okres; // trwający okres przygotowawczy (lato/zima)
  zimaSezon?: number; // sezon, w którym rozegrano już przerwę zimową
  dzien?: number; // dzień tygodnia w kalendarzu (0 = poniedziałek … 6 = niedziela); mecz ligowy w sobotę
  treningiDni?: number; // ile dni treningowych tego tygodnia już wykonano (każdy = 1/3 tygodniowego treningu)
  raportyDni?: { data: string; tytul: string; ikona: string; wpisy: string[] }[]; // dziennik kalendarza (ostatnie dni)
  powolaniKlubowi?: string[]; // zawodnicy z innych zespołów klubu (I/II/III) powołani na najbliższy mecz Twojego zespołu
  ostatnieSklady?: Record<string, string[]>; // ostatnia XI zespołów klubów wielozespołowych (do limitów powołań)
  rozmiaryStart?: number[];
  meczeJun?: { kat: KatJun; sezon: number; kolejka: number; rywal: string; dom: boolean; moje: number; ich: number; strzelcy: string[]; najlepszy?: string }[]; // ostatnie mecze juniorów Twojego klubu // typowe liczebności lig (z początku kariery) — klasy A/B/C wahają się wokół nich // efekt konferencji przedmeczowej (±) na najbliższy mecz gracza // oczekująca konferencja prasowa (pytanie + opcje odpowiedzi)
  europa?: Europa; // europejska kampania w tym sezonie (jeśli zakwalifikowani)
  ostatnieOceny?: { id: string; ocena: number }[]; // oceny Twoich zawodników z ostatniego meczu
  zwolniony: boolean;
  licznikId: number;
  koniecSezonu: boolean;
  puchar: Puchar | null;
  juniorRozgrywki?: RozgrywkiJun; // ligi i puchary juniorów (U-19, U-17) w regionie
  rekordy?: Rekordy; // rekordy klubu (najlepsze miejsce, punkty, król strzelców, największa wygrana)
  testRynek?: string[]; // pula kandydatów na testy (niższe ligi) — do przeglądania w oknie transferowym
  sztabWolni?: Pracownik[]; // rynek wolnych specjalistów sztabu (bez klubu) — zatrudniasz stąd, odchodzący tu wracają
  trenerzyWolni?: { imie: string; nazwisko: string; licencja: "C" | "B" | "A" | "PRO"; wiek?: number; historia: { klub: string; od: number; do: number | null }[] }[]; // rynek wolnych trenerów (zwolnieni/odeszli) — kluby biorą stąd następców
  sedziowie?: Sedziowie; // kadra sędziowska świata: realna (szczebel centralny) + generowana regionalna (wg PZPN)
  superpuchar?: { sezon: number; zwyciezca: string; przegrany: string; wynik: string }; // ostatni Superpuchar Polski (mistrz vs zdobywca PP)
  wykonawcy?: { karne?: string; wolne?: string; rozne?: string }; // wyznaczeni wykonawcy stałych fragmentów (id zawodników klubu gracza)
  trening: Trening; // ukierunkowanie treningu klubowego
  treningIntensywnosc?: Intensywnosc; // intensywność treningu (rozwój vs zmęczenie/kontuzje)
  treningAuto?: boolean; // true = sztab (asystent) sam dobiera fokus treningu co tydzień
  mlodziezoweWystepy?: number; // ile kolejek w sezonie wystawiłeś młodzieżowca U-21 w pierwszym składzie
  zaleglosc?: number; // przełożone mecze do odrobienia w środtygodniu — kumulują zmęczenie w kolejnej kolejce
  miesiacSnapshot?: Record<string, number>; // migawka dorobku zawodników do wyboru Zawodnika Miesiąca
  kapitan: string | null; // id kapitana
  sponsorzy: Sponsor[]; // sponsorzy klubu gracza (główny, techniczny, stadionowy)
}

/** Role w sztabie szkoleniowym. */
/** Jeden sędzia w kadrze świata: imię/nazwisko, klasa uprawnień (szczebel PZPN), region kolegium, odznaka FIFA. */
export interface SedziaOsoba { imie: string; nazwisko: string; klasa: string; region: "centralny" | "pomorskie" | "malopolskie" | "zachodniopomorskie" | "kujawsko-pomorskie"; fifa?: boolean; }
/** Kadra sędziowska świata. Szczebel centralny = realni (Ekstraklasa/I/II liga + Puchar Polski); region = generowani (III liga→B klasa + puchary wojewódzkie). */
export interface Sedziowie {
  ekstraklasa: SedziaOsoba[]; // sędziowie główni Ekstraklasy (realni)
  asystenci: SedziaOsoba[];   // sędziowie asystenci szczebla centralnego (realni)
  var: SedziaOsoba[];         // sędziowie VAR (realni)
  iLiga: SedziaOsoba[];       // sędziowie główni I ligi (realni)
  iiLiga: SedziaOsoba[];      // sędziowie główni II ligi (realni)
  region: SedziaOsoba[];      // generowani sędziowie regionu gry (III liga→B klasa + puchar wojewódzki)
}

export type RolaSztabu = "asystent" | "bramkarzy" | "fizjo" | "kondycja" | "skaut" | "analityk";
/** Jeden członek sztabu — działa jak piłkarz: kontrakt (typ + do kiedy), wiek, może być bez klubu (wolny). */
export interface Pracownik {
  id?: string; // stabilna tożsamość (rynek wolnych / historia)
  imie: string;
  nazwisko: string;
  rola?: RolaSztabu; // specjalizacja
  poziom: number; // 1–5 (jakość)
  pensja: number; // zł za kolejkę
  wiek?: number;
  kontraktTyp?: KontraktTyp; // zawodowy / półprofesjonalny / amator — wg szczebla klubu
  kontraktDo?: number; // ostatni sezon umowy (jak u piłkarzy); brak = wolny/bezterminowy
  lata?: number; // doświadczenie (sezony w zawodzie) — do opisu/rynku
}
/** Sztab szkoleniowy klubu — po jednym etacie na rolę (pusty = wakat). Każdy klub (Ekstraklasa→B klasa) ma swój. */
export type Sztab = Partial<Record<RolaSztabu, Pracownik>>;

export type SponsorTyp =
  | "glowny" | "techniczny" | "stadionowy" | "producent"               // 4 kluczowe (odnawiane automatycznie co sezon)
  | "rekaw" | "plecy" | "spodenki"                                     // dodatkowe miejsca na stroju
  | "bandy" | "telebim" | "trybuna"                                    // reklama na stadionie (bandy LED, telebim, nazwa trybuny)
  | "napoje" | "medyczny" | "motoryzacyjny" | "finansowy" | "bukmacher" | "medialny" | "akademia"; // partnerzy branżowi

export interface Sponsor {
  nazwa: string;
  wartosc: number; // zł za sezon
  typ: SponsorTyp;
  sezonDo: number; // sezon, do którego obowiązuje kontrakt
  patron?: boolean; // lokalny patron / zakład pracy związany z klubem: płaci mniej, ale lojalny i podnosi zaufanie trybun
}

export type Trening =
  | "ogolny" | "atak" | "obrona" | "mlodziez" | "kondycja" | "stale" | "technika" | "zgranie"
  | "wykonczenie" | "podania" | "drybling" | "szybkosc" | "fizycznosc" | "czytanie" | "bramkarski";

export type Intensywnosc = "lekki" | "normalny" | "intensywny";

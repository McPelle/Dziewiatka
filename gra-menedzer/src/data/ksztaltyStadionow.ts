// Przybliżony PRAWDZIWY kształt stadionów (3D): które boki mają trybuny, ile poziomów, dachy, narożniki, bieżnia,
// kolorystyka krzesełek i elewacji. Klucz = nazwa klubu dokładnie jak w danych gry (kluby.ts / pomorskie.ts / …).
// Źródła: stadiony.net / stadiumdb.com / Wikipedia, zdjęcia obiektów (stan wiedzy: listopad 2026). To UPROSZCZENIE —
// gra rysuje stadion z prostych brył; pojemność i tak bierze z klubu (rozbudowa stadionu dokłada rzędy).
// Pola oznaczone „(?)" w opisie to fakty niepotwierdzone w źródłach — przybliżenie na podstawie zdjęć/barw klubu.
//
// Układ boków w 3D: S = trybuna główna (po stronie ławek rezerwowych i kamery TV), N = naprzeciw głównej,
// W i E = trybuny za bramkami.

export type BokTrybuny = "S" | "N" | "W" | "E";

export interface TrybunaKsztalt {
  /** udział w pojemności (wagi — normalizowane względem pozostałych trybun) */
  u: number;
  /** liczba poziomów (domyślnie 1) */
  p?: 1 | 2;
  /** zadaszona */
  dach?: boolean;
  /** długość jako ułamek boku (domyślnie 1 = cała długość) */
  d?: number;
  /** stara trybuna: dach na słupach od strony boiska, beton */
  stara?: boolean;
  /** własna paleta krzesełek tej trybuny (inaczej paleta stadionu) */
  k?: string[];
}

export interface KsztaltStadionu {
  trybuny: Partial<Record<BokTrybuny, TrybunaKsztalt>>;
  /** zabudowane narożniki (zamknięta „misa") */
  narozniki?: boolean;
  /** kształt dachu: płaski (domyślnie) albo łukowy/falisty */
  dachTyp?: "plaski" | "luk";
  /** bieżnia wokół boiska: lekkoatletyczna (czerwony tartan) albo żużlowa */
  bieznia?: "lekkoatletyczna" | "zuzlowa";
  /** paleta krzesełek (powtórzenie koloru = większy udział); brak → barwy klubu */
  krzeselka?: string[];
  /** paleta górnego poziomu (jeśli inna niż dolnego) */
  krzeselkaGorne?: string[];
  /** rozkład kolorów: jednolity, sektory (naprzemiennie), mozaika (losowo), pasy (rzędami) */
  wzor?: "jednolity" | "sektory" | "mozaika" | "pasy";
  /** kolor elewacji/zewnętrznych ścian trybun */
  elewacja?: string;
  /** kolor pokrycia dachu */
  dachKolor?: string;
  /** otoczenie stadionu (nadpisuje heurystykę miasto/wieś) */
  otoczenie?: "metropolia" | "miasto" | "wies";
  /** krótki opis obiektu */
  opis: string;
}

// pomocnicze: pełna zamknięta misa (4 trybuny + narożniki, pełny dach)
const misa = (p: 1 | 2, krzeselka: string[], wzor: KsztaltStadionu["wzor"], opis: string, extra: Partial<KsztaltStadionu> = {}): KsztaltStadionu => ({
  trybuny: { S: { u: 0.3, p, dach: true }, N: { u: 0.28, p, dach: true }, W: { u: 0.21, p, dach: true }, E: { u: 0.21, p, dach: true } },
  narozniki: true, krzeselka, wzor, opis, ...extra,
});
// 4 osobne zadaszone trybuny z otwartymi narożnikami
const czteryOsobne = (krzeselka: string[], wzor: KsztaltStadionu["wzor"], opis: string, extra: Partial<KsztaltStadionu> = {}): KsztaltStadionu => ({
  trybuny: { S: { u: 0.32, dach: true }, N: { u: 0.3, dach: true }, W: { u: 0.19, dach: true }, E: { u: 0.19, dach: true } },
  krzeselka, wzor, opis, ...extra,
});
// mały stadion: zadaszona trybuna główna + odkryta naprzeciw
const glownaIOdkryta = (krzeselka: string[] | undefined, opis: string, extra: Partial<KsztaltStadionu> = {}, dN = 0.7): KsztaltStadionu => ({
  trybuny: { S: { u: 0.65, dach: true, d: 0.75 }, N: { u: 0.35, d: dN } },
  krzeselka, wzor: "sektory", opis, ...extra,
});

export const KSZTALTY_STADIONOW: Record<string, KsztaltStadionu> = {
  // ——— PKO BP Ekstraklasa ———
  "Lech Poznań": misa(2, ["#1d3f94", "#1d3f94", "#16306e", "#1d3f94", "#ffffff"], "mozaika",
    "Enea Stadion: zamknięta misa, dwa poziomy na wszystkich bokach (trybuna za bramką trzypoziomowa), pełny dach; krzesełka niebieskie z bielą (?).",
    { trybuny: { S: { u: 0.3, p: 2, dach: true }, N: { u: 0.28, p: 2, dach: true }, W: { u: 0.21, p: 2, dach: true }, E: { u: 0.21, p: 2, dach: true } }, elewacja: "#8a8f96" }),
  "Legia Warszawa": misa(2, ["#00703c", "#00703c", "#0b5e33"], "mozaika",
    "Stadion Wojska Polskiego: zamknięta misa, dwa poziomy, pełny dach; dolny poziom zielony, górny mieszanka zieleni, bieli i czerwieni.",
    { krzeselkaGorne: ["#00703c", "#00703c", "#ffffff", "#c8102e"], elewacja: "#3d4248" }),
  "Śląsk Wrocław": misa(2, ["#1f7a3a", "#1f7a3a", "#ffffff", "#c8102e", "#8c9096"], "mozaika",
    "Tarczyński Arena: dwupoziomowa misa pod pełnym dachem, półprzezroczysta elewacja z siatki; krzesełka wielobarwne (?).",
    { elewacja: "#d9d3c4" }),
  "Górnik Zabrze": {
    trybuny: { S: { u: 0.3, p: 2, dach: true }, N: { u: 0.22, dach: true }, W: { u: 0.24, p: 2, dach: true }, E: { u: 0.24, p: 2, dach: true } },
    narozniki: true, krzeselka: ["#c8102e", "#ffffff", "#1d3f94", "#1d3f94"], wzor: "mozaika", elewacja: "#2b2c30",
    opis: "Arena Zabrze: trzy dwupoziomowe zadaszone trybuny w podkowę z zamkniętymi narożnikami (2016) + domykana czwarta trybuna (?); mozaika czerwono-biało-niebieska, ciemna elewacja z rur.",
  },
  "Wisła Kraków": {
    trybuny: { S: { u: 0.32, p: 2, dach: true }, N: { u: 0.28, dach: true }, W: { u: 0.2, dach: true, k: ["#c8102e", "#c8102e", "#ffffff"] }, E: { u: 0.2, dach: true } },
    krzeselka: ["#c8102e", "#c8102e", "#ffffff", "#1d3f94"], wzor: "mozaika",
    opis: "Stadion im. Henryka Reymana: cztery osobne zadaszone trybuny, otwarte narożniki, główna dwupoziomowa (?); krzesełka czerwono-biało-niebieskie, za bramką biała gwiazda na czerwonym tle.",
  },
  "Jagiellonia Białystok": misa(1, ["#f2c230", "#c8102e"], "sektory",
    "Chorten Arena (Stadion Miejski w Białymstoku): jednopoziomowa misa z pełnym dachem; krzesełka żółto-czerwone (?)."),
  "Pogoń Szczecin": misa(1, ["#3a3d42", "#3a3d42", "#2a2c30", "#3a3d42", "#1b2a5c", "#7a1a2a"], "mozaika",
    "Stadion im. Floriana Krygiera (2022): jednopoziomowa zamknięta misa, pełny dach; dominują antracytowe krzesełka z akcentami granatu i bordo.",
    { elewacja: "#c9ccd0" }),
  "Cracovia": czteryOsobne(["#c8102e", "#ffffff"], "pasy",
    "Stadion Cracovii im. J. Piłsudskiego: cztery zadaszone trybuny, otwarte narożniki (?); krzesełka biało-czerwone („Pasy\")."),
  "Korona Kielce": misa(1, ["#f2c230", "#c8102e", "#f2c230"], "sektory",
    "Exbud Arena (Suzuki Arena): jednopoziomowa misa z pełnym dachem; trybuna główna z żółto-czerwonymi krzesełkami (od 2024), reszta mieszana (?).",
    { trybuny: { S: { u: 0.3, dach: true, k: ["#f2c230", "#c8102e"] }, N: { u: 0.28, dach: true }, W: { u: 0.21, dach: true }, E: { u: 0.21, dach: true } }, krzeselka: ["#2b5aa8", "#f2c230", "#2b5aa8"] }),
  "Motor Lublin": misa(1, ["#f2c230", "#f2c230", "#ffffff", "#1d3f94"], "mozaika",
    "Arena Lublin: jednopoziomowa misa z pełnym dachem; krzesełka w barwach Motoru (?)."),
  "Widzew Łódź": misa(1, ["#c8102e", "#c8102e", "#c8102e", "#ffffff"], "mozaika",
    "Stadion Widzewa („Serce Łodzi\", 2017): jednopoziomowa zamknięta misa, pełny dach; krzesełka czerwono-białe (?)."),
  "Zagłębie Lubin": misa(1, ["#f07d00", "#f07d00", "#1f7a3a", "#ffffff"], "mozaika",
    "Stadion Zagłębia Lubin: zamknięta misa z pełnym dachem; krzesełka pomarańczowo-zielone (?)."),
  "GKS Katowice": misa(1, ["#f2c230", "#1f7a3a", "#222222", "#222222"], "mozaika",
    "Arena Katowice (2024): jednopoziomowy stadion z pełnym dachem i zamkniętymi narożnikami; krzesełka w barwach GKS (?)."),
  "Wisła Płock": misa(1, ["#1d3f94", "#1d3f94", "#ffffff"], "mozaika",
    "Orlen Stadion im. Kazimierza Górskiego (przebudowa 2019–2023): jednopoziomowa misa pod dachem; krzesełka niebiesko-białe (?)."),
  "Radomiak Radom": misa(1, ["#1f7a3a", "#1f7a3a", "#ffffff"], "mozaika",
    "Stadion im. Braci Czachorów (2023): jednopoziomowy, zadaszony, zamknięte narożniki; krzesełka zielono-białe (?)."),
  "Piast Gliwice": misa(1, ["#1d3f94", "#c8102e", "#1d3f94"], "sektory",
    "Stadion Miejski w Gliwicach (2011): cztery zadaszone trybuny połączone w narożnikach; krzesełka niebiesko-czerwone (?)."),
  "Raków Częstochowa": {
    trybuny: { S: { u: 0.45, dach: true }, N: { u: 0.3, dach: true }, W: { u: 0.25, d: 0.8 } },
    krzeselka: ["#c8102e", "#1d3f94"], wzor: "sektory",
    opis: "Stadion Miejski przy Limanowskiego: kameralny (ok. 5,5 tys.), zadaszone trybuny wzdłuż boiska, odkryta za bramką (?).",
  },
  "Wieczysta Kraków": glownaIOdkryta(["#f2c230", "#222222"], "Stadion przy Chałupnika: kameralny obiekt, zadaszona trybuna główna (?).", {}, 0.5),

  // ——— Betclic 1. Liga ———
  "Lechia Gdańsk": misa(2, ["#1f6b3a", "#2d8a4a", "#5aa05a", "#1f6b3a", "#8ab45a"], "mozaika",
    "Polsat Plus Arena Gdańsk: dwupoziomowa misa pod pełnym dachem, bursztynowa elewacja z poliwęglanu; krzesełka w odcieniach zieleni (po proteście kibiców zamiast żółtych).",
    { elewacja: "#d98a1c", dachKolor: "#d9a54a" }),
  "Arka Gdynia": czteryOsobne(["#f2c230", "#1d5aa8"], "sektory",
    "Stadion Miejski w Gdyni (2011): cztery zadaszone jednopoziomowe trybuny, otwarte narożniki; żółto-niebieskie krzesełka."),
  "ŁKS Łódź": misa(1, ["#ffffff", "#ffffff", "#ffffff", "#c8102e"], "mozaika",
    "Stadion im. Władysława Króla: jednopoziomowa zadaszona misa; krzesełka biało-czerwone, z przewagą bieli."),
  "Polonia Warszawa": {
    trybuny: { S: { u: 0.45, dach: true, stara: true, d: 0.8 }, N: { u: 0.35, stara: true, d: 0.9 }, E: { u: 0.2, stara: true, d: 0.7 } },
    krzeselka: ["#222222", "#ffffff", "#c8102e"], wzor: "sektory",
    opis: "Stadion przy Konwiktorskiej: stara zadaszona trybuna główna, pozostałe odkryte betonowe łuki/trybuny; czarno-biało-czerwone krzesełka (?).",
  },
  "Ruch Chorzów": {
    trybuny: { S: { u: 0.4, dach: true }, N: { u: 0.25, stara: true }, W: { u: 0.18, stara: true, d: 0.8 }, E: { u: 0.17, stara: true, d: 0.8 } },
    krzeselka: ["#1d3f94", "#ffffff", "#1d3f94"], wzor: "sektory",
    opis: "Stadion przy Cichej: zadaszona trybuna główna, pozostałe trzy odkryte, stare (?); niebiesko-białe krzesełka.",
  },
  "Miedź Legnica": {
    trybuny: { S: { u: 0.35, dach: true }, N: { u: 0.3, dach: true }, W: { u: 0.17 }, E: { u: 0.18 } },
    krzeselka: ["#1f7a3a", "#1d3f94", "#c8102e"], wzor: "sektory",
    opis: "Stadion im. Orła Białego: cztery trybuny, zadaszone wzdłuż boiska, odkryte za bramkami (?).",
  },
  "Puszcza Niepołomice": glownaIOdkryta(["#1f7a3a", "#ffffff"], "Stadion Puszczy (ok. 2 tys.): zadaszona trybuna główna i mała naprzeciw (?)."),
  "Polonia Bytom": glownaIOdkryta(["#1d3f94", "#c8102e"], "Stadion Polonii Bytom: kameralna zadaszona trybuna główna (?)."),
  "Pogoń Grodzisk Mazowiecki": glownaIOdkryta(undefined, "Stadion Pogoni w Grodzisku Maz.: mała zadaszona trybuna (?).", { otoczenie: "miasto" }, 0.4),
  "Odra Opole": misa(1, ["#1d3f94", "#1d3f94", "#c8102e"], "mozaika",
    "Stadion Opolski (2024): jednopoziomowy, zadaszony, zamknięte narożniki (?); krzesełka niebiesko-czerwone (?)."),
  "Stal Rzeszów": {
    trybuny: { S: { u: 0.6, dach: true }, N: { u: 0.4 } }, bieznia: "lekkoatletyczna",
    krzeselka: ["#1d3f94", "#ffffff"], wzor: "sektory",
    opis: "Stadion Miejski w Rzeszowie (Hetmańska): bieżnia lekkoatletyczna, zadaszona trybuna główna, odkryta naprzeciw (?).",
  },
  "Stal Mielec": {
    trybuny: { S: { u: 0.35, dach: true }, N: { u: 0.35, dach: true }, W: { u: 0.15, dach: true }, E: { u: 0.15, dach: true } },
    krzeselka: ["#1d3f94", "#ffffff"], wzor: "sektory",
    opis: "Stadion Miejski w Mielcu: piłkarski (bez bieżni od przebudowy), cztery zadaszone trybuny (?).",
  },
  "Pogoń Siedlce": {
    trybuny: { S: { u: 0.7, dach: true, d: 0.85 }, N: { u: 0.3, d: 0.6 } }, bieznia: "lekkoatletyczna",
    krzeselka: ["#1d3f94", "#c8102e", "#ffffff"], wzor: "sektory",
    opis: "Stadion ROSRRiT w Siedlcach: bieżnia lekkoatletyczna, zadaszona trybuna główna.",
  },
  "Bruk-Bet Termalica Nieciecza": {
    trybuny: { S: { u: 0.4, dach: true }, N: { u: 0.3, dach: true }, W: { u: 0.15, d: 0.8 }, E: { u: 0.15, d: 0.8 } },
    wzor: "sektory", otoczenie: "wies",
    opis: "Stadion Bruk-Bet Termaliki w Niecieczy: stadion w środku wsi (ok. 4,6 tys.), zadaszone trybuny wzdłuż boiska, otoczony polami.",
  },
  "Unia Skierniewice": {
    trybuny: { S: { u: 0.7, dach: true, d: 0.8 }, N: { u: 0.3, d: 0.6 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Miejski w Skierniewicach: bieżnia lekkoatletyczna, zadaszona trybuna główna (?).",
  },
  "Warta Poznań": glownaIOdkryta(["#1f7a3a", "#ffffff"], "Stadion przy Drodze Dębińskiej („Ogródek\"): kameralny, zadaszona trybuna główna (?).", { otoczenie: "metropolia" }),
  "Podbeskidzie Bielsko-Biała": czteryOsobne(["#c8102e", "#ffffff", "#1d3f94"], "sektory",
    "Stadion Miejski w Bielsku-Białej (2016): cztery osobne trybuny pod falistymi, łukowymi dachami, otwarte narożniki.",
    { dachTyp: "luk", elewacja: "#e8e8e8" }),

  // ——— Betclic 2. Liga ———
  "Zawisza Bydgoszcz": {
    trybuny: { S: { u: 0.34, p: 2, dach: true }, N: { u: 0.3 }, W: { u: 0.18 }, E: { u: 0.18 } }, bieznia: "lekkoatletyczna",
    krzeselka: ["#1d3f94", "#1d3f94", "#222222", "#ffffff"], wzor: "mozaika",
    opis: "Stadion im. Zdzisława Krzyszkowiaka: owalna misa wokół 9-torowej bieżni lekkoatletycznej, zadaszona dwupoziomowa trybuna główna, reszta odkryta; krzesełka niebiesko-czarne (?).",
  },
  "GKS Tychy": czteryOsobne(["#1f7a3a", "#c8102e", "#222222", "#1f7a3a"], "mozaika",
    "Stadion Miejski w Tychach (2015): cztery osobne zadaszone trybuny (dach z poduszek), otwarte narożniki; krzesełka wielobarwne (?).",
    { dachKolor: "#eef2f4" }),
  "Olimpia Grudziądz": {
    trybuny: { S: { u: 0.6, dach: true, d: 0.9 }, N: { u: 0.4, d: 0.8 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Miejski w Grudziądzu: bieżnia lekkoatletyczna, zadaszona trybuna główna (?).",
  },
  "Śląsk II Wrocław": {
    trybuny: { S: { u: 0.45, dach: true, stara: true }, N: { u: 0.3, stara: true }, W: { u: 0.13, stara: true, d: 0.7 }, E: { u: 0.12, stara: true, d: 0.7 } },
    krzeselka: ["#1f7a3a", "#ffffff", "#c8102e"], wzor: "sektory",
    opis: "Stadion Oporowska: dawny stadion Śląska, zadaszona trybuna główna, odkryte pozostałe (?).",
  },
  "Sandecja Nowy Sącz": {
    trybuny: { S: { u: 0.5, dach: true }, N: { u: 0.3 }, W: { u: 0.2, d: 0.8 } },
    krzeselka: ["#1f7a3a", "#222222", "#ffffff"], wzor: "sektory",
    opis: "Stadion im. ojca Władysława Augustynka (w przebudowie): nowa zadaszona trybuna główna, odkryte pozostałe (?).",
  },
  "Podhale Nowy Targ": glownaIOdkryta(["#1f7a3a", "#c8102e"], "Stadion Podhala: mała zadaszona trybuna główna (?).", {}, 0.4),
  "Chojniczanka Chojnice": glownaIOdkryta(["#c8102e", "#ffffff"], "Stadion Miejski Chojniczanka 1930: zadaszona trybuna główna, odkryta naprzeciw (?)."),
  "Rekord Bielsko-Biała": glownaIOdkryta(undefined, "Centrum Sportu Rekord: mała zadaszona trybuna (?).", {}, 0.4),
  "Stal Stalowa Wola": {
    trybuny: { S: { u: 0.55, dach: true }, N: { u: 0.45, dach: true, d: 0.8 } },
    krzeselka: ["#2b5aa8", "#2b5aa8", "#3d8a3d"], wzor: "sektory",
    opis: "Podkarpackie Centrum Piłki Nożnej (2020): dwie zadaszone trybuny wzdłuż boiska (?).",
  },
  "Hutnik Kraków": {
    trybuny: { S: { u: 0.75, dach: true, d: 0.7 }, N: { u: 0.25, stara: true, d: 0.6 } }, bieznia: "lekkoatletyczna",
    krzeselka: ["#1d3f94", "#ffffff"], wzor: "sektory", otoczenie: "metropolia",
    opis: "Stadion Suche Stawy: duży stary obiekt z bieżnią, użytkowana głównie zmodernizowana trybuna główna (?).",
  },
  "Świt Szczecin": glownaIOdkryta(["#1f7a3a", "#f2c230"], "Obiekt MOSRiR Skolwin: mała trybuna (?).", { otoczenie: "miasto" }, 0.4),
  "Resovia": {
    trybuny: { S: { u: 0.5, dach: true }, N: { u: 0.3 }, W: { u: 0.1, d: 0.6 }, E: { u: 0.1, d: 0.6 } }, bieznia: "lekkoatletyczna",
    krzeselka: ["#c8102e", "#ffffff"], wzor: "sektory",
    opis: "Stadion Resovii (Wyspiańskiego): owalny obiekt z bieżnią, zadaszona trybuna główna (?).",
  },
  "Sokół Kleczew": glownaIOdkryta(undefined, "Stadion Miejski w Kleczewie: mała zadaszona trybuna (?).", { otoczenie: "wies" }, 0.4),
  "Górnik Łęczna": {
    trybuny: { S: { u: 0.4, dach: true }, N: { u: 0.3 }, W: { u: 0.15 }, E: { u: 0.15 } },
    krzeselka: ["#1f7a3a", "#222222"], wzor: "sektory",
    opis: "Stadion Górnika Łęczna: zadaszona trybuna główna, pozostałe odkryte (?); zielono-czarne krzesełka.",
  },
  "Znicz Pruszków": glownaIOdkryta(["#c8102e", "#ffffff"], "Stadion Znicza: zadaszona trybuna główna i mniejsza naprzeciw (?)."),
  "Legia II Warszawa": glownaIOdkryta(["#00703c", "#ffffff", "#c8102e"], "Legia Training Center: mała zadaszona trybuna przy boisku treningowym.", { otoczenie: "wies" }, 0.3),
  "Lechia Zielona Góra": {
    trybuny: { S: { u: 0.7, dach: true, d: 0.7 }, N: { u: 0.3, d: 0.5 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion MOSiR w Zielonej Górze: bieżnia lekkoatletyczna, zadaszona trybuna główna (?).",
  },
  "Avia Świdnik": {
    trybuny: { S: { u: 0.7, dach: true, d: 0.75 }, N: { u: 0.3, d: 0.6 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Miejski w Świdniku: bieżnia, zadaszona trybuna główna (?).",
  },

  // ——— Rozpoznawalne obiekty niższych lig (4 województwa gry) ———
  "Elana Toruń": {
    trybuny: { S: { u: 0.6, dach: true }, N: { u: 0.4, d: 0.8 } }, bieznia: "lekkoatletyczna",
    krzeselka: ["#f2c230", "#1d3f94"], wzor: "sektory",
    opis: "Stadion Miejski im. G. Duneckiego w Toruniu: bieżnia lekkoatletyczna, zadaszona trybuna główna (?).",
  },
  "Unia Tarnów": {
    trybuny: { S: { u: 0.35, dach: true }, N: { u: 0.35 }, W: { u: 0.15 }, E: { u: 0.15 } }, bieznia: "zuzlowa",
    krzeselka: ["#1d3f94", "#f2c230", "#ffffff"], wzor: "sektory",
    opis: "Stadion w Mościcach: owal z torem żużlowym, trybuny dookoła, zadaszona część główna (?).",
  },
  "Polonia Bydgoszcz": {
    trybuny: { S: { u: 0.35, dach: true }, N: { u: 0.35 }, W: { u: 0.15 }, E: { u: 0.15 } }, bieznia: "zuzlowa",
    krzeselka: ["#c8102e", "#ffffff", "#1d3f94"], wzor: "sektory",
    opis: "Stadion Polonii Bydgoszcz: obiekt żużlowy — owal trybun wokół toru (?).",
  },
  "Gryf Słupsk": {
    trybuny: { S: { u: 0.6, dach: true }, N: { u: 0.4 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion 650-lecia w Słupsku: bieżnia lekkoatletyczna, zadaszona trybuna główna (?).",
  },
  "Bałtyk Koszalin": {
    trybuny: { S: { u: 0.6, dach: true }, N: { u: 0.4 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Bałtyku w Koszalinie: bieżnia lekkoatletyczna, zadaszona trybuna główna (?).",
  },
  "Kotwica Kołobrzeg": {
    trybuny: { S: { u: 0.65, dach: true, d: 0.8 }, N: { u: 0.35, d: 0.7 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Miejski w Kołobrzegu: bieżnia lekkoatletyczna, zadaszona trybuna główna (?).",
  },
  "Błękitni Stargard": {
    trybuny: { S: { u: 0.65, dach: true, d: 0.8 }, N: { u: 0.35, d: 0.7 } }, bieznia: "lekkoatletyczna",
    krzeselka: ["#2b6fd6", "#ffffff"], wzor: "sektory", opis: "Stadion Miejski w Stargardzie: bieżnia, zadaszona trybuna główna (?).",
  },
  "Flota Świnoujście": {
    trybuny: { S: { u: 0.65, dach: true, d: 0.8 }, N: { u: 0.35, d: 0.6 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Miejski w Świnoujściu: bieżnia, zadaszona trybuna główna (?).",
  },
  "Cuiavia Inowrocław": {
    trybuny: { S: { u: 0.6, dach: true, d: 0.8 }, N: { u: 0.4, d: 0.8 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Miejski w Inowrocławiu: bieżnia lekkoatletyczna, zadaszona trybuna główna (?).",
  },
  "Garbarnia Kraków": glownaIOdkryta(undefined, "Stadion na Rydlówce: kameralna zadaszona trybuna (?).", { otoczenie: "metropolia" }, 0.4),
  // ——— Warmińsko-mazurskie i podlaskie (stadiony.net + pl.wikipedia, sprawdzone 11.2026; krzesełka — barwy klubu) ———
  "Stomil Olsztyn": {
    trybuny: { S: { u: 0.85, dach: true, stara: true }, E: { u: 0.15, d: 0.45 } },
    wzor: "sektory", opis: "Stadion OSiR w Olsztynie (1978): kryta trybuna prosta i czynny tylko łuk północno-wschodni (sektor gości ~500); bieżnię zlikwidowano w 2018. Nowy stadion na 10 tys. — w projektowaniu (PiG Architekci, 2026–2027).",
  },
  "Olimpia Elbląg": {
    trybuny: { S: { u: 0.45, dach: true, d: 0.9 }, N: { u: 0.35, d: 0.8 }, E: { u: 0.2, d: 0.5 } },
    wzor: "sektory", opis: "Stadion Miejski w Elblągu (ul. Agrykola 8): kryta trybuna prosta (814 miejsc pod dachem), sektor VIP i sektor gości na 750; od 08.2026 przebudowa płyty (podgrzewanie).",
  },
  "Wigry Suwałki": {
    trybuny: { S: { u: 0.55, p: 2, dach: true, d: 0.8 }, N: { u: 0.45, d: 0.85, stara: true } },
    wzor: "sektory", opis: "Stadion Miejski w Suwałkach: dwupoziomowa trybuna główna z 2011 (1 100 miejsc, 200 VIP), stara odkryta trybuna naprzeciw; podgrzewana murawa, oświetlenie.",
  },
  "ŁKS Łomża": {
    trybuny: { S: { u: 0.52, dach: true }, N: { u: 0.42 }, E: { u: 0.06, d: 0.3 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Miejski w Łomży: kryta trybuna główna (1 800), odkryta od strony Narwi (1 450), sektor gości ~200; bieżnia lekkoatletyczna, podgrzewana murawa.",
  },
  "Olimpia Zambrów": glownaIOdkryta(undefined, "Stadion Miejski w Zambrowie (999 miejsc): zadaszona trybuna główna, sektor gości 128; bieżnia.", { bieznia: "lekkoatletyczna" }, 0.5),
  "Polonia Lidzbark Warmiński": {
    trybuny: { S: { u: 0.6, dach: true, d: 0.55 }, N: { u: 0.4, d: 0.7 } }, bieznia: "lekkoatletyczna", dachKolor: "#7a4a24",
    wzor: "sektory", opis: "Stadion Miejski im. Henryka Wobalisa (1 600): trybuna główna z drewnianym zadaszeniem (480 miejsc pod dachem); bieżnia, oświetlenie.",
  },
  "Sokół Ostróda": {
    trybuny: { S: { u: 0.5, dach: true }, N: { u: 0.5 } },
    wzor: "sektory", opis: "Stadion Miejski w Ostródzie (2011): 4 998 krzesełek w sześciu trybunach wyłącznie wzdłuż boków — zachodnie kryte, wschodnie bez dachu; za bramkami brak trybun; podgrzewana murawa nad Jeziorem Drwęckim.",
  },
  "MKS Mazur Ełk": {
    trybuny: { S: { u: 0.74, dach: true }, N: { u: 0.26, d: 0.7, stara: true } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion Miejski im. Stefana Marcinkiewicza w Ełku: żelbetowa kryta trybuna od ul. Piłsudskiego (2 000) i odkryta na starym nasypie (720); bieżnia, brak oświetlenia.",
  },
  "Czarni Olecko": {
    trybuny: { S: { u: 1, d: 0.7 } },
    wzor: "sektory", opis: "Stadion w Olecku: jedyna trybuna — trawiasty nasyp z krzesełkami (599) i zadaszonym sektorem honorowym (126); sektor gości 56.",
  },
  "Warmia Grajewo": glownaIOdkryta(undefined, "Stadion Miejski im. Witolda Terleckiego (1 740): żelbetowa trybuna z zapleczem, częściowo zadaszona; sektor gości 240; brak oświetlenia.", {}, 0.35),
  "Puszcza Hajnówka": {
    trybuny: { S: { u: 0.74, dach: true, d: 0.75 }, N: { u: 0.26, d: 0.55 } }, bieznia: "lekkoatletyczna",
    wzor: "sektory", opis: "Stadion w Hajnówce: w pełni kryta trybuna główna z trzech segmentów (693) i dwie odkryte naprzeciw (2×124); 4-torowa bieżnia.",
  },
};

/** Kształt stadionu klubu (rezerwy „X II" grające na stadionie pierwszego zespołu — bez dopasowania). */
export function ksztaltStadionu(nazwa: string): KsztaltStadionu | undefined {
  return KSZTALTY_STADIONOW[nazwa];
}

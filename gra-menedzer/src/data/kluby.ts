// Kluby w grze. Edytuj śmiało: nazwa + miasto.
// Ekstraklasa, I liga, II liga: PRAWDZIWE składy sezonu 2026/2027 (źródło: pl.wikipedia.org, stan na listopad 2026).
// Niższe ligi (III liga – klasa C) są losowane z nazw miejscowości — wpisz tu prawdziwe kluby ze swojego regionu,
// a gra użyje ich zamiast wylosowanych (lista dla danego poziomu, brakujące miejsca dolosuje).

export interface KlubDane {
  nazwa: string;
  skrot: string;
  miasto: string;
  herb?: string; // klucz pliku herbu w assets/herby (patrz src/data/herby.ts)
  stadion?: string; // prawdziwa nazwa stadionu (jeśli znana); brak → generowana
  adres?: string; // prawdziwy adres klubu/stadionu (jeśli znany); brak → generowany
}

/** Ścieżka gracza przez piramidę: 9 lig od Ekstraklasy (indeks 0) do klasy C (indeks 8). */
export interface Sciezka {
  id: string;
  nazwa: string; // np. "Małopolska — podokręg Kraków"
  ligi: { nazwa: string; kluby: KlubDane[]; rozmiar?: number }[];
  // ile drużyn awansuje z poziomu i+2 do i+1 (= ile spada). Brak → WYMIANA_DOMYSLNA.
  wymiana?: number[];
}

/** Domyślna wymiana między poziomami, gdy ścieżka nie poda własnej. */
export const WYMIANA_DOMYSLNA = [3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

const k = (nazwa: string, skrot: string, miasto: string): KlubDane => ({ nazwa, skrot, miasto });

export const LIGI_NAZWY = [
  "PKO BP Ekstraklasa",
  "Betclic 1 Liga",
  "Betclic 2 Liga",
  "III liga",
  "IV liga",
  "Klasa okręgowa",
  "Klasa A",
  "Klasa B",
  "Klasa C",
];

// Liczba drużyn w lidze danego poziomu (indeks 0 = Ekstraklasa).
export const ROZMIAR_LIGI = [18, 18, 18, 18, 16, 16, 14, 14, 12];
// Ile drużyn awansuje z poziomu (i+1) do poziomu i (= ile spada z poziomu i).
export const WYMIANA = [3, 3, 2, 2, 2, 2, 2, 2];

export const KLUBY_PRAWDZIWE: Record<number, KlubDane[]> = {
  // PKO BP Ekstraklasa 2026/2027 (18). Awanse z I ligi: Wisła Kraków, Śląsk Wrocław, Wieczysta Kraków.
  1: [
    k("Lech Poznań", "LPO", "Poznań"),
    k("Górnik Zabrze", "GÓR", "Zabrze"),
    k("Jagiellonia Białystok", "JAG", "Białystok"),
    k("Raków Częstochowa", "RAK", "Częstochowa"),
    k("GKS Katowice", "GKS", "Katowice"),
    k("Legia Warszawa", "LEG", "Warszawa"),
    k("Zagłębie Lubin", "ZAG", "Lubin"),
    k("Wisła Płock", "WPŁ", "Płock"),
    k("Pogoń Szczecin", "POG", "Szczecin"),
    k("Radomiak Radom", "RAD", "Radom"),
    k("Korona Kielce", "KOR", "Kielce"),
    k("Motor Lublin", "MOT", "Lublin"),
    k("Cracovia", "CRA", "Kraków"),
    k("Widzew Łódź", "WID", "Łódź"),
    k("Piast Gliwice", "PIA", "Gliwice"),
    k("Wisła Kraków", "WKR", "Kraków"),
    k("Śląsk Wrocław", "ŚLĄ", "Wrocław"),
    k("Wieczysta Kraków", "WIE", "Kraków"),
  ],
  // Betclic 1. Liga 2026/2027 (18). Spadki z Ekstraklasy: Lechia Gdańsk, Arka Gdynia, Bruk-Bet Termalica.
  //                               Awanse z II ligi: Unia Skierniewice, Warta Poznań, Podbeskidzie.
  2: [
    k("Chrobry Głogów", "CHR", "Głogów"),
    k("ŁKS Łódź", "ŁKS", "Łódź"),
    k("Polonia Warszawa", "PWA", "Warszawa"),
    k("Ruch Chorzów", "RUC", "Chorzów"),
    k("Miedź Legnica", "MIE", "Legnica"),
    k("Puszcza Niepołomice", "PUS", "Niepołomice"),
    k("Polonia Bytom", "PBY", "Bytom"),
    k("Pogoń Grodzisk Mazowiecki", "PGR", "Grodzisk Mazowiecki"),
    k("Odra Opole", "ODR", "Opole"),
    k("Stal Rzeszów", "SRZ", "Rzeszów"),
    k("Stal Mielec", "SMI", "Mielec"),
    k("Pogoń Siedlce", "PSI", "Siedlce"),
    k("Lechia Gdańsk", "LGD", "Gdańsk"),
    k("Arka Gdynia", "ARK", "Gdynia"),
    k("Bruk-Bet Termalica Nieciecza", "TER", "Nieciecza"),
    k("Unia Skierniewice", "UNI", "Skierniewice"),
    k("Warta Poznań", "WAR", "Poznań"),
    k("Podbeskidzie Bielsko-Biała", "POD", "Bielsko-Biała"),
  ],
  // Betclic 2. Liga 2026/2027 (18). Awanse z III ligi (zwycięzcy grup): Legia II, Zawisza Bydgoszcz,
  //                               Lechia Zielona Góra, Avia Świdnik.
  3: [
    k("Olimpia Grudziądz", "OGR", "Grudziądz"),
    k("Śląsk II Wrocław", "ŚL2", "Wrocław"),
    k("Sandecja Nowy Sącz", "SAN", "Nowy Sącz"),
    k("Podhale Nowy Targ", "PNT", "Nowy Targ"),
    k("Chojniczanka Chojnice", "CHO", "Chojnice"),
    k("Rekord Bielsko-Biała", "REK", "Bielsko-Biała"),
    k("Stal Stalowa Wola", "SSW", "Stalowa Wola"),
    k("Hutnik Kraków", "HUT", "Kraków"),
    k("Świt Szczecin", "ŚWI", "Szczecin"),
    k("Resovia", "RES", "Rzeszów"),
    k("Sokół Kleczew", "SKL", "Kleczew"),
    k("Górnik Łęczna", "GŁĘ", "Łęczna"),
    k("Znicz Pruszków", "ZNI", "Pruszków"),
    k("GKS Tychy", "TYC", "Tychy"),
    k("Legia II Warszawa", "LE2", "Warszawa"),
    k("Zawisza Bydgoszcz", "ZAW", "Bydgoszcz"),
    k("Lechia Zielona Góra", "LZG", "Zielona Góra"),
    k("Avia Świdnik", "AVI", "Świdnik"),
  ],
};

// Realne stadiony i adresy klubów szczebli krajowych (wspólne dla wszystkich województw).
import { nalozKrajowe } from "./krajowe-adresy";
for (const lvl of [1, 2, 3]) if (KLUBY_PRAWDZIWE[lvl]) nalozKrajowe(KLUBY_PRAWDZIWE[lvl]);

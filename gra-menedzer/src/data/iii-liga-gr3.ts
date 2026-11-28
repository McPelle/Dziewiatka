// Poziom 4 — Betclic 3. Liga, grupa III (2026/2027; dolnośląskie / lubuskie / opolskie / śląskie).
// Źródło składu: pl.wikipedia.org „III liga polska w piłce nożnej (2026/2027)”, grupa III (stan 25.11.2026); stadiony: protokoły meczów regiowyniki.pl.
import { type KlubDane } from "./kluby";
import { nalozKrajowe } from "./krajowe-adresy";

const k = (nazwa: string, miasto: string, skrot: string, stadion?: string, adres?: string): KlubDane =>
  ({ nazwa, skrot, miasto, ...(stadion ? { stadion } : {}), ...(adres ? { adres } : {}) });

export const III_LIGA_GR3: KlubDane[] = [
  k("Zagłębie Sosnowiec", "Sosnowiec", "ZS", "ArcelorMittal Park", "Gen. Zaruskiego 2, Sosnowiec"),
  k("Sparta Katowice", "Katowice", "SK", "Boisko Piłkarskie Rapid", "Stęślickiego 6, Katowice"),
  k("Odra Bytom Odrzański", "Bytom Odrzański", "OBO", "Stadion Miejski", "Sportowa 12, Bytom Odrzański"),
  k("Miedź II Legnica", "Legnica", "ML", "Kompleks boisk piłkarskich", "Sportowców 1, Legnica"),
  k("Górnik Polkowice", "Polkowice", "GP", "Stadion KS-u Polkowice", "Kopalniana 4, Polkowice"),
  k("ROW 1964 Rybnik", "Rybnik", "R1R", "Stadion MOSiR", "Gliwicka 72, Rybnik"),
  k("Barycz Sułów", "Sułów", "BS", "Stadion LKS Barycz", "Polna 2, Sułów"),
  k("Zagłębie II Lubin", "Lubin", "ZL", "Stadion Zagłębia - boisko boczne", "Marii Skłodowskiej-Curie 98, Lubin"),
  k("LKS Goczałkowice-Zdrój", "Goczałkowice-Zdrój", "LGZ", "Panattoni Arena", "Józefa Krzyżanowskiego 1a, Goczałkowice-Zdrój"),
  k("Karkonosze Jelenia Góra", "Jelenia Góra", "KJG", "Stadion Miejski", "Złotnicza 12, Jelenia Góra"),
  k("MKS Kluczbork", "Kluczbork", "MK", "Stadion Miejski", "Sportowa 7, Kluczbork"),
  k("Stal Brzeg", "Brzeg", "SB", "Stadion Miejski", "Sportowa 1, Brzeg"),
  k("Ślęza Wrocław", "Wrocław", "ŚW", "Centrum Piłkarskie Ślęza", "Kłokczycka 5, Wrocław"),
  k("Stilon Gorzów Wielkopolski", "Gorzów Wielkopolski", "SGW", "Stadion OSiR", "Olimpijska 1, Gorzów Wielkopolski"),
  k("Carina Gubin", "Gubin", "CG", "Stadion Miejski", "Sikorskiego 89, Gubin"),
  k("Warta Gorzów Wielkopolski", "Gorzów Wielkopolski", "WGW", "Stadion OSiR", "Olimpijska 1, Gorzów Wielkopolski"),
  k("Polonia Nysa", "Nysa", "PN", "Stadion KS Polonia", "Sudecka 23, Nysa"),
  k("Raków II Częstochowa", "Częstochowa", "RC", "Miejski Stadion Piłkarski Raków - boisko sztuczne", "Limanowskiego 83, Częstochowa"),
];
nalozKrajowe(III_LIGA_GR3);

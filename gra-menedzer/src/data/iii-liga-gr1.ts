// Poziom 4 — Betclic 3. Liga, grupa I (2026/2027; łódzkie / mazowieckie / podlaskie / warmińsko-mazurskie).
// Źródło składu: pl.wikipedia.org „III liga polska w piłce nożnej (2026/2027)”, grupa I (stan 27.11.2026).
// Zmiany vs 2025/26: z II ligi spadł ŁKS II Łódź; z IV lig awansowały Pelikan Łowicz, KTS Weszło, Mazovia Mińsk Mazowiecki,
// Olimpia Zambrów i Polonia Lidzbark Warmiński.
import { type KlubDane } from "./kluby";
import { nalozKrajowe } from "./krajowe-adresy";

const k = (nazwa: string, miasto: string, skrot: string, stadion?: string, adres?: string): KlubDane =>
  ({ nazwa, skrot, miasto, ...(stadion ? { stadion } : {}), ...(adres ? { adres } : {}) });

export const III_LIGA_GR1: KlubDane[] = [
  k("KTS Weszło", "Warszawa", "KTS", "Stadion Hutnika Warszawa", "ul. Marymoncka 42, 01-977 Warszawa"),
  k("Wigry Suwałki", "Suwałki", "WIG", "Stadion Miejski w Suwałkach", "ul. Zarzecze 26, 16-400 Suwałki"),
  k("Świt Nowy Dwór Mazowiecki", "Nowy Dwór Mazowiecki", "ŚWI", "Stadion Miejski", "ul. Sportowa 66, 05-100 Nowy Dwór Mazowiecki"),
  k("Mazovia Mińsk Mazowiecki", "Mińsk Mazowiecki", "MMM", "Stadion Miejski", "ul. Sportowa 1, Mińsk Mazowiecki"),
  k("Warta Sieradz", "Sieradz", "SDZ", "Stadion MOSiR w Sieradzu", "ul. Sportowa 1, 98-200 Sieradz"),
  k("Pelikan Łowicz", "Łowicz", "PEL", "Stadion Pelikana Łowicz", "ul. Stefana Starzyńskiego 6/8, 99-400 Łowicz"),
  k("ŁKS II Łódź", "Łódź", "ŁK2", "Piłkarski Ośrodek Treningowy UMŁ", "ul. Minerska 19, Łódź"),
  k("Ząbkovia Ząbki", "Ząbki", "ZZA", "Dozbud Arena", "ul. Słowackiego 21, 05-091 Ząbki"),
  k("Wisła II Płock", "Płock", "WP2", "Stadion Miejski im. B. Szymańskiego", "ul. Sportowa 3, Płock"),
  k("Olimpia Zambrów", "Zambrów", "ZMB", "Stadion Miejski w Zambrowie", "ul. Kardynała Stefana Wyszyńskiego 8, 18-300 Zambrów"),
  k("Olimpia Elbląg", "Elbląg", "ELB", "Stadion Miejski w Elblągu", "ul. Agrykola 8, 82-300 Elbląg"),
  k("Polonia Lidzbark Warmiński", "Lidzbark Warmiński", "PLW", "Stadion Miejski im. Henryka Wobalisa", "ul. Bartoszycka 24, 11-100 Lidzbark Warmiński"),
  k("Jagiellonia II Białystok", "Białystok", "JA2", "Ośrodek treningowy Jagiellonii", "ul. Elewatorska 4, Białystok"),
  k("Lechia Tomaszów Mazowiecki", "Tomaszów Mazowiecki", "LTM", "Stadion Miejski im. Braci Gadajów", "ul. Nowowiejska 9/27, 97-200 Tomaszów Mazowiecki"),
  k("KS CK Troszyn", "Troszyn", "CKT", "Stadion Piłkarski w Troszynie", "ul. Juliusza Słowackiego, Troszyn"),
  k("Widzew II Łódź", "Łódź", "WI2", "Ośrodek Treningowy Łodzianka", "ul. Małachowskiego 5/7/9, Łódź"),
  k("Mławianka Mława", "Mława", "MŁA", "Stadion MOSiR-u w Mławie", "ul. Mikołaja Kopernika 38, 06-500 Mława"),
  k("ŁKS Łomża", "Łomża", "ŁOM", "Stadion Miejski w Łomży", "ul. Zjazd 18, 18-400 Łomża"),
];
nalozKrajowe(III_LIGA_GR1);

// Rejestr wojewódzkich związków piłki nożnej (ZPN) dostępnych w grze — jedno miejsce na regulaminy i nazwy,
// z którego korzystają puchar regionalny, baraże, limity zmian, zgłoszenia, sędziowie, juniorzy, logo i mapa.
// Rozpoznanie po nazwie ścieżki (np. „Kujawsko-Pomorskie — Toruń I") albo po nazwach lig świata gry.
import type { StanGry } from "./types";

export type KodZpn = "MZPN" | "POM" | "ZZPN" | "KP" | "WM" | "POD";
export type RegionZpn = "malopolskie" | "pomorskie" | "zachodniopomorskie" | "kujawsko-pomorskie" | "warminsko-mazurskie" | "podlaskie";

export interface DaneZpn {
  kod: KodZpn;
  region: RegionZpn;
  woj: string;                 // nazwa województwa (jak w engine/regiony.ts)
  prefiksy: string[];          // początek nazwy ścieżki
  wzorLigi: RegExp;            // rozpoznanie po nazwach lig (IV liga i niżej)
  mian: string; dop: string; skrot: string;
  przymiotnik: string;         // do nazw lig juniorów: „Pomorska Liga Juniorów"
  pucharKrotki: string;        // potoczna nazwa pucharu wojewódzkiego
  okregi: string[];            // podokręgi / kolegia sędziowskie
  /** Limit zmian wg szczebla (99 = zmiany powrotne bez limitu). */
  zmiany: { IV: number; OKR: number; A: number; B: number };
  /** Dogrywka w pucharze wojewódzkim: każdy mecz / od 1/8 finału / tylko finał. */
  dogrywkaPuchar: "zawsze" | "od18" | "final";
  /** Dogrywka w barażach o IV ligę i niżej (inaczej od razu karne). */
  dogrywkaBaraz: boolean;
  /** Baraże o IV ligę i niżej rozgrywane jako dwumecz (mecz i rewanż; pierwszy mecz u drużyny z niższej ligi). */
  barazDwumecz?: boolean;
}

export const ZPN: Record<KodZpn, DaneZpn> = {
  ZZPN: {
    kod: "ZZPN", region: "zachodniopomorskie", woj: "zachodniopomorskie", prefiksy: ["Zachodniopomorskie"], wzorLigi: /zachodniopomor/i,
    mian: "Zachodniopomorski ZPN", dop: "Zachodniopomorskiego ZPN", skrot: "ZZPN", przymiotnik: "Zachodniopomorska", pucharKrotki: "Puchar Zachodniopomorski",
    okregi: ["Szczecin", "Koszalin", "Stargard", "Kołobrzeg"], zmiany: { IV: 7, OKR: 7, A: 7, B: 99 }, dogrywkaPuchar: "final", dogrywkaBaraz: false,
  },
  KP: {
    kod: "KP", region: "kujawsko-pomorskie", woj: "kujawsko-pomorskie", prefiksy: ["Kujawsko-Pomorskie"], wzorLigi: /kujawsko/i,
    mian: "Kujawsko-Pomorski ZPN", dop: "Kujawsko-Pomorskiego ZPN", skrot: "K-PZPN", przymiotnik: "Kujawsko-Pomorska", pucharKrotki: "Puchar Kujawsko-Pomorski",
    okregi: ["Bydgoszcz", "Toruń", "Włocławek", "Grudziądz"], zmiany: { IV: 5, OKR: 5, A: 5, B: 7 }, dogrywkaPuchar: "od18", dogrywkaBaraz: true,
  },
  WM: {
    kod: "WM", region: "warminsko-mazurskie", woj: "warmińsko-mazurskie", prefiksy: ["Warmińsko-Mazurskie"], wzorLigi: /warmi[ńn]sko/i,
    mian: "Warmińsko-Mazurski ZPN", dop: "Warmińsko-Mazurskiego ZPN", skrot: "WMZPN", przymiotnik: "Warmińsko-Mazurska", pucharKrotki: "Wojewódzki Puchar Polski WMZPN",
    // regulamin WMZPN 2026/27: IV liga 7 zmian, okręgowa i A klasa 9, B klasa — zmiany powrotne; WPP: rundy I, II i 1/16 od razu karne,
    // od 1/8 dogrywka; baraże (mecz i rewanż) — dogrywka i karne
    okregi: ["Olsztyn", "Elbląg", "Ełk"], zmiany: { IV: 7, OKR: 9, A: 9, B: 99 }, dogrywkaPuchar: "od18", dogrywkaBaraz: true, barazDwumecz: true,
  },
  POD: {
    kod: "POD", region: "podlaskie", woj: "podlaskie", prefiksy: ["Podlaskie"], wzorLigi: /podlask/i,
    mian: "Podlaski ZPN", dop: "Podlaskiego ZPN", skrot: "PZPN Białystok", przymiotnik: "Podlaska", pucharKrotki: "Wojewódzki Puchar Polski Podlaskiego ZPN",
    // regulamin Podlaskiego ZPN 2026/27: IV liga 5 zmian, okręgowa i A klasa 6 (bez zmian powrotnych); puchar — dogrywka i karne
    // w każdej rundzie; baraże (dwumecz) — dogrywka i karne. Brak klasy B.
    okregi: ["Białystok", "Łomża", "Suwałki"], zmiany: { IV: 5, OKR: 6, A: 6, B: 6 }, dogrywkaPuchar: "zawsze", dogrywkaBaraz: true, barazDwumecz: true,
  },
  POM: {
    kod: "POM", region: "pomorskie", woj: "pomorskie", prefiksy: ["Pomorskie"], wzorLigi: /pomor/i,
    mian: "Pomorski ZPN", dop: "Pomorskiego ZPN", skrot: "Pomorski ZPN", przymiotnik: "Pomorska", pucharKrotki: "Puchar Pomorski",
    okregi: ["Gdańsk", "Słupsk", "Malbork", "Gdynia"], zmiany: { IV: 5, OKR: 5, A: 5, B: 6 }, dogrywkaPuchar: "zawsze", dogrywkaBaraz: false,
  },
  MZPN: {
    kod: "MZPN", region: "malopolskie", woj: "małopolskie", prefiksy: ["Małopolska"], wzorLigi: /ma[łl]opol/i,
    mian: "Małopolski ZPN", dop: "Małopolskiego ZPN", skrot: "MZPN", przymiotnik: "Małopolska", pucharKrotki: "Puchar Małopolski",
    okregi: ["Kraków", "Tarnów", "Nowy Sącz", "Wadowice"], zmiany: { IV: 5, OKR: 7, A: 7, B: 7 }, dogrywkaPuchar: "final", dogrywkaBaraz: false,
  },
};

// Kolejność sprawdzania ważna: „Zachodniopomorskie" i „Kujawsko-Pomorskie" zawierają „pomor".
const KOLEJNOSC: KodZpn[] = ["ZZPN", "KP", "WM", "POD", "POM", "MZPN"];

/** ZPN po nazwie ścieżki (regionu gracza). Domyślnie Małopolski (zachowanie sprzed rejestru). */
export function zpnSciezki(sciezka: string | undefined): DaneZpn {
  const sc = sciezka ?? "";
  for (const k of KOLEJNOSC) if (ZPN[k].prefiksy.some((p) => sc.startsWith(p))) return ZPN[k];
  for (const k of KOLEJNOSC) if (ZPN[k].wzorLigi.test(sc)) return ZPN[k];
  return ZPN.MZPN;
}
/** ZPN tylko, gdy ścieżka należy do znanego województwa (bez domyślnego Małopolskiego). */
export function zpnZnany(sciezka: string | undefined): DaneZpn | undefined {
  const sc = sciezka ?? "";
  for (const k of KOLEJNOSC) if (ZPN[k].prefiksy.some((p) => sc.startsWith(p))) return ZPN[k];
  return undefined;
}
/** ZPN gracza (po ścieżce, a gdy jej brak — po nazwach lig świata). */
export function zpnGracza(s: StanGry): DaneZpn {
  if (s.sciezka) return zpnSciezki(s.sciezka);
  const nazwy = s.ligi.map((l) => l.nazwa).join(" ");
  for (const k of KOLEJNOSC) if (ZPN[k].wzorLigi.test(nazwy)) return ZPN[k];
  return ZPN.MZPN;
}
/** Podokręg gracza z nazwy ścieżki („X — Olsztyn II" → „Olsztyn"). Puste, gdy brak. */
export function podokregSciezki(sciezka: string | undefined): string {
  const r = sciezka ?? ""; const i = r.indexOf(" — ");
  if (i < 0) return "";
  return r.slice(i + 3).replace(/\s+[IVX]+$/, "").split(" / ")[0].trim();
}
/** Szczebel regionalny ligi z nazwy (IV liga → klasa B). */
export function szczebelRegionalny(nazwaLigi: string, poziom: number): "IV" | "OKR" | "A" | "B" {
  if (poziom === 5) return "IV";
  if (/klasa B|B klasa|B-klas|klasa C/i.test(nazwaLigi)) return "B";
  if (/klasa A|A klasa|A-klas/i.test(nazwaLigi)) return "A";
  return "OKR";
}

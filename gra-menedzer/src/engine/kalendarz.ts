// Kalendarz sezonu: realny polski rytm jesień–wiosna z przerwą zimową.
// Silnik jest „kolejkowy", ale każdej kolejce przypisujemy realną datę (runda jesienna sie-gru,
// przerwa zimowa, runda wiosenna mar-cze). Sezon 0 = 2026/27.
import type { StanGry } from "./types";

const MIESIACE = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

function fmt(d: Date): string {
  return `${d.getDate()} ${MIESIACE[d.getMonth()]} ${d.getFullYear()}`;
}

/** Rok kalendarzowy rundy jesiennej. `sezon` w stanie gry to już realny rok (2026, 2027…). */
export function rokJesieni(sezon: number): number {
  return sezon >= 2000 ? sezon : 2026 + sezon; // odporność na 0-based w testach
}

/** Surowa data danej kolejki (do okien transferowych i wyświetlania). */
export function dateKolejki(sezon: number, liczbaKolejek: number, kolejka: number): Date {
  const half = Math.ceil(liczbaKolejek / 2);
  const rJ = rokJesieni(sezon), rW = rJ + 1;
  if (kolejka < half) { const d = new Date(rJ, 7, 2); d.setDate(d.getDate() + kolejka * 7); return d; }
  const d = new Date(rW, 2, 1); d.setDate(d.getDate() + (kolejka - half) * 7); return d;
}

/** Data (tekst) danej kolejki wg rytmu jesień/wiosna. */
export function dataKolejki(sezon: number, liczbaKolejek: number, kolejka: number): { tekst: string; runda: "jesienna" | "wiosenna"; pierwszaWiosenna: boolean } {
  const d = dateKolejki(sezon, liczbaKolejek, kolejka);
  const runda = kolejka < Math.ceil(liczbaKolejek / 2) ? "jesienna" : "wiosenna";
  return { tekst: fmt(d), runda, pierwszaWiosenna: kolejka === Math.ceil(liczbaKolejek / 2) };
}

export type RodzajOkna = "letnie" | "zimowe" | null;
export interface InfoOkna {
  otwarte: boolean;
  nazwa: RodzajOkna;
  /** Czy szczebel jest zawodowy (Ekstraklasa, I liga, II liga). Amatorskie mają szersze okna. */
  zawodowe: boolean;
  /** Zakres bieżącego/najbliższego okna (tekst do UI). */
  zakres: string;
}

/** Szczeble zawodowe PZPN: Ekstraklasa (1), I liga (2), II liga (3). Reszta = amatorskie (III liga → klasa B). */
export function ligaZawodowa(poziom: number): boolean {
  return poziom <= 3;
}

/** Zakres okna letniego/zimowego jako tekst, zależny od szczebla. */
export function zakresOkna(nazwa: Exclude<RodzajOkna, null>, zawodowe: boolean): string {
  if (nazwa === "letnie") return zawodowe ? "1 lipca – 8 września" : "1 lipca – 30 września";
  return zawodowe ? "zimowa przerwa – połowa marca" : "zimowa przerwa – początek kwietnia";
}

/**
 * Okno transferowe wg przepisów PZPN, zróżnicowane szczeblem.
 * ZAWODOWE (Ekstraklasa / I liga / II liga, poziom ≤ 3): letnie 1 VII–8 IX, zimowe krótkie (do poł. marca).
 * AMATORSKIE (III liga → klasa B): letnie 1 VII–30 IX, zimowe dłuższe (do początku kwietnia) —
 *   niższe ligi ruszają wiosnę później i mają dłuższy okres zmiany przynależności klubowej.
 * Między sezonami (koniecSezonu) traktujemy jak otwarte okno letnie.
 */
export function oknoTransferowe(
  sezon: number,
  liczbaKolejek: number,
  kolejka: number,
  koniecSezonu: boolean,
  poziom = 1,
): InfoOkna {
  const zawodowe = ligaZawodowa(poziom);
  if (koniecSezonu) return { otwarte: true, nazwa: "letnie", zawodowe, zakres: zakresOkna("letnie", zawodowe) };
  const d = dateKolejki(sezon, liczbaKolejek, kolejka);
  const m = d.getMonth(); // 0 = styczeń
  const dz = d.getDate();
  const otw = (nazwa: Exclude<RodzajOkna, null>): InfoOkna => ({ otwarte: true, nazwa, zawodowe, zakres: zakresOkna(nazwa, zawodowe) });

  // LETNIE: lipiec i sierpień zawsze; wrzesień — zawodowe tylko do 8, amatorskie cały miesiąc.
  if (m === 6 || m === 7) return otw("letnie");
  if (m === 8 && (!zawodowe || dz <= 8)) return otw("letnie");

  // ZIMOWE (przerwa zimowa → restart wiosenny): luty i marzec.
  if (m === 0 || m === 1) return otw("zimowe");                     // styczeń/luty
  if (m === 2 && (!zawodowe || dz <= 15)) return otw("zimowe");     // marzec: zawodowe do poł., amatorskie cały
  if (!zawodowe && m === 3 && dz <= 10) return otw("zimowe");       // amatorskie: początek kwietnia

  return { otwarte: false, nazwa: null, zawodowe, zakres: zawodowe ? "lato 1 VII–8 IX · zima do poł. marca" : "lato 1 VII–30 IX · zima do pocz. kwietnia" };
}

/** Pomocniczo ze stanu gry: data najbliższej kolejki mojej ligi. */
export function dataNajblizszej(s: StanGry, liczbaKolejek: number): { tekst: string; runda: "jesienna" | "wiosenna"; pierwszaWiosenna: boolean } {
  return dataKolejki(s.sezon, liczbaKolejek, s.kolejka);
}

/** Czy właśnie zaczyna się runda wiosenna (po przerwie zimowej). */
export function koniecPrzerwyZimowej(s: StanGry, liczbaKolejek: number): boolean {
  return s.kolejka === Math.ceil(liczbaKolejek / 2);
}

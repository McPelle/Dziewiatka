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
export function dateKolejki(sezon: number, liczbaKolejek: number, kolejka: number, kal?: KalSzczebla): Date {
  const half = Math.ceil(liczbaKolejek / 2);
  const rJ = rokJesieni(sezon), rW = rJ + 1;
  const [mJ, dJ] = kal?.startJesien ?? [8, 2], [mW, dW] = kal?.startWiosna ?? [3, 1];
  if (kolejka < half) { const d = new Date(rJ, mJ - 1, dJ); d.setDate(d.getDate() + kolejka * 7); return d; }
  const d = new Date(rW, mW - 1, dW); d.setDate(d.getDate() + (kolejka - half) * 7); return d;
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

// ——— Kalendarz szczebli: start rund i okresy przygotowawcze (lato / zima) ———
// Wartości wg typowych terminarzy PZPN/ZPN (Ekstraklasa startuje pod koniec lipca, klasy A/B pod koniec sierpnia;
// runda wiosenna: Ekstraklasa koniec stycznia/luty, niższe ligi marzec–kwiecień). Urlop i przygotowania liczone w dniach.
export interface KalSzczebla { startJesien: [number, number]; startWiosna: [number, number]; urlopLato: number; urlopZima: number; przygLato: number; przygZima: number }
// Realne terminarze 2026/27 (PZPN B1L/B2L/B3L, ekstraklasa.org, ramowe terminarze K-PZPN i ZZPN; MZPN i Pomorski ZPN —
// wiosna wg 2025/26). Urlop + przygotowania = przerwa między ostatnią a pierwszą kolejką danej rundy.
const KAL: { re: RegExp; k: KalSzczebla }[] = [
  // Warmińsko-Mazurski ZPN — ramowy kalendarz 2026/27 (wmzpn.pl): IV liga i okręgówka 1–2.08 → 14–15.11, wiosna od 6–7.03,
  // koniec 12–13.06; klasa A 15–16.08 → 14–15.11, wiosna od 20–21.03; klasa B 15–16.08 → 24–25.10, wiosna od 3–4.04.
  { re: /iv liga warmińsko|okręgowa — warmińsko/i, k: { startJesien: [8, 1], startWiosna: [3, 6], urlopLato: 21, urlopZima: 60, przygLato: 28, przygZima: 51 } },
  { re: /klasa a — warmińsko/i, k: { startJesien: [8, 15], startWiosna: [3, 20], urlopLato: 35, urlopZima: 77, przygLato: 28, przygZima: 48 } },
  { re: /klasa b — warmińsko/i, k: { startJesien: [8, 15], startWiosna: [4, 3], urlopLato: 35, urlopZima: 118, przygLato: 28, przygZima: 42 } },
  // Lubuski ZPN — terminarz jesień 2026 (lubuskizpn.pl): IV liga 1.08 → 21.11 (17 kolejek), okręgówka 8.08 → 14.11,
  // klasa A 15–16.08 → 15.11, klasa B 23.08 → 8.11 (wiosna 2027 jeszcze nieopublikowana — typowy rytm szczebla).
  { re: /iv liga lubuska|okręgowa — lubuska/i, k: { startJesien: [8, 1], startWiosna: [3, 7], urlopLato: 21, urlopZima: 56, przygLato: 28, przygZima: 50 } },
  { re: /klasa a — lubuska/i, k: { startJesien: [8, 15], startWiosna: [3, 21], urlopLato: 35, urlopZima: 74, przygLato: 28, przygZima: 47 } },
  { re: /klasa b — lubuska/i, k: { startJesien: [8, 23], startWiosna: [3, 28], urlopLato: 42, urlopZima: 98, przygLato: 28, przygZima: 42 } },
  // Opolski ZPN — terminarze 2026/27 (pilkaopolska.pl): IV liga 8.08 → 31.10, wiosna 13.03 → 5.06; okręgowa 8.08 → 7.11, wiosna 6.03;
  // klasa A 16.08 → 15.11, wiosna 7.03 → 19.06; klasa B 30.08 → 15.11, wiosna 14.03 → 6.06.
  { re: /iv liga opolska/i, k: { startJesien: [8, 8], startWiosna: [3, 13], urlopLato: 30, urlopZima: 80, przygLato: 32, przygZima: 52 } },
  { re: /okręgowa — opolska/i, k: { startJesien: [8, 8], startWiosna: [3, 6], urlopLato: 30, urlopZima: 66, przygLato: 32, przygZima: 52 } },
  { re: /klasa a — opolska/i, k: { startJesien: [8, 16], startWiosna: [3, 7], urlopLato: 25, urlopZima: 62, przygLato: 32, przygZima: 49 } },
  { re: /klasa b — opolska/i, k: { startJesien: [8, 30], startWiosna: [3, 14], urlopLato: 50, urlopZima: 70, przygLato: 34, przygZima: 49 } },
  // Podlaski ZPN — terminarz jesień 2026 (podlaskizpn.org): IV liga i okręgówka od 8–9.08 do 14–15.11; klasa A od 29–30.08
  // (wiosna 2027 jeszcze nieopublikowana — przyjęty typowy rytm szczebla).
  { re: /iv liga podlaska|okręgowa — podlaska/i, k: { startJesien: [8, 8], startWiosna: [3, 7], urlopLato: 26, urlopZima: 60, przygLato: 30, przygZima: 52 } },
  { re: /klasa a — podlaska/i, k: { startJesien: [8, 29], startWiosna: [3, 21], urlopLato: 50, urlopZima: 76, przygLato: 28, przygZima: 43 } },
  { re: /ekstraklasa/i, k: { startJesien: [7, 25], startWiosna: [1, 30], urlopLato: 27, urlopZima: 21, przygLato: 37, przygZima: 28 } },
  { re: /\b1\.? liga|\bi liga/i, k: { startJesien: [7, 25], startWiosna: [2, 6], urlopLato: 24, urlopZima: 21, przygLato: 33, przygZima: 35 } },
  { re: /\b2\.? liga|\bii liga/i, k: { startJesien: [7, 25], startWiosna: [2, 20], urlopLato: 24, urlopZima: 28, przygLato: 33, przygZima: 49 } },
  { re: /\b3\.? liga|\biii liga/i, k: { startJesien: [8, 1], startWiosna: [2, 27], urlopLato: 28, urlopZima: 35, przygLato: 36, przygZima: 56 } },
  { re: /iv liga/i, k: { startJesien: [8, 8], startWiosna: [3, 7], urlopLato: 26, urlopZima: 55, przygLato: 30, przygZima: 49 } },
  { re: /v liga|okręgow/i, k: { startJesien: [8, 15], startWiosna: [3, 14], urlopLato: 30, urlopZima: 70, przygLato: 30, przygZima: 43 } },
  { re: /klasa a/i, k: { startJesien: [8, 22], startWiosna: [3, 20], urlopLato: 42, urlopZima: 84, przygLato: 28, przygZima: 35 } },
  { re: /klasa (b|c)/i, k: { startJesien: [8, 29], startWiosna: [3, 28], urlopLato: 49, urlopZima: 98, przygLato: 28, przygZima: 36 } },
];
export function kalendarzSzczebla(nazwaLigi: string, poziom: number): KalSzczebla {
  return (KAL.find((x) => x.re.test(nazwaLigi)) ?? KAL[Math.min(KAL.length - 1, Math.max(0, poziom - 1))]).k;
}
/** Okres (lato/zima) dla poziomu: data startu urlopu, długość urlopu i przygotowań — tak, by kończyły się ze startem rundy. */
export function okresyDlaPoziomu(s: StanGry, poziom: number, rodzaj: "lato" | "zima"): { start: Date; urlop: number; przygotowania: number } {
  const k = kalendarzSzczebla(s.ligi[poziom - 1]?.nazwa ?? "", poziom);
  const rok = rodzaj === "lato" ? rokJesieni(s.sezon) : rokJesieni(s.sezon) + 1;
  const [m, d] = rodzaj === "lato" ? k.startJesien : k.startWiosna;
  const startRundy = new Date(rok, m - 1, d);
  const urlop = rodzaj === "lato" ? k.urlopLato : k.urlopZima, przyg = rodzaj === "lato" ? k.przygLato : k.przygZima;
  const start = new Date(startRundy); start.setDate(start.getDate() - urlop - przyg);
  return { start, urlop, przygotowania: przyg };
}

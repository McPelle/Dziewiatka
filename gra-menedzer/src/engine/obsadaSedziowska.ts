// Obsada sędziowska według szczebla rozgrywek (#135).
//
// Realia (źródła: Regulamin Kolegium Sędziów PZPN, Konwencja Sędziowska PZPN, Regulamin 1., 2. i 3. Ligi PZPN):
// • Ekstraklasa, I liga, II liga i III liga — obsadę wyznacza Kolegium Sędziów PZPN (KS PZPN). „Sędzia szczebla
//   centralnego" = uprawniony do prowadzenia zawodów Ekstraklasy, I, II lub III ligi. Ekstraklasa/I liga/II liga mają
//   realne listy sędziów w src/data/sedziowie.ts; III liga — sędziowie centralni GENEROWANI (brak realnej listy w danych).
// • IV liga i niżej (V liga, klasa okręgowa, A, B, C) — obsadę wyznacza Kolegium Sędziów wojewódzkiego ZPN
//   (lub jego podokręgu) — sędziowie wojewódzcy/okręgowi.
// • Przepisy Gry (IFAB, Przepis 6) dopuszczają w niższych rozgrywkach „asystentów klubowych" — w Polsce potocznie
//   „asystentów społecznych": gdy ZPN deleguje tylko sędziego głównego, chorągiewki trzymają przedstawiciele klubów.
//   Asystent klubowy sygnalizuje jedynie wyjście piłki poza boisko; o spalonym decyduje sam sędzia główny.
//
// UPROSZCZENIA GRY (nie są regułą PZPN, tylko modelem): prawdopodobieństwo meczu „bez asystentów z obsady" —
// klasa C 85%, klasa B 60%, klasa A 20%, wyżej 0% (w rzeczywistości zależy od kolegium, liczby sędziów i budżetu ZPN).
// Efekt: sędzia sam ocenia spalone z daleka → mniej odgwizdanych spalonych, więcej pomyłek (gole ze spalonego,
// niesłusznie anulowane bramki), protesty i komentarze w relacji.
import { wybierz } from "./losuj";
import { IMIONA, NAZWISKA } from "../data/nazwy";
import type { StanGry, Wynik } from "./types";

export type Szczebel = "ekstraklasa" | "1liga" | "2liga" | "3liga" | "4liga" | "5liga" | "okregowa" | "A" | "B" | "C";

/** Szczebel wg nazwy ligi (numer poziomu różni się między województwami: np. klasa B to poziom 8 albo 9). */
export function szczebelLigi(nazwa: string, poziom: number): Szczebel {
  const n = nazwa.toLowerCase();
  if (/ekstraklasa/.test(n)) return "ekstraklasa";
  if (/klasa c|c klasa|c-klas/.test(n)) return "C";
  if (/klasa b|b klasa|b-klas/.test(n)) return "B";
  if (/klasa a|a klasa|a-klas/.test(n)) return "A";
  if (/okręgow|okregow/.test(n)) return "okregowa";
  if (/(^|\s)v liga/.test(n)) return "5liga";
  if (/(^|\s)iv liga/.test(n)) return "4liga";
  if (/3\.? ?liga|iii liga/.test(n)) return "3liga";
  if (/2\.? ?liga|ii liga/.test(n)) return "2liga";
  if (/1\.? ?liga|i liga/.test(n)) return "1liga";
  return (["ekstraklasa", "1liga", "2liga", "3liga", "4liga", "5liga", "okregowa", "A", "B"] as Szczebel[])[Math.max(0, Math.min(8, poziom - 1))];
}
export function szczebelPoziomu(s: StanGry, poziom: number): Szczebel {
  const l = s.ligi[poziom - 1];
  return szczebelLigi(l?.nazwa ?? "", poziom);
}
export const NAZWA_SZCZEBLA: Record<Szczebel, string> = {
  ekstraklasa: "Ekstraklasa", "1liga": "I liga", "2liga": "II liga", "3liga": "III liga", "4liga": "IV liga", "5liga": "V liga",
  okregowa: "klasa okręgowa", A: "klasa A", B: "klasa B", C: "klasa C",
};
/** Klasa (uprawnienia) sędziego wg szczebla ligi — etykieta do obsady (pula sędziów jest dzielona po numerze poziomu,
 *  ale nazwa klasy musi odpowiadać lidze: np. w Małopolsce klasa B to poziom 9, w Pomorskiem — 8). */
export function klasaWgSzczebla(sz: Szczebel, zpn: string): string {
  switch (sz) {
    case "ekstraklasa": return "Ekstraklasa (szczebel centralny)";
    case "1liga": return "I liga (szczebel centralny)";
    case "2liga": return "II liga (szczebel centralny)";
    case "3liga": return "III liga (szczebel centralny — obsada KS PZPN)";
    case "4liga": case "5liga": return `klasa wojewódzka (${zpn})`;
    case "okregowa": return `klasa okręgowa (${zpn})`;
    default: return `klasa ${sz} (okręg)`;
  }
}
/** Czy obsadę wyznacza Kolegium Sędziów PZPN (szczebel centralny: Ekstraklasa–III liga). */
export const obsadaCentralna = (sz: Szczebel) => sz === "ekstraklasa" || sz === "1liga" || sz === "2liga" || sz === "3liga";

/** Kto wyznacza obsadę i jaki jest jej typowy skład — do UI (Extranet / przedmeczowe info). */
export function opisObsady(s: StanGry, poziom: number): string {
  const sz = szczebelPoziomu(s, poziom);
  if (sz === "ekstraklasa") return "Kolegium Sędziów PZPN: sędzia główny + 2 asystentów + sędzia techniczny, VAR i AVAR (sędziowie szczebla centralnego).";
  if (sz === "1liga") return "Kolegium Sędziów PZPN: sędzia główny + 2 asystentów + sędzia techniczny; w grze także VAR (sędziowie szczebla centralnego).";
  if (sz === "2liga") return "Kolegium Sędziów PZPN: sędzia główny + 2 asystentów + sędzia techniczny (sędziowie szczebla centralnego).";
  if (sz === "3liga") return "Kolegium Sędziów PZPN: sędziowie szczebla centralnego z listy III ligi (w grze — generowani), komplet z sędzią technicznym.";
  if (sz === "4liga" || sz === "5liga" || sz === "okregowa") return "Kolegium Sędziów wojewódzkiego ZPN: sędzia główny + 2 asystentów (sędziowie wojewódzcy).";
  if (sz === "A") return "Kolegium Sędziów ZPN / podokręgu: zwykle komplet sędziowski, czasem tylko sędzia główny i asystenci społeczni z klubów.";
  if (sz === "B") return "Kolegium Sędziów ZPN / podokręgu: często tylko sędzia główny — chorągiewki trzymają przedstawiciele klubów (asystenci społeczni sygnalizują wyłącznie auty, spalone ocenia sam sędzia).";
  return "Kolegium Sędziów podokręgu: zazwyczaj sam sędzia główny i asystenci społeczni z klubów.";
}

/** Szansa (model gry), że ZPN deleguje tylko sędziego głównego. */
function szansaSamSedzia(sz: Szczebel): number { return sz === "C" ? 0.85 : sz === "B" ? 0.6 : sz === "A" ? 0.2 : 0; }
function hash(t: string): number { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/** Deterministycznie (ten sam tydzień → ta sama decyzja): czy mecz Twojej drużyny na tym szczeblu prowadzi sam sędzia główny.
 *  Deterministyczność jest potrzebna, bo mecz na żywo (komentarz) i późniejsze rozliczenie obsady liczą to niezależnie. */
export function tylkoSedziaGlowny(s: StanGry, poziom: number): boolean {
  const p = szansaSamSedzia(szczebelPoziomu(s, poziom));
  if (p <= 0) return false;
  return (hash(`${s.sezon}|${s.kolejka}|${poziom}|${s.mojKlub}`) % 1000) / 1000 < p;
}

/** Modyfikatory silnika meczu na żywo (spalone) przy obsadzie bez asystentów z ZPN. null = pełna obsada. */
export function bledySpalonego(s: StanGry, poziom: number): { nieuznany: number; spalonyUznany: number; odgwizdany: number } | null {
  if (!tylkoSedziaGlowny(s, poziom)) return null;
  // nieuznany: szansa, że prawidłowy gol zostaje anulowany (vs 0,035 przy pełnej obsadzie);
  // spalonyUznany: szansa, że gol ze spalonego zostaje uznany (komentarz/protest);
  // odgwizdany: mnożnik odgwizdanych spalonych w akcjach bez strzału.
  return { nieuznany: 0.05, spalonyUznany: 0.09, odgwizdany: 0.55 };
}

const ZNACZNIK = "asystent społeczny";
/** Czy obsada w wyniku ma asystentów społecznych (przedstawicieli klubów). */
export const maAsystentowSpolecznych = (w: Wynik) => !!w.sedzia?.asystenci.some((a) => a.includes(ZNACZNIK));

/** Po meczu Twojej drużyny: obsada „sam sędzia" → wpisz asystentów społecznych z klubów, popraw statystyki spalonych
 *  i dopisz komunikat o kontrowersji. Wołane raz na kolejkę (tanie: tylko Twój mecz). */
export function obsadaPoMeczu(s: StanGry, w: Wynik | undefined, wiad: (t: string) => void) {
  if (!w?.sedzia || w.sedzia.real) return;
  const dom = s.kluby[w.dom], gosc = s.kluby[w.gosc];
  if (!dom || !gosc || maAsystentowSpolecznych(w)) return;
  const poziom = Math.min(dom.poziom, gosc.poziom);
  if (w.sedzia.asystenci.length > 0 || !tylkoSedziaGlowny(s, poziom)) return;
  const osoba = () => `${wybierz(IMIONA)} ${wybierz(NAZWISKA)}`;
  w.sedzia = {
    ...w.sedzia,
    asystenci: [`${osoba()} (${ZNACZNIK} — ${dom.skrot || dom.nazwa})`, `${osoba()} (${ZNACZNIK} — ${gosc.skrot || gosc.nazwa})`],
    klasa: `${w.sedzia.klasa ?? NAZWA_SZCZEBLA[szczebelPoziomu(s, poziom)]} · ZPN delegował tylko sędziego głównego`,
  };
  if (w.staty?.spalone) w.staty.spalone = [Math.round(w.staty.spalone[0] * 0.55), Math.round(w.staty.spalone[1] * 0.55)];
  const gole = (w.zdarzenia ?? []).filter((z) => z.typ === "gol");
  const r = Math.random();
  let opis = "Sędzia główny sam oceniał spalone ze środka boiska; asystenci społeczni sygnalizowali tylko auty.";
  if (gole.length && r < 0.4) {
    const g = wybierz(gole); const z = s.zawodnicy[g.zawodnikId]; const k = s.kluby[g.klubId];
    const rywal = g.klubId === w.dom ? gosc : dom;
    opis = `W ${g.min}. min gol ${z ? `${z.imie[0]}. ${z.nazwisko}` : "zawodnika"} (${k?.nazwa}) padł — zdaniem ${rywal.nazwa} — z pozycji spalonej. Sędzia był sam, uznał bramkę; protesty ławki ${rywal.nazwa}.`;
  } else if (r < 0.65) {
    const k = wybierz([dom, gosc]);
    opis = `${k.nazwa} miał anulowaną bramkę za „spalonego", którego — wg relacji z trybun — nie było. Sędzia bez asystentów z obsady musiał ocenić sytuację z kilkudziesięciu metrów.`;
  }
  if (dom.id === s.mojKlub || gosc.id === s.mojKlub) wiad(`🚩 Obsada: tylko sędzia ${w.sedzia.glowny}, chorągiewki trzymali przedstawiciele klubów. ${opis}`);
}

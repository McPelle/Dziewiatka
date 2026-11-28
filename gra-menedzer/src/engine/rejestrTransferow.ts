// Rejestr transferów wszystkich klubów (Ekstraklasa → klasa B): kto przyszedł / odszedł, skąd / dokąd, na jakich zasadach
// (kupno, wolny transfer, wypożyczenie, powrót z wypożyczenia, klauzula, Bosman, rozwiązanie umowy, akademia, testy…) i za ile.
// Pełna historia bez limitów; zapis zwięzły (krotki + słownik nazw klubów), żeby zapis gry był mały i szybki.
import type { StanGry, Zawodnik } from "./types";

export type TypTransferu =
  | "kupno" | "wolny" | "wypozyczenie" | "powrot" | "klauzula" | "bosman" | "koniec" | "rozwiazanie"
  | "akademia" | "testy" | "wyroznienie" | "skauting" | "umowaWstepna" | "ekwiwalent" | "nowy" | "transfer";

export interface WpisTransferu {
  s: number;            // sezon
  o: "L" | "Z";         // okno: lato / zima
  d?: string;           // kiedy (opis: kolejka / okres przygotowawczy / po sezonie)
  z: string;            // id zawodnika
  n: string;            // imię i nazwisko
  p: string;            // pozycja
  w: number;            // wiek
  u: number;            // umiejętności w chwili transferu
  od?: string;          // klub odchodzący (nazwa) — brak = bez klubu
  do?: string;          // klub przyjmujący (nazwa) — brak = bez klubu / koniec kariery
  t: TypTransferu;
  k?: number;           // kwota (zł)
}

export const OPIS_TYPU: Record<TypTransferu, string> = {
  kupno: "transfer definitywny", wolny: "wolny transfer", wypozyczenie: "wypożyczenie", powrot: "powrót z wypożyczenia",
  klauzula: "klauzula odstępnego", bosman: "koniec kontraktu (Bosman)", koniec: "koniec kontraktu", rozwiazanie: "rozwiązanie umowy",
  akademia: "z akademii", testy: "po testach", wyroznienie: "wyróżniony w sparingu", skauting: "z obserwacji skautów",
  umowaWstepna: "umowa wstępna (wolny transfer)", ekwiwalent: "ekwiwalent za wyszkolenie", nowy: "nabór z niższych lig", transfer: "transfer (prawdziwy ruch z okna)",
};
export const IKONA_TYPU: Record<TypTransferu, string> = {
  kupno: "💰", wolny: "🆓", wypozyczenie: "🔁", powrot: "↩️", klauzula: "📜", bosman: "📄", koniec: "📄", rozwiazanie: "✂️",
  akademia: "🎓", testy: "🧪", wyroznienie: "👀", skauting: "🔭", umowaWstepna: "✈️", ekwiwalent: "🎓", nowy: "🆕", transfer: "➡️",
};

const TYPY: TypTransferu[] = ["kupno", "wolny", "wypozyczenie", "powrot", "klauzula", "bosman", "koniec", "rozwiazanie", "akademia", "testy", "wyroznienie", "skauting", "umowaWstepna", "ekwiwalent", "nowy", "transfer"];
/** Krotka: [sezon, okno 0=lato/1=zima, kiedy (−1 okres przygotowawczy, −2 po sezonie, −3 przed startem gry, n = kolejka),
 *  id zawodnika, imię i nazwisko, pozycja, wiek, OVR, klub od (indeks w słowniku, −1 brak), klub do (−1 brak), typ (indeks), kwota]. */
type Krotka = [number, 0 | 1, number, string, string, string, number, number, number, number, number, number];
export interface RejestrTransferow { kluby: string[]; w: Krotka[] }

/** Ostatni klub zawodnika z kariery (gdy przychodzi jako wolny). */
export function ostatniKlub(z: Zawodnik): string | undefined {
  const k = z.kariera ?? [];
  for (let i = k.length - 1; i >= 0; i--) if (k[i]?.klub) return k[i].klub;
  return undefined;
}

const _idx = new WeakMap<RejestrTransferow, Map<string, number>>();
function rej(s: StanGry): RejestrTransferow {
  let r = s.rejTr;
  if (!r) {
    r = s.rejTr = { kluby: [], w: [] };
    // migracja: stary format (obiekty) → krotki
    const stare = (s as unknown as { rejestrTransferow?: WpisTransferu[] }).rejestrTransferow;
    if (stare?.length) for (const x of stare) dopisz(s, r, x);
    delete (s as unknown as { rejestrTransferow?: unknown }).rejestrTransferow;
  }
  return r;
}
function klubIdx(r: RejestrTransferow, n?: string): number {
  if (!n) return -1;
  let m = _idx.get(r);
  if (!m) { m = new Map(r.kluby.map((k, i) => [k, i])); _idx.set(r, m); }
  let i = m.get(n);
  if (i == null) { i = r.kluby.length; r.kluby.push(n); m.set(n, i); }
  return i;
}
function kiedyKod(d?: string): number {
  if (!d) return -2;
  if (/przygotowawczy/.test(d)) return -1;
  if (/przed startem/.test(d)) return -3;
  const m = d.match(/^(\d+)\./); return m ? +m[1] : -2;
}
function kiedyTekst(q: number, o: 0 | 1): string {
  return q === -1 ? `okres przygotowawczy (${o ? "zima" : "lato"})` : q === -3 ? "lato (przed startem gry)" : q === -2 ? "po sezonie" : `${q}. kolejka`;
}
function dopisz(s: StanGry, r: RejestrTransferow, x: WpisTransferu) {
  r.w.push([x.s, x.o === "Z" ? 1 : 0, kiedyKod(x.d), x.z, x.n, x.p, x.w, x.u, klubIdx(r, x.od), klubIdx(r, x.do), Math.max(0, TYPY.indexOf(x.t)), x.k ?? 0]);
  _cache = null;
}
let _cache: { r: RejestrTransferow; n: number; wpisy: WpisTransferu[] } | null = null;
/** Wszystkie wpisy (dekodowane; pamięć podręczna do następnego transferu). */
export function wpisyTransferow(s: StanGry): WpisTransferu[] {
  const r = rej(s);
  if (_cache && _cache.r === r && _cache.n === r.w.length) return _cache.wpisy;
  const wpisy = r.w.map(([se, o, q, z, n, p, w, u, od, dok, t, k]) => ({
    s: se, o: (o ? "Z" : "L") as "L" | "Z", d: kiedyTekst(q, o), z, n, p, w, u,
    ...(od >= 0 ? { od: r.kluby[od] } : {}), ...(dok >= 0 ? { do: r.kluby[dok] } : {}), t: TYPY[t] ?? "transfer", ...(k ? { k } : {}),
  }));
  _cache = { r, n: r.w.length, wpisy };
  return wpisy;
}

export function zapiszTransfer(s: StanGry, z: Zawodnik | undefined, od: string | undefined, doK: string | undefined, t: TypTransferu, k?: number): void {
  if (!z) return;
  const n = s.ligi?.[0]?.terminarz?.length ?? 34;
  const o: "L" | "Z" = s.okres?.rodzaj === "zima" || (!s.okres && s.kolejka > 0 && s.kolejka >= Math.floor(n / 2) && !s.koniecSezonu) ? "Z" : "L";
  const d = s.okres ? "okres przygotowawczy" : s.koniecSezonu ? "po sezonie" : `${Math.min(n, s.kolejka + 1)}. kolejka`;
  dopisz(s, rej(s), { s: s.sezon, o, d, z: z.id, n: `${z.imie} ${z.nazwisko}`, p: z.poz, w: z.wiek, u: Math.floor(z.umiej), od, do: doK, t, k });
}

/** Transfery klubu w sezonie: przychodzący i odchodzący (wg nazwy klubu — także dla klubów, które zmieniły ligę). */
export function transferyKlubu(s: StanGry, nazwa: string, sezon?: number): { przyszli: WpisTransferu[]; odeszli: WpisTransferu[] } {
  const r = wpisyTransferow(s).filter((x) => sezon == null || x.s === sezon);
  return { przyszli: r.filter((x) => x.do === nazwa), odeszli: r.filter((x) => x.od === nazwa) };
}
/** Sezony, w których klub ma jakiekolwiek transfery (od najnowszego). */
export function sezonyTransferow(s: StanGry, nazwa: string): number[] {
  return [...new Set(wpisyTransferow(s).filter((x) => x.do === nazwa || x.od === nazwa).map((x) => x.s))].sort((a, b) => b - a);
}
/** Liczba zapisanych ruchów (wszystkie kluby, wszystkie sezony). */
export function ileTransferow(s: StanGry): number { return rej(s).w.length; }

/** Start kariery / stary zapis bez rejestru: prawdziwe ruchy z okna transferowego sezonu startowego (kariery realnych
 *  zawodników: nowy etap w obecnym klubie od tego sezonu) — z poprzednim klubem i informacją o wypożyczeniu. */
export function zasiejRejestr(s: StanGry): void {
  const r = rej(s);
  if (r.w.length) return;
  for (const kl of Object.values(s.kluby)) {
    for (const id of kl.zawodnicy) {
      const z = s.zawodnicy[id]; const k = z?.kariera ?? [];
      if (!z || k.length < 2) continue;
      const ost = k[k.length - 1], pop = k[k.length - 2];
      if (ost.od !== s.sezon || !pop?.klub || pop.klub === ost.klub) continue;
      dopisz(s, r, { s: s.sezon, o: "L", d: "lato (przed startem gry)", z: z.id, n: `${z.imie} ${z.nazwisko}`, p: z.poz, w: z.wiek, u: Math.floor(z.umiej), od: pop.klub, do: kl.nazwa, t: ost.wypozyczenie ? "wypozyczenie" : "transfer" });
    }
  }
}

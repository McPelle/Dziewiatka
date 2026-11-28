// Rejestr transferów wszystkich klubów (Ekstraklasa → klasa B): kto przyszedł / odszedł, skąd / dokąd, na jakich zasadach
// (kupno, wolny transfer, wypożyczenie, powrót z wypożyczenia, klauzula, Bosman, rozwiązanie umowy, akademia, testy…) i za ile.
// Zapis kompaktowy; wszystkie kluby — 6 ostatnich sezonów, klub(y) trenera — cała historia.
import type { StanGry, Zawodnik } from "./types";

export type TypTransferu =
  | "kupno" | "wolny" | "wypozyczenie" | "powrot" | "klauzula" | "bosman" | "koniec" | "rozwiazanie"
  | "akademia" | "testy" | "wyroznienie" | "skauting" | "umowaWstepna" | "ekwiwalent" | "nowy" | "transfer";

export interface WpisTransferu {
  s: number;            // sezon
  o: "L" | "Z";         // okno: lato / zima
  d?: string;           // data (ISO, gdy znana)
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

/** Ostatni klub zawodnika z kariery (gdy przychodzi jako wolny). */
export function ostatniKlub(z: Zawodnik): string | undefined {
  const k = z.kariera ?? [];
  for (let i = k.length - 1; i >= 0; i--) if (k[i]?.klub) return k[i].klub;
  return undefined;
}

export function zapiszTransfer(s: StanGry, z: Zawodnik | undefined, od: string | undefined, doK: string | undefined, t: TypTransferu, k?: number): void {
  if (!z) return;
  const r = (s.rejestrTransferow ??= []);
  const n = s.ligi?.[0]?.terminarz?.length ?? 34;
  const o: "L" | "Z" = s.okres?.rodzaj === "zima" || (!s.okres && s.kolejka > 0 && s.kolejka >= Math.floor(n / 2) && !s.koniecSezonu) ? "Z" : "L";
  const d = s.okres ? `okres przygotowawczy (${s.okres.rodzaj})` : s.koniecSezonu ? "po sezonie" : `${Math.min(n, s.kolejka + 1)}. kolejka`;
  r.push({ s: s.sezon, o, d, z: z.id, n: `${z.imie} ${z.nazwisko}`, p: z.poz, w: z.wiek, u: Math.floor(z.umiej), ...(od ? { od } : {}), ...(doK ? { do: doK } : {}), t, ...(k ? { k } : {}) });
  // porządek: wszystkie kluby — 6 ostatnich sezonów; Twój klub (obecny i poprzednie z kariery trenera) — cała historia
  if (r.length > 500 && r[0].s < s.sezon - 5) {
    const moje = new Set([s.kluby[s.mojKlub]?.nazwa, ...(s.trenerKariera ?? []).map((w) => w.klub)].filter(Boolean) as string[]);
    const rotacja = new Set<TypTransferu>(["nowy", "rozwiazanie", "koniec", "akademia"]); // codzienna rotacja kadr — krócej
    s.rejestrTransferow = r.filter((x) => x.s >= s.sezon - 2 || (x.s >= s.sezon - 5 && !rotacja.has(x.t)) || (x.od && moje.has(x.od)) || (x.do && moje.has(x.do)));
  }
}

/** Transfery klubu w sezonie: przychodzący i odchodzący (wg nazwy klubu — także dla klubów, które zmieniły ligę). */
export function transferyKlubu(s: StanGry, nazwa: string, sezon?: number): { przyszli: WpisTransferu[]; odeszli: WpisTransferu[] } {
  const r = (s.rejestrTransferow ?? []).filter((x) => sezon == null || x.s === sezon);
  return { przyszli: r.filter((x) => x.do === nazwa), odeszli: r.filter((x) => x.od === nazwa) };
}
/** Sezony, w których klub ma jakiekolwiek transfery (od najnowszego). */
export function sezonyTransferow(s: StanGry, nazwa: string): number[] {
  return [...new Set((s.rejestrTransferow ?? []).filter((x) => x.do === nazwa || x.od === nazwa).map((x) => x.s))].sort((a, b) => b - a);
}

/** Start kariery / stary zapis bez rejestru: prawdziwe ruchy z okna transferowego sezonu startowego (kariery realnych
 *  zawodników: nowy etap w obecnym klubie od tego sezonu) — z poprzednim klubem i informacją o wypożyczeniu. */
export function zasiejRejestr(s: StanGry): void {
  if ((s.rejestrTransferow ?? []).length) return;
  const r: WpisTransferu[] = [];
  for (const kl of Object.values(s.kluby)) {
    for (const id of kl.zawodnicy) {
      const z = s.zawodnicy[id]; const k = z?.kariera ?? [];
      if (!z || k.length < 2) continue;
      const ost = k[k.length - 1], pop = k[k.length - 2];
      if (ost.od !== s.sezon || !pop?.klub || pop.klub === ost.klub) continue;
      r.push({ s: s.sezon, o: "L", d: "lato (przed startem gry)", z: z.id, n: `${z.imie} ${z.nazwisko}`, p: z.poz, w: z.wiek, u: Math.floor(z.umiej), od: pop.klub, do: kl.nazwa, t: ost.wypozyczenie ? "wypozyczenie" : "transfer" });
    }
  }
  s.rejestrTransferow = r;
}

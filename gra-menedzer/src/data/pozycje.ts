// Szczegółowe pozycje boiskowe (nad 4 kategoriami używanymi przez formacje/silnik).
import type { Pozycja, PozycjaSzczegolowa } from "../engine/types";

/** Mapa: pozycja szczegółowa → kategoria (BR/OBR/POM/NAP). */
export const KAT_POZ: Record<PozycjaSzczegolowa, Pozycja> = {
  BR: "BR",
  LO: "OBR", SO: "OBR", PO: "OBR", LWA: "OBR", PWA: "OBR",
  DP: "POM", SP: "POM", LP: "POM", PP: "POM", OP: "POM",
  LS: "NAP", PS: "NAP", NAP: "NAP", DN: "NAP",
};

/** Pełne nazwy pozycji szczegółowych. */
export const ETYKIETA_POZ: Record<PozycjaSzczegolowa, string> = {
  BR: "Bramkarz",
  LO: "Lewy obrońca", SO: "Środkowy obrońca", PO: "Prawy obrońca", LWA: "Lewy wahadłowy", PWA: "Prawy wahadłowy",
  DP: "Defensywny pomocnik", SP: "Środkowy pomocnik", LP: "Lewy pomocnik", PP: "Prawy pomocnik", OP: "Ofensywny pomocnik",
  LS: "Lewy skrzydłowy", PS: "Prawy skrzydłowy", NAP: "Napastnik", DN: "Drugi napastnik",
};

/** Skróty pozycji szczegółowych (do kart/składu). */
export const SKROT_POZ: Record<PozycjaSzczegolowa, string> = {
  BR: "BR",
  LO: "LO", SO: "ŚO", PO: "PO", LWA: "LWA", PWA: "PWA",
  DP: "DP", SP: "ŚP", LP: "LP", PP: "PP", OP: "OP",
  LS: "LS", PS: "PS", NAP: "NAP", DN: "DN",
};

/** Wagi losowania pozycji szczegółowej w obrębie kategorii (więcej środkowych niż wahadłowych). */
export const POZ_WAGI: Record<Pozycja, [PozycjaSzczegolowa, number][]> = {
  BR: [["BR", 1]],
  OBR: [["SO", 4], ["LO", 2], ["PO", 2], ["LWA", 1], ["PWA", 1]],
  POM: [["SP", 4], ["DP", 2.5], ["OP", 2], ["LP", 1.5], ["PP", 1.5]],
  NAP: [["NAP", 4], ["LS", 2], ["PS", 2], ["DN", 1.5]],
};

/** Jak dobrze szczegółowa pozycja radzi sobie w danej linii (0..1). Naturalna = 1,
 *  pokrewna (np. defensywny pomocnik w obronie) prawie pełna, odległa (napastnik w obronie) słaba.
 *  Używane, gdy zawodnik musi zagrać poza swoją linią — kara zależy od odległości pozycji. */
const DOPAS_POZ: Partial<Record<PozycjaSzczegolowa, Partial<Record<Pozycja, number>>>> = {
  SO: { POM: 0.6, NAP: 0.45 },
  LO: { POM: 0.75, NAP: 0.55 }, PO: { POM: 0.75, NAP: 0.55 },
  LWA: { POM: 0.85, NAP: 0.65 }, PWA: { POM: 0.85, NAP: 0.65 },
  DP: { OBR: 0.85, NAP: 0.5 },
  SP: { OBR: 0.7, NAP: 0.7 },
  LP: { OBR: 0.7, NAP: 0.8 }, PP: { OBR: 0.7, NAP: 0.8 },
  OP: { OBR: 0.5, NAP: 0.85 },
  LS: { OBR: 0.5, POM: 0.8 }, PS: { OBR: 0.5, POM: 0.8 },
  NAP: { OBR: 0.4, POM: 0.55 }, DN: { OBR: 0.45, POM: 0.75 },
};

/** Dopasowanie zawodnika (jego pozS) do linii kat. Naturalna linia = 1; brak pozS = 0.75 (stare zapisy). */
export function dopasowanieDoKategorii(pozS: PozycjaSzczegolowa | undefined, kat: Pozycja): number {
  if (!pozS) return 0.75;
  if (KAT_POZ[pozS] === kat) return 1;
  return DOPAS_POZ[pozS]?.[kat] ?? 0.75;
}

/** Etykieta pozycji: szczegółowa jeśli znana, w innym razie kategoria. */
export function etykietaPoz(poz: Pozycja, pozS?: PozycjaSzczegolowa): string {
  if (pozS && ETYKIETA_POZ[pozS]) return ETYKIETA_POZ[pozS];
  return { BR: "Bramkarz", OBR: "Obrońca", POM: "Pomocnik", NAP: "Napastnik" }[poz];
}


// ——— Dopasowanie do KONKRETNEJ pozycji (slotu w formacji) ———
// Zawodnik poza swoją pozycją gra słabiej: ŚP na LP traci ~18%, ŚP na LO ~35%, napastnik w obronie ~50%.
// Wartości = jaki % swojej siły daje zawodnik o pozycji X (wiersz) ustawiony na pozycji Y (kolumna).
const BLISKIE: Partial<Record<PozycjaSzczegolowa, Partial<Record<PozycjaSzczegolowa, number>>>> = {
  SO:  { LO: 0.84, PO: 0.84, DP: 0.84, LWA: 0.74, PWA: 0.74, SP: 0.7 },
  LO:  { LWA: 0.95, SO: 0.84, PO: 0.84, LP: 0.8, PWA: 0.8, DP: 0.72, LS: 0.7, SP: 0.66 },
  PO:  { PWA: 0.95, SO: 0.84, LO: 0.84, PP: 0.8, LWA: 0.8, DP: 0.72, PS: 0.7, SP: 0.66 },
  LWA: { LO: 0.95, LP: 0.9, PWA: 0.86, LS: 0.8, PO: 0.8, SO: 0.72, SP: 0.68 },
  PWA: { PO: 0.95, PP: 0.9, LWA: 0.86, PS: 0.8, LO: 0.8, SO: 0.72, SP: 0.68 },
  DP:  { SP: 0.92, SO: 0.84, OP: 0.74, LP: 0.72, PP: 0.72, LO: 0.72, PO: 0.72 },
  SP:  { DP: 0.92, OP: 0.9, LP: 0.82, PP: 0.82, DN: 0.76, LS: 0.72, PS: 0.72, SO: 0.66 },
  OP:  { SP: 0.9, DN: 0.9, LS: 0.84, PS: 0.84, LP: 0.82, PP: 0.82, NAP: 0.8, DP: 0.74 },
  LP:  { LS: 0.92, LWA: 0.88, PP: 0.85, SP: 0.82, OP: 0.82, PS: 0.8, LO: 0.78 },
  PP:  { PS: 0.92, PWA: 0.88, LP: 0.85, SP: 0.82, OP: 0.82, LS: 0.8, PO: 0.78 },
  LS:  { LP: 0.92, PS: 0.88, OP: 0.82, NAP: 0.82, DN: 0.82, LWA: 0.76, PP: 0.78 },
  PS:  { PP: 0.92, LS: 0.88, OP: 0.82, NAP: 0.82, DN: 0.82, PWA: 0.76, LP: 0.78 },
  NAP: { DN: 0.9, LS: 0.82, PS: 0.82, OP: 0.76 },
  DN:  { NAP: 0.9, OP: 0.9, LS: 0.84, PS: 0.84, SP: 0.76 },
};
const ODL_LINII: Record<Pozycja, Record<Pozycja, number>> = {
  BR: { BR: 1, OBR: 0.35, POM: 0.3, NAP: 0.3 },
  OBR: { BR: 0.25, OBR: 0.78, POM: 0.62, NAP: 0.48 },
  POM: { BR: 0.25, OBR: 0.62, POM: 0.78, NAP: 0.66 },
  NAP: { BR: 0.25, OBR: 0.45, POM: 0.62, NAP: 0.8 },
};
const LEWE = new Set<PozycjaSzczegolowa>(["LO", "LWA", "LP", "LS"]);
const PRAWE = new Set<PozycjaSzczegolowa>(["PO", "PWA", "PP", "PS"]);

/** Dopasowanie pozycji naturalnej `z` do slotu `na` (0..1). */
export function dopasPozycji(z: PozycjaSzczegolowa, na: PozycjaSzczegolowa): number {
  if (z === na) return 1;
  return BLISKIE[z]?.[na] ?? ODL_LINII[KAT_POZ[z]][KAT_POZ[na]];
}
/** Dopasowanie ZAWODNIKA do slotu: najlepsza z jego pozycji (podstawowa + wyuczone), z korektą za nogę na bokach. */
export function dopasowanieDoSlotu(z: { poz: Pozycja; pozS?: PozycjaSzczegolowa; pozycjeDodatkowe?: PozycjaSzczegolowa[]; noga?: "prawa" | "lewa" | "obie" }, slot: PozycjaSzczegolowa): number {
  const pozycje = [z.pozS ?? POZ_WAGI[z.poz][0][0], ...(z.pozycjeDodatkowe ?? [])];
  let best = 0;
  for (const p of pozycje) best = Math.max(best, dopasPozycji(p, slot));
  if (best < 1 && z.noga && z.noga !== "obie") {
    // poza swoją pozycją na boku: „słaba" noga do boku linii dokłada minus (lewa strona — lewonożni naturalni)
    if (LEWE.has(slot) && z.noga === "prawa") best *= 0.95;
    if (PRAWE.has(slot) && z.noga === "lewa") best *= 0.95;
  }
  return best;
}
/** Opis dopasowania do UI. */
export function opisDopasowania(d: number): { tekst: string; kolor: string } {
  if (d >= 0.999) return { tekst: "naturalna pozycja", kolor: "#3fd47f" };
  if (d >= 0.88) return { tekst: "dobrze zna tę pozycję", kolor: "#a6e05a" };
  if (d >= 0.76) return { tekst: "gra poza pozycją", kolor: "#ffce47" };
  if (d >= 0.6) return { tekst: "słabo zna tę pozycję", kolor: "#ff9a47" };
  return { tekst: "zupełnie obca pozycja", kolor: "#ff6470" };
}

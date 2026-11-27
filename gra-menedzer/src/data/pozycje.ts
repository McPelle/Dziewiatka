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

// System atrybutów i OVERALL zawodnika (własny, oryginalny).
// Overall (umiej) = ważone złożenie atrybutów piłkarskich wg pozycji. „prz" (przywództwo) jest poza overall.
import { los, losInt } from "./losuj";
import type { Atrybuty, Pozycja, Zawodnik } from "./types";

/** Atrybuty piłkarskie wchodzące do overall (bez przywództwa). */
export const SKILL = ["br", "obr", "czy", "pod", "dry", "str", "szy", "fiz"] as const;
export type SkillKey = (typeof SKILL)[number];

/** Wagi atrybutów w overall wg pozycji (suma = 1). Kluczowe atrybuty mają największą wagę. */
export const WAGI: Record<Pozycja, Partial<Record<SkillKey, number>>> = {
  BR:  { br: 0.55, czy: 0.20, fiz: 0.13, pod: 0.12 },
  OBR: { obr: 0.40, czy: 0.22, fiz: 0.20, szy: 0.10, pod: 0.08 },
  POM: { pod: 0.30, dry: 0.22, czy: 0.18, obr: 0.12, szy: 0.09, fiz: 0.09 },
  NAP: { str: 0.38, dry: 0.22, szy: 0.20, fiz: 0.12, pod: 0.08 },
};

/** 3–4 kluczowe atrybuty pozycji (do podświetlenia w UI). */
export function kluczoweAtryby(poz: Pozycja): SkillKey[] {
  return (Object.entries(WAGI[poz]) as [SkillKey, number][]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k);
}

/** Overall z atrybutów wg pozycji (zaokrąglony). */
export function overall(poz: Pozycja, a: Atrybuty): number {
  let s = 0;
  for (const [k, w] of Object.entries(WAGI[poz]) as [SkillKey, number][]) s += (a[k] ?? 0) * w;
  return Math.round(s * 10) / 10;
}

// Profil pozycji: przesunięcia atrybutów względem poziomu bazowego (kluczowe wyżej, nieistotne niżej).
const PROFIL: Record<Pozycja, Partial<Record<SkillKey, number>>> = {
  BR:  { br: 18, czy: 6, fiz: 2, pod: -2, obr: -6, dry: -10, str: -18, szy: -10 },
  OBR: { obr: 12, czy: 6, fiz: 6, szy: 0, pod: -2, dry: -6, str: -12, br: -34 },
  POM: { pod: 8, dry: 6, czy: 4, obr: -2, szy: 0, fiz: -2, str: -4, br: -34 },
  NAP: { str: 12, dry: 6, szy: 6, fiz: 0, pod: -4, obr: -12, czy: -4, br: -36 },
};

const klamp = (x: number, lo = 1, hi = 99) => Math.max(lo, Math.min(hi, x));

/** Generuje atrybuty tak, by OVERALL ≈ poziom L (balans zachowany). Przywództwo osobno. */
export function generujAtrybuty(poz: Pozycja, L: number, wiek: number): Atrybuty {
  const prof = PROFIL[poz];
  const a: Atrybuty = { br: 0, obr: 0, czy: 0, pod: 0, dry: 0, str: 0, szy: 0, fiz: 0, prz: 0 };
  for (const k of SKILL) a[k] = L + (prof[k] ?? 0) + los(-5, 5);
  // korekta: przesuń wszystkie o tyle, by overall = L
  const shift = L - overall(poz, a);
  for (const k of SKILL) a[k] = Math.round(klamp(a[k] + shift));
  // przywództwo: rośnie z wiekiem i częściej u BR/OBR (realni kapitanowie)
  a.prz = Math.round(klamp(los(22, 62) + (wiek >= 29 ? 12 : wiek >= 25 ? 5 : 0) + (poz === "BR" || poz === "OBR" ? 8 : 0), 5, 99));
  return a;
}

/** Rozwija (lub obniża) atrybuty o delta i przelicza overall. Zachowuje zgodność ze starym `umiej`. */
export function rozwinAtrybuty(z: Zawodnik, delta: number) {
  if (!z.atrybuty) {
    z.umiej = Math.max(5, Math.min(z.potencjal, z.umiej + delta));
    return;
  }
  // Wzrost nie może przekroczyć potencjału — ograniczamy z góry, żeby overall == złożenie atrybutów.
  if (delta > 0) delta = Math.min(delta, z.potencjal - z.umiej);
  if (Math.abs(delta) < 0.001) return;
  const w = WAGI[z.poz];
  for (const k of SKILL) {
    const grow = (w[k] !== undefined) ? delta : delta * 0.3; // kluczowe atrybuty rosną pełnią, reszta wolniej
    z.atrybuty[k] = klamp(z.atrybuty[k] + grow);
  }
  z.umiej = overall(z.poz, z.atrybuty);
}

/** Rozwija JEDEN atrybut (trening indywidualny). Atrybut kluczowy podnosi overall (do potencjału);
 *  „prz" (przywództwo) i atrybuty spoza wag rosną swobodnie, nie zmieniając overall. */
export function rozwinAtrybut(z: Zawodnik, key: keyof Atrybuty, delta: number) {
  if (!z.atrybuty || delta <= 0) return;
  if (key === "prz") { z.atrybuty.prz = klamp(z.atrybuty.prz + delta); return; }
  const wk = WAGI[z.poz][key as SkillKey];
  if (wk) {
    const before = overall(z.poz, z.atrybuty);
    if (before >= z.potencjal) return; // overall na suficie — atrybut kluczowy już nie rośnie
    const maxD = (z.potencjal - before) / wk; // nie przekraczaj potencjału
    delta = Math.min(delta, maxD);
  }
  z.atrybuty[key] = klamp(z.atrybuty[key] + delta);
  z.umiej = overall(z.poz, z.atrybuty);
}

/** Pełne nazwy atrybutów (UI). */
export const ETYKIETA_ATRYB: Record<keyof Atrybuty, string> = {
  br: "Bramkarstwo", obr: "Obrona", czy: "Czytanie gry", pod: "Podanie",
  dry: "Drybling", str: "Wykończenie", szy: "Szybkość", fiz: "Fizyczność", prz: "Przywództwo",
};

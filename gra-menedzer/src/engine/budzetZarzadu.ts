// Budżet sezonu z zarządem (#84): na start sezonu ustalacie wariant budżetu (limit tygodniowych płac + budżet
// transferowy), a co kwartał (¼ sezonu) zarząd rozlicza wydatki i wyniki względem celu — zaufanie rośnie albo spada.
import { tabelaLigi } from "./swiat";
import type { StanGry } from "./types";

export type Wariant = "oszczedny" | "zrownowazony" | "ambitny";
export const WARIANTY: Record<Wariant, { nazwa: string; opis: string; place: number; transfery: number; zarzad: number }> = {
  oszczedny: { nazwa: "Oszczędny", opis: "Płace bez podwyżek, mały budżet transferowy. Zarząd docenia rozsądek (+zaufanie na start).", place: 1.0, transfery: 0.15, zarzad: 4 },
  zrownowazony: { nazwa: "Zrównoważony", opis: "Lekki zapas na płace i rozsądne wzmocnienia.", place: 1.1, transfery: 0.3, zarzad: 0 },
  ambitny: { nazwa: "Ambitny", opis: "Duży zapas na płace i transfery — ale zarząd będzie rozliczał surowiej.", place: 1.25, transfery: 0.5, zarzad: -3 },
};
export interface Kwartal { nr: number; place: number; limit: number; kasa: number; miejsce: number; ocena: string; zmiana: number }
export interface BudzetSezonu { sezon: number; wariant?: Wariant; limitPlac: number; transfery: number; kasaStart: number; kwartaly: Kwartal[] }

const zl = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} zł`;
export const placeTygodnia = (s: StanGry) => s.kluby[s.mojKlub].zawodnicy.reduce((a, id) => a + (s.zawodnicy[id]?.pensja ?? 0), 0);

/** Budżet bieżącego sezonu (tworzony leniwie: przed wyborem wariantu — propozycja zarządu „zrównoważona”). */
export function budzetSezonu(s: StanGry): BudzetSezonu {
  const b = s.budzetSezonu;
  if (b && b.sezon === s.sezon) return b;
  const w = WARIANTY.zrownowazony, kasa = s.kluby[s.mojKlub].kasa;
  const nb: BudzetSezonu = { sezon: s.sezon, limitPlac: Math.round(placeTygodnia(s) * w.place / 100) * 100, transfery: Math.max(0, Math.round(kasa * w.transfery / 1000) * 1000), kasaStart: kasa, kwartaly: [] };
  s.budzetSezonu = nb; return nb;
}

/** Wybór wariantu (możliwy przed pierwszym rozliczeniem kwartału). */
export function wybierzWariant(s: StanGry, w: Wariant): string {
  const b = budzetSezonu(s); if (b.wariant) return "Budżet na ten sezon jest już zatwierdzony.";
  const d = WARIANTY[w], kasa = s.kluby[s.mojKlub].kasa;
  b.wariant = w; b.limitPlac = Math.round(placeTygodnia(s) * d.place / 100) * 100; b.transfery = Math.max(0, Math.round(kasa * d.transfery / 1000) * 1000);
  s.zarzad = Math.max(0, Math.min(100, s.zarzad + d.zarzad));
  return `📑 Zarząd zatwierdził budżet „${d.nazwa}”: płace do ${zl(b.limitPlac)}/tydz., transfery ${zl(b.transfery)}.`;
}

/** Co kolejkę: na koniec każdego kwartału zarząd rozlicza wydatki i wyniki. Zwraca komunikat albo null. */
export function kwartalZarzadu(s: StanGry, kolejek: number): string | null {
  const b = budzetSezonu(s); const r = s.kolejka + 1;
  if (b.kwartaly.length >= 4 || r < Math.round((kolejek * (b.kwartaly.length + 1)) / 4)) return null;
  if (!b.wariant) b.wariant = "zrownowazony";
  const k = s.kluby[s.mojKlub]; const liga = s.ligi[k.poziom - 1];
  const t = liga ? tabelaLigi(s, liga) : []; const miejsce = t.findIndex((w) => w.klubId === s.mojKlub) + 1; const n = t.length || 16;
  const place = placeTygodnia(s); const przekr = place / Math.max(1, b.limitPlac);
  const cel = s.cel ?? ""; const oczek = /Awans/i.test(cel) ? 3 : /Górna/i.test(cel) ? Math.ceil(n / 2) : n - 3;
  let zmiana = 0; const uw: string[] = [];
  if (przekr > 1.1) { zmiana -= b.wariant === "ambitny" ? 8 : 5; uw.push(`płace ${zl(place)} przekraczają limit ${zl(b.limitPlac)}`); }
  else if (przekr <= 1) { zmiana += 2; uw.push("płace w budżecie"); }
  if (k.kasa < 0) { zmiana -= 4; uw.push("kasa pod kreską"); }
  if (miejsce && miejsce <= oczek) { zmiana += 3; uw.push(`${miejsce}. miejsce — zgodnie z celem „${cel}”`); }
  else if (miejsce) { zmiana -= b.wariant === "ambitny" ? 5 : 3; uw.push(`${miejsce}. miejsce — poniżej celu „${cel}”`); }
  s.zarzad = Math.max(0, Math.min(100, s.zarzad + zmiana));
  const ocena = zmiana >= 3 ? "zadowolony" : zmiana >= 0 ? "neutralny" : "niezadowolony";
  b.kwartaly.push({ nr: b.kwartaly.length + 1, place, limit: b.limitPlac, kasa: k.kasa, miejsce, ocena, zmiana });
  if (przekr > 1.1 && b.transfery > 0) { b.transfery = Math.round(b.transfery * 0.5 / 1000) * 1000; uw.push(`budżet transferowy obcięty do ${zl(b.transfery)}`); }
  return `🏛 Rozliczenie ${b.kwartaly.length}. kwartału — zarząd ${ocena} (${zmiana >= 0 ? "+" : ""}${zmiana} zaufania): ${uw.join(", ")}.`;
}

import { AFILIACJE, DERBY, PRZYJAZNIE, RYWALE_PATRONOW } from "../data/derby";
import type { StanGry } from "./types";
import { RELACJE_KIBICOW } from "../data/relacjeKibicow";
import { AFILIACJE_DODATKOWE, WROGIE_OBOZY, ZGODNE_OBOZY } from "../data/obozy";
const afil = (n: string): string | undefined => AFILIACJE_DODATKOWE[n] ?? AFILIACJE[n] ?? (Object.values(AFILIACJE_DODATKOWE).includes(n) || Object.values(AFILIACJE).includes(n) ? n : undefined); // patron sam dla siebie
import { los } from "./losuj";
import { tabelaLigi, WIDZOWIE } from "./swiat";

/** Czy dwaj patroni (np. Arka vs Lechia) to wrogie obozy kibicowskie. */
function wrogiePatrony(x: string, y: string): boolean {
  return [...RYWALE_PATRONOW, ...WROGIE_OBOZY].some(([p, q]) => (p === x && q === y) || (p === y && q === x));
}

/** Zwraca nazwę derbów, jeśli mecz dwóch klubów to mecz podwyższonego ryzyka (albo null). */
export function jestDerby(s: StanGry, domId: string, goscId: string): string | null {
  const a = s.kluby[domId]?.nazwa, b = s.kluby[goscId]?.nazwa;
  if (!a || !b) return null;
  for (const d of DERBY) if ((d.a === a && d.b === b) || (d.a === b && d.b === a)) return d.nazwa;
  for (const r of RELACJE_KIBICOW) if (r.typ === "kosa" && ((r.a === a && r.b === b) || (r.a === b && r.b === a))) return r.nazwa ?? `Mecz podwyższonego ryzyka (kosa kibicowska ${a} – ${b})`;
  // Patronat kibicowski: wrogie obozy (np. Arka vs Lechia, Wisła vs Cracovia) = mecz podwyższonego ryzyka.
  const pa = afil(a), pb = afil(b);
  if (pa && pb && pa !== pb && wrogiePatrony(pa, pb)) return `Mecz podwyższonego ryzyka (kibice: ${pa} vs ${pb})`;
  // Niższe ligi: ten sam ośrodek = lokalne derby (ale nie klub ze swoimi rezerwami).
  const kd = s.kluby[domId], kg = s.kluby[goscId];
  if (!kd.miasto || !kg.miasto || kd.miasto !== kg.miasto) return null;
  // Rezerwy/ten sam klub: połączone polem albo dzielą rdzeń nazwy (poza nazwą miasta).
  const rdzen = (nazwa: string, miasto: string) =>
    nazwa.replace(miasto, "").replace(/\bI{1,3}\b/g, "").toLowerCase().split(/[\s-]+/).filter((w) => w.length >= 3);
  const r1 = rdzen(kd.nazwa, kd.miasto), r2 = rdzen(kg.nazwa, kg.miasto);
  const tenSamKlub = kd.rezerwaId === goscId || kg.rezerwaId === domId || kd.rezerwaDla === goscId || kg.rezerwaDla === domId
    || (!!kd.rezerwaDla && kd.rezerwaDla === kg.rezerwaDla) || r1.some((w) => r2.includes(w));
  if (tenSamKlub) return null;
  return `Derby miasta ${kd.miasto}`;
}

/** Zwraca nazwę meczu przyjaźni (zgoda kibicowska), jeśli to taki mecz — inaczej null. */
export function jestPrzyjazn(s: StanGry, domId: string, goscId: string): string | null {
  const a = s.kluby[domId]?.nazwa, b = s.kluby[goscId]?.nazwa;
  if (!a || !b) return null;
  for (const p of PRZYJAZNIE) if ((p.a === a && p.b === b) || (p.a === b && p.b === a)) return p.nazwa;
  for (const r of RELACJE_KIBICOW) if (r.typ !== "kosa" && ((r.a === a && r.b === b) || (r.a === b && r.b === a))) return r.nazwa ?? (r.typ === "zgoda" ? `Zgoda kibicowska ${a} – ${b}` : `Układ kibicowski ${a} – ${b}`);
  // Patronat kibicowski: ten sam obóz (np. oba kluby kibicują Arce) = zgoda kibicowska.
  const pa = afil(a), pb = afil(b);
  if (pa && pb && pa === pb && a !== pb && b !== pa) return `Mecz przyjaźni (wspólny patronat: ${pa})`;
  if (pa && pb && pa !== pb && ZGODNE_OBOZY.some(([p, q]) => (p === pa && q === pb) || (p === pb && q === pa))) return `Mecz zgodowych obozów (${pa} & ${pb})`;
  return null;
}

/** Frekwencja na meczu domowym: im lepiej drużyna gra i wyżej jest, tym więcej kibiców; derby/przyjaźń = komplet.
 * `bonus` dolicza się do mnożnika (derby ~0.45, mecz przyjaźni ~0.4). */
export function frekwencja(s: StanGry, domId: string, goscId: string, bonus = 0): number {
  const k = s.kluby[domId];
  const liga = s.ligi[k.poziom - 1];
  const tab = tabelaLigi(s, liga);
  const idx = tab.findIndex((w) => w.klubId === domId);
  const row = idx >= 0 ? tab[idx] : undefined;
  const n = Math.max(2, tab.length);
  const posF = idx >= 0 ? 1 - idx / (n - 1) : 0.5; // 1 = lider tabeli
  const ppg = row && row.m > 0 ? row.pkt / (row.m * 3) : 0.45; // forma punktowa 0..1
  // Atrakcyjność rywala: słynny (wysoka renoma) albo z wyższej ligi gość ściąga więcej kibiców.
  const g = s.kluby[goscId];
  const przeciwnikF = g ? g.renoma * 0.3 + Math.max(0, k.poziom - g.poziom) * 0.18 : 0;
  const base = WIDZOWIE[k.poziom - 1] * (0.5 + k.renoma * 0.7);
  const mult = 0.55 + posF * 0.35 + ppg * 0.35 + bonus + przeciwnikF;
  // B3 (tylko klub gracza): cena biletu wpływa na frekwencję „z bramki" (elastyczność), karnety dają próg obecności.
  const moj = domId === s.mojKlub;
  const cena = moj ? (s.cenaBiletu ?? 1) : 1;
  const elast = moj ? Math.max(0.55, Math.min(1.25, 1 - (cena - 1) * 0.4)) : 1; // drożej → mniej kibiców
  const w = Math.round(base * mult * los(0.9, 1.12) * elast);
  const karnF = moj ? Math.round((s.karnety ?? 0) * k.pojemnosc) : 0; // posiadacze karnetów przychodzą zawsze
  return Math.min(k.pojemnosc, Math.max(karnF, Math.max(30, w)));
}

/** Atut własnego boiska wg wypełnienia stadionu (pusty ~1.05, komplet ~1.17) + bonus derbowy. */
export function atutBoiska(widzowie: number, pojemnosc: number, derby: boolean): number {
  const fill = pojemnosc > 0 ? Math.min(1, widzowie / pojemnosc) : 0.5;
  return 1.05 + fill * 0.12 + (derby ? 0.04 : 0);
}

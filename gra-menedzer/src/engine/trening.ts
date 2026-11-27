// System treningu — rozbudowany. Trzy warstwy, wszystkie wpływają na rozwój Twojej kadry:
//  1) Trening KLUBOWY: fokus (od ogólnego/stałych fragmentów po pojedyncze umiejętności) + intensywność
//     + tryb automatyczny (asystent dobiera fokus wg słabości kadry). Każdy fokus celuje w konkretne
//     atrybuty i pozycje.
//  2) Trening INDYWIDUALNY: wybrany zawodnik rozwija wskazany atrybut szybciej (ponad trening drużyny).
//  3) NAUKA nowej pozycji: po kilkunastu tygodniach zawodnik zyskuje dodatkową pozycję (nie tracąc starej).
import { los, szansa } from "./losuj";
import { ETYKIETA_ATRYB, rozwinAtrybut, SKILL, type SkillKey } from "./atrybuty";
import { modKontuzja, poziomSztabu } from "./sztab";
import { dopasowanieDoKategorii, ETYKIETA_POZ, KAT_POZ, SKROT_POZ } from "../data/pozycje";
import type { AtrybutKlucz, Intensywnosc, Pozycja, PozycjaSzczegolowa, StanGry, Trening, Zawodnik } from "./types";

// ——————————————————————————— Fokusy treningu klubowego ———————————————————————————
export interface FokusMeta {
  klucz: Trening;
  etykieta: string;
  opis: string;
  ikona: string;
  grupa: "ogolny" | "gra" | "umiejetnosc" | "specjalny";
  atrybuty: SkillKey[];           // atrybuty rozwijane mocniej
  pozycje: Pozycja[] | "all";     // które pozycje korzystają najbardziej
  meczowy?: boolean;              // efekt głównie meczowy (SFG, zgranie)
  mlodziez?: boolean;             // skupienie na U-21
}

export const FOKUSY: FokusMeta[] = [
  { klucz: "ogolny", etykieta: "Ogólny", opis: "Równomierny rozwój całej kadry.", ikona: "⚽", grupa: "ogolny", atrybuty: ["pod", "dry", "czy", "fiz"], pozycje: "all" },
  { klucz: "atak", etykieta: "Gra w ataku", opis: "Akcje ofensywne — napastnicy i pomocnicy.", ikona: "🗡", grupa: "gra", atrybuty: ["str", "dry", "szy"], pozycje: ["NAP", "POM"] },
  { klucz: "obrona", etykieta: "Gra w obronie", opis: "Ustawienie i odbiór — obrona i bramkarz.", ikona: "🛡", grupa: "gra", atrybuty: ["obr", "czy", "fiz"], pozycje: ["OBR", "BR"] },
  { klucz: "stale", etykieta: "Stałe fragmenty", opis: "Rożne, wolne, karne — przewaga ze stałych fragmentów.", ikona: "🎯", grupa: "gra", atrybuty: ["str", "pod"], pozycje: "all", meczowy: true },
  { klucz: "zgranie", etykieta: "Zgranie zespołu", opis: "Automatyzmy i komunikacja — bonus meczowy.", ikona: "🤝", grupa: "gra", atrybuty: ["czy", "pod"], pozycje: "all", meczowy: true },
  { klucz: "technika", etykieta: "Technika", opis: "Przyjęcie, drybling, podanie — cała kadra.", ikona: "🎩", grupa: "gra", atrybuty: ["dry", "pod"], pozycje: "all" },
  { klucz: "kondycja", etykieta: "Kondycja", opis: "Wytrzymałość i regeneracja — mniej zmęczenia.", ikona: "💓", grupa: "specjalny", atrybuty: ["fiz", "szy"], pozycje: "all" },
  { klucz: "mlodziez", etykieta: "Młodzież (U-21)", opis: "Skupienie na juniorach — szybki rozwój młodych.", ikona: "🌱", grupa: "specjalny", atrybuty: ["dry", "pod", "szy", "fiz"], pozycje: "all", mlodziez: true },
  // ——— pojedyncze umiejętności ———
  { klucz: "wykonczenie", etykieta: "Wykończenie", opis: "Strzały i zimna głowa pod bramką.", ikona: "🥅", grupa: "umiejetnosc", atrybuty: ["str"], pozycje: "all" },
  { klucz: "podania", etykieta: "Podania", opis: "Rozegranie, dokładność, długie piłki.", ikona: "🎽", grupa: "umiejetnosc", atrybuty: ["pod"], pozycje: "all" },
  { klucz: "drybling", etykieta: "Drybling", opis: "Mijanie jeden na jeden, technika.", ikona: "🕺", grupa: "umiejetnosc", atrybuty: ["dry"], pozycje: "all" },
  { klucz: "szybkosc", etykieta: "Szybkość", opis: "Przyspieszenie i sprint.", ikona: "⚡", grupa: "umiejetnosc", atrybuty: ["szy"], pozycje: "all" },
  { klucz: "fizycznosc", etykieta: "Siła i wytrzymałość", opis: "Pojedynki, gra ciałem, wytrzymałość.", ikona: "🏋", grupa: "umiejetnosc", atrybuty: ["fiz"], pozycje: "all" },
  { klucz: "czytanie", etykieta: "Czytanie gry", opis: "Ustawienie, przewidywanie, decyzje.", ikona: "🧠", grupa: "umiejetnosc", atrybuty: ["czy"], pozycje: "all" },
  { klucz: "bramkarski", etykieta: "Trening bramkarzy", opis: "Refleks, interwencje, gra nogami.", ikona: "🧤", grupa: "umiejetnosc", atrybuty: ["br", "czy"], pozycje: ["BR"] },
];
export const FOKUS_META: Record<Trening, FokusMeta> = Object.fromEntries(FOKUSY.map((f) => [f.klucz, f])) as Record<Trening, FokusMeta>;

export function fokus(s: StanGry): FokusMeta {
  return FOKUS_META[s.trening] ?? FOKUS_META["ogolny"];
}

// ——————————————————————————— Intensywność ———————————————————————————
export const INTENSYWNOSCI: { klucz: Intensywnosc; etykieta: string; ikona: string; rozwoj: number; zmeczenie: number; kontuzja: number; opis: string }[] = [
  { klucz: "lekki", etykieta: "Lekki", ikona: "🟢", rozwoj: 0.8, zmeczenie: 0.4, kontuzja: 0.5, opis: "Wolniejszy rozwój, świeżość i mniej kontuzji." },
  { klucz: "normalny", etykieta: "Normalny", ikona: "🟡", rozwoj: 1, zmeczenie: 1, kontuzja: 1, opis: "Standardowe obciążenie." },
  { klucz: "intensywny", etykieta: "Intensywny", ikona: "🔴", rozwoj: 1.35, zmeczenie: 1.8, kontuzja: 1.8, opis: "Szybszy rozwój kosztem zmęczenia i ryzyka kontuzji." },
];
export function intensywnosc(s: StanGry) {
  return INTENSYWNOSCI.find((i) => i.klucz === (s.treningIntensywnosc ?? "normalny"))!;
}

// ——————————————————————————— Limity sztabu ———————————————————————————
/** Ilu zawodników może jednocześnie mieć trening indywidualny (rośnie ze sztabem). */
export function limitIndywidualnych(s: StanGry): number {
  return 2 + poziomSztabu(s, "asystent") + (poziomSztabu(s, "kondycja") >= 3 ? 1 : 0);
}
export function ileIndywidualnych(s: StanGry): number {
  return s.kluby[s.mojKlub].zawodnicy.filter((id) => s.zawodnicy[id]?.treningIndywidualny).length;
}
/** Ilu zawodników może jednocześnie uczyć się nowej pozycji. */
export function limitNauki(s: StanGry): number {
  return 1 + Math.floor(poziomSztabu(s, "asystent") / 2);
}
export function ileNauki(s: StanGry): number {
  return s.kluby[s.mojKlub].zawodnicy.filter((id) => s.zawodnicy[id]?.naukaPozycji).length;
}

// ——————————————————————————— Ustawienia (UI) ———————————————————————————
export function ustawFokus(s: StanGry, t: Trening) { s.trening = t; s.treningAuto = false; }
export function ustawIntensywnosc(s: StanGry, i: Intensywnosc) { s.treningIntensywnosc = i; }
export function ustawAuto(s: StanGry, auto: boolean) { s.treningAuto = auto; if (auto) autoFokus(s); }

export function ustawTreningIndywidualny(s: StanGry, id: string, atryb: AtrybutKlucz): string | null {
  const z = s.zawodnicy[id];
  if (!z || z.klubId !== s.mojKlub) return "To nie jest Twój zawodnik.";
  if (!z.treningIndywidualny && ileIndywidualnych(s) >= limitIndywidualnych(s))
    return `Limit treningów indywidualnych (${limitIndywidualnych(s)}). Zatrudnij lepszego asystenta lub zdejmij innego zawodnika.`;
  z.treningIndywidualny = atryb;
  return null;
}
export function usunTreningIndywidualny(s: StanGry, id: string) {
  const z = s.zawodnicy[id]; if (z) z.treningIndywidualny = null;
}

/** Pozycje szczegółowe, które zawodnik już zna (podstawowa + wyuczone). */
export function pozycjeZawodnika(z: Zawodnik): PozycjaSzczegolowa[] {
  const l: PozycjaSzczegolowa[] = [];
  if (z.pozS) l.push(z.pozS);
  for (const p of z.pozycjeDodatkowe ?? []) if (!l.includes(p)) l.push(p);
  return l;
}
/** Pozycje możliwe do nauki (wszystkie szczegółowe, których jeszcze nie zna). */
export function pozycjeDoNauki(z: Zawodnik): PozycjaSzczegolowa[] {
  const ma = new Set(pozycjeZawodnika(z));
  return (Object.keys(ETYKIETA_POZ) as PozycjaSzczegolowa[]).filter((p) => !ma.has(p));
}
export function ustawNaukePozycji(s: StanGry, id: string, poz: PozycjaSzczegolowa): string | null {
  const z = s.zawodnicy[id];
  if (!z || z.klubId !== s.mojKlub) return "To nie jest Twój zawodnik.";
  if (pozycjeZawodnika(z).includes(poz)) return "Ten zawodnik już gra na tej pozycji.";
  if ((!z.naukaPozycji || z.naukaPozycji.poz !== poz) && ileNauki(s) >= limitNauki(s) && !z.naukaPozycji)
    return `Limit nauki pozycji (${limitNauki(s)}). Zatrudnij lepszego asystenta lub zakończ inną naukę.`;
  z.naukaPozycji = { poz, postep: 0 };
  return null;
}
export function przerwijNauke(s: StanGry, id: string) {
  const z = s.zawodnicy[id]; if (z) z.naukaPozycji = null;
}

/** Tempo nauki pozycji w % na tydzień (bliższa pozycja, młodszy wiek, lepszy asystent = szybciej). */
export function tempoNauki(s: StanGry, z: Zawodnik): number {
  if (!z.naukaPozycji) return 0;
  const kat = KAT_POZ[z.naukaPozycji.poz];
  // najlepsze dopasowanie z obecnych pozycji do kategorii docelowej (bliskość)
  let dop = 0.4;
  for (const p of pozycjeZawodnika(z)) dop = Math.max(dop, dopasowanieDoKategorii(p, kat));
  const wiekMn = z.wiek <= 21 ? 1.4 : z.wiek <= 25 ? 1.1 : z.wiek <= 29 ? 0.9 : 0.7;
  const asyst = 1 + poziomSztabu(s, "asystent") * 0.08;
  const base = 6.5 * dop * wiekMn * asyst; // ~6–12%/tydz. → kilkanaście tygodni
  return Math.max(2, Math.min(12, base));
}

// ——————————————————————————— Automatyczny fokus (asystent) ———————————————————————————
/** Asystent dobiera fokus wg największej słabości kadry (średni atrybut per linia vs oczekiwania). */
export function autoFokus(s: StanGry): Trening {
  const moj = s.kluby[s.mojKlub];
  const zs = moj.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const mlodzi = zs.filter((z) => z.wiek <= 21 && z.potencjal - z.umiej >= 6).length;
  if (mlodzi >= 4) { s.trening = "mlodziez"; return s.trening; }
  const sr = (poz: Pozycja) => { const g = zs.filter((z) => z.poz === poz); return g.length ? g.reduce((a, z) => a + z.umiej, 0) / g.length : 50; };
  const atak = (sr("NAP") + sr("POM")) / 2, obrona = (sr("OBR") + sr("BR")) / 2;
  s.trening = atak <= obrona ? "atak" : "obrona";
  return s.trening;
}

// ——————————————————————————— Rozwój tygodniowy (wołane z sezon.tydzien) ———————————————————————————
/** Mnożnik rozwoju z fokusu klubowego dla danego zawodnika (× intensywność). Dla NIE-moich klubów = 1. */
export function mnoznikFokus(s: StanGry, z: Zawodnik): number {
  const f = fokus(s);
  let mn: number;
  if (f.mlodziez) mn = z.wiek <= 21 ? 1.7 : 0.6;
  else if (f.pozycje === "all") mn = f.meczowy ? 1.06 : 1.2;
  else mn = f.pozycje.includes(z.poz) ? 1.5 : 0.7;
  // Baza treningowa przy stadionie: do +15% tempa rozwoju młodych (U-23) przy poziomie 5.
  const baza = s.kluby[s.mojKlub]?.obiekty.baza ?? 0;
  if (baza && z.wiek <= 23) mn *= 1 + baza * 0.03;
  return mn * intensywnosc(s).rozwoj;
}

/** Dodatkowy zysk zmęczenia z intensywności (pkt kondycji/tydz.) — dla mojego klubu. */
export function zmeczenieIntensywnosci(s: StanGry): number {
  return (intensywnosc(s).zmeczenie - 1) * 3;
}

/** Trening ukierunkowany + indywidualny + nauka pozycji dla JEDNEGO mojego zawodnika.
 *  `baza` = bazowy przyrost overalla z tego tygodnia (po mnożnikach) — część idzie w atrybuty fokusu.
 *  Zwraca komunikaty (kamienie milowe: wyuczona pozycja). */
export function treningGracza(s: StanGry, z: Zawodnik, baza: number): string[] {
  const msg: string[] = [];
  const intens = intensywnosc(s).rozwoj;
  // 1) fokus celuje w konkretne atrybuty (nawet gdy overall na suficie — podnosi wskazane cechy)
  const f = fokus(s);
  const dotyczy = f.mlodziez ? z.wiek <= 21 : f.pozycje === "all" || f.pozycje.includes(z.poz);
  if (dotyczy && baza > 0) {
    const d = Math.max(0.05, baza * 0.6) * intens;
    for (const k of f.atrybuty) rozwinAtrybut(z, k, d / f.atrybuty.length);
  }
  // 2) trening indywidualny — szybszy rozwój wskazanego atrybutu (ponad drużynę)
  if (z.treningIndywidualny) {
    const mlodyMn = z.wiek <= 20 ? 1.4 : z.wiek <= 24 ? 1.1 : z.wiek <= 29 ? 0.8 : 0.5;
    const d = (0.10 + poziomSztabu(s, "asystent") * 0.015) * mlodyMn * intens * los(0.7, 1.3);
    rozwinAtrybut(z, z.treningIndywidualny, d);
  }
  // 3) nauka nowej pozycji
  if (z.naukaPozycji) {
    z.naukaPozycji.postep += tempoNauki(s, z);
    if (z.naukaPozycji.postep >= 100) {
      const poz = z.naukaPozycji.poz;
      z.pozycjeDodatkowe = [...(z.pozycjeDodatkowe ?? []), poz];
      z.naukaPozycji = null;
      msg.push(`🎓 ${z.imie} ${z.nazwisko} opanował nową pozycję: ${ETYKIETA_POZ[poz]} (${SKROT_POZ[poz]}) — gra tam teraz z pełną siłą, nie tracąc dotychczasowych.`);
    }
  }
  return msg;
}

/** Szansa drobnej kontuzji treningowej w tygodniu (rośnie z intensywnością, maleje z fizjo). */
export function kontuzjaTreningowa(s: StanGry, z: Zawodnik): number {
  if (z.kontuzja > 0) return 0;
  return 0.006 * intensywnosc(s).kontuzja * modKontuzja(s) * (z.wiek >= 30 ? 1.4 : 1);
}

export { SKILL, ETYKIETA_ATRYB };
export type { SkillKey };

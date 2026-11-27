// Zdjęcie drużyny na początku sezonu — zapisujemy tylko minimalne dane (sezon, klub, osoby z numerami);
// samo zdjęcie renderuje się deterministycznie w UI (src/ui/ZdjecieDruzyny.tsx).
import type { Pozycja, RolaSztabu, StanGry, TwarzCechy } from "./types";

export interface OsobaNaZdjeciu {
  id: string;
  imie: string;
  nazwisko: string;
  numer: number;
  poz: Pozycja;
  kraj?: string;
  twarz?: TwarzCechy;
  wzrost?: number;
  kapitan?: boolean;
}
export interface SztabNaZdjeciu { imie: string; nazwisko: string; rola: string }
export interface ZdjecieDruzyny {
  sezon: number;
  klubId: string;
  klubNazwa: string;
  liga: string;
  kolejka: number; // kiedy zrobiono zdjęcie
  trener: string;
  sztab: SztabNaZdjeciu[];
  zawodnicy: OsobaNaZdjeciu[];
}

type ZeZdjeciami = StanGry & { zdjeciaDruzyny?: ZdjecieDruzyny[] };

const ROLE: Record<RolaSztabu, string> = { asystent: "asystent trenera", bramkarzy: "trener bramkarzy", fizjo: "fizjoterapeuta", kondycja: "trener przygotowania fizycznego", skaut: "skaut", analityk: "analityk" };
const KOLEJNOSC_ROLI: RolaSztabu[] = ["asystent", "bramkarzy", "kondycja", "fizjo", "analityk", "skaut"];

export function zdjeciaDruzyny(s: StanGry): ZdjecieDruzyny[] {
  return (s as ZeZdjeciami).zdjeciaDruzyny ?? [];
}
export function zdjecieSezonu(s: StanGry, sezon = s.sezon, klubId = s.mojKlub): ZdjecieDruzyny | undefined {
  return zdjeciaDruzyny(s).find((z) => z.sezon === sezon && z.klubId === klubId);
}

/** Kadr bieżącej kadry (bez zapisu) — podgląd i podstawa zapisu. */
export function kadrZdjecia(s: StanGry): ZdjecieDruzyny | null {
  const k = s.kluby[s.mojKlub];
  if (!k || s.zwolniony) return null;
  const zawodnicy: OsobaNaZdjeciu[] = k.zawodnicy
    .map((id) => s.zawodnicy[id])
    .filter((z) => !!z)
    .slice(0, 32)
    .map((z) => ({
      id: z.id, imie: z.imie, nazwisko: z.nazwisko, numer: z.numer, poz: z.poz,
      ...(z.kraj ? { kraj: z.kraj } : {}), ...(z.twarz ? { twarz: z.twarz } : {}), ...(z.wzrost ? { wzrost: z.wzrost } : {}),
      ...(s.kapitan === z.id ? { kapitan: true } : {}),
    }));
  const sztab = KOLEJNOSC_ROLI.map((r) => [r, k.sztab?.[r]] as const).filter(([, p]) => !!p).map(([r, p]) => ({ imie: p!.imie, nazwisko: p!.nazwisko, rola: ROLE[r] }));
  return { sezon: s.sezon, klubId: k.id, klubNazwa: k.nazwa, liga: s.ligi[k.poziom - 1]?.nazwa ?? "", kolejka: s.kolejka, trener: s.trener, sztab, zawodnicy };
}

/** Robi (albo z `nadpisz` — powtarza) zdjęcie drużyny na bieżący sezon. Zwraca zapisane zdjęcie. */
export function zrobZdjecieDruzyny(s: StanGry, nadpisz = false): ZdjecieDruzyny | null {
  const kadr = kadrZdjecia(s);
  if (!kadr || kadr.zawodnicy.length === 0) return null;
  const x = s as ZeZdjeciami;
  const lista = x.zdjeciaDruzyny ?? [];
  const i = lista.findIndex((z) => z.sezon === kadr.sezon && z.klubId === kadr.klubId);
  if (i >= 0 && !nadpisz) return lista[i];
  if (i >= 0) lista[i] = kadr; else lista.push(kadr);
  x.zdjeciaDruzyny = lista.sort((a, b) => a.sezon - b.sezon).slice(-40);
  return kadr;
}

/** Automatyczne zdjęcie: gdy sezon ruszył (po okresie przygotowawczym, od 1. kolejki), raz na sezon i klub. */
export function aktualizujZdjecia(s: StanGry) {
  if (s.zwolniony || s.okres || s.koniecSezonu) return;
  if (s.kolejka < 1) return;
  if (!zdjecieSezonu(s)) zrobZdjecieDruzyny(s);
}

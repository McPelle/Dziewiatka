// Reorganizacje lig (#134): ZPN co jakiś czas zmienia system rozgrywek na szczeblu wojewódzkim (np. nowa grupa V ligi,
// likwidacja grupy klasy okręgowej) — zmienia się liczba awansów i spadków między szczeblami. Ogłoszenie zapada
// w trakcie sezonu (jak uchwały zarządów ZPN), a gra stosuje je przy awansach i spadkach po sezonie.
import type { StanGry } from "./types";

interface Reorg { sezon: number; i: number; z: number; na: number; opis: string }
const R = (s: StanGry) => s as unknown as { reorganizacja?: Reorg };

/** W połowie sezonu: rzadko ZPN ogłasza reorganizację dla szczebla wojewódzkiego (IV liga i niżej). */
export function ogloszenieReorganizacji(s: StanGry, r: number, n: number): string | null {
  if (r !== Math.ceil(n / 2) || R(s).reorganizacja?.sezon === s.sezon || Math.random() > 0.09) return null;
  const kand = s.wymiana.map((w, i) => ({ w, i })).filter((x) => x.i >= 4 && x.i + 1 < s.ligi.length); // tylko granice ZPN (IV liga ↔ niżej); III↔IV liga reguluje PZPN (VI/85)
  if (!kand.length) return null;
  const { w, i } = kand[Math.floor(Math.random() * kand.length)];
  const na = Math.max(1, Math.min(5, w + (Math.random() < 0.6 ? 1 : -1))); if (na === w) return null;
  const gorna = s.ligi[i].nazwa, dolna = s.ligi[i + 1].nazwa;
  const opis = na > w ? `utworzenie dodatkowej grupy w ${gorna}` : `zmniejszenie liczby grup w ${gorna}`;
  R(s).reorganizacja = { sezon: s.sezon, i, z: w, na, opis };
  return `🏛 Uchwała zarządu wojewódzkiego ZPN: reorganizacja rozgrywek od nowego sezonu (${opis}). Z ${dolna} awansuje ${na} zamiast ${w} drużyn, z ${gorna} spadnie odpowiednio ${na > w ? "mniej" : "więcej"} — tabela na koniec sezonu zostanie przeliczona według nowych zasad.`;
}

/** Na koniec sezonu (przed awansami i spadkami): wejście reorganizacji w życie. */
export function zastosujReorganizacje(s: StanGry): string | null {
  const r = R(s).reorganizacja; if (!r || r.sezon !== s.sezon || s.wymiana[r.i] === r.na) return null;
  s.wymiana[r.i] = r.na;
  return `🏛 Reorganizacja weszła w życie (${r.opis}): liczba awansów z ${s.ligi[r.i + 1]?.nazwa} — ${r.na}.`;
}

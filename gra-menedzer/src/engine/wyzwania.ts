// Tryb „Wyzwania”: gotowe scenariusze z celem i terminem (np. z B-klasy dwa awanse w 3 sezony, ratunek najsłabszego
// klubu, klub bez grosza, tylko wychowankowie, twierdza u siebie, wszystkie derby). Stan w s.wyzwanie, ocena co kolejkę
// (warunki natychmiastowej porażki) i na koniec sezonu (cel).
import { jestDerby } from "./derby";
import type { Klub, StanGry } from "./types";

export type WynikWyzwania = "trwa" | "sukces" | "porazka";
export interface StanWyzwania { id: string; klub: string; odSezonu: number; startPoziom: number; kadraStart: string[]; wynik?: WynikWyzwania; powod?: string; koniecSezon?: number }
export interface DefWyzwania {
  id: string; nazwa: string; ikona: string; opis: string; trudnosc: 1 | 2 | 3; sezony: number;
  wybierzKlub: (s: StanGry) => string | undefined;
  ustaw?: (s: StanGry) => void;
  /** co kolejkę: porażka natychmiast (zwraca powód) */
  wTrakcie?: (s: StanGry, w: StanWyzwania) => string | null;
  /** na koniec sezonu: sukces / porażka / trwa */
  koniecSezonu: (s: StanGry, w: StanWyzwania) => WynikWyzwania;
}

const sila = (s: StanGry, k: Klub) => { const z = k.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean); return z.length ? z.reduce((a, x) => a + x.umiej, 0) / z.length : 0; };
const kluby = (s: StanGry, poziom: number) => (s.ligi[poziom - 1]?.kluby ?? []).map((id) => s.kluby[id]).filter((k) => k && !k.rezerwaDla);
const najslabszy = (s: StanGry, poziom: number) => kluby(s, poziom).sort((a, b) => sila(s, a) - sila(s, b))[0]?.id;
const srodek = (s: StanGry, poziom: number) => { const k = kluby(s, poziom).sort((a, b) => sila(s, b) - sila(s, a)); return k[Math.floor(k.length / 2)]?.id; };
const ostatniaHist = (s: StanGry) => s.historia?.[s.historia.length - 1];
const archSezonu = (s: StanGry, w: StanWyzwania) => (s.archiwumMeczow ?? []).filter((m) => m.sezon === s.sezon && m.sezon >= w.odSezonu);
const najnizszy = (s: StanGry) => s.ligi.length;

export const WYZWANIA: DefWyzwania[] = [
  { id: "od_dna", nazwa: "Z samego dna", ikona: "🧗", trudnosc: 3, sezony: 3,
    opis: "Najsłabszy klub najniższej klasy w regionie. Dwa awanse w trzy sezony.",
    wybierzKlub: (s) => najslabszy(s, najnizszy(s)),
    koniecSezonu: (s, w) => (s.kluby[s.mojKlub].poziom <= w.startPoziom - 2 ? "sukces" : s.sezon - w.odSezonu + 1 >= 3 ? "porazka" : "trwa") },
  { id: "ratunek", nazwa: "Misja ratunkowa", ikona: "🛟", trudnosc: 2, sezony: 1,
    opis: "Przejmij najsłabszą kadrowo drużynę IV ligi i utrzymaj ją w lidze.",
    wybierzKlub: (s) => najslabszy(s, 5),
    koniecSezonu: (s) => (ostatniaHist(s)?.wynik === "spadek" ? "porazka" : "sukces") },
  { id: "bez_grosza", nazwa: "Bez grosza", ikona: "🪙", trudnosc: 2, sezony: 1,
    opis: "Klub ze środka V ligi zaczyna z pustą kasą. Utrzymaj się i nie wpadnij w długi ponad 20 000 zł.",
    wybierzKlub: (s) => srodek(s, 6) ?? srodek(s, 5),
    ustaw: (s) => { s.kluby[s.mojKlub].kasa = 0; },
    wTrakcie: (s) => (s.kluby[s.mojKlub].kasa < -20000 ? "Dług przekroczył 20 000 zł — zarząd zamyka projekt." : null),
    koniecSezonu: (s) => (ostatniaHist(s)?.wynik === "spadek" ? "porazka" : "sukces") },
  { id: "wychowankowie", nazwa: "Tylko swoi", ikona: "🏡", trudnosc: 2, sezony: 1,
    opis: "Żadnych transferów do klubu — gra tylko obecna kadra i wychowankowie z akademii. Cel: górna połowa tabeli IV ligi.",
    wybierzKlub: (s) => srodek(s, 5),
    wTrakcie: (s, w) => { const k = s.kluby[s.mojKlub]; const obcy = k.zawodnicy.map((id) => s.zawodnicy[id]).find((z) => z && !w.kadraStart.includes(z.id) && z.wychowanek !== k.nazwa); return obcy ? `Do kadry dołączył ${obcy.imie} ${obcy.nazwisko} spoza klubu — zasada złamana.` : null; },
    koniecSezonu: (s) => { const h = ostatniaHist(s); const n = s.ligi[s.kluby[s.mojKlub].poziom - 1]?.kluby.length ?? 16; return h && (h.wynik === "awans" || h.wynik === "mistrz" || h.miejsce <= Math.ceil(n / 2)) ? "sukces" : "porazka"; } },
  { id: "twierdza", nazwa: "Twierdza", ikona: "🏰", trudnosc: 2, sezony: 1,
    opis: "Klub ze środka III ligi. Ani jednej porażki u siebie przez cały sezon.",
    wybierzKlub: (s) => srodek(s, 4),
    wTrakcie: (s, w) => { const p = archSezonu(s, w).find((m) => m.dom && m.my < m.oni); return p ? `Porażka u siebie z ${p.rywal} ${p.my}:${p.oni} — twierdza zdobyta.` : null; },
    koniecSezonu: () => "sukces" },
  { id: "derby", nazwa: "Pan miasta", ikona: "⚔️", trudnosc: 2, sezony: 1,
    opis: "Klub, który ma rywala derbowego we własnej lidze. Nie przegraj żadnych derbów w sezonie i wygraj co najmniej jedne.",
    wybierzKlub: (s) => { const poz = [...Array.from({ length: Math.max(0, s.ligi.length - 3) }, (_, i) => i + 4), 3, 2, 1]; for (const p of poz) for (const k of kluby(s, p)) if (kluby(s, p).some((r) => r.id !== k.id && jestDerby(s, k.id, r.id))) return k.id; return undefined; },
    wTrakcie: (s, w) => { const nazwy = new Map(Object.values(s.kluby).map((x) => [x.nazwa, x.id])); const p = archSezonu(s, w).find((m) => { const id = nazwy.get(m.rywal); return id && jestDerby(s, s.mojKlub, id) && m.my < m.oni; }); return p ? `Przegrane derby z ${p.rywal} ${p.my}:${p.oni}.` : null; },
    koniecSezonu: (s, w) => { const nazwy = new Map(Object.values(s.kluby).map((x) => [x.nazwa, x.id])); return (s.archiwumMeczow ?? []).some((m) => m.sezon >= w.odSezonu && m.my > m.oni && jestDerby(s, s.mojKlub, nazwy.get(m.rywal) ?? "")) ? "sukces" : "porazka"; } },
  { id: "esa", nazwa: "Cud w Ekstraklasie", ikona: "⭐", trudnosc: 3, sezony: 1,
    opis: "Najsłabsza kadra Ekstraklasy. Utrzymaj klub w elicie.",
    wybierzKlub: (s) => najslabszy(s, 1),
    koniecSezonu: (s) => (ostatniaHist(s)?.wynik === "spadek" ? "porazka" : "sukces") },
  { id: "blyskawica", nazwa: "Błyskawiczny awans", ikona: "⚡", trudnosc: 1, sezony: 2,
    opis: "Przeciętny klub przedostatniej klasy rozgrywkowej regionu. Awans w ciągu dwóch sezonów.",
    wybierzKlub: (s) => srodek(s, Math.max(1, najnizszy(s) - 1)),
    koniecSezonu: (s, w) => (s.kluby[s.mojKlub].poziom < w.startPoziom ? "sukces" : s.sezon - w.odSezonu + 1 >= 2 ? "porazka" : "trwa") },
];

/** Ustawia wyzwanie w świecie (po wyborze klubu i rozpoczęciu kariery). */
export function ustawWyzwanie(s: StanGry, d: DefWyzwania) {
  d.ustaw?.(s);
  const k = s.kluby[s.mojKlub];
  s.wyzwanie = { id: d.id, klub: s.mojKlub, odSezonu: s.sezon, startPoziom: k.poziom, kadraStart: [...k.zawodnicy] };
}

/** Kontrola po kolejce. Zwraca komunikat, gdy wyzwanie właśnie przegrano. */
export function sprawdzWyzwanieKolejka(s: StanGry): string | null {
  const w = s.wyzwanie; if (!w || w.wynik) return null;
  const d = WYZWANIA.find((x) => x.id === w.id); const p = s.mojKlub !== w.klub || s.zwolniony ? "Trener nie jest już w klubie, z którym podjął wyzwanie." : d?.wTrakcie?.(s, w);
  if (!p) return null;
  w.wynik = "porazka"; w.powod = p; w.koniecSezon = s.sezon;
  return `🎯 Wyzwanie „${d!.nazwa}” nieudane: ${p} Możesz grać dalej normalną karierą.`;
}

/** Kontrola na koniec sezonu (po wpisie do historii). */
export function sprawdzWyzwanieSezon(s: StanGry): string | null {
  const w = s.wyzwanie; if (!w || w.wynik) return null;
  const d = WYZWANIA.find((x) => x.id === w.id); if (!d) return null;
  const r = d.koniecSezonu(s, w);
  if (r === "trwa") return `🎯 Wyzwanie „${d.nazwa}”: sezon ${s.sezon - w.odSezonu + 1} z ${d.sezony} za Tobą — walka trwa.`;
  w.wynik = r; w.koniecSezon = s.sezon;
  if (r === "sukces") { (s.osiagnieciaFlagi ??= {})[`wyz_${d.id}`] = true; return `🏅 Wyzwanie „${d.nazwa}” ZALICZONE! ${d.ikona} Gratulacje — to się zapisze w historii.`; }
  w.powod = "Cel nie został osiągnięty w terminie.";
  return `🎯 Wyzwanie „${d.nazwa}” nieudane — cel nieosiągnięty w terminie. Kariera trwa dalej.`;
}

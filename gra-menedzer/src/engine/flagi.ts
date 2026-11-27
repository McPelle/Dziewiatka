// Kultura trybun: młyn (sektor najzagorzalszych kibiców z gniazdowym, bębnem i megafonem), oflagowanie płotu
// (flagi dzielnic, osiedli, fanklubów z okolicznych miejscowości, grup kibicowskich, zgód), oprawy i pirotechnika.
// Dzielnice i miejscowości są prawdziwe; NAZWY GRUP KIBICOWSKICH są wygenerowane (gra nie przypisuje zachowań
// realnym grupom). Wszystko stałe dla klubu (z ziarna nazwy), więc te same flagi wiszą co mecz.
import { MIASTA, odlegloscMiast } from "../data/miasta";
import type { Klub, StanGry } from "./types";
import { barwyKlubu } from "../data/barwy";
import { GRUPY_KIBICOW } from "../data/grupyKibicow";

export const DZIELNICE: Record<string, string[]> = {
  Gdańsk: ["Wrzeszcz", "Oliwa", "Przymorze", "Zaspa", "Chełm", "Orunia", "Stogi", "Morena", "Siedlce", "Brzeźno", "Nowy Port", "Osowa"],
  Gdynia: ["Oksywie", "Obłuże", "Chylonia", "Karwiny", "Witomino", "Wzgórze", "Grabówek", "Cisowa", "Pogórze", "Działki Leśne"],
  Kraków: ["Nowa Huta", "Podgórze", "Kazimierz", "Krowodrza", "Bieżanów", "Prokocim", "Kurdwanów", "Azory", "Bronowice", "Czyżyny"],
  Szczecin: ["Pogodno", "Niebuszewo", "Pomorzany", "Gumieńce", "Prawobrzeże", "Dąbie", "Warszewo", "Żelechowa"],
  Bydgoszcz: ["Fordon", "Błonie", "Wyżyny", "Kapuściska", "Szwederowo", "Bartodzieje", "Osowa Góra"],
  Toruń: ["Rubinkowo", "Bielany", "Mokre", "Chełmińskie Przedmieście", "Bydgoskie Przedmieście", "Podgórz"],
  Warszawa: ["Mokotów", "Wola", "Praga", "Ursynów", "Bemowo", "Bielany", "Żoliborz", "Ochota", "Targówek", "Grochów"],
  Poznań: ["Rataje", "Winogrady", "Wilda", "Jeżyce", "Łazarz", "Piątkowo"], Łódź: ["Bałuty", "Widzew", "Retkinia", "Teofilów", "Chojny"],
  Wrocław: ["Krzyki", "Psie Pole", "Fabryczna", "Nadodrze", "Gaj"], Białystok: ["Bojary", "Dziesięciny", "Antoniuk", "Słoneczny Stok"],
  Lublin: ["Czechów", "Kalinowszczyzna", "Bronowice", "Czuby"], Katowice: ["Ligota", "Giszowiec", "Nikiszowiec", "Załęże"],
  Koszalin: ["Rokosowo", "Lubiatowo", "Wilkowo"], Słupsk: ["Zatorze", "Ryczewo", "Westerplatte"], Tarnów: ["Mościce", "Grabówka", "Krzyż"],
  "Nowy Sącz": ["Gołąbkowice", "Wólki", "Zawada"], Włocławek: ["Zazamcze", "Południe", "Michelin"], Grudziądz: ["Strzemięcin", "Lotnisko", "Tarpno"],
};

function rng(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
const krot = (k: Klub) => k.nazwa.split(" ").filter((w) => w.length > 2 && !/^(KS|MKS|GKS|LKS|LZS|TS|SKS|KP|MZKS|ZKS|FC|II|III|Sp)$/.test(w))[0] ?? k.nazwa;

export type TypFlagi = "klub" | "dzielnica" | "fanklub" | "grupa" | "zgoda" | "haslo";
export interface Flaga { tekst: string; typ: TypFlagi; kolory: [string, string] }
export interface KulturaTrybun { mlyn: string; gniazdowy: boolean; grupy: string[]; flagi: Flaga[]; pirotechnika: number /* 0–1 skłonność */; zgody?: string[]; realne?: boolean }

/** Ile flag / jak „mocna" scena kibicowska wg szczebla i renomy. */
function sila(k: Klub) { return Math.max(0.05, (k.poziom <= 1 ? 1 : k.poziom <= 2 ? 0.75 : k.poziom <= 3 ? 0.55 : k.poziom <= 4 ? 0.4 : k.poziom <= 5 ? 0.25 : k.poziom <= 6 ? 0.15 : 0.07) * (0.6 + (k.renoma ?? 0.5) * 0.8)); }

export function kulturaTrybun(s: StanGry, k: Klub, kolory: [string, string] = barwyKlubu(k.nazwa)): KulturaTrybun {
  const r = rng(k.nazwa + "trybuny"), sl = sila(k), K = krot(k);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const mlyn = sl > 0.3 ? pick([`Młyn — Trybuna ${pick(["Północna", "Południowa", "Wschodnia", "Zachodnia"])}`, "Kocioł za bramką", `Sektor „${pick(["Gniazdo", "Kocioł", "Twierdza", "Ściana"])}”`]) : sl > 0.12 ? "Gniazdo przy bramie" : "Kibice przy barierce";
  const rok = () => String(Math.floor(85 + r() * 35) % 100).padStart(2, "0");
  const dz = DZIELNICE[k.miasto] ?? [];
  const nGrup = sl > 0.6 ? 4 : sl > 0.35 ? 3 : sl > 0.18 ? 2 : sl > 0.1 ? 1 : 0;
  const wzory = [() => `Ultras ${K}`, () => `${dz.length ? pick(dz) : k.miasto} Boys '${rok()}`, () => `Młoda Załoga '${rok()}`, () => `${pick(["North", "South", "East", "West"])} Side ${K}`, () => `Old Boys ${rok()}`, () => `Fanatics ${k.miasto}`, () => `${K} Crew '${rok()}`];
  const grupy = [...new Set(Array.from({ length: nGrup }, () => pick(wzory)()))];
  const nFlag = Math.round(1 + sl * 16);
  const flagi: Flaga[] = [{ tekst: k.nazwa.toUpperCase(), typ: "klub", kolory }];
  for (const d of [...dz].sort(() => r() - 0.5).slice(0, Math.min(dz.length, Math.ceil(nFlag * 0.35)))) flagi.push({ tekst: d.toUpperCase(), typ: "dzielnica", kolory });
  // fanklub z okolicznych miejscowości (do ~45 km)
  const okolica = Object.keys(MIASTA).filter((m) => m !== k.miasto && odlegloscMiast(m, k.miasto) > 3 && odlegloscMiast(m, k.miasto) < 45).sort(() => r() - 0.5);
  for (const m of okolica.slice(0, Math.ceil(nFlag * 0.35))) flagi.push({ tekst: `FANKLUB ${m.toUpperCase()}`, typ: "fanklub", kolory: [kolory[1], kolory[0]] });
  for (const g of grupy) flagi.push({ tekst: g.toUpperCase(), typ: "grupa", kolory: ["#111111", kolory[0]] });
  if (sl > 0.15) flagi.push({ tekst: pick([`ZAWSZE WIERNI ${K.toUpperCase()}`, `${k.miasto.toUpperCase()} TO MY`, "WIERNI DO KOŃCA", `DUMA ${k.miasto.toUpperCase()}`, `${K.toUpperCase()} PONAD WSZYSTKO`]), typ: "haslo", kolory });
  const real = GRUPY_KIBICOW[k.nazwa];
  if (real) {
    // prawdziwe nazwy z danych: trybuna, grupy (ultras + ekipy), fankluby, zgody — flagi na płocie
    const gr = [...(real.ultras ?? []), ...(real.chuligani ?? [])];
    const fl: Flaga[] = [{ tekst: k.nazwa.toUpperCase(), typ: "klub", kolory }];
    for (const g of gr) fl.push({ tekst: g.toUpperCase(), typ: "grupa", kolory: ["#111111", kolory[0]] });
    for (const f of real.fanklub ?? []) fl.push({ tekst: f.toUpperCase(), typ: "fanklub", kolory: [kolory[1], kolory[0]] });
    for (const d of dz.slice(0, 4)) fl.push({ tekst: d.toUpperCase(), typ: "dzielnica", kolory });
    return { mlyn: real.trybuna?.[0] ? `Młyn — ${real.trybuna[0]}` : mlyn, gniazdowy: true, grupy: gr.length ? gr : grupy, flagi: fl.slice(0, 22), pirotechnika: Math.min(0.9, Math.max(0.35, sl * 1.1)), zgody: real.zgody, realne: true };
  }
  return { mlyn, gniazdowy: sl > 0.18, grupy, flagi: flagi.slice(0, Math.max(1, nFlag + 1)), pirotechnika: Math.min(0.9, sl * 1.1) };
}

/** Okrzyki młyna w trakcie meczu (do relacji na żywo). */
export function okrzykMlyna(k: Klub, kt: KulturaTrybun, wynik: number): string {
  const K = krot(k);
  const l = wynik > 0 ? [`„${K}, ${K}, ${K}!” — młyn skacze, cały sektor faluje.`, "Młyn: „Kto nie skacze, ten…” — trybuna podskakuje w rytm bębna.", "Szaliki w górę! „You'll never walk alone” po polsku niesie się po stadionie."]
    : wynik < 0 ? [`Gniazdowy przez megafon: „Głośniej! Nie zostawiamy ich samych!” — „${K} walczy, ${K} gra!”`, "Młyn nie przestaje: „Walczcie, walczcie!” mimo wyniku.", "Kibice odwracają się plecami do boiska i śpiewają — wsparcie do końca."]
    : [`„${k.miasto.toUpperCase()}!” — doping z ${kt.mlyn.toLowerCase()}.`, "Bęben wybija rytm, młyn śpiewa na dwie trybuny.", "Klaskanie nad głowami — cały sektor ręce w górę."];
  return `🥁 ${l[Math.floor(Math.random() * l.length)]}`;
}

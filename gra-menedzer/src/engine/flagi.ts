// Kultura trybun: młyn (sektor najzagorzalszych kibiców z gniazdowym, bębnem i megafonem), oflagowanie płotu
// (flagi dzielnic, osiedli, fanklubów z okolicznych miejscowości, grup kibicowskich, zgód), oprawy i pirotechnika.
// Dzielnice i miejscowości są prawdziwe; NAZWY GRUP KIBICOWSKICH są wygenerowane (gra nie przypisuje zachowań
// realnym grupom). Wszystko stałe dla klubu (z ziarna nazwy), więc te same flagi wiszą co mecz.
import { MIASTA, odlegloscMiast } from "../data/miasta";
import type { Klub, StanGry } from "./types";
import { barwyKlubu } from "../data/barwy";
import { GRUPY_KIBICOW } from "../data/grupyKibicow";
import { RELACJE_KIBICOW } from "../data/relacjeKibicow";

export const DZIELNICE: Record<string, string[]> = {
  Gdańsk: ["Wrzeszcz", "Oliwa", "Przymorze", "Zaspa", "Chełm", "Orunia", "Stogi", "Morena", "Siedlce", "Brzeźno", "Nowy Port", "Osowa"],
  Gdynia: ["Oksywie", "Obłuże", "Chylonia", "Karwiny", "Witomino", "Wzgórze", "Grabówek", "Cisowa", "Pogórze", "Działki Leśne"],
  Kraków: ["Nowa Huta", "Podgórze", "Kazimierz", "Krowodrza", "Bieżanów", "Prokocim", "Kurdwanów", "Azory", "Bronowice", "Czyżyny"],
  Szczecin: ["Pogodno", "Niebuszewo", "Pomorzany", "Gumieńce", "Prawobrzeże", "Dąbie", "Warszewo", "Żelechowa"],
  Bydgoszcz: ["Fordon", "Błonie", "Wyżyny", "Kapuściska", "Szwederowo", "Bartodzieje", "Osowa Góra"],
  Toruń: ["Rubinkowo", "Bielany", "Mokre", "Chełmińskie Przedmieście", "Bydgoskie Przedmieście", "Podgórz"],
  Warszawa: ["Mokotów", "Wola", "Praga", "Ursynów", "Bemowo", "Bielany", "Żoliborz", "Ochota", "Targówek", "Grochów"],
  Poznań: ["Rataje", "Winogrady", "Wilda", "Jeżyce", "Łazarz", "Piątkowo"], Łódź: ["Bałuty", "Widzew", "Retkinia", "Teofilów", "Chojny"],
  Wrocław: ["Krzyki", "Psie Pole", "Fabryczna", "Nadodrze", "Gaj"], Białystok: ["Bojary", "Dziesięciny", "Antoniuk", "Słoneczny Stok", "Piaski", "Bacieczki", "Dziesięciny I", "Dziesięciny II", "Wysoki Stoczek", "Białostoczek", "Nowe Miasto", "Zielone Wzgórza", "Wygoda", "Mickiewicza"],
  Lublin: ["Czechów", "Kalinowszczyzna", "Bronowice", "Czuby"], Katowice: ["Ligota", "Giszowiec", "Nikiszowiec", "Załęże"],
  Koszalin: ["Rokosowo", "Lubiatowo", "Wilkowo"], Słupsk: ["Zatorze", "Ryczewo", "Westerplatte"], Tarnów: ["Mościce", "Grabówka", "Krzyż"],
  "Nowy Sącz": ["Gołąbkowice", "Wólki", "Zawada"], Włocławek: ["Zazamcze", "Południe", "Michelin"], Grudziądz: ["Strzemięcin", "Lotnisko", "Tarpno"],
  // Warmińsko-mazurskie i podlaskie — dzielnice/osiedla wg pl.wikipedia (artykuły miast, „Podział administracyjny”)
  "Olsztyn": ["Śródmieście", "Zatorze", "Kortowo", "Jaroty", "Pieczewo", "Nagórki", "Zielona Górka", "Dajtki", "Gutkowo", "Redykajny", "Likusy", "Generałów"],
  "Elbląg": ["Śródmieście", "Stare Miasto", "Zatorze", "Zawada", "Nad Jarem", "Zakrzewo", "Rakowo", "Próchnik", "Dąbrowa", "Modrzewina", "Krasny Las", "Bielany"],
  "Ełk": ["Centrum", "Grunwaldzkie", "Jeziorna", "Szyba", "Konieczki", "Północ I", "Północ II", "Zatorze", "Baranki", "Bogdanowicza", "Kochanowskiego", "Pod Lasem"],
  "Iława": ["Stare Miasto", "Centrum", "Ostródzkie", "Piastowskie", "Kormoran", "Lipowy Dwór", "Gajerek", "Podleśne", "XXX-lecia", "Lubawskie", "Nowy Świat", "Marina Iława"],
  "Giżycko": ["Moniuszki", "Kajki", "Wilanów", "Polamowiec"],
  "Mrągowo": ["Centrum", "Osiedle Brzozowe", "Osiedle Grunwaldzkie", "Osiedle Mazurskie", "Osiedle Medyk", "Osiedle Metalowców", "Osiedle Nikutowo", "Osiedle Parkowe"],
  "Szczytno": ["Bartna Strona", "Fiugajty", "Wolność"],
  "Braniewo": ["Nowe Miasto", "Koźlin"],
  "Olecko": ["Śródmieście", "XXX-lecia", "Osiedle Siejnik", "Lesk", "Osiedle Zielone", "Osiedle Nad Legą"],
  "Suwałki": ["Śródmieście", "Osiedle Centrum", "Osiedle Północ I", "Osiedle Północ II", "Osiedle Hańcza", "Osiedle Polna", "Osiedle Jaćwingów", "Osiedle Klasztorna", "Osiedle Kolejowe", "Osiedle Piastowskie", "Osiedle Emilii Plater", "Szwajcaria"],
  "Łomża": ["Stare Miasto", "Południe", "Łomżyca", "Kraska"],
  "Augustów": ["Osiedle Wschód", "Osiedle Zachód", "Osiedle Uzdrowisko", "Śródmieście", "Klonownica", "Lipowiec", "Przewięź", "Zarzecze", "Borki", "Glinki", "Południe", "Limanowskiego"],
  "Hajnówka": ["Centrum", "Placówka", "Majdan", "Mazury", "Osiedle Lipowa", "Osiedle Millenium", "Osiedle Stefana Batorego", "Osiedle Mikołaja Reja", "Osiedle Chemiczna", "Podlasie", "Czworaki", "Kolejki Leśne"],
};

function rng(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
const krot = (k: Klub) => k.nazwa.split(" ").filter((w) => w.length > 2 && !/^(KS|MKS|GKS|LKS|LZS|TS|SKS|KP|MZKS|ZKS|FC|II|III|Sp)$/.test(w))[0] ?? k.nazwa;

export type TypFlagi = "klub" | "ekipa" | "dzielnica" | "fanklub" | "grupa" | "zgoda" | "haslo";
export interface Flaga { tekst: string; typ: TypFlagi; kolory: [string, string]; kolory2?: [string, string] /* flaga zgody: druga połowa w barwach zgody */ }
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
  // fanklub z okolicznych miejscowości (do ~45 km)
  const okolica = Object.keys(MIASTA).filter((m) => m !== k.miasto && odlegloscMiast(m, k.miasto) > 3 && odlegloscMiast(m, k.miasto) < 45).sort(() => r() - 0.5);
  const nFlag = Math.round(2 + sl * 32); // duże sceny: 30+ flag na płotach młyna
  const flagi: Flaga[] = [{ tekst: k.nazwa.toUpperCase(), typ: "klub", kolory }];
  for (const d of [...dz].sort(() => r() - 0.5).slice(0, Math.min(dz.length, Math.ceil(nFlag * 0.35)))) flagi.push({ tekst: d.toUpperCase(), typ: "dzielnica", kolory });
  for (const m of okolica.slice(0, Math.ceil(nFlag * 0.35))) flagi.push({ tekst: `FANKLUB ${m.toUpperCase()}`, typ: "fanklub", kolory: [kolory[1], kolory[0]] });
  for (const g of grupy) flagi.push({ tekst: g.toUpperCase(), typ: "grupa", kolory: ["#111111", kolory[0]] });
  if (sl > 0.15) flagi.push({ tekst: pick([`ZAWSZE WIERNI ${K.toUpperCase()}`, `${k.miasto.toUpperCase()} TO MY`, "WIERNI DO KOŃCA", `DUMA ${k.miasto.toUpperCase()}`, `${K.toUpperCase()} PONAD WSZYSTKO`]), typ: "haslo", kolory });
  // flagi zgód i układów (pół na pół w barwach obu klubów) — wiszą obok flag klubu
  const flagiZgod: Flaga[] = RELACJE_KIBICOW.filter((r) => r.typ !== "kosa" && (r.a === k.nazwa || r.b === k.nazwa)).slice(0, 4).map((r) => {
    const inny = r.a === k.nazwa ? r.b : r.a;
    return { tekst: `${r.typ === "zgoda" ? "ZGODA" : "UKŁAD"} ${krot(k).toUpperCase()} – ${inny.split(" ").filter((w) => w.length > 2)[0]?.toUpperCase() ?? inny.toUpperCase()}`, typ: "zgoda" as TypFlagi, kolory, kolory2: barwyKlubu(inny) };
  });
  const real = GRUPY_KIBICOW[k.nazwa];
  if (real) {
    // prawdziwe nazwy z danych: trybuna, grupy (ultras + ekipy), fankluby, zgody — flagi na płocie
    const gr = [...(real.ultras ?? []), ...(real.chuligani ?? [])];
    // flagi ekip chuligańskich wiszą ZAWSZE — na każdym meczu klubu (u siebie i w klatce gości), jako pierwsze
    const fl: Flaga[] = [...(real.chuligani ?? []).map((g) => ({ tekst: g.toUpperCase(), typ: "ekipa" as TypFlagi, kolory: ["#0b0b0b", kolory[0]] as [string, string] })), { tekst: k.nazwa.toUpperCase(), typ: "klub", kolory }];
    for (const g of real.ultras ?? []) fl.push({ tekst: g.toUpperCase(), typ: "grupa", kolory: ["#111111", kolory[0]] });
    for (const f of real.flagi ?? []) fl.push({ tekst: f.toUpperCase(), typ: "grupa", kolory });
    for (const f of real.fanklub ?? []) fl.push({ tekst: f.toUpperCase(), typ: "fanklub", kolory: [kolory[1], kolory[0]] });
    for (const d of dz) fl.push({ tekst: d.toUpperCase(), typ: "dzielnica", kolory });
    for (const m of okolica.slice(0, 10)) fl.push({ tekst: `FANKLUB ${m.toUpperCase()}`, typ: "fanklub", kolory: [kolory[1], kolory[0]] });
    for (const n of s.noweFlagi?.[k.nazwa] ?? []) fl.push({ tekst: n.tekst, typ: n.typ as TypFlagi, kolory: n.typ === "grupa" ? ["#111111", kolory[0]] : kolory });
    return { mlyn: real.trybuna?.[0] ? `Młyn — ${real.trybuna[0]}` : mlyn, gniazdowy: true, grupy: gr.length ? gr : grupy, flagi: [...fl.slice(0, 2), ...flagiZgod, ...fl.slice(2)].slice(0, 46), pirotechnika: Math.min(0.9, Math.max(0.35, sl * 1.1)), zgody: real.zgody, realne: true };
  }
  const lista = [...flagi.slice(0, Math.max(1, nFlag + 1)), ...(s.noweFlagi?.[k.nazwa] ?? []).map((n) => ({ tekst: n.tekst, typ: n.typ as TypFlagi, kolory: (n.typ === "grupa" ? ["#111111", kolory[0]] : kolory) as [string, string] }))];
  return { mlyn, gniazdowy: sl > 0.18, grupy, flagi: [...lista.slice(0, 1), ...flagiZgod, ...lista.slice(1)].slice(0, 46), pirotechnika: Math.min(0.9, sl * 1.1) };
}

/** Okrzyki młyna w trakcie meczu (do relacji na żywo). */
export function okrzykMlyna(k: Klub, kt: KulturaTrybun, wynik: number): string {
  const K = krot(k);
  const l = wynik > 0 ? [`„${K}, ${K}, ${K}!” — młyn skacze, cały sektor faluje.`, "Młyn: „Kto nie skacze, ten…” — trybuna podskakuje w rytm bębna.", "Szaliki w górę! „You'll never walk alone” po polsku niesie się po stadionie."]
    : wynik < 0 ? [`Gniazdowy przez megafon: „Głośniej! Nie zostawiamy ich samych!” — „${K} walczy, ${K} gra!”`, "Młyn nie przestaje: „Walczcie, walczcie!” mimo wyniku.", "Kibice odwracają się plecami do boiska i śpiewają — wsparcie do końca."]
    : [`„${k.miasto.toUpperCase()}!” — doping z ${kt.mlyn.toLowerCase()}.`, "Bęben wybija rytm, młyn śpiewa na dwie trybuny.", "Klaskanie nad głowami — cały sektor ręce w górę."];
  return `🥁 ${l[Math.floor(Math.random() * l.length)]}`;
}

const NOWE_OSIEDLA = ["Słoneczne", "Leśne", "Młodych", "Kopernika", "Tysiąclecia", "Piastowskie", "Zachód", "Północ", "Przylesie", "Kwiatowe", "Parkowe", "Batorego", "Sportowe", "Zielone Wzgórza", "Nad Rzeką", "Stare Miasto", "Kolejowe", "Działki"];
/** Tydzień trybun: kibice czasem dorabiają nową flagę (nowe osiedle, fanklub z miasteczka, młoda grupa). Zwraca komunikat dla klubu gracza. */
export function noweFlagiTydzien(s: StanGry, k: Klub): string | null {
  const sl = sila(k); if (sl < 0.12 || Math.random() > sl * 0.07) return null;
  const ist = new Set(kulturaTrybun(s, k).flagi.map((f) => f.tekst));
  const K = krot(k), rok = String(s.sezon % 100).padStart(2, "0");
  const okol = Object.keys(MIASTA).filter((m) => m !== k.miasto && odlegloscMiast(m, k.miasto) < 60);
  const kandydaci: { tekst: string; typ: string; opis: string }[] = [
    ...okol.map((m) => ({ tekst: `FANKLUB ${m.toUpperCase()}`, typ: "fanklub", opis: `kibice z miejscowości ${m} założyli fanklub i zaczęli jeździć na mecze` })),
    ...NOWE_OSIEDLA.map((o) => ({ tekst: `OS. ${o.toUpperCase()}`, typ: "dzielnica", opis: `chłopaki z osiedla ${o} dorobili własną flagę` })),
    ...(DZIELNICE[k.miasto] ?? []).map((d) => ({ tekst: d.toUpperCase(), typ: "dzielnica", opis: `${d} ma wreszcie swoją flagę` })),
    { tekst: `MŁODZI ${K.toUpperCase()} '${rok}`, typ: "grupa", opis: "powstała nowa grupa młodych kibiców" },
    { tekst: `${K.toUpperCase()} ZA GRANICĄ`, typ: "fanklub", opis: "emigranci z Wysp i Niemiec przyjeżdżają na mecze z własną flagą" },
    { tekst: `KOBIETY ${K.toUpperCase()}`, typ: "fanklub", opis: "sekcja kobiet kibicujących klubowi zawiesiła flagę" },
  ].filter((x) => !ist.has(x.tekst));
  if (!kandydaci.length) return null;
  const n = kandydaci[Math.floor(Math.random() * kandydaci.length)];
  (s.noweFlagi ??= {})[k.nazwa] = [...(s.noweFlagi[k.nazwa] ?? []), { tekst: n.tekst, typ: n.typ, sezon: s.sezon }];
  return `🚩 Nowa flaga na płocie ${k.nazwa}: „${n.tekst}” — ${n.opis}.`;
}

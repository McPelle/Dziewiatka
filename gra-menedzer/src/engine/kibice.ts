// Kibice z charakterem — zwłaszcza na derbach i meczach podwyższonego ryzyka: graffiti na sektorze gości,
// transparenty z docinkami, przyśpiewki, skradziona flaga wywieszona do góry nogami, protest milczenia,
// pociąg specjalny pod eskortą, szarpanina przy płocie „klatki" — z karami i wpływem na doping.
// Sektor gości wg przepisów PZPN: co najmniej 5% udostępnionych miejsc dla zorganizowanej grupy gości
// (uchwała PZPN II/85), wydzielony sektor z trwałym ogrodzeniem min. 2,2 m (podręczniki licencyjne I–II ligi).
import { losInt, szansa, wybierz } from "./losuj";
import type { Klub, StanGry } from "./types";
import { kulturaTrybun } from "./flagi";
import { losujAkcje, type Ctx } from "./akcjeKatalog";
import { jestPrzyjazn } from "./derby";
import { GRUPY_KIBICOW } from "../data/grupyKibicow";

export interface AkcjaKibicow { min: number; tekst: string; sektor: "gospodarzy" | "gosci"; transparent?: string; kara?: number; doping?: number; szkody?: number; opoznienie?: number; zatrzymani?: number; wizual?: import("./akcjeKatalog").Wizual }

/** Minimalny sektor gości (% pojemności) wg szczebla: ESA–III liga 5% (wymóg), IV liga i niżej — 5% przy imprezie masowej, inaczej zwyczajowo. */
export const MIN_SEKTOR_GOSCI = 0.05;
export function sektorGosci(s: StanGry, k: Klub, derby: boolean): { miejsca: number; procent: number; klatka: boolean; zamkniety: boolean } {
  const procent = k.id === s.mojKlub ? (s.sektorGosciProcent ?? (derby ? 0.1 : 0.06)) : (derby ? 0.1 : 0.06);
  const zamkniety = k.id === s.mojKlub && procent <= 0;
  const klatka = k.poziom <= 4 || k.pojemnosc >= 1000; // liga centralna lub impreza masowa — wydzielony, ogrodzony sektor
  return { miejsca: Math.round(k.pojemnosc * Math.max(0, procent)), procent, klatka, zamkniety };
}

/** Wspólna „ziemia" derbów — do graffiti i transparentów (np. Trójmiasto dla Gdańska i Gdyni). */
function teren(kd: Klub, kg: Klub): string {
  const m = [kd.miasto, kg.miasto];
  if (m.some((x) => /Gdańsk|Gdynia|Sopot/.test(x)) && m.some((x) => /Gdańsk|Gdynia|Sopot/.test(x)) && kd.miasto !== kg.miasto) return "Trójmiasto";
  if (kd.miasto === kg.miasto) return kd.miasto;
  return "Ten region";
}
const krotko = (k: Klub) => k.nazwa.split(" ").filter((w) => w.length > 2 && !/^(KS|MKS|GKS|LKS|LZS|TS|SKS|KP|MZKS|ZKS|FC|II|III)$/.test(w))[0] ?? k.nazwa;

/** Plan akcji kibiców na mecz (oba sektory). Na zwykłych meczach rzadko i grzecznie, na derbach — z pazurem. */
export function akcjeKibicow(s: StanGry, kd: Klub, kg: Klub, derby: boolean, ryzyko: boolean, gosciWidzow: number): AkcjaKibicow[] {
  const out: AkcjaKibicow[] = [];
  const goscie = gosciWidzow > 0;
  const T = teren(kd, kg), D = krotko(kd), G = krotko(kg);
  // oflagowanie płotu: flagi dzielnic, fanklubów, grup; młyn z gniazdowym
  const kd0 = kulturaTrybun(s, kd), kg0 = kulturaTrybun(s, kg);
  if (kd0.flagi.length >= 3) out.push({ min: 0, sektor: "gospodarzy", tekst: `🚩 Płot obwieszony flagami (${kd0.flagi.length}): ${kd0.flagi.slice(1, 5).map((f) => `„${f.tekst}”`).join(", ")}… ${kd0.gniazdowy ? `W ${kd0.mlyn.toLowerCase()} gniazdowy z megafonem i bęben.` : ""}` });
  if (goscie && kg0.flagi.length >= 1) { const ek = kg0.flagi.filter((f) => f.typ === "ekipa"); const fl = [...ek, ...kg0.flagi.filter((f) => f.typ !== "ekipa").slice(0, Math.max(1, 3 - ek.length))]; out.push({ min: 0, sektor: "gosci", tekst: `🚩 W klatce gości zawisły flagi ${kg.nazwa}: ${fl.map((f) => `„${f.tekst}”`).join(", ")}${ek.length ? " — ekipa jak zawsze na wyjeździe" : ""}.` }); }
  if (derby && szansa(0.12)) {
    const kto = szansa(0.5) ? "gosci" : "gospodarzy";
    const fl = (kto === "gosci" ? kd0 : kg0).flagi.find((f) => f.typ === "dzielnica" || f.typ === "fanklub") ?? (kto === "gosci" ? kd0 : kg0).flagi[0];
    out.push({ min: losInt(10, 40), sektor: kto, tekst: `🚩 Sensacja na trybunach: w sektorze ${kto === "gosci" ? "gości" : "gospodarzy"} wywieszono do góry nogami flagę „${fl.tekst}”, skradzioną kibicom ${kto === "gosci" ? kd.nazwa : kg.nazwa}. Drugi sektor wrze — według niepisanych zasad grupa, która straciła flagę, musi ją zwinąć na zawsze.`, transparent: `${fl.tekst} — DO GÓRY NOGAMI`, doping: kto === "gospodarzy" ? 2 : -2 });
  }
  // duży katalog zachowań kibiców (przed meczem, w trakcie, po; trybuna, klatka, dach, murawa, parking, miasto, dworzec)
  const ctx: Ctx = { D, G, miastoD: kd.miasto, miastoG: kg.miasto, teren: T, flagaD: kd0.flagi.find((f) => f.typ === "dzielnica" || f.typ === "fanklub")?.tekst ?? D, flagaG: kg0.flagi.find((f) => f.typ === "dzielnica" || f.typ === "fanklub")?.tekst ?? G, mlyn: kd0.mlyn };
  for (const { wzor, min, sektor } of losujAkcje({ dom: Math.min(1, kd0.pirotechnika / 0.9), gosc: Math.min(1, kg0.pirotechnika / 0.9) }, derby, ryzyko, goscie, ctx)) {
    out.push({ min, sektor, tekst: wzor.tekst(ctx), transparent: wzor.transparent?.(ctx), kara: wzor.kara, szkody: wzor.szkody, opoznienie: wzor.opoznienie, doping: wzor.doping,
      zatrzymani: wzor.zatrzymani ? losInt(wzor.zatrzymani[0], wzor.zatrzymani[1]) : undefined, wizual: wzor.wizual });
  }
  if (!out.some((a) => a.min > 0) && (kd.poziom <= 5 || derby) && szansa(0.35)) out.push({ min: losInt(15, 70), sektor: "gospodarzy", tekst: `🥁 Gniazdo dopingu nie odpuszcza: bęben, gardła i „${D}, ${D}, ${D}!” przez cały mecz.`, doping: 1 });
  return out.sort((a, b) => a.min - b.min);
}

/** Kara za akcję (gospodarz odpowiada za swój stadion; za sektor gości kara idzie do gości — tu liczymy tylko Twój klub). */
export function karaZaAkcje(k: Klub, a: AkcjaKibicow): number {
  if (!a.kara) return 0;
  return Math.round(([30000, 15000, 7000, 3000, 1500, 900, 500, 400, 300][Math.min(8, k.poziom - 1)] * a.kara) / 100) * 100;
}
/** Rachunek za zniszczenia (płaci klub, którego kibice niszczyli). */
export function szkodyZaAkcje(gospodarz: Klub, a: AkcjaKibicow): number {
  if (!a.szkody) return 0;
  return Math.round(([25000, 12000, 6000, 3000, 1500, 900, 500, 350, 250][Math.min(8, gospodarz.poziom - 1)] * a.szkody * (0.7 + Math.random() * 0.6)) / 100) * 100;
}

/** Zgoda kibicowska między klubami (lista przyjaźni gry + potwierdzone zgody z danych o grupach). */
export function zgodaKibicow(s: StanGry, a: Klub, b: Klub): string | null {
  const z = jestPrzyjazn(s, a.id, b.id); if (z) return z;
  const za = GRUPY_KIBICOW[a.nazwa]?.zgody ?? [], zb = GRUPY_KIBICOW[b.nazwa]?.zgody ?? [];
  const pasuje = (lista: string[], k: Klub) => lista.some((x) => k.nazwa.includes(x) || x.includes(krotko(k)));
  return pasuje(za, b) || pasuje(zb, a) ? `Zgoda ${krotko(a)} – ${krotko(b)}` : null;
}

// ——— wsparcie zgód, układów i obozu na meczu ———
import { RELACJE_KIBICOW } from "../data/relacjeKibicow";
import { AFILIACJE_DODATKOWE, ZGODNE_OBOZY } from "../data/obozy";
import { AFILIACJE } from "../data/derby";
import { odlegloscDrogowa } from "../data/miasta";
/** Kto przyjedzie wesprzeć daną drużynę: zgody/układy (bliskie lub na derby z daleka) i lokalne kluby z obozu (na derby). */
export function wsparcieKibicow(s: StanGry, klub: Klub, miastoMeczu: string, derby: boolean): Klub[] {
  const poNazwie = new Map(Object.values(s.kluby).map((k) => [k.nazwa, k]));
  const out = new Map<string, Klub>();
  const dodaj = (n: string | undefined) => { const k = n ? poNazwie.get(n) : undefined; if (k && k.id !== klub.id && !k.rezerwaDla) out.set(k.nazwa, k); };
  // zgody i układy
  for (const r of RELACJE_KIBICOW) if (r.typ !== "kosa" && (r.a === klub.nazwa || r.b === klub.nazwa)) {
    const inny = poNazwie.get(r.a === klub.nazwa ? r.b : r.a); if (!inny) continue;
    const d = odlegloscDrogowa(inny.miasto, miastoMeczu);
    if (d <= (derby ? 450 : r.typ === "zgoda" ? 320 : 160) || (r.typ === "zgoda" && derby)) dodaj(inny.nazwa); // zgody jeżdżą daleko
  }
  // zgodne obozy (np. Arka–Lech–Cracovia)
  for (const [a, b] of ZGODNE_OBOZY) if (a === klub.nazwa || b === klub.nazwa) { const inny = poNazwie.get(a === klub.nazwa ? b : a); if (inny && (derby || odlegloscDrogowa(inny.miasto, miastoMeczu) <= 160)) dodaj(inny.nazwa); }
  // obóz: lokalne kluby sympatyzujące (na derby przyjeżdżają tłumnie)
  if (derby) for (const [n, patron] of [...Object.entries(AFILIACJE), ...Object.entries(AFILIACJE_DODATKOWE)]) if (patron === klub.nazwa) dodaj(n);
  return [...out.values()].slice(0, 12);
}

// ——— dojazdy na wyjazdy i życie zgód ———
/** Opis wyjazdu kibiców (środek transportu, eskorta, spotkania ze zgodami na trasie). */
export function dojazdKibicow(s: StanGry, gosc: Klub, gospodarz: Klub, ilu: number, derby: boolean): string | null {
  if (ilu <= 0) return null;
  const d = odlegloscDrogowa(gosc.miasto, gospodarz.miasto);
  const srodek = ilu >= 1200 && d > 120 ? "pociągiem specjalnym" : ilu >= 300 ? `kolumną ${Math.ceil(ilu / 50)} autokarów` : ilu >= 60 ? `${Math.ceil(ilu / 9)} busami` : "prywatnymi autami";
  const eskorta = derby || ilu >= 300 ? " pod eskortą policji (radiowozy z przodu i z tyłu, przystanek tylko na wyznaczonej stacji)" : "";
  const zgodaNaTrasie = wsparcieKibicow(s, gosc, gospodarz.miasto, false).find((k) => odlegloscDrogowa(k.miasto, gospodarz.miasto) < d);
  const extra = zgodaNaTrasie ? ` Po drodze dosiadają się kibice ${zgodaNaTrasie.nazwa} — wspólny przejazd zgody.` : "";
  const smaczek = d > 400 ? " Wyjazd na drugi koniec Polski — wyjazd sezonu, kilkanaście godzin w trasie." : d < 40 ? " Część kibiców przyszła pieszo, zwartą grupą." : "";
  return `🚌 Kibice ${gosc.nazwa} (${ilu.toLocaleString("pl")}) przyjechali ${srodek}${eskorta}.${extra}${smaczek}`;
}

/** Tydzień życia zgód: jubileusze, wspólne akcje, rzadko zerwanie zgody lub zawarcie nowej (dynamiczne relacje). */
export function tydzienZgod(s: StanGry, mojKlub: Klub): string | null {
  const moje = RELACJE_KIBICOW.filter((r) => r.typ !== "kosa" && (r.a === mojKlub.nazwa || r.b === mojKlub.nazwa));
  const dyn = (s.relacjeDyn ??= []);
  const r = Math.random();
  if (moje.length && r < 0.04) { const z = moje[Math.floor(Math.random() * moje.length)]; const inny = z.a === mojKlub.nazwa ? z.b : z.a;
    return `🎉 ${["Jubileusz zgody", "Wspólny turniej halowy", "Wspólna zbiórka charytatywna", "Wspólny wyjazd na mecz reprezentacji"][Math.floor(Math.random() * 4)]}: kibice ${mojKlub.nazwa} i ${inny}${Math.random() < 0.5 ? " — wymiana szalików i wspólna flaga „Zgoda na zawsze”" : ""}.`; }
  if (moje.length && r < 0.045) { const z = moje[Math.floor(Math.random() * moje.length)]; const inny = z.a === mojKlub.nazwa ? z.b : z.a;
    if (!dyn.some((x) => x.b === inny)) { dyn.push({ a: mojKlub.nazwa, b: inny, typ: "kosa", od: s.sezon }); return `💔 Zgoda zerwana! Po incydencie na wyjeździe kibice ${mojKlub.nazwa} i ${inny} ogłaszają koniec przyjaźni — od teraz to kosa.`; } }
  if (r > 0.993) { // nowa zgoda: klub, który ma wspólnego wroga
    const wrogowie = new Set(RELACJE_KIBICOW.filter((x) => x.typ === "kosa" && (x.a === mojKlub.nazwa || x.b === mojKlub.nazwa)).map((x) => (x.a === mojKlub.nazwa ? x.b : x.a)));
    const kand = RELACJE_KIBICOW.filter((x) => x.typ === "kosa" && (wrogowie.has(x.a) || wrogowie.has(x.b))).map((x) => (wrogowie.has(x.a) ? x.b : x.a)).filter((n) => n !== mojKlub.nazwa && !moje.some((m) => m.a === n || m.b === n));
    const n = kand[Math.floor(Math.random() * kand.length)];
    if (n && !dyn.some((x) => x.b === n)) { dyn.push({ a: mojKlub.nazwa, b: n, typ: "uklad", od: s.sezon }); return `🤝 Nowy układ kibicowski: ${mojKlub.nazwa} i ${n} — „wróg mojego wroga”. Pierwsze wspólne flagi na trybunach.`; }
  }
  return null;
}

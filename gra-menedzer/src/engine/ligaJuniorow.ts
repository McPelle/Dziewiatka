// Rozgrywki juniorskie — liga i puchar w dwóch kategoriach: U-19 (juniorzy starsi) i U-17 (juniorzy młodsi),
// wzorowane na realiach (Pomorska/Małopolska Liga Juniorów + Puchar ZPN Juniorów). Zgodnie z PZPN kluby od
// klasy A wzwyż mają zespoły juniorskie — uczestnikami są kluby Twojego szczebla (bez najniższej klasy B).
// Twój zespół wystawia realny skład akademii; rywale — siła z renomy i akademii klubu.
import { los, poisson, szansa, tasuj, wybierzWazone } from "./losuj";
import { zakresUmiej } from "./swiat";
import { skladJun } from "./juniorzy";
import type { KatJun, LigaJun, PucharJun, StanGry, WierszJun, WynikJun, Zawodnik } from "./types";

const KAT: KatJun[] = ["U19", "U17"];

function region(s: StanGry): "pomorskie" | "malopolskie" | "zachodniopomorskie" | "kujawsko-pomorskie" {
  const t = s.sciezka || "";
  // Kolejność ważna: „zachodniopomor" i „kujawsko" też zawierają „pomor".
  if (/zachodniopomor/i.test(t)) return "zachodniopomorskie";
  if (/kujawsko/i.test(t)) return "kujawsko-pomorskie";
  if (/ma[łl]opol/i.test(t)) return "malopolskie";
  return "pomorskie";
}
const PRZYMIOTNIK_LIGI: Record<string, string> = {
  pomorskie: "Pomorska", malopolskie: "Małopolska", zachodniopomorskie: "Zachodniopomorska", "kujawsko-pomorskie": "Kujawsko-Pomorska",
};
const ZPN_DOP_JUN: Record<string, string> = {
  pomorskie: "Pomorskiego ZPN", malopolskie: "Małopolskiego ZPN", zachodniopomorskie: "Zachodniopomorskiego ZPN", "kujawsko-pomorskie": "Kujawsko-Pomorskiego ZPN",
};
function nazwaLigi(s: StanGry, kat: KatJun, poziom: number): string {
  const u = kat === "U19" ? "U-19" : "U-17";
  // Szczebel centralny i makroregionalny jak w realu (CLJ dla najwyższych klubów).
  if (poziom <= 2) return `Centralna Liga Juniorów ${u}`;
  if (poziom <= 4) return `Makroregionalna Liga Juniorów ${u}`;
  const reg = PRZYMIOTNIK_LIGI[region(s)];
  const katNaz = kat === "U19" ? "Juniorów Starszych A1" : "Juniorów Młodszych B1";
  if (poziom <= 5) return `${reg} Liga ${katNaz}`;        // liga wojewódzka
  const szczebel = poziom <= 6 ? "I" : poziom <= 7 ? "II" : "III";
  return `${reg} ${szczebel} Liga Okręgowa ${katNaz}`;    // niższe szczeble (klasa okręgowa/A/B)
}
function nazwaPucharu(s: StanGry, kat: KatJun): string {
  return `Puchar ${ZPN_DOP_JUN[region(s)]} Juniorów ${kat === "U19" ? "U-19" : "U-17"}`;
}


/** Bazowa siła juniorów szczebla = ~72% środka przedziału umiejętności seniorów danej ligi. */
function bazaJun(poziom: number): number {
  const [a, b] = zakresUmiej(poziom);
  return ((a + b) / 2) * 0.72;
}
/** Siła zespołu juniorskiego (skala ~ OVERALL). Twój klub = realny skład akademii (z floorem szczebla);
 *  rywale = baza szczebla ± renoma/akademia. Dzięki temu rozgrywki są wyrównane na każdym poziomie. */
export function silaJun(s: StanGry, klubId: string, kat: KatJun): number {
  const k = s.kluby[klubId];
  const youth = bazaJun(k.poziom);
  const katMn = kat === "U17" ? 0.93 : 1; // młodsi nieco słabsi
  if (klubId === s.mojKlub) {
    const top = skladJun(s, klubId, kat).slice(0, 11);
    const real = top.length ? top.reduce((a, z) => a + z.umiej, 0) / top.length - Math.max(0, 11 - top.length) * 2 : youth * 0.6;
    return Math.max(real, youth * 0.82) * katMn; // realna akademia, ale nie bez szans na swoim szczeblu
  }
  const aN = k.akademia ?? Math.max(1, Math.min(5, Math.round(k.renoma * 5) || 1));
  return (youth + (k.renoma - 0.5) * 10 + (aN - 3) * 1.5) * katMn;
}

function xgJun(atak: number, obr: number): number {
  return 1.25 * Math.exp((atak - obr) / 16);
}
function grajMeczJun(s: StanGry, dom: string, gosc: string, kat: KatJun): WynikJun {
  const sd = silaJun(s, dom, kat) + 2.5 + los(-6, 6); // atut gospodarza + wahania formy
  const sg = silaJun(s, gosc, kat) + los(-6, 6);
  return { dom, gosc, gd: poisson(Math.max(0.15, xgJun(sd, sg))), gg: poisson(Math.max(0.1, xgJun(sg, sd) * 0.92)) };
}

/** Tabela ligi juniorów. */
export function tabelaJun(liga: LigaJun, kluby: Record<string, { nazwa: string }>): WierszJun[] {
  const t: Record<string, WierszJun> = {};
  for (const id of liga.kluby) t[id] = { klubId: id, m: 0, w: 0, r: 0, p: 0, bz: 0, bs: 0, pkt: 0 };
  for (const kol of liga.wyniki) for (const w of kol) {
    const d = t[w.dom], g = t[w.gosc]; if (!d || !g) continue;
    d.m++; g.m++; d.bz += w.gd; d.bs += w.gg; g.bz += w.gg; g.bs += w.gd;
    if (w.gd > w.gg) { d.w++; g.p++; d.pkt += 3; } else if (w.gd < w.gg) { g.w++; d.p++; g.pkt += 3; } else { d.r++; g.r++; d.pkt++; g.pkt++; }
  }
  return Object.values(t).sort((a, b) => b.pkt - a.pkt || (b.bz - b.bs) - (a.bz - a.bs) || b.bz - a.bz || (kluby[a.klubId]?.nazwa ?? "").localeCompare(kluby[b.klubId]?.nazwa ?? ""));
}

/** Wszystkie kluby regionu (cała piramida seniorska). */
function regionKluby(s: StanGry): string[] {
  return s.ligi.flatMap((l) => l.kluby);
}
/** Ustawia startowy szczebel juniorski = szczebel seniorów (raz na klub; potem rusza go wynik juniorów). */
export function inicjalizujJuniorPoziom(s: StanGry): void {
  for (let i = 0; i < s.ligi.length; i++) for (const id of s.ligi[i].kluby) {
    const k = s.kluby[id]; if (k && k.juniorPoziom == null) k.juniorPoziom = i + 1;
  }
}

/** Tworzy rozgrywki juniorskie na nowy sezon: liga U-19 i U-17 dla KAŻDEGO szczebla PIRAMIDY JUNIORSKIEJ
 *  (niezależnej od seniorów) + wojewódzkie puchary juniorów. Zgodnie z PZPN kluby mają zespoły juniorskie. */
export function inicjujRozgrywkiJun(s: StanGry): void {
  inicjalizujJuniorPoziom(s);
  const maxP = s.ligi.length;
  const kluby = regionKluby(s);
  const ligi: LigaJun[] = [];
  for (let p = 1; p <= maxP; p++) {
    const grupa = kluby.filter((id) => (s.kluby[id]?.juniorPoziom ?? 99) === p);
    if (grupa.length < 3) continue; // za mała liga — pomijamy
    for (const kat of KAT) ligi.push({ kat, poziom: p, nazwa: nazwaLigi(s, kat, p), kluby: [...grupa], terminarz: terminarzJun(grupa), wyniki: [] });
  }
  // Puchar wojewódzki juniorów — kluby juniorskich szczebli wojewódzkich i wyżej (poziom ≤ 5).
  const pucharKluby = kluby.filter((id) => (s.kluby[id]?.juniorPoziom ?? 99) <= 5);
  const puchary: PucharJun[] = KAT.map((kat) => ({ kat, nazwa: nazwaPucharu(s, kat), runda: 0, pary: losujPary(pucharKluby) }));
  s.juniorRozgrywki = { ligi, puchary };
}

/** Awanse i spadki w piramidzie juniorskiej wg wyników (PZPN): mistrz ligi w górę, ostatni w dół.
 *  Wołane na starcie nowego sezonu PRZED odbudową lig (na podstawie minionych tabel). */
export function awanseSpadkiJun(s: StanGry): void {
  const rg = s.juniorRozgrywki; if (!rg) return;
  const maxP = s.ligi.length;
  for (const liga of rg.ligi.filter((l) => l.kat === "U19")) { // kategoria wiodąca A1 decyduje o szczeblu klubu
    if (!liga.wyniki.some(Boolean)) continue;
    const tab = tabelaJun(liga, s.kluby);
    const gora = tab[0], dol = tab[tab.length - 1];
    if (gora && liga.poziom > 1) {
      const k = s.kluby[gora.klubId]; if (k) { k.juniorPoziom = Math.max(1, (k.juniorPoziom ?? liga.poziom) - 1); if (gora.klubId === s.mojKlub) s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🎉 Wasi juniorzy wygrali ${liga.nazwa} — AWANS do wyższej ligi juniorskiej!` }); }
    }
    if (dol && liga.poziom < maxP) {
      const k = s.kluby[dol.klubId]; if (k) { k.juniorPoziom = Math.min(maxP, (k.juniorPoziom ?? liga.poziom) + 1); if (dol.klubId === s.mojKlub) s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `⬇ Wasi juniorzy zajęli ostatnie miejsce w ${liga.nazwa} — SPADEK do niższej ligi juniorskiej.` }); }
    }
  }
}

function terminarzJun(kluby: string[]): [string, string][][] {
  // ta sama metoda kołowa co seniorzy, ale lokalnie (bez PAUZA w eksporcie swiat — tu prościej)
  const PAUZA = "__pauza__";
  const t = tasuj(kluby.length % 2 ? [...kluby, PAUZA] : [...kluby]);
  const n = t.length, runda: [string, string][][] = [], lista = [...t];
  for (let r = 0; r < n - 1; r++) {
    const pary: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) { const a = lista[i], b = lista[n - 1 - i]; pary.push(r % 2 === 0 ? [a, b] : [b, a]); }
    runda.push(pary); lista.splice(1, 0, lista.pop()!);
  }
  const rew = runda.map((p) => p.map(([a, b]) => [b, a] as [string, string]));
  return [...runda, ...rew].map((p) => p.filter(([a, b]) => a !== PAUZA && b !== PAUZA));
}

function losujPary(kluby: string[]): { a: string; b: string | null }[] {
  const t = tasuj([...kluby]);
  const pary: { a: string; b: string | null }[] = [];
  for (let i = 0; i < t.length; i += 2) pary.push({ a: t[i], b: t[i + 1] ?? null }); // nieparzysty = wolny los
  return pary;
}

/** Co kolejkę seniorów: rozegraj kolejkę ligi juniorów i (co kilka kolejek) rundę pucharu. */
export function juniorKolejka(s: StanGry, r: number): void {
  const rg = s.juniorRozgrywki;
  if (!rg) return;
  for (const liga of rg.ligi) {
    if (r < liga.terminarz.length) {
      const wyniki = liga.terminarz[r].map(([d, g]) => grajMeczJun(s, d, g, liga.kat));
      liga.wyniki[r] = wyniki;
      const mj = wyniki.find((w) => w.dom === s.mojKlub || w.gosc === s.mojKlub);
      if (mj) {
        const uSiebie = mj.dom === s.mojKlub, moje = uSiebie ? mj.gd : mj.gg, ich = uSiebie ? mj.gg : mj.gd;
        const rywal = s.kluby[uSiebie ? mj.gosc : mj.dom]?.nazwa ?? "rywal";
        const wynik = moje > ich ? "Wygrana" : moje < ich ? "Porażka" : "Remis";
        const det = statystykiMeczuJun(s, liga.kat, moje, ich, rywal, uSiebie);
        const strz = det.strzelcy.map((id) => s.zawodnicy[id]?.nazwisko).filter(Boolean);
        s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🧒 ${liga.kat}: ${wynik} ${moje}:${ich} z ${rywal} (${uSiebie ? "dom" : "wyjazd"})${strz.length ? ` — gole: ${strz.join(", ")}` : ""}${det.najlepszy ? `. ⭐ Talent kolejki: ${s.zawodnicy[det.najlepszy]?.imie} ${s.zawodnicy[det.najlepszy]?.nazwisko}` : ""}.` });
        if (r > 0 && r % 4 === 0) juniorMiesiaca(s, liga.kat);
      }
    }
  }
  // Puchar co 5 kolejek (runda), jeśli zostało >1 drużyny.
  if (r > 0 && r % 5 === 0) for (const puchar of rg.puchary) rundaPucharuJun(s, puchar);
}

function rundaPucharuJun(s: StanGry, puchar: PucharJun): void {
  if (puchar.zwyciezca) return;
  const aktywni = puchar.pary.filter((p) => !p.b ? true : true);
  // rozegraj niezagrane pary
  let cos = false;
  for (const p of puchar.pary) {
    if (p.gd != null) continue;
    if (!p.b) { p.gd = 1; p.gg = 0; cos = true; continue; } // wolny los
    const w = grajMeczJun(s, p.a, p.b, puchar.kat);
    // bez remisów w pucharze — dogrywka/karne rozstrzyga losowo lekko po gospodarzu
    let gd = w.gd, gg = w.gg;
    if (gd === gg) { if (los(0, 1) < 0.52) gd++; else gg++; }
    p.gd = gd; p.gg = gg; cos = true;
    if ((p.a === s.mojKlub || p.b === s.mojKlub)) {
      const uSiebie = p.a === s.mojKlub, moje = uSiebie ? gd : gg, ich = uSiebie ? gg : gd;
      const awans = moje > ich;
      s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🏆 ${puchar.nazwa}: ${moje}:${ich} z ${s.kluby[uSiebie ? p.b! : p.a]?.nazwa ?? "rywal"} — ${awans ? "awans dalej!" : "odpadli."}` });
    }
  }
  if (!cos) return;
  // wyłoń zwycięzców, zbuduj następną rundę
  const zwyciezcy = puchar.pary.map((p) => (p.b == null ? p.a : (p.gd! >= p.gg! ? p.a : p.b!)));
  puchar.runda++;
  if (zwyciezcy.length <= 1) { puchar.zwyciezca = zwyciezcy[0];
    if (zwyciezcy[0] === s.mojKlub) s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🥇 Zdobyliście ${puchar.nazwa}!` });
    return;
  }
  puchar.pary = [];
  for (let i = 0; i < zwyciezcy.length; i += 2) puchar.pary.push({ a: zwyciezcy[i], b: zwyciezcy[i + 1] ?? null });
}

// —— Pomoce dla UI ——
export function mojaLigaJun(s: StanGry, kat: KatJun): LigaJun | undefined {
  const p = s.kluby[s.mojKlub]?.juniorPoziom ?? s.kluby[s.mojKlub]?.poziom;
  return s.juniorRozgrywki?.ligi.find((l) => l.kat === kat && l.kluby.includes(s.mojKlub)) ?? s.juniorRozgrywki?.ligi.find((l) => l.kat === kat && l.poziom === p);
}
export function mojPucharJun(s: StanGry, kat: KatJun): PucharJun | undefined {
  return s.juniorRozgrywki?.puchary.find((p) => p.kat === kat);
}
/** Ostatnie wyniki mojego zespołu w lidze juniorów danej kategorii (najnowsze pierwsze). */
export function mojeWynikiJun(s: StanGry, kat: KatJun, ile = 6): { rywal: string; dom: boolean; moje: number; ich: number }[] {
  const liga = mojaLigaJun(s, kat); if (!liga) return [];
  const out: { rywal: string; dom: boolean; moje: number; ich: number }[] = [];
  for (const kol of liga.wyniki) for (const w of kol ?? []) {
    if (w.dom === s.mojKlub || w.gosc === s.mojKlub) {
      const dom = w.dom === s.mojKlub;
      out.push({ rywal: s.kluby[dom ? w.gosc : w.dom]?.nazwa ?? "?", dom, moje: dom ? w.gd : w.gg, ich: dom ? w.gg : w.gd });
    }
  }
  return out.reverse().slice(0, ile);
}
/** Czy mój klub jest jeszcze w pucharze juniorów danej kategorii. */
export function wPucharzeJun(s: StanGry, kat: KatJun): boolean {
  const p = mojPucharJun(s, kat); if (!p) return false;
  if (p.zwyciezca) return p.zwyciezca === s.mojKlub;
  return p.pary.some((x) => x.a === s.mojKlub || x.b === s.mojKlub);
}


// ——— Statystyki juniorów Twojego klubu ———
const WAGA_GOLA: Record<string, number> = { BR: 0, OBR: 0.6, POM: 1.6, NAP: 3.2 };
function wpis(s: StanGry, z: Zawodnik, kat: KatJun) {
  if (!z.jun || z.jun.sezon !== s.sezon || z.jun.kat !== kat) {
    if (z.jun && z.jun.m > 0) (z.junKariera ??= []).push({ sezon: z.jun.sezon, kat: z.jun.kat, m: z.jun.m, g: z.jun.g, a: z.jun.a, sr: Math.round((z.jun.oc / z.jun.m) * 10) / 10 });
    z.jun = { sezon: s.sezon, kat, m: 0, g: 0, a: 0, oc: 0, wyr: 0 };
  }
  return z.jun;
}
/** Rozkłada gole/asysty na juniorów Twojej drużyny i wystawia oceny; dobre mecze lekko przyspieszają rozwój. */
function statystykiMeczuJun(s: StanGry, kat: KatJun, moje: number, ich: number, rywal: string, dom: boolean): { strzelcy: string[]; najlepszy?: string } {
  const xi = skladJun(s, s.mojKlub, kat).slice(0, 11);
  if (!xi.length) return { strzelcy: [] };
  const strzelcy: string[] = [], asyst: string[] = [];
  for (let g = 0; g < moje; g++) {
    const st = wybierzWazone(xi, (z) => (WAGA_GOLA[z.poz] ?? 1) * (0.6 + z.umiej / 60));
    strzelcy.push(st.id);
    if (szansa(0.7)) { const as = wybierzWazone(xi.filter((z) => z.id !== st.id), (z) => (z.poz === "POM" ? 2 : z.poz === "NAP" ? 1.5 : 0.7)); if (as) asyst.push(as.id); }
  }
  const baza = 6 + (moje - ich) * 0.35;
  let best: { id: string; oc: number } | undefined;
  for (const z of xi) {
    const w = wpis(s, z, kat);
    const oc = Math.max(3.5, Math.min(10, baza + strzelcy.filter((x) => x === z.id).length * 0.9 + asyst.filter((x) => x === z.id).length * 0.5 + (z.umiej - xi.reduce((a, x) => a + x.umiej, 0) / xi.length) * 0.05 + los(-0.8, 0.8)));
    w.m++; w.oc += oc;
    w.g += strzelcy.filter((x) => x === z.id).length;
    w.a += asyst.filter((x) => x === z.id).length;
    if (oc >= 7.5 && z.potencjal > z.umiej) z.umiej = Math.min(z.potencjal, z.umiej + 0.08); // dobry występ = doświadczenie
    if (!best || oc > best.oc) best = { id: z.id, oc };
  }
  if (best) { const z = s.zawodnicy[best.id]; if (z.jun) z.jun.wyr++; }
  (s.meczeJun ??= []).unshift({ kat, sezon: s.sezon, kolejka: s.kolejka, rywal, dom, moje, ich, strzelcy, najlepszy: best?.id });
  s.meczeJun = s.meczeJun.slice(0, 24);
  return { strzelcy, najlepszy: best?.id };
}
/** Junior miesiąca (co 4 kolejki): najwyższa średnia ocen (min. 3 mecze) — morale i reputacja w górę. */
function juniorMiesiaca(s: StanGry, kat: KatJun) {
  const xi = skladJun(s, s.mojKlub, kat).filter((z) => z.jun && z.jun.sezon === s.sezon && z.jun.m >= 3);
  if (!xi.length) return;
  const z = xi.sort((a, b) => b.jun!.oc / b.jun!.m - a.jun!.oc / a.jun!.m)[0];
  z.morale = Math.min(100, z.morale + 6);
  s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🏅 Junior miesiąca ${kat}: ${z.imie} ${z.nazwisko} (${z.wiek} l.) — średnia ${(z.jun!.oc / z.jun!.m).toFixed(1)}, ${z.jun!.g} goli, ${z.jun!.a} asyst. Trener akademii: „${z.potencjal - z.umiej >= 15 ? "To materiał na pierwszy zespół." : "Solidnie się rozwija."}"` });
}
/** Raport trenera akademii: najwięksi talenci kategorii z oceną perspektyw. */
export function raportAkademii(s: StanGry, kat: KatJun): { id: string; tekst: string }[] {
  return skladJun(s, s.mojKlub, kat).slice().sort((a, b) => b.potencjal - a.potencjal).slice(0, 3).map((z) => {
    const zapas = z.potencjal - z.umiej;
    const ocena = z.potencjal >= 75 ? "potencjał na Ekstraklasę" : z.potencjal >= 62 ? "może grać w I–II lidze" : z.potencjal >= 50 ? "materiał na III–IV ligę" : "solidny zawodnik niższych lig";
    return { id: z.id, tekst: `${z.imie} ${z.nazwisko} (${z.wiek} l.) — ${ocena}; ${zapas >= 18 ? "ogromny zapas rozwoju" : zapas >= 10 ? "spory zapas" : "rozwój powoli się wyrównuje"}.` };
  });
}
/** Najbliższe mecze ligi juniorów Twojego klubu. */
export function najblizszeMeczeJun(s: StanGry, kat: KatJun, ile = 3): { rywal: string; dom: boolean; kolejka: number }[] {
  const l = mojaLigaJun(s, kat);
  if (!l) return [];
  const out: { rywal: string; dom: boolean; kolejka: number }[] = [];
  for (let r = l.wyniki.length; r < l.terminarz.length && out.length < ile; r++) {
    const p = l.terminarz[r].find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
    if (p) out.push({ rywal: s.kluby[p[0] === s.mojKlub ? p[1] : p[0]]?.nazwa ?? "?", dom: p[0] === s.mojKlub, kolejka: r + 1 });
  }
  return out;
}

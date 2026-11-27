// Mecz na żywo: symulacja minuta po minucie meczu Twojej drużyny, z możliwością zmian taktyki i zmian zawodników
// w trakcie gry. Limity zmian wg regulaminów rozgrywek (sezon 2025/26–2026/27):
// • Ekstraklasa, I, II i III liga — 5 zmian w maks. 3 przerwach (+ przerwa między połowami);
// • Małopolski ZPN — IV liga 5, V liga / okręgówka / A / B klasa 7;
// • Pomorski ZPN — IV liga, okręgówka, A klasa 5, B klasa 6;
// • Zachodniopomorski ZPN — IV liga, okręgówka, A klasa 7, B klasa: zmiany powrotne bez limitu;
// • Kujawsko-Pomorski ZPN — IV liga, okręgówka, A klasa 5, B klasa 7.
// Po meczu wynik (gole, kartki, urazy, zmiany, kondycja) trafia do zwykłej kolejki jako „scenariusz" meczu.
import { los, losInt, szansa, wybierz, wybierzWazone } from "./losuj";
import { autoSklad, dostepny, efektywna, FORMACJE, silaSkladu } from "./mecz";
import { formacjaAI } from "./sezon";
import type { Nastawienie, Pozycja, StanGry, Zawodnik } from "./types";

export interface ZasadyZmian { limit: number; okna: number | null; powrotne: boolean; lawka: number; opis: string }
export function zasadyZmian(s: StanGry): ZasadyZmian {
  const k = s.kluby[s.mojKlub]; const p = k.poziom;
  const nazwa = s.ligi[p - 1]?.nazwa ?? "";
  if (p <= 4) return { limit: 5, okna: 3, powrotne: false, lawka: 9, opis: "5 zmian w maks. 3 przerwach w grze (przerwa między połowami się nie liczy) — przepisy PZPN" };
  const sc = s.sciezka ?? "";
  const woj = /^Pomorskie/.test(sc) ? "POM" : /^Zachodnio/.test(sc) ? "ZZPN" : /^Kujawsko/.test(sc) ? "KP" : "MZPN";
  const kl = p === 5 ? "IV" : /klasa B|B klasa|B-klas/i.test(nazwa) ? "B" : /klasa A|A klasa|A-klas/i.test(nazwa) ? "A" : "OKR";
  const T: Record<string, Record<string, number>> = {
    MZPN: { IV: 5, OKR: 7, A: 7, B: 7 }, POM: { IV: 5, OKR: 5, A: 5, B: 6 }, ZZPN: { IV: 7, OKR: 7, A: 7, B: 99 }, KP: { IV: 5, OKR: 5, A: 5, B: 7 },
  };
  const limit = T[woj][kl];
  const nz = { MZPN: "Małopolski ZPN", POM: "Pomorski ZPN", ZZPN: "Zachodniopomorski ZPN", KP: "Kujawsko-Pomorski ZPN" }[woj];
  if (limit >= 99) return { limit: 99, okna: null, powrotne: true, lawka: 7, opis: `${nz}, klasa B: zmiany powrotne bez limitu (zawodnik może wrócić na boisko)` };
  return { limit, okna: null, powrotne: false, lawka: 7, opis: `${nz}: ${limit} zmian w meczu` };
}

export interface ZespolLive { klubId: string; naBoisku: string[]; lawka: string[]; start: string[]; zagrali: string[]; formacja: string; nastawienie: Nastawienie; zmiany: number; oknaZmian: number[]; czerwoni: string[]; zolte: string[] }
export type TypKom = "gol" | "akcja" | "kartka" | "zmiana" | "uraz" | "info" | "taktyka" | "var" | "karny" | "stały" | "kibice";
export interface Komentarz { min: string; tekst: string; typ: TypKom; strona?: "dom" | "gosc" }
export interface ScenGol { min: number; klubId: string; strzelec: string; asysta?: string; typ: "gol" | "karny" | "samoboj" }
/** Punkt toru piłki w danej minucie (boisko 0–100: x od bramki gospodarzy do bramki gości, y od lewej linii bocznej). */
export interface PunktAkcji { x: number; y: number; h?: number; nosnik?: string; zdarzenie?: "strzal" | "gol" | "obrona" | "slupek" | "rozny" | "wolny" | "karny" | "faul" | "aut" | "spalony" }
export type Okrzyk = "naprzod" | "spokojnie" | "skrzydla" | "pressing" | "czas";
export type Mowa = "pochwala" | "spokoj" | "wiara" | "ochrzan";
export interface Wazne { typ: "gol" | "czerwona" | "uraz" | "karny" | "var" | "przerwa" | "koniec"; strona?: "dom" | "gosc"; id?: string; tekst: string }
export interface MeczLive {
  dom: ZespolLive; gosc: ZespolLive; moja: "dom" | "gosc";
  min: number; polowa: 1 | 2 | 3 | 4; dolicz: [number, number]; gd: number; gg: number; koniec: boolean;
  gole: ScenGol[]; kartki: { min: number; klubId: string; id: string; typ: "zolta" | "czerwona"; opis: string }[];
  urazy: { min: number; klubId: string; id: string; tyg: number; opis: string }[];
  zmianyLog: { min: number; klubId: string; wchodzi: string; schodzi: string; powod: string }[];
  komentarz: Komentarz[];
  staty: { strz: [number, number]; celne: [number, number]; rozne: [number, number]; faule: [number, number]; spalone: [number, number]; posD: number; posN: number; xg: [number, number]; slupki: [number, number]; obrony: [number, number]; strzaly: { x: number; y: number; strona: "dom" | "gosc"; gol: boolean; xg: number }[] };
  pilka: { x: number; y: number; strona: "dom" | "gosc" }; zasady: ZasadyZmian; atut: number;
  kondStart: Record<string, number>;
  oceny: Record<string, number>; momentum: number; sekwencja: PunktAkcji[]; wazne: Wazne | null;
  okrzyk?: { typ: Okrzyk; do: number }; mowa?: Mowa; motMoj: number; var: boolean; poziom: number;
  dotkniecia: Record<string, number>; // ile razy był przy piłce (heatmapa / aktywność)
  /** Mecz pucharowy: przy remisie dogrywka (2×15) albo od razu rzuty karne — wg regulaminu ZPN / PZPN. */
  puchar?: { nazwa: string; dogrywka: boolean };
  /** Seria rzutów karnych (po 5, potem do pierwszej pomyłki). */
  karne?: { d: boolean[]; g: boolean[]; wykD: string[]; wykG: string[]; zwyciezca?: "dom" | "gosc" };
}

const nz = (s: StanGry, id: string) => { const z = s.zawodnicy[id]; return z ? `${z.imie[0]}. ${z.nazwisko}` : "?"; };
const nastAI = (s: StanGry, a: string, b: string): Nastawienie => { const d = s.kluby[a].renoma - s.kluby[b].renoma; return d > 0.25 ? "ofensywne" : d < -0.25 ? "obronne" : "zrownowazone"; };
const at = (z: Zawodnik | undefined, k: keyof NonNullable<Zawodnik["atrybuty"]>) => z?.atrybuty?.[k] ?? z?.umiej ?? 40;

/** Start meczu na żywo (nie zmienia stanu gry poza kondycją zawodników w trakcie — rozliczenie przy zapisie wyniku). */
export function rozpocznijMeczNaZywo(s: StanGry, domId: string, goscId: string): MeczLive {
  const zas = zasadyZmian(s);
  const zesp = (id: string, rywal: string): ZespolLive => {
    const moj = id === s.mojKlub;
    const formacja = moj ? s.taktyka.formacja : formacjaAI(id);
    const xi = moj ? [...s.taktyka.sklad] : autoSklad(s, id, formacja);
    const law = s.kluby[id].zawodnicy.filter((x) => !xi.includes(x)).map((x) => s.zawodnicy[x]).filter((z) => z && dostepny(s, z))
      .sort((a, b) => efektywna(b) - efektywna(a));
    const br = law.find((z) => z.poz === "BR");
    const lw = [...(br ? [br] : []), ...law.filter((z) => z !== br)].slice(0, zas.lawka).map((z) => z.id);
    return { klubId: id, naBoisku: xi, lawka: lw, start: [...xi], zagrali: [...xi], formacja, nastawienie: moj ? s.taktyka.nastawienie : nastAI(s, id, rywal), zmiany: 0, oknaZmian: [], czerwoni: [], zolte: [] };
  };
  const poziom = Math.min(s.kluby[domId].poziom, s.kluby[goscId].poziom);
  const m: MeczLive = {
    dom: zesp(domId, goscId), gosc: zesp(goscId, domId), moja: domId === s.mojKlub ? "dom" : "gosc",
    min: 0, polowa: 1, dolicz: [losInt(1, 3), losInt(2, 6)], gd: 0, gg: 0, koniec: false,
    gole: [], kartki: [], urazy: [], zmianyLog: [], komentarz: [],
    staty: { strz: [0, 0], celne: [0, 0], rozne: [0, 0], faule: [0, 0], spalone: [0, 0], posD: 0, posN: 0, xg: [0, 0], slupki: [0, 0], obrony: [0, 0], strzaly: [] },
    pilka: { x: 50, y: 50, strona: "dom" }, zasady: zas, atut: 1.12, kondStart: {},
    oceny: {}, momentum: 0, sekwencja: [{ x: 50, y: 50 }], wazne: null, motMoj: 1, var: poziom <= 2, poziom, dotkniecia: {},
  };
  for (const id of [...m.dom.naBoisku, ...m.dom.lawka, ...m.gosc.naBoisku, ...m.gosc.lawka]) {
    const z = s.zawodnicy[id]; m.kondStart[id] = z?.kondycja ?? 90;
    m.oceny[id] = z ? 6.0 + (z.umiej - 50) / 100 * 0.8 + z.forma * 0.06 : 6;
  }
  const kd = s.kluby[domId], kg = s.kluby[goscId];
  m.komentarz.unshift({ min: "0'", typ: "info", tekst: `Witamy na ${kd.stadion ?? `stadionie w ${kd.miasto}`}! ${kd.nazwa} podejmuje ${kg.nazwa}. Ustawienia: ${m.dom.formacja} kontra ${m.gosc.formacja}.` });
  m.komentarz.unshift({ min: "1'", typ: "info", tekst: `Sędzia ${m.var ? "(z wozem VAR) " : ""}gwiżdże — zaczynamy! ${poziom >= 7 ? "Kameralna atmosfera, kibice przy barierkach." : poziom <= 3 ? "Trybuny pełne, doping niesie się po stadionie." : "Na trybunach spora grupa miejscowych kibiców."}` });
  return m;
}

const NAST: Record<Nastawienie, { swoje: number; rywala: number }> = {
  autobus: { swoje: 0.62, rywala: 0.6 }, obronne: { swoje: 0.82, rywala: 0.8 }, zrownowazone: { swoje: 1, rywala: 1 }, ofensywne: { swoje: 1.18, rywala: 1.15 },
};
function sila(s: StanGry, z: ZespolLive) {
  const reczne = z.klubId === s.mojKlub && !!s.taktyka.reczneSloty && z.naBoisku.length === 11 && z.formacja === s.taktyka.formacja;
  return silaSkladu(s, z.naBoisku, FORMACJE[z.formacja] ? z.formacja : "4-4-2", reczne);
}
const tempoMn = (s: StanGry, id: string) => id !== s.mojKlub ? 1 : s.taktyka.tempo === "szybkie" ? 1.08 : s.taktyka.tempo === "wolne" ? 0.93 : 1;
const pressMn = (s: StanGry, id: string) => id !== s.mojKlub ? 1 : s.taktyka.pressing === "wysoki" ? 1.05 : s.taktyka.pressing === "niski" ? 0.96 : 1;
const okrz = (m: MeczLive) => (m.okrzyk && m.okrzyk.do >= m.min ? m.okrzyk.typ : undefined);
const KALIBRACJA = 1.15; // dopasowanie średniej goli do zwykłej symulacji (~3,9 na mecz)

/** Oczekiwane gole na minutę dla obu stron przy obecnych składach, taktyce, okrzykach i mowie z przerwy. */
export function tempoGoli(s: StanGry, m: MeczLive): [number, number] {
  const sd = sila(s, m.dom), sg = sila(s, m.gosc);
  const nd = NAST[m.dom.nastawienie], ng = NAST[m.gosc.nastawienie];
  const amator = 1 + (s.kluby[m.dom.klubId].poziom - 1) * 0.025;
  const xg = (a: number, o: number) => 1.48 * Math.exp((a - o) / 11);
  const t = tempoMn(s, m.dom.klubId) * tempoMn(s, m.gosc.klubId);
  let lamD = xg(sd.atak, sg.obrona) * m.atut * nd.swoje * ng.rywala * amator * t * pressMn(s, m.dom.klubId) * pressMn(s, m.gosc.klubId);
  let lamG = xg(sg.atak, sd.obrona) * 0.92 * ng.swoje * nd.rywala * amator * t * pressMn(s, m.gosc.klubId) * pressMn(s, m.dom.klubId);
  // okrzyk z ławki i mowa w szatni działają na Twoją drużynę
  const o = okrz(m);
  const [mojeL, ichL] = o === "naprzod" ? [1.12, 1.06] : o === "spokojnie" ? [0.95, 0.95] : o === "skrzydla" ? [1.04, 1] : o === "pressing" ? [1.05, 0.96] : o === "czas" ? [0.82, 0.88] : [1, 1];
  if (m.moja === "dom") { lamD *= mojeL * m.motMoj; lamG *= ichL; } else { lamG *= mojeL * m.motMoj; lamD *= ichL; }
  return [lamD / 90 * KALIBRACJA, lamG / 90 * KALIBRACJA];
}

/** Rodzaje sytuacji strzeleckich z gry: [nazwa, udział, xG]. Średnie xG ≈ 0,12 — jak w realnych statystykach. */
const SYTUACJE: [string, number, number][] = [["dalekie", 0.34, 0.035], ["pole", 0.44, 0.11], ["samnasam", 0.12, 0.38], ["glowka", 0.1, 0.09]];
const SR_XG = SYTUACJE.reduce((a, [, p, x]) => a + p * x, 0);

function wybierzZ(s: StanGry, ids: string[], waga: (z: Zawodnik) => number): Zawodnik | undefined {
  const zs = ids.map((id) => s.zawodnicy[id]).filter(Boolean);
  return zs.length ? wybierzWazone(zs, (z) => Math.max(0.01, waga(z))) : undefined;
}
const bramkarz = (s: StanGry, z: ZespolLive) => z.naBoisku.map((id) => s.zawodnicy[id]).find((p) => p?.poz === "BR");
const ocena = (m: MeczLive, id: string | undefined, d: number) => { if (id && m.oceny[id] !== undefined) m.oceny[id] = Math.max(1, Math.min(10, m.oceny[id] + d)); };
const dotknij = (m: MeczLive, id?: string) => { if (id) m.dotkniecia[id] = (m.dotkniecia[id] ?? 0) + 1; };
const wykonawca = (s: StanGry, z: ZespolLive, r: "karne" | "wolne" | "rozne") => {
  const w = z.klubId === s.mojKlub ? s.wykonawcy?.[r] : undefined;
  if (w && z.naBoisku.includes(w)) return s.zawodnicy[w];
  const ocen = (p: Zawodnik) => r === "karne" ? at(p, "str") + (p.cechy?.includes("egzekutor") ? 8 : 0) : r === "wolne" ? at(p, "str") * 0.6 + at(p, "dry") * 0.5 : at(p, "pod") * 0.6 + at(p, "dry") * 0.5;
  return z.naBoisku.map((id) => s.zawodnicy[id]).filter((p) => p && p.poz !== "BR").sort((a, b) => ocen(b) - ocen(a))[0];
};

/** Jedna minuta meczu. Zwraca true, gdy padł gol. W `m.wazne` zostaje ważne zdarzenie (gol, czerwona, uraz, VAR…) do auto-pauzy. */
export function krokMinuty(s: StanGry, m: MeczLive): boolean {
  if (m.koniec) return false;
  m.wazne = null;
  m.min++;
  const kon1 = 45 + m.dolicz[0], kon2 = 90 + m.dolicz[1];
  if (m.karne) { m.min--; krokKarnych(s, m); return false; }
  const minZap = m.polowa === 1 ? Math.min(45, m.min) : m.polowa === 2 ? m.min : m.polowa === 3 ? Math.min(105, m.min) : Math.min(120, m.min);
  const minTxt = tekstMinuty(m);
  if (m.min === 46 && m.polowa === 1) m.komentarz.unshift({ min: "45'", typ: "info", tekst: `⏱ Sędzia techniczny pokazuje ${m.dolicz[0]} min doliczonego czasu.` });
  if (m.min === 91 && m.polowa === 2) m.komentarz.unshift({ min: "90'", typ: "info", tekst: `⏱ Tablica w górze: ${m.dolicz[1]} min doliczonego czasu!` });
  const [lD, lG] = tempoGoli(s, m);
  let gol = false;
  m.momentum *= 0.9;
  const pD = Math.max(0.28, Math.min(0.72, 0.5 + (lD - lG) * 22 + m.momentum * 0.08));
  const strona: "dom" | "gosc" = Math.random() < pD ? "dom" : "gosc";
  if (strona === "dom") m.staty.posD++; m.staty.posN++;
  const atak = strona === "dom" ? m.dom : m.gosc, obr = strona === "dom" ? m.gosc : m.dom, i = strona === "dom" ? 0 : 1;
  const kier = strona === "dom" ? 1 : -1; // kierunek ataku na osi x
  const X = (v: number) => (strona === "dom" ? v : 100 - v); // v = postęp akcji (0 = własna bramka, 100 = bramka rywala)
  const lam = strona === "dom" ? lD : lG, lamP = lam / (strona === "dom" ? pD : 1 - pD);
  const sek: PunktAkcji[] = [];
  const nosnik = (linia: Pozycja[]) => wybierzZ(s, atak.naBoisku, (z) => (linia.includes(z.poz) ? 3 : 0.3) * Math.max(10, at(z, "pod")))?.id;
  // rozegranie: obrona → pomoc
  const yStart = los(15, 85);
  sek.push({ x: X(los(18, 35)), y: yStart, nosnik: nosnik(["OBR", "BR"]) });
  sek.push({ x: X(los(38, 58)), y: Math.max(5, Math.min(95, yStart + los(-25, 25))), nosnik: nosnik(["POM"]) });
  const okr = okrz(m);
  const mojeAtak = (strona === "dom") === (m.moja === "dom");
  // ——— rzut karny (faul w polu karnym) ———
  if (Math.random() < lamP * 0.09 / 0.78) {
    const faulujacy = wybierzZ(s, obr.naBoisku, (z) => (z.poz === "OBR" ? 3 : 1));
    const wyk = wykonawca(s, atak, "karne"), gk = bramkarz(s, obr);
    sek.push({ x: X(86), y: los(40, 60), nosnik: nosnik(["NAP"]), zdarzenie: "faul" });
    m.komentarz.unshift({ min: minTxt, typ: "karny", strona, tekst: `❗ Faul w polu karnym — ${faulujacy ? nz(s, faulujacy.id) : "obrońca"} przewraca rywala. RZUT KARNY dla ${s.kluby[atak.klubId].nazwa}!` });
    if (faulujacy && szansa(0.35)) dajKartke(s, m, obr, faulujacy.id, minZap, minTxt, szansa(0.12) ? "czerwona" : "zolta", "faul w polu karnym");
    if (wyk) {
      const pGol = Math.max(0.6, Math.min(0.9, 0.76 + (at(wyk, "str") - at(gk, "br")) / 300));
      m.staty.strz[i]++; m.staty.xg[i] += 0.76;
      const r = Math.random();
      if (r < pGol) { m.staty.celne[i]++; zapiszGol(s, m, atak, strona, wyk.id, undefined, "karny", minZap, minTxt, `⚽ GOL! ${nz(s, wyk.id)} pewnie z jedenastu metrów`); sek.push({ x: X(100), y: los(44, 56), h: los(0, 1.5), nosnik: wyk.id, zdarzenie: "gol" }); gol = true; }
      else if (r < pGol + 0.16) { m.staty.celne[i]++; m.staty.obrony[1 - i]++; ocena(m, gk?.id, 1); ocena(m, wyk.id, -0.6); sek.push({ x: X(99), y: los(40, 60), nosnik: gk?.id, zdarzenie: "obrona" }); m.komentarz.unshift({ min: minTxt, typ: "karny", strona, tekst: `🧤 OBRONIŁ! ${gk ? nz(s, gk.id) : "Bramkarz"} wyczuł intencje ${nz(s, wyk.id)}!` }); m.wazne = { typ: "karny", strona, tekst: "Karny obroniony!" }; }
      else { ocena(m, wyk.id, -0.7); sek.push({ x: X(100), y: szansa(0.5) ? 38 : 62, h: 3, zdarzenie: "slupek" }); m.komentarz.unshift({ min: minTxt, typ: "karny", strona, tekst: `😱 ${nz(s, wyk.id)} PUDŁUJE z karnego — piłka nad poprzeczką / obok słupka!` }); m.wazne = { typ: "karny", strona, tekst: "Karny zmarnowany!" }; }
      m.momentum += kier * 0.2;
    }
  } else if (Math.random() < lamP * 0.05 / 0.07) {
    // ——— rzut wolny z dogodnej pozycji ———
    const wyk = wykonawca(s, atak, "wolne"), gk = bramkarz(s, obr);
    sek.push({ x: X(75), y: los(30, 70), nosnik: wyk?.id, zdarzenie: "wolny" });
    m.staty.faule[1 - i]++;
    if (wyk) {
      m.staty.strz[i]++; m.staty.xg[i] += 0.07;
      const pGol = Math.max(0.03, Math.min(0.13, 0.07 * (1 + (at(wyk, "str") - at(gk, "br")) / 120)));
      if (Math.random() < pGol) { m.staty.celne[i]++; zapiszGol(s, m, atak, strona, wyk.id, undefined, "gol", minZap, minTxt, `⚽ GOL z rzutu wolnego! ${nz(s, wyk.id)} przymierzył nad murem w okienko`); sek.push({ x: X(100), y: szansa(0.5) ? 41 : 59, h: 2.2, nosnik: wyk.id, zdarzenie: "gol" }); gol = true; }
      else if (szansa(0.4)) { m.staty.celne[i]++; m.staty.obrony[1 - i]++; ocena(m, gk?.id, 0.3); sek.push({ x: X(99), y: los(40, 60), h: 1.5, nosnik: gk?.id, zdarzenie: "obrona" }); m.komentarz.unshift({ min: minTxt, typ: "stały", strona, tekst: `Rzut wolny ${nz(s, wyk.id)} — ${gk ? nz(s, gk.id) : "bramkarz"} wybija na róg!` }); m.staty.rozne[i]++; }
      else { sek.push({ x: X(100), y: los(20, 80), h: 3, zdarzenie: "strzal" }); if (szansa(0.5)) m.komentarz.unshift({ min: minTxt, typ: "stały", strona, tekst: `Rzut wolny: ${nz(s, wyk.id)} uderza w mur.` }); }
    }
  } else if (Math.random() < lamP * 0.86 / SR_XG) {
    // ——— sytuacja z gry ———
    const r = Math.random(); let acc = 0, syt = SYTUACJE[0];
    for (const t of SYTUACJE) { acc += t[1] * (okr === "skrzydla" && mojeAtak && t[0] === "glowka" ? 1.6 : 1); if (r < acc) { syt = t; break; } }
    const [rodz, , xgB] = syt;
    const st = wybierzZ(s, atak.naBoisku, (z) => ({ NAP: 5, POM: 2.2, OBR: rodz === "glowka" ? 2 : 0.6, BR: 0.02 })[z.poz] * (z.cechy?.includes("snajper") ? 1.6 : 1) * Math.max(5, rodz === "glowka" ? at(z, "fiz") : at(z, "str")));
    const gk = bramkarz(s, obr);
    const kandA = atak.naBoisku.filter((x) => x !== st?.id);
    const asystent = wybierzZ(s, kandA, (z) => ({ NAP: 3, POM: 4, OBR: rodz === "glowka" ? 2.5 : 1.2, BR: 0.05 })[z.poz] * Math.max(5, at(z, "pod")));
    // tor: podanie/dośrodkowanie → strzał
    if (rodz === "glowka") sek.push({ x: X(los(82, 92)), y: szansa(0.5) ? los(4, 14) : los(86, 96), nosnik: asystent?.id });
    else if (rodz === "samnasam") sek.push({ x: X(los(68, 76)), y: los(30, 70), nosnik: asystent?.id });
    else sek.push({ x: X(los(66, 78)), y: los(20, 80), nosnik: asystent?.id });
    const sx = rodz === "dalekie" ? los(68, 78) : rodz === "samnasam" ? los(86, 92) : rodz === "glowka" ? los(89, 95) : los(80, 90);
    const sy = rodz === "dalekie" ? los(25, 75) : los(36, 64);
    sek.push({ x: X(sx), y: sy, h: rodz === "glowka" ? 2.4 : 0, nosnik: st?.id, zdarzenie: "strzal" });
    m.staty.strz[i]++; m.staty.xg[i] += xgB;
    dotknij(m, asystent?.id); dotknij(m, st?.id);
    const fGK = Math.max(0.72, Math.min(1.3, 1 + ((st ? at(st, rodz === "glowka" ? "fiz" : "str") : 40) - at(gk, "br")) / 120));
    const pGol = Math.min(0.75, xgB * fGK);
    const nazwaSyt = { dalekie: "uderzenie z dystansu", pole: "strzał z pola karnego", samnasam: "sam na sam", glowka: "główka po dośrodkowaniu" }[rodz];
    if (st && Math.random() < pGol) {
      m.staty.celne[i]++;
      // gol nieuznany: spalony / faul (VAR w Ekstraklasie i I lidze, niżej decyzja asystenta)
      const nieuznany = szansa(m.var ? 0.07 : 0.035);
      if (nieuznany) {
        m.staty.spalone[i]++;
        sek.push({ x: X(100), y: los(42, 58), h: los(0, 2), nosnik: st.id, zdarzenie: "spalony" });
        m.komentarz.unshift({ min: minTxt, typ: "var", strona, tekst: m.var ? `📺 VAR sprawdza… GOL ANULOWANY! ${nz(s, st.id)} był na spalonym o kilka centymetrów.` : `🚩 Piłka w siatce, ale chorągiewka asystenta w górze — spalony, gol ${nz(s, st.id)} nieuznany.` });
        m.wazne = { typ: "var", strona, tekst: "Gol nieuznany!" };
      } else {
        const samo = szansa(0.022);
        const sid = samo ? (wybierzZ(s, obr.naBoisku, (z) => (z.poz === "OBR" ? 3 : 0.2))?.id ?? st.id) : st.id;
        zapiszGol(s, m, atak, strona, sid, samo ? undefined : szansa(0.75) ? asystent?.id : undefined, samo ? "samoboj" : "gol", minZap, minTxt,
          samo ? `⚽ GOL SAMOBÓJCZY! ${nz(s, sid)} niefortunnie pakuje piłkę do własnej siatki` : `⚽ GOOOL! ${nz(s, st.id)} — ${nazwaSyt}${asystent ? ` (asysta: ${nz(s, asystent.id)})` : ""}`);
        if (m.var && szansa(0.25)) m.komentarz.unshift({ min: minTxt, typ: "var", strona, tekst: "📺 Krótka weryfikacja VAR — bramka uznana." });
        sek.push({ x: X(100), y: los(42, 58), h: rodz === "glowka" ? 1.5 : los(0, 1.8), nosnik: st.id, zdarzenie: "gol" });
        gol = true;
      }
    } else if (st) {
      const celny = Math.random() < 0.3 + xgB * 0.8;
      const slupek = !celny && szansa(0.07);
      if (celny) { m.staty.celne[i]++; m.staty.obrony[1 - i]++; ocena(m, gk?.id, 0.18 + xgB); ocena(m, st.id, 0.05); sek.push({ x: X(99), y: los(42, 58), h: los(0, 1.6), nosnik: gk?.id, zdarzenie: "obrona" }); if (szansa(0.45)) m.staty.rozne[i]++; }
      else if (slupek) { m.staty.slupki[i]++; sek.push({ x: X(100), y: szansa(0.5) ? 44.3 : 55.7, h: los(0, 2.3), zdarzenie: "slupek" }); }
      else sek.push({ x: X(100), y: szansa(0.5) ? los(25, 40) : los(60, 75), h: los(0, 4), zdarzenie: "strzal" });
      m.staty.strzaly.push({ x: X(sx), y: sy, strona, gol: false, xg: xgB });
      if (xgB >= 0.3 || slupek || szansa(0.5)) m.komentarz.unshift({ min: minTxt, typ: "akcja", strona, tekst: slupek ? `🥅 SŁUPEK! ${nz(s, st.id)} obija obramowanie bramki!` : celny
        ? wybierz([`${nz(s, st.id)} — ${nazwaSyt}… ${gk ? nz(s, gk.id) : "bramkarz"} broni!`, `Groźnie! ${nazwaSyt} ${nz(s, st.id)}, piłkę paruje ${gk ? nz(s, gk.id) : "bramkarz"}.`, `${gk ? nz(s, gk.id) : "Bramkarz"} na posterunku po strzale ${nz(s, st.id)}.`])
        : wybierz([`${nz(s, st.id)} — ${nazwaSyt}, ale niecelnie.`, `Uderzenie ${nz(s, st.id)} nad poprzeczką.`, `${nz(s, st.id)} strzela obok bramki — było blisko!`]) });
      if (xgB >= 0.3 && !celny) ocena(m, st.id, -0.2);
      m.momentum += kier * 0.12;
    }
  } else {
    // ——— akcja bez strzału: strata, aut, rożny, spalony ———
    const r = Math.random();
    if (r < 0.1) { m.staty.rozne[i]++; sek.push({ x: X(100), y: szansa(0.5) ? 0 : 100, nosnik: wykonawca(s, atak, "rozne")?.id, zdarzenie: "rozny" }); sek.push({ x: X(92), y: los(40, 60), h: 2.5 }); sek.push({ x: X(78), y: los(30, 70) }); }
    else if (r < 0.16) { m.staty.spalone[i]++; sek.push({ x: X(los(80, 88)), y: los(30, 70), nosnik: nosnik(["NAP"]), zdarzenie: "spalony" }); }
    else if (r < 0.3) sek.push({ x: X(los(40, 75)), y: szansa(0.5) ? 0 : 100, zdarzenie: "aut" });
    else sek.push({ x: X(los(55, 75)), y: los(15, 85), nosnik: nosnik(["POM", "NAP"]) });
    if (szansa(0.04)) m.komentarz.unshift({ min: minTxt, typ: "kibice", tekst: wybierz([
      `📣 Kibice ${s.kluby[m.dom.klubId].nazwa} niosą drużynę dopingiem.`, "🎵 Z trybun słychać przyśpiewki.", `Spokojniejszy fragment — ${s.kluby[atak.klubId].nazwa} rozgrywa piłkę w środku pola.`,
      "Gwizdy trybun po decyzji sędziego.", m.poziom >= 7 ? "Piłka wylądowała za płotem — chwila przerwy, zanim ktoś ją odrzuci." : "Kamera pokazuje ławkę rezerwowych — trener daje wskazówki."]) });
  }
  for (const p of sek) dotknij(m, p.nosnik);
  m.sekwencja = sek;
  const ost = sek[sek.length - 1];
  m.pilka = { x: Math.max(0, Math.min(100, ost.x)), y: Math.max(0, Math.min(100, ost.y)), strona };
  // ——— faule i kartki ———
  for (const [z, j] of [[m.dom, 0], [m.gosc, 1]] as [ZespolLive, number][]) {
    const moje = z.klubId === s.mojKlub;
    const mn = moje && okr === "spokojnie" ? 0.5 : moje && okr === "pressing" ? 1.3 : 1;
    if (szansa(0.13 * mn)) m.staty.faule[j]++;
    if (!z.naBoisku.length) continue;
    const czasMn = !moje && okr === "czas" ? 1 : moje && okr === "czas" ? 1.4 : 1;
    if (szansa(0.0175 * mn * czasMn)) {
      const id = wybierzZ(s, z.naBoisku, (p) => (p.cechy?.includes("nerwowy") ? 1.55 : 1) * (p.cechy?.includes("profesjonalista") ? 0.8 : 1) * (p.poz === "OBR" || p.poz === "POM" ? 1.3 : p.poz === "BR" ? 0.15 : 1))!.id;
      dajKartke(s, m, z, id, minZap, minTxt, "zolta", moje && okr === "czas" && szansa(0.4) ? "gra na czas" : wybierz(["faul taktyczny", "ostre wejście", "dyskusje z sędzią", "faul od tyłu"]));
    } else if (szansa(0.00095 * mn)) {
      dajKartke(s, m, z, wybierz(z.naBoisku), minZap, minTxt, "czerwona", wybierz(["brutalny faul", "przerwanie realnej szansy na bramkę", "uderzenie rywala"]));
    }
    // urazy
    if (szansa(0.001) && z.naBoisku.length) {
      const id = wybierzZ(s, z.naBoisku, (p) => (p.podatnosc ?? 1) * (p.cechy?.includes("kontuzjogenny") ? 1.9 : 1))!.id, ciezka = szansa(0.15);
      const tyg = ciezka ? losInt(6, 16) : losInt(1, 4);
      const opis = ciezka ? wybierz(["zerwane więzadła", "złamanie", "naderwany mięsień dwugłowy"]) : wybierz(["stłuczenie", "naciągnięcie mięśnia", "uraz kostki", "skurcz łydki"]);
      m.urazy.push({ min: minZap, klubId: z.klubId, id, tyg, opis });
      m.komentarz.unshift({ min: minTxt, typ: "uraz", strona: j ? "gosc" : "dom", tekst: `🚑 ${nz(s, id)} leży na murawie, wbiega masażysta — ${opis}.${moje ? " Trzeba zrobić zmianę!" : ""}` });
      if (!moje) zmienAI(s, m, z, id, "kontuzja");
      else { const zz = s.zawodnicy[id]; if (zz) zz.kondycja = Math.min(zz.kondycja, 35); m.wazne = { typ: "uraz", strona: j ? "gosc" : "dom", id, tekst: `${nz(s, id)} kontuzjowany — zrób zmianę` }; }
    }
  }
  // zmęczenie (pressing i tempo kosztują więcej sił)
  for (const z of [m.dom, m.gosc]) {
    const moje = z.klubId === s.mojKlub;
    const intens = moje ? 1 + (s.taktyka.pressing === "wysoki" ? 0.18 : 0) + (s.taktyka.tempo === "szybkie" ? 0.12 : 0) - (s.taktyka.tempo === "wolne" ? 0.08 : 0) + (okr === "pressing" ? 0.25 : okr === "naprzod" ? 0.1 : 0) : 1;
    for (const id of z.naBoisku) { const p = s.zawodnicy[id]; if (p) p.kondycja = Math.max(25, p.kondycja - los(12, 22) / 90 * intens * (1.1 - at(p, "fiz") / 500)); }
  }
  // AI: nastawienie i zmiany
  const ai = m.moja === "dom" ? m.gosc : m.dom;
  const roznicaAI = m.moja === "dom" ? m.gg - m.gd : m.gd - m.gg;
  if (m.polowa === 2) {
    if (m.min >= 65 && roznicaAI < 0 && ai.nastawienie !== "ofensywne") { ai.nastawienie = "ofensywne"; m.komentarz.unshift({ min: minTxt, typ: "taktyka", tekst: `📋 Trener ${s.kluby[ai.klubId].nazwa} każe atakować — rywal otwiera się z tyłu.` }); }
    if (m.min >= 78 && roznicaAI > 0 && ai.nastawienie !== "obronne") { ai.nastawienie = "obronne"; m.komentarz.unshift({ min: minTxt, typ: "taktyka", tekst: `📋 ${s.kluby[ai.klubId].nazwa} cofa się do obrony i gra na czas.` }); }
    if ([58, 66, 73, 80, 86].includes(m.min)) {
      const zm = ai.naBoisku.map((x) => s.zawodnicy[x]).filter((z) => z && z.poz !== "BR").sort((a, b) => (a.kondycja + (m.oceny[a.id] ?? 6) * 4) - (b.kondycja + (m.oceny[b.id] ?? 6) * 4))[0];
      if (zm && (zm.kondycja < 72 || (m.oceny[zm.id] ?? 6) < 5.8)) zmienAI(s, m, ai, zm.id, "taktyczna");
    }
  }
  if (m.okrzyk && m.okrzyk.do < m.min) m.okrzyk = undefined;
  // koniec połowy / meczu
  if (m.polowa === 1 && m.min >= kon1) {
    m.polowa = 2; m.min = 45;
    m.komentarz.unshift({ min: "45'", typ: "info", tekst: `⏸ Koniec pierwszej połowy. ${s.kluby[m.dom.klubId].nazwa} ${m.gd}:${m.gg} ${s.kluby[m.gosc.klubId].nazwa}. Drużyny schodzą do szatni.` });
    for (const z of [m.dom, m.gosc]) for (const id of z.naBoisku) { const p = s.zawodnicy[id]; if (p) p.kondycja = Math.min(100, p.kondycja + 3); }
    m.sekwencja = [{ x: 50, y: 50 }]; m.pilka = { x: 50, y: 50, strona: "gosc" };
    m.wazne = { typ: "przerwa", tekst: "Przerwa — mowa w szatni" };
  } else if (m.polowa === 2 && m.min >= kon2 && m.puchar && m.gd === m.gg) {
    // puchar: remis po 90 minutach — dogrywka albo od razu rzuty karne (regulamin związku)
    m.min = 90;
    if (m.puchar.dogrywka) {
      m.polowa = 3;
      m.zasady = { ...m.zasady, limit: m.zasady.limit + 1, okna: m.zasady.okna !== null ? m.zasady.okna + 1 : null };
      m.komentarz.unshift({ min: "90'", typ: "info", tekst: `⏸ Remis ${m.gd}:${m.gg} po 90 minutach — DOGRYWKA (2×15 min). Regulamin pozwala na jedną dodatkową zmianę.` });
      for (const z of [m.dom, m.gosc]) for (const id of z.naBoisku) { const p = s.zawodnicy[id]; if (p) p.kondycja = Math.min(100, p.kondycja + 2); }
      m.sekwencja = [{ x: 50, y: 50 }]; m.pilka = { x: 50, y: 50, strona: "dom" };
      m.wazne = { typ: "przerwa", tekst: "Dogrywka!" };
    } else startKarnych(s, m, "Regulamin rozgrywek: przy remisie od razu rzuty karne.");
  } else if (m.polowa === 3 && m.min >= 105) {
    m.polowa = 4; m.min = 105;
    m.komentarz.unshift({ min: "105'", typ: "info", tekst: `🔄 Zmiana stron w dogrywce. ${m.gd}:${m.gg}.` });
    m.sekwencja = [{ x: 50, y: 50 }]; m.pilka = { x: 50, y: 50, strona: "gosc" };
  } else if (m.polowa === 4 && m.min >= 120 && m.gd === m.gg) {
    m.min = 120; startKarnych(s, m, "Dogrywka nie przyniosła rozstrzygnięcia.");
  } else if ((m.polowa === 2 && m.min >= kon2) || (m.polowa === 4 && m.min >= 120)) {
    if (m.polowa === 4) m.min = 120;
    m.koniec = true;
    const wyn = m.gd > m.gg ? s.kluby[m.dom.klubId].nazwa : m.gg > m.gd ? s.kluby[m.gosc.klubId].nazwa : null;
    m.komentarz.unshift({ min: "FT", typ: "info", tekst: `🏁 Koniec meczu${m.polowa === 4 ? " po dogrywce" : ""}! ${s.kluby[m.dom.klubId].nazwa} ${m.gd}:${m.gg} ${s.kluby[m.gosc.klubId].nazwa}. ${m.puchar ? `Awans: ${wyn}!` : wyn ? `Trzy punkty dla ${wyn}.` : "Podział punktów."}` });
    ocenyKoncowe(s, m);
    m.wazne = { typ: "koniec", tekst: "Koniec meczu" };
  }
  return gol;
}

function ocenyKoncowe(s: StanGry, m: MeczLive) {
    for (const z of [m.dom, m.gosc]) {
      const str = z === m.dom ? m.gd : m.gg, stra = z === m.dom ? m.gg : m.gd;
      for (const id of z.zagrali) {
        const p = s.zawodnicy[id]; if (!p) continue;
        ocena(m, id, (str > stra ? 0.5 : str < stra ? -0.4 : 0) + ((p.poz === "BR" || p.poz === "OBR") ? (stra === 0 ? (p.poz === "BR" ? 1.2 : 0.7) : -Math.min(1.5, stra * (p.poz === "BR" ? 0.35 : 0.25))) : 0) + Math.min(0.6, (m.dotkniecia[id] ?? 0) * 0.02) + los(-0.3, 0.3));
      }
    }
}

/** Minuta po polsku, z doliczonym czasem (45+2', 90+4') i dogrywką (105', 120'). */
export function tekstMinuty(m: MeczLive): string {
  if (m.karne) return "karne";
  if (m.polowa === 1) return m.min > 45 ? `45+${m.min - 45}'` : `${m.min}'`;
  if (m.polowa === 2) return m.min > 90 ? `90+${m.min - 90}'` : `${m.min}'`;
  return `${m.min}'`;
}

/** Wynik serii karnych w kolejności strzałów. */
export const wynikKarnych = (m: MeczLive) => m.karne ? [m.karne.d.filter(Boolean).length, m.karne.g.filter(Boolean).length] as [number, number] : null;

function startKarnych(s: StanGry, m: MeczLive, powod: string) {
  const kolejka = (z: ZespolLive) => z.naBoisku.map((id) => s.zawodnicy[id]).filter(Boolean)
    .sort((a, b) => (b.poz === "BR" ? -50 : 0) + at(b, "str") + (b.cechy?.includes("egzekutor") ? 8 : 0) - ((a.poz === "BR" ? -50 : 0) + at(a, "str") + (a.cechy?.includes("egzekutor") ? 8 : 0))).map((z) => z.id);
  const wykD = kolejka(m.dom), wykG = kolejka(m.gosc);
  // pierwszy w kolejce własny wykonawca karnych (ustawiony przez trenera)
  for (const [z, l] of [[m.dom, wykD], [m.gosc, wykG]] as const) { const w = z.klubId === s.mojKlub ? s.wykonawcy?.karne : undefined; if (w && l.includes(w)) { l.splice(l.indexOf(w), 1); l.unshift(w); } }
  m.karne = { d: [], g: [], wykD, wykG };
  m.komentarz.unshift({ min: "120'", typ: "karny", tekst: `🎯 ${powod} RZUTY KARNE! Kapitanowie losują bramkę i kolejność. Po 5 strzałów, potem do pierwszej pomyłki.` });
  m.sekwencja = [{ x: 89, y: 50 }]; m.pilka = { x: 89, y: 50, strona: "dom" };
  m.wazne = { typ: "karny", tekst: "Seria rzutów karnych!" };
}

/** Jeden strzał serii karnych (na zmianę: gospodarze, goście). */
function krokKarnych(s: StanGry, m: MeczLive) {
  const k = m.karne!; if (k.zwyciezca) return;
  const kolejD = k.d.length <= k.g.length;
  const strona: "dom" | "gosc" = kolejD ? "dom" : "gosc";
  const lista = kolejD ? k.wykD : k.wykG, nr = (kolejD ? k.d : k.g).length;
  const wid = lista[nr % Math.max(1, lista.length)];
  const wyk = s.zawodnicy[wid], gk = bramkarz(s, kolejD ? m.gosc : m.dom);
  const presja = nr >= 4 ? 0.05 : 0; // piąta seria i dalej — nogi miękną
  const p = Math.max(0.55, Math.min(0.9, 0.76 + (at(wyk, "str") - at(gk, "br")) / 300 + (wyk?.cechy?.includes("egzekutor") ? 0.05 : 0) - presja));
  const r = Math.random(), gol = r < p, obrona = !gol && r < p + (1 - p) * 0.6;
  (kolejD ? k.d : k.g).push(gol);
  const nazwa = s.kluby[(kolejD ? m.dom : m.gosc).klubId].nazwa;
  const [a, b] = wynikKarnych(m)!;
  const xB = 100; // karne na jedną bramkę
  m.sekwencja = [{ x: 89, y: 50, nosnik: wid }, gol ? { x: xB + 1.8, y: szansa(0.5) ? 45 : 55, h: los(0.2, 1.8), nosnik: wid, zdarzenie: "gol" } : obrona ? { x: 99, y: szansa(0.5) ? 44 : 56, h: 0.8, nosnik: gk?.id, zdarzenie: "obrona" } : { x: 100, y: szansa(0.5) ? 38 : 62, h: 3, zdarzenie: "slupek" }];
  m.pilka = { x: 89, y: 50, strona };
  ocena(m, wid, gol ? 0.2 : -0.6); if (obrona) ocena(m, gk?.id, 0.5);
  m.komentarz.unshift({ min: `K${nr + 1}`, typ: "karny", strona, tekst: `${gol ? "✅" : "❌"} ${nazwa}: ${nz(s, wid)} — ${gol ? "GOL!" : obrona ? `obronił ${gk ? nz(s, gk.id) : "bramkarz"}!` : "pudło!"}  (karne ${a}:${b})` });
  // rozstrzygnięcie: po 5 seriach lub wcześniej, gdy jedna strona już nie dogoni; potem seria do skutku
  const nd = k.d.length, ng = k.g.length;
  let zw: "dom" | "gosc" | undefined;
  if (nd <= 5 && ng <= 5) {
    if (a + (5 - nd) < b) zw = "gosc"; else if (b + (5 - ng) < a) zw = "dom";
    else if (nd === 5 && ng === 5 && a !== b) zw = a > b ? "dom" : "gosc";
  } else if (nd === ng && a !== b) zw = a > b ? "dom" : "gosc";
  if (zw) {
    k.zwyciezca = zw; m.koniec = true;
    const kz = s.kluby[(zw === "dom" ? m.dom : m.gosc).klubId].nazwa;
    m.komentarz.unshift({ min: "FT", typ: "info", tekst: `🏁 Koniec! ${s.kluby[m.dom.klubId].nazwa} ${m.gd}:${m.gg} ${s.kluby[m.gosc.klubId].nazwa}, karne ${a}:${b}. Awansuje ${kz}!` });
    ocenyKoncowe(s, m);
    for (const z of [m.dom, m.gosc]) { const my = (z === m.dom ? "dom" : "gosc") === zw; for (const id of z.naBoisku) ocena(m, id, my ? 0.2 : -0.2); }
    m.wazne = { typ: "koniec", strona: zw, tekst: `Karne ${a}:${b} — awans ${kz}` };
  }
}
export const przerwa = (m: MeczLive) => m.polowa === 2 && m.min === 45;

function zapiszGol(s: StanGry, m: MeczLive, z: ZespolLive, strona: "dom" | "gosc", sid: string, asysta: string | undefined, typ: ScenGol["typ"], min: number, minTxt: string, tekst: string) {
  m.gole.push({ min, klubId: z.klubId, strzelec: sid, asysta, typ });
  if (strona === "dom") m.gd++; else m.gg++;
  if (typ !== "samoboj") { ocena(m, sid, 1.1); ocena(m, asysta, 0.7); } else ocena(m, sid, -1);
  const obr = strona === "dom" ? m.gosc : m.dom;
  ocena(m, bramkarz(s, obr)?.id, -0.35);
  for (const id of obr.naBoisku) if (s.zawodnicy[id]?.poz === "OBR") ocena(m, id, -0.12);
  m.staty.strzaly.push({ x: m.pilka.x, y: m.pilka.y, strona, gol: true, xg: typ === "karny" ? 0.76 : 0.2 });
  m.momentum += (strona === "dom" ? 1 : -1) * 0.4;
  const mojGol = (strona === "dom") === (m.moja === "dom");
  m.komentarz.unshift({ min: minTxt, typ: "gol", strona, tekst: `${tekst}! ${m.gd}:${m.gg}${mojGol ? " — trybuny szaleją!" : ""}` });
  m.wazne = { typ: "gol", strona, id: sid, tekst: `GOL! ${nz(s, sid)}` };
}
function dajKartke(s: StanGry, m: MeczLive, z: ZespolLive, id: string, min: number, minTxt: string, typ: "zolta" | "czerwona", powod: string) {
  const strona = z === m.dom ? "dom" : "gosc";
  if (typ === "zolta" && !z.zolte.includes(id)) {
    z.zolte.push(id); m.kartki.push({ min, klubId: z.klubId, id, typ: "zolta", opis: powod }); ocena(m, id, -0.3);
    m.komentarz.unshift({ min: minTxt, typ: "kartka", strona, tekst: `🟨 Żółta kartka: ${nz(s, id)} — ${powod}.` });
    return;
  }
  const druga = typ === "zolta";
  z.zolte = z.zolte.filter((x) => x !== id); z.czerwoni.push(id); z.naBoisku = z.naBoisku.filter((x) => x !== id);
  m.kartki.push({ min, klubId: z.klubId, id, typ: "czerwona", opis: druga ? "druga żółta" : powod }); ocena(m, id, -2.4);
  m.komentarz.unshift({ min: minTxt, typ: "kartka", strona, tekst: druga ? `🟨🟥 Druga żółta i czerwona dla ${nz(s, id)}! ${s.kluby[z.klubId].nazwa} gra w dziesiątkę.` : `🟥 Czerwona kartka! ${nz(s, id)} wyrzucony z boiska (${powod}).` });
  m.momentum += (strona === "dom" ? -1 : 1) * 0.25;
  m.wazne = { typ: "czerwona", strona, id, tekst: `Czerwona: ${nz(s, id)}` };
}

function zmienAI(s: StanGry, m: MeczLive, z: ZespolLive, schodzi: string, powod: string) {
  if (z.zmiany >= m.zasady.limit || (m.zasady.okna !== null && z.oknaZmian.length >= m.zasady.okna && !z.oknaZmian.includes(m.min))) return;
  const poz = s.zawodnicy[schodzi]?.poz;
  const kand = z.lawka.map((x) => s.zawodnicy[x]).filter((p) => p && (poz === "BR" ? p.poz === "BR" : p.poz !== "BR") && !m.zmianyLog.some((l) => l.schodzi === p.id && !m.zasady.powrotne));
  const wch = kand.find((p) => p.poz === poz) ?? kand[0];
  if (!wch) return;
  wykonajZmiane(s, m, z, schodzi, wch.id, powod);
}
function wykonajZmiane(s: StanGry, m: MeczLive, z: ZespolLive, schodzi: string, wchodzi: string, powod: string) {
  const i = z.naBoisku.indexOf(schodzi); if (i < 0) return;
  z.naBoisku[i] = wchodzi; z.lawka = z.lawka.filter((x) => x !== wchodzi);
  if (m.zasady.powrotne) z.lawka.push(schodzi);
  if (!z.zagrali.includes(wchodzi)) z.zagrali.push(wchodzi);
  z.zmiany++;
  if (!przerwa(m) && !z.oknaZmian.includes(m.min)) z.oknaZmian.push(m.min);
  m.zmianyLog.push({ min: m.polowa === 1 ? Math.min(45, m.min) : m.min, klubId: z.klubId, wchodzi, schodzi, powod });
  m.komentarz.unshift({ min: `${m.min}'`, typ: "zmiana", strona: z === m.dom ? "dom" : "gosc", tekst: `🔄 Zmiana w ${s.kluby[z.klubId].nazwa}: wchodzi ${nz(s, wchodzi)} (nr ${s.zawodnicy[wchodzi]?.numer ?? "?"}), schodzi ${nz(s, schodzi)}${powod === "kontuzja" ? " (uraz)" : ""}.` });
}
/** Twoja zmiana. Zwraca powód odmowy albo null. */
export function zmianaGracza(s: StanGry, m: MeczLive, schodzi: string, wchodzi: string): string | null {
  const z = m.moja === "dom" ? m.dom : m.gosc;
  if (m.koniec) return "Mecz się skończył.";
  if (!z.naBoisku.includes(schodzi)) return "Tego zawodnika nie ma na boisku.";
  if (!z.lawka.includes(wchodzi)) return "Tego zawodnika nie ma na ławce.";
  if (z.zmiany >= m.zasady.limit) return `Wykorzystano limit zmian (${m.zasady.limit}).`;
  if (m.zasady.okna !== null && !przerwa(m) && z.oknaZmian.length >= m.zasady.okna && !z.oknaZmian.includes(m.min)) return `Wykorzystano ${m.zasady.okna} przerwy w grze na zmiany — przepisy nie pozwalają na kolejną (poza przerwą między połowami).`;
  if (!m.zasady.powrotne && m.zmianyLog.some((x) => x.schodzi === wchodzi && x.klubId === z.klubId)) return "Zawodnik zmieniony nie może wrócić na boisko (w tej klasie nie ma zmian powrotnych).";
  wykonajZmiane(s, m, z, schodzi, wchodzi, "taktyczna");
  return null;
}
export const NAZWA_NAST: Record<Nastawienie, string> = { autobus: "autobus", obronne: "obronne", zrownowazone: "zrównoważone", ofensywne: "ofensywne" };
export function zmienTaktyke(s: StanGry, m: MeczLive, o: { nastawienie?: Nastawienie; formacja?: string }) {
  const z = m.moja === "dom" ? m.dom : m.gosc;
  if (o.nastawienie && o.nastawienie !== z.nastawienie) { z.nastawienie = o.nastawienie; s.taktyka.nastawienie = o.nastawienie; m.komentarz.unshift({ min: `${m.min}'`, typ: "taktyka", tekst: `📋 Zmiana nastawienia: ${NAZWA_NAST[o.nastawienie]}.` }); }
  if (o.formacja && o.formacja !== z.formacja && FORMACJE[o.formacja]) { z.formacja = o.formacja; m.komentarz.unshift({ min: `${m.min}'`, typ: "taktyka", tekst: `📋 Nowe ustawienie: ${o.formacja}.` }); }
}
export const OKRZYKI: Record<Okrzyk, { nazwa: string; opis: string }> = {
  naprzod: { nazwa: "📣 Naprzód!", opis: "więcej ataku, ale też więcej luk z tyłu i zmęczenia" },
  spokojnie: { nazwa: "🧘 Spokojnie!", opis: "mniej fauli i kartek, nieco wolniejsza gra" },
  skrzydla: { nazwa: "↔️ Grajcie skrzydłami!", opis: "więcej dośrodkowań i główek" },
  pressing: { nazwa: "🔥 Pressing!", opis: "odbiór wysoko — szybciej tracicie siły, więcej fauli" },
  czas: { nazwa: "⏳ Gramy na czas", opis: "mniej akcji obu stron; ryzyko żółtej za grę na czas" },
};
/** Okrzyk z ławki — działa ok. 10 minut, potem drużyna wraca do planu (5 min przerwy między okrzykami). */
export function okrzyk(s: StanGry, m: MeczLive, t: Okrzyk): string | null {
  if (m.okrzyk && m.okrzyk.do >= m.min) return "Zawodnicy jeszcze realizują poprzednie polecenie.";
  m.okrzyk = { typ: t, do: m.min + 10 };
  m.komentarz.unshift({ min: `${m.min}'`, typ: "taktyka", tekst: `🗣 Trener ${s.trener ?? ""} krzyczy z linii: „${OKRZYKI[t].nazwa.replace(/^\S+\s/, "")}"` });
  return null;
}
/** Mowa w szatni w przerwie — efekt zależy od wyniku (realnie: ochrzan działa, gdy przegrywasz; pochwała, gdy prowadzisz). */
export function mowaWPrzerwie(s: StanGry, m: MeczLive, t: Mowa): string {
  if (m.mowa) return "Mowa w szatni już była.";
  m.mowa = t;
  const r = m.moja === "dom" ? m.gd - m.gg : m.gg - m.gd;
  const efekt: Record<Mowa, number> = r > 0 ? { pochwala: 1.04, spokoj: 1.02, wiara: 1.0, ochrzan: 0.96 }
    : r < 0 ? { pochwala: 0.97, spokoj: 1.0, wiara: 1.04, ochrzan: szansa(0.65) ? 1.07 : 0.95 }
    : { pochwala: 1.0, spokoj: 1.02, wiara: 1.04, ochrzan: szansa(0.5) ? 1.04 : 0.97 };
  m.motMoj = efekt[t];
  const reakcja = m.motMoj >= 1.04 ? "Zawodnicy wychodzą z szatni nakręceni!" : m.motMoj > 1 ? "Drużyna spokojnie wraca na boisko." : m.motMoj === 1 ? "Słowa trenera nie zrobiły większego wrażenia." : "Część zawodników zwiesiła głowy — mowa nie trafiła.";
  const nazwa = { pochwala: "pochwała", spokoj: "spokojne wskazówki", wiara: "„wierzę w was!”", ochrzan: "ostra reprymenda" }[t];
  m.komentarz.unshift({ min: "45'", typ: "taktyka", tekst: `🗣 W szatni: ${nazwa}. ${reakcja}` });
  for (const id of (m.moja === "dom" ? m.dom : m.gosc).naBoisku) { const z = s.zawodnicy[id]; if (z) z.morale = Math.max(0, Math.min(100, z.morale + (m.motMoj - 1) * 60)); }
  return reakcja;
}
/** Podpowiedzi asystenta w trakcie meczu. */
export function podpowiedzi(s: StanGry, m: MeczLive): string[] {
  const z = m.moja === "dom" ? m.dom : m.gosc;
  const out: string[] = [];
  const r = m.moja === "dom" ? m.gd - m.gg : m.gg - m.gd;
  for (const id of z.naBoisku) {
    const p = s.zawodnicy[id]; if (!p) continue;
    if (m.urazy.some((u) => u.id === id)) out.push(`🚑 ${nz(s, id)} gra z urazem — zmień go.`);
    else if (p.kondycja < 55) out.push(`🔋 ${nz(s, id)} opada z sił (${Math.round(p.kondycja)}%).`);
    if (z.zolte.includes(id) && m.min > 30) out.push(`🟨 ${nz(s, id)} „jedzie na kartce" — uważaj na drugą żółtą.`);
  }
  const pos = m.staty.posN ? m.staty.posD / m.staty.posN : 0.5;
  const naszePos = m.moja === "dom" ? pos : 1 - pos;
  if (naszePos < 0.4 && m.min > 20) out.push("📊 Rywal dominuje w posiadaniu — rozważ zmianę ustawienia albo pressing.");
  if (r < 0 && m.min >= 65 && z.nastawienie !== "ofensywne") out.push("⚔️ Przegrywamy — czas przejść na ofensywne i wpuścić napastnika.");
  if (r > 0 && m.min >= 80 && z.nastawienie !== "obronne" && z.nastawienie !== "autobus") out.push("🛡 Prowadzimy — można zagęścić obronę i grać na czas.");
  if (m.zasady.okna !== null) out.push(`🔄 Zmiany: ${z.zmiany}/${m.zasady.limit}, przerwy na zmiany: ${z.oknaZmian.length}/${m.zasady.okna}.`);
  else out.push(m.zasady.powrotne ? `🔄 Zmiany powrotne bez limitu (${z.zmiany} wykonanych).` : `🔄 Zmiany: ${z.zmiany}/${m.zasady.limit}.`);
  return out.slice(0, 6);
}
/** Dograj do końca bez oglądania (albo do przerwy). */
export function dograjDoKonca(s: StanGry, m: MeczLive, doPrzerwy = false) { let n = 0; while (!m.koniec && n++ < 400) { krokMinuty(s, m); if (doPrzerwy && przerwa(m)) break; } }

/** Para meczu Twojej drużyny w bieżącej kolejce ligowej (gospodarz, gość) albo null (pauza). */
export function paraMojegoMeczu(s: StanGry): [string, string] | null {
  const k = s.kluby[s.mojKlub]; const liga = s.ligi[k.poziom - 1];
  const para = liga?.terminarz[s.kolejka]?.find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
  return para ? [para[0], para[1]] : null;
}

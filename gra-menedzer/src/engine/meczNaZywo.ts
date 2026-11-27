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
import type { Nastawienie, StanGry, Zawodnik } from "./types";

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
export interface Komentarz { min: string; tekst: string; typ: "gol" | "akcja" | "kartka" | "zmiana" | "uraz" | "info" | "taktyka"; strona?: "dom" | "gosc" }
export interface ScenGol { min: number; klubId: string; strzelec: string; asysta?: string; typ: "gol" | "karny" | "samoboj" }
export interface MeczLive {
  dom: ZespolLive; gosc: ZespolLive; moja: "dom" | "gosc";
  min: number; polowa: 1 | 2; dolicz: [number, number]; gd: number; gg: number; koniec: boolean;
  gole: ScenGol[]; kartki: { min: number; klubId: string; id: string; typ: "zolta" | "czerwona"; opis: string }[];
  urazy: { min: number; klubId: string; id: string; tyg: number; opis: string }[];
  zmianyLog: { min: number; klubId: string; wchodzi: string; schodzi: string; powod: string }[];
  komentarz: Komentarz[]; staty: { strz: [number, number]; celne: [number, number]; rozne: [number, number]; faule: [number, number]; spalone: [number, number]; posD: number; posN: number };
  pilka: { x: number; y: number; strona: "dom" | "gosc" }; zasady: ZasadyZmian; atut: number;
  kondStart: Record<string, number>;
}

const nz = (s: StanGry, id: string) => { const z = s.zawodnicy[id]; return z ? `${z.imie[0]}. ${z.nazwisko}` : "?"; };
const nastAI = (s: StanGry, a: string, b: string): Nastawienie => { const d = s.kluby[a].renoma - s.kluby[b].renoma; return d > 0.25 ? "ofensywne" : d < -0.25 ? "obronne" : "zrownowazone"; };

/** Start meczu na żywo (nie zmienia stanu gry poza kondycją zawodników w trakcie — rozliczenie przy zapisie wyniku). */
export function rozpocznijMeczNaZywo(s: StanGry, domId: string, goscId: string): MeczLive {
  const zas = zasadyZmian(s);
  const zesp = (id: string, rywal: string): ZespolLive => {
    const moj = id === s.mojKlub;
    const formacja = moj ? s.taktyka.formacja : formacjaAI(id);
    const xi = moj ? [...s.taktyka.sklad] : autoSklad(s, id, formacja);
    const law = s.kluby[id].zawodnicy.filter((x) => !xi.includes(x)).map((x) => s.zawodnicy[x]).filter((z) => z && dostepny(s, z))
      .sort((a, b) => efektywna(b) - efektywna(a));
    // ławka: bramkarz + najlepsi z pola
    const br = law.find((z) => z.poz === "BR");
    const lw = [...(br ? [br] : []), ...law.filter((z) => z !== br)].slice(0, zas.lawka).map((z) => z.id);
    return { klubId: id, naBoisku: xi, lawka: lw, start: [...xi], zagrali: [...xi], formacja, nastawienie: moj ? s.taktyka.nastawienie : nastAI(s, id, rywal), zmiany: 0, oknaZmian: [], czerwoni: [], zolte: [] };
  };
  const m: MeczLive = {
    dom: zesp(domId, goscId), gosc: zesp(goscId, domId), moja: domId === s.mojKlub ? "dom" : "gosc",
    min: 0, polowa: 1, dolicz: [losInt(1, 3), losInt(2, 6)], gd: 0, gg: 0, koniec: false,
    gole: [], kartki: [], urazy: [], zmianyLog: [], komentarz: [],
    staty: { strz: [0, 0], celne: [0, 0], rozne: [0, 0], faule: [0, 0], spalone: [0, 0], posD: 0, posN: 0 },
    pilka: { x: 50, y: 50, strona: "dom" }, zasady: zas, atut: 1.12, kondStart: {},
  };
  for (const id of [...m.dom.naBoisku, ...m.dom.lawka, ...m.gosc.naBoisku, ...m.gosc.lawka]) m.kondStart[id] = s.zawodnicy[id]?.kondycja ?? 90;
  m.komentarz.unshift({ min: "0'", typ: "info", tekst: `Sędzia rozpoczyna mecz ${s.kluby[domId].nazwa} — ${s.kluby[goscId].nazwa}! ${s.kluby[domId].stadion ?? ""}` });
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

/** Oczekiwane gole na minutę dla obu stron przy obecnych składach i taktyce. */
export function tempoGoli(s: StanGry, m: MeczLive): [number, number] {
  const sd = sila(s, m.dom), sg = sila(s, m.gosc);
  const nd = NAST[m.dom.nastawienie], ng = NAST[m.gosc.nastawienie];
  const amator = 1 + (s.kluby[m.dom.klubId].poziom - 1) * 0.025;
  const xg = (a: number, o: number) => 1.48 * Math.exp((a - o) / 11);
  const t = tempoMn(s, m.dom.klubId) * tempoMn(s, m.gosc.klubId);
  const lamD = xg(sd.atak, sg.obrona) * m.atut * nd.swoje * ng.rywala * amator * t * pressMn(s, m.dom.klubId) * pressMn(s, m.gosc.klubId);
  const lamG = xg(sg.atak, sd.obrona) * 0.92 * ng.swoje * nd.rywala * amator * t * pressMn(s, m.gosc.klubId) * pressMn(s, m.dom.klubId);
  return [lamD / 90, lamG / 90];
}

function strzelec(s: StanGry, z: ZespolLive): Zawodnik | undefined {
  const zs = z.naBoisku.map((id) => s.zawodnicy[id]).filter(Boolean);
  if (!zs.length) return undefined;
  return wybierzWazone(zs, (p) => ({ NAP: 5, POM: 2.2, OBR: 0.6, BR: 0.02 })[p.poz] * (p.cechy?.includes("snajper") ? 1.6 : 1) * Math.max(5, p.umiej));
}

/** Jedna minuta meczu. Zwraca true, gdy padł gol (UI może zrobić pauzę na celebrację). */
export function krokMinuty(s: StanGry, m: MeczLive): boolean {
  if (m.koniec) return false;
  m.min++;
  const kon1 = 45 + m.dolicz[0], kon2 = 90 + m.dolicz[1];
  const minTxt = m.polowa === 1 ? (m.min > 45 ? `45+${m.min - 45}'` : `${m.min}'`) : (m.min > 90 ? `90+${m.min - 90}'` : `${m.min}'`);
  const [lD, lG] = tempoGoli(s, m);
  let gol = false;
  // posiadanie (do statystyk i animacji)
  const pD = Math.max(0.3, Math.min(0.7, 0.5 + (lD - lG) * 25));
  const strona: "dom" | "gosc" = Math.random() < pD ? "dom" : "gosc";
  if (strona === "dom") m.staty.posD++; m.staty.posN++;
  const atak = strona === "dom" ? m.dom : m.gosc, obr = strona === "dom" ? m.gosc : m.dom, i = strona === "dom" ? 0 : 1;
  const lam = strona === "dom" ? lD : lG, lamP = lam / (strona === "dom" ? pD : 1 - pD);
  // akcja: strzał z prawdopodobieństwem ~4,2 × xG
  m.pilka = { x: strona === "dom" ? los(55, 80) : los(20, 45), y: los(20, 80), strona };
  if (Math.random() < lamP * 4.2) {
    m.staty.strz[i]++;
    const st = strzelec(s, atak);
    if (Math.random() < 1 / 4.2 && st) {
      m.staty.celne[i]++;
      const karny = szansa(0.09), samo = !karny && szansa(0.022);
      const kandA = atak.naBoisku.filter((x) => x !== st.id).map((x) => s.zawodnicy[x]).filter(Boolean);
      const asysta = !karny && !samo && szansa(0.65) && kandA.length ? wybierzWazone(kandA, (z) => ({ NAP: 3, POM: 4, OBR: 1.2, BR: 0.05 })[z.poz] * Math.max(5, z.umiej)) : undefined;
      let sid = st.id;
      if (samo) { const o = obr.naBoisku.map((x) => s.zawodnicy[x]).filter((z) => z && z.poz === "OBR"); sid = o.length ? wybierz(o).id : ""; }
      m.gole.push({ min: m.polowa === 1 ? Math.min(45, m.min) : m.min, klubId: atak.klubId, strzelec: sid, asysta: asysta?.id, typ: samo ? "samoboj" : karny ? "karny" : "gol" });
      if (strona === "dom") m.gd++; else m.gg++;
      m.pilka = { x: strona === "dom" ? 100 : 0, y: 50, strona };
      m.komentarz.unshift({ min: minTxt, typ: "gol", strona, tekst: samo ? `⚽ GOL SAMOBÓJCZY! ${nz(s, sid)} pakuje piłkę do własnej bramki. ${m.gd}:${m.gg}` : `⚽ GOOOL! ${nz(s, st.id)}${karny ? " z rzutu karnego" : asysta ? ` po podaniu ${nz(s, asysta.id)}` : ""}! ${m.gd}:${m.gg}` });
      gol = true;
    } else if (st) {
      const celny = szansa(0.4);
      if (celny) m.staty.celne[i]++;
      if (szansa(0.35)) m.staty.rozne[i]++;
      if (szansa(0.45)) m.komentarz.unshift({ min: minTxt, typ: "akcja", strona, tekst: wybierz(celny
        ? [`${nz(s, st.id)} uderza — bramkarz broni!`, `Groźny strzał ${nz(s, st.id)}, piłka sparowana na rzut rożny.`, `${nz(s, st.id)} sam na sam… obrona golkipera!`]
        : [`${nz(s, st.id)} strzela obok słupka.`, `Uderzenie ${nz(s, st.id)} nad poprzeczką.`, `${nz(s, st.id)} trafia w słupek!`, `Strzał ${nz(s, st.id)} zablokowany przez obrońców.`]) });
      m.pilka = { x: strona === "dom" ? los(85, 97) : los(3, 15), y: los(35, 65), strona };
    }
  }
  if (szansa(0.012)) { m.staty.spalone[i]++; }
  // faule i kartki (sędzia ~ jak w silniku: ~0,16 żółtej na zawodnika na mecz)
  for (const [z, j] of [[m.dom, 0], [m.gosc, 1]] as [ZespolLive, number][]) {
    if (szansa(0.13)) m.staty.faule[j]++;
    if (!z.naBoisku.length) continue;
    if (szansa(0.0185)) {
      const id = wybierz(z.naBoisku), pz = s.zawodnicy[id];
      if (z.zolte.includes(id)) {
        z.zolte = z.zolte.filter((x) => x !== id); z.czerwoni.push(id); z.naBoisku = z.naBoisku.filter((x) => x !== id);
        m.kartki.push({ min: m.min, klubId: z.klubId, id, typ: "czerwona", opis: "druga żółta" });
        m.komentarz.unshift({ min: minTxt, typ: "kartka", strona: j ? "gosc" : "dom", tekst: `🟥 Druga żółta i czerwona dla ${nz(s, id)}! ${s.kluby[z.klubId].nazwa} w dziesiątkę.` });
      } else {
        z.zolte.push(id); m.kartki.push({ min: m.min, klubId: z.klubId, id, typ: "zolta", opis: "" });
        m.komentarz.unshift({ min: minTxt, typ: "kartka", strona: j ? "gosc" : "dom", tekst: `🟨 Żółta kartka: ${nz(s, id)} (${pz?.poz}).` });
      }
    } else if (szansa(0.0011)) {
      const id = wybierz(z.naBoisku);
      z.czerwoni.push(id); z.naBoisku = z.naBoisku.filter((x) => x !== id);
      m.kartki.push({ min: m.min, klubId: z.klubId, id, typ: "czerwona", opis: "faul taktyczny / brutalny" });
      m.komentarz.unshift({ min: minTxt, typ: "kartka", strona: j ? "gosc" : "dom", tekst: `🟥 Bezpośrednia czerwona kartka dla ${nz(s, id)}!` });
    }
    // urazy
    if (szansa(0.001) && z.naBoisku.length) {
      const id = wybierz(z.naBoisku), ciezka = szansa(0.15);
      const tyg = ciezka ? losInt(6, 16) : losInt(1, 4);
      const opis = ciezka ? wybierz(["zerwane więzadła", "złamanie", "naderwany mięsień"]) : wybierz(["stłuczenie", "naciągnięcie mięśnia", "uraz kostki"]);
      m.urazy.push({ min: m.min, klubId: z.klubId, id, tyg, opis });
      m.komentarz.unshift({ min: minTxt, typ: "uraz", strona: j ? "gosc" : "dom", tekst: `🚑 ${nz(s, id)} leży na murawie — ${opis}. ${z.klubId === s.mojKlub ? "Potrzebna zmiana!" : ""}` });
      if (z.klubId !== s.mojKlub) zmienAI(s, m, z, id, "kontuzja");
      else { const zz = s.zawodnicy[id]; if (zz) zz.kondycja = Math.min(zz.kondycja, 35); }
    }
  }
  // zmęczenie
  for (const z of [m.dom, m.gosc]) {
    const intens = z.klubId === s.mojKlub ? 1 + (s.taktyka.pressing === "wysoki" ? 0.18 : 0) + (s.taktyka.tempo === "szybkie" ? 0.12 : 0) - (s.taktyka.tempo === "wolne" ? 0.08 : 0) : 1;
    for (const id of z.naBoisku) { const p = s.zawodnicy[id]; if (p) p.kondycja = Math.max(25, p.kondycja - los(12, 22) / 90 * intens); }
  }
  // AI: zmiany i nastawienie
  const ai = m.moja === "dom" ? m.gosc : m.dom;
  const roznicaAI = m.moja === "dom" ? m.gg - m.gd : m.gd - m.gg;
  if (m.polowa === 2) {
    if (m.min >= 70 && roznicaAI < 0 && ai.nastawienie !== "ofensywne") { ai.nastawienie = "ofensywne"; m.komentarz.unshift({ min: minTxt, typ: "taktyka", tekst: `📋 ${s.kluby[ai.klubId].nazwa} przechodzi do ataku — rywal ryzykuje.` }); }
    if (m.min >= 78 && roznicaAI > 0 && ai.nastawienie !== "obronne") { ai.nastawienie = "obronne"; m.komentarz.unshift({ min: minTxt, typ: "taktyka", tekst: `📋 ${s.kluby[ai.klubId].nazwa} cofa się i broni wyniku.` }); }
    if ([60, 68, 75, 82].includes(m.min)) {
      const zm = ai.naBoisku.map((x) => s.zawodnicy[x]).filter((z) => z && z.poz !== "BR").sort((a, b) => a.kondycja - b.kondycja)[0];
      if (zm && zm.kondycja < 70) zmienAI(s, m, ai, zm.id, "zmęczenie");
    }
  }
  // koniec połowy / meczu
  if (m.polowa === 1 && m.min >= kon1) {
    m.polowa = 2; m.min = 45;
    m.komentarz.unshift({ min: "45'", typ: "info", tekst: `⏸ Przerwa. ${m.gd}:${m.gg}. Czas na korekty w szatni.` });
    for (const z of [m.dom, m.gosc]) for (const id of z.naBoisku) { const p = s.zawodnicy[id]; if (p) p.kondycja = Math.min(100, p.kondycja + 3); }
  } else if (m.polowa === 2 && m.min >= kon2) {
    m.koniec = true;
    m.komentarz.unshift({ min: "90'", typ: "info", tekst: `🏁 Koniec meczu! ${s.kluby[m.dom.klubId].nazwa} ${m.gd}:${m.gg} ${s.kluby[m.gosc.klubId].nazwa}` });
  }
  return gol;
}
export const przerwa = (m: MeczLive) => m.polowa === 2 && m.min === 45;

function zmienAI(s: StanGry, m: MeczLive, z: ZespolLive, schodzi: string, powod: string) {
  if (z.zmiany >= m.zasady.limit || (m.zasady.okna !== null && z.oknaZmian.length >= m.zasady.okna && !z.oknaZmian.includes(m.min))) return;
  const poz = s.zawodnicy[schodzi]?.poz;
  const kand = z.lawka.map((x) => s.zawodnicy[x]).filter((p) => p && (poz === "BR" ? p.poz === "BR" : p.poz !== "BR"));
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
  const przerwaTeraz = przerwa(m);
  if (!przerwaTeraz && !z.oknaZmian.includes(m.min)) z.oknaZmian.push(m.min);
  m.zmianyLog.push({ min: m.min, klubId: z.klubId, wchodzi, schodzi, powod });
  m.komentarz.unshift({ min: `${m.min}'`, typ: "zmiana", strona: z === m.dom ? "dom" : "gosc", tekst: `🔄 ${s.kluby[z.klubId].nazwa}: ${nz(s, wchodzi)} za ${nz(s, schodzi)}${powod === "kontuzja" ? " (uraz)" : ""}.` });
}
/** Twoja zmiana. Zwraca powód odmowy albo null. */
export function zmianaGracza(s: StanGry, m: MeczLive, schodzi: string, wchodzi: string): string | null {
  const z = m.moja === "dom" ? m.dom : m.gosc;
  if (m.koniec) return "Mecz się skończył.";
  if (!z.naBoisku.includes(schodzi)) return "Tego zawodnika nie ma na boisku.";
  if (!z.lawka.includes(wchodzi)) return "Tego zawodnika nie ma na ławce.";
  if (z.zmiany >= m.zasady.limit) return `Wykorzystano limit zmian (${m.zasady.limit}).`;
  if (m.zasady.okna !== null && !przerwa(m) && z.oknaZmian.length >= m.zasady.okna && !z.oknaZmian.includes(m.min)) return `Wykorzystano ${m.zasady.okna} przerwy na zmiany — kolejne zmiany tylko w przerwie meczu (już po niej).`;
  if (!m.zasady.powrotne && m.zmianyLog.some((x) => x.schodzi === wchodzi && x.klubId === z.klubId)) return "Zawodnik zmieniony nie może wrócić na boisko.";
  wykonajZmiane(s, m, z, schodzi, wchodzi, "taktyczna");
  return null;
}
export function zmienTaktyke(s: StanGry, m: MeczLive, o: { nastawienie?: Nastawienie; formacja?: string }) {
  const z = m.moja === "dom" ? m.dom : m.gosc;
  if (o.nastawienie && o.nastawienie !== z.nastawienie) { z.nastawienie = o.nastawienie; s.taktyka.nastawienie = o.nastawienie; m.komentarz.unshift({ min: `${m.min}'`, typ: "taktyka", tekst: `📋 Zmiana nastawienia: ${{ autobus: "autobus", obronne: "obronne", zrownowazone: "zrównoważone", ofensywne: "ofensywne" }[o.nastawienie]}.` }); }
  if (o.formacja && o.formacja !== z.formacja && FORMACJE[o.formacja]) { z.formacja = o.formacja; m.komentarz.unshift({ min: `${m.min}'`, typ: "taktyka", tekst: `📋 Nowe ustawienie: ${o.formacja}.` }); }
}
/** Dograj do końca bez oglądania. */
export function dograjDoKonca(s: StanGry, m: MeczLive) { let n = 0; while (!m.koniec && n++ < 200) krokMinuty(s, m); }

/** Para meczu Twojej drużyny w bieżącej kolejce ligowej (gospodarz, gość) albo null (pauza). */
export function paraMojegoMeczu(s: StanGry): [string, string] | null {
  const k = s.kluby[s.mojKlub]; const liga = s.ligi[k.poziom - 1];
  const para = liga?.terminarz[s.kolejka]?.find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
  return para ? [para[0], para[1]] : null;
}

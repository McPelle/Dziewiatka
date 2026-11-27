import { lambdy, rozstrzygnij, seriaKarnych } from "./rozstrzygniecie";
import { silaKlubu } from "./swiat";
// Puchar — jak w Polsce: najpierw wojewódzki (regionalny) Puchar Polski dla amatorów,
// jego zdobywca awansuje do głównego (centralnego) Pucharu Polski, gdzie grają zawodowcy
// (Ekstraklasa, I–II liga). Kluby zawodowe startują od razu w fazie głównej.
import { frekwencja } from "./derby";
import { los, losInt, szansa, tasuj, wybierz, wybierzWazone, zl } from "./losuj";
import { autoSklad, meczZeScenariusza, zagrajMecz } from "./mecz";
import { planOpraw } from "./oprawy";
import { zgodaKibicow } from "./kibice";
import { kulturaTrybun } from "./flagi";
import { BILET, nadajNumery, noweId, nowyZawodnik } from "./swiat";
import { wojKlubu } from "./regiony";
import { odlegloscDrogowa } from "../data/miasta";
import type { Puchar, StanGry, Wynik } from "./types";
import { podokregSciezki, zpnSciezki, zpnZnany } from "./zpn";

// Kluby z lig ogólnopolskich (poziomy 1–4: Ekstraklasa, I, II, III liga) grają główny PP od razu.
// Poziomy 5+ (IV liga i niżej) grają najpierw wojewódzki (regionalny) Puchar Polski — nazwa zależna od regionu.
/** Nazwa pucharu regionalnego wg regionu (mianownik „nom" + dopełniacz „gen" do rund). */
export function pucharRegion(s: StanGry): { nom: string; gen: string } {
  const z = zpnZnany(s.sciezka);
  if (!z) return { nom: "regionalny Puchar Polski", gen: "regionalnego Pucharu Polski" };
  return { nom: `Puchar Polski na szczeblu ${z.dop}`, gen: `Pucharu Polski na szczeblu ${z.dop}` };
}
/** Podokręg pomorski gracza (Gdańsk / Słupsk / Malbork) — z nazwy ścieżki. Puste dla innych regionów. */
export function okregPomorski(s: StanGry): string {
  const r = s.sciezka || "";
  if (!r.includes("Pomorsk")) return "";
  if (r.includes("Słupsk")) return "Słupsk";
  if (r.includes("Malbork")) return "Malbork";
  if (r.includes("Gdańsk")) return "Gdańsk";
  return "";
}

/** Podokręg małopolski gracza (Kraków / Nowy Sącz / Tarnów…) — z nazwy ścieżki. Puste dla innych regionów. */
export function okregMalopolski(s: StanGry): string {
  const r = s.sciezka || "";
  const sep = "Małopolska — ";
  const i = r.indexOf(sep);
  if (i < 0) return "";
  // pierwszy człon podokręgu (przed „ / "), np. „Nowy Sącz / Gorlice" → „Nowy Sącz", „Kraków I" → „Kraków I"
  return r.slice(i + sep.length).split(" / ")[0].trim();
}

/** Podokręg kujawsko-pomorski gracza (Bydgoszcz / Toruń / Włocławek) — z nazwy ścieżki. Puste dla innych regionów. */
export function okregKujawski(s: StanGry): string {
  const r = s.sciezka || "";
  const sep = "Kujawsko-Pomorskie — ";
  const i = r.indexOf(sep);
  if (i < 0) return "";
  // np. „Bydgoszcz III" → „Bydgoszcz", „Włocławek" → „Włocławek"
  return r.slice(i + sep.length).replace(/\s+[IVX]+$/, "").split(" / ")[0].trim();
}

/** Rundy pucharu regionalnego. Eliminacje okręgowe (podokręg gracza) → finał wojewódzki danego ZPN. */
/** Od której rundy pucharu regionalnego klub wchodzi do gry — wg ligi (regulaminy ZPN: najniższe klasy grają rundy
 *  wstępne w podokręgach, wyższe szczeble dołączają później). 0 = klasa B/C, 1 = klasa A, 2 = klasa okręgowa / V liga, 3 = IV liga. */
export function wejscieDoPucharu(s: StanGry, klubId: string): number {
  const k = s.kluby[klubId];
  if (k.pozaLiga) return 0;
  if (k.poziom <= 4) return 4; // III liga — dołącza na końcu fazy okręgowej
  const n = (s.ligi[k.poziom - 1]?.nazwa ?? "").toLowerCase();
  if (/klasa (b|c)/.test(n)) return 0;
  if (/klasa a/.test(n)) return 1;
  if (/okręgow|v liga/.test(n) && !/iv liga/.test(n)) return 2;
  return 3;
}
/** Faza okręgowa/podokręgowa (regulaminy ZPN 2026/27): klasa B + drużyny spoza lig zaczynają, wyższe klasy dochodzą później,
 *  III liga wchodzi na koniec etapu. Liczba rund zależy od tego, jak nisko gra klub gracza. */
const RUNDY_OKREGOWE = ["I runda (klasa B, drużyny spoza lig)", "II runda — wchodzi klasa A", "III runda — wchodzą klasa okręgowa i V liga", "IV runda — wchodzi IV liga", "Finał etapu okręgowego — wchodzi III liga"];
function wstepneDla(s: StanGry): string[] {
  const w = wejscieDoPucharu(s, s.mojKlub);
  const ok = okregPomorski(s) || okregMalopolski(s) || okregKujawski(s) || (/^(Warmińsko|Podlaskie)/.test(s.sciezka ?? "") ? podokregSciezki(s.sciezka) : "");
  return RUNDY_OKREGOWE.slice(Math.min(w, 4)).map((r) => (ok ? `${r} — okręg ${ok}` : r));
}
/** Ile rund fazy okręgowej ma przed sobą klub gracza. */
export function ileWstepnych(s: StanGry): number { return wstepneDla(s).length; }

export function nazwyRegion(s: StanGry): string[] {
  return [...wstepneDla(s), ...nazwyRegionGlowne(s)];
}
/** Czy przy remisie gra się dogrywkę (2×15), czy od razu rzuty karne — wg regulaminu danego ZPN (engine/zpn.ts). */
export function dogrywkaWRundzie(s: StanGry, runda: number): boolean {
  const n = nazwyRegion(s).length, w = ileWstepnych(s);
  const final = runda === n - 1, etap2 = runda >= w;
  const tryb = zpnZnany(s.sciezka)?.dogrywkaPuchar ?? "final";
  return tryb === "zawsze" ? true : tryb === "od18" ? etap2 : final;
}
function nazwyRegionGlowne(s: StanGry): string[] {
  const z = zpnZnany(s.sciezka)?.dop ?? "ZPN";
  return [`1/8 finału Pucharu Polski ${z}`, `Ćwierćfinał Pucharu Polski ${z}`, `Półfinał Pucharu Polski ${z}`, `Finał Pucharu Polski ${z}`];
}
const POZIOM_ZAWODOWY = 3;
/** Czy klub należy do województwa ZPN gracza (PP na szczeblu ZPN — tylko kluby tego związku; III liga ma kluby z 4 województw). */
function wRegionie(s: StanGry, id: string): boolean {
  const k = s.kluby[id];
  if (!k || k.pozaPiramida) return false;
  if (k.pozaLiga) return true;
  const mojW = wojKlubu(s.kluby[s.mojKlub]);
  const w = wojKlubu(k);
  return !mojW || !w || w === mojW;
} // Ekstraklasa, I i II liga — tylko szczebel centralny; III liga i niżej grają PP na szczeblu ZPN (regulaminy 2026/27)
/** Zespół rezerw (PZPN: rezerwy nie startują w Pucharze Polski) — po polu rezerwaDla albo po nazwie („II", „III"). */
export function jestRezerwa(s: StanGry, id: string): boolean {
  const k = s.kluby[id];
  return !!k && (!!k.rezerwaDla || /\s(II|III|IV)(\s|\/|$)/.test(k.nazwa));
}

// Krajowy puchar: oficjalna nazwa sezonu 2026/27 to „STS Puchar Polski" (sponsor tytularny STS, umowa z PZPN na 3 sezony od 2025/26).
export const NAZWY_GLOWNY = ["1/32 STS Pucharu Polski", "1/16 STS Pucharu Polski", "1/8 STS Pucharu Polski", "Ćwierćfinał STS Pucharu Polski", "Półfinał STS Pucharu Polski", "Finał STS Pucharu Polski"];

/** Pełna drabinka (lista rund) Twojej drogi w pucharze — amator gra regionalny + główny, zawodowiec tylko główny. */
export function pelnaDrabinka(s: StanGry): string[] {
  const amator = s.kluby[s.mojKlub] && s.kluby[s.mojKlub].poziom > POZIOM_ZAWODOWY && s.kwalifikacjaPP !== s.sezon;
  return amator ? [...nazwyRegion(s)] : [...NAZWY_GLOWNY];
}

// Nagrody za rundę (zł) — rosną z fazą. Indeks = numer rundy.
const NAGRODA_REGION_GL = [1_000, 2_000, 4_000, 10_000];
const nagrodaRegion = (s: StanGry, r: number) => { const w = ileWstepnych(s); return r < w ? [300, 500, 700, 1000, 1500][r] ?? 500 : NAGRODA_REGION_GL[Math.min(r - w, 3)]; };
const NAGRODA_GLOWNY = [20_000, 50_000, 120_000, 300_000, 700_000, 2_000_000];

// Drużyny spoza lig — w realiach ZPN do Pucharu Polski na szczeblu wojewódzkim może zgłosić się zespół, który nie gra
// w żadnej lidze (orlikowa ekipa, oldboje, drużyna zakładowa, świeżo założony klub). Startują od rundy wstępnej.
/** Typy drużyn spoza lig: nazwa (M = miasto), opis i siła względem najniższej klasy (+ = słabsi). */
const TYPY_POZA_LIGA: { nazwy: string[]; opis: string; slabsi: number }[] = [
  { nazwy: ["Orlik M", "Orlikowcy M", "Szóstka M", "Dzikie Orły M", "FC Osiedle M", "Podwórko M"], opis: "ekipa z orlika — grają na co dzień w lidze szóstek, do pucharu zgłosili się dla przygody", slabsi: 1 },
  { nazwy: ["Drużyna Zakładowa M", "Kolejarz Team M", "Energetyk Team M", "Hutnik Team M", "Budowlani Team M", "Spedycja M", "Mleczarz M"], opis: "drużyna firmowa — pracownicy zakładu, trenują po zmianie, sponsor = szef firmy", slabsi: 1 },
  { nazwy: ["OSP M", "Strażacy M", "Druhowie M"], opis: "drużyna Ochotniczej Straży Pożarnej — twardzi, ale bez zgrania", slabsi: 2 },
  { nazwy: ["Oldboje M", "Weterani M", "Old Stars M"], opis: "oldboje — byli piłkarze klubów z okolicy po 35. roku życia, technika jest, nóg brak", slabsi: 1 },
  { nazwy: ["AZS M", "Akademicy M", "Studenci M"], opis: "drużyna akademicka — szybcy studenci, kadra zmienia się co semestr", slabsi: 0 },
  { nazwy: ["Liceum M", "Absolwenci M"], opis: "absolwenci miejscowego liceum — zgrani od lat, średnia wieku 20", slabsi: 1 },
  { nazwy: ["Nowy Start M", "Sparta 2026 M", "Zjednoczeni M", "Torpedo M", "Czarne Koty M", "Sokoły M"], opis: "świeżo założony klub — jeszcze bez ligi, puchar to ich pierwszy oficjalny mecz", slabsi: 0 },
  { nazwy: ["Policja M", "Mundurowi M"], opis: "drużyna mundurowa (policja, służba więzienna) — kondycja na plus", slabsi: 1 },
  { nazwy: ["Gmina Team M", "Samorządowcy M"], opis: "drużyna urzędników gminy z wójtem w składzie — bardziej dla zabawy", slabsi: 2 },
];
function druzynyPozaLiga(s: StanGry): string[] {
  // sprzątnij zeszłoroczne
  for (const [id, k] of Object.entries(s.kluby)) if (k.pozaLiga) { for (const z of k.zawodnicy) delete s.zawodnicy[z]; delete s.kluby[id]; }
  const amat = s.ligi.filter((l) => l.poziom > POZIOM_ZAWODOWY);
  const najnizsza = amat[amat.length - 1];
  if (!najnizsza) return [];
  const wzor = s.kluby[najnizsza.kluby[0]];
  const miasta = [...new Set(amat.slice(-3).flatMap((l) => l.kluby).map((id) => s.kluby[id].miasto))];
  const ile = losInt(4, 8);
  const out: string[] = [];
  for (let i = 0; i < ile * 3 && out.length < ile; i++) {
    const typ = wybierz(TYPY_POZA_LIGA);
    const miasto = wybierz(miasta);
    const nazwa = wybierz(typ.nazwy).replace("M", miasto);
    if (Object.values(s.kluby).some((k) => k.nazwa === nazwa)) continue;
    const id = noweId(s, "k");
    const k = { ...wzor, id, nazwa, skrot: nazwa.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase(), miasto,
      zawodnicy: [] as string[], prawdziwy: false, pozaLiga: true, opisPozaLiga: typ.opis, herb: undefined, rezerwaId: undefined, rezerwaDla: undefined,
      renoma: 0.03 + (2 - typ.slabsi) * 0.02, kasa: 300, pojemnosc: 80, stadion: typ.nazwy[0].startsWith("Orlik") ? `Orlik w ${miasto}` : `boisko gminne w ${miasto}`,
      obiekty: { gastronomia: 0, parking: 0, sklep: 0 } };
    s.kluby[id] = k;
    const pz = Math.min(12, najnizsza.poziom + typ.slabsi);
    const oldboje = /oldboje|weterani|old stars/i.test(nazwa);
    for (const [poz, n] of [["BR", 2], ["OBR", 5], ["POM", 5], ["NAP", 3]] as const) for (let j = 0; j < n; j++) {
      const z = nowyZawodnik(s, pz, poz, oldboje ? { wiek: losInt(35, 46) } : /akadem|azs|student|liceum|absolwen/i.test(nazwa) ? { wiek: losInt(19, 24) } : {});
      z.klubId = id; z.kontraktTyp = "amator"; k.zawodnicy.push(z.id);
    }
    nadajNumery(s, k);
    out.push(id);
  }
  if (out.length) wiadomosc(s, `📋 Do ${pucharRegion(s).gen} zgłosiło się ${out.length} drużyn spoza lig — grają od rundy wstępnej:\n${out.map((id) => `• ${s.kluby[id].nazwa} — ${s.kluby[id].opisPozaLiga}`).join("\n")}`);
  return out;
}

export function nowyPuchar(s: StanGry): Puchar {
  const poziom = s.kluby[s.mojKlub].poziom;
  const kwal = s.kwalifikacjaPP === s.sezon; // zdobywca PP ZPN z zeszłego sezonu → od razu 1/32 STS PP
  const pozaLiga = poziom > POZIOM_ZAWODOWY ? druzynyPozaLiga(s) : [];
  const zawodowy = poziom <= POZIOM_ZAWODOWY || kwal;
  // Rundy pucharowe rozłożone na sezon (co ~2–3 kolejki).
  const kolejek = s.ligi[poziom - 1].terminarz.length;
  const ile = zawodowy ? NAZWY_GLOWNY.length : nazwyRegion(s).length + NAZWY_GLOWNY.length;
  const krok = Math.max(1, Math.floor((kolejek - 2) / ile)); // przy długiej drabince rundy także w środku tygodnia
  const harmonogram: number[] = [];
  const krokOk = 2 + (ile - 1) * krok <= kolejek - 1 ? krok : 1;
  for (let i = 0; i < ile; i++) harmonogram.push(Math.min(kolejek - 1, 2 + i * krokOk));
  // Pole uczestników do pełnego losowania par (bez mojego klubu — dokładany przy losowaniu rundy).
  const poleFaza = zawodowy
    ? s.ligi.filter((l) => l.poziom <= POZIOM_ZAWODOWY).flatMap((l) => l.kluby)
    : s.ligi.filter((l) => l.poziom > POZIOM_ZAWODOWY).flatMap((l) => l.kluby);
  // Regionalny: w pierwszej rundzie gracza grają tylko kluby, które już weszły do rozgrywek (niższe klasy najpierw).
  const startW = zawodowy ? 99 : wejscieDoPucharu(s, s.mojKlub);
  const pole = tasuj([...pozaLiga, ...poleFaza].filter((id) => id !== s.mojKlub && (zawodowy ? !jestRezerwa(s, id) : wRegionie(s, id)) && (zawodowy || wejscieDoPucharu(s, id) <= Math.min(4, startW)))).slice(0, 31);
  return {
    faza: zawodowy ? "glowny" : "regionalny",
    runda: 0,
    harmonogram,
    przeciwnik: null,
    ostatniMecz: null,
    nazwaRundy: zawodowy ? NAZWY_GLOWNY[0] : nazwyRegion(s)[0],
    zdobywcaRegion: null,
    zdobywcaGlowny: null,
    pole,
  };
}

/** Szybkie rozegranie pary pucharowej (bez symulacji minuta-po-minucie): 90 min wg siły składów (+ renoma),
 *  przy remisie dogrywka (gdy regulamin rundy ją przewiduje) i seria rzutów karnych — z pełnym zapisem wyniku. */
function rozegrajPare(s: StanGry, aId: string, bId: string, dogrywka = true, neutralny = false): { winner: string; tekst: string } {
  const sila = (id: string) => (s.kluby[id] ? silaKlubu(s, id) : 40) + (s.kluby[id]?.renoma ?? 0.3) * 6;
  const r = rozstrzygnij(sila(aId), sila(bId), { dogrywka, neutralny });
  return { winner: r.zwyciezca === "dom" ? aId : bId, tekst: r.tekst };
}

/** Losuje rywala pucharowego z właściwej puli (regionalny = amatorzy regionu; główny = zawodowcy, coraz mocniejsi). */
function losujRywala(s: StanGry, faza: "regionalny" | "glowny", runda: number): string {
  const moj = s.mojKlub;
  const mojPoziom = s.kluby[moj].poziom;
  // Rywal pochodzi z pola uczestników wciąż w grze (pełne losowanie par), jeśli jest dostępne.
  let poleAkt = (s.puchar?.pole ?? []).filter((id) => id !== moj && (faza === "regionalny" || !jestRezerwa(s, id)));
  if (faza === "regionalny") {
    // Wejście wyższych szczebli: w rundzie (startGracza + runda) dołączają kluby z tym progiem wejścia.
    const prog = Math.min(4, wejscieDoPucharu(s, moj) + runda);
    const dochodza = s.ligi.filter((l) => l.poziom > POZIOM_ZAWODOWY).flatMap((l) => l.kluby)
      .filter((id) => id !== moj && wRegionie(s, id) && wejscieDoPucharu(s, id) === prog && !poleAkt.includes(id));
    if (dochodza.length && s.puchar) { s.puchar.pole = [...poleAkt, ...tasuj(dochodza).slice(0, 16)]; poleAkt = s.puchar.pole; }
    // Rywal z tej samej lub sąsiedniej rangi częściej (losowanie w podokręgach).
    const dost = poleAkt.filter((id) => wejscieDoPucharu(s, id) <= prog);
    if (dost.length) poleAkt = dost;
  }
  if (poleAkt.length) {
    const mojaR = s.kluby[moj].renoma;
    return wybierzWazone(poleAkt, (id) => {
      const r = s.kluby[id].renoma;
      if (faza === "glowny" && runda >= 3) return 1 + r * 2;
      return 1 / (1 + Math.abs(r - mojaR) * 4);
    });
  }
  let pula: string[];
  if (faza === "regionalny") {
    // amatorzy z tej samej drabiny (poziom ≥ 4), nie mój klub, bez zespołów rezerw (PZPN — rezerwy nie grają w pucharze)
    pula = s.ligi.filter((l) => l.poziom > POZIOM_ZAWODOWY).flatMap((l) => l.kluby).filter((id) => id !== moj && wRegionie(s, id));
  } else {
    // zawodowcy; w późniejszych rundach coraz wyższe ligi (jak w realu — na końcu Ekstraklasa)
    const maxPoziom = Math.max(1, POZIOM_ZAWODOWY - Math.floor(runda / 2));
    pula = s.ligi.filter((l) => l.poziom <= POZIOM_ZAWODOWY && l.poziom >= Math.min(maxPoziom, 1)).flatMap((l) => l.kluby).filter((id) => id !== moj && !jestRezerwa(s, id));
    if (mojPoziom > POZIOM_ZAWODOWY) {
      // amator w fazie głównej — early rounds mogą trafić słabszego zawodowca, późne na pewno mocnego
    }
  }
  if (!pula.length) pula = Object.keys(s.kluby).filter((id) => id !== moj);
  // W regionalnym i wczesnych rundach dobieraj rywali zbliżonych siłą (mniej pogromów);
  // w głównym w późnych rundach preferuj mocniejszych (jak w realu — na końcu Ekstraklasa).
  const mojaRenoma = s.kluby[moj].renoma;
  return wybierzWazone(pula, (id) => {
    const r = s.kluby[id].renoma;
    if (faza === "glowny" && runda >= 3) return 1 + r * 2; // finałowe fazy: mocniejsi
    return 1 / (1 + Math.abs(r - mojaRenoma) * 4); // bliżej siłą
  });
}

export interface WynikPucharu {
  rozegrano: boolean;
  wynik?: Wynik;
  awans?: boolean;
  nazwa?: string;
}

/** Jeśli na tę kolejkę przypada runda pucharu, rozgrywa mecz gracza. Zwraca info do pokazania. */
export function moznaPuchar(s: StanGry): boolean {
  const p = s.puchar;
  return !!p && (p.faza === "regionalny" || p.faza === "glowny") && p.harmonogram.includes(s.kolejka);
}

export function rundaPucharu(s: StanGry): WynikPucharu {
  const p = s.puchar;
  if (!p || (p.faza !== "regionalny" && p.faza !== "glowny")) return { rozegrano: false };

  const nazwyFazy = p.faza === "regionalny" ? nazwyRegion(s) : NAZWY_GLOWNY;
  const nazwa = nazwyFazy[Math.min(p.runda, nazwyFazy.length - 1)];
  const { rywal: rywalId, uSiebie } = losowanieMojegoMeczu(s, p);
  p.najblizszy = undefined;
  p.przeciwnik = rywalId;
  const finalGlowny = p.faza === "glowny" && p.runda === NAZWY_GLOWNY.length - 1;
  // mecz obejrzany na żywo (z dogrywką / karnymi) — rozliczamy dokładnie to, co widziałeś
  const live = s.meczLivePuchar; s.meczLivePuchar = undefined;
  const liveOk = !!live?.koniec && live.dom.klubId === (uSiebie ? s.mojKlub : rywalId) && live.gosc.klubId === (uSiebie ? rywalId : s.mojKlub);
  if (finalGlowny) wiadomosc(s, `🏟 Finał STS Pucharu Polski na PGE Narodowym w Warszawie — przeciwnik: ${s.kluby[rywalId].nazwa}!`);
  const moj = { klubId: s.mojKlub, sklad: s.taktyka.sklad, formacja: s.taktyka.formacja, nastawienie: s.taktyka.nastawienie };
  const ryw = { klubId: rywalId, sklad: autoSklad(s, rywalId, "4-4-2"), formacja: "4-4-2", nastawienie: "zrownowazone" as const };
  let w = liveOk ? meczZeScenariusza(s, live!) : zagrajMecz(s, uSiebie ? moj : ryw, uSiebie ? ryw : moj, true, { ...(finalGlowny ? { domAtut: 1 } : {}), puchar: "polski" });
  // Puchar nie ma remisów — najpierw dogrywka, jeśli dalej remis to rzuty karne (lepszy lekko faworytem).
  let karne = false, dogrywka = false, karneTxt = "";
  if (liveOk) {
    dogrywka = live!.polowa >= 3;
    if (live!.karne?.zwyciezca) {
      karne = true; const [a, b] = [live!.karne.d.filter(Boolean).length, live!.karne.g.filter(Boolean).length];
      const myDom = uSiebie; karneTxt = ` (k. ${myDom ? a : b}:${myDom ? b : a})`;
      const wygr = (live!.karne.zwyciezca === "dom") === uSiebie;
      // w tabeli wyników serii karnych zapisujemy rozstrzygnięcie +1 dla zwycięzcy (jak dotąd)
      if (uSiebie) w = { ...w, gd: w.gd + (wygr ? 1 : 0), gg: w.gg + (wygr ? 0 : 1) }; else w = { ...w, gg: w.gg + (wygr ? 1 : 0), gd: w.gd + (wygr ? 0 : 1) };
    }
  }
  else if (w.gd === w.gg) {
    // Regulaminy: w fazie centralnej dogrywka zawsze; w ZPN — zależnie od związku i rundy (inaczej od razu karne).
    const mozeDogrywka = p.faza === "glowny" || dogrywkaWRundzie(s, p.runda);
    const sD = silaKlubu(s, w.dom), sG = silaKlubu(s, w.gosc);
    if (mozeDogrywka) { // dogrywka 2×15 (IFAB) — gole liczone jak w meczu, z mniejszą intensywnością
      dogrywka = true; const [lD, lG] = lambdy(sD, sG, !finalGlowny);
      const pois = (l: number) => { const L = Math.exp(-l); let k = 0, q = 1; do { k++; q *= Math.random(); } while (q > L); return k - 1; };
      w = { ...w, gd: w.gd + pois(lD / 3 * 0.9), gg: w.gg + pois(lG / 3 * 0.9) };
    }
    if (w.gd === w.gg) { // seria rzutów karnych: 5 + nagła śmierć
      const ser = seriaKarnych(sD, sG); karne = true;
      const a = ser.d.filter(Boolean).length, b = ser.g.filter(Boolean).length; karneTxt = ` (k. ${uSiebie ? a : b}:${uSiebie ? b : a})`;
      if (ser.zwyciezca === "dom") w = { ...w, gd: w.gd + 1 }; else w = { ...w, gg: w.gg + 1 };
    }
  }
  p.ostatniMecz = w;
  // Frekwencja pucharowa: gdy gościsz u siebie (zwłaszcza wyżej notowany rywal), przychodzi więcej kibiców.
  if (uSiebie) {
    const kd = s.kluby[s.mojKlub];
    const rw = s.kluby[rywalId];
    const wielki = rw.poziom < kd.poziom; // gość z wyższej ligi — święto dla miasta
    const widzowie = wielki ? Math.round(kd.pojemnosc * (0.94 + Math.random() * 0.06)) : frekwencja(s, s.mojKlub, rywalId, 0.15);
    const bilet = BILET[kd.poziom - 1] * (wielki ? 1.5 : 1); // podwyższone ceny na wielki mecz
    kd.kasa += Math.round(widzowie * bilet);
    if (wielki) {
      wiadomosc(s, `🏟 Puchar: ${rw.nazwa} (${rw.poziom === 1 ? "Ekstraklasa" : `${rw.poziom}. poziom`}) w gościach — KOMPLET! ${widzowie.toLocaleString("pl")} widzów, bilety wyprzedane w kilka godzin, wpływy ${zl(Math.round(widzowie * bilet))}. Sektor gości wypełniony po brzegi.`);
      for (const p of planOpraw(s, kd, rw, { derby: null, zgoda: zgodaKibicow(s, kd, rw), puchar: true, gosci: Math.round(kd.pojemnosc * 0.06), silaD: Math.max(0.4, kulturaTrybun(s, kd).pirotechnika), silaG: kulturaTrybun(s, rw).pirotechnika }))
        wiadomosc(s, `🎆 ${p.min >= 46 ? "Po przerwie — " : ""}Oprawa kibiców ${p.sektor === "gospodarzy" ? kd.nazwa : rw.nazwa}: ${p.o.opis}`);
      s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 3);
    }
  } else if (p.faza === "glowny") {
    // Kibicowski wyjazd życia na daleki mecz pucharowy (realny rywal w głównym PP): dojazd przez pół Polski, oprawa, koszt.
    const d = odlegloscDrogowa(s.kluby[s.mojKlub].miasto, s.kluby[rywalId].miasto);
    if (d > 220) {
      s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 3);
      const koszt = Math.round((d * 8) / 100) * 100;
      s.kluby[s.mojKlub].kasa -= koszt;
      wiadomosc(s, `🚌 Kibicowski wyjazd życia do ${s.kluby[rywalId].miasto} (${d} km) na Puchar Polski — gorący doping z sektora gości (zaufanie +3, koszt oprawy/dojazdu ${zl(koszt)}).`);
    }
  }
  const moje = uSiebie ? w.gd : w.gg;
  const ich = uSiebie ? w.gg : w.gd;
  const awans = moje > ich;

  const nagroda = p.faza === "regionalny" ? nagrodaRegion(s, p.runda) : NAGRODA_GLOWNY[Math.min(p.runda, NAGRODA_GLOWNY.length - 1)];
  s.kluby[s.mojKlub].kasa += nagroda;
  const rywalNazwa = s.kluby[rywalId].nazwa;
  const wynikTekst = karneTxt ? `${moje - (awans ? 1 : 0)}:${ich - (awans ? 0 : 1)}${dogrywka ? " po dogr." : ""}${karneTxt}` : `${moje}:${ich}${dogrywka ? " po dogr." : ""}`;
  if (!p.sciezka) p.sciezka = [];
  p.sciezka.push({ nazwa, przeciwnik: rywalId, wynik: wynikTekst, awans, uSiebie });

  // Pełne losowanie par rundy: mój mecz + pozostałe pary z pola uczestników (rozegrane szybko), zwycięzcy → kolejna runda.
  {
    const pozostali = tasuj((p.pole ?? []).filter((id) => id !== rywalId && id !== s.mojKlub));
    const pary: { dom: string; gosc: string; wynik: string }[] = [{ dom: uSiebie ? s.mojKlub : rywalId, gosc: uSiebie ? rywalId : s.mojKlub, wynik: wynikTekst }];
    const zwyciezcy: string[] = [awans ? s.mojKlub : rywalId];
    for (let i = 0; i + 1 < pozostali.length; i += 2) {
      const r = rozegrajPare(s, pozostali[i], pozostali[i + 1], p.faza === "glowny" || dogrywkaWRundzie(s, p.runda), finalGlowny);
      pary.push({ dom: pozostali[i], gosc: pozostali[i + 1], wynik: r.tekst });
      zwyciezcy.push(r.winner);
    }
    if (pozostali.length % 2 === 1) zwyciezcy.push(pozostali[pozostali.length - 1]); // wolny los (bye)
    p.pary = pary;
    p.pole = zwyciezcy; // zwycięzcy par przechodzą do następnej rundy
  }

  if (!awans) {
    if (p.faza === "regionalny") {
      const n = nazwyFazy.length;
      if (p.runda === n - 1) { s.kluby[s.mojKlub].kasa += 25_000; wiadomosc(s, `🥈 Finalista Pucharu Polski na szczeblu ZPN — nagroda PZPN 25 000 zł.`); }
      else if (p.runda === n - 2 && zpnSciezki(s.sciezka).kod === "POM") { s.kluby[s.mojKlub].kasa += 1_500; wiadomosc(s, "Półfinalista Pucharu Polski Pomorskiego ZPN — nagroda 1 500 zł."); }
    }
    p.faza = "odpadl";
    wiadomosc(s, `Puchar: odpadliście z ${rywalNazwa} (${wynikTekst}) w rundzie „${nazwa}". Premia ${zl(nagroda)}.`);
    return { rozegrano: true, wynik: w, awans: false, nazwa };
  }

  // awans
  const ostatnia = p.runda >= nazwyFazy.length - 1;
  wiadomosc(s, `Puchar: ${wynikTekst} z ${rywalNazwa} — awans z rundy „${nazwa}"! Premia ${zl(nagroda)}.`);
  s.zarzad = Math.min(100, s.zarzad + (p.faza === "glowny" ? 4 : 2));

  if (!ostatnia) {
    p.runda++;
    p.nazwaRundy = nazwyFazy[p.runda];
    return { rozegrano: true, wynik: w, awans: true, nazwa };
  }

  // wygrana faza
  if (p.faza === "regionalny") {
    p.zdobywcaRegion = s.mojKlub;
    p.faza = "kwalifikacja";
    s.kwalifikacjaPP = s.sezon + 1;
    s.kluby[s.mojKlub].kasa += 50_000;
    s.zarzad = Math.min(100, s.zarzad + 8);
    wiadomosc(s, `🏆 Zdobyliście ${pucharRegion(s).nom}! Nagroda PZPN 50 000 zł. W przyszłym sezonie gracie w 1/32 STS Pucharu Polski z klubami Ekstraklasy i I ligi.`);
    s.historia.push({ sezon: s.sezon, liga: pucharRegion(s).nom, miejsce: 1, wynik: "mistrz" });
    return { rozegrano: true, wynik: w, awans: true, nazwa: `Zdobywca ${pucharRegion(s).gen}` };
  } else {
    p.zdobywcaGlowny = s.mojKlub;
    p.faza = "zdobyty";
    wiadomosc(s, `🏆🏆 ZDOBYLIŚCIE PUCHAR POLSKI! Historyczny sukces — zagracie w europejskich pucharach (Liga Konferencji Europy)!`);
    s.zarzad = Math.min(100, s.zarzad + 20);
    s.kluby[s.mojKlub].kasa += 3_000_000;
    s.kluby[s.mojKlub].renoma = Math.min(1, s.kluby[s.mojKlub].renoma + 0.08);
    s.historia.push({ sezon: s.sezon, liga: "STS Puchar Polski", miejsce: 1, wynik: "mistrz" });
    return { rozegrano: true, wynik: w, awans: true, nazwa: "Zdobywca STS Pucharu Polski" };
  }
}

// import opóźniony, by uniknąć cyklu z sezon.ts
function wiadomosc(s: StanGry, tekst: string) {
  s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst });
  s.wiadomosci = s.wiadomosci.slice(0, 60);
}

export function etapPucharu(s: StanGry): string {
  const p = s.puchar;
  if (!p) return "";
  if (p.faza === "regionalny") return `${pucharRegion(s).nom} — ${p.nazwaRundy}`;
  if (p.faza === "glowny") return p.nazwaRundy;
  if (p.faza === "zdobyty") return "Zdobywca STS Pucharu Polski 🏆";
  if (p.faza === "kwalifikacja") return `Zdobywca ${pucharRegion(s).gen} 🏆 — w przyszłym sezonie 1/32 STS PP`;
  return "Odpadliście z pucharu";
}

/** Rozlosowany wcześniej (przy podglądzie / meczu na żywo) mój najbliższy mecz pucharowy — albo nowe losowanie. */
function losowanieMojegoMeczu(s: StanGry, p: Puchar): { rywal: string; uSiebie: boolean } {
  const n = p.najblizszy;
  if (n && n.sezon === s.sezon && n.kolejka === s.kolejka && n.runda === p.runda && n.faza === p.faza && s.kluby[n.rywal]) return n;
  const rywal = losujRywala(s, p.faza as "regionalny" | "glowny", p.runda);
  // Finał głównego PP na neutralnym obiekcie (PGE Narodowy). Regulaminy PP (PZPN/ZPN): gospodarzem jest drużyna z NIŻSZEJ klasy; przy równych — losowanie.
  const finalGlowny = p.faza === "glowny" && p.runda === NAZWY_GLOWNY.length - 1;
  const pM = s.kluby[s.mojKlub].poziom, pR = s.kluby[rywal].poziom;
  const uSiebie = finalGlowny ? false : pM > pR ? true : pM < pR ? false : szansa(0.5);
  p.najblizszy = { sezon: s.sezon, kolejka: s.kolejka, runda: p.runda, faza: p.faza, rywal, uSiebie };
  return p.najblizszy;
}

/** Mój mecz pucharowy w tej kolejce (para gospodarz–gość, nazwa rundy, czy przy remisie jest dogrywka, neutralny obiekt). */
export function meczPucharuGracza(s: StanGry): { para: [string, string]; nazwa: string; dogrywka: boolean; neutralny: boolean } | null {
  const p = s.puchar; if (!p || !moznaPuchar(s)) return null;
  const { rywal, uSiebie } = losowanieMojegoMeczu(s, p);
  const nazwyFazy = p.faza === "regionalny" ? nazwyRegion(s) : NAZWY_GLOWNY;
  const nazwa = `${p.faza === "glowny" ? "STS Puchar Polski" : "Puchar Polski (ZPN)"} — ${nazwyFazy[Math.min(p.runda, nazwyFazy.length - 1)]}`;
  return { para: uSiebie ? [s.mojKlub, rywal] : [rywal, s.mojKlub], nazwa, dogrywka: p.faza === "glowny" || dogrywkaWRundzie(s, p.runda), neutralny: p.faza === "glowny" && p.runda === NAZWY_GLOWNY.length - 1 };
}

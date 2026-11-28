import { KLUBY_PRAWDZIWE, LIGI_NAZWY, ROZMIAR_LIGI, WYMIANA_DOMYSLNA, type Sciezka } from "../data/kluby";
import { RENOMA_BONUS, RENOMA_POZIOM } from "../data/renoma";
import { rokZalozenia } from "../data/zalozenie";
import { pojemnoscKlubu } from "../data/pojemnosci";
import { przypiszTrenera } from "../data/trenerzy";
import { obsadzSztabKlubu, odswiezRynekSztabu } from "./sztab";
import { generujPuleSedziow } from "../data/sedziowie";
import { losujAgentaReal } from "../data/agenci";
import { IMIONA, MIANA, MIEJSCOWOSCI, NAZWISKA, NAZWISKA_KASZUBSKIE, NAZWISKA_GORALSKIE, PRZEDROSTKI } from "../data/nazwy";
import ROSTERY_JSON from "../../assets/rostery.json";
import ROSTERY_POZ_JSON from "../../assets/rostery-poz.json";
import ROSTERY_PELNE_JSON from "../../assets/rostery-pelne.json";
import KARIERY_REALNE from "../../assets/kariery-realne.json";
import KADRY_REALNE from "../../assets/kadry-realne.json";

const ROSTERY = ROSTERY_JSON as unknown as Record<string, [string, string][]>;
// Realne składy z pozycjami (herb → [imię, nazwisko, kategoria BR/OBR/POM/NAP]); źródło: Wikipedia.
const ROSTERY_POZ = ROSTERY_POZ_JSON as unknown as Record<string, [string, string, Pozycja][]>;
/** Pełne realne kadry Ekstraklasa → II liga (sezon 2026/27, źródło: Transfermarkt), klucz = nazwa klubu w grze.
 *  Wiersz: [imię, nazwisko, pozycja szczegółowa, data ur. DD.MM.RRRR, numer, kraj ("" = Polska), noga, kontrakt do (sezon, 0 = brak),
 *  wartość rynkowa EUR (0 = brak), wzrost cm (0 = brak)]. */
type WierszKadry = [string, string, PozycjaSzczegolowa, string, number, string, "" | "prawa" | "lewa" | "obie", number, number, number];
export const ROSTERY_PELNE = ROSTERY_PELNE_JSON as unknown as Record<string, WierszKadry[]>;
/** Wiek w dniu startu sezonu (1 lipca) na podstawie daty urodzenia „DD.MM.RRRR". */
/** Data urodzenia do pokazania w profilu: prawdziwa (jeśli znana) albo wygenerowana — stała dla zawodnika
 *  (dzień i miesiąc z jego id) i zgodna z wiekiem; rok nie zmienia się, bo wiek i sezon rosną razem. */
export function dataUrodzenia(z: { id: string; wiek: number; dataUr?: string }, sezon: number): string {
  if (z.dataUr) return z.dataUr;
  let h = 0;
  for (let i = 0; i < z.id.length; i++) h = (h * 31 + z.id.charCodeAt(i)) >>> 0;
  const m = (h % 12) + 1;
  const d = ((h >>> 5) % [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]) + 1;
  const r = sezon - z.wiek - (m > 7 || (m === 7 && d > 1) ? 1 : 0);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${r}`;
}
/** Data urodzenia osoby (trener, sztab, tłumacz) — stała dla danej osoby, spójna z wiekiem. */
export function dataUrOsoby(seed: string, wiek: number | undefined, sezon: number): string {
  if (wiek == null) return "";
  return dataUrodzenia({ id: seed, wiek }, sezon);
}
/** Opis osoby: „ur. 12.03.1978 (48 lat)”. */
export function urodzony(seed: string, wiek: number | undefined, sezon: number): string {
  if (wiek == null) return "";
  const l = wiek % 10 >= 2 && wiek % 10 <= 4 && (wiek % 100 < 12 || wiek % 100 > 14) ? "lata" : "lat";
  return `ur. ${dataUrOsoby(seed, wiek, sezon)} (${wiek} ${l})`;
}
/** Percentyl (0..1) realnej wyceny wśród prawdziwych zawodników danego poziomu (1–3). */
const _percentyle: Record<number, number[]> = {};
function percentylWartosci(poziom: number, wart: number): number {
  if (!_percentyle[poziom]) {
    const nazwy = new Set((KLUBY_PRAWDZIWE[poziom] ?? []).map((k) => k.nazwa));
    _percentyle[poziom] = Object.entries(ROSTERY_PELNE).filter(([n]) => nazwy.has(n)).flatMap(([, w]) => w.map((x) => x[8]).filter((v) => v > 0)).sort((a, b) => a - b);
  }
  const arr = _percentyle[poziom];
  if (!arr.length) return 0.5;
  let lo = 0; while (lo < arr.length && arr[lo] < wart) lo++;
  return lo / arr.length;
}
export function wiekNaStartSezonu(dataUr: string, sezon: number): number {
  const [d, m, r] = dataUr.split(".").map(Number);
  return sezon - r - (m > 7 || (m === 7 && d > 1) ? 1 : 0);
}
import { los, losInt, szansa, tasuj, wybierz, wybierzWazone } from "./losuj";
import { generujAtrybuty, overall, rozwinAtrybuty } from "./atrybuty";
import { KAT_POZ, POZ_WAGI } from "../data/pozycje";
import { losujNarodowosc } from "../data/narodowosci";
import type { Cecha, Klub, KontraktTyp, Liga, Pozycja, PozycjaSzczegolowa, StanGry, WpisKariery, Zawodnik } from "./types";
import { szczebelRegionalny, zpnSciezki } from "./zpn";

export const LICZBA_POZIOMOW = LIGI_NAZWY.length;

/** Regionalne nazwisko: pula zależna od województwa ścieżki (fakt etnograficzny).
 * Kaszubskie na Pomorzu, góralskie na południu Małopolski; reszta — pula krajowa. */
function nazwiskoRegionalne(sciezka: string | undefined): string {
  const s = (sciezka ?? "").toLowerCase();
  // kolejność ważna: zach-pom i kuj-pom zawierają „pomor", ale nie są kaszubskie
  if (/zachodniopomor|kujawsko/.test(s)) return wybierz(NAZWISKA); // regiony osadnicze — pula krajowa
  if (/pomor/.test(s)) return szansa(0.45) ? wybierz(NAZWISKA_KASZUBSKIE) : wybierz(NAZWISKA); // Pomorze — kaszubskie
  if (/małopol|malopol/.test(s)) {
    const goral = /podhale|limanow|gorlic|nowy sącz|nowy sacz|tatr/.test(s) ? 0.5 : 0.18; // silniej na południu
    return szansa(goral) ? wybierz(NAZWISKA_GORALSKIE) : wybierz(NAZWISKA);
  }
  return wybierz(NAZWISKA);
}

export const wymianaSciezki = (s: Sciezka) => s.wymiana ?? WYMIANA_DOMYSLNA.slice(0, s.ligi.length - 1);

// Zakres umiejętności zawodników na poziomie (indeks 0 = Ekstraklasa).
const UMIEJ = [
  [60, 80], [53, 70], [47, 62], [41, 56], [35, 50], [29, 44], [24, 38], [19, 33], [14, 28], [11, 24], [9, 21], [7, 18],
];
export const zakresUmiej = (poziom: number) => UMIEJ[Math.min(poziom, UMIEJ.length) - 1];

// Ekonomia poziomu (zł).
export const SPONSOR_SEZON = [12_000_000, 2_500_000, 700_000, 220_000, 70_000, 30_000, 14_000, 8_000, 5_000, 3_500, 2_500, 1_800];
export const WIDZOWIE = [11000, 3500, 1500, 600, 300, 180, 100, 60, 40, 30, 25, 20];
export const BILET = [45, 30, 20, 15, 10, 10, 8, 5, 5, 5, 5, 5];
// zł za kolejkę dla średniaka — ok. 55% przychodów klubu idzie na pensje
export const PENSJA_BAZA = [16000, 3300, 900, 280, 100, 50, 25, 12, 8, 6, 5, 4];
// Premia za awans DO poziomu (indeks 0 = awans do Ekstraklasy).
export const PREMIA_AWANS = [4_000_000, 1_000_000, 250_000, 60_000, 20_000, 8_000, 3_000, 1_000, 0, 800, 600, 0];
export const KASA_START = [6_000_000, 1_500_000, 400_000, 120_000, 40_000, 15_000, 6_000, 3_000, 1_500, 1_200, 900, 700];

export function pensjaDla(umiej: number, poziom: number): number {
  const [a, b] = zakresUmiej(poziom);
  const srodek = (a + b) / 2;
  const w = PENSJA_BAZA[poziom - 1] * Math.pow(Math.max(umiej, 5) / srodek, 3);
  return w < 100 ? Math.max(5, Math.round(w)) : Math.round(w / 10) * 10;
}

export function wartosc(z: Zawodnik): number {
  // Wartość rynkowa: rośnie wykładniczo z umiejętnościami, młodzi z potencjałem drożej.
  // ok. 1 tys. zł (umiej. 25, niższe klasy) … 50 tys. (50) … 4 mln (80, Ekstraklasa)
  const baza = 60 * Math.pow(1.16, z.umiej - 5);
  const wiekMn = z.wiek <= 21 ? 1.6 : z.wiek <= 25 ? 1.3 : z.wiek <= 29 ? 1 : z.wiek <= 32 ? 0.6 : 0.3;
  const potMn = 1 + Math.max(0, z.potencjal - z.umiej) / 40;
  return Math.round((baza * wiekMn * potMn) / 100) * 100;
}

export function noweId(s: StanGry, pref: string): string {
  s.licznikId++;
  return `${pref}${s.licznikId.toString(36)}`;
}

export function nowyZawodnik(s: StanGry, poziom: number, poz: Pozycja, opcje: { wiek?: number; mlody?: boolean } = {}): Zawodnik {
  const [a, b] = zakresUmiej(poziom);
  const wiek = opcje.wiek ?? (opcje.mlody ? losInt(16, 18) : losInt(18, 34));
  let umiej = los(a, b);
  if (opcje.mlody) umiej = los(a - 8, a + 2);
  if (wiek >= 31) umiej -= los(0, 3);
  // Potencjał = sufit rozwoju overalla. Młodzi mają spory zapas, część to ukryte perełki (szeroki ogon);
  // starsi coraz mniejszy, po 30. r.ż. praktycznie żaden. „Czy go osiągnie" zależy od klubu/treningu/akademii.
  let zapas: number;
  if (wiek <= 18) zapas = los(6, 26) + (szansa(0.18) ? los(8, 22) : 0);
  else if (wiek <= 20) zapas = los(5, 20) + (szansa(0.12) ? los(6, 16) : 0);
  else if (wiek <= 23) zapas = los(2, 12) + (szansa(0.08) ? los(4, 10) : 0);
  else if (wiek <= 26) zapas = los(0, 6);
  else if (wiek <= 29) zapas = los(0, 3);
  else zapas = 0;
  umiej = Math.max(5, Math.min(92, umiej));
  const pozS = wybierzWazone(POZ_WAGI[poz], (x) => x[1])[0];
  const atrybuty = generujAtrybuty(poz, umiej, wiek);
  umiej = overall(poz, atrybuty); // OVERALL z atrybutów (≈ dotychczasowa siła)
  // Narodowość: obcokrajowcy od Klasy B po Ekstraklasę (im wyżej, tym częściej). Brak kraju = Polak.
  const szansaObcy = [0.45, 0.33, 0.3, 0.18, 0.1, 0.06, 0.04, 0.03, 0.03][Math.min(poziom - 1, 8)] ?? 0.03;
  let imie: string, nazwisko: string, kraj: string | undefined;
  if (szansa(szansaObcy)) {
    const n = losujNarodowosc(los);
    kraj = n.kraj; imie = wybierz(n.imiona); nazwisko = wybierz(n.nazwiska);
  } else {
    imie = wybierz(IMIONA); nazwisko = nazwiskoRegionalne(s.sciezka);
  }
  const z: Zawodnik = {
    id: noweId(s, "z"),
    imie,
    nazwisko,
    poz,
    pozS,
    atrybuty,
    ...(kraj ? { kraj } : {}),
    wiek,
    umiej,
    potencjal: Math.min(93, umiej + zapas),
    kondycja: 100,
    forma: 0,
    pensja: 0,
    klubId: null,
    kontuzja: 0,
    podatnosc: Math.round((0.85 + los(0, 0.45) + (szansa(0.1) ? los(0.2, 0.45) : 0)) * 100) / 100, // większość ~1.0; ~10% to „szklani" (podatni)
    urazy: 0,
    gole: 0,
    asysty: 0,
    czysteKonta: 0,
    mecze: 0,
    kontraktTyp: kontraktTyp(poziom),
    kontraktDo: s.sezon + dlugoscKontraktu(poziom, opcje.mlody),
    kartki: 0,
    zawieszenie: 0,
    morale: Math.round(los(55, 80)),
    prosiOTransfer: false,
    noga: losujNoge(poz),
    numer: 0, // nadawany per klub przy tworzeniu kadry
    kariera: [],
  };
  z.cechy = losujCechy(poz, wiek, z.umiej, z.potencjal, atrybuty.prz);
  z.pensja = pensjaDla(z.umiej, poziom);
  // Klauzula wykupu: tylko zawodowcy (poziom 1–3), ok. 45% z nich; 1,5–2,8× wartości rynkowej.
  if (poziom <= 3 && szansa(0.45)) z.klauzula = Math.max(10000, Math.round((wartosc(z) * los(1.5, 2.8)) / 1000) * 1000);
  if (maAgenta(poziom)) z.agent = losujAgenta(poziom);
  s.zawodnicy[z.id] = z;
  return z;
}

/** Losuje 0–3 cechy specjalne zawodnika wg pozycji, wieku i atrybutów. */
function losujCechy(poz: Pozycja, wiek: number, umiej: number, potencjal: number, prz: number): Cecha[] {
  const c: Cecha[] = [];
  if ((poz === "NAP" || poz === "POM") && szansa(0.14)) c.push("snajper");
  if (szansa(0.10)) c.push("egzekutor");
  if (prz >= 80 || (prz >= 68 && szansa(0.5))) c.push("lider");
  if (wiek <= 21 && potencjal - umiej >= 12 && szansa(0.5)) c.push("talent");
  if ((poz === "OBR" || poz === "BR") && szansa(0.12)) c.push("mur");
  if (szansa(0.10)) c.push("szybki");
  if (wiek >= 32 && szansa(0.4)) c.push("weteran");
  // Behawioralne — niezależny rzut (wpływają na mecz/kontuzje/formę/transfery).
  const beh: Cecha[] = [];
  if (szansa(0.13)) beh.push("nerwowy");
  if (szansa(0.08)) beh.push("kontuzjogenny");
  if (prz >= 72 ? szansa(0.14) : szansa(0.07)) beh.push("bigmecz");       // mocniejsza głowa → częściej „na wielkie mecze"
  if (prz >= 68 ? szansa(0.16) : szansa(0.08)) beh.push("profesjonalista");
  if (szansa(0.18)) beh.push("lojalny");
  else if (szansa(0.14)) beh.push("niespokojny");                          // wykluczające się z lojalnym
  // max 3 „umiejętnościowe" + max 2 behawioralne
  const umiejC = [...new Set(c)].slice(0, 3);
  const behC = [...new Set(beh)].slice(0, 2);
  return [...new Set([...umiejC, ...behC])];
}

// Pojemność stadionu wg poziomu (min, max). Indeks 0 = Ekstraklasa.
const POJEMNOSC: [number, number][] = [
  [12000, 42000], [4000, 16000], [2500, 9000], [1200, 5000], [700, 3000], [400, 1800], [250, 1200], [150, 800], [100, 600],
];
const STADION_PRZYM = ["Miejski", "Sportowy", "Ludowy", "im. Sportowców"];

/** Generuje nazwę i pojemność stadionu (realistycznie wg poziomu i renomy). Edytowalne w grze. */
export function generujStadion(miasto: string, poziom: number, renoma: number): { stadion: string; pojemnosc: number } {
  const [a, b] = POJEMNOSC[Math.min(poziom, POJEMNOSC.length) - 1];
  const pojemnosc = Math.round((a + (b - a) * renoma * los(0.7, 1.1)) / 50) * 50;
  const stadion = szansa(0.5) ? `Stadion Miejski w ${miasto}` : `Stadion ${wybierz(STADION_PRZYM)}`;
  return { stadion, pojemnosc: Math.max(a, Math.min(b, pojemnosc)) };
}

/** Lepsza noga — realistyczny rozkład (prawa ~68%, lewa ~24%, obie ~8%). */
export function losujNoge(poz: Pozycja): "prawa" | "lewa" | "obie" {
  const r = Math.random();
  if (r < 0.08) return "obie";
  return r < 0.32 ? "lewa" : "prawa";
}

const POLSKIE_KLUBY_RDZEN = ["Orzeł", "Sokół", "Victoria", "Pogoń", "Start", "Unia", "Naprzód", "Polonia", "Piast", "Wisła"];

// Agenci piłkarscy (fikcyjni) — duża pula generowana profesjonalnie: indywidualni + agencje.
// Pula powstaje raz na uruchomienie; jeden agent prowadzi wielu klientów (jak w realu).
const AGENCJA_PRZED = ["Elite", "Apex", "Vertex", "Prime", "First Touch", "Pro", "Global", "Star", "Vision", "United",
  "Core", "Summit", "Atlas", "Legacy", "Premier", "Next Level", "Top", "Match", "Goal", "Pivot", "Icon", "Orbit", "Vantage", "Catalyst"];
const AGENCJA_PO = ["Sports", "Football", "Management", "Sports Group", "Agency", "Sports Management", "Football Agency",
  "Pro Management", "Talent", "Sports Agency", "Partners", "Group"];

const PULA_AGENTOW: string[] = (() => {
  const set = new Set<string>();
  let prob = 0;
  while (set.size < 150 && prob < 4000) { set.add(`${wybierz(IMIONA)} ${wybierz(NAZWISKA)}`); prob++; }
  for (let i = 0; i < 50; i++) set.add(`${wybierz(AGENCJA_PRZED)} ${wybierz(AGENCJA_PO)}`);
  return [...set];
})();

export const LICZBA_AGENTOW = PULA_AGENTOW.length;
/** Losowy agent zawodnika. Szczebel zawodowy (poziom ≤ 3: Ekstraklasa/I/II liga) → REALNY agent/agencja; niżej generowany. */
export function losujAgenta(poziom?: number): string {
  return poziom != null && poziom <= 3 ? losujAgentaReal() : wybierz(PULA_AGENTOW);
}

/** Czy zawodnik na danym poziomie ma agenta (profesjonaliści zawsze, półprof. czasem, amatorzy rzadko). */
export function maAgenta(poziom: number): boolean {
  return poziom <= 3 ? true : poziom <= 6 ? szansa(0.5) : szansa(0.08);
}

/** Gole w jednym sezonie wg pozycji i liczby meczów (amatorsko). */
function goleNaSezon(poz: Pozycja, mecze: number): number {
  if (poz === "BR") return 0;
  const wsp = poz === "NAP" ? los(0.28, 0.6) : poz === "POM" ? los(0.1, 0.32) : los(0.02, 0.12);
  return Math.round(mecze * wsp);
}

/** Dzieli `lat` sezonów na `ile` etapów, każdy ≥1. */
function podzielLata(lat: number, ile: number): number[] {
  const parts = Array(ile).fill(1);
  for (let i = ile; i < lat; i++) parts[losInt(0, ile - 1)]++;
  return parts;
}

/** Generuje wiarygodną historię kariery z meczami i golami (realne staty amatorów nie istnieją). */
/** Prawdziwa kariera seniorska realnego zawodnika (assets/kariery-realne.json — źródła: pl/en.wikipedia, strony klubów i lig).
 *  Klucz: „Imię Nazwisko|DD.MM.RRRR”. Ostatni wpis = obecny klub (do: null). Brak danych → undefined (gra NIE dopisuje
 *  wtedy wymyślonych klubów — pokazuje tylko obecny). */
export function karieraRealna(s: StanGry, imie: string, nazwisko: string, dataUr: string | undefined, aktualnyKlub: string): WpisKariery[] | undefined {
  const k = (KARIERY_REALNE as unknown as Record<string, { klub: string; od: number; do: number | null; mecze?: number; gole?: number; wyp?: boolean }[]>)[`${imie} ${nazwisko}|${dataUr ?? ""}`];
  if (!k?.length) return undefined;
  const w: WpisKariery[] = k.filter((x) => x.od <= s.sezon).map((x) => ({ klub: x.klub, od: x.od, do: x.do, mecze: x.mecze ?? 0, gole: x.gole ?? 0, ...(x.wyp ? { wypozyczenie: true } : {}) }));
  if (!w.length) return undefined;
  const ost = w[w.length - 1];
  // bieżący sezon (od lipca) nalicza gra na żywo — mecze z tego sezonu w źródle zerujemy, żeby nie liczyć ich dwa razy
  if (ost.do === null && ost.od >= s.sezon) { ost.mecze = 0; ost.gole = 0; }
  // obecny klub zawsze na końcu (do: null) — sezon bieżący nalicza się w grze na żywo
  if (ost.klub !== aktualnyKlub || ost.do !== null) w.push({ klub: aktualnyKlub, od: Math.max(ost.do ?? s.sezon, ost.od), do: null, mecze: 0, gole: 0 });
  return w;
}

export function generujKariere(s: StanGry, z: Zawodnik, aktualnyKlub: string): WpisKariery[] {
  const sezon = s.sezon;
  const lat = Math.max(0, z.wiek - losInt(16, 18)); // ile sezonów w seniorskiej piłce
  if (lat === 0) return [{ klub: aktualnyKlub, od: sezon, do: null, mecze: 0, gole: 0 }];
  const maxPrev = z.wiek <= 20 ? 1 : z.wiek <= 24 ? 2 : z.wiek <= 29 ? 3 : 4;
  const ilePrev = Math.max(0, Math.min(maxPrev, losInt(0, maxPrev), lat - 1)); // zostaw ≥1 sezon na obecny klub
  const stints = ilePrev + 1;
  const spany = podzielLata(lat, stints);
  const wpisy: WpisKariery[] = [];
  const uzyteKluby = new Set<string>([aktualnyKlub]);
  let rok = sezon - lat;
  for (let i = 0; i < stints; i++) {
    const biezacy = i === stints - 1;
    const span = spany[i];
    const od = rok;
    rok += span;
    let klubNazwa = aktualnyKlub;
    if (!biezacy) {
      do { klubNazwa = `${wybierz(POLSKIE_KLUBY_RDZEN)} ${wybierz(MIEJSCOWOSCI)}`; } while (uzyteKluby.has(klubNazwa));
      uzyteKluby.add(klubNazwa);
    }
    const sezonyDoNaliczenia = biezacy ? span - 1 : span; // bieżący sezon obecnego klubu liczony na żywo
    let mecze = 0, gole = 0;
    for (let n = 0; n < sezonyDoNaliczenia; n++) { const m = losInt(14, 28); mecze += m; gole += goleNaSezon(z.poz, m); }
    wpisy.push({ klub: klubNazwa, od, do: biezacy ? null : rok, mecze, gole });
  }
  return wpisy;
}

/** Wpis obecnego klubu (otwarty etap) albo undefined. */
export function wpisKarieryOtwarty(z: Zawodnik): WpisKariery | undefined {
  const o = z.kariera[z.kariera.length - 1];
  return o && o.do === null ? o : undefined;
}

/** Dolicza statystyki sezonu do obecnego etapu kariery. */
export function naliczSezonDoKariery(z: Zawodnik) {
  const o = wpisKarieryOtwarty(z);
  if (o) { o.mecze += z.mecze; o.gole += z.gole; }
}

/** Zawodnik przechodzi do klubu: zamyka poprzedni etap (z doliczeniem sezonu) i otwiera nowy. */
export function przejscieDoKlubu(s: StanGry, z: Zawodnik, klubNazwa: string) {
  const o = wpisKarieryOtwarty(z);
  if (o) {
    if (o.klub === klubNazwa) return; // już tu jest
    naliczSezonDoKariery(z);
    o.do = s.sezon;
  }
  z.mecze = 0; z.gole = 0; z.asysty = 0; z.czysteKonta = 0; // sezonowa tabelka startuje w nowym klubie
  z.zgranie = 30; // nowy w zespole — chemia z drużyną niska, odbuduje się z meczami (C3)
  z.kariera = [...z.kariera, { klub: klubNazwa, od: s.sezon, do: null, mecze: 0, gole: 0 }];
}

/** Nadaje numery na koszulki całej kadrze klubu (bramkarze 1/12/22, reszta 2–33). */
export function nadajNumery(s: StanGry, klub: Klub) {
  const uzyte = new Set<number>(klub.numeryZastrzezone ?? []); // numery zastrzeżone po legendach pomijamy
  // Oryginalne numery realnych zawodników (z danymi urodzenia) zostają — rezerwujemy je najpierw.
  const zachowaj = new Set<string>();
  for (const id of klub.zawodnicy) {
    const z = s.zawodnicy[id];
    if (z.realny && z.numer > 0 && !uzyte.has(z.numer)) { uzyte.add(z.numer); zachowaj.add(id); }
  }
  const wolny = (od: number) => { let n = od; while (uzyte.has(n)) n++; uzyte.add(n); return n; };
  const brNumery = [1, 12, 22, 30];
  let bi = 0;
  for (const id of klub.zawodnicy) {
    if (zachowaj.has(id)) continue;
    const z = s.zawodnicy[id];
    z.numer = z.poz === "BR" ? wolny(brNumery[bi++] ?? 30) : wolny(2);
  }
}

/** Rodzaj kontraktu wg szczebla (PZPN): zawodowy — Ekstraklasa/I/II liga (1–3),
 *  półprofesjonalny — III/IV liga (4–5), amatorski — V liga i niżej (6+). */
export function kontraktTyp(poziom: number): "zawodowy" | "polprofesjonalny" | "amator" {
  return poziom <= 3 ? "zawodowy" : poziom <= 5 ? "polprofesjonalny" : "amator";
}

export function dlugoscKontraktu(poziom: number, mlody?: boolean, wiek?: number): number {
  let d: number;
  if (mlody) d = poziom <= 3 ? losInt(2, 3) : 2; // juniorzy dłużej
  else if (poziom <= 3) d = losInt(1, 4); // zawodowcy 1–4 sezony
  else if (poziom <= 6) d = losInt(1, 3); // półprofesjonalni 1–3
  else d = losInt(1, 2); // amatorzy krótko (sezon–dwa)
  // Realizm wieku: weterani dostają krótkie umowy, młodzi dłuższe.
  if (wiek != null) {
    if (wiek >= 33) d = 1;
    else if (wiek >= 30) d = Math.min(d, 2);
    else if (wiek <= 21) d = Math.min(poziom <= 3 ? 5 : 4, d + 1);
  }
  return d;
}

export const NAZWA_KONTRAKTU: Record<string, string> = {
  zawodowy: "zawodowy",
  polprofesjonalny: "półprofesjonalny",
  amator: "amatorski",
};

// ——— Konkretna data końca umowy ———
// Sezon jesień–wiosna kończy się 30 czerwca. Pole `kontraktDo` to rok-sezon ostatniej kampanii umowy
// (np. 2027 = sezon 2027/28), więc umowa realnie wygasa 30 czerwca następnego roku kalendarzowego.
export function rokKoncaKontraktu(kontraktDo: number): number { return kontraktDo + 1; }
/** Konkretna data końca umowy, np. „30 czerwca 2028”. */
export function dataKontraktu(kontraktDo: number): string { return `30 czerwca ${kontraktDo + 1}`; }
/** Pełny opis umowy: typ + konkretna data, np. „zawodowy · do 30 czerwca 2028”. */
export function opisKontraktu(z: { kontraktTyp: KontraktTyp; kontraktDo: number }): string {
  return `${NAZWA_KONTRAKTU[z.kontraktTyp]} · do ${dataKontraktu(z.kontraktDo)}`;
}

// Skład kadry: 2 BR, 6 OBR, 6 POM, 4 NAP = 18
export const KADRA: Pozycja[] = ["BR", "BR", "OBR", "OBR", "OBR", "OBR", "OBR", "OBR", "POM", "POM", "POM", "POM", "POM", "POM", "NAP", "NAP", "NAP", "NAP"];

function nazwaWylosowana(zajete: Set<string>): { nazwa: string; skrot: string; miasto: string } {
  // Najpierw nieużyte miejscowości, potem ta sama miejscowość z innym klubem (np. drugi klub we wsi).
  for (let i = 0; i < 400; i++) {
    const miasto = wybierz(MIEJSCOWOSCI);
    const nazwa = `${wybierz(PRZEDROSTKI)} ${wybierz(MIANA)} ${miasto}`;
    if (i < 200 ? zajete.has(miasto) : zajete.has(nazwa)) continue;
    zajete.add(miasto);
    zajete.add(nazwa);
    return { nazwa, skrot: miasto.replace(/[^A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]/g, "").slice(0, 3).toUpperCase(), miasto };
  }
  const miasto = wybierz(MIEJSCOWOSCI);
  return { nazwa: `LKS ${miasto} ${zajete.size}`, skrot: "LKS", miasto };
}

export const PAUZA = "PAUZA";

export function terminarz(kluby: string[]): [string, string][][] {
  // Metoda kołowa: każdy z każdym, mecz i rewanż. Nieparzysta liczba drużyn → co kolejkę ktoś pauzuje.
  const t = tasuj(kluby.length % 2 ? [...kluby, PAUZA] : kluby);
  const n = t.length;
  const runda: [string, string][][] = [];
  const lista = [...t];
  for (let r = 0; r < n - 1; r++) {
    const pary: [string, string][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = lista[i];
      const b = lista[n - 1 - i];
      pary.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    runda.push(pary);
    lista.splice(1, 0, lista.pop()!);
  }
  const rewanze = runda.map((pary) => pary.map(([a, b]) => [b, a] as [string, string]));
  return [...runda, ...rewanze].map((pary) => pary.filter(([a, b]) => a !== PAUZA && b !== PAUZA));
}

/** Domyślna ścieżka (gdy brak danych regionu): prawdziwe kluby z KLUBY_PRAWDZIWE, reszta losowana. */
export const SCIEZKA_DOMYSLNA: Sciezka = {
  id: "domyslna",
  nazwa: "Losowy region",
  ligi: LIGI_NAZWY.map((nazwa, i) => ({ nazwa, kluby: KLUBY_PRAWDZIWE[i + 1] ?? [], rozmiar: ROZMIAR_LIGI[i] })),
};

export function nowaGra(trener: string, sciezka: Sciezka = SCIEZKA_DOMYSLNA): StanGry {
  const s: StanGry = {
    wersja: 1,
    trener,
    sciezka: sciezka.nazwa,
    wymiana: wymianaSciezki(sciezka),
    sezon: 2026,
    kolejka: 0,
    mojKlub: "",
    kluby: {},
    zawodnicy: {},
    ligi: [],
    wolni: [],
    taktyka: { formacja: "4-4-2", nastawienie: "zrownowazone", sklad: [], auto: true },
    niedostepni: {},
    zarzad: 60,
    cel: "",
    wiadomosci: [],
    oferty: [],
    historia: [],
    zwolniony: false,
    licznikId: 0,
    koniecSezonu: false,
    puchar: null,
    trening: "ogolny",
    kapitan: null,
    sponsorzy: [],
  };
  const zajete = new Set<string>();
  for (let poziom = 1; poziom <= sciezka.ligi.length; poziom++) {
    const dane = sciezka.ligi[poziom - 1];
    const prawdziwe = dane?.kluby ?? [];
    const ile = prawdziwe.length >= 6 ? prawdziwe.length : (dane?.rozmiar ?? ROZMIAR_LIGI[poziom - 1]);
    const ids: string[] = [];
    for (let i = 0; i < ile; i++) {
      const dane = prawdziwe[i] ?? nazwaWylosowana(zajete);
      const klub: Klub = {
        id: noweId(s, "k"),
        nazwa: dane.nazwa,
        skrot: dane.skrot,
        miasto: dane.miasto,
        poziom,
        renoma: Math.max(0.12, Math.min(1, (RENOMA_POZIOM[Math.min(poziom - 1, RENOMA_POZIOM.length - 1)] ?? 0.3) + (RENOMA_BONUS[dane.nazwa] ?? 0) + los(-0.05, 0.05))),
        kasa: Math.round(KASA_START[poziom - 1] * los(0.6, 1.5)),
        zawodnicy: [],
        prawdziwy: i < prawdziwe.length,
        herb: prawdziwe[i]?.herb,
        ...generujStadion(dane.miasto, poziom, 0),
        adres: "",
        obiekty: { gastronomia: 0, parking: 0, sklep: 0 },
        zalozony: rokZalozenia(dane.nazwa),
      };
      Object.assign(klub, generujStadion(klub.miasto, poziom, klub.renoma));
      klub.adres = `ul. Sportowa ${losInt(1, 40)}, ${klub.miasto}`;
      // Prawdziwe dane obiektu/adresu (jeśli podane w KlubDane) wygrywają z generowanymi.
      if (prawdziwe[i]?.stadion) klub.stadion = prawdziwe[i]!.stadion!;
      if (prawdziwe[i]?.adres) klub.adres = prawdziwe[i]!.adres!;
      const pj = pojemnoscKlubu(dane.nazwa);
      if (pj) klub.pojemnosc = pj;
      // Budżet startowy wg RANGI (renoma względem poziomu) i POJEMNOŚCI stadionu (względem typowej dla ligi).
      {
        const bazaR = RENOMA_POZIOM[Math.min(poziom - 1, RENOMA_POZIOM.length - 1)] ?? 0.3;
        const [pa, pb] = POJEMNOSC[Math.min(poziom, POJEMNOSC.length) - 1];
        const typowa = pa + (pb - pa) * bazaR;
        const rangaMult = Math.max(0.5, Math.min(1.9, klub.renoma / bazaR));
        const pojMult = Math.max(0.85, Math.min(1.35, klub.pojemnosc / typowa));
        klub.kasa = Math.round((KASA_START[poziom - 1] * los(0.75, 1.25) * rangaMult * pojMult) / 100) * 100;
      }
      // Rodzaj murawy wg szczebla: Ekstraklasa/I liga — podgrzewana; II–III liga — naturalna; IV liga i niżej — często sztuczna (gra zimą).
      klub.murawa = poziom <= 2 ? "podgrzewana" : poziom <= 4 ? "naturalna" : szansa(0.7) ? "sztuczna" : "naturalna";
      przypiszTrenera(s, klub);
      obsadzSztabKlubu(s, klub);
      s.kluby[klub.id] = klub;
      ids.push(klub.id);
      // Mocniejsze kluby (wysoka renoma) mają trochę lepszych piłkarzy.
      const premia = (klub.renoma - 0.55) * 8;
      // Prawdziwe nazwiska tylko dla zawodowców (poziom 1–3: Ekstraklasa, 1. i 2. liga);
      // III liga → klasa B mają zawodników w pełni generowanych (amatorzy = bez danych osobowych). Atrybuty zawsze generowane.
      const dodajZaw = (poz: Pozycja, imie?: string, nazw?: string) => {
        const z = nowyZawodnik(s, poziom, poz); // nowyZawodnik nadaje konkretną pozycję szczegółową (pozS) w obrębie kategorii
        rozwinAtrybuty(z, premia);
        z.potencjal = Math.max(z.potencjal, z.umiej);
        z.pensja = pensjaDla(z.umiej, poziom);
        z.klubId = klub.id;
        if (imie !== undefined) z.imie = imie;
        if (nazw !== undefined) z.nazwisko = nazw;
        z.kariera = generujKariere(s, z, klub.nazwa);
        klub.zawodnicy.push(z.id);
      };
      const pelny = (poziom <= 3 && ROSTERY_PELNE[klub.nazwa]) || null;
      const rosterP = (poziom <= 3 && klub.herb && ROSTERY_POZ[klub.herb]) || null;
      if (pelny && pelny.length >= 11) {
        // PEŁNY REALNY SKŁAD: imię, nazwisko, konkretna pozycja, data urodzenia (→ wiek), oryginalny numer,
        // narodowość, lepsza noga, wzrost, koniec kontraktu. Siła zależy od realnej wartości rynkowej względem ligi.
        const wartosci = pelny.map((w) => w[8]).filter((v) => v > 0).sort((a, b) => a - b);
        const mediana = wartosci.length ? wartosci[Math.floor(wartosci.length / 2)] : 0;
        for (const [imie, nazw, pozS, dataUr, numer, kraj, noga, kDo, wart, wzrost] of pelny) {
          const kat = KAT_POZ[pozS];
          const wiek = dataUr ? wiekNaStartSezonu(dataUr, s.sezon) : undefined;
          const z = nowyZawodnik(s, poziom, kat, { wiek: wiek !== undefined ? Math.max(15, wiek) : undefined });
          z.pozS = pozS;
          z.realny = true;
          z.imie = imie;
          z.nazwisko = nazw;
          if (dataUr) z.dataUr = dataUr;
          if (kraj) z.kraj = kraj; else delete z.kraj;
          if (noga) z.noga = noga;
          if (wzrost) z.wzrost = wzrost;
          if (wart) z.wartoscReal = wart;
          if (numer > 0) z.numer = numer;
          if (kDo >= s.sezon) z.kontraktDo = kDo;
          // OVR wg realnej wyceny: percentyl wartości wśród wszystkich prawdziwych zawodników tej ligi
          // (gwiazdy ligi u góry, rezerwowi i juniorzy bez wyceny u dołu) + lekki wpływ renomy klubu + mały szum.
          const [ua, ub] = zakresUmiej(poziom);
          const p = wart > 0 ? percentylWartosci(poziom, wart) : Math.max(0, 0.12 - (z.wiek <= 19 ? 0.08 : 0));
          let cel = ua - 3 + (ub - ua + 6) * p + premia * 0.4 + los(-1.5, 1.5);
          // Wycena młodych to w dużej mierze potencjał — obecny OVR niższy, zapas idzie w potencjał.
          const mlodyMinus = z.wiek <= 21 ? (22 - z.wiek) * 1.6 : 0;
          cel -= mlodyMinus;
          z.potencjal = Math.min(93, Math.max(cel + (z.wiek <= 21 ? mlodyMinus + los(1, 6) : z.wiek <= 25 ? los(0, 4) : 0), cel));
          const d = cel - z.umiej;
          rozwinAtrybuty(z, d);
          z.potencjal = Math.max(z.potencjal, z.umiej);
          z.pensja = pensjaDla(z.umiej, poziom);
          if (z.klauzula) z.klauzula = Math.max(10000, Math.round((wartosc(z) * los(1.5, 2.8)) / 1000) * 1000);
          z.klubId = klub.id;
          z.kariera = karieraRealna(s, imie, nazw, dataUr, klub.nazwa) ?? [{ klub: klub.nazwa, od: s.sezon, do: null, mecze: 0, gole: 0 }];
          { // prawdziwe występy w reprezentacjach (seniorskiej i młodzieżowych) — z tych samych źródeł co kariera
            const kd = (KADRY_REALNE as unknown as Record<string, { druzyna: string; od?: number | null; do?: number | null; mecze: number; gole?: number }[]>)[`${imie} ${nazw}|${dataUr ?? ""}`];
            if (kd?.length) {
              z.kadry = kd.map((x) => ({ druzyna: x.druzyna, od: x.od ?? undefined, do: x.do ?? null, mecze: x.mecze, gole: x.gole ?? 0 }));
              const sen = kd.filter((x) => !/U-?\d|olimp|B$/i.test(x.druzyna));
              if (sen.length) { const g = sen[sen.length - 1]; z.kadraStat = { kraj: g.druzyna, mecze: sen.reduce((a, x) => a + x.mecze, 0), gole: sen.reduce((a, x) => a + (x.gole ?? 0), 0), ...(g.od ? { debiut: String(Math.min(...sen.map((x) => x.od ?? 9999))) } : {}) }; }
            }
          }
          klub.zawodnicy.push(z.id);
        }
        const ileP = (p: Pozycja) => klub.zawodnicy.filter((id) => s.zawodnicy[id].poz === p).length;
        for (const [p, minN] of [["BR", 2], ["OBR", 5], ["POM", 5], ["NAP", 2]] as [Pozycja, number][]) {
          while (ileP(p) < minN) dodajZaw(p);
        }
      } else if (rosterP && rosterP.length >= 11) {
        // Realny skład z prawdziwymi pozycjami (kategoria z danych, pozycja szczegółowa dobrana w jej obrębie).
        for (const [imie, nazw, poz] of rosterP) dodajZaw(poz, imie, nazw);
        // Dopełnij brakujące kategorie do minimum rozgrywkowego (gdyby źródło miało wąski skład).
        const ileP = (p: Pozycja) => klub.zawodnicy.filter((id) => s.zawodnicy[id].poz === p).length;
        for (const [p, minN] of [["BR", 2], ["OBR", 6], ["POM", 6], ["NAP", 3]] as [Pozycja, number][]) {
          while (ileP(p) < minN) dodajZaw(p);
        }
      } else {
        // Brak danych o pozycjach → stary tor: nazwiska (jeśli są) na szablon KADRA.
        const roster = (poziom <= 3 && klub.herb && ROSTERY[klub.herb]) || [];
        let ri = 0;
        for (const poz of KADRA) { dodajZaw(poz, roster[ri]?.[0], roster[ri]?.[1]); if (ri < roster.length) ri++; }
      }
      nadajNumery(s, klub);
    }
    const liga: Liga = { poziom, nazwa: dane?.nazwa ?? LIGI_NAZWY[poziom - 1], kluby: ids, terminarz: terminarz(ids), wyniki: [] };
    s.ligi.push(liga);
  }
  uzupelnijWolnych(s);
  polaczRezerwy(s);
  odswiezRynekSztabu(s); // rynek wolnych specjalistów sztabu (bez klubu) na start
  generujPuleSedziow(s); // kadra sędziowska: realni centralni + generowani regionalni (wg PZPN)
  return s;
}

/** Łączy zespoły rezerw („X II") z pierwszym zespołem („X") w wyższej lidze tego świata (przepisy PZPN). */
export function polaczRezerwy(s: StanGry) {
  const poNazwie = new Map<string, Klub[]>();
  for (const k of Object.values(s.kluby)) {
    const bez = k.nazwa.replace(/\s+(II|III|2)\b/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    if (!poNazwie.has(bez)) poNazwie.set(bez, []);
    poNazwie.get(bez)!.push(k);
  }
  for (const k of Object.values(s.kluby)) {
    const jestRezerwa = /\s+(II|III|2)\b/.test(k.nazwa);
    if (!jestRezerwa) continue;
    const bez = k.nazwa.replace(/\s+(II|III|2)\b/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    // pierwszy zespół = ten sam rdzeń nazwy, wyższa liga (niższy numer poziomu)
    const glowny = (poNazwie.get(bez) || []).filter((x) => x.id !== k.id && x.poziom < k.poziom).sort((a, b) => a.poziom - b.poziom)[0];
    if (glowny) {
      k.rezerwaDla = glowny.id;
      glowny.rezerwaId = k.id;
    }
  }
}

// ——— Przepisy PZPN: młodzieżowiec ———
/** Młodzieżowiec w sezonie 2026/27 = rocznik 2006 i młodsi (wiek ≤ 20 na starcie sezonu) — uchwała PZPN VI/78 art. 5 ust. 4
 *  i regulaminy wszystkich 6 ZPN. Musi przebywać na boisku przez cały mecz (zmiana tylko na innego młodzieżowca). */
export const WIEK_MLODZIEZOWCA = 20;
export function jestMlodziezowcem(z: Zawodnik): boolean {
  return z.wiek <= WIEK_MLODZIEZOWCA;
}
/** Czy zawodnik spełnia wymóg młodzieżowca na danym szczeblu (1. Liga i ZZPN — tylko obywatele polscy). */
export function liczySieJakoMlodziezowiec(z: Zawodnik, poziom: number, sciezka?: string): boolean {
  if (!jestMlodziezowcem(z)) return false;
  const polak = !z.kraj || z.kraj === "Polska";
  if (poziom === 2 && !polak) return false;
  if (poziom >= 5 && zpnSciezki(sciezka).mlodziezowiecPolak && !polak) return false;
  return true;
}
/** Wymagana liczba młodzieżowców na boisku (2026/27): Ekstraklasa 0 (program „Młodzieżowiec 2.0” — tylko nagrody),
 *  Betclic 1. Liga 1, 2. i 3. Liga 2 (uchwała PZPN VI/78); IV liga i niżej — wg regulaminu właściwego ZPN. */
export function wymogMlodziezowca(poziom: number, sciezka?: string, nazwaLigi = ""): number {
  if (poziom <= 1) return 0;
  if (poziom === 2) return 1;
  if (poziom <= 4) return 2;
  return zpnSciezki(sciezka).mlodziezowcy[szczebelRegionalny(nazwaLigi, poziom)];
}

export function uzupelnijWolnych(s: StanGry) {
  // Pula zawodników bez klubu (do podpisania za darmo), z dolnych poziomów.
  s.wolni = s.wolni.filter((id) => s.zawodnicy[id] && !s.zawodnicy[id].klubId);
  // Trzymaj najwyżej 120 (najlepszych); resztę usuń z gry, żeby zapis nie puchł.
  if (s.wolni.length > 120) {
    s.wolni.sort((a, b) => s.zawodnicy[b].umiej - s.zawodnicy[a].umiej);
    for (const id of s.wolni.slice(120)) delete s.zawodnicy[id];
    s.wolni = s.wolni.slice(0, 120);
  }
  while (s.wolni.length < 60) {
    const poziom = losInt(3, s.ligi.length);
    const z = nowyZawodnik(s, poziom, wybierz(KADRA));
    rozwinAtrybuty(z, -los(1, 5));
    z.pensja = pensjaDla(z.umiej, poziom);
    s.wolni.push(z.id);
  }
}

export function ligaKlubu(s: StanGry, klubId: string): Liga {
  return s.ligi[s.kluby[klubId].poziom - 1];
}

export function celSezonu(s: StanGry, klubId: string): string {
  // Zarząd ocenia klub wg jego RANGI = siła składu + renoma (status/historia), nie tylko bieżący skład.
  // Dzięki temu spadkowicz z Ekstraklasy dostaje „Awans", a amator „Utrzymanie", nawet przy zbliżonej sile.
  const liga = ligaKlubu(s, klubId);
  const prestiz = (id: string) => silaKlubu(s, id) + (s.kluby[id]?.renoma ?? 0.3) * 15;
  const ranking = liga.kluby.slice().sort((a, b) => prestiz(b) - prestiz(a));
  const miejsce = ranking.indexOf(klubId) + 1;
  const n = ranking.length;
  if (miejsce <= 3) return "Awans";
  if (miejsce <= n / 2) return "Górna połowa tabeli";
  return "Utrzymanie";
}

export function silaKlubu(s: StanGry, klubId: string): number {
  const zs = s.kluby[klubId].zawodnicy.map((id) => s.zawodnicy[id].umiej).sort((a, b) => b - a).slice(0, 11);
  return zs.reduce((a, b) => a + b, 0) / Math.max(1, zs.length);
}

export interface WierszTabeli {
  klubId: string;
  m: number;
  w: number;
  r: number;
  p: number;
  bz: number;
  bs: number;
  pkt: number;
  forma: string[];
}

export function tabelaLigi(s: StanGry, liga: Liga): WierszTabeli[] {
  const t: Record<string, WierszTabeli> = {};
  for (const id of liga.kluby) t[id] = { klubId: id, m: 0, w: 0, r: 0, p: 0, bz: 0, bs: 0, pkt: 0, forma: [] };
  for (const kolejka of liga.wyniki) {
    for (const w of kolejka) {
      const d = t[w.dom];
      const g = t[w.gosc];
      if (!d || !g) continue;
      d.m++; g.m++;
      d.bz += w.gd; d.bs += w.gg; g.bz += w.gg; g.bs += w.gd;
      if (w.gd > w.gg) { d.w++; g.p++; d.pkt += 3; d.forma.push("Z"); g.forma.push("P"); }
      else if (w.gd < w.gg) { g.w++; d.p++; g.pkt += 3; g.forma.push("Z"); d.forma.push("P"); }
      else { d.r++; g.r++; d.pkt++; g.pkt++; d.forma.push("R"); g.forma.push("R"); }
    }
  }
  // Kara punktowa PZPN (zadłużenie/licencja) — odejmowana od dorobku, punkty nie schodzą poniżej 0.
  for (const id of liga.kluby) { const kp = s.kluby[id]?.karaPunktowa ?? 0; if (kp && t[id]) t[id].pkt = Math.max(0, t[id].pkt - kp); }
  return Object.values(t).sort(
    (a, b) => b.pkt - a.pkt || b.bz - b.bs - (a.bz - a.bs) || b.bz - a.bz || s.kluby[a.klubId].nazwa.localeCompare(s.kluby[b.klubId].nazwa),
  );
}

// Zgłoszenie drużyny do rozgrywek (#133): opłata wpisowa (ryczałt za udział) wg szczebla, termin płatności,
// skutki braku wpłaty i wycofania drużyny (przed sezonem i w trakcie).
//
// Realia:
// • Kluby zgłaszają drużyny do rozgrywek prowadzonych przez wojewódzki ZPN (IV liga i niżej) lub PZPN (III liga wzwyż)
//   i wnoszą opłatę za udział. Przykładowe stawki z tabel opłat ZPN 2025/26 (Małopolski i Śląski ZPN):
//   klasa okręgowa 1000 zł, klasa A 650 zł, klasa B 300 zł. Stawki wyższych szczebli i klasy C — SZACUNEK GRY
//   (realnie różne w każdym związku, na szczeblu centralnym dochodzą opłaty licencyjne).
// • Wycofanie drużyny w trakcie rozgrywek (typowy zapis regulaminów ZPN, np. Lubuski ZPN): gdy rozegrała mniej niż 50%
//   spotkań — wyniki z jej udziałem się anuluje; przy co najmniej połowie — w pozostałych meczach walkowery dla rywali.
//   Drużyna wycofana traci prawo gry w tej klasie (regulaminy różnią się: przesunięcie niżej / brak udziału w następnej edycji).
//
// UPROSZCZENIA GRY:
// • termin płatności = przed 1. kolejką; brak wpłaty → wezwanie ZPN z karą +25% i dodatkowym terminem (3. kolejka);
//   dalej brak → skreślenie drużyny z rozgrywek (= wycofanie);
// • drużyna wycofana zostaje ostatnia w tabeli (kara punktowa) → spada o jedną klasę przy zwykłych spadkach;
// • kara finansowa za wycofanie: 2× opłata wpisowa (szacunek);
// • wycofanie klubu AI w trakcie sezonu: rzadkie zdarzenie w V lidze i niżej, nie w lidze Twojej drużyny
//   (Twój terminarz pozostaje nienaruszony).
import { obsadaCentralna, szczebelPoziomu, NAZWA_SZCZEBLA, type Szczebel } from "./obsadaSedziowska";
import { szansa, wybierz, zl } from "./losuj";
import type { StanGry } from "./types";

export interface WycofanieDruzyny { klubId: string; poziom: number; kolejka: number; anulowane: boolean; powod: string }
export interface WalkowerZaplanowany { poziom: number; runda: number; dom: string; gosc: string; wycofany: string }
export interface StanZgloszenia {
  sezon: number; klubId: string; szczebel: Szczebel; organ: string;
  oplata: number; zaplacono: boolean; kara: number;
  termin: number; // indeks kolejki, przed którą trzeba zapłacić
  wezwanie?: boolean; // wysłano wezwanie do zapłaty (dodatkowy termin)
  autoPlatnosc: boolean; // sekretarz klubu płaci sam w terminie (jeśli jest kasa)
  wycofania: WycofanieDruzyny[]; walkowery: WalkowerZaplanowany[];
}
/** Pole stanu gry (do dodania w StanGry: `zgloszenie?: import("./zgloszenie").StanZgloszenia`). */
type SZ = StanGry & { zgloszenie?: StanZgloszenia };
export const zgloszenieStan = (s: StanGry) => (s as SZ).zgloszenie;
const wiad = (s: StanGry, t: string) => { s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: t }); s.wiadomosci = s.wiadomosci.slice(0, 60); };

export const OPLATA_WPISOWA: Record<Szczebel, number> = {
  ekstraklasa: 60000, "1liga": 30000, "2liga": 15000, "3liga": 6000, // szacunek gry (szczebel centralny)
  "4liga": 2500, "5liga": 1500, // szacunek gry
  okregowa: 1000, A: 650, B: 300, // tabele opłat ZPN 2025/26 (MZPN, ŚlZPN)
  C: 200, // szacunek gry
};
function organ(s: StanGry, sz: Szczebel): string {
  if (obsadaCentralna(sz)) return "PZPN (szczebel centralny)";
  const sc = s.sciezka ?? "";
  return /^Pomorskie/.test(sc) ? "Pomorski ZPN" : /^Zachodnio/.test(sc) ? "Zachodniopomorski ZPN" : /^Kujawsko/.test(sc) ? "Kujawsko-Pomorski ZPN" : "Małopolski ZPN";
}

/** Zgłoszenie na bieżący sezon (tworzone leniwie: nowy sezon / nowy klub). */
export function zgloszenie(s: StanGry): StanZgloszenia | undefined {
  const sx = s as SZ; const k = s.kluby[s.mojKlub];
  if (!k) return undefined;
  if (!sx.zgloszenie || sx.zgloszenie.sezon !== s.sezon || sx.zgloszenie.klubId !== s.mojKlub) {
    const sz = szczebelPoziomu(s, k.poziom);
    const nowa = !sx.zgloszenie || sx.zgloszenie.klubId !== s.mojKlub;
    sx.zgloszenie = {
      sezon: s.sezon, klubId: s.mojKlub, szczebel: sz, organ: organ(s, sz), oplata: OPLATA_WPISOWA[sz],
      // start kariery w trakcie przygotowań: drużyna już zgłoszona przez poprzedni zarząd
      zaplacono: nowa && s.kolejka > 0, kara: 0, termin: 0, autoPlatnosc: sx.zgloszenie?.autoPlatnosc ?? true,
      wycofania: [], walkowery: [],
    };
  }
  return sx.zgloszenie;
}

export function zaplacWpisowe(s: StanGry): string {
  const z = zgloszenie(s); const k = s.kluby[s.mojKlub];
  if (!z || !k) return "Brak klubu.";
  if (z.zaplacono) return "Opłata już uiszczona.";
  if (z.wycofania.some((w) => w.klubId === s.mojKlub)) return "Drużyna została wycofana z rozgrywek.";
  const kwota = z.oplata + z.kara;
  k.kasa -= kwota; z.zaplacono = true;
  return `✅ Wpłacono ${zl(kwota)} na konto ${z.organ} — drużyna zgłoszona do rozgrywek (${NAZWA_SZCZEBLA[z.szczebel]}).`;
}

/** Hak przed kolejką (Twoja drużyna): termin płatności, wezwanie, skreślenie. */
export function zgloszeniePrzedKolejka(s: StanGry) {
  const z = zgloszenie(s); const k = s.kluby[s.mojKlub];
  if (!z || !k || z.zaplacono || z.wycofania.some((w) => w.klubId === s.mojKlub)) return;
  if (s.kolejka < z.termin) return;
  if (z.autoPlatnosc && k.kasa >= z.oplata + z.kara) { wiad(s, zaplacWpisowe(s).replace("✅ Wpłacono", "✅ Sekretarz klubu wpłacił")); return; }
  if (!z.wezwanie) {
    z.wezwanie = true; z.kara = Math.round(z.oplata * 0.25); z.termin = Math.max(s.kolejka + 2, 2);
    wiad(s, `⚠️ ${z.organ}: brak opłaty za udział w rozgrywkach (${zl(z.oplata)}). Wezwanie do zapłaty z karą porządkową ${zl(z.kara)} — dodatkowy termin: przed ${z.termin + 1}. kolejką. Bez wpłaty drużyna zostanie skreślona z rozgrywek.`);
    return;
  }
  wycofajDruzyne(s, s.mojKlub, "skreślona przez związek za nieuiszczenie opłaty za udział w rozgrywkach");
}

const ligaKlubu = (s: StanGry, id: string) => s.ligi.find((l) => l.kluby.includes(id));

/** Wycofanie (lub skreślenie) drużyny z rozgrywek w bieżącym sezonie. Zwraca opis skutków. */
export function wycofajDruzyne(s: StanGry, klubId: string, powod: string): string {
  const z = zgloszenie(s); const k = s.kluby[klubId]; const liga = ligaKlubu(s, klubId);
  if (!z || !k || !liga) return "Nie można wycofać drużyny.";
  if (z.wycofania.some((w) => w.klubId === klubId)) return "Drużyna już wycofana.";
  const r = s.kolejka;
  const gra = (i: number) => liga.terminarz[i]?.some(([a, b]) => a === klubId || b === klubId);
  let wszystkie = 0, rozegrane = 0;
  for (let i = 0; i < liga.terminarz.length; i++) if (gra(i)) { wszystkie++; if (i < r) rozegrane++; }
  const anulowane = rozegrane < wszystkie / 2;
  if (anulowane) for (let i = 0; i < r && i < liga.wyniki.length; i++) liga.wyniki[i] = (liga.wyniki[i] ?? []).filter((w) => w.dom !== klubId && w.gosc !== klubId);
  for (let i = r; i < liga.terminarz.length; i++) {
    const pary = liga.terminarz[i];
    for (const [dom, gosc] of pary) if ((dom === klubId || gosc === klubId) && !anulowane) z.walkowery.push({ poziom: liga.poziom, runda: i, dom, gosc, wycofany: klubId });
    liga.terminarz[i] = pary.filter(([a, b]) => a !== klubId && b !== klubId);
  }
  k.karaPunktowa = (k.karaPunktowa ?? 0) + 999; // ostatnie miejsce → spadek (model gry)
  const kara = OPLATA_WPISOWA[szczebelPoziomu(s, liga.poziom)] * 2;
  k.kasa -= kara;
  z.wycofania.push({ klubId, poziom: liga.poziom, kolejka: r, anulowane, powod });
  const skutek = anulowane
    ? `rozegrała ${rozegrane}/${wszystkie} meczów (< 50%) — wszystkie wyniki z jej udziałem anulowano`
    : `rozegrała ${rozegrane}/${wszystkie} meczów (≥ 50%) — w pozostałych spotkaniach walkowery 3:0 dla rywali`;
  const tekst = `🚫 ${k.nazwa} wycofany z rozgrywek ${liga.nazwa} (${powod}): drużyna ${skutek}. Zajmie ostatnie miejsce i spadnie; kara ${zl(kara)}.`;
  if (klubId === s.mojKlub) {
    s.zarzad = Math.max(0, s.zarzad - 30);
    s.zaufanieKibicow = Math.max(0, (s.zaufanieKibicow ?? 60) - 25);
    s.taktyka.sklad = s.taktyka.sklad.slice(0, 11);
  }
  wiad(s, tekst);
  return tekst;
}
/** Decyzja gracza: wycofanie własnej drużyny (UI pyta o potwierdzenie). */
export const wycofajMojaDruzyne = (s: StanGry) => wycofajDruzyne(s, s.mojKlub, "decyzja zarządu klubu");

/** Hak po rozegranej kolejce (wołany na końcu zagrajKolejke, gdy s.kolejka już wskazuje następną):
 *  walkowery za wycofane drużyny + rzadkie wycofanie klubu AI w niższych ligach. */
export function zgloszeniePoKolejce(s: StanGry) {
  const z = zgloszenie(s); if (!z) return;
  const r = s.kolejka - 1;
  if (z.walkowery.length) {
    for (const w of z.walkowery.filter((x) => x.runda === r)) {
      const liga = s.ligi[w.poziom - 1]; if (!liga) continue;
      const domWyc = w.dom === w.wycofany;
      (liga.wyniki[r] ??= []).push({ dom: w.dom, gosc: w.gosc, gd: domWyc ? 0 : 3, gg: domWyc ? 3 : 0 });
    }
    z.walkowery = z.walkowery.filter((x) => x.runda > r);
  }
  // Rzadkie zdarzenie: wycofanie klubu AI w trakcie sezonu (V liga i niżej, nie Twoja liga, max 1 na sezon).
  if (z.wycofania.some((w) => w.klubId !== s.mojKlub)) return;
  const mojPoziom = s.kluby[s.mojKlub]?.poziom;
  if (!szansa(0.006)) return;
  const kand = s.ligi.filter((l) => l.poziom !== mojPoziom && l.poziom >= 5 && ["5liga", "okregowa", "A", "B", "C"].includes(szczebelPoziomu(s, l.poziom)) && r >= 2 && r < l.terminarz.length - 3);
  if (!kand.length) return;
  const liga = wybierz(kand);
  const ids = liga.kluby.filter((id) => !s.kluby[id]?.rezerwaDla && !s.kluby[id]?.rezerwaId);
  if (!ids.length) return;
  const id = ids.reduce((a, b) => ((s.kluby[a].kasa ?? 0) <= (s.kluby[b].kasa ?? 0) ? a : b)); // najbiedniejszy
  wycofajDruzyne(s, id, wybierz(["brak środków na dalszy udział", "rozpad drużyny — za mało zawodników", "brak boiska (obiekt wyłączony z użytku)", "decyzja zarządu stowarzyszenia"]));
}

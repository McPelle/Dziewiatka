// Sklep klubowy: własna kolekcja szalika i koszulki meczowej (replika z nazwiskiem zawodnika).
// Trener/prezes projektuje szalik (kolory, wzór, napis) i koszulkę (kolory, wzór), ustala ceny,
// a sprzedaż w każdej kolejce zależy od: wyników (forma), popularności klubu i bazy kibiców (renoma, zaufanie, szczebel),
// gwiazd kadry (strzelcy, reprezentanci, kapitan), wygranych derbów, awansu/mistrzostwa, ceny i poziomu obiektu „sklep".
// Przychód netto (sprzedaż − koszt produkcji) trafia do kasy klubu (k.kasa).
//
// Uwaga o podwójnym liczeniu: istniejący przychodObiektow (sezon.ts) liczy drobne pamiątki sprzedawane
// w dniu meczu z poziomu obiektu „sklep" (×0,8 zł/widza). Ten moduł to OSOBNA linia produktów (własny szalik
// i koszulki z nazwiskami — sprzedaż cały tydzień: stoisko, sklep, internet), więc niczego tamtego nie dubluje.
// Poziom obiektu „sklep" działa tu tylko jako mnożnik zasięgu sprzedaży.
//
// Stan w polu StanGry.sklepKlubowy (do dodania w types.ts; tu lokalny typ + rzutowanie).
import { barwyKlubu } from "../data/barwy";
import { jestDerby } from "./derby";
import { WIDZOWIE } from "./swiat";
import type { StanGry, Zawodnik } from "./types";

export type WzorSzalika = "gladki" | "pasy" | "szachownica" | "polszalik" | "bloki" | "jodelka";
export type WzorKoszulki = "jednolity" | "pasy" | "rekaw" | "szachownica" | "polowki" | "szarfa";

export const WZORY_SZALIKA: { id: WzorSzalika; nazwa: string; mn: number }[] = [
  { id: "pasy", nazwa: "Pasy", mn: 1.06 },
  { id: "gladki", nazwa: "Gładki", mn: 0.95 },
  { id: "szachownica", nazwa: "Szachownica", mn: 1.0 },
  { id: "polszalik", nazwa: "Półszalik", mn: 1.03 },
  { id: "bloki", nazwa: "Bloki (klasyk)", mn: 1.04 },
  { id: "jodelka", nazwa: "Jodełka", mn: 1.0 },
];
export const WZORY_KOSZULKI: { id: WzorKoszulki; nazwa: string; mn: number }[] = [
  { id: "jednolity", nazwa: "Jednolita", mn: 1.0 },
  { id: "pasy", nazwa: "Pasy pionowe", mn: 1.05 },
  { id: "rekaw", nazwa: "Kontrastowe rękawy", mn: 1.02 },
  { id: "szachownica", nazwa: "Szachownica", mn: 0.96 },
  { id: "polowki", nazwa: "Połówki", mn: 0.98 },
  { id: "szarfa", nazwa: "Szarfa (ukośny pas)", mn: 1.03 },
];

export interface ProjektSzalika { kolor1: string; kolor2: string; kolor3?: string; wzor: WzorSzalika; napis: string; cena: number }
export interface ProjektKoszulki { baza: string; dodatek: string; wzor: WzorKoszulki; cena: number }
export interface SezonSklepu {
  szaliki: number;
  koszulki: number;
  przychod: number; // sprzedaż brutto (zł)
  koszty: number; // koszt produkcji (zł)
  zawodnicy: Record<string, { n: string; szt: number }>; // koszulki z nazwiskiem: id → nazwisko + sztuki
}
export interface StanSklepu {
  otwarty: boolean; // sprzedaż własnej kolekcji uruchomiona
  szalik: ProjektSzalika;
  koszulka: ProjektKoszulki;
  sezony: Record<string, SezonSklepu>;
  ostatnio?: number; // sezon*100+kolejka ostatniej sprzedaży (ochrona przed podwójnym wywołaniem)
  ostatniTydzien?: { szaliki: number; koszulki: number; przychod: number; koszty: number; powody: string[] };
  nowoscSezon?: number; // sezon, w którym wprowadzono nową kolekcję (efekt nowości — raz na sezon)
  nowoscDo?: number; // sezon*100+kolejka, do której trwa efekt nowości
}

type StanZeSklepem = StanGry & { sklepKlubowy?: StanSklepu };

const idx = (poziom: number) => Math.max(0, Math.min(11, poziom - 1));
/** Cena „rynkowa" (referencyjna) wg szczebla — przy niej popyt = bazowy. */
const REF_SZALIK = [70, 55, 45, 40, 35, 32, 30, 28, 25, 25, 25, 25];
const REF_KOSZULKA = [320, 220, 170, 140, 120, 100, 90, 80, 70, 70, 70, 70];
/** Koszt produkcji sztuki — małe nakłady (niższe ligi) są droższe w przeliczeniu na sztukę. */
const NAKLAD = [1, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.4, 1.4];
const KOSZT_SZALIK = 14;
const KOSZT_KOSZULKA = 55;

export const cenaReferencyjna = (s: StanGry) => {
  const p = s.kluby[s.mojKlub].poziom;
  return { szalik: REF_SZALIK[idx(p)], koszulka: REF_KOSZULKA[idx(p)] };
};
export const kosztSztuki = (s: StanGry) => {
  const n = NAKLAD[idx(s.kluby[s.mojKlub].poziom)];
  return { szalik: Math.round(KOSZT_SZALIK * n), koszulka: Math.round(KOSZT_KOSZULKA * n) };
};
/** Opłata za nowy projekt (wzornik, matryce, próbna seria). */
export const kosztProjektu = (s: StanGry) => REF_SZALIK[idx(s.kluby[s.mojKlub].poziom)] * 10;

export function stanSklepu(s: StanGry): StanSklepu {
  const x = s as StanZeSklepem;
  if (!x.sklepKlubowy) {
    const k = s.kluby[s.mojKlub];
    const [a, b] = k.barwyWlasne ?? barwyKlubu(k.nazwa);
    const ref = cenaReferencyjna(s);
    x.sklepKlubowy = {
      otwarty: false,
      szalik: { kolor1: a, kolor2: b, wzor: "pasy", napis: k.nazwa.toUpperCase(), cena: ref.szalik },
      koszulka: { baza: a, dodatek: b, wzor: "jednolity", cena: ref.koszulka },
      sezony: {},
    };
  }
  x.sklepKlubowy.sezony ??= {};
  return x.sklepKlubowy;
}
export function sezonSklepu(s: StanGry, sezon = s.sezon): SezonSklepu {
  const st = stanSklepu(s);
  return (st.sezony[String(sezon)] ??= { szaliki: 0, koszulki: 0, przychod: 0, koszty: 0, zawodnicy: {} });
}

// ——— Projektowanie ———

/** Zapisuje projekt i (gdy zmieniony) pobiera opłatę za nowy projekt. Zwraca komunikat błędu albo null. */
export function zapiszProjekt(s: StanGry, szalik: ProjektSzalika, koszulka: ProjektKoszulki): string | null {
  const st = stanSklepu(s);
  const k = s.kluby[s.mojKlub];
  const ref = cenaReferencyjna(s);
  const zmianaWzoru = JSON.stringify({ ...st.szalik, cena: 0 }) !== JSON.stringify({ ...szalik, cena: 0 })
    || JSON.stringify({ ...st.koszulka, cena: 0 }) !== JSON.stringify({ ...koszulka, cena: 0 });
  const oplata = zmianaWzoru && st.otwarty ? kosztProjektu(s) : 0;
  if (oplata && k.kasa < oplata) return `Brakuje środków na nowy projekt (${oplata} zł).`;
  const napis = szalik.napis.trim().slice(0, 24);
  st.szalik = { ...szalik, napis, cena: Math.round(Math.max(ref.szalik * 0.3, Math.min(ref.szalik * 3, szalik.cena))) };
  st.koszulka = { ...koszulka, cena: Math.round(Math.max(ref.koszulka * 0.3, Math.min(ref.koszulka * 3, koszulka.cena))) };
  if (oplata) {
    k.kasa -= oplata;
    if (st.nowoscSezon !== s.sezon) { st.nowoscSezon = s.sezon; st.nowoscDo = s.sezon * 100 + s.kolejka + 4; }
  }
  return null;
}
/** Uruchamia/wstrzymuje sprzedaż. Pierwsze otwarcie = premiera kolekcji (efekt nowości). */
export function ustawSprzedaz(s: StanGry, otwarty: boolean): string | null {
  const st = stanSklepu(s);
  if (otwarty && !st.otwarty) {
    const k = s.kluby[s.mojKlub];
    const oplata = kosztProjektu(s);
    if (k.kasa < oplata) return `Brakuje środków na pierwszą serię (${oplata} zł).`;
    k.kasa -= oplata;
    if (st.nowoscSezon !== s.sezon) { st.nowoscSezon = s.sezon; st.nowoscDo = s.sezon * 100 + s.kolejka + 4; }
  }
  st.otwarty = otwarty;
  return null;
}

// ——— Popyt ———

const rgb = (hex: string) => { const h = hex.replace("#", ""); const v = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
const dist = (a: string, b: string) => { try { const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b); return Math.abs(r1 - r2) * 0.3 + Math.abs(g1 - g2) * 0.59 + Math.abs(b1 - b2) * 0.11; } catch { return 999; } };
const bliski = (c: string, barwy: string[]) => barwy.some((b) => dist(c, b) < 40);

/** Jak bardzo projekt „pasuje" kibicom: barwy klubowe + napis. */
export function ocenaProjektu(s: StanGry, szalik: ProjektSzalika, koszulka: ProjektKoszulki): { szalik: number; koszulka: number; uwagi: string[] } {
  const k = s.kluby[s.mojKlub];
  const barwy = [...(k.barwyWlasne ?? barwyKlubu(k.nazwa)), "#ffffff"];
  const uwagi: string[] = [];
  let ms = WZORY_SZALIKA.find((w) => w.id === szalik.wzor)?.mn ?? 1;
  const klubowe = [szalik.kolor1, szalik.kolor2].filter((c) => bliski(c, barwy)).length;
  if (klubowe === 2) { ms *= 1.15; uwagi.push("Szalik w barwach klubowych — kibice to kochają."); }
  else if (klubowe === 1) { ms *= 0.97; uwagi.push("Szalik tylko częściowo w barwach klubu."); }
  else { ms *= 0.8; uwagi.push("Szalik w obcych barwach — część kibiców go nie założy."); }
  const napis = szalik.napis.trim().toLowerCase();
  const swoje = [k.nazwa, k.miasto, k.skrot].map((x) => x.toLowerCase()).filter(Boolean);
  if (napis && swoje.some((x) => napis.includes(x) || x.includes(napis))) ms *= 1.12;
  else if (napis) { ms *= 1.04; uwagi.push("Napis bez nazwy klubu/miasta — mniej rozpoznawalny."); }
  else { ms *= 0.92; uwagi.push("Szalik bez napisu sprzedaje się słabiej."); }
  let mk = WZORY_KOSZULKI.find((w) => w.id === koszulka.wzor)?.mn ?? 1;
  const kk = [koszulka.baza, koszulka.dodatek].filter((c) => bliski(c, barwy)).length;
  if (kk === 2) mk *= 1.12; else if (kk === 1) mk *= 0.98; else { mk *= 0.78; uwagi.push("Koszulka w obcych barwach — słaba sprzedaż."); }
  return { szalik: ms, koszulka: mk, uwagi };
}

/** Popularność zawodnika jako „nazwisko na plecach" (waga udziału w sprzedaży koszulek). */
export function popularnoscZawodnika(s: StanGry, z: Zawodnik, srednia: number): number {
  let w = 1 + z.gole * 3 + z.asysty * 1.2 + z.czysteKonta * (z.poz === "BR" ? 1.5 : 0) + Math.max(0, z.umiej - srednia) * 0.35;
  if (s.kapitan === z.id) w += 4;
  if (z.reprezentant) w += 6;
  if (z.wychowanek) w += 2;
  w += Math.min(6, (z.meczeKariera ?? 0) / 60);
  w += Math.max(0, z.forma) * 0.6;
  if (z.kontuzja > 0) w *= 0.8;
  return w;
}

function formaKlubu(s: StanGry): { mn: number; ppg: number | null } {
  const ost = (s.archiwumMeczow ?? []).filter((m) => m.sezon === s.sezon).slice(-5);
  if (!ost.length) return { mn: 1, ppg: null };
  const pkt = ost.reduce((a, m) => a + (m.my > m.oni ? 3 : m.my === m.oni ? 1 : 0), 0) / ost.length;
  return { mn: 0.7 + pkt * 0.25, ppg: pkt };
}

/** Szacunek tygodniowego popytu (bez losowości). Używany przez UI (prognoza) i tydzienSklepu. */
export function popytTygodnia(s: StanGry, projekt?: { szalik: ProjektSzalika; koszulka: ProjektKoszulki }): { szaliki: number; koszulki: number; powody: string[]; fani: number } {
  const st = stanSklepu(s);
  const k = s.kluby[s.mojKlub];
  const sz = projekt?.szalik ?? st.szalik, ko = projekt?.koszulka ?? st.koszulka;
  const powody: string[] = [];
  // baza kibiców (szczebel × renoma × zaufanie)
  const fani = WIDZOWIE[idx(k.poziom)] * 2.2 * (0.6 + k.renoma * 0.8) * (0.5 + (s.zaufanieKibicow ?? 60) / 100);
  let mn = 1;
  const f = formaKlubu(s);
  mn *= f.mn;
  if (f.ppg != null && f.ppg >= 2.2) powody.push("świetna forma drużyny");
  if (f.ppg != null && f.ppg < 0.8) powody.push("słabe wyniki studzą zakupy");
  if ((k.seria ?? 0) >= 3) { mn *= 1.1; powody.push(`seria ${k.seria} zwycięstw`); }
  // sukcesy: awans / mistrzostwo w poprzednim sezonie, puchar
  const pop = s.historia.find((h) => h.sezon === s.sezon - 1);
  if (pop?.wynik === "mistrz") { mn *= 1.5; powody.push("efekt mistrzostwa"); }
  else if (pop?.wynik === "awans") { mn *= 1.35; powody.push("efekt awansu"); }
  else if (pop?.wynik === "spadek") { mn *= 0.85; powody.push("kac po spadku"); }
  if (pop?.puchar || s.puchar?.faza === "zdobyty") { mn *= 1.15; powody.push("puchar w gablocie"); }
  // obiekt „sklep" przy stadionie: 0 = tylko stoisko i internet
  const lv = k.obiekty.sklep ?? 0;
  mn *= lv === 0 ? 0.55 : 1 + lv * 0.3;
  // mecz u siebie w tej kolejce — ruch na stadionie
  const lg = s.ligi[k.poziom - 1];
  const para = lg?.terminarz[s.kolejka]?.find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
  if (para && para[0] === s.mojKlub) mn *= 1.25;
  if (para && jestDerby(s, para[0], para[1])) { mn *= 1.15; powody.push("tydzień derbowy"); }
  // nowość kolekcji
  if (st.nowoscDo && s.sezon * 100 + s.kolejka <= st.nowoscDo) { mn *= 1.3; powody.push("premiera nowej kolekcji"); }
  // gwiazdy: najlepszy strzelec / reprezentanci napędzają koszulki
  const kadra = k.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const maxGole = kadra.reduce((a, z) => Math.max(a, z.gole), 0);
  const repr = kadra.filter((z) => z.reprezentant).length;
  const mnGwiazd = 1 + Math.min(0.5, maxGole * 0.02) + Math.min(0.3, repr * 0.1);
  if (maxGole >= 10) powody.push("gwiazda-snajper w składzie");
  // projekt i cena (elastyczność cenowa)
  const oc = ocenaProjektu(s, sz, ko);
  const ref = cenaReferencyjna(s);
  const el = (refC: number, c: number) => Math.pow(refC / Math.max(1, c), 1.5);
  const szaliki = fani * 0.012 * mn * oc.szalik * el(ref.szalik, sz.cena);
  const koszulki = fani * 0.004 * mn * mnGwiazd * oc.koszulka * el(ref.koszulka, ko.cena);
  return { szaliki, koszulki, powody, fani: Math.round(fani) };
}

/** Losowa liczba całkowita o wartości oczekiwanej x (zaokrąglenie stochastyczne + szum). */
const sztuki = (x: number) => { const v = x * (0.85 + Math.random() * 0.3); const c = Math.floor(v); return c + (Math.random() < v - c ? 1 : 0); };

/** Wynik derbów z bieżącej kolejki (jeśli były): "wygrana" | "porazka" | null. */
function derbyTejKolejki(s: StanGry): "wygrana" | "porazka" | null {
  const m = (s.archiwumMeczow ?? []).filter((x) => x.sezon === s.sezon && x.kolejka === s.kolejka).pop();
  if (!m) return null;
  const rywal = Object.values(s.kluby).find((x) => x.nazwa === m.rywal);
  if (!rywal || !jestDerby(s, s.mojKlub, rywal.id)) return null;
  return m.my > m.oni ? "wygrana" : m.my < m.oni ? "porazka" : null;
}

/**
 * Sprzedaż tygodnia (wywoływać raz na kolejkę, po meczu). Księguje przychód netto do kasy klubu
 * i statystyki sezonu. Zwraca wiadomość (raport miesięczny / boom po derbach) albo null.
 */
export function tydzienSklepu(s: StanGry): string | null {
  const x = s as StanZeSklepem;
  if (!x.sklepKlubowy?.otwarty || s.zwolniony) return null;
  const st = stanSklepu(s);
  const znacznik = s.sezon * 100 + s.kolejka;
  if (st.ostatnio === znacznik) return null;
  st.ostatnio = znacznik;
  const k = s.kluby[s.mojKlub];
  const p = popytTygodnia(s);
  let mSz = 1, mKo = 1;
  const derby = derbyTejKolejki(s);
  if (derby === "wygrana") { mSz = 1.8; mKo = 1.4; p.powody.push("wygrane derby!"); }
  else if (derby === "porazka") { mSz = 0.75; mKo = 0.8; p.powody.push("przegrane derby"); }
  const szaliki = sztuki(p.szaliki * mSz);
  const koszulki = sztuki(p.koszulki * mKo);
  const koszt = kosztSztuki(s);
  const przychod = szaliki * st.szalik.cena + koszulki * st.koszulka.cena;
  const koszty = szaliki * koszt.szalik + koszulki * koszt.koszulka;
  k.kasa += przychod - koszty;
  const ss = sezonSklepu(s);
  ss.szaliki += szaliki; ss.koszulki += koszulki; ss.przychod += przychod; ss.koszty += koszty;
  // rozdział koszulek na nazwiska (25% bez nadruku)
  const kadra = k.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  if (koszulki > 0 && kadra.length) {
    const sr = kadra.reduce((a, z) => a + z.umiej, 0) / kadra.length;
    const wagi = kadra.map((z) => ({ z, w: popularnoscZawodnika(s, z, sr) }));
    const suma = wagi.reduce((a, w) => a + w.w, 0);
    for (let i = 0; i < koszulki; i++) {
      if (Math.random() < 0.25) continue; // bez nazwiska
      let r = Math.random() * suma;
      const wyb = wagi.find((w) => (r -= w.w) <= 0) ?? wagi[0];
      const e = (ss.zawodnicy[wyb.z.id] ??= { n: `${wyb.z.imie} ${wyb.z.nazwisko}`, szt: 0 });
      e.szt++;
    }
  }
  st.ostatniTydzien = { szaliki, koszulki, przychod, koszty, powody: p.powody };
  const netto = przychod - koszty;
  const zl = (n: number) => `${Math.round(n).toLocaleString("pl")} zł`;
  if (derby === "wygrana" && szaliki + koszulki > 0) return `🧣 Po wygranych derbach szaliki schodzą na pniu! Sklep klubowy: ${szaliki} szalików i ${koszulki} koszulek w tydzień (na czysto ${zl(netto)}).`;
  if (s.kolejka % 4 === 3) {
    const best = bestseller(s);
    return `🛍 Sklep klubowy — sezon ${s.sezon}: ${ss.szaliki} szalików, ${ss.koszulki} koszulek, zysk ${zl(ss.przychod - ss.koszty)}.${best ? ` Bestseller: koszulka „${best.n}" (${best.szt} szt.).` : ""}`;
  }
  if (netto < 0) return `🛍 Sklep klubowy dokłada do interesu (${zl(netto)} w tym tygodniu) — rozważ niższą cenę lub projekt w barwach klubu.`;
  return null;
}

/** Najlepiej sprzedająca się koszulka z nazwiskiem w sezonie. */
export function bestseller(s: StanGry, sezon = s.sezon): { id: string; n: string; szt: number } | null {
  const ss = (s as StanZeSklepem).sklepKlubowy?.sezony?.[String(sezon)];
  if (!ss) return null;
  const top = Object.entries(ss.zawodnicy).sort((a, b) => b[1].szt - a[1].szt)[0];
  return top ? { id: top[0], ...top[1] } : null;
}
/** Ranking koszulek z nazwiskami w sezonie. */
export function rankingKoszulek(s: StanGry, sezon = s.sezon, ile = 5): { id: string; n: string; szt: number }[] {
  const ss = (s as StanZeSklepem).sklepKlubowy?.sezony?.[String(sezon)];
  if (!ss) return [];
  return Object.entries(ss.zawodnicy).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.szt - a.szt).slice(0, ile);
}
/** Historia sezonów sklepu (najnowsze pierwsze). */
export function historiaSklepu(s: StanGry): { sezon: number; dane: SezonSklepu }[] {
  const sez = (s as StanZeSklepem).sklepKlubowy?.sezony ?? {};
  return Object.entries(sez).map(([k, v]) => ({ sezon: Number(k), dane: v })).sort((a, b) => b.sezon - a.sezon);
}

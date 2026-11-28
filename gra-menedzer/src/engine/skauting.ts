// Rozbudowany scouting talentów — serce pracy skauta. Wysyłanie w regiony świata,
// odkrywanie ukrytych, młodych, bezklubowych talentów; ściąganie zgodne z przepisami FIFA/PZPN.
import { ostatniKlub, zapiszTransfer } from "./rejestrTransferow";
import { los, losInt, szansa, wybierz } from "./losuj";
import { generujKariere, KADRA, kontraktTyp, nowyZawodnik, pensjaDla, przejscieDoKlubu } from "./swiat";
import { rozwinAtrybuty } from "./atrybuty";
import { poziomSztabu } from "./sztab";
import { NARODOWOSCI, narodowoscKraju } from "../data/narodowosci";
import { IMIONA, NAZWISKA } from "../data/nazwy";
import type { StanGry, Zawodnik } from "./types";

/** Regiony skautingu: nazwa → lista krajów (undefined dla Polski). „Moje województwo" = sieć lokalnych skautów (C4). */
export const REGIONY_SKAUT = ["Moje województwo", "Polska", "Europa Zachodnia", "Europa Środk.-Wsch.", "Ameryka Płd.", "Afryka"] as const;
export type RegionSkaut = (typeof REGIONY_SKAUT)[number];

const KRAJE_REGIONU: Record<RegionSkaut, string[] | null> = {
  "Moje województwo": null,
  "Polska": null,
  "Europa Zachodnia": ["Hiszpania", "Portugalia", "Francja", "Niemcy", "Szwecja"],
  "Europa Środk.-Wsch.": ["Ukraina", "Czechy", "Słowacja", "Chorwacja", "Serbia", "Litwa"],
  "Ameryka Płd.": ["Brazylia", "Argentyna"],
  "Afryka": ["Nigeria", "Senegal"],
};

/** Koszt wyjazdu skautingowego (dalej = drożej), skalowany poziomem klubu. */
export function kosztMisji(s: StanGry, region: RegionSkaut): number {
  const baza = region === "Moje województwo" ? 0.45 : region === "Polska" ? 1 : region.startsWith("Europa") ? 2.2 : 4;
  const poziomKlubu = s.kluby[s.mojKlub].poziom;
  const mn = poziomKlubu <= 1 ? 40 : poziomKlubu <= 3 ? 14 : poziomKlubu <= 5 ? 4 : 1.2;
  return Math.max(500, Math.round((baza * mn * 1000) / 100) * 100);
}

/** Czas misji w kolejkach. */
function czasMisji(region: RegionSkaut): number {
  return region === "Moje województwo" ? 1 : region === "Polska" ? 2 : region.startsWith("Europa") ? 3 : 4;
}

/** Pula miast z województwa klubu gracza (kluby regionalnych szczebli V liga→klasa B + własne miasto). */
function miastaRegionu(s: StanGry): string[] {
  const pula: string[] = [];
  const moj = s.kluby[s.mojKlub];
  if (moj?.miasto) pula.push(moj.miasto);
  for (const liga of s.ligi) { if (liga.poziom < 5) continue; for (const id of liga.kluby) { const m = s.kluby[id]?.miasto; if (m) pula.push(m); } }
  return pula;
}

/** Wysyła skauta w region (wymaga zatrudnionego skauta). */
export function wyslijSkauta(s: StanGry, region: RegionSkaut): string | null {
  const lvl = poziomSztabu(s, "skaut");
  if (!lvl) return "Najpierw zatrudnij skauta w sztabie szkoleniowym.";
  if (s.skauting) return `Skaut jest już na misji (${s.skauting.region}).`;
  const koszt = kosztMisji(s, region);
  const moj = s.kluby[s.mojKlub];
  if (moj.kasa < koszt) return `Brakuje ${koszt.toLocaleString("pl")} zł na wyjazd skautingowy.`;
  moj.kasa -= koszt;
  s.skauting = { region, kolejkiDo: s.kolejka + czasMisji(region) };
  return null;
}

/** Generuje jeden ukryty talent z regionu (bezklubowy, młody, wysoki potencjał). */
function talent(s: StanGry, region: RegionSkaut, lvl: number): Zawodnik {
  const poz = wybierz(KADRA);
  const z = nowyZawodnik(s, losInt(4, 6), poz, { mlody: true }); // surowy młodzik
  // narodowość wg regionu (nadpisuje wygenerowaną)
  const kraje = KRAJE_REGIONU[region];
  if (!kraje) { z.kraj = undefined; z.imie = wybierz(IMIONA); z.nazwisko = wybierz(NAZWISKA); }
  else { const nk = wybierz(kraje); const n = NARODOWOSCI.find((x) => x.kraj === nk)!; z.kraj = n.kraj; z.imie = wybierz(n.imiona); z.nazwisko = wybierz(n.nazwiska); }
  // Skauting regionalny (C4): lokalny chłopak z miasta w województwie klubu — zawsze Polak, z „pochodzeniem".
  if (region === "Moje województwo") { const pula = miastaRegionu(s); if (pula.length) z.pochodzenie = wybierz(pula); }
  // wiek: wielu bardzo młodych (wypatrzeni od 10 r.ż.) + nastolatkowie; lokalni raczej nastolatkowie
  const wiek = region === "Moje województwo" ? losInt(15, 18) : szansa(0.35) ? losInt(10, 14) : losInt(15, 18);
  const roznica = Math.max(0, 17 - wiek);
  if (roznica > 0) rozwinAtrybuty(z, -roznica * 2.2); // młodszy = surowszy overall
  z.wiek = wiek;
  // potencjał talentu — wysoki sufit, rośnie z poziomem skauta
  z.potencjal = Math.min(94, Math.max(z.potencjal, Math.round(z.umiej + los(14, 26) + lvl * 2)));
  z.klubId = null; z.kontraktTyp = "amator"; z.pensja = 0; z.kariera = []; z.numer = 0;
  z.kontuzja = 0; z.zawieszenie = 0;
  return z;
}

/** Jeśli misja dobiegła końca — generuje odkrycia (wołane co kolejkę). */
export function zakonczMisjeJesliCzas(s: StanGry): void {
  if (!s.skauting || s.kolejka < s.skauting.kolejkiDo) return;
  const region = s.skauting.region as RegionSkaut;
  const lvl = poziomSztabu(s, "skaut") || 1;
  const regionalny = region === "Moje województwo";
  const ile = 1 + Math.round(lvl * 0.8) + (regionalny ? 2 : region !== "Polska" ? 1 : 0); // lokalna sieć skautów = większy przerób
  s.odkryci ??= [];
  const nowi: string[] = [];
  for (let i = 0; i < ile; i++) { const t = talent(s, region, lvl); s.odkryci.push(t.id); nowi.push(t.id); }
  // „Odkrycie życia": lokalna sieć skautów czasem wypatrzy wyjątkowy talent z regionu (podbity potencjał).
  if (regionalny && nowi.length && szansa(0.4)) {
    const gem = nowi.map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => b.potencjal - a.potencjal)[0];
    if (gem) {
      gem.potencjal = Math.min(99, gem.potencjal + losInt(4, 8));
      s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `💎 Odkrycie życia! Lokalny skaut wypatrzył wyjątkowy talent z regionu: ${gem.imie} ${gem.nazwisko} (${gem.wiek} l., ${gem.poz}, pot. ${Math.floor(gem.potencjal)}). Zakontraktuj, zanim zrobią to inni.` });
    }
  }
  s.skauting = undefined;
  s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: regionalny
    ? `🔎 Lokalni skauci przejrzeli boiska województwa — ${ile} młodych talentów z regionu na liście. Zobacz Sztab → Talenty.`
    : `🔎 Skaut wrócił z regionu „${region}" — odkryto ${ile} talentów. Zobacz Sztab → Talenty.` });
  // sprzątanie watchlisty (trzymaj najlepsze 30 wg potencjału)
  if (s.odkryci.length > 30) {
    s.odkryci.sort((a, b) => (s.zawodnicy[b]?.potencjal ?? 0) - (s.zawodnicy[a]?.potencjal ?? 0));
    for (const id of s.odkryci.slice(30)) delete s.zawodnicy[id];
    s.odkryci = s.odkryci.slice(0, 30);
  }
}

/** Dojrzewanie obserwowanych talentów co sezon (starzeją się i rozwijają). */
export function dojrzewanieTalentow(s: StanGry): void {
  const lista = s.odkryci ?? [];
  for (const id of lista) {
    const z = s.zawodnicy[id];
    if (!z) continue;
    z.wiek++;
    rozwinAtrybuty(z, z.wiek <= 19 ? los(2, 5) : los(0, 2));
  }
  // usuń z watchlisty za starych (>23) lub znikniętych
  s.odkryci = lista.filter((id) => s.zawodnicy[id] && s.zawodnicy[id].wiek <= 23);
}

/** Minimalny wiek podpisania wg przepisów (FIFA art. 19 + PZPN): Polak 15, obcokrajowiec z UE 16, spoza UE 18. */
export function wiekMinimalny(z: Zawodnik): number {
  if (!z.kraj) return 15;
  return narodowoscKraju(z.kraj)?.ue ? 16 : 18;
}

/** Ściąga odkryty talent do akademii/kadry — tylko jeśli wiek zgodny z przepisami. */
export function sciagnijTalent(s: StanGry, id: string): string | null {
  const z = s.zawodnicy[id];
  const moj = s.kluby[s.mojKlub];
  if (!z || !(s.odkryci ?? []).includes(id)) return "Ten talent nie jest już dostępny.";
  if (moj.zawodnicy.length >= 26) return "Kadra jest pełna (max 26).";
  const minW = wiekMinimalny(z);
  if (z.wiek < minW) {
    const powod = !z.kraj ? "przepisy PZPN (pierwszy kontrakt od 15 lat)" : narodowoscKraju(z.kraj)?.ue ? "FIFA art. 19 (UE: od 16 lat)" : "FIFA art. 19 (spoza UE: od 18 lat)";
    return `${z.imie} ${z.nazwisko} ma dopiero ${z.wiek} lat — ${powod}. Na razie go obserwujecie; podpiszecie, gdy dorośnie.`;
  }
  z.klubId = moj.id;
  z.kontraktTyp = moj.poziom <= 3 ? "polprofesjonalny" : "amator";
  z.kontraktDo = s.sezon + 3;
  z.pensja = Math.round(pensjaDla(z.umiej, moj.poziom) * 0.5);
  moj.zawodnicy.push(z.id);
  { const skad = ostatniKlub(z); z.kariera = generujKariere(s, z, moj.nazwa); zapiszTransfer(s, z, skad, moj.nazwa, "skauting"); }
  przejscieDoKlubu(s, z, moj.nazwa);
  { const uzyte = new Set(moj.zawodnicy.map((x) => s.zawodnicy[x].numer)); let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n; }
  s.odkryci = (s.odkryci ?? []).filter((x) => x !== id);
  s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🌟 ${z.imie} ${z.nazwisko} (${z.wiek} l., ${z.poz}, pot. ${Math.floor(z.potencjal)}) dołącza do akademii!` });
  return null;
}

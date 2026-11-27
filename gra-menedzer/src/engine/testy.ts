// Zawodnicy na testach (realia niższych lig, IV liga → klasa B). Testowani to WOLNI zawodnicy (wolna karta):
// klub bierze ich na okres próbny, poznaje prawdziwą jakość STOPNIOWO (przedział szacunkowy zwęża się z
// obserwacjami/treningiem), skaut dodaje werdykt — po kilkunastu tygodniach decyzja: podpisz albo odeślij.
import { los, losInt, szansa, wybierz } from "./losuj";
import { dlugoscKontraktu, generujKariere, KADRA, kontraktTyp, nowyZawodnik, pensjaDla, przejscieDoKlubu, zakresUmiej } from "./swiat";
import { poziomSztabu } from "./sztab";
import { oknoTransferowe } from "./kalendarz";
import type { Pozycja, StanGry, Zawodnik } from "./types";

const POZIOM_TESTY_MIN = 5; // IV liga i niżej (amatorzy/półprofesjonaliści)
const klamp = (x: number) => Math.max(1, Math.min(99, Math.round(x)));
function wiad(s: StanGry, tekst: string) { s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst }); }
function kolejekSezonu(s: StanGry): number { return s.ligi[s.kluby[s.mojKlub].poziom - 1]?.terminarz.length ?? 30; }

/** Czy mój klub może teraz testować (niższa liga + otwarte okno transferowe). */
export function mozeTesty(s: StanGry): boolean {
  const p = s.kluby[s.mojKlub]?.poziom ?? 1;
  return p >= POZIOM_TESTY_MIN && oknoTransferowe(s.sezon, kolejekSezonu(s), s.kolejka, s.koniecSezonu).otwarte;
}
/** Limit jednoczesnych testowanych (rośnie ze skautem w sztabie). */
export function limitTestow(s: StanGry): number { return 2 + poziomSztabu(s, "skaut"); }
export function ileTestowanych(s: StanGry): number { return (s.kluby[s.mojKlub].testowani ?? []).length; }

/** Szerokość przedziału szacunku wg liczby obserwacji i poziomu skauta (mniej = dokładniej). */
function szerokosc(obs: number, skaut: number): number {
  return Math.max(0, 8 - skaut - Math.floor(obs * 1.3));
}
function ustawBand(z: Zawodnik, obs: number, skaut: number) {
  const w = szerokosc(obs, skaut);
  z.test = { do: z.test?.do ?? 0, obs, min: klamp(z.umiej - w), max: klamp(z.umiej + w), werdykt: werdyktTekst(z, w) };
}
function werdyktTekst(z: Zawodnik, w: number): string {
  if (w > 5) return "za wcześnie na ocenę";
  const zapas = z.potencjal - z.umiej;
  if (w > 2) return zapas >= 12 ? "ciekawy materiał, trzeba sprawdzić" : "do obejrzenia";
  // pewna ocena
  if (zapas >= 14 && z.wiek <= 21) return "🌟 perełka — brać!";
  return zapas >= 8 ? "rokuje, wart kontraktu" : "solidny do kadry";
}

/** Czytelny raport z testów. */
export function raportTestu(z: Zawodnik): string {
  if (!z.test) return "";
  const pewnosc = z.test.max - z.test.min <= 2 ? "ocena pewna" : z.test.max - z.test.min <= 5 ? "wstępna ocena" : "pierwsze wrażenie";
  return `Szac. OVR ${z.test.min}–${z.test.max} (${pewnosc}) · obserwacje: ${z.test.obs} · ${z.test.werdykt ?? ""}`;
}

/** Odświeża pulę kandydatów na testy (wolni zawodnicy pasujący do szczebla + lokalni bez klubu). */
export function odswiezRynekTestow(s: StanGry): void {
  const moj = s.kluby[s.mojKlub];
  if (!mozeTesty(s)) { return; }
  if (s.testRynek && s.testRynek.length >= 6) return;
  s.testRynek ??= [];
  const skaut = poziomSztabu(s, "skaut");
  const [lo, hi] = zakresUmiej(moj.poziom);
  // 1) wolni zawodnicy z rynku pasujący poziomem
  const wolni = s.wolni.filter((id) => { const z = s.zawodnicy[id]; return z && z.umiej >= lo - 8 && z.umiej <= hi + 2; });
  for (const id of wolni.slice(0, 5)) {
    if (s.testRynek.includes(id)) continue;
    s.wolni = s.wolni.filter((x) => x !== id);
    ustawBand(s.zawodnicy[id], 0, skaut);
    s.testRynek.push(id);
  }
  // 2) dopełnij lokalnymi zawodnikami bez klubu (wolna karta)
  while (s.testRynek.length < 8) {
    const z = nowyZawodnik(s, moj.poziom, wybierz(KADRA) as Pozycja, szansa(0.4) ? { mlody: true } : {});
    z.klubId = null; z.kontraktTyp = "amator"; z.pensja = 0; z.numer = 0; z.kariera = [];
    ustawBand(z, 0, skaut);
    s.testRynek.push(z.id);
  }
}

/** Lista kandydatów na testy (do UI). */
export function rynekTestow(s: StanGry): Zawodnik[] {
  return (s.testRynek ?? []).map((id) => s.zawodnicy[id]).filter(Boolean);
}

/** Weź zawodnika na testy. */
export function wezNaTesty(s: StanGry, id: string): string | null {
  if (!mozeTesty(s)) return "Testy możliwe tylko w niższych ligach (IV liga i niżej) i w otwartym oknie transferowym.";
  if (ileTestowanych(s) >= limitTestow(s)) return `Limit testowanych (${limitTestow(s)}). Zatrudnij skauta albo zakończ inny test.`;
  const z = s.zawodnicy[id];
  if (!z || !(s.testRynek ?? []).includes(id)) return "Ten zawodnik nie jest już dostępny na testy.";
  s.testRynek = (s.testRynek ?? []).filter((x) => x !== id);
  s.kluby[s.mojKlub].testowani = [...(s.kluby[s.mojKlub].testowani ?? []), id];
  const skaut = poziomSztabu(s, "skaut");
  z.test = { do: s.kolejka + losInt(8, 12), obs: 0, min: klamp(z.umiej - szerokosc(0, skaut)), max: klamp(z.umiej + szerokosc(0, skaut)), werdykt: werdyktTekst(z, szerokosc(0, skaut)) };
  wiad(s, `🧪 ${z.imie} ${z.nazwisko} (${z.poz}, ${z.wiek} l.) dołączył na testy — ocenisz go przez ~${z.test.do - s.kolejka} kolejek treningów i gier.`);
  return null;
}

/** Co tydzień: testowani trenują/grają, ocena się wyostrza; po terminie — decyzja, a przy zwłoce odchodzą. */
export function rozwojTestow(s: StanGry): void {
  const moj = s.kluby[s.mojKlub];
  const skaut = poziomSztabu(s, "skaut");
  for (const id of [...(moj.testowani ?? [])]) {
    const z = s.zawodnicy[id];
    if (!z || !z.test) { moj.testowani = (moj.testowani ?? []).filter((x) => x !== id); continue; }
    z.test.obs++;
    if (z.umiej < z.potencjal) { z.umiej = Math.min(z.potencjal, z.umiej + los(0, 0.4)); } // lekko się ogrywa
    const doKol = z.test.do;
    ustawBand(z, z.test.obs, skaut);
    if (s.kolejka === doKol) wiad(s, `🧪 Testy ${z.imie} ${z.nazwisko} dobiegły końca — zdecyduj: podpisać czy odesłać. ${raportTestu(z)}`);
    else if (s.kolejka > z.test.do + 4) { // zwłoka = zawodnik szuka klubu gdzie indziej
      moj.testowani = (moj.testowani ?? []).filter((x) => x !== id);
      z.test = undefined;
      s.wolni.push(id);
      wiad(s, `${z.imie} ${z.nazwisko} zakończył testy bez decyzji i odszedł wolny — inny klub może go wziąć.`);
    }
  }
}

/** Podpisz testowanego do kadry. */
export function podpiszZTestow(s: StanGry, id: string): string | null {
  const moj = s.kluby[s.mojKlub];
  if (!(moj.testowani ?? []).includes(id)) return "Ten zawodnik nie jest na testach.";
  if (moj.zawodnicy.length >= 26) return "Kadra jest pełna (max 26).";
  const z = s.zawodnicy[id];
  moj.testowani = (moj.testowani ?? []).filter((x) => x !== id);
  z.test = undefined;
  z.klubId = moj.id;
  z.kontraktTyp = kontraktTyp(moj.poziom);
  z.kontraktDo = s.sezon + dlugoscKontraktu(moj.poziom, false, z.wiek);
  z.pensja = pensjaDla(z.umiej, moj.poziom);
  { const uzyte = new Set(moj.zawodnicy.map((x) => s.zawodnicy[x].numer).filter((n) => n > 0)); let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n; }
  moj.zawodnicy.push(z.id);
  z.kariera = generujKariere(s, z, moj.nazwa);
  przejscieDoKlubu(s, z, moj.nazwa);
  wiad(s, `✍️ Po testach podpisujesz ${z.imie} ${z.nazwisko} (OVR ${Math.floor(z.umiej)}) — kontrakt do ${z.kontraktDo}.`);
  return null;
}

/** Odeślij testowanego (wraca na rynek wolnych). */
export function odeslijZTestow(s: StanGry, id: string): void {
  const moj = s.kluby[s.mojKlub];
  if (!(moj.testowani ?? []).includes(id)) return;
  moj.testowani = (moj.testowani ?? []).filter((x) => x !== id);
  const z = s.zawodnicy[id];
  if (z) { z.test = undefined; z.klubId = null; if (!s.wolni.includes(id)) s.wolni.push(id); }
}

/** Sprząta pulę rynku testów (gdy okno zamknięte) — kandydaci wracają na rynek wolnych. */
export function sprzatnijRynekTestow(s: StanGry): void {
  if (mozeTesty(s) || !s.testRynek?.length) return;
  for (const id of s.testRynek) { const z = s.zawodnicy[id]; if (z) { z.test = undefined; if (!s.wolni.includes(id)) s.wolni.push(id); } }
  s.testRynek = [];
}

/** Obserwacje testowanych w okresie przygotowawczym (trening = pół obserwacji, sparing/mecz testowy = pełna). */
export function obserwujTestowanych(s: StanGry, ile: number): string[] {
  const moj = s.kluby[s.mojKlub];
  const skaut = poziomSztabu(s, "skaut");
  const out: string[] = [];
  for (const id of moj.testowani ?? []) {
    const z = s.zawodnicy[id]; if (!z || !z.test) continue;
    const przed = (z.test.max - z.test.min);
    z.test.obs += ile;
    ustawBand(z, Math.floor(z.test.obs), skaut);
    if (z.test.max - z.test.min < przed) out.push(`🧪 ${z.imie} ${z.nazwisko}: ${raportTestu(z)}`);
  }
  return out;
}

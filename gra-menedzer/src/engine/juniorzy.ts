// Zespół juniorów (U-21) i akademia „z ulicy". Osobny skład młodzieżowy przy Twoim klubie:
//  - adepci „z ulicy" (bezklubowi, bardzo młodzi) organicznie trafiają do akademii w trakcie sezonu,
//  - juniorzy szybko rozwijają się (gra U-21 + szkolenie), poziom akademii przyspiesza,
//  - możesz promować juniora do pierwszego zespołu; absolwenci (>21 l.) awansują albo odchodzą.
// Juniorzy mają klubId = Twój klub, ale NIE są w k.zawodnicy (dopóki ich nie promujesz) — stąd osobna lista k.juniorzy.
import { los, losInt, szansa, wybierz } from "./losuj";
import { KADRA, nowyZawodnik, pensjaDla, zakresUmiej } from "./swiat";
import { rozwinAtrybuty } from "./atrybuty";
import type { Klub, StanGry, Zawodnik } from "./types";

export const LIMIT_JUNIOROW = 30; // akademia musi obsadzić dwa zespoły: U-19 i U-17

/** Kwalifikacja wiekowa do kategorii juniorskiej (rocznikowo: U-19 ≤ 19 l., U-17 ≤ 17 l.). */
export function eligibleJun(z: Zawodnik, kat: "U19" | "U17"): boolean {
  return kat === "U19" ? z.wiek <= 19 : z.wiek <= 17;
}
/** Juniorzy klubu w danej kategorii, posortowani wg OVERALL (do wystawienia w lidze juniorów). */
export function skladJun(s: StanGry, klubId: string, kat: "U19" | "U17"): Zawodnik[] {
  return (s.kluby[klubId]?.juniorzy ?? []).map((id) => s.zawodnicy[id]).filter((z) => z && eligibleJun(z, kat)).sort((a, b) => b.umiej - a.umiej);
}

/** Poziom akademii 1–5 (lokalnie, bez importu z sezon.ts — unika cyklu). */
function poziomAkad(k: Klub): number {
  return k.akademia ?? Math.max(1, Math.min(5, Math.round(k.renoma * 5) || 1));
}
function wiadomosc(s: StanGry, tekst: string) {
  s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst });
}
function numerWolny(s: StanGry, k: Klub, z: Zawodnik): number {
  const uzyte = new Set(k.zawodnicy.map((x) => s.zawodnicy[x]?.numer).filter((n) => n && n > 0));
  let n = z.poz === "BR" ? 1 : 2;
  while (uzyte.has(n) && n < 99) n++;
  return n;
}

/** Juniorzy (U-21) Twojej akademii — posortowani wg potencjału. */
export function juniorzy(s: StanGry): Zawodnik[] {
  return (s.kluby[s.mojKlub].juniorzy ?? []).map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => b.potencjal - a.potencjal);
}
export function czyJunior(s: StanGry, id: string): boolean {
  return (s.kluby[s.mojKlub].juniorzy ?? []).includes(id);
}

/** Generuje surowego, bardzo młodego adepta (bezklubowego) dla akademii klubu. */
function adept(s: StanGry, k: Klub): Zawodnik {
  const poz = wybierz(KADRA);
  const z = nowyZawodnik(s, Math.min(9, k.poziom + 1), poz, { mlody: true }); // jakość blisko szczebla klubu
  const wiek = szansa(0.4) ? losInt(14, 16) : losInt(16, 18);
  const roznica = Math.max(0, 17 - wiek);
  if (roznica > 0) rozwinAtrybuty(z, -roznica * 1.5); // młodszy = surowszy (łagodniej)
  z.wiek = wiek;
  const aN = poziomAkad(k) / 5;
  const perelka = szansa(0.05 + aN * 0.1);
  z.potencjal = Math.min(94, Math.max(z.potencjal, Math.round(z.umiej + los(12, 22) + aN * 10 + (perelka ? losInt(6, 16) : 0))));
  z.klubId = k.id;
  z.kontraktTyp = "amator";
  z.pensja = 0;
  z.numer = 0;
  z.kontuzja = 0;
  z.zawieszenie = 0;
  z.kariera = [{ klub: k.nazwa, od: s.sezon, do: null, mecze: 0, gole: 0 }];
  z.wychowanek = k.nazwa; // adept Twojej akademii = wychowanek klubu
  z.pochodzenie = miastoRegionu(s, k); // wychowanek pochodzi z miasta w województwie klubu (B2)
  return z;
}

/** Pula miast z województwa klubu: miasta klubów z regionalnych szczebli (V liga→klasa B) + własne miasto. */
function miastoRegionu(s: StanGry, k: Klub): string {
  if (szansa(0.4)) return k.miasto; // najczęściej z miasta klubu (lokalny chłopak)
  const pula: string[] = [];
  for (const liga of s.ligi) {
    if (liga.poziom < 5) continue; // tylko szczeble regionalne (woj.) — tam są miasta z tego województwa
    for (const id of liga.kluby) { const m = s.kluby[id]?.miasto; if (m) pula.push(m); }
  }
  return pula.length ? wybierz(pula) : k.miasto;
}

/** Co tydzień: szansa, że adept „z ulicy" trafi do akademii (rośnie z poziomem akademii). */
export function naborUlicy(s: StanGry): void {
  const k = s.kluby[s.mojKlub];
  k.juniorzy ??= [];
  if (k.juniorzy.length >= LIMIT_JUNIOROW) return;
  const aN = poziomAkad(k) / 5;
  if (!szansa(0.04 + aN * 0.08)) return; // ~5–12%/tydz. zależnie od akademii
  const z = adept(s, k);
  k.juniorzy.push(z.id);
  const ocena = z.potencjal - z.umiej >= 22 ? " — wygląda na duży talent! 🌟" : z.potencjal - z.umiej >= 14 ? " — obiecujący" : "";
  wiadomosc(s, `⚽ Skaut akademii wypatrzył na okolicznych boiskach ${z.imie} ${z.nazwisko} (${z.wiek} l., ${z.poz}, pot. ${Math.floor(z.potencjal)})${ocena}. Dołącza do U-21.`);
}

/** Co tydzień: rozwój juniorów (szybki, przyspieszany akademią). */
export function rozwojJuniorow(s: StanGry): void {
  const k = s.kluby[s.mojKlub];
  const aN = poziomAkad(k) / 5;
  for (const id of k.juniorzy ?? []) {
    const z = s.zawodnicy[id];
    if (!z) continue;
    z.kondycja = 100;
    if (z.kontuzja > 0) z.kontuzja--;
    if (z.umiej < z.potencjal) {
      const mn = (z.wiek <= 17 ? 0.26 : 0.18) * (0.9 + aN * 0.7); // gra U-21 + szkolenie = szybko
      rozwinAtrybuty(z, mn * los(0.5, 1.5));
    }
  }
}

/** Promocja juniora do pierwszego zespołu (na Twoje polecenie). */
export function promujJuniora(s: StanGry, id: string): string | null {
  const k = s.kluby[s.mojKlub];
  if (!czyJunior(s, id)) return "To nie jest junior z Twojej akademii.";
  if (k.zawodnicy.length >= 26) return "Kadra pierwszego zespołu jest pełna (max 26).";
  const z = s.zawodnicy[id];
  k.juniorzy = (k.juniorzy ?? []).filter((x) => x !== id);
  k.zawodnicy.push(id);
  z.kontraktTyp = k.poziom <= 3 ? "polprofesjonalny" : "amator";
  z.kontraktDo = s.sezon + 3;
  z.pensja = Math.round(pensjaDla(z.umiej, k.poziom) * 0.6);
  z.numer = numerWolny(s, k, z);
  wiadomosc(s, `⬆ ${z.imie} ${z.nazwisko} (${z.wiek} l., ${z.poz}, OVR ${Math.floor(z.umiej)}) zostaje powołany z akademii do pierwszego zespołu.`);
  return null;
}

/** Wypożyczenie juniora do niższej ligi po minuty (rozwój). Wraca po sezonie do akademii, jeśli dalej U-19. */
export function wypozyczJuniora(s: StanGry, id: string): string | null {
  const k = s.kluby[s.mojKlub];
  if (!czyJunior(s, id)) return "To nie jest junior z Twojej akademii.";
  const z = s.zawodnicy[id];
  if (z.wiek < 16) return "Za młody na wypożyczenie do seniorów (od 16 lat).";
  // Klub docelowy: niższy szczebel z miejscem w kadrze.
  const cel = Object.values(s.kluby).filter((c) => c.id !== k.id && c.poziom > k.poziom && c.zawodnicy.length < 24)
    .sort((a, b) => a.poziom - b.poziom)[0]
    ?? Object.values(s.kluby).filter((c) => c.id !== k.id && c.zawodnicy.length < 24).sort((a, b) => b.poziom - a.poziom)[0];
  if (!cel) return "Żaden klub nie szuka teraz wypożyczenia juniora.";
  k.juniorzy = (k.juniorzy ?? []).filter((x) => x !== id);
  z.juniorMacierzysty = true;
  z.macierzysty = k.id;
  z.wypozyczenieDo = s.sezon;
  z.kontraktTyp = cel.poziom <= 3 ? "polprofesjonalny" : "amator";
  z.pensjaPelna = z.pensja;
  z.pensja = 0; // akademik — klub goszczący nie płaci
  z.doplataMacierzystego = 0;
  z.klubId = cel.id;
  z.numer = numerWolny(s, cel, z);
  cel.zawodnicy.push(z.id);
  wiadomosc(s, `🧳 ${z.imie} ${z.nazwisko} (${z.wiek} l.) wypożyczony z akademii do ${cel.nazwa} (${cel.poziom > k.poziom ? "niższa liga" : "inna liga"}) — ogra się w seniorach i wróci silniejszy.`);
  return null;
}

/** Usunięcie juniora z akademii (odchodzi). */
export function zwolnijJuniora(s: StanGry, id: string): void {
  const k = s.kluby[s.mojKlub];
  if (!czyJunior(s, id)) return;
  k.juniorzy = (k.juniorzy ?? []).filter((x) => x !== id);
  delete s.zawodnicy[id];
}

/** Przy nowym sezonie: juniorzy starzeją się i rozwijają; absolwenci (>21 l.) awansują albo odchodzą. */
export function juniorzyNowySezon(s: StanGry): void {
  const k = s.kluby[s.mojKlub];
  for (const id of [...(k.juniorzy ?? [])]) {
    const z = s.zawodnicy[id];
    if (!z) { k.juniorzy = (k.juniorzy ?? []).filter((x) => x !== id); continue; }
    z.wiek++;
    rozwinAtrybuty(z, z.wiek <= 18 ? los(2, 5) : los(0, 2));
    if (z.wiek > 19) {
      k.juniorzy = (k.juniorzy ?? []).filter((x) => x !== id);
      const prog = zakresUmiej(k.poziom)[0];
      if (z.umiej >= prog - 4 && k.zawodnicy.length < 26) {
        k.zawodnicy.push(id);
        z.kontraktTyp = k.poziom <= 3 ? "polprofesjonalny" : "amator";
        z.kontraktDo = s.sezon + 2;
        z.pensja = Math.round(pensjaDla(z.umiej, k.poziom) * 0.7);
        z.numer = numerWolny(s, k, z);
        wiadomosc(s, `🎓 ${z.imie} ${z.nazwisko} kończy akademię (${z.wiek} l., OVR ${Math.floor(z.umiej)}) i zostaje w pierwszym zespole.`);
      } else {
        wiadomosc(s, `${z.imie} ${z.nazwisko} kończy wiek juniora i opuszcza akademię.`);
        delete s.zawodnicy[id];
      }
    }
  }
}

/** Zasila startową akademię U-19/U-17 (na początku kariery) — kilkunastu wychowanków w wieku 14–19. */
export function zasiejAkademie(s: StanGry): void {
  const k = s.kluby[s.mojKlub];
  k.juniorzy ??= [];
  if (k.juniorzy.length > 0) return;
  const ilu = 14 + Math.round(poziomAkad(k) * 1.2);
  for (let i = 0; i < ilu; i++) {
    const z = adept(s, k);
    z.wiek = losInt(14, 19); // pełne spektrum wieku akademii
    k.juniorzy.push(z.id);
  }
}

/** Nabór akademii na starcie sezonu wchodzi do U-21 (zamiast prosto do pierwszego zespołu). */
export function naborAkademiiDoJuniorow(s: StanGry, z: Zawodnik): void {
  const k = s.kluby[s.mojKlub];
  k.juniorzy ??= [];
  z.klubId = k.id;
  z.numer = 0;
  z.wychowanek = k.nazwa; // wychowanek klubu (homegrown)
  k.juniorzy.push(z.id);
}

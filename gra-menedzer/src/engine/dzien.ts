// Kalendarz dzień po dniu (jak w Football Managerze). Silnik rozgrywek pozostaje „kolejkowy" (1 kolejka = 1 tydzień),
// a gracz przechodzi przez dni tygodnia: regeneracja → treningi (z raportami) → [środa: puchar] → odprawa → MECZ → odpoczynek.
// Każdy dzień treningowy nalicza 1/3 tygodniowego treningu (reszta dolicza się przy meczu, gdy przeskoczysz do meczu).
import { dateKolejki, kalendarzSzczebla } from "./kalendarz";
import { moznaPuchar } from "./puchar";
import { ileKolejek, kontekstTreningu, rozwojTreningowy, zagrajKolejke } from "./sezon";
import { ETYKIETA_ATRYB } from "./atrybuty";
import { dataOkresu, dzienOkresu, nazwaDnia, rozpocznijOkres } from "./okres";
import type { StanGry, Zawodnik } from "./types";

export type TypDnia = "regeneracja" | "trening" | "puchar" | "odprawa" | "mecz" | "wolne";
export interface Dzien { idx: number; nazwa: string; data: Date; typ: TypDnia; tytul: string; ikona: string }
const DNI = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
const MIES = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
export const fmtData = (d: Date) => `${d.getDate()} ${MIES[d.getMonth()]} ${d.getFullYear()}`;

/** Dzień meczu ligowego Twojej drużyny w tym tygodniu (5 = sobota, 6 = niedziela): wyższe ligi — sobota/niedziela
 *  wg kolejki, niższe — wg gospodarza (kluby mają swoje stałe terminy). */
export function dzienMeczu(s: StanGry): number {
  const liga = s.ligi[s.kluby[s.mojKlub].poziom - 1];
  const para = liga?.terminarz[s.kolejka]?.find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
  if (!para) return 5;
  let h = 0; for (const c of para[0]) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (h + (liga.poziom <= 3 ? s.kolejka : 0)) % 2 === 0 ? 5 : 6;
}
/** Plan bieżącego tygodnia (7 dni). */
export function planTygodnia(s: StanGry): Dzien[] {
  const mecz = dzienMeczu(s);
  const lg = s.ligi[s.kluby[s.mojKlub].poziom - 1];
  const dMeczu = dateKolejki(s.sezon, ileKolejek(s), s.kolejka, kalendarzSzczebla(lg?.nazwa ?? "", lg?.poziom ?? 1));
  const pon = new Date(dMeczu); pon.setDate(pon.getDate() - mecz);
  const puchar = moznaPuchar(s);
  const plan: Dzien[] = [];
  let treningow = 0;
  for (let i = 0; i < 7; i++) {
    const data = new Date(pon); data.setDate(pon.getDate() + i);
    let typ: TypDnia, tytul: string, ikona: string;
    if (i === mecz) { typ = "mecz"; tytul = "Mecz ligowy"; ikona = "⚽"; }
    else if (i > mecz) { typ = "wolne"; tytul = "Odpoczynek po meczu · mecz juniorów"; ikona = "🛌"; }
    else if (i === 0) { typ = "regeneracja"; tytul = "Regeneracja i raport medyczny"; ikona = "🩺"; }
    else if (i === 2 && puchar) { typ = "puchar"; tytul = "Mecz pucharowy (środa)"; ikona = "🏆"; }
    else if (i === mecz - 1) { typ = "odprawa"; tytul = "Odprawa przedmeczowa · rozruch"; ikona = "📋"; }
    else if (treningow < 3) { typ = "trening"; treningow++; tytul = treningow === 1 ? "Trening — przygotowanie fizyczne" : treningow === 2 ? "Trening — taktyka i fokus tygodnia" : "Trening — gra w małych grach i stałe fragmenty"; ikona = "🏋"; }
    else { typ = "wolne"; tytul = "Dzień wolny"; ikona = "☕"; }
    plan.push({ idx: i, nazwa: DNI[i], data, typ, tytul, ikona });
  }
  return plan;
}
export function dzisiaj(s: StanGry): Dzien { return planTygodnia(s)[Math.min(s.dzien ?? 0, 6)]; }

function zapiszRaport(s: StanGry, d: Dzien, wpisy: string[]) {
  (s.raportyDni ??= []).unshift({ data: `${d.nazwa}, ${fmtData(d.data)}`, tytul: d.tytul, ikona: d.ikona, wpisy });
  s.raportyDni = s.raportyDni.slice(0, 21);
}

/** Trening jednego dnia: 1/3 tygodnia, raport kto co poprawił, urazy, wyróżnieni. */
function treningDnia(s: StanGry, d: Dzien): string[] {
  const kadra = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kontuzja === 0);
  const przed = new Map(kadra.map((z) => [z.id, { u: z.umiej, a: { ...(z.atrybuty ?? {}) } as Record<string, number>, k: z.kontuzja }]));
  const komunikaty: string[] = [];
  for (const z of kadra) rozwojTreningowy(s, z, 1 / 3, kontekstTreningu(s, z), (m) => komunikaty.push(m));
  s.treningiDni = (s.treningiDni ?? 0) + 1;
  // lekkie zmęczenie po zajęciach (odrabiane w weekendowej regeneracji silnika)
  for (const z of kadra) z.kondycja = Math.max(40, z.kondycja - (d.tytul.includes("fizyczne") ? 2 : 1));
  const zmiany = kadra.map((z) => {
    const p = przed.get(z.id)!;
    const atr = Object.keys(p.a).map((k) => ({ k, d: ((z.atrybuty as unknown as Record<string, number> | undefined)?.[k] ?? 0) - p.a[k] })).filter((x) => x.d >= 0.15).sort((a, b) => b.d - a.d);
    return { z, du: z.umiej - p.u, atr };
  }).filter((x) => x.du > 0.02 || x.atr.length).sort((a, b) => b.du - a.du);
  const wpisy: string[] = [`Fokus: ${s.trening} · intensywność: ${s.treningIntensywnosc ?? "normalna"} · na zajęciach ${kadra.length} zawodników.`];
  for (const x of zmiany.slice(0, 6)) {
    const atr = x.atr.slice(0, 2).map((a) => `${ETYKIETA_ATRYB[a.k as keyof typeof ETYKIETA_ATRYB] ?? a.k} +${a.d.toFixed(1)}`).join(", ");
    wpisy.push(`📈 ${x.z.imie[0]}. ${x.z.nazwisko}: OVR ${x.z.umiej.toFixed(1)} (+${x.du.toFixed(2)})${atr ? ` · ${atr}` : ""}`);
  }
  if (!zmiany.length) wpisy.push("Bez wyraźnych postępów — zawodnicy blisko swojego sufitu albo słaby fokus.");
  // Wyróżnieni / słabsi na treningu (forma + morale + losowość) — lekko wpływa na morale.
  const ocena = (z: Zawodnik) => z.forma * 0.6 + (z.morale - 60) * 0.05 + Math.random() * 3;
  const sort = [...kadra].sort((a, b) => ocena(b) - ocena(a));
  if (sort[0]) { sort[0].morale = Math.min(100, sort[0].morale + 2); wpisy.push(`⭐ Najlepszy na zajęciach: ${sort[0].imie} ${sort[0].nazwisko}.`); }
  if (sort.length > 4) { const sl = sort[sort.length - 1]; wpisy.push(`😐 Słabszy dzień: ${sl.imie} ${sl.nazwisko} — trener zwrócił uwagę.`); }
  for (const z of kadra) if (z.kontuzja > 0 && (przed.get(z.id)?.k ?? 0) === 0) wpisy.push(`🤕 Uraz na treningu: ${z.imie} ${z.nazwisko} — pauza ${z.kontuzja} kol.`);
  for (const m of komunikaty) wpisy.push(m);
  return wpisy;
}
function raportMedyczny(s: StanGry): string[] {
  const kadra = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const wp: string[] = [];
  const kont = kadra.filter((z) => z.kontuzja > 0), zaw = kadra.filter((z) => z.zawieszenie > 0);
  wp.push(kont.length ? `🩹 Kontuzjowani: ${kont.map((z) => `${z.nazwisko} (${z.kontuzja} kol.)`).join(", ")}` : "🩹 Brak kontuzji — pełna kadra do dyspozycji.");
  if (zaw.length) wp.push(`🟥 Pauzują za kartki: ${zaw.map((z) => z.nazwisko).join(", ")}`);
  const zmecz = kadra.filter((z) => z.kondycja < 70).sort((a, b) => a.kondycja - b.kondycja);
  if (zmecz.length) wp.push(`🔋 Zmęczeni (kondycja < 70%): ${zmecz.slice(0, 5).map((z) => `${z.nazwisko} ${Math.round(z.kondycja)}%`).join(", ")}`);
  const sr = kadra.reduce((a, z) => a + z.morale, 0) / Math.max(1, kadra.length);
  wp.push(`🙂 Średnie morale drużyny: ${Math.round(sr)}% · niedostępni z powodów osobistych: ${Object.keys(s.niedostepni).filter((id) => kadra.some((z) => z.id === id)).length}`);
  return wp;
}

/** Przejdź do następnego dnia. Zwraca true, jeśli tego dnia rozegrano mecz Twojej drużyny (UI pokazuje relację). */
export function dalejDzien(s: StanGry): boolean {
  if (s.koniecSezonu || s.zwolniony) return false;
  // Przerwa zimowa: po rundzie jesiennej, przed pierwszym tygodniem wiosny — okres zimowy (urlop + przygotowania).
  const pol = Math.ceil(ileKolejek(s) / 2);
  if (!s.okres && s.kolejka === pol && (s.dzien ?? 0) === 0 && s.zimaSezon !== s.sezon) { s.zimaSezon = s.sezon; rozpocznijOkres(s, "zima"); }
  if (s.okres) {
    const dzO = dataOkresu(s);
    const r = dzienOkresu(s);
    if (r) zapiszRaport(s, { idx: 0, nazwa: nazwaDnia(dzO), data: dzO, typ: "wolne", tytul: r.tytul, ikona: r.ikona }, r.wpisy);
    return false;
  }
  const d = dzisiaj(s);
  if (d.typ === "mecz") {
    zagrajKolejke(s);
    zapiszRaport(s, d, ["Mecz rozegrany — szczegóły w relacji i wiadomościach."]);
    s.dzien = 0; // nowy tydzień zaczyna się od poniedziałku (kolejna kolejka)
    return true;
  }
  let wpisy: string[] = [];
  if (d.typ === "regeneracja") wpisy = raportMedyczny(s);
  else if (d.typ === "trening") wpisy = treningDnia(s, d);
  else if (d.typ === "puchar") wpisy = ["Mecz pucharowy zostanie rozegrany w ramach tej kolejki — wynik w wiadomościach po weekendzie."];
  else if (d.typ === "odprawa") wpisy = [`Skład na mecz: ${s.taktyka.sklad.length}/11 · formacja ${s.taktyka.formacja} · nastawienie ${s.taktyka.nastawienie}.`, s.taktyka.auto ? "Asystent ustawi skład automatycznie." : "Skład ustawiony ręcznie — sprawdź go przed meczem."];
  else wpisy = ["Spokojny dzień w klubie."];
  zapiszRaport(s, d, wpisy);
  s.dzien = (s.dzien ?? 0) + 1;
  return false;
}
/** Przeskocz do dnia meczu (pozostałe dni treningowe wykonują się w tle). */
export function doMeczu(s: StanGry) {
  let g = 0;
  if (s.okres) { while (s.okres && g++ < 200) dalejDzien(s); return; }
  while (dzisiaj(s).typ !== "mecz" && g++ < 8) dalejDzien(s);
}

// Wydział Gier, Kolegium Sędziów i Izba ds. Rozwiązywania Sporów Sportowych PZPN — sprawy „przy zielonym stoliku”:
//  • #82 protesty: po meczu klub może złożyć protest (np. rywal wystawił nieuprawnionego zawodnika); opłata protestowa,
//    decyzja po kilku dniach (kolejna kolejka) — walkower 3:0 i kara dla rywala albo odrzucenie (opłata przepada);
//  • #83 ocena sędziego: obserwator ocenia arbitra (skala ocen kolegium ~6,0–9,0), kontrowersje; skarga do Kolegium
//    Sędziów — sędzia odsunięty od meczów albo skarga oddalona (i nagana za „atak na sędziów”);
//  • #85/#129 zaległości płacowe: po ~miesiącu niepłacenia morale spada, po >2 miesiącach zawodnicy zawodowi kierują sprawy
//    do Izby PZPN (zakaz transferów do spłaty) i mogą rozwiązać umowę z winy klubu; amatorzy po prostu odchodzą.
// Uproszczenia gry: kwoty opłat orientacyjne wg szczebla; jedna kolejka ≈ tydzień.
import type { StanGry, Wynik, Zawodnik } from "./types";

const los = Math.random;
const pick = <T,>(a: T[]) => a[Math.floor(los() * a.length)];
const zl = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} zł`;
const msg = (s: StanGry, tekst: string) => { s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst }); };

export interface OkazjaProtestu { id: string; kolejka: number; liga: number; rywal: string; dom: boolean; wynik: string; zawodnik: string; powod: string; dowody: number; prawda: boolean; wazneDo: number; status: "mozliwy" | "zlozony" | "uwzgledniony" | "odrzucony" | "przepadl"; decyzja?: number; oplata: number }
export interface OcenaSedziego { kolejka: number; sedzia: string; rywal: string; ocena: number; uwagi: string[]; skarga?: "zlozona" | "uznana" | "oddalona"; decyzja?: number }
export interface StanWydzialu { protesty: OkazjaProtestu[]; sedziowie: OcenaSedziego[]; zaleglosci: number; izba?: { zawodnik: string; decyzja: number }[]; zakazTransferow?: boolean }

export const wydzial = (s: StanGry): StanWydzialu => ((s as unknown as { wydzial?: StanWydzialu }).wydzial ??= { protesty: [], sedziowie: [], zaleglosci: 0 });
export const oplataProtestu = (poziom: number) => (poziom <= 1 ? 5000 : poziom <= 2 ? 3000 : poziom <= 4 ? 1500 : poziom <= 6 ? 500 : 300);
export const oplataSkargi = (poziom: number) => (poziom <= 2 ? 2000 : poziom <= 4 ? 800 : 200);
/** Czy klub ma zakaz transferów (Izba PZPN — zaległości wobec zawodników). */
export const zakazTransferow = (s: StanGry) => !!wydzial(s).zakazTransferow;

const POWODY = [
  { p: "zagrał mimo pauzy za cztery żółte kartki", pr: 0.8 },
  { p: "nie był uprawniony do gry — brak potwierdzenia w Extranecie", pr: 0.7 },
  { p: "wpisany do protokołu pod innym nazwiskiem", pr: 0.45 },
  { p: "pauzował za czerwoną kartkę z rezerw, a zagrał w pierwszym zespole", pr: 0.6 },
  { p: "przekroczono limit zawodników spoza UE", pr: 0.65 },
  { p: "zgłoszony po terminie okna transferowego", pr: 0.55 },
  { p: "bez ważnych badań lekarskich", pr: 0.5 },
];

/** Po moim meczu (już rozliczonym): czasem kierownik drużyny zauważa nieprawidłowość u rywala. */
export function poMeczuWydzial(s: StanGry, w: Wynik, ligaIdx: number, kolejka: number) {
  const W = wydzial(s); const mk = s.kluby[s.mojKlub];
  const dom = w.dom === s.mojKlub; const my = dom ? w.gd : w.gg, oni = dom ? w.gg : w.gd;
  const rywalId = dom ? w.gosc : w.dom; const rywal = s.kluby[rywalId]; if (!rywal) return;
  // ocena sędziego
  if (w.sedzia?.glowny) {
    const kontrow = (w.zdarzenia ?? []).filter((z) => z.typ === "karny" || z.typ === "czerwona").length;
    const ocena = Math.round((8.3 - kontrow * 0.25 + (los() - 0.5) * 1.4 - (w.sedzia.asystenci?.length ? 0 : 0.3)) * 10) / 10;
    const uwagi: string[] = [];
    if (ocena < 7.6) uwagi.push(pick(["niekonsekwencja w karaniu kartkami", "błąd przy spalonym przed golem", "nieodgwizdany ewidentny rzut karny", "zbyt pobłażliwy dla brutalnych fauli", "zła pozycja przy kluczowej sytuacji"]));
    if (ocena >= 8.4) uwagi.push("bardzo dobra kontrola meczu");
    if (!w.sedzia.asystenci?.length) uwagi.push("brak asystentów — na liniach przedstawiciele klubów");
    W.sedziowie.unshift({ kolejka, sedzia: w.sedzia.glowny, rywal: rywal.nazwa, ocena: Math.max(5.8, Math.min(9.2, ocena)), uwagi });
    W.sedziowie = W.sedziowie.slice(0, 12);
  }
  // nieprawidłowość u rywala — tylko gdy nie wygraliśmy (inaczej protest nie ma sensu)
  if (my > oni) return;
  const p = mk.poziom >= 6 ? 0.035 : mk.poziom >= 4 ? 0.018 : 0.006;
  if (los() > p) return;
  const kadra = rywal.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean) as Zawodnik[];
  const z = kadra.length ? pick(kadra) : null; if (!z) return;
  const pw = pick(POWODY);
  const dowody = Math.round((0.35 + los() * 0.6) * 100) / 100;
  const o: OkazjaProtestu = { id: `pr${s.sezon}_${kolejka}`, kolejka, liga: ligaIdx, rywal: rywalId, dom, wynik: `${my}:${oni}`, zawodnik: `${z.imie} ${z.nazwisko}`, powod: pw.p, dowody, prawda: los() < pw.pr * (0.5 + dowody / 2), wazneDo: s.kolejka + 2, status: "mozliwy", oplata: oplataProtestu(mk.poziom) };
  W.protesty.unshift(o); W.protesty = W.protesty.slice(0, 10);
  msg(s, `📋 Kierownik drużyny po meczu z ${rywal.nazwa} (${o.wynik}): „${o.zawodnik} ${o.powod}”. Dowody: ${dowody >= 0.75 ? "mocne" : dowody >= 0.55 ? "średnie" : "słabe"}. Możesz złożyć protest do Wydziału Gier (opłata ${zl(o.oplata)}) — Więcej → Wydział Gier.`);
}

export function zlozProtest(s: StanGry, id: string): string {
  const W = wydzial(s); const o = W.protesty.find((x) => x.id === id); const mk = s.kluby[s.mojKlub];
  if (!o || o.status !== "mozliwy") return "Ten protest nie jest już możliwy.";
  if (s.kolejka > o.wazneDo) { o.status = "przepadl"; return "Minął termin na złożenie protestu."; }
  mk.kasa -= o.oplata; o.status = "zlozony"; o.decyzja = s.kolejka + 1;
  return `📨 Protest złożony (opłata ${zl(o.oplata)}). Wydział Gier rozpatrzy sprawę w ciągu kilku dni.`;
}

export function zlozSkarge(s: StanGry, idx: number): string {
  const W = wydzial(s); const o = W.sedziowie[idx]; const mk = s.kluby[s.mojKlub];
  if (!o || o.skarga) return "Skarga już złożona.";
  mk.kasa -= oplataSkargi(mk.poziom); o.skarga = "zlozona"; o.decyzja = s.kolejka + 1;
  return `📨 Skarga na sędziego ${o.sedzia} trafiła do Kolegium Sędziów (opłata ${zl(oplataSkargi(mk.poziom))}).`;
}

/** Co kolejkę: decyzje Wydziału Gier i Kolegium, zaległości płacowe i Izba PZPN. */
export function tydzienWydzialu(s: StanGry) {
  const W = wydzial(s); const mk = s.kluby[s.mojKlub];
  for (const o of W.protesty) {
    if (o.status === "mozliwy" && s.kolejka > o.wazneDo) o.status = "przepadl";
    if (o.status !== "zlozony" || (o.decyzja ?? 0) > s.kolejka) continue;
    const rywal = s.kluby[o.rywal];
    if (o.prawda) {
      o.status = "uwzgledniony"; mk.kasa += o.oplata; // opłata zwrócona
      const w = s.ligi[o.liga]?.wyniki[o.kolejka]?.find((x) => (x.dom === s.mojKlub && x.gosc === o.rywal) || (x.gosc === s.mojKlub && x.dom === o.rywal));
      if (w) { w.gd = w.dom === s.mojKlub ? 3 : 0; w.gg = w.dom === s.mojKlub ? 0 : 3; }
      const a = (s.archiwumMeczow ?? []).find((m) => m.sezon === s.sezon && m.kolejka === o.kolejka && m.rywal === rywal?.nazwa); if (a) { a.my = 3; a.oni = 0; }
      if (rywal) rywal.kasa -= o.oplata * 2;
      msg(s, `⚖️ Wydział Gier UWZGLĘDNIŁ protest: mecz z ${rywal?.nazwa} zweryfikowany jako walkower 3:0 dla Was (${o.zawodnik} ${o.powod}). Rywal ukarany grzywną, opłata protestowa zwrócona.`);
    } else {
      o.status = "odrzucony";
      msg(s, `⚖️ Wydział Gier ODDALIŁ protest w sprawie meczu z ${rywal?.nazwa} — ${pick(["zawodnik był uprawniony do gry", "brak wystarczających dowodów", "protest złożony z uchybieniem formalnym", "kartki z innych rozgrywek nie sumują się"])}. Opłata ${zl(o.oplata)} przepada.`);
    }
  }
  for (const o of W.sedziowie) {
    if (o.skarga !== "zlozona" || (o.decyzja ?? 0) > s.kolejka) continue;
    if (o.ocena < 7.4 || (o.ocena < 7.8 && los() < 0.5)) { o.skarga = "uznana"; msg(s, `🧑‍⚖️ Kolegium Sędziów przyznało rację: ${o.sedzia} (ocena obserwatora ${o.ocena.toFixed(1)}) odsunięty od prowadzenia meczów na ${1 + Math.floor(los() * 3)} kolejki.`); }
    else { o.skarga = "oddalona"; const kara = Math.round(oplataSkargi(mk.poziom) / 2); mk.kasa -= kara; msg(s, `🧑‍⚖️ Kolegium oddaliło skargę na ${o.sedzia} — ocena obserwatora ${o.ocena.toFixed(1)}. Komisja Dyscyplinarna: upomnienie i ${zl(kara)} kary za publiczną krytykę sędziów.`); }
  }
  // zaległości płacowe (kasa pod kreską = pensje nie są wypłacane na czas)
  // pensje nie są wypłacane, gdy dług przekracza ~2 tygodnie płac (mały minus to bieżąca płynność, nie zaległość)
  const place = mk.zawodnicy.reduce((a, id) => a + (s.zawodnicy[id]?.pensja ?? 0), 0);
  if (mk.kasa < -Math.max(3000, place * 2)) W.zaleglosci++; else if (W.zaleglosci > 0 && mk.kasa >= 0) {
    if (W.zakazTransferow) msg(s, "✅ Zaległości wobec zawodników spłacone — Izba PZPN zdjęła zakaz transferów.");
    W.zaleglosci = 0; W.zakazTransferow = false; W.izba = [];
  }
  const kadra = mk.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean) as Zawodnik[];
  if (W.zaleglosci === 0) return;
  if (W.zaleglosci === 4) { msg(s, "💸 Miesiąc zaległości w wypłatach — szatnia jest wściekła, morale spada. Spłać pensje, zanim sprawy trafią do PZPN."); }
  if (W.zaleglosci >= 4) for (const z of kadra) z.morale = Math.max(0, z.morale - 2);
  if (W.zaleglosci >= 9) { // ponad 2 miesiące
    const zawodowi = kadra.filter((z) => z.kontraktTyp !== "amator" && !(W.izba ?? []).some((x) => x.zawodnik === z.id));
    if (zawodowi.length && los() < 0.3) {
      const z = pick(zawodowi); (W.izba ??= []).push({ zawodnik: z.id, decyzja: s.kolejka + 2 });
      msg(s, `📑 ${z.imie} ${z.nazwisko} złożył wniosek do Izby ds. Rozwiązywania Sporów Sportowych PZPN o zapłatę zaległości (ponad 2 miesiące).`);
    }
    const amatorzy = kadra.filter((z) => z.kontraktTyp === "amator");
    if (amatorzy.length && los() < 0.2) { const z = pick(amatorzy); odejdz(s, z); msg(s, `🚪 ${z.imie} ${z.nazwisko} (umowa amatorska) odchodzi z klubu — „nikt nie płaci za dojazdy od dwóch miesięcy”.`); }
  }
  for (const sp of W.izba ?? []) {
    if (sp.decyzja !== s.kolejka) continue;
    const z = s.zawodnicy[sp.zawodnik]; if (!z || z.klubId !== s.mojKlub) continue;
    if (!W.zakazTransferow) { W.zakazTransferow = true; msg(s, `⛔ Izba PZPN: nakaz zapłaty zaległości dla ${z.nazwisko} — do czasu spłaty klub ma ZAKAZ TRANSFERÓW (nie można rejestrować nowych zawodników).`); }
    if (los() < 0.5) { odejdz(s, z); msg(s, `📄 ${z.imie} ${z.nazwisko} rozwiązał kontrakt z winy klubu (zaległości > 2 mies.) i odchodzi jako wolny zawodnik.`); }
  }
}

function odejdz(s: StanGry, z: Zawodnik) {
  const mk = s.kluby[s.mojKlub];
  mk.zawodnicy = mk.zawodnicy.filter((id) => id !== z.id); z.klubId = null;
  s.taktyka.sklad = s.taktyka.sklad.filter((id) => id !== z.id);
  if ((s.taktyka as { rezerwowi?: string[] }).rezerwowi) (s.taktyka as { rezerwowi?: string[] }).rezerwowi = (s.taktyka as { rezerwowi?: string[] }).rezerwowi!.filter((id) => id !== z.id);
}

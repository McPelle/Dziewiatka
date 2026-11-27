// Okresy przygotowawcze: LATO (po sezonie) i ZIMA (po rundzie jesiennej) — urlop, przygotowania, sparingi, obozy, mecze testowe.
// Długości zależą od szczebla (KALENDARZ_SZCZEBLI w kalendarz.ts). Urlop można skrócić (dłuższe przygotowania, ale zawodnicy
// niezadowoleni). Obozy tylko w okresie przygotowawczym. Sparingi: kluby z różnych lig, zagraniczne, a w klasach B–okręgowej
// także ekipy orlikowe / „znajomych" (wyróżnieni do pozyskania za darmo); mecze testowe (nabór wolnych zawodników).
import { los, losInt, poisson, szansa, tasuj, wybierz, zl } from "./losuj";
import { autoSklad, silaSkladu } from "./mecz";
import { kontekstTreningu, rozwojTreningowy } from "./sezon";
import { generujKariere, kontraktTyp, dlugoscKontraktu, nowyZawodnik, pensjaDla, przejscieDoKlubu, KADRA } from "./swiat";
import { okresyDlaPoziomu } from "./kalendarz";
import { obserwujTestowanych, odswiezRynekTestow } from "./testy";
import type { StanGry, Zawodnik } from "./types";
import { opisAkt, planNa, wykonajAktywnosc } from "./planDnia";

export type FazaOkresu = "urlop" | "przygotowania";
export interface Sparing { dzien: number; rywal: string; typ: "klub" | "zagraniczny" | "orlik" | "test"; wynik?: string; wyroznieni?: string[] }
export interface Okres {
  rodzaj: "lato" | "zima"; faza: FazaOkresu; dzien: number; dniUrlopu: number; dniPrzygotowan: number; start: string;
  oboz?: { id: string; od: number; dni: number }; sparingi: Sparing[]; skroconyUrlop?: number; kandydaci?: string[];
}

export const OBOZY_PRZYG = [
  { id: "wlasne", nazwa: "Zgrupowanie na własnych obiektach", dni: 5, kosztF: 0, rozwoj: 0.15, zgranie: 2, kondycja: 1, morale: 0, opis: "Tanio, na miejscu — praca nad zgraniem, bez rewelacji." },
  { id: "morze", nazwa: "Obóz krajowy nad morzem", dni: 7, kosztF: 0.08, rozwoj: 0.25, zgranie: 3, kondycja: 1.5, morale: 1, opis: "Dobry balans: wydolność, zgranie, integracja." },
  { id: "gory", nazwa: "Obóz kondycyjny w górach", dni: 8, kosztF: 0.11, rozwoj: 0.3, zgranie: 2, kondycja: 2.5, morale: 0, opis: "Ciężka praca — najlepsza kondycja na sezon, zawodnicy narzekają na wysiłek." },
  { id: "zagr", nazwa: "Obóz zagraniczny (Turcja / Hiszpania)", dni: 10, kosztF: 0.25, rozwoj: 0.4, zgranie: 4, kondycja: 2, morale: 2, opis: "Najdroższy — ciepło, idealne boiska, sparingi z zagranicznymi rywalami. Zimą — ogromna przewaga." },
] as const;

const ZAGRANICZNI = ["FK Teplice", "Baník Ostrawa B", "MFK Karviná", "Spartak Trnawa B", "FK Sūduva", "Žalgiris Kowno B", "Energie Cottbus II", "Hansa Rostock II", "FC Erzgebirge Aue II", "Dynamo Kijów U-21", "Antalyaspor B", "Alanyaspor U-21", "CD Marbella", "UD Ibiza B", "SK Poprad", "FK Senica", "Tatran Prešov", "1. FC Slovácko B"];
const ORLIKOWE = ["Orlik Team", "Ekipa znajomych z osiedla", "Szóstka Orlikowa", "Podwórkowi All-Stars", "Liga Szóstek — wybrańcy", "Dzikie Orły (orlik)", "Oldboje i przyjaciele", "Drużyna z hali sportowej"];
const DNI = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

/** Czy w tej klasie dostępne są sparingi z ekipami orlikowymi i mecze testowe (klasa B → V liga / okręgowa). */
export function niskiSzczebel(s: StanGry): boolean {
  const n = (s.ligi[s.kluby[s.mojKlub].poziom - 1]?.nazwa ?? "").toLowerCase();
  return /klasa (a|b|c)|okręgow|v liga/.test(n) && !/iv liga/.test(n);
}
/** Mecze testowe i zawodnicy na testach: klasa B → IV liga (w III lidze i wyżej się tego nie praktykuje). */
export function testySzczebel(s: StanGry): boolean { return (s.kluby[s.mojKlub]?.poziom ?? 1) >= 5; }
export function rozpocznijOkres(s: StanGry, rodzaj: "lato" | "zima") {
  const o = okresyDlaPoziomu(s, s.kluby[s.mojKlub].poziom, rodzaj);
  s.okres = { rodzaj, faza: "urlop", dzien: 0, dniUrlopu: o.urlop, dniPrzygotowan: o.przygotowania, start: o.start.toISOString(), sparingi: [] };
  for (const id of s.kluby[s.mojKlub].zawodnicy) { const z = s.zawodnicy[id]; if (z) z.kondycja = Math.min(100, z.kondycja + 10); }
}
export function dataOkresu(s: StanGry, dzien?: number): Date {
  const o = s.okres!; const d = new Date(o.start); d.setDate(d.getDate() + (dzien ?? o.dzien)); return d;
}
export const nazwaDnia = (d: Date) => DNI[(d.getDay() + 6) % 7];
export function dniRazem(o: Okres) { return o.dniUrlopu + o.dniPrzygotowan; }

/** Skrócenie urlopu o `dni` (max połowa): dłuższe przygotowania, ale zawodnicy niezadowoleni (morale, relacja z trenerem). */
export function skrocUrlop(s: StanGry, dni: number): string | null {
  const o = s.okres; if (!o || o.faza !== "urlop") return "Urlop już się skończył.";
  const max = Math.floor(o.dniUrlopu / 2) - (o.skroconyUrlop ?? 0);
  const d = Math.min(dni, max);
  if (d <= 0) return "Nie można bardziej skrócić urlopu (maksymalnie o połowę).";
  o.dniUrlopu -= d; o.dniPrzygotowan += d; o.skroconyUrlop = (o.skroconyUrlop ?? 0) + d;
  for (const id of s.kluby[s.mojKlub].zawodnicy) {
    const z = s.zawodnicy[id]; if (!z) continue;
    const kara = d * (z.cechy?.includes("profesjonalista") ? 0.3 : z.wiek >= 30 ? 1 : 0.7);
    z.morale = Math.max(0, z.morale - kara); z.relacja = Math.max(0, (z.relacja ?? 60) - d * 0.5);
  }
  return null;
}
/** Wybór obozu (jeden na okres przygotowawczy). */
export function wybierzOboz(s: StanGry, id: string): string | null {
  const o = s.okres; if (!o) return "Obozy tylko w okresie przygotowawczym.";
  if (o.oboz) return "Obóz już zaplanowany w tym okresie.";
  const ob = OBOZY_PRZYG.find((x) => x.id === id)!;
  const k = s.kluby[s.mojKlub];
  const koszt = kosztObozuPrzyg(s, id);
  if (k.kasa < koszt) return `Brakuje ${zl(koszt - k.kasa)}.`;
  const od = Math.max(o.dzien + 1, o.dniUrlopu + 3);
  if (od + ob.dni > dniRazem(o)) return "Za mało dni do końca przygotowań na ten obóz.";
  k.kasa -= koszt;
  o.oboz = { id, od, dni: ob.dni };
  return null;
}
export function kosztObozuPrzyg(s: StanGry, id: string): number {
  const ob = OBOZY_PRZYG.find((x) => x.id === id)!;
  const k = s.kluby[s.mojKlub];
  const baza = [8_000_000, 2_000_000, 600_000, 200_000, 80_000, 35_000, 15_000, 7_000, 3_000][Math.min(8, k.poziom - 1)];
  return Math.round((baza * ob.kosztF) / 100) * 100;
}
/** Propozycje rywali sparingowych (różne typy). */
export function rywaleSparingowi(s: StanGry): { nazwa: string; typ: Sparing["typ"]; opis: string }[] {
  const k = s.kluby[s.mojKlub];
  const pula = Object.values(s.kluby).filter((x) => !x.pozaLiga && !x.pozaPiramida && x.id !== k.id && Math.abs(x.poziom - k.poziom) <= 2);
  const out: { nazwa: string; typ: Sparing["typ"]; opis: string }[] = tasuj(pula).slice(0, 5).map((x) => ({ nazwa: x.nazwa, typ: "klub", opis: s.ligi[x.poziom - 1]?.nazwa ?? "" }));
  out.push(...tasuj(ZAGRANICZNI).slice(0, 2).map((n) => ({ nazwa: n, typ: "zagraniczny" as const, opis: "rywal zagraniczny" })));
  if (niskiSzczebel(s)) out.push(...tasuj(ORLIKOWE).slice(0, 2).map((n) => ({ nazwa: n, typ: "orlik" as const, opis: "15–16 chłopaków spoza lig — wyróżnionych można pozyskać" })));
  if (testySzczebel(s)) out.push({ nazwa: "Mecz testowy — nabór wolnych zawodników", typ: "test", opis: "ok. 22 zawodników bez klubu; wybierasz, kogo podpisać (za darmo)" });
  return out;
}
export function zaplanujSparing(s: StanGry, rywal: string, typ: Sparing["typ"], dzien: number): string | null {
  const o = s.okres; if (!o) return "Sparingi planujesz w okresie przygotowawczym.";
  if (dzien < o.dniUrlopu) return "W trakcie urlopu nie gramy sparingów.";
  if (o.sparingi.some((x) => Math.abs(x.dzien - dzien) < 2)) return "Za blisko innego sparingu (min. 2 dni przerwy).";
  if (dzien >= dniRazem(o)) return "Ten termin wypada już po okresie przygotowawczym.";
  o.sparingi.push({ dzien, rywal, typ });
  o.sparingi.sort((a, b) => a.dzien - b.dzien);
  return null;
}

/** Rozegranie sparingu (bez wpływu na tabele i statystyki): zgranie/forma, zmęczenie, rzadko uraz; orlik/test — kandydaci do pozyskania. */
function rozegrajSparing(s: StanGry, sp: Sparing): string[] {
  const k = s.kluby[s.mojKlub];
  const sklad = autoSklad(s, k.id, s.taktyka.formacja);
  const sila = silaSkladu(s, sklad, s.taktyka.formacja);
  const moja = (sila.atak + sila.obrona) / 2;
  const ryw = sp.typ === "zagraniczny" ? moja + los(-4, 8) : sp.typ === "orlik" ? moja - los(4, 14) : sp.typ === "test" ? moja - los(8, 16)
    : (() => { const r = Object.values(s.kluby).find((x) => x.nazwa === sp.rywal); return r ? moja + (k.poziom - r.poziom) * 4 + los(-3, 3) : moja; })();
  const gd = poisson(Math.max(0.3, 1.4 * Math.exp((moja - ryw) / 12))), gg = poisson(Math.max(0.2, 1.3 * Math.exp((ryw - moja) / 12)));
  sp.wynik = `${gd}:${gg}`;
  const wp: string[] = [`🤝 Sparing: ${k.nazwa} — ${sp.rywal} ${gd}:${gg}`];
  for (const id of sklad) {
    const z = s.zawodnicy[id]; if (!z) continue;
    z.zgranie = Math.min(100, (z.zgranie ?? 70) + 3);
    z.forma = Math.max(-5, Math.min(5, z.forma + (gd > gg ? 0.4 : gd === gg ? 0.2 : -0.1)));
    z.kondycja = Math.max(45, z.kondycja - 10);
    if (z.kontuzja === 0 && szansa(0.012)) { z.kontuzja = losInt(1, 2); wp.push(`🤕 ${z.imie} ${z.nazwisko} doznał urazu w sparingu (${z.kontuzja} kol.).`); }
  }
  if (sp.typ === "orlik" || sp.typ === "test") {
    const ile = sp.typ === "test" ? losInt(3, 5) : losInt(1, 2);
    const nowi: string[] = [];
    for (let i = 0; i < ile; i++) {
      const z = nowyZawodnik(s, Math.min(12, k.poziom + (sp.typ === "test" ? 0 : 1)), wybierz(KADRA), { wiek: losInt(18, 30) });
      if (szansa(0.3)) z.umiej = Math.min(z.potencjal, z.umiej + los(2, 6)); // ktoś naprawdę się wyróżnił
      z.klubId = null; z.kontraktTyp = "amator";
      s.wolni.push(z.id); nowi.push(z.id);
    }
    sp.wyroznieni = nowi;
    s.okres!.kandydaci = [...(s.okres!.kandydaci ?? []), ...nowi];
    wp.push(`👀 Wyróżnili się: ${nowi.map((id) => `${s.zawodnicy[id].imie} ${s.zawodnicy[id].nazwisko} (${s.zawodnicy[id].poz}, ${Math.floor(s.zawodnicy[id].umiej)})`).join(", ")} — możesz ich pozyskać za darmo (bez klubu).`);
  }
  return wp;
}
/** Pozyskanie wyróżnionego (orlik / mecz testowy) — za darmo, umowa wg szczebla. */
export function pozyskajKandydata(s: StanGry, id: string): string | null {
  const z = s.zawodnicy[id]; const moj = s.kluby[s.mojKlub];
  if (!z || z.klubId) return "Zawodnik niedostępny.";
  if (moj.zawodnicy.length >= 26) return "Kadra pełna (max 26).";
  z.klubId = moj.id; z.kontraktTyp = kontraktTyp(moj.poziom); z.kontraktDo = s.sezon + dlugoscKontraktu(moj.poziom, false, z.wiek);
  z.pensja = pensjaDla(z.umiej, moj.poziom); moj.zawodnicy.push(z.id);
  s.wolni = s.wolni.filter((x) => x !== id);
  if (s.okres) s.okres.kandydaci = (s.okres.kandydaci ?? []).filter((x) => x !== id);
  z.kariera = generujKariere(s, z, moj.nazwa); przejscieDoKlubu(s, z, moj.nazwa);
  return null;
}

/** Jeden dzień okresu: urlop (odpoczynek) / przygotowania (trening, obóz, sparing). Zwraca wpisy raportu; null = koniec okresu. */
export function dzienOkresu(s: StanGry): { tytul: string; ikona: string; wpisy: string[] } | null {
  const o = s.okres; if (!o) return null;
  if (o.dzien >= dniRazem(o)) { s.okres = undefined; return null; }
  const kadra = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean) as Zawodnik[];
  let wynik: { tytul: string; ikona: string; wpisy: string[] } | undefined;
  if (o.dzien < o.dniUrlopu) {
    o.faza = "urlop";
    for (const z of kadra) { z.kondycja = Math.max(55, z.kondycja - 0.8); z.forma = z.forma * 0.97; z.morale = Math.min(100, z.morale + 0.3); }
    wynik = { tytul: `Urlop zawodników (dzień ${o.dzien + 1}/${o.dniUrlopu})`, ikona: "🏖", wpisy: o.dzien === 0 ? ["Zawodnicy rozjechali się na urlopy. Kondycja powoli spada, głowy odpoczywają."] : [] };
  } else {
    o.faza = "przygotowania";
    const ob = o.oboz && o.dzien >= o.oboz.od && o.dzien < o.oboz.od + o.oboz.dni ? OBOZY_PRZYG.find((x) => x.id === o.oboz!.id) : undefined;
    const sp = o.sparingi.find((x) => x.dzien === o.dzien && !x.wynik);
    const wpisy: string[] = [];
    if (o.dzien === o.dniUrlopu) { wpisy.push("Powrót z urlopu — testy wydolnościowe, pierwsze zajęcia."); for (const z of kadra) z.kondycja = Math.min(z.kondycja, 72); }
    if (testySzczebel(s) && o.dzien === o.dniUrlopu) {
      odswiezRynekTestow(s);
      const n = (s.testRynek ?? []).length;
      if (n) wpisy.push(`🧪 Na testy zgłosiło się ${n} zawodników bez klubu — weź ich na testy (Transfery → Testy). Będą trenować i grać sparingi z drużyną.`);
    }
    if (sp) { wpisy.push(...rozegrajSparing(s, sp)); wpisy.push(...obserwujTestowanych(s, 1)); }
    else if (!ob && planNa(s, dataOkresu(s)) && planNa(s, dataOkresu(s))!.rodzaj !== "sparing") {
      const akt = planNa(s, dataOkresu(s))!;
      wpisy.push(...obserwujTestowanych(s, 0.5));
      wpisy.push(...wykonajAktywnosc(s, akt, () => { const w: string[] = []; for (const z of kadra) { if (z.kontuzja === 0) rozwojTreningowy(s, z, 0.1, kontekstTreningu(s, z), (m) => w.push(m)); z.kondycja = Math.min(100, z.kondycja + 1.5); } return w; }));
      wynik = { tytul: `Plan dnia: ${opisAkt(akt).replace(/^\S+\s/, "")}`, ikona: "📝", wpisy };
    }
    else {
      wpisy.push(...obserwujTestowanych(s, 0.5));
      const frac = 0.1 + (ob?.rozwoj ?? 0) * 0.1;
      for (const z of kadra) { if (z.kontuzja === 0) rozwojTreningowy(s, z, frac, kontekstTreningu(s, z), (m) => wpisy.push(m)); }
      for (const z of kadra) { z.kondycja = Math.min(100, z.kondycja + 1.5 + (ob?.kondycja ?? 0)); z.zgranie = Math.min(100, (z.zgranie ?? 70) + (ob?.zgranie ?? 0) * 0.3); z.morale = Math.min(100, z.morale + (ob?.morale ?? 0) * 0.2); }
      wpisy.push(ob ? `${ob.nazwa}: dzień ${o.dzien - o.oboz!.od + 1}/${o.oboz!.dni} — ${ob.opis}` : "Trening przygotowawczy: wytrzymałość, siła, gierki.");
    }
    if ((o.dzien + 1) % 7 === 0) wpisy.push(`📊 Kondycja drużyny: ${Math.round(kadra.reduce((a, z) => a + z.kondycja, 0) / Math.max(1, kadra.length))}% · zgranie ${Math.round(kadra.reduce((a, z) => a + (z.zgranie ?? 70), 0) / Math.max(1, kadra.length))}%`);
    wynik ??= { tytul: sp ? `Sparing: ${sp.rywal}` : ob ? `Obóz — ${ob.nazwa}` : `Przygotowania (dzień ${o.dzien - o.dniUrlopu + 1}/${o.dniPrzygotowan})`, ikona: sp ? "🤝" : ob ? "⛺" : "🏃", wpisy };
  }
  o.dzien++;
  if (o.dzien >= dniRazem(o)) { wynik!.wpisy.push(`✅ Koniec okresu przygotowawczego — ${o.rodzaj === "lato" ? "start nowego sezonu" : "start rundy wiosennej"}!`); s.okres = undefined; }
  return wynik!;
}

// Sztab szkoleniowy KAŻDEGO klubu (Ekstraklasa→B klasa, oba województwa) — specjaliści działają jak piłkarze:
// mają kontrakt (zawodowy/półprofesjonalny/amator wg szczebla), wiek, wygasającą umowę i rynek wolnych.
// Po wygaśnięciu bez przedłużenia odchodzą (wracają na rynek), a klub zatrudnia kogoś nowego.
import { los, losInt, szansa, wybierz } from "./losuj";
import { IMIONA, NAZWISKA } from "../data/nazwy";
import { NARODOWOSCI } from "../data/narodowosci";
import { jezykKraju } from "./jezyki";
import type { Klub, KontraktTyp, Pracownik, RolaSztabu, StanGry } from "./types";

// Lokalne odpowiedniki reguł z swiat.ts (świadomie niezależne — sztab nie importuje swiat, by uniknąć cyklu).
function noweIdSz(s: StanGry): string { s.licznikId++; return `sz${s.licznikId.toString(36)}`; }
/** Typ kontraktu wg szczebla — identycznie jak u piłkarzy (kontraktTyp w swiat.ts). */
function kontraktTyp(poziom: number): KontraktTyp { return poziom <= 3 ? "zawodowy" : poziom <= 6 ? "polprofesjonalny" : "amator"; }
/** Długość umowy wg szczebla — jak u piłkarzy (dlugoscKontraktu w swiat.ts, bez modyfikatora wieku). */
function dlugoscKontraktu(poziom: number): number { return poziom <= 3 ? losInt(1, 4) : poziom <= 6 ? losInt(1, 3) : losInt(1, 2); }

export const ROLE_SZTABU: { rola: RolaSztabu; nazwa: string; opis: string; ikona: string }[] = [
  { rola: "asystent", nazwa: "Asystent trenera", opis: "Szybszy rozwój zawodników i lepsze ustawienia.", ikona: "📋" },
  { rola: "bramkarzy", nazwa: "Trener bramkarzy", opis: "Pewniejsza obrona i rozwój bramkarzy.", ikona: "🧤" },
  { rola: "fizjo", nazwa: "Fizjoterapeuta", opis: "Mniej i krótsze kontuzje, szybsza regeneracja.", ikona: "🩹" },
  { rola: "kondycja", nazwa: "Trener przygotowania fiz.", opis: "Mniej zmęczenia w meczu, lepsza kondycja.", ikona: "💪" },
  { rola: "analityk", nazwa: "Analityk", opis: "Lepsze przygotowanie taktyczne do meczu.", ikona: "📊" },
  { rola: "skaut", nazwa: "Skaut", opis: "Sieć skautów wyszukująca talenty z całego świata.", ikona: "🔎" },
];

export const NAZWA_ROLI: Record<RolaSztabu, string> = Object.fromEntries(ROLE_SZTABU.map((r) => [r.rola, r.nazwa])) as Record<RolaSztabu, string>;

// Pensja członka sztabu wg poziomu (1–5) i poziomu klubu (lepsze kluby płacą więcej, ale stać je).
const PENSJA_BAZA = [250, 600, 1400, 3200, 7000]; // zł/kolejkę dla poziomu 1..5 (klub ~III-liga)
export function pensjaSztabu(poziom: number, poziomKlubu: number): number {
  const mnoznikKlub = poziomKlubu <= 1 ? 3.2 : poziomKlubu <= 3 ? 2 : poziomKlubu <= 5 ? 1 : 0.5;
  return Math.max(120, Math.round((PENSJA_BAZA[Math.max(0, Math.min(4, poziom - 1))] * mnoznikKlub) / 10) * 10);
}

/** Które role obsadza klub danego szczebla (wyżej = pełny sztab, amatorzy = tylko podstawa). */
export function roleDlaPoziomu(poziom: number): RolaSztabu[] {
  if (poziom <= 1) return ["asystent", "bramkarzy", "fizjo", "kondycja", "analityk", "skaut"]; // Ekstraklasa
  if (poziom === 2) return ["asystent", "bramkarzy", "fizjo", "kondycja", "analityk", "skaut"]; // I liga
  if (poziom === 3) return ["asystent", "bramkarzy", "fizjo", "kondycja", "analityk"]; // II liga
  if (poziom === 4) return ["asystent", "bramkarzy", "fizjo", "kondycja"]; // III liga
  if (poziom === 5) return ["asystent", "bramkarzy", "fizjo"]; // IV liga
  if (poziom === 6) return ["asystent", "fizjo"]; // V liga / okręgówka
  if (poziom === 7) return ["asystent"]; // klasa A
  return []; // klasa B/C — amatorzy, zwykle bez etatowego sztabu (gracz może zatrudnić)
}

/** Sufit jakości specjalistów dostępnych klubowi danego szczebla. */
function sufitPoziomu(poziomKlubu: number): number {
  return poziomKlubu <= 2 ? 5 : poziomKlubu <= 4 ? 4 : poziomKlubu <= 6 ? 3 : 2;
}

/** Długość kontraktu sztabu/trenera (jak u piłkarzy — wg szczebla klubu). */
export function dlugoscKontraktuSztabu(poziomKlubu: number): number {
  return dlugoscKontraktu(poziomKlubu);
}

/** Nowy specjalista (jak nowy zawodnik): id, wiek, poziom wg sufitu, pensja. `wolny` = bez kontraktu (rynek). */
export function nowyPracownik(s: StanGry, rola: RolaSztabu, poziomKlubu: number, opts: { wolny?: boolean; poziom?: number } = {}): Pracownik {
  const sufit = sufitPoziomu(poziomKlubu);
  const poziom = opts.poziom ?? Math.max(1, Math.min(sufit, Math.round(los(1, sufit + 0.4))));
  const p: Pracownik = {
    id: noweIdSz(s),
    imie: wybierz(IMIONA),
    nazwisko: wybierz(NAZWISKA),
    rola,
    poziom,
    pensja: pensjaSztabu(poziom, poziomKlubu),
    wiek: losInt(32, 62),
    lata: losInt(1, 25),
  };
  // cudzoziemiec w sztabie — częściej w Ekstraklasie i I lidze (osoby wygenerowane)
  const szObcy = opts.wolny ? 0.14 : [0.3, 0.22, 0.15, 0.08, 0.05, 0.03, 0.02, 0.015, 0.01][Math.min(8, poziomKlubu - 1)];
  if (szansa(szObcy)) {
    const nisko = poziomKlubu >= 6;
    const pula = NARODOWOSCI.filter((x) => x.kraj !== "Polska" && (!nisko || ["Ukraina", "Słowacja", "Czechy", "Białoruś"].includes(x.kraj)));
    const n = pula[Math.floor(Math.random() * pula.length)] ?? NARODOWOSCI[0];
    p.imie = wybierz(n.imiona); p.nazwisko = wybierz(n.nazwiska); p.kraj = n.kraj;
    p.polski = nisko ? losInt(50, 95) : ["Ukraina", "Słowacja", "Czechy", "Białoruś"].includes(n.kraj) ? losInt(25, 85) : losInt(0, 45);
  }
  if (!opts.wolny) {
    p.kontraktTyp = kontraktTyp(poziomKlubu);
    p.kontraktDo = s.sezon + dlugoscKontraktuSztabu(poziomKlubu);
  }
  return p;
}

/** Obsadza sztab klubu (wszystkie role właściwe dla szczebla) — wołane dla KAŻDEGO klubu przy tworzeniu świata. */
export function obsadzSztabKlubu(s: StanGry, klub: Klub): void {
  const role = roleDlaPoziomu(klub.poziom);
  if (!role.length) { klub.sztab = {}; return; }
  const sz: NonNullable<Klub["sztab"]> = {};
  for (const rola of role) {
    // nie każdy niższy klub ma komplet — czasem wakat (realizm amatorskich klubów)
    if (klub.poziom >= 6 && szansa(0.3)) continue;
    sz[rola] = nowyPracownik(s, rola, klub.poziom);
  }
  klub.sztab = sz;
}

/** Poziom specjalisty w danej roli (0 = wakat). Tylko klub gracza. */
export function poziomSztabu(s: StanGry, rola: RolaSztabu): number {
  const p = s.kluby[s.mojKlub]?.sztab?.[rola];
  if (!p) return 0;
  // cudzoziemiec słabo mówiący po polsku działa słabiej (chyba że jest tłumacz jego języka); skaut — bez znaczenia
  if (!p.kraj || p.kraj === "Polska" || rola === "skaut" || (p.polski ?? 0) >= 55) return p.poziom;
  const tl = (s.tlumacze ?? []).some((t) => t.jezyki.includes(jezykPracownika(p))) || !!s.tlumacz;
  const f = tl ? 0.9 : 0.55 + ((p.polski ?? 0) / 55) * 0.4;
  return Math.max(1, Math.round(p.poziom * f));
}
/** Język ojczysty członka sztabu (kod). */
export const jezykPracownika = (p: Pracownik): string => jezykKraju(p.kraj);


/** Łączny koszt sztabu na kolejkę (klub gracza). */
export function kosztSztabuNaKolejke(s: StanGry): number {
  const sz = s.kluby[s.mojKlub]?.sztab;
  if (!sz) return 0;
  return Object.values(sz).reduce((a, p) => a + (p?.pensja ?? 0), 0);
}

/** Uzupełnia rynek wolnych specjalistów (bez klubu) do ~14 osób, mieszane role i poziomy. */
export function odswiezRynekSztabu(s: StanGry): void {
  s.sztabWolni ??= [];
  const role = ROLE_SZTABU.map((r) => r.rola);
  let prob = 0;
  while (s.sztabWolni.length < 14 && prob < 80) {
    prob++;
    const rola = wybierz(role);
    const poziomUkl = s.kluby[s.mojKlub]?.poziom ?? 4;
    // rynek ma rozrzut: od słabszych po mocnych (sporadycznie klasa topowa)
    const poziom = Math.max(1, Math.min(5, Math.round(los(1, sufitPoziomu(poziomUkl) + 1))));
    s.sztabWolni.push(nowyPracownik(s, rola, poziomUkl, { wolny: true, poziom }));
  }
}

/** Rynek kandydatów na daną rolę — wolni specjaliści z puli (+ dobór, gdy pusto). Posortowani malejąco jakością. */
export function rynekSztabu(s: StanGry, rola: RolaSztabu): Pracownik[] {
  s.sztabWolni ??= [];
  odswiezRynekSztabu(s);
  const poziomKlubu = s.kluby[s.mojKlub].poziom;
  let kand = s.sztabWolni.filter((p) => p.rola === rola);
  // zawsze pokaż min. 4 opcje
  while (kand.length < 4) { const p = nowyPracownik(s, rola, poziomKlubu, { wolny: true }); s.sztabWolni.push(p); kand.push(p); }
  // pensja pokazywana wg możliwości klubu zatrudniającego
  return kand.map((p) => ({ ...p, pensja: pensjaSztabu(p.poziom, poziomKlubu) })).sort((a, b) => b.poziom - a.poziom);
}

/** Zatrudnienie specjalisty z rynku (kontrakt na `lata` sezonów). Premia za podpis = 4 kolejki pensji. */
export function zatrudnijSztab(s: StanGry, rola: RolaSztabu, kand: Pracownik, lata = 2): string | null {
  const klub = s.kluby[s.mojKlub];
  if (!klub.sztab) klub.sztab = {};
  const pensja = pensjaSztabu(kand.poziom, klub.poziom);
  const premia = pensja * 4;
  if (klub.kasa < premia) return `Brakuje na premię za podpis (${premia} zł).`;
  klub.kasa -= premia;
  // dotychczasowy specjalista w tej roli → odprawa + wraca na rynek wolnych
  const poprzedni = klub.sztab[rola];
  if (poprzedni) oddajNaRynek(s, poprzedni, true);
  // usuń kandydata z puli wolnych (po id)
  s.sztabWolni = (s.sztabWolni ?? []).filter((p) => p.id !== kand.id);
  klub.sztab[rola] = {
    ...kand, rola, pensja,
    kontraktTyp: kontraktTyp(klub.poziom),
    kontraktDo: s.sezon + Math.max(1, lata),
  };
  return null;
}

/** Przedłużenie kontraktu obecnego specjalisty (jak u piłkarzy) — premia za podpis = 3 kolejki pensji. */
export function przedluzSztab(s: StanGry, rola: RolaSztabu, lata = 2): string | null {
  const klub = s.kluby[s.mojKlub];
  const p = klub.sztab?.[rola];
  if (!p) return "Brak specjalisty w tej roli.";
  const premia = p.pensja * 3;
  if (klub.kasa < premia) return `Brakuje na premię za przedłużenie (${premia} zł).`;
  klub.kasa -= premia;
  p.kontraktDo = Math.max(p.kontraktDo ?? s.sezon, s.sezon) + Math.max(1, lata);
  p.kontraktTyp = kontraktTyp(klub.poziom);
  return null;
}

/** Zwolnienie specjalisty — wraca na rynek wolnych (z odprawą). */
export function zwolnijSztab(s: StanGry, rola: RolaSztabu) {
  const klub = s.kluby[s.mojKlub];
  const p = klub.sztab?.[rola];
  if (!p) return;
  oddajNaRynek(s, p, true);
  delete klub.sztab![rola];
}

/** Specjalista wraca na rynek wolnych (kończy kontrakt). `odprawa` = wypłata odprawy przez klub gracza. */
function oddajNaRynek(s: StanGry, p: Pracownik, odprawa: boolean) {
  const klub = s.kluby[s.mojKlub];
  if (odprawa && p.kontraktTyp !== "amator") {
    const latDoKonca = Math.max(0, (p.kontraktDo ?? s.sezon) - s.sezon);
    klub.kasa -= Math.round(p.pensja * (3 + latDoKonca * 4));
  }
  const wolny: Pracownik = { ...p, kontraktTyp: undefined, kontraktDo: undefined };
  s.sztabWolni ??= [];
  if (!s.sztabWolni.some((x) => x.id === wolny.id)) s.sztabWolni.push(wolny);
}

/** Nowy sezon dla sztabu WSZYSTKICH klubów: wygaśnięcia, przedłużenia, rotacja, starzenie. Wołane po s.sezon++. */
export function sztabNowySezon(s: StanGry): void {
  for (const klub of Object.values(s.kluby)) {
    const sz = klub.sztab;
    if (!sz) continue;
    for (const rola of Object.keys(sz) as RolaSztabu[]) {
      const p = sz[rola];
      if (!p) continue;
      if (p.wiek != null) p.wiek++;
      if (p.lata != null) p.lata++;
      const wygasl = p.kontraktTyp !== "amator" && p.kontraktDo != null && p.kontraktDo < s.sezon;
      const emerytura = (p.wiek ?? 0) >= 64;
      if (klub.id === s.mojKlub) {
        // Klub gracza: wygasła umowa bez przedłużenia = specjalista odchodzi (wraca na rynek). Gracz zatrudnia nowego.
        if (wygasl || emerytura) {
          const powod = emerytura ? "zakończył karierę" : "wygasł kontrakt — bez przedłużenia odszedł";
          oddajNaRynek(s, p, false);
          delete sz[rola];
          wiad(s, `👔 ${p.imie} ${p.nazwisko} (${NAZWA_ROLI[rola]}) ${powod}. Zatrudnij następcę z rynku sztabu.`);
        }
        continue;
      }
      // Kluby AI: wygasła umowa → zwykle przedłużenie, czasem rotacja (nowy specjalista).
      if (emerytura || (wygasl && szansa(0.3))) {
        sz[rola] = nowyPracownik(s, rola, klub.poziom);
      } else if (wygasl) {
        p.kontraktDo = s.sezon + dlugoscKontraktu(klub.poziom);
        p.kontraktTyp = kontraktTyp(klub.poziom);
      }
    }
  }
  odswiezRynekSztabu(s);
}

function wiad(s: StanGry, tekst: string) { s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst }); }

/** Specjaliści klubu gracza z wygasającą umową (kontrakt kończy się w tym sezonie). */
export function sztabWygasajacy(s: StanGry): { rola: RolaSztabu; p: Pracownik }[] {
  const sz = s.kluby[s.mojKlub]?.sztab ?? {};
  const out: { rola: RolaSztabu; p: Pracownik }[] = [];
  for (const rola of Object.keys(sz) as RolaSztabu[]) {
    const p = sz[rola];
    if (p && p.kontraktDo != null && p.kontraktDo <= s.sezon) out.push({ rola, p });
  }
  return out;
}

// ——— Mnożniki efektów (czytane przez silnik meczu/sezonu); 0 = brak specjalisty ———
/** Mnożnik szansy kontuzji (fizjo zmniejsza). */
export const modKontuzja = (s: StanGry) => 1 - poziomSztabu(s, "fizjo") * 0.1;        // lvl5 = −50%
/** Mnożnik spadku kondycji w meczu (kondycja + fizjo zmniejszają). */
export const modZmeczenie = (s: StanGry) => 1 - (poziomSztabu(s, "kondycja") * 0.07 + poziomSztabu(s, "fizjo") * 0.02);
/** Bonus tygodniowej regeneracji kondycji (pkt). */
export const bonusRegeneracji = (s: StanGry) => poziomSztabu(s, "kondycja") * 2 + poziomSztabu(s, "fizjo") * 1.5;
/** Mnożnik rozwoju zawodników (asystent). */
export const modRozwoj = (s: StanGry) => 1 + poziomSztabu(s, "asystent") * 0.06;
/** Mnożnik rozwoju bramkarzy (trener bramkarzy — dokładany do asystenta). */
export const modRozwojBR = (s: StanGry) => poziomSztabu(s, "bramkarzy") * 0.08;
/** Skrócenie kontuzji o tyle kolejek (fizjo), min efekt 0. */
export const skrocenieKontuzji = (s: StanGry) => (poziomSztabu(s, "fizjo") >= 3 ? 1 : 0);

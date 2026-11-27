// Extranet PZPN i karty zawodników (#79) + certyfikat ITC dla zawodników z zagranicy (#126).
//
// Realia:
// • Extranet PZPN — system, w którym klub zgłasza/potwierdza zawodników (zmiana przynależności, uprawnienie do gry);
//   potwierdzenia dokonuje właściwy związek (ZPN / PZPN). Bez potwierdzenia zawodnik nie jest uprawniony do gry.
// • Badania lekarskie: wg rozporządzenia MZ (Dz.U. 2019 poz. 395) orzeczenie o zdolności do uprawiania sportu wydaje się
//   po badaniach okresowych co 12 miesięcy; część badań co 6 miesięcy u zawodników do 16. r.ż. (gdy wymaga tego stan
//   zdrowia/specyfika sportu). Zawodnik bez ważnego orzeczenia nie może być wpisany do protokołu meczowego.
//   Szczebel zawodowy (wymogi licencyjne/UEFA) — dodatkowo pakiet kardiologiczny (EKG, ECHO).
// • ITC (International Transfer Certificate) — zawodnik ostatnio zarejestrowany w innym kraju może zostać uprawniony
//   dopiero po wydaniu ITC przez poprzedni związek przez FIFA TMS / FIFA Connect. Poprzedni związek ma 7 dni na odpowiedź;
//   brak odpowiedzi → nowy związek może zarejestrować zawodnika tymczasowo. Niepełnoletni (< 18) — transfer
//   międzynarodowy wymaga zgody FIFA (art. 19 RSTP, ochrona małoletnich).
//
// UPROSZCZENIA GRY (zaznaczone wprost):
// • ważność: 12 mies. (365 dni), zawodnicy < 16 lat: 6 mies. (183 dni) — dla całego orzeczenia;
// • koszty badań to szacunki gry (nie cennik), U-23 bez kosztu (orzekanie dla młodzieży do 21 r.ż. i zawodników 21–23
//   lat finansuje NFZ w poradniach medycyny sportowej — w grze: zawsze 0 zł);
// • badania „na jutro": wynik dzień po wizycie; 3% szans na skierowanie na dodatkowe badania (+5 dni);
// • kluby zawodowe (Ekstraklasa–II liga) mają dział medyczny: odnawia badania sam, 10 dni przed wygaśnięciem;
//   w klubach amatorskich robi to gracz (Extranet / dzień „Badania medyczne") albo kierownik drużyny z włączonym „auto";
// • ITC: 1–7 dni (po 7 dniach rejestracja tymczasowa); małoletni: 14–30 dni (zgoda FIFA) — długości to model gry;
// • „z zagranicy" = cudzoziemiec, którego poprzedni klub w karierze nie jest klubem z polskiej piramidy gry
//   (albo bez historii klubowej w Polsce);
// • zasady dotyczą tylko Twojego klubu (kluby AI pilnują dokumentów same).
import { dateKolejki, kalendarzSzczebla } from "./kalendarz";
import { losInt, szansa, zl } from "./losuj";
import type { StanGry, Zawodnik } from "./types";

export interface KartaZawodnika {
  potwierdzony: number;          // nr dnia, od którego zawodnik jest potwierdzony w Extranecie (uprawniony)
  badaniaDo: number;             // nr dnia — ostatni dzień ważności orzeczenia lekarskiego (0 = brak badań)
  badaniaTermin?: number;        // zaplanowane badania (nr dnia wizyty); wynik następnego dnia
  ostrzezony?: number;           // badaniaDo, o którego wygaśnięciu już ostrzeżono (ujemne = komunikat o wygaśnięciu wysłany)
  dodatkowe?: boolean;           // skierowanie na dodatkowe badania w toku
  itc?: { wniosek: number; decyzja: number; kraj: string; maloletni: boolean; status: "oczekuje" | "wydany" | "tymczasowa" };
}
export interface StanExtranetu {
  dzis: number; karty: Record<string, KartaZawodnika>; klub: string;
  autoBadania?: boolean; // kierownik drużyny sam umawia badania 7 dni przed wygaśnięciem (koszt jak zwykle)
}

/** Pole stanu gry (do dodania w StanGry: `extranet?: import("./extranet").StanExtranetu`). */
type SX = StanGry & { extranet?: StanExtranetu };
export const extranetStan = (s: StanGry) => (s as SX).extranet;

const PREFIKS = "📋 Extranet:";
const wiad = (s: StanGry, t: string) => { s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: t }); s.wiadomosci = s.wiadomosci.slice(0, 60); };

/** Data „dziś" w kalendarzu gry (okres przygotowawczy albo tydzień kolejki: poniedziałek = mecz − 5 dni + dzień tygodnia). */
export function dataGry(s: StanGry): Date {
  if (s.okres) { const d = new Date(s.okres.start); d.setDate(d.getDate() + s.okres.dzien); return d; }
  const lg = s.ligi[(s.kluby[s.mojKlub]?.poziom ?? 1) - 1];
  const n = Math.max(1, lg?.terminarz.length ?? 30);
  const d = dateKolejki(s.sezon, n, Math.min(s.kolejka, n - 1), kalendarzSzczebla(lg?.nazwa ?? "", lg?.poziom ?? 1));
  d.setDate(d.getDate() - 5 + Math.min(6, s.dzien ?? 0) + (s.koniecSezonu ? 7 : 0));
  return d;
}
export const nrDnia = (d: Date) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
export function ustawAutoBadania(s: StanGry, wl: boolean) { const e = extranetStan(s); if (e) e.autoBadania = wl; }
export const dataZNr = (n: number) => { const d = new Date(n * 86400000); return `${d.getUTCDate()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${d.getUTCFullYear()}`; };

export const waznoscBadan = (z: Zawodnik) => (z.wiek < 16 ? 183 : 365);
export function kosztBadan(s: StanGry, z: Zawodnik): number {
  if (z.wiek <= 23) return 0; // NFZ — poradnia medycyny sportowej (patrz komentarz na górze)
  const p = s.kluby[s.mojKlub]?.poziom ?? 9;
  return p <= 3 ? 900 : p <= 5 ? 300 : 180; // szacunek gry: zawodowcy z EKG/ECHO, amatorzy — podstawowy pakiet
}

/** Czy zawodnik ostatnio był zarejestrowany za granicą (model gry — patrz komentarz na górze). */
function zZagranicy(s: StanGry, z: Zawodnik, nazwyKlubow: () => Set<string>): boolean {
  if (!z.kraj || z.kraj === "Polska") return false;
  const moj = s.kluby[s.mojKlub]?.nazwa;
  const poprz = [...(z.kariera ?? [])].reverse().find((w) => w.klub && w.klub !== moj);
  return !poprz || !nazwyKlubow().has(poprz.klub);
}

/** Nowa karta dla zawodnika, który właśnie pojawił się w kadrze. */
function nowaKarta(s: StanGry, z: Zawodnik, dzis: number, start: boolean, nazwyKlubow: () => Set<string>): KartaZawodnika {
  // start kariery: większość kadry przeszła badania okresowe przed sezonem (ważne do następnego lata), reszta w innych terminach
  if (start) return { potwierdzony: dzis - 30, badaniaDo: dzis + (szansa(0.8) ? losInt(Math.min(300, waznoscBadan(z) - 20), waznoscBadan(z) - 5) : losInt(25, waznoscBadan(z) - 5)) };
  // transfer przez negocjacje: badania medyczne i rejestracja w Extranecie już zrobione (transfery.ts)
  const zNegocjacji = (s.negocjacje ?? []).some((n) => n.zawodnikId === z.id && n.etap === "zakonczona");
  const k: KartaZawodnika = zNegocjacji
    ? { potwierdzony: dzis, badaniaDo: dzis + waznoscBadan(z) }
    : { potwierdzony: dzis + 1, badaniaDo: z.wiek <= 19 || szansa(0.5) ? dzis + losInt(20, waznoscBadan(z) - 20) : 0 }; // wniosek w Extranecie — potwierdzenie jutro
  if (zZagranicy(s, z, nazwyKlubow)) {
    const maloletni = z.wiek < 18;
    const ile = maloletni ? losInt(14, 30) : szansa(0.7) ? losInt(1, 4) : losInt(5, 7);
    k.itc = { wniosek: dzis, decyzja: dzis + ile, kraj: z.kraj!, maloletni, status: "oczekuje" };
  }
  return k;
}

export type PowodNieuprawnienia = "potwierdzenie" | "badania" | "itc";
/** Dlaczego zawodnik Twojego klubu nie jest uprawniony do gry (null = uprawniony). Tanie — do wołania w pętlach. */
export function powodNieuprawnienia(s: StanGry, z: Zawodnik): PowodNieuprawnienia | null {
  const e = extranetStan(s);
  if (!e) return null;
  const k = e.karty[z.id]; // karty istnieją tylko dla kadry Twojego klubu
  if (!k) return null;
  if (k.itc?.status === "oczekuje") return "itc";
  if (k.potwierdzony > e.dzis) return "potwierdzenie";
  if (k.badaniaDo < e.dzis) return "badania";
  return null;
}
export const uprawniony = (s: StanGry, z: Zawodnik) => powodNieuprawnienia(s, z) === null;
export const OPIS_POWODU: Record<PowodNieuprawnienia, string> = {
  potwierdzenie: `${PREFIKS} czeka na potwierdzenie w Extranecie`,
  badania: `${PREFIKS} brak ważnych badań lekarskich`,
  itc: `${PREFIKS} czeka na certyfikat ITC (FIFA)`,
};

/** Główna aktualizacja (dzień/kolejka): nowe karty, wyniki badań, decyzje ITC, dział medyczny klubów zawodowych,
 *  ostrzeżenia i wpisy do s.niedostepni (dzięki temu skład/asystent/UI omijają nieuprawnionych bez zmian w silniku). */
export function aktualizujExtranet(s: StanGry) {
  const klub = s.kluby[s.mojKlub];
  if (!klub || s.zwolniony) return;
  let dzis = nrDnia(dataGry(s));
  const sx = s as SX;
  const start = !sx.extranet || sx.extranet.klub !== s.mojKlub; // nowa kariera / nowy klub — karty „zastane" są w porządku
  const e = start ? (sx.extranet = { dzis, karty: {}, klub: s.mojKlub }) : sx.extranet!;
  dzis = e.dzis = start ? dzis : Math.max(e.dzis, dzis); // kalendarz idzie tylko do przodu (styk okresu przygotowawczego z 1. kolejką bywa przesunięty o kilka dni)
  let nazwy: Set<string> | undefined;
  const nazwyKlubow = () => (nazwy ??= new Set(Object.values(s.kluby).filter((k) => !k.pozaPiramida).map((k) => k.nazwa)));
  const kadra = new Set(klub.zawodnicy);
  for (const id of Object.keys(e.karty)) if (!kadra.has(id)) delete e.karty[id];
  const wygasa: Zawodnik[] = [], wygasly: string[] = [], itcWydane: string[] = [], odnowione: string[] = [];
  let kosztAuto = 0;
  for (const id of klub.zawodnicy) {
    const z = s.zawodnicy[id]; if (!z) continue;
    let k = e.karty[id];
    if (!k) {
      k = e.karty[id] = nowaKarta(s, z, dzis, start, nazwyKlubow);
      if (k.itc) wiad(s, `🌍 ${z.imie} ${z.nazwisko} był ostatnio zarejestrowany za granicą (${k.itc.kraj}) — PZPN wystąpił przez FIFA TMS o certyfikat ITC${k.itc.maloletni ? " (zawodnik małoletni: wymagana zgoda FIFA, art. 19 RSTP — potrwa dłużej)" : ""}. Do czasu wydania nie może grać.`);
      else if (!start && k.badaniaDo < dzis) wiad(s, `🩺 ${z.imie} ${z.nazwisko} nie ma ważnych badań lekarskich — umów badania (Extranet), inaczej nie wpiszesz go do protokołu.`);
    }
    if (k.badaniaTermin !== undefined && k.badaniaTermin < dzis) {
      if (szansa(0.03) && !k.dodatkowe) { k.badaniaTermin = dzis + 4; k.dodatkowe = true; wiad(s, `🩺 ${z.imie} ${z.nazwisko}: lekarz skierował na dodatkowe badania (np. ECHO serca) — orzeczenie za kilka dni.`); }
      else { k.badaniaDo = k.badaniaTermin + 1 + waznoscBadan(z); k.badaniaTermin = undefined; k.ostrzezony = undefined; k.dodatkowe = undefined; }
    }
    if (k.itc?.status === "oczekuje" && k.itc.decyzja <= dzis) {
      k.itc.status = !k.itc.maloletni && k.itc.decyzja - k.itc.wniosek >= 7 ? "tymczasowa" : "wydany";
      itcWydane.push(`${z.imie} ${z.nazwisko}${k.itc.status === "tymczasowa" ? " (rejestracja tymczasowa — brak odpowiedzi związku w 7 dni)" : ""}`);
      if (k.potwierdzony > dzis) k.potwierdzony = dzis;
    }
    // dział medyczny klubu zawodowego (albo kierownik drużyny z włączonym „auto") odnawia orzeczenia sam
    if ((klub.poziom <= 3 || e.autoBadania) && k.badaniaTermin === undefined && k.badaniaDo - dzis <= (klub.poziom <= 3 ? 10 : 7)) {
      k.badaniaTermin = dzis; kosztAuto += kosztBadan(s, z); odnowione.push(z.nazwisko);
    }
    if (k.badaniaTermin === undefined && k.badaniaDo >= dzis && k.badaniaDo - dzis <= 14 && k.ostrzezony !== k.badaniaDo) { k.ostrzezony = k.badaniaDo; wygasa.push(z); }
    else if (k.badaniaTermin === undefined && k.badaniaDo > 0 && k.badaniaDo < dzis && k.ostrzezony !== -k.badaniaDo) { k.ostrzezony = -k.badaniaDo; wygasly.push(z.nazwisko); }
  }
  if (kosztAuto > 0 || odnowione.length) { klub.kasa -= kosztAuto; wiad(s, `🩺 Dział medyczny odnowił badania okresowe: ${odnowione.join(", ")}${kosztAuto ? ` (${zl(kosztAuto)})` : ""}.`); }
  if (itcWydane.length) wiad(s, `✅ FIFA TMS: certyfikat ITC — ${itcWydane.join("; ")}. Zawodnik potwierdzony w Extranecie, może grać.`);
  if (wygasly.length) wiad(s, `⛔ Extranet: wygasły badania lekarskie — ${wygasly.join(", ")}. Do czasu nowego orzeczenia nie mogą być wpisani do protokołu meczowego.`);
  if (wygasa.length) wiad(s, `🩺 Extranet: wkrótce wygasają badania lekarskie — ${wygasa.map((z) => `${z.nazwisko} (do ${dataZNr(e.karty[z.id].badaniaDo)})`).join(", ")}. Umów badania albo zaplanuj „Badania medyczne" w kalendarzu.`);
  synchronizujNiedostepnych(s);
}

/** Wpisy w s.niedostepni dla nieuprawnionych (tylko nasze — z prefiksem; cudzych powodów nie nadpisujemy). */
export function synchronizujNiedostepnych(s: StanGry) {
  const klub = s.kluby[s.mojKlub]; if (!klub) return;
  for (const id of Object.keys(s.niedostepni)) if (s.niedostepni[id]?.startsWith(PREFIKS)) delete s.niedostepni[id];
  for (const id of klub.zawodnicy) {
    const z = s.zawodnicy[id]; if (!z || s.niedostepni[id]) continue;
    const p = powodNieuprawnienia(s, z);
    if (p) s.niedostepni[id] = OPIS_POWODU[p];
  }
}

/** Umów badania (jutro w przychodni). Bez `ids` — wszyscy, którym badania wygasają w ciągu 30 dni lub już wygasły. */
export function zaplanujBadania(s: StanGry, ids?: string[]): string {
  const e = extranetStan(s); const klub = s.kluby[s.mojKlub];
  if (!e || !klub) return "Extranet jeszcze nieaktywny — rozegraj dzień.";
  const lista = (ids ?? klub.zawodnicy.filter((id) => (e.karty[id]?.badaniaDo ?? 0) - e.dzis <= 30))
    .filter((id) => e.karty[id] && e.karty[id].badaniaTermin === undefined && s.zawodnicy[id]);
  if (!lista.length) return "Nikt nie wymaga badań.";
  let koszt = 0;
  for (const id of lista) { e.karty[id].badaniaTermin = e.dzis; koszt += kosztBadan(s, s.zawodnicy[id]); }
  klub.kasa -= koszt;
  return `🩺 Umówiono badania: ${lista.length} zaw. (dziś w przychodni medycyny sportowej, orzeczenie jutro). Koszt ${zl(koszt)}.`;
}

/** Dzień „Badania medyczne" z kalendarza (planDnia): cała kadra przechodzi badania okresowe. */
export function badaniaCalejKadry(s: StanGry): string {
  const e = extranetStan(s); const klub = s.kluby[s.mojKlub];
  if (!e || !klub) return "";
  const ids = klub.zawodnicy.filter((id) => e.karty[id] && (e.karty[id].badaniaDo - e.dzis) <= 120);
  if (!ids.length) return "📋 Orzeczenia lekarskie całej kadry ważne jeszcze ponad 4 miesiące — Extranet bez zmian.";
  return zaplanujBadania(s, ids).replace("Umówiono badania", "Badania okresowe w ramach dnia badań");
}

/** Wiersze do ekranu Extranetu. */
export function kartyKadry(s: StanGry) {
  const e = extranetStan(s); const klub = s.kluby[s.mojKlub];
  if (!e || !klub) return [];
  return klub.zawodnicy.map((id) => {
    const z = s.zawodnicy[id]; const k = e.karty[id];
    return { z, k, powod: z ? powodNieuprawnienia(s, z) : null, dniBadan: k ? k.badaniaDo - e.dzis : 0, koszt: z ? kosztBadan(s, z) : 0 };
  }).filter((x) => x.z && x.k).sort((a, b) => (a.powod ? 0 : 1) - (b.powod ? 0 : 1) || a.dniBadan - b.dniBadan);
}

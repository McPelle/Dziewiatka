// Osiągnięcia trenera (odblokowywane w trakcie kariery) i poziomy trudności.
import { jestDerby } from "./derby";
import type { StanGry } from "./types";

export type Trudnosc = "latwy" | "normalny" | "trudny" | "legendarny";
export const TRUDNOSCI: Record<Trudnosc, { nazwa: string; opis: string; sila: number; budzet: number; cierpliwosc: number }> = {
  latwy: { nazwa: "Łatwy", opis: "Twoja drużyna gra nieco lepiej, większy budżet, cierpliwy zarząd.", sila: 2, budzet: 1.3, cierpliwosc: 1.5 },
  normalny: { nazwa: "Normalny", opis: "Realia polskiej piłki bez taryfy ulgowej.", sila: 0, budzet: 1, cierpliwosc: 1 },
  trudny: { nazwa: "Trudny", opis: "Rywale mocniejsi, mniej pieniędzy, zarząd szybciej traci cierpliwość.", sila: -1.5, budzet: 0.8, cierpliwosc: 0.75 },
  legendarny: { nazwa: "Legendarny", opis: "Dla mistrzów: wszystko pod górkę. Każdy punkt trzeba wyszarpać.", sila: -3, budzet: 0.65, cierpliwosc: 0.55 },
};
export const trudnosc = (s: StanGry): Trudnosc => (s.trudnosc ?? "normalny") as Trudnosc;
/** Dodatek do siły Twojej drużyny (skala ocen zawodników) wg poziomu trudności. */
export const bonusTrudnosci = (s: StanGry) => TRUDNOSCI[trudnosc(s)].sila;

export interface Osiagniecie { id: string; nazwa: string; opis: string; ikona: string; warunek: (s: StanGry) => boolean }
const arch = (s: StanGry) => s.archiwumMeczow ?? [];
const wygr = (s: StanGry) => arch(s).filter((m) => m.my > m.oni);
const kariera = (s: StanGry) => s.trenerKariera ?? [];
const suma = (s: StanGry, f: "awanse" | "tytuly" | "w" | "mecze") => kariera(s).reduce((a, w) => a + (w[f] ?? 0), 0);
const seriaBezPorazki = (s: StanGry) => { let n = 0, max = 0; for (const m of arch(s)) { if (m.my >= m.oni) { n++; max = Math.max(max, n); } else n = 0; } return max; };
const seriaWygranych = (s: StanGry) => { let n = 0, max = 0; for (const m of arch(s)) { if (m.my > m.oni) { n++; max = Math.max(max, n); } else n = 0; } return max; };

export const OSIAGNIECIA: Osiagniecie[] = [
  { id: "pierwsza", nazwa: "Pierwsze koty za płoty", opis: "Wygraj pierwszy mecz w karierze.", ikona: "🥇", warunek: (s) => wygr(s).length >= 1 },
  { id: "w10", nazwa: "Dziesiątka", opis: "10 zwycięstw w karierze.", ikona: "🔟", warunek: (s) => wygr(s).length >= 10 },
  { id: "w50", nazwa: "Pół setki", opis: "50 zwycięstw w karierze.", ikona: "5️⃣", warunek: (s) => wygr(s).length >= 50 },
  { id: "w100", nazwa: "Setka", opis: "100 zwycięstw w karierze.", ikona: "💯", warunek: (s) => wygr(s).length >= 100 },
  { id: "pogrom", nazwa: "Pogrom", opis: "Wygraj mecz różnicą 5 goli.", ikona: "💥", warunek: (s) => arch(s).some((m) => m.my - m.oni >= 5) },
  { id: "dwucyfrowka", nazwa: "Dwucyfrówka", opis: "Strzel 10 goli w jednym meczu.", ikona: "🔥", warunek: (s) => arch(s).some((m) => m.my >= 10) },
  { id: "czyste5", nazwa: "Zamurowana bramka", opis: "5 meczów z rzędu bez straconego gola.", ikona: "🧱", warunek: (s) => { let n = 0; for (const m of arch(s)) { n = m.oni === 0 ? n + 1 : 0; if (n >= 5) return true; } return false; } },
  { id: "seria5", nazwa: "Seria", opis: "5 zwycięstw z rzędu.", ikona: "📈", warunek: (s) => seriaWygranych(s) >= 5 },
  { id: "seria10", nazwa: "Maszyna", opis: "10 zwycięstw z rzędu.", ikona: "⚙️", warunek: (s) => seriaWygranych(s) >= 10 },
  { id: "bez15", nazwa: "Niepokonani", opis: "15 meczów z rzędu bez porażki.", ikona: "🛡", warunek: (s) => seriaBezPorazki(s) >= 15 },
  { id: "awans1", nazwa: "W górę!", opis: "Pierwszy awans w karierze.", ikona: "⬆️", warunek: (s) => suma(s, "awanse") >= 1 },
  { id: "awans3", nazwa: "Winda w górę", opis: "Trzy awanse w karierze.", ikona: "🚀", warunek: (s) => suma(s, "awanse") >= 3 },
  { id: "tytul", nazwa: "Mistrz ligi", opis: "Wygraj ligę.", ikona: "🏆", warunek: (s) => suma(s, "tytuly") >= 1 },
  { id: "esa", nazwa: "Ekstraklasa!", opis: "Poprowadź klub w PKO BP Ekstraklasie.", ikona: "⭐", warunek: (s) => s.kluby[s.mojKlub]?.poziom === 1 },
  { id: "odBklasy", nazwa: "Od B-klasy na szczyt", opis: "Zacznij od najniższego szczebla i dojdź do ligi centralnej.", ikona: "🧗", warunek: (s) => kariera(s).some((w) => w.od === kariera(s)[0]?.od) && (s.kluby[s.mojKlub]?.poziom ?? 9) <= 4 && (s.startPoziom ?? 0) >= 8 },
  { id: "derby", nazwa: "Pan miasta", opis: "Wygraj derby.", ikona: "⚔️", warunek: (s) => arch(s).some((m) => m.my > m.oni && !!Object.values(s.kluby).find((k) => k.nazwa === m.rywal && jestDerby(s, s.mojKlub, k.id))) },
  { id: "karne", nazwa: "Nerwy ze stali", opis: "Wygraj serię rzutów karnych w pucharze.", ikona: "🎯", warunek: (s) => (s.puchar?.sciezka ?? []).some((r) => r.awans && r.wynik.includes("k.")) },
  { id: "pucharRunda", nazwa: "Pucharowicz", opis: "Przejdź 3 rundy pucharu w jednym sezonie.", ikona: "🏅", warunek: (s) => (s.puchar?.sciezka ?? []).filter((r) => r.awans).length >= 3 },
  { id: "dawid", nazwa: "Dawid i Goliat", opis: "Wyeliminuj w pucharze drużynę z wyższej ligi.", ikona: "🪨", warunek: (s) => (s.puchar?.sciezka ?? []).some((r) => r.awans && (s.kluby[r.przeciwnik]?.poziom ?? 99) < (s.kluby[s.mojKlub]?.poziom ?? 0)) },
  { id: "jezyk", nazwa: "Poliglota", opis: "Naucz się języka obcego do poziomu B2 (60%).", ikona: "🗣", warunek: (s) => Object.values(s.jezykiTrenera ?? {}).some((v) => (v ?? 0) >= 60) },
  { id: "jezyki3", nazwa: "Wieża Babel", opis: "Trzy języki obce na poziomie co najmniej B1.", ikona: "🌍", warunek: (s) => Object.values(s.jezykiTrenera ?? {}).filter((v) => (v ?? 0) >= 30).length >= 3 },
  { id: "tlumacz", nazwa: "Bez barier", opis: "Zatrudnij tłumacza klubowego.", ikona: "👥", warunek: (s) => (s.tlumacze ?? []).length >= 1 },
  { id: "obcy5", nazwa: "Międzynarodowa szatnia", opis: "Pięciu obcokrajowców w kadrze.", ikona: "🌐", warunek: (s) => (s.kluby[s.mojKlub]?.zawodnicy ?? []).filter((id) => s.zawodnicy[id]?.kraj && s.zawodnicy[id]?.kraj !== "Polska").length >= 5 },
  { id: "oprawy10", nazwa: "Trybuna marzeń", opis: "Kibice Twojego klubu pokazali 10 opraw (każda inna).", ikona: "🎆", warunek: (s) => (s.oprawyUzyte?.[s.kluby[s.mojKlub]?.nazwa ?? ""] ?? []).length >= 10 },
  { id: "flagi", nazwa: "Płot pełen flag", opis: "Na płocie Twojego klubu zawisła nowa flaga.", ikona: "🚩", warunek: (s) => (s.noweFlagi?.[s.kluby[s.mojKlub]?.nazwa ?? ""] ?? []).length >= 1 },
  { id: "spokojnie", nazwa: "Spokojna kadencja", opis: "Opinia policji o organizacji meczów co najmniej 80/100.", ikona: "👮", warunek: (s) => (s.opiniaPolicji ?? 0) >= 80 },
  { id: "komplet", nazwa: "Komplet!", opis: "Rekord frekwencji klubu.", ikona: "🏟", warunek: (s) => (s.rekordy?.rekordFrekwencji?.widzowie ?? 0) > 0 && (s.rekordy?.rekordFrekwencji?.widzowie ?? 0) >= (s.kluby[s.mojKlub]?.pojemnosc ?? 1e9) * 0.95 },
  { id: "mecze100", nazwa: "Setka na ławce", opis: "100 meczów w roli trenera.", ikona: "🪑", warunek: (s) => arch(s).length >= 100 },
  { id: "sezon3", nazwa: "Wierny klubowi", opis: "Trzy pełne sezony w jednym klubie.", ikona: "🤝", warunek: (s) => kariera(s).some((w) => (w.do ?? s.sezon) - w.od >= 3) },
  { id: "trening", nazwa: "Na murawie", opis: "Poprowadź trening na żywo.", ikona: "🏋", warunek: (s) => !!s.osiagnieciaFlagi?.trening },
  { id: "rozgrzewka", nazwa: "Szatnia to świętość", opis: "Wygłoś mowę w szatni przed meczem.", ikona: "🗣", warunek: (s) => !!s.osiagnieciaFlagi?.mowa },
  { id: "budowa", nazwa: "Inwestor", opis: "Zakończ budowę na stadionie.", ikona: "🏗", warunek: (s) => (s.budowy ?? []).some((b) => b.dniMinelo >= b.dniRazem + b.opoznienie) || (s.wiadomosci ?? []).some((w) => /Odbiór|zakończon/i.test(w.tekst) && /budow/i.test(w.tekst)) },
  { id: "bogaty", nazwa: "Skarbnik", opis: "Miej na koncie klubu 1 000 000 zł.", ikona: "💰", warunek: (s) => (s.kluby[s.mojKlub]?.kasa ?? 0) >= 1_000_000 },
  { id: "legenda", nazwa: "Legenda", opis: "Zdobądź mistrzostwo na poziomie Legendarnym.", ikona: "👑", warunek: (s) => trudnosc(s) === "legendarny" && suma(s, "tytuly") >= 1 },
];

/** Sprawdza i odblokowuje nowe osiągnięcia. Zwraca komunikaty do wiadomości. */
export function sprawdzOsiagniecia(s: StanGry): string[] {
  const ma = (s.osiagniecia ??= {});
  const out: string[] = [];
  for (const o of OSIAGNIECIA) {
    if (ma[o.id]) continue;
    let ok = false; try { ok = o.warunek(s); } catch { ok = false; }
    if (ok) { ma[o.id] = s.sezon; out.push(`🏅 Osiągnięcie odblokowane: ${o.ikona} „${o.nazwa}” — ${o.opis}`); }
  }
  return out;
}

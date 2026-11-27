// Prezentacja nowego zawodnika — scenariusz dialogów (prezes, trener, zawodnik, tłumacz, dziennikarze, kibice) ze smaczkami:
// podpis kontraktu, wybór numeru, żonglerka na murawie, całowanie herbu, szalik od kibiców, pierwsze słowa po polsku,
// wychowanek / powrót do klubu / rekord transferowy, pytanie o derby, przejęzyczenie prezesa, zdjęcie z szalikiem.
import { jestDerby } from "./derby";
import { jezykZawodnika, NAZWA_JEZYKA, polski, tlumaczDla, wypowiedz, type Kat } from "./jezyki";
import type { Klub, StanGry, Zawodnik } from "./types";

export type KtoMowi = "prezes" | "trener" | "zawodnik" | "tlumacz" | "dziennikarz" | "kibic" | "narrator";
export interface LiniaPrezentacji { kto: KtoMowi; tekst: string; tlumaczenie?: string; glos?: string; akcja?: "podpis" | "zonglerka" | "herb" | "szalik" | "flesz" | "selfie" }

const IMIONA_PREZ = ["Janusz", "Andrzej", "Krzysztof", "Zbigniew", "Marek", "Ryszard", "Tadeusz", "Grzegorz", "Bogdan", "Wiesław"];
const NAZW_PREZ = ["Kowalczyk", "Nowicki", "Wróblewski", "Zawadzki", "Pietrzak", "Kaczmarek", "Sikora", "Baran", "Górski", "Wilk"];
const h = (t: string) => { let x = 7; for (const c of t) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; };
/** Prezes klubu (wygenerowany, stały dla klubu). */
export const prezesKlubu = (k: Klub) => `${IMIONA_PREZ[h(k.nazwa) % 10]} ${NAZW_PREZ[h(k.nazwa + "p") % 10]}`;

const POWODY_NUMERU: Record<number, string> = { 1: "Jedynka to bramkarz — tak było zawsze.", 4: "Czwórka jak mój ojciec, grał w obronie w okręgówce.", 7: "Siódemka — numer skrzydłowych z charakterem.", 8: "Ósemka, bo lubię być wszędzie na boisku.", 9: "Dziewiątka. Jestem tu po to, żeby strzelać.", 10: "Dziesiątka to odpowiedzialność. Wiem, ile ten numer znaczy dla kibiców.", 11: "Jedenastka — mój szczęśliwy numer od juniorów.", 23: "Dwudziestka trójka — data urodzenia mojej córki." };

/** Scenariusz prezentacji (kolejne kwestie; zawodnik-cudzoziemiec mówi w swoim języku, tłumacz tłumaczy). */
export function scenariuszPrezentacji(s: StanGry, z: Zawodnik, kwota?: number): LiniaPrezentacji[] {
  const k = s.kluby[s.mojKlub]; const prezes = prezesKlubu(k); const trener = s.trener || "Trener";
  const out: LiniaPrezentacji[] = [];
  const zaw = (tekst: string, kat: Kat): void => {
    const w = wypowiedz(s, z, tekst, { kat });
    const obcy = w.jezyk !== "pl" && w.poziom === "obcy";
    out.push({ kto: "zawodnik", tekst: w.tekst, tlumaczenie: obcy ? undefined : w.tlumaczenie, glos: w.glos });
    if (obcy) out.push({ kto: "tlumacz", tekst: `${w.tlumaczNazwa ? `${w.tlumaczNazwa}: ` : ""}${w.tlumaczenie ?? tekst}` }); // tłumaczy dokładnie to, co powiedział
  };
  const wychowanek = (z.kariera ?? []).slice(0, -1).some((w) => w.klub === k.nazwa); // wcześniej grał już w tym klubie
  const pochodzi = (z.kariera ?? []).filter((w) => w.klub !== k.nazwa).slice(-1)[0]?.klub;
  const rekord = (kwota ?? 0) > 0 && (kwota ?? 0) >= Math.max(20000, (k.kasa ?? 0) * 0.25);
  // prezes (czasem przekręca nazwisko)
  const przekret = Math.random() < 0.15 ? z.nazwisko.slice(0, -2) + (z.nazwisko.endsWith("ski") ? "cki" : "ak") : null;
  out.push({ kto: "narrator", tekst: `📸 Sala konferencyjna ${k.stadion ?? `stadionu w ${k.miasto}`}. Ścianka z herbem, flesze, kamery lokalnej telewizji.`, akcja: "flesz" });
  out.push({ kto: "prezes", tekst: `Szanowni Państwo, z ogromną radością przedstawiam nowego zawodnika ${k.nazwa}: ${z.imie} ${przekret ?? z.nazwisko}!` });
  if (przekret) out.push({ kto: "narrator", tekst: `😅 Sala w śmiech — prezes poprawia się: „${z.nazwisko}, oczywiście ${z.nazwisko}!”` });
  if (rekord) out.push({ kto: "prezes", tekst: `To największy transfer w historii naszego klubu. Pokazujemy, że ${k.miasto} myśli poważnie o przyszłości.` });
  if (wychowanek) out.push({ kto: "prezes", tekst: `Szczególna chwila — ${z.imie} wraca do domu. Wychowanek, który zna każdy kąt tego stadionu.` });
  out.push({ kto: "narrator", tekst: `🖊 ${z.imie} ${z.nazwisko} podpisuje kontrakt przy stoliku — błyskają flesze.`, akcja: "podpis" });
  // trener
  const rola = z.poz === "BR" ? "da nam spokój w bramce" : z.poz === "OBR" ? "uszczelni obronę" : z.poz === "POM" ? "doda jakości w środku pola" : "da nam bramki";
  out.push({ kto: "trener", tekst: `Obserwowaliśmy ${z.imie} od dawna. To zawodnik, który ${rola}. Czeka go ciężka praca, ale wierzę, że szybko się zaaklimatyzuje.` });
  if (polski(z) < 25 && tlumaczDla(s, jezykZawodnika(z))) out.push({ kto: "trener", tekst: `Mamy tłumacza ${NAZWA_JEZYKA[jezykZawodnika(z)].replace(/i$/, "iego")}, a od jutra ${z.imie} zaczyna kurs polskiego.` });
  // zawodnik
  zaw(z.wiek <= 20 ? "Dla takiego chłopaka jak ja to spełnienie marzeń. Dam z siebie wszystko!" : "Cieszę się, że tu jestem. Chcę pomóc drużynie i walczyć o zwycięstwa.", "dziekuje");
  if (pochodzi && !wychowanek) out.push({ kto: "dziennikarz", tekst: `Pytanie z sali: dlaczego zamienił Pan ${pochodzi} na ${k.nazwa}?` });
  if (pochodzi && !wychowanek) zaw("Trener przekonał mnie swoim pomysłem na grę. Czułem, że to dobry krok.", "postaram");
  // numer
  const nr = z.numer ?? 0; const powod = POWODY_NUMERU[nr] ?? (nr ? `${nr}? Był wolny, a ja nie jestem przesądny.` : "Numer wybiorę po rozmowie z kitmanem.");
  out.push({ kto: "dziennikarz", tekst: `Dlaczego numer ${nr || "jeszcze nieznany"}?` });
  zaw(powod, "ok");
  // derby
  const kand = Object.values(s.kluby).filter((r) => r.id !== k.id && Math.abs(r.poziom - k.poziom) <= 1).map((r) => ({ r, n: jestDerby(s, k.id, r.id) })).filter((x) => x.n);
  const der = kand.find((x) => x.n!.startsWith("Derby") || x.n!.startsWith("Święta") || x.n!.startsWith("Wielkie")) ?? kand[0];
  if (der) { out.push({ kto: "dziennikarz", tekst: der.n!.toLowerCase().includes("derby") || der.n!.startsWith("Święta") ? `Czy wie Pan, czym są dla kibiców „${der.n}”?` : `Kibice pytają: wie Pan, że mecze z rywalem — ${der.r.nazwa} — to tu sprawa honoru?` }); zaw("Już mi powiedzieli w szatni. Tego meczu się nie przegrywa!", "derby"); }
  // pierwsze słowa po polsku
  if (polski(z) < 25) out.push({ kto: "narrator", tekst: `🗣 Na koniec ${z.imie} próbuje po polsku: „Dzień dobry… ${k.nazwa.split(" ").slice(-1)[0]}… dziękuję!” — sala bije brawo.` });
  // smaczki na murawie
  out.push({ kto: "narrator", tekst: `⚽ Wyjście na murawę: ${z.imie} żongluje piłką przed kamerami${Math.random() < 0.5 ? ", na koniec przewrotka do pustej bramki" : ""}.`, akcja: "zonglerka" });
  out.push({ kto: "kibic", tekst: `Delegacja kibiców wręcza szalik: „Witamy w naszym mieście! Graj dla tego herbu.”`, akcja: "szalik" });
  out.push({ kto: "narrator", tekst: `❤️ ${z.imie} całuje herb na koszulce, unosi szalik nad głowę — zdjęcie, które jutro będzie w każdej gazecie.`, akcja: "herb" });
  if (Math.random() < 0.6) out.push({ kto: "narrator", tekst: "🤳 Selfie z dziećmi z akademii, autografy na piłkach i koszulkach.", akcja: "selfie" });
  return out;
}

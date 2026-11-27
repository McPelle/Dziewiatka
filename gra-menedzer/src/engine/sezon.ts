import { dotacjaGminy, poMeczu, wyjazdBusem } from "./zywySwiat";
import { czasNaKadre, przerwaNaKadre } from "./reprezentacje";
import { utrudnieniaMeczu } from "./budowy";
import { los, losInt, szansa, tasuj, wybierz, wybierzWazone, zl } from "./losuj";
import { AFILIACJE, PRZYJAZNIE } from "../data/derby";
import { klubyLigiZDanych, rodzenstwo, trafiaDo } from "./regiony";
import { rozliczObietnice } from "./rozmowy";
import { rozpocznijOkres } from "./okres";
import { realizujUmowyWstepne, wykupZWypozyczenia } from "./transfery";
import { nrZespolu, powolaniaAI, zespolyKlubu } from "./rezerwy";
import { konferencjaPo, konferencjaPrzed } from "./konferencje";
import { autoSklad, raportAsystenta, dostepny, FORMACJE, ileSpozaUE, limitSpozaUE, zagrajMecz } from "./mecz";
import { pogodaMeczu, gorskie } from "./pogoda";
import { rozwinAtrybuty } from "./atrybuty";
import { bonusRegeneracji, kosztSztabuNaKolejke, modRozwoj, modRozwojBR, sztabNowySezon } from "./sztab";
import { trenerzyNowySezon, zwolnijTreneraAI } from "../data/trenerzy";
import { obsadaMiedzynarodowa, obsadaMeczu } from "../data/sedziowie";
import { prestizKlubu } from "../data/renoma";
import { dojrzewanieTalentow, zakonczMisjeJesliCzas } from "./skauting";
import { autoFokus, kontuzjaTreningowa, mnoznikFokus, treningGracza, zmeczenieIntensywnosci } from "./trening";
import { juniorzyNowySezon, naborAkademiiDoJuniorow, naborUlicy, rozwojJuniorow, zasiejAkademie } from "./juniorzy";
import { awanseSpadkiJun, inicjujRozgrywkiJun, juniorKolejka } from "./ligaJuniorow";
import { dateKolejki, kalendarzSzczebla, oknoTransferowe, type InfoOkna } from "./kalendarz";
import { odlegloscDrogowa } from "../data/miasta";
import { odswiezRynekTestow, rozwojTestow, sprzatnijRynekTestow } from "./testy";
import {
  BILET, noweId, celSezonu, dlugoscKontraktu, KADRA, kontraktTyp, ligaKlubu, losujAgenta, maAgenta, nadajNumery, NAZWA_KONTRAKTU, nowyZawodnik, pensjaDla,
  jestMlodziezowcem, naliczSezonDoKariery, przejscieDoKlubu, PREMIA_AWANS, polaczRezerwy, silaKlubu, SPONSOR_SEZON, tabelaLigi, terminarz, uzupelnijWolnych, wartosc, WIDZOWIE, wpisKarieryOtwarty, wymogMlodziezowca, zakresUmiej,
} from "./swiat";

/** Prowizja agenta przy podpisaniu/przedłużeniu (zł) — zależna od pensji i długości umowy. */
export function prowizjaAgenta(pensjaKol: number, dlugosc: number): number {
  return Math.round((pensjaKol * 30 * dlugosc * 0.08) / 10) * 10; // ~8% wartości kontraktu
}
import { atutBoiska, frekwencja, jestDerby, jestPrzyjazn } from "./derby";
import { europaNaKolejke, kwalifikacjaEuropejska, nowaEuropa, rundaEuropy } from "./europa";
import { moznaPuchar, nowyPuchar, rundaPucharu } from "./puchar";
import { tydzienJezykow } from "./jezyki";
import { bonusTrudnosci, sprawdzOsiagniecia } from "./osiagniecia";
import { nalozSankcje, losujIncydent, rozliczBezpieczenstwo, rozliczWyjazd, zuzyjSankcje } from "./bezpieczenstwo";
import { akcjeKibicow, karaZaAkcje, sektorGosci, szkodyZaAkcje, zgodaKibicow } from "./kibice";
import { planOpraw, wedrownaOprawaTydzien } from "./oprawy";
import { GRUPY_KIBICOW } from "../data/grupyKibicow";
import { kulturaTrybun, noweFlagiTydzien } from "./flagi";
import type { GraczXI, Historia, Klub, Konferencja, Wynik, Liga, Nastawienie, Sponsor, SponsorTyp, StanGry, WlasnoscKlubu, WpisTrenera, Zawodnik } from "./types";

/** Najlepsza jedenastka kolejki w danej lidze (1 BR, 4 OBR, 4 POM, 2 NAP) wg ocen meczu. */
function liczXIKolejki(s: StanGry, liga: Liga, przedMecze: Map<string, number>, kolejkaNr: number) {
  const grali = liga.kluby
    .flatMap((kid) => s.kluby[kid].zawodnicy.map((id) => s.zawodnicy[id]))
    .filter((z) => z && z.ocenaMeczu != null && z.mecze > (przedMecze.get(z.id) ?? 0));
  if (grali.length < 11) { return; } // za mało rozegranych (np. walkowery) — pomiń
  const najlepsi = (poz: Zawodnik["poz"], ile: number) =>
    grali.filter((z) => z.poz === poz).sort((a, b) => (b.ocenaMeczu ?? 0) - (a.ocenaMeczu ?? 0)).slice(0, ile);
  const wybrani = [...najlepsi("BR", 1), ...najlepsi("OBR", 4), ...najlepsi("POM", 4), ...najlepsi("NAP", 2)];
  if (wybrani.length < 11) return;
  const gracze: GraczXI[] = wybrani.map((z) => ({
    id: z.id, imie: z.imie, nazwisko: z.nazwisko, klub: s.kluby[z.klubId!]?.nazwa ?? "", poz: z.poz, ocena: z.ocenaMeczu ?? 0,
  }));
  s.xiKolejki = { kolejka: kolejkaNr, liga: liga.nazwa, gracze };
  if (!s.xiHistoria) s.xiHistoria = [];
  s.xiHistoria.push(s.xiKolejki);
}

/** Otwarty etap pracy trenera (klub obecny). */
function trenerOtwarty(s: StanGry): WpisTrenera | undefined {
  const t = s.trenerKariera;
  if (!t || !t.length) return undefined;
  const o = t[t.length - 1];
  return o.do === null ? o : undefined;
}

/** Ocena na kapitana: przywództwo (prz) + cecha lider, pomocniczo doświadczenie i jakość. */
function kapitanScore(z: import("./types").Zawodnik): number {
  const prz = z.atrybuty?.prz ?? (z.umiej * 0.5 + z.wiek);
  return prz + (z.cechy?.includes("lider") ? 18 : 0) + z.wiek * 0.2 + z.umiej * 0.05;
}

const PENSJA_TRENERA = [600_000, 200_000, 80_000, 30_000, 12_000, 6_000, 3_000, 1_500, 800, 500, 400, 300];

/** Wartość kontraktu trenera (zł/sezon) wg poziomu i renomy klubu. */
export function wartoscKontraktuTrenera(poziom: number, renoma: number): number {
  const b = PENSJA_TRENERA[Math.min(PENSJA_TRENERA.length - 1, poziom - 1)];
  return Math.max(200, Math.round((b * (0.7 + renoma * 0.6)) / 100) * 100);
}

/** Podpisuje kontrakt trenera przy obejmowaniu klubu (długość 2–4 sezony). */
function podpiszKontraktTrenera(s: StanGry, klub: Klub) {
  const dlug = klub.poziom <= 3 ? losInt(2, 4) : losInt(2, 3);
  s.trenerKontraktDo = s.sezon + (dlug - 1);
  s.trenerPensja = wartoscKontraktuTrenera(klub.poziom, klub.renoma);
  s.powodWolny = undefined;
}

/** Przedłużenie kontraktu trenera (zależne od zaufania zarządu). */
export function przedluzKontraktTrenera(s: StanGry): string | null {
  if (s.zwolniony) return "Jesteś bez klubu.";
  if (s.zarzad < 40) return "Zarząd nie chce teraz przedłużać umowy — popraw wyniki.";
  const k = s.kluby[s.mojKlub];
  s.trenerKontraktDo = Math.max(s.trenerKontraktDo ?? s.sezon, s.sezon) + losInt(2, 3);
  s.trenerPensja = Math.round(((s.trenerPensja ?? wartoscKontraktuTrenera(k.poziom, k.renoma)) * los(1.05, 1.2)) / 100) * 100;
  return null;
}

// ——— Przedłużenie kontraktu trenera: propozycja zarządu + negocjacje przez agenta ———
/** Jak daleko zarząd może się posunąć (pensja zł/sezon, maks. długość umowy) — zależy od zaufania. */
function granicaZarzadu(s: StanGry): { maxPensja: number; maxLata: number; baza: number } {
  const k = s.kluby[s.mojKlub];
  const baza = s.trenerPensja ?? wartoscKontraktuTrenera(k.poziom, k.renoma);
  return { baza, maxPensja: Math.round((baza * (0.95 + s.zarzad * 0.004)) / 100) * 100, maxLata: s.zarzad >= 80 ? 4 : s.zarzad >= 60 ? 3 : 2 };
}
/** Raz na kolejkę: w ostatnim sezonie umowy, od półmetka, zarząd składa propozycję przedłużenia (gdy ufa trenerowi). */
export function sprawdzPropozycjeTrenera(s: StanGry) {
  if (s.zwolniony || latTrenera(s) > 0) return;
  const polowa = Math.floor(ileKolejek(s) / 2);
  if (s.kolejka < polowa) return;
  if (s.propozycjaTrenera) return;
  if (s.zarzad < 45) {
    if (s.kolejka === polowa) wiadomosc(s, `⏳ Ostatni sezon Twojego kontraktu, a zarząd (zaufanie ${Math.round(s.zarzad)}%) wstrzymuje się z decyzją o przedłużeniu. Popraw wyniki — inaczej po sezonie umowa wygaśnie.`);
    return;
  }
  const { baza, maxLata } = granicaZarzadu(s);
  const pensja = Math.round((baza * (1 + Math.max(0, s.zarzad - 50) * 0.002)) / 100) * 100;
  const lata = Math.min(maxLata, s.zarzad >= 70 ? 3 : 2);
  s.propozycjaTrenera = { pensja, lata, rundy: 0, status: "otwarta" };
  wiadomosc(s, `📝 Zarząd proponuje przedłużenie Twojego kontraktu o ${lata} ${lata === 1 ? "sezon" : "sezony"} za ${zl(pensja)}/sezon. Przyjmij, negocjuj przez agenta albo odrzuć — szczegóły na pulpicie.`);
}
/** Przyjęcie propozycji zarządu bez negocjacji. */
export function przyjmijPropozycjeTrenera(s: StanGry): string | null {
  const p = s.propozycjaTrenera;
  if (!p || p.status !== "otwarta") return "Brak aktualnej propozycji.";
  podpiszPrzedluzenie(s, p.pensja, p.lata);
  return null;
}
function podpiszPrzedluzenie(s: StanGry, pensja: number, lata: number) {
  s.trenerKontraktDo = s.sezon + lata;
  s.trenerPensja = pensja;
  s.propozycjaTrenera = undefined;
  s.zarzad = Math.min(100, s.zarzad + 3);
  wiadomosc(s, `✍ Podpisałeś nowy kontrakt: do ${s.trenerKontraktDo + 1} r. (sezon ${s.trenerKontraktDo}/${(s.trenerKontraktDo + 1) % 100}), ${zl(pensja)}/sezon.`);
}
/** Negocjacje przez agenta: żądanie pensji i długości. Zarząd przyjmuje, daje kontrofertę albo (po 3 rundach) zrywa rozmowy. */
export function negocjujKontraktTrenera(s: StanGry, pensja: number, lata: number): { status: "przyjeta" | "kontra" | "zerwane"; tekst: string } {
  const p = s.propozycjaTrenera;
  if (!p || p.status !== "otwarta") return { status: "zerwane", tekst: "Brak aktualnej propozycji do negocjacji." };
  const agent = s.trenerAgent ?? "Twój agent";
  const { maxPensja, maxLata } = granicaZarzadu(s);
  // Agent negocjuje lepiej, gdy klub jest zadowolony — mała premia „na otarcie" przy wysokim zaufaniu.
  const prog = maxPensja * (s.zarzad >= 80 ? 1.03 : 1);
  if (pensja <= prog && lata <= maxLata) {
    podpiszPrzedluzenie(s, Math.round(pensja / 100) * 100, lata);
    return { status: "przyjeta", tekst: `${agent}: „Załatwione! Zarząd przyjął nasze warunki — ${zl(pensja)}/sezon na ${lata} ${lata === 1 ? "sezon" : "sezony"}."` };
  }
  p.rundy++;
  p.ostatniaProsba = { pensja, lata };
  s.zarzad = Math.max(0, s.zarzad - 1); // twarde negocjacje lekko irytują zarząd
  if (p.rundy >= 3) {
    p.status = "wycofana";
    wiadomosc(s, `🚪 Zarząd zerwał rozmowy o przedłużeniu kontraktu po ${p.rundy} rundach negocjacji. Po sezonie umowa wygaśnie.`);
    return { status: "zerwane", tekst: `${agent}: „Przesadziliśmy — zarząd zerwał rozmowy. Po sezonie będziemy szukać nowego klubu."` };
  }
  const kontraPensja = Math.round(Math.min(maxPensja, (pensja + p.pensja) / 2) / 100) * 100;
  const kontraLata = Math.min(lata, maxLata);
  p.pensja = Math.max(p.pensja, kontraPensja);
  p.lata = kontraLata;
  return { status: "kontra", tekst: `${agent}: „Zarząd nie zgodził się na ${zl(pensja)}${lata > maxLata ? ` i ${lata} sezony` : ""}. Kontroferta: ${zl(p.pensja)}/sezon na ${p.lata} ${p.lata === 1 ? "sezon" : "sezony"}. ${3 - p.rundy === 1 ? "Została 1 runda" : `Zostały ${3 - p.rundy} rundy`} rozmów."` };
}
/** Odrzucenie propozycji — po sezonie umowa wygaśnie, a agent poszuka ofert. */
export function odrzucPropozycjeTrenera(s: StanGry) {
  if (s.propozycjaTrenera) s.propozycjaTrenera.status = "odrzucona";
  wiadomosc(s, "Odrzuciłeś propozycję przedłużenia. Po sezonie umowa wygaśnie — agent zbierze oferty z innych klubów.");
}
/** Oferty pracy po wygaśnięciu kontraktu: obecny klub (jeśli dalej chce) + kluby zainteresowane wg dorobku. */
function ofertyPoWygasnieciu(s: StanGry) {
  const obecny = s.kluby[s.mojKlub];
  const lista: NonNullable<StanGry["ofertyTrenera"]> = [];
  if (s.zarzad >= 40 && s.propozycjaTrenera?.status !== "wycofana") {
    lista.push({ klubId: obecny.id, sezon: s.sezon, pensja: wartoscKontraktuTrenera(obecny.poziom, obecny.renoma), lata: 2, obecny: true });
  }
  const dorobek = (s.trenerKariera ?? []).reduce((a, w) => a + w.tytuly + w.awanse, 0);
  const gora = dorobek >= 2 ? 2 : dorobek >= 1 || s.zarzad >= 60 ? 1 : 0;
  const kand = Object.values(s.kluby).filter((k) => !k.pozaLiga && !k.pozaPiramida && !k.rezerwaDla && k.id !== obecny.id
    && k.poziom >= Math.max(1, obecny.poziom - gora) && k.poziom <= Math.min(s.ligi.length, obecny.poziom + 1));
  for (const k of tasuj(kand).slice(0, losInt(2, 5))) {
    lista.push({ klubId: k.id, sezon: s.sezon, pensja: wartoscKontraktuTrenera(k.poziom, k.renoma), lata: losInt(1, 3) });
  }
  s.ofertyTrenera = lista;
  if (lista.length) wiadomosc(s, `📨 ${s.trenerAgent ?? "Agent"} zebrał ${lista.length} ofert pracy${lista.some((o) => o.obecny) ? ` (w tym ${obecny.nazwa} — chcą Cię zatrzymać)` : ""}. Wybierz klub na pulpicie.`);
}

/** Lata do końca kontraktu trenera (0 = ostatni sezon). */
export function latTrenera(s: StanGry): number {
  return Math.max(0, (s.trenerKontraktDo ?? s.sezon) - s.sezon);
}

/** Zamyka poprzedni etap pracy trenera i otwiera nowy w danym klubie. */
export function otworzKarieraTrenera(s: StanGry, klubNazwa: string) {
  if (!s.trenerKariera) s.trenerKariera = [];
  const o = trenerOtwarty(s);
  if (o) { if (o.klub === klubNazwa) return; o.do = s.sezon; }
  s.trenerKariera.push({ klub: klubNazwa, od: s.sezon, do: null, mecze: 0, w: 0, r: 0, p: 0, bz: 0, bp: 0, awanse: 0, spadki: 0, tytuly: 0 });
}

// Zdarzenia losowe absencji amatorów — dwie pule: życiowo-zawodowe i imprezowo-weekendowe.
const POWODY_ZYCIE = [
  "praca na zmianę", "wesele kuzyna", "komunia w rodzinie", "wyjazd do pracy za granicę", "egzamin na studiach",
  "żniwa", "chore dziecko", "nie dostał wolnego", "remont domu", "zepsuty samochód",
  "delegacja w pracy", "nocka w robocie", "pogrzeb w rodzinie", "przeprowadzka", "narodziny dziecka",
  "grypa", "obowiązki w gospodarstwie", "brak kierowcy na mecz", "nadgodziny", "wizyta u teściowej",
];
const POWODY_IMPREZA = [
  "kac po weselu", "zabawa do białego rana", "impreza u kumpla", "zaspał po imprezie", "wieczór kawalerski",
  "za dużo wczoraj na grillu", "poprawiny po weselu", "dożynki trwały za długo", "urodziny szwagra",
  "wrócił nad ranem z dyskoteki", "ognisko do rana", "kac giganta po meczu wyjazdowym",
];
/** Dobiera powód absencji wg poziomu: A/B klasa — często imprezowe, V liga/okręgówka raczej życiowe (ale też imprezowe). */
function losujPowod(poziom: number): string {
  const imprezowy = poziom >= 8 ? 0.5 : poziom >= 7 ? 0.32 : 0.2; // poziom 6 = V liga
  return wybierz(szansa(imprezowy) ? POWODY_IMPREZA : POWODY_ZYCIE);
}

export const wiadomosc = (s: StanGry, tekst: string) => {
  s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst });
  s.wiadomosci = s.wiadomosci.slice(0, 60);
};

// ——— Regionalny rynek transferowy ———
// W polskim futbolu kluby niższych lig ściągają zawodników głównie z okolicy (amator nie jedzie przez pół
// Polski do B-klasy), a im wyższy szczebel, tym rynek bardziej ogólnopolski. „Promień rynku" (km) rośnie z poziomem.
function promienRynku(poziom: number): number {
  return poziom <= 2 ? 900 : poziom === 3 ? 500 : poziom === 4 ? 320 : poziom === 5 ? 170 : poziom === 6 ? 90 : 55;
}
/** Waga zainteresowania kupca wg odległości od klubu sprzedającego (bliżej = chętniej; słabiej na niskich szczeblach). */
function wagaBliskosci(s: StanGry, sprzedajacy: Klub, kupiec: Klub): number {
  const dist = odlegloscDrogowa(sprzedajacy.miasto, kupiec.miasto);
  const skala = promienRynku(Math.max(sprzedajacy.poziom, kupiec.poziom));
  return 1 / (1 + dist / skala);
}
/** Opis zasięgu zainteresowania (do komunikatu): lokalne / regionalne / ogólnopolskie. */
function zasiegOferty(s: StanGry, a: Klub, b: Klub): string {
  const d = odlegloscDrogowa(a.miasto, b.miasto);
  return d <= 60 ? "lokalny rywal" : d <= 160 ? "klub z regionu" : d <= 350 ? "klub z sąsiedniego regionu" : "klub z drugiego końca Polski";
}

// ——— Duma kibiców z wychowanka ———
// Miejscowy wychowanek, który wyrósł na realne ogniwo składu, staje się ulubieńcem trybun:
// ściąga kibiców na stadion, a jego sprzedaż jest odbierana przez fanów jako zdrada.
function ulubieniecTrybun(s: StanGry, z: Zawodnik | undefined, klubId: string): boolean {
  if (!z || z.wychowanek !== klubId) return false;
  const k = s.kluby[klubId];
  return !!k && z.umiej >= zakresUmiej(k.poziom)[0]; // co najmniej na poziom ligi, nie ławkowy epizodzista
}

// Tożsamość lokalna: udział „swoich" w kadrze (wychowankowie klubu + zawodnicy miejscowego pochodzenia).
function udzialMiejscowych(s: StanGry, klub: Klub): number {
  const kadra = klub.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  if (!kadra.length) return 0;
  return kadra.filter((z) => z.wychowanek === klub.id || !!z.pochodzenie).length / kadra.length;
}

// Więzi rynkowe między klubami (chodzony transfer): wspólny obóz patrona (AFILIACJE) lub zgoda (PRZYJAZNIE).
function wieziRynkowe(aNazwa: string, bNazwa: string): number {
  const pa = AFILIACJE[aNazwa], pb = AFILIACJE[bNazwa];
  if (pa && (pa === bNazwa || pa === pb)) return 2.4; // ten sam obóz / patron ściąga „swoich"
  if (pb && pb === aNazwa) return 2.4;
  if (PRZYJAZNIE.some((p) => (p.a === aNazwa && p.b === bNazwa) || (p.a === bNazwa && p.b === aNazwa))) return 1.9;
  return 1;
}

export function mojaLiga(s: StanGry) {
  return ligaKlubu(s, s.mojKlub);
}

/** Wieloletni cel zarządu wg szczebla i renomy klubu (awans / górna połowa / stabilizacja). */
function ustawCelDlugo(s: StanGry, klubId: string) {
  const k = s.kluby[klubId]; if (!k) return;
  const p = k.poziom;
  if (p === 1) { s.celDlugo = { opis: "utrzymać klub w górnej połowie Ekstraklasy przez 3 sezony", typ: "gornapolowa", doSezonu: s.sezon + 3, startPoziom: p }; return; }
  const ambitny = k.renoma >= 0.5;
  if (ambitny) { const lata = k.renoma >= 0.6 ? 2 : 3; s.celDlugo = { opis: `awans o szczebel wyżej w ciągu ${lata} sezonów`, typ: "awans", doSezonu: s.sezon + lata, startPoziom: p }; }
  else { s.celDlugo = { opis: "stabilizacja — żadnego spadku przez 3 sezony i budowa klubu", typ: "stabilizacja", doSezonu: s.sezon + 3, startPoziom: p }; }
}

/** Czytelny opis modelu własności klubu. */
export function opisWlasciciela(w: WlasnoscKlubu): string {
  return w === "samorzad" ? "klub miejski/gminny (samorząd)"
    : w === "stowarzyszenie" ? "stowarzyszenie kibiców (klub społeczny)"
    : w === "inwestor" ? "prywatny inwestor"
    : "spółka akcyjna";
}

/**
 * Przypisuje model własności klubu gracza na starcie kariery, zgodnie z realiami polskiej piłki:
 * zawodowe/duże kluby częściej spółka albo prywatny inwestor, amatorskie/małomiasteczkowe —
 * samorząd (klub miejski/gminny) albo stowarzyszenie kibiców. Ustawiane raz; potem może się zmienić zdarzeniami.
 */
export function ustalWlasciciela(s: StanGry, k: Klub): WlasnoscKlubu {
  if (k.wlasciciel) return k.wlasciciel;
  let w: WlasnoscKlubu;
  if (k.poziom <= 2) w = szansa(0.5) ? "spolka" : "inwestor";
  else if (k.poziom <= 4) w = szansa(0.4) ? "inwestor" : szansa(0.5) ? "spolka" : "samorzad";
  else if (k.poziom <= 6) w = szansa(0.5) ? "samorzad" : szansa(0.5) ? "stowarzyszenie" : "spolka";
  else w = szansa(0.6) ? "samorzad" : "stowarzyszenie";
  k.wlasciciel = w;
  if (w === "inwestor") k.inwestorCierpliwosc = 60;
  return w;
}

export function rozpocznijKariere(s: StanGry, klubId: string) {
  s.startPoziom ??= s.kluby[klubId]?.poziom;
  s.mojKlub = klubId;
  if (!s.trenerAgent) s.trenerAgent = losujAgenta(s.kluby[klubId]?.poziom);
  otworzKarieraTrenera(s, s.kluby[klubId].nazwa);
  podpiszKontraktTrenera(s, s.kluby[klubId]);
  s.cel = celSezonu(s, klubId);
  ustawCelDlugo(s, klubId);
  s.zarzad = 60;
  s.zaufanieKibicow = 60;
  if (!s.trenerLicencja) s.trenerLicencja = "C";
  s.zwolniony = false;
  s.taktyka = { formacja: "4-4-2", nastawienie: "zrownowazone", sklad: [], auto: true };
  przygotujKolejke(s);
  s.puchar = nowyPuchar(s);
  s.trening = "ogolny";
  rozpocznijOkres(s, "lato"); if (s.okres) { const st0 = new Date(s.okres.start); st0.setDate(st0.getDate() + s.okres.dniUrlopu); s.okres.start = st0.toISOString(); s.okres.dniUrlopu = 0; } // nowa kariera zaczyna się od okresu przygotowawczego
  zasiejAkademie(s);          // startowy skład akademii U-19/U-17
  inicjujRozgrywkiJun(s);     // ligi i puchary juniorów w regionie
  s.sponsorzy = sponsorzyStartowi(s);
  // Kapitan: największe przywództwo (prz) + cecha lider; pomocniczo doświadczenie i jakość.
  s.kapitan = [...s.kluby[klubId].zawodnicy].sort((a, b) => kapitanScore(s.zawodnicy[b]) - kapitanScore(s.zawodnicy[a]))[0] ?? null;
  const k = s.kluby[klubId];
  const w = ustalWlasciciela(s, k);
  wiadomosc(s, `Witaj w klubie ${k.nazwa}! Zarząd oczekuje: ${s.cel}. Budżet: ${zl(k.kasa)}.`);
  wiadomosc(s, `🏷 Właściciel klubu: ${opisWlasciciela(w)}${w === "inwestor" ? " — pieniądze są, ale inwestor patrzy na wyniki." : w === "stowarzyszenie" ? " — kasy mało, ale kibice stoją za Wami murem." : w === "samorzad" ? " — stabilna dotacja, bez wielkich ambicji." : " — profesjonalne zarządzanie i stabilne wpływy."}`);
  if (s.celDlugo) wiadomosc(s, `🎯 Długofalowy cel zarządu: ${s.celDlugo.opis}.`);
}

/** Losuje nieobecności amatorów (klasa okręgowa i niżej) przed kolejką i ustawia skład. */
export function przygotujKolejke(s: StanGry) {
  // Liczniki do zasad gry w rezerwach (PZPN IX/140 §4): mecze w rezerwach, stan meczów po rundzie jesiennej.
  if (s.kolejka === Math.ceil(ileKolejek(s) / 2) && s.jesienZapisana !== s.sezon) {
    s.jesienZapisana = s.sezon;
    for (const z of Object.values(s.zawodnicy)) z.meczeJesien = z.mecze;
  }
  // Premie kontraktowe za gole i występy (z negocjacji transferowych).
  if (s.mojKlub && s.kluby[s.mojKlub]) {
    let suma = 0;
    for (const id of s.kluby[s.mojKlub].zawodnicy) {
      const z = s.zawodnicy[id]; if (!z?.bonusy) continue;
      const lg = z.bonusLicz ?? { g: z.gole, m: z.mecze };
      const dg = z.gole >= lg.g ? z.gole - lg.g : z.gole, dm = z.mecze >= lg.m ? z.mecze - lg.m : z.mecze;
      suma += dg * z.bonusy.gol + dm * z.bonusy.mecz;
      z.bonusLicz = { g: z.gole, m: z.mecze };
    }
    if (suma > 0) { s.kluby[s.mojKlub].kasa -= suma; wiadomosc(s, `💵 Premie kontraktowe za gole i występy: ${zl(suma)}.`); }
  }
  // Powołani z innych zespołów klubu wracają do swoich drużyn po meczu.
  if (s.powolaniKlubowi?.length) { s.taktyka.sklad = s.taktyka.sklad.filter((id) => !s.powolaniKlubowi!.includes(id)); s.powolaniKlubowi = []; }
  sprawdzPropozycjeTrenera(s);
  if (s.mojKlub && !s.zwolniony) rozliczObietnice(s, (t) => wiadomosc(s, t));
  konferencjaPrzedKolejka(s);
  s.niedostepni = {};
  const poziom = s.kluby[s.mojKlub].poziom;
  if (poziom >= 6) { // V liga i niżej (amatorzy/półamatorzy)
    const p = poziom >= 8 ? 0.14 : poziom >= 7 ? 0.09 : 0.07; // poziom 6 = V liga
    for (const id of s.kluby[s.mojKlub].zawodnicy) if (szansa(p)) s.niedostepni[id] = losujPowod(poziom);
  }
  const zle = s.taktyka.sklad.filter((id) => !s.kluby[s.mojKlub].zawodnicy.includes(id) || !dostepny(s, s.zawodnicy[id]));
  if (s.taktyka.auto) {
    const przed = [...s.taktyka.sklad];
    s.taktyka.sklad = autoSklad(s, s.mojKlub, s.taktyka.formacja);
    s.taktyka.reczneSloty = true; // asystent ustawia zawodników dokładnie na slotach formacji
    const rap = raportAsystenta(s, przed, s.taktyka.sklad, s.taktyka.formacja);
    if (rap.length && przed.length === 11) wiadomosc(s, `🧑‍🏫 Asystent ustalił skład na mecz:\n${rap.join("\n")}`);
  } else if (s.taktyka.sklad.length !== 11 || zle.length) {
    // zostaw dobrych, dopełnij automatem
    const zostaja = s.taktyka.sklad.filter((id) => !zle.includes(id));
    const auto = autoSklad(s, s.mojKlub, s.taktyka.formacja).filter((id) => !zostaja.includes(id));
    s.taktyka.sklad = [...zostaja, ...auto].slice(0, 11);
    s.taktyka.reczneSloty = false;
  }
  // Zaległe mecze: odrabianie przełożonego spotkania w środku tygodnia zostawia kadrę zmęczoną na najbliższą kolejkę.
  if ((s.zaleglosc ?? 0) > 0) {
    for (const id of s.kluby[s.mojKlub].zawodnicy) { const z = s.zawodnicy[id]; if (z) z.kondycja = Math.max(30, z.kondycja - 6); }
    s.zaleglosc = (s.zaleglosc ?? 0) - 1;
    wiadomosc(s, "🗓️ Zaległy mecz rozegrany w środku tygodnia — drużyna przystępuje do kolejki zmęczona (niższa kondycja).");
  }
}

function nastawienieAI(s: StanGry, klubId: string, rywalId: string): Nastawienie {
  const a = s.kluby[klubId].renoma, b = s.kluby[rywalId].renoma;
  if (a - b > 0.25) return "ofensywne";
  if (b - a > 0.25) return "obronne";
  return "zrownowazone";
}

export function formacjaAI(klubId: string) {
  const f = Object.keys(FORMACJE);
  return f[klubId.charCodeAt(klubId.length - 1) % f.length];
}

/** Opis stylu gry rywala (do podglądu meczu): nastawienie wg formacji + mocna/słaba strona składu. */
export function stylRywala(s: StanGry, klubId: string): string {
  const f = formacjaAI(klubId);
  const czesci = f.split("-").map(Number);
  const obr = czesci[0] ?? 4;
  const nap = czesci[czesci.length - 1] ?? 2;
  const nast = nap >= 3 || obr <= 3 ? "ofensywny" : obr >= 5 || nap <= 1 ? "defensywny" : "zrównoważony";
  const zaw = s.kluby[klubId].zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const sr = (poz: string) => { const g = zaw.filter((z) => z.poz === poz); return g.length ? g.reduce((a, z) => a + z.umiej, 0) / g.length : 0; };
  const atak = sr("NAP"), obrona = sr("OBR"), pom = sr("POM");
  const linie: [string, number][] = [["groźny atak", atak], ["mocna obrona", obrona], ["silny środek pola", pom]];
  const mocna = linie.sort((a, b) => b[1] - a[1])[0][0];
  return `${nast}, ${f} · ${mocna}`;
}

/** Scouting rywala: miejsce, forma, siła względem Twojej, gwiazda, najlepszy strzelec, formacja. */
export function scoutRywala(s: StanGry, rywalId: string) {
  const k = s.kluby[rywalId];
  const liga = s.ligi[k.poziom - 1];
  const tab = tabelaLigi(s, liga);
  const idx = tab.findIndex((w) => w.klubId === rywalId);
  const row = idx >= 0 ? tab[idx] : undefined;
  const zaw = k.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const gwiazda = [...zaw].sort((a, b) => b.umiej - a.umiej)[0];
  const strzelec = [...zaw].filter((z) => z.gole > 0).sort((a, b) => b.gole - a.gole)[0];
  const sila = silaKlubu(s, rywalId);
  const mojaSila = silaKlubu(s, s.mojKlub);
  const roznica = sila - mojaSila;
  const ocena = roznica > 4 ? "wyraźnie silniejszy" : roznica > 1.5 ? "silniejszy" : roznica < -4 ? "wyraźnie słabszy" : roznica < -1.5 ? "słabszy" : "wyrównany";
  return {
    nazwa: k.nazwa, pozycja: idx + 1, liczba: tab.length, pkt: row?.pkt ?? 0, m: row?.m ?? 0, bz: row?.bz ?? 0, bs: row?.bs ?? 0,
    forma: (row?.forma ?? []).slice(-5), gwiazda, strzelec, sila, mojaSila, ocena, formacja: formacjaAI(rywalId), styl: stylRywala(s, rywalId), renoma: k.renoma, poziom: k.poziom,
  };
}

// ——— Obozy piłkarskie (zgrupowania w przerwie zimowej) ———
export const OBOZY = [
  { id: "wlasne", nazwa: "Zgrupowanie na własnych obiektach", kosztF: 0, rozwoj: 0.3, morale: 1, opis: "Tanio, na miejscu — niewielki, ale darmowy progres." },
  { id: "krajowy", nazwa: "Obóz krajowy", kosztF: 0.12, rozwoj: 0.7, morale: 3, opis: "Dobry balans kosztu i rozwoju, świeższa kadra." },
  { id: "zagraniczny", nazwa: "Obóz zagraniczny", kosztF: 0.3, rozwoj: 1.2, morale: 5, opis: "Najdroższy, największy skok formy i rozwoju, zgranie zespołu." },
] as const;

/** Koszt danego obozu wg poziomu klubu. */
export function kosztObozu(s: StanGry, idx: number): number {
  const poziom = s.kluby[s.mojKlub].poziom;
  return Math.round((OBOZY[idx].kosztF * NAGRODA_LIGA[poziom - 1]) / 100) * 100;
}
/** Czy obóz jest dostępny — w przerwie (od połowy sezonu), raz na sezon. */
export function obozDostepny(s: StanGry): boolean {
  return false; // obozy tylko w okresach przygotowawczych (lato/zima) — patrz okres.ts
  if (s.koniecSezonu || s.zwolniony) return false;
  if (s.obozSezon === s.sezon) return false;
  return s.kolejka >= Math.floor(ileKolejek(s) / 2);
}
/** Wysyła kadrę na obóz: rozwój (młodzi mocniej), pełna kondycja, morale. Raz na sezon. */
export function wyslijNaOboz(s: StanGry, idx: number): string | null {
  if (!obozDostepny(s)) return "Obóz niedostępny (dopiero w przerwie, raz na sezon).";
  const o = OBOZY[idx];
  const koszt = kosztObozu(s, idx);
  const moj = s.kluby[s.mojKlub];
  if (moj.kasa < koszt) return `Brakuje ${zl(koszt - moj.kasa)} na ten obóz.`;
  moj.kasa -= koszt;
  for (const id of moj.zawodnicy) {
    const z = s.zawodnicy[id];
    if (z.umiej < z.potencjal) {
      const wiekMn = z.wiek <= 21 ? 1.7 : z.wiek <= 25 ? 1 : 0.6; // młodzi korzystają najwięcej
      const talent = z.cechy?.includes("talent") ? 1.35 : 1; // młody talent rozwija się szybciej
      rozwinAtrybuty(z, o.rozwoj * wiekMn * talent * modRozwoj(s) * los(0.6, 1.3));
    }
    z.kondycja = 100;
    z.morale = Math.min(100, z.morale + o.morale);
  }
  s.obozSezon = s.sezon;
  // Zimowe zgrupowanie a pogoda: obóz zagraniczny (ciepłe kraje) daje lepsze wejście w rundę wiosenną — bezcenne,
  // gdy w kraju trzyma mróz/śnieg (Kujawsko-Pomorskie, Zachodniopomorskie, górska Małopolska). Boost formy na start.
  if (o.id === "zagraniczny") {
    const sc = (s.sciezka || "").toLowerCase();
    const zimnoRegion = /kujawsko|zachodniopomor/.test(sc) || gorskie(moj.miasto);
    const boost = zimnoRegion ? 2 : 1;
    for (const id of moj.zawodnicy) { const z = s.zawodnicy[id]; if (z) z.forma = Math.min(5, z.forma + boost); }
    wiadomosc(s, zimnoRegion
      ? `☀️ Obóz w cieple zaprocentował — gdy w regionie zima, wracacie w świetnej formie na rundę wiosenną (forma +${boost}).`
      : `☀️ Ciepły obóz zagraniczny dał drużynie świeżość na rundę wiosenną (forma +${boost}).`);
  }
  wiadomosc(s, `🏕 ${o.nazwa} za ${zl(koszt)} — kadra wróciła wzmocniona (rozwój, pełna forma, lepsze morale).`);
  return null;
}

// ——— Konferencje prasowe (rozbudowane, kontekstowe) ———
type KonfSzablon = { kontekst: string; pytanie: string; opcje: { tekst: string; morale: number; zarzad: number; kibice?: number; odzew: string }[] };
const KONF_WYSOKA: KonfSzablon[] = [
  { kontekst: "Po wysokiej wygranej", pytanie: "Rozbiliście rywala. To już kandydat do awansu?", opcje: [
    { tekst: "Idziemy po awans — nikt nas nie zatrzyma!", morale: 4, zarzad: 3, odzew: "Buta zmotywowała szatnię, ale zarząd zapamiętał tę deklarację." },
    { tekst: "Jeden mecz niczego nie przesądza.", morale: 1, zarzad: 3, odzew: "Profesjonalna powściągliwość — zarząd docenił." },
    { tekst: "Cały zespół zagrał koncertowo.", morale: 4, zarzad: 1, odzew: "Zawodnicy poczuli się docenieni." } ] },
  { kontekst: "Po wysokiej wygranej", pytanie: "Napastnik strzelił hat-tricka. Gwiazda zespołu?", opcje: [
    { tekst: "Zasłużył — ciężko pracuje.", morale: 3, zarzad: 1, odzew: "Pochwała ucieszyła drużynę." },
    { tekst: "Gramy zespołowo, nie wyróżniam nikogo.", morale: 2, zarzad: 2, odzew: "Jedność drużyny doceniona." } ] },
];
const KONF_WYGRANA: KonfSzablon[] = [
  { kontekst: "Po wygranej", pytanie: "Ciasne, ale cenne zwycięstwo. Zadowolony z gry?", opcje: [
    { tekst: "Liczą się trzy punkty, gra przyjdzie.", morale: 2, zarzad: 2, odzew: "Pragmatyzm doceniony." },
    { tekst: "Musimy grać ładniej i pewniej.", morale: -1, zarzad: 1, odzew: "Wymagający ton — zawodnicy pod presją." },
    { tekst: "Charakter zespołu robi różnicę.", morale: 3, zarzad: 1, odzew: "Pochwała charakteru zmotywowała szatnię." } ] },
  { kontekst: "Po wygranej", pytanie: "Trzecie zwycięstwo z rzędu. Wasza forma zachwyca.", opcje: [
    { tekst: "Jedziemy po serię i awans.", morale: 3, zarzad: 2, odzew: "Ambitnie — oczekiwania rosną." },
    { tekst: "Nie czarujmy się, sezon długi.", morale: 1, zarzad: 2, odzew: "Chłodna głowa doceniona." } ] },
  { kontekst: "Po wygranej", pytanie: "Młodzieżowiec znów błysnął. Przyszłość klubu?", opcje: [
    { tekst: "To talent, dajemy mu grać.", morale: 3, zarzad: 2, odzew: "Stawianie na młodych spodobało się zarządowi." },
    { tekst: "Spokojnie, nie nakładajmy presji.", morale: 2, zarzad: 1, odzew: "Ochrona młodego zawodnika doceniona." } ] },
  { kontekst: "Po wygranej", pytanie: "Kibice dopisali i nieśli zespół. Słowo do trybun?", opcje: [
    { tekst: "To zwycięstwo jest dla nich — dziękujemy!", morale: 2, zarzad: 1, kibice: 4, odzew: "Ukłon w stronę trybun — kibice poczuli się docenieni." },
    { tekst: "Skupiamy się na boisku, nie na otoczce.", morale: 1, zarzad: 1, kibice: -2, odzew: "Chłodny ton — część kibiców poczuła się zbyta." } ] },
  { kontekst: "Po wygranej", pytanie: "Gwiazda zespołu znów decydowała. Nie boisz się ofert za nią?", opcje: [
    { tekst: "To nasz lider, nie jest na sprzedaż.", morale: 3, zarzad: -1, kibice: 3, odzew: "Kibice i szatnia usłyszeli deklarację wierności." },
    { tekst: "Każdy ma swoją cenę — futbol to biznes.", morale: -2, zarzad: 2, kibice: -2, odzew: "Pragmatyzm zarządu, ale niepokój na trybunach." } ] },
];
const KONF_DERBY_W: KonfSzablon[] = [
  { kontekst: "Po wygranych derbach", pytanie: "Wygrane derby! Co czują kibice?", opcje: [
    { tekst: "To mecz dla kibiców — ich duma!", morale: 4, zarzad: 2, kibice: 6, odzew: "Trybuny oszalały, szatnia w euforii." },
    { tekst: "Szacunek dla rywala, ale cieszymy się.", morale: 3, zarzad: 2, kibice: 3, odzew: "Klasa doceniona po obu stronach." } ] },
  { kontekst: "Po wygranych derbach", pytanie: "Rywal twierdzi, że był lepszy. Odpowiesz?", opcje: [
    { tekst: "Tabela i wynik mówią same za siebie.", morale: 3, zarzad: 1, kibice: 4, odzew: "Pewna siebie riposta rozgrzała kibiców." },
    { tekst: "Nie wchodzę w przepychanki słowne.", morale: 1, zarzad: 2, kibice: 0, odzew: "Spokój doceniony przez zarząd." } ] },
];
const KONF_REMIS: KonfSzablon[] = [
  { kontekst: "Po remisie", pytanie: "Remis — niedosyt czy punkt zgodnie z planem?", opcje: [
    { tekst: "Straciliśmy dwa punkty, stać nas na więcej.", morale: 0, zarzad: 2, odzew: "Ambitny ton — zarząd zadowolony, zawodnicy pod presją." },
    { tekst: "Cenny punkt, budujemy formę.", morale: 2, zarzad: 1, odzew: "Spokój udzielił się szatni." } ] },
  { kontekst: "Po remisie", pytanie: "Prowadziliście, ale rywal wyrównał. Zabrakło koncentracji?", opcje: [
    { tekst: "Musimy dowozić wyniki do końca.", morale: -1, zarzad: 1, odzew: "Słuszna uwaga — zespół wziął to do siebie." },
    { tekst: "Doceniam walkę do ostatniej minuty.", morale: 2, zarzad: 0, odzew: "Wsparcie podniosło morale." } ] },
];
const KONF_PORAZKA: KonfSzablon[] = [
  { kontekst: "Po porażce", pytanie: "Słaby mecz. Kto zawinił?", opcje: [
    { tekst: "Biorę winę na siebie.", morale: 4, zarzad: -2, odzew: "Ochroniłeś zespół — zawodnicy docenili, zarząd mniej." },
    { tekst: "Zawodnicy muszą dać więcej.", morale: -3, zarzad: 2, odzew: "Ostre słowa — zarząd przytaknął, szatnia spięta." },
    { tekst: "Spokojnie, wrócimy silniejsi.", morale: 1, zarzad: 0, odzew: "Wyważony przekaz." } ] },
  { kontekst: "Po porażce", pytanie: "Kibice są rozczarowani. Co im powiesz?", opcje: [
    { tekst: "Przepraszamy, odrobimy to.", morale: 2, zarzad: 1, kibice: 2, odzew: "Pokorny ton uspokoił atmosferę." },
    { tekst: "Potrzebujemy ich wsparcia, nie krytyki.", morale: 1, zarzad: -1, kibice: -2, odzew: "Apel o jedność, choć część kibiców poczuła się pouczana." } ] },
  { kontekst: "Po porażce", pytanie: "Czy to jeszcze Twój zespół? Krążą plotki o zwolnieniu.", opcje: [
    { tekst: "Ufam tej drużynie i planowi.", morale: 3, zarzad: 1, odzew: "Pewność siebie uspokoiła szatnię." },
    { tekst: "Wyniki muszą się poprawić, wiem o tym.", morale: 0, zarzad: 2, odzew: "Szczerość doceniona przez zarząd." },
    { tekst: "Nie komentuję plotek.", morale: 0, zarzad: -1, odzew: "Unik nie spodobał się dziennikarzom." } ] },
];
const KONF_WYSOKA_PORAZKA: KonfSzablon[] = [
  { kontekst: "Po wysokiej porażce", pytanie: "Dostaliście lanie. Co poszło nie tak?", opcje: [
    { tekst: "Pełna odpowiedzialność jest po mojej stronie.", morale: 4, zarzad: -3, odzew: "Zasłoniłeś zespół własną piersią." },
    { tekst: "To był czarny dzień, wyciągniemy wnioski.", morale: 1, zarzad: 0, odzew: "Spokój mimo klęski." },
    { tekst: "Tak grać nie wolno — będą konsekwencje.", morale: -4, zarzad: 2, odzew: "Twarde słowa zmroziły szatnię, zarząd przytaknął." } ] },
];
const KONF_DERBY_P: KonfSzablon[] = [
  { kontekst: "Po przegranych derbach", pytanie: "Porażka w derbach boli kibiców podwójnie. Przeprosisz?", opcje: [
    { tekst: "Przepraszam kibiców, zawiedliśmy ich.", morale: 1, zarzad: 1, kibice: 2, odzew: "Pokora po gorzkiej porażce — kibice to usłyszeli." },
    { tekst: "Wrócimy po rewanż — obiecuję.", morale: 3, zarzad: 0, kibice: 1, odzew: "Zapowiedź rewanżu podniosła morale." },
    { tekst: "Bez dramatów, to tylko trzy punkty.", morale: 0, zarzad: 0, kibice: -4, odzew: "Bagatelizowanie derbów rozwścieczyło trybuny." } ] },
];

/** Po meczu gracza czasem pojawia się konferencja prasowa — 3–4 pytania: wynik, sędzia, zawodnik meczu, kibice. */
function generujKonferencje(s: StanGry, moje: number, ich: number, derby: boolean, w?: Wynik) {
  s.motywacjaMeczu = 0; // efekt konferencji przedmeczowej wykorzystany
  if (s.konferencja) return;
  const roznica = moje - ich;
  const pewna = derby || Math.abs(roznica) >= 3; // po derbach i wysokich wynikach prawie zawsze
  if (!pewna && !szansa(0.55)) return;
  let pula: KonfSzablon[];
  if (roznica > 0) pula = derby ? KONF_DERBY_W : roznica >= 3 ? KONF_WYSOKA : KONF_WYGRANA;
  else if (roznica < 0) pula = derby ? KONF_DERBY_P : roznica <= -3 ? KONF_WYSOKA_PORAZKA : KONF_PORAZKA;
  else pula = KONF_REMIS;
  const k = wybierz(pula);
  const pakiet = w ? konferencjaPo(s, w, moje, ich, k) : { media: "prasa", pytania: [k] };
  ustawKonferencje(s, "po", pakiet.media, pakiet.pytania);
}
function ustawKonferencje(s: StanGry, typ: "przed" | "po", media: string, pytania: { kontekst: string; pytanie: string; opcje: Konferencja["opcje"] }[]) {
  if (!pytania.length) return;
  const [p0, ...reszta] = pytania;
  s.konferencja = { ...p0, typ, media, kolejne: reszta, nr: 1, ile: pytania.length };
}
/** Konferencja przed meczem (wywoływana przy przygotowaniu kolejki). */
function konferencjaPrzedKolejka(s: StanGry) {
  if (s.konferencja || s.zwolniony || !s.mojKlub) return;
  const liga = s.ligi[s.kluby[s.mojKlub].poziom - 1];
  const para = liga?.terminarz[s.kolejka]?.find(([a, b]) => a === s.mojKlub || b === s.mojKlub);
  if (!para) return;
  const rywal = para[0] === s.mojKlub ? para[1] : para[0];
  if (!s.kluby[rywal]) return;
  const k = konferencjaPrzed(s, rywal, moznaPuchar(s));
  if (k) ustawKonferencje(s, "przed", k.media, k.pytania);
}

/** Odpowiedź na pytanie konferencji: morale (drużyna i zawodnik), zarząd, kibice, motywacja; potem kolejne pytanie. */
export function odpowiedzKonferencja(s: StanGry, idx: number) {
  const k = s.konferencja;
  if (!k) return;
  const o = k.opcje[idx];
  if (o) {
    for (const id of s.kluby[s.mojKlub].zawodnicy) { const z = s.zawodnicy[id]; z.morale = Math.max(0, Math.min(100, z.morale + o.morale)); }
    s.zarzad = Math.max(0, Math.min(100, s.zarzad + o.zarzad));
    if (o.kibice) s.zaufanieKibicow = Math.max(0, Math.min(100, (s.zaufanieKibicow ?? 60) + o.kibice));
    if (o.motywacja) s.motywacjaMeczu = Math.max(-0.05, Math.min(0.05, (s.motywacjaMeczu ?? 0) + o.motywacja));
    if (o.zawodnik && s.zawodnicy[o.zawodnik.id]) { const z = s.zawodnicy[o.zawodnik.id]; z.morale = Math.max(0, Math.min(100, z.morale + o.zawodnik.morale)); }
    wiadomosc(s, `🎙 ${k.media ? k.media + ": " : ""}${o.odzew}`);
  } else if (idx < 0 && k.typ) {
    s.zarzad = Math.max(0, s.zarzad - 1);
    wiadomosc(s, "🎙 Odmówiłeś odpowiedzi na pytania dziennikarzy — media niezadowolone, zarząd też (−1).");
    s.konferencja = undefined;
    return;
  }
  const nast = k.kolejne?.[0];
  if (nast && idx >= 0) s.konferencja = { ...nast, typ: k.typ, media: k.media, kolejne: k.kolejne!.slice(1), nr: (k.nr ?? 1) + 1, ile: k.ile };
  else s.konferencja = undefined;
}

// ——— Bankructwa / wycofania klubów (V liga → B klasa) ———
const RDZEN_AMATOR = ["LKS", "GKS", "Orzeł", "Sokół", "Victoria", "Naprzód", "Zryw", "Iskra", "Płomień", "Grom", "Czarni", "Zieloni", "Huragan", "Start"];
/** Co sezon część amatorskich klubów (poziom 6+) może wycofać się z powodów finansowych; zastępuje je nowy klub z tej samej miejscowości. */
function wycofanieKlubow(s: StanGry) {
  let wycofanych = 0;
  for (const liga of s.ligi) {
    if (liga.poziom < 6 || wycofanych >= 2) continue;
    for (const id of liga.kluby) {
      if (wycofanych >= 2) break;
      const k = s.kluby[id];
      if (!k || id === s.mojKlub || k.rezerwaDla) continue; // nie Twój i nie zespół rezerw
      if (!szansa(0.012 + (1 - k.renoma) * 0.02)) continue; // biedniejsze/mniejsze częściej
      const staraNazwa = k.nazwa;
      for (const zid of k.zawodnicy) delete s.zawodnicy[zid];
      k.zawodnicy = [];
      k.nazwa = `${wybierz(RDZEN_AMATOR)} ${k.miasto}`;
      k.skrot = k.nazwa.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
      k.renoma = Math.max(0.1, k.renoma * 0.55);
      k.kasa = Math.max(0, Math.round(k.kasa * 0.3));
      k.herb = undefined; k.prawdziwy = false; k.rezerwaId = undefined;
      const minPoz: Record<string, number> = { BR: 2, OBR: 5, POM: 5, NAP: 3 };
      for (const [poz, ile] of Object.entries(minPoz)) for (let i = 0; i < ile; i++) { const z = nowyZawodnik(s, k.poziom, poz as never); z.klubId = k.id; k.zawodnicy.push(z.id); }
      while (k.zawodnicy.length < 18) { const z = nowyZawodnik(s, k.poziom, wybierz(KADRA)); z.klubId = k.id; k.zawodnicy.push(z.id); }
      nadajNumery(s, k);
      wycofanych++;
      wiadomosc(s, `${staraNazwa} wycofał się z rozgrywek z powodów finansowych. W jego miejsce zgłoszono nowy klub: ${k.nazwa} (${liga.nazwa}).`);
    }
  }
}

/** Premia, jaką da zarząd za zrealizowanie celu sezonu (orientacyjnie). */
export function premiaZaCel(s: StanGry): number {
  return Math.round((NAGRODA_LIGA[s.kluby[s.mojKlub].poziom - 1] * 0.35) / 100) * 100;
}

/** Zasady barażowe na granicy lig (poziomGorny = liga wyższa): ile awansów (b) i utrzymań (rb) rozstrzyga baraż (play-off).
 * Wierne reformie PZPN z 7.06.2024 (obowiązuje od 2024/25) oraz regulaminom Pomorskiego/Małopolskiego ZPN:
 *  • Ekstraklasa↔I liga: I liga 1–2 awans bezpośredni + 3–6 baraż o 1 miejsce; Ekstraklasa spada 16–18 BEZ barażu o utrzymanie → b=1, rb=0.
 *  • I↔II liga: II liga 1–2 bezpośrednio + 3–6 baraż; I liga baraż o utrzymanie zniesiony (2018) → b=1, rb=0.
 *  • II↔III liga: III liga mistrz grupy bezpośrednio + wicemistrz baraż; II liga spada bezpośrednio + 13–14 baraż o utrzymanie → b=1, rb=1.
 *  • III↔IV liga: IV liga mistrz bezpośrednio + wicemistrz baraż (dwustopniowy); III liga spada bez barażu o utrzymanie → b=1, rb=0.
 *  • IV↔V liga: V liga/okręgowa mistrz + baraż awansowy; IV liga spada bezpośrednio → b=1, rb=0.
 *  • V↔klasa A: klasa A mistrz + baraż o awans do klasy okręgowej/V ligi (Pomorski/Małopolski ZPN) → b=1, rb=0.
 *  • klasa A↔klasa B: zwycięzca grupy B awansuje bezpośrednio, bez barażu → b=0, rb=0.
 * Model gra jedną ścieżką (jedna grupa na szczebel), więc liczby są per grupa — realny system ma równoległe grupy III ligi i niżej. */
function regulyBarazy(poziomGorny: number, n: number): { b: number; rb: number } {
  if (n < 2) return { b: 0, rb: 0 };
  if (poziomGorny === 1) return { b: 1, rb: 0 }; // Ekstraklasa/I liga
  if (poziomGorny === 2) return { b: 1, rb: 0 }; // I/II liga
  if (poziomGorny === 3) return { b: 1, rb: 1 }; // II/III liga — II liga ma baraż o utrzymanie
  if (poziomGorny === 4) return { b: 1, rb: 0 }; // III/IV liga
  if (poziomGorny === 5) return { b: 1, rb: 0 }; // IV liga/V liga — baraż awansowy do IV ligi
  if (poziomGorny === 6) return { b: 1, rb: 0 }; // V liga/klasa A — baraż o awans do klasy okręgowej/V ligi
  return { b: 0, rb: 0 };                        // klasa A/klasa B — mistrz grupy bezpośrednio
}

/** Jeden mecz barażowy wg PZPN: na boisku WYŻEJ sklasyfikowanego (przewaga własnego boiska).
 * Remis → dogrywka, dalej remis → rzuty karne (lekko po stronie gospodarza). Zwraca zwycięzcę (awansuje/zostaje). */
function meczBarazowy(s: StanGry, wyzej: string, nizej: string): string {
  const atut = 1.3; // przewaga gospodarza (wyżej sklasyfikowany gra u siebie — regulamin PZPN)
  const sW = silaKlubu(s, wyzej) + atut + los(-3, 3);
  const sN = silaKlubu(s, nizej) + los(-3, 3);
  if (Math.abs(sW - sN) < 0.6) return szansa(0.56) ? wyzej : nizej; // remis → karne, minimalnie dla gospodarza
  return sW >= sN ? wyzej : nizej;
}

/** Baraż (play-off) PZPN — mecze JEDNOMECZOWE u wyżej sklasyfikowanego, rozstawienie najlepszy↔najgorszy
 * (np. 3–6, 4–5), zwycięzcy grają dalej u lepiej rozstawionego. Zwraca `ileZostaje` zwycięzców.
 * `klubIds` MUSZĄ być w kolejności tabeli (najlepszy pierwszy) — to decyduje o rozstawieniu i gospodarzu. */
function baraz(s: StanGry, klubIds: string[], ileZostaje: number, kontekst: "awans" | "utrzymanie"): string[] {
  let pula = klubIds.filter(Boolean);
  while (pula.length > ileZostaje) {
    const polowa = Math.floor(pula.length / 2);
    const next: string[] = [];
    for (let i = 0; i < polowa; i++) {
      const wyzej = pula[i], nizej = pula[pula.length - 1 - i]; // rozstawienie: lepszy ↔ gorszy
      const zwyc = meczBarazowy(s, wyzej, nizej);
      if (s.mojKlub === wyzej || s.mojKlub === nizej) {
        const rywal = s.mojKlub === wyzej ? nizej : wyzej;
        const uSiebie = s.mojKlub === wyzej;
        wiadomosc(s, s.mojKlub === zwyc
          ? `⚽ Baraż ${kontekst === "awans" ? "o awans" : "o utrzymanie"} (${uSiebie ? "u siebie" : "na wyjeździe"}): wygraliście z ${s.kluby[rywal].nazwa}!`
          : `⚽ Baraż ${kontekst === "awans" ? "o awans" : "o utrzymanie"} (${uSiebie ? "u siebie" : "na wyjeździe"}): porażka z ${s.kluby[rywal].nazwa}.`);
      }
      next.push(zwyc);
    }
    if (pula.length % 2 === 1) next.push(pula[polowa]); // nieparzysta pula: środkowy wolny los
    pula = next; // zwycięzcy w kolejności rozstawienia (wyżej rozstawiony zostaje gospodarzem w finale)
  }
  return pula;
}

export function ileKolejek(s: StanGry) {
  return mojaLiga(s).terminarz.length;
}

/** Rozgrywa najbliższą kolejkę we wszystkich ligach. */
export function zagrajKolejke(s: StanGry) {
  if (s.koniecSezonu || s.zwolniony) return;
  const r = s.kolejka;
  { const mk = s.kluby[s.mojKlub]; if (mk && (mk.rezerwaDla || mk.rezerwaId)) {
    (s.ostatnieSklady ??= {})[s.mojKlub] = [...s.taktyka.sklad];
    if (mk.rezerwaDla) for (const id of s.taktyka.sklad) { const z = s.zawodnicy[id]; if (z) z.meczeRezerwy = (z.meczeRezerwy ?? 0) + 1; }
  } }
  // Snapshot rozegranych meczów graczy Twojej ligi — po kolejce policzymy XI kolejki z przyrostu.
  const mojaL = mojaLiga(s);
  const przedMecze = new Map<string, number>();
  for (const kid of mojaL.kluby) for (const id of s.kluby[kid].zawodnicy) przedMecze.set(id, s.zawodnicy[id].mecze);
  for (const liga of s.ligi) {
    if (r >= liga.terminarz.length) continue;
    const wyniki = liga.terminarz[r].map(([dom, gosc]) => {
      const druz = (id: string, rywal: string) =>
        id === s.mojKlub
          ? { klubId: id, sklad: s.taktyka.sklad, formacja: s.taktyka.formacja, nastawienie: s.taktyka.nastawienie }
          : { klubId: id, sklad: autoSkladAI(s, id), formacja: formacjaAI(id), nastawienie: nastawienieAI(s, id, rywal) };
      const moj = dom === s.mojKlub || gosc === s.mojKlub;
      // Niższe ligi (V liga → B klasa): czasem walkower za nieuprawnionego zawodnika (zawieszony / bez karty / błąd w składzie).
      if (moj && s.kluby[s.mojKlub].poziom >= 6 && szansa(0.012)) {
        const uSiebie = dom === s.mojKlub;
        const naszaWina = szansa(0.55);
        const powod = wybierz(["zagrał zawieszony zawodnik (przekroczone kartki)", "zawodnik bez ważnej karty zgłoszeniowej", "błąd w protokole / zgłoszeniu składu", "na boisku nieuprawniony zawodnik"]);
        const gd = naszaWina ? (uSiebie ? 0 : 3) : (uSiebie ? 3 : 0);
        const gg = naszaWina ? (uSiebie ? 3 : 0) : (uSiebie ? 0 : 3);
        const w = { dom, gosc, gd, gg, zdarzenia: [] };
        s.ostatnieOceny = [];
        po_meczu(s, uSiebie, w.gd, w.gg, dom, gosc);
        wiadomosc(s, naszaWina
          ? `Walkower 0:3 przeciw Wam — ${powod}. Weryfikacja PZPN oddała mecz rywalowi.`
          : `Walkower 3:0 dla Was — rywal wystawił nieuprawnionego zawodnika (${powod}).`);
        return w;
      }
      // Przepis PZPN: za mało młodzieżowców w jedenastce = walkower 0:3 (I liga 1, II/III liga 2, IV+ 1).
      const wymogM = moj ? wymogMlodziezowca(s.kluby[s.mojKlub].poziom) : 0;
      const maM = s.taktyka.sklad.filter((id) => jestMlodziezowcem(s.zawodnicy[id])).length;
      if (wymogM > 0 && maM < wymogM) {
        const uSiebie = dom === s.mojKlub;
        const w = { dom, gosc, gd: uSiebie ? 0 : 3, gg: uSiebie ? 3 : 0, zdarzenia: [] };
        s.ostatnieOceny = [];
        po_meczu(s, uSiebie, w.gd, w.gg, dom, gosc);
        wiadomosc(s, `Walkower 0:3 — w jedenastce wymagani młodzieżowcy (U-21): ${maM}/${wymogM} (przepis PZPN).`);
        return w;
      }
      // Przepis PZPN o cudzoziemcach: za dużo zawodników spoza UE w jedenastce = walkower 0:3.
      if (moj) {
        const limit = limitSpozaUE(s.kluby[s.mojKlub].poziom);
        if (ileSpozaUE(s, s.taktyka.sklad) > limit) {
          const uSiebie = dom === s.mojKlub;
          const w = { dom, gosc, gd: uSiebie ? 0 : 3, gg: uSiebie ? 3 : 0, zdarzenia: [] };
          s.ostatnieOceny = [];
          po_meczu(s, uSiebie, w.gd, w.gg, dom, gosc);
          wiadomosc(s, `Walkower 0:3 — za dużo zawodników spoza UE w składzie (limit ${limit} wg przepisów PZPN).`);
          return w;
        }
      }
      const derbyNazwa = jestDerby(s, dom, gosc);
      const przyjaznNazwa = derbyNazwa ? null : jestPrzyjazn(s, dom, gosc);
      // Derby / mecz podwyższonego ryzyka ściąga kibiców z całego obozu zgód → komplet; zgoda też pełne trybuny.
      const bonusFrek = derbyNazwa ? 0.85 : przyjaznNazwa ? 0.65 : 0;
      const kd = s.kluby[dom];
      let pog = pogodaMeczu(kd.miasto, s.kolejka, liga.terminarz.length); // pogoda u gospodarza (nadmorskie + pora sezonu)
      // Rodzaj murawy gospodarza (fallback wg szczebla dla starszych zapisów).
      const murawa = kd.murawa ?? (kd.poziom <= 2 ? "podgrzewana" : kd.poziom <= 4 ? "naturalna" : "sztuczna");
      const mrozSnieg = pog.nazwa === "Śnieżyca" || pog.nazwa === "Mróz";
      // Przełożenie przy śnieżycy/mrozie/wichurze (mój mecz) — TYLKO na naturalnej murawie bez podgrzewania (zamarza/grząsko).
      // Boisko podgrzewane (Ekstraklasa/I liga) i sztuczna murawa (niższe ligi) pozwalają grać mimo zimy.
      if (moj && pog.frek <= 0.72 && murawa === "naturalna" && szansa(0.32)) {
        wiadomosc(s, `❄️ Mecz przełożony z powodu aury (${pog.nazwa}) — naturalna murawa nie nadaje się do gry, termin rezerwowy w środku tygodnia.`);
        pog = { nazwa: "Termin rezerwowy", ikona: "🗓️", gole: 1, frek: 0.95, atut: 1 };
        s.zaleglosc = (s.zaleglosc ?? 0) + 1; // zaległy mecz spycha terminarz → kumulacja zmęczenia w kolejnej kolejce
      } else if (moj && mrozSnieg) {
        wiadomosc(s, murawa === "podgrzewana"
          ? `🔥 Podgrzewana murawa w ${kd.miasto} — mimo aury (${pog.nazwa}) boisko gotowe, mecz się odbywa.`
          : murawa === "sztuczna"
          ? `🟩 Sztuczna murawa w ${kd.miasto} — gracie mimo zimy (${pog.nazwa}).`
          : "");
      }
      // Termin/pora meczu: przy reflektorach (oświetlenie + szczebel transmisyjny) mecz u siebie bywa wieczorną
      // transmisją — prime time podkręca atmosferę i daje premię TV; zimą najniższe klasy grają na orliku/w hali.
      let terminWieczorny = false;
      if (moj && kd.id === s.mojKlub && maOswietlenie(kd) && kd.poziom <= 4 && pog.nazwa !== "Termin rezerwowy" && (derbyNazwa ? szansa(0.6) : szansa(0.22))) terminWieczorny = true;
      if (moj && kd.id === s.mojKlub && !maOswietlenie(kd) && kd.poziom <= 3 && szansa(0.3)) wiadomosc(s, `🕒 Brak masztów oświetleniowych — mecz w terminie popołudniowym (transmisje wolą prime time). Rozważ inwestycję w oświetlenie.`);
      if (moj && kd.poziom >= 7 && mrozSnieg) wiadomosc(s, `🏟 Mecz przeniesiony na orlik/halę w ${kd.miasto} — zimą najniższe klasy grają na sztucznej nawierzchni, bez przekładania.`);
      let widzowie = frekwencja(s, dom, gosc, bonusFrek);
      // Dobra passa gospodarza przyciąga kibiców (do +12% przy serii 4+), zła lekko zniechęca.
      { const se = kd.seria ?? 0; if (se > 0) widzowie = Math.round(widzowie * (1 + Math.min(0.12, se * 0.03))); else if (se <= -3) widzowie = Math.round(widzowie * 0.93); }
      // Zaufanie kibiców (mój klub): entuzjazm podbija frekwencję, zniechęcenie ją tnie (±15%).
      if (kd.id === s.mojKlub) {
        widzowie = Math.round(widzowie * (0.85 + (s.zaufanieKibicow ?? 60) / 100 * 0.3));
        // Duma z wychowanków: miejscowi ulubieńcy trybun w składzie ściągają dodatkowych kibiców (do +9%).
        const ulub = s.taktyka.sklad.filter((id) => ulubieniecTrybun(s, s.zawodnicy[id], kd.id)).length;
        if (ulub > 0) widzowie = Math.round(widzowie * (1 + Math.min(0.09, ulub * 0.03)));
        // Regionalny dzień meczowy: bliski rywal = większe zainteresowanie + kibice gości z dojazdu (poza formalnym derbym/zgodą).
        if (!derbyNazwa && !przyjaznNazwa) {
          const dG = odlegloscDrogowa(kd.miasto, s.kluby[gosc].miasto);
          if (dG <= 70) widzowie = Math.round(widzowie * 1.08);
          else if (dG <= 150) widzowie = Math.round(widzowie * 1.04);
        }
        if (kd.trybunaImienia) widzowie = Math.round(widzowie * 1.02); // trybuna legendy — duma, komplet częściej
        if (kd.poziom >= 3 && kd.oswietlenie) widzowie = Math.round(widzowie * 1.02); // mecze pod światłami — więcej chętnych wieczorem
        if (terminWieczorny) widzowie = Math.round(widzowie * 1.03); // wieczorna transmisja prime time ściąga więcej widzów
        widzowie = Math.round(widzowie * mnoznikKomfortu(kd.obiekty, mrozSnieg || /deszcz|ulew|burz/i.test(pog.nazwa)));
        // Budowy na stadionie: zamknięte sektory i mniej chętnych (hałas, brak parkingu, kolejki).
        const ut = utrudnieniaMeczu(s);
        if (ut.ograniczenie > 0 || ut.frekKara > 0) {
          widzowie = Math.min(Math.round(kd.pojemnosc * (1 - ut.ograniczenie)), Math.round(widzowie * (1 - ut.frekKara)));
          if (moj) wiadomosc(s, `🚧 Prace budowlane na stadionie: ${ut.ograniczenie ? `${Math.round(ut.ograniczenie * 100)}% miejsc wyłączonych, ` : ""}frekwencja niższa o ok. ${Math.round(ut.frekKara * 100)}%.`);
        }

      }
      // Zjazd kibiców z całego obozu zgód → derby/podwyższone ryzyko to praktycznie komplet, zgoda prawie komplet.
      if (derbyNazwa) widzowie = Math.min(kd.pojemnosc, Math.max(widzowie, Math.round(kd.pojemnosc * 0.9)));
      else if (przyjaznNazwa) widzowie = Math.min(kd.pojemnosc, Math.max(widzowie, Math.round(kd.pojemnosc * 0.8)));
      // Kara ZPN: mecz u siebie przy pustych trybunach (zakaz po oprawach) — bez publiczności i wpływów z biletów.
      let zakazTeraz = false;
      if (kd.id === s.mojKlub && (s.zakazTrybun ?? 0) > 0) {
        zakazTeraz = true;
        widzowie = 0;
        s.zakazTrybun = (s.zakazTrybun ?? 0) - 1;
        wiadomosc(s, `🚷 Mecz przy pustych trybunach — kara ZPN za oprawy. Brak wpływów z biletów${(s.zakazTrybun ?? 0) > 0 ? `; pozostało takich meczów: ${s.zakazTrybun}` : ""}.`);
      }
      // Pogoda tnie frekwencję (sztorm/deszcz) — nawet na derbach.
      widzowie = Math.max(0, Math.round(widzowie * pog.frek));
      // Rekord frekwencji klubu (mecz u siebie) — tablica rekordów.
      if (kd.id === s.mojKlub && widzowie > (s.rekordy?.rekordFrekwencji?.widzowie ?? 0)) {
        const poprz = s.rekordy?.rekordFrekwencji?.widzowie ?? 0;
        s.rekordy = { ...(s.rekordy ?? {}), rekordFrekwencji: { sezon: s.sezon, widzowie, rywal: s.kluby[gosc].nazwa } };
        if (poprz > 0) wiadomosc(s, `📈 Rekord frekwencji klubu! ${widzowie.toLocaleString("pl")} widzów na meczu z ${s.kluby[gosc].nazwa} (poprzedni: ${poprz.toLocaleString("pl")}).`);
      }
      // Kibice gości (sektor gości): liczba wg renomy/bazy kibiców rywala i odległości (bliżej = więcej, derby = tłumnie),
      // ograniczona sektorem gości (~8% pojemności, 15% na derby) i wolnymi miejscami. Dolicza się do frekwencji i wpływów gospodarza.
      const kg = s.kluby[gosc];
      // sankcje: stadion bez publiczności / zamknięta trybuna gospodarzy (decyzje wojewody i Komisji Ligi)
      if (kd.sankcje?.stadionZamkniety && !zakazTeraz) { widzowie = 0; zakazTeraz = true; if (moj) wiadomosc(s, `🏛 Mecz na stadionie ${kd.nazwa} bez publiczności — decyzja wojewody po zadymie.`); }
      else if (kd.sankcje?.trybunaZamknieta) { widzowie = Math.round(widzowie * 0.65); if (moj) wiadomosc(s, `🚷 Trybuna z gniazdem dopingu ${kd.nazwa} zamknięta (kara Komisji Ligi) — ciszej na stadionie.`); }
      const sektorZamk = !!kd.sankcje?.sektorGosciZamkniety, zakazWyj = !!kg.sankcje?.zakazWyjazdowy;
      if (moj && (sektorZamk || zakazWyj)) wiadomosc(s, sektorZamk ? `🧱 Sektor gości na stadionie ${kd.nazwa} zamknięty decyzją wojewody — kibice ${kg.nazwa} zostają w domach.` : `🚫 Kibice ${kg.nazwa} mają zakaz wyjazdowy — sektor gości pusty.`);
      let gosci = 0;
      if (!zakazTeraz && !sektorZamk && !zakazWyj) {
        const dist = odlegloscDrogowa(kd.miasto, kg.miasto);
        const distMn = dist <= 0 ? 1 : Math.max(0.22, 1 - dist / 600);
        const baza = WIDZOWIE[kd.poziom - 1] * (0.04 + kg.renoma * 0.06) * distMn;
        gosci = Math.round(baza * (derbyNazwa ? 2.3 : przyjaznNazwa ? 1.4 : 1) * pog.frek);
        const sektor = sektorGosci(s, kd, !!derbyNazwa).miejsca; // PZPN: min. 5% miejsc dla zorganizowanej grupy gości
        gosci = Math.max(0, Math.min(gosci, sektor, Math.max(0, kd.pojemnosc - widzowie)));
      }
      widzowie = Math.min(kd.pojemnosc, widzowie + gosci);
      // Głośny sektor gości lekko osłabia atut własnego boiska (do −8%).
      const atutGosci = 1 - Math.min(0.08, (gosci / Math.max(1, widzowie)) * 0.25);
      zuzyjSankcje(kd, kg); // ten mecz „odbywa" karę (zamknięty sektor / trybuna / zakaz wyjazdowy)
      // derby innych klubów też bywają gorące — sankcje działają w całym świecie gry (np. zakaz wyjazdowy rywala)
      if (!moj && derbyNazwa && widzowie > 0 && szansa(0.12)) { const i = losujIncydent(losInt(5, 88), undefined, true); nalozSankcje(s, i.sektor === "gosci" ? kg : kd, kd, [i], true); }
      const incLive = moj && s.meczLive?.koniec ? s.meczLive.incydenty : undefined;
      const w = zagrajMecz(s, druz(dom, gosc), druz(gosc, dom), moj, { domAtut: atutBoiska(widzowie, kd.pojemnosc, !!derbyNazwa) * pog.atut * atutGosci, derby: !!derbyNazwa, mojTrening: moj ? s.trening : undefined, mojaStrona: dom === s.mojKlub ? "dom" : "gosc", pogoda: pog.gole });
      if (moj) {
        { const bus = wyjazdBusem(s, dom); if (bus) wiadomosc(s, bus); }
        poMeczu(s, w, derbyNazwa ?? null);
        if (w.dom === s.mojKlub) for (const t of rozliczBezpieczenstwo(s, kd, kg, widzowie, !!derbyNazwa, incLive)) wiadomosc(s, t);
        else for (const t of rozliczWyjazd(s, kd, s.kluby[s.mojKlub], gosci, !!derbyNazwa)) wiadomosc(s, t); // nasi kibice w klatce gości
        // oprawy (kilka na derbach / zgodach / wielkich meczach; każda inna, nigdy się nie powtarza)
        if (!incLive && widzowie > 0) {
          const zg = zgodaKibicow(s, kd, kg);
          for (const p of planOpraw(s, kd, kg, { derby: derbyNazwa ?? null, zgoda: zg, gosci, silaD: kulturaTrybun(s, kd).pirotechnika, silaG: kulturaTrybun(s, kg).pirotechnika })) {
            const kl = p.sektor === "gospodarzy" ? kd : kg;
            const kara = p.o.obrazliwa || p.o.pirotechnika ? Math.round([30000, 15000, 7000, 3000, 1500, 900, 500, 400, 300][Math.min(8, kd.poziom - 1)] * (p.o.obrazliwa ? 1 : 0.6) / 100) * 100 : 0;
            if (kara) kl.kasa = Math.max(0, kl.kasa - kara);
            wiadomosc(s, `🎆 ${p.min >= 46 ? "Po przerwie — " : ""}Oprawa kibiców ${kl.nazwa}: ${p.o.opis}${p.o.pirotechnika ? " Odpalający zamaskowani — nikogo nie zidentyfikowano." : ""}${kara ? ` Kara Komisji Ligi dla ${kl.nazwa}: ${zl(kara)}.` : ""}`);
          }
        }
        // kibice z charakterem (gdy mecz nie był oglądany na żywo — wtedy akcje były w relacji)
        if (!incLive && widzowie > 0) for (const a of akcjeKibicow(s, kd, kg, !!derbyNazwa, !!derbyNazwa, gosci)) {
          const winny = a.sektor === "gospodarzy" ? kd : kg; // każdy odpowiada za swoich kibiców
          const kara = karaZaAkcje(kd, a), szk = szkodyZaAkcje(kd, a);
          if (kara + szk) winny.kasa = Math.max(0, winny.kasa - kara - szk);
          if (winny.id !== s.mojKlub && !derbyNazwa && !a.kara && !a.szkody) continue; // u innych tylko ważniejsze wieści
          wiadomosc(s, `${a.tekst}${a.zatrzymani ? ` Policja zatrzymała ${a.zatrzymani} os.` : ""}${kara ? ` Kara dla ${winny.nazwa}: ${zl(kara)}.` : ""}${szk ? ` Rachunek za zniszczenia dla ${winny.nazwa}: ${zl(szk)}.` : ""}`);
        }
        // zamknięty sektor gości bez decyzji służb — kara licencyjna (jak w realiach Ekstraklasy)
        if (w.dom === s.mojKlub && sektorGosci(s, kd, !!derbyNazwa).zamkniety && kd.poziom <= 4) { const k = [250000, 80000, 30000, 12000][kd.poziom - 1]; kd.kasa -= k; wiadomosc(s, `⚖️ Komisja Licencyjna: zamknięty sektor gości (wymóg PZPN — min. 5% miejsc) — kara ${zl(k)}.`); }
        if (pog.gole < 1) wiadomosc(s, `${pog.ikona} ${pog.nazwa} w ${kd.miasto} — trudne warunki do gry${pog.frek < 0.9 ? ", część kibiców została w domach" : ""}.`);
        if (terminWieczorny && !zakazTeraz) {
          const premia = Math.round((WIDZOWIE[kd.poziom - 1] * 4) / 500) * 500;
          kd.kasa += premia;
          wiadomosc(s, `📺 Wieczorna transmisja pod światłami — prime time na ${kd.stadion}. Premia telewizyjna ${zl(premia)}, atmosfera jak na wielkim meczu.`);
          for (const id of s.taktyka.sklad) { const z = s.zawodnicy[id]; if (z) z.morale = Math.min(100, z.morale + 1); }
        }
        if (derbyNazwa) {
          wiadomosc(s, `⚔ ${derbyNazwa} — mecz podwyższonego ryzyka! Na trybunach ${widzowie.toLocaleString("pl")} kibiców.`);
          if (w.dom === s.mojKlub && !zakazTeraz) { // oprawa u siebie podkręca drużynę
            wiadomosc(s, wybierz([`🎆 Kibice przygotowali wielką oprawę na ${derbyNazwa} — sektory buzują, drużyna niesiona dopingiem!`, `🔥 Race, flagi i gardłowy doping na ${derbyNazwa} — nasz stadion to dziś kocioł!`]));
            for (const id of s.taktyka.sklad) { const z = s.zawodnicy[id]; if (z) z.morale = Math.min(100, z.morale + 2); }
            // incydenty (race, zadymy) rozlicza teraz moduł bezpieczeństwa — zależnie od firmy ochroniarskiej i obsady
          }
        }
        else if (przyjaznNazwa) {
          wiadomosc(s, `🤝 ${przyjaznNazwa} — świetna atmosfera, ${widzowie.toLocaleString("pl")} kibiców obu drużyn na trybunach.`);
          for (const id of s.kluby[s.mojKlub].zawodnicy) { const z = s.zawodnicy[id]; z.morale = Math.min(100, z.morale + 2); }
        }
        s.ostatnieOceny = s.taktyka.sklad.map((id) => ({ id, ocena: s.zawodnicy[id]?.ocenaMeczu ?? 0 }));
        po_meczu(s, w.dom === s.mojKlub, w.gd, w.gg, w.dom, w.gosc);
        generujKonferencje(s, w.dom === s.mojKlub ? w.gd : w.gg, w.dom === s.mojKlub ? w.gg : w.gd, !!derbyNazwa, w);
        // Reakcja mediów na głośny wynik.
        { const uS = w.dom === s.mojKlub, moje = uS ? w.gd : w.gg, ich = uS ? w.gg : w.gd, m = moje - ich;
          if (m >= 3) wiadomosc(s, wybierz([`📰 „${s.kluby[s.mojKlub].nazwa} w gazowym tempie!" — prasa chwali ${moje}:${ich}.`, `📰 Media: „Pokaz siły — ${moje}:${ich}. Kibice zachwyceni."`]));
          else if (m <= -3) wiadomosc(s, wybierz([`📰 Prasa bezlitosna po ${moje}:${ich}: „Gdzie był ten zespół?"`, `📰 Media: „Blamaż — ${moje}:${ich}. Trener pod presją."`]));
          else if (derbyNazwa && m > 0) wiadomosc(s, `📰 „Derby nasze! ${s.kluby[s.mojKlub].nazwa} górą" — media świętują z kibicami.`); }
        // Kibice gości (sektor gości) — poza derbami/zgodami (te mają własne komunikaty).
        if (!derbyNazwa && !przyjaznNazwa && gosci >= 200) {
          if (w.dom === s.mojKlub) wiadomosc(s, `🎟 Sektor gości wypełniony — ${gosci.toLocaleString("pl")} kibiców ${kg.nazwa} na naszym stadionie.`);
          else wiadomosc(s, `🚍 Nasz wyjazdowy sektor: ${gosci.toLocaleString("pl")} kibiców pojechało do ${kd.miasto}.`);
        }
        // Wyjazd: koszt transportu i zmęczenie wg odległości.
        if (w.gosc === s.mojKlub) {
          const dist = odlegloscDrogowa(s.kluby[s.mojKlub].miasto, kd.miasto);
          const koszt = Math.round(dist * (6 + s.kluby[s.mojKlub].poziom * 0.5) / 10) * 10;
          s.kluby[s.mojKlub].kasa -= koszt;
          if (dist > 160) for (const id of s.taktyka.sklad) { const z = s.zawodnicy[id]; if (z) z.kondycja = Math.max(30, z.kondycja - Math.min(6, (dist - 160) / 40)); }
          // Amator (V liga i niżej): daleki wyjazd potrafi przewyższyć tygodniowe wpływy — klub ratuje się zrzutką kibiców / dopłatą gminy.
          const amator = s.kluby[s.mojKlub].poziom >= 6;
          if (amator && dist > 130 && szansa(0.5)) {
            const wsparcie = Math.round(koszt * los(0.3, 0.6) / 10) * 10;
            s.kluby[s.mojKlub].kasa += wsparcie;
            wiadomosc(s, `🧾 Daleki wyjazd do ${kd.miasto} (${dist} km): zrzutka kibiców / dopłata gminy pokryła ${zl(wsparcie)} z transportu (koszt ${zl(koszt)}).`);
          } else if (dist > 220) wiadomosc(s, `🚌 Daleki wyjazd do ${kd.miasto} (${dist} km) — koszt ${zl(koszt)}, drużyna wróciła zmęczona.`);
          if (amator && s.kluby[s.mojKlub].kasa < 0) wiadomosc(s, `💸 Kasa na minusie po wyjeździe do ${kd.miasto} — w niższych ligach każdy daleki mecz to realny wydatek.`);
        }
        // Rekord: największa wygrana (margines, remis-break wyższym wynikiem).
        { const uS = w.dom === s.mojKlub, moje = uS ? w.gd : w.gg, ich = uS ? w.gg : w.gd;
          if (moje > ich) {
            const rek = s.rekordy?.najwieksza;
            const pm = rek ? (() => { const [a, b] = rek.wynik.split(":").map(Number); return [a - b, a] as [number, number]; })() : [-1, -1];
            if (!rek || moje - ich > pm[0] || (moje - ich === pm[0] && moje > pm[1])) {
              s.rekordy = { ...(s.rekordy ?? {}), najwieksza: { sezon: s.sezon, wynik: `${moje}:${ich}`, rywal: s.kluby[uS ? w.gosc : w.dom].nazwa, uSiebie: uS } };
            }
          } }
      }
      kd.kasa += przychodObiektow(kd.obiekty, widzowie);
      // B3: wpływ z bramki — klub gracza wg ceny biletu, z wyłączeniem posiadaczy karnetów (zapłacili z góry na start sezonu).
      { const mojG = kd.id === s.mojKlub;
        const cena = mojG ? (s.cenaBiletu ?? 1) : 1;
        const karnH = mojG ? Math.round((s.karnety ?? 0) * kd.pojemnosc) : 0;
        const bramka = Math.max(0, widzowie - karnH);
        kd.kasa += bramka * BILET[kd.poziom - 1] * cena; }
      // Dzień meczowy: loże VIP/hospitality + catering (gospodarz).
      const dm = przychodDniaMeczowego(kd, widzowie, !!derbyNazwa || !!przyjaznNazwa);
      kd.kasa += dm.razem;
      if (moj && w.dom === s.mojKlub && kd.poziom <= 4 && dm.razem > 0) {
        wiadomosc(s, `💺 Dzień meczowy: loże VIP ${zl(dm.vip)} + catering ${zl(dm.catering)} = ${zl(dm.razem)} przy ${widzowie.toLocaleString("pl")} widzach.`);
      }
      return w;
    });
    liga.wyniki[r] = wyniki;
    // Passa drużyn: wygrana przedłuża serię dodatnią, porażka ujemną, remis zeruje.
    for (const w of wyniki) {
      const kd = s.kluby[w.dom], kg = s.kluby[w.gosc];
      if (!kd || !kg) continue;
      if (w.gd > w.gg) { kd.seria = (kd.seria ?? 0) > 0 ? (kd.seria ?? 0) + 1 : 1; kg.seria = (kg.seria ?? 0) < 0 ? (kg.seria ?? 0) - 1 : -1; }
      else if (w.gd < w.gg) { kg.seria = (kg.seria ?? 0) > 0 ? (kg.seria ?? 0) + 1 : 1; kd.seria = (kd.seria ?? 0) < 0 ? (kd.seria ?? 0) - 1 : -1; }
      else { kd.seria = 0; kg.seria = 0; }
      // Komunikaty tylko dla mojego klubu przy progach passy.
      if (liga === mojaL && (w.dom === s.mojKlub || w.gosc === s.mojKlub)) {
        const se = s.kluby[s.mojKlub].seria ?? 0;
        if (se === 3) wiadomosc(s, "🔥 Trzecie zwycięstwo z rzędu — drużyna złapała wiatr w żagle! Rośnie pewność siebie i frekwencja.");
        else if (se === 5) wiadomosc(s, "🔥🔥 Pięć wygranych pod rząd! O tej serii mówi cała liga.");
        else if (se === -3) wiadomosc(s, "🥶 Trzecia porażka z rzędu — szatnia spuściła głowy, trzeba przerwać tę serię.");
        else if (se === -5) wiadomosc(s, "🥶🥶 Pięć porażek pod rząd — kryzys. Kibice tracą cierpliwość.");
      }
    }
  }
  juniorKolejka(s, r); // liga i puchar juniorów (U-19, U-17)
  // Mecz charytatywny / towarzyski w przerwie zimowej (raz w sezonie): dla miasta i kibiców — wpływy, dobra wola, lekki rozruch.
  { const half = Math.ceil(ileKolejek(s) / 2);
    if (r === half && !s.zwolniony) {
      const mk = s.kluby[s.mojKlub];
      const wplyw = Math.round((NAGRODA_LIGA[Math.max(0, mk.poziom - 1)] * 0.06) / 100) * 100;
      mk.kasa += wplyw;
      s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 2);
      for (const id of s.taktyka.sklad) { const z = s.zawodnicy[id]; if (z) z.kondycja = Math.min(100, z.kondycja + 4); }
      wiadomosc(s, `🤝 Zimowy mecz charytatywny ${mk.nazwa} — pełne trybuny dla dobrej sprawy, wpływy ${zl(wplyw)}, kibice wdzięczni, kadra rozruszana.`);
    } }
  { // przerwy FIFA (wrzesień, październik, listopad, marzec) — kadra Polski, U-21 i obcokrajowcy z Twojego klubu
    const lg = s.ligi[s.kluby[s.mojKlub].poziom - 1];
    const dk = dateKolejki(s.sezon, ileKolejek(s), r, kalendarzSzczebla(lg?.nazwa ?? "", lg?.poziom ?? 1));
    if (czasNaKadre(s, dk)) przerwaNaKadre(s, dk);
  }
  { const half = Math.ceil(ileKolejek(s) / 2); if (r === 1 || r === half) rynekAI(s); } // żywy rynek AI w oknach (lato/zima)
  if (r > 0 && r % 4 === 3) zawodnikMiesiaca(s); // co ~miesiąc
  if (r > 0 && r % 5 === 4) szatnia(s); // wydarzenia w szatni
  { const half = Math.ceil(ileKolejek(s) / 2); if (r === half - 1) dynamiczneCele(s); } // zarząd podnosi cel po 1. części sezonu
  { const gralem = mojaL.terminarz[r]?.some(([a, b]) => a === s.mojKlub || b === s.mojKlub); // licznik występów młodzieżowca
    if (gralem && s.taktyka.sklad.some((id) => s.zawodnicy[id] && jestMlodziezowcem(s.zawodnicy[id]))) s.mlodziezoweWystepy = (s.mlodziezoweWystepy ?? 0) + 1; }
  liczXIKolejki(s, mojaL, przedMecze, r + 1);
  if (moznaPuchar(s)) rundaPucharu(s);
  for (const w of tydzienJezykow(s)) wiadomosc(s, w); // nauka polskiego cudzoziemców, kurs, tłumacz
  for (const w of sprawdzOsiagniecia(s)) wiadomosc(s, w); // osiągnięcia trenera
  { // wędrująca oprawa z orłami — po stadionach scen kibicowskich (przez zgody)
    const kand = Object.values(s.kluby).filter((k) => k.poziom <= 5 && !k.rezerwaDla); // wszystkie kluby od Ekstraklasy do IV ligi
    const t = wedrownaOprawaTydzien(s, kand, (a) => kand.filter((b) => b.id !== a.id && !!zgodaKibicow(s, a, b)));
    if (t && (s.wedrujacaOprawa?.trasa.slice(-2).includes(s.kluby[s.mojKlub].nazwa) || s.wedrujacaOprawa?.trasa.length === 1 || Math.random() < 0.25)) wiadomosc(s, t);
  }
  { const ml = s.ligi[s.kluby[s.mojKlub].poziom - 1]; for (const id of ml?.kluby ?? []) { const t = noweFlagiTydzien(s, s.kluby[id]); if (t && id === s.mojKlub) wiadomosc(s, t); } } // flagi dorabiane z czasem
  if (europaNaKolejke(s)) rundaEuropy(s);
  tydzien(s);
  s.kolejka++;
  trenerzyWTrakcie(s); // karuzela trenerska: zwolnienia rywali za słabe wyniki w trakcie sezonu
  zakonczMisjeJesliCzas(s); // skaut mógł właśnie wrócić z misji
  if (s.kolejka >= ileKolejek(s)) {
    s.koniecSezonu = true;
    wiadomosc(s, "Koniec sezonu w Twojej lidze! Zobacz tabelę i przejdź do nowego sezonu.");
  } else {
    przygotujKolejke(s);
  }
}

/** Karuzela trenerska: kluby AI ze słabymi wynikami (znacznie poniżej oczekiwań wg renomy) zwalniają trenera w trakcie sezonu. */
export function trenerzyWTrakcie(s: StanGry) {
  const mL = mojaLiga(s);
  let zwolnien = 0; // limit na kolejkę, by nie zasypać wiadomości
  for (const liga of s.ligi) {
    const total = liga.terminarz.length || 30;
    const frac = s.kolejka / total;
    if (frac < 0.34 || frac > 0.95) continue; // nie na starcie i nie tuż przed końcem
    const tab = tabelaLigi(s, liga);
    const n = tab.length;
    if (n < 6) continue;
    // oczekiwana pozycja wg renomy (najmocniejszy = 1.)
    const wgRenomy = [...liga.kluby].sort((a, b) => (s.kluby[b]?.renoma ?? 0) - (s.kluby[a]?.renoma ?? 0));
    const oczek = new Map(wgRenomy.map((id, i) => [id, i + 1]));
    const strefaSpadku = Math.max(2, Math.round(n * 0.17)); // ~dolne 17%
    for (let pos = n - strefaSpadku; pos < n; pos++) {
      const kid = tab[pos]?.klubId;
      if (!kid || kid === s.mojKlub) continue;
      const klub = s.kluby[kid];
      if (!klub) continue;
      const rank = pos + 1;
      const rozczarowanie = rank - (oczek.get(kid) ?? rank); // dodatnie = gorzej niż oczekiwano
      if (rozczarowanie < 4) continue; // słaby, ale mniej-więcej zgodnie z rangą — trener zostaje
      // świeżo zatrudniony dostaje czas
      if (klub.trenerOd != null && klub.trenerOd >= s.sezon && frac < 0.6) continue;
      const szansaZwol = 0.04 + Math.min(0.12, rozczarowanie * 0.02); // im większe rozczarowanie, tym bardziej gorąca posada
      if (!szansa(szansaZwol)) continue;
      const staryImie = `${klub.trenerImie ?? ""} ${klub.trenerNazwisko ?? ""}`.trim();
      const nast = zwolnijTreneraAI(s, klub);
      zwolnien++;
      // wiadomość tylko dla Twojej ligi i czołowych szczebli (reszta cicho, by nie spamować)
      if (liga === mL || klub.poziom <= 2) {
        wiadomosc(s, `🔴 ${klub.nazwa} zwalnia trenera (${staryImie}) po słabych wynikach — ${rank}. miejsce. Następca: ${nast.imie} ${nast.nazwisko}.`);
      }
      if (zwolnien >= 2) return; // maks. 2 zwolnienia na kolejkę w całym świecie
    }
  }
}

/** Przepis PZPN: zespół rezerw może wystawić zawodników pierwszej drużyny, którzy nie grają w niej na stałe
 *  (mała liczba minut / poza wyjściową XI danej kolejki — zwłaszcza młodzieżowców). Zwraca id powołanych. */
function powolaniaRezerwy(s: StanGry, rezerwaId: string): string[] {
  const rez = s.kluby[rezerwaId];
  const pierwszyId = rez.rezerwaDla;
  if (!pierwszyId || !s.kluby[pierwszyId]) return [];
  const pierwszy = s.kluby[pierwszyId];
  // Wyjściowa XI pierwszego zespołu tej kolejki — ci są „zajęci" i nie schodzą do rezerw.
  const xiPierwszej = new Set(autoSklad(s, pierwszyId, formacjaAI(pierwszyId)));
  // Kandydaci: zawodnicy pierwszego zespołu spoza XI (rezerwowi/ławka), dostępni.
  let kandydaci = pierwszy.zawodnicy
    .map((id) => s.zawodnicy[id])
    .filter((z) => z && !xiPierwszej.has(z.id) && dostepny(s, z));
  // Najpierw młodzi (U-23) — to oni realnie dostają minuty w rezerwach; potem najlepsi z reszty ławki.
  kandydaci.sort((a, b) => {
    const ma = a.wiek <= 23 ? 1 : 0, mb = b.wiek <= 23 ? 1 : 0;
    if (ma !== mb) return mb - ma;
    return b.umiej - a.umiej;
  });
  // Powołujemy kilku (rotacja): 2–5, ale nie więcej, niż ławka pozwala.
  const ile = Math.min(kandydaci.length, losInt(2, 5));
  return kandydaci.slice(0, ile).map((z) => z.id);
}

function autoSkladAI(s: StanGry, klubId: string) {
  // AI też ma nieobecności amatorów (prosto: losowo wypada jeden-dwóch)
  const poziom = s.kluby[klubId].poziom;
  // Rezerwy: dołóż do puli powołanych z pierwszego zespołu (przepis PZPN), zanim wybierzemy XI.
  const kk = s.kluby[klubId];
  const powolani = kk.rezerwaDla && zespolyKlubu(s, klubId).length > 1
    ? powolaniaAI(s, klubId, new Set(zespolyKlubu(s, klubId).filter((z) => nrZespolu(z) < nrZespolu(kk)).flatMap((z) => s.ostatnieSklady?.[z.id] ?? [])))
    : undefined;
  const sklad = autoSklad(s, klubId, formacjaAI(klubId), powolani);
  if (kk.rezerwaDla || kk.rezerwaId) {
    (s.ostatnieSklady ??= {})[klubId] = [...sklad];
    if (kk.rezerwaDla) for (const id of sklad) { const z = s.zawodnicy[id]; if (z) z.meczeRezerwy = (z.meczeRezerwy ?? 0) + 1; }
  }
  if (poziom >= 7 && szansa(0.5)) {
    const kadra = [...s.kluby[klubId].zawodnicy, ...(powolani ?? [])].filter((id) => !sklad.includes(id) && dostepny(s, s.zawodnicy[id]));
    const ile = losInt(1, 2);
    for (let i = 0; i < ile && kadra.length; i++) sklad[losInt(1, 10)] = kadra.splice(losInt(0, kadra.length - 1), 1)[0];
  }
  return sklad;
}

function po_meczu(s: StanGry, uSiebie: boolean, gd: number, gg: number, dom: string, gosc: string) {
  const moje = uSiebie ? gd : gg;
  const ich = uSiebie ? gg : gd;
  const rywal = s.kluby[uSiebie ? gosc : dom];
  const wynik = moje > ich ? "wygrana" : moje < ich ? "porażka" : "remis";
  const tw = trenerOtwarty(s);
  if (tw) { tw.mecze++; tw.bz += moje; tw.bp += ich; if (moje > ich) tw.w++; else if (moje < ich) tw.p++; else tw.r++; }
  // Mały, natychmiastowy odruch zarządu (dla odczucia). Główna ocena = miejsce w tabeli (ocenZarzad w tydzien()).
  const upset = rywal.renoma > s.kluby[s.mojKlub].renoma + 0.1 ? 1.6 : 1;
  const zmiana = moje > ich ? 1.5 * upset : moje < ich ? -1.2 : 0.2;
  s.zarzad = Math.max(0, Math.min(100, s.zarzad + zmiana));
  for (const id of s.taktyka.sklad) {
    const z = s.zawodnicy[id];
    z.forma = Math.max(-5, Math.min(5, z.forma + (moje > ich ? 1 : moje < ich ? -1 : 0) + los(-1, 1)));
  }
  wiadomosc(s, `${wynik[0].toUpperCase()}${wynik.slice(1)} ${moje}:${ich} z ${rywal.nazwa} (${uSiebie ? "dom" : "wyjazd"}).`);
}

/** Pozycja, do której zmierza zaufanie zarządu, wg miejsca w tabeli względem celu sezonu (0–100). */
function zasluzoneZaufanie(s: StanGry): number {
  const liga = mojaLiga(s);
  const tab = tabelaLigi(s, liga);
  const n = tab.length;
  const poz = tab.findIndex((w) => w.klubId === s.mojKlub) + 1;
  if (poz === 0) return s.zarzad;
  const poziom = s.kluby[s.mojKlub].poziom;
  const promo = poziom > 1 ? s.wymiana[poziom - 2] : 2;
  const spadkowcy = poziom < s.ligi.length ? s.wymiana[poziom - 1] : 0;
  const nadSpadkiem = n - spadkowcy;
  if (s.cel === "Awans") return poz <= promo ? 85 : poz <= promo + 2 ? 60 : poz <= n / 2 ? 45 : 28;
  if (s.cel === "Górna połowa tabeli") return poz <= n / 2 ? 75 : poz <= n / 2 + 2 ? 52 : poz <= nadSpadkiem ? 40 : 25;
  // Utrzymanie
  return poz <= n / 2 ? 82 : poz <= nadSpadkiem ? 62 : poz === nadSpadkiem + 1 ? 38 : 24;
}

/** Pensje, sponsor, trening, regeneracja, kontuzje, oferty. */
/** Realna liczba treningów w tygodniu wg poziomu: Ekstraklasa/I liga codziennie (~6), B/C klasa ~2 + mecz. */
export function treningiWTygodniu(poziom: number): number {
  return [6, 6, 5, 4, 4, 3, 3, 2, 2][Math.min(8, Math.max(0, poziom - 1))];
}
/** Dozwolony zakres treningów w tygodniu (możesz trenować nieco rzadziej/częściej niż standard poziomu). */
export function zakresTreningow(poziom: number): [number, number] {
  const d = treningiWTygodniu(poziom);
  return [Math.max(1, d - 1), Math.min(7, d + 2)];
}
/** Wybrana liczba treningów Twojego klubu (domyślnie standard poziomu). */
export function treningiMoje(s: StanGry): number {
  const d = treningiWTygodniu(s.kluby[s.mojKlub].poziom);
  return s.treningiTydzien ?? d;
}
/** Mnożnik rozwoju z częstotliwości treningów (więcej treningów = szybszy progres). */
function treningMn(freq: number): number {
  return 0.4 + freq * 0.12; // 6 treningów ≈ 1.12, 2 treningi ≈ 0.64
}

// Przychody z praw TV/transmisji na sezon wg szczebla (tylko ligi profesjonalne; niżej amatorzy bez TV).
const PRAWA_TV = [15_000_000, 3_000_000, 800_000, 250_000, 0, 0, 0, 0, 0, 0, 0, 0];

function tydzien(s: StanGry) {
  for (const k of Object.values(s.kluby)) {
    const kolejek = s.ligi[k.poziom - 1].terminarz.length;
    k.kasa += SPONSOR_SEZON[k.poziom - 1] * (0.7 + k.renoma * 0.6) / kolejek;
    k.kasa += (PRAWA_TV[k.poziom - 1] ?? 0) / kolejek; // przychody z praw TV/transmisji (wyższe ligi)
    for (const id of k.zawodnicy) k.kasa -= s.zawodnicy[id].pensja;
    if (k.id === s.mojKlub) k.kasa -= kosztSztabuNaKolejke(s); // pensje sztabu szkoleniowego
  }
  if (s.treningAuto) autoFokus(s); // asystent dobiera fokus treningu wg słabości kadry
  // Rezerwy (PZPN): rezerwiści pierwszego zespołu grają w rezerwach — mniej tracą kondycji, młodzi szybciej rosną.
  const mamRezerwy = !!s.kluby[s.mojKlub].rezerwaId;
  const aMoj = poziomAkademii(s.kluby[s.mojKlub]) / 5; // poziom akademii (do treningu młodzieży)
  const juniorSet = new Set(s.kluby[s.mojKlub].juniorzy ?? []); // juniorów rozwijamy osobno (rozwojJuniorow)
  const maWeterana = s.kluby[s.mojKlub].zawodnicy.some((id) => s.zawodnicy[id]?.cechy?.includes("weteran")); // mentor przyspiesza młodych
  for (const z of Object.values(s.zawodnicy)) {
    if (juniorSet.has(z.id)) continue;
    const moj = z.klubId === s.mojKlub;
    const wSkladzie = s.taktyka.sklad.includes(z.id);
    const graWRezerwach = !wSkladzie && moj && mamRezerwy && z.zawieszenie === 0 && z.kontuzja === 0;
    const poziom = z.klubId ? s.kluby[z.klubId].poziom : 9;
    const freq = moj ? treningiMoje(s) : treningiWTygodniu(poziom);
    const kondBonus = moj && s.trening === "kondycja" ? 4 : 0;
    // Więcej treningów niż standard poziomu + intensywność = większe zmęczenie (gorsza regeneracja).
    const zmeczenie = moj ? (freq - treningiWTygodniu(poziom)) * 1.3 + zmeczenieIntensywnosci(s) : 0;
    // Zmęczenie SEZONOWE: kumuluje się u ogranych zawodników, najmocniej późną wiosną — rotacja je ogranicza.
    const kolejekZ = s.ligi[poziom - 1]?.terminarz.length ?? 30;
    const fracSez = Math.min(1, s.kolejka / kolejekZ);
    const przeciazenie = Math.max(0, (z.mecze ?? 0) - kolejekZ * 0.4);
    const zmeczSez = moj ? fracSez * Math.min(6, przeciazenie * 0.2) : 0;
    // Półprofesjonalizm: amatorzy (V liga i niżej) trenują po pracy — wolniejsza regeneracja kondycji (symetrycznie dla wszystkich klubów szczebla).
    const amatorFit = poziom >= 7 ? 0.7 : poziom === 6 ? 0.85 : 1;
    z.kondycja = Math.min(100, z.kondycja + (wSkladzie ? 10 : graWRezerwach ? 12 : 18) * amatorFit + kondBonus - zmeczenie - zmeczSez + (moj ? bonusRegeneracji(s) : 0));
    // Przeciążenie: ogrywany zawodnik z niską kondycją późną wiosną łapie uraz mięśniowy (rotuj skład!).
    if (moj && zmeczSez >= 3 && z.kondycja < 50 && z.kontuzja === 0 && z.zawieszenie === 0 && szansa(0.05)) {
      z.kontuzja = losInt(1, 2);
      wiadomosc(s, `🧎 ${z.imie} ${z.nazwisko} nabawił się urazu z przeciążenia (zmęczenie sezonowe) — pauza ${z.kontuzja} kol. Rozważ rotację składu.`);
    }
    if (z.kontuzja > 0) z.kontuzja--;
    if (z.zawieszenie > 0) z.zawieszenie--;
    // trening: rozwój ku potencjałowi; fokus klubowy + intensywność działają na Twoją kadrę.
    // Twoja kadra: część tygodnia mogła już zostać wytrenowana dzień po dniu (kalendarz) — tu dokładamy resztę.
    const frac = moj ? Math.max(0, 1 - (s.treningiDni ?? 0) / 3) : 1;
    if (frac > 0) rozwojTreningowy(s, z, frac, { moj, wSkladzie, graWRezerwach, freq, aMoj, maWeterana }, (m) => wiadomosc(s, m));
  }
  s.treningiDni = 0;
  naborUlicy(s);     // adept „z ulicy" może trafić do akademii U-21
  rozwojJuniorow(s); // juniorzy rozwijają się (gra U-21 + szkolenie)
  rozwojTestow(s); odswiezRynekTestow(s); sprzatnijRynekTestow(s); // zawodnicy na testach (niższe ligi)
  const moj = s.kluby[s.mojKlub];
  // Morale Twojej kadry: gra/ławka, ostatni wynik, pensja vs żądanie, ambicja (overqualified).
  const wyn = mojaLiga(s).wyniki[s.kolejka]?.find((w) => w.dom === s.mojKlub || w.gosc === s.mojKlub);
  const wynikMoralny = wyn ? ((wyn.dom === s.mojKlub ? wyn.gd : wyn.gg) - (wyn.dom === s.mojKlub ? wyn.gg : wyn.gd)) : 0;
  if (wyn) s.zaufanieKibicow = Math.max(0, Math.min(100, (s.zaufanieKibicow ?? 60) + (wynikMoralny > 0 ? 3 + Math.min(2, wynikMoralny) : wynikMoralny < 0 ? -3 : 0)));
  // Rada kibiców: przy bardzo niskim zaufaniu trybuny protestują (transparenty, bojkot) — psują atmosferę i naciskają na zarząd.
  if ((s.zaufanieKibicow ?? 60) < 18 && szansa(0.5)) {
    for (const id of moj.zawodnicy) { const z = s.zawodnicy[id]; if (z) z.morale = Math.max(0, z.morale - 2); }
    s.zarzad = Math.max(0, s.zarzad - 2);
    wiadomosc(s, wybierz([
      "📣 Rada Kibiców wywiesiła transparent: Działacze precz, gramy o honor! Atmosfera wokół klubu gęstnieje.",
      "🚫 Kibice zapowiedzieli bojkot trybun w proteście — pustki na stadionie, ciężka atmosfera w szatni.",
      "📣 Protest pod stadionem: fani żądają zmian i wygwizdują zarząd. Presja rośnie.",
    ]));
  }
  const gornaUmiej = zakresUmiej(moj.poziom)[1];
  for (const id of moj.zawodnicy) {
    const z = s.zawodnicy[id];
    const lojalny = z.cechy?.includes("lojalny");
    const niespokojny = z.cechy?.includes("niespokojny");
    const naLawce = !s.taktyka.sklad.includes(id);
    let d = !naLawce ? 2 : mamRezerwy ? 0.5 : -1.6;
    d += wynikMoralny > 0 ? 1.2 : wynikMoralny < 0 ? -1.2 : 0.2;
    d += z.pensja >= zadaniePlacowe(s, z, moj.poziom) ? 0.4 : -1;
    if (s.kapitan && moj.zawodnicy.includes(s.kapitan)) d += 0.3; // kapitan scala szatnię
    if (z.umiej > gornaUmiej + 4) d -= 0.9; // za dobry na tę ligę — chce wyżej
    // Osobowość (B3): lojalny znosi gorszy czas i szybciej się podnosi, niespokojny traci cierpliwość.
    if (d < 0) d *= lojalny ? 0.5 : niespokojny ? 1.4 : 1;
    else if (lojalny) d += 0.3;
    z.morale = Math.max(0, Math.min(100, z.morale + d));
    const prog = lojalny ? 12 : niespokojny ? 32 : 22; // niespokojny odchodzi łatwo, lojalny tylko przy dnie
    const szansaPro = lojalny ? 0.12 : niespokojny ? 0.5 : 0.3;
    if (z.morale < prog && !z.prosiOTransfer && szansa(szansaPro)) {
      z.prosiOTransfer = true;
      const powod = naLawce ? "za mało gra" : z.umiej > gornaUmiej + 4 ? "czuje, że przerósł tę ligę"
        : z.pensja < zadaniePlacowe(s, z, moj.poziom) ? "jest niezadowolony z kontraktu" : "stracił motywację w klubie";
      wiadomosc(s, `✈️ ${z.imie} ${z.nazwisko} ${niespokojny ? "otwarcie domaga się transferu" : "prosi o transfer"} — ${powod}.`);
    } else if (z.morale > (lojalny ? 40 : 50)) z.prosiOTransfer = false;
    // forma dryfuje ku morale
    z.forma = Math.max(-5, Math.min(5, z.forma + (z.morale > 70 ? 0.1 : z.morale < 35 ? -0.1 : 0)));
  }
  // Oferty za moich zawodników. Wystawieni na sprzedaż dostają je dużo chętniej (blisko ceny wywoławczej).
  s.oferty = s.oferty.filter((o) => moj.zawodnicy.includes(o.zawodnikId)).slice(0, 8);
  // Deadline day: w ostatniej kolejce otwartego okna ofert jest więcej (gorączka transferowa).
  const deadline = oknoOtwarte(s) && !oknoTransferowe(s.sezon, ileKolejek(s), s.kolejka + 1, false, moj.poziom).otwarte;
  if (oknoOtwarte(s) && moj.zawodnicy.length > 14) {
    const kupcyZa = (z: Zawodnik) => Object.values(s.kluby).filter((k) => !k.pozaLiga && !k.pozaPiramida && k.id !== moj.id && k.poziom <= moj.poziom + 1 && k.poziom >= moj.poziom - 2 && k.zawodnicy.length < 25);
    // 1) Wystawieni na sprzedaż — oferty tym chętniej, im rozsądniejsza cena wywoławcza.
    const wystawieni = moj.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => (z.wystawiony ?? 0) > 0 && !z.macierzysty);
    for (const z of wystawieni) {
      if (s.oferty.some((o) => o.zawodnikId === z.id)) continue; // już jest oferta — czeka na decyzję
      const rynkowa = Math.max(1, wartosc(z));
      const ask = z.wystawiony!;
      const stos = ask / rynkowa; // >1 = drożej niż rynek
      const baza = deadline ? 0.65 : 0.45;
      const szansaZ = Math.max(0.06, baza * (stos <= 1 ? 1.2 : stos <= 1.3 ? 0.85 : stos <= 1.6 ? 0.45 : 0.22));
      if (!szansa(szansaZ)) continue;
      const kupcy = kupcyZa(z);
      if (!kupcy.length) continue;
      const kupiec = wybierzWazone(kupcy, (k) => wagaBliskosci(s, moj, k) * wieziRynkowe(moj.nazwa, k.nazwa));
      const mnoznik = stos <= 1 ? los(0.9, 1.0) : stos <= 1.3 ? los(0.8, 0.96) : los(0.65, 0.85);
      let kwota = Math.round((ask * mnoznik) / 100) * 100;
      if (kupiec.kasa < kwota) kwota = Math.round((kupiec.kasa * 0.9) / 100) * 100;
      if (kwota < rynkowa * 0.4 || kwota < 1000) continue; // za niska — kupiec odpuszcza
      s.oferty.push({ zawodnikId: z.id, klubId: kupiec.id, kwota });
      wiadomosc(s, `🏷 ${kupiec.nazwa} (${zasiegOferty(s, moj, kupiec)}) oferuje ${zl(kwota)} za wystawionego ${z.imie} ${z.nazwisko} — wywoławcza ${zl(ask)}.`);
    }
    // 1b) Talent przerasta ligę: kluby z wyższych szczebli zgłaszają się same (również po amatorów — odstępne).
    for (const z of moj.zawodnicy.map((id) => s.zawodnicy[id])) {
      if (!z || z.macierzysty || z.kontraktTyp === "amator" || (z.wystawiony ?? 0) > 0 || s.oferty.some((o) => o.zawodnikId === z.id)) continue;
      if (moj.poziom <= 1 || z.umiej < zakresUmiej(moj.poziom - 1)[0] + 2) continue; // gra na poziomie wyższej ligi
      if (!szansa(deadline ? 0.25 : 0.1)) continue;
      const kupcy = Object.values(s.kluby).filter((k) => !k.pozaLiga && !k.pozaPiramida && k.id !== moj.id && k.poziom < moj.poziom && k.poziom >= moj.poziom - 3 && k.zawodnicy.length < 28);
      if (!kupcy.length) continue;
      const kupiec = wybierzWazone(kupcy, (k) => wagaBliskosci(s, moj, k) * (1 + k.renoma));
      const baza = wartosc(z);
      const kwota = Math.max(1000, Math.round((baza * los(0.8, 1.25)) / 100) * 100);
      if (kupiec.kasa < kwota) continue;
      s.oferty.push({ zawodnikId: z.id, klubId: kupiec.id, kwota });
      wiadomosc(s, `🔭 ${kupiec.nazwa} (${s.ligi[kupiec.poziom - 1]?.nazwa ?? "wyższa liga"}) chce ${z.imie} ${z.nazwisko} — oferuje ${zl(kwota)}. Talent przerasta naszą ligę.`);
    }
    // 2) Sporadyczna oferta za niewystawionego (jak dawniej, rzadziej).
    if (szansa(deadline ? 0.4 : 0.18)) {
      const z = s.zawodnicy[wybierz(moj.zawodnicy)];
      if (!(z.wystawiony ?? 0) && !z.macierzysty && !s.oferty.some((o) => o.zawodnikId === z.id)) {
        const kupcy = Object.values(s.kluby).filter((k) => !k.pozaLiga && !k.pozaPiramida && k.id !== moj.id && k.poziom <= moj.poziom && k.poziom >= moj.poziom - 2);
        if (kupcy.length) {
          const kupiec = wybierzWazone(kupcy, (k) => wagaBliskosci(s, moj, k) * wieziRynkowe(moj.nazwa, k.nazwa));
          const kwota = Math.round((wartosc(z) * los(0.7, 1.3) * (deadline ? 1.1 : 1)) / 100) * 100;
          if (kupiec.kasa > kwota) {
            s.oferty.push({ zawodnikId: z.id, klubId: kupiec.id, kwota });
            wiadomosc(s, `${deadline ? "⏳ Deadline day! " : ""}${kupiec.nazwa} (${zasiegOferty(s, moj, kupiec)}) oferuje ${zl(kwota)} za ${z.imie} ${z.nazwisko}.`);
          }
        }
      }
    }
  }
  // Aktywacja KLAUZULI WYKUPU Twojego zawodnika przez bogatszy/wyżej grający klub — klub nie może zablokować.
  if (szansa(0.16) && moj.zawodnicy.length > 15) {
    const zKl = moj.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z.klauzula && !z.macierzysty);
    if (zKl.length) {
      const zz = s.zawodnicy[wybierz(zKl.map((z) => z.id))];
      const kwota = zz.klauzula!;
      const kupcy = Object.values(s.kluby).filter((k) => !k.pozaLiga && !k.pozaPiramida && k.id !== moj.id && k.kasa >= kwota && (k.poziom < moj.poziom || (k.poziom === moj.poziom && k.renoma > moj.renoma + 0.04)));
      if (kupcy.length) {
        const kupiec = kupcy.sort((a, b) => a.poziom - b.poziom || b.renoma - a.renoma)[0];
        const chce = kupiec.poziom < moj.poziom || kupiec.renoma > moj.renoma + 0.06 || zz.morale < 45;
        if (chce && szansa(0.7)) {
          const ulubiony = ulubieniecTrybun(s, zz, moj.id);
          moj.zawodnicy = moj.zawodnicy.filter((x) => x !== zz.id);
          kupiec.zawodnicy.push(zz.id);
          moj.kasa += kwota; kupiec.kasa -= kwota;
          wyplacOdsprzedaz(s, zz, kwota, moj.id);
          if (s.kapitan === zz.id) s.kapitan = null;
          s.taktyka.sklad = s.taktyka.sklad.filter((x) => x !== zz.id);
          przejscieDoKlubu(s, zz, kupiec.nazwa);
          zz.klubId = kupiec.id; zz.kontraktDo = s.sezon + dlugoscKontraktu(kupiec.poziom); delete zz.klauzula;
          wiadomosc(s, `💸 ${kupiec.nazwa} aktywował klauzulę wykupu (${zl(kwota)}) ${zz.imie} ${zz.nazwisko} — zawodnik odchodzi, klauzuli nie dało się zablokować.`);
          if (ulubiony) { // klauzula to nie Twoja wina — kibice smutni, ale łagodniej
            s.zaufanieKibicow = Math.max(0, (s.zaufanieKibicow ?? 60) - 4);
            wiadomosc(s, `😔 Trybuny żegnają wychowanka ${zz.imie} ${zz.nazwisko} — klauzula zabrała ulubieńca (zaufanie −4).`);
          }
        }
      }
    }
  }
  // Główna ocena: zaufanie dryfuje do poziomu zasłużonego miejscem w tabeli (łagodnie, by nie skakało).
  if (mojaLiga(s).wyniki.length > 0) {
    s.zarzad = Math.max(0, Math.min(100, s.zarzad * 0.86 + zasluzoneZaufanie(s) * 0.14));
  }
  if (moj.kasa < -SPONSOR_SEZON[moj.poziom - 1] * 0.1 && szansa(0.5)) {
    s.zarzad = Math.max(0, s.zarzad - 2);
    wiadomosc(s, "Zarząd: klub jest pod kreską! Sprzedaj kogoś albo obetnij pensje.");
  }
  // Zwolnienie dopiero przy naprawdę złej rundzie, w drugiej połowie sezonu.
  if (s.zarzad <= 8 && s.kolejka >= 16) {
    const o = trenerOtwarty(s); if (o) o.do = s.sezon;
    s.zwolniony = true;
    s.powodWolny = "zwolniony";
    wiadomosc(s, "Zarząd stracił cierpliwość — zostałeś zwolniony. Znajdź nowy klub bez trenera.");
  }
}

// ——— Zakończenie kariery (realistyczne, wg szczebla i pozycji) ———
// Amatorzy (klasa okręgowa→B, poziom 6+) grają najdłużej — nawet po 40-tce; półzawodowcy (III–V liga)
// krócej; zawodowcy (Ekstraklasa/I liga) najkrócej (obciążenia, wypychani przez młodszych). Bramkarze grają najdłużej.
/** Wiek, od którego zaczyna rosnąć szansa zakończenia kariery. */
function progEmerytury(poziom: number, poz: string): number {
  const baza = poziom <= 2 ? 33 : poziom <= 5 ? 35 : 37;
  const bonusPoz = poz === "BR" ? 3 : (poz === "OBR" || poz === "NAP") ? 1 : 0; // bramkarze, potem obrońcy/napastnicy
  return baza + bonusPoz;
}
/** Twardy wiek, w którym zawodnik na pewno wiesza buty (wyżej dla amatorów i bramkarzy). */
function wiekKonca(poziom: number, poz: string): number {
  const baza = poziom <= 2 ? 39 : poziom <= 5 ? 42 : 45;
  return baza + (poz === "BR" ? 2 : 0);
}
/** Czy zawodnik kończy karierę w tym sezonie. */
function konczyKariere(z: Zawodnik, poziom: number): boolean {
  if (z.wiek >= wiekKonca(poziom, z.poz)) return true;
  const prog = progEmerytury(poziom, z.poz);
  if (z.wiek < prog) return false;
  let p = (z.wiek - prog) * 0.16; // szansa rośnie z każdym rokiem po progu
  const minPoziomu = zakresUmiej(poziom)[0];
  if (z.umiej < minPoziomu - 6) p += 0.22; // wypadł z poziomu — schodzi szybciej
  if (z.cechy?.includes("profesjonalista")) p *= 0.6; // dba o siebie — gra dłużej
  return szansa(Math.min(0.95, p));
}
/** Pożegnanie z podsumowaniem kariery (dla klubu gracza). */
function pozegnanieKariery(z: Zawodnik, k: Klub): string {
  const mecze = (z.kariera || []).reduce((a, w) => a + (w.mecze || 0), 0);
  const gole = (z.kariera || []).reduce((a, w) => a + (w.gole || 0), 0);
  const klubow = new Set((z.kariera || []).map((w) => w.klub)).size || 1;
  const wychow = z.wychowanek === k.nazwa;
  const legenda = mecze >= 300 || (wychow && mecze >= 150);
  const bramkiTxt = z.poz !== "BR" && gole > 0 ? `, ${gole} goli` : "";
  const dorobek = mecze > 0 ? ` W karierze ${mecze} meczów${bramkiTxt} w ${klubow} ${klubow === 1 ? "klubie" : "klubach"}.` : "";
  if (legenda) return `🎖 ${z.imie} ${z.nazwisko} (${z.wiek} l., ${z.poz}) kończy karierę — ${wychow ? "wychowanek i legenda klubu" : "legenda"}.${dorobek} Dziękujemy!`;
  return `👋 ${z.imie} ${z.nazwisko} (${z.wiek} l., ${z.poz}) zakończył piłkarską karierę.${dorobek}`;
}

/** Kończy sezon: dogrywa resztę lig, awanse/spadki, starzenie, nowy terminarz. */
/**
 * Superpuchar Polski (zasady PZPN): jeden mecz MISTRZ Ekstraklasy vs ZDOBYWCA Pucharu Polski przed sezonem.
 * Przy dublecie (ten sam klub) rywalem jest wicemistrz. Remis → rzuty karne. Obsada: sędziowie centralni + VAR.
 */
function superpucharPolski(s: StanGry, ekstraklasa: string[]) {
  if (ekstraklasa.length < 2) return;
  const mistrzId = ekstraklasa[0];
  // Zdobywca Pucharu Polski: gracz, jeśli go zdobył; inaczej mocny klub Ekstraklasy (≠ mistrz).
  const graczZdobyl = !!s.puchar && (s.puchar.faza === "zdobyty" || s.puchar.zdobywcaGlowny === s.kluby[s.mojKlub]?.nazwa);
  const kandydaci = ekstraklasa.slice(0, 6).filter((id) => id !== mistrzId);
  let ppId = graczZdobyl ? s.mojKlub : (kandydaci.length ? wybierz(kandydaci) : ekstraklasa[1]);
  if (!ppId || ppId === mistrzId) ppId = ekstraklasa[1]; // dublet → wicemistrz
  const A = s.kluby[mistrzId], B = s.kluby[ppId];
  if (!A || !B) return;
  const przewaga = silaKlubu(s, mistrzId) - silaKlubu(s, ppId);
  const gA = Math.max(0, Math.round(1.3 + przewaga * 0.12 + los(-0.9, 0.9)));
  const gB = Math.max(0, Math.round(1.3 - przewaga * 0.12 + los(-0.9, 0.9)));
  let karne = "", aWin: boolean;
  if (gA === gB) { aWin = szansa(0.5 + Math.max(-0.2, Math.min(0.2, przewaga * 0.03))); karne = " k."; }
  else aWin = gA > gB;
  const zwyc = aWin ? A : B, przeg = aWin ? B : A;
  const wynik = `${gA}:${gB}${karne}`;
  const sedzia = obsadaMeczu(s, 1, los(0.6, 1.4), { cupPolski: true }).glowny;
  zwyc.kasa += 1_500_000; przeg.kasa += 700_000; // nagrody PZPN
  s.superpuchar = { sezon: s.sezon, zwyciezca: zwyc.nazwa, przegrany: przeg.nazwa, wynik };
  const udzial = mistrzId === s.mojKlub || ppId === s.mojKlub;
  wiadomosc(s, `🏆 Superpuchar Polski ${s.sezon}: ${A.nazwa} ${wynik} ${B.nazwa} — trofeum dla ${zwyc.nazwa} (sędzia: ${sedzia}).${udzial ? (zwyc.id === s.mojKlub ? " Zdobyliście Superpuchar Polski! 🎉" : " Zabrakło trofeum.") : ""}`);
  if (udzial && zwyc.id === s.mojKlub) s.zarzad = Math.min(100, s.zarzad + 2);
}

/** Kary finansowe PZPN (B1): kluby z utrzymującym się zadłużeniem dostają ujemne punkty na nowy sezon — jak w polskim futbolu.
 * Próg zależny od szczebla; po uregulowaniu finansów kara cofnięta. Odejmowana w tabelaLigi (nie schodzi poniżej 0 pkt). */
function karyFinansowe(s: StanGry) {
  for (const k of Object.values(s.kluby)) {
    const prog = (SPONSOR_SEZON[k.poziom - 1] ?? 200000) * 0.6;
    const poprz = k.karaPunktowa ?? 0;
    const kara = k.kasa < -prog * 2.2 ? 9 : k.kasa < -prog * 1.1 ? 6 : k.kasa < -prog * 0.45 ? 3 : 0;
    k.karaPunktowa = kara;
    if (k.id === s.mojKlub) {
      if (kara && kara !== poprz) wiadomosc(s, `⚖️ PZPN: za zadłużenie klubu nałożono ${kara} pkt ujemnych na nowy sezon. Ureguluj finanse, by uniknąć kolejnych sankcji.`);
      else if (!kara && poprz) wiadomosc(s, `✅ PZPN: finanse uregulowane — kara punktowa cofnięta.`);
    } else if (kara >= 6 && szansa(0.5)) {
      wiadomosc(s, `⚖️ PZPN: ${k.nazwa} ukarany ${kara} pkt ujemnymi za zadłużenie.`);
    }
  }
}

const RANGA_KONTRAKTU: Record<string, number> = { amator: 0, polprofesjonalny: 1, zawodowy: 2 };
/** Po awansie klubu kontrakty zawodników „dorastają" do szczebla (PZPN): w III–IV lidze półprofesjonalne,
 *  od II ligi zawodowe. Pensja rośnie do poziomu ligi, a krótka umowa jest przedłużana o sezon.
 *  Spadek NIE obniża umów (kontrakty zawodowe obowiązują dalej). */
export function aktualizujTypyKontraktow(s: StanGry) {
  let ileMoich = 0, wzrostPensji = 0;
  for (const k of Object.values(s.kluby)) {
    const docelowy = kontraktTyp(k.poziom);
    for (const id of k.zawodnicy) {
      const z = s.zawodnicy[id];
      if (!z || z.macierzysty) continue;
      if (RANGA_KONTRAKTU[z.kontraktTyp] >= RANGA_KONTRAKTU[docelowy]) continue;
      const stara = z.pensja;
      z.kontraktTyp = docelowy;
      z.pensja = Math.max(z.pensja, Math.round(pensjaDla(z.umiej, k.poziom) * 0.85));
      if (z.kontraktDo < s.sezon + 1) z.kontraktDo = s.sezon + 1;
      if (k.id === s.mojKlub) { ileMoich++; wzrostPensji += z.pensja - stara; }
    }
  }
  if (ileMoich) wiadomosc(s, `📝 Awans = nowe realia: ${ileMoich} zawodników przeszło na kontrakt: ${NAZWA_KONTRAKTU[kontraktTyp(s.kluby[s.mojKlub].poziom)]} (zgodnie z przepisami PZPN dla szczebla). Pensje wzrosły łącznie o ${zl(wzrostPensji)}/kolejkę — zawodnicy mają teraz kwotę transferową i można ich sprzedawać za pieniądze.`);
}

/** Czy liga to klasa okręgowa / A / B / C (liczba drużyn zmienia się co sezon; IV liga i wyżej — stała, regulaminowa). */
function klasaZmienna(nazwa: string): boolean { return /klasa (a|b|c)\b/i.test(nazwa) && !/okręgow/i.test(nazwa); }
/** Rozwój treningowy zawodnika za część tygodnia (`frac`: 1 = cały tydzień, 1/3 = jeden dzień treningowy). */
export function rozwojTreningowy(s: StanGry, z: Zawodnik, frac: number,
  c: { moj: boolean; wSkladzie: boolean; graWRezerwach: boolean; freq: number; aMoj: number; maWeterana: boolean }, msg: (t: string) => void) {
  let bazaDelta = 0;
  if (z.umiej < z.potencjal) {
    let mn = (z.wiek <= 20 ? 0.18 : z.wiek <= 24 ? 0.1 : 0.04) * (c.graWRezerwach ? 1.4 : 1) * treningMn(c.freq);
    if (c.moj) {
      mn *= mnoznikFokus(s, z); // fokus (ogólny/gra/umiejętność/młodzież) + intensywność
      if (z.wiek <= 21) mn *= 1.3 + c.aMoj * 0.5; // akademia przyspiesza juniorów
      if (z.wiek <= 21 && c.wSkladzie) mn *= 1.25; // minuty w pierwszym składzie = szybszy rozwój młodzieżowca
      if (z.wiek <= 21 && c.maWeterana) mn *= 1.12; // mentoring: weteran w kadrze przyspiesza młodych
      mn *= modRozwoj(s); if (z.poz === "BR") mn *= 1 + modRozwojBR(s); // asystent/trener bramkarzy
    }
    bazaDelta = mn * los(0.5, 1.5) * frac;
    rozwinAtrybuty(z, bazaDelta);
  }
  // Trening ukierunkowany w atrybuty + indywidualny + nauka pozycji (tylko Twoja kadra).
  if (c.moj) {
    for (const m of treningGracza(s, z, bazaDelta, frac)) msg(m);
    if (szansa(kontuzjaTreningowa(s, z) * frac)) {
      z.kontuzja = losInt(1, 2);
      msg(`🤕 ${z.imie} ${z.nazwisko} nabawił się drobnego urazu na treningu — pauza ${z.kontuzja} ${z.kontuzja === 1 ? "kolejka" : "kolejki"}.`);
    }
  }
}
/** Kontekst treningu Twojej kadry (do treningu dziennego w kalendarzu). */
export function kontekstTreningu(s: StanGry, z: Zawodnik) {
  const mk = s.kluby[s.mojKlub];
  const wSkladzie = s.taktyka.sklad.includes(z.id);
  return { moj: true, wSkladzie, graWRezerwach: !wSkladzie && !!mk.rezerwaId && z.zawieszenie === 0 && z.kontuzja === 0, freq: treningiMoje(s),
    aMoj: poziomAkademii(mk) / 5, maWeterana: mk.zawodnicy.some((id) => s.zawodnicy[id]?.cechy?.includes("weteran")) };
}
/** Mistrzowie grup-rodzeństwa (spoza symulowanej piramidy) awansujący do ligi poziomu i (np. mistrz IV ligi innego województwa).
 *  Klub z danych wraca do gry (albo zostaje utworzony) z kadrą na poziomie ligi. */
function awanseZRodzenstwa(s: StanGry, i: number, n: number): string[] {
  const nazwaG = s.ligi[i].nazwa, nazwaD = s.ligi[i + 1].nazwa;
  const out: string[] = [];
  const wGrze = new Set(s.ligi.flatMap((l) => l.kluby).map((id) => s.kluby[id]?.nazwa));
  for (const grupa of rodzenstwo(nazwaG, nazwaD)) {
    const dane = klubyLigiZDanych(grupa).filter((d) => !wGrze.has(d.nazwa) && !/\s(II|III|IV)(\s|$)/.test(d.nazwa));
    for (const d of tasuj(dane).slice(0, Math.max(1, Math.min(n, 1)))) {
      const id = wprowadzKlub(s, d, i + 2);
      out.push(id); wGrze.add(d.nazwa);
    }
  }
  return out;
}
/** Wprowadza do piramidy klub z danych (reaktywuje go, jeśli wcześniej z niej wypadł). Kadra generowana na poziomie `poziom`. */
function wprowadzKlub(s: StanGry, d: { nazwa: string; skrot: string; miasto: string; herb?: string; stadion?: string; adres?: string }, poziom: number): string {
  const stary = Object.values(s.kluby).find((k) => k.nazwa === d.nazwa && k.pozaPiramida);
  if (stary) {
    stary.pozaPiramida = false; stary.poziom = poziom;
    if (stary.zawodnicy.length < 15) { for (const poz of KADRA) { const z = nowyZawodnik(s, poziom, poz); z.klubId = stary.id; stary.zawodnicy.push(z.id); } nadajNumery(s, stary); }
    return stary.id;
  }
  const wzor = Object.values(s.kluby).find((k) => k.poziom === poziom && !k.pozaLiga) ?? s.kluby[s.mojKlub];
  const id = noweId(s, "k");
  const k: Klub = { ...wzor, id, nazwa: d.nazwa, skrot: d.skrot, miasto: d.miasto, herb: d.herb, poziom, zawodnicy: [], prawdziwy: true,
    rezerwaId: undefined, rezerwaDla: undefined, pozaLiga: false, pozaPiramida: false, renoma: Math.max(0.1, wzor.renoma * 0.9),
    stadion: d.stadion ?? `Stadion w ${d.miasto}`, adres: d.adres, obiekty: { gastronomia: 0, parking: 0, sklep: 0 }, juniorzy: [], historia: undefined } as Klub;
  s.kluby[id] = k;
  for (const poz of KADRA) { const z = nowyZawodnik(s, poziom, poz); z.klubId = id; k.zawodnicy.push(z.id); }
  nadajNumery(s, k);
  return id;
}
const ZALOZENIA = ["AP", "UKS", "LKS", "KS", "GKS", "FC", "Akademia Piłkarska", "Orlik", "Sparta", "Victoria", "Zryw", "Start", "Iskra", "Błękitni", "Olimpia", "Polonia"];
/** Zakłada nowy klub w najniższej lidze (miejscowość z okręgu, w której nie ma jeszcze klubu o tej nazwie). */
function zalozNowyKlub(s: StanGry, ost: number): string | null {
  const miasta = [...new Set(s.ligi.slice(Math.max(0, ost - 2)).flatMap((l) => l.kluby).map((id) => s.kluby[id]?.miasto).filter(Boolean))] as string[];
  if (!miasta.length) return null;
  for (let p = 0; p < 10; p++) {
    const miasto = wybierz(miasta);
    const rdzen = wybierz(ZALOZENIA);
    const nazwa = rdzen === "Orlik" ? `UKS Orlik ${miasto}` : `${rdzen} ${miasto}`;
    if (Object.values(s.kluby).some((k) => k.nazwa === nazwa)) continue;
    const id = wprowadzKlub(s, { nazwa, skrot: nazwa.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase(), miasto, stadion: `Boisko w ${miasto}` }, ost + 1);
    const k = s.kluby[id];
    k.prawdziwy = false; k.zalozony = s.sezon + 1; k.renoma = 0.05; k.kasa = Math.round(k.kasa * 0.5); k.pojemnosc = 100;
    wiadomosc(s, `🆕 Nowy klub: ${nazwa} (założony ${s.sezon + 1}) — zgłoszony do rozgrywek ${s.ligi[ost].nazwa}, zaczyna od najniższej klasy.`);
    return id;
  }
  return null;
}
/** Klub opuszcza symulowaną piramidę (gra dalej w lidze swojego regionu, której gra nie rozgrywa). Zostaje w świecie (zawodnicy, historia). */
function opuscPiramide(s: StanGry, id: string) {
  const k = s.kluby[id];
  if (!k || id === s.mojKlub) return;
  k.pozaPiramida = true;
  s.oferty = s.oferty.filter((o) => o.klubId !== id);
  // Kadra klubu poza symulacją nie jest potrzebna (zapis nie puchnie) — przy powrocie klub dostaje nową kadrę.
  const ids = new Set(k.zawodnicy);
  for (const zid of k.zawodnicy) delete s.zawodnicy[zid];
  k.zawodnicy = [];
  s.wolni = s.wolni.filter((x) => !ids.has(x));
}
/** Nowe zgłoszenia do najniższej ligi: kluby z grup tej samej klasy w regionie (z danych), których nie ma w grze. */
function uzupelnijLige(s: StanGry, ost: number, ile: number): string[] {
  const nazwa = s.ligi[ost].nazwa;
  const wGrze = new Set(s.ligi.flatMap((l) => l.kluby).map((id) => s.kluby[id]?.nazwa));
  const kandydaci = [...klubyLigiZDanych(nazwa), ...(s.ligi[ost - 1] ? rodzenstwo(s.ligi[ost - 1].nazwa, nazwa).flatMap((g) => klubyLigiZDanych(g)) : [])]
    .filter((d) => !wGrze.has(d.nazwa) && trafiaDo(d, s.ligi[ost - 1]?.nazwa ?? nazwa, nazwa));
  const out: string[] = [];
  for (const d of tasuj(kandydaci).slice(0, ile)) out.push(wprowadzKlub(s, d, ost + 1));
  while (out.length < ile) {
    const miasto = s.kluby[s.ligi[ost].kluby[out.length % s.ligi[ost].kluby.length]]?.miasto ?? "Gmina";
    out.push(wprowadzKlub(s, { nazwa: `${wybierz(RDZEN_AMATOR)} ${miasto}`, skrot: "NOW", miasto }, ost + 1));
  }
  return out;
}

export function nowySezon(s: StanGry) {
  // dogranie pozostałych kolejek w dłuższych ligach
  const max = Math.max(...s.ligi.map((l) => l.terminarz.length));
  while (s.kolejka < max) {
    const r = s.kolejka;
    for (const liga of s.ligi) {
      if (r >= liga.terminarz.length) continue;
      liga.wyniki[r] = liga.terminarz[r].map(([dom, gosc]) =>
        zagrajMecz(
          s,
          { klubId: dom, sklad: autoSklad(s, dom, formacjaAI(dom)), formacja: formacjaAI(dom), nastawienie: "zrownowazone" },
          { klubId: gosc, sklad: autoSklad(s, gosc, formacjaAI(gosc)), formacja: formacjaAI(gosc), nastawienie: "zrownowazone" },
          false,
        ),
      );
    }
    s.kolejka++;
  }

  const tabele = s.ligi.map((l) => tabelaLigi(s, l).map((w) => w.klubId));
  const mojPoziom = s.kluby[s.mojKlub].poziom;
  const mojeMiejsce = tabele[mojPoziom - 1].indexOf(s.mojKlub) + 1;
  superpucharPolski(s, tabele[0] ?? []); // Superpuchar Polski: mistrz vs zdobywca Pucharu Polski (przed nowym sezonem)
  // Kwalifikacja do europejskich pucharów (wg miejsca w Ekstraklasie + zdobycia Pucharu Polski).
  const kwalEuropa = kwalifikacjaEuropejska(mojPoziom, mojeMiejsce, s.puchar?.zdobywcaGlowny === s.mojKlub);
  // B4: renoma/prestiż ewoluuje z wynikami sezonu — mistrzowie łagodnie rosną, ogon tabeli opada (kumuluje się przez lata;
  // osobno od skokowego +0,1/−0,1 za awans/spadek). Dzięki temu klub przez lata ponadprzeciętny realnie zyskuje na prestiżu.
  for (let i = 0; i < s.ligi.length; i++) {
    const t = tabele[i];
    for (let r = 0; r < t.length; r++) {
      const k = s.kluby[t[r]];
      if (!k) continue;
      const perf = t.length > 1 ? (0.5 - r / (t.length - 1)) * 2 : 0; // +1 mistrz … −1 ostatni
      k.renoma = Math.max(0.02, Math.min(1, k.renoma + perf * 0.012));
    }
  }
  const nowe: string[][] = tabele.map((t) => [...t]);
  // ——— Awanse i spadki z zachowaniem REGIONÓW (PZPN/ZPN) ———
  // Spadkowicz trafia tylko do ligi swojego województwa / podokręgu. Kto spada „do innego regionu", opuszcza
  // symulowaną piramidę (gra dalej w swojej lidze, poza Twoją ścieżką). Liczba spadających z ligi zależy od tego,
  // ilu klubów z jej regionu spadło z góry (jak „spadek zależny" w regulaminach ZPN), więc rozmiary lig się nie zmieniają.
  const zGory: string[][] = s.ligi.map(() => []);   // przybyli z wyższej ligi (zgodni regionalnie)
  const wGore: string[][] = s.ligi.map(() => []);   // awansowali z danej ligi wyżej
  const wychodza: string[] = [];                    // opuszczają symulowaną piramidę
  for (let i = 0; i < s.ligi.length - 1; i++) {
    const n = s.wymiana[i];
    const gorna = tabele[i];      // wyższa liga (spadki)
    const dolna = tabele[i + 1];  // niższa liga (awanse)
    // PZPN: zespół rezerw nie może awansować do ligi pierwszego zespołu (ani wyżej) — pomijamy go, slot bierze kolejny klub.
    const dolnaE = dolna.filter((id) => { const k = s.kluby[id]; return !(k.rezerwaDla && (i + 1) <= (s.kluby[k.rezerwaDla]?.poziom ?? 99)); });
    let { b, rb } = regulyBarazy(i + 1, n);
    if (dolnaE.length < n + b) b = 0;  // za mało drużyn na baraż awansowy
    if (gorna.length < n + rb) rb = 0; // za mało na baraż o utrzymanie
    // Awans: (n-b) bezpośrednio z czoła + b wyłonionych w barażu spośród kolejnych drużyn.
    const directUp = n - b;
    const strefaAwans = b > 0 ? dolnaE.slice(directUp, directUp + 4 * b) : [];
    const awansBaraz = b > 0 ? baraz(s, strefaAwans, b, "awans") : [];
    let awansuja = [...dolnaE.slice(0, directUp), ...awansBaraz];
    // Wycofania z rozgrywek (problemy finansowe) — amatorskie szczeble (V liga i niżej). W ligach o stałej liczbie drużyn
    // (do V ligi i klas okręgowych) lukę wypełnia KOLEJNA drużyna z tabeli niższej ligi tego okręgu (dodatkowy awans);
    // w klasach A/B/C grupa po prostu się zmniejsza.
    const wycofani = i + 1 >= 6 ? gorna.filter((id) => id !== s.mojKlub && !s.kluby[id]?.rezerwaDla && !wGore[i].includes(id) && szansa(0.008 + (1 - (s.kluby[id]?.renoma ?? 0.5)) * 0.012)).slice(0, 1) : [];
    for (const id of wycofani) {
      const k = s.kluby[id];
      nowe[i] = nowe[i].filter((x) => x !== id);
      wychodza.push(id);
      k.wycofany = { sezon: s.sezon, powrot: s.sezon + 1 + (szansa(0.3) ? 1 : szansa(0.5) ? 2 : szansa(0.6) ? 3 : 4) }; // reaktywacja po 1–4 sezonach (gdy spłacą długi)
      if (!klasaZmienna(s.ligi[i].nazwa)) {
        const kolejny = dolnaE.find((x) => !awansuja.includes(x));
        if (kolejny) {
          awansuja = [...awansuja, kolejny];
          wiadomosc(s, `📉 ${k.nazwa} wycofał się z ${s.ligi[i].nazwa} (problemy finansowe). Na jego miejsce awansuje kolejna drużyna z ${s.ligi[i + 1].nazwa}: ${s.kluby[kolejny].nazwa} (${dolna.indexOf(kolejny) + 1}. miejsce).`);
        }
      } else wiadomosc(s, `📉 ${k.nazwa} wycofał się z rozgrywek ${s.ligi[i].nazwa} (problemy finansowe) — grupa w nowym sezonie będzie mniejsza.`);
    }
    const ileWycofanych = wycofani.length;
    wGore[i + 1] = awansuja;
    // Awanse z grup-rodzeństwa (spoza Twojej piramidy, np. mistrz IV ligi innego województwa grupy III ligi).
    const wirtualni = awanseZRodzenstwa(s, i, n);
    // Ilu musi spaść, by liga zachowała rozmiar: przybywają awansujący + zgodni regionalnie z góry, ubywają awansujący wyżej.
    let ileSpada = Math.max(0, Math.min(gorna.length - 2, awansuja.length + wirtualni.length + zGory[i].length - wGore[i].length - (klasaZmienna(s.ligi[i].nazwa) ? 0 : ileWycofanych)));
    // Klasy okręgowe/A/B/C: liczebność grup realnie waha się co sezon (wycofania, nowe zgłoszenia, spadki zależne) — ±1.
    if (klasaZmienna(s.ligi[i].nazwa)) {
      const d = szansa(0.3) ? (szansa(0.5) ? 1 : -1) : 0;
      const poRoz = gorna.length - (ileSpada + d) + awansuja.length + wirtualni.length + zGory[i].length - wGore[i].length;
      if (poRoz >= 10 && poRoz <= 18 && ileSpada + d >= 0) ileSpada += d;
    }
    const rbE = Math.min(rb, Math.max(0, ileSpada - 0));
    const directDown = Math.max(0, ileSpada - rbE);
    const kandydaci = gorna.filter((id) => !wGore[i].includes(id) && !wycofani.includes(id));
    const strefaUtrzym = rbE > 0 ? kandydaci.slice(kandydaci.length - directDown - 2 * rbE, kandydaci.length - directDown) : [];
    const utrzymani = rbE > 0 ? baraz(s, strefaUtrzym, rbE, "utrzymanie") : [];
    const spadekBaraz = strefaUtrzym.filter((id) => !utrzymani.includes(id));
    const spadaja = [...kandydaci.slice(kandydaci.length - directDown), ...spadekBaraz];
    if (s.mojKlub && awansBaraz.includes(s.mojKlub)) wiadomosc(s, "🎉 Awans przez baraże!");
    if (s.mojKlub && spadekBaraz.includes(s.mojKlub)) wiadomosc(s, "💔 Spadek po przegranym barażu o utrzymanie.");
    // Podział spadkowiczów: do Twojej ligi niżej tylko ci z tego regionu; reszta — do swoich lig (poza symulacją).
    const nazwaG = s.ligi[i].nazwa, nazwaD = s.ligi[i + 1].nazwa;
    const doDolnej: string[] = [];
    for (const id of spadaja) {
      if (id === s.mojKlub || trafiaDo(s.kluby[id], nazwaG, nazwaD)) doDolnej.push(id);
      else wychodza.push(id);
    }
    zGory[i + 1] = doDolnej;
    nowe[i] = nowe[i].filter((id) => !spadaja.includes(id)).concat(awansuja, wirtualni);
    nowe[i + 1] = nowe[i + 1].filter((id) => !awansuja.includes(id)).concat(doDolnej);
    for (const id of [...awansuja, ...wirtualni]) {
      const k = s.kluby[id];
      k.poziom = i + 1;
      k.renoma = Math.min(1, k.renoma + 0.1);
      k.kasa += PREMIA_AWANS[i];
      if (id === s.mojKlub) wiadomosc(s, `Premia za awans: ${zl(PREMIA_AWANS[i])}.`);
    }
    for (const id of spadaja) {
      s.kluby[id].poziom = i + 2;
      // Historyczny prestiż jest podłogą — wielkie marki po spadku nie tracą całej renomy (kibice/marka trwają).
      s.kluby[id].renoma = Math.max(0.1, prestizKlubu(s.kluby[id].nazwa), s.kluby[id].renoma - 0.1);
    }
    const obcy = spadaja.filter((id) => !doDolnej.includes(id));
    if (obcy.length && s.kluby[s.mojKlub].poziom >= i + 1 && s.kluby[s.mojKlub].poziom <= i + 2)
      wiadomosc(s, `🗺 Spadek z ${nazwaG}: ${obcy.map((id) => s.kluby[id].nazwa).join(", ")} — trafiają do lig swoich województw/podokręgów (nie do ${nazwaD}).`);
  }
  // Najniższa liga: po awansach uzupełniamy ją nowymi zgłoszeniami z regionu (nowe kluby / spadkowicze z klasy C),
  // a nadmiar (gdy z góry przybyło więcej) — spada do klasy C (poza symulacją).
  {
    const ost = s.ligi.length - 1;
    const typowaOst = s.rozmiaryStart?.[ost] ?? tabele[ost].length;
    let docel = tabele[ost].length;
    if (klasaZmienna(s.ligi[ost].nazwa) && szansa(0.4)) docel += szansa(0.5) ? 1 : -1; // nowe zgłoszenia / wycofania
    docel = Math.max(Math.max(8, typowaOst - 2), Math.min(Math.min(16, typowaOst + 2), docel));
    let lista = nowe[ost].filter((id) => !wGore[ost].includes(id));
    while (lista.length > docel) { const id = lista[lista.length - 1]; if (id === s.mojKlub) break; lista = lista.slice(0, -1); wychodza.push(id); }
    if (lista.length < docel) lista = lista.concat(uzupelnijLige(s, ost, docel - lista.length));
    nowe[ost] = lista;
  }
  // Klasy A/B/C: liczebność waha się, ale wokół typowej (z początku kariery) — gdy grupa za bardzo się skurczy,
  // uzupełniają ją nowe zgłoszenia klubów z tego okręgu (z danych), gdy za bardzo urośnie — nadmiar spada niżej.
  if (!s.rozmiaryStart) s.rozmiaryStart = tabele.map((t) => t.length);
  for (let i = 0; i < s.ligi.length - 1; i++) {
    if (!klasaZmienna(s.ligi[i].nazwa)) continue;
    const typowa = s.rozmiaryStart[i] ?? tabele[i].length;
    if (nowe[i].length < typowa - 1) nowe[i] = nowe[i].concat(uzupelnijLige(s, i, typowa - 1 - nowe[i].length + (szansa(0.5) ? 1 : 0)));
  }
  // Nowo założone kluby: każdy nowy klub w Polsce zaczyna od najniższej klasy (B, a gdzie jest — C). Co sezon w grupie
  // zgłasza się 0–2 świeżo założone drużyny z miejscowości tego okręgu (orlikowe ekipy, akademie, kluby wiejskie).
  // Działa w każdym województwie (także dodanym w przyszłości) — tylko na najniższym szczeblu.
  {
    const ost = s.ligi.length - 1;
    if (/klasa (b|c)\b/i.test(s.ligi[ost].nazwa)) {
      const typowa = s.rozmiaryStart?.[ost] ?? tabele[ost].length;
      // Reaktywacje: kluby wycofane z rozgrywek wracają pod tą samą nazwą (herb, barwy, stadion, historia) — od najniższej klasy.
      const doReaktywacji = Object.values(s.kluby).filter((k) => k.pozaPiramida && k.wycofany && k.wycofany.powrot <= s.sezon + 1 && trafiaDo(k, s.ligi[ost - 1]?.nazwa ?? s.ligi[ost].nazwa, s.ligi[ost].nazwa));
      for (const k of doReaktywacji.slice(0, 2)) {
        if (nowe[ost].length >= typowa + 3) break;
        const przerwa = s.sezon + 1 - k.wycofany!.sezon;
        k.wycofany = undefined;
        const id = wprowadzKlub(s, { nazwa: k.nazwa, skrot: k.skrot, miasto: k.miasto, herb: k.herb }, ost + 1);
        nowe[ost].push(id);
        wiadomosc(s, `🔁 Reaktywacja! ${k.nazwa} wraca do gry po ${przerwa} ${przerwa === 1 ? "sezonie" : "sezonach"} przerwy — długi spłacone, klub startuje w rozgrywkach: ${s.ligi[ost].nazwa}.`);
      }
      let ile = (szansa(0.45) ? 1 : 0) + (szansa(0.15) ? 1 : 0);
      ile = Math.min(ile, Math.max(0, typowa + 2 - nowe[ost].length));
      for (let j = 0; j < ile; j++) {
        const id = zalozNowyKlub(s, ost);
        if (id) nowe[ost].push(id);
      }
    }
  }
  // PZPN IX/140 §2 ust.6–8: dwa zespoły klubu nie mogą grać w tej samej klasie — gdy I zespół spadnie do klasy rezerw
  // (albo rezerwy by do niej awansowały), zespół rezerw jest automatycznie przesuwany klasę niżej.
  for (let i = 0; i < s.ligi.length - 1; i++) {
    for (const id of [...nowe[i]]) {
      const k = s.kluby[id];
      if (!k?.rezerwaDla) continue;
      const pierwszy = s.kluby[k.rezerwaDla];
      if (pierwszy && nowe[i].includes(pierwszy.id) && id !== s.mojKlub) {
        nowe[i] = nowe[i].filter((x) => x !== id);
        nowe[i + 1] = [...nowe[i + 1], id];
        k.poziom = i + 2;
        wiadomosc(s, `⚖ ${k.nazwa} przesunięty do ${s.ligi[i + 1].nazwa} — przepis PZPN: dwa zespoły klubu nie mogą grać w jednej klasie.`);
      }
    }
  }
  for (const id of wychodza) opuscPiramide(s, id);
  aktualizujTypyKontraktow(s); // awans: amatorzy → półprofesjonaliści → zawodowcy (wg szczebla, PZPN)
  const nowyPoziom = s.kluby[s.mojKlub].poziom;
  const stara = s.ligi[mojPoziom - 1].nazwa;
  const wynik = mojPoziom === 1 && mojeMiejsce === 1 ? "mistrz" : nowyPoziom < mojPoziom ? "awans" : nowyPoziom > mojPoziom ? "spadek" : "utrzymanie";
  if (nowyPoziom < mojPoziom) sprawdzLicencje(s); // awans → wymogi licencyjne na wyższy szczebel
  const mojaNazwa = s.kluby[s.mojKlub].nazwa;
  const pucharWynik = s.puchar?.zdobywcaGlowny === s.mojKlub || s.puchar?.zdobywcaGlowny === mojaNazwa ? "glowny" : s.puchar?.zdobywcaRegion === s.mojKlub || s.puchar?.zdobywcaRegion === mojaNazwa ? "region" : undefined;
  const moiLaury: string[] = [];
  const wpisHist: Historia = { sezon: s.sezon, liga: stara, miejsce: mojeMiejsce, wynik, puchar: pucharWynik, wyroznienia: moiLaury };
  s.historia.push(wpisHist);
  { const tw = trenerOtwarty(s); if (tw) { if (mojeMiejsce === 1) tw.tytuly++; if (nowyPoziom < mojPoziom) tw.awanse++; if (nowyPoziom > mojPoziom) tw.spadki++; } }
  // Dotacja samorządu po awansie: miasto/gmina świętuje sukces jednorazowym zastrzykiem do budżetu (realne w PL).
  if (wynik === "awans" || wynik === "mistrz") {
    const dot = Math.round((NAGRODA_LIGA[Math.max(0, nowyPoziom - 1)] * (nowyPoziom >= 6 ? 0.5 : nowyPoziom >= 4 ? 0.35 : 0.2)) / 1000) * 1000;
    if (dot > 0) {
      s.kluby[s.mojKlub].kasa += dot;
      wiadomosc(s, `🏛 Samorząd świętuje ${wynik === "mistrz" ? "mistrzostwo" : "awans"} — dotacja celowa ${zl(dot)} z budżetu ${nowyPoziom >= 6 ? "gminy" : "miasta"} na przyszły sezon.`);
    }
  }

  // ——— Oferty pracy dla TRENERA: dobre wyniki ściągają zainteresowanie większych klubów ———
  s.ofertyTrenera = [];
  if (!s.zwolniony) {
    const liczbaD = tabele[mojPoziom - 1].length;
    const dobrze = wynik === "mistrz" || wynik === "awans" || !!pucharWynik
      || mojeMiejsce <= Math.max(2, Math.ceil(liczbaD * 0.25)) || s.zarzad >= 75;
    if (dobrze) {
      const dorobek = (s.trenerKariera ?? []).reduce((a, w) => a + w.tytuly + w.awanse, 0);
      const mojaRen = s.kluby[s.mojKlub].renoma;
      // kandydaci: wyższa liga (niższy poziom) albo ta sama liga, ale wyraźnie większy klub
      const kand = Object.values(s.kluby)
        .filter((k) => k.id !== s.mojKlub && !k.rezerwaDla && !k.pozaLiga && !k.pozaPiramida && (k.poziom < nowyPoziom || (k.poziom === nowyPoziom && k.renoma > mojaRen + 0.08)))
        .sort((a, b) => a.poziom - b.poziom || b.renoma - a.renoma);
      const ile = (wynik === "mistrz" || pucharWynik) ? 2 : 1;
      for (const k of kand.slice(0, ile)) {
        const pensja = wartoscKontraktuTrenera(k.poziom, k.renoma);
        s.ofertyTrenera.push({ klubId: k.id, sezon: s.sezon + 1, pensja });
        wiadomosc(s, `📨 ${k.nazwa} (${s.ligi[k.poziom - 1].nazwa}) chce Cię jako trenera — oferta ${zl(pensja)}/sezon. Sprawdź „Oferty pracy".`);
      }
    }
  }

  // Nagroda finansowa za miejsce w lidze (im wyżej, tym więcej).
  const ligaMoja = s.ligi[mojPoziom - 1];
  const liczbaD = tabele[mojPoziom - 1].length;
  const nagroda = Math.round((NAGRODA_LIGA[mojPoziom - 1] * (liczbaD - mojeMiejsce + 1)) / liczbaD / 100) * 100;
  s.kluby[s.mojKlub].kasa += nagroda;
  wiadomosc(s, `Nagroda za ${mojeMiejsce}. miejsce w ${stara}: ${zl(nagroda)}.`);
  // Realizacja celu zarządu = premia finansowa i zaufanie.
  {
    const n = liczbaD;
    const awans = nowyPoziom < mojPoziom, spadek = nowyPoziom > mojPoziom;
    let stan: "przekroczony" | "spelniony" | "niespelniony";
    if (s.cel === "Awans") stan = mojeMiejsce === 1 ? "przekroczony" : awans ? "spelniony" : "niespelniony";
    else if (s.cel === "Górna połowa tabeli") stan = mojeMiejsce <= 3 ? "przekroczony" : mojeMiejsce <= Math.ceil(n / 2) ? "spelniony" : "niespelniony";
    else stan = spadek ? "niespelniony" : mojeMiejsce <= Math.ceil(n / 2) ? "przekroczony" : "spelniony"; // Utrzymanie
    const premia = Math.round((NAGRODA_LIGA[mojPoziom - 1] * (stan === "przekroczony" ? 0.6 : stan === "spelniony" ? 0.35 : 0)) / 100) * 100;
    if (premia > 0) { s.kluby[s.mojKlub].kasa += premia; s.zarzad = Math.min(100, s.zarzad + (stan === "przekroczony" ? 10 : 5)); }
    wiadomosc(s, stan === "niespelniony"
      ? `Zarząd rozczarowany — cel „${s.cel}" niezrealizowany (${mojeMiejsce}. miejsce).`
      : `✅ Cel zarządu „${s.cel}" ${stan === "przekroczony" ? "PRZEKROCZONY" : "zrealizowany"}! Premia ${zl(premia)}.`);
  }
  // Wieloletni cel zarządu — ocena po sezonie (zanim s.sezon wzrośnie). Wpływa tylko na kasę/zaufanie/komunikaty.
  if (s.celDlugo) {
    const cd = s.celDlugo;
    const teraz = s.kluby[s.mojKlub].poziom;
    const osiag = cd.typ === "awans" ? teraz < cd.startPoziom
      : cd.typ === "gornapolowa" ? mojeMiejsce <= Math.ceil(liczbaD / 2)
      : teraz <= cd.startPoziom; // stabilizacja: brak spadku poniżej poziomu startowego
    if (cd.typ === "awans" && osiag) {
      s.zarzad = Math.min(100, s.zarzad + 15);
      s.kluby[s.mojKlub].kasa += Math.round((NAGRODA_LIGA[Math.max(0, teraz - 1)] * 0.4) / 100) * 100;
      wiadomosc(s, `🎯 Długofalowy cel zarządu ZREALIZOWANY: ${cd.opis}! Zarząd pełen uznania, stawia nowy cel.`);
      ustawCelDlugo(s, s.mojKlub);
    } else if (s.sezon >= cd.doSezonu) {
      if (osiag) { s.zarzad = Math.min(100, s.zarzad + 12); wiadomosc(s, `🎯 Długofalowy cel osiągnięty w terminie: ${cd.opis}. Zarząd wyznacza kolejny.`); ustawCelDlugo(s, s.mojKlub); }
      else { s.zarzad = Math.max(0, s.zarzad - 15); wiadomosc(s, `⌛ Długofalowy cel „${cd.opis}" nieosiągnięty w terminie — zarząd traci cierpliwość (daje jeszcze 2 sezony).`); s.celDlugo = { ...cd, doSezonu: s.sezon + 2 }; }
    } else {
      wiadomosc(s, `🎯 Długofalowy cel zarządu: ${cd.opis} — zostało ${cd.doSezonu - s.sezon} sezon(y).`);
    }
  }
  // Nagrody indywidualne (z zakończonego sezonu, przed resetem statystyk).
  const zawLigi = ligaMoja.kluby.flatMap((kid) => s.kluby[kid].zawodnicy.map((id) => s.zawodnicy[id]));
  const krol = [...zawLigi].sort((a, b) => b.gole - a.gole)[0];
  if (krol && krol.gole > 0) {
    wiadomosc(s, `🏅 Król strzelców ${stara}: ${krol.imie} ${krol.nazwisko} (${krol.gole} goli).`);
    if (krol.klubId === s.mojKlub) { krol.morale = Math.min(100, krol.morale + 8); s.zarzad = Math.min(100, s.zarzad + 3); moiLaury.push(`🏅 Król strzelców (${krol.gole} g.): ${krol.imie} ${krol.nazwisko}`); }
  }
  const krolAsyst = [...zawLigi].sort((a, b) => b.asysty - a.asysty)[0];
  if (krolAsyst && krolAsyst.asysty > 0) {
    wiadomosc(s, `🅰 Król asyst ${stara}: ${krolAsyst.imie} ${krolAsyst.nazwisko} (${krolAsyst.asysty} asyst).`);
    if (krolAsyst.klubId === s.mojKlub) { krolAsyst.morale = Math.min(100, krolAsyst.morale + 6); moiLaury.push(`🅰 Król asyst (${krolAsyst.asysty}): ${krolAsyst.imie} ${krolAsyst.nazwisko}`); }
  }
  const ocena = (z: Zawodnik) => z.umiej + z.gole * 0.8 + z.asysty * 0.6 + z.czysteKonta * 0.7 + Math.min(z.mecze, 20) * 0.2;
  const ranking = [...zawLigi].sort((a, b) => ocena(b) - ocena(a));
  const najlepszy = ranking[0];
  if (najlepszy) {
    // Plebiscyt na Piłkarza Roku: podium z 3 najlepszych.
    const podium = ranking.slice(0, 3).map((z, i) => `${i + 1}. ${z.imie} ${z.nazwisko} (${s.kluby[z.klubId!]?.nazwa ?? "?"})`);
    wiadomosc(s, `🏆 Piłkarz Roku ${stara}: ${najlepszy.imie} ${najlepszy.nazwisko} (${s.kluby[najlepszy.klubId!].nazwa}). Podium plebiscytu: ${podium.join(" · ")}.`);
    if (najlepszy.klubId === s.mojKlub) { najlepszy.morale = Math.min(100, najlepszy.morale + 6); moiLaury.push(`🏆 Piłkarz Roku ligi: ${najlepszy.imie} ${najlepszy.nazwisko}`); }
  }
  // Najlepszy bramkarz — najwięcej czystych kont.
  const bramkarz = [...zawLigi].filter((z) => z.poz === "BR").sort((a, b) => b.czysteKonta - a.czysteKonta || ocena(b) - ocena(a))[0];
  if (bramkarz && bramkarz.czysteKonta > 0) {
    wiadomosc(s, `🧤 Najlepszy bramkarz ${stara}: ${bramkarz.imie} ${bramkarz.nazwisko} (${bramkarz.czysteKonta} czystych kont).`);
    if (bramkarz.klubId === s.mojKlub) { bramkarz.morale = Math.min(100, bramkarz.morale + 6); moiLaury.push(`🧤 Najlepszy bramkarz (${bramkarz.czysteKonta} cz.k.): ${bramkarz.imie} ${bramkarz.nazwisko}`); }
  }
  // Piłkarz Roku województwa — plebiscyt regionalny z całej piramidy wojewódzkiej (IV liga → klasa B; I–III liga to szczebel centralny).
  {
    const woj = (s.sciezka || "").split(" — ")[0].trim() || "regionu";
    const regZaw = s.ligi.flatMap((l) => l.kluby)
      .filter((kid) => (s.kluby[kid]?.poziom ?? 0) >= 4)
      .flatMap((kid) => s.kluby[kid].zawodnicy.map((id) => s.zawodnicy[id])).filter(Boolean);
    const best = [...regZaw].sort((a, b) => ocena(b) - ocena(a))[0];
    if (best && (best.gole > 0 || best.asysty > 0 || best.mecze >= 10)) {
      wiadomosc(s, `🏅 Piłkarz Roku województwa (${woj}) ${stara}: ${best.imie} ${best.nazwisko} (${s.kluby[best.klubId!]?.nazwa ?? "?"}) — plebiscyt regionalnego ZPN.`);
      if (best.klubId === s.mojKlub) { best.morale = Math.min(100, best.morale + 8); s.zarzad = Math.min(100, s.zarzad + 3); moiLaury.push(`🏅 Piłkarz Roku województwa: ${best.imie} ${best.nazwisko}`); }
    }
    // Drużyna Sezonu województwa — najlepsza jedenastka (1-4-4-2) z całej piramidy wojewódzkiej (IV liga → klasa B).
    const regNa = (poz: Zawodnik["poz"], ile: number) => regZaw.filter((z) => z.poz === poz && z.mecze >= 8).sort((a, b) => ocena(b) - ocena(a)).slice(0, ile);
    const druzynaWoj = [...regNa("BR", 1), ...regNa("OBR", 4), ...regNa("POM", 4), ...regNa("NAP", 2)];
    if (druzynaWoj.length === 11) {
      wiadomosc(s, `🗺 Drużyna Sezonu województwa (${woj}) ${stara}: ${druzynaWoj.map((z) => z.nazwisko).join(", ")} — wybór regionalnego ZPN.`);
      const moiWoj = druzynaWoj.filter((z) => z.klubId === s.mojKlub);
      for (const z of moiWoj) z.morale = Math.min(100, z.morale + 6); // nobilitacja — pewność siebie na start nowego sezonu
      if (moiWoj.length) { s.zarzad = Math.min(100, s.zarzad + 2); moiLaury.push(`🗺 Drużyna Sezonu województwa: ${moiWoj.map((z) => z.nazwisko).join(", ")}`); }
    }
  }
  // Najlepszy obrońca — OBR z drużyny o najlepszej obronie, wysoka ocena.
  const tabMoja = tabelaLigi(s, ligaMoja);
  const bsKlubu: Record<string, number> = {};
  const maxBs = Math.max(1, ...tabMoja.map((w) => w.bs));
  tabMoja.forEach((w) => (bsKlubu[w.klubId] = w.bs));
  const obronca = [...zawLigi].filter((z) => z.poz === "OBR" && z.mecze > 0)
    .sort((a, b) => (ocena(b) + (maxBs - (bsKlubu[b.klubId!] ?? maxBs)) / maxBs * 12) - (ocena(a) + (maxBs - (bsKlubu[a.klubId!] ?? maxBs)) / maxBs * 12))[0];
  if (obronca) {
    wiadomosc(s, `🛡 Najlepszy obrońca ${stara}: ${obronca.imie} ${obronca.nazwisko} (${s.kluby[obronca.klubId!].nazwa}).`);
    if (obronca.klubId === s.mojKlub) { obronca.morale = Math.min(100, obronca.morale + 6); moiLaury.push(`🛡 Najlepszy obrońca: ${obronca.imie} ${obronca.nazwisko}`); }
  }
  // Jedenastka sezonu (1 BR, 4 OBR, 4 POM, 2 NAP) — najlepsi na pozycji.
  const najlepsiNa = (poz: Zawodnik["poz"], ile: number) => zawLigi.filter((z) => z.poz === poz).sort((a, b) => ocena(b) - ocena(a)).slice(0, ile);
  const XI = [...najlepsiNa("BR", 1), ...najlepsiNa("OBR", 4), ...najlepsiNa("POM", 4), ...najlepsiNa("NAP", 2)];
  if (XI.length === 11) {
    wiadomosc(s, `⭐ Jedenastka sezonu (${stara}): ${XI.map((z) => z.nazwisko).join(", ")}.`);
    for (const z of XI) if (z.klubId === s.mojKlub) z.morale = Math.min(100, z.morale + 4);
    const moiXI = XI.filter((z) => z.klubId === s.mojKlub);
    if (moiXI.length) moiLaury.push(`⭐ Jedenastka sezonu: ${moiXI.map((z) => z.nazwisko).join(", ")}`);
  }
  // Odkrycie Sezonu — najlepszy młodzieżowiec (U-21) z dorobkiem minut.
  const minMeczy = Math.max(3, Math.round(ligaMoja.terminarz.length * 0.4));
  const odkrycie = [...zawLigi].filter((z) => z.wiek <= 21 && z.mecze >= minMeczy).sort((a, b) => ocena(b) - ocena(a))[0];
  if (odkrycie) {
    wiadomosc(s, `🌟 Odkrycie Sezonu (${stara}): ${odkrycie.imie} ${odkrycie.nazwisko} (${odkrycie.wiek} l., ${s.kluby[odkrycie.klubId!].nazwa}).`);
    if (odkrycie.klubId === s.mojKlub) { odkrycie.morale = Math.min(100, odkrycie.morale + 8); odkrycie.potencjal = Math.min(99, odkrycie.potencjal + 1); s.zarzad = Math.min(100, s.zarzad + 2); moiLaury.push(`🌟 Odkrycie Sezonu: ${odkrycie.imie} ${odkrycie.nazwisko} (${odkrycie.wiek} l.)`); }
  }
  // Trener Sezonu — największe przebicie miejsca w tabeli względem oczekiwań (renoma).
  {
    const oczek = [...tabMoja].sort((a, b) => (s.kluby[b.klubId].renoma ?? 0) - (s.kluby[a.klubId].renoma ?? 0)).map((w) => w.klubId);
    const przebicie = (kid: string) => oczek.indexOf(kid) - tabMoja.findIndex((w) => w.klubId === kid); // + = lepiej niż oczekiwano
    const najlepszyTrener = [...tabMoja].map((w) => w.klubId).sort((a, b) => przebicie(b) - przebicie(a))[0];
    if (najlepszyTrener && przebicie(najlepszyTrener) > 0) {
      const mojT = najlepszyTrener === s.mojKlub;
      wiadomosc(s, `🎖 Trener Sezonu (${stara}): ${mojT ? s.trener : "szkoleniowiec " + s.kluby[najlepszyTrener].nazwa} — wynik ponad oczekiwania (+${przebicie(najlepszyTrener)} miejsc).`);
      if (mojT) { s.zarzad = Math.min(100, s.zarzad + 6); moiLaury.push(`🎖 Trener Sezonu (+${przebicie(najlepszyTrener)} miejsc ponad oczekiwania)`); }
    }
  }
  // Rekordy klubu (trwałe): najlepsze miejsce (wg szczebla→miejsce), najwięcej punktów, król strzelców klubu.
  {
    s.rekordy ??= {};
    const mojaRow = tabMoja.find((w) => w.klubId === s.mojKlub);
    const lepszeMiejsce = !s.rekordy.najlepszeMiejsce
      || mojPoziom < (s.ligi.findIndex((l) => l.nazwa === s.rekordy!.najlepszeMiejsce!.liga) + 1 || 99)
      || (stara === s.rekordy.najlepszeMiejsce.liga && mojeMiejsce < s.rekordy.najlepszeMiejsce.miejsce);
    if (lepszeMiejsce) s.rekordy.najlepszeMiejsce = { sezon: s.sezon, liga: stara, miejsce: mojeMiejsce };
    if (mojaRow && (!s.rekordy.najwiecejPkt || mojaRow.pkt > s.rekordy.najwiecejPkt.pkt)) s.rekordy.najwiecejPkt = { sezon: s.sezon, liga: stara, pkt: mojaRow.pkt };
    const topZ = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => b.gole - a.gole)[0];
    if (topZ && topZ.gole > 0 && (!s.rekordy.topStrzelec || topZ.gole > s.rekordy.topStrzelec.gole)) s.rekordy.topStrzelec = { sezon: s.sezon, imie: topZ.imie, nazwisko: topZ.nazwisko, gole: topZ.gole };
  }
  // Premia zarządu za stawianie na wychowanków (homegrown z dorobkiem minut w minionym sezonie).
  { const wych = s.kluby[s.mojKlub].zawodnicy.filter((id) => { const z = s.zawodnicy[id]; return z?.wychowanek === s.kluby[s.mojKlub].nazwa && z.mecze >= 5; }).length;
    if (wych >= 3) { s.zarzad = Math.min(100, s.zarzad + 3); wiadomosc(s, `👏 Zarząd docenia stawianie na wychowanków (${wych} z dorobkiem minut) — rośnie zaufanie i prestiż akademii.`); } }

  // Nowy sezon = nowe otwarcie. Zaufanie startowe zależy od tego, jak skończył się poprzedni sezon
  // względem celu — ale zawsze w granicach, które dają szansę na odbudowę (firing rzadki).
  let start: number;
  if (wynik === "mistrz") start = 92;
  else if (wynik === "awans") start = 80;
  else if (wynik === "spadek") {
    const beniaminek = s.historia.length >= 2 && s.historia[s.historia.length - 2].wynik === "awans";
    start = beniaminek ? 48 : 34; // spadek beniaminka wybaczalny
  } else if (s.cel === "Awans") start = mojeMiejsce <= 5 ? 52 : 40; // nie awansował mimo celu
  else start = 58; // utrzymanie/górna połowa osiągnięte
  s.zarzad = Math.round(s.zarzad * 0.25 + start * 0.75);

  // Tożsamość lokalna: w niższych ligach (IV liga i niżej) kibice chcą „swoich" — przewaga wychowanków/miejscowych
  // podnosi zaufanie trybun, a skład zbudowany z samych najemników z daleka je obniża.
  if (s.kluby[s.mojKlub].poziom >= 5) {
    const u = udzialMiejscowych(s, s.kluby[s.mojKlub]);
    const d = u >= 0.4 ? 4 : u >= 0.25 ? 2 : u < 0.1 ? -4 : 0;
    if (d !== 0) {
      s.zaufanieKibicow = Math.max(0, Math.min(100, (s.zaufanieKibicow ?? 60) + d));
      wiadomosc(s, d > 0
        ? `🏡 Kibice doceniają, że grają u Was „swoi" (${Math.round(u * 100)}% kadry to miejscowi/wychowankowie) — zaufanie +${d}.`
        : `🧳 Trybuny narzekają: za dużo przyjezdnych, za mało „swoich" (${Math.round(u * 100)}% miejscowych) — zaufanie ${d}.`);
    }
  }

  // Sponsorzy: usuń tych z wygasłym kontraktem, uzupełnij brakujące role (lepsze warunki po awansie).
  const wygasli = s.sponsorzy.filter((sp) => sp.sezonDo < s.sezon);
  for (const sp of wygasli) wiadomosc(s, `Wygasł kontrakt ze sponsorem ${sp.nazwa} — zniknął ze strojów.`);
  s.sponsorzy = s.sponsorzy.filter((sp) => sp.sezonDo >= s.sezon);
  const bonusSpon = wynik === "mistrz" ? 1.3 : wynik === "awans" ? 1.2 : wynik === "spadek" ? 0.8 : 1;
  const noweOferty = nowiSponsorzy(s, bonusSpon);
  for (const n of noweOferty) {
    if (!s.sponsorzy.some((sp) => sp.typ === n.typ)) {
      s.sponsorzy.push(n);
      wiadomosc(s, `Nowy ${nazwaSponsora(n.typ).toLowerCase()}: ${n.nazwa} (${zl(n.wartosc)}/sezon, do ${n.sezonDo}).`);
    }
  }

  // Strefa kibica: miejsce spotkań przed meczem — buduje więź z klubem (+1 zaufania na poziom, max +3/sezon).
  {
    const fz = s.kluby[s.mojKlub].obiekty.strefaKibica ?? 0;
    if (fz > 0) s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + Math.min(3, fz));
  }

  // Lokalny patron / zakład pracy: dopóki trzyma z klubem — podnosi zaufanie trybun (firma „nasza, z miasta").
  // W trudnych czasach (słaby sezon albo po prostu kryzys) patron może się wycofać: zrywa umowę i zostawia dziurę.
  {
    const patron = s.sponsorzy.find((sp) => sp.patron);
    if (patron) {
      s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 1);
      const ryzyko = (wynik === "spadek" ? 0.22 : 0.1);
      if (szansa(ryzyko)) {
        s.sponsorzy = s.sponsorzy.filter((sp) => sp !== patron);
        const strata = Math.round((patron.wartosc * 0.3) / 500) * 500;
        s.kluby[s.mojKlub].kasa = Math.max(0, s.kluby[s.mojKlub].kasa - strata);
        s.zaufanieKibicow = Math.max(0, (s.zaufanieKibicow ?? 60) - 2);
        wiadomosc(s, `🏭 Patron klubu „${patron.nazwa}" wycofał się ze sponsoringu (kłopoty firmy) — zerwana umowa i ${zl(strata)} mniej w budżecie. Trzeba szukać nowego partnera.`);
      }
    }
  }

  // Model własności klubu — roczne skutki finansowe, nastroje trybun i ryzyka charakterystyczne dla właściciela.
  {
    const mk = s.kluby[s.mojKlub];
    const w = ustalWlasciciela(s, mk);
    const baza = NAGRODA_LIGA[Math.max(0, nowyPoziom - 1)] || 50000;
    const spelniony = wynik === "mistrz" || wynik === "awans" || (s.cel !== "Awans" && wynik !== "spadek");
    const tys = (x: number) => Math.round(x / 1000) * 1000;
    if (w === "samorzad") {
      const dot = tys(baza * (nowyPoziom >= 6 ? 0.22 : 0.12));
      if (dot > 0) { mk.kasa += dot; wiadomosc(s, `🏛 Dotacja podmiotowa ${nowyPoziom >= 6 ? "gminy" : "miasta"} na nowy sezon: ${zl(dot)}.`); }
      if (s.sezon % 4 === 0) { // cykl wyborów samorządowych
        if (szansa(0.5)) { const b = tys(baza * 0.15); mk.kasa += b; s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 2); wiadomosc(s, `🗳 Po wyborach nowy włodarz stawia na sport — dodatkowe ${zl(b)} dla klubu.`); }
        else { s.zaufanieKibicow = Math.max(0, (s.zaufanieKibicow ?? 60) - 3); wiadomosc(s, `🗳 Po wyborach cięcia w budżecie — dotacja dla klubu zamrożona, kibice zaniepokojeni.`); }
      }
    } else if (w === "stowarzyszenie") {
      s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 2); // klub społeczny — trybuny zawsze blisko
      if (mk.kasa < 0) { const zb = tys(Math.min(-mk.kasa, baza * 0.2)); if (zb > 0) { mk.kasa += zb; wiadomosc(s, `🤝 Zrzutka kibiców ratuje budżet — społeczność zebrała ${zl(zb)}. „Nasz klub, nasza sprawa".`); } }
      else if (s.sezon % 3 === 0) wiadomosc(s, `🧾 Walne zebranie członków stowarzyszenia zatwierdziło plan na sezon — skromnie, ale po swojemu.`);
    } else if (w === "inwestor") {
      const zastrzyk = tys(baza * 0.3);
      if (zastrzyk > 0) { mk.kasa += zastrzyk; wiadomosc(s, `💼 Inwestor dokłada ${zl(zastrzyk)} do budżetu — ale oczekuje wyników.`); }
      mk.inwestorCierpliwosc = Math.max(0, Math.min(100, (mk.inwestorCierpliwosc ?? 60) + (spelniony ? 10 : -22)));
      if (mk.inwestorCierpliwosc <= 0) { // inwestor się wycofuje → urwisko finansowe, klub ratuje samorząd
        mk.wlasciciel = "samorzad"; mk.inwestorCierpliwosc = undefined;
        const ciecie = tys(Math.max(0, mk.kasa) * 0.4);
        mk.kasa = Math.max(0, mk.kasa - ciecie);
        s.zaufanieKibicow = Math.max(0, (s.zaufanieKibicow ?? 60) - 6);
        wiadomosc(s, `📉 Inwestor wycofał się z klubu — zabrał ${zl(ciecie)} i zostawił dziurę w budżecie. Klub przechodzi pod skrzydła samorządu.`);
      } else if (mk.inwestorCierpliwosc < 30) {
        wiadomosc(s, `⏳ Cierpliwość inwestora na wyczerpaniu (${mk.inwestorCierpliwosc}/100) — bez wyników może się wycofać z finansowania.`);
      }
    } else { // spolka akcyjna
      const dyw = tys(baza * 0.18);
      if (dyw > 0) { mk.kasa += dyw; wiadomosc(s, `🏢 Spółka domyka sezon z wpływami od udziałowców: ${zl(dyw)} do budżetu.`); }
    }
  }

  // Podkupienie z akademii: duży klub uruchamia transfer młodego wychowanka za ekwiwalent za wyszkolenie.
  // Dotyczy rezerwy juniorskiej (nie rusza pierwszej kadry); klub dostaje gotówkę + 20% z przyszłej odsprzedaży.
  {
    const mk = s.kluby[s.mojKlub];
    const jun = (mk.juniorzy ?? []).map((id) => s.zawodnicy[id]).filter(Boolean).sort((a, b) => b.potencjal - a.potencjal)[0];
    if (jun && mk.poziom >= 4 && jun.potencjal >= 72 && szansa(0.25)) {
      const ekwiwalent = Math.round((jun.potencjal * jun.potencjal * 12) / 500) * 500; // ekwiwalent za wyszkolenie wg potencjału
      mk.juniorzy = (mk.juniorzy ?? []).filter((id) => id !== jun.id);
      jun.odsprzedaz = { klubId: mk.id, proc: 20 };
      const duzy = Object.values(s.kluby).filter((k) => k.poziom <= 2 && k.id !== mk.id)[0];
      jun.klubId = duzy?.id ?? null; if (duzy) duzy.zawodnicy.push(jun.id);
      mk.kasa += ekwiwalent;
      s.zaufanieKibicow = Math.max(0, (s.zaufanieKibicow ?? 60) - 2);
      wiadomosc(s, `🦅 ${duzy?.nazwa ?? "Duży klub"} podkupił z akademii młodego ${jun.imie} ${jun.nazwisko} (pot. ${Math.floor(jun.potencjal)}). Ekwiwalent za wyszkolenie ${zl(ekwiwalent)} + 20% od dalszej odsprzedaży. Kibice żałują, ale to szansa dla chłopaka.`);
    }
  }

  // starzenie, rozwój, emerytury
  for (const k of Object.values(s.kluby)) {
    for (const id of [...k.zawodnicy]) {
      const z = s.zawodnicy[id];
      naliczSezonDoKariery(z); // zapisz sezon w historii zanim wyzeruję
      if (!z.rozwoj) z.rozwoj = []; // próbka umiejętności na koniec sezonu (do wykresu rozwoju)
      z.rozwoj.push(Math.round(z.umiej * 10) / 10);
      if (z.rozwoj.length > 15) z.rozwoj = z.rozwoj.slice(-15);
      z.wiek++;
      z.gole = 0;
      z.asysty = 0;
      z.czysteKonta = 0;
      z.mecze = 0;
      z.meczeJesien = 0; z.meczeRezerwy = 0;
      z.forma = 0;
      z.kondycja = 100;
      z.kontuzja = 0;
      z.kartki = 0;
      z.zawieszenie = 0;
      if (z.wiek >= 30) {
        const profMn = z.cechy?.includes("profesjonalista") ? 0.6 : 1; // dba o formę — wolniej słabnie z wiekiem
        rozwinAtrybuty(z, -los(0.5, z.wiek >= 33 ? 4 : 2) * profMn); // spadek wiekowy — przez atrybuty
      }
      if (konczyKariere(z, k.poziom)) {
        const meczeK = (z.kariera || []).reduce((a, w) => a + (w.mecze || 0), 0);
        const wychow = z.wychowanek === k.nazwa;
        const legenda = meczeK >= 300 || (wychow && meczeK >= 150);
        const numer = z.numer;
        k.zawodnicy = k.zawodnicy.filter((x) => x !== id);
        delete s.zawodnicy[id];
        if (k.id === s.mojKlub) {
          wiadomosc(s, pozegnanieKariery(z, k));
          if (legenda) {
            // Pożegnanie legendy w barwach klubu: zastrzeżony numer, trwały wzrost zaufania, trybuna i trener-wychowanek.
            s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 8);
            if (numer > 0) { k.numeryZastrzezone = [...(k.numeryZastrzezone ?? []), numer].filter((n, idx, a) => a.indexOf(n) === idx); }
            wiadomosc(s, `🎇 Mecz pożegnalny ${z.imie} ${z.nazwisko} przy kompletnych trybunach. Numer ${numer || "—"} zostaje zastrzeżony. Kibice długo nie zapomną.`);
            if (!k.trybunaImienia) { k.trybunaImienia = `${z.imie} ${z.nazwisko}`; wiadomosc(s, `🏟 Kibice nazwali trybunę imieniem ${z.imie} ${z.nazwisko} — duma i wdzięczność na pokolenia.`); }
            if (wychow && (k.akademia ?? 1) < 5 && szansa(0.6)) { k.akademia = (k.akademia ?? 1) + 1; wiadomosc(s, `🎓 ${z.imie} ${z.nazwisko} zostaje w klubie jako trener-wychowanek w akademii — poziom szkolenia młodzieży rośnie.`); }
          }
        }
      }
    }
    // Juniorzy z akademii. Lepsza akademia = więcej i zdolniejszych wychowanków.
    const aN = poziomAkademii(k) / 5; // 0.2..1
    const ilu = 1 + (szansa(0.4 + aN * 0.5) ? 1 : 0) + (poziomAkademii(k) >= 4 && szansa(0.45) ? 1 : 0);
    for (let i = 0; i < ilu; i++) {
      const z = nowyZawodnik(s, k.poziom, wybierz(KADRA), { mlody: true });
      // podbicie potencjału wg poziomu akademii; rzadko prawdziwy talent
      const talent = szansa(0.03 + aN * 0.08);
      z.potencjal = Math.min(96, z.potencjal + Math.round(aN * 9) + (talent ? losInt(8, 18) : 0));
      z.klubId = k.id;
      z.kariera = [{ klub: k.nazwa, od: s.sezon, do: null, mecze: 0, gole: 0 }]; // wychowanek — pierwszy etap
      if (k.id === s.mojKlub) {
        // Twoja akademia zasila zespół U-21 (nie od razu pierwszy skład).
        naborAkademiiDoJuniorow(s, z);
        const ocena = z.potencjal - z.umiej > 22 ? " — duży talent! 🌟" : z.potencjal - z.umiej > 14 ? " — zapowiada się dobrze" : "";
        wiadomosc(s, `Z akademii do U-21 dołącza ${z.imie} ${z.nazwisko} (${z.wiek} l., ${z.poz}, umiej. ${Math.floor(z.umiej)}/pot. ${Math.floor(z.potencjal)})${ocena}.`);
      } else {
        k.zawodnicy.push(z.id);
        const uzyte = new Set(k.zawodnicy.map((x) => s.zawodnicy[x].numer).filter((n) => n > 0)); let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n;
      }
    }
    if (k.id !== s.mojKlub) odswiezAI(s, k.id);
    for (const id of k.zawodnicy) {
      const z = s.zawodnicy[id];
      z.pensja = Math.max(z.pensja * 0.9, pensjaDla(z.umiej, k.poziom));
    }
  }

  for (let i = 0; i < s.ligi.length; i++) {
    const liga = s.ligi[i];
    liga.kluby = nowe[i];
    liga.terminarz = terminarz(nowe[i]);
    liga.wyniki = [];
  }
  dojrzewanieTalentow(s); // obserwowane talenty starzeją się i rozwijają
  juniorzyNowySezon(s);   // juniorzy U-21 starzeją się; absolwenci awansują albo odchodzą
  for (const k of Object.values(s.kluby)) k.seria = 0; // nowy sezon — passa od zera
  // Pro Junior System PZPN: premia za ogrywanie młodzieżowców (Ekstraklasa/I liga — program zastąpił nakaz w Ekstraklasie).
  { const mk = s.kluby[s.mojKlub]; const wyst = s.mlodziezoweWystepy ?? 0;
    if (mk && mk.poziom <= 2 && wyst > 0) {
      const bonus = Math.round(wyst * (mk.poziom === 1 ? 40000 : 12000) / 1000) * 1000;
      mk.kasa += bonus;
      wiadomosc(s, `⚽ Pro Junior System PZPN: za ogrywanie młodzieżowców (U-21) w ${wyst} kolejkach klub dostał ${zl(bonus)} premii.`);
    } }
  s.mlodziezoweWystepy = 0; // licznik młodzieżowca od nowa
  s.miesiacSnapshot = {};    // Zawodnik Miesiąca liczony od nowa
  s.celPodniesiony = false;  // dynamiczny cel znów możliwy
  rozwojSztabuILicencji(s);  // sztab rośnie, trener zdobywa licencje
  realizujUmowyWstepne(s); // umowy wstępne: wolne transfery latem
  s.sezon++;
  dotacjaGminy(s); // klub amatorski: dotacja z gminy na nowy sezon
  if (!s.zwolniony) rozpocznijOkres(s, "lato"); // okres letni: urlop + przygotowania (sparingi, obóz, testy)
  // Jubileusz klubu: okrągła rocznica założenia (25/50/75/100…) — mecz gali, oprawa kibiców, zastrzyk entuzjazmu.
  { const mk = s.kluby[s.mojKlub];
    if (mk?.zalozony) {
      const lat = s.sezon - mk.zalozony;
      if (lat > 0 && lat % 25 === 0) {
        const ranga = lat % 100 === 0 ? 3 : lat % 50 === 0 ? 2 : 1; // 100-lecie > 50-lecie > 25-lecie
        s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 4 + ranga * 3);
        for (const id of mk.zawodnicy) { const z = s.zawodnicy[id]; if (z) z.morale = Math.min(100, z.morale + 2 + ranga); }
        const prezent = Math.round((NAGRODA_LIGA[Math.max(0, mk.poziom - 1)] * 0.15 * ranga) / 1000) * 1000;
        mk.kasa += prezent;
        wiadomosc(s, `🎉 ${lat}-lecie ${mk.nazwa}! Klub świętuje jubileusz — mecz gali i oprawa kibiców, wpływy z pamiątek ${zl(prezent)}. Entuzjazm trybun i szatni w górę.`);
      }
    }
  }
  sztabNowySezon(s);       // sztab: wygaśnięcia kontraktów, przedłużenia, rotacja (wszystkie kluby)
  trenerzyNowySezon(s);    // trenerzy klubów AI: odejścia/zwolnienia i nowe angaże
  rozliczRaty(s);          // spłata zaległych rat transferowych
  karyFinansowe(s);        // PZPN: ujemne punkty za zadłużenie na nowy sezon (B1)
  // B3: sprzedaż karnetów na start sezonu (klub gracza) — posiadacze płacą z góry (karnet ≈ 7 meczów po aktualnej cenie biletu).
  { const mk = s.kluby[s.mojKlub]; const q = s.karnety ?? 0;
    if (mk && q > 0) { const przychod = Math.round(q * mk.pojemnosc * BILET[mk.poziom - 1] * (s.cenaBiletu ?? 1) * 7);
      mk.kasa += przychod; wiadomosc(s, `🎟 Sprzedaż karnetów (${Math.round(q * 100)}% pojemności): wpływ ${zl(przychod)} na start sezonu.`); } }
  turniejReprezentacji(s); // lata parzyste: turniej (EURO/MŚ); nieparzyste: eliminacje
  s.kolejka = 0;
  s.koniecSezonu = false;
  s.oferty = [];
  s.xiHistoria = [];
  s.xiKolejki = undefined;
  s.ostatnieOceny = undefined;
  // (wycofania klubów rozstrzygane są przy awansach/spadkach — patrz nowySezon: dodatkowy awans z niższej ligi)
  zakonczWypozyczenia(s);
  wygasanieKontraktow(s);
  uzupelnijWolnych(s);
  s.cel = celSezonu(s, s.mojKlub);
  s.puchar = nowyPuchar(s);
  awanseSpadkiJun(s);     // awanse/spadki w piramidzie juniorskiej wg minionych tabel (PZPN)
  inicjujRozgrywkiJun(s); // nowe ligi/puchary juniorów wg zaktualizowanych szczebli juniorskich
  // Europejska kampania, jeśli zakwalifikowani w minionym sezonie.
  s.europa = kwalEuropa ? nowaEuropa(s, kwalEuropa) : undefined;
  if (kwalEuropa) wiadomosc(s, `🌍 Zakwalifikowaliście się do ${kwalEuropa === "LM" ? "Ligi Mistrzów" : kwalEuropa === "LE" ? "Ligi Europy" : "Ligi Konferencji Europy"}! Europejskie mecze czekają w tym sezonie.`);
  polaczRezerwy(s);
  const wygaslKontrakt = s.trenerKontraktDo != null && s.sezon > s.trenerKontraktDo;
  if (s.zarzad <= 5 || wygaslKontrakt) {
    const o = trenerOtwarty(s); if (o) o.do = s.sezon - 1; // zamknij etap na ostatnim prowadzonym sezonie
    s.zwolniony = true;
    s.powodWolny = s.zarzad <= 5 ? "zwolniony" : "wygasl";
    wiadomosc(s, s.zarzad <= 5
      ? "Zarząd stracił cierpliwość — zostałeś zwolniony. Znajdź nowy klub bez trenera."
      : "Twój kontrakt wygasł i nie został przedłużony. Jesteś bez klubu — sprawdź oferty pracy.");
    s.propozycjaTrenera = undefined;
    if (s.powodWolny === "wygasl") ofertyPoWygasnieciu(s);
  } else {
    wiadomosc(s, `Sezon ${s.sezon}/${(s.sezon + 1) % 100}: ${s.ligi[nowyPoziom - 1].nazwa}. Cel zarządu: ${s.cel}.`);
  }
  przygotujKolejke(s);
}

/** AI: wymienia najsłabszych na zawodników z poziomu ligi, trzyma kadrę 18–22. */
function odswiezAI(s: StanGry, klubId: string) {
  const k = s.kluby[klubId];
  const zs = k.zawodnicy.map((id) => s.zawodnicy[id]).sort((a, b) => a.umiej - b.umiej);
  const usun = zs.slice(0, Math.max(0, zs.length - 18) + 3);
  for (const z of usun) {
    k.zawodnicy = k.zawodnicy.filter((x) => x !== z.id);
    z.klubId = null;
    if (z.wiek < 33) s.wolni.push(z.id);
    else delete s.zawodnicy[z.id];
  }
  // dopilnuj pozycji: min 2 BR, 5 OBR, 5 POM, 3 NAP
  const min: Record<string, number> = { BR: 2, OBR: 5, POM: 5, NAP: 3 };
  for (const [poz, ile] of Object.entries(min)) {
    let jest = k.zawodnicy.filter((id) => s.zawodnicy[id].poz === poz).length;
    while (jest < ile) {
      const z = nowyZawodnik(s, k.poziom, poz as never);
      z.klubId = k.id;
      k.zawodnicy.push(z.id);
      jest++;
    }
  }
  while (k.zawodnicy.length < 18) {
    const z = nowyZawodnik(s, k.poziom, wybierz(KADRA));
    z.klubId = k.id;
    k.zawodnicy.push(z.id);
  }
}

/** Żywy rynek: kluby AI handlują między sobą i biorą wolnych w otwartym oknie (nie dotyka Twojego klubu). */
export function rynekAI(s: StanGry) {
  const kluby = Object.values(s.kluby).filter((k) => k.id !== s.mojKlub && !k.rezerwaDla);
  const juniorSet = new Set(s.kluby[s.mojKlub].juniorzy ?? []);
  const ile = losInt(6, 16);
  for (let t = 0; t < ile; t++) {
    const kupcy = kluby.filter((k) => k.zawodnicy.length < 23 && k.kasa > 60000);
    const buyer = kupcy[losInt(0, Math.max(0, kupcy.length - 1))];
    if (!buyer) continue;
    const sprz = kluby.filter((k) => k.id !== buyer.id && k.zawodnicy.length > 16);
    if (!sprz.length) continue;
    // Regionalny rynek + „chodzony transfer": kupiec sięga po zawodnika z pobliskiego klubu, a jeszcze chętniej
    // z klubu zaprzyjaźnionego / z tego samego obozu patrona (sieć kontaktów działaczy i trenerów).
    const seller = wybierzWazone(sprz, (k) => wagaBliskosci(s, buyer, k) * wieziRynkowe(buyer.nazwa, k.nazwa));
    if (!seller) continue;
    const prog = zakresUmiej(buyer.poziom)[0] - 4;
    const kand = seller.zawodnicy.map((id) => s.zawodnicy[id])
      .filter((z) => z && !z.macierzysty && !juniorSet.has(z.id) && z.umiej >= prog)
      .sort((a, b) => b.umiej - a.umiej)[0];
    if (!kand) continue;
    const cena = wartosc(kand);
    if (buyer.kasa < cena) continue;
    buyer.kasa -= cena; seller.kasa += cena;
    wyplacOdsprzedaz(s, kand, cena, seller.id); // klauzula odsprzedaży: % z dalszego transferu wraca do klubu-wychowawcy
    seller.zawodnicy = seller.zawodnicy.filter((x) => x !== kand.id);
    kand.klubId = buyer.id; buyer.zawodnicy.push(kand.id);
    kand.pensja = pensjaDla(kand.umiej, buyer.poziom);
    const uzyte = new Set(buyer.zawodnicy.map((x) => s.zawodnicy[x].numer).filter((n) => n > 0));
    let n = kand.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; kand.numer = n;
    // Głośniejszy transfer (wyższa kwota) trafia do wiadomości jako koloryt rynku.
    if (cena >= 400000) wiadomosc(s, `💬 Transfer: ${kand.imie} ${kand.nazwisko} (${Math.floor(kand.umiej)}) z ${seller.nazwa} do ${buyer.nazwa} za ${zl(cena)}.`);
  }
  // Wolni transferzy — kilka klubów AI dobiera z rynku wolnych.
  for (let i = 0; i < losInt(3, 8) && s.wolni.length; i++) {
    const buyer = kluby.filter((k) => k.zawodnicy.length < 22)[losInt(0, Math.max(0, kluby.length - 1))];
    if (!buyer) break;
    const idx = s.wolni.findIndex((id) => { const z = s.zawodnicy[id]; return z && z.umiej >= zakresUmiej(buyer.poziom)[0] - 6; });
    if (idx < 0) continue;
    const z = s.zawodnicy[s.wolni[idx]]; s.wolni.splice(idx, 1);
    z.klubId = buyer.id; buyer.zawodnicy.push(z.id); z.pensja = pensjaDla(z.umiej, buyer.poziom);
    const uzyte = new Set(buyer.zawodnicy.map((x) => s.zawodnicy[x].numer).filter((nn) => nn > 0));
    let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n;
  }
}

// ——— Finanse ———

/** Średni bilans klubu na kolejkę: sponsor + bilety (co drugi mecz u siebie) − pensje. */
export function bilansKolejki(s: StanGry, dodatkowaPensja = 0) {
  const k = s.kluby[s.mojKlub];
  const kolejek = s.ligi[k.poziom - 1].terminarz.length;
  const sponsor = (SPONSOR_SEZON[k.poziom - 1] * (0.7 + k.renoma * 0.6)) / kolejek + przychodSponsorow(s) / kolejek;
  const bilety = (WIDZOWIE[k.poziom - 1] * (0.6 + k.renoma * 0.8) * BILET[k.poziom - 1]) / 2;
  const doplaty = Object.values(s.zawodnicy).reduce((a, z) => a + (z.macierzysty === k.id && z.klubId !== k.id ? (z.doplataMacierzystego ?? 0) : 0), 0);
  const pensje = k.zawodnicy.reduce((a, id) => a + s.zawodnicy[id].pensja, 0) + doplaty + dodatkowaPensja;
  return { sponsor, bilety, pensje, bilans: sponsor + bilety - pensje };
}

export function pensjaPoTransferze(s: StanGry, zawodnikId: string) {
  return zadaniePlacowe(s, s.zawodnicy[zawodnikId], s.kluby[s.mojKlub].poziom);
}

/** Wygasanie kontraktów na starcie sezonu: kluby AI przedłużają większość, część puszczają za darmo (Bosman).
 * Twoi zawodnicy, którym nie przedłużyłeś umowy, odchodzą za darmo. */
function wygasanieKontraktow(s: StanGry) {
  for (const k of Object.values(s.kluby)) {
    for (const id of [...k.zawodnicy]) {
      const z = s.zawodnicy[id];
      if (z.kontraktDo >= s.sezon) continue; // kontrakt wciąż ważny
      if (k.id === s.mojKlub) {
        // nie przedłużyłeś — zawodnik odchodzi za darmo (prawo Bosmana)
        k.zawodnicy = k.zawodnicy.filter((x) => x !== id);
        z.klubId = null;
        z.kontraktDo = s.sezon;
        s.wolni.push(id);
        s.taktyka.sklad = s.taktyka.sklad.filter((x) => x !== id);
        wiadomosc(s, `${z.imie} ${z.nazwisko} odszedł za darmo — wygasł kontrakt (Bosman).`);
      } else if (szansa(0.8)) {
        z.kontraktDo = s.sezon + dlugoscKontraktu(k.poziom); // AI przedłuża
        z.kontraktTyp = kontraktTyp(k.poziom);
      } else {
        k.zawodnicy = k.zawodnicy.filter((x) => x !== id);
        z.klubId = null;
        z.kontraktDo = s.sezon;
        if (z.wiek < 33) s.wolni.push(id);
        else delete s.zawodnicy[id];
      }
    }
  }
  // Ostrzeżenie: Twoi zawodnicy z kontraktem na ostatni sezon.
  const moj = s.kluby[s.mojKlub];
  const koncza = moj.zawodnicy.filter((id) => s.zawodnicy[id].kontraktDo === s.sezon);
  if (koncza.length) {
    const lista = koncza.slice(0, 4).map((id) => s.zawodnicy[id].nazwisko).join(", ");
    wiadomosc(s, `Kontrakt kończy się po tym sezonie: ${lista}${koncza.length > 4 ? ` i ${koncza.length - 4} in.` : ""}. Przedłuż, by nie odeszli za darmo.`);
  }
}

// Nagroda dla mistrza ligi wg poziomu (ostatnie miejsce dostaje ~1/liczba tej kwoty).
const NAGRODA_LIGA = [8_000_000, 2_000_000, 600_000, 200_000, 80_000, 35_000, 15_000, 7_000, 3_000, 2_000, 1_500, 1_000];

// ——— Sponsorzy ———
const SPONSORZY_NAZWY = [
  "Tarnobud", "GrandBet", "EuroTrans", "PolMlek", "StalPol", "AgroMax", "BudEko", "KrakStal", "GórTrans", "TatraSport",
  "MałopolEnergia", "WiślanBank", "NowBud", "CarpatOil", "EkoFarm", "SilesiaStal", "PolTrans", "DomBud", "FortBank",
  "WawelGaz", "BeskidPlus", "NaftaPol", "MostStal", "ZłotyKłos", "TechnoBud", "PiastInvest", "LechPol", "ArkaLogistic",
  "VistulaTrade", "SolidBet", "KoronaMedia", "GryfTel", "OdraChem", "BałtykFish", "TatryTour", "KrakFarm", "RolMax", "EnerGo",
  "MaxBet", "ProBank", "StalExport", "GazPolska", "BudimexPro", "AgroStal", "PolSpożywczy", "TransGór", "MetalPlus", "ElektroPol",
  "InterCar", "PolFarm", "ZielonaEnergia", "DrewPol", "MleczarniaKrak", "PiekarniaPiast", "UbezpieczBank", "LogiStar", "NaftoChem",
  "WęgielPol", "SzkłoPol", "CementBud", "PlastMax", "RybkaPol", "OwocPlus", "MięsPol", "ChłodniaKrak", "SprzętBud", "AutoStar",
  "TurystykaBeskid", "HoteleKarpaty", "SklepySport", "TeleKom", "DomMedia", "RadioMałopolska", "GazetaLok", "PortalSport", "BankSpółdz",
]; // ponad 60 fikcyjnych sponsorów (firmy dające pieniądze klubowi)
// Fikcyjne marki sportowe (dostawcy strojów) — bez znaków towarowych.
const PRODUCENCI = [
  "Kolos", "Sportivo", "Vigor", "Aero", "Pulsar", "Atleta", "Rexon", "Volt", "Kadar", "Orkan", "Rapid", "Zenit",
  "Primo", "Falcon", "Olimp", "Strefa", "Taurus", "Nord", "Legio", "Victor", "Arena", "Kondor", "Spark", "Furia",
  "Impuls", "Dynamo", "Tytan", "Grom", "Fenix", "Kometa", "Sprinter", "Maraton", "Gladiator", "Atom", "Lider", "Mistral",
  "Wulkan", "Huragan", "Lawina", "Szpada", "Rekin", "Pumax", "Sfera", "Kobra", "Tarcza", "Oszczep",
]; // ponad 40 fikcyjnych marek strojów
// Udział w bazowej puli sponsorskiej. Kluczowe 4 jak dotąd; dodatkowe sloty są mniejsze (razem ~+30% przy komplecie).
const SPONSOR_UDZIAL: Record<SponsorTyp, number> = {
  glowny: 1, techniczny: 0.4, stadionowy: 0.3, producent: 0.5,
  rekaw: 0.1, plecy: 0.08, spodenki: 0.04, bandy: 0.07, telebim: 0.05, trybuna: 0.05,
  napoje: 0.03, medyczny: 0.03, motoryzacyjny: 0.03, finansowy: 0.04, bukmacher: 0.06, medialny: 0.02, akademia: 0.03,
};
const SPONSOR_ETYKIETA: Record<SponsorTyp, string> = {
  glowny: "Sponsor główny", techniczny: "Sponsor techniczny", stadionowy: "Sponsor stadionu (naming)", producent: "Dostawca strojów",
  rekaw: "Sponsor na rękawie", plecy: "Sponsor na plecach koszulki", spodenki: "Sponsor na spodenkach",
  bandy: "Bandy reklamowe", telebim: "Reklama na telebimie", trybuna: "Nazwa trybuny",
  napoje: "Oficjalny dostawca napojów", medyczny: "Partner medyczny", motoryzacyjny: "Partner motoryzacyjny",
  finansowy: "Partner finansowy", bukmacher: "Partner bukmacherski", medialny: "Partner medialny", akademia: "Sponsor akademii",
};
/** Grupy slotów (do UI). */
export const SPONSOR_GRUPY: { nazwa: string; typy: SponsorTyp[] }[] = [
  { nazwa: "Kluczowi sponsorzy", typy: ["glowny", "techniczny", "stadionowy", "producent"] },
  { nazwa: "Stroje meczowe", typy: ["rekaw", "plecy", "spodenki"] },
  { nazwa: "Reklama na stadionie", typy: ["bandy", "telebim", "trybuna"] },
  { nazwa: "Partnerzy klubu", typy: ["napoje", "medyczny", "motoryzacyjny", "finansowy", "bukmacher", "medialny", "akademia"] },
];
const ROLE: SponsorTyp[] = ["glowny", "techniczny", "stadionowy", "producent"];
const ROLE_DODATKOWE: SponsorTyp[] = SPONSOR_GRUPY.slice(1).flatMap((g) => g.typy);

/** Czy slot jest dostępny dla klubu (null = tak; tekst = czego brakuje). */
export function blokadaSlotu(k: Klub, typ: SponsorTyp): string | null {
  const ob = k.obiekty;
  if (typ === "telebim" && !(ob.telebim ?? 0)) return "wymaga telebimu (obiekty stadionu)";
  if (typ === "trybuna" && k.pojemnosc < 1000) return "wymaga stadionu min. 1000 miejsc";
  if (typ === "napoje" && !ob.gastronomia) return "wymaga stoisk z jedzeniem";
  if (typ === "bukmacher" && k.poziom > 6) return "bukmacherzy sponsorują od klasy okręgowej w górę";
  if (typ === "medialny" && k.poziom > 6) return "media regionalne — od klasy okręgowej w górę";
  return null;
}

// Pule nazw dla partnerów branżowych (fikcyjne marki).
const PULA_BRANZ: Partial<Record<SponsorTyp, string[]>> = {
  napoje: ["Górski Potok", "Zdrojowa", "Beskidzka Woda", "Energix", "Malinowy Sad", "Ice-Pol", "Kryształowa", "Sokpol"],
  medyczny: ["MediCentrum", "Klinika Sport-Med", "FizjoPlus", "OrtoMed", "Centrum Rehabilitacji Ruch", "Przychodnia Zdrowie", "DiagnoLab"],
  motoryzacyjny: ["AutoStar", "Pol-Car Salon", "MotoPol", "AutoCentrum", "KarPol Dealer", "Opony Max", "AutoGaz Serwis"],
  finansowy: ["WiślanBank", "FortBank", "ProBank", "BankSpółdz", "Kasa Regio", "UbezpieczBank", "Leasing Plus"],
  bukmacher: ["GrandBet", "SolidBet", "MaxBet", "BetPol", "TypStar", "GolBet", "Fortuna Typu"],
  medialny: ["PortalSport", "Radio Fala", "TV Region", "Sport24 Portal", "Gazeta Lokalna", "Radio Plus Region"],
  akademia: ["EduSport", "Fundacja Młody Sport", "Kids Arena", "Szkoła Językowa Atlas", "ZdrowyStart", "Junior Bank"],
};

// B5: finanse amatorów. Kluby okręgówki i niżej żyją głównie z dotacji gminy/miasta
// i drobnych lokalnych firm, nie z komercyjnych sponsorów tytularnych.
const DOTACJE = (miasto: string) => [
  `Dotacja — Gmina ${miasto}`, `Dotacja — Urząd Miasta ${miasto}`, `Budżet Gminy ${miasto}`,
  `OSiR ${miasto}`, `Gminny Fundusz Sportu`, `Urząd Gminy ${miasto}`,
];
const LOKALNI = [
  "Piekarnia Gminna", "Delikatesy u Zbyszka", "Stacja Paliw", "Hurtownia Bud-Mat", "Transport-Sped",
  "Zakład Mięsny", "Stolarnia", "Market Spożywczy", "Apteka pod Lipą", "Firma Remontowa",
  "Ubojnia Drobiu", "Skup Złomu", "Kwiaciarnia Róża", "Pizzeria Roma", "Warsztat Samochodowy",
  "Tartak", "Gospodarstwo Rolne", "Zakład Kamieniarski", "Myjnia Ręczna", "Sklep Rolno-Spożywczy",
  "Pub pod Kasztanem", "Firma Brukarska", "Hurt-Pol", "Agro-Handel", "Usługi Koparką",
]; // drobni, lokalni sponsorzy klubów amatorskich (bez znaków towarowych)

// Lokalni patroni / zakłady pracy związane z klubem (realia PL — klub „przy fabryce"). Nazwa często z miastem.
const PATRONI = (miasto: string) => [
  `Zakłady Mięsne ${miasto}`, `Mleczarnia ${miasto}`, `Cegielnia ${miasto}`, `Tartak ${miasto}`,
  `Fabryka Mebli ${miasto}`, `Przedsiębiorstwo Komunalne ${miasto}`, `Zakład Przetwórstwa ${miasto}`,
  `Browar ${miasto}`, `Spółdzielnia Rolna ${miasto}`, `Huta Szkła ${miasto}`,
];
/** Czy główny sponsor na danym szczeblu bywa lokalnym patronem (półprofesjonalne i amatorskie kluby). */
function losujPatron(poziom: number): boolean {
  return poziom >= 4 && poziom <= 7 && szansa(poziom >= 6 ? 0.45 : 0.3);
}

function nazwaDla(typ: SponsorTyp, uzyte: Set<string>, poziom = 1, miasto = ""): string {
  let pula: string[];
  if (poziom >= 6 && typ === "glowny") pula = DOTACJE(miasto); // okręgówka i niżej: główny „sponsor" = gmina
  else if (poziom >= 6) pula = LOKALNI;                        // pozostałe sloty amatora: lokalne firmy
  else if (poziom === 5 && typ !== "producent") pula = szansa(0.5) ? LOKALNI : SPONSORZY_NAZWY; // IV liga: mix regionalny/lokalny
  else pula = typ === "producent" ? PRODUCENCI : SPONSORZY_NAZWY;
  if (PULA_BRANZ[typ] && (poziom < 6 || typ === "bukmacher" || typ === "medialny")) pula = PULA_BRANZ[typ]!;
  let n = wybierz(pula); let i = 0;
  while (uzyte.has(n) && i++ < 40) n = wybierz(pula);
  uzyte.add(n); return n;
}
function wartoscSponsora(s: StanGry, typ: SponsorTyp, bonus = 1): number {
  const k = s.kluby[s.mojKlub];
  const baza = SPONSOR_SEZON[k.poziom - 1] * (0.18 + k.renoma * 0.22) * bonus;
  return Math.max(0, Math.round((baza * SPONSOR_UDZIAL[typ]) / 500) * 500);
}

/** Oferty sponsorów danego typu do wyboru (gdy slot wolny/wygasły). */
export function ofertySponsorow(s: StanGry, typ: SponsorTyp): Sponsor[] {
  const uzyte = new Set(s.sponsorzy.map((x) => x.nazwa));
  const k = s.kluby[s.mojKlub];
  return [0, 1, 2].map((i) => ({
    nazwa: nazwaDla(typ, uzyte, k.poziom, k.miasto),
    wartosc: Math.round((wartoscSponsora(s, typ) * (0.8 + i * 0.25)) / 500) * 500,
    typ,
    sezonDo: s.sezon + [1, 2, 3][i],
  }));
}
/** Aktualna (obowiązująca) umowa w danym slocie. */
export function umowaSponsora(s: StanGry, typ: SponsorTyp): Sponsor | undefined {
  return s.sponsorzy.find((x) => x.typ === typ && x.sezonDo >= s.sezon);
}
/** Kara umowna za zerwanie trwającej umowy: 50% wartości wszystkich pozostałych sezonów (wliczając bieżący). 0 = brak umowy. */
export function karaZaZerwanie(s: StanGry, typ: SponsorTyp): number {
  const u = umowaSponsora(s, typ);
  if (!u) return 0;
  const sezonow = u.sezonDo - s.sezon + 1;
  return Math.round((u.wartosc * sezonow * 0.5) / 500) * 500;
}
/** Zrywa umowę (płaci karę). Zwraca komunikat błędu albo null. */
export function zerwijSponsora(s: StanGry, typ: SponsorTyp): string | null {
  const u = umowaSponsora(s, typ);
  if (!u) return "Ten slot nie ma aktywnej umowy.";
  const kara = karaZaZerwanie(s, typ);
  const k = s.kluby[s.mojKlub];
  if (k.kasa < kara) return `Zerwanie umowy z ${u.nazwa} kosztuje ${zl(kara)} kary umownej — brakuje ${zl(kara - k.kasa)}.`;
  k.kasa -= kara;
  s.sponsorzy = s.sponsorzy.filter((x) => x !== u);
  wiadomosc(s, `✂ Zerwano umowę z ${u.nazwa} (${nazwaSponsora(typ).toLowerCase()}) przed terminem — zapłacono ${zl(kara)} kary umownej.`);
  return null;
}
/** Podpisuje sponsora. Jeśli slot ma trwającą umowę — najpierw ją zrywa (kara umowna). Zwraca błąd albo null. */
export function podpiszSponsora(s: StanGry, oferta: Sponsor): string | null {
  const blok = blokadaSlotu(s.kluby[s.mojKlub], oferta.typ);
  if (blok) return `Slot niedostępny: ${blok}.`;
  if (umowaSponsora(s, oferta.typ)) {
    const b = zerwijSponsora(s, oferta.typ);
    if (b) return b;
  }
  s.sponsorzy = s.sponsorzy.filter((x) => x.typ !== oferta.typ).concat(oferta);
  wiadomosc(s, `Podpisano umowę: ${nazwaSponsora(oferta.typ).toLowerCase()} ${oferta.nazwa} (${zl(oferta.wartosc)}/sezon, do ${oferta.sezonDo}).`);
  // Konflikt kibice–klub o tożsamość: komercyjny sponsor tytularny / naming rights stadionu w klubie z tradycją
  // budzi protest twardych fanów („tradycji się nie sprzedaje"). Kasa kontra tożsamość — kompromis kosztuje zaufanie.
  const mk = s.kluby[s.mojKlub];
  const stary = mk.zalozony ? (s.sezon - mk.zalozony) >= 60 : false;
  if ((oferta.typ === "glowny" || oferta.typ === "stadionowy") && mk.poziom <= 5 && stary) {
    let spadek = oferta.typ === "stadionowy" ? 5 : 3;
    if (mk.wlasciciel === "stowarzyszenie") spadek += 3; // klub społeczny — tożsamość święta, protest najmocniejszy
    s.zaufanieKibicow = Math.max(0, (s.zaufanieKibicow ?? 60) - spadek);
    wiadomosc(s, `🪧 Część kibiców protestuje przeciw komercyjnej nazwie „${oferta.nazwa}" — w klubie z tradycją tożsamość ponad pieniądze (zaufanie −${spadek}).`);
  }
  return null;
}
export function producentStrojow(s: StanGry): string | undefined {
  return aktywniSponsorzy(s).find((sp) => sp.typ === "producent")?.nazwa;
}

/** Startowy zestaw: 4 kluczowych + część dodatkowych slotów (reszta do pozyskania z ofert). */
export function sponsorzyStartowi(s: StanGry): Sponsor[] {
  const lista = nowiSponsorzy(s);
  const k = s.kluby[s.mojKlub];
  const uzyte = new Set(lista.map((x) => x.nazwa));
  const ile = k.poziom <= 3 ? 6 : k.poziom <= 6 ? 4 : 2;
  for (const typ of tasuj(ROLE_DODATKOWE.filter((t) => !blokadaSlotu(k, t))).slice(0, ile)) {
    lista.push({ nazwa: nazwaDla(typ, uzyte, k.poziom, k.miasto), wartosc: wartoscSponsora(s, typ), typ, sezonDo: s.sezon + losInt(1, 3) });
  }
  return lista;
}
export function nowiSponsorzy(s: StanGry, bonus = 1): Sponsor[] {
  const uzyte = new Set<string>();
  const k = s.kluby[s.mojKlub];
  return ROLE.map((typ) => {
    // Główny slot na niższych szczeblach bywa lokalnym patronem: płaci ~85%, ale wiąże się na dłużej.
    if (typ === "glowny" && losujPatron(k.poziom)) {
      let n = wybierz(PATRONI(k.miasto)); let i = 0; while (uzyte.has(n) && i++ < 20) n = wybierz(PATRONI(k.miasto)); uzyte.add(n);
      return { nazwa: n, wartosc: Math.round((wartoscSponsora(s, typ, bonus) * 0.85) / 500) * 500, typ, sezonDo: s.sezon + losInt(2, 4), patron: true };
    }
    return { nazwa: nazwaDla(typ, uzyte, k.poziom, k.miasto), wartosc: wartoscSponsora(s, typ, bonus), typ, sezonDo: s.sezon + losInt(1, 3) };
  });
}
export function aktywniSponsorzy(s: StanGry): Sponsor[] {
  return s.sponsorzy.filter((sp) => sp.sezonDo >= s.sezon);
}
export function przychodSponsorow(s: StanGry): number {
  return aktywniSponsorzy(s).reduce((a, x) => a + x.wartosc, 0);
}
export const nazwaSponsora = (typ: SponsorTyp) => SPONSOR_ETYKIETA[typ];

// ——— Stadion: rozbudowa i obiekty ———
const KOSZT_MIEJSCA = [900, 400, 200, 120, 70, 45, 30, 20, 15, 12, 10, 8]; // zł za 1 miejsce wg poziomu
const KOSZT_OBIEKTU = [2_000_000, 500_000, 150_000, 50_000, 20_000, 9_000, 4_000, 2_000, 1_200, 800, 600, 400];
const MAX_OBIEKT = 5;
type TypObiektu = keyof import("./types").Obiekty;
export const OBIEKTY_NAZWY: Record<TypObiektu, string> = {
  parking: "Parking", gastronomia: "Stoiska z jedzeniem", sklep: "Sklep klubowy", toalety: "Sanitariaty",
  kasy: "Kasy i bramki biletowe", strefaKibica: "Strefa kibica (fan zone)", loze: "Loże VIP / skyboxy",
  telebim: "Telebim i bandy LED", zadaszenie: "Zadaszenie trybun", muzeum: "Muzeum klubu", hotel: "Hotel klubowy",
  baza: "Boiska treningowe",
};
export const OBIEKTY_IKONY: Record<TypObiektu, string> = {
  parking: "🅿️", gastronomia: "🌭", sklep: "🛍", toalety: "🚻", kasy: "🎫", strefaKibica: "🎪", loze: "🥂",
  telebim: "📺", zadaszenie: "⛱", muzeum: "🏆", hotel: "🏨", baza: "🥅",
};
/** Co daje obiekt (opis do UI). */
export const OBIEKTY_OPIS: Record<TypObiektu, string> = {
  parking: "przychód z parkowania i +frekwencja (łatwiejszy dojazd)",
  gastronomia: "przychód z jedzenia na każdym meczu; odblokowuje partnera napojowego",
  sklep: "sprzedaż pamiątek i koszulek na meczach",
  toalety: "+frekwencja (komfort kibiców)",
  kasy: "+frekwencja i drobny przychód (sprawne wejście, mniej kolejek)",
  strefaKibica: "przychód z fan zone i +zaufanie kibiców co sezon",
  loze: "więcej miejsc VIP — wyższy przychód z hospitality",
  telebim: "przychód z reklam; odblokowuje sponsora telebimu",
  zadaszenie: "+frekwencja przy złej pogodzie, +renoma",
  muzeum: "przychód z biletów do muzeum, +renoma klubu",
  hotel: "przychód z noclegów kibiców gości i konferencji",
  baza: "szybszy rozwój młodych zawodników (+trening)",
};
/** Mnożnik kosztu wg typu (względem bazowego kosztu obiektu na danym szczeblu). */
const KOSZT_TYPU: Record<TypObiektu, number> = {
  parking: 0.8, gastronomia: 1, sklep: 1, toalety: 0.5, kasy: 0.7, strefaKibica: 1.2, loze: 2, telebim: 1.6,
  zadaszenie: 3, muzeum: 1.5, hotel: 4, baza: 2.5,
};
export const poziomObiektu = (k: Klub, typ: TypObiektu): number => k.obiekty[typ] ?? 0;
/** Wymóg do budowy obiektu (null = można budować). */
export function wymogObiektu(k: Klub, typ: TypObiektu): string | null {
  if (typ === "loze" && k.pojemnosc < 500) return "wymaga stadionu min. 500 miejsc";
  if (typ === "zadaszenie" && k.pojemnosc < 800) return "wymaga stadionu min. 800 miejsc";
  if (typ === "hotel" && k.pojemnosc < 2000) return "wymaga stadionu min. 2000 miejsc";
  if (typ === "muzeum" && k.zalozony && (2026 - k.zalozony) < 20) return "klub musi mieć min. 20 lat historii";
  return null;
}
/** Warianty rozbudowy stadionu: [nazwa, liczba miejsc, mnożnik ceny za miejsce]. */
export function wariantyRozbudowy(s: StanGry): { nazwa: string; miejsca: number; koszt: number }[] {
  const k = s.kluby[s.mojKlub];
  const r50 = (x: number) => Math.max(50, Math.round(x / 50) * 50);
  const cena = KOSZT_MIEJSCA[k.poziom - 1];
  return [
    { nazwa: "Dostawka miejsc", miejsca: r50(Math.max(100, k.pojemnosc * 0.1)), koszt: 0 },
    { nazwa: "Rozbudowa trybuny", miejsca: r50(Math.max(200, k.pojemnosc * 0.2)), koszt: 0 },
    { nazwa: "Nowa trybuna", miejsca: r50(Math.max(500, k.pojemnosc * 0.4)), koszt: 0 },
  ].map((w, i) => ({ ...w, koszt: Math.round((w.miejsca * cena * [1, 0.95, 0.9][i]) / 100) * 100 }));
}

export function miejscaRozbudowy(s: StanGry): number {
  return wariantyRozbudowy(s)[1].miejsca;
}
export function kosztRozbudowy(s: StanGry): number {
  return wariantyRozbudowy(s)[1].koszt;
}
export function rozbudujStadion(s: StanGry, wariant = 1): string | null {
  const k = s.kluby[s.mojKlub];
  const w = wariantyRozbudowy(s)[wariant] ?? wariantyRozbudowy(s)[1];
  if (k.kasa < w.koszt) return `Brakuje ${zl(w.koszt - k.kasa)}.`;
  k.kasa -= w.koszt;
  k.pojemnosc += w.miejsca;
  k.renoma = Math.min(1, k.renoma + (wariant === 2 ? 0.015 : 0.008));
  wiadomosc(s, `🏗 ${w.nazwa}: +${w.miejsca.toLocaleString("pl")} miejsc (teraz ${k.pojemnosc.toLocaleString("pl")}). Koszt ${zl(w.koszt)}.`);
  return null;
}
export function kosztObiektu(s: StanGry, typ: TypObiektu): number {
  const k = s.kluby[s.mojKlub];
  return Math.round((KOSZT_OBIEKTU[k.poziom - 1] * KOSZT_TYPU[typ] * (poziomObiektu(k, typ) + 1)) / 100) * 100;
}

// ——— Akademia młodzieży ———
/** Poziom akademii 1–5 (domyślnie wg renomy, jeśli jeszcze nieustawiony). */
export function poziomAkademii(k: Klub): number {
  return k.akademia ?? Math.max(1, Math.min(5, Math.round(k.renoma * 5) || 1));
}
/** Koszt rozbudowy akademii o 1 poziom (droższy na wyższych poziomach). */
export function kosztAkademii(s: StanGry): number {
  const k = s.kluby[s.mojKlub];
  return (poziomAkademii(k) + 1) * KOSZT_OBIEKTU[k.poziom - 1] * 2;
}
export function rozbudujAkademie(s: StanGry): string | null {
  const k = s.kluby[s.mojKlub];
  if (poziomAkademii(k) >= 5) return "Akademia jest już na najwyższym poziomie (5).";
  const koszt = kosztAkademii(s);
  if (k.kasa < koszt) return `Brakuje ${zl(koszt - k.kasa)}.`;
  k.kasa -= koszt;
  k.akademia = poziomAkademii(k) + 1;
  wiadomosc(s, `Rozbudowano akademię młodzieży do poziomu ${k.akademia}/5. Koszt ${zl(koszt)}. Więcej i lepszych wychowanków w nowym sezonie.`);
  return null;
}
/** Podgląd naboru: ilu wychowanków i do jakiego potencjału akademia może wydać w nowym sezonie. */
export function naborAkademii(s: StanGry): { minIlu: number; maxIlu: number; potencjalDo: number; szansaTalentu: number } {
  const k = s.kluby[s.mojKlub];
  const aN = poziomAkademii(k) / 5;
  const bazowyPot = zakresUmiej(k.poziom)[1];
  return {
    minIlu: 1,
    maxIlu: 1 + 1 + (poziomAkademii(k) >= 4 ? 1 : 0),
    potencjalDo: Math.min(96, Math.round(bazowyPot + aN * 9 + 18)),
    szansaTalentu: Math.round((0.03 + aN * 0.08) * 100),
  };
}
/** Młodzi wychowankowie (U-21) w Twojej kadrze. */
export function wychowankowie(s: StanGry): Zawodnik[] {
  return s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z.wiek <= 21).sort((a, b) => b.potencjal - a.potencjal);
}
export const MAX_POZIOM_OBIEKTU = MAX_OBIEKT;
export function rozbudujObiekt(s: StanGry, typ: TypObiektu): string | null {
  const k = s.kluby[s.mojKlub];
  if (poziomObiektu(k, typ) >= MAX_OBIEKT) return "Osiągnięto maksymalny poziom.";
  const wym = wymogObiektu(k, typ);
  if (wym) return `Nie można budować: ${wym}.`;
  const koszt = kosztObiektu(s, typ);
  if (k.kasa < koszt) return `Brakuje ${zl(koszt - k.kasa)}.`;
  k.kasa -= koszt;
  k.obiekty[typ] = poziomObiektu(k, typ) + 1;
  k.renoma = Math.min(1, k.renoma + (typ === "muzeum" || typ === "zadaszenie" ? 0.01 : 0.005));
  wiadomosc(s, `${OBIEKTY_NAZWY[typ]}: rozbudowa do poziomu ${k.obiekty[typ]}. Koszt ${zl(koszt)}.`);
  return null;
}
// ——— Infrastruktura licencyjna: oświetlenie, monitoring, podgrzewana murawa ———
/** Czy klub ma maszty oświetleniowe (domyślnie zakładane na szczeblach zawodowych). */
export function maOswietlenie(k: Klub): boolean { return k.oswietlenie ?? k.poziom <= 3; }
/** Czy klub ma monitoring stadionu (domyślnie na wyższych szczeblach). */
export function maMonitoring(k: Klub): boolean { return k.monitoring ?? k.poziom <= 2; }
/** Rodzaj murawy (z pola lub pochodna szczebla). */
export function rodzajMurawy(k: Klub): "podgrzewana" | "naturalna" | "sztuczna" {
  return k.murawa ?? (k.poziom <= 2 ? "podgrzewana" : k.poziom <= 4 ? "naturalna" : "sztuczna");
}
/** Koszt inwestycji infrastrukturalnej wg szczebla (droższe niżej? nie — droższe wyżej, bo wymogi ostrzejsze). */
function kosztInfra(k: Klub, mnoznik: number): number {
  const baza = KOSZT_OBIEKTU[Math.min(k.poziom - 1, KOSZT_OBIEKTU.length - 1)];
  return Math.round((baza * mnoznik) / 1000) * 1000;
}
export function kosztOswietlenia(s: StanGry): number { return kosztInfra(s.kluby[s.mojKlub], 1.5); }
export function kosztMonitoringu(s: StanGry): number { return kosztInfra(s.kluby[s.mojKlub], 0.8); }
export function kosztPodgrzewanejMurawy(s: StanGry): number { return kosztInfra(s.kluby[s.mojKlub], 3); }
export function zainstalujOswietlenie(s: StanGry): string | null {
  const k = s.kluby[s.mojKlub];
  if (maOswietlenie(k) && k.oswietlenie) return "Stadion ma już maszty oświetleniowe.";
  const koszt = kosztOswietlenia(s);
  if (k.kasa < koszt) return `Brakuje ${zl(koszt - k.kasa)}.`;
  k.kasa -= koszt; k.oswietlenie = true; k.renoma = Math.min(1, k.renoma + 0.008);
  wiadomosc(s, `💡 Zamontowano maszty oświetleniowe (koszt ${zl(koszt)}) — mecze pod światłami i wymóg licencyjny spełniony.`);
  return null;
}
export function zainstalujMonitoring(s: StanGry): string | null {
  const k = s.kluby[s.mojKlub];
  if (maMonitoring(k) && k.monitoring) return "Stadion ma już monitoring.";
  const koszt = kosztMonitoringu(s);
  if (k.kasa < koszt) return `Brakuje ${zl(koszt - k.kasa)}.`;
  k.kasa -= koszt; k.monitoring = true;
  wiadomosc(s, `📹 Zainstalowano monitoring stadionu (koszt ${zl(koszt)}) — bezpieczeństwo i wymóg licencyjny spełniony.`);
  return null;
}
export function polozPodgrzewanaMurawe(s: StanGry): string | null {
  const k = s.kluby[s.mojKlub];
  if (rodzajMurawy(k) === "podgrzewana") return "Boisko ma już podgrzewaną murawę.";
  const koszt = kosztPodgrzewanejMurawy(s);
  if (k.kasa < koszt) return `Brakuje ${zl(koszt - k.kasa)}.`;
  k.kasa -= koszt; k.murawa = "podgrzewana"; k.renoma = Math.min(1, k.renoma + 0.008);
  wiadomosc(s, `🔥 Położono podgrzewaną murawę (koszt ${zl(koszt)}) — gra przez całą zimę i wymóg licencyjny I ligi spełniony.`);
  return null;
}

/** Przychód z obiektów na mecz u siebie (zł), wg frekwencji. */
export function przychodObiektow(ob: import("./types").Obiekty, widzowie: number): number {
  const p = (t: TypObiektu) => ob[t] ?? 0;
  return Math.round(widzowie * (p("gastronomia") * 1.5 + p("parking") * 1 + p("sklep") * 0.8 + p("kasy") * 0.2
    + p("strefaKibica") * 0.9 + p("telebim") * 0.5 + p("muzeum") * 0.4 + p("hotel") * 0.7));
}
/** Mnożnik frekwencji z komfortu obiektów (parking, sanitariaty, kasy; dach przy złej pogodzie). */
export function mnoznikKomfortu(ob: import("./types").Obiekty, zlaPogoda: boolean): number {
  const p = (t: TypObiektu) => ob[t] ?? 0;
  return 1 + p("parking") * 0.008 + p("toalety") * 0.01 + p("kasy") * 0.008 + (zlaPogoda ? p("zadaszenie") * 0.03 : p("zadaszenie") * 0.005);
}

/** Przychód dnia meczowego: loże/strefa VIP (hospitality) + catering. Zależny od pojemności, rangi i szczebla; na duże mecze pakiety droższe. Niższe ligi (>V) bez strefy VIP. */
export function przychodDniaMeczowego(k: Klub, widzowie: number, duzyMecz: boolean): { vip: number; catering: number; razem: number } {
  const loze = k.poziom <= 5 || (k.obiekty.loze ?? 0) > 0 ? Math.round(k.pojemnosc * (0.004 + (k.obiekty.loze ?? 0) * 0.002)) : 0; // ~0.4% miejsc to loże/skyboxy (realna liczba miejsc VIP)
  const zajete = Math.min(loze, Math.round(loze * (0.5 + k.renoma * 0.5) * (duzyMecz ? 1.25 : 1)));
  const cenaPakietu = [900, 500, 250, 120, 60][k.poziom - 1] ?? 40;
  const vip = zajete * cenaPakietu;
  const catering = Math.round(widzowie * (0.25 + k.renoma * 0.15) * (duzyMecz ? 1.3 : 1)); // gastronomia dnia meczowego (napoje/jedzenie)
  return { vip, catering, razem: vip + catering };
}

// ——— Rynek transferowy (realne zasady) ———

/** Lata do końca kontraktu (0 = wygasły / wolny zawodnik). */
export function latDoKonca(s: StanGry, z: Zawodnik): number {
  if (!z.klubId) return 0;
  return Math.max(0, z.kontraktDo - s.sezon);
}

/** Żądanie płacowe zawodnika w klubie danego poziomu (zł/kolejkę). Lepsi żądają więcej; wiek i forma korygują. */
export function zadaniePlacowe(s: StanGry, z: Zawodnik, poziomDocelowy: number): number {
  const baza = pensjaDla(z.umiej, poziomDocelowy);
  const wiekMn = z.wiek <= 23 ? 0.9 : z.wiek <= 30 ? 1.1 : 0.85;
  const formaMn = 1 + Math.max(0, z.forma) * 0.03;
  const agentMn = z.agent ? 1.12 : 1; // agent wywalcza wyższą pensję
  return Math.max(z.pensja, Math.round((baza * wiekMn * formaMn * agentMn) / 10) * 10);
}

/** Premia za podpis (dla wolnych zawodników i przy przedłużeniu) — kilka pensji. */
export function premiaPodpisu(pensja: number): number {
  return Math.round((pensja * losInt(2, 5)) / 10) * 10;
}

/** Cena transferu: amatorzy i wolni zawodnicy za darmo; im krótszy kontrakt, tym taniej (efekt Bosmana). */
export function cenaKupna(s: StanGry, zawodnikId: string): number {
  const z = s.zawodnicy[zawodnikId];
  if (!z.klubId) return 0; // wolny zawodnik
  if (z.kontraktTyp === "amator") return 0; // amatorzy zmieniają kluby bez kwot
  const lata = latDoKonca(s, z);
  const wsp = lata <= 0 ? 0 : lata === 1 ? 0.35 : lata === 2 ? 0.7 : lata === 3 ? 1.05 : 1.3;
  return Math.round((wartosc(z) * wsp) / 100) * 100;
}

// ——— Okna transferowe ———
export function oknoOtwarte(s: StanGry): boolean {
  return oknoTransferowe(s.sezon, ileKolejek(s), s.kolejka, s.koniecSezonu, s.kluby[s.mojKlub].poziom).otwarte;
}

// Wymogi licencyjne na szczebel (minimalna pojemność stadionu, minimalny poziom akademii).
const LIC_POJEMNOSC = [8000, 4000, 2000, 1000, 500, 200, 0, 0, 0];
const LIC_AKADEMIA = [4, 3, 2, 2, 1, 1, 1, 1, 1];
/** Licencja na grę w lidze (PZPN): przy awansie klub musi spełnić wymogi infrastrukturalne. */
export function sprawdzLicencje(s: StanGry) {
  const k = s.kluby[s.mojKlub];
  const p = k.poziom;
  const nazwa = s.ligi[p - 1]?.nazwa ?? `poziom ${p}`;
  const minPoj = LIC_POJEMNOSC[Math.min(p - 1, 8)];
  if ((k.pojemnosc ?? 0) < minPoj) {
    const koszt = Math.min(Math.max(0, Math.round((minPoj - (k.pojemnosc ?? 0)) * 300 / 100) * 100), Math.max(0, Math.round(k.kasa * 0.6)));
    k.kasa -= koszt;
    k.pojemnosc = minPoj;
    wiadomosc(s, `📋 Licencja na ${nazwa}: stadion musiał spełnić minimum ${minPoj.toLocaleString("pl")} miejsc — zarząd zmodernizował trybuny (koszt ${zl(koszt)}).`);
  }
  const minAk = LIC_AKADEMIA[Math.min(p - 1, 8)];
  if (poziomAkademii(k) < minAk) {
    wiadomosc(s, `📋 Licencja na ${nazwa}: wymagana akademia młodzieżowa min. ${minAk}/5 (masz ${poziomAkademii(k)}/5) — rozbuduj ją, inaczej grożą sankcje licencyjne.`);
  }
  // Infrastruktura: II liga+ wymaga masztów oświetleniowych i monitoringu, I liga+ podgrzewanej murawy.
  // Zarząd modernizuje obiekt, jeśli starcza kasy; inaczej ostrzeżenie o sankcjach licencyjnych.
  const brak: string[] = [];
  const modernizuj = (koszt: number): boolean => {
    const realny = Math.min(koszt, Math.max(0, Math.round(k.kasa * 0.6)));
    if (k.kasa >= koszt) { k.kasa -= koszt; return true; }
    if (realny > 0 && k.kasa - realny >= 0 && realny >= koszt * 0.9) { k.kasa -= realny; return true; }
    return false;
  };
  if (p <= 3 && !maOswietlenie(k)) { if (modernizuj(kosztInfra(k, 1.5))) { k.oswietlenie = true; wiadomosc(s, `📋 Licencja na ${nazwa}: zarząd zamontował maszty oświetleniowe (wymóg szczebla).`); } else { k.oswietlenie = false; brak.push("oświetlenie"); } }
  if (p <= 3 && !maMonitoring(k)) { if (modernizuj(kosztInfra(k, 0.8))) { k.monitoring = true; wiadomosc(s, `📋 Licencja na ${nazwa}: zainstalowano monitoring stadionu (wymóg szczebla).`); } else { k.monitoring = false; brak.push("monitoring"); } }
  if (p <= 2 && rodzajMurawy(k) !== "podgrzewana") { if (modernizuj(kosztInfra(k, 3))) { k.murawa = "podgrzewana"; wiadomosc(s, `📋 Licencja na ${nazwa}: położono podgrzewaną murawę (wymóg szczebla).`); } else brak.push("podgrzewana murawa"); }
  if (brak.length) wiadomosc(s, `⚠️ Licencja na ${nazwa}: brakuje wymogów infrastrukturalnych (${brak.join(", ")}). Dokończ inwestycje w zakładce Stadion, inaczej grożą sankcje PZPN.`);
}

/** Rozwój sztabu (specjaliści rosną z czasem) i awans licencji trenerskiej wg dorobku. Wołane co sezon. */
export function rozwojSztabuILicencji(s: StanGry) {
  const klub = s.kluby[s.mojKlub];
  const sztab = klub?.sztab ?? {};
  for (const rola of Object.keys(sztab) as (keyof typeof sztab)[]) {
    const p = sztab[rola];
    if (p && p.poziom < 5 && szansa(0.22)) {
      p.poziom++;
      wiadomosc(s, `📈 ${p.imie} ${p.nazwisko} (sztab) podniósł kwalifikacje — poziom ${p.poziom}/5.`);
    }
  }
  // Licencja trenerska UEFA wg dorobku (sezony + awanse + mistrzostwa).
  const sezony = s.historia?.length ?? 0;
  const awanse = (s.historia ?? []).filter((h) => h.wynik === "awans" || h.wynik === "mistrz").length;
  const tytuly = (s.historia ?? []).filter((h) => h.wynik === "mistrz").length;
  const pkt = sezony + awanse * 2 + tytuly * 3;
  const docelowa: "C" | "B" | "A" | "PRO" = pkt >= 16 ? "PRO" : pkt >= 9 ? "A" : pkt >= 4 ? "B" : "C";
  const ranga = { C: 0, B: 1, A: 2, PRO: 3 };
  if (ranga[docelowa] > ranga[s.trenerLicencja ?? "C"]) {
    s.trenerLicencja = docelowa;
    wiadomosc(s, `🎓 Zdobyłeś licencję trenerską UEFA ${docelowa}! Rosnące kwalifikacje otwierają drzwi do większych klubów.`);
  }
}

/** Szatnia: przy niskim morale lider ją podrywa; przy wysokim — dobra atmosfera; niezadowolona gwiazda psuje nastroje. */
/** Wynik przywództwa zawodnika (do rady drużyny): przywództwo + doświadczenie + status weterana/wychowanka. */
function wynikLidera(s: StanGry, z: Zawodnik): number {
  return (z.atrybuty?.prz ?? 0) + Math.max(0, z.wiek - 25) * 0.5 + (z.cechy?.includes("weteran") ? 3 : 0) + (z.wychowanek ? 1 : 0) + (z.id === s.kapitan ? 100 : 0);
}
/** Rada drużyny: kapitan + najwięksi liderzy (do 4 osób). Pierwszy wicekapitan/wicekapitanowie = kolejni po kapitanie. */
export function radaDruzyny(s: StanGry, klubId: string): Zawodnik[] {
  const zs = (s.kluby[klubId]?.zawodnicy ?? []).map((id) => s.zawodnicy[id]).filter(Boolean);
  return zs.sort((a, b) => wynikLidera(s, b) - wynikLidera(s, a)).slice(0, Math.min(4, zs.length));
}
/** Wicekapitanowie klubu gracza (rada bez kapitana, maks. 2). */
export function wicekapitanowie(s: StanGry): Zawodnik[] {
  return radaDruzyny(s, s.mojKlub).filter((z) => z.id !== s.kapitan).slice(0, 2);
}

// ——— Wykonawcy stałych fragmentów gry ———
type RodzajSFG = "karne" | "wolne" | "rozne";
/** Ocena przydatności do danego stałego fragmentu (karne: wykończenie; wolne: wykończenie+technika; rożne: podanie+technika). */
function ocenaSFG(z: Zawodnik, rodzaj: RodzajSFG): number {
  const a = z.atrybuty; if (!a) return z.umiej;
  if (rodzaj === "karne") return a.str + (z.cechy?.includes("egzekutor") ? 8 : 0);
  if (rodzaj === "wolne") return a.str * 0.6 + a.dry * 0.5 + a.pod * 0.2;
  return a.pod * 0.6 + a.dry * 0.5; // rożne: dośrodkowania
}
/** Domyślny wykonawca danego stałego fragmentu w klubie (najlepszy wg oceny). Zwraca id albo undefined. */
export function domyslnyWykonawca(s: StanGry, klubId: string, rodzaj: RodzajSFG): string | undefined {
  const zs = (s.kluby[klubId]?.zawodnicy ?? []).map((id) => s.zawodnicy[id]).filter((z) => z && z.poz !== "BR");
  return zs.sort((a, b) => ocenaSFG(b, rodzaj) - ocenaSFG(a, rodzaj))[0]?.id;
}
/** Aktualny wykonawca (wybrany przez gracza albo domyślny) — do UI i silnika. */
export function wykonawca(s: StanGry, rodzaj: RodzajSFG): string | undefined {
  const wyb = s.wykonawcy?.[rodzaj];
  if (wyb && s.kluby[s.mojKlub]?.zawodnicy.includes(wyb)) return wyb;
  return domyslnyWykonawca(s, s.mojKlub, rodzaj);
}
/** Ustawia (lub czyści) wykonawcę stałego fragmentu dla klubu gracza. */
export function ustawWykonawca(s: StanGry, rodzaj: RodzajSFG, id: string | null): void {
  s.wykonawcy = { ...(s.wykonawcy ?? {}), [rodzaj]: id ?? undefined };
}

export function szatnia(s: StanGry) {
  const moj = s.kluby[s.mojKlub];
  const zs = moj.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  if (!zs.length) return;
  const sr = zs.reduce((a, z) => a + z.morale, 0) / zs.length;
  const rada = radaDruzyny(s, moj.id);
  const lider = rada[0];
  // Siła rady (średnie przywództwo) wzmacnia podrywanie szatni: silna rada = większy zastrzyk morale i wyższy próg reakcji.
  const silaRady = rada.length ? rada.reduce((a, z) => a + (z.atrybuty?.prz ?? 0), 0) / rada.length : 0;
  const lift = silaRady >= 75 ? 5 : silaRady >= 60 ? 4 : 3;
  const prog = silaRady >= 70 ? 46 : 42; // doświadczona rada reaguje wcześniej
  if (sr < prog && lider) {
    for (const z of zs) z.morale = Math.min(100, z.morale + lift);
    const wice = rada[1];
    wiadomosc(s, `🗣 Rada drużyny: ${lider.imie} ${lider.nazwisko}${wice ? ` i ${wice.imie} ${wice.nazwisko}` : ""} poderwali zespół — morale w górę (+${lift}).`);
  } else if (sr > 76) {
    wiadomosc(s, "😄 Znakomita atmosfera w szatni — zespół gra jeden za drugiego.");
  }
  const gwiazda = [...zs].filter((z) => z.prosiOTransfer).sort((a, b) => b.umiej - a.umiej)[0];
  if (gwiazda && gwiazda.umiej >= zakresUmiej(moj.poziom)[1] - 4) {
    wiadomosc(s, `⚠ Szatnia: ${gwiazda.imie} ${gwiazda.nazwisko} głośno domaga się odejścia — psuje atmosferę. Porozmawiaj albo rozważ sprzedaż.`);
  }
}

/** Dynamiczne oczekiwania zarządu: po dobrej pierwszej części sezonu zarząd podnosi cel (raz na sezon). */
export function dynamiczneCele(s: StanGry) {
  if (s.celPodniesiony) return;
  const liga = mojaLiga(s);
  const tab = tabelaLigi(s, liga);
  const poz = tab.findIndex((w) => w.klubId === s.mojKlub) + 1;
  if (poz === 0) return;
  const n = tab.length;
  let nowy: string | null = null;
  if (s.cel === "Utrzymanie" && poz <= Math.ceil(n / 2)) nowy = poz <= 3 ? "Awans" : "Górna połowa tabeli";
  else if (s.cel === "Górna połowa tabeli" && poz <= 3) nowy = "Awans";
  if (nowy && nowy !== s.cel) {
    s.cel = nowy; s.celPodniesiony = true;
    wiadomosc(s, `📣 Zarząd podnosi poprzeczkę: nowy cel to „${nowy}" — świetna pierwsza część sezonu (${poz}. miejsce)!`);
  }
}

/** Letni turniej reprezentacji (EURO/MŚ) co 2 lata — Twoi gwiazdorzy jadą: prestiż, zmęczenie, drobne ryzyko. */
export function turniejReprezentacji(s: StanGry) {
  const turniej = s.sezon % 2 === 0;
  const nazwa = turniej ? (s.sezon % 4 === 0 ? "Mistrzostwa Europy" : "Mistrzostwa Świata") : (s.sezon % 4 === 1 ? "eliminacje Mistrzostw Europy" : "eliminacje Mistrzostw Świata");
  const moj = s.kluby[s.mojKlub];
  const powolani: string[] = [];
  for (const id of moj.zawodnicy) {
    const z = s.zawodnicy[id]; if (!z) continue;
    const polak = !z.kraj;
    const jedzie = (polak && z.umiej >= 74) || (!polak && z.umiej >= 77) || (z.wiek <= 23 && z.umiej >= 70);
    if (!jedzie) continue;
    z.reprezentant = polak ? "Polska" : z.kraj!;
    z.morale = Math.min(100, z.morale + (turniej ? 8 : 4));
    z.kondycja = Math.max(55, (z.kondycja || 100) - (turniej ? 15 : 7)); // turniej męczy mocniej niż eliminacje
    if (szansa(turniej ? 0.05 : 0.03)) z.kontuzja = losInt(1, turniej ? 3 : 2);
    powolani.push(`${z.imie} ${z.nazwisko}`);
  }
  if (powolani.length) {
    s.zarzad = Math.min(100, s.zarzad + (turniej ? 2 : 1));
    const sedziaFifa = obsadaMiedzynarodowa({ ranga: "reprezentacja" }).glowny;
    wiadomosc(s, turniej
      ? `🌍 ${nazwa} ${s.sezon} — Wasi zawodnicy reprezentowali kraje (${powolani.join(", ")}). Mecze prowadzili sędziowie FIFA (m.in. ${sedziaFifa}). Prestiż klubu w górę, ale wrócą zmęczeni.`
      : `🌍 ${nazwa} — Wasi reprezentanci grali w eliminacjach (${powolani.join(", ")}). Sędzia FIFA: ${sedziaFifa}. Prestiż dla klubu.`);
  } else if (turniej) {
    wiadomosc(s, `🌍 Trwały ${nazwa} ${s.sezon} — nikt z Waszego klubu nie dostał powołania. Czas wypromować gwiazdę!`);
  }
}

/** Zawodnik Miesiąca: najlepszy dorobek (gole/asysty/czyste konta) Twojej kadry od ostatniego wyboru. */
export function zawodnikMiesiaca(s: StanGry) {
  const moj = s.kluby[s.mojKlub];
  const score = (z: Zawodnik) => z.gole * 2 + z.asysty + z.czysteKonta * 1.5;
  const snap = s.miesiacSnapshot ?? {};
  let best: Zawodnik | null = null, bestD = -1;
  for (const id of moj.zawodnicy) { const z = s.zawodnicy[id]; if (!z) continue; const d = score(z) - (snap[id] ?? 0); if (d > bestD) { bestD = d; best = z; } }
  const nowy: Record<string, number> = {};
  for (const id of moj.zawodnicy) if (s.zawodnicy[id]) nowy[id] = score(s.zawodnicy[id]);
  s.miesiacSnapshot = nowy;
  if (best && bestD >= 1) {
    best.morale = Math.min(100, best.morale + 4);
    wiadomosc(s, `⭐ Zawodnik miesiąca: ${best.imie} ${best.nazwisko} (${best.poz}) — forma nie do zatrzymania!`);
  }
}

/** Przerwa na kadrę: powołania Twoich najlepszych/młodych do reprezentacji (prestiż + zmęczenie, ryzyko urazu). */
export function powolaniaReprezentacji(s: StanGry) {
  const moj = s.kluby[s.mojKlub];
  const powolani: string[] = [];
  for (const id of moj.zawodnicy) {
    const z = s.zawodnicy[id];
    if (z.kontuzja > 0) continue;
    const polak = !z.kraj;
    let kadra: string | null = null;
    if (polak && z.umiej >= 74) kadra = "Polska";
    else if (polak && z.wiek <= 21 && z.umiej >= 64) kadra = "Polska U-21";
    else if (!polak && z.umiej >= 76) kadra = z.kraj!;
    else if (!polak && z.wiek <= 21 && z.umiej >= 66) kadra = `${z.kraj} U-21`;
    if (!kadra) continue;
    z.reprezentant = kadra;
    z.morale = Math.min(100, z.morale + 6);
    z.kondycja = Math.max(40, z.kondycja - 8);
    if (szansa(0.04)) { z.kontuzja = losInt(1, 2); powolani.push(`${z.imie} ${z.nazwisko} (${kadra}, wrócił z urazem)`); }
    else powolani.push(`${z.imie} ${z.nazwisko} (${kadra})`);
  }
  if (powolani.length) {
    s.zarzad = Math.min(100, s.zarzad + 1);
    wiadomosc(s, `🏟 Przerwa na kadrę — powołania: ${powolani.join(", ")}. Prestiż dla klubu, ale wrócą zmęczeni.`);
  }
}
/** Pełna informacja o oknie transferowym dla klubu gracza (do UI). */
export function oknoInfo(s: StanGry): InfoOkna {
  return oknoTransferowe(s.sezon, ileKolejek(s), s.kolejka, s.koniecSezonu, s.kluby[s.mojKlub].poziom);
}

/** Nazwa aktywnego okna transferowego (do UI): „letnie" / „zimowe" / null. */
export function oknoNazwa(s: StanGry): "letnie" | "zimowe" | null {
  return oknoInfo(s).nazwa;
}

export function statusOkna(s: StanGry): string {
  const info = oknoInfo(s);
  const szczebel = info.zawodowe ? "liga zawodowa" : "liga amatorska";
  if (!info.nazwa) return `Okno transferowe zamknięte · ${szczebel} (${info.zakres})`;
  return `🟢 Okno ${info.nazwa} otwarte · ${szczebel} (${info.zakres})`;
}

export function rynek(s: StanGry) {
  const moj = s.kluby[s.mojKlub];
  const zKlubow = Object.values(s.kluby)
    .filter((k) => k.id !== moj.id && Math.abs(k.poziom - moj.poziom) <= 1)
    .flatMap((k) => k.zawodnicy)
    .map((id) => s.zawodnicy[id])
    .filter((z) => !z.macierzysty); // na wypożyczeniu — nie do kupienia
  const wolni = s.wolni.map((id) => s.zawodnicy[id]).filter(Boolean);
  return { wolni, zKlubow };
}

// ——— Wypożyczenia ———
/** Opłata za wypożyczenie zawodnika (zł) — tanio, zależnie od wartości; amatorzy za darmo. */
export function oplataWypozyczenia(s: StanGry, z: Zawodnik): number {
  if (z.kontraktTyp === "amator") return 0;
  return Math.round((wartosc(z) * 0.1) / 100) * 100;
}

/** Zawodnicy do wypożyczenia od innych klubów (młodzi/rezerwowi, nie kluczowi). */
export function rynekWypozyczen(s: StanGry): Zawodnik[] {
  const moj = s.kluby[s.mojKlub];
  return Object.values(s.kluby)
    .filter((k) => k.id !== moj.id && k.poziom <= moj.poziom + 1 && k.zawodnicy.length > 16)
    .flatMap((k) => k.zawodnicy.map((id) => s.zawodnicy[id]))
    .filter((z) => !z.macierzysty && (z.wiek <= 23 || z.umiej < silaKlubu(s, z.klubId!) - 3))
    .sort((a, b) => b.potencjal - a.potencjal)
    .slice(0, 40);
}

/** Ile procent pensji pokrywa klub macierzysty przy wypożyczeniu wyższa→niższa liga (różnica poziomów). */
function doplataProc(poziomMacierzysty: number, poziomDocelowy: number): number {
  const roznica = poziomDocelowy - poziomMacierzysty; // >0 = cel w niższej lidze (biedniejszy)
  if (roznica <= 0) return 0;
  return Math.min(0.75, 0.35 + roznica * 0.2); // im większa przepaść, tym więcej dopłaca bogatszy
}

/** Wypożyczenie zawodnika z innego klubu do siebie (na jeden sezon). Wyższa liga może dopłacać do pensji. */
export function wypozyczDoSiebie(s: StanGry, zawodnikId: string): string | null {
  const z = s.zawodnicy[zawodnikId];
  const moj = s.kluby[s.mojKlub];
  if (!oknoOtwarte(s)) return "Okno transferowe jest zamknięte.";
  if (moj.zawodnicy.length >= 26) return "Kadra jest pełna (max 26).";
  if (!z.klubId || z.klubId === moj.id) return "Nie możesz wypożyczyć tego zawodnika.";
  if (z.macierzysty) return `${z.nazwisko} jest już na wypożyczeniu.`;
  const parent = s.kluby[z.klubId];
  if (parent.zawodnicy.length <= 16) return `${parent.nazwa} nie wypożyczy — ma za małą kadrę.`;
  if (moj.poziom + 1 < parent.poziom) return `${z.imie} ${z.nazwisko} gra za wysoko, żeby zejść do Was na wypożyczenie.`;
  // Z wyższej ligi (ogranie młodego) zwykle bez opłaty; z równej/niższej — mała opłata.
  const oplata = parent.poziom < moj.poziom ? 0 : oplataWypozyczenia(s, z);
  if (moj.kasa < oplata) return `Brakuje na opłatę za wypożyczenie (${zl(oplata)}).`;
  // Gdy Ty (biedniejszy) bierzesz z wyższej ligi — klub macierzysty dopłaca część pensji.
  const proc = doplataProc(parent.poziom, moj.poziom);
  z.pensjaPelna = z.pensja;
  z.doplataMacierzystego = Math.round((z.pensja * proc) / 10) * 10;
  z.pensja = Math.max(0, z.pensja - z.doplataMacierzystego); // płacisz tylko swoją część
  moj.kasa -= oplata;
  z.macierzysty = parent.id;
  z.wypozyczenieDo = s.sezon;
  parent.zawodnicy = parent.zawodnicy.filter((x) => x !== z.id);
  z.klubId = moj.id;
  moj.zawodnicy.push(z.id);
  przejscieDoKlubu(s, z, moj.nazwa);
  { const uzyte = new Set(moj.zawodnicy.map((x) => s.zawodnicy[x].numer)); let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n; }
  const dop = z.doplataMacierzystego ? `, ${parent.nazwa} dopłaca ${zl(z.doplataMacierzystego)}/kol. do pensji` : "";
  wiadomosc(s, `Wypożyczono ${z.imie} ${z.nazwisko} z ${parent.nazwa} do końca sezonu${oplata ? ` (opłata ${zl(oplata)})` : ""}${dop}.`);
  return null;
}

/** Wypożyczenie swojego zawodnika do mniejszego klubu (ogranie, rozwój). Dopłacasz część pensji, gdy biedniejszego nie stać. */
export function wypozyczNaZewnatrz(s: StanGry, zawodnikId: string): string | null {
  const z = s.zawodnicy[zawodnikId];
  const moj = s.kluby[s.mojKlub];
  if (!oknoOtwarte(s)) return "Okno transferowe jest zamknięte.";
  if (z.klubId !== moj.id) return "To nie jest Twój zawodnik.";
  if (z.macierzysty) return "Tego zawodnika sam masz na wypożyczeniu — nie możesz go podnająć.";
  if (moj.zawodnicy.length <= 15) return "Za mała kadra, żeby wypożyczać (min 15).";
  // Klub docelowy: najchętniej mniejszy (niższa liga), z miejscem w kadrze.
  const kandydaci = Object.values(s.kluby).filter((k) => !k.pozaLiga && !k.pozaPiramida && k.id !== moj.id && k.zawodnicy.length < 24);
  const cel = kandydaci.filter((k) => k.poziom > moj.poziom).sort((a, b) => a.poziom - b.poziom)[0]
    ?? kandydaci.filter((k) => k.poziom >= moj.poziom).sort((a, b) => a.poziom - b.poziom)[0]
    ?? kandydaci[0];
  if (!cel) return "Żaden klub nie szuka teraz wypożyczenia.";
  // Dopłata: gdy wypożyczasz do niższej (biedniejszej) ligi, pokrywasz część pensji.
  const proc = doplataProc(moj.poziom, cel.poziom);
  z.pensjaPelna = z.pensja;
  z.doplataMacierzystego = Math.round((z.pensja * proc) / 10) * 10;
  z.pensja = Math.max(0, z.pensja - z.doplataMacierzystego); // tyle płaci klub goszczący
  z.macierzysty = moj.id;
  z.wypozyczenieDo = s.sezon;
  moj.zawodnicy = moj.zawodnicy.filter((x) => x !== z.id);
  s.taktyka.sklad = s.taktyka.sklad.filter((x) => x !== z.id);
  if (s.kapitan === z.id) s.kapitan = null;
  z.klubId = cel.id;
  cel.zawodnicy.push(z.id);
  const dop = z.doplataMacierzystego ? ` (dopłacasz ${zl(z.doplataMacierzystego)}/kol. do pensji)` : "";
  wiadomosc(s, `${z.imie} ${z.nazwisko} wypożyczony do ${cel.nazwa}${cel.poziom > moj.poziom ? " (niższa liga)" : ""} na sezon${dop} — będzie grał i się rozwijał.`);
  return null;
}

/** Powrót jednego zawodnika z wypożyczenia do klubu macierzystego (przywraca pensję, numer, rozwój). */
function wrocZWypozyczenia(s: StanGry, z: Zawodnik) {
  const dom = z.macierzysty ? s.kluby[z.macierzysty] : undefined;
  if (z.klubId && s.kluby[z.klubId]) s.kluby[z.klubId].zawodnicy = s.kluby[z.klubId].zawodnicy.filter((x) => x !== z.id);
  if (z.wiek <= 23 && z.umiej < z.potencjal) z.umiej = Math.min(z.potencjal, z.umiej + los(0.5, 1.5)); // ogranie
  const wrocDo = dom ?? s.kluby[s.mojKlub];
  if (z.pensjaPelna != null) z.pensja = z.pensjaPelna; // przywróć pełną pensję
  z.pensjaPelna = undefined;
  z.doplataMacierzystego = undefined;
  z.klubId = wrocDo.id;
  // Wypożyczony junior wraca do akademii, jeśli dalej jest w wieku U-19.
  if (z.juniorMacierzysty && wrocDo.id === s.mojKlub && z.wiek <= 19) {
    z.juniorMacierzysty = undefined;
    z.macierzysty = undefined; z.wypozyczenieDo = undefined;
    wrocDo.juniorzy = wrocDo.juniorzy ?? [];
    if (!wrocDo.juniorzy.includes(z.id)) wrocDo.juniorzy.push(z.id);
    return;
  }
  z.juniorMacierzysty = undefined;
  if (!wrocDo.zawodnicy.includes(z.id)) wrocDo.zawodnicy.push(z.id);
  z.macierzysty = undefined;
  z.wypozyczenieDo = undefined;
  const uzyte = new Set(wrocDo.zawodnicy.map((x) => s.zawodnicy[x].numer).filter((n) => n > 0));
  let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n;
  if (wrocDo.id === s.mojKlub) przejscieDoKlubu(s, z, wrocDo.nazwa);
}

/** Powroty z wypożyczeń po sezonie (do klubu macierzystego). */
function zakonczWypozyczenia(s: StanGry) {
  for (const z of Object.values(s.zawodnicy)) {
    if (z.macierzysty == null || z.wypozyczenieDo == null || s.sezon <= z.wypozyczenieDo) continue;
    const moj = z.macierzysty === s.mojKlub;
    if (z.wykup?.obowiazek && z.klubId === s.mojKlub) { const b = wykupZWypozyczenia(s, z.id); if (!b) continue; wiadomosc(s, `⚠ Obowiązkowy wykup ${z.imie} ${z.nazwisko} nieudany: ${b}`); }
    if (z.wykup && z.klubId === s.mojKlub) { wiadomosc(s, `🔁 Nie skorzystałeś z opcji wykupu ${z.imie} ${z.nazwisko} — wraca do klubu macierzystego.`); z.wykup = undefined; }
    wrocZWypozyczenia(s, z);
    if (moj) wiadomosc(s, `${z.imie} ${z.nazwisko} wrócił z wypożyczenia.`);
  }
}

/** Natychmiastowy powrót z wypożyczenia (odwołanie swojego gracza albo oddanie wcześniej wypożyczonego). */
export function zakonczWypozyczenieTeraz(s: StanGry, zawodnikId: string): string | null {
  const z = s.zawodnicy[zawodnikId];
  if (z.macierzysty == null) return "Ten zawodnik nie jest na wypożyczeniu.";
  const moje = z.macierzysty === s.mojKlub; // Ty go wypożyczyłeś na zewnątrz
  const uCiebie = z.klubId === s.mojKlub && z.macierzysty !== s.mojKlub; // masz go u siebie na wypożyczeniu
  if (!moje && !uCiebie) return "To nie jest Twoje wypożyczenie.";
  if (moje && s.kluby[s.mojKlub].zawodnicy.length >= 26) return "Kadra jest pełna (max 26) — zrób miejsce przed powrotem.";
  const docelowy = moje ? s.kluby[s.mojKlub].nazwa : (z.macierzysty ? s.kluby[z.macierzysty].nazwa : "klub macierzysty");
  wrocZWypozyczenia(s, z);
  wiadomosc(s, moje
    ? `${z.imie} ${z.nazwisko} odwołany z wypożyczenia i wraca do Was.`
    : `${z.imie} ${z.nazwisko} wraca wcześniej do ${docelowy} — zakończyłeś wypożyczenie.`);
  return null;
}

/** FFP: roczne płace vs roczne przychody (sponsor + TV). Zwraca { place, przychod, ratio, przekroczony }. */
export function ffpStan(s: StanGry) {
  const k = s.kluby[s.mojKlub];
  const kolejek = s.ligi[k.poziom - 1].terminarz.length;
  const place = k.zawodnicy.reduce((a, id) => a + (s.zawodnicy[id]?.pensja ?? 0), 0) * kolejek;
  const przychod = SPONSOR_SEZON[k.poziom - 1] * (0.7 + k.renoma * 0.6) + (PRAWA_TV[k.poziom - 1] ?? 0);
  const ratio = przychod > 0 ? place / przychod : 99;
  return { place, przychod, ratio, przekroczony: ratio > 1.3 };
}
// ——— ROZBUDOWANE NEGOCJACJE TRANSFEROWE ———
/** Oferta transferowa gracza: kwota + struktura płatności + warunki osobiste zawodnika. */
export interface OfertaTransferu {
  kwota: number;            // proponowana kwota transferu do klubu
  ratySezony?: number;      // rozłożenie kwoty na N sezonów (1 lub brak = całość od razu)
  odsprzedazProc?: number;  // klauzula odsprzedaży dla klubu sprzedającego (% z przyszłego transferu)
  pensja: number;           // oferowana pensja zł/kolejkę
  premia?: number;          // premia za podpis
  lata: number;             // długość kontraktu (sezony)
  klauzula?: number;        // klauzula wykupu wpisana w nowy kontrakt (0/brak = bez)
}
export interface WynikNegocjacji {
  ok: boolean;
  etap?: "okno" | "kadra" | "ffp" | "klub" | "zawodnik" | "budzet";
  powod?: string;
  kontraKlub?: number;       // kontroferta klubu sprzedającego (kwota)
  oczekiwaniaPensja?: number; // pensja, której żąda zawodnik
}

/** Cena wywoławcza klubu sprzedającego (wyższa od rynkowej dla ważnych graczy). */
export function cenaWywolawcza(s: StanGry, zawodnikId: string): number {
  const z = s.zawodnicy[zawodnikId];
  const baza = cenaKupna(s, zawodnikId);
  if (!z.klubId || baza <= 0) return baza;
  const stary = s.kluby[z.klubId];
  const wazny = z.umiej >= silaKlubu(s, stary.id) - 2 && latDoKonca(s, z) >= 2;
  const mnoznik = wazny ? 1.35 : 1.12;
  return Math.round((baza * mnoznik) / 100) * 100;
}

/** Jak sprzedający wycenia ofertę (raty = lekka zniżka w odbiorze, klauzula odsprzedaży = doliczony potencjał). */
function wartoscOfertyDlaKlubu(s: StanGry, z: Zawodnik, o: OfertaTransferu): number {
  const raty = Math.max(1, o.ratySezony ?? 1);
  const dyskonto = 1 - 0.035 * (raty - 1); // im dłużej na raty, tym mniej atrakcyjne „na teraz"
  const sellon = (o.odsprzedazProc ?? 0) > 0 ? (o.odsprzedazProc! / 100) * wartosc(z) * 0.45 : 0;
  return Math.round(o.kwota * dyskonto + sellon);
}

/**
 * Pełna negocjacja transferu zawodnika. Dwa etapy: klub (kwota/struktura) i zawodnik (warunki).
 * Zwraca wynik: ok=true → transfer sfinalizowany; inaczej powód + ewentualna kontroferta/żądanie pensji.
 */
export function negocjujTransfer(s: StanGry, zawodnikId: string, o: OfertaTransferu): WynikNegocjacji {
  const z = s.zawodnicy[zawodnikId];
  const moj = s.kluby[s.mojKlub];
  if (!oknoOtwarte(s)) return { ok: false, etap: "okno", powod: "Okno transferowe jest zamknięte." };
  if (moj.zawodnicy.length >= 26) return { ok: false, etap: "kadra", powod: "Kadra jest pełna (max 26)." };
  if (ffpStan(s).przekroczony) return { ok: false, etap: "ffp", powod: "⚖️ Finansowe fair play: najpierw zredukuj płace / sprzedaj." };
  const wolny = !z.klubId;
  const raty = Math.max(1, Math.min(4, o.ratySezony ?? 1));

  // ——— Etap 1: klub sprzedający (tylko gdy zawodnik ma klub i nie jest amatorem) ———
  if (z.klubId && z.kontraktTyp !== "amator") {
    const stary = s.kluby[z.klubId];
    if (stary.zawodnicy.length <= 16) return { ok: false, etap: "klub", powod: `${stary.nazwa} nie sprzeda — ma za małą kadrę.` };
    const asking = cenaWywolawcza(s, zawodnikId);
    const eff = wartoscOfertyDlaKlubu(s, z, o);
    const wazny = z.umiej >= silaKlubu(s, stary.id) - 2 && latDoKonca(s, z) >= 2;
    if (eff >= asking) {
      /* przyjęte */
    } else if (eff >= asking * (wazny ? 0.9 : 0.8)) {
      const kontra = Math.round(((asking + eff) / 2) / 100) * 100;
      return { ok: false, etap: "klub", powod: `${stary.nazwa} odrzuca, ale negocjuje. Kontroferta: ${zl(kontra)}.`, kontraKlub: kontra };
    } else {
      return { ok: false, etap: "klub", powod: `${stary.nazwa} odrzuca ofertę — zbyt niska (oczekują ~${zl(asking)}).`, kontraKlub: asking };
    }
  }

  // ——— Etap 2: zawodnik (chęć gry + warunki płacowe) ———
  const poziomZaw = z.klubId ? s.kluby[z.klubId].poziom : moj.poziom + 1;
  if (!wolny && moj.poziom - poziomZaw > 1) return { ok: false, etap: "zawodnik", powod: `${z.imie} ${z.nazwisko} nie zejdzie aż tak nisko.` };
  if (moj.poziom > poziomZaw && z.umiej > zakresUmiej(moj.poziom)[1] && !szansa(0.3)) return { ok: false, etap: "zawodnik", powod: `${z.imie} ${z.nazwisko} chce grać wyżej — nie podpisze teraz.` };
  const zada = zadaniePlacowe(s, z, moj.poziom);
  const bonusKlauzula = (o.klauzula ?? 0) > 0 ? 0.95 : 1; // wpisana klauzula = zawodnik akceptuje nieco niższą pensję
  if (o.pensja < zada * 0.97 * bonusKlauzula) return { ok: false, etap: "zawodnik", powod: `${z.imie} ${z.nazwisko} oczekuje ~${zl(zada)}/kolejkę.`, oczekiwaniaPensja: zada };

  // ——— Budżet ———
  const dlug = Math.max(1, o.lata);
  const prowizja = z.agent ? prowizjaAgenta(o.pensja, dlug) : 0;
  const premia = wolny ? (o.premia ?? premiaPodpisu(o.pensja)) : (o.premia ?? 0);
  const terazKwota = z.klubId && z.kontraktTyp !== "amator" ? Math.ceil(o.kwota / raty / 100) * 100 : 0;
  const terazRazem = terazKwota + premia + prowizja;
  if (moj.kasa < terazRazem) return { ok: false, etap: "budzet", powod: `Nie stać Cię teraz. Potrzeba ${zl(terazRazem)}${raty > 1 ? ` (1. rata z ${raty})` : ""}.` };
  if (bilansKolejki(s, o.pensja).bilans < -SPONSOR_SEZON[moj.poziom - 1] * 0.05) return { ok: false, etap: "budzet", powod: `Ta pensja (${zl(o.pensja)}/kolejkę) rozwali budżet.` };

  // ——— Finalizacja ———
  if (z.klubId && z.kontraktTyp !== "amator") {
    const stary = s.kluby[z.klubId];
    stary.zawodnicy = stary.zawodnicy.filter((x) => x !== z.id);
    stary.kasa += o.kwota; // sprzedający dostaje całość od razu (resztę rat finansuje nabywca w kolejnych sezonach)
    if ((o.odsprzedazProc ?? 0) > 0) z.odsprzedaz = { klubId: stary.id, proc: Math.min(50, o.odsprzedazProc!) };
    if (raty > 1) {
      const reszta = o.kwota - terazKwota;
      const perSezon = Math.round(reszta / (raty - 1) / 100) * 100;
      moj.raty = [...(moj.raty ?? []), { kwota: perSezon, sezonow: raty - 1 }];
    }
  } else if (wolny) {
    s.wolni = s.wolni.filter((x) => x !== z.id);
  }
  moj.kasa -= terazRazem;
  z.klubId = moj.id;
  z.pensja = o.pensja;
  z.kontraktTyp = kontraktTyp(moj.poziom);
  z.kontraktDo = s.sezon + dlug;
  if ((o.klauzula ?? 0) > 0) z.klauzula = o.klauzula; else delete z.klauzula;
  if (!z.agent && maAgenta(moj.poziom)) z.agent = losujAgenta(moj.poziom);
  moj.zawodnicy.push(z.id);
  przejscieDoKlubu(s, z, moj.nazwa);
  { const uzyte = new Set(moj.zawodnicy.map((x) => s.zawodnicy[x].numer)); let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n; }
  const czScheme = wolny ? `wolny transfer${premia ? `, premia ${zl(premia)}` : ""}` : raty > 1 ? `${zl(o.kwota)} w ${raty} ratach` : `za ${zl(o.kwota)}`;
  const dod = [(o.odsprzedazProc ?? 0) > 0 ? `odsprzedaż ${o.odsprzedazProc}%` : "", (o.klauzula ?? 0) > 0 ? `klauzula ${zl(o.klauzula!)}` : ""].filter(Boolean).join(", ");
  wiadomosc(s, `✍️ Transfer dobity: ${z.imie} ${z.nazwisko} (${z.poz}) — ${czScheme}, pensja ${zl(o.pensja)}/kol., umowa do ${z.kontraktDo}${dod ? ` (${dod})` : ""}${prowizja ? `, prowizja agenta ${zl(prowizja)}` : ""}.`);
  return { ok: true };
}

/** Rozlicza zaległe raty transferowe klubów (co sezon). Klub gracza dostaje komunikat. */
export function rozliczRaty(s: StanGry) {
  for (const k of Object.values(s.kluby)) {
    if (!k.raty?.length) continue;
    let suma = 0;
    for (const r of k.raty) { k.kasa -= r.kwota; suma += r.kwota; r.sezonow--; }
    k.raty = k.raty.filter((r) => r.sezonow > 0);
    if (k.id === s.mojKlub && suma > 0) wiadomosc(s, `💳 Zapłacono raty transferowe: ${zl(suma)}${k.raty.length ? ` (pozostało rat: ${k.raty.length})` : " — spłacone w całości"}.`);
  }
}

/** Wypłaca klauzulę odsprzedaży przy sprzedaży zawodnika: beneficjent dostaje %, sprzedający resztę. Zwraca wypłatę. */
export function wyplacOdsprzedaz(s: StanGry, z: Zawodnik, cena: number, sprzedajacyId: string): number {
  if (!z.odsprzedaz || cena <= 0) return 0;
  const benef = s.kluby[z.odsprzedaz.klubId];
  const payout = Math.round((cena * z.odsprzedaz.proc) / 100 / 100) * 100;
  if (benef && benef.id !== sprzedajacyId && payout > 0) {
    benef.kasa += payout;
    const sprz = s.kluby[sprzedajacyId];
    if (sprz) sprz.kasa -= payout;
    if (sprzedajacyId === s.mojKlub) wiadomosc(s, `📄 Klauzula odsprzedaży: ${zl(payout)} (${z.odsprzedaz.proc}%) trafia do ${benef.nazwa} z transferu ${z.imie} ${z.nazwisko}.`);
  }
  delete z.odsprzedaz; // jednorazowa — dotyczy najbliższej sprzedaży
  return payout;
}

/** Sugerowana kwota wywoławcza przy wystawianiu własnego zawodnika na sprzedaż (≈ wartość rynkowa). */
export function sugerowanaCenaSprzedazy(s: StanGry, zawodnikId: string): number {
  const z = s.zawodnicy[zawodnikId];
  const w = wartosc(z);
  return w >= 20000 ? Math.round(w / 10000) * 10000 : Math.max(200, Math.round(w / 100) * 100);
}

/** Wystaw swojego zawodnika na rynek transferowy z ceną wywoławczą — inne kluby częściej złożą ofertę. */
export function wystawNaSprzedaz(s: StanGry, zawodnikId: string, kwota: number): string | null {
  const z = s.zawodnicy[zawodnikId];
  const moj = s.kluby[s.mojKlub];
  if (!z || z.klubId !== moj.id) return "To nie jest zawodnik Twojego klubu.";
  if (z.macierzysty) return "Zawodnik jest u Was na wypożyczeniu — nie możesz go sprzedać.";
  if (z.kontraktTyp === "amator") return "Amatora nie sprzedasz za kwotę (umowa amatorska). Po awansie na szczebel półprofesjonalny (IV liga) dostanie kontrakt półprofesjonalny i wtedy można go sprzedać.";
  if (!(kwota > 0)) return "Podaj kwotę wywoławczą większą od zera.";
  z.wystawiony = Math.round(kwota / 100) * 100;
  wiadomosc(s, `🏷 Wystawiono ${z.imie} ${z.nazwisko} na sprzedaż — cena wywoławcza ${zl(z.wystawiony)}.`);
  return null;
}

/** Zdejmij zawodnika z rynku transferowego. */
export function zdejmijZeSprzedazy(s: StanGry, zawodnikId: string): string | null {
  const z = s.zawodnicy[zawodnikId];
  if (!z) return "Nie ma takiego zawodnika.";
  delete z.wystawiony;
  return null;
}

export function kup(s: StanGry, zawodnikId: string): string | null {
  const z = s.zawodnicy[zawodnikId];
  const moj = s.kluby[s.mojKlub];
  const wolny = !z.klubId;
  // PZPN: wolnego zawodnika (bez klubu) wolno zarejestrować także POZA oknem — na każdym szczeblu.
  // Kupno z innego klubu — wyłącznie w otwartym oknie transferowym.
  if (!wolny && !oknoOtwarte(s))
    return "Okno zamknięte — z innego klubu kupisz tylko w oknie. Wolnych zawodników (bez klubu) możesz podpisać też poza oknem.";
  if (ffpStan(s).przekroczony) return "⚖️ Finansowe fair play: płace przekraczają przychody. Najpierw zredukuj pensje / sprzedaj, zanim dokupisz.";
  if (moj.zawodnicy.length >= 26) return "Kadra jest pełna (max 26).";
  const cena = cenaKupna(s, zawodnikId);
  const pensja = zadaniePlacowe(s, z, moj.poziom);
  const pozaOknem = wolny && !oknoOtwarte(s);
  const premia = wolny ? premiaPodpisu(pensja) : 0;
  const dlug = dlugoscKontraktu(moj.poziom, false, z.wiek);
  const prowizja = z.agent ? prowizjaAgenta(pensja, dlug) : 0;
  if (moj.kasa < cena + premia + prowizja) return `Nie stać Cię. Potrzeba ${zl(cena + premia + prowizja)}${prowizja ? ` (w tym prowizja agenta ${zl(prowizja)})` : premia ? " (z premią za podpis)" : ""}.`;
  if (bilansKolejki(s, pensja).bilans < -SPONSOR_SEZON[moj.poziom - 1] * 0.05)
    return `Ta pensja (${zl(pensja)}/kolejkę) rozwali budżet. Najpierw zwiększ wpływy albo sprzedaj kogoś.`;

  // Chęć zawodnika: nie spadnie o >1 poziom (chyba że wolny i desperat); gwiazda nie idzie do dużo słabszego.
  const poziomZaw = z.klubId ? s.kluby[z.klubId].poziom : moj.poziom + 1;
  if (!wolny && moj.poziom - poziomZaw > 1) return `${z.imie} ${z.nazwisko} nie zejdzie aż tak nisko.`;
  if (moj.poziom > poziomZaw && z.umiej > zakresUmiej(moj.poziom)[1] && !szansa(0.3))
    return `${z.imie} ${z.nazwisko} chce grać wyżej — nie podpisze z Wami teraz.`;

  if (z.klubId) {
    const stary = s.kluby[z.klubId];
    if (stary.zawodnicy.length <= 16) return `${stary.nazwa} nie sprzeda — ma za małą kadrę.`;
    // Klub broni ważnego gracza z długim kontraktem, chyba że oferta sowita.
    const wazny = z.umiej >= silaKlubu(s, stary.id) - 2 && latDoKonca(s, z) >= 2;
    if (wazny && !szansa(0.25)) return `${stary.nazwa} nie chce sprzedać ${z.nazwisko} — to ważny zawodnik.`;
    stary.zawodnicy = stary.zawodnicy.filter((x) => x !== z.id);
    stary.kasa += cena;
  } else {
    s.wolni = s.wolni.filter((x) => x !== z.id);
  }
  moj.kasa -= cena + premia + prowizja;
  z.klubId = moj.id;
  z.pensja = pensja;
  z.kontraktTyp = kontraktTyp(moj.poziom);
  z.kontraktDo = s.sezon + dlug;
  if (!z.agent && maAgenta(moj.poziom)) z.agent = losujAgenta(moj.poziom); // u zawodowców pojawia się agent
  moj.zawodnicy.push(z.id);
  przejscieDoKlubu(s, z, moj.nazwa);
  { const uzyte = new Set(moj.zawodnicy.map((x) => s.zawodnicy[x].numer)); let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n; }
  const jak = wolny ? `wolny transfer${pozaOknem ? " (poza oknem — dozwolone dla wolnych zawodników)" : ""}${premia ? `, premia za podpis ${zl(premia)}` : ""}` : `za ${zl(cena)}`;
  wiadomosc(s, `Podpisano ${z.imie} ${z.nazwisko} (${z.poz}, ${NAZWA_KONTRAKTU[z.kontraktTyp]}, do ${z.kontraktDo}) — ${jak}, pensja ${zl(pensja)}/kolejkę${prowizja ? `, prowizja agenta ${zl(prowizja)}` : ""}.`);
  return null;
}

/** Wykup przez KLAUZULĘ: płacisz klauzulę do klubu (ten nie może zablokować), potem zawodnik decyduje o przenosinach. */
export function wykupKlauzula(s: StanGry, zawodnikId: string): string | null {
  const z = s.zawodnicy[zawodnikId];
  const moj = s.kluby[s.mojKlub];
  if (!z.klauzula) return "Ten zawodnik nie ma klauzuli wykupu.";
  if (!z.klubId) return "Zawodnik jest bez klubu — po prostu go podpisz.";
  if (z.klubId === moj.id) return "To już Twój zawodnik.";
  if (!oknoOtwarte(s)) return "Okno transferowe jest zamknięte.";
  if (moj.zawodnicy.length >= 26) return "Kadra jest pełna (max 26).";
  const pensja = zadaniePlacowe(s, z, moj.poziom);
  const dlug = dlugoscKontraktu(moj.poziom, false, z.wiek);
  const prowizja = z.agent ? prowizjaAgenta(pensja, dlug) : 0;
  const koszt = z.klauzula + prowizja;
  if (moj.kasa < koszt) return `Nie stać Cię na klauzulę. Potrzeba ${zl(koszt)}${prowizja ? ` (w tym prowizja agenta ${zl(prowizja)})` : ""}.`;
  if (bilansKolejki(s, pensja).bilans < -SPONSOR_SEZON[moj.poziom - 1] * 0.05)
    return `Ta pensja (${zl(pensja)}/kolejkę) rozwali budżet. Najpierw zwiększ wpływy albo sprzedaj kogoś.`;
  const poziomZaw = s.kluby[z.klubId].poziom;
  if (moj.poziom > poziomZaw && z.morale > 60 && !szansa(0.5))
    return `${z.imie} ${z.nazwisko} jest zadowolony i mimo klauzuli nie chce schodzić niżej.`;
  const stary = s.kluby[z.klubId];
  stary.zawodnicy = stary.zawodnicy.filter((x) => x !== z.id);
  stary.kasa += z.klauzula;
  moj.kasa -= koszt;
  z.klubId = moj.id; z.pensja = pensja; z.kontraktTyp = kontraktTyp(moj.poziom); z.kontraktDo = s.sezon + dlug;
  const kwota = z.klauzula; delete z.klauzula; // nowy klub negocjuje własne warunki — stara klauzula znika
  if (!z.agent && maAgenta(moj.poziom)) z.agent = losujAgenta(moj.poziom);
  moj.zawodnicy.push(z.id);
  przejscieDoKlubu(s, z, moj.nazwa);
  { const uzyte = new Set(moj.zawodnicy.map((x) => s.zawodnicy[x].numer)); let n = z.poz === "BR" ? 1 : 2; while (uzyte.has(n) && n < 99) n++; z.numer = n; }
  wiadomosc(s, `💸 Aktywowano klauzulę wykupu ${z.imie} ${z.nazwisko} (${zl(kwota)}) — dołącza z ${stary.nazwa}, pensja ${zl(pensja)}/kolejkę.`);
  return null;
}

/** Przedłużenie kontraktu — zawodnik żąda (zwykle wyższej) pensji; chroni przed odejściem za darmo. */
export function przedluzKontrakt(s: StanGry, zawodnikId: string): string | null {
  const moj = s.kluby[s.mojKlub];
  const z = s.zawodnicy[zawodnikId];
  if (z.klubId !== moj.id) return "To nie jest Twój zawodnik.";
  const nowaPensja = zadaniePlacowe(s, z, moj.poziom);
  const premia = premiaPodpisu(nowaPensja);
  const dlug = dlugoscKontraktu(moj.poziom, false, z.wiek);
  const prowizja = z.agent ? prowizjaAgenta(nowaPensja, dlug) : 0;
  if (moj.kasa < premia + prowizja) return `Brakuje na premię za podpis${prowizja ? " i prowizję agenta" : ""} (${zl(premia + prowizja)}).`;
  if (bilansKolejki(s, nowaPensja - z.pensja).bilans < -SPONSOR_SEZON[moj.poziom - 1] * 0.05)
    return `Nowa pensja (${zl(nowaPensja)}/kolejkę) rozwali budżet.`;
  moj.kasa -= premia + prowizja;
  z.pensja = nowaPensja;
  z.kontraktDo = Math.max(z.kontraktDo, s.sezon) + dlug;
  // Bonus lojalnościowy: przedłużenie poprawia morale (zwłaszcza młodych i chcących zostać).
  z.morale = Math.min(100, z.morale + (z.wiek <= 23 ? 10 : 7));
  z.prosiOTransfer = false;
  wiadomosc(s, `Przedłużono kontrakt z ${z.imie} ${z.nazwisko} do ${z.kontraktDo} (pensja ${zl(nowaPensja)}, premia ${zl(premia)}${prowizja ? `, prowizja agenta ${zl(prowizja)}` : ""}). Zawodnik zadowolony z zaufania.`);
  return null;
}

export function przyjmijOferte(s: StanGry, idx: number): string | null {
  const o = s.oferty[idx];
  if (!o) return "Oferta wygasła.";
  const moj = s.kluby[s.mojKlub];
  if (moj.zawodnicy.length <= 14) return "Za mała kadra, żeby sprzedawać (min 14).";
  const z = s.zawodnicy[o.zawodnikId];
  if (z.macierzysty) return `${z.nazwisko} jest u Was na wypożyczeniu — nie możesz go sprzedać.`;
  const ulubiony = ulubieniecTrybun(s, z, moj.id); // wychowanek-ulubieniec → sprzedaż rozgniewa trybuny
  const kupiec = s.kluby[o.klubId];
  if (s.kapitan === z.id) s.kapitan = null;
  moj.zawodnicy = moj.zawodnicy.filter((x) => x !== z.id);
  kupiec.zawodnicy.push(z.id);
  przejscieDoKlubu(s, z, kupiec.nazwa);
  z.klubId = kupiec.id;
  z.kontraktTyp = kontraktTyp(kupiec.poziom);
  z.kontraktDo = s.sezon + dlugoscKontraktu(kupiec.poziom);
  moj.kasa += o.kwota;
  kupiec.kasa -= o.kwota;
  wyplacOdsprzedaz(s, z, o.kwota, moj.id); // klauzula odsprzedaży dla poprzedniego klubu, jeśli była
  // Sprzedając wychowanka, klub zostawia sobie 15% z jego PRZYSZŁEJ odsprzedaży — wraca do kasy, gdy zabłyśnie gdzie indziej.
  if (z.wychowanek === moj.nazwa && !z.odsprzedaz) {
    z.odsprzedaz = { klubId: moj.id, proc: 15 };
    wiadomosc(s, `📄 W umowie zastrzegliście 15% od przyszłej odsprzedaży wychowanka ${z.imie} ${z.nazwisko} — jeśli pójdzie dalej, część kwoty wróci do klubu.`);
  }
  s.taktyka.sklad = s.taktyka.sklad.filter((x) => x !== z.id);
  s.oferty = s.oferty.filter((x) => x.zawodnikId !== z.id);
  przygotujKolejke(s);
  wiadomosc(s, `Sprzedano ${z.imie} ${z.nazwisko} do ${kupiec.nazwa} za ${zl(o.kwota)}.`);
  if (ulubiony) {
    const spadek = Math.round(7 + Math.max(0, z.umiej - zakresUmiej(moj.poziom)[0]) * 0.6);
    s.zaufanieKibicow = Math.max(0, (s.zaufanieKibicow ?? 60) - spadek);
    wiadomosc(s, `😡 Kibice wściekli: sprzedałeś wychowanka ${z.imie} ${z.nazwisko}! Trybuny czują się zdradzone — zaufanie −${spadek}.`);
  }
  return null;
}

export function zwolnijZawodnika(s: StanGry, zawodnikId: string): string | null {
  const moj = s.kluby[s.mojKlub];
  if (moj.zawodnicy.length <= 14) return "Za mała kadra (min 14).";
  const z = s.zawodnicy[zawodnikId];
  if (z.macierzysty) return `${z.nazwisko} jest u Was na wypożyczeniu — wraca do klubu macierzystego po sezonie.`;
  if (s.kapitan === zawodnikId) s.kapitan = null;
  // Odprawa = pozostała część kontraktu (realnie trzeba wypłacić resztę umowy); amator bez odprawy.
  const odprawa = z.kontraktTyp === "amator" ? 0 : z.pensja * (4 + latDoKonca(s, z) * 6);
  if (moj.kasa < odprawa) return `Brakuje na odprawę (${zl(odprawa)}).`;
  moj.kasa -= odprawa;
  { const o = wpisKarieryOtwarty(z); if (o) { naliczSezonDoKariery(z); o.do = s.sezon; } } // zamknij etap kariery
  moj.zawodnicy = moj.zawodnicy.filter((x) => x !== z.id);
  z.klubId = null;
  z.kontraktDo = s.sezon;
  s.wolni.push(z.id);
  s.taktyka.sklad = s.taktyka.sklad.filter((x) => x !== z.id);
  przygotujKolejke(s);
  wiadomosc(s, `Rozwiązano umowę z ${z.imie} ${z.nazwisko}${odprawa ? ` (odprawa ${zl(odprawa)})` : ""}. Jest teraz wolnym zawodnikiem.`);
  return null;
}

export function przejmijKlub(s: StanGry, klubId: string) {
  rozpocznijKariere(s, klubId);
}

/** Przyjęcie oferty pracy od innego klubu (gdy masz dobre wyniki) — przenosisz się i zaczynasz nowy rozdział. */
export function przyjmijOferteTrenera(s: StanGry, idx: number): string | null {
  const o = s.ofertyTrenera?.[idx];
  if (!o) return "Oferta wygasła.";
  const klub = s.kluby[o.klubId];
  if (!klub) return "Klub już niedostępny.";
  s.ofertyTrenera = [];
  s.propozycjaTrenera = undefined;
  przejmijKlub(s, o.klubId);
  s.trenerPensja = o.pensja;
  if (o.lata) s.trenerKontraktDo = s.sezon + o.lata - 1;
  wiadomosc(s, `Przyjąłeś ofertę ${klub.nazwa} (${s.ligi[klub.poziom - 1].nazwa}). Nowy rozdział w karierze trenerskiej!`);
  return null;
}

/** Kluby bez trenera, które możesz objąć — zakres poziomów zależny od reputacji (tytuły/awanse). */
export function wolneKlubyDlaZwolnionego(s: StanGry): string[] {
  const bazowy = s.kluby[s.mojKlub].poziom;
  const dorobek = (s.trenerKariera ?? []).reduce((a, w) => a + w.tytuly + w.awanse, 0);
  // Po wygaśnięciu kontraktu (odszedłeś z podniesioną głową) albo z dorobkiem — można mierzyć wyżej.
  const gora = s.powodWolny === "wygasl" || dorobek > 0 ? 1 : 0;
  const odP = Math.max(1, bazowy - gora);
  const doP = Math.min(s.ligi.length, bazowy + 2); // niżej zawsze chętnie Cię wezmą
  const lista: string[] = [];
  for (let p = odP; p <= doP; p++) {
    const kluby = s.ligi[p - 1].kluby.filter((id) => id !== s.mojKlub);
    for (const id of kluby.slice(0, 5)) lista.push(id);
  }
  return lista;
}

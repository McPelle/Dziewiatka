// Trenerzy klubów (pierwszi szkoleniowcy). REALNI, AKTUALNI trenerzy tam, gdzie są udokumentowani
// (Ekstraklasa, I–III liga, część IV/V ligi pomorskie+małopolskie) — z historią kariery. Pozostałym
// klubom (głównie klasa okręgowa → B) silnik dobiera wiarygodnego, wygenerowanego szkoleniowca, żeby
// „tryb trenera" działał wszędzie. Źródła realnych danych: Wikipedia, 90minut.pl, Transfermarkt, strony klubów.
import { losInt, wybierz } from "../engine/losuj";
import type { Klub, KontraktTyp, StanGry } from "../engine/types";
import { IMIONA, MIANA, MIEJSCOWOSCI, NAZWISKA } from "./nazwy";

// Kontrakt trenera z klubem — te same formy co u piłkarzy (bez importu swiat, by uniknąć cyklu).
function kontraktTypPoziom(poziom: number): KontraktTyp { return poziom <= 3 ? "zawodowy" : poziom <= 6 ? "polprofesjonalny" : "amator"; }
function dlugoscKontraktuTrenera(poziom: number): number { return poziom <= 3 ? losInt(1, 4) : poziom <= 6 ? losInt(1, 3) : losInt(1, 2); }
// Pensja trenera (zł/kolejkę) — skaluje się ze szczeblem.
const PENSJA_TRENERA = [9000, 5000, 2600, 1300, 650, 320, 180, 120, 100]; // poziom 1..9
function pensjaTrenera(poziom: number): number { return PENSJA_TRENERA[Math.max(0, Math.min(8, poziom - 1))]; }

export interface WpisHistorii { klub: string; od: number; do: number | null }
export interface TrenerReal {
  imie: string;
  nazwisko: string;
  od?: number; // sezon (rok) objęcia obecnego klubu
  odMiesiac?: string;
  licencja?: "C" | "B" | "A" | "PRO";
  historia?: WpisHistorii[]; // wcześniejsze kluby, najnowsze pierwsze
}

// Realni trenerzy — klucz = dokładna nazwa klubu (jak w danych ścieżki). Uzupełniane z badań sieciowych.
// (na starcie częściowo puste — wypełniane partiami po weryfikacji; brak wpisu = trener generowany)
export const TRENERZY: Record<string, TrenerReal> = {
  // === EKSTRAKLASA 2026/27 (stan ~listopad 2026; źródła: WebSearch — flashscore/soccerway/meczyki/kluby) ===
  "Lech Poznań": { imie: "Niels", nazwisko: "Frederiksen", od: 2024, odMiesiac: "maj", licencja: "PRO", historia: [{ klub: "Brøndby IF", od: 2019, do: 2023 }, { klub: "Reprezentacja Danii U-21", od: 2016, do: 2019 }, { klub: "Esbjerg fB", od: 2015, do: 2016 }, { klub: "FC Vestsjælland", od: 2011, do: 2014 }] },
  "Legia Warszawa": { imie: "Marek", nazwisko: "Papszun", od: 2025, odMiesiac: "grudzień", licencja: "PRO", historia: [{ klub: "Raków Częstochowa", od: 2016, do: 2023 }, { klub: "ŁKS Łódź", od: 2015, do: 2016 }, { klub: "Puszcza Niepołomice", od: 2013, do: 2015 }, { klub: "Pogoń Siedlce", od: 2011, do: 2013 }] },
  "Górnik Zabrze": { imie: "Michal", nazwisko: "Gašparík", od: 2025, odMiesiac: "czerwiec", licencja: "PRO", historia: [{ klub: "Spartak Trnawa", od: 2021, do: 2025 }, { klub: "ViOn Zlaté Moravce", od: 2019, do: 2020 }, { klub: "Reprezentacja Słowacji U-18/U-19", od: 2017, do: 2019 }] },
  "Śląsk Wrocław": { imie: "Toni", nazwisko: "Golem", od: 2026, odMiesiac: "listopad", licencja: "PRO", historia: [{ klub: "Śląsk Wrocław (asystent)", od: 2024, do: 2026 }] },
  "Wisła Płock": { imie: "Adam", nazwisko: "Majewski", od: 2026, odMiesiac: "czerwiec", licencja: "PRO", historia: [{ klub: "Reprezentacja Polski U-19/U-20", od: 2022, do: 2026 }, { klub: "Wisła Płock (asystent)", od: 2019, do: 2021 }] },
  "Jagiellonia Białystok": { imie: "Adrian", nazwisko: "Siemieniec", od: 2023, odMiesiac: "lipiec", licencja: "PRO", historia: [{ klub: "Jagiellonia Białystok (II zespół/asystent)", od: 2021, do: 2023 }] },
  "Pogoń Szczecin": { imie: "Óscar", nazwisko: "García Junyent", od: 2026, odMiesiac: "czerwiec", licencja: "PRO", historia: [{ klub: "AFC Ajax (asystent)", od: 2024, do: 2026 }, { klub: "Celta Vigo", od: 2021, do: 2022 }, { klub: "Stade Reims", od: 2020, do: 2021 }, { klub: "AS Saint-Étienne", od: 2017, do: 2018 }, { klub: "Red Bull Salzburg", od: 2015, do: 2017 }] },
  "Cracovia": { imie: "Aleksandar", nazwisko: "Vuković", od: 2026, odMiesiac: "listopad", licencja: "PRO", historia: [{ klub: "Widzew Łódź", od: 2026, do: 2026 }, { klub: "Al-Tai", od: 2022, do: 2023 }, { klub: "Legia Warszawa", od: 2019, do: 2021 }] },
  "Korona Kielce": { imie: "Robert", nazwisko: "Kolendowicz", od: 2026, odMiesiac: "listopad", licencja: "PRO", historia: [{ klub: "Pogoń Szczecin", od: 2024, do: 2025 }, { klub: "Legia Warszawa II", od: 2021, do: 2023 }, { klub: "Warta Poznań (asystent)", od: 2019, do: 2020 }] },
  "Motor Lublin": { imie: "Mariusz", nazwisko: "Misiura", od: 2026, odMiesiac: "lato", licencja: "PRO", historia: [{ klub: "Wisła Płock", od: 2025, do: 2026 }, { klub: "Stal Rzeszów", od: 2023, do: 2024 }, { klub: "Resovia", od: 2021, do: 2022 }, { klub: "GKS Tychy", od: 2019, do: 2020 }] },
  "Widzew Łódź": { imie: "Mateusz", nazwisko: "Stolarski", od: 2026, odMiesiac: "czerwiec", licencja: "PRO", historia: [{ klub: "Motor Lublin", od: 2024, do: 2026 }, { klub: "Chrobry Głogów", od: 2022, do: 2023 }, { klub: "Lech Poznań (młodzież)", od: 2019, do: 2021 }] },
  "Zagłębie Lubin": { imie: "Leszek", nazwisko: "Ojrzyński", od: 2024, licencja: "PRO", historia: [{ klub: "Stal Mielec", od: 2022, do: 2024 }, { klub: "Korona Kielce", od: 2019, do: 2020 }, { klub: "Arka Gdynia", od: 2017, do: 2018 }, { klub: "GKS Tychy", od: 2015, do: 2016 }] },
  "GKS Katowice": { imie: "Rafał", nazwisko: "Górak", od: 2019, odMiesiac: "lato", licencja: "PRO", historia: [{ klub: "GKS Katowice (akademia/asystent)", od: 2016, do: 2019 }] },
  "Piast Gliwice": { imie: "Daniel", nazwisko: "Myśliwiec", od: 2026, licencja: "PRO", historia: [{ klub: "Widzew Łódź", od: 2023, do: 2024 }, { klub: "ŁKS Łódź", od: 2021, do: 2022 }, { klub: "Lech Poznań II", od: 2019, do: 2021 }] },
  "Radomiak Radom": { imie: "John", nazwisko: "Carver", od: 2026, odMiesiac: "wrzesień", licencja: "PRO", historia: [{ klub: "Omonia Nikozja", od: 2016, do: 2016 }, { klub: "Newcastle United", od: 2015, do: 2015 }, { klub: "Toronto FC", od: 2011, do: 2013 }] },
  "Raków Częstochowa": { imie: "Tomasz", nazwisko: "Kaczmarek", od: 2026, odMiesiac: "wrzesień", licencja: "PRO", historia: [{ klub: "Radomiak Radom", od: 2026, do: 2026 }, { klub: "Arka Gdynia", od: 2024, do: 2025 }, { klub: "SKN St. Pölten", od: 2022, do: 2023 }, { klub: "Lechia Gdańsk", od: 2021, do: 2022 }] },
  "Wieczysta Kraków": { imie: "Jacek", nazwisko: "Zieliński", od: 2026, odMiesiac: "listopad", licencja: "PRO", historia: [{ klub: "Korona Kielce", od: 2024, do: 2026 }, { klub: "Cracovia", od: 2021, do: 2023 }, { klub: "Zagłębie Sosnowiec", od: 2018, do: 2019 }, { klub: "Pogoń Szczecin", od: 2013, do: 2015 }] },

  // === I LIGA (Betclic 1. Liga) 2026/27 (stan ~listopad 2026; źródła: WebSearch — część dat orientacyjna) ===
  "Lechia Gdańsk": { imie: "Vladyslav", nazwisko: "Lupashko", od: 2026, odMiesiac: "lipiec", licencja: "PRO", historia: [{ klub: "Rukh Lwów", od: 2022, do: 2026 }] },
  "Arka Gdynia": { imie: "Marek", nazwisko: "Jarolim", od: 2026, odMiesiac: "czerwiec", licencja: "PRO", historia: [{ klub: "FK Mladá Boleslav", od: 2021, do: 2023 }] },
  "Bruk-Bet Termalica Nieciecza": { imie: "Marcin", nazwisko: "Brosz", od: 2024, licencja: "PRO", historia: [{ klub: "GKS Tychy", od: 2022, do: 2023 }, { klub: "Górnik Zabrze", od: 2016, do: 2020 }] },
  "Chrobry Głogów": { imie: "Łukasz", nazwisko: "Becella", od: 2026, licencja: "PRO", historia: [{ klub: "Chrobry Głogów (asystent)", od: 2024, do: 2026 }] },
  "ŁKS Łódź": { imie: "Grzegorz", nazwisko: "Szoka", od: 2026, odMiesiac: "czerwiec", licencja: "PRO", historia: [{ klub: "ŁKS Łódź (młodzież/sztab)", od: 2023, do: 2026 }] },
  "Miedź Legnica": { imie: "Dawid", nazwisko: "Kroczek", od: 2026, odMiesiac: "wrzesień", licencja: "PRO", historia: [{ klub: "Raków Częstochowa", od: 2026, do: 2026 }, { klub: "Miedź Legnica (asystent)", od: 2025, do: 2026 }] },
  "Odra Opole": { imie: "Piotr", nazwisko: "Plewnia", od: 2026, odMiesiac: "październik", licencja: "A", historia: [{ klub: "Odra Opole (rezerwy/p.o.)", od: 2026, do: 2026 }] },
  "Podbeskidzie Bielsko-Biała": { imie: "Marcin", nazwisko: "Włodarski", od: 2025, odMiesiac: "listopad", licencja: "PRO", historia: [] },
  "Pogoń Grodzisk Mazowiecki": { imie: "Tomasz", nazwisko: "Kafarski", od: 2026, licencja: "PRO", historia: [{ klub: "Chojniczanka Chojnice", od: 2021, do: 2023 }] },
  "Pogoń Siedlce": { imie: "Adam", nazwisko: "Nocoń", od: 2024, odMiesiac: "październik", licencja: "A", historia: [] },
  "Polonia Bytom": { imie: "Konrad", nazwisko: "Gerega", od: 2026, odMiesiac: "czerwiec", licencja: "PRO", historia: [{ klub: "ŁKS Łódź II", od: 2024, do: 2026 }, { klub: "Skra Częstochowa", od: 2022, do: 2024 }] },
  "Polonia Warszawa": { imie: "Mariusz", nazwisko: "Pawlak", od: 2026, licencja: "PRO", historia: [] },
  "Puszcza Niepołomice": { imie: "Tomasz", nazwisko: "Tułacz", od: 2013, licencja: "PRO", historia: [] },
  "Ruch Chorzów": { imie: "Waldemar", nazwisko: "Fornalik", od: 2025, odMiesiac: "sierpień", licencja: "PRO", historia: [{ klub: "Piast Gliwice", od: 2017, do: 2023 }, { klub: "Ruch Chorzów", od: 2014, do: 2017 }, { klub: "Reprezentacja Polski", od: 2012, do: 2013 }] },
  "Stal Rzeszów": { imie: "Marek", nazwisko: "Zub", od: 2023, licencja: "PRO", historia: [{ klub: "Sandecja Nowy Sącz", od: 2019, do: 2021 }, { klub: "Podbeskidzie Bielsko-Biała", od: 2017, do: 2018 }] },
  "Unia Skierniewice": { imie: "Kamil", nazwisko: "Socha", od: 2024, licencja: "A", historia: [] },
  "Warta Poznań": { imie: "Maciej", nazwisko: "Tokarczyk", od: 2025, licencja: "PRO", historia: [] },

  // === II LIGA (Betclic 2. Liga) 2026/27 — potwierdzeni (pewność ≥ średnia); część dat orientacyjna ===
  "Górnik Łęczna": { imie: "Jurij", nazwisko: "Szatałow", od: 2025, historia: [] },
  "Znicz Pruszków": { imie: "Peter", nazwisko: "Struhár", od: 2026, odMiesiac: "marzec", historia: [] },
  "Rekord Bielsko-Biała": { imie: "Piotr", nazwisko: "Tworek", od: 2025, odMiesiac: "grudzień", historia: [{ klub: "Widzew Łódź", od: 2022, do: 2023 }, { klub: "Warta Poznań", od: 2019, do: 2022 }] },
  "Sandecja Nowy Sącz": { imie: "Ireneusz", nazwisko: "Mamrot", od: 2025, historia: [{ klub: "ŁKS Łódź", od: 2020, do: 2021 }, { klub: "Jagiellonia Białystok", od: 2017, do: 2019 }] },
  "Zawisza Bydgoszcz": { imie: "Adrian", nazwisko: "Stawski", od: 2024, odMiesiac: "czerwiec", historia: [] },
  "Hutnik Kraków": { imie: "Krzysztof", nazwisko: "Świątek", od: 2025, historia: [] },
  "Świt Szczecin": { imie: "Marcin", nazwisko: "Sasal", od: 2026, historia: [{ klub: "Pogoń Grodzisk Mazowiecki", od: 2023, do: 2025 }] },
  "Podhale Nowy Targ": { imie: "Tomasz", nazwisko: "Kuźma", od: 2024, historia: [] },
  // Od III ligi w dół (do klasy B, oba województwa) — trenerzy GENEROWANI z generowaną historią (decyzja właściciela).
  // Trenerzy IV ligi ZP/KP 2026/27 (pl.wikipedia)
};

/** Licencja UEFA właściwa dla szczebla (realia PZPN: im wyżej, tym wyższy wymóg). */
function licencjaDlaPoziomu(poziom: number): "C" | "B" | "A" | "PRO" {
  if (poziom <= 2) return "PRO"; // Ekstraklasa, I liga — wymóg UEFA Pro
  if (poziom === 3) return "A"; // II liga — UEFA A (Pro przy wyższych wymaganiach)
  if (poziom <= 5) return "A"; // III–IV liga — UEFA A
  if (poziom <= 7) return "B"; // V liga, klasa okręgowa — UEFA B
  return "C"; // klasa A/B — UEFA C / amator
}

/** Krótka, wiarygodna historia wygenerowanego trenera (kluby „z niższych półek", najnowsze pierwsze). */
function generujHistorie(aktObjecie: number, poziom: number): WpisHistorii[] {
  const ile = poziom <= 3 ? losInt(2, 4) : poziom <= 6 ? losInt(1, 3) : losInt(0, 2);
  const out: WpisHistorii[] = [];
  let koniec = aktObjecie; // praca kończyła się, gdy zaczynała następna
  for (let i = 0; i < ile; i++) {
    const dlugosc = losInt(1, 4);
    const od = koniec - dlugosc;
    out.push({ klub: `${wybierz(MIANA)} ${wybierz(MIEJSCOWOSCI)}`, od, do: koniec });
    koniec = od;
  }
  return out;
}

/** Przypisuje trenera do klubu: realny jeśli udokumentowany, inaczej wygenerowany (z historią). */
export function przypiszTrenera(s: StanGry, klub: Klub): void {
  const sezon = s.sezon;
  klub.trenerKontraktTyp = kontraktTypPoziom(klub.poziom);
  klub.trenerPensja = pensjaTrenera(klub.poziom);
  const real = TRENERZY[klub.nazwa];
  if (real) {
    klub.trenerImie = real.imie;
    klub.trenerNazwisko = real.nazwisko;
    klub.trenerOd = real.od ?? sezon - losInt(0, 2);
    klub.trenerReal = true;
    klub.trenerLicencja = real.licencja ?? licencjaDlaPoziomu(klub.poziom);
    klub.trenerHistoria = real.historia ? real.historia.map((h) => ({ ...h })) : [];
    klub.trenerWiek = losInt(38, 62);
    klub.trenerKontraktDo = sezon + dlugoscKontraktuTrenera(klub.poziom);
    return;
  }
  // Wygenerowany szkoleniowiec — wiarygodny, lokalny, z krótką historią.
  klub.trenerImie = wybierz(IMIONA);
  klub.trenerNazwisko = wybierz(NAZWISKA);
  klub.trenerOd = sezon - losInt(0, 3);
  klub.trenerReal = false;
  klub.trenerLicencja = licencjaDlaPoziomu(klub.poziom);
  klub.trenerHistoria = generujHistorie(klub.trenerOd, klub.poziom);
  klub.trenerWiek = losInt(34, 63);
  klub.trenerKontraktDo = sezon + dlugoscKontraktuTrenera(klub.poziom);
}

const RANGA_LIC = { C: 0, B: 1, A: 2, PRO: 3 } as const;

/** Trener bez klubu (zwolniony / odszedł) — czeka na rynku na nowy angaż, z zachowaną historią kariery. */
export interface TrenerWolny {
  imie: string;
  nazwisko: string;
  licencja: "C" | "B" | "A" | "PRO";
  wiek?: number;
  historia: WpisHistorii[]; // spell w ostatnim klubie na początku
}

/** Uwalnia obecnego trenera klubu na rynek (dopisuje jego spell w tym klubie do historii). Nie obsadza wakatu. */
export function uwolnijTrenera(s: StanGry, klub: Klub): void {
  if (!klub.trenerNazwisko) return;
  const spell: WpisHistorii = { klub: klub.nazwa, od: klub.trenerOd ?? s.sezon, do: s.sezon };
  const w: TrenerWolny = {
    imie: klub.trenerImie ?? "", nazwisko: klub.trenerNazwisko ?? "",
    licencja: klub.trenerLicencja ?? licencjaDlaPoziomu(klub.poziom),
    wiek: klub.trenerWiek,
    historia: [spell, ...(klub.trenerHistoria ?? [])].slice(0, 8),
  };
  s.trenerzyWolni ??= [];
  // nie trzymamy emerytów ani zbyt długiej listy
  if ((w.wiek ?? 0) < 66) s.trenerzyWolni.push(w);
  if (s.trenerzyWolni.length > 40) s.trenerzyWolni = s.trenerzyWolni.slice(-40);
}

/** Obsadza wakat w klubie: angażuje pasującego trenera z rynku (awans z niższego szczebla) albo generuje nowego. */
export function obsadzWakat(s: StanGry, klub: Klub): void {
  const wymog = RANGA_LIC[licencjaDlaPoziomu(klub.poziom)];
  s.trenerzyWolni ??= [];
  // nie angażuj z powrotem trenera, który WŁAŚNIE odszedł z tego klubu w tym sezonie
  const swiezoZtego = (t: TrenerWolny) => t.historia[0]?.klub === klub.nazwa && t.historia[0]?.do === s.sezon;
  const i = s.trenerzyWolni.findIndex((t) => RANGA_LIC[t.licencja] >= wymog - 1 && (t.wiek ?? 50) < 64 && !swiezoZtego(t));
  let imie: string, nazwisko: string, licencja: "C" | "B" | "A" | "PRO", wiek: number, historia: WpisHistorii[];
  if (i >= 0) {
    const t = s.trenerzyWolni.splice(i, 1)[0];
    imie = t.imie; nazwisko = t.nazwisko; wiek = t.wiek ?? losInt(40, 60);
    licencja = RANGA_LIC[t.licencja] >= wymog ? t.licencja : licencjaDlaPoziomu(klub.poziom); // awans bywa z licencją w górę
    historia = t.historia;
  } else {
    imie = wybierz(IMIONA); nazwisko = wybierz(NAZWISKA); wiek = losInt(34, 60);
    licencja = licencjaDlaPoziomu(klub.poziom); historia = generujHistorie(s.sezon, klub.poziom);
  }
  klub.trenerImie = imie;
  klub.trenerNazwisko = nazwisko;
  klub.trenerLicencja = licencja;
  klub.trenerWiek = wiek;
  klub.trenerOd = s.sezon;
  klub.trenerReal = false;
  klub.trenerKontraktTyp = kontraktTypPoziom(klub.poziom);
  klub.trenerKontraktDo = s.sezon + dlugoscKontraktuTrenera(klub.poziom);
  klub.trenerHistoria = historia;
}

/** Nowy sezon dla trenerów klubów AI: starzenie, wygaśnięcia, przedłużenia i rotacja (odejścia/zwolnienia). */
export function trenerzyNowySezon(s: StanGry): void {
  for (const klub of Object.values(s.kluby)) {
    if (klub.id === s.mojKlub) continue; // trenerem klubu gracza jest gracz
    if (klub.trenerWiek != null) klub.trenerWiek++;
    const wygasl = klub.trenerKontraktTyp !== "amator" && klub.trenerKontraktDo != null && klub.trenerKontraktDo < s.sezon;
    const emerytura = (klub.trenerWiek ?? 0) >= 66;
    if (emerytura || (wygasl && Math.random() < 0.35)) {
      // odejście/zwolnienie → stary trener na rynek, wakat obsadza ktoś z rynku (awans) albo nowy
      uwolnijTrenera(s, klub);
      obsadzWakat(s, klub);
    } else if (wygasl) {
      klub.trenerKontraktDo = s.sezon + dlugoscKontraktuTrenera(klub.poziom);
      klub.trenerKontraktTyp = kontraktTypPoziom(klub.poziom);
    }
  }
  // starzenie i czyszczenie rynku wolnych trenerów (emeryci odchodzą)
  s.trenerzyWolni = (s.trenerzyWolni ?? []).map((t) => ({ ...t, wiek: (t.wiek ?? 50) + 1 })).filter((t) => (t.wiek ?? 0) < 66).slice(-40);
}

/** Zwolnienie trenera AI w trakcie sezonu (słabe wyniki) — stary na rynek, natychmiastowy następca. Zwraca następcę. */
export function zwolnijTreneraAI(s: StanGry, klub: Klub): { imie: string; nazwisko: string } {
  uwolnijTrenera(s, klub);
  obsadzWakat(s, klub);
  return { imie: klub.trenerImie ?? "", nazwisko: klub.trenerNazwisko ?? "" };
}

/** Pełne imię i nazwisko trenera klubu (do UI). */
export function trenerKlubu(klub: Klub): string {
  if (klub.trenerImie || klub.trenerNazwisko) return `${klub.trenerImie ?? ""} ${klub.trenerNazwisko ?? ""}`.trim();
  return "—";
}

/** Staż trenera w klubie (sezony) — do UI/opisów. */
export function stazTrenera(klub: Klub, sezon: number): number {
  return klub.trenerOd != null ? Math.max(0, sezon - klub.trenerOd) : 0;
}

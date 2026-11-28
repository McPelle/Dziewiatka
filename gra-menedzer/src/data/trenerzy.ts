// Trenerzy klubów (pierwszi szkoleniowcy). REALNI, AKTUALNI trenerzy tam, gdzie są udokumentowani
// (Ekstraklasa, I–III liga, część IV/V ligi pomorskie+małopolskie) — z historią kariery. Pozostałym
// klubom (głównie klasa okręgowa → B) silnik dobiera wiarygodnego, wygenerowanego szkoleniowca, żeby
// „tryb trenera" działał wszędzie. Źródła realnych danych: Wikipedia, 90minut.pl, Transfermarkt, strony klubów.
import { losInt, wybierz } from "../engine/losuj";
import type { Klub, KontraktTyp, StanGry } from "../engine/types";
import { IMIONA, MIANA, MIEJSCOWOSCI, NAZWISKA } from "./nazwy";
import { NARODOWOSCI } from "./narodowosci";

/** Narodowość realnych trenerów-cudzoziemców (pozostali realni — Polacy). Znajomość polskiego — szacunek gry. */
const KRAJ_TRENERA: Record<string, { kraj: string; polski: number }> = {
  Frederiksen: { kraj: "Dania", polski: 10 }, "Gašparík": { kraj: "Słowacja", polski: 45 }, Golem: { kraj: "Chorwacja", polski: 20 },
  "García Junyent": { kraj: "Hiszpania", polski: 5 }, "Vuković": { kraj: "Serbia", polski: 95 }, Carver: { kraj: "Anglia", polski: 3 },
  Lupashko: { kraj: "Ukraina", polski: 60 }, Jarolim: { kraj: "Czechy", polski: 45 }, "Szatałow": { kraj: "Ukraina", polski: 100 }, "Struhár": { kraj: "Słowacja", polski: 70 },
};

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
  kraj?: string; // narodowość (brak = Polska)
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
  // === III LIGA gr. I, IV liga i okręgówki warmińsko-mazurskie i podlaskie (stan 27.11.2026; pewność wysoka/średnia) ===
  "KTS Weszło": { imie: "Łukasz", nazwisko: "Ryczkowski" }, // III liga gr. I; en.wikipedia (infobox, rev. 26.11.2026) + superscore.live (skład)
  "Wigry Suwałki": { imie: "Arkadiusz", nazwisko: "Szczerbowski", od: 2025, odMiesiac: "październik" }, // III liga gr. I; suwalki24.pl / poranny.pl (zmiana za Pawła Cimochowskiego); superscore.live
  "Świt Nowy Dwór Mazowiecki": { imie: "Michał", nazwisko: "Złotkowski" }, // III liga gr. I; mksswit.pl/kadra/druzyna-i (Trener I zespołu); eostroleka.pl
  "Mazovia Mińsk Mazowiecki": { imie: "Damian", nazwisko: "Guzek" }, // III liga gr. I; superscore.live (skład) + sofascore
  "Pelikan Łowicz": { imie: "Piotr", nazwisko: "Kocęba" }, // III liga gr. I; en.wikipedia (infobox) + superscore.live
  "Ząbkovia Ząbki": { imie: "Michał", nazwisko: "Maliszewski" }, // III liga gr. I; en.wikipedia (infobox) + superscore.live
  "Wisła II Płock": { imie: "Damian", nazwisko: "Kijek" }, // III liga gr. I; wisla-plock.pl (II zespół; zastąpił Mateusza Lewandowskiego)
  "Olimpia Zambrów": { imie: "Michał", nazwisko: "Kolanowski", od: 2025, odMiesiac: "listopad" }, // III liga gr. I; poranny.pl (nominacja XI 2025), zambrow.org (relacja 1. kolejki 2026/27)
  "Jagiellonia II Białystok": { imie: "Daniel", nazwisko: "Rusek", od: 2025, odMiesiac: "styczeń" }, // III liga gr. I; poranny.pl, bialystokonline.pl, jagiellonia.pl (relacje do XI 2026)
  "Olimpia Elbląg": { imie: "Karol", nazwisko: "Przybyła", od: 2025, odMiesiac: "kwiecień" }, // III liga gr. I; zksolimpia.pl/2-liga (Kadra: Trener Przybyła Karol, Trener Rafał Starzyński); portel.pl
  "Polonia Lidzbark Warmiński": { imie: "Piotr", nazwisko: "Jacek" }, // III liga gr. I; gazetaolsztynska.pl (Trzecioligowcy zaczynają sezon), wikipedia
  "KS CK Troszyn": { imie: "Michał", nazwisko: "Hryszko", od: 2025, odMiesiac: "czerwiec" }, // III liga gr. I; sport.eostroleka.pl (KS CK Troszyn ma nowego trenera / sztab); superscore.live
  "Lechia Tomaszów Mazowiecki": { imie: "Bartosz", nazwisko: "Grzelak", od: 2024, odMiesiac: "styczeń" }, // III liga gr. I; tomaszow-maz.pl (prezentacja 07/2026, zapowiedź meczu 26.09.2026)
  "Widzew II Łódź": { imie: "Paweł", nazwisko: "Ściebura" }, // III liga gr. I; superscore.live (skład) + sofascore
  "Mławianka Mława": { imie: "Marek", nazwisko: "Gołębiewski" }, // III liga gr. I; en.wikipedia (infobox) + superscore.live
  "Stomil Olsztyn": { imie: "Michał", nazwisko: "Kraszewski" }, // IV liga warmińsko-mazurska; stomil.olsztyn.pl (konferencje XI 2026: 'Michał Kraszewski: To była udana runda')
  "Concordia Elbląg": { imie: "Marcin", nazwisko: "Szweda", od: 2024, odMiesiac: "lipiec" }, // IV liga warmińsko-mazurska; concordia.elblag.pl (Trener: Marcin Szweda od 9.07.2024); stomil.olsztyn.pl; info.elblag.p
  "Granica Kętrzyn": { imie: "Przemysław", nazwisko: "Łapiński" }, // IV liga warmińsko-mazurska; wmzpn.pl (zapowiedź 1. kolejki 2026/27); superscore.live
  "Tęcza Biskupiec": { imie: "Maciej", nazwisko: "Szostek" }, // IV liga warmińsko-mazurska; gazetaolsztynska.pl (07/2026); wmzpn.pl 'Podziel się wiedzą' (19.08.2026)
  "Sokół Ostróda": { imie: "Rafał", nazwisko: "Więckowski", od: 2025, odMiesiac: "maj" }, // IV liga warmińsko-mazurska; ostrodanews.pl, gazetaolsztynska.pl; stomil.olsztyn.pl (konferencja X/XI 2026)
  "GKS Wikielec": { imie: "Dominik", nazwisko: "Bednarczyk" }, // IV liga warmińsko-mazurska; infoilawa.pl; stomil.olsztyn.pl (konferencja GKS Wikielec - Stomil 1:1)
  "Pisa Barczewo": { imie: "Piotr", nazwisko: "Wanda" }, // IV liga warmińsko-mazurska; wmzpn.pl (zapowiedź 1. kolejki 2026/27)
  "DKS Dobre Miasto": { imie: "Piotr", nazwisko: "Gurzęda" }, // IV liga warmińsko-mazurska; olsztyn.com.pl 10.11.2026 ('ekipa Piotra Gurzędy'); wmzpn.pl; stomil.olsztyn.pl
  "Rominta Gołdap": { imie: "Szymon", nazwisko: "Nałysnyk" }, // IV liga warmińsko-mazurska; stomil.olsztyn.pl (konferencja Rominta - Stomil 0:3, jesień 2026); superscore.live
  "Start Nidzica": { imie: "Rafał", nazwisko: "Brzozowski", od: 2026, odMiesiac: "październik" }, // IV liga warmińsko-mazurska; stomil.olsztyn.pl (konferencja Stomil - Start 3:1, X 2026); wmzpn.pl (zapowiedź 10. kolejk
  "MKS Mazur Ełk": { imie: "Patryk", nazwisko: "Gondek" }, // IV liga warmińsko-mazurska; wmzpn.pl (zapowiedź 2. kolejki 2026/27); superscore.live
  "Znicz Biała Piska": { imie: "Ryszard", nazwisko: "Borkowski" }, // IV liga warmińsko-mazurska; stomil.olsztyn.pl (zapowiedź i konferencja Stomil - Znicz 2:0, XI 2026)
  "Naki Olsztyn": { imie: "Andrzej", nazwisko: "Nakielski" }, // IV liga warmińsko-mazurska; olsztyn.com.pl 10.11.2026; stomil.olsztyn.pl
  "Mamry Giżycko": { imie: "Kamil", nazwisko: "Pyczot" }, // IV liga warmińsko-mazurska; stomil.olsztyn.pl (konferencja Stomil - Mamry 7:1, IX 2026); info-ketrzyn24.pl
  "KS Wasilków": { imie: "Wojciech", nazwisko: "Kobeszko" }, // IV liga podlaska; poranny.pl (zapowiedzi IV ligi, IX 2026: 'podopieczni trenera Wojciecha Kobeszki')
  "Warmia Grajewo": { imie: "Karol", nazwisko: "Salik" }, // IV liga podlaska; poranny.pl; e-grajewo.pl (05/2026)
  "ŁKS II Łomża": { imie: "Tomasz", nazwisko: "Staniórski" }, // IV liga podlaska; mylomza.pl (08/2026)
  "Czarni Czarna Białostocka": { imie: "Mateusz", nazwisko: "Woroniecki" }, // IV liga podlaska; poranny.pl (jesień 2026)
  "Tur Bielsk Podlaski": { imie: "Krystian", nazwisko: "Kulikowski", od: 2026 }, // IV liga podlaska; poranny.pl (IX 2026)
  "Promień Mońki": { imie: "Leszek", nazwisko: "Zawadzki" }, // IV liga podlaska; poranny.pl (IX 2026)
  "Wissa Szczuczyn": { imie: "Dariusz", nazwisko: "Kortkowski", od: 2026, odMiesiac: "październik" }, // IV liga podlaska; e-grajewo.pl 09.10.2026
  "KS Śniadowo": { imie: "Dariusz", nazwisko: "Narolewski", od: 2026, odMiesiac: "wrzesień" }, // IV liga podlaska; mylomza.pl 03.09.2026
  "Pomorzanka Sejny": { imie: "Karol", nazwisko: "Piaścik" }, // IV liga podlaska; suwalki24.pl (06/2026 i podsumowanie jesieni 2026)
  "Pionier Brańsk": { imie: "Przemysław", nazwisko: "Masłowski" }, // IV liga podlaska; bielsk.eu (05/2026 i terminarz 2026/27)
  "Stomil II Olsztyn": { imie: "Paweł", nazwisko: "Sobotka" }, // klasa okręgowa W-M gr. 1; stomil.olsztyn.pl (IX-X 2026)
  "Mazur Pisz": { imie: "Dzmitry", nazwisko: "Baiduk" }, // klasa okręgowa W-M gr. 1; stomil.olsztyn.pl 25.09.2026 ('podopieczni Dzmitrego Baiduka')
  "Olimpia II Elbląg": { imie: "Bartłomiej", nazwisko: "Florek" }, // klasa okręgowa W-M gr. 2; zksolimpia.pl/ii-zespol (Kadra: Trener Florek Bartłomiej)
  "Puszcza Hajnówka": { imie: "Artur", nazwisko: "Dakowicz" }, // klasa okręgowa podlaska; bielsk.eu (mecz 03.10.2026)
  // === IV liga, V liga i okręgówki — pomorskie, kujawsko-pomorskie, zachodniopomorskie, małopolskie (stan 28.11.2026; pewność wysoka/średnia) ===
  "Czarni Pruszcz Gdański": { imie: "Krystian", nazwisko: "Ryczkowski", od: 2025, odMiesiac: "styczeń" }, // pomorskie IV liga pomorska; https://dziennikbaltycki.pl/nowa-jakosc-w-klubie-czarni-pruszcz-gdanski-doswiadc
  "Cartusia Kartuzy": { imie: "Adam", nazwisko: "Billewicz", od: 2026, odMiesiac: "lipiec" }, // pomorskie IV liga pomorska; https://kurierkaszubski.eu/pilka-nozna-iv-liga/ (06.07.2026) ; https://kurierkas
  "Arka II Gdynia": { imie: "Łukasz", nazwisko: "Kowalski" }, // pomorskie IV liga pomorska; https://www.trojmiasto.pl/sport/Awans-i-koniec-pilkarskiego-Wybrzeza-Gdansk-Tren
  "Pogoń Lębork": { imie: "Mateusz", nazwisko: "Michniewicz" }, // pomorskie IV liga pomorska; https://www.lebork24.info/2026/11/07/zwyciestwo-z-aniolami-garczegorze-30-dzis-p
  "Gryf Wejherowo": { imie: "Mateusz", nazwisko: "Czaja" }, // pomorskie IV liga pomorska; https://radiogdansk.pl/sport/2026/11/14/trener-gryfa-wejherowo-koniec-jednej-ser
  "Gryf Słupsk": { imie: "Dominik", nazwisko: "Kaczmarek", od: 2026, odMiesiac: "wrzesień" }, // pomorskie IV liga pomorska; https://radiogdansk.pl/sport/2026/09/15/gryf-slupsk-ma-kolejnego-nowego-trenera/
  "Sokół Bożepole Wielkie": { imie: "Paweł", nazwisko: "Kolus" }, // pomorskie IV liga pomorska; https://radiogdansk.pl/sport/2026/08/09/start-iv-ligi-popis-jaguara-i-hat-trick-
  "Radunia Stężyca": { imie: "Mateusz", nazwisko: "Bucholc", od: 2024, odMiesiac: "październik" }, // pomorskie IV liga pomorska; https://kurierkaszubski.eu/pilka-nozna-iv-liga-12/ (10.10.2026: podopieczni tren
  "Anioły Garczegorze": { imie: "Tadeusz", nazwisko: "Wanat" }, // pomorskie IV liga pomorska; https://radiogdansk.pl/sport/2026/03/22/dziwny-mecz-gryfa-slupsk-i-aniolow-garcz
  "Stoczniowiec Gdańsk": { imie: "Paweł", nazwisko: "Pagieła" }, // pomorskie IV liga pomorska; https://www.laczynaspilka.pl/aktualnosci/pilka-w-regionie/stoczniowiec-gdansk-wr
  "Jaguar Gdańsk": { imie: "Jacek", nazwisko: "Paszulewicz" }, // pomorskie IV liga pomorska; https://radiogdansk.pl/sport/2026/08/09/start-iv-ligi-popis-jaguara-i-hat-trick-
  "Chojniczanka II Chojnice": { imie: "Tomasz", nazwisko: "Fojut" }, // pomorskie IV liga pomorska; https://mkschojniczanka.pl/ (relacje [II zespół], np. Pogoń Lębork – Chojniczank
  "Dolina Speranda Niepoględzie": { imie: "Adam", nazwisko: "Pietras" }, // pomorskie IV liga pomorska; https://radiogdansk.pl/sport/2026/08/09/start-iv-ligi-popis-jaguara-i-hat-trick-
  "Unia Solec Kujawski": { imie: "Szymon", nazwisko: "Maziarz", od: 2025, odMiesiac: "lipiec" }, // kujawsko-pomorskie IV liga kujawsko-pomorska; https://metropoliabydgoska.pl/unia-solec-kujawski-ma-nowego-trenera-legenda-regi
  "Wisła Dobrzyń nad Wisłą": { imie: "Szymon", nazwisko: "Moszczyński" }, // kujawsko-pomorskie IV liga kujawsko-pomorska; https://wloclawek.naszemiasto.pl/kujawiak-lumac-kowal-wisla-dobrzyn-zdjecia-z-me
  "Pogoń Mogilno": { imie: "Jakub", nazwisko: "Łaganowski", od: 2025, odMiesiac: "czerwiec" }, // kujawsko-pomorskie IV liga kujawsko-pomorska; https://www.pogonmogilno.pl/jakub-laganowski-trenerem-pierwszego-zespolu-pogoni-
  "Sparta Brodnica": { imie: "Krystian", nazwisko: "Janczak" }, // kujawsko-pomorskie IV liga kujawsko-pomorska; https://czasbrodnicy.pl/pl/13_sport/29312434_sparta-brodnica-rozpoczyna-przygoto
  "Start Pruszcz": { imie: "Adam", nazwisko: "Góral" }, // kujawsko-pomorskie IV liga kujawsko-pomorska; https://sportoweswiecie.pl/node/4312 (VIII 2026) ; https://sportoweswiecie.pl/no
  "Kujawiak Kowal": { imie: "Tomasz", nazwisko: "Malkowski" }, // kujawsko-pomorskie IV liga kujawsko-pomorska; https://wloclawek.naszemiasto.pl/kujawiak-lumac-kowal-lech-rypin-zdjecia-z-meczu
  "Pomorzanin Serock": { imie: "Remigiusz", nazwisko: "Kuś", od: 2026, odMiesiac: "lipiec" }, // kujawsko-pomorskie Klasa okręgowa — kujawsko-pomorska I; https://sportoweswiecie.pl/node/4225 (15.07.2026); https://sportoweswiecie.pl/no
  "Grom Osie": { imie: "Damian", nazwisko: "Ejankowski" }, // kujawsko-pomorskie Klasa okręgowa — kujawsko-pomorska I; https://sportoweswiecie.pl/node/4171 (02.07.2026); https://sportoweswiecie.pl/no
  "Wisła Gruczno": { imie: "Filip", nazwisko: "Skory" }, // kujawsko-pomorskie Klasa okręgowa — kujawsko-pomorska I; https://sportoweswiecie.pl/node/4183 (07.07.2026); https://sportoweswiecie.pl/no
  "Gryf Sicienko": { imie: "Kacper", nazwisko: "Wróblewski", od: 2025, odMiesiac: "czerwiec" }, // kujawsko-pomorskie Klasa okręgowa — kujawsko-pomorska I; https://sportoweswiecie.pl/node/4150 (26.06.2026); https://sportoweswiecie.pl/no
  "Wda II Świecie": { imie: "Patryk", nazwisko: "Strzębała" }, // kujawsko-pomorskie Klasa okręgowa — kujawsko-pomorska I; https://sportoweswiecie.pl/node/4159 (06.2026); https://sportoweswiecie.pl/node/
  "Kotwica Kołobrzeg": { imie: "Krzysztof", nazwisko: "Sobieszczuk", od: 2025, odMiesiac: "listopad" }, // zachodniopomorskie IV liga zachodniopomorska; https://e-kg.pl/artykul/zmiana-trenera-krzysztof-n2182049 ; https://miastokolobr
  "Sparta Gryfice": { imie: "Krzysztof", nazwisko: "Kubacki", od: 2025, odMiesiac: "czerwiec" }, // zachodniopomorskie IV liga zachodniopomorska; https://superportal24.pl/sparta-gryfice-ma-nowego-trenera-1-20819
  "Dąb Dębno": { imie: "Karol", nazwisko: "Gliwiński" }, // zachodniopomorskie IV liga zachodniopomorska; https://www.chojna24.pl/2026/03/karol-gliwinski-na-pewno-debno-chciao.html (III 
  "Orzeł Wałcz": { imie: "Hubert", nazwisko: "Pilarski", od: 2026, odMiesiac: "wrzesień" }, // zachodniopomorskie IV liga zachodniopomorska; https://info-walcz.pl/na-trenerskiej-karuzeli/
  "Cracovia II": { imie: "Andrzej", nazwisko: "Paszkiewicz" }, // małopolskie IV liga TEXOM małopolska; https://www.podkarpacielive.pl/pl/wydarzenia/60634,cracovia-ii---victoria-1918-j
  "Termalica Bruk-Bet II Nieciecza": { imie: "Waldemar", nazwisko: "Dzierżanowski" }, // małopolskie IV liga TEXOM małopolska; https://4ligamalopolska.pl/?sp_team=bruk-bet-termalica-ii-nieciecza (profil 2026
  "Orzeł Ryczów": { imie: "Damian", nazwisko: "Rębisz", od: 2025, odMiesiac: "maj" }, // małopolskie IV liga TEXOM małopolska; https://futmal.pl/news/zmiana-trenera-w-ryczowie (18.05.2026) ; https://4ligamal
  "Glinik Gorlice": { imie: "Łukasz", nazwisko: "Krzysztoń" }, // małopolskie IV liga TEXOM małopolska; https://gorlice24.pl/pl/13_sport/50251_glinik-gorlice-zakonczyl-runde-widac-prog
  "Dalin Myślenice": { imie: "Przemysław", nazwisko: "Senderski" }, // małopolskie IV liga TEXOM małopolska; https://4ligamalopolska.pl/?sp_team=dalin-myslenice ; https://dalin.futbolowo.pl
  "Hutnik II Kraków": { imie: "Mariusz", nazwisko: "Bienias", od: 2025, odMiesiac: "grudzień" }, // małopolskie IV liga TEXOM małopolska; https://4ligamalopolska.pl/?sp_team=hutnik-ii-krakow ; https://futmal.pl/news (B
  "Beskid Andrychów": { imie: "Tomasz", nazwisko: "Moskała" }, // małopolskie IV liga TEXOM małopolska; https://4ligamalopolska.pl/?sp_team=beskid-andrychow (profil drużyny 2026/27, I 
  "Lubań Maniowy": { imie: "Łukasz", nazwisko: "Schreiner" }, // małopolskie IV liga TEXOM małopolska; https://podhaleregion.pl/pilka-nozna-4-liga-luban-ogrywa-outsidera-watra-przegry
  "Wolania Wola Rzędzińska": { imie: "Daniel", nazwisko: "Popiela", od: 2025, odMiesiac: "czerwiec" }, // małopolskie IV liga TEXOM małopolska; https://futmal.pl/news/wolania-z-nowym-trenerem (30.06.2026)
  "Kalwarianka Kalwaria Zebrzydowska": { imie: "Bogdan", nazwisko: "Zając", od: 2026, odMiesiac: "lipiec" }, // małopolskie IV liga TEXOM małopolska; https://futmal.pl/news/bogdan-zajac-trenerem-czwartoligowca (01.07.2026) ; https
  "Pcimianka Pcim": { imie: "Bartosz", nazwisko: "Pawlik", od: 2026, odMiesiac: "listopad" }, // małopolskie IV liga TEXOM małopolska; https://futmal.pl/news/pcimianka-zaprezentowala-nowego-trenera-2 (23.11.2026)
  "Unia Tarnów": { imie: "Paweł", nazwisko: "Węgrzyn" }, // małopolskie IV liga TEXOM małopolska; https://4ligamalopolska.pl/?sp_team=unia-tarnow (profil 2026/27)
  "BKS Bochnia": { imie: "Jakub", nazwisko: "Drwal" }, // małopolskie IV liga TEXOM małopolska; https://4ligamalopolska.pl/?sp_team=bks-bochnia (profil 2026/27) ; https://futma
  "Limanovia Limanowa": { imie: "Mateusz", nazwisko: "Ryś" }, // małopolskie IV liga TEXOM małopolska; https://limanowa.in/sport/trener-limanovii-zmiennicy-pokazali-ze-mozna-na-nich-l
  "Poprad Muszyna": { imie: "Robert", nazwisko: "Kubiela", od: 2025, odMiesiac: "lipiec" }, // małopolskie IV liga TEXOM małopolska; https://4ligamalopolska.pl/?sp_team=poprad-muszyna ; https://futmal.pl/news/popr
  "Błękitni Modlnica": { imie: "Krzysztof", nazwisko: "Szumiec" }, // małopolskie IV liga TEXOM małopolska; https://gazetakrakowska.pl/oni-swietowali-awans-oto-druzyny-z-malopolski-ktore-s
  "Watra Białka Tatrzańska": { imie: "Marek", nazwisko: "Kowalski", od: 2026, odMiesiac: "październik" }, // małopolskie IV liga TEXOM małopolska; https://podhaleregion.pl/watra-bialka-tatrzanska-ma-nowego-trenera-marek-kowalsk
  "Orzeł Myślenice": { imie: "Krzysztof", nazwisko: "Zawora", od: 2025, odMiesiac: "grudzień" }, // małopolskie V liga (zachód); https://futmal.pl/news/nowy-trener-wybrany-zawora-poprowadzi-piatoligowca (04.12
  "Sokół Kocmyrzów Baranówka": { imie: "Piotr", nazwisko: "Trzepatowski", od: 2026, odMiesiac: "październik" }, // małopolskie V liga (zachód); https://futmal.pl/news/sokol-z-nowym-szkoleniowcem-2 (09.10.2026)
  "AP Kmita Zabierzów": { imie: "Radosław", nazwisko: "Salwach", od: 2026, odMiesiac: "lipiec" }, // małopolskie V liga (zachód); https://futmal.pl/news/kmita-z-nowym-trenerem-1 (23.06.2026)
  "Przebój Wolbrom": { imie: "Mariusz", nazwisko: "Porębski", od: 2025, odMiesiac: "czerwiec" }, // małopolskie V liga (zachód); https://futmal.pl/news/porebski-trenerem-piatoligowca (25.06.2026)
  "Proszowianka Proszowice": { imie: "Łukasz", nazwisko: "Mika", od: 2025, odMiesiac: "czerwiec" }, // małopolskie Klasa okręgowa (Kraków I); https://futmal.pl/news/proszowianka-zaprezentowala-nowego-trenera (30.06.2026)
  "Spartak Charsznica": { imie: "Kamil", nazwisko: "Dąbrowski", od: 2026, odMiesiac: "lipiec" }, // małopolskie Klasa okręgowa (Kraków I); https://futmal.pl/news/mistrz-a-klasy-z-nowym-trenerem (21.07.2026)
  "Grębałowianka Kraków": { imie: "Jakub", nazwisko: "Pasionek", od: 2025, odMiesiac: "czerwiec" }, // małopolskie Klasa okręgowa (Kraków II); https://futmal.pl/news/grebalowianka-ma-nowego-trenera-1 (18.06.2026)
  "Pogoń Kraków": { imie: "Piotr", nazwisko: "Mrozek", od: 2026, odMiesiac: "październik" }, // małopolskie Klasa okręgowa (Kraków II); https://futmal.pl/news/nadszedl-kres-misji-szweda-pogon-w-trenerem-tymczasowym (
  "Wiarusy Igołomia": { imie: "Piotr", nazwisko: "Kurylonek", od: 2025, odMiesiac: "maj" }, // małopolskie Klasa okręgowa (Kraków III / Myślenice); https://futmal.pl/news/zmiana-trenera-w-igolomi (27.05.2026)
  "Poprad Rytro": { imie: "Wojciech", nazwisko: "Tajduś" }, // małopolskie V liga (wschód); https://limanowa.in/sport/turbacz-zatrzymal-poprad-kolejne-zwyciestwo-w-meczu-na
  "Wisła Czarny Dunajec": { imie: "Łukasz", nazwisko: "Pazurkiewicz" }, // małopolskie V liga (wschód); https://podhaleregion.pl (Wielki finał w Czarnym Dunajcu..., 06-07.10.2026)
  "Turbacz Mszana Dolna": { imie: "Damian", nazwisko: "Gniecki", od: 2026, odMiesiac: "lipiec" }, // małopolskie V liga (wschód); https://limanowa.in/sport/turbacz-rozpoczyna-przygotowania-trzy-sparingi-i-mecz-
  "Podhale II Nowy Targ": { imie: "Grzegorz", nazwisko: "Hajnos" }, // małopolskie V liga (wschód); https://podhaleregion.pl/wisla-nie-zwalnia-rezerwy-podhala-zatrzymaly-turbacza-o
  "Dąbrovia Dąbrowa Tarnowska": { imie: "Tomasz", nazwisko: "Juszczyk", od: 2025, odMiesiac: "czerwiec" }, // małopolskie V liga (wschód); https://futmal.pl/news/dabrovia-z-nowym-trenerem (26.06.2026)
  "Polan Żabno": { imie: "Konrad", nazwisko: "Tyrpuła", od: 2026, odMiesiac: "lipiec" }, // małopolskie V liga (wschód); https://limanowa.in/sport/byly-szkoleniowiec-orkana-szczyrzyc-wraca-do-v-ligi/50
  "LKS Nowa Jastrząbka": { imie: "Piotr", nazwisko: "Brożek", od: 2025, odMiesiac: "czerwiec" }, // małopolskie V liga (wschód); https://futmal.pl/news/nowa-jastrzabka-z-nowym-trenerem (30.06.2026)
  "Łosoś Łososina Dolna": { imie: "Jakub", nazwisko: "Czernecki", od: 2026, odMiesiac: "lipiec" }, // małopolskie V liga (wschód); https://futmal.pl/news/nowy-trener-beniaminka-1 (15.07.2026)
  "Okocimski KS Brzesko": { imie: "Mateusz", nazwisko: "Krokosz", od: 2025, odMiesiac: "czerwiec" }, // małopolskie V liga (wschód); https://futmal.pl/news/okocimski-ma-nowego-trenera (25.06.2026)
  "Kolejarz Stróże": { imie: "Robert", nazwisko: "Święs", od: 2025, odMiesiac: "czerwiec" }, // małopolskie V liga (wschód); https://futmal.pl/news/swies-poprowadzi-kolejarza (27.06.2026)
  "Orawa Jabłonka": { imie: "Paweł", nazwisko: "Batkiewicz", od: 2026, odMiesiac: "wrzesień" }, // małopolskie V liga (wschód); https://podhaleregion.pl/wisla-nie-zwalnia-rezerwy-podhala-zatrzymaly-turbacza-o
  "Harnaś Tymbark": { imie: "Adrian", nazwisko: "Mrózek" }, // małopolskie Klasa okręgowa (Limanowa-Podhale); https://limanowa.in/sport/niesamowity-harnas-w-tymbarku-rozbita-kolejna-druzyna/
  "Babia Góra Lipnica Wielka": { imie: "Grzegorz", nazwisko: "Szczepaniec" }, // małopolskie Klasa okręgowa (Limanowa-Podhale); https://podhaleregion.pl/ (Po meczu w Lipnicy Wielkiej wybuchła dyskusja..., 02.
  "Wierchy Pasierbiec": { imie: "Sebastian", nazwisko: "Wójcik" }, // małopolskie Klasa okręgowa (Limanowa-Podhale); https://limanowa.in/sport/wierchy-pasierbiec-awansowaly-do-klasy-okregowej/50838
  "Orkan Niedźwiedź": { imie: "Piotr", nazwisko: "Kaczor" }, // małopolskie Klasa okręgowa (Limanowa-Podhale); https://limanowa.in/sport/orkan-niedzwiedz-pisze-swoja-historie/51033 (10.08.202
  "Sokół Maszkienice": { imie: "Tomasz", nazwisko: "Świerczek", od: 2026, odMiesiac: "sierpień" }, // małopolskie Klasa okręgowa (Bochnia-Brzesko); https://futmal.pl/news/swierczek-trenerem-sokola (19.08.2026)
  "Ikar Odporyszów": { imie: "Marcin", nazwisko: "Zając", od: 2025, odMiesiac: "czerwiec" }, // małopolskie Klasa okręgowa (Żabno-Tarnów); https://futmal.pl/news/zmiana-trenera-w-odporyszowie (26.06.2026)
  "Tęcza Krosno Odrzańskie": { imie: "Mateusz", nazwisko: "Hałambiec" }, // Lubuskie — Zielona Góra; zachod.pl (2026-11-17)
  "Zorza Ochla": { imie: "Maciej", nazwisko: "Wysocki" }, // Lubuskie — Zielona Góra; wzielonej.pl (2026-11-14)
  "Czarni Drągowina": { imie: "Karol", nazwisko: "Madej" }, // Lubuskie — Zielona Góra; wzielonej.pl (2026-10-10)
  "TS Przylep": { imie: "Konrad", nazwisko: "Szymański" }, // Lubuskie — Zielona Góra; wzielonej.pl (2026-09-05)
  "KP Świdnica": { imie: "Michał", nazwisko: "Grzelczyk" }, // Lubuskie — Zielona Góra; zachod.pl (2026-11-20)
  "Pogoń Wężyska": { imie: "Łukasz", nazwisko: "Czyżyk" }, // Lubuskie — Zielona Góra; zachod.pl (2026-07-27)
  "Cargovia Kargowa": { imie: "Andrzej", nazwisko: "Kołodziej" }, // Lubuskie — Zielona Góra; zachod.pl (2026-07-01)
  "Zjednoczeni Brody": { imie: "Tomasz", nazwisko: "Bahyrycz" }, // Lubuskie — Zielona Góra; zachod.pl (2026-09-12)
  "Błękitni Ołobok": { imie: "Daniel", nazwisko: "Lisowski" }, // Lubuskie — Zielona Góra; zachod.pl (2026-10-26)
  "Bóbr Bobrowice": { imie: "Karol", nazwisko: "Widerowski" }, // Lubuskie — Zielona Góra; zachod.pl (2026-11-26)
  "Sparta Łężyca": { imie: "Szymon", nazwisko: "Czarny" }, // Lubuskie — Zielona Góra; wzielonej.pl (2026-10-16)
  "Kora Niedoradz": { imie: "Mieczysław", nazwisko: "Sobczak" }, // Lubuskie — Zielona Góra; zachod.pl (2026-08-16)
  "TKKF Chynowianka Zielona Góra": { imie: "Kamil", nazwisko: "Konopacki" }, // Lubuskie — Zielona Góra; zachod.pl (2026-06-29)
  "Victoria Szczaniec": { imie: "Marcin", nazwisko: "Janik" }, // Lubuskie — Gorzów / III liga gr. III; lubuskizpn.pl (2026-11-26)
  "Polonia Słubice": { imie: "Michał", nazwisko: "Gościak" }, // Lubuskie — Gorzów / III liga gr. III; lubuskizpn.pl (2026-11-26)
  "Zagłębie Sosnowiec": { imie: "Tomasz", nazwisko: "Łuczywek" }, // Lubuskie — Gorzów / III liga gr. III; pl.wikipedia.org (2026-11-28 (infoboks Wikipedii, sezon 2026/2027))
  "ROW 1964 Rybnik": { imie: "Jacek", nazwisko: "Trzeciak" }, // Lubuskie — Gorzów / III liga gr. III; row1964rybnik.com (2026-11-28 (skład na sezon 2026/2027))
  "Barycz Sułów": { imie: "Wojciech", nazwisko: "Łuczak" }, // Lubuskie — Gorzów / III liga gr. III; baryczsulow.com (2026-11-28 (strona klubu, kadra))
  "MKS Kluczbork": { imie: "Michał", nazwisko: "Honc" }, // Lubuskie — Gorzów / III liga gr. III; mkskluczbork.pl (2026-11-13)
  "Ślęza Wrocław": { imie: "Grzegorz", nazwisko: "Kowalski" }, // Lubuskie — Gorzów / III liga gr. III; pilkanozna.slezawroclaw.pl (2026-11-28 (strona klubu – sztab III ligi))
  "Stilon Gorzów Wielkopolski": { imie: "Karol", nazwisko: "Gliwiński" }, // Lubuskie — Gorzów / III liga gr. III; lubuskizpn.pl (2026-07-23)
  "Warta Gorzów Wielkopolski": { imie: "Mariusz", nazwisko: "Łabiak" }, // Lubuskie — Gorzów / III liga gr. III; pl.wikipedia.org (2026-11-28 (infoboks Wikipedii; brak potwierdzenia w innym źródle))
  "Polonia Nysa": { imie: "Adrian", nazwisko: "Pajączkowski" }, // Lubuskie — Gorzów / III liga gr. III; kspolonianysa.pl (2026-09-25 („Adrian Pajączkowski nowym trenerem Polonii Nysa”))
  "Victoria Żyrowa": { imie: "Kamil", nazwisko: "Jakubczak" }, // Opolskie — północ; pilkaopolska.pl (2026-07-27)
  "Fortuna Głogówek": { imie: "Rafał", nazwisko: "Wolny" }, // Opolskie — północ; opolska360.pl (2026-08-20)
  "TOR Dobrzeń Wielki": { imie: "Wojciech", nazwisko: "Kaszub" }, // Opolskie — północ; pilkaopolska.pl (2026-08-14)
  "Piast Namysłów": { imie: "Wojciech", nazwisko: "Baczyński" }, // Opolskie — północ; pilkaopolska.pl (2026-07-30)
  "Grom Zawiść": { imie: "Radosław", nazwisko: "Kołbuc" }, // Opolskie — północ; pilkaopolska.pl (2026-07-30)
  "Odra Kąty Opolskie": { imie: "Mateusz", nazwisko: "Tworek" }, // Opolskie — północ; lzsodrakatyopolskie.futbolowo.pl (2026-09)
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
    const kt = KRAJ_TRENERA[real.nazwisko]; if (kt) { klub.trenerKraj = real.kraj ?? kt.kraj; klub.trenerPolski = kt.polski; } else { delete klub.trenerKraj; delete klub.trenerPolski; }
    return;
  }
  // Wygenerowany szkoleniowiec — wiarygodny, lokalny, z krótką historią.
  klub.trenerImie = wybierz(IMIONA);
  klub.trenerNazwisko = wybierz(NAZWISKA);
  delete klub.trenerKraj; delete klub.trenerPolski;
  // wygenerowany cudzoziemiec — częściej na wyższych szczeblach (wygenerowany, nie realny)
  if (Math.random() < SZANSA_OBCEGO[Math.min(8, klub.poziom - 1)]) {
    const t = generujObcegoTrenera(klub.poziom, sezon);
    klub.trenerImie = t.imie; klub.trenerNazwisko = t.nazwisko; klub.trenerKraj = t.kraj; klub.trenerPolski = t.polski; klub.trenerWiek = t.wiek;
    klub.trenerOd = sezon - losInt(0, 2); klub.trenerHistoria = t.historia; klub.trenerLicencja = licencjaDlaPoziomu(klub.poziom); klub.trenerKontraktDo = sezon + dlugoscKontraktuTrenera(klub.poziom);
    return;
  }
  klub.trenerOd = sezon - losInt(0, 3);
  klub.trenerReal = false;
  klub.trenerLicencja = licencjaDlaPoziomu(klub.poziom);
  klub.trenerHistoria = generujHistorie(klub.trenerOd, klub.poziom);
  klub.trenerWiek = losInt(34, 63);
  klub.trenerKontraktDo = sezon + dlugoscKontraktuTrenera(klub.poziom);
}

const RANGA_LIC = { C: 0, B: 1, A: 2, PRO: 3 } as const;

/** Szansa, że wakat obsadzi trener-cudzoziemiec (wyżej częściej; w klasach A/B rzadko — zwykle ktoś mieszkający w Polsce). */
const SZANSA_OBCEGO = [0.32, 0.24, 0.16, 0.1, 0.06, 0.04, 0.025, 0.02, 0.015];
const SASIEDZI = ["Ukraina", "Słowacja", "Czechy", "Białoruś", "Litwa"];
const PRZYDOMKI = ["FC", "FK", "SK", "CD", "AS", "SV", "NK", "AC", "KF", "IF"];
/** Wygenerowany trener z zagranicy (nie realna osoba): kraj, imię i nazwisko z tego kraju, znajomość polskiego, historia za granicą. */
export function generujObcegoTrenera(poziom: number, sezon: number): { imie: string; nazwisko: string; kraj: string; polski: number; wiek: number; historia: WpisHistorii[] } {
  const nisko = poziom >= 6;
  const pula = NARODOWOSCI.filter((x) => x.kraj !== "Polska" && (!nisko || SASIEDZI.includes(x.kraj) || Math.random() < 0.15));
  const n = pula[Math.floor(Math.random() * pula.length)] ?? NARODOWOSCI[0];
  const polski = nisko ? losInt(45, 95) : SASIEDZI.includes(n.kraj) ? losInt(20, 80) : losInt(0, 35); // w niższych ligach — zwykle osiadli w Polsce
  const historia: WpisHistorii[] = [];
  let koniec = sezon;
  for (let i = 0; i < losInt(1, 4); i++) { const d = losInt(1, 3); historia.push({ klub: `${wybierz(PRZYDOMKI)} ${wybierz(n.nazwiska)} (${n.kraj})`, od: koniec - d, do: koniec }); koniec -= d; }
  return { imie: wybierz(n.imiona), nazwisko: wybierz(n.nazwiska), kraj: n.kraj, polski, wiek: losInt(36, 62), historia };
}
/** Rynek trenerów: co sezon zgłaszają się szkoleniowcy z zagranicy szukający pracy w Polsce. */
export function zasilRynekTrenerow(s: StanGry): void {
  s.trenerzyWolni ??= [];
  const obcych = s.trenerzyWolni.filter((t) => t.kraj).length;
  for (let i = obcych; i < 14; i++) {
    const poz = [1, 1, 2, 2, 3, 3, 4, 5, 6, 7][i % 10];
    const t = generujObcegoTrenera(poz, s.sezon);
    s.trenerzyWolni.push({ imie: t.imie, nazwisko: t.nazwisko, licencja: licencjaDlaPoziomu(poz), wiek: t.wiek, historia: t.historia, kraj: t.kraj, polski: t.polski });
  }
  if (s.trenerzyWolni.length > 60) s.trenerzyWolni = s.trenerzyWolni.slice(-60);
}

/** Trener bez klubu (zwolniony / odszedł) — czeka na rynku na nowy angaż, z zachowaną historią kariery. */
export interface TrenerWolny {
  imie: string;
  nazwisko: string;
  licencja: "C" | "B" | "A" | "PRO";
  wiek?: number;
  historia: WpisHistorii[]; // spell w ostatnim klubie na początku
  kraj?: string; polski?: number; // trener-cudzoziemiec
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
    ...(klub.trenerKraj ? { kraj: klub.trenerKraj, polski: klub.trenerPolski } : {}),
  };
  s.trenerzyWolni ??= [];
  // nie trzymamy emerytów ani zbyt długiej listy
  if ((w.wiek ?? 0) < 66) s.trenerzyWolni.push(w);
  if (s.trenerzyWolni.length > 60) s.trenerzyWolni = s.trenerzyWolni.slice(-60);
}

/** Obsadza wakat w klubie: angażuje pasującego trenera z rynku (awans z niższego szczebla) albo generuje nowego. */
export function obsadzWakat(s: StanGry, klub: Klub): void {
  const wymog = RANGA_LIC[licencjaDlaPoziomu(klub.poziom)];
  s.trenerzyWolni ??= [];
  // nie angażuj z powrotem trenera, który WŁAŚNIE odszedł z tego klubu w tym sezonie
  const swiezoZtego = (t: TrenerWolny) => t.historia[0]?.klub === klub.nazwa && t.historia[0]?.do === s.sezon;
  zasilRynekTrenerow(s);
  // cudzoziemiec bez polskiego w amatorskim klubie to rzadkość; w Ekstraklasie — codzienność
  const pasuje = (t: TrenerWolny) => !t.kraj ? Math.random() > SZANSA_OBCEGO[Math.min(8, klub.poziom - 1)] * 1.5 : Math.random() < SZANSA_OBCEGO[Math.min(8, klub.poziom - 1)] * 2.5 && (klub.poziom < 6 || (t.polski ?? 0) >= 40);
  const i = s.trenerzyWolni.findIndex((t) => RANGA_LIC[t.licencja] >= wymog - 1 && (t.wiek ?? 50) < 64 && !swiezoZtego(t) && pasuje(t));
  let imie: string, nazwisko: string, licencja: "C" | "B" | "A" | "PRO", wiek: number, historia: WpisHistorii[];
  let kraj: string | undefined, polski: number | undefined;
  if (i >= 0) {
    const t = s.trenerzyWolni.splice(i, 1)[0];
    imie = t.imie; nazwisko = t.nazwisko; wiek = t.wiek ?? losInt(40, 60);
    licencja = RANGA_LIC[t.licencja] >= wymog ? t.licencja : licencjaDlaPoziomu(klub.poziom); // awans bywa z licencją w górę
    historia = t.historia; kraj = t.kraj; polski = t.polski;
  } else if (Math.random() < SZANSA_OBCEGO[Math.min(8, klub.poziom - 1)]) {
    const t = generujObcegoTrenera(klub.poziom, s.sezon);
    imie = t.imie; nazwisko = t.nazwisko; wiek = t.wiek; licencja = licencjaDlaPoziomu(klub.poziom); historia = t.historia; kraj = t.kraj; polski = t.polski;
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
  if (kraj) { klub.trenerKraj = kraj; klub.trenerPolski = polski; } else { delete klub.trenerKraj; delete klub.trenerPolski; }
}

/** Nowy sezon dla trenerów klubów AI: starzenie, wygaśnięcia, przedłużenia i rotacja (odejścia/zwolnienia). */
export function trenerzyNowySezon(s: StanGry): void {
  for (const klub of Object.values(s.kluby)) {
    if (klub.id === s.mojKlub) continue; // trenerem klubu gracza jest gracz
    if (klub.trenerWiek != null) klub.trenerWiek++;
    if (klub.trenerKraj && (klub.trenerPolski ?? 0) < 100) klub.trenerPolski = Math.min(100, (klub.trenerPolski ?? 0) + losInt(8, 22)); // trenerzy z zagranicy uczą się polskiego
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
  if (klub.trenerImie || klub.trenerNazwisko) return `${klub.trenerImie ?? ""} ${klub.trenerNazwisko ?? ""}`.trim() + (klub.trenerKraj ? ` ${NARODOWOSCI.find((n) => n.kraj === klub.trenerKraj)?.flaga ?? "🌍"}` : "");
  return "—";
}

/** Staż trenera w klubie (sezony) — do UI/opisów. */
export function stazTrenera(klub: Klub, sezon: number): number {
  return klub.trenerOd != null ? Math.max(0, sezon - klub.trenerOd) : 0;
}

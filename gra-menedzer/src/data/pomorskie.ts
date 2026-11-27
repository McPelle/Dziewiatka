// Województwo POMORSKIE — podokręg Gdańsk. Prawdziwe kluby III liga → Klasa B (nazwy + miasta: pl.wikipedia.org, pomorskifutbol.pl).
// Uwaga: w pomorskim pod IV ligą jest V liga → Klasa A → Klasa B (NIE ma osobnej klasy okręgowej jak w Małopolsce) — region ma 8 szczebli.
// Herby: BRAK plików → gra rysuje oryginalny emblemat (tarcza w barwach + inicjały). Zawodnicy: generowani (III liga → B klasa).
import { KLUBY_PRAWDZIWE, type KlubDane, type Sciezka } from "./kluby";

const k = (nazwa: string, miasto: string, skrot: string, stadion?: string, adres?: string): KlubDane =>
  ({ nazwa, skrot, miasto, ...(stadion ? { stadion } : {}), ...(adres ? { adres } : {}) });

/** Poziomy krajowe 1–3 (wspólne, prawdziwe) — reużywane też przez kuj-pom i zach-pom. */
export const GORA_KRAJOWA: { nazwa: string; kluby: KlubDane[] }[] = [
  { nazwa: "PKO BP Ekstraklasa", kluby: KLUBY_PRAWDZIWE[1] },
  { nazwa: "Betclic 1. Liga", kluby: KLUBY_PRAWDZIWE[2] },
  { nazwa: "Betclic 2. Liga", kluby: KLUBY_PRAWDZIWE[3] },
];

// Poziom 4 — Betclic 3. Liga, grupa II (2026/2027; kuj-pom / pomorskie / wielkopolskie / zachodniopomorskie). Źródło: pl.wikipedia.org.
// Zmiany vs 2025/26: Zawisza awansował do II ligi; Gedania Gdańsk i Grom Nowy Staw awansowały z IV ligi pomorskiej.
export const III_LIGA_GR2: KlubDane[] = [
  k("Polonia Środa Wielkopolska", "Środa Wielkopolska", "PŚW", "Stadion 700-lecia Środy Wielkopolskiej", "ul. Sportowa 12, 63-000 Środa Wielkopolska"),
  k("Kluczevia Stargard", "Stargard", "KL", "Boisko ZKS Kluczevia", "ul. Ursyna Niemcewicza, 73-110 Stargard"),
  k("Wda Świecie", "Świecie", "WŚ", "Stadion Miejski w Świeciu", "ul. Sienkiewicza 18, 86-100 Świecie"),
  k("Wikęd Luzino", "Luzino", "WL", "Stadion GOSRiT Luzino", "ul. Mickiewicza 22, 84-242 Luzino"),
  k("Lech II Poznań", "Poznań", "LP2", "Stadion we Wronkach", "ul. Bułgarska 17, 60-320, Poznań"),
  k("Unia Swarzędz", "Swarzędz", "US", "Stadion Miejski w Swarzędzu", "ul. św. Marcina 1, 62-020 Swarzędz"),
  k("Błękitni Stargard", "Stargard", "BS", "Stadion Miejski w Stargardzie", "ul. Ceglana 1, 73-110 Stargard"),
  k("Noteć Czarnków", "Czarnków", "NC"),
  k("KKS 1925 Kalisz", "Kalisz", "KAL", "Stadion Miejski w Kaliszu", "ulica Łódzka w Kaliszu"),
  k("Bałtyk Koszalin", "Koszalin", "BKO", "Stadion Miejski przy ul. Jedności", "ul. Jedności 4, 75-401 Koszalin"),
  k("Flota Świnoujście", "Świnoujście", "FŚ", "Stadion Miejski im. Leszka Zakrzewskiego", "ul. Matejki 22, 72-600 Świnoujście"),
  k("Elana Toruń", "Toruń", "ET", "Stadion Miejski im. Grzegorza Duneckiego", "ul. 63 Pułku Piechoty 47/61, 87-100 Toruń"),
  k("Gedania Gdańsk", "Gdańsk", "GED", "Centrum Sportu i Edukacji GKS Gedania 1922", "al. Gen. Józefa Hallera 201, 80-416 Gdańsk"),
  k("Grom Nowy Staw", "Nowy Staw", "GNS", "Stadion Miejski OSiR w Nowym Stawie", "ul. Sportowa 5, 82-230 Nowy Staw"),
  k("Chemik Bydgoszcz", "Bydgoszcz", "CHB", undefined, "Glinki 79, 85-861 Bydgoszcz"),
  k("Victoria Września", "Września", "VW", "Stadion Miejski we Wrześni", "ul. Kosynierów 1, 62-300 Września"),
  k("Lipno Stęszew", "Stęszew", "LS"),
  k("Kotwica Kórnik", "Kórnik", "KOK", "Stadion miejski w Kórniku na terenie KCRiS OAZA Błonie, ul. Leśnej 6", "Leśna 6, 62-035 Kórnik"),
];
// Realne stadiony i adresy III ligi gr. II (nie nadpisuje pól już wpisanych wyżej).
import { nalozKrajowe } from "./krajowe-adresy";
nalozKrajowe(III_LIGA_GR2);

// Poziom 5 — IV liga pomorska (2026/2027). Źródło: pl.wikipedia.org (IV liga, gr. XI pomorska).
// Zmiany vs 2025/26: Gedania i Grom Nowy Staw awansowały do III ligi; Cartusia spadła z III ligi;
//   awanse z klasy okręgowej: Stoczniowiec, Radunia, Dolina Speranda, Sparta Sycewice;
//   spadły z IV ligi: Bytovia Bytów, Pomezania Malbork, Piast Człuchów (teraz niżej).
const IV_LIGA_POMORSKA: KlubDane[] = [
  k("Czarni Pruszcz Gdański", "Pruszcz Gdański", "CPG", "Stadion Miejski w Pruszczu Gdańskim", "ul. Chopina 34, 83-000 Pruszcz Gdański"),
  k("Cartusia Kartuzy", "Kartuzy", "CK", "Stadion Miejski w Kartuzach", "ul. 3 Maja 39, 83-300 Kartuzy"),
  k("Arka II Gdynia", "Gdynia", "AG2", undefined, "81-538 Gdynia, ul. Olimpijska 5"),
  k("Pogoń Lębork", "Lębork", "PLĘ", "Stadion Miejski w Lęborku", "ul. Kusocińskiego 56, 84-300 Lębork"),
  k("Gryf Wejherowo", "Wejherowo", "GWE", "Stadion WKS Gryf Wejherowo", "ul. Wzgórze Wolności 1, 84-200 Wejherowo"),
  k("Gryf Słupsk", "Słupsk", "GSŁ", "Stadion przy ul. Zielonej", "ul. Zielona 9, 76-200 Słupsk"),
  k("Sokół Bożepole Wielkie", "Bożepole Wielkie", "SBW", "Sokół Arena"),
  k("Radunia Stężyca", "Stężyca", "RST", "Arena Radunia", "ul. Abrahama 11, 83-322 Stężyca"),
  k("KP Starogard Gdański", "Starogard Gdański", "KSG", "Stadion Miejski im. Kazimierza Deyny", "ul. Olimpijczyków Starogardzkich 1, 83-200 Starogard Gdański"),
  k("Anioły Garczegorze", "Garczegorze", "ANG", "Boisko Gminne Sahara", "Garczegorze 38, 84-351 Garczegorze"),
  k("Stoczniowiec Gdańsk", "Gdańsk", "STO", "Stadion SKS Polonia", "ul. Marynarki Polskiej 177, 80-868 Gdańsk"),
  k("Wierzyca Pelplin", "Pelplin", "WIP", "Stadion Miejski w Pelplinie", "Plac Grunwaldzki 2, 83-130 Pelplin"),
  k("Jaguar Gdańsk", "Gdańsk", "JAG", "Stadion Jaguar Kokoszki", "ul. Budowlanych 49/5, 80-298 Gdańsk"),
  k("Powiśle Dzierzgoń", "Dzierzgoń", "PWD", "Stadion DKS Powiśle Dzierzgoń", "ul. Krzywa 19, 82-440 Dzierzgoń"),
  k("Chojniczanka II Chojnice", "Chojnice", "CH2", "Stadion Miejski Chojniczanka 1930", "ul. A. Mickiewicza 12, 89-600 Chojnice"),
  k("Stolem Gniewino", "Gniewino", "STG", "Stadion GOTiS", "ul. Sportowa 1, 84-250 Gniewino"),
  k("Dolina Speranda Niepoględzie", "Niepoględzie", "DSN"),
  k("Sparta Sycewice", "Sycewice", "SPS", undefined, "Szkolna 1, 76-256 Sycewice"),
];

// Poziom 6 — V liga pomorska, grupa Gdańsk I (2025/2026). Źródło: pomorskifutbol.pl.
const V_LIGA_GDANSK1: KlubDane[] = [
  k("Amator Kiełpino", "Kiełpino", "AMK"),
  k("Salos Rumia", "Rumia", "SAL"),
  k("AP Kowale", "Kowale", "APK"),
  k("Orlęta Reda", "Reda", "ORE", "Stadion MOSiR w Redzie", "ul. Łąkowa 59, 84-240 Reda"),
  k("Osiczanka Osice", "Osice", "OSI"),
  k("Wikęd II Luzino", "Luzino", "WL2", "Stadion GOSRiT Luzino", "ul. Mickiewicza 22, 84-242 Luzino"),
  k("Orzeł Straszyn", "Straszyn", "ORS", undefined, "ul. Kwiatowa 22 a, 83-010 Straszyn"),
  k("Gedania II Gdańsk", "Gdańsk", "GE2", "Centrum Sportu i Edukacji GKS Gedania 1922", "al. Gen. Józefa Hallera 201, 80-416 Gdańsk"),
  k("MKS Władysławowo", "Władysławowo", "MKW", "Stadion Miejski im. Władysława Króla", "ul. Gdańska, 84-120 Władysławowo"),
  k("TLG Gdańsk", "Gdańsk", "TLG"),
  k("KS Chwaszczyno", "Chwaszczyno", "KCH"),
  k("GKS Kolbudy", "Kolbudy", "GK", undefined, "ul. Polna, 83-200 Kolbudy"),
  k("Latarnik Choczewo", "Choczewo", "LAT"),
  k("Orzeł Trąbki Wielkie", "Trąbki Wielkie", "OTW"),
  k("Bałtyk Gdynia", "Gdynia", "BAŁ", "Narodowy Stadion Rugby w Gdyni", "ul. Olimpijska 5/9, 81-538 Gdynia"),
  k("Jaguar II Gdańsk", "Gdańsk", "JA2", "Stadion Jaguar Kokoszki", "ul. Budowlanych 49/5, 80-298 Gdańsk"),
];

// Poziom 7 — Klasa A pomorska, grupa Gdańsk I (2025/2026). Źródło: pomorskifutbol.pl.
const KLASA_A_GDANSK1: KlubDane[] = [
  k("Gryf II Wejherowo", "Wejherowo", "GW2"),
  k("Cassubian AP", "Żukowo", "CAS"),
  k("Start Mrzezino", "Mrzezino", "SMR", undefined, "ul. Lipowa 10, 84-123 Połchowo"),
  k("Ogniwo Sopot", "Sopot", "OGS"),
  k("KP Gdynia AP", "Gdynia", "KPG"),
  k("Bałtyk II Gdynia", "Gdynia", "BA2"),
  k("Pomorzanin Gdynia", "Gdynia", "POG"),
  k("Stolem II Gniewino", "Gniewino", "ST2"),
  k("Sopocka Akademia Piłkarska", "Sopot", "SAP"),
  k("Dragon Bojano", "Bojano", "DRB"),
  k("Orlęta II Reda", "Reda", "OIR"),
  k("Sztorm Kosakowo", "Kosakowo", "SZK"),
  k("Barca Bolszewo", "Bolszewo", "BAB"),
  k("Orkan Rumia MKS", "Rumia", "ORU"),
];

// Poziom 8 — Klasa B pomorska, grupa Gdańsk I (2025/2026). Źródło: pomorskifutbol.pl.
const KLASA_B_GDANSK1: KlubDane[] = [
  k("Kaszubia Starzyno", "Starzyno", "KAS", undefined, "ul. Nowa 84-107 Starzyno"),
  k("Puma Darżlubie", "Darżlubie", "PD"),
  k("Feniks Mechowo", "Mechowo", "FEM"),
  k("Latarnik II Choczewo", "Choczewo", "LA2"),
  k("Arka Prusewo", "Prusewo", "ARP"),
  k("Solar Władysławowo", "Władysławowo", "SW"),
  k("MKS II Władysławowo", "Władysławowo", "MW2"),
  k("Norda Karwia", "Karwia", "NOK", undefined, "ul.Dobra 84-105 Karwia"),
  k("Ajax Leśniewo", "Leśniewo", "AJL"),
  k("Stolem III Gniewino", "Gniewino", "ST3"),
  k("Huragan Smolno", "Smolno", "HUS"),
  k("Zatoka Puck", "Puck", "ZAP"),
  k("Jastrząb Domatowo", "Domatowo", "JAD"),
];

/** Ścieżka pomorska — podokręg gdański (8 szczebli: w pomorskim nie ma klasy okręgowej). */
export const POMORSKIE: Sciezka = {
  id: "pomorskie-gdansk",
  nazwa: "Pomorskie — podokręg Gdańsk",
  ligi: [
    ...GORA_KRAJOWA,
    { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 },
    { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Gdańsk I)", kluby: V_LIGA_GDANSK1 },
    { nazwa: "Klasa A pomorska (Gdańsk I)", kluby: KLASA_A_GDANSK1 },
    { nazwa: "Klasa B pomorska (Gdańsk I)", kluby: KLASA_B_GDANSK1 },
  ],
};

// ——— Podokręg SŁUPSK (źródło: pomorskifutbol.pl) ———
// Poziom 6 — V liga pomorska, grupa Słupsk.
const V_LIGA_SLUPSK: KlubDane[] = [
  k("Gryf II Słupsk", "Słupsk", "GS2", "Stadion przy ul. Zielonej", "ul. Zielona 9, 76-200 Słupsk"),
  k("Piast Człuchów", "Człuchów", "PC"),
  k("Kaszubia Studzienice", "Studzienice", "KST"),
  k("KS Włynkówko", "Włynkówko", "KWŁ"),
  k("Start Łeba", "Łeba", "SŁĘ"),
  k("Skotawia Dębnica Kaszubska", "Dębnica Kaszubska", "SDK", undefined, "76-248 Dębnica Kaszubska ul. Zjednoczenia 16 a"),
  k("Granit Kończewo", "Kończewo", "GRK", undefined, "ul. Główna 23/12, Kończewo"),
  k("Jantar Ustka", "Ustka", "JAU", "Stadion Miejski w Ustce", "ul. Sportowa 17, 76-270 Ustka"),
  k("Sokół Wyczechy", "Wyczechy", "SWY"),
  k("Start Miastko", "Miastko", "STM", "Stadion Miejski w Miastku", "ul. Grunwaldzka 1, 77-200 Miastko"),
  k("Myśliwiec Tuchomie", "Tuchomie", "MYT"),
  k("Pomorze Potęgowo", "Potęgowo", "PPO"),
  k("Bytovia Bytów", "Bytów", "BB", "Stadion MOSiR w Bytowie", "ul. Mickiewicza 13, 77-100 Bytów"),
  k("Stal Jezierzyce", "Jezierzyce", "STJ"),
  k("Lew Lębork", "Lębork", "LEL"),
  k("Słupia Kobylnica", "Kobylnica", "SŁK", undefined, "Kobylnica, ul. Wodna 15"),
];

// Poziom 7 — Klasa A pomorska, grupa Słupsk I.
const KLASA_A_SLUPSK1: KlubDane[] = [
  k("Wybrzeże Objazda", "Objazda", "WYO"),
  k("GTS Czarna Dąbrówka", "Czarna Dąbrówka", "GCD"),
  k("Diament Trzebielino", "Trzebielino", "DIT"),
  k("Jantaria Pobłocie", "Pobłocie", "JAP"),
  k("Polonez Bobrowniki", "Bobrowniki", "POB", undefined, "Damno, 76-231 Damnica"),
  k("Echo Biesowice", "Biesowice", "ECB"),
  k("KS Zaleskie", "Zaleskie", "KZA"),
  k("KS Damnica", "Damnica", "KDA"),
  k("Błękitni Główczyce", "Główczyce", "BŁG"),
  k("LKS Łebunia", "Łebunia", "LŁE"),
  k("Wembley Mosty", "Mosty", "WEM"),
  k("Barton Barcino", "Barcino", "BAR"),
  k("Unison Machowino", "Machowino", "UNM"),
];

// Poziom 8 — Klasa B pomorska, grupa Słupsk I.
const KLASA_B_SLUPSK1: KlubDane[] = [
  k("Jantar II Ustka", "Ustka", "JU2"),
  k("Sokół Szczypkowice", "Szczypkowice", "SSZ"),
  k("Słupia II Kobylnica", "Kobylnica", "SIK"),
  k("Skotawia II Dębnica Kaszubska", "Dębnica Kaszubska", "SID"),
  k("Stal II Jezierzyce", "Jezierzyce", "SJ2"),
  k("Garbarnia Kępice", "Kępice", "GAK", undefined, "Kępice 77-230 ul. Leśna 2"),
  k("Szansa Siemianice", "Siemianice", "SZS"),
  k("Rowokół Smołdzino", "Smołdzino", "ROS"),
  k("Żelki Żelkowo", "Żelkowo", "ŻEŻ"),
  k("Gryf Słupsk KS", "KS", "GSK"),
  k("Sokół Kuleszewo", "Kuleszewo", "SOK", undefined, "Kuleszewo 24, 76-251 Kobylnica"),
  k("Sparta II Sycewice", "Sycewice", "SIS"),
];

/** Ścieżka pomorska — podokręg słupski (8 szczebli; góra wspólna z Gdańskiem). */
export const POMORSKIE_SLUPSK: Sciezka = {
  id: "pomorskie-slupsk",
  nazwa: "Pomorskie — podokręg Słupsk",
  ligi: [
    ...GORA_KRAJOWA,
    { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 },
    { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Słupsk)", kluby: V_LIGA_SLUPSK },
    { nazwa: "Klasa A pomorska (Słupsk I)", kluby: KLASA_A_SLUPSK1 },
    { nazwa: "Klasa B pomorska (Słupsk I)", kluby: KLASA_B_SLUPSK1 },
  ],
};

// ——— Podokręg GDAŃSK II / III i MALBORK (źródło: pomorskifutbol.pl) ———
// Poziom 6 — V liga pomorska, grupa Gdańsk II (wspólna dla podokręgów Gdańsk II/III i Malbork).
const V_LIGA_GDANSK2: KlubDane[] = [
  k("Wietcisa Skarszewy", "Skarszewy", "WIS", undefined, "ul. Wybickiego 10, 83-250 Skarszewy"),
  k("Pomezania Malbork", "Malbork", "PM", "Stadion Miejski w Malborku", "ul. Toruńska 60, 82-200 Malbork"),
  k("Żuławy Nowy Dwór Gdański", "Nowy Dwór Gdański", "ŻUŁ", undefined, "Ul. Warszawska 22, 82-100 Nowy Dwór Gdański"),
  k("Mady Ostaszewo", "Ostaszewo", "MAO", undefined, "82-112 Ostaszewo"),
  k("Relax Ryjewo", "Ryjewo", "RER"),
  k("Kaszubia Kościerzyna", "Kościerzyna", "KAK", "Stadion Miejski w Kościerzynie", "ul. Sikorskiego 1, 83-400 Kościerzyna"),
  k("Rodło Kwidzyn", "Kwidzyn", "ROK", "Stadion KCSiR w Kwidzynie", "ul. Sportowa 6, 82-500 Kwidzyn"),
  k("KS Skorzewo", "Skorzewo", "KSK"),
  k("Victoria Kaliska", "Kaliska", "VKA"),
  k("DSPN Supra Kwidzyn", "Kwidzyn", "DSK"),
  k("Pogoń Prabuty", "Prabuty", "POP"),
  k("Kolejarz Chojnice", "Chojnice", "KOC", undefined, "89-600 Chojnice, ul. Lichnowska 1"),
  k("Gryf Tczew KP", "Tczew", "GTC", "Stadion Miejski im. Alfonsa Guzińskiego", "ul. Elżbiety 21a, 83-110 Tczew"),
  k("Błękitni Stare Pole", "Stare Pole", "BSP", undefined, "ul. Marynarki Wojennej 7, 82-220 Stare Pole"),
  k("Centrum Pelplin", "Pelplin", "CEP", undefined, "ul. Mickiewicza 19/8, 83-130 Pelplin"),
  k("Styna Godziszewo", "Godziszewo", "STG2"),
];

const KLASA_A_GDANSK2: KlubDane[] = [
  k("KS Mściszewice", "Mściszewice", "KMŚ"),
  k("Czarni II Pruszcz Gdański", "Pruszcz Gdański", "CZ2"),
  k("Jaguar III Gdańsk", "Gdańsk", "JA3"),
  k("Gryf Goręczyno", "Goręczyno", "GGO"),
  k("Portowiec Gdańsk", "Gdańsk", "POR"),
  k("Stoczniowiec II Gdańsk", "Gdańsk", "ST2G"),
  k("Korona Cedry Małe", "Cedry Małe", "KCM"),
  k("Cartusia II Kartuzy", "Kartuzy", "CA2"),
  k("Orlik Przodkowo", "Przodkowo", "ORP"),
  k("Sporting Leźno", "Leźno", "SPL"),
  k("GTS Rotmanka", "Rotmanka", "GRO"),
  k("GKS Sierakowice", "Sierakowice", "GSI", undefined, "83-340 Sierakowice ul.Kartuska 27"),
  k("Czarni Przemysław", "Żukowo", "CZP"),
  k("GLKS Różyny", "Różyny", "GLR"),
];

const KLASA_B_GDANSK2: KlubDane[] = [
  k("LZS Kębłowo", "Kębłowo", "LZK"),
  k("AP Koleczkowo", "Koleczkowo", "AK"),
  k("Dragon II Bojano", "Bojano", "DIB"),
  k("Jordania Sopot", "Sopot", "JOS"),
  k("Eko-Prod Szemud", "Szemud", "EPS", undefined, "84-217 Szemud, ul. Wejherowska"),
  k("Wikęd III Luzino", "Luzino", "WL3"),
  k("Wieniec Gowino", "Gowino", "WG"),
  k("Zenit Łęczyce", "Łęczyce", "ZEŁ"),
  k("Orły Osowa", "Osowa", "OO"),
  k("Sokół II Bożepole Wielkie", "Bożepole Wielkie", "SIB"),
];

const KLASA_A_GDANSK3: KlubDane[] = [
  k("Wda Lipusz", "Lipusz", "WDL", undefined, "83-424 Lipusz, ul. Sosnowa 1"),
  k("Czarni Piece", "Piece", "CZI"),
  k("Wicher Lichnowy", "Lichnowy", "WLI"),
  k("Słupia Sulęczyno", "Sulęczyno", "SŁS"),
  k("Radunia II Stężyca", "Stężyca", "RA2"),
  k("Tęcza Brusy", "Brusy", "TBR", undefined, "89-632 Brusy ul. Armii Krajowej"),
  k("Sokół Zblewo", "Zblewo", "SZB"),
  k("Jantar Pawłowo", "Pawłowo", "JPA"),
  k("Borowiak Czersk", "Czersk", "BOC", undefined, "ul. Łąkowa 21 B, 89-650 Czersk"),
  k("Sokół Lubichowo", "Lubichowo", "SOL"),
  k("Gwiazda Karsin", "Karsin", "GKA"),
  k("AP Przywidz", "Przywidz", "APP"),
  k("Wietcisa II Skarszewy", "Skarszewy", "WI2"),
  k("MKP Szlachta", "Szlachta", "MSZ"),
];

const KLASA_B_GDANSK3: KlubDane[] = [
  k("Chełmianka Gdańsk", "Gdańsk", "CHG"),
  k("Olimpia Osowa", "Gdańsk", "OLO"),
  k("Zatoka Gdańsk", "Gdańsk", "ZAG"),
  k("KS Sulmin", "Sulmin", "KSU"),
  k("TLG II Gdańsk", "Gdańsk", "TIG"),
  k("Gedania III Gdańsk", "Gdańsk", "GE3"),
  k("Morena Gdańsk", "Gdańsk", "MOG", undefined, "ul. Czecha 2b/10, 80-288 Gdańsk"),
  k("UKS Klukowo", "Klukowo", "UKK", undefined, "Gdańsk ul. Radarowa 26"),
  k("Orlik II Przodkowo", "Przodkowo", "OIP"),
  k("AP II Kowale", "Kowale", "AK2"),
  k("GKS Żukowo", "Żukowo", "GŻU"),
  k("Jaguar IV Gdańsk", "Gdańsk", "JIG"),
  k("FPT Banino", "Banino", "FB"),
];

const KLASA_A_MALBORK: KlubDane[] = [
  k("Olimpia Sztum", "Sztum", "OLS", undefined, "Ul. Reja 14 82-400 Sztum"),
  k("Świt Radostowo", "Radostowo", "ŚWR"),
  k("GKS Bobowo", "Bobowo", "GBO", undefined, "ul. Rzeczna 29, 83-212 Bobowo"),
  k("Spójnia Sadlinki", "Sadlinki", "SPS2"),
  k("GKS Gardeja", "Gardeja", "GGA"),
  k("Delta Miłoradz", "Miłoradz", "DEM"),
  k("Wisła Korzeniewo", "Korzeniewo", "WIK", undefined, "ul. Łąkowa 9; 82-500 Kwidzyn"),
  k("Błyskawica Postolin", "Postolin", "BŁP", undefined, "Postolin 21, 82-400 Sztum"),
  k("Powiśle Pawlice-Rakowiec", "Rakowiec", "POW", undefined, "ul. Jaśminowa 24, 82-500 Rakowiec"),
  k("Rodło Trzciano", "Trzciano", "ROT", undefined, "Trzciano 20/1, 82-420 Ryjewo"),
  k("Amatorka Mikołajki Pomorskie", "Mikołajki Pomorskie", "AMP"),
  k("Orzeł Subkowy", "Subkowy", "ORSU", undefined, "83-120 Subkowy, ul Sportowa 3A"),
  k("Ruch Gościszewo", "Gościszewo", "RUG"),
  k("Jurand Lasowice", "Lasowice", "JUL", undefined, "Lasowice Wielkie, 82-200 Malbork"),
];

const KLASA_B_MALBORK: KlubDane[] = [
  k("Dąbrowiak Dąbrówka", "Dąbrówka", "DĄD"),
  k("Dynastia Gniew", "Gniew", "DG"),
  k("Pogoń Smętowo", "Smętowo", "POSM"),
  k("Pomorzanka Skórcz", "Skórcz", "POS"),
  k("WSS Obrzynowo", "Obrzynowo", "WSO"),
  k("Szpak Skórcz", "Skórcz", "SZS2"),
  k("Oldboys Kwidzyn", "Kwidzyn", "OLK"),
  k("WKS Lignowy Szlacheckie", "Lignowy Szlacheckie", "WLS"),
  k("Korona Rywałd", "Rywałd", "KOR"),
  k("Meteor Pinczyn", "Pinczyn", "MEP"),
  k("Sobieski Gniew", "Gniew", "SOG"),
  k("Pogoń II Prabuty", "Prabuty", "PIP"),
];

const KLASA_A_SLUPSK2: KlubDane[] = [
  k("Sparta Konarzyny", "Konarzyny", "SPK"),
  k("Urania Udorpie", "Udorpie", "URU"),
  k("Orkan Gostkowo", "Gostkowo", "ORG"),
  k("MKS Debrzno", "Debrzno", "MDE"),
  k("KS Bytów", "Bytów", "KBY"),
  k("Bytovia II Bytów", "Bytów", "BY2"),
  k("Lipniczanka Lipnica", "Lipnica", "LIL"),
  k("Grom Nakla", "Nakla", "GNA"),
  k("Kaszubia II Studzienice", "Studzienice", "KA2"),
  k("Chojniczanka III Chojnice", "Chojnice", "CH3", "Stadion Miejski Chojniczanka 1930", "ul. A. Mickiewicza 12, 89-600 Chojnice"),
  k("Brda Przechlewo", "Przechlewo", "BPR"),
  k("Kolejarz II Chojnice", "Chojnice", "KO2"),
  k("Czarni Czarne", "Czarne", "CZC", undefined, "77-330 Czarne, ul. Moniuszki 12"),
];

const KLASA_B_SLUPSK2: KlubDane[] = [
  k("Granit Koczała", "Koczała", "GRC"),
  k("Anioły II Garczegorze", "Garczegorze", "AN2"),
  k("GKS Kołczygłowy", "Kołczygłowy", "GKO"),
  k("Pogoń II Lębork", "Lębork", "PL2"),
  k("Lew II Lębork", "Lębork", "LE2"),
  k("Baza 44 Siemirowice", "Siemirowice", "B44", undefined, "84-313 -Siemirowice Os. Na Skarpie 25 (Klub Garnizonowy)"),
  k("WKS Nożyno", "Nożyno", "WNO"),
  k("Start Łebień", "Łebień", "SŁB"),
  k("Motor Zwartowo", "Zwartowo", "MOZ"),
  k("KS Kamienica Królewska", "Królewska", "KKK"),
  k("Błękitni Motarzyno", "Motarzyno", "BŁM", undefined, "Motarzyno 6, 77-112 Motarzyno"),
  k("Victoria Dąbrówka", "Dąbrówka", "VDĄ"),
];

/** Pomorskie podokręg + grupy A/B — każda ścieżka to pełna piramida (góra wspólna). */
export const POMORSKIE_GDANSK2: Sciezka = {
  id: "pomorskie-gdansk2", nazwa: "Pomorskie — podokręg Gdańsk II",
  ligi: [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 }, { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Gdańsk II)", kluby: V_LIGA_GDANSK2 }, { nazwa: "Klasa A pomorska (Gdańsk II)", kluby: KLASA_A_GDANSK2 }, { nazwa: "Klasa B pomorska (Gdańsk II)", kluby: KLASA_B_GDANSK2 }],
};
export const POMORSKIE_GDANSK3: Sciezka = {
  id: "pomorskie-gdansk3", nazwa: "Pomorskie — podokręg Gdańsk III (Kościerzyna/Chojnice)",
  ligi: [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 }, { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Gdańsk II)", kluby: V_LIGA_GDANSK2 }, { nazwa: "Klasa A pomorska (Gdańsk III)", kluby: KLASA_A_GDANSK3 }, { nazwa: "Klasa B pomorska (Gdańsk III)", kluby: KLASA_B_GDANSK3 }],
};
export const POMORSKIE_MALBORK: Sciezka = {
  id: "pomorskie-malbork", nazwa: "Pomorskie — podokręg Malbork",
  ligi: [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 }, { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Gdańsk II)", kluby: V_LIGA_GDANSK2 }, { nazwa: "Klasa A pomorska (Malbork IV)", kluby: KLASA_A_MALBORK }, { nazwa: "Klasa B pomorska (Malbork VII)", kluby: KLASA_B_MALBORK }],
};
export const POMORSKIE_SLUPSK2: Sciezka = {
  id: "pomorskie-slupsk2", nazwa: "Pomorskie — podokręg Słupsk II (Bytów/Chojnice)",
  ligi: [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 }, { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Słupsk)", kluby: V_LIGA_SLUPSK }, { nazwa: "Klasa A pomorska (Słupsk II)", kluby: KLASA_A_SLUPSK2 }, { nazwa: "Klasa B pomorska (Słupsk II)", kluby: KLASA_B_SLUPSK2 }],
};

// ——— Pozostałe grupy Klasy B (źródło: pomorskifutbol.pl) — komplet 10 grup B klasy ———
const KLASA_B_GDANSK4: KlubDane[] = [
  k("Motława Suchy Dąb", "Suchy Dąb", "MSD"),
  k("Wisła Długie Pole", "Długie Pole", "WDP"),
  k("GTS Juszkowo", "Juszkowo", "GJU"),
  k("Potok Pszczółki", "Pszczółki", "PPS"),
  k("Sokół Ełganowo", "Ełganowo", "SEŁ"),
  k("Styna II Godziszewo", "Godziszewo", "SG2"),
  k("AP Merchel Kolbudy", "Kolbudy", "AMK"),
  k("GTS Mokry Dwór", "Mokry Dwór", "GMD"),
  k("GTS Pruszcz Gdański", "Pruszcz Gdański", "GPG"),
  k("KS Grabiny Zameczek", "Grabiny Zameczek", "KGZ"),
  k("Osiczanka II Osice", "Osice", "OS2"),
  k("SPZZ Przejazdowo", "Przejazdowo", "SP"),
];

const KLASA_B_GDANSK5: KlubDane[] = [
  k("Wierzyca Stara Kiszewa", "Stara Kiszewa", "WSK"),
  k("Huragan Nowe Polaszki", "Nowe Polaszki", "HNP", undefined, "ul. Stadionowa 10, 83-420 Nowe Polaszki"),
  k("LZS Więckowy", "Więckowy", "LW"),
  k("LKP Nowa Karczma", "Nowa Karczma", "LNK"),
  k("KS Dziemiany", "Dziemiany", "KDZ"),
  k("Orzeł Gołubie", "Gołubie", "ORGO"),
  k("Amator II Kiełpino", "Kiełpino", "AM2"),
  k("Grom Kleszczewo", "Kleszczewo", "GRK2"),
  k("GKS II Żukowo", "Żukowo", "GŻ2"),
  k("Słupia II Sulęczyno", "Sulęczyno", "SIS"),
  k("Ceramik Łubiana", "Łubiana", "CEŁ"),
  k("Remus Mirachowo", "Mirachowo", "REM"),
  k("Santana Wielki Klincz", "Wielki Klincz", "SWK"),
  k("FC Gowidlino", "Gowidlino", "FCG"),
];

const KLASA_B_GDANSK6: KlubDane[] = [
  k("Borowiak II Czersk", "Czersk", "BO2"),
  k("KS Bytonia", "Bytonia", "KB"),
  k("Zieloni Łąg", "Łąg", "ZŁĄ"),
  k("Wda Czarna Woda", "Czarna Woda", "WCW"),
  k("Tęcza II Brusy", "Brusy", "TB2"),
  k("Nowi Nowa Cerkiew", "Nowa Cerkiew", "NNC"),
  k("Brda Rytel", "Rytel", "BRY", undefined, "ul. Jatowska 12, 89-642 Rytel"),
  k("Brda Wielkie Chełmy", "Wielkie Chełmy", "BWC"),
  k("Orkan Huta", "Huta", "ORH"),
  k("Perła Czyczkowy", "Czyczkowy", "PCZ2"),
  k("Grom Leśno", "Leśno", "GLE"),
  k("Orzeł Osowo", "Osowo", "OSW"),
  k("Unia Klawkowo", "Klawkowo", "UKL"),
];

const KLASA_B_MALBORK8: KlubDane[] = [
  k("Skra Kończewice", "Kończewice", "SKK"),
  k("Grom II Nowy Staw", "Nowy Staw", "GR2"),
  k("AP Malbork", "Malbork", "APM"),
  k("Bałtyk Sztutowo", "Sztutowo", "BAS", undefined, "ul. Obozowa 16, 82-110 Sztutowo"),
  k("LKS Waplewo", "Waplewo", "LWA"),
  k("Nogat Malbork", "Malbork", "NOM"),
  k("Real Myszewo", "Myszewo", "REMY"),
  k("KS Czernin", "Czernin", "KCZ"),
  k("AS Nowy Dwór Gdański", "Nowy Dwór Gdański", "ASN"),
  k("GKS Straszewo", "Straszewo", "GST"),
  k("Żuławy II Nowy Dwór Gdański", "Nowy Dwór Gdański", "ŻU2"),
  k("Lisovia Lisewo", "Lisewo", "LIS"),
  k("Tęcza Szropy", "Szropy", "TSZ"),
];

export const POMORSKIE_GDANSK4: Sciezka = {
  id: "pomorskie-gdansk4", nazwa: "Pomorskie — podokręg Gdańsk IV (Pruszcz Gd.)",
  ligi: [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 }, { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Gdańsk II)", kluby: V_LIGA_GDANSK2 }, { nazwa: "Klasa A pomorska (Gdańsk II)", kluby: KLASA_A_GDANSK2 }, { nazwa: "Klasa B pomorska (Gdańsk IV)", kluby: KLASA_B_GDANSK4 }],
};
export const POMORSKIE_GDANSK5: Sciezka = {
  id: "pomorskie-gdansk5", nazwa: "Pomorskie — podokręg Gdańsk V (Kościerzyna)",
  ligi: [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 }, { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Gdańsk II)", kluby: V_LIGA_GDANSK2 }, { nazwa: "Klasa A pomorska (Gdańsk III)", kluby: KLASA_A_GDANSK3 }, { nazwa: "Klasa B pomorska (Gdańsk V)", kluby: KLASA_B_GDANSK5 }],
};
export const POMORSKIE_GDANSK6: Sciezka = {
  id: "pomorskie-gdansk6", nazwa: "Pomorskie — podokręg Gdańsk VI (Starogard/Brusy)",
  ligi: [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 }, { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Gdańsk II)", kluby: V_LIGA_GDANSK2 }, { nazwa: "Klasa A pomorska (Gdańsk III)", kluby: KLASA_A_GDANSK3 }, { nazwa: "Klasa B pomorska (Gdańsk VI)", kluby: KLASA_B_GDANSK6 }],
};
export const POMORSKIE_MALBORK2: Sciezka = {
  id: "pomorskie-malbork2", nazwa: "Pomorskie — podokręg Malbork VIII (Żuławy)",
  ligi: [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. II", kluby: III_LIGA_GR2 }, { nazwa: "IV liga pomorska", kluby: IV_LIGA_POMORSKA },
    { nazwa: "V liga pomorska (Gdańsk II)", kluby: V_LIGA_GDANSK2 }, { nazwa: "Klasa A pomorska (Malbork IV)", kluby: KLASA_A_MALBORK }, { nazwa: "Klasa B pomorska (Malbork VIII)", kluby: KLASA_B_MALBORK8 }],
};

// ——— Herby wgrane przez właściciela (III liga → klasa B, oba podokręgi) ———
// Pliki w assets/herby/pomorskie/ ; mapowanie id → plik w herby.ts. Przypisanie po nazwie klubu.
const HERBY_POMORSKIE: Record<string, string> = {
  "AP Koleczkowo": "pom-ap-koleczkowo",
  "AP Malbork": "pom-ap-malbork",
  "Ajax Leśniewo": "pom-ajax-lesniewo",
  "Amator II Kiełpino": "pom-amator-ii-kielpino",
  "Amator Kiełpino": "pom-amator-kielpino",
  "Anioły Garczegorze": "pom-anioly-garczegorze",
  "Anioły II Garczegorze": "pom-anioly-ii-garczegorze",
  "Arka II Gdynia": "pom-arka-ii-gdynia",
  "Arka Prusewo": "pom-arka-prusewo",
  "Barton Barcino": "pom-barton-barcino",
  "Baza 44 Siemirowice": "pom-baza-44-siemirowice",
  "Bałtyk Gdynia": "pom-baltyk-gdynia",
  "Bałtyk II Gdynia": "pom-baltyk-ii-gdynia",
  "Bałtyk Koszalin": "pom-baltyk-koszalin",
  "Bałtyk Sztutowo": "pom-baltyk-sztutowo",
  "Borowiak Czersk": "pom-borowiak-czersk",
  "Brda Przechlewo": "pom-brda-przechlewo",
  "Brda Rytel": "pom-brda-rytel",
  "Bytovia Bytów": "pom-bytovia-bytow",
  "Bytovia II Bytów": "pom-bytovia-ii-bytow",
  "Błyskawica Postolin": "pom-blyskawica-postolin",
  "Błękitni Główczyce": "pom-blekitni-glowczyce",
  "Błękitni Motarzyno": "pom-blekitni-motarzyno",
  "Błękitni Stare Pole": "pom-blekitni-stare-pole",
  "Błękitni Stargard": "pom-blekitni-stargard",
  "Cartusia II Kartuzy": "pom-cartusia-ii-kartuzy",
  "Cartusia Kartuzy": "pom-cartusia-kartuzy",
  "Centrum Pelplin": "pom-centrum-pelplin",
  "Ceramik Łubiana": "pom-ceramik-lubiana",
  "Chemik Bydgoszcz": "pom-chemik-bydgoszcz",
  "Chełmianka Gdańsk": "pom-chelmianka-gdansk",
  "Chojniczanka II Chojnice": "pom-chojniczanka-ii-chojnice",
  "Chojniczanka III Chojnice": "pom-chojniczanka-iii-chojnice",
  "Czarni Czarne": "pom-czarni-czarne",
  "Czarni II Pruszcz Gdański": "pom-czarni-ii-pruszcz-gdanski",
  "Czarni Piece": "pom-czarni-piece",
  "Czarni Pruszcz Gdański": "pom-czarni-pruszcz-gdanski",
  "Czarni Przemysław": "pom-czarni-przemyslaw",
  "DSPN Supra Kwidzyn": "pom-dspn-supra-kwidzyn",
  "Delta Miłoradz": "pom-delta-miloradz",
  "Diament Trzebielino": "pom-diament-trzebielino",
  "Dolina Speranda Niepoględzie": "pom-dolina-speranda-niepogledzie",
  "Dragon Bojano": "pom-dragon-bojano",
  "Dragon II Bojano": "pom-dragon-ii-bojano",
  "Echo Biesowice": "pom-echo-biesowice",
  "Eko-Prod Szemud": "pom-eko-prod-szemud",
  "Elana Toruń": "pom-elana-torun",
  "FC Gowidlino": "pom-fc-gowidlino",
  "Flota Świnoujście": "pom-flota-swinoujscie",
  "GKS Bobowo": "pom-gks-bobowo",
  "GKS II Żukowo": "pom-gks-ii-zukowo",
  "GKS Kolbudy": "pom-gks-kolbudy",
  "GKS Kołczygłowy": "pom-gks-kolczyglowy",
  "GKS Sierakowice": "pom-gks-sierakowice",
  "GKS Straszewo": "pom-gks-straszewo",
  "GKS Żukowo": "pom-gks-zukowo",
  "GLKS Różyny": "pom-glks-rozyny",
  "GTS Czarna Dąbrówka": "pom-gts-czarna-dabrowka",
  "GTS Juszkowo": "pom-gts-juszkowo",
  "GTS Mokry Dwór": "pom-gts-mokry-dwor",
  "GTS Pruszcz Gdański": "pom-gts-pruszcz-gdanski",
  "Garbarnia Kępice": "pom-garbarnia-kepice",
  "Gedania Gdańsk": "pom-gedania-gdansk",
  "Gedania II Gdańsk": "pom-gedania-ii-gdansk",
  "Granit Koczała": "pom-granit-koczala",
  "Granit Kończewo": "pom-granit-konczewo",
  "Grom II Nowy Staw": "pom-grom-ii-nowy-staw",
  "Grom Leśno": "pom-grom-lesno",
  "Grom Nakla": "pom-grom-nakla",
  "Grom Nowy Staw": "pom-grom-nowy-staw",
  "Gryf Goręczyno": "pom-gryf-goreczyno",
  "Gryf II Słupsk": "pom-gryf-ii-slupsk",
  "Gryf II Wejherowo": "pom-gryf-ii-wejherowo",
  "Gryf Słupsk": "pom-gryf-slupsk",
  "Gryf Tczew KP": "pom-gryf-tczew-kp",
  "Gryf Wejherowo": "pom-gryf-wejherowo",
  "Gwiazda Karsin": "pom-gwiazda-karsin",
  "Huragan Nowe Polaszki": "pom-huragan-nowe-polaszki",
  "Huragan Smolno": "pom-huragan-smolno",
  "Jaguar Gdańsk": "pom-jaguar-gdansk",
  "Jaguar II Gdańsk": "pom-jaguar-ii-gdansk",
  "Jaguar III Gdańsk": "pom-jaguar-iii-gdansk",
  "Jantar II Ustka": "pom-jantar-ii-ustka",
  "Jantar Pawłowo": "pom-jantar-pawlowo",
  "Jantar Ustka": "pom-jantar-ustka",
  "Jantaria Pobłocie": "pom-jantaria-poblocie",
  "Jurand Lasowice": "pom-jurand-lasowice",
  "KKS 1925 Kalisz": "pom-kks-1925-kalisz",
  "KP Gdynia AP": "pom-kp-gdynia-ap",
  "KP Starogard Gdański": "pom-kp-starogard-gdanski",
  "KS Bytów": "pom-ks-bytow",
  "KS Chwaszczyno": "pom-ks-chwaszczyno",
  "KS Czernin": "pom-ks-czernin",
  "KS Damnica": "pom-ks-damnica",
  "KS Grabiny Zameczek": "pom-ks-grabiny-zameczek",
  "KS Kamienica Królewska": "pom-ks-kamienica-krolewska",
  "KS Mściszewice": "pom-ks-msciszewice",
  "KS Skorzewo": "pom-ks-skorzewo",
  "KS Sulmin": "pom-ks-sulmin",
  "KS Włynkówko": "pom-ks-wlynkowko",
  "Kaszubia II Studzienice": "pom-kaszubia-ii-studzienice",
  "Kaszubia Kościerzyna": "pom-kaszubia-koscierzyna",
  "Kaszubia Starzyno": "pom-kaszubia-starzyno",
  "Kaszubia Studzienice": "pom-kaszubia-studzienice",
  "Kluczevia Stargard": "pom-kluczevia-stargard",
  "Kolejarz Chojnice": "pom-kolejarz-chojnice",
  "Kolejarz II Chojnice": "pom-kolejarz-ii-chojnice",
  "Korona Cedry Małe": "pom-korona-cedry-male",
  "Korona Rywałd": "pom-korona-rywald",
  "Kotwica Kórnik": "pom-kotwica-kornik",
  "LKS Waplewo": "pom-lks-waplewo",
  "Latarnik Choczewo": "pom-latarnik-choczewo",
  "Latarnik II Choczewo": "pom-latarnik-ii-choczewo",
  "Lech II Poznań": "pom-lech-ii-poznan",
  "Lew Lębork": "pom-lew-lebork",
  "Lipniczanka Lipnica": "pom-lipniczanka-lipnica",
  "Lipno Stęszew": "pom-lipno-steszew",
  "Lisovia Lisewo": "pom-lisovia-lisewo",
  "MKP Szlachta": "pom-mkp-szlachta",
  "MKS Debrzno": "pom-mks-debrzno",
  "MKS II Władysławowo": "pom-mks-ii-wladyslawowo",
  "MKS Władysławowo": "pom-mks-wladyslawowo",
  "Mady Ostaszewo": "pom-mady-ostaszewo",
  "Meteor Pinczyn": "pom-meteor-pinczyn",
  "Morena Gdańsk": "pom-morena-gdansk",
  "Myśliwiec Tuchomie": "pom-mysliwiec-tuchomie",
  "Nogat Malbork": "pom-nogat-malbork",
  "Noteć Czarnków": "pom-notec-czarnkow",
  "Ogniwo Sopot": "pom-ogniwo-sopot",
  "Oldboys Kwidzyn": "pom-oldboys-kwidzyn",
  "Olimpia Osowa": "pom-olimpia-osowa",
  "Olimpia Sztum": "pom-olimpia-sztum",
  "Orkan Gostkowo": "pom-orkan-gostkowo",
  "Orkan Huta": "pom-orkan-huta",
  "Orkan Rumia MKS": "pom-orkan-rumia-mks",
  "Orlik Przodkowo": "pom-orlik-przodkowo",
  "Orlęta Reda": "pom-orleta-reda",
  "Orzeł Gołubie": "pom-orzel-golubie",
  "Orzeł Straszyn": "pom-orzel-straszyn",
  "Orzeł Subkowy": "pom-orzel-subkowy",
  "Orzeł Trąbki Wielkie": "pom-orzel-trabki-wielkie",
  "Osiczanka II Osice": "pom-osiczanka-ii-osice",
  "Osiczanka Osice": "pom-osiczanka-osice",
  "Piast Człuchów": "pom-piast-czluchow",
  "Pogoń II Lębork": "pom-pogon-ii-lebork",
  "Pogoń Lębork": "pom-pogon-lebork",
  "Pogoń Prabuty": "pom-pogon-prabuty",
  "Pogoń Smętowo": "pom-pogon-smetowo",
  "Polonez Bobrowniki": "pom-polonez-bobrowniki",
  "Polonia Środa Wielkopolska": "pom-polonia-sroda-wielkopolska",
  "Pomezania Malbork": "pom-pomezania-malbork",
  "Pomorzanin Gdynia": "pom-pomorzanin-gdynia",
  "Pomorze Potęgowo": "pom-pomorze-potegowo",
  "Portowiec Gdańsk": "pom-portowiec-gdansk",
  "Potok Pszczółki": "pom-potok-pszczolki",
  "Powiśle Dzierzgoń": "pom-powisle-dzierzgon",
  "Puma Darżlubie": "pom-puma-darzlubie",
  "Radunia II Stężyca": "pom-radunia-ii-stezyca",
  "Radunia Stężyca": "pom-radunia-stezyca",
  "Real Myszewo": "pom-real-myszewo",
  "Rodło Kwidzyn": "pom-rodlo-kwidzyn",
  "Rodło Trzciano": "pom-rodlo-trzciano",
  "Ruch Gościszewo": "pom-ruch-gosciszewo",
  "Salos Rumia": "pom-salos-rumia",
  "Santana Wielki Klincz": "pom-santana-wielki-klincz",
  "Skotawia Dębnica Kaszubska": "pom-skotawia-debnica-kaszubska",
  "Skotawia II Dębnica Kaszubska": "pom-skotawia-ii-debnica-kaszubska",
  "Skra Kończewice": "pom-skra-konczewice",
  "Sobieski Gniew": "pom-sobieski-gniew",
  "Sokół Bożepole Wielkie": "pom-sokol-bozepole-wielkie",
  "Sokół Ełganowo": "pom-sokol-elganowo",
  "Sokół II Bożepole Wielkie": "pom-sokol-ii-bozepole-wielkie",
  "Sokół Kuleszewo": "pom-sokol-kuleszewo",
  "Sokół Wyczechy": "pom-sokol-wyczechy",
  "Sokół Zblewo": "pom-sokol-zblewo",
  "Sparta Sycewice": "pom-sparta-sycewice",
  "Sporting Leźno": "pom-sporting-lezno",
  "Spójnia Sadlinki": "pom-spojnia-sadlinki",
  "Stal Jezierzyce": "pom-stal-jezierzyce",
  "Start Miastko": "pom-start-miastko",
  "Start Mrzezino": "pom-start-mrzezino",
  "Start Łeba": "pom-start-leba",
  "Stoczniowiec Gdańsk": "pom-stoczniowiec-gdansk",
  "Stoczniowiec II Gdańsk": "pom-stoczniowiec-ii-gdansk",
  "Stolem Gniewino": "pom-stolem-gniewino",
  "Stolem II Gniewino": "pom-stolem-ii-gniewino",
  "Stolem III Gniewino": "pom-stolem-iii-gniewino",
  "Styna Godziszewo": "pom-styna-godziszewo",
  "Styna II Godziszewo": "pom-styna-ii-godziszewo",
  "Szansa Siemianice": "pom-szansa-siemianice",
  "Szpak Skórcz": "pom-szpak-skorcz",
  "Sztorm Kosakowo": "pom-sztorm-kosakowo",
  "Słupia Kobylnica": "pom-slupia-kobylnica",
  "Słupia Sulęczyno": "pom-slupia-suleczyno",
  "Tęcza Brusy": "pom-tecza-brusy",
  "Tęcza II Brusy": "pom-tecza-ii-brusy",
  "Tęcza Szropy": "pom-tecza-szropy",
  "UKS Klukowo": "pom-uks-klukowo",
  "Unia Klawkowo": "pom-unia-klawkowo",
  "Unia Swarzędz": "pom-unia-swarzedz",
  "Unison Machowino": "pom-unison-machowino",
  "Urania Udorpie": "pom-urania-udorpie",
  "Victoria Dąbrówka": "pom-victoria-dabrowka",
  "Victoria Kaliska": "pom-victoria-kaliska",
  "Victoria Września": "pom-victoria-wrzesnia",
  "WKS Lignowy Szlacheckie": "pom-wks-lignowy-szlacheckie",
  "WKS Nożyno": "pom-wks-nozyno",
  "Wda Lipusz": "pom-wda-lipusz",
  "Wda Świecie": "pom-wda-swiecie",
  "Wierzyca Pelplin": "pom-wierzyca-pelplin",
  "Wierzyca Stara Kiszewa": "pom-wierzyca-stara-kiszewa",
  "Wietcisa II Skarszewy": "pom-wietcisa-ii-skarszewy",
  "Wietcisa Skarszewy": "pom-wietcisa-skarszewy",
  "Wikęd II Luzino": "pom-wiked-ii-luzino",
  "Wikęd Luzino": "pom-wiked-luzino",
  "Wisła Długie Pole": "pom-wisla-dlugie-pole",
  "Wisła Korzeniewo": "pom-wisla-korzeniewo",
  "Wybrzeże Objazda": "pom-wybrzeze-objazda",
  "Zatoka Puck": "pom-zatoka-puck",
  "Zenit Łęczyce": "pom-zenit-leczyce",
  "Zieloni Łąg": "pom-zieloni-lag",
  "Żuławy Nowy Dwór Gdański": "pom-zulawy-nowy-dwor-gdanski",
};
for (const grupa of [
  III_LIGA_GR2, IV_LIGA_POMORSKA,
  V_LIGA_GDANSK1, V_LIGA_SLUPSK, V_LIGA_GDANSK2,
  KLASA_A_GDANSK1, KLASA_A_SLUPSK1, KLASA_A_GDANSK2, KLASA_A_GDANSK3, KLASA_A_MALBORK, KLASA_A_SLUPSK2,
  KLASA_B_GDANSK1, KLASA_B_SLUPSK1, KLASA_B_GDANSK2, KLASA_B_GDANSK3, KLASA_B_MALBORK, KLASA_B_SLUPSK2,
  KLASA_B_GDANSK4, KLASA_B_GDANSK5, KLASA_B_GDANSK6, KLASA_B_MALBORK8,
]) {
  for (const kl of grupa) { const id = HERBY_POMORSKIE[kl.nazwa]; if (id) kl.herb = id; }
}

// Realne awanse/spadki pomorskiej piramidy (7 granic dla 8 szczebli), wg reguł Pomorskiego ZPN.
// Granice: Ekstra↔I · I↔II · II↔III · III↔IV · IV↔V · V↔A · A↔B.
// IV liga pomorska: 3 spadkowiczów (potwierdzone, Wikipedia); niższe szczeble ~2–3 wg rozgrywek okręgu.
const POM_WYMIANA = [3, 3, 2, 2, 3, 3, 2];

// Komplet: wszystkie realne grupy B klasy (Gdańsk I–VI, Malbork VII–VIII, Słupsk I–II) jako grywalne ścieżki.
export const POMORSKIE_REGIONY: Sciezka[] = [
  POMORSKIE, POMORSKIE_GDANSK2, POMORSKIE_GDANSK3, POMORSKIE_GDANSK4, POMORSKIE_GDANSK5, POMORSKIE_GDANSK6,
  POMORSKIE_MALBORK, POMORSKIE_MALBORK2, POMORSKIE_SLUPSK, POMORSKIE_SLUPSK2,
].map((sc) => ({ ...sc, wymiana: POM_WYMIANA }));

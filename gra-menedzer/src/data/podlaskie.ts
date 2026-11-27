// Województwo PODLASKIE — piramida IV liga → klasa A (sezon 2026/2027). W podlaskim NIE MA klasy B
// (regulamin Podlaskiego ZPN 2026/27, zał. 3: „spadków z klasy A nie przewiduje się”; potwierdza pl.wikipedia i regiowyniki).
// Źródło składów: regiowyniki.pl (pełne tabele, stan 27.11.2026), IV liga zgodna z pl.wikipedia „IV liga 2026/2027” (gr. X).
// Stadiony i adresy: boiska z protokołów meczów regiowyniki.pl. Zawodnicy generowani.
import { type KlubDane, type Sciezka } from "./kluby";
import { GORA_KRAJOWA } from "./pomorskie";
import { III_LIGA_GR1 } from "./iii-liga-gr1";

const k = (nazwa: string, miasto: string, skrot: string, stadion?: string, adres?: string): KlubDane => ({ nazwa, skrot, miasto, ...(stadion ? { stadion } : {}), ...(adres ? { adres } : {}) });

// IV liga, grupa podlaska (grupa X) (16) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Podlaskie/4_Liga/podlaska/
export const POD_IV: KlubDane[] = [
  k("KS Wasilków", "Wasilków", "KW", "Stadion Miejski", "Supraślska 21, Wasilków"),
  k("Warmia Grajewo", "Grajewo", "WG", "Stadion im. Witolda Terleckiego", "Piłsudskiego 32, Grajewo"),
  k("ŁKS II Łomża", "Łomża", "ŁŁ", "Stadion MOSiR", "Zjazd 18, Łomża"),
  k("Czarni Czarna Białostocka", "Czarna Białostocka", "CCB", "Stadion Miejski", "Konopnickiej 7, Czarna Białostocka"),
  k("Tur Bielsk Podlaski", "Bielsk Podlaski", "TBP", "Stadion MOSiR", "Elizy Orzeszkowej 19, Bielsk Podlaski"),
  k("Ruch Wysokie Mazowieckie", "Wysokie Mazowieckie", "RWM", "Stadion Miejski", "1 Maja 14, Wysokie Mazowieckie"),
  k("KS Michałowo", "Michałowo", "KM", "Stadion MOSiR", "Henryka Sienkiewicza 21a, Michałowo"),
  k("Promień Mońki", "Mońki", "PM", "Stadion MOSiR", "Sportowa 1, Mońki"),
  k("Hetman Tykocin", "Tykocin", "HT", "Stadion Miejski", "Jana Kochanowskiego 1, Tykocin"),
  k("Wissa Szczuczyn", "Szczuczyn", "WS", "Stadion Miejski", "Majewskiego 13, Szczuczyn"),
  k("Pionier Brańsk", "Brańsk", "PB", "Stadion ZS im. Armii Krajowej", "Armii Krajowej 7, Brańsk"),
  k("LZS Krynki", "Krynki", "LK", "Stadion OSiR", "Kościelna 24, Krynki"),
  k("Supraślanka Supraśl", "Supraśl", "SS", "Stadion Miejski", "Stanisława Konarskiego 2, Supraśl"),
  k("Pomorzanka Sejny", "Sejny", "PS", "Stadion Miejski", "Konarskiego 12, Sejny"),
  k("Krypnianka Krypno", "Krypno Kościelne", "KK", "Stadion UKS Krypnianka", "48, Krypno Kościelne"),
  k("KS Śniadowo", "Śniadowo", "KŚ", "Stadion Gminny", "Kolejowa 15b, Śniadowo"),
];

// Klasa okręgowa, grupa podlaska (16) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Podlaskie/Klasa_okregowa/podlaska/
export const POD_OKR: KlubDane[] = [
  k("KS II Wasilków", "Wasilków", "KW2", "Stadion Miejski", "Supraślska 21, Wasilków"),
  k("Jagiellonia III Białystok", "Białystok", "JB", "Ośrodek treningowy Jagiellonia", "Elewatorska 4, Białystok"),
  k("MOSP Białystok", "Białystok", "MB", "Stadion MOSP", "Świętokrzyska 15, Białystok"),
  k("Orzeł Kolno", "Kolno", "OK", "Stadion Miejski", "Wojska Polskiego 40, Kolno"),
  k("CSP Unia 1976 Ciechanowiec", "Ciechanowiec", "CU1C", "Stadion Miejski", "Stadion 1, Ciechanowiec"),
  k("Orlęta Czyżew", "Czyżew", "OC", "Stadion Miejski", "Zarzecze 15, Czyżew"),
  k("Wigry II Suwałki", "Suwałki", "WS2", "Stadion Miejski", "Zarzecze 26, Suwałki"),
  k("Pogoń Łapy", "Łapy", "PŁ", "Stadion OKF", "Leśnikowska 18a, Łapy"),
  k("Cresovia Siemiatycze", "Siemiatycze", "CS", "Stadion Miejski", "Nadrzeczna 29, Siemiatycze"),
  k("Rudnia Zabłudów", "Zabłudów", "RZ", "Stadion KS Rudnia", "Adama Mickiewicza 16, Zabłudów"),
  k("Sparta Augustów", "Augustów", "SA", "Stadion MOSiR", "Tytoniowa 1, Augustów"),
  k("Sokół Sokółka", "Sokółka", "SS2", "Stadion Miejski", "Mariańska 31, Sokółka"),
  k("Narew Choroszcz", "Choroszcz", "NC", "Stadion Miejski", "Żółtkowska 1, Choroszcz"),
  k("Puszcza Hajnówka", "Hajnówka", "PH", "Stadion Miejski", "ks. Antoniego Dziewiatowskiego 2, Hajnówka"),
  k("Sparta 1951 Szepietowo", "Szepietowo", "S1S", "Stadion Miejski", "Sportowa 5, Szepietowo"),
  k("GKS Gródek", "Gródek", "GG", "Stadion Zarzeczany", "Zarzeczany"),
];

// Klasa A, grupa I (podlaska I) – część północna i zachodnia: okolice Łomży, Grajewa, Kolna, Moniek i Suwałk (13) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Podlaskie/Klasa_A/podlaska_I/
export const POD_A_1: KlubDane[] = [
  k("GKS 1984 Rutki", "Rutki-Kossaki", "G1R", "Boisko przy Szkole Podstawowej", "11 Listopada 7a, Rutki-Kossaki"),
  k("GKS Stawiski", "Stawiski", "GS", undefined, "Cedrowska 17, Stawiski"),
  k("GKS Miastkowo", "Miastkowo", "GM", "Stadion Gminny", "Sportowa 1, Miastkowo"),
  k("Warmia II Grajewo", "Grajewo", "WG2"),
  k("Biebrza Goniądz", "Goniądz", "BG", "Stadion Miejski", "Konstytucji 3 Maja 18, Goniądz"),
  k("Wissa II Szczuczyn", "Szczuczyn", "WS3", "Boisko Szkolne", "Grunwaldzka 2, Szczuczyn"),
  k("Polonia Raczki", "Raczki", "PR"),
  k("Znicz Radziłów", "Radziłów", "ZR", "Boisko GKS Znicz", "Szkolna 1, Radziłów"),
  k("Wataha Kolno", "Kolno", "WK"),
  k("Klonowa Suwałki", "Suwałki", "KS", "Boisko SP5", "Klonowa 51, Suwałki"),
  k("Lider Łomża", "Łomża", "LŁ"),
  k("Skra Wizna", "Wizna", "SW", "Boisko KS Skra", "Nadrzeczna, Wizna"),
  k("Grab Janówka", "Janówka", "GJ", "Boisko Gminne", "Biernatki"),
];

// Klasa A, grupa II (podlaska II) – Białystok i okolice (powiaty białostocki, sokólski, moniecki) (14) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Podlaskie/Klasa_A/podlaska_II/
export const POD_A_2: KlubDane[] = [
  k("GKS Grabówka", "Grabówka", "GG2", "Stadion Piłkarski", "Jodłowa 32, Grabówka"),
  k("Kora Korycin", "Korycin", "KK2", "Kora Arena", "Słowiańska, Korycin"),
  k("Korona Dobrzyniewo Duże", "Dobrzyniewo Duże", "KDD", "Stadion Gminny", "Ełcka 34, Dobrzyniewo Duże"),
  k("Dąb Dąbrowa Białostocka", "Dąbrowa Białostocka", "DDB", "Stadion Miejski", "gen. Nikodema Sulika, Dąbrowa Białostocka"),
  k("Magnat Juchnowiec Kościelny", "Juchnowiec Kościelny", "MJK", "Stadion Gminny", "Sportowa, Juchnowiec Dolny"),
  k("Hetman Białystok", "Białystok", "HB", "Stadion Miejski - boisko boczne", "Słoneczna 1, Białystok"),
  k("Piast Białystok", "Białystok", "PB2", "Stadion Miejski - boisko boczne", "Słoneczna 1, Białystok"),
  k("Pasja Kleosin", "Kleosin", "PK", "Stadion Gminny", "Sportowa, Juchnowiec Dolny"),
  k("Turośnianka Turośń Kościelna", "Turośń Kościelna", "TTK", "Stadion KS Turośnianka", "Kościelna, Turośń Kościelna"),
  k("Jastrząb Knyszyn", "Knyszyn", "JK", "Stadion Miejski", "Białostocka 54, Knyszyn"),
  k("Hattrick Białystok", "Białystok", "HB2"),
  k("Jasion Jasionówka", "Jasionówka", "JJ", "Boisko GOKSiT Jasion", "Grodzieńska, Jasionówka"),
  k("Leśna Białystok", "Białystok", "LB"),
  k("Włókniarz Białystok", "Białystok", "WB", "Stadion KS Włókniarz", "Sokólska 1, Białystok"),
];

// Klasa A, grupa III (podlaska III) – część południowa: Bielsk Podlaski, Hajnówka, Siemiatycze, Zambrów, Wysokie Mazowieckie (12) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Podlaskie/Klasa_A/podlaska_III/
export const POD_A_3: KlubDane[] = [
  k("Bocian Boćki", "Boćki", "BB", "Bocianie Gniazdo", "Dubieńska 70, Boćki"),
  k("MKS Mielnik", "Mielnik", "MM", "Stadion GOKSiR", "Zamkowa, Mielnik"),
  k("Unia Ciechanowiec", "Ciechanowiec", "UC", "Boisko ZST", "Długa 130, Czartajew"),
  k("Olimpia II Zambrów", "Zambrów", "OZ", "Stadion Miejski / boisko boczne (sztuczna nawierzchnia)", "Stefana Wyszyńskiego 8, Zambrów"),
  k("Iskra Narew", "Narew", "IN", "Stadion LKS Iskra", "Adama Mickiewicza 81a, Narew"),
  k("Cresovia II Siemiatycze", "Siemiatycze", "CS2", "Stadion Miejski", "Nadrzeczna 29, Siemiatycze"),
  k("Tur II Bielsk Podlaski", "Bielsk Podlaski", "TBP2", "Stadion Piliki", "176, Piliki"),
  k("Kolejarz Czeremcha", "Czeremcha", "KC", "Stadion ŚKS Kolejarz", "Długa, Czeremcha"),
  k("Żubr Drohiczyn", "Drohiczyn", "ŻD", "Boisko przy Zespole Szkół", "Warszawska 51, Drohiczyn"),
  k("Iskra Wyszki", "Wyszki", "IW", "Stadion przy Zespole Szkół", "Szkolna 17, Wyszki"),
  k("KS Narewka", "Narewka", "KN", "Boisko KS Narewka", "Mickiewicza 48, Narewka"),
  k("Husar Nurzec", "Nurzec-Stacja", "HN", "Stadion Sportowy", "Sportowa 10, Nurzec-Stacja"),
];

const GORA = [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. I", kluby: III_LIGA_GR1 }, { nazwa: "IV liga podlaska", kluby: POD_IV }, { nazwa: "Klasa okręgowa — podlaska", kluby: POD_OKR }];
export const PODLASKIE_S1: Sciezka = {
  id: "podlaskie-a1", nazwa: "Podlaskie — Łomża / Suwałki",
  ligi: [...GORA,
    { nazwa: "Klasa A — podlaska gr. 1", kluby: POD_A_1 },
  ],
};
export const PODLASKIE_S2: Sciezka = {
  id: "podlaskie-a2", nazwa: "Podlaskie — Białystok",
  ligi: [...GORA,
    { nazwa: "Klasa A — podlaska gr. 2", kluby: POD_A_2 },
  ],
};
export const PODLASKIE_S3: Sciezka = {
  id: "podlaskie-a3", nazwa: "Podlaskie — Bielsk Podlaski / Hajnówka",
  ligi: [...GORA,
    { nazwa: "Klasa A — podlaska gr. 3", kluby: POD_A_3 },
  ],
};

// Awanse/spadki (regulamin Podlaskiego ZPN 2026/27, zał. 3):
// IV liga (16): 1. miejsce → III liga gr. I, 2. miejsce → baraż międzywojewódzki; liga utrzymywana na 16 (min. 2 spadki).
// Klasa okręgowa (1×16): 1. i 2. miejsce → IV liga, 3. miejsce gra baraż (dwumecz) z najniżej sklasyfikowaną drużyną IV ligi, która się utrzymała.
// Klasa A (3 grupy, wszystkie → okręgowa): awansują mistrzowie grup; brak spadków (najniższy szczebel).
// [Ekstra↔I, I↔II, II↔III, III↔IV, IV↔okręgowa, okręgowa↔A]
const WYMIANA = [3, 3, 2, 2, 3, 1];
export const PODLASKIE_REGIONY: Sciezka[] = [PODLASKIE_S1, PODLASKIE_S2, PODLASKIE_S3].map((sc) => ({ ...sc, wymiana: WYMIANA }));


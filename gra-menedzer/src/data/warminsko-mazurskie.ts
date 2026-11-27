// Województwo WARMIŃSKO-MAZURSKIE — piramida IV liga → klasa B (sezon 2026/2027).
// Źródło składów: regiowyniki.pl (pełne tabele, stan 27.11.2026) zweryfikowane z oficjalnymi tabelami WMZPN (wmzpn.pl / LNP);
// IV liga zgodna z pl.wikipedia „IV liga 2026/2027” (gr. XIV). Stadiony i adresy: boiska z protokołów meczów regiowyniki.pl.
// Awanse/spadki: regulamin rozgrywek WMZPN 2026/27, zał. 7. Zawodnicy generowani.
import { type KlubDane, type Sciezka } from "./kluby";
import { GORA_KRAJOWA } from "./pomorskie";
import { III_LIGA_GR1 } from "./iii-liga-gr1";

const k = (nazwa: string, miasto: string, skrot: string, stadion?: string, adres?: string): KlubDane => ({ nazwa, skrot, miasto, ...(stadion ? { stadion } : {}), ...(adres ? { adres } : {}) });

// IV liga warmińsko-mazurska (Superscore IV Liga WMZPN) (16) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Superscore_IV_Liga/WMZPN/
export const WM_IV: KlubDane[] = [
  k("Stomil Olsztyn", "Olsztyn", "SO", "Stadion OSiR", "Piłsudskiego 69a, Olsztyn"),
  k("Concordia Elbląg", "Elbląg", "CE", "Stadion Miejski MOSIR", "Krakusa 25, Elbląg"),
  k("Granica Kętrzyn", "Kętrzyn", "GK", "Stadion Miejski", "Bydgoska 20, Kętrzyn"),
  k("Tęcza Biskupiec", "Biskupiec", "TB", "Stadion Miejski", "Wiosenna 1a, Biskupiec"),
  k("Sokół Ostróda", "Ostróda", "SO2", "Stadion Miejski", "3 maja 19, Ostróda"),
  k("GKS Wikielec", "Wikielec", "GW", "Stadion Gminny", "Bukowa 80, Wikielec"),
  k("Pisa Barczewo", "Barczewo", "PB", "Stadion Miejski", "Wojska Polskiego 36a, Barczewo"),
  k("DKS Dobre Miasto", "Dobre Miasto", "DDM", "Stadion Miejski", "Olsztyńska 2, Dobre Miasto"),
  k("Rominta Gołdap", "Gołdap", "RG", "Stadion Miejski OSiR", "Stadionowa 5a, Gołdap"),
  k("Start Nidzica", "Nidzica", "SN", "Stadion Miejski im. R. Gamańskiego", "Polna 7, Nidzica"),
  k("MKS Mazur Ełk", "Ełk", "MME", "Stadion Miejski im. Stefana Marcinkiewicza", "Piłsudskiego 27, Ełk"),
  k("Znicz Biała Piska", "Biała Piska", "ZBP", "Stadion Miejski", "Sportowa 1, Biała Piska"),
  k("Naki Olsztyn", "Olsztyn", "NO", "Boisko UKS Naki", "Juliana Tuwima 22, Olsztyn"),
  k("Mamry Giżycko", "Giżycko", "MG", "Stadion MOSiR", "Moniuszki 5, Giżycko"),
  k("Zatoka Braniewo", "Braniewo", "ZB", "Stadion im. Czesława Staszczyńskiego", "Botaniczna 4, Braniewo"),
  k("Polonia Pasłęk", "Pasłęk", "PP", "Stadion Miejski", "Kraszewskiego 2, Pasłęk"),
];

// Klasa Okręgowa Grupa 1 (16) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_okregowa/warminsko-mazurska_I/
export const WM_OKR_1: KlubDane[] = [
  k("Mrągowia Mrągowo", "Mrągowo", "MM", "Stadion Miejski", "Mrongowiusza 1, Mrągowo"),
  k("SKS Gwardia Szczytno", "Szczytno", "SGS", "Stadion Leśny", "Ostrołęcka 4, Szczytno"),
  k("Orlęta Reszel", "Reszel", "OR", "Stadion Miejski", "Kopernika 12, Reszel"),
  k("Mazur Pisz", "Pisz", "MP", "Stadion Miejski", "Mickiewicza 2, Pisz"),
  k("Olimpia Olsztynek", "Olsztynek", "OO", "Stadion Miejski", "Zajęcza 2, Olsztynek"),
  k("Orzeł Janowiec Kościelny", "Janowiec Kościelny", "OJK", "Stadion LKS Orzeł", "Kuce 3, Janowiec Kościelny"),
  k("GKS Stawiguda", "Stawiguda", "GS", "Stadion Gminny", "Olsztyńska 10, Stawiguda"),
  k("Czarni Olecko", "Olecko", "CO", "Stadion MOSiR", "Parkowa 1, Olecko"),
  k("Stomil II Olsztyn", "Olsztyn", "SO3"),
  k("Victoria Bartoszyce", "Bartoszyce", "VB", "Stadion Miejski im. Kazimierza Górskiego", "Sportowa 23, Bartoszyce"),
  k("Orzeł Czerwonka", "Czerwonka", "OC", "Boisko Gminne", "96, Czerwonka"),
  k("Błękitni Pasym", "Pasym", "BP", "Stadion Miejski", "Jana Pawła II 4, Pasym"),
  k("Vęgoria Węgorzewo", "Węgorzewo", "VW", "Stadion Miejski", "Turystyczna 13, Węgorzewo"),
  k("Mazur Wydminy", "Wydminy", "MW", "Boisko LKS Mazur", "Szkolna 5, Wydminy"),
  k("Śniardwy Orzysz", "Orzysz", "ŚO", "Stadion Miejski", "1 maja, Orzysz"),
  k("GKS Kozłowo", "Kozłowo", "GK2", "Boisko Gminne", "Sportowa, Kozłowo"),
];

// Klasa Okręgowa Grupa 2 (16) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_okregowa/warminsko-mazurska_II/
export const WM_OKR_2: KlubDane[] = [
  k("Constract Lubawa", "Grabowo", "CL", "Boisko KS Constract", "117, Grabowo"),
  k("Błękitni Orneta", "Orneta", "BO", "Stadion OSiR", "Sportowa 6, Orneta"),
  k("GKS Ossa Biskupiec", "Biskupiec", "GOB", "Boisko Gminne", "Sztynwałdzka 17, Biskupiec Pomorski"),
  k("MKS Działdowo", "Działdowo", "MD", "Stadion MOSiR", "Robotnicza 10, Działdowo"),
  k("Olimpia II Elbląg", "Elbląg", "OE", "Boisko piłkarskie", "Stanisława Moniuszki 29, Elbląg"),
  k("Huragan Morąg", "Morąg", "HM", "Stadion Miejski", "Żeromskiego 36, Morąg"),
  k("Jeziorak Iława", "Iława", "JI", "Stadion Miejski", "Sienkiewicza 1, Iława"),
  k("Dąb Kadyny", "Kadyny", "DK", "Boisko KS Dąb", "31, Kadyny"),
  k("Płomień Turznica", "Turznica", "PT", "Boisko Gminne", "Turznica"),
  k("Motor Lubawa", "Lubawa", "ML", "Stadion Łazienkowski", "Łąkowa 8, Lubawa"),
  k("Wałsza Pieniężno", "Pieniężno", "WP", "Stadion KS Wałsza", "Braniewska 1, Pieniężno"),
  k("GSZS Delfin Rybno", "Rybno", "GDR", "Stadion OSiR", "Sportowa 24, Rybno"),
  k("LKS Tyrowo", "Tyrowo", "LT", "Boisko LKS Tyrowo", "Tyrowo"),
  k("Radomniak Radomno", "Radomno", "RR", "Boisko Gminne", "Radomno"),
  k("MKS Miłakowo", "Miłakowo", "MM2", "Stadion Miejski", "Władysława Włodyki 1, Miłakowo"),
  k("Drwęca Nowe Miasto Lubawskie", "Nowe Miasto Lubawskie", "DNML", "Stadion Miejski", "Jagiellońska 20, Nowe Miasto Lubawskie"),
];

// Klasa A Grupa 1 (14) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_A/warminsko-mazurska_I/
export const WM_A_1: KlubDane[] = [
  k("Łyna Sępopol", "Sępopol", "ŁS", "Centrum Sportowo-Rekreacyjne", "Wojska Polskiego 8a, Sępopol"),
  k("Pomarańcze Korsze", "Korsze", "PK", "Stadion Miejski", "Wojska Polskiego 39, Korsze"),
  k("MKS Korsze", "Korsze", "MK", "Stadion Miejski", "Wojska Polskiego 39, Korsze"),
  k("Reduta Bisztynek", "Bisztynek", "RB", "Stadion Miejski", "Wojska Polskiego 7a, Bisztynek"),
  k("Żagiel Piecki", "Piecki", "ŻP", "Boisko Gminne", "Zwycięstwa 35a, Piecki"),
  k("Tempo Ramsowo Wipsowo", "Ramsowo", "TRW", "Boisko Gminne", "39, Ramsowo"),
  k("Pojezierze Prostki", "Prostki", "PP2", "Stadion Leśny", "Sportowa 9, Prostki"),
  k("Cresovia Górowo Iławeckie", "Górowo Iławeckie", "CGI", "Stadion Miejski", "Sikorskiego 11, Górowo Iławieckie"),
  k("Pogoń Ryn", "Ryn", "PR", "Stadion Miejski", "Szkolna 12, Ryn"),
  k("Granica II Kętrzyn", "Kętrzyn", "GK3"),
  k("Rona 03 Ełk", "Ełk", "R0E", "Stadion Miejski im. Stefana Marcinkiewicza", "Piłsudskiego 27, Ełk"),
  k("Wilczek Wilkowo", "Wilkowo", "WW", "Stadion Gminny", "Łazdoje, Łazdoje"),
  k("KS Wojciechy", "Wojciechy", "KW", "Boisko Gminne", "Wojciechy"),
  k("Salęt Boże", "Boże", "SB", "Stadion Gminny", "18, Boże"),
];

// Klasa A Grupa 2 (13) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_A/warminsko-mazurska_II/
export const WM_A_2: KlubDane[] = [
  k("Sokół II Ostróda", "Ostróda", "SO4", "Boisko Miejskie", "Plebiscytowa 50, Ostróda"),
  k("Pomowiec Gronowo Elbląskie", "Gronowo Elbląskie", "PGE", "Boisko GLKS Pomowiec", "Osiedlowa 6, Gronowo Elbląskie"),
  k("Polonia II Pasłęk", "Pasłęk", "PP3", "Stadion Miejski", "Kraszewskiego 2, Pasłęk"),
  k("Syrena Młynary", "Młynary", "SM", "Stadion Miejski", "Dworcowa, Młynary"),
  k("Ewingi Zalewo", "Zalewo", "EZ", "Stadion Miejski", "Targowa 5, Zalewo"),
  k("Agat Jegłownik", "Jegłownik", "AJ", "Boisko LKS Agat", "Nogatu 15, Jegłownik"),
  k("Polonia Markusy", "Markusy", "PM", "Boisko KS Polonia", "Markusy"),
  k("GKS Grunwald", "Frygnowo", "GG", "Boisko Gminne", "Frygnowo"),
  k("Kormoran Zwierzewo", "Zwierzewo", "KZ", "Stadion GLKS Kormoran", "59, Zwierzewo"),
  k("GKS Małdyty", "Małdyty", "GM", "Stadion Gminny", "Zamkowa 4b, Małdyty"),
  k("Iskra Smykówko", "Smykówko", "IS", "Boisko Gminne", "Smykówko"),
  k("Tęcza Miłomłyn", "Miłomłyn", "TM", "Stadion Miejski", "Pasłęcka 27, Miłomłyn"),
  k("Góra Idzbark", "Idzbark", "GI", "Boisko LKS Góra", "Sportowa, Idzbark"),
];

// Klasa A Grupa 3 (13) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_A/warminsko-mazurska_III/
export const WM_A_3: KlubDane[] = [
  k("KS Łęgajny", "Łęgajny", "KŁ", "Boisko KS Łęgajny", "Ogrodowa 8, Łęgajny"),
  k("Fortuna Gągławki", "Gągławki", "FG", "Boisko KS Fortuna", "16, Gągławki"),
  k("Warmia Wrzesina", "Wrzesina", "WW2", "Boisko KS Warmia", "Wrzesina 37B, Jonkowo"),
  k("Perkun Orżyny", "Orżyny", "PO", "Boisko Gminne", "Sienkiewicza, Dźwierzuty"),
  k("Omulew Wielbark", "Wielbark", "OW", "Stadion Leśny", "Kopernika 18, Wielbark"),
  k("GKS Szczytno", "Olszyny", "GS2", "Boisko Gminne", "Olszyny"),
  k("Pisa II Barczewo", "Barczewo", "PB2", "Boisko przy ul. Północnej", "Północna 14, Barczewo"),
  k("Start II Nidzica", "Nidzica", "SN2", "Stadion Miejski im. R. Gamańskiego", "Polna 7, Nidzica"),
  k("Brama Olsztyn", "Olsztyn", "BO2", "Boisko UKS Naki", "Juliana Tuwima 22, Olsztyn"),
  k("FC Dajtki Olsztyn", "Olsztyn", "FDO", "Boisko przy Szkole Podstawowej nr 18", "Żytnia 71, Olsztyn"),
  k("Vel Dąbrówno", "Dąbrówno", "VD", "Boisko GKS Vel", "Ostródzka 12, Dąbrówno"),
  k("LKS Różnowo", "Różnowo", "LR", "Boisko LKS Różnowo", "766, Różnowo"),
  k("Błękitni Stary Olsztyn", "Stary Olsztyn", "BSO", "Boisko piłkarskie", "Klewki 13a, Klewki"),
];

// Klasa A Grupa 4 (14) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_A/warminsko-mazurska_IV/
export const WM_A_4: KlubDane[] = [
  k("LZS OHI Frednowy", "Frednowy", "LOF", "Boisko LZS Frednowy", "11, Frednowy"),
  k("Zamek Kurzętnik", "Kurzętnik", "ZK", "Stadion Sportowy", "Betoniarska 8a, Kurzętnik"),
  k("UKS Rozwój Iława", "Iława", "URI", "Stadion Miejski - sztuczna nawierzchnia", "Sieniewicza 1, Iława"),
  k("Polonia Iłowo", "Iłowo-Osada", "PI", "Stadion KS Polonia", "Akacyjna 25, Iłowo-Osada"),
  k("Olimpia Kisielice", "Kisielice", "OK", "Stadion Miejski", "Wojska Polskiego 37, Kisielice"),
  k("Wel Lidzbark", "Lidzbark", "WL", "Stadion Miejski", "Lipowa 53, Lidzbark Welski"),
  k("Torpeda Rożental", "Rożental", "TR", "Boisko LZS Torpeda", "140a, Rożental"),
  k("KS Mroczno", "Mroczno", "KM", "Stadion KS Mroczno", "Sportowa 1, Mroczno"),
  k("Iskra Narzym", "Narzym", "IN", "Boisko KS Iskra", "Sportowa 19, Narzym"),
  k("Jordan Kazanice", "Kazanice", "JK", "Boisko LZS Jordan", "83a, Kazanice"),
  k("Czarni Rudzienice", "Rudzienice", "CR", "Boisko Gminne", "Rudzienice"),
  k("PFT Sampława", "Sampława", "PS", "Boisko PFT Drewneks", "4, Sampława"),
  k("Orzeł Ulnowo", "Ulnowo", "OU", "Boisko UKS Orzeł", "1, Ulnowo"),
  k("LZS Zamek Szymbark", "Szymbark", "LZS", "Boisko LZS Zamek", "Szymbark"),
];

// Klasa B Grupa 1 (11) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_B/warminsko-mazurska_I/
export const WM_B_1: KlubDane[] = [
  k("MKS Mazur II Ełk", "Ełk", "MME2", "Stadion Miejski im. Stefana Marcinkiewicza", "Piłsudskiego 27, Ełk"),
  k("Kowalak Kowale Oleckie", "Kowale Oleckie", "KKO", "Boisko Gminne", "Sportowa, Kowale Oleckie"),
  k("Znicz II Biała Piska", "Biała Piska", "ZBP2", "Stadion Miejski", "Sportowa 1, Biała Piska"),
  k("MKS Ruciane-Nida", "Ruciane-Nida", "MRN", "Stadion MKS Nida", "Słoneczna 17, Ruciane-Nida"),
  k("Olimpia Gmina Miłki", "Miłki", "OGM", "Stadion Gminny", "Szkolna 1b, Miłki"),
  k("Jurand Barciany", "Barciany", "JB", "Stadion Gminny", "Sportowa 1, Barciany"),
  k("Start Kruklanki", "Kruklanki", "SK", "Boisko UKS Start", "22 Lipca 34, Kruklanki"),
  k("Mrągowia II Mrągowo", "Mrągowo", "MM3", "boczne boisko Stadionu Miejskiego", "Mrongowiusza 1, Mrągowo"),
  k("Vęgoria II Węgorzewo", "Węgorzewo", "VW2", "Stadion Miejski", "Turystyczna 13, Węgorzewo"),
  k("Pogoń II Ryn", "Ryn", "PR2", "Stadion Miejski", "Szkolna 12, Ryn"),
  k("Start Kozłowo", "Kozłowo", "SK2", "Boisko GKS LZS Start", "4, Kozłowo"),
];

// Klasa B Grupa 2 (12) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_B/warminsko-mazurska_II/
export const WM_B_2: KlubDane[] = [
  k("Jastrząb Ględy", "Ględy", "JG", "Boisko KS Jastrząb", "49, Ględy"),
  k("Junior Świątki", "Świątki", "JŚ", "Boisko Gminne", "95, Świątki"),
  k("Zalew Frombork", "Frombork", "ZF", "Stadion Miejski", "Młynarska 32, Frombork"),
  k("Zagłada Lisów", "Lisów", "ZL", "Boisko KS Zagłada", "Lisów"),
  k("Pogrom Aniołowo", "Aniołowo", "PA", "Boisko KS Pogrom", "Aniołowo"),
  k("Granica Zagaje", "Zagaje", "GZ", "Boisko LKS Granica", "38, Zagaje"),
  k("Warmiak Łukta", "Łukta", "WŁ", "Stadion Miejski", "Mazurska 2, Łukta"),
  k("Piast Wilczęta", "Wilczęta", "PW", "Boisko KS Piast", "43a, Wilczęta"),
  k("Żabianka Żabi Róg", "Żabi Róg", "ŻŻR", "Boisko LKS Żabianka", "138a, Żabi Róg"),
  k("Sparta Kwietniewo", "Kwietniewo", "SK3", "Boisko LKS Sparta", "Kwietniewo"),
  k("Polonia II Markusy", "Markusy", "PM2", "Boisko KS Grom", "28, Zwierzno"),
  k("Kormoranek Bynowo", "Bynowo", "KB", "Boisko GKS Kormoran", "7, Bynowo"),
];

// Klasa B Grupa 3 (12) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_B/warminsko-mazurska_III/
export const WM_B_3: KlubDane[] = [
  k("GKS Gietrzwałd/Unieszewo", "Gietrzwałd", "GGU", "Boisko w Unieszewie", "Polna, Unieszewo"),
  k("Burza Słupy", "Słupy", "BS", "Boisko KS Burza", "43, Słupy"),
  k("WTKS Mierki", "Mierki", "WM", "Boisko im. Mlodzieży Mierkowskiej", "8, Mierki"),
  k("GLKS Jonkowo", "Jonkowo", "GJ", "Stadion Gminny", "650-lecia Jonkowa, Jonkowo"),
  k("GKS II Szczytno", "Olszyny", "GS3", "Boisko Gminne", "Olszyny"),
  k("Wałpusza 07 Jesionowiec", "Jesionowiec", "W0J", "Boisko Gminne", "Zabiele 4, Zabiele"),
  k("Leśnik Nowe Ramuki", "Nowe Ramuki", "LNR", "Boisko KS Leśnik", "Nowa Wieś"),
  k("Błękitni II Pasym", "Pasym", "BP2", "Stadion Miejski", "Jana Pawła II 4, Pasym"),
  k("Orzyc Janowo", "Janowo", "OJ", "Boisko Gminne", "Komorowo"),
  k("Perkun II Orżyny", "Orżyny", "PO2", "Boisko Gminne", "Sienkiewicza, Dźwierzuty"),
  k("LKS II Różnowo", "Różnowo", "LR2"),
  k("Olimpia II Olsztynek", "Olsztynek", "OO2", "Stadion Miejski", "Zajęcza 2, Olsztynek"),
];

// Klasa B Grupa 4 (11) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_B/warminsko-mazurska_IV/
export const WM_B_4: KlubDane[] = [
  k("Unia Susz", "Susz", "US", "Stadion Miejski", "Leśna 20, Susz"),
  k("Osa Ząbrowo", "Ząbrowo", "OZ", "Boisko LZS Osa", "Szkolna 19, Ząbrowo"),
  k("Młode Lwy Mszanowo", "Mszanowo", "MLM", "Boisko Gminne", "Mszanowo"),
  k("Wicher Gwiździny", "Gwiździny", "WG", "Boisko KS Wicher", "Gwiździny 4a, Gwiździny"),
  k("Avista Łążyn", "Łążyn", "AŁ", "Boisko LZS Avista", "Łążyn"),
  k("Drwęca II Nowe Miasto Lubawskie", "Nowe Miasto Lubawskie", "DNML2", "Stadion Miejski", "Jagiellońska 20, Nowe Miasto Lubawskie"),
  k("Żak Jamielnik", "Jamielnik", "ŻJ", "Boisko UKS Żak", "Szkolna 147, Jamielnik"),
  k("GKS II Kozłowo", "Kozłowo", "GK4", "Boisko Gminne", "Sportowa, Kozłowo"),
  k("KS Wel Bratian", "Bratian", "KWB", "Boisko KS Wel", "Szkolna 2, Bratian"),
  k("Mewa Smykowo", "Smykowo", "MS", "Boisko GKS Mewa", "15, Smykowo"),
  k("GKS II Grunwald", "Frygnowo", "GG2", "Boisko Gminne", "Frygnowo"),
];

// Klasa B Grupa 5 (11) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Warminsko-Mazurskie/Klasa_B/warminsko-mazurska_V/
export const WM_B_5: KlubDane[] = [
  k("Polonia II Lidzbark Warmiński", "Lidzbark Warmiński", "PLW", "Stadion Miejski im. Henryka Wobalisa", "Bartoszycka 24, Lidzbark Warmiński"),
  k("Granica Bezledy", "Bezledy", "GB", "Stadion Gminny", "45, Bezledy"),
  k("Tęcza II Biskupiec", "Biskupiec", "TB2", "Stadion Miejski", "Wiosenna 1a, Biskupiec"),
  k("Orlęta II Reszel", "Reszel", "OR2", "Stadion Miejski", "Kopernika 12, Reszel"),
  k("Błękitni II Orneta", "Orneta", "BO3", "Stadion OSiR", "Sportowa 6, Orneta"),
  k("Victoria II Bartoszyce", "Bartoszyce", "VB2", "Stadion Miejski im. Kazimierza Górskiego", "Sportowa 23, Bartoszyce"),
  k("Szansa Reszel", "Reszel", "SR", "Stadion Miejski", "Kopernika 12, Reszel"),
  k("MKS Jeziorany", "Jeziorany", "MJ", "Stadion Miejski", "Wipsowska 20, Jeziorany"),
  k("Szerszeń Parleza Wielka", "Parleza Wielka", "SPW", "Stadion Miejski", "Wiosenna 1a, Biskupiec"),
  k("Łyna II Sępopol", "Sępopol", "ŁS2", "Centrum Sportowo-Rekreacyjne", "Wojska Polskiego 8a, Sępopol"),
  k("Warmianka Bęsia", "Bęsia", "WB", "Boisko BKS Warmianka", "24, Bęsia"),
];

const GORA = [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. I", kluby: III_LIGA_GR1 }, { nazwa: "IV liga warmińsko-mazurska", kluby: WM_IV }];
export const WARMINSKO_MAZURSKIE_S1: Sciezka = {
  id: "warminsko-mazurskie-b1", nazwa: "Warmińsko-Mazurskie — Ełk / Mrągowo",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — warmińsko-mazurska gr. 1", kluby: WM_OKR_1 },
    { nazwa: "Klasa A — warmińsko-mazurska gr. 1", kluby: WM_A_1 },
    { nazwa: "Klasa B — warmińsko-mazurska gr. 1", kluby: WM_B_1 },
  ],
};
export const WARMINSKO_MAZURSKIE_S2: Sciezka = {
  id: "warminsko-mazurskie-b2", nazwa: "Warmińsko-Mazurskie — Elbląg / Ostróda",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — warmińsko-mazurska gr. 2", kluby: WM_OKR_2 },
    { nazwa: "Klasa A — warmińsko-mazurska gr. 2", kluby: WM_A_2 },
    { nazwa: "Klasa B — warmińsko-mazurska gr. 2", kluby: WM_B_2 },
  ],
};
export const WARMINSKO_MAZURSKIE_S3: Sciezka = {
  id: "warminsko-mazurskie-b3", nazwa: "Warmińsko-Mazurskie — Olsztyn / Szczytno",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — warmińsko-mazurska gr. 1", kluby: WM_OKR_1 },
    { nazwa: "Klasa A — warmińsko-mazurska gr. 3", kluby: WM_A_3 },
    { nazwa: "Klasa B — warmińsko-mazurska gr. 3", kluby: WM_B_3 },
  ],
};
export const WARMINSKO_MAZURSKIE_S4: Sciezka = {
  id: "warminsko-mazurskie-b4", nazwa: "Warmińsko-Mazurskie — Iława / Nowe Miasto Lubawskie",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — warmińsko-mazurska gr. 2", kluby: WM_OKR_2 },
    { nazwa: "Klasa A — warmińsko-mazurska gr. 4", kluby: WM_A_4 },
    { nazwa: "Klasa B — warmińsko-mazurska gr. 4", kluby: WM_B_4 },
  ],
};
export const WARMINSKO_MAZURSKIE_S5: Sciezka = {
  id: "warminsko-mazurskie-b5", nazwa: "Warmińsko-Mazurskie — Lidzbark Warmiński / Bartoszyce",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — warmińsko-mazurska gr. 1", kluby: WM_OKR_1 },
    { nazwa: "Klasa A — warmińsko-mazurska gr. 1", kluby: WM_A_1 },
    { nazwa: "Klasa B — warmińsko-mazurska gr. 5", kluby: WM_B_5 },
  ],
};

// Awanse/spadki (regulamin WMZPN 2026/27, zał. 7):
// IV liga (16): mistrz → III liga gr. I, wicemistrz → baraże międzywojewódzkie; spada tyle, by liga miała 16 (zwykle 2 + baraż).
// Klasa okręgowa (2×16): mistrzowie awansują, wicemistrzowie grają baraże (mecz i rewanż) ze spadkowiczami z IV ligi.
// Klasa A (4 grupy): mistrzowie awansują (A1, A3 → okręgowa gr. 1; A2, A4 → gr. 2), wicemistrzowie w barażach.
// Klasa B (5 grup): 2 najlepsze z każdej grupy → klasa A; najniższy szczebel — bez spadków.
// W grze (jedna grupa na szczebel w ścieżce): okręgowa→IV i A→okręgowa = mistrz + wicemistrz w barażu (2), B→A = 2 bezpośrednio.
// [Ekstra↔I, I↔II, II↔III, III↔IV, IV↔okręgowa, okręgowa↔A, A↔B]
const WYMIANA = [3, 3, 2, 2, 2, 2, 2];
export const WARMINSKO_MAZURSKIE_REGIONY: Sciezka[] = [WARMINSKO_MAZURSKIE_S1, WARMINSKO_MAZURSKIE_S2, WARMINSKO_MAZURSKIE_S3, WARMINSKO_MAZURSKIE_S4, WARMINSKO_MAZURSKIE_S5].map((sc) => ({ ...sc, wymiana: WYMIANA }));


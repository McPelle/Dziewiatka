// Województwo LUBUSKIE — piramida IV liga → klasa B (sezon 2026/2027). Dwa podokręgi: Gorzów Wlkp. (północ) i Zielona Góra (południe).
// Źródło składów: regiowyniki.pl (pełne tabele, stan 27.11.2026), IV liga zgodna z pl.wikipedia „IV liga 2026/2027” (Pogoń Skwierzyna
// wycofana po 14. kolejce — wyniki anulowane). Stadiony i adresy: boiska z protokołów meczów regiowyniki.pl. Zawodnicy generowani.
// Awanse/spadki: Regulamin rozgrywek IV ligi i niższych klas LZPN 2026/27 (Uchwała 26/2026 Zarządu LZPN), art. 17 § 20.
import { type KlubDane, type Sciezka } from "./kluby";
import { GORA_KRAJOWA } from "./pomorskie";
import { III_LIGA_GR3 } from "./iii-liga-gr3";

const k = (nazwa: string, miasto: string, skrot: string, stadion?: string, adres?: string): KlubDane => ({ nazwa, skrot, miasto, ...(stadion ? { stadion } : {}), ...(adres ? { adres } : {}) });

// IV liga lubuska („KEEZA” IV liga) (17) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/4_Liga/lubuska/
export const LUB_IV: KlubDane[] = [
  k("Victoria Szczaniec", "Szczaniec", "VS", "Stadion Gminny", "Sportowa 1, Szczaniec"),
  k("Polonia Słubice", "Słubice", "PS", "Stadion SOSiR", "Sportowa 1, Słubice"),
  k("Korona Kożuchów", "Kożuchów", "KK", "Stadion Miejski", "Zielonogórska 24, Kożuchów"),
  k("Piast Karnin", "Gorzów Wielkopolski", "PK", "Boisko KS Piast Karnin", "Łagodzińska 26, Gorzów Wielkopolski"),
  k("Lechia II Zielona Góra", "Zielona Góra", "LZG", "Stadion MOSiR", "Sulechowska 37, Zielona Góra"),
  k("Odra Nietków", "Nietków", "ON", "Stadion Gminny", "Sportowa 1, Nietków"),
  k("Pogoń Świebodzin", "Świebodzin", "PŚ", "Stadion OSiR", "Sikorskiego 25, Świebodzin"),
  k("Celuloza Kostrzyn nad Odrą", "Kostrzyn nad Odrą", "CKO", "Stadion MOSiR", "Niepodległości 11, Kostrzyn nad Odrą"),
  k("Czarni Żagań", "Żagań", "CŻ", "Arena Żagań", "Kochanowskiego 6, Żagań"),
  k("Ilanka Rzepin", "Rzepin", "IR", "Stadion Miejski", "Poznańska 60, Rzepin"),
  k("Róża Różanki", "Różanki", "RR", "Stadion WKS Róża", "Sportowa 9, Różanki"),
  k("Promień Żary", "Żary", "PŻ", "Stadion MKS Promień", "Zwycięzców 38, Żary"),
  k("Piast Iłowa", "Iłowa", "PI", "Stadion Miejski", "Piaskowa 1a, Iłowa"),
  k("Sprotavia Szprotawa", "Szprotawa", "SS", "Stadion Miejski", "Sobieskiego 68, Szprotawa"),
  k("Łucznik Strzelce Krajeńskie", "Strzelce Krajeńskie", "ŁSK", "Stadion Miejski", "Sportowa 1, Strzelce Krajeńskie"),
  k("Dozamet Nowa Sól", "Nowa Sól", "DNS", "Stadion Miejski", "1 Maja 26, Nowa Sól"),
  k("Stal Sulęcin", "Sulęcin", "SS2", "Stadion Miejski im. S. Ożoga", "Moniuszki 2, Sulęcin"),
];

// Klasa Okręgowa Grupa Nr 2 – Gorzów Wlkp. (16) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_okregowa/Gorzow_Wielkopolski/
export const LUB_OKR_GW: KlubDane[] = [
  k("Lubuszanin Drezdenko", "Drezdenko", "LD", "Stadion Miejski", "Mickiewicza 4, Drezdenko"),
  k("Orzeł Międzyrzecz", "Międzyrzecz", "OM", "Stadion Miejski", "Mieczysława Mikuły 1, Międzyrzecz"),
  k("Warta Słońsk", "Słońsk", "WS", "Stadion KS Warta", "3 Lutego 22, Słońsk"),
  k("Stilon II Gorzów Wielkopolski", "Gorzów Wielkopolski", "SGW", "Stadion OSiR", "Olimpijska 1, Gorzów Wielkopolski"),
  k("LZS Bobrówko", "Bobrówko", "LB", "Boisko LZS Bobrówko", "Choszczańska 7, Bobrówko"),
  k("Sokół Gościm", "Gościm", "SG", "Boisko KS Sokół", "Gościm"),
  k("Uran Trzebicz", "Trzebicz", "UT", "Boisko KS Uran", "Kolejowa 1, Trzebicz"),
  k("Spartak Deszczno", "Deszczno", "SD", "Boisko KS Spartak", "Kręta 8, Maszewo"),
  k("Warta II Gorzów Wielkopolski", "Gorzów Wielkopolski", "WGW", "Warta Arena", "Żwirowa, Gorzów Wielkopolski"),
  k("Spójnia Ośno Lubuskie", "Ośno Lubuskie", "SOL", "Stadion Miejski", "Sportowa 3, Ośno Lubuskie"),
  k("Czarni Browar Witnica", "Witnica", "CBW", "Stadion Miejski", "Strzelecka 1, Witnica"),
  k("Radowiak Drezdenko", "Drezdenko", "RD", "Boisko KS Radowiak", "plac Sportowy 1, Drezdenko"),
  k("Zorza Kowalów", "Kowalów", "ZK", "Stadion KS Zorza", "Radowska, Kowalów"),
  k("Pionier Zwierzyn", "Zwierzyn", "PZ", "Boisko KS Pionier", "Sportowa 1, Zwierzyn"),
  k("Toroma Torzym", "Torzym", "TT", "Stadion Miejski", "Jeziorna 4, Torzym"),
  k("GKP Kłodawa", "Kłodawa", "GK", "Boisko w Kłodawie", "Kościelna 15, Kłodawa"),
];

// Klasa Okręgowa Grupa Nr 1 – Zielona Góra (15) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_okregowa/Zielona_Gora/
export const LUB_OKR_ZG: KlubDane[] = [
  k("Tęcza Krosno Odrzańskie", "Krosno Odrzańskie", "TKO", "Stadion OSiR", "Pocztowa 27, Krosno Odrzańskie"),
  k("Zorza Ochla", "Ochla", "ZO", "Boisko LKS Zorza", "Zielonogórska, Ochla"),
  k("ŁKS Łęknica", "Łęknica", "ŁŁ", "Stadion Miejski", "1 Maja, Łęknica"),
  k("Czarni Drągowina", "Drągowina", "CD", "Boisko LZS Czarni", "Długa, Drągowina"),
  k("TS Przylep", "Zielona Góra", "TP", "Stadion TS Przylep", "Turystyczna 13, Zielona Góra"),
  k("KP Świdnica", "Świdnica", "KŚ", "Stadion Miejski im. Janusza Kusocińskiego", "Sportowa 1, Świdnica"),
  k("Pogoń Wężyska", "Wężyska", "PW", "Boisko Pogoń Wężyska", "Wężyska 162"),
  k("Relax Grabice", "Grabice", "RG", "Boisko Relax Grabice", "Grabice 65a"),
  k("Cargovia Kargowa", "Kargowa", "CK", "Stadion Miejski", "Sulechowska, Kargowa"),
  k("Zjednoczeni Brody", "Brody", "ZB", "Boisko Zjednoczeni Brody", "Sportowa 1, Brody"),
  k("Czarni Pałck", "Pałck", "CP", "Boisko LZS Czarni", "Pałck"),
  k("Unia Kunice Żary", "Żary", "UKŻ", "Stadion KP Unia Kunice", "Wojska Polskiego, Żary"),
  k("Budowlani Lubsko", "Lubsko", "BL", "Stadion Miejski", "Sportowa 48, Lubsko"),
  k("Błękitni Ołobok", "Ołobok", "BO", "Boisko KS Błękitni", "Krośnieńska, Ołobok"),
  k("Bóbr Bobrowice", "Bobrowice", "BB", "Stadion Bobrowice", "Bobrowice 119"),
];

// Klasa A Gorzów Wlkp. Grupa I (14) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_A/Gorzow_Wielkopolski_I/
export const LUB_A_GW_1: KlubDane[] = [
  k("Iskra Janczewo", "Janczewo", "IJ", "Boisko LKS Iskra", "Sportowa 27a, Janczewo"),
  k("Meprozet Stare Kurowo", "Stare Kurowo", "MSK", "Stadion Gminny", "Kościuszki 95, Stare Kurowo"),
  k("SHR Wojcieszyce", "Wojcieszyce", "SW", "Boisko KP Progres SHR", "Sportowa, Wojcieszyce"),
  k("Kosmos Rudnica", "Rudnica", "KR", "Boisko KS Kosmos 78", "Główna, Rudnica"),
  k("Budowlani Murzynowo", "Murzynowo", "BM", "Stadion ZLKS Budowlani", "Sportowa 7, Murzynowo"),
  k("Muszelka Ogardy", "Ogardy", "MO", "Boisko KS Muszelka", "Ogardy 52"),
  k("GKP Pszczew", "Pszczew", "GP", "Boisko GKP Pszczew", "Międzyrzecka, Pszczew"),
  k("Zjednoczeni Przytoczna", "Przytoczna", "ZP", "Stadion GKS Zjednoczeni", "Główna 42, Przytoczna"),
  k("GKS Bledzew", "Bledzew", "GB", "Boisko GKS Bledzew", "Zemsko"),
  k("Maksymilian Gorzów Wielkopolski", "Gorzów Wielkopolski", "MGW", "Stadion OSiR", "Olimpijska 1, Gorzów Wielkopolski"),
  k("GKP Bogdaniec", "Bogdaniec", "GB2", "Boisko GKP Bogdaniec", "Pocztowa 7, Bogdaniec"),
  k("Noteć Stare Bielice", "Stare Bielice", "NSB", "Boisko KS Noteć", "Stare Bielice"),
  k("Błękitni Lubno", "Lubno", "BL2", "Boisko KS Błękitni", "Błękitna 32, Lubno"),
  k("Delta Stare Polichno", "Stare Polichno", "DSP", "Boisko KS Delta", "Sportowa, Stare Polichno"),
];

// Klasa A Gorzów Wlkp. Grupa II (14) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_A/Gorzow_Wielkopolski_II/
export const LUB_A_GW_2: KlubDane[] = [
  k("Celuloza II Kostrzyn nad Odrą", "Kostrzyn nad Odrą", "CKO2", "Stadion MOSiR", "Niepodległości 11, Kostrzyn nad Odrą"),
  k("Ilanka II Rzepin", "Rzepin", "IR2", "Stadion Miejski", "Poznańska 60, Rzepin"),
  k("Zieloni Lubiechnia Wielka", "Lubiechnia Wielka", "ZLW", "Boisko KS Zieloni", "Lubiechnia Wielka"),
  k("KS Nowiny Wielkie", "Nowiny Wielkie", "KNW", "Boisko KS Nowiny Wielkie", "Kolejowa 13, Nowiny Wielkie"),
  k("Polonia II Słubice", "Słubice", "PS2", "Stadion SOSiR", "Sportowa 1, Słubice"),
  k("Odra Górzyca", "Górzyca", "OG", "Kompleks Sportowo-Rehabilitacyjny", "Różana 41, Górzyca"),
  k("SKP Słubice", "Słubice", "SS3", "Stadion SOSiR", "Sportowa 1, Słubice"),
  k("Stal II Sulęcin", "Sulęcin", "SS4", "Stadion Miejski im. S. Ożoga", "Moniuszki 2, Sulęcin"),
  k("Leśnik Lemierzyce", "Lemierzyce", "LL", "Boisko KS Leśnik", "Kościuszki, Lemierzyce"),
  k("Juwenia Boczów", "Boczów", "JB", "Boisko KS Juwenia", "Parkowa 2, Boczów"),
  k("Mościenko Sienno", "Sienno", "MS", "Boisko KS Mościenko", "Sienno"),
  k("Pogoń Krzeszyce", "Krzeszyce", "PK2", "Stadion KS Pogoń", "Sportowa 1, Krzeszyce"),
  k("Lubniewiczanka Lubniewice", "Lubniewice", "LL2", "Boisko KS Lubniewiczanka", "Harcerska 23, Lubniewice"),
  k("Znicz Trzemeszno Lubuskie", "Trzemeszno Lubuskie", "ZTL", "Boisko KS Znicz", "Trzemeszno Lubuskie"),
];

// Klasa A Zielona Góra Grupa I (14) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_A/Zielona_Gora_I/
export const LUB_A_ZG_1: KlubDane[] = [
  k("Zorza Port 2000 Mostki", "Mostki", "ZP2M", "Stadion Miejski", "Mostki 1"),
  k("Odra Glińsk", "Glińsk", "OG2", "Boisko w Glińsku", "Glińsk 1"),
  k("Pogoń II Świebodzin", "Świebodzin", "PŚ2", "Stadion OSiR", "Sikorskiego 25, Świebodzin"),
  k("Lubusze Rusinów", "Rusinów", "LR", "Boisko Sportowe Rusinów", "Rusinów 84"),
  k("ZAP Syrena Zbąszynek", "Zbąszynek", "ZSZ", "Stadion OSIR", "Sportowa 2, Zbąszynek"),
  k("Spartak Budachów", "Budachów", "SB", "LKS Spartak Budachów", "Budachów-Kolonia 109"),
  k("Zorza Grzmiąca", "Grzmiąca", "ZG", "Boisko Sportowe Grzmiąca", "Głucholeśna b/n, Grzmiąca"),
  k("Medyk Cibórz", "Cibórz", "MC", "Stadion Sportowy W Ciborzu", "Cibórz 65"),
  k("Liwno Zabór", "Zabór", "LZ", "Masa Arena Boisko Piłkarskie", "Sportowa b/n, Zabór"),
  k("Meteor Jordanowo", "Jordanowo", "MJ", "Boisko piłkarskie - Meteor Jordanowo", "Jordanowo 1"),
  k("Zryw Rzeczyca", "Rzeczyca", "ZR", "Boisko LZS Zryw", "Rzeczyca 46"),
  k("Delta Smardzewo", "Smardzewo", "DS", "Boisko sportowe - Delta Smardzewo", "Smardzewo 33"),
  k("Błękitni Toporów", "Toporów", "BT", "Stadion Sportowy Błękitni Toporów", "Szkolna 11, Toporów"),
  k("Płomień Chlebowo", "Chlebowo", "PC", "Stadion Płomień Chlebowo", "Chlebowo 123"),
];

// Klasa A Zielona Góra Grupa II (14) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_A/Zielona_Gora_II/
export const LUB_A_ZG_2: KlubDane[] = [
  k("Sparta Łężyca", "Łężyca", "SŁ", "Łężycas Park", "Dolna 63, Łężyca"),
  k("Start Płoty", "Płoty", "SP", "Boisko LZS Start", "Sportowa, Płoty"),
  k("MKS Nowe Miasteczko", "Nowe Miasteczko", "MNM", "MKS Nowe Miasteczko", "22 Lipca 18, Nowe Miasteczko"),
  k("Lech Sulechów", "Sulechów", "LS", "Stadion Miejski", "aleja Wielkopolska, Sulechów"),
  k("Czarni Rudno", "Rudno", "CR", "Boisko LUKS Czarni", "Nowosolska 46, Rudno"),
  k("Odra II Nietków", "Nietków", "ON2", "Stadion Gminny", "Sportowa 1, Nietków"),
  k("Kora Niedoradz", "Niedoradz", "KN", "Boisko KS Kora Niedoradz", "Dworcowa b/n, Niedoradz"),
  k("Odra II Bytom Odrzański", "Bytom Odrzański", "OBO", "Stadion Miejski", "Sportowa 12, Bytom Odrzański"),
  k("TKKF Chynowianka Zielona Góra", "Zielona Góra", "TCZG", "Boisko TKKF Chynowianka", "Złota 18, Zielona Góra"),
  k("Piast Czerwieńsk", "Czerwieńsk", "PC2", "Stadion Miejski im. Romana Winnickiego", "Kwiatowa 8a, Czerwieńsk"),
  k("TS II Przylep", "Zielona Góra", "TP2", "Stadion TS Przylep", "Turystyczna 13, Zielona Góra"),
  k("Pogoń Wschowa", "Wschowa", "PW2", "Stadion Miejski", "Sportowa 5, Wschowa"),
  k("GKS Siedlisko", "Siedlisko", "GS", "Boisko GKS Siedlisko", "Głogowska, Siedlisko"),
  k("Pogoń Przyborów", "Przyborów", "PP", "Boisko KS Pogoń", "Drzewna 6a, Przyborów"),
];

// Klasa A Zielona Góra Grupa III (13) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_A/Zielona_Gora_III/
export const LUB_A_ZG_3: KlubDane[] = [
  k("Delta Sieniawa Żarska", "Sieniawa Żarska", "DSŻ", "Boisko LZS Delta", "Sieniawa Żarska"),
  k("Alfa Jaromirowice", "Jaromirowice", "AJ", "Boisko", "Lipowa, Jaromirowice"),
  k("Kado Górzyn", "Górzyn", "KG", "Górzyn Arena", "Sportowa, Górzyn"),
  k("Carina II Gubin", "Gubin", "CG", "Stadion Miejski", "Sikorskiego 89, Gubin"),
  k("Iskra Małomice", "Małomice", "IM", "Boisko MKS Iskra", "Kołłątaja, Małomice"),
  k("Fadom Nowogród Bobrzański", "Nowogród Bobrzański", "FNB", "Stadion piłkarski Nowogród Bobrzański", "Fabryczna, Nowogród Bobrzański"),
  k("Czarni Jelenin", "Jelenin", "CJ", "Stadion Czarni Jelenin", "Jelenin DK296"),
  k("Sparta Mierków", "Mierków", "SM", "Boisko KS \"Sparta\" Mierków", "Mierków 50"),
  k("Orzeł Konin Żagański", "Konin Żagański", "OKŻ", "Boisko Orzeł Konin Żagański", "Jankowska, Konin Żagański"),
  k("Beskid Bożnów", "Bożnów", "BB2", "Boisko KS Beskid Bożnów", "Bożnów 1"),
  k("Czarni II Żagań", "Żagań", "CŻ2", "Stadion MKS Czarni", "Karpińskiego 4, Żagań"),
  k("Budowlani Gozdnica", "Gozdnica", "BG", "Stadion Miejski w Gozdnicy", "Sportowa 1, Gozdnica"),
  k("KS Tomaszowo", "Tomaszowo", "KT", "Boisko KS Tomaszowo", "Leśna 2A, Tomaszowo"),
];

// Klasa B Gorzów Wlkp. Grupa I (11) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Gorzow_Wielkopolski_I/
export const LUB_B_GW_1: KlubDane[] = [
  k("Kasztelania Santok", "Santok", "KS", "Boisko KS Kasztelania", "Gralewska 9, Santok"),
  k("Sokół II Gościm", "Gościm", "SG2", "Boisko KS Sokół", "Gościm"),
  k("Polonia Lipki Wielkie", "Lipki Wielkie", "PLW", "Boisko LKS Polonia", "Szosowa 35, Lipki Wielkie"),
  k("Łucznik II Strzelce Krajeńskie", "Strzelce Krajeńskie", "ŁSK2", "Stadion Miejski", "Sportowa 1, Strzelce Krajeńskie"),
  k("Dąb Górki Noteckie", "Górki Noteckie", "DGN", "Boisko LZS Dąb", "Kurowska 30a, Górki Noteckie"),
  k("Błękitni Dobiegniew", "Dobiegniew", "BD", "Boisko KS Błękitni", "Leśna 2, Dobiegniew"),
  k("Huragan Osiek", "Osiek", "HO", "Boisko KS Błękitni", "Leśna 2, Dobiegniew"),
  k("Błyskawica Lipie Góry", "Lipie Góry", "BLG", "Błyskawica. Klub sportowy", "Strzelecka b/n, Lipie Góry"),
  k("Radowiak II Drezdenko", "Drezdenko", "RD2", "Boisko KS Radowiak", "plac Sportowy 1, Drezdenko"),
  k("Leśnik Rąpin", "Rąpin", "LR2", "Boisko KS Leśnik", "Rąpin"),
  k("Polana Gardzko", "Gardzko", "PG", "Boisko KS \"Leśnik\" Buszów", "Buszów b/n"),
];

// Klasa B Gorzów Wlkp. Grupa II (12) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Gorzow_Wielkopolski_II/
export const LUB_B_GW_2: KlubDane[] = [
  k("Róża II Różanki", "Różanki", "RR2", "Stadion WKS Róża", "Sportowa 9, Różanki"),
  k("KS Wysoka", "Wysoka", "KW", "Stadion KS Wysoka", "Parkowa bn, Wysoka"),
  k("KS Białcz", "Białcz", "KB", "Stadion Klubu Sportowego Białcz", "Gorzowska 1G, Białcz"),
  k("Kania Cup Baczyna", "Baczyna", "KCB", "Boisko wielofunkcyjne Baczyna", "Szkolna 7, Baczyna"),
  k("Orzeł Trzcinna", "Trzcinna", "OT", "Boisko KS Orzeł", "Trzcinna"),
  k("Zjednoczeni Jeniniec", "Jeniniec", "ZJ", "Boisko Klubu Sportowego Zjednoczeni Jeniniec", "Jeniniec 10A"),
  k("GKP II Kłodawa", "Kłodawa", "GK2", "Boisko w Kłodawie", "Klonowa 1, Kłodawa"),
  k("Spartan Sosny", "Sosny", "SS5", "El Stadio Za Działkami", "Sosny b/n"),
  k("Iskra Gorzów Wielkopolski", "Gorzów Wielkopolski", "IGW", "Boisko KS Iskra", "Strażacka 25, Gorzów Wielkopolski"),
  k("Wicher Staw", "Staw", "WS2", "Boisko sportowe w Stawie", "Staw 91A"),
  k("GKP II Bogdaniec", "Bogdaniec", "GB3", "Boisko GKP Bogdaniec", "Pocztowa 7, Bogdaniec"),
  k("Feniks Ściechów", "Ściechów", "FŚ", "Boisko KS Fenix", "Ściechów 70"),
];

// Klasa B Gorzów Wlkp. Grupa III (11) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Gorzow_Wielkopolski_III/
export const LUB_B_GW_3: KlubDane[] = [
  k("Brunatni Sieniawa", "Sieniawa", "BS", "Stadion sportowy klub Brunatni", "Sieniawa 1A"),
  k("Zew Dąbroszyn", "Dąbroszyn", "ZD", "Boisko KS Zew", "Dąbroszyn 23"),
  k("Orzeł II Międzyrzecz", "Międzyrzecz", "OM2", "Stadion Miejski", "Mieczysława Mikuły 1, Międzyrzecz"),
  k("FC Kursko", "Kursko", "FK", "Stadion Miejski", "Mieczysława Mikuły 1, Międzyrzecz"),
  k("Walka Czarnów", "Czarnów", "WC", "Boisko KS Walka", "Stańska 12, Czarnów"),
  k("Chrobry Drzeńsko", "Drzeńsko", "CD2", "Boisko KS Chrobry", "Drzeńsko 59"),
  k("GKP II Pszczew", "Pszczew", "GP2", "Boisko GKP Pszczew", "Międzyrzecka, Pszczew"),
  k("SKP II Słubice", "Słubice", "SS6", "Stadion SOSiR", "Sportowa 1, Słubice"),
  k("Warta Kołczyn", "Kołczyn", "WK", "Boisko KS Warta", "Leśna 5, Kołczyn"),
  k("Obra Policko", "Policko", "OP", "Boisko Sportowe w Policku", "Międzyrzecka b/n, Policko"),
  k("As Pieski", "Pieski", "AP", "Boisko As Pieski", "Pieski"),
];

// Klasa B Zielona Góra – grupa Krosno Odrzańskie (11) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Krosno_Odrzanskie/
export const LUB_B_ZG_KROSNOODRZASKIE: KlubDane[] = [
  k("Tęcza II Krosno Odrzańskie", "Krosno Odrzańskie", "TKO2", "Stadion OSiR", "Pocztowa 27, Krosno Odrzańskie"),
  k("Perła Cybinka", "Cybinka", "PC3", "Stadion Miejski", "Dąbrowskiego 32, Cybinka"),
  k("Sparta Nietkowice", "Nietkowice", "SN", "Boisko Sparta Nietkowice", "Nietkowice DK278"),
  k("Nafta Rybaki", "Rybaki", "NR", "Boisko KS Nafta", "Rybaki b/n"),
  k("Kruszywo Raduszec Stary", "Stary Raduszec", "KRS", "Boisko Sportowe Stary Raduszec", "Stary Raduszec 20C"),
  k("Polesie Białków", "Białków", "PB", "Boisko piłkarskie w Białkowie", "Białków b/n"),
  k("Zieloni Łagów", "Łagów", "ZŁ", "Łagów Arena - Zieloni Klub Sportowy", "Zielonogórska 7b, Łagów"),
  k("Energetyk Dychów", "Dychów", "ED", "Boisko Sportowe w Dychowie", "Dychów 56B"),
  k("Czarni Czarnowo", "Czarnowo", "CC", "Boisko LKS Czarni", "Czarnowo 6"),
  k("Tramp Osiecznica", "Osiecznica", "TO", "Boisko sportowe w Osiecznicy", "Sportowa bn, Osiecznica"),
  k("Odra Radnica", "Radnica", "OR", "Boisko Radnica", "Radnica bn"),
];

// Klasa B Zielona Góra – grupa Nowa Sól (16) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Nowa_Sol/
export const LUB_B_ZG_NOWASOL: KlubDane[] = [
  k("Korona Wschowa", "Wschowa", "KW2", "Stadion Miejski", "Sportowa 5, Wschowa"),
  k("Korona II Kożuchów", "Kożuchów", "KK2", "Stadion Miejski", "Zielonogórska 24, Kożuchów"),
  k("Kormoran Sława", "Sława", "KS2", "Stadion Miejski im. Zbigniewa Gołembskiego", "Ogrodowa 1b, Sława"),
  k("Błękitni Lubięcin", "Lubięcin", "BL3", "Boisko Ludowego Klubu Sportowego Błękitni Lubięcin", "Lubięcin b/n"),
  k("Mieszko Konotop", "Konotop", "MK", "Boisko KS Mieszko", "Leśna 2, Konotop"),
  k("Dąb II Przybyszów", "Przybyszów", "DP", "Boisko piłkarskie Topola - Łupice", "Łupice DW316"),
  k("Polonia Kiełcz", "Kiełcz", "PK3", "Stadion WKS Polonii Kiełcz", "Sportowa, Kiełcz"),
  k("Ikar Krzepielów", "Krzepielów", "IK", "Stadion Sportowy \"Ikar Krzepielów\"", "Krzepielów 35"),
  k("Topola Łupice", "Łupice", "TŁ", "Boisko piłkarskie Topola - Łupice", "Łupice DW316"),
  k("Orzeł Otyń", "Otyń", "OO"),
  k("Czarni II Rudno", "Rudno", "CR2", "Boisko LUKS Czarni", "Nowosolska 46, Rudno"),
  k("Modrzew Modrzyca", "Modrzyca", "MM", "Boisko piłkarskie Modrzyca", "Świerkowa 13, Modrzyca"),
  k("MKS II Nowe Miasteczko", "Nowe Miasteczko", "MNM2", "MKS Nowe Miasteczko", "22 Lipca 18, Nowe Miasteczko"),
  k("Zorza Nowe Żabno", "Nowe Żabno", "ZNŻ", "Boisko klubowe LZS Zorza Nowe Żabno", "Sportowa b/n, Nowe Żabno"),
  k("Irma Studzieniec", "Studzieniec", "IS", "Boisko Irma Studzieniec", "Studzieniec DW 283"),
  k("Błękitni Wierzbnica", "Wierzbnica", "BW", "Boisko Sportowe w Wierzbnicy", "Wierzbnica 20 B"),
];

// Klasa B Zielona Góra – grupa Świebodzin (11) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Swiebodzin/
export const LUB_B_ZG_SWIEBODZIN: KlubDane[] = [
  k("Chrobry Brójce", "Brójce", "CB", "Boisko Brójce", "Strażacka 1, Brójce"),
  k("Sokół Rozłogi", "Rozłogi", "SR", "Boisko Klub Sokół Rozłogi", "Rozłogi 56"),
  k("Błękitni II Ołobok", "Ołobok", "BO2", "Boisko KS Błękitni", "Krośnieńska, Ołobok"),
  k("KS Radoszyn", "Radoszyn", "KR2", "Boisko KS Radoszyn", "Radoszyn DW276"),
  k("Zjednoczeni Lubrza", "Lubrza", "ZL", "Boisko sportowe w Lubrzej", "Świebodzińska 1, Lubrza"),
  k("Sokół Dąbrówka Wielkopolska", "Dąbrówka Wielkopolska", "SDW", "Stadion Gminny im. Stanisława Mizernego w Dąbrówce Wielkopolskiej", "Dworcowa 26, Dąbrówka Wielkopolska"),
  k("Schnug Chociule", "Chociule", "SC", "Boisko KS Schnug", "Chociule"),
  k("Zenit Myszęcin", "Myszęcin", "ZM", "Boisko wiejskie Zenit Myszęcin", "Myszęcin DK92"),
  k("Victoria II Szczaniec", "Szczaniec", "VS2", "Stadion Gminny", "Sportowa 1, Szczaniec"),
  k("Radość Staropole", "Staropole", "RS", "Boisko w Staropolu", "Staropole b/n"),
  k("Bizon Wilkowo", "Wilkowo", "BW2", "Boisko Wilkowo", "Wilkowo 78"),
];

// Klasa B Zielona Góra – grupa Żagań (11) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Zagan/
export const LUB_B_ZG_ZAGA: KlubDane[] = [
  k("Iskra Wymiarki", "Wymiarki", "IW", "Stadion Iskra Wymiarki", "Ogrodowa 2, Wymiarki"),
  k("Sprotavia II Szprotawa", "Szprotawa", "SS7", "Stadion Miejski", "Sobieskiego 68, Szprotawa"),
  k("Mirostowiczanka Mirostowice Dolne", "Mirostowice Dolne", "MMD", "Mirostowiczanka. Klub sportowy", "Kolejowa 5, Mirostowice Dolne"),
  k("Czarni Przybymierz", "Przybymierz", "CP2", "Boisko Przybymierz", "Klubowa 1, Przybymierz"),
  k("Płomień Czerna", "Czerna", "PC4", "Boisko w Czernej", "Czerna b/n"),
  k("Zorza Brzeźnica", "Brzeźnica", "ZB2", "Boisko w Brzeźnicy", "Zielonogórska 24, Brzeźnica"),
  k("Husaria Niegosławice", "Niegosławice", "HN", "Boisko sportowe Niegosławice", "Niegosławice b/n"),
  k("Kwisa Trzebów", "Trzebów", "KT2", "Boisko LZS Kwisa Trzebów", "Rudawica b/n"),
  k("UKS Witków", "Witków", "UW", "UKS Witków ,,Bimber Arena\"", "Witków bn"),
  k("Raptus Dzikowice", "Dzikowice", "RD3", "Boisko Sportowe w Dzikowicach", "Dzikowice b/n"),
  k("Traper Chichy", "Chichy", "TC", "Boisko Sportowe Janowiec", "Chichy - Małomice b/n"),
];

// Klasa B Zielona Góra – grupa Żary (14) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Zary/
export const LUB_B_ZG_ZARY: KlubDane[] = [
  k("Łużyczanka Lipinki Łużyckie", "Lipinki Łużyckie", "ŁLŁ", "LKS Łużyczanka Lipinki Łużyckie", "Główna 27, Lipinki Łużyckie"),
  k("Błękitni Zabłocie", "Zabłocie", "BZ", "Boisko Błękitni Zabłocie", "Zabłocie 16"),
  k("Tęcza Kaczenice", "Kaczenice", "TK", "Stadion LZS Tęcza Kaczenice", "Nowogrodzka b/n, Kaczenice"),
  k("Sparta Grabik", "Grabik", "SG3", "Boisko KS Sparta", "Grabik 102a"),
  k("Iskra Jabłoniec", "Jabłoniec", "IJ2", "Boisko Iskry Jabłoniec", "Jabłoniec b/n"),
  k("Piast Lubanice", "Lubanice", "PL", "Klub Sportowy Piast Lubanice", "Lubanice 66"),
  k("Błękitni Olbrachtów", "Olbrachtów", "BO3", "Boisko OLB Błękit", "Olbrachtów DK27"),
  k("Fax Bieniów", "Bieniów", "FB", "Boisko Fax Bieniów", "Zielonogórska 4, Bieniów"),
  k("Zieloni Drożków", "Drożków", "ZD2", "Boisko Drożków", "Drożków 86"),
  k("Granica Żarki Wielkie", "Żarki Wielkie", "GŻW", "Stadion Miejski w Żarkach", "Kościelna, Żarki Wielkie"),
  k("Delta II Sieniawa Żarska", "Sieniawa Żarska", "DSŻ2", "Boisko LZS Delta", "Sieniawa Żarska"),
  k("Kado II Górzyn", "Górzyn", "KG2", "Stadion Miejski", "Sportowa 48, Lubsko"),
  k("Tupliczanka Tuplice", "Tuplice", "TT2", "Stadion Tupliczanka Tuplice", "Parkowa, Tuplice"),
  k("Nysa Trzebiel", "Trzebiel", "NT", "KS Nysa Trzebiel", "Tuplicka 5b, Trzebiel"),
];

// Klasa B Zielona Góra – grupa Zielona Góra (12) — https://regiowyniki.pl/wyniki/Pilka_Nozna/2026/2027/20261127/mecze/Lubuskie/Klasa_B/Zielona_Gora/
export const LUB_B_ZG_ZIELONAGORA: KlubDane[] = [
  k("Ikar Zawada", "Zawada", "IZ", "Boisko Piłkarskie - Zawada (Zielona Góra)", "Sportowa 5, Zawada"),
  k("Odra Klenica", "Klenica", "OK", "Odra Klenica", "Sportowa 2, Klenica"),
  k("Klon Babimost", "Babimost", "KB2", "Stadion CSiR", "Żwirki i Wigury 10a, Babimost"),
  k("Mewa Cigacice", "Cigacice", "MC2", "Boisko Mewy Cigacice", "Sulechowska b/n, Cigacice"),
  k("Polonia Nowe Kramsko", "Nowe Kramsko", "PNK", "Boisko piłkarskie", "Kolesin"),
  k("Cargovia II Kargowa", "Kargowa", "CK2", "Stadion Miejski", "Sulechowska, Kargowa"),
  k("Leśnik Słone", "Słone", "LS2", "Boisko do piłki nożnej", "Słoneczna 48"),
  k("Sokół Kalsk", "Kalsk", "SK", "Stadion piłkarski \"Sokół Kalsk\"", "Kalsk 68a"),
  k("Znicz Leśniów Wielki", "Leśniów Wielki", "ZLW2", "Boisko LKS Znicz", "Leśniów Wielki 94"),
  k("Rakovia Raków", "Raków", "RR3", "Boisko Raków", "400-lecia Rakowa 19A, Raków"),
  k("Piast Parkovia Trzebiechów", "Trzebiechów", "PPT", "Boisko Wiejskie Głuchów", "Głuchów 1"),
  k("Wzgórze Podlegórz", "Podlegórz", "WP", "Boisko sportowe Wzgórze Podlegórz", "Podlegórz b/n"),
];

const GORA = [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. III", kluby: III_LIGA_GR3 }, { nazwa: "IV liga lubuska", kluby: LUB_IV }];
export const LUBUSKIE_GW_1: Sciezka = {
  id: "lubuskie-gw-1", nazwa: "Lubuskie — Gorzów Wlkp. I",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Gorzów Wlkp.)", kluby: LUB_OKR_GW },
    { nazwa: "Klasa A — lubuska (Gorzów Wlkp. 1)", kluby: LUB_A_GW_1 },
    { nazwa: "Klasa B — lubuska (Gorzów Wlkp. 1)", kluby: LUB_B_GW_1 },
  ],
};
export const LUBUSKIE_GW_2: Sciezka = {
  id: "lubuskie-gw-2", nazwa: "Lubuskie — Gorzów Wlkp. II",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Gorzów Wlkp.)", kluby: LUB_OKR_GW },
    { nazwa: "Klasa A — lubuska (Gorzów Wlkp. 1)", kluby: LUB_A_GW_1 },
    { nazwa: "Klasa B — lubuska (Gorzów Wlkp. 2)", kluby: LUB_B_GW_2 },
  ],
};
export const LUBUSKIE_GW_3: Sciezka = {
  id: "lubuskie-gw-3", nazwa: "Lubuskie — Gorzów Wlkp. III",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Gorzów Wlkp.)", kluby: LUB_OKR_GW },
    { nazwa: "Klasa A — lubuska (Gorzów Wlkp. 2)", kluby: LUB_A_GW_2 },
    { nazwa: "Klasa B — lubuska (Gorzów Wlkp. 3)", kluby: LUB_B_GW_3 },
  ],
};
export const LUBUSKIE_ZG_KROSNOODRZASKIE: Sciezka = {
  id: "lubuskie-zg-krosnoodrzaskie", nazwa: "Lubuskie — Zielona Góra / Krosno Odrzańskie",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Zielona Góra)", kluby: LUB_OKR_ZG },
    { nazwa: "Klasa A — lubuska (Zielona Góra 3)", kluby: LUB_A_ZG_3 },
    { nazwa: "Klasa B — lubuska (Zielona Góra Krosno Odrzańskie)", kluby: LUB_B_ZG_KROSNOODRZASKIE },
  ],
};
export const LUBUSKIE_ZG_NOWASOL: Sciezka = {
  id: "lubuskie-zg-nowasol", nazwa: "Lubuskie — Zielona Góra / Nowa Sól",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Zielona Góra)", kluby: LUB_OKR_ZG },
    { nazwa: "Klasa A — lubuska (Zielona Góra 2)", kluby: LUB_A_ZG_2 },
    { nazwa: "Klasa B — lubuska (Zielona Góra Nowa Sól)", kluby: LUB_B_ZG_NOWASOL },
  ],
};
export const LUBUSKIE_ZG_SWIEBODZIN: Sciezka = {
  id: "lubuskie-zg-swiebodzin", nazwa: "Lubuskie — Zielona Góra / Świebodzin",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Zielona Góra)", kluby: LUB_OKR_ZG },
    { nazwa: "Klasa A — lubuska (Zielona Góra 1)", kluby: LUB_A_ZG_1 },
    { nazwa: "Klasa B — lubuska (Zielona Góra Świebodzin)", kluby: LUB_B_ZG_SWIEBODZIN },
  ],
};
export const LUBUSKIE_ZG_ZAGA: Sciezka = {
  id: "lubuskie-zg-zaga", nazwa: "Lubuskie — Zielona Góra / Żagań",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Zielona Góra)", kluby: LUB_OKR_ZG },
    { nazwa: "Klasa A — lubuska (Zielona Góra 2)", kluby: LUB_A_ZG_2 },
    { nazwa: "Klasa B — lubuska (Zielona Góra Żagań)", kluby: LUB_B_ZG_ZAGA },
  ],
};
export const LUBUSKIE_ZG_ZARY: Sciezka = {
  id: "lubuskie-zg-zary", nazwa: "Lubuskie — Zielona Góra / Żary",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Zielona Góra)", kluby: LUB_OKR_ZG },
    { nazwa: "Klasa A — lubuska (Zielona Góra 3)", kluby: LUB_A_ZG_3 },
    { nazwa: "Klasa B — lubuska (Zielona Góra Żary)", kluby: LUB_B_ZG_ZARY },
  ],
};
export const LUBUSKIE_ZG_ZIELONAGORA: Sciezka = {
  id: "lubuskie-zg-zielonagora", nazwa: "Lubuskie — Zielona Góra",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — lubuska (Zielona Góra)", kluby: LUB_OKR_ZG },
    { nazwa: "Klasa A — lubuska (Zielona Góra 2)", kluby: LUB_A_ZG_2 },
    { nazwa: "Klasa B — lubuska (Zielona Góra Zielona Góra)", kluby: LUB_B_ZG_ZIELONAGORA },
  ],
};

// Podział terytorialny (LZPN przydziela grupy A/B terytorialnie przed sezonem; przypisanie B → A wg położenia klubów 2026/27):
// Klasa B — lubuska (Gorzów Wlkp. 1) → Klasa A — lubuska (Gorzów Wlkp. 1) → Klasa okręgowa — lubuska (Gorzów Wlkp.)
// Klasa B — lubuska (Gorzów Wlkp. 2) → Klasa A — lubuska (Gorzów Wlkp. 1) → Klasa okręgowa — lubuska (Gorzów Wlkp.)
// Klasa B — lubuska (Gorzów Wlkp. 3) → Klasa A — lubuska (Gorzów Wlkp. 2) → Klasa okręgowa — lubuska (Gorzów Wlkp.)
// Klasa B — lubuska (Zielona Góra Krosno Odrzańskie) → Klasa A — lubuska (Zielona Góra 3) → Klasa okręgowa — lubuska (Zielona Góra)
// Klasa B — lubuska (Zielona Góra Nowa Sól) → Klasa A — lubuska (Zielona Góra 2) → Klasa okręgowa — lubuska (Zielona Góra)
// Klasa B — lubuska (Zielona Góra Świebodzin) → Klasa A — lubuska (Zielona Góra 1) → Klasa okręgowa — lubuska (Zielona Góra)
// Klasa B — lubuska (Zielona Góra Żagań) → Klasa A — lubuska (Zielona Góra 2) → Klasa okręgowa — lubuska (Zielona Góra)
// Klasa B — lubuska (Zielona Góra Żary) → Klasa A — lubuska (Zielona Góra 3) → Klasa okręgowa — lubuska (Zielona Góra)
// Klasa B — lubuska (Zielona Góra Zielona Góra) → Klasa A — lubuska (Zielona Góra 2) → Klasa okręgowa — lubuska (Zielona Góra)
// Awanse/spadki (art. 17 § 20): IV liga: 1. → III liga gr. III, 2. → baraże (uchwała PZPN VI/85), spadają 16–18.
// Okręgowa (2 gr.): 1.–2. → IV liga; spadek ZG 15–16, GW 16. Klasa A: zwycięzcy grup + najlepszy wicelider → okręgowa;
// spadek ZG 13–14, GW 14. Klasa B: zwycięzcy grup + najlepsi wiceliderzy → klasa A (ZG 8, GW 4); najniższy szczebel.
// [Ekstra↔I, I↔II, II↔III, III↔IV, IV↔okręgowa, okręgowa↔A, A↔B]
const WYMIANA = [3, 3, 2, 2, 2, 2, 2];
export const LUBUSKIE_REGIONY: Sciezka[] = [LUBUSKIE_GW_1, LUBUSKIE_GW_2, LUBUSKIE_GW_3, LUBUSKIE_ZG_KROSNOODRZASKIE, LUBUSKIE_ZG_NOWASOL, LUBUSKIE_ZG_SWIEBODZIN, LUBUSKIE_ZG_ZAGA, LUBUSKIE_ZG_ZARY, LUBUSKIE_ZG_ZIELONAGORA].map((sc) => ({ ...sc, wymiana: WYMIANA }));


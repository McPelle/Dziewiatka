// Województwo OPOLSKIE — piramida IV liga → klasa B (sezon 2026/2027). OZPN nie ma podokręgów — wszystkie klasy prowadzi Wydział Gier;
// grupy są terytorialne (powiaty). Składy: oficjalne tabele pilkaopolska.pl (OZPN) zgodne z regiowyniki.pl (stan 27.11.2026).
// Stadiony i adresy: boiska z protokołów meczów regiowyniki.pl. Zawodnicy generowani.
// Awanse/spadki: Regulamin rozgrywek OZPN 2026/27 (Uchwała 14/2026), § 21; przydział grup B → A wg powiatów klubów.
import { type KlubDane, type Sciezka } from "./kluby";
import { GORA_KRAJOWA } from "./pomorskie";
import { III_LIGA_GR3 } from "./iii-liga-gr3";

const k = (nazwa: string, miasto: string, skrot: string, stadion?: string, adres?: string): KlubDane => ({ nazwa, skrot, miasto, ...(stadion ? { stadion } : {}), ...(adres ? { adres } : {}) });

// IV liga opolska (BS Leśnica 4. Liga Opolska) (14) — całe województwo (Wydział Gier OZPN) — https://pilkaopolska.pl/4-liga-opolska-2/
export const OPO_IV: KlubDane[] = [
  k("Odra II Opole", "Opole", "OO", "Centrum Sportu", "Wandy Rutkiewicz 10, Opole"),
  k("LZS Starowice", "Starowice Dolne", "LS", "Stadion LZS Starowice", "Starowice Dolne"),
  k("LZS Starościn", "Starościn", "LS2", "Stadion LZS Starościn", "Kluczborska 4, Starościn"),
  k("Ruch Zdzieszowice", "Zdzieszowice", "RZ", "Stadion Miejski", "Rozwadzka 2, Zdzieszowice"),
  k("Start Namysłów", "Namysłów", "SN", "Stadion Miejski", "Pułaskiego 5, Namysłów"),
  k("LZS Domaszkowice", "Domaszkowice", "LD", "Boisko LZS Domaszkowice", "Domaszkowice 81"),
  k("Adamietz Kadłub", "Kadłub", "AK", "Boisko LKS Kadłub", "Powstańców Śląskich 12, Kadłub"),
  k("Małapanew Ozimek", "Ozimek", "MO", "Stadion Miejski", "Częstochowska 27, Ozimek"),
  k("Stal Zawadzkie", "Zawadzkie", "SZ", "Stadion Miejski", "Opolska 1, Zawadzkie"),
  k("Porawie Większyce", "Większyce", "PW", "Boisko LKS Porawie", "Raciborska 9, Większyce"),
  k("MKS Gogolin", "Gogolin", "MG", "Stadion Miejski", "Kasztanowa 22, Gogolin"),
  k("Victoria Żyrowa", "Żyrowa", "VŻ", "Boisko LKS Victoria", "Hrabiów von Gaschin 1, Żyrowa"),
  k("Fortuna Głogówek", "Głogówek", "FG", "Boisko piłkarskie / sztuczna nawierzchnia", "Powstańców 35, Głogówek"),
  k("Śląsk Łubniany", "Łubniany", "ŚŁ", "Boisko KS Śląsk", "Opolska 1, Łubniany"),
];

// Klasa okręgowa "Football World" – grupa 1 (16) — północ/centrum: Opole, powiaty opolski, oleski, kluczborski, namysłowski, strzelecki (część), brzeski (część) — https://pilkaopolska.pl/klasa-okregowa-grupa-i/
export const OPO_OKR_1: KlubDane[] = [
  k("KS Krasiejów", "Krasiejów", "KK", "Stadion Sportowy", "Spóracka 19, Krasiejów"),
  k("Źródło Krośnica", "Krośnica", "ŹK", "Boisko LKS Źródło", "Szkolna 1, Krośnica"),
  k("Orzeł Źlinice", "Źlinice", "OŹ", "Boisko ULKS Orzeł", "Opolska, Źlinice"),
  k("TOR Dobrzeń Wielki", "Dobrzeń Wielki", "TDW", "Stadion MOSiR", "Sportowa 1, Dobrzeń Wielki"),
  k("Stal II Brzeg", "Brzeg", "SB", "Stadion Miejski", "Sportowa 1, Brzeg"),
  k("OKS Olesno", "Olesno", "OO2", "Stadion Miejski", "Wachowska 10, Olesno"),
  k("Skalnik Gracze", "Gracze", "SG", "Stadion Miejski", "Sportowa 5, Gracze"),
  k("LZS Ligota Turawska", "Ligota Turawska", "LLT", "Boisko LZS Ligota Turawska", "Dworska 2 b, Ligota Turawska"),
  k("LZS Mechnice", "Mechnice", "LM", "Boisko SSTiR LZS Mechnice", "Strażacka 6, Mechnice"),
  k("Żubry Smarchowice Śląskie", "Smarchowice Śląskie", "ŻSŚ", "Stadion LZS Żubry", "Kościelna, Smarchowice Śląskie"),
  k("Chrząszcz Chrząszczyce", "Chrząszczyce", "CC", "Chrząszcz Arena", "Opolska 50, Chrząszczyce"),
  k("Start Jełowa", "Jełowa", "SJ", "Boisko LZS Start", "Nadleśna 35, Jełowa"),
  k("LZS Kuniów", "Kuniów", "LK", "Boisko LZS Kuniów", "Kuniów 76A"),
  k("Motor Praszka", "Praszka", "MP", "Boisko ZKS Motor", "Sportowa 7, Praszka"),
  k("Swornica Czarnowąsy", "Czarnowąsy", "SC", "Boisko LZS Swornica", "Jagiełły 2a, Opole-Czarnowąsy"),
  k("Piast Strzelce Opolskie", "Strzelce Opolskie", "PSO", "Stadion Miejski", "Strzelców Bytomskich 2, Strzelce Opolskie"),
];

// Klasa okręgowa "Football World" – grupa 2 (16) — południe: powiaty nyski, prudnicki, głubczycki, kędzierzyńsko-kozielski, krapkowicki, strzelecki (część), brzeski (Grodków) — https://pilkaopolska.pl/klasa-okregowa-grupa-ii/
export const OPO_OKR_2: KlubDane[] = [
  k("GKS Grodków", "Grodków", "GG", "Stadion Miejski", "Sportowa 3, Grodków"),
  k("Orzeł Branice", "Branice", "OB", "KS Orzeł", "Szkolna 1, Branice"),
  k("Pogoń Prudnik", "Prudnik", "PP", "Stadion MKS Sparta", "Włoska 10, Prudnik"),
  k("Polonia Głubczyce", "Głubczyce", "PG", "Stadion Miejski", "plac Sportowy 4, Głubczyce"),
  k("Czarni Otmuchów", "Otmuchów", "CO", "Stadion Miejski w Otmuchowie", "Sportowa 1, Otmuchów"),
  k("Orzeł Reńska Wieś", "Reńska Wieś", "ORW", "Boisko piłkarskie", "Reńska Wieś 9a"),
  k("Union Ujazd", "Ujazd", "UU", "Stadion Miejski", "Bolesława Chrobrego 7, Ujazd"),
  k("KS Twardawa", "Twardawa", "KT", "Boisko KS Twardawa", "Kozielska, Twardawa"),
  k("LZS Racławiczki", "Racławiczki", "LR"),
  k("Chemik Kędzierzyn-Koźle", "Kędzierzyn-Koźle", "CKK", "Stadion \"Kuźniczka\"", "Grunwaldzka 71, Kędzierzyn-Koźle"),
  k("LZS II Starowice", "Starowice Dolne", "LS3", "Stadion LZS Starowice", "Starowice Dolne"),
  k("Unia Krapkowice", "Krapkowice", "UK", "Stadion KS Unia", "Sportowa 1, Krapkowice"),
  k("Polonia Prószków", "Prószków", "PP2", "Stadion Miejski", "Sportowa 1, Prószków"),
  k("GKS Głuchołazy", "Głuchołazy", "GG2", "Stadion Miejski", "Konopnickiej 2, Głuchołazy"),
  k("LZS Raszowa", "Raszowa", "LR2", "Boisko LZS Raszowa", "Kościelna 9c, Raszowa"),
  k("KS Cisowa (Kędzierzyn-Koźle)", "Kędzierzyn-Koźle", "KCK", "Stadion Klubu Sportowego Cisowa", "Jana Brzechwy 78, Kędzierzyn-Koźle"),
];

// Klasa A – grupa 1 (16) — Olesno / Kluczbork / Namysłów / Strzelce Opolskie (płn.) — https://pilkaopolska.pl/klasa-a-grupa-i/
export const OPO_A_1: KlubDane[] = [
  k("Unia Kolonowskie", "Kolonowskie", "UK2", "Boisko KS Unia", "Księdza Czerwionki 2a, Kolonowskie"),
  k("Sokół Bierdzany", "Bierdzany", "SB2", "Boisko Sokół Bierdzany", "Boiskowa, Bierdzany"),
  k("Start II Namysłów", "Namysłów", "SN2", "Stadion Miejski", "Pułaskiego 5, Namysłów"),
  k("OKS II Olesno", "Olesno", "OO3", "Stadion Miejski", "Wachowska 10, Olesno"),
  k("Budowlani Strojec", "Strojec", "BS", "Stadion Budowlani Strojec", "Ogrodowa 4, Strojec"),
  k("Naprzód Jemielnica", "Jemielnica", "NJ", "Stadion LKS Naprzód", "Leśna 2, Jemielnica"),
  k("KS II Krasiejów", "Krasiejów", "KK2", "Stadion Sportowy", "Spóracka 19, Krasiejów"),
  k("LZS II Starościn", "Starościn", "LS4", "Stadion LZS Starościn", "Kluczborska 4, Starościn"),
  k("LZS Polanowice", "Polanowice", "LP", "Stadion LZS Polanowice", "Polanowice"),
  k("Piast Gorzów Śląski", "Gorzów Śląski", "PGŚ", "Stadion Piast Gorzów Śląski", "Sportowa 1, Gorzów Śląski"),
  k("LZS Chocianowice", "Chocianowice", "LC", "Boisko LZS Chocianowice", "Chocianowice 99a"),
  k("LZS Uszyce", "Uszyce", "LU", "Boisko Uszyce", "Uszyce 36"),
  k("LZS Ligota Wołczyńska", "Ligota Wołczyńska", "LLW", "Boisko LZS Ligota Wołczyńska", "Ligota Wołczyńska 1"),
  k("Start Dobrodzień", "Dobrodzień", "SD", "Stadion Miejski", "Piastowska 115, Dobrodzień"),
  k("LZS Żytniów", "Żytniów", "LŻ", "Boisko LZS Żytniów", "Żytniów"),
  k("KS Bogacica", "Bogacica", "KB", "Boisko KS Bogacica", "Nowa 1, Bogacica"),
];

// Klasa A – grupa 2 (16) — Nysa / Brzeg (płd.) — https://pilkaopolska.pl/klasa-a-grupa-ii/
export const OPO_A_2: KlubDane[] = [
  k("Orzeł Olszanka", "Olszanka", "OO4", "Boisko sportowe", "Olszanka"),
  k("Atom Grądy-Malerzowice Małe", "Malerzowice Małe", "AGMM", "Boisko Sportowe Malerzowice Małe", "Malerzowice Małe"),
  k("Kastor Jasienica Górna", "Jasienica Górna", "KJG", "Boisko LZS Kastor", "Jasienica Górna"),
  k("KS Bodzanów-Nowy Świętów", "Bodzanów", "KBNŚ"),
  k("KS Skarbimierz", "Skarbimierz-Osiedle", "KS", "Stadion Miejski w Skarbimierzu", "Akacjowa 5, Skarbimierz Osiedle"),
  k("Sudety Burgrabice", "Burgrabice", "SB3", "Boisko KKS Sudety", "Burgrabice"),
  k("Ogrodnik Chróścina Nyska", "Chróścina", "OCN", "Boisko sportowe", "Kroszyńska 12, Chróścina"),
  k("Metalowiec Łambinowice", "Łambinowice", "MŁ", "Boisko KS Metalowiec", "Obozowa 23, Łambinowice"),
  k("LKS Rusocin", "Rusocin", "LR3", "Boisko piłkarskie", "Rusocin 32a"),
  k("UKS Karnków", "Karnków", "UK3", "Boisko UKS Karnków", "Karnków"),
  k("Sokół Małujowice", "Małujowice", "SM", "Boisko do piłki nożnej", "Małujowice"),
  k("MKS Tułowice", "Tułowice", "MT", "Stadion MKS Tułowice", "Sportowa 9, Tułowice"),
  k("LZS Ścinawa Nyska", "Ścinawa Nyska", "LŚN", "Boisko sportowe Korfantów", "Klasztorna 17, Korfantów"),
  k("LKS Biała Nyska", "Biała Nyska", "LBN", "Boisko sportowe w Kopernikach", "Koperniki"),
  k("LZS Polski Świętów", "Polski Świętów", "LPŚ", "Boisko LZS Polski Świętów", "Polski Świętów"),
  k("LZS Buków", "Buków", "LB", "LZS Buków, Klub Piłkarski", "Buków"),
];

// Klasa A – grupa 3 (16) — Opole / Brzeg — https://pilkaopolska.pl/klasa-a-grupa-iii/
export const OPO_A_3: KlubDane[] = [
  k("Victoria Chróścice", "Chróścice", "VC", "Stadion LZS Victoria", "Św. Rocha 26, Chróścice"),
  k("Orzeł II Źlinice", "Źlinice", "OŹ2", "Boisko ULKS Orzeł", "Opolska, Źlinice"),
  k("Sparta Dębie", "Dębie", "SD2", "Boisko Sportowe Dembio Arena", "Wiejska, Dębie"),
  k("Piast Opole", "Opole", "PO", "Stadion LZS Wrzoski", "Nad Stawem 23, Opole-Wrzoski"),
  k("Silesius Kotórz Mały", "Kotórz Mały", "SKM", "Boisko LKS Silesius", "Boiskowa, Kotórz Mały"),
  k("Rudatom Kępa", "Kępa", "RK", "Boisko piłkarskie", "Zawadzka 5, Kępa"),
  k("Olimpia Lewin Brzeski", "Lewin Brzeski", "OLB", "Stadion im. Mieczysława Kawiaka", "Powstańców Śląskich 51, Lewin Brzeski"),
  k("Unia Raszowa-Daniec", "Raszowa", "URD", "Boisko sportowe", "Krośnicka 7, Raszowa"),
  k("1.FC Chronstau Chrząstowice", "Chrząstowice", "1CC", "Chronstau Arena", "Ozimska 3a, Chrząstowice"),
  k("Piomar Tarnów-Przywory", "Przywory", "PTP", "Stadion sportowy im. Józefa Zwierzyny", "Osiedle Zakładowe 9, Tarnów Opolski"),
  k("LZS Skorogoszcz", "Skorogoszcz", "LS5", "Stadion LZS Skorogoszcz", "Słowackiego, Skorogoszcz"),
  k("SKS Dąbrowa", "Dąbrowa", "SD3"),
  k("LZS Victoria Kościerzyce", "Kościerzyce", "LVK", "Boisko Kościerzyce", "Kościerzyce"),
  k("Gazownik Wawelno", "Wawelno", "GW", "Stadion Sportowy Klubu LZS Wawelno", "Wawelno"),
  k("LKS Rybna", "Rybna", "LR4", "Stadion LKS Rybna", "Krótka 4, Rybna"),
  k("LZS Brynica", "Brynica", "LB2", "Boisko sportowe", "ks. Klimasa, Brynica"),
];

// Klasa A – grupa 4 (16) — Kędzierzyn-Koźle / Głubczyce / Krapkowice / Strzelce Opolskie (płd.) — https://pilkaopolska.pl/klasa-a-grupa-iv/
export const OPO_A_4: KlubDane[] = [
  k("Odrzanka Dziergowice", "Dziergowice", "OD", "Stadion LZS Odrzanka", "Sportowa 11, Dziergowice"),
  k("Zryw Wysoka", "Wysoka", "ZW", "LZS Zryw Wysoka", "Wysoka 1"),
  k("MKS II Gogolin", "Gogolin", "MG2", "Stadion Miejski", "Kasztanowa 22, Gogolin"),
  k("LZS Walce", "Walce", "LW", "Boisko LZS Walce", "Mickiewicza 2a, Walce"),
  k("Cukrownik Baborów", "Baborów", "CB", "Boisko Sportowe Cukrownik Baborów", "Baborów"),
  k("LZS Żywocice", "Żywocice", "LŻ2", "WER ARENA Żywocice", "Krapkowicka bn, Żywocice"),
  k("GLKS Kietrz", "Kietrz", "GK", "Stadion miejski", "Sportowa 1, Kietrz"),
  k("Naprzód Ujazd Niezdrowice", "Niezdrowice", "NUN", "Boisko Niezdrowice", "Lipowa 3, Niezdrowice"),
  k("Victoria Łany", "Łany", "VŁ", "Boisko piłkarskie", "Główna 101C, Łany"),
  k("LZS Lisięcice", "Lisięcice", "LL", "Stadion Miejski", "plac Sportowy 4, Głubczyce"),
  k("Górnik Januszkowice", "Januszkowice", "GJ", "Boisko Januszkowice", "Działkowca, Januszkowice"),
  k("LZS Rzepce", "Rzepcze", "LR5", "Boisko Sportowe Rzepcze", "Rzepcze 53A"),
  k("Plon Błotnica Strzelecka", "Błotnica Strzelecka", "PBS", "Boisko LKS Plon", "Dworcowa 25, Błotnica Strzelecka"),
  k("Śląsk Reńska Wieś", "Reńska Wieś", "ŚRW", "Stadion LKS Śląsk", "Opolska 7, Reńska Wieś"),
  k("Victoria Cisek", "Cisek", "VC2", "Boisko LKS Victoria", "Planetorza 12, Cisek"),
  k("Błękitni Jaryszów", "Jaryszów", "BJ", "Boisko sportowe w Jaryszowie", "Polna 2, Jaryszów"),
];

// Klasa B – grupa 1 (12) — Namysłów / Kluczbork — https://pilkaopolska.pl/klasa-b-grupa-i/
export const OPO_B_1: KlubDane[] = [
  k("MKS Wołczyn", "Wołczyn", "MW", "Stadion miejski", "Leśna, Wołczyn"),
  k("LZS Łączany", "Łączany", "LŁ", "Boisko piłkarskie", "Łączany"),
  k("Lew Szymonków", "Szymonków", "LS6", "Boisko w Szymonkowie", "Szymonków"),
  k("Widawa Wilków", "Wilków", "WW", "Stadion GKS Widawa Wilków", "Wrocławska 11, Wilków"),
  k("Polonia Domaszowice", "Domaszowice", "PD", "Stadion LZS Polonia Domaszowice", "Sportowa 2, Domaszowice"),
  k("LZS Smarchowice Wielkie", "Smarchowice Wielkie", "LSW", "Boisko sportowe Smarchowice Wielkie", "Polna 2, Smarchowice Wielkie"),
  k("Widawka Lubska", "Lubska", "WL", "Boisko LZS Widawka", "Lubska"),
  k("Piast Namysłów", "Namysłów", "PN"),
  k("Burza Gręboszów", "Gręboszów", "BG", "Boisko Burzy Gręboszów", "Gręboszów 34"),
  k("LZS Komorzno", "Komorzno", "LK2", "Boisko sportowe", "Główna 1, Komorzno"),
  k("Rolnik Wierzbica Górna", "Wierzbica Górna", "RWG", "Boisko Rolnika Wierzbicy Górnej", "Wierzbica Górna"),
  k("Grom Zawiść", "Zawiść", "GZ"),
];

// Klasa B – grupa 2 (12) — Kluczbork — https://pilkaopolska.pl/klasa-b-grupa-ii/
export const OPO_B_2: KlubDane[] = [
  k("LZS Lasowice Wielkie", "Lasowice Wielkie", "LLW2", "Boisko LZS Lasowice Wielkie", "Lasowice Wielkie 83"),
  k("LZS Stare Budkowice", "Stare Budkowice", "LSB", "LZS Stare Budkowice", "Opolska 1B, Stare Budkowice"),
  k("LZS Gronowice", "Gronowice", "LG", "Boisko LZS Gronowice", "Gronowice"),
  k("Hetman Byczyna", "Byczyna", "HB", "Stadion Hetman Byczyna", "Brzozowa 2, Byczyna"),
  k("LZS Kujakowice", "Kujakowice Górne", "LK3", "Wiejski Ośrodek Kultury i Sportu", "XXX Lecia, Kujakowice Górne"),
  k("LZS Wojciechów", "Wojciechów", "LW2", "Boisko LZS Wojciechów", "Wilcza, Wojciechów"),
  k("LZS II Kuniów", "Kuniów", "LK4", "Boisko LZS Kuniów", "Kuniów"),
  k("LZS Borkowice", "Borkowice", "LB3"),
  k("Stobrawa Wachowice", "Wachowice", "SW", "Boisko sportowe", "Ks. Brunona Aleksandra bn, Olesno"),
  k("Polonia Smardy", "Smardy", "PS", "Boisko Polonii Smardy", "Smardy"),
  k("Jakub Proślice", "Proślice", "JP", "Boisko sportowe", "Proślice"),
  k("LZS Ligota Górna", "Ligota Górna", "LLG", "Boisko sportowe Ligota Górna", "Ligota Górna"),
];

// Klasa B – grupa 3 (11) — Olesno — https://pilkaopolska.pl/klasa-b-grupa-iii/
export const OPO_B_3: KlubDane[] = [
  k("LZS Ligota Oleska", "Ligota Oleska", "LLO", "Stadion LZS Ligota", "Ligota Oleska 7A"),
  k("LZS Przedmość", "Przedmość", "LP2", "Boisko LZS Przedmość", "Sportowa, Przedmość"),
  k("KS Bodzanowice", "Bodzanowice", "KB2", "Boisko piłkarskie", "Bodzanowice"),
  k("Prosna Zdziechowice", "Zdziechowice", "PZ", "Stadion LKS Prosna Zdziechowice", "Zdziechowice 15"),
  k("LZS Rudniki", "Rudniki", "LR6", "Boisko sportowe", "Handlowa 10, Rudniki"),
  k("LZS Bugaj Nowy", "Bugaj Nowy", "LBN2", "Boisko LZS Bugaj Nowy", "Cieciułów 19"),
  k("LZS Kościeliska", "Kościeliska", "LK5", "Boisko LZS Kościeliska", "Kościeliska 3"),
  k("LZS Radłów", "Radłów", "LR7", "Boisko sportowe", "Oleska 5, Radłów"),
  k("LZS Wichrów", "Wichrów", "LW3", "Boisko piłkarskie LZS Wichrów", "Wichrów 65"),
  k("Albor Borki Małe", "Borki Małe", "ABM", "Boisko Albor Borki Małe", "Szkolna, Borki Małe"),
  k("LZS Borki Wielkie", "Borki Wielkie", "LBW", "Boisko LZS Borki Wielkie", "Młyńska 8, Borki Wielkie"),
];

// Klasa B – grupa 4 (12) — Brzeg — https://pilkaopolska.pl/klasa-b-grupa-iv/
export const OPO_B_4: KlubDane[] = [
  k("Pogoń Łosiów", "Łosiów", "PŁ", "Stadion w Łosiowie", "Kolejowa, Łosiów"),
  k("Victoria Dobrzyń", "Dobrzyń", "VD", "Boisko sportowe", "Dobrzyń"),
  k("Polonia Przylesie", "Przylesie", "PP3", "Stadion Polonia Przylesie", "Przylesie 135a"),
  k("LZS Kruszyna/Prędocin", "Prędocin", "LKP", "Boisko do piłki nożnej", "Prędocin"),
  k("Czarni Przylesie Dolne", "Przylesie Dolne", "CPD", "Boisko w Przylesiu Dolnym", "Przylesie Dolne"),
  k("Burza Lipki", "Lipki", "BL", "Boisko sportowe w Lipkach", "Sportowa 1, Lipki"),
  k("LZS Michałów", "Michałów", "LM2", "Boisko sportowe", "Michałów 57A"),
  k("LZS Łukowice Brzeskie", "Łukowice Brzeskie", "LŁB", "Boisko sportowe", "Łukowice Brzeskie"),
  k("Victoria Wierzbnik", "Wierzbnik", "VW", "Boisko do piłki nożnej", "Wierzbnik"),
  k("LZS Victoria II Kościerzyce", "Kościerzyce", "LVK2"),
  k("LZS Jankowice Wielkie", "Jankowice Wielkie", "LJW", "Jankowice Arena", "Jankowice Wielkie"),
  k("LZS Wojsław", "Wojsław", "LW4", "Boisko do piłki nożnej", "Wojsław"),
];

// Klasa B – grupa 5 (12) — Opole — https://pilkaopolska.pl/klasa-b-grupa-v/
export const OPO_B_5: KlubDane[] = [
  k("TOR II Dobrzeń Wielki", "Dobrzeń Wielki", "TDW2", "Stadion MOSiR", "Sportowa 1, Dobrzeń Wielki"),
  k("LZS Grudzice", "Grudzice", "LG2", "Stadion LZS Grudzice", "Strzelecka, Grudzice"),
  k("LZS Sławice", "Sławice", "LS7", "Boisko sportowe", "Opolska, Sławice"),
  k("LZS Popielów", "Popielów", "LP3", "Boisko sportowe", "Popielów"),
  k("LKS Chmielowice", "Chmielowice", "LC2", "Boisko SKS Chmielowice", "Johannesa Gutenberga 8, Opole"),
  k("Groszmal Opole", "Opole", "GO", "Stadion Groszmal Opole", "Brzegowa 3, Opole"),
  k("Victoria II Chróścice", "Chróścice", "VC3", "Stadion LZS Victoria Chróścice", "Świętego Rocha, Chróścice"),
  k("Grom Świerkle", "Świerkle", "GŚ", "Boisko LZS Grom Świerkle", "Brynicka, Świerkle"),
  k("Polonia II Prószków", "Prószków", "PP4", "Stadion Miejski", "Sportowa 1, Prószków"),
  k("Agra Zawada (k. Opola)", "Zawada", "AZO"),
  k("Gazownik II Wawelno", "Wawelno", "GW2", "Stadion Sportowy Klubu LZS Wawelno", "Wawelno"),
  k("LZS Kup", "Kup", "LK6", "Boisko sportowe", "Ligonia, Kup"),
];

// Klasa B – grupa 6 (12) — Strzelce Opolskie / Opole — https://pilkaopolska.pl/klasa-b-grupa-vi/
export const OPO_B_6: KlubDane[] = [
  k("Jedność Rozmierka", "Rozmierka", "JR", "Stadion LKS Jedność Rozmierka", "Szkolna, Rozmierka"),
  k("Błękitni Rozmierz", "Rozmierz", "BR", "Boisko Błękitni", "Rozmierz"),
  k("Odra Kąty Opolskie", "Kąty Opolskie", "OKO", "LZS Odra Kąty Opolskie", "Ceglana 2, Kąty Opolskie"),
  k("Tempo Grodzisko", "Grodzisko", "TG", "Boisko sportowe", "Powstańców Śląskich 23, Grodzisko"),
  k("Piomar II Tarnów-Przywory", "Przywory", "PTP2", "Lzs GKS Piomar Tarnów Opolski - Przywory", "Wiejska 155, Przywory"),
  k("Burza Kosorowice", "Kosorowice", "BK", "Boisko do piłki nożnej", "Leśna 26, Kosorowice"),
  k("Czarni Kalinów/Kalinowice", "Kalinów", "CKK2", "Boisko do piłki nożnej", "Parkowa, Kalinów-Kalinowice"),
  k("Fiorentina Nakło", "Nakło", "FN", "Boisko LZS Fiorentina Nakło", "Tarnowska 28, Nakło"),
  k("LZS Kadłubiec", "Kadłubiec", "LK7", "Estadio De Kadłubiec", "Sportowa, Kadłubiec"),
  k("Samba Squad Otmice", "Otmice", "SSO", "Boisko sportowe w Otmicach", "Polna 6, Otmice"),
  k("GKS Izbicko-Otmice", "Izbicko", "GIO", "Stadion Izbicko", "Stawowa 10, Izbicko"),
  k("ZKS Górażdże", "Górażdże", "ZG", "Stadion KS Górażdże", "Spacerowa 1, Górażdże"),
];

// Klasa B – grupa 7 (12) — Krapkowice — https://pilkaopolska.pl/klasa-b-grupa-vii/
export const OPO_B_7: KlubDane[] = [
  k("Korona Krępna", "Krępna", "KK3", "Stadion Korona Krępna", "Jasiońska 3, Krępna"),
  k("Unia II Krapkowice", "Krapkowice", "UK4", "Stadion KS Unia", "Sportowa 1, Krapkowice"),
  k("LZS Łowkowice", "Łowkowice", "LŁ2", "Stadion LZS ŁOWKOWICE", "Prudnicka 7, Komorniki"),
  k("Otmęt Krapkowice", "Krapkowice", "OK", "Stadion KS Otmęt", "Olimpijska 1, Krapkowice"),
  k("LZS Kórnica-Nowy Dwór", "Kórnica", "LKND", "Boisko w Kórnicy", "Prudnicka 10, Kórnica"),
  k("LZS Zawada", "Zawada", "LZ", "Boisko sportowe", "Kolanowska, Zawada"),
  k("LZS II Racławiczki", "Racławiczki", "LR8", "Boisko sportowe w Strzeleczkach", "Dworcowa 3b, Strzeleczki"),
  k("LZS Strzeleczki", "Strzeleczki", "LS8", "Boisko sportowe w Strzeleczkach", "Dworcowa 3b, Strzeleczki"),
  k("LKS Obrowiec", "Obrowiec", "LO", "Boisko LKS Obrowiec", "Krapkowicka 51a, Obrowiec"),
  k("Fortuna Łącznik", "Łącznik", "FŁ", "stadion Fortuna Łącznik", "Sportowa 4, Łącznik"),
  k("Kosmos Dobra", "Dobra", "KD", "Boisko piłkarskie", "Lipowa 16, Dobra"),
  k("LZS Kujawy", "Kujawy", "LK8", "Stadion Kujawy", "Kąpielowa, Kujawy"),
];

// Klasa B – grupa 8 (12) — Strzelce Opolskie / Olesno — https://pilkaopolska.pl/klasa-b-grupa-viii/
export const OPO_B_8: KlubDane[] = [
  k("LZS Grodziec", "Grodziec", "LG3", "Stadion piłkarski", "Polna, Grodziec"),
  k("KS Szczedrzyk", "Szczedrzyk", "KS2", "Boisko KS Szczedrzyk", "Brolla, Szczedrzyk"),
  k("LKS II Kadłub", "Kadłub", "LK9", "Boisko LKS Kadłub", "Powstańców Śląskich 12, Kadłub"),
  k("Pogoń Pludry 23", "Pludry", "PP22", "Pogoń Arena", "Aleja Wyzwolenia 20, Pludry"),
  k("LZS Piotrówka", "Piotrówka", "LP4", "Stadion LZS Piotrówka", "Kościuszki 103, Piotrówka"),
  k("LZS Zębowice", "Zębowice", "LZ2", "Boisko do piłki nożnej", "Zębowice"),
  k("LZS Staniszcze Wielkie", "Staniszcze Wielkie", "LSW2", "Boisko piłkarskie", "Leśna 14, Staniszcze Wielkie"),
  k("Naprzód II Jemielnica", "Jemielnica", "NJ2", "Stadion LKS Naprzód", "Leśna 2, Jemielnica"),
  k("Start II Dobrodzień", "Dobrodzień", "SD4", "Stadion Miejski", "Piastowska 115, Dobrodzień"),
  k("LZS Radawie", "Radawie", "LR9", "Boisko sportowe", "Opolska, Radawie"),
  k("Rzemiosło Dziewkowice", "Dziewkowice", "RD", "Boisko LKS Rzemiosło", "Strzelecka 3, Dziewkowice"),
  k("Plon II Błotnica Strzelecka", "Błotnica Strzelecka", "PBS2", "Boisko LKS Plon", "Dworcowa 25, Błotnica Strzelecka"),
];

// Klasa B – grupa 9 (13) — Nysa (Otmuchów/Paczków) — https://pilkaopolska.pl/klasa-b-grupa-ix/
export const OPO_B_9: KlubDane[] = [
  k("Czarni II Otmuchów", "Otmuchów", "CO2", "Stadion Miejski w Otmuchowie", "Lipowa, Otmuchów"),
  k("LZS Gościce", "Gościce", "LG4", "Stadion LZS Gościce", "Gościce 22"),
  k("GLKS Kamiennik", "Kamiennik", "GK2", "stadion GLKS Kamiennik", "Kościuszki Tadeusza, Kamiennik"),
  k("LZS Jędrzychów", "Jędrzychów", "LJ", "Boisko LZS Jędrzychów", "Wiejska 27, Jędrzychów"),
  k("LZS Trzeboszowice", "Trzeboszowice", "LT", "Boisko LZS Trzeboszowice", "Trzeboszowice"),
  k("LZS Dziewiętlice", "Dziewiętlice", "LD2", "Boisko LZS Dziewiętlice", "Dziewiętlice 64C"),
  k("LZS Karłowice Wielkie", "Karłowice Wielkie", "LKW", "Boisko LZS Karłowice Wielkie", "Karłowice Wielkie 82G"),
  k("LZS Kałków", "Kałków", "LK10", "Boisko LZS Kałków", "Kałków"),
  k("LZS Kamienica Nyska", "Kamienica", "LKN", "Boisko piłkarskie", "Kamienica Nyska 90"),
  k("LZS Śliwice", "Śliwice", "LŚ", "Boisko piłkarskie w Śliwicach", "Śliwice 15A"),
  k("LZS Siestrzechowice", "Siestrzechowice", "LS9", "Boisko Siestrzechowice", "Siestrzechowice"),
  k("LZS Maciejowice", "Maciejowice", "LM3", "stadion LZS MACIEJOWICE", "Maciejowice"),
  k("Agro-Chmiel Ujeździec", "Ujeździec", "ACU", "Stadion Miejski", "Paczków"),
];

// Klasa B – grupa 10 (11) — Nysa (Skoroszyce/Łambinowice/Grodków) — https://pilkaopolska.pl/klasa-b-grupa-x/
export const OPO_B_10: KlubDane[] = [
  k("Góral Sidzina", "Sidzina", "GS", "Stadion LKS Góral Sidzina", "Nyska 6, Sidzina"),
  k("Plon Skoroszyce", "Skoroszyce", "PS2", "Boisko w Skoroszycach", "Sportowa 11, Skoroszyce"),
  k("GAS Grodków", "Grodków", "GG3", "Pekin Arena", "Krakowska 31, Grodków"),
  k("Ogrodnik II Chróścina Nyska/Czarnolas", "Chróścina", "OCNC"),
  k("Meteor Jasienica Dolna", "Jasienica Dolna", "MJD", "LZS „METEOR” Jasienica Dolna", "DW406, Jasienica Dolna"),
  k("LZS Niwnica-Konradowa", "Niwnica", "LNK", "Boisko sportowe LZS Niwnica", "Niwnica 78"),
  k("Metalowiec II Łambinowice", "Łambinowice", "MŁ2"),
  k("Rolnik Lasocice", "Lasocice", "RL", "Stadion w Lasocicach", "Lasocice 42"),
  k("LZS Przechód", "Przechód", "LP5", "Boisko sportowe w Przechodzie", "Przechód"),
  k("KGKS Krasna Góra", "Krasna Góra", "KKG", "stadion KGKS KRASNA GÓRA", "Krasna Góra"),
  k("Orzeł II Reńska Wieś", "Reńska Wieś", "ORW2", "Boisko piłkarskie", "Reńska Wieś 9a"),
];

// Klasa B – grupa 11 (12) — Prudnik — https://pilkaopolska.pl/klasa-b-grupa-xi/
export const OPO_B_11: KlubDane[] = [
  k("AP Biała", "Biała", "AB", "Boisko sportowe w Białej", "Bronisława Koraszewskiego 1, Biała"),
  k("Polonia Biała", "Biała", "PB", "Boisko sportowe w Białej", "Bronisława Koraszewskiego 1, Biała"),
  k("LZS Lubrza", "Lubrza", "LL2", "Boisko sportowe w Lubrzy", "Szkolna 26, Lubrza"),
  k("Pogoń II Prudnik", "Prudnik", "PP5", "Stadion MKS Sparta", "Włoska 10, Prudnik"),
  k("LZS Gryżów", "Gryżów", "LG5", "stadion LZS Gryżów", "Gryżów"),
  k("Sudety Moszczanka", "Moszczanka", "SM2", "Boisko Sportowe Moszczanka", "Moszczanka"),
  k("LZS Ligota Bialska Radostynia", "Ligota Bialska", "LLBR", "Boisko w Ligocie Bialskiej", "Ligota Bialska 99"),
  k("LZS Dytmarów", "Dytmarów", "LD3", "Boisko do piłki nożnej", "Dytmarów 28"),
  k("LZS Łąka Prudnicka", "Łąka Prudnicka", "LŁP", "Boisko LZS Łąka Prudnicka", "Łąka Prudnicka"),
  k("LZS Włodary-Węża", "Włodary", "LWW", "Boisko Sportowe LZS Włodary-Węża", "Szkolna bn, Włodary"),
  k("LZS Rudziczka", "Rudziczka", "LR10", "Boisko LZS Grom", "Szybowice"),
  k("LZS Kolnowice", "Kolnowice", "LK11", "stadion LZS Kolnowice", "Kolnowice"),
];

// Klasa B – grupa 12 (12) — Kędzierzyn-Koźle — https://pilkaopolska.pl/klasa-b-grupa-xii/
export const OPO_B_12: KlubDane[] = [
  k("Victoria II Żyrowa", "Żyrowa", "VŻ2"),
  k("LZS Gierałtowice", "Gierałtowice", "LG6", "Boisko LZS Gierałtowice", "Strażaków, Gierałtowice"),
  k("Inter Mechnica", "Mechnica", "IM", "Stadion Inter Mechnica", "Młyńska 21, Mechnica"),
  k("KS Sławięcice", "Sławięcice", "KS3", "Stadion Sportowy Sławięcice", "Sadowa 24, Kędzierzyn-Koźle"),
  k("Polonia Gościęcin", "Gościęcin", "PG2", "Boisko Sportowe Gościęcin", "Szkolna 22A, Gościęcin"),
  k("LZS Stradunia", "Stradunia", "LS10", "Boisko sportowe LZS Stradunia", "Opolska, Stradunia"),
  k("LZS II Stary Ujazd", "Ujazd", "LSU", "Stadion Stary Ujazd", "Ujazd"),
  k("Zawisza Stara Kuźnia", "Stara Kuźnia", "ZSK", "Boisko LZS Zawisza Stara Kuźnia", "Leśna 8, Stara Kuźnia"),
  k("Sokół Leśnica", "Leśnica", "SL", "Stadion LZS- u Leśnica", "Krasowska 1, Leśnica"),
  k("Odra Kędzierzyn-Koźle", "Kędzierzyn-Koźle", "OKK", "Stadion Odra Kędzierzyn-Koźle", "Bolesława Chrobrego 25, Kędzierzyn-Koźle"),
  k("LZS Łężce", "Łężce", "LŁ3", "Boisko w Łężcach", "Łężce"),
  k("Ruch Steblów", "Steblów", "RS", "Boisko LZS \"Ruch\" Steblów", "Zakrzów"),
];

// Klasa B – grupa 13 (12) — Głubczyce — https://pilkaopolska.pl/klasa-b-grupa-xiii/
export const OPO_B_13: KlubDane[] = [
  k("Sokół Boguchwałów", "Boguchwałów", "SB4", "Boisko Sportowe \"Sokół\" Boguchwałów", "Baborów"),
  k("Polonia Ściborzyce Wielkie", "Ściborzyce Wielkie", "PŚW", "Boisko Polonia Ściborzyce Wielkie", "Ściborzyce Wielkie 60"),
  k("Partyzant Kazimierz", "Kazimierz", "PK", "stadion Partyzant Kazimierz", "Kazimierz"),
  k("Orzeł Dzierżysław", "Dzierżysław", "OD2", "Boisko sportowe", "Dożynkowa, Dzierżysław"),
  k("Pogoń Wojnowice", "Wojnowice", "PW2", "Klub sportowy Pogoń Wojnowice", "Sportowa 1, Wojnowice"),
  k("Start Bogdanowice", "Bogdanowice", "SB5", "Stadion Startu Bogdanowice", "Głubczycka 36, Bogdanowice"),
  k("Rolnik Lewice", "Lewice", "RL2", "Boisko sportowe LZS Rolnik Lewice", "Lewice"),
  k("Stal Grobniki", "Grobniki", "SG2", "Boisko sportowe Grobniki", "Świętego Jana, Grobniki"),
  k("Pogranicze Mokre", "Mokre", "PM", "Estadio de Pogranicze mokre", "Mokre"),
  k("Fortuna Chomiąża", "Chomiąża", "FC", "Boisko Sportowe LZS \"Fortuna\" Chomiąża", "Chomiąża"),
  k("Żądło Sucha Psina", "Sucha Psina", "ŻSP", "Klub Sportowy ŻĄDŁO Sucha Psina", "Sucha Psina"),
  k("Racławia Racławice Śląskie", "Racławice Śląskie", "RRŚ"),
];

const GORA = [...GORA_KRAJOWA, { nazwa: "Betclic 3. Liga, gr. III", kluby: III_LIGA_GR3 }, { nazwa: "IV liga opolska", kluby: OPO_IV }];
export const OPOLSKIE_B1: Sciezka = {
  id: "opolskie-b1", nazwa: "Opolskie — Namysłów / Kluczbork",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 1", kluby: OPO_OKR_1 },
    { nazwa: "Klasa A — opolska gr. 1", kluby: OPO_A_1 },
    { nazwa: "Klasa B — opolska gr. 1", kluby: OPO_B_1 },
  ],
};
export const OPOLSKIE_B2: Sciezka = {
  id: "opolskie-b2", nazwa: "Opolskie — Kluczbork",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 1", kluby: OPO_OKR_1 },
    { nazwa: "Klasa A — opolska gr. 1", kluby: OPO_A_1 },
    { nazwa: "Klasa B — opolska gr. 2", kluby: OPO_B_2 },
  ],
};
export const OPOLSKIE_B3: Sciezka = {
  id: "opolskie-b3", nazwa: "Opolskie — Olesno",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 1", kluby: OPO_OKR_1 },
    { nazwa: "Klasa A — opolska gr. 1", kluby: OPO_A_1 },
    { nazwa: "Klasa B — opolska gr. 3", kluby: OPO_B_3 },
  ],
};
export const OPOLSKIE_B4: Sciezka = {
  id: "opolskie-b4", nazwa: "Opolskie — Brzeg",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 1", kluby: OPO_OKR_1 },
    { nazwa: "Klasa A — opolska gr. 3", kluby: OPO_A_3 },
    { nazwa: "Klasa B — opolska gr. 4", kluby: OPO_B_4 },
  ],
};
export const OPOLSKIE_B5: Sciezka = {
  id: "opolskie-b5", nazwa: "Opolskie — Opole",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 1", kluby: OPO_OKR_1 },
    { nazwa: "Klasa A — opolska gr. 3", kluby: OPO_A_3 },
    { nazwa: "Klasa B — opolska gr. 5", kluby: OPO_B_5 },
  ],
};
export const OPOLSKIE_B6: Sciezka = {
  id: "opolskie-b6", nazwa: "Opolskie — Strzelce Opolskie / Opole",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 1", kluby: OPO_OKR_1 },
    { nazwa: "Klasa A — opolska gr. 3", kluby: OPO_A_3 },
    { nazwa: "Klasa B — opolska gr. 6", kluby: OPO_B_6 },
  ],
};
export const OPOLSKIE_B7: Sciezka = {
  id: "opolskie-b7", nazwa: "Opolskie — Krapkowice",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 2", kluby: OPO_OKR_2 },
    { nazwa: "Klasa A — opolska gr. 4", kluby: OPO_A_4 },
    { nazwa: "Klasa B — opolska gr. 7", kluby: OPO_B_7 },
  ],
};
export const OPOLSKIE_B8: Sciezka = {
  id: "opolskie-b8", nazwa: "Opolskie — Strzelce Opolskie / Olesno",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 1", kluby: OPO_OKR_1 },
    { nazwa: "Klasa A — opolska gr. 1", kluby: OPO_A_1 },
    { nazwa: "Klasa B — opolska gr. 8", kluby: OPO_B_8 },
  ],
};
export const OPOLSKIE_B9: Sciezka = {
  id: "opolskie-b9", nazwa: "Opolskie — Nysa / Otmuchów / Paczków",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 2", kluby: OPO_OKR_2 },
    { nazwa: "Klasa A — opolska gr. 2", kluby: OPO_A_2 },
    { nazwa: "Klasa B — opolska gr. 9", kluby: OPO_B_9 },
  ],
};
export const OPOLSKIE_B10: Sciezka = {
  id: "opolskie-b10", nazwa: "Opolskie — Nysa / Grodków / Łambinowice",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 2", kluby: OPO_OKR_2 },
    { nazwa: "Klasa A — opolska gr. 2", kluby: OPO_A_2 },
    { nazwa: "Klasa B — opolska gr. 10", kluby: OPO_B_10 },
  ],
};
export const OPOLSKIE_B11: Sciezka = {
  id: "opolskie-b11", nazwa: "Opolskie — Prudnik",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 2", kluby: OPO_OKR_2 },
    { nazwa: "Klasa A — opolska gr. 2", kluby: OPO_A_2 },
    { nazwa: "Klasa B — opolska gr. 11", kluby: OPO_B_11 },
  ],
};
export const OPOLSKIE_B12: Sciezka = {
  id: "opolskie-b12", nazwa: "Opolskie — Kędzierzyn-Koźle",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 2", kluby: OPO_OKR_2 },
    { nazwa: "Klasa A — opolska gr. 4", kluby: OPO_A_4 },
    { nazwa: "Klasa B — opolska gr. 12", kluby: OPO_B_12 },
  ],
};
export const OPOLSKIE_B13: Sciezka = {
  id: "opolskie-b13", nazwa: "Opolskie — Głubczyce",
  ligi: [...GORA,
    { nazwa: "Klasa okręgowa — opolska gr. 2", kluby: OPO_OKR_2 },
    { nazwa: "Klasa A — opolska gr. 4", kluby: OPO_A_4 },
    { nazwa: "Klasa B — opolska gr. 13", kluby: OPO_B_13 },
  ],
};

// Podział terytorialny 2026/27 (grupy B → A → okręgowa wg powiatów klubów):
// Klasa B — opolska gr. 1 → Klasa A — opolska gr. 1 → Klasa okręgowa — opolska gr. 1
// Klasa B — opolska gr. 2 → Klasa A — opolska gr. 1 → Klasa okręgowa — opolska gr. 1
// Klasa B — opolska gr. 3 → Klasa A — opolska gr. 1 → Klasa okręgowa — opolska gr. 1
// Klasa B — opolska gr. 4 → Klasa A — opolska gr. 3 → Klasa okręgowa — opolska gr. 1
// Klasa B — opolska gr. 5 → Klasa A — opolska gr. 3 → Klasa okręgowa — opolska gr. 1
// Klasa B — opolska gr. 6 → Klasa A — opolska gr. 3 → Klasa okręgowa — opolska gr. 1
// Klasa B — opolska gr. 7 → Klasa A — opolska gr. 4 → Klasa okręgowa — opolska gr. 2
// Klasa B — opolska gr. 8 → Klasa A — opolska gr. 1 → Klasa okręgowa — opolska gr. 1
// Klasa B — opolska gr. 9 → Klasa A — opolska gr. 2 → Klasa okręgowa — opolska gr. 2
// Klasa B — opolska gr. 10 → Klasa A — opolska gr. 2 → Klasa okręgowa — opolska gr. 2
// Klasa B — opolska gr. 11 → Klasa A — opolska gr. 2 → Klasa okręgowa — opolska gr. 2
// Klasa B — opolska gr. 12 → Klasa A — opolska gr. 4 → Klasa okręgowa — opolska gr. 2
// Klasa B — opolska gr. 13 → Klasa A — opolska gr. 4 → Klasa okręgowa — opolska gr. 2
// Awanse/spadki (§ 21): IV liga (14, od 2027/28 — 16): 1. → III liga gr. III, 2. → baraże (uchwała PZPN VI/85).
// Okręgowa (2×16): 1.–2. → IV liga; spadek 14–16 + przegrany dwumeczu 13. drużyn. Klasa A (4×16): 1.–2. → okręgowa;
// spadek 14–16 + najsłabsza 13. drużyna. Klasa B (13 grup): awansują tylko zwycięzcy grup; najniższy szczebel.
// [Ekstra↔I, I↔II, II↔III, III↔IV, IV↔okręgowa, okręgowa↔A, A↔B]
const WYMIANA = [3, 3, 2, 2, 2, 2, 1];
export const OPOLSKIE_REGIONY: Sciezka[] = [OPOLSKIE_B1, OPOLSKIE_B2, OPOLSKIE_B3, OPOLSKIE_B4, OPOLSKIE_B5, OPOLSKIE_B6, OPOLSKIE_B7, OPOLSKIE_B8, OPOLSKIE_B9, OPOLSKIE_B10, OPOLSKIE_B11, OPOLSKIE_B12, OPOLSKIE_B13].map((sc) => ({ ...sc, wymiana: WYMIANA }));


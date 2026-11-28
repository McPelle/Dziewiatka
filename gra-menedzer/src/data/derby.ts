// Mecze derbowe / podwyższonego ryzyka — pary zwaśnionych klubów (prawdziwe polskie derby).
// Nazwy muszą dokładnie pasować do nazw klubów w danych (KLUBY_PRAWDZIWE / Małopolska).
// Dla niższych lig (amatorzy) derby są dodatkowo wykrywane po tym samym mieście (lib/derby.ts).

export interface ParaDerbowa { a: string; b: string; nazwa: string }

export const DERBY: ParaDerbowa[] = [
  // Śląsk
  { a: "Górnik Zabrze", b: "Ruch Chorzów", nazwa: "Wielkie Derby Śląska" },
  { a: "Górnik Zabrze", b: "Piast Gliwice", nazwa: "Derby Śląska" },
  { a: "Górnik Zabrze", b: "GKS Katowice", nazwa: "Derby Śląska" },
  { a: "Ruch Chorzów", b: "GKS Katowice", nazwa: "Derby Śląska" },
  { a: "Ruch Chorzów", b: "Piast Gliwice", nazwa: "Derby Śląska" },
  { a: "Ruch Chorzów", b: "Polonia Bytom", nazwa: "Derby Śląska" },
  { a: "GKS Katowice", b: "GKS Tychy", nazwa: "Derby Śląska" },
  { a: "GKS Katowice", b: "Zagłębie Sosnowiec", nazwa: "Derby Zagłębia i Śląska" },
  // Kraków
  { a: "Wisła Kraków", b: "Cracovia", nazwa: "Święta Wojna (Derby Krakowa)" },
  { a: "Wisła Kraków", b: "Hutnik Kraków", nazwa: "Derby Krakowa" },
  { a: "Cracovia", b: "Hutnik Kraków", nazwa: "Derby Krakowa" },
  { a: "Wieczysta Kraków", b: "Wisła Kraków", nazwa: "Derby Krakowa" },
  { a: "Wieczysta Kraków", b: "Cracovia", nazwa: "Derby Krakowa" },
  { a: "Wieczysta Kraków", b: "Hutnik Kraków", nazwa: "Derby Krakowa" },
  // Warszawa
  { a: "Legia Warszawa", b: "Polonia Warszawa", nazwa: "Derby Warszawy" },
  // Łódź
  { a: "Widzew Łódź", b: "ŁKS Łódź", nazwa: "Derby Łodzi" },
  // Trójmiasto
  { a: "Lechia Gdańsk", b: "Arka Gdynia", nazwa: "Derby Trójmiasta" },
  // Dolny Śląsk
  { a: "Śląsk Wrocław", b: "Zagłębie Lubin", nazwa: "Derby Dolnego Śląska" },
  // Poznań
  { a: "Lech Poznań", b: "Warta Poznań", nazwa: "Derby Poznania" },
  // Wielka rywalizacja Ekstraklasy
  { a: "Lech Poznań", b: "Legia Warszawa", nazwa: "Hit Ekstraklasy" },
  // Rzeszów / Podkarpacie
  { a: "Resovia", b: "Stal Rzeszów", nazwa: "Derby Rzeszowa" },
  { a: "Stal Mielec", b: "Stal Stalowa Wola", nazwa: "Derby Podkarpacia" },
  { a: "Stal Mielec", b: "Stal Rzeszów", nazwa: "Derby Podkarpacia" },
  // Bielsko-Biała
  { a: "Podbeskidzie Bielsko-Biała", b: "Rekord Bielsko-Biała", nazwa: "Derby Bielska-Białej" },
  // Lubelszczyzna
  { a: "Motor Lublin", b: "Górnik Łęczna", nazwa: "Derby Lubelszczyzny" },
  // Częstochowa
  { a: "Raków Częstochowa", b: "Skra Częstochowa", nazwa: "Derby Częstochowy" },
  // Śląsk — szersza sieć rywalizacji
  { a: "Polonia Bytom", b: "Górnik Zabrze", nazwa: "Derby Śląska" },
  { a: "Polonia Bytom", b: "GKS Katowice", nazwa: "Derby Śląska" },
  { a: "Polonia Bytom", b: "Piast Gliwice", nazwa: "Derby Śląska" },
  { a: "GKS Tychy", b: "Ruch Chorzów", nazwa: "Derby Śląska" },
  { a: "GKS Tychy", b: "Górnik Zabrze", nazwa: "Derby Śląska" },
  { a: "GKS Tychy", b: "GKS Jastrzębie", nazwa: "Derby Śląska" },
  { a: "GKS Jastrzębie", b: "Ruch Chorzów", nazwa: "Derby Śląska" },
  { a: "Piast Gliwice", b: "GKS Katowice", nazwa: "Derby Śląska" },
  { a: "Zagłębie Sosnowiec", b: "Ruch Chorzów", nazwa: "Derby Zagłębia i Śląska" },
  { a: "Zagłębie Sosnowiec", b: "Górnik Zabrze", nazwa: "Derby Zagłębia i Śląska" },
  // Dolny Śląsk
  { a: "Miedź Legnica", b: "Zagłębie Lubin", nazwa: "Derby Dolnego Śląska" },
  { a: "Chrobry Głogów", b: "Miedź Legnica", nazwa: "Derby Dolnego Śląska" },
  { a: "Chrobry Głogów", b: "Zagłębie Lubin", nazwa: "Derby Dolnego Śląska" },
  // Podkarpacie (uzupełnienie)
  { a: "Resovia", b: "Stal Mielec", nazwa: "Derby Podkarpacia" },
  { a: "Resovia", b: "Stal Stalowa Wola", nazwa: "Derby Podkarpacia" },
  // Szczecin
  { a: "Pogoń Szczecin", b: "Świt Szczecin", nazwa: "Derby Szczecina" },
  // Lubelszczyzna (uzupełnienie)
  { a: "Motor Lublin", b: "Wisła Puławy", nazwa: "Derby Lubelszczyzny" },
  { a: "Górnik Łęczna", b: "Wisła Puławy", nazwa: "Derby Lubelszczyzny" },
  // Małopolska (poziom zawodowy)
  { a: "Bruk-Bet Termalica Nieciecza", b: "Sandecja Nowy Sącz", nazwa: "Derby Małopolski" },
  { a: "Puszcza Niepołomice", b: "Sandecja Nowy Sącz", nazwa: "Derby Małopolski" },
  { a: "Puszcza Niepołomice", b: "Bruk-Bet Termalica Nieciecza", nazwa: "Derby Małopolski" },
  // Kielecczyzna
  { a: "Korona Kielce", b: "Radomiak Radom", nazwa: "Derby regionu świętokrzysko-radomskiego" },
  // Małopolska — derby regionalne (kluby z regionu małopolskiego, parytet z pomorskim)
  { a: "Unia Tarnów", b: "Tarnovia Tarnów", nazwa: "Derby Tarnowa" },
  { a: "Podhale Nowy Targ", b: "KS Zakopane", nazwa: "Derby Podhala" },
  { a: "Sandecja Nowy Sącz", b: "Dunajec Nowy Sącz", nazwa: "Derby Nowego Sącza" },
  { a: "Hutnik Kraków", b: "Garbarnia Kraków", nazwa: "Derby Krakowa" },
  { a: "Garbarnia Kraków", b: "Wieczysta Kraków", nazwa: "Derby Krakowa" },
  { a: "Dalin Myślenice", b: "Turbacz Mszana Dolna", nazwa: "Derby regionu myślenicko-limanowskiego" },
  { a: "Sandecja Nowy Sącz", b: "Limanovia Limanowa", nazwa: "Derby Sądecczyzny" },
  { a: "Puszcza Niepołomice", b: "Górnik Wieliczka", nazwa: "Derby powiatu wielickiego" },
  // Pomorskie — derby regionalne (kluby z regionu pomorskiego)
  { a: "Gedania Gdańsk", b: "Jaguar Gdańsk", nazwa: "Derby Gdańska" },
  { a: "Bałtyk Gdynia", b: "Arka II Gdynia", nazwa: "Derby Gdyni" },
  { a: "Salos Rumia", b: "Orkan Rumia MKS", nazwa: "Derby Rumi" },
  { a: "DSPN Supra Kwidzyn", b: "Rodło Kwidzyn", nazwa: "Derby Kwidzyna" },
  { a: "Chojniczanka II Chojnice", b: "Kolejarz Chojnice", nazwa: "Derby Chojnic" },
  { a: "Kaszubia Kościerzyna", b: "Cartusia Kartuzy", nazwa: "Derby Kaszub" },
  { a: "Gryf Wejherowo", b: "Orlęta Reda", nazwa: "Derby Małego Trójmiasta Kaszubskiego" },
  { a: "Orlęta Reda", b: "Orkan Rumia MKS", nazwa: "Derby Małego Trójmiasta Kaszubskiego" },
  { a: "Chojniczanka II Chojnice", b: "Bytovia Bytów", nazwa: "Derby Pomorza" },
  { a: "Zenit Łęczyce", b: "Sokół Bożepole Wielkie", nazwa: "Derby gminy Łęczyce" },
  // III liga gr. II — cross-ligowa rywalizacja regionalna
  { a: "Zawisza Bydgoszcz", b: "Elana Toruń", nazwa: "Derby kujawsko-pomorskie (Bydgoszcz–Toruń)" },
  { a: "KP Starogard Gdański", b: "Wierzyca Pelplin", nazwa: "Derby Kociewia" },
  { a: "Gryf Tczew KP", b: "Wierzyca Pelplin", nazwa: "Derby Kociewia" },
  { a: "Pomezania Malbork", b: "Olimpia Sztum", nazwa: "Derby Powiśla" },
  { a: "Pomezania Malbork", b: "Powiśle Dzierzgoń", nazwa: "Derby Powiśla" },
  { a: "Olimpia Sztum", b: "Powiśle Dzierzgoń", nazwa: "Derby Powiśla" },
  // Pomorze Środkowe (Słupsk / Lębork / Bytów)
  { a: "Pogoń Lębork", b: "Gryf Słupsk", nazwa: "Derby Pomorza Środkowego" },
  { a: "Gryf Słupsk", b: "Jantar Ustka", nazwa: "Derby ziemi słupskiej" },
  { a: "Pogoń Lębork", b: "Jantar Ustka", nazwa: "Derby ziemi słupsko-lęborskiej" },
  { a: "Bytovia Bytów", b: "Start Miastko", nazwa: "Derby ziemi bytowsko-miasteckiej" },
  { a: "Gryf Słupsk", b: "Bytovia Bytów", nazwa: "Derby Pomorza Środkowego" },
  // Zachodniopomorskie — derby regionalne
  { a: "Pogoń Szczecin", b: "Arkonia Szczecin", nazwa: "Derby Szczecina" },
  { a: "Gwardia Koszalin", b: "Bałtyk Koszalin", nazwa: "Derby Koszalina" },
  { a: "Błękitni Stargard", b: "Kluczevia Stargard", nazwa: "Derby Stargardu" },
  // Kujawsko-pomorskie — derby regionalne
  { a: "Zawisza Bydgoszcz", b: "Polonia Bydgoszcz", nazwa: "Derby Bydgoszczy" },
  { a: "Elana Toruń", b: "Pomorzanin Toruń", nazwa: "Derby Torunia" },
  { a: "Olimpia Grudziądz", b: "Stal Grudziądz", nazwa: "Derby Grudziądza" },
  { a: "Cuiavia Inowrocław", b: "Goplania Inowrocław", nazwa: "Derby Inowrocławia" },
  { a: "Elana Toruń", b: "Polonia Bydgoszcz", nazwa: "Derby kujawsko-pomorskie (Toruń–Bydgoszcz)" },
  // Zachodniopomorskie — rywalizacja ponadregionalna (Pogoń)
  { a: "Pogoń Szczecin", b: "Lechia Gdańsk", nazwa: "Derby Pomorza" },
  // Warmińsko-mazurskie i podlaskie (źródła: pl/en.wikipedia — List of derbies in Poland, artykuły klubów)
  { a: "Olimpia Elbląg", b: "Stomil Olsztyn", nazwa: "Derby regionu" },
  { a: "Jeziorak Iława", b: "Stomil Olsztyn", nazwa: "Derby Warmii" },
  { a: "Olimpia Elbląg", b: "Jeziorak Iława", nazwa: "Derby regionu" },
  { a: "Olimpia Elbląg", b: "Concordia Elbląg", nazwa: "Derby Elbląga" },
  { a: "Stomil Olsztyn", b: "Warmia Olsztyn", nazwa: "Derby Olsztyna" },
  { a: "Jagiellonia Białystok", b: "ŁKS Łomża", nazwa: "Derby Podlasia" },
  { a: "Jagiellonia Białystok", b: "Warmia Grajewo", nazwa: "Derby Podlasia" },
  { a: "Wigry Suwałki", b: "Jagiellonia Białystok", nazwa: "Derby Podlasia" },
  { a: "Wigry Suwałki", b: "ŁKS Łomża", nazwa: "Derby Podlasia" },
  { a: "Wigry Suwałki", b: "Ruch Wysokie Mazowieckie", nazwa: "Derby Podlasia" },
  { a: "ŁKS Łomża", b: "Ruch Wysokie Mazowieckie", nazwa: "Derby Podlasia" },
  { a: "Wigry Suwałki", b: "Sparta Augustów", nazwa: "Derby Podlasia" },
  { a: "Wigry Suwałki", b: "MKS Mazur Ełk", nazwa: "Derby regionu" },
  { a: "MKS Mazur Ełk", b: "Mazur Pisz", nazwa: "Derby Mazur" },
  { a: "MKS Mazur Ełk", b: "Płomień Ełk", nazwa: "Derby Ełku" },
  { a: "Olimpia Elbląg", b: "GKS Wikielec", nazwa: "Derby regionu" },
  { a: "Znicz Biała Piska", b: "GKS Wikielec", nazwa: "Derby województwa" },
  { a: "Znicz Biała Piska", b: "Mamry Giżycko", nazwa: "Derby regionu" },
  { a: "Znicz Biała Piska", b: "Mazur Pisz", nazwa: "Derby regionu" },
  { a: "Sokół Ostróda", b: "Drwęca Nowe Miasto Lubawskie", nazwa: "Derby regionu" },
  { a: "Drwęca Nowe Miasto Lubawskie", b: "Motor Lubawa", nazwa: "Derby regionu" },
  { a: "Jeziorak Iława", b: "Motor Lubawa", nazwa: "Derby regionu" },
  { a: "Warmia Grajewo", b: "ŁKS Łomża", nazwa: "Derby regionu" },
  // audyt 28.11.2026 (en.wikipedia — List of football rivalries in Poland)
  { a: "Gwardia Koszalin", b: "Kotwica Kołobrzeg", nazwa: "Wielkie Derby Pomorza" },
  { a: "Gryf Słupsk", b: "Gwardia Koszalin", nazwa: "Wielkie Derby Pomorza" },
  { a: "Arka Gdynia", b: "Bałtyk Gdynia", nazwa: "Derby Gdyni" },
  { a: "Lechia Gdańsk", b: "Gedania Gdańsk", nazwa: "Derby Gdańska" },
  { a: "Lechia Gdańsk", b: "Stoczniowiec Gdańsk", nazwa: "Derby Gdańska" },
  { a: "Korona Kielce", b: "KSZO Ostrowiec Świętokrzyski", nazwa: "Derby Świętokrzyskie" },
  { a: "Hutnik Kraków", b: "KSZO Ostrowiec Świętokrzyski", nazwa: "Derby hutnicze" },
  { a: "Hutnik Kraków", b: "Stal Stalowa Wola", nazwa: "Derby hutnicze" },
  { a: "KSZO Ostrowiec Świętokrzyski", b: "Stal Stalowa Wola", nazwa: "Derby hutnicze" },
  { a: "Avia Świdnik", b: "Motor Lublin", nazwa: "Derby Lubelszczyzny" },
  { a: "Siarka Tarnobrzeg", b: "Stal Stalowa Wola", nazwa: "Wielkie Derby Podkarpacia" },
  { a: "Odra Opole", b: "Śląsk Wrocław", nazwa: "Derby Opola i Wrocławia" },
];

// Mecze przyjaźni (zgody kibicowskie) — kibice się przyjaźnią: świetna atmosfera, komplet, bez podwyższonego ryzyka.
export const PRZYJAZNIE: ParaDerbowa[] = [
  // Wielka Trójka (najsłynniejsza zgoda): Lech Poznań – Cracovia – Arka Gdynia (każdy z każdym)
  { a: "Lech Poznań", b: "Cracovia", nazwa: "Mecz Przyjaźni (Wielka Trójka)" },
  { a: "Lech Poznań", b: "Arka Gdynia", nazwa: "Mecz Przyjaźni (Wielka Trójka)" },
  { a: "Cracovia", b: "Arka Gdynia", nazwa: "Mecz Przyjaźni (Wielka Trójka)" },
  // Triada: Wisła Kraków – Śląsk Wrocław – Lechia Gdańsk
  { a: "Lechia Gdańsk", b: "Śląsk Wrocław", nazwa: "Mecz Przyjaźni (od 1977)" },
  // Motor Lublin – Śląsk Wrocław
  { a: "Motor Lublin", b: "Śląsk Wrocław", nazwa: "Mecz Przyjaźni" },
  // Ruch Chorzów – Widzew Łódź
  { a: "Ruch Chorzów", b: "Widzew Łódź", nazwa: "Mecz Przyjaźni" },
  // Legia Warszawa – Zagłębie Sosnowiec (wieloletnia zgoda)
  { a: "Legia Warszawa", b: "Zagłębie Sosnowiec", nazwa: "Mecz Przyjaźni" },
  // Cracovia – GKS Tychy (zgoda od 1982)
  { a: "Cracovia", b: "GKS Tychy", nazwa: "Mecz Przyjaźni" },
  // Wisła Kraków – Ruch Chorzów (zgoda od 2022)
  { a: "Wisła Kraków", b: "Ruch Chorzów", nazwa: "Mecz Przyjaźni" },
  // Druga trójca zgód: ŁKS Łódź – GKS Tychy – Zawisza Bydgoszcz (każdy z każdym)
  { a: "ŁKS Łódź", b: "GKS Tychy", nazwa: "Mecz Przyjaźni (trójca)" },
  { a: "ŁKS Łódź", b: "Zawisza Bydgoszcz", nazwa: "Mecz Przyjaźni (trójca)" },
  { a: "GKS Tychy", b: "Zawisza Bydgoszcz", nazwa: "Mecz Przyjaźni (trójca)" },
  // Pomorskie — zgody kibicowskie
  { a: "Gryf Wejherowo", b: "Kaszubia Kościerzyna", nazwa: "Mecz Przyjaźni (Kaszuby)" },
  { a: "Elana Toruń", b: "Widzew Łódź", nazwa: "Mecz Przyjaźni" },
  // Zachodniopomorskie / kujawsko-pomorskie — zgody kibicowskie (źródło: en.wikipedia)
  { a: "Gwardia Koszalin", b: "Arka Gdynia", nazwa: "Mecz Przyjaźni (obóz Arki)" },
];

// ——— Patronat kibicowski (afiliacje) ———
// Mniejsze kluby „trzymają" z dużym klubem. Gdy grają dwa kluby WROGICH patronów → mecz podwyższonego ryzyka
// (nie derby, ale gorąca atmosfera). Gdy dwa kluby TEGO SAMEGO patrona → zgoda kibicowska (mecz przyjaźni).
export const RYWALE_PATRONOW: [string, string][] = [
  ["Arka Gdynia", "Lechia Gdańsk"], // Pomorskie
  ["Wisła Kraków", "Cracovia"], // Małopolska
];

export const AFILIACJE: Record<string, string> = {
  // Pomorskie — obóz ARKI GDYNIA (fankluby Arki m.in. w Wejherowie, Kościerzynie, Tczewie)
  "Gryf Wejherowo": "Arka Gdynia",
  "Kaszubia Kościerzyna": "Arka Gdynia",
  // Pomorskie — obóz LECHII GDAŃSK (FC Lechii m.in. Starogard, Malbork; sympatycy: Gryf Słupsk, Bytovia, Chojniczanka)
  "Gryf Słupsk": "Lechia Gdańsk",
  "Bytovia Bytów": "Lechia Gdańsk",
  "Chojniczanka II Chojnice": "Lechia Gdańsk",
  "Chojniczanka III Chojnice": "Lechia Gdańsk",
  "Pomezania Malbork": "Lechia Gdańsk",
  "KP Starogard Gdański": "Lechia Gdańsk",
  // Małopolska — obóz CRACOVII (zgody Cracovii: Sandecja od 1985, Tarnovia od 1993)
  "Sandecja Nowy Sącz": "Cracovia",
  "Tarnovia Tarnów": "Cracovia",
  // Małopolska — obóz WISŁY KRAKÓW (zgoda z Unią Tarnów; fankluby Wisły w mniejszych miastach regionu)
  "Unia Tarnów": "Wisła Kraków",
  // Zachodniopomorskie / kujawsko-pomorskie — patronaty kibicowskie (źródło: en.wikipedia)
  "Gwardia Koszalin": "Arka Gdynia",
};

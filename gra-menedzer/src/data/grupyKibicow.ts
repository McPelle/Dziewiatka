// Prawdziwe grupy kibicowskie (ultras, ekipy, fankluby), nazwy trybun i zgody — tylko potwierdzone w źródłach
// (Wikipedia, prasa, serwisy kibicowskie, m.in. stadionowioprawcy.net). Używane WYŁĄCZNIE do flag na płotach i opisu
// trybun; incydenty w grze nigdy nie są przypisywane konkretnej grupie — zawsze „kibicom klubu".
export interface GrupyKlubu { trybuna?: string[]; ultras?: string[]; chuligani?: string[]; fanklub?: string[]; zgody?: string[]; kosy?: string[]; flagi?: string[] }
export const GRUPY_KIBICOW: Record<string, GrupyKlubu> = {
 "Lech Poznań": {
  "trybuna": [
   "Kocioł"
  ],
  "ultras": [
   "Lech Poznań Ultras"
  ],
  "chuligani": [
   "Young Freaks'98",
   "Terrormachine",
   "Brygada Banici"
  ],
  "zgody": [
   "Arka Gdynia",
   "Cracovia",
   "KSZO Ostrowiec Świętokrzyski",
   "ŁKS Łódź"
  ],
  "flagi": [
   "Wiara Lecha"
  ],
  "fanklub": [
   "FANKLUB Inowrocław",
   "FANKLUB Janowiec Wielkopolski",
   "FANKLUB Mogilno",
   "FANKLUB Strzelno",
   "FANKLUB Kostrzyn nad Odrą",
   "FANKLUB Świebodzin",
   "FANKLUB Chodzież",
   "FANKLUB Gostyń",
   "FANKLUB Gniezno",
   "FANKLUB Grodzisk Wielkopolski",
   "FANKLUB Jarocin",
   "FANKLUB Kaźmierz",
   "FANKLUB Koło",
   "FANKLUB Komorniki",
   "FANKLUB Konin",
   "FANKLUB Kościelec",
   "FANKLUB Krotoszyn",
   "FANKLUB Kostrzyn",
   "FANKLUB Kępno",
   "FANKLUB Kościan",
   "FANKLUB Leszno",
   "FANKLUB Ostrów Wielkopolski",
   "FANKLUB Ostrzeszów",
   "FANKLUB Opalenica",
   "FANKLUB Oborniki",
   "FANKLUB Owińska",
   "FANKLUB Piła",
   "FANKLUB Pniewy",
   "FANKLUB Rawicz",
   "FANKLUB Szamotuły",
   "FANKLUB Swarzędz",
   "FANKLUB Środa Wielkopolska",
   "FANKLUB Śrem",
   "FANKLUB Września",
   "FANKLUB Wolsztyn",
   "FANKLUB Wągrowiec",
   "FANKLUB Wronki",
   "FANKLUB Złotów"
  ],
  "kosy": [
   "Legia Warszawa",
   "Ruch Chorzów",
   "Widzew Łódź",
   "Elana Toruń",
   "Śląsk Wrocław",
   "Lechia Gdańsk",
   "Pogoń Szczecin",
   "Zagłębie Sosnowiec",
   "KKS 1925 Kalisz",
   "Wisła Kraków"
  ]
 },
 "Górnik Zabrze": {
  "ultras": [
   "Ultras Górnik Zabrze"
  ],
  "chuligani": [
   "Torcida Górnik"
  ],
  "zgody": [
   "Wisłoka Dębica",
   "Hajduk Split"
  ],
  "fanklub": [
   "FANKLUB Ruda Śląska",
   "FANKLUB Gliwice",
   "FANKLUB Piekary Śląskie",
   "FANKLUB Knurów",
   "FANKLUB Tarnowskie Góry",
   "FANKLUB Rybnik",
   "FANKLUB Czerwionka-leszczyny",
   "FANKLUB Orzesze",
   "FANKLUB Syrynia",
   "FANKLUB Mysłowice",
   "FANKLUB Pyskowice",
   "FANKLUB Lubliniec",
   "FANKLUB Rydułtowy",
   "FANKLUB Mikołów",
   "FANKLUB Żory",
   "FANKLUB Świętochłowice",
   "FANKLUB Śląsk Cieszyński",
   "FANKLUB Miasteczko Śląskie"
  ],
  "kosy": [
   "Ruch Chorzów",
   "Wisła Kraków",
   "Elana Toruń",
   "Widzew Łódź",
   "Piast Gliwice",
   "Polonia Bytom",
   "Zagłębie Sosnowiec",
   "Legia Warszawa",
   "GKS Tychy",
   "Odra Opole",
   "Raków Częstochowa",
   "Stomil Olsztyn",
   "Lechia Gdańsk"
  ]
 },
 "Jagiellonia Białystok": {
  "ultras": [
   "UJB – Ultras Jagiellonia Białystok",
   "UJB - Ultras Jagiellonia Białystok",
   "Stowarzyszenie Kibiców Jagiellonii Białystok „Dzieci Białegostoku”",
   "BKKN – Białostocki Klub Kibiców Niepełnosprawnych"
  ],
  "zgody": [
   "Mazur Ełk",
   "MKS Mazur Ełk"
  ],
  "flagi": [
   "Dzieci Białegostoku",
   "The Best Fans",
   "Fan Club Piasta",
   "Antoniuk",
   "Zielone Wzgórza",
   "Hajnówka 100% Jaga",
   "Łomża 100% Jaga",
   "Klub Kibica Łapy",
   "Cała Jaga zawsze razem",
   "Wstań, unieś barwy"
  ],
  "fanklub": [
   "FANKLUB Bielsk Podlaski",
   "FANKLUB Brańsk",
   "FANKLUB Czarna Białostocka",
   "FANKLUB Hajnówka",
   "FANKLUB Kolno",
   "FANKLUB Łapy",
   "FANKLUB Mońki",
   "FANKLUB Nowe Miasto",
   "FANKLUB Sejny",
   "FANKLUB Sidra",
   "FANKLUB Sokółka",
   "FANKLUB Boćki",
   "FANKLUB Grajewo",
   "FANKLUB Zambrów",
   "FANKLUB Wysokie Mazowieckie",
   "FANKLUB Choroszcz",
   "FANKLUB Kędzierzyn-Koźle"
  ],
  "kosy": [
   "ŁKS Łomża",
   "Wigry Suwałki",
   "Lechia Gdańsk",
   "Cracovia",
   "Legia Warszawa",
   "Wisła Kraków",
   "Arka Gdynia",
   "Stomil Olsztyn"
  ]
 },
 "Raków Częstochowa": {
  "chuligani": [
   "Berzowcy'98",
   "Red Blue Youngs",
   "Cosa Nostra'03"
  ],
  "zgody": [
   "Chemik Kędzierzyn-Koźle",
   "Videoton Szekesfehervar",
   "Stomil Olsztyn (układ)",
   "Lechia Gdańsk (układ)",
   "Lechia Gdańsk",
   "Stomil Olsztyn"
  ],
  "flagi": [
   "Wieczny Raków"
  ],
  "fanklub": [
   "FANKLUB Herby",
   "FANKLUB Huta Stara B",
   "FANKLUB Radomsko",
   "FANKLUB Rędziny"
  ],
  "kosy": [
   "Widzew Łódź",
   "Ruch Chorzów",
   "Wisła Kraków",
   "Elana Toruń",
   "Górnik Zabrze",
   "Piast Gliwice",
   "Odra Opole"
  ]
 },
 "GKS Katowice": {
  "ultras": [
   "Ultras GieKSa'03"
  ],
  "chuligani": [
   "Persona Non Grata"
  ],
  "zgody": [
   "Banik Ostrava",
   "JKS Jarosław (układ)",
   "ROW Rybnik (układ)",
   "JKS 1909 Jarosław"
  ],
  "fanklub": [
   "FANKLUB Bieruń (Stary)",
   "FANKLUB Bukowno",
   "FANKLUB Bojszowy",
   "FANKLUB Bystra",
   "FANKLUB Chełm Śląski",
   "FANKLUB Chrzanów",
   "FANKLUB Imielin",
   "FANKLUB Jaworzno",
   "FANKLUB Lędziny",
   "FANKLUB Mysłowice",
   "FANKLUB Libiąż",
   "FANKLUB Ruda Śląska",
   "FANKLUB Siemianowice Śląskie",
   "FANKLUB Skoczów",
   "FANKLUB Sławków",
   "FANKLUB Trzebinia",
   "FANKLUB Zawiercie",
   "FANKLUB Załęże",
   "FANKLUB Żory",
   "FANKLUB Wolbrom"
  ],
  "trybuna": [
   "Blaszok (stadion przy Bukowej)"
  ],
  "kosy": [
   "Ruch Chorzów",
   "Zagłębie Sosnowiec",
   "GKS Tychy",
   "Legia Warszawa",
   "GKS Jastrzębie",
   "Widzew Łódź",
   "Piast Gliwice",
   "Odra Opole",
   "Polonia Bytom",
   "Lechia Gdańsk"
  ]
 },
 "Legia Warszawa": {
  "trybuna": [
   "Żyleta",
   "Żyleta (trybuna północna)"
  ],
  "ultras": [
   "Nieznani Sprawcy",
   "UZaLeżnieni",
   "Dobrzy Ludzie"
  ],
  "chuligani": [
   "Teddy Boys '95",
   "Turyści '97"
  ],
  "fanklub": [
   "East Front '03",
   "Squadron",
   "Soldiers '04",
   "Old Fashion Man Club",
   "FANKLUB Brodnica",
   "FANKLUB Chełmża",
   "FANKLUB Chełmno",
   "FANKLUB Lipno",
   "FANKLUB Rypin",
   "FANKLUB Biała Podlaska",
   "FANKLUB Dęblin",
   "FANKLUB Łuków",
   "FANKLUB Puławy",
   "FANKLUB Kostrzyn nad Odrą",
   "FANKLUB Biała Rawska",
   "FANKLUB Rawa Mazowiecka",
   "FANKLUB Skierniewice",
   "FANKLUB Tomaszów Mazowiecki",
   "FANKLUB Białobrzegi",
   "FANKLUB Ciechanów",
   "FANKLUB Garwolin",
   "FANKLUB Grójec",
   "FANKLUB Grodzisk Mazowiecki",
   "FANKLUB Góra Kalwaria",
   "FANKLUB Józefów",
   "FANKLUB Karczew",
   "FANKLUB Legionowo",
   "FANKLUB Łomianki",
   "FANKLUB Łochów",
   "FANKLUB Marki",
   "FANKLUB Mińsk Mazowiecki",
   "FANKLUB Mszczonów",
   "FANKLUB Mława",
   "FANKLUB Nowy Dwór Mazowiecki",
   "FANKLUB Nadarzyn",
   "FANKLUB Otwock",
   "FANKLUB Ostrołęka",
   "FANKLUB Pruszków",
   "FANKLUB Piaseczno",
   "FANKLUB Pułtusk",
   "FANKLUB Płońsk",
   "FANKLUB Pilawa",
   "FANKLUB Radzymin",
   "FANKLUB Raszyn",
   "FANKLUB Sulejówek",
   "FANKLUB Sochaczew",
   "FANKLUB Siedlce",
   "FANKLUB Wołomin",
   "FANKLUB Wyszków",
   "FANKLUB Ząbki",
   "FANKLUB Żyrardów",
   "FANKLUB Żelechów",
   "FANKLUB Wolbrom",
   "FANKLUB Kwidzyn",
   "FANKLUB Opatów",
   "FANKLUB Starachowice",
   "FANKLUB Cieszyn"
  ],
  "zgody": [
   "Zagłębie Sosnowiec",
   "Olimpia Elbląg",
   "Radomiak Radom",
   "ADO Den Haag"
  ],
  "flagi": [
   "Sekcja Sympatyków"
  ],
  "kosy": [
   "Polonia Warszawa",
   "Cracovia",
   "Śląsk Wrocław",
   "Lech Poznań",
   "Arka Gdynia",
   "ŁKS Łódź",
   "Widzew Łódź",
   "Jagiellonia Białystok",
   "Lechia Gdańsk",
   "Wisła Kraków",
   "Ruch Chorzów",
   "Górnik Zabrze",
   "GKS Katowice",
   "GKS Tychy",
   "Korona Kielce",
   "Sandecja Nowy Sącz",
   "Wisła Płock",
   "Zagłębie Lubin",
   "Zawisza Bydgoszcz",
   "Stomil Olsztyn",
   "Pelikan Łowicz",
   "Polonia Bytom"
  ]
 },
 "Zagłębie Lubin": {
  "ultras": [
   "OCB'03 – Orange City Boys'03",
   "OCB'03 - Orange City Boys'03"
  ],
  "chuligani": [
   "HZL – Hooligans Zagłębie Lubin",
   "HZL - Hooligans Zagłębie Lubin"
  ],
  "zgody": [
   "Arka Gdynia",
   "Odra Opole",
   "Zawisza Bydgoszcz",
   "Polonia Bytom (układ)",
   "Polonia Bytom"
  ],
  "flagi": [
   "Zagłębie Fanatyków"
  ],
  "fanklub": [
   "FANKLUB Bolesławiec",
   "FANKLUB Chocianów",
   "FANKLUB Chobienia",
   "FANKLUB Chojnów",
   "FANKLUB Polkowice",
   "FANKLUB Prochowice",
   "FANKLUB Ścinawa",
   "FANKLUB Złotoryja",
   "FANKLUB Szprotawa",
   "FANKLUB Sława",
   "FANKLUB Wschowa",
   "FANKLUB Lubań",
   "FANKLUB Lwówek Śląski",
   "FANKLUB Strzegom",
   "FANKLUB Świdnica",
   "FANKLUB Góra"
  ],
  "kosy": [
   "Śląsk Wrocław",
   "Miedź Legnica",
   "Wisła Kraków",
   "Lechia Gdańsk",
   "Legia Warszawa",
   "ŁKS Łódź",
   "Widzew Łódź",
   "Ruch Chorzów",
   "Chrobry Głogów",
   "Elana Toruń"
  ]
 },
 "Wisła Płock": {
  "ultras": [
   "Wisła Płock Ultras"
  ],
  "chuligani": [
   "Patoloyoung",
   "Dogs Band"
  ],
  "zgody": [
   "Stomil Olsztyn",
   "Hutnik Kraków (układ)",
   "Hutnik Kraków"
  ],
  "fanklub": [
   "FANKLUB Drobin",
   "FANKLUB Dobrzyń",
   "FANKLUB Gostynin",
   "FANKLUB Sierpc"
  ],
  "kosy": [
   "Legia Warszawa",
   "Polonia Warszawa",
   "Olimpia Elbląg",
   "Wisła Kraków",
   "Arka Gdynia",
   "Zawisza Bydgoszcz",
   "Znicz Pruszków"
  ]
 },
 "Pogoń Szczecin": {
  "ultras": [
   "UPS - Ultras Pogoń Szczecin"
  ],
  "chuligani": [
   "LFS - Lads From Szczecin",
   "Terror Corps"
  ],
  "zgody": [
   "Feyenoord Rotterdam",
   "BFC Dynamo",
   "NK Osijek (układ)"
  ],
  "flagi": [
   "Pogoń Walcząca"
  ],
  "fanklub": [
   "FANKLUB Chojna",
   "FANKLUB Dębno",
   "FANKLUB Gryfino",
   "FANKLUB Kamień Pomorski",
   "FANKLUB Nowogard",
   "FANKLUB Lipiany",
   "FANKLUB Police",
   "FANKLUB Stargard",
   "FANKLUB Szczecinek",
   "FANKLUB Trzebiatów",
   "FANKLUB Wysoka Kamieńska"
  ],
  "trybuna": [
   "Młyn / Piekiełko (sektory 10–12)"
  ],
  "kosy": [
   "Lech Poznań",
   "Cracovia",
   "Arka Gdynia",
   "Zagłębie Sosnowiec",
   "Lechia Gdańsk",
   "Gryf Słupsk",
   "Gwardia Koszalin"
  ]
 },
 "Radomiak Radom": {
  "ultras": [
   "Ultras Radomiak"
  ],
  "chuligani": [
   "Radomscy Chuligani"
  ],
  "zgody": [
   "Legia Warszawa"
  ],
  "fanklub": [
   "FANKLUB Białobrzegi",
   "FANKLUB Dobieszyn",
   "FANKLUB Iłża",
   "FANKLUB Jastrząb",
   "FANKLUB Przysucha",
   "FANKLUB Szydłowiec",
   "FANKLUB Skaryszew",
   "FANKLUB Wierzchowiny"
  ],
  "kosy": [
   "Broń Radom",
   "Korona Kielce",
   "KSZO Ostrowiec Świętokrzyski",
   "Motor Lublin",
   "GKS Tychy",
   "Polonia Warszawa",
   "Resovia Rzeszów",
   "Resovia",
   "Pelikan Łowicz"
  ]
 },
 "Korona Kielce": {
  "trybuna": [
   "Młyn"
  ],
  "ultras": [
   "Ultrasi '04",
   "Ultras Korona '04"
  ],
  "chuligani": [
   "YBH'01 – Young Boys Hooligans",
   "YBH'01 - Young Boys Hooligans"
  ],
  "flagi": [
   "Złocisto-Krwiści"
  ],
  "fanklub": [
   "FANKLUB Końskie",
   "FANKLUB Północ",
   "FANKLUB Wschód",
   "FANKLUB Chęciny",
   "FANKLUB Sędziszów",
   "FANKLUB Daleszyce",
   "FANKLUB Busko-Zdrój",
   "FANKLUB Miedziana Góra",
   "FANKLUB Chmielnik"
  ],
  "zgody": [
   "Naprzód Jędrzejów (układ)",
   "Naprzód Jędrzejów"
  ],
  "kosy": [
   "KSZO Ostrowiec Świętokrzyski",
   "Widzew Łódź",
   "Wisła Kraków",
   "Radomiak Radom",
   "Legia Warszawa",
   "Hutnik Kraków",
   "Motor Lublin",
   "Stal Stalowa Wola",
   "Star Starachowice"
  ]
 },
 "Motor Lublin": {
  "chuligani": [
   "Banda Motor"
  ],
  "zgody": [
   "Śląsk Wrocław",
   "Hetman Zamość"
  ],
  "flagi": [
   "Motorowcy"
  ],
  "fanklub": [
   "FANKLUB Abramów",
   "FANKLUB Bełżyce",
   "FANKLUB Bychawa",
   "FANKLUB Chlewiska",
   "FANKLUB Kamionka",
   "FANKLUB Konopnica",
   "FANKLUB Kraśnik",
   "FANKLUB Lubartów",
   "FANKLUB Niedrzwica",
   "FANKLUB Niemce",
   "FANKLUB Piaski",
   "FANKLUB Płonki",
   "FANKLUB Poniatowa",
   "FANKLUB Radawiec",
   "FANKLUB Rejowiec Fabryczny",
   "FANKLUB Ryki",
   "FANKLUB Trawniki"
  ],
  "kosy": [
   "Wisła Kraków",
   "Widzew Łódź",
   "Ruch Chorzów",
   "Stal Stalowa Wola",
   "Avia Świdnik",
   "Arka Gdynia",
   "Cracovia",
   "Elana Toruń",
   "KKS 1925 Kalisz",
   "Korona Kielce",
   "Lechia Gdańsk",
   "Podlasie Biała Podlaska",
   "Pogoń Siedlce",
   "Radomiak Radom",
   "Stal Rzeszów"
  ]
 },
 "Cracovia": {
  "ultras": [
   "Opravcy"
  ],
  "chuligani": [
   "Jude Gang",
   "Anty-wisła"
  ],
  "zgody": [
   "Arka Gdynia",
   "Lech Poznań",
   "GKS Tychy",
   "Sandecja Nowy Sącz",
   "Tarnovia Tarnów"
  ],
  "fanklub": [
   "FANKLUB Andrychów",
   "FANKLUB Czułów",
   "FANKLUB Czernichów",
   "FANKLUB Dąbrowa Tarnowska",
   "FANKLUB Gaj",
   "FANKLUB Golkowice",
   "FANKLUB Krynica-Zdrój",
   "FANKLUB Koszyce",
   "FANKLUB Libiąż",
   "FANKLUB Limanowa",
   "FANKLUB Miechów",
   "FANKLUB Muszyna",
   "FANKLUB Niepołomice",
   "FANKLUB Nowy Targ",
   "FANKLUB Olkusz",
   "FANKLUB Proszowice",
   "FANKLUB Poronin",
   "FANKLUB Rabka-Zdrój",
   "FANKLUB Skawina",
   "FANKLUB Trzebinia",
   "FANKLUB Wieliczka",
   "FANKLUB Wolbrom",
   "FANKLUB Zawada",
   "FANKLUB Zakopane",
   "FANKLUB Kazimierza Wielka",
   "FANKLUB Przemyśl",
   "FANKLUB Jarosław",
   "FANKLUB Sucha Beskidzka",
   "FANKLUB Krzeszowice",
   "FANKLUB Niedźwiedź",
   "FANKLUB Oświęcim",
   "FANKLUB Biała Podlaska",
   "FANKLUB Radom",
   "FANKLUB Rzeszów"
  ],
  "kosy": [
   "Wisła Kraków",
   "Śląsk Wrocław",
   "Lechia Gdańsk",
   "Legia Warszawa",
   "Pogoń Szczecin",
   "Motor Lublin",
   "Zagłębie Sosnowiec",
   "Widzew Łódź",
   "Ruch Chorzów",
   "Glinik Gorlice",
   "Hutnik Kraków",
   "Jagiellonia Białystok",
   "Okocimski KS Brzesko",
   "Podhale Nowy Targ",
   "Unia Tarnów"
  ]
 },
 "Widzew Łódź": {
  "ultras": [
   "Ultras Widzew",
   "Red Workers",
   "Ultra Registi",
   "Wiara spod Zegara"
  ],
  "chuligani": [
   "DHW'95 – Destroyers Hooligans Widzew",
   "DHW'95 - Destroyers Hooligans Widzew"
  ],
  "zgody": [
   "Ruch Chorzów",
   "Elana Toruń",
   "Wisła Kraków (układ)",
   "KKS Kalisz (układ)",
   "CSKA Moskwa (układ)",
   "KKS 1925 Kalisz",
   "Wisła Kraków"
  ],
  "fanklub": [
   "FANKLUB Grudziądz",
   "FANKLUB Drezdenko",
   "FANKLUB Aleksandrów Łódzki",
   "FANKLUB Andrespol",
   "FANKLUB Brzeziny",
   "FANKLUB Biała Rawska",
   "FANKLUB Bełchatów",
   "FANKLUB Głowno",
   "FANKLUB Kutno",
   "FANKLUB Konstantynów Łódzki",
   "FANKLUB Koluszki",
   "FANKLUB Lutomiersk",
   "FANKLUB Łęczyca",
   "FANKLUB Łowicz",
   "FANKLUB Niewiadów",
   "FANKLUB Opoczno",
   "FANKLUB Ozorków",
   "FANKLUB Pabianice",
   "FANKLUB Piotrków Trybunalski",
   "FANKLUB Przedbórz",
   "FANKLUB Rawa Mazowiecka",
   "FANKLUB Radomsko",
   "FANKLUB Rogów",
   "FANKLUB Sieradz",
   "FANKLUB Skierniewice",
   "FANKLUB Stryków",
   "FANKLUB Tomaszów Mazowiecki",
   "FANKLUB Uniejów",
   "FANKLUB Wieluń",
   "FANKLUB Wolbórz",
   "FANKLUB Zduńska Wola",
   "FANKLUB Zgierz",
   "FANKLUB Ciechanów",
   "FANKLUB Gostynin",
   "FANKLUB Końskie",
   "FANKLUB Skarżysko-Kamienna",
   "FANKLUB Starachowice",
   "FANKLUB Koźminek",
   "FANKLUB Opatówek",
   "FANKLUB Turek"
  ],
  "kosy": [
   "ŁKS Łódź",
   "Legia Warszawa",
   "Śląsk Wrocław",
   "Lechia Gdańsk",
   "Lech Poznań",
   "Cracovia",
   "Motor Lublin",
   "Zawisza Bydgoszcz",
   "Górnik Zabrze",
   "GKS Katowice",
   "Chełmianka Chełm",
   "GKS Tychy",
   "Korona Kielce",
   "Miedź Legnica",
   "Pogoń Grodzisk Mazowiecki",
   "Polonia Bydgoszcz",
   "Raków Częstochowa",
   "Resovia",
   "Włocłavia Włocławek",
   "Zagłębie Lubin",
   "Olimpia Elbląg",
   "Stomil Olsztyn"
  ]
 },
 "Piast Gliwice": {
  "ultras": [
   "ASP - Anonimowi Sympatycy Piasta"
  ],
  "chuligani": [
   "HPG - Hooligans Piast Gliwice",
   "Młode Gliwice"
  ],
  "zgody": [
   "GKS Jastrzębie",
   "BATE Borysów",
   "RKS Radomsko (układ)"
  ],
  "fanklub": [
   "FANKLUB Kleszczów",
   "FANKLUB Rudziniec",
   "FANKLUB Czekanów",
   "FANKLUB Krupski Młyn",
   "FANKLUB Prudnik",
   "FANKLUB Taciszów"
  ],
  "kosy": [
   "Górnik Zabrze",
   "GKS Katowice",
   "Zagłębie Sosnowiec",
   "Polonia Bytom",
   "ROW Rybnik",
   "Raków Częstochowa"
  ]
 },
 "Wisła Kraków": {
  "ultras": [
   "Ultra Wisła"
  ],
  "chuligani": [
   "Wisła Devils",
   "Młoda Ferajna",
   "Wisła Sharks"
  ],
  "zgody": [
   "Ruch Chorzów",
   "Lazio Rzym",
   "Widzew Łódź (układ)",
   "Unia Tarnów (układ)",
   "Slovan Bratysława (układ)",
   "Unia Tarnów",
   "Widzew Łódź"
  ],
  "fanklub": [
   "FANKLUB Alwernia",
   "FANKLUB Bochnia",
   "FANKLUB Bolesław",
   "FANKLUB Brzesko",
   "FANKLUB Brzeszcze",
   "FANKLUB Bukowno",
   "FANKLUB Borek Szlachecki",
   "FANKLUB Biskupice",
   "FANKLUB Balice",
   "FANKLUB Chrzanów",
   "FANKLUB Czernichów",
   "FANKLUB Dąbrowa Tarnowska",
   "FANKLUB Gorlice",
   "FANKLUB Golkowice",
   "FANKLUB Jordanów",
   "FANKLUB Kalwaria Zebrzydowska",
   "FANKLUB Krzeszowice",
   "FANKLUB Limanowa",
   "FANKLUB Libiąż",
   "FANKLUB Miechów",
   "FANKLUB Michałowice",
   "FANKLUB Niepołomice",
   "FANKLUB Nowy Targ",
   "FANKLUB Olkusz",
   "FANKLUB Proszowice",
   "FANKLUB Pcim",
   "FANKLUB Rabka-Zdrój",
   "FANKLUB Sucha Beskidzka",
   "FANKLUB Skawina",
   "FANKLUB Szczawnica",
   "FANKLUB Świątniki Górne",
   "FANKLUB Trzebinia",
   "FANKLUB Ujanowice",
   "FANKLUB Wadowice",
   "FANKLUB Wieliczka",
   "FANKLUB Wolbrom",
   "FANKLUB Zielonki",
   "FANKLUB Zakopane",
   "FANKLUB Busko-Zdrój",
   "FANKLUB Kazimierza Wielka",
   "FANKLUB Połaniec",
   "FANKLUB Jaworzno",
   "FANKLUB Zawiercie",
   "FANKLUB Kresy Wschodnie"
  ],
  "kosy": [
   "Cracovia",
   "Motor Lublin",
   "Śląsk Wrocław",
   "Lechia Gdańsk",
   "Hutnik Kraków",
   "BKS Stal Bielsko-Biała",
   "Zagłębie Sosnowiec",
   "Legia Warszawa",
   "Lech Poznań",
   "Arka Gdynia",
   "Beskid Andrychów",
   "GKS Tychy",
   "Górnik Zabrze",
   "Jagiellonia Białystok",
   "Korona Kielce",
   "Miedź Legnica",
   "Raków Częstochowa",
   "Sandecja Nowy Sącz",
   "Tarnovia Tarnów",
   "Wisła Płock",
   "Włocłavia Włocławek",
   "Zagłębie Lubin",
   "Zawisza Bydgoszcz",
   "ŁKS Łódź"
  ]
 },
 "Śląsk Wrocław": {
  "ultras": [
   "Ultravaganza",
   "Ultras Silesia"
  ],
  "chuligani": [
   "Ave Silesia",
   "Łaziory'99"
  ],
  "zgody": [
   "Motor Lublin",
   "Miedź Legnica",
   "Lechia Gdańsk",
   "SFC Opava",
   "Ferencváros"
  ],
  "flagi": [
   "Wielki Śląsk"
  ],
  "fanklub": [
   "FANKLUB Bielawa",
   "FANKLUB Bystrzyca Kłodzka",
   "FANKLUB Bierutów",
   "FANKLUB Brzeg Dolny",
   "FANKLUB Jelenia Góra",
   "FANKLUB Jawor",
   "FANKLUB Kłodzko",
   "FANKLUB Kudowa-Zdrój",
   "FANKLUB Kąty Wrocławskie",
   "FANKLUB Lubiąż",
   "FANKLUB Milicz",
   "FANKLUB Nowa Ruda",
   "FANKLUB Oleśnica",
   "FANKLUB Oława",
   "FANKLUB Oborniki Śląskie",
   "FANKLUB Sobótka",
   "FANKLUB Strzelin",
   "FANKLUB Stronie Śląskie",
   "FANKLUB Syców",
   "FANKLUB Skokowa",
   "FANKLUB Strzegom",
   "FANKLUB Środa Śląska",
   "FANKLUB Trzebnica",
   "FANKLUB Wołów",
   "FANKLUB Ząbkowice Śląskie",
   "FANKLUB Zgorzelec",
   "FANKLUB Żmigród",
   "FANKLUB Brzeg",
   "FANKLUB Namysłów",
   "FANKLUB Nysa",
   "FANKLUB Jelcz-Laskowice",
   "FANKLUB Bielany Wrocławskie",
   "FANKLUB Kobierzyce",
   "FANKLUB Jordanów Śląski",
   "FANKLUB Łagiewniki",
   "FANKLUB Kamieniec Ząbkowicki",
   "FANKLUB Bardo",
   "FANKLUB Złoty Stok",
   "FANKLUB Lądek-Zdrój",
   "FANKLUB Kluczbork",
   "FANKLUB Prusice",
   "FANKLUB Siechnice",
   "FANKLUB Żerniki Wrocławskie",
   "FANKLUB Paczków",
   "FANKLUB Biestrzyków",
   "FANKLUB Kamieniec Wrocławski",
   "FANKLUB Szczodre",
   "FANKLUB Ziębice",
   "FANKLUB Bolków",
   "FANKLUB Kowary",
   "FANKLUB Bogatynia",
   "FANKLUB Świdnica",
   "FANKLUB Żarów",
   "Ślężanie (Sobótka, Rogów Sobócki)"
  ],
  "trybuna": [
   "Młyn (trybuna B - północna, za bramką)"
  ],
  "kosy": [
   "Zagłębie Lubin",
   "Widzew Łódź",
   "Ruch Chorzów",
   "Wisła Kraków",
   "Lech Poznań",
   "Arka Gdynia",
   "Chrobry Głogów",
   "Cracovia",
   "Legia Warszawa",
   "Odra Opole",
   "Olimpia Elbląg"
  ]
 },
 "Chrobry Głogów": {
  "ultras": [
   "Ultras Chrobry"
  ],
  "chuligani": [
   "Głogowscy Hooltaje"
  ],
  "zgody": [
   "Stilon Gorzów Wielkopolski"
  ],
  "fanklub": [
   "FANKLUB Białołęka",
   "FANKLUB Dobrzejowice",
   "FANKLUB Grębocice",
   "FANKLUB Kotła",
   "FANKLUB Krościenko nad Dunajcem",
   "FANKLUB Nowe Miasteczko",
   "FANKLUB Ostaszów",
   "FANKLUB Radwanice",
   "FANKLUB Szlichtyngowa",
   "FANKLUB Żagań"
  ],
  "kosy": [
   "Zagłębie Lubin",
   "Miedź Legnica",
   "Śląsk Wrocław",
   "Górnik Wałbrzych",
   "Falubaz Zielona Góra"
  ]
 },
 "ŁKS Łódź": {
  "ultras": [
   "Galera Warriors"
  ],
  "chuligani": [
   "Uliczni Wojownicy"
  ],
  "zgody": [
   "GKS Tychy",
   "Zawisza Bydgoszcz",
   "Lech Poznań"
  ],
  "fanklub": [
   "FANKLUB Włocławek",
   "FANKLUB Aleksandrów Łódzki",
   "FANKLUB Konstantynów Łódzki",
   "FANKLUB Lutomiersk",
   "FANKLUB Piotrków Trybunalski",
   "FANKLUB Pabianice",
   "FANKLUB Poddębice",
   "FANKLUB Uniejów"
  ],
  "trybuna": [
   "Galera (trybuna wschodnia)"
  ],
  "kosy": [
   "Widzew Łódź",
   "Ruch Chorzów",
   "Wisła Kraków",
   "Elana Toruń",
   "Stal Rzeszów",
   "Legia Warszawa",
   "Arka Gdynia",
   "Polonia Bydgoszcz",
   "Unia Skierniewice",
   "Zagłębie Lubin"
  ]
 },
 "Polonia Warszawa": {
  "trybuna": [
   "Kamienna"
  ],
  "ultras": [
   "Ultras Enigma"
  ],
  "chuligani": [
   "Crazy Group'01"
  ],
  "fanklub": [
   "FANKLUB Black Rebels",
   "FANKLUB Iłowo",
   "FANKLUB Żuromin"
  ],
  "zgody": [
   "Ligallo Fondo Norte (Real Saragossa)",
   "Ligallo Fondo Norte - Real Saragossa (układ)"
  ],
  "flagi": [
   "Duma Stolicy",
   "Warszawska Ferajna",
   "Czarne Koszule",
   "Muranów",
   "Bielany",
   "Ochota",
   "Polonia Warszawa",
   "Konwiktorska 6",
   "Polonia Restituta",
   "K6 on tour"
  ],
  "kosy": [
   "Legia Warszawa",
   "Pogoń Grodzisk Mazowiecki",
   "Pogoń Siedlce",
   "Radomiak Radom",
   "Wisła Płock",
   "Znicz Pruszków",
   "Mazovia Mińsk Mazowiecki",
   "Świt Nowy Dwór Mazowiecki"
  ]
 },
 "Ruch Chorzów": {
  "ultras": [
   "Ultras Niebiescy"
  ],
  "chuligani": [
   "PF - Psycho Fans"
  ],
  "zgody": [
   "Widzew Łódź",
   "Wisła Kraków",
   "Atletico Madryt"
  ],
  "flagi": [
   "Wielki Ruch",
   "Najważniejsza jest tradycja"
  ],
  "fanklub": [
   "FANKLUB Dzierżoniów",
   "FANKLUB Kęty",
   "FANKLUB Bieruń",
   "FANKLUB Cieszyn",
   "FANKLUB Czechowice-Dziedzice",
   "FANKLUB Imielin",
   "FANKLUB Jaworzno",
   "FANKLUB Katowice",
   "FANKLUB Mikołów",
   "FANKLUB Myszków",
   "FANKLUB Mysłowice",
   "FANKLUB Orzesze",
   "FANKLUB Piekary Śląskie",
   "FANKLUB Pilica",
   "FANKLUB Radlin",
   "FANKLUB Ruda Śląska",
   "FANKLUB Siemianowice Śląskie",
   "FANKLUB Strzyżowice",
   "FANKLUB Świętochłowice",
   "FANKLUB Tarnowskie Góry",
   "FANKLUB Zawiercie",
   "FANKLUB Żory",
   "FANKLUB Staszów"
  ],
  "kosy": [
   "Górnik Zabrze",
   "GKS Katowice",
   "Raków Częstochowa",
   "Legia Warszawa",
   "Motor Lublin",
   "GKS Tychy",
   "Zagłębie Sosnowiec",
   "Lech Poznań",
   "Śląsk Wrocław",
   "Lechia Gdańsk",
   "ROW Rybnik",
   "Cracovia",
   "Miedź Legnica",
   "Polonia Bytom",
   "Resovia",
   "Włocłavia Włocławek",
   "Zagłębie Lubin",
   "Zawisza Bydgoszcz",
   "ŁKS Łódź",
   "Olimpia Elbląg"
  ]
 },
 "Miedź Legnica": {
  "ultras": [
   "UML - Ultras Miedź Legnica"
  ],
  "chuligani": [
   "Cuprum Invictus"
  ],
  "zgody": [
   "BKS Stal Bielsko-Biała",
   "Śląsk Wrocław",
   "Promień Żary"
  ],
  "flagi": [
   "Tylko Miedź"
  ],
  "fanklub": [
   "FANKLUB Bieniowice",
   "FANKLUB Goczałków",
   "FANKLUB Krotoszyce",
   "FANKLUB Legnickie Pole",
   "FANKLUB Miłkowice",
   "FANKLUB Prochowice"
  ],
  "kosy": [
   "Zagłębie Lubin",
   "Górnik Wałbrzych",
   "Chrobry Głogów",
   "Odra Opole",
   "Widzew Łódź",
   "Wisła Kraków",
   "Unia Tarnów",
   "Ruch Chorzów",
   "Elana Toruń"
  ]
 },
 "Puszcza Niepołomice": {
  "ultras": [
   "Puszcza Fans"
  ],
  "zgody": [
   "Garbarnia Kraków"
  ]
 },
 "Polonia Bytom": {
  "ultras": [
   "TNT-Ultras"
  ],
  "chuligani": [
   "Desperados",
   "MCHPB – Młodzi Chuligani Polonii Bytom",
   "MCHPB - Młodzi Chuligani Polonii Bytom"
  ],
  "zgody": [
   "Arka Gdynia",
   "Odra Opole",
   "Góral Żywiec",
   "Gryf Wejherowo",
   "Zagłębie Lubin (układ)",
   "Zagłębie Lubin"
  ],
  "fanklub": [
   "FANKLUB Cieszyn",
   "FANKLUB Radzionków",
   "FANKLUB Tarnowskie Góry",
   "FANKLUB Wojkowice",
   "FANKLUB Gogolin",
   "FANKLUB Prudnik"
  ],
  "kosy": [
   "Górnik Zabrze",
   "GKS Katowice",
   "Zagłębie Sosnowiec",
   "BKS Stal Bielsko-Biała",
   "Piast Gliwice",
   "Ruch Chorzów",
   "Lechia Gdańsk",
   "Legia Warszawa"
  ]
 },
 "Pogoń Grodzisk Mazowiecki": {
  "ultras": [
   "Mad Boys",
   "Young Fans"
  ],
  "zgody": [
   "Znicz Pruszków"
  ],
  "kosy": [
   "Widzew Łódź",
   "Broń Radom",
   "Polonia Warszawa"
  ]
 },
 "Odra Opole": {
  "ultras": [
   "UGO - Underground Odra"
  ],
  "chuligani": [
   "VoS'98 – Vikings of South",
   "VoS'98 - Vikings of South"
  ],
  "zgody": [
   "Polonia Bytom",
   "Zagłębie Lubin",
   "FC Sopron"
  ],
  "flagi": [
   "Jedna Odra"
  ],
  "fanklub": [
   "FANKLUB Gogolin",
   "FANKLUB Kluczbork",
   "FANKLUB Lewin Brzeski",
   "FANKLUB Nysa",
   "FANKLUB Skorogoszcz",
   "FANKLUB Strzelce Opolskie",
   "FANKLUB Ozimek",
   "FANKLUB Niemodlin",
   "FANKLUB Brzeg",
   "FANKLUB Dobrzeń Wielki",
   "FANKLUB Głuchołazy",
   "FANKLUB Grodków",
   "FANKLUB Kędzierzyn-Koźle",
   "FANKLUB Kolonowskie",
   "FANKLUB Krapkowice",
   "FANKLUB Łubniany",
   "FANKLUB Olesno",
   "FANKLUB Oława",
   "FANKLUB Prudnik",
   "FANKLUB Strzelin",
   "FANKLUB Turawa",
   "FANKLUB Tułowice",
   "FANKLUB Tarnów Opolski",
   "FANKLUB Zawadzkie",
   "FANKLUB Zdzieszowice",
   "FANKLUB Ziębice"
  ],
  "trybuna": [
   "Młyn"
  ],
  "kosy": [
   "Śląsk Wrocław",
   "Górnik Zabrze",
   "Raków Częstochowa",
   "Chemik Kędzierzyn-Koźle",
   "GKS Katowice",
   "Zagłębie Sosnowiec",
   "Miedź Legnica"
  ]
 },
 "Stal Rzeszów": {
  "ultras": [
   "Elite Ultras Group'04"
  ],
  "chuligani": [
   "Wojownicy z ulicy'03",
   "Thieves Gang Hooligans'02"
  ],
  "zgody": [
   "Karpaty Krosno",
   "Stal Stalowa Wola (układ)",
   "Łada Biłgoraj (układ)",
   "FC VSS Košice (układ)",
   "Polonia Przemyśl (układ)",
   "Stal Stalowa Wola"
  ],
  "fanklub": [
   "FANKLUB Dynów",
   "FANKLUB Łąka",
   "FANKLUB Raniżów",
   "FANKLUB Tyczyn",
   "FANKLUB Krasne",
   "FANKLUB Sokołów Małopolski",
   "FANKLUB Trzebownisko",
   "FANKLUB Nowa Wieś"
  ],
  "kosy": [
   "Resovia Rzeszów",
   "Motor Lublin",
   "Stal Mielec",
   "Wisłoka Dębica",
   "ŁKS Łódź",
   "JKS Jarosław",
   "Siarka Tarnobrzeg",
   "Czuwaj Przemyśl",
   "Stal Sanok",
   "JKS 1909 Jarosław",
   "Resovia"
  ]
 },
 "Stal Mielec": {
  "ultras": [
   "USM'08 – Ultras Stal Mielec",
   "USM'08 - Ultras Stal Mielec"
  ],
  "zgody": [
   "Sandecja Nowy Sącz",
   "Czarni Jasło"
  ],
  "fanklub": [
   "FANKLUB Chmielnik",
   "FANKLUB Przecław",
   "FANKLUB Wadowice Górne"
  ],
  "kosy": [
   "Siarka Tarnobrzeg",
   "Stal Stalowa Wola",
   "Wisłoka Dębica",
   "Stal Rzeszów",
   "Karpaty Krosno",
   "JKS 1909 Jarosław"
  ]
 },
 "Pogoń Siedlce": {
  "ultras": [
   "Blue Brigade '03"
  ],
  "chuligani": [
   "PSH - Pogoń Siedlce Hooligans"
  ],
  "zgody": [
   "Wisła Puławy",
   "Dolcan Ząbki",
   "Mazovia Mińsk Mazowiecki",
   "AZS Podlasie Biała Podlaska (układ)",
   "Podlasie Biała Podlaska"
  ],
  "kosy": [
   "Motor Lublin",
   "Polonia Warszawa",
   "Górnik Łęczna",
   "Chełmianka Chełm"
  ]
 },
 "Lechia Gdańsk": {
  "ultras": [
   "ULG - Ultras Lechia Gdańsk",
   "Ultras Lechia Gdańsk"
  ],
  "chuligani": [
   "CHWM - Chuligani Wolnego Miasta",
   "Młode Orły"
  ],
  "zgody": [
   "Śląsk Wrocław",
   "Gryf Słupsk",
   "Stomil Olsztyn (układ)",
   "Raków Częstochowa (układ)",
   "Raków Częstochowa",
   "Stomil Olsztyn"
  ],
  "flagi": [
   "Lwy Północy"
  ],
  "fanklub": [
   "FANKLUB Anglia",
   "FANKLUB Bytów",
   "FANKLUB Chojnice",
   "FANKLUB Czersk",
   "FANKLUB Dzierzgoń",
   "FANKLUB Kartuzy",
   "FANKLUB Kościerzyna",
   "FANKLUB Lębork",
   "FANKLUB Malbork",
   "FANKLUB Miłobądz",
   "FANKLUB Mława",
   "FANKLUB Nowe nad Wisłą",
   "FANKLUB Nowy Dwór Gdański",
   "FANKLUB Nowy Targ",
   "FANKLUB Pelplin",
   "FANKLUB Pisz",
   "FANKLUB Pruszcz Gdański",
   "FANKLUB Pszczółki",
   "FANKLUB Sierakowice",
   "FANKLUB Skarszewy",
   "FANKLUB Smętowo",
   "FANKLUB Sopot",
   "FANKLUB Starogard Gdański",
   "FANKLUB Sztum",
   "FANKLUB Tczew",
   "FANKLUB Zblewo"
  ],
  "kosy": [
   "Arka Gdynia",
   "Cracovia",
   "Lech Poznań",
   "Elana Toruń",
   "Widzew Łódź",
   "Ruch Chorzów",
   "Pogoń Szczecin",
   "Gryf Wejherowo",
   "Gwardia Koszalin",
   "Jagiellonia Białystok",
   "Kaszubia Kościerzyna",
   "Legia Warszawa",
   "Motor Lublin",
   "Wisła Kraków",
   "Zagłębie Lubin",
   "Zawisza Bydgoszcz",
   "Olimpia Elbląg",
   "Polonia Bytom",
   "GKS Katowice",
   "Górnik Zabrze"
  ]
 },
 "Arka Gdynia": {
  "trybuna": [
   "Górka"
  ],
  "ultras": [
   "Ultras Arka Gdynia"
  ],
  "chuligani": [
   "HFA (Hooligans From Arka)",
   "Młoda Arka"
  ],
  "zgody": [
   "Cracovia",
   "Lech Poznań",
   "Polonia Bytom",
   "Zagłębie Lubin",
   "KSZO Ostrowiec Świętokrzyski",
   "Gwardia Koszalin"
  ],
  "fanklub": [
   "FANKLUB Bolszewo",
   "FANKLUB Bożepole",
   "FANKLUB Braniewo",
   "FANKLUB Chałupy",
   "FANKLUB Człuchów",
   "FANKLUB Czersk",
   "FANKLUB Dzierzgoń",
   "FANKLUB Gniewino",
   "FANKLUB Gościcino",
   "FANKLUB Hel",
   "FANKLUB Jastarnia",
   "FANKLUB Jastrzębia Góra",
   "FANKLUB Jurata",
   "FANKLUB Kartuzy",
   "FANKLUB Karwia",
   "FANKLUB Kępno",
   "FANKLUB Kościerzyna",
   "FANKLUB Krokowa",
   "FANKLUB Kuźnica",
   "FANKLUB Leśniewo",
   "FANKLUB Lubelskie",
   "FANKLUB Mosty",
   "FANKLUB Oberhausen",
   "FANKLUB Osowa",
   "FANKLUB Ostrowo",
   "FANKLUB Prabuty",
   "FANKLUB Przodkowo",
   "FANKLUB Puck",
   "FANKLUB Reda",
   "FANKLUB Rewa",
   "FANKLUB Rozewie",
   "FANKLUB Ruciane Nida",
   "FANKLUB Rumia",
   "FANKLUB Skarszewy",
   "FANKLUB Sopot",
   "FANKLUB Stare Pole",
   "FANKLUB Starogard Gdański",
   "FANKLUB Suchy Dwór",
   "FANKLUB Swarzewo",
   "FANKLUB Szemud",
   "FANKLUB Tczew",
   "FANKLUB Tuchom",
   "FANKLUB Wejherowo",
   "FANKLUB Władysławowo",
   "FANKLUB Żelistrzewo",
   "FANKLUB Żukowo"
  ],
  "kosy": [
   "Lechia Gdańsk",
   "Śląsk Wrocław",
   "Wisła Kraków",
   "Pogoń Szczecin",
   "Zagłębie Sosnowiec",
   "Legia Warszawa",
   "Bałtyk Gdynia",
   "Chojniczanka Chojnice",
   "Gryf Słupsk",
   "Jagiellonia Białystok",
   "Motor Lublin",
   "Pomezania Malbork",
   "Wisła Płock",
   "ŁKS Łódź",
   "Olimpia Elbląg",
   "Stomil Olsztyn",
   "Jeziorak Iława"
  ]
 },
 "Bruk-Bet Termalica Nieciecza": {
  "ultras": [
   "NF'09 - Nieliczni Fanatyczni"
  ],
  "fanklub": [
   "FANKLUB Łęg Tarnowski"
  ]
 },
 "Unia Skierniewice": {
  "ultras": [
   "Unici"
  ],
  "zgody": [
   "Lechia Tomaszów Mazowiecki",
   "Pelikan Łowicz"
  ],
  "kosy": [
   "ŁKS Łódź",
   "Olimpia Grudziądz",
   "Świt Nowy Dwór Mazowiecki",
   "Mazowsze Grójec",
   "Victoria Sulejówek"
  ]
 },
 "Warta Poznań": {
  "ultras": [
   "Ultras Warta"
  ]
 },
 "Podbeskidzie Bielsko-Biała": {
  "ultras": [
   "Wiecznie Młodzi"
  ],
  "fanklub": [
   "FANKLUB Cieszyn",
   "FANKLUB Czechowice-Dziedzice",
   "FANKLUB Cięcina",
   "FANKLUB Jasienica",
   "FANKLUB Skoczów",
   "FANKLUB Kozy",
   "FANKLUB Międzybrodzie Bialskie"
  ],
  "chuligani": [
   "Wiecznie Młodzi"
  ],
  "kosy": [
   "Zagłębie Sosnowiec",
   "BKS Stal Bielsko-Biała",
   "Znicz Pruszków"
  ]
 },
 "Olimpia Grudziądz": {
  "ultras": [
   "BZF'07 - Biało-Zieloni Fanatycy"
  ],
  "chuligani": [
   "ChzM'05 - Chłopcy z Marginesu",
   "GKS Olimpia Hooligans"
  ],
  "zgody": [
   "Wigry Suwałki"
  ],
  "fanklub": [
   "FANKLUB Łasin",
   "FANKLUB Radzyń Chełmiński",
   "FANKLUB Warlubie"
  ],
  "kosy": [
   "Elana Toruń",
   "Olimpia Elbląg",
   "Stomil Olsztyn",
   "Chojniczanka Chojnice",
   "Sparta Brodnica",
   "Legia Chełmża",
   "Rodło Kwidzyn",
   "Unia Skierniewice",
   "Unia Wąbrzeźno",
   "Włocłavia Włocławek",
   "Sokół Ostróda"
  ]
 },
 "Sandecja Nowy Sącz": {
  "ultras": [
   "Young Group'04"
  ],
  "chuligani": [
   "Travel Gang'04",
   "Nowe Pokolenie'07"
  ],
  "zgody": [
   "Cracovia",
   "GKS Tychy",
   "Stal Mielec",
   "Czarni Jasło"
  ],
  "kosy": [
   "Wisła Kraków",
   "Legia Warszawa",
   "Glinik Gorlice",
   "Unia Tarnów",
   "Okocimski KS Brzesko",
   "Wisłoka Dębica",
   "Podhale Nowy Targ"
  ]
 },
 "Podhale Nowy Targ": {
  "chuligani": [
   "Młode Podhale"
  ],
  "kosy": [
   "Sandecja Nowy Sącz",
   "Tarnovia Tarnów",
   "Beskid Andrychów",
   "Okocimski KS Brzesko",
   "Cracovia",
   "Czuwaj Przemyśl",
   "Unia Oświęcim"
  ]
 },
 "Chojniczanka Chojnice": {
  "ultras": [
   "FZGT - Fanatycy z Grodu Tura"
  ],
  "zgody": [
   "KP Starogard Gdański",
   "Gryf Słupsk",
   "Wierzyca Pelplin",
   "Wierzyca Pelplin (układ)"
  ],
  "fanklub": [
   "FANKLUB Brusy",
   "FANKLUB Czersk",
   "FANKLUB Pawłowo"
  ],
  "chuligani": [
   "FZGT - Fanatycy z Grodu Tura"
  ],
  "kosy": [
   "Arka Gdynia",
   "Olimpia Grudziądz",
   "Pogoń Lębork"
  ]
 },
 "Stal Stalowa Wola": {
  "ultras": [
   "Ultras Stalówka"
  ],
  "chuligani": [
   "STF - Stalówka The Firm"
  ],
  "zgody": [
   "GKS Jastrzębie",
   "Łada Biłgoraj",
   "Inter Mediolan – Curva Nord Milano",
   "Inter Mediolan",
   "Stal Rzeszów",
   "Polonia Przemyśl",
   "Inter Mediolan - Curva Nord Milano",
   "Stal Rzeszów (układ)",
   "Polonia Przemyśl (układ)"
  ],
  "fanklub": [
   "FANKLUB Janów Lubelski",
   "FANKLUB Modliborzyce",
   "FANKLUB Krzeszów",
   "FANKLUB Nisko",
   "FANKLUB Nowa Dęba",
   "FANKLUB Żabno",
   "FANKLUB Zarzecze"
  ],
  "kosy": [
   "Motor Lublin",
   "Korona Kielce",
   "KSZO Ostrowiec Świętokrzyski",
   "Hutnik Kraków",
   "Stal Mielec",
   "Górnik Łęczna",
   "Chełmianka Chełm",
   "Siarka Tarnobrzeg",
   "Hetman Zamość",
   "JKS 1909 Jarosław",
   "Resovia",
   "Wisłoka Dębica"
  ]
 },
 "Hutnik Kraków": {
  "ultras": [
   "Ultras Hutnik'23"
  ],
  "chuligani": [
   "Butchers'98",
   "Fighters",
   "Warriors'01"
  ],
  "fanklub": [
   "FANKLUB Igołomia & Pobiednik",
   "FANKLUB Szczyrzyc",
   "FANKLUB Górale"
  ],
  "zgody": [
   "Stomil Olsztyn",
   "Wisła Płock",
   "GKS Bełchatów",
   "1. FC Magdeburg",
   "Stomil Olsztyn (układ)",
   "Wisła Płock (układ)",
   "GKS Bełchatów (układ)",
   "FC Magdeburg (układ)"
  ],
  "kosy": [
   "Wisła Kraków",
   "Unia Tarnów",
   "Stal Stalowa Wola",
   "Cracovia",
   "Polonia Przemyśl",
   "KSZO Ostrowiec Świętokrzyski",
   "Korona Kielce",
   "Resovia"
  ]
 },
 "Resovia": {
  "ultras": [
   "Ultras Sovia Group"
  ],
  "chuligani": [
   "Leśne Ludki"
  ],
  "fanklub": [
   "FANKLUB Boguchwała",
   "FANKLUB Głogów Małopolski",
   "FANKLUB Malawa",
   "FANKLUB Trzeboś",
   "FANKLUB Świlcza",
   "FANKLUB Brzozów",
   "FANKLUB Sędziszów Małopolski",
   "FANKLUB Łańcut"
  ],
  "zgody": [
   "Stal Sanok",
   "Spartacus Nyíregyháza",
   "Stal Sanok (układ)",
   "Spartacus Nyíregyháza (układ)"
  ],
  "kosy": [
   "Stal Rzeszów",
   "Karpaty Krosno",
   "Stal Stalowa Wola",
   "Widzew Łódź",
   "Ruch Chorzów",
   "Elana Toruń",
   "Polonia Przemyśl",
   "Hutnik Kraków",
   "Radomiak Radom"
  ]
 },
 "Górnik Łęczna": {
  "ultras": [
   "Eastsiders'04"
  ],
  "zgody": [
   "Chełmianka Chełm"
  ],
  "fanklub": [
   "FANKLUB Lubartów",
   "FANKLUB Milejów"
  ],
  "kosy": [
   "Avia Świdnik",
   "Stal Stalowa Wola",
   "Podlasie Biała Podlaska",
   "Pogoń Siedlce"
  ]
 },
 "Znicz Pruszków": {
  "ultras": [
   "Pruszkowscy Fanatycy"
  ],
  "zgody": [
   "Pogoń Grodzisk Mazowiecki",
   "Ursus Warszawa",
   "GLKS Nadarzyn"
  ],
  "kosy": [
   "Polonia Warszawa",
   "Wisła Płock",
   "Podbeskidzie Bielsko-Biała"
  ]
 },
 "GKS Tychy": {
  "ultras": [
   "TNG'03 - Tyszanie Net Group"
  ],
  "chuligani": [
   "YRH – Young Rats Hooligans",
   "YRH - Young Rats Hooligans"
  ],
  "zgody": [
   "Cracovia",
   "ŁKS Łódź",
   "Górnik Wałbrzych",
   "Sandecja Nowy Sącz",
   "Zawisza Bydgoszcz"
  ],
  "fanklub": [
   "FANKLUB Bieruń",
   "FANKLUB Bojszowy",
   "FANKLUB Piasek",
   "FANKLUB Wola"
  ],
  "kosy": [
   "GKS Katowice",
   "Górnik Zabrze",
   "Ruch Chorzów",
   "Zagłębie Sosnowiec",
   "BKS Stal Bielsko-Biała",
   "Widzew Łódź",
   "Wisła Kraków",
   "Legia Warszawa",
   "Radomiak Radom"
  ]
 },
 "Zawisza Bydgoszcz": {
  "ultras": [
   "WKS'10 – Wysokiej Klasy Specjaliści",
   "WKS'10 - Wysokiej Klasy Specjaliści"
  ],
  "chuligani": [
   "Bydgoscy Chuligani"
  ],
  "zgody": [
   "ŁKS Łódź",
   "GKS Tychy",
   "Zagłębie Lubin",
   "Górnik Wałbrzych",
   "Pogoń Lębork"
  ],
  "fanklub": [
   "FANKLUB Barcin",
   "FANKLUB Chełmno",
   "FANKLUB Inowrocław",
   "FANKLUB Janikowo",
   "FANKLUB Kruszwica",
   "FANKLUB Mogilno",
   "FANKLUB Nakło",
   "FANKLUB Pruszcz Pomorski",
   "FANKLUB Potulice",
   "FANKLUB Tuchola",
   "FANKLUB Świecie",
   "FANKLUB Osiek n/Not"
  ],
  "kosy": [
   "Elana Toruń",
   "Widzew Łódź",
   "Polonia Bydgoszcz",
   "Ruch Chorzów",
   "Wisła Kraków",
   "GKM Grudziądz",
   "Legia Warszawa",
   "Lechia Gdańsk",
   "Gryf Słupsk",
   "KP Starogard Gdański",
   "Legia Chełmża",
   "Unia Wąbrzeźno",
   "Wisła Płock",
   "Stomil Olsztyn"
  ]
 },
 "Lechia Zielona Góra": {
  "ultras": [
   "Ultras Lechia"
  ],
  "kosy": [
   "Carina Gubin"
  ]
 },
 "Avia Świdnik": {
  "ultras": [
   "Ultras Lotnicy"
  ],
  "chuligani": [
   "Naughty By Nature"
  ],
  "zgody": [
   "Łada Biłgoraj"
  ],
  "kosy": [
   "Motor Lublin",
   "Górnik Łęczna",
   "Chełmianka Chełm",
   "Orlęta Radzyń Podlaski",
   "Hetman Zamość"
  ]
 },
 "Elana Toruń": {
  "ultras": [
   "Ultras Elana Toruń",
   "Zorganizowana Grupa Kibolska"
  ],
  "chuligani": [
   "GTW - Grupa Trzymająca Władzę"
  ],
  "zgody": [
   "Widzew Łódź",
   "KS Myszków",
   "KKS 1925 Kalisz"
  ],
  "fanklub": [
   "FANKLUB Aleksandrów Kujawski",
   "FANKLUB Ciechocinek",
   "FANKLUB Gniewkowo",
   "FANKLUB Golub-Dobrzyń",
   "FANKLUB Kowalewo Pomorskie",
   "FANKLUB Lubicz",
   "FANKLUB Ostaszewo",
   "FANKLUB Obrowo",
   "FANKLUB Wąbrzeźno",
   "Fan Club Gniewkowo"
  ],
  "kosy": [
   "Apator Toruń",
   "Zawisza Bydgoszcz",
   "Lechia Gdańsk",
   "ŁKS Łódź",
   "Motor Lublin",
   "Goplania Inowrocław",
   "Górnik Zabrze",
   "Kujawiak Kowal",
   "Lech Poznań",
   "Legia Chełmża",
   "Miedź Legnica",
   "Olimpia Grudziądz",
   "Polonia Bydgoszcz",
   "Raków Częstochowa",
   "Resovia",
   "Sparta Brodnica",
   "Włocłavia Włocławek",
   "Zagłębie Lubin"
  ]
 },
 "Bałtyk Gdynia": {
  "ultras": [
   "Ultras Bałtyk Gdynia"
  ],
  "chuligani": [
   "Odczuwalni'18"
  ],
  "kosy": [
   "Arka Gdynia",
   "Kaszubia Kościerzyna"
  ]
 },
 "Gryf Słupsk": {
  "ultras": [
   "Ultras Gryf Słupsk"
  ],
  "chuligani": [
   "Tricolores Hooligans Gryf",
   "Młoda Wiara Gryfa"
  ],
  "zgody": [
   "Lechia Gdańsk",
   "Chojniczanka Chojnice",
   "Pomezania Malbork",
   "Kotwica Kołobrzeg"
  ],
  "kosy": [
   "Arka Gdynia",
   "Gryf Wejherowo",
   "Gwardia Koszalin",
   "KKS 1925 Kalisz",
   "Pogoń Lębork",
   "Pogoń Szczecin",
   "Zawisza Bydgoszcz"
  ]
 },
 "Kotwica Kołobrzeg": {
  "ultras": [
   "UK'10 - Ultras Kotwa"
  ],
  "chuligani": [
   "Młoda Kotwica"
  ],
  "zgody": [
   "Sokół Karlino",
   "KKS 1925 Kalisz",
   "Gryf Słupsk"
  ],
  "kosy": [
   "Błękitni Stargard",
   "Flota Świnoujście",
   "Gryf Wejherowo",
   "Gwardia Koszalin"
  ]
 },
 "Unia Tarnów": {
  "ultras": [
   "WBF - White Blue Fans",
   "Mafia"
  ],
  "chuligani": [
   "UTSC - Unia Tarnów Sportowe Charaktery"
  ],
  "zgody": [
   "ETO Győr",
   "Wisła Kraków"
  ],
  "fanklub": [
   "FANKLUB Dębno&Sufczyn",
   "FANKLUB Wojnicz",
   "FANKLUB Arkadia Olszyny",
   "FANKLUB Radłów",
   "FANKLUB Zakliczyn",
   "FANKLUB Tuchów"
  ],
  "kosy": [
   "Beskid Andrychów",
   "Cracovia",
   "Hutnik Kraków",
   "Miedź Legnica",
   "Sandecja Nowy Sącz",
   "Tarnovia Tarnów",
   "Wisłoka Dębica"
  ]
 },
 "Gwardia Koszalin": {
  "ultras": [
   "Ultras Gwardia Koszalin"
  ],
  "chuligani": [
   "Ekipa Młodzieżowa'99",
   "Malefactors Brigade"
  ],
  "zgody": [
   "Arka Gdynia",
   "Gryf Wejherowo"
  ],
  "kosy": [
   "Energetyk Gryfino",
   "Flota Świnoujście",
   "Gryf Słupsk",
   "Kotwica Kołobrzeg",
   "Lechia Gdańsk",
   "Odra Chojna",
   "Pogoń Lębork",
   "Pogoń Szczecin",
   "Sokół Karlino"
  ]
 },
 "Pogoń Lębork": {
  "ultras": [
   "UPL - Ultras Pogoń Lębork"
  ],
  "chuligani": [
   "ChML - Chuligani Miasta Lwa"
  ],
  "zgody": [
   "Zawisza Bydgoszcz"
  ],
  "fanklub": [
   "FANKLUB Bożepole",
   "FANKLUB Charbrowo",
   "FANKLUB Cewice",
   "FANKLUB Krępa Kaszubska",
   "FANKLUB Nowa Wieś Lęborska"
  ],
  "kosy": [
   "Chojniczanka Chojnice",
   "Gryf Słupsk",
   "Gryf Wejherowo",
   "Gwardia Koszalin"
  ]
 },
 "Polonia Bydgoszcz": {
  "ultras": [
   "UFP - Ultras From Polonia"
  ],
  "chuligani": [
   "WRB - White Red Brothers"
  ],
  "zgody": [
   "GKM Grudziądz",
   "Stomil Olsztyn"
  ],
  "fanklub": [
   "FANKLUB Solec Kujawski",
   "FANKLUB Pakość",
   "FANKLUB Tuchola"
  ],
  "kosy": [
   "Elana Toruń",
   "Goplania Inowrocław",
   "Kujawiak Kowal",
   "Widzew Łódź",
   "Włocłavia Włocławek",
   "Zawisza Bydgoszcz",
   "ŁKS Łódź"
  ]
 },
 "Flota Świnoujście": {
  "ultras": [
   "Młodzi Fanatycy",
   "West Coast",
   "Wyspiarze on Tour",
   "Forza Flota",
   "Piraci z Wyspy Uznam"
  ],
  "chuligani": [
   "Brygada Uznam"
  ],
  "zgody": [
   "Falubaz Zielona Góra"
  ],
  "fanklub": [
   "FANKLUB Dziwnów",
   "FANKLUB Kamień Pomorski",
   "FANKLUB Międzyzdroje",
   "FANKLUB Rewal",
   "FANKLUB Wolin"
  ],
  "kosy": [
   "Kotwica Kołobrzeg",
   "Gwardia Koszalin",
   "Gryf Wejherowo",
   "Energetyk Gryfino",
   "Odra Chojna",
   "Stilon Gorzów Wielkopolski"
  ]
 },
 "Pomezania Malbork": {
  "ultras": [
   "Malborscy Lechiści"
  ],
  "zgody": [
   "Gryf Słupsk"
  ],
  "kosy": [
   "Arka Gdynia",
   "Rodło Kwidzyn",
   "Olimpia Elbląg"
  ]
 },
 "Tarnovia Tarnów": {
  "chuligani": [
   "Młodzi Gniewni"
  ],
  "zgody": [
   "Cracovia"
  ],
  "kosy": [
   "Glinik Gorlice",
   "Okocimski KS Brzesko",
   "Podhale Nowy Targ",
   "Unia Tarnów",
   "Wisła Kraków"
  ]
 },
 "Goplania Inowrocław": {
  "ultras": [
   "UG'24 - Ultras Goplania"
  ],
  "chuligani": [
   "Sportowa Goplania"
  ],
  "kosy": [
   "Elana Toruń",
   "Legia Chełmża",
   "Polonia Bydgoszcz",
   "Sparta Brodnica",
   "Unia Gniewkowo",
   "Unia Wąbrzeźno"
  ]
 },
 "Energetyk Gryfino": {
  "ultras": [
   "FZR '14 - Fanatycy znad Regalicy"
  ],
  "zgody": [
   "Odra Chojna",
   "Pogoń Barlinek",
   "Dąb Dębno"
  ],
  "kosy": [
   "Błękitni Stargard",
   "Flota Świnoujście",
   "Gwardia Koszalin"
  ]
 },
 "Sparta Brodnica": {
  "ultras": [
   "Gialloneri"
  ],
  "chuligani": [
   "Spartanie"
  ],
  "zgody": [
   "Legia Chełmża",
   "Mławska Wiara"
  ],
  "kosy": [
   "Elana Toruń",
   "Goplania Inowrocław",
   "Kujawiak Kowal",
   "Olimpia Grudziądz",
   "Unia Wąbrzeźno",
   "Włocłavia Włocławek",
   "Drwęca Nowe Miasto Lubawskie"
  ]
 },
 "Włocłavia Włocławek": {
  "ultras": [
   "Ultras Włocłavia Group"
  ],
  "chuligani": [
   "GOC'04 - Gang of Chopina"
  ],
  "zgody": [
   "Kujawiak Kowal"
  ],
  "kosy": [
   "Elana Toruń",
   "Legia Chełmża",
   "Olimpia Grudziądz",
   "Polonia Bydgoszcz",
   "Ruch Chorzów",
   "Sparta Brodnica",
   "Widzew Łódź",
   "Wisła Kraków"
  ]
 },
 "GKM Grudziądz": {
  "ultras": [
   "YBB'13 - Yellow Blue Brothers"
  ],
  "chuligani": [
   "Młody GKM"
  ],
  "zgody": [
   "Polonia Bydgoszcz"
  ],
  "fanklub": [
   "FANKLUB Mokre",
   "FANKLUB Nicwałd",
   "FANKLUB Wałdowo Szlacheckie",
   "FANKLUB Węgrowo"
  ]
 },
 "Legia Chełmża": {
  "ultras": [
   "MB'13 - Młoda Banda"
  ],
  "chuligani": [
   "Dynamit Boys'05"
  ],
  "zgody": [
   "Sparta Brodnica"
  ],
  "kosy": [
   "Elana Toruń",
   "Goplania Inowrocław",
   "Kujawiak Kowal",
   "Olimpia Grudziądz",
   "Unia Gniewkowo",
   "Unia Wąbrzeźno",
   "Włocłavia Włocławek",
   "Zawisza Bydgoszcz"
  ]
 },
 "Unia Wąbrzeźno": {
  "chuligani": [
   "Młoda Unia"
  ],
  "kosy": [
   "Chełminianka Chełmno",
   "Goplania Inowrocław",
   "Kujawiak Kowal",
   "Legia Chełmża",
   "Olimpia Grudziądz",
   "Sparta Brodnica",
   "Zawisza Bydgoszcz"
  ]
 },
 "Kujawiak Kowal": {
  "ultras": [
   "KF'18 - Kowal Fans"
  ],
  "zgody": [
   "Start Pruszcz",
   "Włocłavia Włocławek"
  ],
  "kosy": [
   "Elana Toruń",
   "Legia Chełmża",
   "Polonia Bydgoszcz",
   "Sparta Brodnica",
   "Unia Gniewkowo",
   "Unia Wąbrzeźno",
   "Wisła Dobrzyń nad Wisłą"
  ]
 },
 "Czarni Słupsk": {
  "ultras": [
   "Słupska Elita"
  ],
  "chuligani": [
   "Młoda Banda"
  ]
 },
 "Kaszubia Kościerzyna": {
  "ultras": [
   "UKK"
  ],
  "chuligani": [
   "Młoda Kaszubia",
   "Stara Gwardia"
  ],
  "zgody": [
   "Gryf Wejherowo",
   "Wisła Tczew",
   "Orkan Rumia MKS"
  ],
  "fanklub": [
   "FC Kościerzyna (Arka Gdynia)"
  ],
  "kosy": [
   "Bałtyk Gdynia",
   "Bytovia Bytów",
   "Cartusia Kartuzy",
   "KP Starogard Gdański",
   "Lechia Gdańsk"
  ]
 },
 "KP Starogard Gdański": {
  "ultras": [
   "KF'18 - Kocborowo Fans"
  ],
  "zgody": [
   "Chojniczanka Chojnice"
  ],
  "kosy": [
   "Kaszubia Kościerzyna",
   "Zawisza Bydgoszcz"
  ]
 },
 "Odra Chojna": {
  "ultras": [
   "FCh'92",
   "Ultras Odra Chojna'22"
  ],
  "zgody": [
   "Energetyk Gryfino",
   "Dąb Dębno",
   "Pogoń Barlinek"
  ],
  "kosy": [
   "Flota Świnoujście",
   "Gwardia Koszalin",
   "Olimp Złocieniec"
  ]
 },
 "Apator Toruń": {
  "ultras": [
   "Ultra Familiares'08"
  ],
  "chuligani": [
   "UF'08 – Młody Apator 2016"
  ],
  "fanklub": [
   "FANKLUB Lubicz",
   "FANKLUB Łubianka",
   "FANKLUB Łysomice",
   "FANKLUB Pigża",
   "FANKLUB Osiek"
  ]
 },
 "Glinik Gorlice": {
  "ultras": [
   "Glinik Fans'04"
  ],
  "chuligani": [
   "Młoda Banda'19"
  ],
  "zgody": [
   "Karpaty Krosno"
  ],
  "kosy": [
   "Beskid Andrychów",
   "Cracovia",
   "Okocimski KS Brzesko",
   "Sandecja Nowy Sącz",
   "Tarnovia Tarnów"
  ]
 },
 "Beskid Andrychów": {
  "ultras": [
   "Ultras Beskid'08"
  ],
  "zgody": [
   "Energie Cottbus"
  ],
  "kosy": [
   "Glinik Gorlice",
   "Podhale Nowy Targ",
   "Unia Oświęcim",
   "Unia Tarnów",
   "Wisła Kraków"
  ]
 },
 "Unia Oświęcim": {
  "ultras": [
   "Ultras Unia'08"
  ],
  "chuligani": [
   "Unia Oświęcim Hooligans"
  ],
  "zgody": [
   "Hejnał Kęty"
  ],
  "kosy": [
   "Beskid Andrychów",
   "Podhale Nowy Targ"
  ]
 },
 "Rodło Kwidzyn": {
  "ultras": [
   "Ultras Rodło"
  ],
  "kosy": [
   "Olimpia Grudziądz",
   "Pogoń Prabuty",
   "Pomezania Malbork"
  ]
 },
 "Gryf Wejherowo": {
  "zgody": [
   "Kaszubia Kościerzyna",
   "Orkan Rumia",
   "Gwardia Koszalin",
   "Polonia Bytom",
   "Orkan Rumia MKS"
  ],
  "kosy": [
   "Flota Świnoujście",
   "Gryf Słupsk",
   "Kotwica Kołobrzeg",
   "Lechia Gdańsk",
   "Pogoń Lębork"
  ]
 },
 "Orkan Rumia MKS": {
  "ultras": [
   "Fanatycy Orkana"
  ],
  "fanklub": [
   "Fan Club Arki Gdynia - Rumia"
  ],
  "zgody": [
   "Gryf Wejherowo",
   "Kaszubia Kościerzyna"
  ]
 },
 "Start Pruszcz": {
  "zgody": [
   "Kujawiak Kowal"
  ]
 },
 "Sokół Karlino": {
  "ultras": [
   "Ultras Karlino'11"
  ],
  "zgody": [
   "Kotwica Kołobrzeg",
   "Drawa Drawsko Pomorskie"
  ],
  "kosy": [
   "Gwardia Koszalin",
   "Iskra Białogard"
  ]
 },
 "Dąb Dębno": {
  "zgody": [
   "Energetyk Gryfino",
   "Odra Chojna",
   "Pogoń Barlinek"
  ]
 },
 "Pogoń Barlinek": {
  "ultras": [
   "Barlineccy Fanatycy"
  ],
  "zgody": [
   "Energetyk Gryfino",
   "Odra Chojna",
   "Dąb Dębno"
  ]
 },
 "Rega Trzebiatów": {
  "ultras": [
   "MO '14",
   "Fanatycy Regi"
  ]
 },
 "Okocimski KS Brzesko": {
  "ultras": [
   "BF - Brzescy Fanatycy"
  ],
  "kosy": [
   "Cracovia",
   "Glinik Gorlice",
   "Podhale Nowy Targ",
   "Sandecja Nowy Sącz",
   "Tarnovia Tarnów"
  ],
  "fanklub": [
   "FANKLUB Jasień"
  ]
 },
 "Victoria 1918 Jaworzno": {
  "ultras": [
   "LSM - Lepsza Strona Miasta"
  ],
  "zgody": [
   "Fablok Chrzanów",
   "MKS Fablok Chrzanów"
  ]
 },
 "MKS Fablok Chrzanów": {
  "zgody": [
   "Victoria Jaworzno",
   "Victoria 1918 Jaworzno"
  ]
 },
 "Garbarnia Kraków": {
  "zgody": [
   "Puszcza Niepołomice"
  ]
 },
 "Pogoń Miechów": {
  "ultras": [
   "Pogoń Ultras'17"
  ],
  "zgody": [
   "Spartak Wielkanoc"
  ]
 },
 "KKS 1925 Kalisz": {
  "ultras": [
   "Duma Kalisza"
  ],
  "zgody": [
   "Elana Toruń",
   "Kotwica Kołobrzeg",
   "Widzew Łódź"
  ],
  "kosy": [
   "Lech Poznań",
   "Górnik Konin",
   "Motor Lublin",
   "Ostrovia Ostrów Wielkopolski",
   "Astra Krotoszyn",
   "Gryf Słupsk"
  ]
 },
 "Bytovia Bytów": {
  "ultras": [
   "Bytoviacy",
   "Ultras Bytovia",
   "Czarne Wilki"
  ],
  "fanklub": [
   "FANKLUB Studzienice"
  ],
  "zgody": [
   "Czarni Słupsk"
  ],
  "kosy": [
   "Kaszubia Kościerzyna"
  ]
 },
 "Cartusia Kartuzy": {
  "ultras": [
   "Kaszubscy Patrioci",
   "Duma Kaszub"
  ],
  "kosy": [
   "Kaszubia Kościerzyna"
  ]
 },
 "Start Miastko": {
  "ultras": [
   "Władcy Powiatu",
   "Miastko Kocha Start"
  ],
  "zgody": [
   "KS Bytów"
  ]
 },
 "Piast Człuchów": {
  "zgody": [
   "Gwardia Koszalin",
   "Myśliwiec Tuchomie"
  ],
  "kosy": [
   "Gryf Słupsk",
   "Brda Przechlewo"
  ]
 },
 "Unia Gniewkowo": {
  "zgody": [],
  "kosy": [
   "Sparta Brodnica",
   "Kujawiak Kowal",
   "Legia Chełmża",
   "Goplania Inowrocław"
  ]
 },
 "Noteć Czarnków": {
  "zgody": [
   "Nielba Wągrowiec",
   "Polonia Chodzież"
  ],
  "kosy": [
   "Jarota Jarocin"
  ]
 },
 "Błękitni Stargard": {
  "kosy": [
   "Energetyk Gryfino",
   "Kotwica Kołobrzeg"
  ]
 },
 "Iskra Białogard": {
  "kosy": [
   "Sokół Karlino"
  ]
 },
 "Sparta Gryfice": {
  "ultras": [
   "This is Sparta"
  ],
  "zgody": [
   "Pomorzanin Nowogard"
  ],
  "kosy": [
   "Rega Trzebiatów",
   "Mewa Resko"
  ]
 },
 "Olimp Złocieniec": {
  "ultras": [
   "Młody Olimp",
   "Fanatycy",
   "MKS Olimp Złocieniec",
   "UO"
  ],
  "kosy": [
   "Drawa Drawsko Pomorskie",
   "Odra Chojna"
  ]
 },
 "Kolejarz Stróże": {
  "zgody": [
   "Glinik Gorlice"
  ],
  "kosy": [
   "Grybovia Grybów",
   "Tarnovia Tarnów"
  ]
 },
 "Limanovia Limanowa": {
  "kosy": [
   "Sokół Słopnice"
  ]
 },
 "Chełmianka Chełm": {
  "chuligani": [
   "YFC'06 - Young Fighters Clan'06",
   "Robotnicy",
   "Spiryt Brigade"
  ],
  "zgody": [
   "Górnik Łęczna"
  ],
  "kosy": [
   "Hetman Zamość",
   "Avia Świdnik",
   "Łada Biłgoraj",
   "Widzew Łódź",
   "Unia Hrubieszów",
   "Podlasie Biała Podlaska",
   "Pogoń Siedlce",
   "Stal Stalowa Wola"
  ],
  "fanklub": [
   "FANKLUB Krasnystaw"
  ]
 },
 "KSZO Ostrowiec Świętokrzyski": {
  "chuligani": [
   "Świętokrzyscy Rozbójnicy"
  ],
  "zgody": [
   "Lech Poznań",
   "Arka Gdynia"
  ],
  "kosy": [
   "Korona Kielce",
   "Stal Stalowa Wola",
   "Radomiak Radom",
   "Hutnik Kraków",
   "Naprzód Jędrzejów",
   "Star Starachowice"
  ]
 },
 "Hetman Zamość": {
  "ultras": [
   "Stadionowi Artyści'02"
  ],
  "chuligani": [
   "HWK - Hetman Wielki Koronny"
  ],
  "zgody": [
   "Motor Lublin"
  ],
  "kosy": [
   "Avia Świdnik",
   "Chełmianka Chełm",
   "Łada Biłgoraj",
   "Stal Stalowa Wola",
   "Podlasie Biała Podlaska"
  ],
  "fanklub": [
   "FANKLUB Szczebrzeszyn",
   "FANKLUB Tomaszów Lubelski"
  ]
 },
 "Czarni Połaniec": {
  "kosy": [
   "Pogoń Staszów",
   "Star Starachowice"
  ]
 },
 "Wisłoka Dębica": {
  "ultras": [
   "Ultras Wisłoka"
  ],
  "chuligani": [
   "ŁHE'03 - Łowcy Hordy Edwarda"
  ],
  "zgody": [
   "Górnik Zabrze",
   "ROW Rybnik",
   "Siarka Tarnobrzeg"
  ],
  "kosy": [
   "Stal Mielec",
   "Unia Tarnów",
   "Stal Rzeszów",
   "Stal Stalowa Wola",
   "Igloopol Dębica",
   "JKS 1909 Jarosław",
   "Sandecja Nowy Sącz"
  ],
  "fanklub": [
   "FANKLUB Pustków",
   "FANKLUB Bobrowa"
  ]
 },
 "Naprzód Jędrzejów": {
  "chuligani": [
   "MG'99 - Młodzi Gniewni",
   "MW'23 - Młoda Wiara"
  ],
  "kosy": [
   "KSZO Ostrowiec Świętokrzyski",
   "Star Starachowice",
   "Granat Skarżysko-Kamienna",
   "Pogoń Staszów"
  ],
  "zgody": [
   "Korona Kielce"
  ]
 },
 "Siarka Tarnobrzeg": {
  "ultras": [
   "Ultras Group Siarka"
  ],
  "chuligani": [
   "STH - Siarka Tarnobrzeg Hooligans"
  ],
  "zgody": [
   "Wisła Sandomierz",
   "Wisłoka Dębica"
  ],
  "kosy": [
   "Stal Stalowa Wola",
   "Stal Mielec",
   "Stal Rzeszów",
   "Karpaty Krosno",
   "Podlasie Biała Podlaska"
  ],
  "fanklub": [
   "FANKLUB Cmolas",
   "FANKLUB Kolbuszowa",
   "FANKLUB Majdan Królewski",
   "FANKLUB Osiek"
  ]
 },
 "Star Starachowice": {
  "ultras": [
   "Wiara Stara"
  ],
  "chuligani": [
   "Młody Star"
  ],
  "zgody": [
   "Granat Skarżysko-Kamienna"
  ],
  "kosy": [
   "Korona Kielce",
   "KSZO Ostrowiec Świętokrzyski",
   "Wisła Sandomierz",
   "Czarni Połaniec",
   "Naprzód Jędrzejów"
  ]
 },
 "JKS 1909 Jarosław": {
  "ultras": [
   "Black Blue Ultras"
  ],
  "chuligani": [
   "Świrlandia",
   "Młody JKS"
  ],
  "zgody": [
   "GKS Katowice",
   "Unia Nowa Sarzyna"
  ],
  "kosy": [
   "Czuwaj Przemyśl",
   "Wisłoka Dębica",
   "Stal Rzeszów",
   "Stal Stalowa Wola",
   "Stal Mielec",
   "Polonia Przemyśl"
  ]
 },
 "Podlasie Biała Podlaska": {
  "chuligani": [
   "Wschodnie Charaktery"
  ],
  "zgody": [
   "Warszawianka Warszawa",
   "Pogoń Siedlce",
   "Mazovia Mińsk Mazowiecki"
  ],
  "kosy": [
   "Orlęta Radzyń Podlaski",
   "Chełmianka Chełm",
   "Motor Lublin",
   "Siarka Tarnobrzeg",
   "Hetman Zamość",
   "Górnik Łęczna",
   "Orlęta Łuków"
  ],
  "fanklub": [
   "FANKLUB Chotyłów",
   "FANKLUB Komarno",
   "FANKLUB Leśna Podlaska",
   "FANKLUB Swory",
   "FANKLUB Sokołów Podlaski",
   "FANKLUB Łomazy",
   "FANKLUB Terespol"
  ]
 },
 "Stomil Olsztyn": {
  "ultras": [
   "Stowarzyszenie Kibiców OKS Stomil Olsztyn",
   "Stomilowcy Olsztyn",
   "Ultras Hałastra",
   "Socios Stomil"
  ],
  "zgody": [
   "Polonia Bydgoszcz",
   "Wisła Płock",
   "Lechia Gdańsk",
   "Hutnik Kraków",
   "ŁKS Łomża",
   "Raków Częstochowa"
  ],
  "kosy": [
   "Olimpia Elbląg",
   "Legia Warszawa",
   "Widzew Łódź",
   "Arka Gdynia",
   "Zawisza Bydgoszcz",
   "Jagiellonia Białystok",
   "Górnik Zabrze",
   "Olimpia Grudziądz",
   "Wigry Suwałki",
   "Granica Kętrzyn",
   "MKS Mazur Ełk"
  ],
  "fanklub": [
   "FANKLUB Barczewo",
   "FANKLUB Bartoszyce",
   "FANKLUB Biskupiec",
   "FANKLUB Dobre Miasto",
   "FANKLUB Dywity",
   "FANKLUB Działdowo",
   "FANKLUB Gietrzwałd",
   "FANKLUB Giżycko",
   "FANKLUB Jonkowo",
   "FANKLUB Kieźliny",
   "FANKLUB Lidzbark Warmiński",
   "FANKLUB Miłakowo",
   "FANKLUB Morąg",
   "FANKLUB Mrągowo",
   "FANKLUB Nidzica",
   "FANKLUB Nikielkowo",
   "FANKLUB Olsztynek",
   "FANKLUB Orneta",
   "FANKLUB Ostróda",
   "FANKLUB Pasłęk",
   "FANKLUB Pasym",
   "FANKLUB Radomsko",
   "FANKLUB Samborowo",
   "FANKLUB Spychowo",
   "FANKLUB Stawiguda",
   "FANKLUB Szczytno",
   "FANKLUB Uniszewo",
   "FANKLUB Wielbark",
   "FCUK"
  ],
  "trybuna": [
   "Sektor I trybuny krytej – młyn"
  ],
  "flagi": [
   "Stomilowcy",
   "Duma Warmii",
   "Stomil nigdy nie zginie",
   "Ratujmy nasz Stomil"
  ],
  "chuligani": [
   "Denaturat Boys",
   "HooliGang'00"
  ]
 },
 "Olimpia Elbląg": {
  "ultras": [
   "Stowarzyszenie Kibiców Olimpii Elbląg „776 p.n.e.”",
   "Ultras SMG'06",
   "EZF '16",
   "Ultras Olimpia"
  ],
  "zgody": [
   "Legia Warszawa",
   "Zagłębie Sosnowiec"
  ],
  "kosy": [
   "Stomil Olsztyn",
   "Jeziorak Iława",
   "Arka Gdynia",
   "Widzew Łódź",
   "Ruch Chorzów",
   "Śląsk Wrocław",
   "Lechia Gdańsk",
   "Wisła Płock",
   "Olimpia Grudziądz",
   "Pomezania Malbork",
   "ŁKS Łomża",
   "MKS Mazur Ełk",
   "Sokół Ostróda"
  ],
  "fanklub": [
   "FANKLUB Braniewo",
   "FANKLUB Frombork",
   "FANKLUB Gronowo Elbląskie",
   "FANKLUB Jegłownik",
   "FANKLUB Markusy",
   "FANKLUB Pasłęk",
   "FANKLUB Pieniężno",
   "FANKLUB Rychliki"
  ],
  "flagi": [
   "Młoda Olimpia Elbląg",
   "776 p.n.e.",
   "Olimpijczycy"
  ],
  "chuligani": [
   "Bully Boys'98"
  ]
 },
 "Wigry Suwałki": {
  "ultras": [
   "Vis Maior '99",
   "Blue Boys '22",
   "Lucyfers '04",
   "Lucyfers'04"
  ],
  "zgody": [
   "Granica Kętrzyn",
   "Olimpia Grudziądz"
  ],
  "kosy": [
   "Jagiellonia Białystok",
   "ŁKS Łomża",
   "Sparta Augustów",
   "MKS Mazur Ełk",
   "Stomil Olsztyn",
   "Warmia Grajewo"
  ],
  "fanklub": [
   "FANKLUB Przebród",
   "FANKLUB Gołdap",
   "FANKLUB Olecko"
  ],
  "flagi": [
   "Suwalszczyzna",
   "Fanatycy SKS"
  ],
  "chuligani": [
   "Vis Maior'99"
  ]
 },
 "ŁKS Łomża": {
  "ultras": [
   "Export Boys"
  ],
  "fanklub": [
   "FANKLUB Kolno",
   "FANKLUB Wizna",
   "FANKLUB Piątnica",
   "FANKLUB Śniadowo",
   "FANKLUB Mątwica"
  ],
  "flagi": [
   "Ełkaesiacy'03",
   "Brigade'99",
   "Łomżyca",
   "W jedności siła ŁKS – rodzina"
  ],
  "zgody": [
   "Stomil Olsztyn",
   "Sparta 1951 Szepietowo",
   "FK Voždovac Belgrad"
  ],
  "kosy": [
   "Wigry Suwałki",
   "Olimpia Elbląg",
   "Jagiellonia Białystok",
   "MKS Mazur Ełk",
   "Warmia Grajewo",
   "Granica Kętrzyn"
  ]
 },
 "MKS Mazur Ełk": {
  "ultras": [
   "Ultras Mazur Ełk",
   "Młody Mazur"
  ],
  "flagi": [
   "Jedno miasto, jeden klub!",
   "Mazurowcy"
  ],
  "chuligani": [
   "Młody Mazur"
  ],
  "zgody": [
   "Jagiellonia Białystok",
   "Warmia Grajewo"
  ],
  "kosy": [
   "Wigry Suwałki",
   "Olimpia Elbląg",
   "Stomil Olsztyn",
   "ŁKS Łomża",
   "Sparta Augustów",
   "Granica Kętrzyn",
   "Sokół Ostróda",
   "Mazur Pisz"
  ]
 },
 "Sokół Ostróda": {
  "ultras": [
   "Ultras'11",
   "Ekipa z Pika"
  ],
  "flagi": [
   "Ekipa z Pika"
  ],
  "kosy": [
   "Olimpia Elbląg",
   "MKS Mazur Ełk",
   "Warmia Grajewo",
   "Drwęca Nowe Miasto Lubawskie",
   "Motor Lubawa",
   "Granica Kętrzyn",
   "Olimpia Grudziądz",
   "Mazur Ełk"
  ]
 },
 "Jeziorak Iława": {
  "ultras": [
   "UFJ'06 – Ultras Fans Jeziorak",
   "ZNW - Zdecydowani Na Wszystko",
   "UFJ'06 - Ultras Fans Jeziorak"
  ],
  "flagi": [
   "Jeziorowcy"
  ],
  "chuligani": [
   "ZNW – Zdecydowani Na Wszystko"
  ],
  "kosy": [
   "Olimpia Elbląg",
   "Motor Lubawa",
   "Arka Gdynia",
   "Zatoka Braniewo",
   "Granica Kętrzyn"
  ]
 },
 "Granica Kętrzyn": {
  "flagi": [
   "KKS",
   "AVE KKS!"
  ],
  "zgody": [
   "Wigry Suwałki"
  ],
  "kosy": [
   "Stomil Olsztyn",
   "ŁKS Łomża",
   "MKS Mazur Ełk",
   "Warmia Grajewo",
   "Sokół Ostróda",
   "Jeziorak Iława",
   "Motor Lubawa",
   "Mazur Ełk"
  ]
 },
 "Warmia Grajewo": {
  "ultras": [
   "Fanatycy Warmii"
  ],
  "flagi": [
   "Młoda Warmia"
  ],
  "zgody": [
   "MKS Mazur Ełk",
   "Mazur Ełk"
  ],
  "kosy": [
   "ŁKS Łomża",
   "Wigry Suwałki",
   "Granica Kętrzyn",
   "Sparta Augustów",
   "Sparta 1951 Szepietowo",
   "Sokół Ostróda",
   "Mazur Pisz",
   "Orzeł Kolno",
   "Sparta Szepietowo"
  ]
 },
 "Mazur Pisz": {
  "ultras": [
   "GF – Grupa Fanatyków'04",
   "Młoda Gwardia",
   "GF - Grupa Fanatyków'04"
  ],
  "zgody": [
   "Mławianka Mława"
  ],
  "kosy": [
   "MKS Mazur Ełk",
   "Warmia Grajewo",
   "Znicz Biała Piska",
   "Orlęta Reszel",
   "Mazur Ełk"
  ]
 },
 "Motor Lubawa": {
  "ultras": [
   "Motorowcy"
  ],
  "zgody": [
   "Błękitni Orneta"
  ],
  "kosy": [
   "Sokół Ostróda",
   "Jeziorak Iława",
   "Drwęca Nowe Miasto Lubawskie",
   "Granica Kętrzyn",
   "Zatoka Braniewo",
   "Czarni Olecko"
  ]
 },
 "Drwęca Nowe Miasto Lubawskie": {
  "flagi": [
   "Nowomiejskie Lwy",
   "Klub Sportowy Drwęca"
  ],
  "kosy": [
   "Sokół Ostróda",
   "Motor Lubawa",
   "Sparta Brodnica",
   "Świt Nowy Dwór Mazowiecki"
  ]
 },
 "Orzeł Kolno": {
  "zgody": [
   "KS Śniadowo"
  ],
  "kosy": [
   "Warmia Grajewo",
   "Tur Bielsk Podlaski",
   "Olimpia Zambrów",
   "Ruch Wysokie Mazowieckie",
   "Sparta Augustów"
  ]
 },
 "Mazovia Mińsk Mazowiecki": {
  "ultras": [
   "EP'11",
   "MM'15"
  ],
  "zgody": [
   "Pogoń Siedlce",
   "Podlasie Biała Podlaska"
  ],
  "kosy": [
   "Polonia Warszawa"
  ]
 },
 "Pelikan Łowicz": {
  "ultras": [
   "Pelikan Łowicz 1945 - Duma i Tradycja"
  ],
  "chuligani": [
   "Green Birds"
  ],
  "zgody": [
   "Unia Skierniewice",
   "Lechia Tomaszów Mazowiecki"
  ],
  "kosy": [
   "Świt Nowy Dwór Mazowiecki",
   "Legia Warszawa",
   "Radomiak Radom"
  ]
 },
 "Świt Nowy Dwór Mazowiecki": {
  "ultras": [
   "Ultras Świt"
  ],
  "chuligani": [
   "MKS Stoned Hunters"
  ],
  "kosy": [
   "Drwęca Nowe Miasto Lubawskie",
   "Pelikan Łowicz",
   "Unia Skierniewice",
   "Lechia Tomaszów Mazowiecki",
   "Polonia Warszawa"
  ]
 }
};

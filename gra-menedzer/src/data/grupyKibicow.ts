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
   "FANKLUB Kaźmierz"
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
   "FANKLUB Lubliniec"
  ]
 },
 "Jagiellonia Białystok": {
  "ultras": [
   "UJB – Ultras Jagiellonia Białystok"
  ],
  "zgody": [
   "Mazur Ełk"
  ],
  "flagi": [
   "Dzieci Białegostoku"
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
   "FANKLUB Sokółka"
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
   "Videoton Szekesfehervar"
  ],
  "flagi": [
   "Wieczny Raków"
  ],
  "fanklub": [
   "FANKLUB Herby",
   "FANKLUB Huta Stara B",
   "FANKLUB Radomsko",
   "FANKLUB Rędziny"
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
   "Banik Ostrava"
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
   "FANKLUB Ruda Śląska"
  ]
 },
 "Legia Warszawa": {
  "trybuna": [
   "Żyleta"
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
   "FANKLUB Rawa Mazowiecka"
  ],
  "zgody": [
   "Zagłębie Sosnowiec",
   "Olimpia Elbląg",
   "Radomiak Radom",
   "ADO Den Haag"
  ],
  "flagi": [
   "Sekcja Sympatyków"
  ]
 },
 "Zagłębie Lubin": {
  "ultras": [
   "OCB'03 – Orange City Boys'03"
  ],
  "chuligani": [
   "HZL – Hooligans Zagłębie Lubin"
  ],
  "zgody": [
   "Arka Gdynia",
   "Odra Opole",
   "Zawisza Bydgoszcz"
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
   "FANKLUB Wschowa"
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
   "Stomil Olsztyn"
  ],
  "fanklub": [
   "FANKLUB Drobin",
   "FANKLUB Dobrzyń",
   "FANKLUB Gostynin",
   "FANKLUB Sierpc"
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
   "BFC Dynamo"
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
   "YBH'01 – Young Boys Hooligans"
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
  ]
 },
 "Motor Lublin": {
  "chuligani": [
   "Banda Motor"
  ],
  "zgody": [
   "Śląsk Wrocław",
   "Hetman Zamość",
   "wcześniej układ od 28.04.2018)",
   "Górnik Łęczna"
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
   "FANKLUB Płonki"
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
   "FANKLUB Muszyna"
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
   "DHW'95 – Destroyers Hooligans Widzew"
  ],
  "zgody": [
   "Ruch Chorzów",
   "Elana Toruń"
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
   "FANKLUB Lutomiersk"
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
   "BATE Borysów"
  ],
  "fanklub": [
   "FANKLUB Kleszczów",
   "FANKLUB Rudziniec"
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
   "Lazio Rzym"
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
   "FANKLUB Dąbrowa Tarnowska"
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
   "FANKLUB Nowa Ruda"
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
   "FANKLUB Szlichtyngowa"
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
   "Black Rebels",
   "FANKLUB Iłowo",
   "FANKLUB Żuromin"
  ],
  "zgody": [
   "Sandecja Nowy Sącz",
   "Ligallo Fondo Norte (Real Saragossa)"
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
   "FANKLUB Orzesze"
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
   "MCHPB – Młodzi Chuligani Polonii Bytom"
  ],
  "zgody": [
   "Arka Gdynia",
   "Odra Opole",
   "Góral Żywiec",
   "Gryf Wejherowo"
  ],
  "fanklub": [
   "FANKLUB Cieszyn",
   "FANKLUB Radzionków",
   "FANKLUB Tarnowskie Góry",
   "FANKLUB Wojkowice",
   "FANKLUB Gogolin",
   "FANKLUB Prudnik"
  ]
 },
 "Pogoń Grodzisk Mazowiecki": {
  "ultras": [
   "Mad Boys",
   "Young Fans"
  ],
  "zgody": [
   "Znicz Pruszków"
  ]
 },
 "Odra Opole": {
  "ultras": [
   "UGO - Underground Odra"
  ],
  "chuligani": [
   "VoS'98 – Vikings of South"
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
   "FANKLUB Niemodlin"
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
   "Karpaty Krosno"
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
  ]
 },
 "Stal Mielec": {
  "ultras": [
   "USM'08 – Ultras Stal Mielec"
  ],
  "zgody": [
   "Sandecja Nowy Sącz",
   "Czarni Jasło"
  ],
  "fanklub": [
   "FANKLUB Chmielnik",
   "FANKLUB Przecław",
   "FANKLUB Wadowice Górne"
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
   "Mazovia Mińsk Mazowiecki"
  ]
 },
 "Lechia Gdańsk": {
  "ultras": [
   "ULG - Ultras Lechia Gdańsk"
  ],
  "chuligani": [
   "CHWM - Chuligani Wolnego Miasta",
   "Młode Orły"
  ],
  "zgody": [
   "Śląsk Wrocław",
   "Gryf Słupsk"
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
   "FANKLUB Nowe nad Wisłą"
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
   "FANKLUB Jastrzębia Góra"
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
   "FANKLUB Warlubie",
   "Łasin",
   "Radzyń Chełmiński",
   "Warlubie"
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
  ]
 },
 "Podhale Nowy Targ": {
  "chuligani": [
   "Młode Podhale"
  ]
 },
 "Chojniczanka Chojnice": {
  "ultras": [
   "FZGT - Fanatycy z Grodu Tura"
  ],
  "zgody": [
   "KP Starogard Gdański",
   "Gryf Słupsk",
   "Wierzyca Pelplin"
  ],
  "fanklub": [
   "FANKLUB Brusy",
   "FANKLUB Czersk",
   "FANKLUB Pawłowo",
   "Brusy",
   "Czersk",
   "Pawłowo"
  ],
  "chuligani": [
   "FZGT - Fanatycy z Grodu Tura"
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
   "Polonia Przemyśl"
  ],
  "fanklub": [
   "FANKLUB Janów Lubelski",
   "FANKLUB Modliborzyce",
   "FANKLUB Krzeszów",
   "FANKLUB Nisko",
   "FANKLUB Nowa Dęba",
   "FANKLUB Żabno",
   "FANKLUB Zarzecze",
   "Janów Lubelski",
   "Modliborzyce",
   "Krzeszów",
   "Nisko",
   "Nowa Dęba",
   "Żabno",
   "Zarzecze"
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
   "Igołomia & Pobiednik",
   "Szczyrzyc",
   "Górale"
  ],
  "zgody": [
   "Stomil Olsztyn",
   "Wisła Płock",
   "GKS Bełchatów",
   "1. FC Magdeburg"
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
   "FANKLUB Łańcut",
   "Boguchwała",
   "Głogów Małopolski",
   "Malawa",
   "Trzeboś",
   "Świlcza",
   "Brzozów",
   "Sędziszów Małopolski",
   "Łańcut"
  ],
  "zgody": [
   "Stal Sanok",
   "Spartacus Nyíregyháza"
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
   "FANKLUB Milejów",
   "Lubartów",
   "Milejów"
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
   "FANKLUB Wola",
   "Bieruń",
   "Bojszowy",
   "Piasek",
   "Wola"
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
   "FANKLUB Osiek n/Not",
   "Barcin",
   "Chełmno",
   "Inowrocław",
   "Janikowo",
   "Kruszwica",
   "Mogilno",
   "Nakło",
   "Pruszcz Pomorski",
   "Potulice",
   "Tuchola",
   "Świecie",
   "Osiek n/Not"
  ]
 },
 "Lechia Zielona Góra": {
  "ultras": [
   "Ultras Lechia"
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
  ]
 },
 "Elana Toruń": {
  "ultras": [
   "Młoda Elana (h)",
   "Ultras Elana Toruń"
  ],
  "chuligani": [
   "GTW - Grupa Trzymająca Władzę"
  ],
  "zgody": [
   "Widzew Łódź",
   "KKS Kalisz",
   "KS Myszków"
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
   "FANKLUB Wąbrzeźno"
  ]
 },
 "Bałtyk Gdynia": {
  "ultras": [
   "Ultras Bałtyk Gdynia"
  ],
  "chuligani": [
   "Odczuwalni'18"
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
   "Pomezania Malbork"
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
   "KKS Kalisz",
   "MKS Karlino",
   "Sokół Karlino"
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
   "ETO Győr"
  ],
  "fanklub": [
   "FANKLUB Dębno&Sufczyn",
   "FANKLUB Wojnicz",
   "FANKLUB Arkadia Olszyny",
   "FANKLUB Radłów",
   "FANKLUB Zakliczyn",
   "FANKLUB Tuchów"
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
  ]
 },
 "Flota Świnoujście": {
  "ultras": [
   "Młodzi Fanatycy"
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
  ]
 },
 "Okocimski Brzesko": {
  "ultras": [
   "BF - Brzescy Fanatycy"
  ],
  "fanklub": [
   "FANKLUB Jasień"
  ]
 },
 "Pomezania Malbork": {
  "ultras": [
   "Malborscy Lechiści"
  ],
  "zgody": [
   "Gryf Słupsk"
  ]
 },
 "Tarnovia Tarnów": {
  "chuligani": [
   "Młodzi Gniewni"
  ],
  "zgody": [
   "Cracovia"
  ]
 },
 "Goplania Inowrocław": {
  "ultras": [
   "UG'24 - Ultras Goplania"
  ],
  "chuligani": [
   "Sportowa Goplania"
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
  ]
 },
 "Włocłavia Włocławek": {
  "ultras": [
   "Ultras Włocłavia Group"
  ],
  "chuligani": [
   "GOC'04 - Gang of Chopina"
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
  ]
 },
 "Unia Wąbrzeźno": {
  "chuligani": [
   "Młoda Unia"
  ]
 },
 "Kujawiak Kowal": {
  "ultras": [
   "KF'18 - Kowal Fans"
  ],
  "zgody": [
   "Start Pruszcz"
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
   "Wisła Tczew"
  ],
  "fanklub": [
   "FC Kościerzyna (Arka Gdynia)"
  ]
 },
 "KP Starogard Gdański": {
  "ultras": [
   "KF'18 - Kocborowo Fans"
  ],
  "zgody": [
   "Chojniczanka Chojnice"
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
  ]
 },
 "MKS Karlino": {
  "ultras": [
   "Ultras Karlino'11"
  ],
  "zgody": [
   "Kotwica Kołobrzeg"
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
  ]
 },
 "Beskid Andrychów": {
  "ultras": [
   "Ultras Beskid'08"
  ],
  "zgody": [
   "Energie Cottbus"
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
  ]
 },
 "Rodło Kwidzyn": {
  "ultras": [
   "Ultras Rodło"
  ]
 },
 "Gryf Wejherowo": {
  "zgody": [
   "Kaszubia Kościerzyna",
   "Orkan Rumia",
   "Gwardia Koszalin",
   "Polonia Bytom"
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
   "Gryf Wejherowo"
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
   "Kotwica Kołobrzeg"
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
  ]
 },
 "Victoria 1918 Jaworzno": {
  "ultras": [
   "LSM - Lepsza Strona Miasta"
  ],
  "zgody": [
   "Fablok Chrzanów"
  ]
 },
 "MKS Fablok Chrzanów": {
  "zgody": [
   "Victoria Jaworzno"
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
 }
};

// Prawdziwe grupy kibicowskie (ultras, ekipy, fankluby), nazwy trybun i zgody — tylko potwierdzone w źródłach
// (Wikipedia, prasa, serwisy kibicowskie, m.in. stadionowioprawcy.net). Używane WYŁĄCZNIE do flag na płotach i opisu
// trybun; incydenty w grze nigdy nie są przypisywane konkretnej grupie — zawsze „kibicom klubu".
export interface GrupyKlubu { trybuna?: string[]; ultras?: string[]; chuligani?: string[]; fanklub?: string[]; zgody?: string[] }
export const GRUPY_KIBICOW: Record<string, GrupyKlubu> = {
 "Olimpia Grudziądz": {
  "ultras": [
   "BZF'07 - Biało-Zieloni Fanatycy"
  ],
  "chuligani": [
   "ChzM'05 - Chłopcy z Marginesu",
   "GKS Olimpia Hooligans"
  ],
  "fanklub": [
   "Łasin",
   "Radzyń Chełmiński",
   "Warlubie"
  ],
  "zgody": [
   "Wigry Suwałki"
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
  "chuligani": [
   "FZGT - Fanatycy z Grodu Tura"
  ],
  "fanklub": [
   "Brusy",
   "Czersk",
   "Pawłowo"
  ],
  "zgody": [
   "KP Starogard Gdański",
   "Gryf Słupsk",
   "Wierzyca Pelplin"
  ]
 },
 "Stal Stalowa Wola": {
  "ultras": [
   "Ultras Stalówka"
  ],
  "chuligani": [
   "STF - Stalówka The Firm"
  ],
  "fanklub": [
   "Janów Lubelski",
   "Modliborzyce",
   "Krzeszów",
   "Nisko",
   "Nowa Dęba",
   "Żabno",
   "Zarzecze"
  ],
  "zgody": [
   "GKS Jastrzębie",
   "Łada Biłgoraj",
   "Inter Mediolan",
   "Stal Rzeszów",
   "Polonia Przemyśl"
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
  "fanklub": [
   "Lubartów",
   "Milejów"
  ],
  "zgody": [
   "Chełmianka Chełm"
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
   "YRH - Young Rats Hooligans"
  ],
  "fanklub": [
   "Bieruń",
   "Bojszowy",
   "Piasek",
   "Wola"
  ],
  "zgody": [
   "Cracovia",
   "ŁKS Łódź",
   "Górnik Wałbrzych",
   "Sandecja Nowy Sącz",
   "Zawisza Bydgoszcz"
  ]
 },
 "Zawisza Bydgoszcz": {
  "ultras": [
   "WKS'10 - Wysokiej Klasy Specjaliści"
  ],
  "chuligani": [
   "Bydgoscy Chuligani"
  ],
  "fanklub": [
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
  ],
  "zgody": [
   "ŁKS Łódź",
   "GKS Tychy",
   "Zagłębie Lubin",
   "Górnik Wałbrzych",
   "Pogoń Lębork"
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
 "Pogoń Lębork": {
  "ultras": [
   "UPL - Ultras Pogoń Lębork"
  ],
  "chuligani": [
   "ChML - Chuligani Miasta Lwa"
  ],
  "zgody": [
   "Zawisza Bydgoszcz"
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
 "Bałtyk Gdynia": {
  "ultras": [
   "Ultras Bałtyk Gdynia"
  ],
  "chuligani": [
   "Odczuwalni'18"
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
  "fanklub": [
   "FC Kościerzyna (Arka Gdynia)"
  ],
  "zgody": [
   "Gryf Wejherowo",
   "Wisła Tczew"
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
 "Pomezania Malbork": {
  "ultras": [
   "Malborscy Lechiści"
  ],
  "zgody": [
   "Gryf Słupsk"
  ]
 },
 "Rodło Kwidzyn": {
  "ultras": [
   "Ultras Rodło"
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
 "Włocłavia Włocławek": {
  "ultras": [
   "Ultras Włocłavia Group"
  ],
  "chuligani": [
   "GOC'04 - Gang of Chopina"
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
 "Start Pruszcz": {
  "zgody": [
   "Kujawiak Kowal"
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
   "Sokół Karlino"
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
 "Sokół Karlino": {
  "ultras": [
   "Ultras Karlino'11"
  ],
  "zgody": [
   "Kotwica Kołobrzeg"
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
 "Okocimski KS Brzesko": {
  "ultras": [
   "BF - Brzescy Fanatycy"
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

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
 }
};

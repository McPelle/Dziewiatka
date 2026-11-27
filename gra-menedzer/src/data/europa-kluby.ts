// Prawdziwe europejskie kluby — tylko FAKTYCZNE dane publiczne: nazwa, kraj, miasto, stadion, pojemność, rok założenia, barwy, siła.
// Źródło faktów: publiczna wiedza / Wikipedia (CC BY-SA). BEZ herbów (na Wikipedii to non-free: znak towarowy + prawa autorskie)
// i BEZ zmyślanych składów. Barwy klubowe to fakt (nie podlegają ochronie) — na ich podstawie rysujemy WŁASNY emblemat (tarcza + monogram),
// nie kopię prawdziwego logo. Siła ~ realna klasa klubu (wsp. UEFA) — do symulacji meczów (silnik liczy siłą, nie zawodnikami).
export interface EuroKlub {
  nazwa: string;
  kraj: string;
  miasto: string;
  stadion: string;
  pojemnosc: number; // przybliżona realna pojemność stadionu
  zalozony: number; // rok założenia klubu
  kolor: string; // barwa główna (wypełnienie tarczy)
  kolor2: string; // barwa dodatkowa (obwódka/akcent)
  sila: number; // 1–100, realna klasa
}

// Tier 1 — ścisła europejska czołówka (Liga Mistrzów, fazy pucharowe).
export const EURO_TOP: EuroKlub[] = [
  { nazwa: "Real Madryt", kraj: "Hiszpania", miasto: "Madryt", stadion: "Santiago Bernabéu", pojemnosc: 83186, zalozony: 1902, kolor: "#f4f4f4", kolor2: "#00529f", sila: 93 },
  { nazwa: "Manchester City", kraj: "Anglia", miasto: "Manchester", stadion: "Etihad Stadium", pojemnosc: 52900, zalozony: 1880, kolor: "#6cabdd", kolor2: "#1c2c5b", sila: 92 },
  { nazwa: "Bayern Monachium", kraj: "Niemcy", miasto: "Monachium", stadion: "Allianz Arena", pojemnosc: 75024, zalozony: 1900, kolor: "#dc052d", kolor2: "#ffffff", sila: 91 },
  { nazwa: "FC Barcelona", kraj: "Hiszpania", miasto: "Barcelona", stadion: "Spotify Camp Nou", pojemnosc: 99354, zalozony: 1899, kolor: "#a50044", kolor2: "#edbb00", sila: 89 },
  { nazwa: "Liverpool", kraj: "Anglia", miasto: "Liverpool", stadion: "Anfield", pojemnosc: 61276, zalozony: 1892, kolor: "#c8102e", kolor2: "#f6eb61", sila: 89 },
  { nazwa: "Paris Saint-Germain", kraj: "Francja", miasto: "Paryż", stadion: "Parc des Princes", pojemnosc: 47929, zalozony: 1970, kolor: "#004170", kolor2: "#da291c", sila: 88 },
  { nazwa: "Inter Mediolan", kraj: "Włochy", miasto: "Mediolan", stadion: "San Siro", pojemnosc: 75817, zalozony: 1908, kolor: "#010e80", kolor2: "#ffffff", sila: 87 },
  { nazwa: "Arsenal", kraj: "Anglia", miasto: "Londyn", stadion: "Emirates Stadium", pojemnosc: 60704, zalozony: 1886, kolor: "#ef0107", kolor2: "#ffffff", sila: 87 },
  { nazwa: "Atletico Madryt", kraj: "Hiszpania", miasto: "Madryt", stadion: "Riyadh Air Metropolitano", pojemnosc: 70460, zalozony: 1903, kolor: "#cb3524", kolor2: "#272e61", sila: 85 },
  { nazwa: "Bayer Leverkusen", kraj: "Niemcy", miasto: "Leverkusen", stadion: "BayArena", pojemnosc: 30210, zalozony: 1904, kolor: "#e32219", kolor2: "#1a1a1a", sila: 84 },
  { nazwa: "Borussia Dortmund", kraj: "Niemcy", miasto: "Dortmund", stadion: "Signal Iduna Park", pojemnosc: 81365, zalozony: 1909, kolor: "#fde100", kolor2: "#1a1a1a", sila: 83 },
  { nazwa: "Juventus", kraj: "Włochy", miasto: "Turyn", stadion: "Allianz Stadium", pojemnosc: 41507, zalozony: 1897, kolor: "#1a1a1a", kolor2: "#ffffff", sila: 83 },
  { nazwa: "AC Milan", kraj: "Włochy", miasto: "Mediolan", stadion: "San Siro", pojemnosc: 75817, zalozony: 1899, kolor: "#fb090b", kolor2: "#1a1a1a", sila: 83 },
  { nazwa: "Napoli", kraj: "Włochy", miasto: "Neapol", stadion: "Stadio Diego Armando Maradona", pojemnosc: 54726, zalozony: 1926, kolor: "#12a0d7", kolor2: "#ffffff", sila: 83 },
  { nazwa: "RB Lipsk", kraj: "Niemcy", miasto: "Lipsk", stadion: "Red Bull Arena", pojemnosc: 47069, zalozony: 2009, kolor: "#001f47", kolor2: "#dd0741", sila: 82 },
];
// Tier 2 — mocni (Liga Mistrzów el. / Liga Europy czołówka).
export const EURO_SREDNIE: EuroKlub[] = [
  { nazwa: "AS Roma", kraj: "Włochy", miasto: "Rzym", stadion: "Stadio Olimpico", pojemnosc: 70634, zalozony: 1927, kolor: "#8e1f2f", kolor2: "#f0bc42", sila: 79 },
  { nazwa: "Villarreal", kraj: "Hiszpania", miasto: "Villarreal", stadion: "Estadio de la Cerámica", pojemnosc: 23500, zalozony: 1923, kolor: "#ffe667", kolor2: "#005187", sila: 78 },
  { nazwa: "Sevilla", kraj: "Hiszpania", miasto: "Sewilla", stadion: "Ramón Sánchez-Pizjuán", pojemnosc: 43883, zalozony: 1890, kolor: "#f43333", kolor2: "#ffffff", sila: 77 },
  { nazwa: "Olympique Marsylia", kraj: "Francja", miasto: "Marsylia", stadion: "Stade Vélodrome", pojemnosc: 67394, zalozony: 1899, kolor: "#2faee0", kolor2: "#ffffff", sila: 78 },
  { nazwa: "Benfica", kraj: "Portugalia", miasto: "Lizbona", stadion: "Estádio da Luz", pojemnosc: 64642, zalozony: 1904, kolor: "#e30613", kolor2: "#ffffff", sila: 80 },
  { nazwa: "FC Porto", kraj: "Portugalia", miasto: "Porto", stadion: "Estádio do Dragão", pojemnosc: 50033, zalozony: 1893, kolor: "#00428c", kolor2: "#ffffff", sila: 80 },
  { nazwa: "Ajax Amsterdam", kraj: "Holandia", miasto: "Amsterdam", stadion: "Johan Cruijff ArenA", pojemnosc: 55500, zalozony: 1900, kolor: "#d2122e", kolor2: "#ffffff", sila: 78 },
  { nazwa: "Feyenoord", kraj: "Holandia", miasto: "Rotterdam", stadion: "De Kuip", pojemnosc: 47500, zalozony: 1908, kolor: "#c9082a", kolor2: "#ffffff", sila: 77 },
  { nazwa: "Sporting Lizbona", kraj: "Portugalia", miasto: "Lizbona", stadion: "Estádio José Alvalade", pojemnosc: 50095, zalozony: 1906, kolor: "#008057", kolor2: "#ffffff", sila: 80 },
  { nazwa: "Celtic", kraj: "Szkocja", miasto: "Glasgow", stadion: "Celtic Park", pojemnosc: 60411, zalozony: 1887, kolor: "#018749", kolor2: "#ffffff", sila: 75 },
  { nazwa: "Rangers", kraj: "Szkocja", miasto: "Glasgow", stadion: "Ibrox Stadium", pojemnosc: 50817, zalozony: 1872, kolor: "#1b458f", kolor2: "#ffffff", sila: 74 },
  { nazwa: "Fenerbahce", kraj: "Turcja", miasto: "Stambuł", stadion: "Şükrü Saracoğlu", pojemnosc: 47834, zalozony: 1907, kolor: "#17375e", kolor2: "#ffed00", sila: 78 },
  { nazwa: "Galatasaray", kraj: "Turcja", miasto: "Stambuł", stadion: "RAMS Park", pojemnosc: 52223, zalozony: 1905, kolor: "#a90432", kolor2: "#fbb30f", sila: 79 },
  { nazwa: "Club Brugge", kraj: "Belgia", miasto: "Brugia", stadion: "Jan Breydelstadion", pojemnosc: 29042, zalozony: 1891, kolor: "#005daa", kolor2: "#1a1a1a", sila: 76 },
  { nazwa: "Olympiakos", kraj: "Grecja", miasto: "Pireus", stadion: "Georgios Karaiskakis", pojemnosc: 32115, zalozony: 1925, kolor: "#da1a32", kolor2: "#ffffff", sila: 76 },
];
// Tier 3 — Liga Europy / Liga Konferencji.
export const EURO_NIZSZE: EuroKlub[] = [
  { nazwa: "Ludogorec Razgrad", kraj: "Bułgaria", miasto: "Razgrad", stadion: "Huvepharma Arena", pojemnosc: 10422, zalozony: 1945, kolor: "#0a6b3a", kolor2: "#ffffff", sila: 70 },
  { nazwa: "Slavia Praga", kraj: "Czechy", miasto: "Praga", stadion: "Fortuna Arena", pojemnosc: 19370, zalozony: 1892, kolor: "#d0103a", kolor2: "#ffffff", sila: 74 },
  { nazwa: "Sparta Praga", kraj: "Czechy", miasto: "Praga", stadion: "epet ARENA", pojemnosc: 18944, zalozony: 1893, kolor: "#8b1a2b", kolor2: "#f0c419", sila: 73 },
  { nazwa: "Crvena zvezda", kraj: "Serbia", miasto: "Belgrad", stadion: "Rajko Mitić", pojemnosc: 51755, zalozony: 1945, kolor: "#da291c", kolor2: "#ffffff", sila: 74 },
  { nazwa: "Dinamo Zagrzeb", kraj: "Chorwacja", miasto: "Zagrzeb", stadion: "Stadion Maksimir", pojemnosc: 24851, zalozony: 1945, kolor: "#1f4ba5", kolor2: "#ffffff", sila: 73 },
  { nazwa: "Bodø/Glimt", kraj: "Norwegia", miasto: "Bodø", stadion: "Aspmyra Stadion", pojemnosc: 8270, zalozony: 1916, kolor: "#ffe000", kolor2: "#1a1a1a", sila: 73 },
  { nazwa: "Qarabag", kraj: "Azerbejdżan", miasto: "Baku", stadion: "Tofiq Bəhramov", pojemnosc: 31200, zalozony: 1951, kolor: "#005baa", kolor2: "#ffffff", sila: 71 },
  { nazwa: "Molde", kraj: "Norwegia", miasto: "Molde", stadion: "Aker Stadion", pojemnosc: 11249, zalozony: 1911, kolor: "#005daa", kolor2: "#ffffff", sila: 69 },
  { nazwa: "Rapid Wiedeń", kraj: "Austria", miasto: "Wiedeń", stadion: "Allianz Stadion", pojemnosc: 28345, zalozony: 1899, kolor: "#008c45", kolor2: "#ffffff", sila: 70 },
  { nazwa: "LASK", kraj: "Austria", miasto: "Linz", stadion: "Raiffeisen Arena", pojemnosc: 19080, zalozony: 1908, kolor: "#1a1a1a", kolor2: "#ffffff", sila: 69 },
  { nazwa: "Maccabi Tel Awiw", kraj: "Izrael", miasto: "Tel Awiw", stadion: "Bloomfield", pojemnosc: 29400, zalozony: 1906, kolor: "#f9d616", kolor2: "#004a99", sila: 70 },
  { nazwa: "Partizan Belgrad", kraj: "Serbia", miasto: "Belgrad", stadion: "Partizana", pojemnosc: 29775, zalozony: 1945, kolor: "#1a1a1a", kolor2: "#ffffff", sila: 70 },
  { nazwa: "CFR Cluj", kraj: "Rumunia", miasto: "Kluż-Napoka", stadion: "Dr. Constantin Rădulescu", pojemnosc: 23500, zalozony: 1907, kolor: "#7a1220", kolor2: "#ffffff", sila: 69 },
  { nazwa: "Astana", kraj: "Kazachstan", miasto: "Astana", stadion: "Astana Arena", pojemnosc: 30244, zalozony: 2009, kolor: "#00a3e0", kolor2: "#ffe000", sila: 67 },
  { nazwa: "PAOK Saloniki", kraj: "Grecja", miasto: "Saloniki", stadion: "Toumba", pojemnosc: 28703, zalozony: 1926, kolor: "#1a1a1a", kolor2: "#ffffff", sila: 73 },
];

/** Wszystkie kluby razem (np. do wyszukiwania po nazwie). */
export const EURO_WSZYSTKIE: EuroKlub[] = [...EURO_TOP, ...EURO_SREDNIE, ...EURO_NIZSZE];

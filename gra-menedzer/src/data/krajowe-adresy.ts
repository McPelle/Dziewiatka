// Realne nazwy stadionów i adresy klubów szczebli krajowych (Ekstraklasa / I / II / III liga).
// Wspólne dla wszystkich województw (KLUBY_PRAWDZIWE 1–3 oraz III liga gr. II).
// Źródła: pl.wikipedia.org (infoboksy klubów/stadionów), stadiony.net, stadiumdb.com. Tylko potwierdzone — brak = nie pokazujemy.
import type { KlubDane } from "./kluby";

export const KRAJOWE_DANE: Record<string, { stadion?: string; adres?: string }> = {
  "Arka Gdynia": { stadion: "Stadion Miejski w Gdyni", adres: "ul. Olimpijska 5, 81-538 Gdynia" },
  "Avia Świdnik": { stadion: "Stadion Miejski im. Czesława Krygiera w Świdniku", adres: "ul. Sportowa 2, 21-040 Świdnik" },
  "Bałtyk Koszalin": { stadion: "Stadion ZOS Bałtyk Koszalin", adres: "ul. Andersa 16, 75-015 Koszalin" },
  "Bruk-Bet Termalica Nieciecza": { stadion: "Stadion Sportowy Bruk-Bet Termalica, (Pojemność: 4666)", adres: "Nieciecza 199, 33-240 Żabno" },
  "Błękitni Stargard": { stadion: "Stadion Miejski w Stargardzie", adres: "ul. Ceglana 1, 73-110 Stargard" },
  "Chemik Bydgoszcz": { stadion: "Stadion im. Czesława Kobusa", adres: "ul. Glinki 79, 85-861 Bydgoszcz" },
  "Chojniczanka Chojnice": { stadion: "Stadion Miejski Chojniczanka 1930", adres: "ul. A. Mickiewicza 12, Chojnice" },
  "Chrobry Głogów": { stadion: "Stadion Miejski w Głogowie", adres: "ul. Rudnowska 17b, 67-200 Głogów" },
  "Cracovia": { stadion: "Stadion Cracovii", adres: "ul. Józefa Kałuży 1, 30-962 Kraków" },
  "Elana Toruń": { stadion: "Stadion Miejski im. Grzegorza Duneckiego w Toruniu", adres: "ul. 63 Pułku Piechoty 47/61, 87-100 Toruń" },
  "Flota Świnoujście": { stadion: "Stadion Miejski im. Leszka Zakrzewskiego w Świnoujściu", adres: "ul. Matejki 22, 72-600 Świnoujście" },
  "GKS Katowice": { stadion: "Arena Katowice", adres: "ul. Nowa Bukowa 1, 40-803 Katowice" },
  "GKS Tychy": { stadion: "Stadion Miejski w Tychach", adres: "ul. Edukacji 7, 43-100 Tychy" },
  "Gedania Gdańsk": { stadion: "Centrum Sportu i Edukacji GKS Gedania 1922", adres: "al. Generała Józefa Hallera 201, 80-416 Gdańsk" },
  "Górnik Zabrze": { stadion: "Stadion im. Ernesta Pohla", adres: "ul. Franklina Roosevelta 81, 41-800 Zabrze" },
  "Górnik Łęczna": { stadion: "Stadion Górnika Łęczna", adres: "al. Jana Pawła II 13, 21-010 Łęczna" },
  "Hutnik Kraków": { stadion: "Stadion Miejski Hutnik Kraków", adres: "ul. Tadeusza Ptaszyckiego 4, 31-979 Kraków" },
  "Jagiellonia Białystok": { stadion: "Stadion Miejski w Białymstoku", adres: "ul. Jurowiecka 21, 15-101 Białystok" },
  "KKS 1925 Kalisz": { stadion: "Stadion Miejski w Kaliszu", adres: "ul. Łódzka 19-29, 62-800 Kalisz" },
  "Korona Kielce": { stadion: "Arena Kielce", adres: "Ulica Piotra Ściegiennego w Kielcach" },
  "Kotwica Kórnik": { stadion: "Stadion miejski w Kórniku", adres: "ul. Leśna 6, 62-035 Kórnik" },
  "Lech II Poznań": { stadion: "Enea Stadion", adres: "ul. Bułgarska 17, 60-320 Poznań" },
  "Lech Poznań": { stadion: "Stadion Poznań", adres: "ul. Bułgarska 17, 60-320 Poznań" },
  "Lechia Gdańsk": { stadion: "Polsat Plus Arena Gdańsk", adres: "ul. Pokoleń Lechii Gdańsk 1, Gdańsk" },
  "Lechia Zielona Góra": { stadion: "Stadion MOSiR w Zielonej Górze, (pojemmość: 7100)", adres: "ul. Sulechowska 37, 65-147 Zielona Góra" },
  "Legia II Warszawa": { stadion: "Legia Training Center w Urszulin (powiat grodziski)", adres: "ul. Łazienkowska 3, 00-449 Warszawa" },
  "Legia Warszawa": { stadion: "Stadion Wojska Polskiego w Warszawie", adres: "ul. Łazienkowska 3, 00-449 Warszawa" },
  "Miedź Legnica": { stadion: "Stadion Miejski w Legnicy", adres: "ul. Hetmańska 2, 59-220 Legnica" },
  "Motor Lublin": { stadion: "Motor Lublin Arena", adres: "ul. Stadionowa 1, 20-405 Lublin" },
  "Odra Opole": { stadion: "Stadion Opolski", adres: "ul. L. Olejnika 1, 45-839 Opole" },
  "Olimpia Grudziądz": { stadion: "Stadion Miejski w Grudziądzu", adres: "Piłsudskiego 14, 86-300 Grudziądz" },
  "Piast Gliwice": { stadion: "Stadion Miejski w Gliwicach", adres: "ul. Stefana Okrzei 20, 44-100 Gliwice" },
  "Podbeskidzie Bielsko-Biała": { stadion: "Stadion Miejski w Bielsku-Białej", adres: "ul. Rychlińskiego 21, 43-300 Bielsko-Biała" },
  "Podhale Nowy Targ": { stadion: "Stadion Miejski im. Józefa Piłsudskiego", adres: "ul. Kolejowa 161, 34-400 Nowy Targ" },
  "Pogoń Grodzisk Mazowiecki": { stadion: "Stadion Pogoni Grodzisk Mazowiecki", adres: "Al. Mokronoskich 4, 05-825 Grodzisk Mazowiecki" },
  "Pogoń Siedlce": { stadion: "Stadion ROSRRiT w Siedlcach", adres: "ul. Jana Pawła II 6, 08-110 Siedlce" },
  "Pogoń Szczecin": { stadion: "Stadion Miejski w Szczecinie", adres: "ul. Karłowicza 28, 71-102 Szczecin" },
  "Polonia Bytom": { stadion: "Stadion Polonii Bytom", adres: "ul. Piłkarska 8, 41-902 Bytom" },
  "Polonia Warszawa": { stadion: "Stadion Polonii Warszawa", adres: "ul. Konwiktorska 6 lok. 205, 00-206 Warszawa" },
  "Polonia Środa Wielkopolska": { stadion: "Stadion 700-lecia Środy Wielkopolskiej", adres: "ul. Sportowa 12, 63-000 Środa Wielkopolska" },
  "Puszcza Niepołomice": { stadion: "Stadion Miejski w Niepołomicach", adres: "ul. Janusza Kusocińskiego 2, 32-005 Niepołomice" },
  "Radomiak Radom": { stadion: "Stadion im. Braci Czachorów", adres: "ul. Andrzeja Struga 63, 26-600 Radom" },
  "Raków Częstochowa": { stadion: "Miejski Stadion Piłkarski Raków w Częstochowie", adres: "ul. Limanowskiego 83, 42-208 Częstochowa" },
  "Rekord Bielsko-Biała": { stadion: "Centrum Sportu Rekord w Bielsku-Białej", adres: "ul. Startowa 13, 43-309 Bielsko-Biała" },
  "Resovia": { stadion: "Stadion Resovii", adres: "ul. Stanisława Wyspiańskiego 22, 35-311 Rzeszów" },
  "Ruch Chorzów": { stadion: "Stadion Ruchu Chorzów", adres: "ul. Cicha 6, 41-506 Chorzów" },
  "Sandecja Nowy Sącz": { stadion: "Stadion im. Ojca Władysława Augustynka", adres: "ul. Jana Kilińskiego 47, 33-300 Nowy Sącz" },
  "Sokół Kleczew": { stadion: "Stadion Miejski w Kleczewie", adres: "Aleja 600-lecia 21, 62-540 Kleczew" },
  "Stal Mielec": { stadion: "Stadion Miejski im. Grzegorza Lato w Mielcu", adres: "ul. Ludwika Solskiego 1, 39-300 Mielec" },
  "Stal Rzeszów": { stadion: "Stadion Miejski w Rzeszowie", adres: "ul. Hetmańska 69, 35-078 Rzeszów" },
  "Stal Stalowa Wola": { stadion: "Podkarpackie Centrum Piłki Nożnej", adres: "ul. Hutnicza 10a, 37-450 Stalowa Wola" },
  "Unia Skierniewice": { stadion: "Stadion Miejski w Skierniewicach", adres: "ul. Pomologiczna 8a, 96-100 Skierniewice" },
  "Unia Swarzędz": { stadion: "Stadion Miejski w Swarzędzu", adres: "ul. św. Marcina 1, 62-020 Swarzędz" },
  "Victoria Września": { stadion: "Stadion Miejski we Wrześni", adres: "ul. Kosynierów 1, 62-300 Września" },
  "Warta Poznań": { stadion: "Stadion przy Drodze Dębińskiej", adres: "ul. Jana Spychalskiego 34, 61-553 Poznań" },
  "Wda Świecie": { stadion: "Stadion Miejski w Świeciu", adres: "ul. Sienkiewicza 18, 86-100 Świecie" },
  "Widzew Łódź": { stadion: "Stadion Widzewa Łódź", adres: "al. Piłsudskiego 138, 92-230 Łódź" },
  "Wieczysta Kraków": { stadion: "Stadion Miejski w Krakowie", adres: "ul. Kazimierza Chałupnika 16, 31-462 Kraków" },
  "Wisła Kraków": { stadion: "Stadion Miejski w Krakowie", adres: "ul. Władysława Reymonta 20, 30-059 Kraków" },
  "Wisła Płock": { stadion: "Stadion im. Kazimierza Górskiego w Płocku", adres: "ul. Łukasiewicza 34, 09-400 Płock" },
  "Zagłębie Lubin": { stadion: "Stadion w Lubinie", adres: "ul. Marii Skłodowskiej-Curie 98, 59-301 Lubin" },
  "Zawisza Bydgoszcz": { stadion: "Stadion im. Zdzisława Krzyszkowiaka", adres: "ul. Gdańska 163, 85-915 Bydgoszcz" },
  "Znicz Pruszków": { stadion: "Stadion Znicza Pruszków", adres: "ul. Bohaterów Warszawy 4, 05-800 Pruszków" },
  "ŁKS Łódź": { stadion: "Stadion Miejski w Łodzi", adres: "al. Unii Lubelskiej 2, 94-020 Łódź" },
  "Śląsk II Wrocław": { stadion: "Stadion Miejski we Wrocławiu", adres: "ul. Oporowska 62, 53-434 Wrocław" },
  "Śląsk Wrocław": { stadion: "Stadion Miejski we Wrocławiu", adres: "ul. Oporowska 62, 53-434 Wrocław" },
  "Świt Szczecin": { stadion: "MOSRiR w Szczecinie, obiekt Skolwin ul. Stołczyńska 100", adres: "ul. Stołczyńska 100, 71-831 Szczecin" },
};

// Nałóż dane na listę klubów (nie nadpisuje istniejących pól).
export function nalozKrajowe(kluby: KlubDane[]): void {
  for (const kl of kluby) {
    const d = KRAJOWE_DANE[kl.nazwa];
    if (!d) continue;
    if (!kl.stadion && d.stadion) kl.stadion = d.stadion;
    if (!kl.adres && d.adres) kl.adres = d.adres;
  }
}

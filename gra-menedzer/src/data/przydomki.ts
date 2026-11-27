// Realne, powszechnie znane przydomki klubów (koloryt). Tylko potwierdzone — reszta bez przydomka.
export const PRZYDOMKI: Record<string, string> = {
  "Wisła Kraków": "Biała Gwiazda",
  "Cracovia": "Pasy",
  "Wieczysta Kraków": "Wieczni",
  "Hutnik Kraków": "Hutnicy",
  "Garbarnia Kraków": "Brązowi",
  "Sandecja Nowy Sącz": "Biało-czarni",
  "Lech Poznań": "Kolejorz",
  "Legia Warszawa": "Wojskowi",
  "Lechia Gdańsk": "Biało-zieloni",
  "Arka Gdynia": "Żółto-niebiescy",
  "Bałtyk Gdynia": "Portowcy znad Zatoki",
  "Górnik Zabrze": "Górnicy",
  "Ruch Chorzów": "Niebiescy",
  "Raków Częstochowa": "Medaliki",
  "Pogoń Szczecin": "Portowcy",
  "Śląsk Wrocław": "Wojskowi z Wrocławia",
  "Widzew Łódź": "RTS",
  "Zawisza Bydgoszcz": "Niebiescy z Bydgoszczy",
  "Gryf Wejherowo": "Gryfy",
  // Przydomki ZP/KP (pl.wikipedia)
  "Kotwica Kołobrzeg": "Kotwa",
  "Dąb Dębno": "Biało-Zieloni",
  "Gwardia Koszalin": "Trójkolorowi",
  "Sparta Brodnica": "Żółto-czarni (Gialloneri)",
  "Lech Rypin": "Leszek",
  "Cuiavia Inowrocław": "Biało-Zieloni",
  "Pomorzanin Toruń": "Pomorek",
  "Polonia Bydgoszcz": "Biało-Czerwoni",
  "Elana Toruń": "Żółto-Niebiescy",
  "Świt Szczecin": "Duma Dzielnicy",
  "Błękitni Stargard": "Kolejarze",
  "Bałtyk Koszalin": "Biało-niebiescy",

  // Przydomki klubów mał/pom z Wikipedii (infoboxy, weryfikacja przez wyszukiwarkę)
  "Chełmianka Chełm": "Chełmska Husaria",
  "Flota Świnoujście": "Wyspiarze",
  "Hetman Zamość": "Hetman Wielki Koronny",
  "KKS 1925 Kalisz": "Cebulorz",
  "KSZO Ostrowiec Świętokrzyski": "Pomarańczowo-czarni",
  "Okocimski KS Brzesko": "Piwosze",
  "Siarka Tarnobrzeg": "Siarkowcy",
  "Star Starachowice": "Zielono-czarni",
  "Tarnovia Tarnów": "Tovia",
  "Unia Tarnów": "Jaskółki",
  "Victoria 1918 Jaworzno": "Vica",
  "Wisłoka Dębica": "Biało-Zieloni",

  // Przydomki ZP/KP z Wikipedii (zweryfikowane)
  "Olimpia Grudziądz": "Gieksa",
  "Włocłavia Włocławek": "Szlachta Kujaw",
  // Podlaskie i III liga gr. I — przydomki potwierdzone w źródłach
  "Wigry Suwałki": "Biało-Niebiescy, Wigierki",
  "Warta Sieradz": "Biało-zieloni",
  "Pelikan Łowicz": "Pasiaki",
  "Ząbkovia Ząbki": "Dolcan",
  "Olimpia Elbląg": "Żółto-biało-niebiescy, Związkowi, Olimpijczycy",
  "Lechia Tomaszów Mazowiecki": "Lechiści",
  "ŁKS Łomża": "eŁKaeSiacy",
  "MOSP Białystok": "MOSP",
  // Warmińsko-mazurskie i podlaskie (pl.wikipedia)
  "Jagiellonia Białystok": "Jaga",
  "Stomil Olsztyn": "Duma Warmii",
  "Concordia Elbląg": "Słoniki",
  "Sokół Ostróda": "Sokoły",
  "Mamry Giżycko": "GieKSa",
  "MKS Mazur Ełk": "Mazurek",
  "Jeziorak Iława": "Jeziorowcy",
  "Granica Kętrzyn": "KKS",
  "Warmia Olsztyn": "Duma Zatorza",
  "Drwęca Nowe Miasto Lubawskie": "Biało-niebiescy",
  // Warmińsko-mazurskie — przydomki potwierdzone w źródłach
  "Wel Lidzbark": "„Welowcy”",
  // Warmińsko-mazurskie (runda 2) — przydomki potwierdzone w źródłach
  "Constract Lubawa": "Konstruktorzy",
};

export function przydomek(nazwa: string): string | undefined {
  return PRZYDOMKI[nazwa];
}

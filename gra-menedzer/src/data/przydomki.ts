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
};

export function przydomek(nazwa: string): string | undefined {
  return PRZYDOMKI[nazwa];
}

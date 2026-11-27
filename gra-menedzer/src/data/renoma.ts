// Kalibracja renomy (siły marki) klubu. Renoma wpływa na budżet, pojemność stadionu, frekwencję i premię do umiejętności.
// Baza wynika z poziomu ligi (wyższa liga = większa renoma); bonus dostają kluby o historii większej niż obecny poziom.

// Baza renomy wg poziomu: 1 = Ekstraklasa … 9 = klasa B/C.
export const RENOMA_POZIOM = [0.9, 0.82, 0.72, 0.6, 0.5, 0.42, 0.36, 0.3, 0.25];

// Bonus dla „upadłych potęg" / rozpoznawalnych marek grających niżej, niż sugeruje historia.
export const RENOMA_BONUS: Record<string, number> = {
  "Zawisza Bydgoszcz": 0.15,
  "Polonia Bytom": 0.12,
  "Wieczysta Kraków": 0.1,
  "Gedania Gdańsk": 0.1,
  "Garbarnia Kraków": 0.08,
  "Hutnik Kraków": 0.08,
  "Bałtyk Gdynia": 0.08,
  "Gryf Wejherowo": 0.07,
  "Elana Toruń": 0.07,
  "Flota Świnoujście": 0.06,
  "Chojniczanka II Chojnice": 0.06,
  "Chojniczanka III Chojnice": 0.06,
  "Cartusia Kartuzy": 0.05,
  "Bytovia Bytów": 0.05,
  "Gryf Słupsk": 0.05,
  "KP Starogard Gdański": 0.05,
  "Pomezania Malbork": 0.05,
  "Unia Tarnów": 0.05,
  "Tarnovia Tarnów": 0.05,
  "Sandecja Nowy Sącz": 0.05,
  "Resovia": 0.06,
  // Małopolska — rozpoznawalne marki / historia (parytet z pomorskim)
  "Limanovia Limanowa": 0.05,
  "Podhale Nowy Targ": 0.06,
  "Beskid Andrychów": 0.05,
  "Dalin Myślenice": 0.05,
  "Okocimski KS Brzesko": 0.05,
  "BKS Bochnia": 0.04,
  "Glinik Gorlice": 0.04,
  "Poprad Muszyna": 0.04,
  "Kalwarianka Kalwaria Zebrzydowska": 0.03,
  // Krajowe „upadłe potęgi" / marki regionalne
  "Olimpia Grudziądz": 0.06,
  "Lechia Zielona Góra": 0.05,
  "Chojniczanka Chojnice": 0.06,
  "Świt Szczecin": 0.05,
  "Polonia Środa Wielkopolska": 0.04,
  "Błękitni Stargard": 0.04,
  // Zachodniopomorskie — rozpoznawalne marki / historia (parytet z pomorskim)
  "Kotwica Kołobrzeg": 0.06,
  "Gwardia Koszalin": 0.06,
  "Bałtyk Koszalin": 0.05,
  "Chemik Police": 0.05,
  "Arkonia Szczecin": 0.05,
  "Kluczevia Stargard": 0.04,
  // Kujawsko-pomorskie — rozpoznawalne marki / historia
  "Polonia Bydgoszcz": 0.08,
  "Włocłavia Włocławek": 0.05,
  "Unia Janikowo": 0.05,
  "Cuiavia Inowrocław": 0.04,
  "Goplania Inowrocław": 0.04,
  "Pomorzanin Toruń": 0.04,
  "Sparta Brodnica": 0.03,
  "Wda Świecie": 0.03,
};

// Historyczny PRESTIŻ (bazowa „podłoga" renomy): marka i kibice wielkich/historycznych klubów trwają
// mimo spadków — renoma nie spada poniżej tej wartości (giganci po spadku dalej ściągają tłumy i budżet).
// Floor dobrany umiarkowanie: liczy się dopiero, gdy wyniki zepchnęłyby klub znacznie poniżej jego rangi.
export const PRESTIZ: Record<string, number> = {
  // Wielkie marki / wielokrotni mistrzowie Polski
  "Ruch Chorzów": 0.62, "Górnik Zabrze": 0.66, "Legia Warszawa": 0.72, "Wisła Kraków": 0.66, "Lech Poznań": 0.68,
  "Widzew Łódź": 0.6, "ŁKS Łódź": 0.56, "GKS Katowice": 0.55, "Polonia Warszawa": 0.54, "Cracovia": 0.58,
  "Pogoń Szczecin": 0.58, "Lechia Gdańsk": 0.56, "Arka Gdynia": 0.52, "Zagłębie Lubin": 0.55, "Zagłębie Sosnowiec": 0.5,
  "Szombierki Bytom": 0.48, "Stal Mielec": 0.5, "Raków Częstochowa": 0.58, "Jagiellonia Białystok": 0.56,
  "Wisła Płock": 0.5, "Motor Lublin": 0.5, "Korona Kielce": 0.5, "Piast Gliwice": 0.5, "Śląsk Wrocław": 0.58,
  "Radomiak Radom": 0.48, "Odra Opole": 0.46, "Miedź Legnica": 0.46, "Stal Rzeszów": 0.44,
  // Historyczne marki regionalne (pomorskie / małopolskie i okolice)
  "Zawisza Bydgoszcz": 0.46, "Olimpia Grudziądz": 0.42, "Bałtyk Gdynia": 0.4, "Gedania Gdańsk": 0.38,
  "Gryf Wejherowo": 0.36, "Polonia Bytom": 0.46, "Wieczysta Kraków": 0.5, "Hutnik Kraków": 0.4, "Garbarnia Kraków": 0.4,
  "Unia Tarnów": 0.38, "Tarnovia Tarnów": 0.34, "Sandecja Nowy Sącz": 0.42, "Podhale Nowy Targ": 0.36,
  "Resovia": 0.42, "Okocimski KS Brzesko": 0.34, "Limanovia Limanowa": 0.34,
};

/** Podłoga renomy wynikająca z historycznego prestiżu (0 = brak). */
export function prestizKlubu(nazwa: string): number {
  return PRESTIZ[nazwa] ?? 0;
}

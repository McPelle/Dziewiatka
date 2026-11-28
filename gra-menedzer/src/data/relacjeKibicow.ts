// Relacje kibicowskie (zgody, układy, kosy) — tylko potwierdzone w źródłach (stadionowioprawcy.net, Wikipedia, prasa).
// Kosa = mecz podwyższonego ryzyka; zgoda/układ = mecz przyjaźni (wspólne oprawy, wymiana szalików).
export interface RelacjaKibicow { a: string; b: string; typ: "zgoda" | "uklad" | "kosa"; nazwa?: string }
export const RELACJE_KIBICOW: RelacjaKibicow[] = [
 {
  "a": "Arka Gdynia",
  "b": "Cracovia",
  "typ": "zgoda",
  "nazwa": "Zgoda Arka Gdynia – Cracovia [Wielka Triada (Arka–Lech–Cracovia)]"
 },
 {
  "a": "Arka Gdynia",
  "b": "Gwardia Koszalin",
  "typ": "zgoda",
  "nazwa": "Zgoda Arka Gdynia – Gwardia Koszalin [od 1989]"
 },
 {
  "a": "Arka Gdynia",
  "b": "KSZO Ostrowiec Świętokrzyski",
  "typ": "zgoda",
  "nazwa": "Zgoda Arka Gdynia – KSZO Ostrowiec Świętokrzyski [od 2004]"
 },
 {
  "a": "Arka Gdynia",
  "b": "Lech Poznań",
  "typ": "zgoda",
  "nazwa": "Zgoda Arka Gdynia – Lech Poznań [Wielka Triada (Arka–Lech–Cracovia)]"
 },
 {
  "a": "Arka Gdynia",
  "b": "Polonia Bytom",
  "typ": "zgoda",
  "nazwa": "Zgoda Arka Gdynia – Polonia Bytom [od 1974]"
 },
 {
  "a": "Arka Gdynia",
  "b": "Zagłębie Lubin",
  "typ": "zgoda",
  "nazwa": "Zgoda Arka Gdynia – Zagłębie Lubin [od 1983]"
 },
 {
  "a": "Chełmianka Chełm",
  "b": "Górnik Łęczna",
  "typ": "zgoda",
  "nazwa": "Zgoda Chełmianka Chełm – Górnik Łęczna"
 },
 {
  "a": "Chojniczanka Chojnice",
  "b": "Gryf Słupsk",
  "typ": "zgoda",
  "nazwa": "Zgoda Chojniczanka Chojnice – Gryf Słupsk [od 31.07.2021]"
 },
 {
  "a": "Chojniczanka Chojnice",
  "b": "KP Starogard Gdański",
  "typ": "zgoda",
  "nazwa": "Zgoda Chojniczanka Chojnice – KP Starogard Gdański"
 },
 {
  "a": "Cracovia",
  "b": "GKS Tychy",
  "typ": "zgoda",
  "nazwa": "Zgoda Cracovia – GKS Tychy [od 1982]"
 },
 {
  "a": "Cracovia",
  "b": "Lech Poznań",
  "typ": "zgoda",
  "nazwa": "Zgoda Cracovia – Lech Poznań [Wielka Triada (Arka–Lech–Cracovia)]"
 },
 {
  "a": "Cracovia",
  "b": "Sandecja Nowy Sącz",
  "typ": "zgoda",
  "nazwa": "Zgoda Cracovia – Sandecja Nowy Sącz [od 1985]"
 },
 {
  "a": "Cracovia",
  "b": "Tarnovia Tarnów",
  "typ": "zgoda",
  "nazwa": "Zgoda Cracovia – Tarnovia Tarnów [od 1993]"
 },
 {
  "a": "Dąb Dębno",
  "b": "Energetyk Gryfino",
  "typ": "zgoda",
  "nazwa": "Zgoda Dąb Dębno – Energetyk Gryfino"
 },
 {
  "a": "Dąb Dębno",
  "b": "Odra Chojna",
  "typ": "zgoda",
  "nazwa": "Zgoda Dąb Dębno – Odra Chojna"
 },
 {
  "a": "Elana Toruń",
  "b": "KKS 1925 Kalisz",
  "typ": "zgoda",
  "nazwa": "Zgoda Elana Toruń – KKS 1925 Kalisz [od 19.05.2019]"
 },
 {
  "a": "Elana Toruń",
  "b": "Widzew Łódź",
  "typ": "zgoda"
 },
 {
  "a": "Energetyk Gryfino",
  "b": "Odra Chojna",
  "typ": "zgoda",
  "nazwa": "Zgoda Energetyk Gryfino – Odra Chojna"
 },
 {
  "a": "Energetyk Gryfino",
  "b": "Pogoń Barlinek",
  "typ": "zgoda",
  "nazwa": "Zgoda Energetyk Gryfino – Pogoń Barlinek"
 },
 {
  "a": "GKS Tychy",
  "b": "Sandecja Nowy Sącz",
  "typ": "zgoda",
  "nazwa": "Zgoda GKS Tychy – Sandecja Nowy Sącz"
 },
 {
  "a": "GKS Tychy",
  "b": "Zawisza Bydgoszcz",
  "typ": "zgoda",
  "nazwa": "Zgoda GKS Tychy – Zawisza Bydgoszcz [trójca ŁKS–Tychy–Zawisza]"
 },
 {
  "a": "GKS Tychy",
  "b": "ŁKS Łódź",
  "typ": "zgoda",
  "nazwa": "Zgoda GKS Tychy – ŁKS Łódź [trójca ŁKS–Tychy–Zawisza]"
 },
 {
  "a": "Garbarnia Kraków",
  "b": "Puszcza Niepołomice",
  "typ": "zgoda",
  "nazwa": "Zgoda Garbarnia Kraków – Puszcza Niepołomice"
 },
 {
  "a": "Gryf Słupsk",
  "b": "Lechia Gdańsk",
  "typ": "zgoda",
  "nazwa": "Zgoda Gryf Słupsk – Lechia Gdańsk"
 },
 {
  "a": "Gryf Słupsk",
  "b": "Pomezania Malbork",
  "typ": "zgoda",
  "nazwa": "Zgoda Gryf Słupsk – Pomezania Malbork"
 },
 {
  "a": "Gryf Wejherowo",
  "b": "Gwardia Koszalin",
  "typ": "zgoda",
  "nazwa": "Zgoda Gryf Wejherowo – Gwardia Koszalin"
 },
 {
  "a": "Gryf Wejherowo",
  "b": "Kaszubia Kościerzyna",
  "typ": "zgoda",
  "nazwa": "Zgoda Gryf Wejherowo – Kaszubia Kościerzyna"
 },
 {
  "a": "Gryf Wejherowo",
  "b": "Orkan Rumia MKS",
  "typ": "zgoda",
  "nazwa": "Zgoda Gryf Wejherowo – Orkan Rumia MKS"
 },
 {
  "a": "Gryf Wejherowo",
  "b": "Polonia Bytom",
  "typ": "zgoda",
  "nazwa": "Zgoda Gryf Wejherowo – Polonia Bytom [od 19.06.2026]"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Wisłoka Dębica",
  "typ": "zgoda",
  "nazwa": "Zgoda Górnik Zabrze – Wisłoka Dębica"
 },
 {
  "a": "Hetman Zamość",
  "b": "Motor Lublin",
  "typ": "zgoda",
  "nazwa": "Zgoda Hetman Zamość – Motor Lublin [od 04.07.2026, wcześniej układ od 28.04.2018]"
 },
 {
  "a": "KKS 1925 Kalisz",
  "b": "Kotwica Kołobrzeg",
  "typ": "zgoda",
  "nazwa": "Zgoda KKS 1925 Kalisz – Kotwica Kołobrzeg [od 28.05.2023]"
 },
 {
  "a": "KSZO Ostrowiec Świętokrzyski",
  "b": "Lech Poznań",
  "typ": "zgoda",
  "nazwa": "Zgoda KSZO Ostrowiec Świętokrzyski – Lech Poznań"
 },
 {
  "a": "Kotwica Kołobrzeg",
  "b": "Sokół Karlino",
  "typ": "zgoda",
  "nazwa": "Zgoda Kotwica Kołobrzeg – Sokół Karlino"
 },
 {
  "a": "Kujawiak Kowal",
  "b": "Start Pruszcz",
  "typ": "zgoda",
  "nazwa": "Zgoda Kujawiak Kowal – Start Pruszcz"
 },
 {
  "a": "Lech Poznań",
  "b": "ŁKS Łódź",
  "typ": "zgoda",
  "nazwa": "Zgoda Lech Poznań – ŁKS Łódź [od 30.09.2017]"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Śląsk Wrocław",
  "typ": "zgoda",
  "nazwa": "Zgoda Lechia Gdańsk – Śląsk Wrocław [najstarsza zgoda w Polsce, od 1977]"
 },
 {
  "a": "Legia Chełmża",
  "b": "Sparta Brodnica",
  "typ": "zgoda",
  "nazwa": "Zgoda Legia Chełmża – Sparta Brodnica"
 },
 {
  "a": "Legia Warszawa",
  "b": "Radomiak Radom",
  "typ": "zgoda",
  "nazwa": "Zgoda Legia Warszawa – Radomiak Radom [od 26.11.2017]"
 },
 {
  "a": "MKS Fablok Chrzanów",
  "b": "Victoria 1918 Jaworzno",
  "typ": "zgoda",
  "nazwa": "Zgoda MKS Fablok Chrzanów – Victoria 1918 Jaworzno"
 },
 {
  "a": "Miedź Legnica",
  "b": "Śląsk Wrocław",
  "typ": "zgoda",
  "nazwa": "Zgoda Miedź Legnica – Śląsk Wrocław"
 },
 {
  "a": "Motor Lublin",
  "b": "Śląsk Wrocław",
  "typ": "zgoda",
  "nazwa": "Zgoda Motor Lublin – Śląsk Wrocław"
 },
 {
  "a": "Odra Chojna",
  "b": "Pogoń Barlinek",
  "typ": "zgoda",
  "nazwa": "Zgoda Odra Chojna – Pogoń Barlinek"
 },
 {
  "a": "Odra Opole",
  "b": "Polonia Bytom",
  "typ": "zgoda",
  "nazwa": "Zgoda Odra Opole – Polonia Bytom"
 },
 {
  "a": "Odra Opole",
  "b": "Zagłębie Lubin",
  "typ": "zgoda",
  "nazwa": "Zgoda Odra Opole – Zagłębie Lubin"
 },
 {
  "a": "Pogoń Grodzisk Mazowiecki",
  "b": "Znicz Pruszków",
  "typ": "zgoda",
  "nazwa": "Zgoda Pogoń Grodzisk Mazowiecki – Znicz Pruszków"
 },
 {
  "a": "Pogoń Lębork",
  "b": "Zawisza Bydgoszcz",
  "typ": "zgoda",
  "nazwa": "Zgoda Pogoń Lębork – Zawisza Bydgoszcz"
 },
 {
  "a": "Ruch Chorzów",
  "b": "Widzew Łódź",
  "typ": "zgoda"
 },
 {
  "a": "Ruch Chorzów",
  "b": "Wisła Kraków",
  "typ": "zgoda"
 },
 {
  "a": "Sandecja Nowy Sącz",
  "b": "Stal Mielec",
  "typ": "zgoda",
  "nazwa": "Zgoda Sandecja Nowy Sącz – Stal Mielec"
 },
 {
  "a": "Siarka Tarnobrzeg",
  "b": "Wisłoka Dębica",
  "typ": "zgoda",
  "nazwa": "Zgoda Siarka Tarnobrzeg – Wisłoka Dębica [od 10.11.2007]"
 },
 {
  "a": "Zagłębie Lubin",
  "b": "Zawisza Bydgoszcz",
  "typ": "zgoda",
  "nazwa": "Zgoda Zagłębie Lubin – Zawisza Bydgoszcz"
 },
 {
  "a": "Zawisza Bydgoszcz",
  "b": "ŁKS Łódź",
  "typ": "zgoda",
  "nazwa": "Zgoda Zawisza Bydgoszcz – ŁKS Łódź [trójca ŁKS–Tychy–Zawisza]"
 },
 {
  "a": "Chojniczanka Chojnice",
  "b": "Wierzyca Pelplin",
  "typ": "uklad",
  "nazwa": "Układ Chojniczanka Chojnice – Wierzyca Pelplin"
 },
 {
  "a": "Drawa Drawsko Pomorskie",
  "b": "Sokół Karlino",
  "typ": "uklad",
  "nazwa": "Układ Drawa Drawsko Pomorskie – Sokół Karlino"
 },
 {
  "a": "GKS Katowice",
  "b": "JKS 1909 Jarosław",
  "typ": "uklad",
  "nazwa": "Układ GKS Katowice – JKS 1909 Jarosław"
 },
 {
  "a": "Gryf Słupsk",
  "b": "Kotwica Kołobrzeg",
  "typ": "uklad",
  "nazwa": "Układ Gryf Słupsk – Kotwica Kołobrzeg [od 07.06.2026]"
 },
 {
  "a": "Hutnik Kraków",
  "b": "Wisła Płock",
  "typ": "uklad",
  "nazwa": "Układ Hutnik Kraków – Wisła Płock"
 },
 {
  "a": "KKS 1925 Kalisz",
  "b": "Widzew Łódź",
  "typ": "uklad",
  "nazwa": "Układ KKS 1925 Kalisz – Widzew Łódź [od 09.06.2018]"
 },
 {
  "a": "Kaszubia Kościerzyna",
  "b": "Orkan Rumia MKS",
  "typ": "uklad",
  "nazwa": "Układ Kaszubia Kościerzyna – Orkan Rumia MKS"
 },
 {
  "a": "Korona Kielce",
  "b": "Naprzód Jędrzejów",
  "typ": "uklad",
  "nazwa": "Układ Korona Kielce – Naprzód Jędrzejów"
 },
 {
  "a": "Kujawiak Kowal",
  "b": "Włocłavia Włocławek",
  "typ": "uklad",
  "nazwa": "Układ Kujawiak Kowal – Włocłavia Włocławek [dobre relacje]"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Raków Częstochowa",
  "typ": "uklad",
  "nazwa": "Układ Lechia Gdańsk – Raków Częstochowa"
 },
 {
  "a": "Podlasie Biała Podlaska",
  "b": "Pogoń Siedlce",
  "typ": "uklad",
  "nazwa": "Układ Podlasie Biała Podlaska – Pogoń Siedlce"
 },
 {
  "a": "Polonia Bytom",
  "b": "Zagłębie Lubin",
  "typ": "uklad",
  "nazwa": "Układ Polonia Bytom – Zagłębie Lubin"
 },
 {
  "a": "Stal Rzeszów",
  "b": "Stal Stalowa Wola",
  "typ": "uklad",
  "nazwa": "Układ Stal Rzeszów – Stal Stalowa Wola"
 },
 {
  "a": "Unia Tarnów",
  "b": "Wisła Kraków",
  "typ": "uklad",
  "nazwa": "Układ Unia Tarnów – Wisła Kraków [odnowiony od 07.11.2021]"
 },
 {
  "a": "Widzew Łódź",
  "b": "Wisła Kraków",
  "typ": "uklad"
 },
 {
  "a": "Arka Gdynia",
  "b": "Bałtyk Gdynia",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Bałtyk Gdynia"
 },
 {
  "a": "Arka Gdynia",
  "b": "Chojniczanka Chojnice",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Chojniczanka Chojnice"
 },
 {
  "a": "Arka Gdynia",
  "b": "Gryf Słupsk",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Gryf Słupsk"
 },
 {
  "a": "Arka Gdynia",
  "b": "Jagiellonia Białystok",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Jagiellonia Białystok"
 },
 {
  "a": "Arka Gdynia",
  "b": "Lechia Gdańsk",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Lechia Gdańsk (Derby Trójmiasta)"
 },
 {
  "a": "Arka Gdynia",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Legia Warszawa"
 },
 {
  "a": "Arka Gdynia",
  "b": "Motor Lublin",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Motor Lublin"
 },
 {
  "a": "Arka Gdynia",
  "b": "Pogoń Szczecin",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Pogoń Szczecin"
 },
 {
  "a": "Arka Gdynia",
  "b": "Pomezania Malbork",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Pomezania Malbork"
 },
 {
  "a": "Arka Gdynia",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Wisła Kraków"
 },
 {
  "a": "Arka Gdynia",
  "b": "Wisła Płock",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Wisła Płock"
 },
 {
  "a": "Arka Gdynia",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – ŁKS Łódź"
 },
 {
  "a": "Arka Gdynia",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Arka Gdynia – Śląsk Wrocław"
 },
 {
  "a": "Avia Świdnik",
  "b": "Chełmianka Chełm",
  "typ": "kosa",
  "nazwa": "Kosa Avia Świdnik – Chełmianka Chełm"
 },
 {
  "a": "Avia Świdnik",
  "b": "Górnik Łęczna",
  "typ": "kosa",
  "nazwa": "Kosa Avia Świdnik – Górnik Łęczna"
 },
 {
  "a": "Avia Świdnik",
  "b": "Hetman Zamość",
  "typ": "kosa",
  "nazwa": "Kosa Avia Świdnik – Hetman Zamość"
 },
 {
  "a": "Avia Świdnik",
  "b": "Motor Lublin",
  "typ": "kosa",
  "nazwa": "Kosa Avia Świdnik – Motor Lublin"
 },
 {
  "a": "Bałtyk Gdynia",
  "b": "Kaszubia Kościerzyna",
  "typ": "kosa",
  "nazwa": "Kosa Bałtyk Gdynia – Kaszubia Kościerzyna"
 },
 {
  "a": "Beskid Andrychów",
  "b": "Glinik Gorlice",
  "typ": "kosa",
  "nazwa": "Kosa Beskid Andrychów – Glinik Gorlice"
 },
 {
  "a": "Beskid Andrychów",
  "b": "Podhale Nowy Targ",
  "typ": "kosa",
  "nazwa": "Kosa Beskid Andrychów – Podhale Nowy Targ"
 },
 {
  "a": "Beskid Andrychów",
  "b": "Unia Oświęcim",
  "typ": "kosa",
  "nazwa": "Kosa Beskid Andrychów – Unia Oświęcim"
 },
 {
  "a": "Beskid Andrychów",
  "b": "Unia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Beskid Andrychów – Unia Tarnów"
 },
 {
  "a": "Beskid Andrychów",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Beskid Andrychów – Wisła Kraków"
 },
 {
  "a": "Bytovia Bytów",
  "b": "Kaszubia Kościerzyna",
  "typ": "kosa",
  "nazwa": "Kosa Bytovia Bytów – Kaszubia Kościerzyna"
 },
 {
  "a": "Błękitni Stargard",
  "b": "Energetyk Gryfino",
  "typ": "kosa",
  "nazwa": "Kosa Błękitni Stargard – Energetyk Gryfino"
 },
 {
  "a": "Błękitni Stargard",
  "b": "Kotwica Kołobrzeg",
  "typ": "kosa",
  "nazwa": "Kosa Błękitni Stargard – Kotwica Kołobrzeg"
 },
 {
  "a": "Cartusia Kartuzy",
  "b": "Kaszubia Kościerzyna",
  "typ": "kosa",
  "nazwa": "Kosa Cartusia Kartuzy – Kaszubia Kościerzyna (Derby Kaszub)"
 },
 {
  "a": "Chełmianka Chełm",
  "b": "Hetman Zamość",
  "typ": "kosa",
  "nazwa": "Kosa Chełmianka Chełm – Hetman Zamość"
 },
 {
  "a": "Chełmianka Chełm",
  "b": "Podlasie Biała Podlaska",
  "typ": "kosa",
  "nazwa": "Kosa Chełmianka Chełm – Podlasie Biała Podlaska"
 },
 {
  "a": "Chełmianka Chełm",
  "b": "Pogoń Siedlce",
  "typ": "kosa",
  "nazwa": "Kosa Chełmianka Chełm – Pogoń Siedlce"
 },
 {
  "a": "Chełmianka Chełm",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Chełmianka Chełm – Stal Stalowa Wola"
 },
 {
  "a": "Chełmianka Chełm",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Chełmianka Chełm – Widzew Łódź"
 },
 {
  "a": "Chełminianka Chełmno",
  "b": "Unia Wąbrzeźno",
  "typ": "kosa",
  "nazwa": "Kosa Chełminianka Chełmno – Unia Wąbrzeźno"
 },
 {
  "a": "Chojniczanka Chojnice",
  "b": "Olimpia Grudziądz",
  "typ": "kosa",
  "nazwa": "Kosa Chojniczanka Chojnice – Olimpia Grudziądz"
 },
 {
  "a": "Chojniczanka Chojnice",
  "b": "Pogoń Lębork",
  "typ": "kosa",
  "nazwa": "Kosa Chojniczanka Chojnice – Pogoń Lębork"
 },
 {
  "a": "Chrobry Głogów",
  "b": "Miedź Legnica",
  "typ": "kosa",
  "nazwa": "Kosa Chrobry Głogów – Miedź Legnica (Derby Dolnego Śląska)"
 },
 {
  "a": "Chrobry Głogów",
  "b": "Zagłębie Lubin",
  "typ": "kosa",
  "nazwa": "Kosa Chrobry Głogów – Zagłębie Lubin (Derby Dolnego Śląska)"
 },
 {
  "a": "Chrobry Głogów",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Chrobry Głogów – Śląsk Wrocław"
 },
 {
  "a": "Cracovia",
  "b": "Glinik Gorlice",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Glinik Gorlice"
 },
 {
  "a": "Cracovia",
  "b": "Hutnik Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Hutnik Kraków (Derby Krakowa)"
 },
 {
  "a": "Cracovia",
  "b": "Jagiellonia Białystok",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Jagiellonia Białystok"
 },
 {
  "a": "Cracovia",
  "b": "Lechia Gdańsk",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Lechia Gdańsk"
 },
 {
  "a": "Cracovia",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Legia Warszawa"
 },
 {
  "a": "Cracovia",
  "b": "Motor Lublin",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Motor Lublin"
 },
 {
  "a": "Cracovia",
  "b": "Okocimski KS Brzesko",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Okocimski KS Brzesko"
 },
 {
  "a": "Cracovia",
  "b": "Podhale Nowy Targ",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Podhale Nowy Targ"
 },
 {
  "a": "Cracovia",
  "b": "Pogoń Szczecin",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Pogoń Szczecin"
 },
 {
  "a": "Cracovia",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Ruch Chorzów"
 },
 {
  "a": "Cracovia",
  "b": "Unia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Unia Tarnów"
 },
 {
  "a": "Cracovia",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Widzew Łódź"
 },
 {
  "a": "Cracovia",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Wisła Kraków (Święta Wojna (Derby Krakowa))"
 },
 {
  "a": "Cracovia",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Cracovia – Śląsk Wrocław"
 },
 {
  "a": "Czarni Połaniec",
  "b": "Star Starachowice",
  "typ": "kosa",
  "nazwa": "Kosa Czarni Połaniec – Star Starachowice"
 },
 {
  "a": "Elana Toruń",
  "b": "Goplania Inowrocław",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Goplania Inowrocław"
 },
 {
  "a": "Elana Toruń",
  "b": "Górnik Zabrze",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Górnik Zabrze"
 },
 {
  "a": "Elana Toruń",
  "b": "Kujawiak Kowal",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Kujawiak Kowal"
 },
 {
  "a": "Elana Toruń",
  "b": "Lech Poznań",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Lech Poznań"
 },
 {
  "a": "Elana Toruń",
  "b": "Lechia Gdańsk",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Lechia Gdańsk"
 },
 {
  "a": "Elana Toruń",
  "b": "Legia Chełmża",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Legia Chełmża"
 },
 {
  "a": "Elana Toruń",
  "b": "Miedź Legnica",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Miedź Legnica"
 },
 {
  "a": "Elana Toruń",
  "b": "Motor Lublin",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Motor Lublin"
 },
 {
  "a": "Elana Toruń",
  "b": "Olimpia Grudziądz",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Olimpia Grudziądz"
 },
 {
  "a": "Elana Toruń",
  "b": "Polonia Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Polonia Bydgoszcz (Derby kujawsko-pomorskie (Toruń–Bydgoszcz))"
 },
 {
  "a": "Elana Toruń",
  "b": "Raków Częstochowa",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Raków Częstochowa"
 },
 {
  "a": "Elana Toruń",
  "b": "Resovia",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Resovia"
 },
 {
  "a": "Elana Toruń",
  "b": "Sparta Brodnica",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Sparta Brodnica"
 },
 {
  "a": "Elana Toruń",
  "b": "Włocłavia Włocławek",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Włocłavia Włocławek"
 },
 {
  "a": "Elana Toruń",
  "b": "Zagłębie Lubin",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Zagłębie Lubin [tylko Wikipedia, brak na stadionowioprawcy.net]"
 },
 {
  "a": "Elana Toruń",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – Zawisza Bydgoszcz (Derby kujawsko-pomorskie (Bydgoszcz–Toruń))"
 },
 {
  "a": "Elana Toruń",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Elana Toruń – ŁKS Łódź"
 },
 {
  "a": "Energetyk Gryfino",
  "b": "Flota Świnoujście",
  "typ": "kosa",
  "nazwa": "Kosa Energetyk Gryfino – Flota Świnoujście"
 },
 {
  "a": "Energetyk Gryfino",
  "b": "Gwardia Koszalin",
  "typ": "kosa",
  "nazwa": "Kosa Energetyk Gryfino – Gwardia Koszalin"
 },
 {
  "a": "Flota Świnoujście",
  "b": "Gryf Wejherowo",
  "typ": "kosa",
  "nazwa": "Kosa Flota Świnoujście – Gryf Wejherowo"
 },
 {
  "a": "Flota Świnoujście",
  "b": "Gwardia Koszalin",
  "typ": "kosa",
  "nazwa": "Kosa Flota Świnoujście – Gwardia Koszalin"
 },
 {
  "a": "Flota Świnoujście",
  "b": "Kotwica Kołobrzeg",
  "typ": "kosa",
  "nazwa": "Kosa Flota Świnoujście – Kotwica Kołobrzeg"
 },
 {
  "a": "Flota Świnoujście",
  "b": "Odra Chojna",
  "typ": "kosa",
  "nazwa": "Kosa Flota Świnoujście – Odra Chojna"
 },
 {
  "a": "GKS Katowice",
  "b": "GKS Tychy",
  "typ": "kosa",
  "nazwa": "Kosa GKS Katowice – GKS Tychy (Derby Śląska)"
 },
 {
  "a": "GKS Katowice",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa GKS Katowice – Legia Warszawa"
 },
 {
  "a": "GKS Katowice",
  "b": "Odra Opole",
  "typ": "kosa",
  "nazwa": "Kosa GKS Katowice – Odra Opole"
 },
 {
  "a": "GKS Katowice",
  "b": "Piast Gliwice",
  "typ": "kosa",
  "nazwa": "Kosa GKS Katowice – Piast Gliwice (Derby Śląska)"
 },
 {
  "a": "GKS Katowice",
  "b": "Polonia Bytom",
  "typ": "kosa",
  "nazwa": "Kosa GKS Katowice – Polonia Bytom (Derby Śląska)"
 },
 {
  "a": "GKS Katowice",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa GKS Katowice – Ruch Chorzów (Derby Śląska)"
 },
 {
  "a": "GKS Katowice",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa GKS Katowice – Widzew Łódź"
 },
 {
  "a": "GKS Tychy",
  "b": "Górnik Zabrze",
  "typ": "kosa",
  "nazwa": "Kosa GKS Tychy – Górnik Zabrze (Derby Śląska)"
 },
 {
  "a": "GKS Tychy",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa GKS Tychy – Legia Warszawa"
 },
 {
  "a": "GKS Tychy",
  "b": "Radomiak Radom",
  "typ": "kosa",
  "nazwa": "Kosa GKS Tychy – Radomiak Radom"
 },
 {
  "a": "GKS Tychy",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa GKS Tychy – Ruch Chorzów (Derby Śląska)"
 },
 {
  "a": "GKS Tychy",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa GKS Tychy – Widzew Łódź"
 },
 {
  "a": "GKS Tychy",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa GKS Tychy – Wisła Kraków"
 },
 {
  "a": "Glinik Gorlice",
  "b": "Okocimski KS Brzesko",
  "typ": "kosa",
  "nazwa": "Kosa Glinik Gorlice – Okocimski KS Brzesko"
 },
 {
  "a": "Glinik Gorlice",
  "b": "Sandecja Nowy Sącz",
  "typ": "kosa",
  "nazwa": "Kosa Glinik Gorlice – Sandecja Nowy Sącz"
 },
 {
  "a": "Glinik Gorlice",
  "b": "Tarnovia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Glinik Gorlice – Tarnovia Tarnów"
 },
 {
  "a": "Goplania Inowrocław",
  "b": "Legia Chełmża",
  "typ": "kosa",
  "nazwa": "Kosa Goplania Inowrocław – Legia Chełmża"
 },
 {
  "a": "Goplania Inowrocław",
  "b": "Polonia Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Goplania Inowrocław – Polonia Bydgoszcz"
 },
 {
  "a": "Goplania Inowrocław",
  "b": "Sparta Brodnica",
  "typ": "kosa",
  "nazwa": "Kosa Goplania Inowrocław – Sparta Brodnica"
 },
 {
  "a": "Goplania Inowrocław",
  "b": "Unia Gniewkowo",
  "typ": "kosa",
  "nazwa": "Kosa Goplania Inowrocław – Unia Gniewkowo [Goplania Inowrocław podaje kosę; profil Unii Gniewkowo sprzecznie wpisuje ten klub w „Zgody” (prawdopodobny błąd SO)]"
 },
 {
  "a": "Goplania Inowrocław",
  "b": "Unia Wąbrzeźno",
  "typ": "kosa",
  "nazwa": "Kosa Goplania Inowrocław – Unia Wąbrzeźno"
 },
 {
  "a": "Gryf Słupsk",
  "b": "Gryf Wejherowo",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Słupsk – Gryf Wejherowo"
 },
 {
  "a": "Gryf Słupsk",
  "b": "Gwardia Koszalin",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Słupsk – Gwardia Koszalin"
 },
 {
  "a": "Gryf Słupsk",
  "b": "KKS 1925 Kalisz",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Słupsk – KKS 1925 Kalisz"
 },
 {
  "a": "Gryf Słupsk",
  "b": "Pogoń Lębork",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Słupsk – Pogoń Lębork (Derby Pomorza Środkowego)"
 },
 {
  "a": "Gryf Słupsk",
  "b": "Pogoń Szczecin",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Słupsk – Pogoń Szczecin"
 },
 {
  "a": "Gryf Słupsk",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Słupsk – Zawisza Bydgoszcz"
 },
 {
  "a": "Gryf Wejherowo",
  "b": "Kotwica Kołobrzeg",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Wejherowo – Kotwica Kołobrzeg"
 },
 {
  "a": "Gryf Wejherowo",
  "b": "Lechia Gdańsk",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Wejherowo – Lechia Gdańsk"
 },
 {
  "a": "Gryf Wejherowo",
  "b": "Pogoń Lębork",
  "typ": "kosa",
  "nazwa": "Kosa Gryf Wejherowo – Pogoń Lębork"
 },
 {
  "a": "Gwardia Koszalin",
  "b": "Kotwica Kołobrzeg",
  "typ": "kosa",
  "nazwa": "Kosa Gwardia Koszalin – Kotwica Kołobrzeg"
 },
 {
  "a": "Gwardia Koszalin",
  "b": "Lechia Gdańsk",
  "typ": "kosa",
  "nazwa": "Kosa Gwardia Koszalin – Lechia Gdańsk"
 },
 {
  "a": "Gwardia Koszalin",
  "b": "Odra Chojna",
  "typ": "kosa",
  "nazwa": "Kosa Gwardia Koszalin – Odra Chojna"
 },
 {
  "a": "Gwardia Koszalin",
  "b": "Pogoń Lębork",
  "typ": "kosa",
  "nazwa": "Kosa Gwardia Koszalin – Pogoń Lębork"
 },
 {
  "a": "Gwardia Koszalin",
  "b": "Pogoń Szczecin",
  "typ": "kosa",
  "nazwa": "Kosa Gwardia Koszalin – Pogoń Szczecin"
 },
 {
  "a": "Gwardia Koszalin",
  "b": "Sokół Karlino",
  "typ": "kosa",
  "nazwa": "Kosa Gwardia Koszalin – Sokół Karlino"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Zabrze – Legia Warszawa"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Odra Opole",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Zabrze – Odra Opole"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Piast Gliwice",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Zabrze – Piast Gliwice (Derby Śląska)"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Polonia Bytom",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Zabrze – Polonia Bytom (Derby Śląska)"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Raków Częstochowa",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Zabrze – Raków Częstochowa"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Zabrze – Ruch Chorzów (Wielkie Derby Śląska)"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Zabrze – Widzew Łódź"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Zabrze – Wisła Kraków"
 },
 {
  "a": "Górnik Łęczna",
  "b": "Podlasie Biała Podlaska",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Łęczna – Podlasie Biała Podlaska"
 },
 {
  "a": "Górnik Łęczna",
  "b": "Pogoń Siedlce",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Łęczna – Pogoń Siedlce"
 },
 {
  "a": "Górnik Łęczna",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Górnik Łęczna – Stal Stalowa Wola"
 },
 {
  "a": "Hetman Zamość",
  "b": "Podlasie Biała Podlaska",
  "typ": "kosa",
  "nazwa": "Kosa Hetman Zamość – Podlasie Biała Podlaska"
 },
 {
  "a": "Hetman Zamość",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Hetman Zamość – Stal Stalowa Wola"
 },
 {
  "a": "Hutnik Kraków",
  "b": "KSZO Ostrowiec Świętokrzyski",
  "typ": "kosa",
  "nazwa": "Kosa Hutnik Kraków – KSZO Ostrowiec Świętokrzyski"
 },
 {
  "a": "Hutnik Kraków",
  "b": "Korona Kielce",
  "typ": "kosa",
  "nazwa": "Kosa Hutnik Kraków – Korona Kielce [tylko Wikipedia, brak na stadionowioprawcy.net]"
 },
 {
  "a": "Hutnik Kraków",
  "b": "Resovia",
  "typ": "kosa",
  "nazwa": "Kosa Hutnik Kraków – Resovia [tylko Wikipedia, brak na stadionowioprawcy.net]"
 },
 {
  "a": "Hutnik Kraków",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Hutnik Kraków – Stal Stalowa Wola"
 },
 {
  "a": "Hutnik Kraków",
  "b": "Unia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Hutnik Kraków – Unia Tarnów"
 },
 {
  "a": "Hutnik Kraków",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Hutnik Kraków – Wisła Kraków (Derby Krakowa)"
 },
 {
  "a": "Iskra Białogard",
  "b": "Sokół Karlino",
  "typ": "kosa",
  "nazwa": "Kosa Iskra Białogard – Sokół Karlino"
 },
 {
  "a": "JKS 1909 Jarosław",
  "b": "Stal Mielec",
  "typ": "kosa",
  "nazwa": "Kosa JKS 1909 Jarosław – Stal Mielec"
 },
 {
  "a": "JKS 1909 Jarosław",
  "b": "Stal Rzeszów",
  "typ": "kosa",
  "nazwa": "Kosa JKS 1909 Jarosław – Stal Rzeszów"
 },
 {
  "a": "JKS 1909 Jarosław",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa JKS 1909 Jarosław – Stal Stalowa Wola"
 },
 {
  "a": "JKS 1909 Jarosław",
  "b": "Wisłoka Dębica",
  "typ": "kosa",
  "nazwa": "Kosa JKS 1909 Jarosław – Wisłoka Dębica"
 },
 {
  "a": "Jagiellonia Białystok",
  "b": "Lechia Gdańsk",
  "typ": "kosa",
  "nazwa": "Kosa Jagiellonia Białystok – Lechia Gdańsk"
 },
 {
  "a": "Jagiellonia Białystok",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Jagiellonia Białystok – Legia Warszawa"
 },
 {
  "a": "Jagiellonia Białystok",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Jagiellonia Białystok – Wisła Kraków"
 },
 {
  "a": "KKS 1925 Kalisz",
  "b": "Lech Poznań",
  "typ": "kosa",
  "nazwa": "Kosa KKS 1925 Kalisz – Lech Poznań"
 },
 {
  "a": "KKS 1925 Kalisz",
  "b": "Motor Lublin",
  "typ": "kosa",
  "nazwa": "Kosa KKS 1925 Kalisz – Motor Lublin"
 },
 {
  "a": "KP Starogard Gdański",
  "b": "Kaszubia Kościerzyna",
  "typ": "kosa",
  "nazwa": "Kosa KP Starogard Gdański – Kaszubia Kościerzyna"
 },
 {
  "a": "KP Starogard Gdański",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa KP Starogard Gdański – Zawisza Bydgoszcz"
 },
 {
  "a": "KSZO Ostrowiec Świętokrzyski",
  "b": "Korona Kielce",
  "typ": "kosa",
  "nazwa": "Kosa KSZO Ostrowiec Świętokrzyski – Korona Kielce"
 },
 {
  "a": "KSZO Ostrowiec Świętokrzyski",
  "b": "Naprzód Jędrzejów",
  "typ": "kosa",
  "nazwa": "Kosa KSZO Ostrowiec Świętokrzyski – Naprzód Jędrzejów"
 },
 {
  "a": "KSZO Ostrowiec Świętokrzyski",
  "b": "Radomiak Radom",
  "typ": "kosa",
  "nazwa": "Kosa KSZO Ostrowiec Świętokrzyski – Radomiak Radom"
 },
 {
  "a": "KSZO Ostrowiec Świętokrzyski",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa KSZO Ostrowiec Świętokrzyski – Stal Stalowa Wola"
 },
 {
  "a": "KSZO Ostrowiec Świętokrzyski",
  "b": "Star Starachowice",
  "typ": "kosa",
  "nazwa": "Kosa KSZO Ostrowiec Świętokrzyski – Star Starachowice"
 },
 {
  "a": "Kaszubia Kościerzyna",
  "b": "Lechia Gdańsk",
  "typ": "kosa",
  "nazwa": "Kosa Kaszubia Kościerzyna – Lechia Gdańsk"
 },
 {
  "a": "Korona Kielce",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Korona Kielce – Legia Warszawa"
 },
 {
  "a": "Korona Kielce",
  "b": "Motor Lublin",
  "typ": "kosa",
  "nazwa": "Kosa Korona Kielce – Motor Lublin [tylko Wikipedia, brak na stadionowioprawcy.net]"
 },
 {
  "a": "Korona Kielce",
  "b": "Radomiak Radom",
  "typ": "kosa",
  "nazwa": "Kosa Korona Kielce – Radomiak Radom (Derby regionu świętokrzysko-radomskiego)"
 },
 {
  "a": "Korona Kielce",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Korona Kielce – Stal Stalowa Wola"
 },
 {
  "a": "Korona Kielce",
  "b": "Star Starachowice",
  "typ": "kosa",
  "nazwa": "Kosa Korona Kielce – Star Starachowice"
 },
 {
  "a": "Korona Kielce",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Korona Kielce – Widzew Łódź"
 },
 {
  "a": "Korona Kielce",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Korona Kielce – Wisła Kraków"
 },
 {
  "a": "Kujawiak Kowal",
  "b": "Legia Chełmża",
  "typ": "kosa",
  "nazwa": "Kosa Kujawiak Kowal – Legia Chełmża"
 },
 {
  "a": "Kujawiak Kowal",
  "b": "Polonia Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Kujawiak Kowal – Polonia Bydgoszcz"
 },
 {
  "a": "Kujawiak Kowal",
  "b": "Sparta Brodnica",
  "typ": "kosa",
  "nazwa": "Kosa Kujawiak Kowal – Sparta Brodnica"
 },
 {
  "a": "Kujawiak Kowal",
  "b": "Unia Gniewkowo",
  "typ": "kosa",
  "nazwa": "Kosa Kujawiak Kowal – Unia Gniewkowo [Kujawiak Kowal podaje kosę; profil Unii Gniewkowo sprzecznie wpisuje ten klub w „Zgody” (prawdopodobny błąd SO)]"
 },
 {
  "a": "Kujawiak Kowal",
  "b": "Unia Wąbrzeźno",
  "typ": "kosa",
  "nazwa": "Kosa Kujawiak Kowal – Unia Wąbrzeźno"
 },
 {
  "a": "Kujawiak Kowal",
  "b": "Wisła Dobrzyń nad Wisłą",
  "typ": "kosa",
  "nazwa": "Kosa Kujawiak Kowal – Wisła Dobrzyń nad Wisłą"
 },
 {
  "a": "Lech Poznań",
  "b": "Lechia Gdańsk",
  "typ": "kosa",
  "nazwa": "Kosa Lech Poznań – Lechia Gdańsk"
 },
 {
  "a": "Lech Poznań",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Lech Poznań – Legia Warszawa (Hit Ekstraklasy)"
 },
 {
  "a": "Lech Poznań",
  "b": "Pogoń Szczecin",
  "typ": "kosa",
  "nazwa": "Kosa Lech Poznań – Pogoń Szczecin"
 },
 {
  "a": "Lech Poznań",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Lech Poznań – Ruch Chorzów"
 },
 {
  "a": "Lech Poznań",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Lech Poznań – Widzew Łódź"
 },
 {
  "a": "Lech Poznań",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Lech Poznań – Wisła Kraków"
 },
 {
  "a": "Lech Poznań",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Lech Poznań – Śląsk Wrocław"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Legia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Lechia Gdańsk – Legia Warszawa"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Motor Lublin",
  "typ": "kosa",
  "nazwa": "Kosa Lechia Gdańsk – Motor Lublin [tylko Wikipedia, brak na stadionowioprawcy.net]"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Pogoń Szczecin",
  "typ": "kosa",
  "nazwa": "Kosa Lechia Gdańsk – Pogoń Szczecin (Derby Pomorza)"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Lechia Gdańsk – Ruch Chorzów"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Lechia Gdańsk – Widzew Łódź"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Lechia Gdańsk – Wisła Kraków"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Zagłębie Lubin",
  "typ": "kosa",
  "nazwa": "Kosa Lechia Gdańsk – Zagłębie Lubin"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Lechia Gdańsk – Zawisza Bydgoszcz"
 },
 {
  "a": "Legia Chełmża",
  "b": "Olimpia Grudziądz",
  "typ": "kosa",
  "nazwa": "Kosa Legia Chełmża – Olimpia Grudziądz"
 },
 {
  "a": "Legia Chełmża",
  "b": "Unia Gniewkowo",
  "typ": "kosa",
  "nazwa": "Kosa Legia Chełmża – Unia Gniewkowo [Legia Chełmża podaje kosę; profil Unii Gniewkowo sprzecznie wpisuje ten klub w „Zgody” (prawdopodobny błąd SO)]"
 },
 {
  "a": "Legia Chełmża",
  "b": "Unia Wąbrzeźno",
  "typ": "kosa",
  "nazwa": "Kosa Legia Chełmża – Unia Wąbrzeźno"
 },
 {
  "a": "Legia Chełmża",
  "b": "Włocłavia Włocławek",
  "typ": "kosa",
  "nazwa": "Kosa Legia Chełmża – Włocłavia Włocławek"
 },
 {
  "a": "Legia Chełmża",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Legia Chełmża – Zawisza Bydgoszcz"
 },
 {
  "a": "Legia Warszawa",
  "b": "Polonia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Polonia Warszawa (Derby Warszawy)"
 },
 {
  "a": "Legia Warszawa",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Ruch Chorzów"
 },
 {
  "a": "Legia Warszawa",
  "b": "Sandecja Nowy Sącz",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Sandecja Nowy Sącz"
 },
 {
  "a": "Legia Warszawa",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Widzew Łódź"
 },
 {
  "a": "Legia Warszawa",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Wisła Kraków"
 },
 {
  "a": "Legia Warszawa",
  "b": "Wisła Płock",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Wisła Płock"
 },
 {
  "a": "Legia Warszawa",
  "b": "Zagłębie Lubin",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Zagłębie Lubin"
 },
 {
  "a": "Legia Warszawa",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Zawisza Bydgoszcz"
 },
 {
  "a": "Legia Warszawa",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – ŁKS Łódź"
 },
 {
  "a": "Legia Warszawa",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Legia Warszawa – Śląsk Wrocław"
 },
 {
  "a": "Miedź Legnica",
  "b": "Odra Opole",
  "typ": "kosa",
  "nazwa": "Kosa Miedź Legnica – Odra Opole"
 },
 {
  "a": "Miedź Legnica",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Miedź Legnica – Ruch Chorzów"
 },
 {
  "a": "Miedź Legnica",
  "b": "Unia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Miedź Legnica – Unia Tarnów"
 },
 {
  "a": "Miedź Legnica",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Miedź Legnica – Widzew Łódź"
 },
 {
  "a": "Miedź Legnica",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Miedź Legnica – Wisła Kraków"
 },
 {
  "a": "Miedź Legnica",
  "b": "Zagłębie Lubin",
  "typ": "kosa",
  "nazwa": "Kosa Miedź Legnica – Zagłębie Lubin (Derby Dolnego Śląska)"
 },
 {
  "a": "Motor Lublin",
  "b": "Podlasie Biała Podlaska",
  "typ": "kosa",
  "nazwa": "Kosa Motor Lublin – Podlasie Biała Podlaska"
 },
 {
  "a": "Motor Lublin",
  "b": "Pogoń Siedlce",
  "typ": "kosa",
  "nazwa": "Kosa Motor Lublin – Pogoń Siedlce"
 },
 {
  "a": "Motor Lublin",
  "b": "Radomiak Radom",
  "typ": "kosa",
  "nazwa": "Kosa Motor Lublin – Radomiak Radom"
 },
 {
  "a": "Motor Lublin",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Motor Lublin – Ruch Chorzów"
 },
 {
  "a": "Motor Lublin",
  "b": "Stal Rzeszów",
  "typ": "kosa",
  "nazwa": "Kosa Motor Lublin – Stal Rzeszów"
 },
 {
  "a": "Motor Lublin",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Motor Lublin – Stal Stalowa Wola"
 },
 {
  "a": "Motor Lublin",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Motor Lublin – Widzew Łódź"
 },
 {
  "a": "Motor Lublin",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Motor Lublin – Wisła Kraków"
 },
 {
  "a": "Naprzód Jędrzejów",
  "b": "Star Starachowice",
  "typ": "kosa",
  "nazwa": "Kosa Naprzód Jędrzejów – Star Starachowice"
 },
 {
  "a": "Odra Chojna",
  "b": "Olimp Złocieniec",
  "typ": "kosa",
  "nazwa": "Kosa Odra Chojna – Olimp Złocieniec"
 },
 {
  "a": "Odra Opole",
  "b": "Raków Częstochowa",
  "typ": "kosa",
  "nazwa": "Kosa Odra Opole – Raków Częstochowa"
 },
 {
  "a": "Odra Opole",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Odra Opole – Śląsk Wrocław"
 },
 {
  "a": "Okocimski KS Brzesko",
  "b": "Podhale Nowy Targ",
  "typ": "kosa",
  "nazwa": "Kosa Okocimski KS Brzesko – Podhale Nowy Targ"
 },
 {
  "a": "Okocimski KS Brzesko",
  "b": "Sandecja Nowy Sącz",
  "typ": "kosa",
  "nazwa": "Kosa Okocimski KS Brzesko – Sandecja Nowy Sącz"
 },
 {
  "a": "Okocimski KS Brzesko",
  "b": "Tarnovia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Okocimski KS Brzesko – Tarnovia Tarnów"
 },
 {
  "a": "Olimpia Grudziądz",
  "b": "Rodło Kwidzyn",
  "typ": "kosa",
  "nazwa": "Kosa Olimpia Grudziądz – Rodło Kwidzyn"
 },
 {
  "a": "Olimpia Grudziądz",
  "b": "Sparta Brodnica",
  "typ": "kosa",
  "nazwa": "Kosa Olimpia Grudziądz – Sparta Brodnica"
 },
 {
  "a": "Olimpia Grudziądz",
  "b": "Unia Skierniewice",
  "typ": "kosa",
  "nazwa": "Kosa Olimpia Grudziądz – Unia Skierniewice"
 },
 {
  "a": "Olimpia Grudziądz",
  "b": "Unia Wąbrzeźno",
  "typ": "kosa",
  "nazwa": "Kosa Olimpia Grudziądz – Unia Wąbrzeźno"
 },
 {
  "a": "Olimpia Grudziądz",
  "b": "Włocłavia Włocławek",
  "typ": "kosa",
  "nazwa": "Kosa Olimpia Grudziądz – Włocłavia Włocławek"
 },
 {
  "a": "Piast Gliwice",
  "b": "Polonia Bytom",
  "typ": "kosa",
  "nazwa": "Kosa Piast Gliwice – Polonia Bytom (Derby Śląska)"
 },
 {
  "a": "Piast Gliwice",
  "b": "Raków Częstochowa",
  "typ": "kosa",
  "nazwa": "Kosa Piast Gliwice – Raków Częstochowa"
 },
 {
  "a": "Podbeskidzie Bielsko-Biała",
  "b": "Znicz Pruszków",
  "typ": "kosa",
  "nazwa": "Kosa Podbeskidzie Bielsko-Biała – Znicz Pruszków"
 },
 {
  "a": "Podhale Nowy Targ",
  "b": "Sandecja Nowy Sącz",
  "typ": "kosa",
  "nazwa": "Kosa Podhale Nowy Targ – Sandecja Nowy Sącz"
 },
 {
  "a": "Podhale Nowy Targ",
  "b": "Tarnovia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Podhale Nowy Targ – Tarnovia Tarnów"
 },
 {
  "a": "Podhale Nowy Targ",
  "b": "Unia Oświęcim",
  "typ": "kosa",
  "nazwa": "Kosa Podhale Nowy Targ – Unia Oświęcim"
 },
 {
  "a": "Podlasie Biała Podlaska",
  "b": "Siarka Tarnobrzeg",
  "typ": "kosa",
  "nazwa": "Kosa Podlasie Biała Podlaska – Siarka Tarnobrzeg"
 },
 {
  "a": "Pogoń Grodzisk Mazowiecki",
  "b": "Polonia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Pogoń Grodzisk Mazowiecki – Polonia Warszawa"
 },
 {
  "a": "Pogoń Grodzisk Mazowiecki",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Pogoń Grodzisk Mazowiecki – Widzew Łódź"
 },
 {
  "a": "Pogoń Prabuty",
  "b": "Rodło Kwidzyn",
  "typ": "kosa",
  "nazwa": "Kosa Pogoń Prabuty – Rodło Kwidzyn"
 },
 {
  "a": "Pogoń Siedlce",
  "b": "Polonia Warszawa",
  "typ": "kosa",
  "nazwa": "Kosa Pogoń Siedlce – Polonia Warszawa"
 },
 {
  "a": "Polonia Bydgoszcz",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Polonia Bydgoszcz – Widzew Łódź"
 },
 {
  "a": "Polonia Bydgoszcz",
  "b": "Włocłavia Włocławek",
  "typ": "kosa",
  "nazwa": "Kosa Polonia Bydgoszcz – Włocłavia Włocławek"
 },
 {
  "a": "Polonia Bydgoszcz",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Polonia Bydgoszcz – Zawisza Bydgoszcz (Derby Bydgoszczy)"
 },
 {
  "a": "Polonia Bydgoszcz",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Polonia Bydgoszcz – ŁKS Łódź"
 },
 {
  "a": "Polonia Bytom",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Polonia Bytom – Ruch Chorzów (Derby Śląska) [tylko Wikipedia, brak na stadionowioprawcy.net]"
 },
 {
  "a": "Polonia Warszawa",
  "b": "Radomiak Radom",
  "typ": "kosa",
  "nazwa": "Kosa Polonia Warszawa – Radomiak Radom"
 },
 {
  "a": "Polonia Warszawa",
  "b": "Wisła Płock",
  "typ": "kosa",
  "nazwa": "Kosa Polonia Warszawa – Wisła Płock"
 },
 {
  "a": "Polonia Warszawa",
  "b": "Znicz Pruszków",
  "typ": "kosa",
  "nazwa": "Kosa Polonia Warszawa – Znicz Pruszków"
 },
 {
  "a": "Pomezania Malbork",
  "b": "Rodło Kwidzyn",
  "typ": "kosa",
  "nazwa": "Kosa Pomezania Malbork – Rodło Kwidzyn"
 },
 {
  "a": "Radomiak Radom",
  "b": "Resovia",
  "typ": "kosa",
  "nazwa": "Kosa Radomiak Radom – Resovia"
 },
 {
  "a": "Raków Częstochowa",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Raków Częstochowa – Ruch Chorzów"
 },
 {
  "a": "Raków Częstochowa",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Raków Częstochowa – Widzew Łódź"
 },
 {
  "a": "Raków Częstochowa",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Raków Częstochowa – Wisła Kraków"
 },
 {
  "a": "Resovia",
  "b": "Ruch Chorzów",
  "typ": "kosa",
  "nazwa": "Kosa Resovia – Ruch Chorzów"
 },
 {
  "a": "Resovia",
  "b": "Stal Rzeszów",
  "typ": "kosa",
  "nazwa": "Kosa Resovia – Stal Rzeszów (Derby Rzeszowa)"
 },
 {
  "a": "Resovia",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Resovia – Stal Stalowa Wola (Derby Podkarpacia)"
 },
 {
  "a": "Resovia",
  "b": "Widzew Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Resovia – Widzew Łódź"
 },
 {
  "a": "Ruch Chorzów",
  "b": "Włocłavia Włocławek",
  "typ": "kosa",
  "nazwa": "Kosa Ruch Chorzów – Włocłavia Włocławek"
 },
 {
  "a": "Ruch Chorzów",
  "b": "Zagłębie Lubin",
  "typ": "kosa",
  "nazwa": "Kosa Ruch Chorzów – Zagłębie Lubin"
 },
 {
  "a": "Ruch Chorzów",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Ruch Chorzów – Zawisza Bydgoszcz"
 },
 {
  "a": "Ruch Chorzów",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Ruch Chorzów – ŁKS Łódź"
 },
 {
  "a": "Ruch Chorzów",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Ruch Chorzów – Śląsk Wrocław"
 },
 {
  "a": "Sandecja Nowy Sącz",
  "b": "Unia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Sandecja Nowy Sącz – Unia Tarnów"
 },
 {
  "a": "Sandecja Nowy Sącz",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Sandecja Nowy Sącz – Wisła Kraków"
 },
 {
  "a": "Sandecja Nowy Sącz",
  "b": "Wisłoka Dębica",
  "typ": "kosa",
  "nazwa": "Kosa Sandecja Nowy Sącz – Wisłoka Dębica"
 },
 {
  "a": "Siarka Tarnobrzeg",
  "b": "Stal Mielec",
  "typ": "kosa",
  "nazwa": "Kosa Siarka Tarnobrzeg – Stal Mielec"
 },
 {
  "a": "Siarka Tarnobrzeg",
  "b": "Stal Rzeszów",
  "typ": "kosa",
  "nazwa": "Kosa Siarka Tarnobrzeg – Stal Rzeszów"
 },
 {
  "a": "Siarka Tarnobrzeg",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Siarka Tarnobrzeg – Stal Stalowa Wola"
 },
 {
  "a": "Sparta Brodnica",
  "b": "Unia Wąbrzeźno",
  "typ": "kosa",
  "nazwa": "Kosa Sparta Brodnica – Unia Wąbrzeźno"
 },
 {
  "a": "Sparta Brodnica",
  "b": "Włocłavia Włocławek",
  "typ": "kosa",
  "nazwa": "Kosa Sparta Brodnica – Włocłavia Włocławek"
 },
 {
  "a": "Stal Mielec",
  "b": "Stal Rzeszów",
  "typ": "kosa",
  "nazwa": "Kosa Stal Mielec – Stal Rzeszów (Derby Podkarpacia)"
 },
 {
  "a": "Stal Mielec",
  "b": "Stal Stalowa Wola",
  "typ": "kosa",
  "nazwa": "Kosa Stal Mielec – Stal Stalowa Wola (Derby Podkarpacia)"
 },
 {
  "a": "Stal Mielec",
  "b": "Wisłoka Dębica",
  "typ": "kosa",
  "nazwa": "Kosa Stal Mielec – Wisłoka Dębica"
 },
 {
  "a": "Stal Rzeszów",
  "b": "Wisłoka Dębica",
  "typ": "kosa",
  "nazwa": "Kosa Stal Rzeszów – Wisłoka Dębica"
 },
 {
  "a": "Stal Rzeszów",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Stal Rzeszów – ŁKS Łódź"
 },
 {
  "a": "Stal Stalowa Wola",
  "b": "Wisłoka Dębica",
  "typ": "kosa",
  "nazwa": "Kosa Stal Stalowa Wola – Wisłoka Dębica"
 },
 {
  "a": "Tarnovia Tarnów",
  "b": "Unia Tarnów",
  "typ": "kosa",
  "nazwa": "Kosa Tarnovia Tarnów – Unia Tarnów (Derby Tarnowa)"
 },
 {
  "a": "Tarnovia Tarnów",
  "b": "Wisła Kraków",
  "typ": "kosa",
  "nazwa": "Kosa Tarnovia Tarnów – Wisła Kraków"
 },
 {
  "a": "Unia Skierniewice",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Unia Skierniewice – ŁKS Łódź"
 },
 {
  "a": "Unia Tarnów",
  "b": "Wisłoka Dębica",
  "typ": "kosa",
  "nazwa": "Kosa Unia Tarnów – Wisłoka Dębica"
 },
 {
  "a": "Unia Wąbrzeźno",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Unia Wąbrzeźno – Zawisza Bydgoszcz"
 },
 {
  "a": "Widzew Łódź",
  "b": "Włocłavia Włocławek",
  "typ": "kosa",
  "nazwa": "Kosa Widzew Łódź – Włocłavia Włocławek"
 },
 {
  "a": "Widzew Łódź",
  "b": "Zagłębie Lubin",
  "typ": "kosa",
  "nazwa": "Kosa Widzew Łódź – Zagłębie Lubin"
 },
 {
  "a": "Widzew Łódź",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Widzew Łódź – Zawisza Bydgoszcz"
 },
 {
  "a": "Widzew Łódź",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Widzew Łódź – ŁKS Łódź (Derby Łodzi)"
 },
 {
  "a": "Widzew Łódź",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Widzew Łódź – Śląsk Wrocław"
 },
 {
  "a": "Wisła Kraków",
  "b": "Wisła Płock",
  "typ": "kosa",
  "nazwa": "Kosa Wisła Kraków – Wisła Płock"
 },
 {
  "a": "Wisła Kraków",
  "b": "Włocłavia Włocławek",
  "typ": "kosa",
  "nazwa": "Kosa Wisła Kraków – Włocłavia Włocławek"
 },
 {
  "a": "Wisła Kraków",
  "b": "Zagłębie Lubin",
  "typ": "kosa",
  "nazwa": "Kosa Wisła Kraków – Zagłębie Lubin"
 },
 {
  "a": "Wisła Kraków",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Wisła Kraków – Zawisza Bydgoszcz"
 },
 {
  "a": "Wisła Kraków",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Wisła Kraków – ŁKS Łódź"
 },
 {
  "a": "Wisła Kraków",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Wisła Kraków – Śląsk Wrocław"
 },
 {
  "a": "Wisła Płock",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa",
  "nazwa": "Kosa Wisła Płock – Zawisza Bydgoszcz"
 },
 {
  "a": "Wisła Płock",
  "b": "Znicz Pruszków",
  "typ": "kosa",
  "nazwa": "Kosa Wisła Płock – Znicz Pruszków"
 },
 {
  "a": "Zagłębie Lubin",
  "b": "ŁKS Łódź",
  "typ": "kosa",
  "nazwa": "Kosa Zagłębie Lubin – ŁKS Łódź"
 },
 {
  "a": "Zagłębie Lubin",
  "b": "Śląsk Wrocław",
  "typ": "kosa",
  "nazwa": "Kosa Zagłębie Lubin – Śląsk Wrocław (Derby Dolnego Śląska)"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Polonia Bydgoszcz",
  "typ": "zgoda"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Wisła Płock",
  "typ": "zgoda"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Lechia Gdańsk",
  "typ": "uklad"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Hutnik Kraków",
  "typ": "uklad"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "ŁKS Łomża",
  "typ": "uklad"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Legia Warszawa",
  "typ": "zgoda"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Zagłębie Sosnowiec",
  "typ": "zgoda"
 },
 {
  "a": "Wigry Suwałki",
  "b": "Granica Kętrzyn",
  "typ": "zgoda"
 },
 {
  "a": "MKS Mazur Ełk",
  "b": "Jagiellonia Białystok",
  "typ": "zgoda"
 },
 {
  "a": "MKS Mazur Ełk",
  "b": "Warmia Grajewo",
  "typ": "zgoda"
 },
 {
  "a": "Wigry Suwałki",
  "b": "Jagiellonia Białystok",
  "typ": "kosa"
 },
 {
  "a": "Wigry Suwałki",
  "b": "ŁKS Łomża",
  "typ": "kosa"
 },
 {
  "a": "Wigry Suwałki",
  "b": "Sparta Augustów",
  "typ": "kosa"
 },
 {
  "a": "Wigry Suwałki",
  "b": "MKS Mazur Ełk",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Stomil Olsztyn",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Jeziorak Iława",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Arka Gdynia",
  "typ": "kosa"
 },
 {
  "a": "Wigry Suwałki",
  "b": "Olimpia Grudziądz",
  "typ": "zgoda"
 },
 {
  "a": "ŁKS Łomża",
  "b": "Sparta 1951 Szepietowo",
  "typ": "zgoda"
 },
 {
  "a": "ŁKS Łomża",
  "b": "FK Voždovac Belgrad",
  "typ": "zgoda"
 },
 {
  "a": "Motor Lubawa",
  "b": "Błękitni Orneta",
  "typ": "zgoda"
 },
 {
  "a": "Orzeł Kolno",
  "b": "KS Śniadowo",
  "typ": "zgoda"
 },
 {
  "a": "Mazur Pisz",
  "b": "Mławianka Mława",
  "typ": "zgoda"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Raków Częstochowa",
  "typ": "uklad"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Widzew Łódź",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Ruch Chorzów",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Śląsk Wrocław",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Lechia Gdańsk",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Wisła Płock",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Olimpia Grudziądz",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Pomezania Malbork",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "ŁKS Łomża",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "MKS Mazur Ełk",
  "typ": "kosa"
 },
 {
  "a": "Olimpia Elbląg",
  "b": "Sokół Ostróda",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Legia Warszawa",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Widzew Łódź",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Arka Gdynia",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Zawisza Bydgoszcz",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Jagiellonia Białystok",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Górnik Zabrze",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Olimpia Grudziądz",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Wigry Suwałki",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "Granica Kętrzyn",
  "typ": "kosa"
 },
 {
  "a": "Stomil Olsztyn",
  "b": "MKS Mazur Ełk",
  "typ": "kosa"
 },
 {
  "a": "Jagiellonia Białystok",
  "b": "ŁKS Łomża",
  "typ": "kosa"
 },
 {
  "a": "ŁKS Łomża",
  "b": "MKS Mazur Ełk",
  "typ": "kosa"
 },
 {
  "a": "ŁKS Łomża",
  "b": "Warmia Grajewo",
  "typ": "kosa"
 },
 {
  "a": "ŁKS Łomża",
  "b": "Granica Kętrzyn",
  "typ": "kosa"
 },
 {
  "a": "Wigry Suwałki",
  "b": "Warmia Grajewo",
  "typ": "kosa"
 },
 {
  "a": "MKS Mazur Ełk",
  "b": "Sparta Augustów",
  "typ": "kosa"
 },
 {
  "a": "MKS Mazur Ełk",
  "b": "Granica Kętrzyn",
  "typ": "kosa"
 },
 {
  "a": "MKS Mazur Ełk",
  "b": "Sokół Ostróda",
  "typ": "kosa"
 },
 {
  "a": "MKS Mazur Ełk",
  "b": "Mazur Pisz",
  "typ": "kosa"
 },
 {
  "a": "Warmia Grajewo",
  "b": "Granica Kętrzyn",
  "typ": "kosa"
 },
 {
  "a": "Warmia Grajewo",
  "b": "Sparta Augustów",
  "typ": "kosa"
 },
 {
  "a": "Warmia Grajewo",
  "b": "Sparta 1951 Szepietowo",
  "typ": "kosa"
 },
 {
  "a": "Warmia Grajewo",
  "b": "Sokół Ostróda",
  "typ": "kosa"
 },
 {
  "a": "Warmia Grajewo",
  "b": "Mazur Pisz",
  "typ": "kosa"
 },
 {
  "a": "Warmia Grajewo",
  "b": "Orzeł Kolno",
  "typ": "kosa"
 },
 {
  "a": "Sokół Ostróda",
  "b": "Drwęca Nowe Miasto Lubawskie",
  "typ": "kosa"
 },
 {
  "a": "Sokół Ostróda",
  "b": "Motor Lubawa",
  "typ": "kosa"
 },
 {
  "a": "Sokół Ostróda",
  "b": "Granica Kętrzyn",
  "typ": "kosa"
 },
 {
  "a": "Sokół Ostróda",
  "b": "Olimpia Grudziądz",
  "typ": "kosa"
 },
 {
  "a": "Jeziorak Iława",
  "b": "Motor Lubawa",
  "typ": "kosa"
 },
 {
  "a": "Jeziorak Iława",
  "b": "Arka Gdynia",
  "typ": "kosa"
 },
 {
  "a": "Jeziorak Iława",
  "b": "Zatoka Braniewo",
  "typ": "kosa"
 },
 {
  "a": "Jeziorak Iława",
  "b": "Granica Kętrzyn",
  "typ": "kosa"
 },
 {
  "a": "Drwęca Nowe Miasto Lubawskie",
  "b": "Motor Lubawa",
  "typ": "kosa"
 },
 {
  "a": "Drwęca Nowe Miasto Lubawskie",
  "b": "Sparta Brodnica",
  "typ": "kosa"
 },
 {
  "a": "Drwęca Nowe Miasto Lubawskie",
  "b": "Świt Nowy Dwór Mazowiecki",
  "typ": "kosa"
 },
 {
  "a": "Motor Lubawa",
  "b": "Granica Kętrzyn",
  "typ": "kosa"
 },
 {
  "a": "Motor Lubawa",
  "b": "Zatoka Braniewo",
  "typ": "kosa"
 },
 {
  "a": "Motor Lubawa",
  "b": "Czarni Olecko",
  "typ": "kosa"
 },
 {
  "a": "Mazur Pisz",
  "b": "Znicz Biała Piska",
  "typ": "kosa"
 },
 {
  "a": "Mazur Pisz",
  "b": "Orlęta Reszel",
  "typ": "kosa"
 },
 {
  "a": "Orzeł Kolno",
  "b": "Tur Bielsk Podlaski",
  "typ": "kosa"
 },
 {
  "a": "Orzeł Kolno",
  "b": "Olimpia Zambrów",
  "typ": "kosa"
 },
 {
  "a": "Orzeł Kolno",
  "b": "Ruch Wysokie Mazowieckie",
  "typ": "kosa"
 },
 {
  "a": "Orzeł Kolno",
  "b": "Sparta Augustów",
  "typ": "kosa"
 },
 {
  "a": "Granica Kętrzyn",
  "b": "Mazur Ełk",
  "typ": "kosa"
 },
 {
  "a": "Sokół Ostróda",
  "b": "Mazur Ełk",
  "typ": "kosa"
 },
 {
  "a": "Mazur Pisz",
  "b": "Mazur Ełk",
  "typ": "kosa"
 },
 {
  "a": "Warmia Grajewo",
  "b": "Mazur Ełk",
  "typ": "zgoda"
 },
 {
  "a": "Warmia Grajewo",
  "b": "Sparta Szepietowo",
  "typ": "kosa"
 },
 {
  "a": "Mazovia Mińsk Mazowiecki",
  "b": "Pogoń Siedlce",
  "typ": "zgoda"
 },
 {
  "a": "Mazovia Mińsk Mazowiecki",
  "b": "Podlasie Biała Podlaska",
  "typ": "zgoda"
 },
 {
  "a": "Mazovia Mińsk Mazowiecki",
  "b": "Polonia Warszawa",
  "typ": "kosa"
 },
 {
  "a": "Pelikan Łowicz",
  "b": "Unia Skierniewice",
  "typ": "zgoda"
 },
 {
  "a": "Lechia Tomaszów Mazowiecki",
  "b": "Pelikan Łowicz",
  "typ": "zgoda"
 },
 {
  "a": "Lechia Tomaszów Mazowiecki",
  "b": "Unia Skierniewice",
  "typ": "zgoda"
 },
 {
  "a": "Pelikan Łowicz",
  "b": "Świt Nowy Dwór Mazowiecki",
  "typ": "kosa"
 },
 {
  "a": "Unia Skierniewice",
  "b": "Świt Nowy Dwór Mazowiecki",
  "typ": "kosa"
 },
 {
  "a": "Lechia Tomaszów Mazowiecki",
  "b": "Świt Nowy Dwór Mazowiecki",
  "typ": "kosa"
 },
 {
  "a": "Polonia Warszawa",
  "b": "Świt Nowy Dwór Mazowiecki",
  "typ": "kosa"
 },
 {
  "a": "Legia Warszawa",
  "b": "Pelikan Łowicz",
  "typ": "kosa"
 },
 {
  "a": "Pelikan Łowicz",
  "b": "Radomiak Radom",
  "typ": "kosa"
 },
 {
  "a": "Lechia Gdańsk",
  "b": "Polonia Bytom",
  "typ": "kosa"
 },
 {
  "a": "GKS Katowice",
  "b": "Lechia Gdańsk",
  "typ": "kosa"
 },
 {
  "a": "Górnik Zabrze",
  "b": "Lechia Gdańsk",
  "typ": "kosa"
 },
 {
  "a": "Legia Warszawa",
  "b": "Polonia Bytom",
  "typ": "kosa"
 },
 {"a": "Noteć Łabiszyn", "b": "Unia Gniewkowo", "typ": "zgoda"},
 {"a": "Zgoda Byczyna", "b": "Szczakowianka Jaworzno", "typ": "zgoda"},
 {"a": "KS Wasilków", "b": "Supraślanka Supraśl", "typ": "kosa"},
 {"a": "KS Wasilków", "b": "Olimpia Zambrów", "typ": "kosa"},
 {"a": "KS Wasilków", "b": "Wissa Szczuczyn", "typ": "kosa"},
 {"a": "Tur Bielsk Podlaski", "b": "ŁKS Łomża", "typ": "kosa"},
 {"a": "Tur Bielsk Podlaski", "b": "Sparta Szepietowo", "typ": "kosa"},
 {"a": "Ruch Wysokie Mazowieckie", "b": "Sparta Szepietowo", "typ": "kosa"},
 {"a": "Ruch Wysokie Mazowieckie", "b": "ŁKS Łomża", "typ": "kosa"},
 {"a": "Wissa Szczuczyn", "b": "Jagiellonia Białystok", "typ": "kosa"},
 {"a": "Wissa Szczuczyn", "b": "Ruch Wysokie Mazowieckie", "typ": "kosa"},
 {"a": "Pogoń Łapy", "b": "ŁKS Łomża", "typ": "kosa"},
 {"a": "Cresovia Siemiatycze", "b": "Tur Bielsk Podlaski", "typ": "kosa"},
 {"a": "Cresovia Siemiatycze", "b": "Husar Nurzec", "typ": "kosa"},
 {"a": "Sparta Augustów", "b": "Jagiellonia Białystok", "typ": "kosa"},
 {"a": "Sparta Augustów", "b": "Sparta Szepietowo", "typ": "kosa"},
 {"a": "Sparta Augustów", "b": "Mazur Ełk", "typ": "kosa"},
 {"a": "Sparta Augustów", "b": "ŁKS Łomża", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Ruch Wysokie Mazowieckie", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Tur Bielsk Podlaski", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Sparta Augustów", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Wigry Suwałki", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Olimpia Zambrów", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Mazur Ełk", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Orlęta Czyżew", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Granica Kętrzyn", "typ": "kosa"},
 {"a": "Sparta 1951 Szepietowo", "b": "Jagiellonia Białystok", "typ": "kosa"},
 {"a": "Orlęta Czyżew", "b": "Sparta Szepietowo", "typ": "kosa"},
 {"a": "Wisła Dobrzyń nad Wisłą", "b": "Kasztelan Sierpc", "typ": "zgoda"},
 {"a": "Wisła Dobrzyń nad Wisłą", "b": "Tłuchovia Tłuchowo", "typ": "kosa"},
 {"a": "Wisła Dobrzyń nad Wisłą", "b": "Włocłavia Włocławek", "typ": "kosa"},
 {"a": "Wisła Dobrzyń nad Wisłą", "b": "Ziemowit Osięciny", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Pałuczanka Żnin", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Notecianka Pakość", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Legia Chełmża", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Elana Toruń", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Chełminianka Chełmno", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Unia Wąbrzeźno", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Unia Gniewkowo", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Polonia Bydgoszcz", "typ": "kosa"},
 {"a": "Pogoń Mogilno", "b": "Cuiavia Inowrocław", "typ": "kosa"},
 {"a": "Lech Rypin", "b": "Mień Lipno", "typ": "kosa"},
 {"a": "Lech Rypin", "b": "Sparta Brodnica", "typ": "kosa"},
 {"a": "Lech Rypin", "b": "Gopło Kruszwica", "typ": "kosa"},
 {"a": "Chełminianka Chełmno", "b": "Wda Świecie", "typ": "kosa"},
 {"a": "Chełminianka Chełmno", "b": "Goplania Inowrocław", "typ": "kosa"},
 {"a": "Chełminianka Chełmno", "b": "Pałuczanka Żnin", "typ": "kosa"},
 {"a": "Chełminianka Chełmno", "b": "Gopło Kruszwica", "typ": "kosa"},
 {"a": "Chełminianka Chełmno", "b": "Elana Toruń", "typ": "kosa"},
 {"a": "Chełminianka Chełmno", "b": "Polonia Bydgoszcz", "typ": "kosa"},
 {"a": "Victoria Koronowo", "b": "Elana Toruń", "typ": "kosa"},
 {"a": "Victoria Koronowo", "b": "Gwiazda Bydgoszcz", "typ": "kosa"},
 {"a": "Victoria Koronowo", "b": "Notecianka Pakość", "typ": "kosa"},
 {"a": "Victoria Koronowo", "b": "Wda Świecie", "typ": "kosa"},
 {"a": "Victoria Koronowo", "b": "Legia Chełmża", "typ": "kosa"},
 {"a": "Victoria Koronowo", "b": "Start Radziejów", "typ": "kosa"},
 {"a": "Victoria Koronowo", "b": "Pałuczanka Żnin", "typ": "kosa"},
 {"a": "Victoria Koronowo", "b": "Górnik Konin", "typ": "kosa"},
 {"a": "Wisła Nowe", "b": "Start Warlubie", "typ": "kosa"},
 {"a": "Wisła Nowe", "b": "Zawisza Bydgoszcz", "typ": "kosa"},
 {"a": "Wisła Nowe", "b": "Olimpia Elbląg", "typ": "kosa"},
 {"a": "Wisła Nowe", "b": "Rodło Kwidzyn", "typ": "kosa"},
 {"a": "Wisła Nowe", "b": "Wda Świecie", "typ": "kosa"},
 {"a": "Wisła Nowe", "b": "Gopło Kruszwica", "typ": "kosa"},
 {"a": "Pałuczanka Żnin", "b": "Legia Chełmża", "typ": "kosa"},
 {"a": "Pałuczanka Żnin", "b": "Sparta Brodnica", "typ": "kosa"},
 {"a": "Pałuczanka Żnin", "b": "Lech Rypin", "typ": "kosa"},
 {"a": "Pałuczanka Żnin", "b": "Goplania Inowrocław", "typ": "kosa"},
 {"a": "Pałuczanka Żnin", "b": "Gopło Kruszwica", "typ": "kosa"},
 {"a": "Pałuczanka Żnin", "b": "Dąb Barcin", "typ": "kosa"},
 {"a": "Pałuczanka Żnin", "b": "Szubinianka Szubin", "typ": "kosa"},
 {"a": "Pałuczanka Żnin", "b": "Unia Gniewkowo", "typ": "kosa"},
 {"a": "Gopło Kruszwica", "b": "Start Radziejów", "typ": "kosa"},
 {"a": "Gopło Kruszwica", "b": "Elana Toruń", "typ": "kosa"},
 {"a": "Gopło Kruszwica", "b": "Unia Gniewkowo", "typ": "kosa"},
 {"a": "Gopło Kruszwica", "b": "Unia Wąbrzeźno", "typ": "kosa"},
 {"a": "Gopło Kruszwica", "b": "Legia Chełmża", "typ": "kosa"},
 {"a": "Gopło Kruszwica", "b": "Sparta Brodnica", "typ": "kosa"},
 {"a": "Notecianka Pakość", "b": "Zagłębie Piechcin", "typ": "zgoda"},
 {"a": "Notecianka Pakość", "b": "Dąb Barcin", "typ": "kosa"},
 {"a": "Notecianka Pakość", "b": "Unia Janikowo", "typ": "kosa"},
 {"a": "Notecianka Pakość", "b": "Goplania Inowrocław", "typ": "kosa"},
 {"a": "Notecianka Pakość", "b": "Noteć Inowrocław", "typ": "kosa"},
 {"a": "Notecianka Pakość", "b": "Kujawiak Włocławek", "typ": "kosa"},
 {"a": "Notecianka Pakość", "b": "Sparta Brodnica", "typ": "kosa"},
 {"a": "Notecianka Pakość", "b": "Kujawianka Izbica Kujawska", "typ": "kosa"},
 {"a": "Szubinianka Szubin", "b": "Dąb Barcin", "typ": "zgoda"},
 {"a": "Szubinianka Szubin", "b": "Zagłębie Piechcin", "typ": "kosa"},
 {"a": "Dąb Barcin", "b": "Noteć Łabiszyn", "typ": "kosa"},
 {"a": "Zdrój Ciechocinek", "b": "Jagiellonka Nieszawa", "typ": "kosa"},
 {"a": "Zdrój Ciechocinek", "b": "Start Radziejów", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "Elana Toruń", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "Zagłębie Piechcin", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "Unia Gniewkowo", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "Unia Wąbrzeźno", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "KKS Kalisz", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "Legia Chełmża", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "Sparta Brodnica", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "KP Starogard Gdański", "typ": "kosa"},
 {"a": "Unia Janikowo", "b": "Pałuczanka Żnin", "typ": "kosa"},
 {"a": "Noteć Inowrocław", "b": "Astoria Bydgoszcz", "typ": "kosa"},
 {"a": "Noteć Inowrocław", "b": "Cuiavia Inowrocław", "typ": "kosa"},
 {"a": "Noteć Inowrocław", "b": "Śląsk Wrocław", "typ": "kosa"},
 {"a": "Noteć Inowrocław", "b": "Kotwica Kołobrzeg", "typ": "kosa"},
 {"a": "Noteć Inowrocław", "b": "Spójnia Stargard", "typ": "kosa"},
 {"a": "Noteć Inowrocław", "b": "Polonia Leszno", "typ": "kosa"},
 {"a": "Cyklon Kończewice", "b": "Mustang Ostaszewo", "typ": "kosa"},
 {"a": "Czarni Nakło nad Notecią", "b": "Goplania Inowrocław", "typ": "zgoda"},
 {"a": "Czarni Nakło nad Notecią", "b": "Sokół Mogilno", "typ": "zgoda"},
 {"a": "Czarni Nakło nad Notecią", "b": "Tor Laskowice Pomorskie", "typ": "zgoda"},
 {"a": "Drwęca Golub-Dobrzyń", "b": "Unia Wąbrzeźno", "typ": "zgoda"},
 {"a": "Łokietek Brześć Kujawski", "b": "Ziemowit Osięciny", "typ": "zgoda"},
 {"a": "Noteć Gębice", "b": "Unia Janikowo", "typ": "kosa"},
 {"a": "Pomorzanin Serock", "b": "Start Pruszcz", "typ": "kosa"},
 {"a": "Pomorzanin Toruń", "b": "Rekord Bielsko-Biała", "typ": "zgoda"},
 {"a": "Start Radziejów", "b": "Lech Rypin", "typ": "zgoda"},
 {"a": "Start Radziejów", "b": "Ziemowit Osięciny", "typ": "kosa"},
 {"a": "Start Radziejów", "b": "Zjednoczeni Piotrków Kujawski", "typ": "kosa"},
 {"a": "Wzgórze Raciążek", "b": "Cukrownik Chełmica", "typ": "kosa"},
 {"a": "Wzgórze Raciążek", "b": "Jagiellonka Nieszawa", "typ": "kosa"},
 {"a": "Zagłębie Piechcin", "b": "Dąb Barcin", "typ": "kosa"},
 {"a": "Spójnia Świdwin", "b": "MKS Karlino", "typ": "zgoda"},
 {"a": "Spójnia Świdwin", "b": "Iskra Białogard", "typ": "kosa"},
 {"a": "Spójnia Świdwin", "b": "Gwardia Koszalin", "typ": "kosa"},
 {"a": "Spójnia Świdwin", "b": "Gryf Polanów", "typ": "kosa"},
 {"a": "Spójnia Świdwin", "b": "Ikar Krosino", "typ": "kosa"},
 {"a": "Spójnia Świdwin", "b": "Światowid Łobez", "typ": "kosa"},
 {"a": "Darłovia Darłowo", "b": "Gwardia Koszalin", "typ": "kosa"},
 {"a": "Darłovia Darłowo", "b": "Iskra Białogard", "typ": "kosa"},
 {"a": "Darłovia Darłowo", "b": "Sława Sławno", "typ": "kosa"},
 {"a": "Darłovia Darłowo", "b": "Gryf Polanów", "typ": "kosa"},
 {"a": "Pomorzanin Nowogard", "b": "Sparta Gryfice", "typ": "zgoda"},
 {"a": "Gryf Polanów", "b": "Iskra Białogard", "typ": "zgoda"},
 {"a": "Światowid 63 Łobez", "b": "Spójnia Świdwin", "typ": "kosa"},
 {"a": "Światowid 63 Łobez", "b": "Darzbór Szczecinek", "typ": "kosa"},
 {"a": "Orzeł Wałcz", "b": "Wielim Szczecinek", "typ": "kosa"},
 {"a": "Wielim Szczecinek", "b": "Darzbór Szczecinek", "typ": "kosa"},
 {"a": "Olimp Złocieniec", "b": "Pogoń Barlinek", "typ": "kosa"},
 {"a": "Olimp Złocieniec", "b": "Drawa Drawsko Pomorskie", "typ": "kosa"},
 {"a": "Olimp Złocieniec", "b": "Dąb Dębno", "typ": "kosa"},
 {"a": "Olimp Złocieniec", "b": "Energetyk Gryfino", "typ": "kosa"},
 {"a": "Osadnik Myślibórz", "b": "Dąb Dębno", "typ": "kosa"},
 {"a": "Osadnik Myślibórz", "b": "Pogoń Barlinek", "typ": "kosa"},
 {"a": "Osadnik Myślibórz", "b": "Mieszko Mieszkowice", "typ": "kosa"},
 {"a": "Osadnik Myślibórz", "b": "Stal Lipiany", "typ": "kosa"},
 {"a": "Mazur Wydminy", "b": "Pogoń Ryn", "typ": "kosa"},
 {"a": "MKS Ruciane-Nida", "b": "Mazur Pisz", "typ": "kosa"},
 {"a": "Start Kruklanki", "b": "Vęgoria Węgorzewo", "typ": "kosa"},
 {"a": "GKS Ossa Biskupiec", "b": "GKS Wikielec", "typ": "zgoda"},
 {"a": "Syrena Młynary", "b": "Błękitni Orneta", "typ": "zgoda"},
 {"a": "Syrena Młynary", "b": "Wałsza Pieniężno", "typ": "kosa"},
 {"a": "Syrena Młynary", "b": "Zatoka Braniewo", "typ": "kosa"},
 {"a": "GKS Stawiguda", "b": "SKS Gwardia Szczytno", "typ": "zgoda"},
 {"a": "Czarni Olecko", "b": "Rominta Gołdap", "typ": "kosa"},
 {"a": "Iskra Narzym", "b": "Polonia Iłowo", "typ": "kosa"},
 {"a": "Mamry Giżycko", "b": "Granica Kętrzyn", "typ": "kosa"},
 {"a": "Mrągowia Mrągowo", "b": "Granica Kętrzyn", "typ": "kosa"},
 {"a": "Polonia Pasłęk", "b": "Błękitni Orneta", "typ": "kosa"},
 {"a": "Wałsza Pieniężno", "b": "Błękitni Orneta", "typ": "kosa"},
 {"a": "Błękitni Orneta", "b": "Zatoka Braniewo", "typ": "kosa"},
 {"a": "Błękitni Orneta", "b": "Stomil Olsztyn", "typ": "kosa"},
 {"a": "Błękitni Orneta", "b": "DKS Dobre Miasto", "typ": "kosa"},
 {"a": "Błękitni Orneta", "b": "Polonia Lidzbark Warmiński", "typ": "kosa"},
 {"a": "DKS Dobre Miasto", "b": "Olimpia Elbląg", "typ": "kosa"},
 {"a": "DKS Dobre Miasto", "b": "Mazur Ełk", "typ": "kosa"},
 {"a": "DKS Dobre Miasto", "b": "Granica Kętrzyn", "typ": "kosa"},
 {"a": "DKS Dobre Miasto", "b": "Drwęca Nowe Miasto Lubawskie", "typ": "kosa"},
 {"a": "DKS Dobre Miasto", "b": "Arka Gdynia", "typ": "kosa"},
 {"a": "DKS Dobre Miasto", "b": "Zatoka Braniewo", "typ": "kosa"},
 {"a": "Polonia Iłowo", "b": "Legia Warszawa", "typ": "kosa"},
 {"a": "Polonia Iłowo", "b": "Mławianka Mława", "typ": "kosa"},
 {"a": "Rominta Gołdap", "b": "Pogoń Banie Mazurskie", "typ": "zgoda"},
 {"a": "Tęcza Biskupiec", "b": "Granica Kętrzyn", "typ": "kosa"},
 {"a": "Unia Susz", "b": "Drwęca Nowe Miasto Lubawskie", "typ": "kosa"},
 {"a": "Unia Susz", "b": "Pogoń Prabuty", "typ": "kosa"},
 {"a": "Zatoka Braniewo", "b": "Stomil Olsztyn", "typ": "kosa"},
 {"a": "Zatoka Braniewo", "b": "Olimpia Elbląg", "typ": "kosa"},
 {"a": "Zatoka Braniewo", "b": "Lechia Gdańsk", "typ": "kosa"},
 {"a": "Znicz Biała Piska", "b": "Wissa Szczuczyn", "typ": "kosa"},
 {"a": "Stolem Gniewino", "b": "Sokół Bożepole Wielkie", "typ": "zgoda"},
 {"a": "Stolem Gniewino", "b": "Bałtyk Gdynia", "typ": "kosa"},
 {"a": "Stolem Gniewino", "b": "Chojniczanka Chojnice", "typ": "kosa"},
 {"a": "Wybrzeże Rewalskie Rewal", "b": "Flota Świnoujście", "typ": "kosa"},
 {"a": "BKS Bochnia", "b": "Hutnik Kraków", "typ": "kosa"},
 {"a": "BKS Bochnia", "b": "Beskid Andrychów", "typ": "kosa"},
 {"a": "BKS Bochnia", "b": "Cracovia", "typ": "kosa"},
 {"a": "BKS Bochnia", "b": "Tarnovia Tarnów", "typ": "kosa"},
 {"a": "Orzeł Dębno", "b": "Jadowniczanka Jadowniki", "typ": "zgoda"},
 {"a": "Orzeł Dębno", "b": "Pagen Gnojnik", "typ": "kosa"},
 {"a": "Orzeł Dębno", "b": "Tarnovia Tarnów", "typ": "kosa"},
 {"a": "Orzeł Dębno", "b": "Polan Żabno", "typ": "kosa"},
 {"a": "Przebój Wolbrom", "b": "KS Olkusz", "typ": "kosa"},
 {"a": "Wisła Szczucin", "b": "Tarnovia Tarnów", "typ": "kosa"},
 {"a": "Wisła Szczucin", "b": "Okocimski Brzesko", "typ": "kosa"},
 {"a": "Wisła Szczucin", "b": "Dąbrovia Dąbrowa Tarnowska", "typ": "kosa"},
 {"a": "Wisła Szczucin", "b": "Tuchovia Tuchów", "typ": "kosa"},
 {"a": "Wisła Szczucin", "b": "Polan Żabno", "typ": "kosa"},
 {"a": "MKS Libiąż", "b": "KS Chełmek", "typ": "zgoda"},
 {"a": "MKS Libiąż", "b": "Fablok Chrzanów", "typ": "kosa"},
 {"a": "MKS Libiąż", "b": "Górnik Brzeszcze", "typ": "kosa"},
 {"a": "MKS Libiąż", "b": "Victoria Jaworzno", "typ": "kosa"},
 {"a": "MKS Libiąż", "b": "Szczakowianka Jaworzno", "typ": "kosa"},
 {"a": "MKS Libiąż", "b": "Unia Oświęcim", "typ": "kosa"},
 {"a": "MKS Libiąż", "b": "KS Olkusz", "typ": "kosa"},
 {"a": "MKS Libiąż", "b": "Zagłębie Sosnowiec", "typ": "kosa"},
 {"a": "MKS Libiąż", "b": "BKS Stal Bielsko-Biała", "typ": "kosa"}, { "a": "Stilon Gorzów Wielkopolski", "b": "Chrobry Głogów", "typ": "zgoda"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Sporting Charleroi", "typ": "zgoda"},
 { "a": "Polmo Kożuchów", "b": "BKS Bolesławiec", "typ": "uklad"},
 { "a": "Polmo Kożuchów", "b": "Chojnowianka Chojnów", "typ": "uklad"},
 { "a": "Polmo Kożuchów", "b": "Stal Chocianów", "typ": "uklad"},
 { "a": "Promień Żary", "b": "Miedź Legnica", "typ": "zgoda"},
 { "a": "Promień Żary", "b": "Stal Jasień", "typ": "uklad"},
 { "a": "Stal Jasień", "b": "Promień Żary", "typ": "uklad"},
 { "a": "Róża Różanki", "b": "Uran Trzebicz", "typ": "zgoda"},
 { "a": "Odra Opole", "b": "FC Sopron", "typ": "zgoda"},
 { "a": "Chemik Kędzierzyn-Koźle", "b": "Raków Częstochowa", "typ": "zgoda"},
 { "a": "Stal Brzeg", "b": "Fortuna Głogówek", "typ": "zgoda"},
 { "a": "Stal Brzeg", "b": "Włókniarz Pabianice", "typ": "zgoda"},
 { "a": "Włókniarz Kietrz", "b": "Odra Wodzisław Śląski", "typ": "zgoda"},
 { "a": "Fortuna Głogówek", "b": "Stal Brzeg", "typ": "zgoda"},
 { "a": "Uran Trzebicz", "b": "Róża Różanki", "typ": "zgoda"},
 { "a": "Stal Chocianów", "b": "Polmo Kożuchów", "typ": "zgoda"},
 { "a": "Chrobry Głogów", "b": "Stilon Gorzów Wielkopolski", "typ": "zgoda"},
 { "a": "Sporting Charleroi", "b": "Stilon Gorzów Wielkopolski", "typ": "zgoda"},
 { "a": "Miedź Legnica", "b": "Promień Żary", "typ": "zgoda"},
 { "a": "Odra Wodzisław Śląski", "b": "Włókniarz Kietrz", "typ": "zgoda"},
 { "a": "BKS Bolesławiec", "b": "Polmo Kożuchów", "typ": "uklad"},
 { "a": "Chojnowianka Chojnów", "b": "Polmo Kożuchów", "typ": "uklad"},
 { "a": "FC Sopron", "b": "Odra Opole", "typ": "zgoda"},
 { "a": "Raków Częstochowa", "b": "Chemik Kędzierzyn-Koźle", "typ": "zgoda"},
 { "a": "Włókniarz Pabianice", "b": "Stal Brzeg", "typ": "zgoda"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Dąb Dębno", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Energetyk Gryfino", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Flota Świnoujście", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Gwardia Koszalin", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Górnik Konin", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Karkonosze Jelenia Góra", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Kotwica Kołobrzeg", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Lechia Gdańsk", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Miedź Legnica", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Odra Chojna", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Odra Wodzisław Śląski", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Pogoń Barlinek", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Pogoń Szczecin", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Pogoń Świebodzin", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Polmo Kożuchów", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Polonia Bytom", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Wisła Kraków", "typ": "kosa"},
 { "a": "Stilon Gorzów Wielkopolski", "b": "Zagłębie Lubin", "typ": "kosa"},
 { "a": "Carina Gubin", "b": "Chrobry Głogów", "typ": "kosa"},
 { "a": "Carina Gubin", "b": "Karkonosze Jelenia Góra", "typ": "kosa"},
 { "a": "Carina Gubin", "b": "Lechia Zielona Góra", "typ": "kosa"},
 { "a": "Celuloza Kostrzyn", "b": "Ilanka Rzepin", "typ": "kosa"},
 { "a": "Czarni Żagań", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 { "a": "Czarni Żagań", "b": "Górnik Wałbrzych", "typ": "kosa"},
 { "a": "Czarni Żagań", "b": "Miedź Legnica", "typ": "kosa"},
 { "a": "Czarni Żagań", "b": "Polmo Kożuchów", "typ": "kosa"},
 { "a": "Czarni Żagań", "b": "Promień Żary", "typ": "kosa"},
 { "a": "Dozamet Nowa Sól", "b": "Chrobry Głogów", "typ": "kosa"},
 { "a": "Dozamet Nowa Sól", "b": "Czarni Żagań", "typ": "kosa"},
 { "a": "Dozamet Nowa Sól", "b": "Karkonosze Jelenia Góra", "typ": "kosa"},
 { "a": "Dozamet Nowa Sól", "b": "Miedź Legnica", "typ": "kosa"},
 { "a": "Dozamet Nowa Sól", "b": "Pogoń Świebodzin", "typ": "kosa"},
 { "a": "Dozamet Nowa Sól", "b": "Promień Żary", "typ": "kosa"},
 { "a": "Dozamet Nowa Sól", "b": "Stal Jasień", "typ": "kosa"},
 { "a": "Dozamet Nowa Sól", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Lechia Zielona Góra", "b": "Carina Gubin", "typ": "kosa"},
 { "a": "Lubniewiczanka Lubniewice", "b": "KS Glisno", "typ": "kosa"},
 { "a": "Lubuszanin Drezdenko", "b": "Łucznik Strzelce Krajeńskie", "typ": "kosa"},
 { "a": "Orzeł Międzyrzecz", "b": "Ilanka Rzepin", "typ": "kosa"},
 { "a": "Pogoń Skwierzyna", "b": "Budowlani Murzynowo", "typ": "kosa"},
 { "a": "Pogoń Skwierzyna", "b": "Warta Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Pogoń Świebodzin", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 { "a": "Pogoń Świebodzin", "b": "Rokita Brzeg Dolny", "typ": "kosa"},
 { "a": "Pogoń Świebodzin", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Polmo Kożuchów", "b": "Czarni Żagań", "typ": "kosa"},
 { "a": "Polmo Kożuchów", "b": "Meblarz Nowe Miasteczko", "typ": "kosa"},
 { "a": "Polmo Kożuchów", "b": "Miedź Legnica", "typ": "kosa"},
 { "a": "Polmo Kożuchów", "b": "Promień Żary", "typ": "kosa"},
 { "a": "Polmo Kożuchów", "b": "Sprotavia Szprotawa", "typ": "kosa"},
 { "a": "Polmo Kożuchów", "b": "Stal Jasień", "typ": "kosa"},
 { "a": "Polmo Kożuchów", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Polonia Słubice", "b": "Ilanka Rzepin", "typ": "kosa"},
 { "a": "Promień Żary", "b": "Chrobry Głogów", "typ": "kosa"},
 { "a": "Promień Żary", "b": "Czarni Żagań", "typ": "kosa"},
 { "a": "Promień Żary", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 { "a": "Promień Żary", "b": "Górnik Wałbrzych", "typ": "kosa"},
 { "a": "Promień Żary", "b": "Polmo Kożuchów", "typ": "kosa"},
 { "a": "Promień Żary", "b": "Polonia Świdnica", "typ": "kosa"},
 { "a": "Promień Żary", "b": "Unia Kunice Żary", "typ": "kosa"},
 { "a": "Promień Żary", "b": "Zagłębie Lubin", "typ": "kosa"},
 { "a": "Stal Jasień", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 { "a": "Stal Jasień", "b": "Polmo Kożuchów", "typ": "kosa"},
 { "a": "Ilanka Rzepin", "b": "Celuloza Kostrzyn", "typ": "kosa"},
 { "a": "Ilanka Rzepin", "b": "Orzeł Międzyrzecz", "typ": "kosa"},
 { "a": "Ilanka Rzepin", "b": "Polonia Słubice", "typ": "kosa"},
 { "a": "Łucznik Strzelce Krajeńskie", "b": "Lubuszanin Drezdenko", "typ": "kosa"},
 { "a": "Łucznik Strzelce Krajeńskie", "b": "Róża Różanki", "typ": "kosa"},
 { "a": "Róża Różanki", "b": "Łucznik Strzelce Krajeńskie", "typ": "kosa"},
 { "a": "Iskra Gorzów Wielkopolski", "b": "PUKS Maksymilian Gorzów", "typ": "kosa"},
 { "a": "Iskra Gorzów Wielkopolski", "b": "Polonia Lipki Wielkie", "typ": "kosa"},
 { "a": "PUKS Maksymilian Gorzów", "b": "Iskra Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Spartak Deszczno", "b": "Piast Karnin", "typ": "kosa"},
 { "a": "Polonia Lipki Wielkie", "b": "Iskra Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Budowlani Murzynowo", "b": "Pogoń Skwierzyna", "typ": "kosa"},
 { "a": "Kasztelania Santok", "b": "Warta Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Warta Gorzów Wielkopolski", "b": "Kasztelania Santok", "typ": "kosa"},
 { "a": "Warta Gorzów Wielkopolski", "b": "Pogoń Skwierzyna", "typ": "kosa"},
 { "a": "Unia Kunice Żary", "b": "Promień Żary", "typ": "kosa"},
 { "a": "Meblarz Nowe Miasteczko", "b": "Odra Bytom Odrzański", "typ": "kosa"},
 { "a": "Meblarz Nowe Miasteczko", "b": "Polmo Kożuchów", "typ": "kosa"},
 { "a": "Sprotavia Szprotawa", "b": "Polmo Kożuchów", "typ": "kosa"},
 { "a": "KS Glisno", "b": "Lubniewiczanka Lubniewice", "typ": "kosa"},
 { "a": "Odra Opole", "b": "BKS Stal Bielsko-Biała", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Chemik Kędzierzyn-Koźle", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Chojniczanka Chojnice", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Chrobry Głogów", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Elana Toruń", "typ": "kosa"},
 { "a": "Odra Opole", "b": "GKS Jastrzębie", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Lechia Gdańsk", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Legia Warszawa", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Motor Lublin", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Piast Gliwice", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Podbeskidzie Bielsko-Biała", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Pogoń Szczecin", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Polonia Nysa", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Polonia Warszawa", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Ruch Chorzów", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Ruch Radzionków", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Ruch Zdzieszowice", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Stal Brzeg", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Stal Stalowa Wola", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Start Namysłów", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Stomil Olsztyn", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Widzew Łódź", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Wisła Kraków", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Włókniarz Kietrz", "typ": "kosa"},
 { "a": "Odra Opole", "b": "Zagłębie Sosnowiec", "typ": "kosa"},
 { "a": "Chemik Kędzierzyn-Koźle", "b": "Górnik Zabrze", "typ": "kosa"},
 { "a": "Chemik Kędzierzyn-Koźle", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Chemik Kędzierzyn-Koźle", "b": "Polonia Bytom", "typ": "kosa"},
 { "a": "Chemik Kędzierzyn-Koźle", "b": "ROW Rybnik", "typ": "kosa"},
 { "a": "Chemik Kędzierzyn-Koźle", "b": "Ruch Chorzów", "typ": "kosa"},
 { "a": "MKS Kluczbork", "b": "Ruch Zdzieszowice", "typ": "kosa"},
 { "a": "Polonia Nysa", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Ruch Zdzieszowice", "b": "LZS Leśnica", "typ": "kosa"},
 { "a": "Ruch Zdzieszowice", "b": "MKS Kluczbork", "typ": "kosa"},
 { "a": "Ruch Zdzieszowice", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Stal Brzeg", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Stal Brzeg", "b": "Olimpia Lewin Brzeski", "typ": "kosa"},
 { "a": "Stal Brzeg", "b": "Stal Chocianów", "typ": "kosa"},
 { "a": "Start Namysłów", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Unia Krapkowice", "b": "Unia Tułowice", "typ": "kosa"},
 { "a": "Włókniarz Kietrz", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Włókniarz Kietrz", "b": "Ruch Chorzów", "typ": "kosa"},
 { "a": "Włókniarz Kietrz", "b": "Unia Racibórz", "typ": "kosa"},
 { "a": "Olimpia Lewin Brzeski", "b": "Stal Brzeg", "typ": "kosa"},
 { "a": "Unia Tułowice", "b": "Unia Krapkowice", "typ": "kosa"},
 { "a": "LZS Leśnica", "b": "Ruch Zdzieszowice", "typ": "kosa"},
 { "a": "Piast Karnin", "b": "Spartak Deszczno", "typ": "kosa"},
 { "a": "Odra Bytom Odrzański", "b": "Meblarz Nowe Miasteczko", "typ": "kosa"},
 { "a": "Stal Chocianów", "b": "Stal Brzeg", "typ": "kosa"},
 { "a": "Chrobry Głogów", "b": "Carina Gubin", "typ": "kosa"},
 { "a": "Chrobry Głogów", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 { "a": "Chrobry Głogów", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Chrobry Głogów", "b": "Promień Żary", "typ": "kosa"},
 { "a": "Dąb Dębno", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Energetyk Gryfino", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Flota Świnoujście", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Gwardia Koszalin", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Górnik Konin", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Karkonosze Jelenia Góra", "b": "Carina Gubin", "typ": "kosa"},
 { "a": "Karkonosze Jelenia Góra", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 { "a": "Karkonosze Jelenia Góra", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Kotwica Kołobrzeg", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Lechia Gdańsk", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Lechia Gdańsk", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Miedź Legnica", "b": "Czarni Żagań", "typ": "kosa"},
 { "a": "Miedź Legnica", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 { "a": "Miedź Legnica", "b": "Polmo Kożuchów", "typ": "kosa"},
 { "a": "Miedź Legnica", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Odra Chojna", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Odra Wodzisław Śląski", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Pogoń Barlinek", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Pogoń Szczecin", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Pogoń Szczecin", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Polonia Bytom", "b": "Chemik Kędzierzyn-Koźle", "typ": "kosa"},
 { "a": "Polonia Bytom", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Wisła Kraków", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Wisła Kraków", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Zagłębie Lubin", "b": "Promień Żary", "typ": "kosa"},
 { "a": "Zagłębie Lubin", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 { "a": "Widzew Łódź", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Górnik Wałbrzych", "b": "Czarni Żagań", "typ": "kosa"},
 { "a": "Górnik Wałbrzych", "b": "Promień Żary", "typ": "kosa"},
 { "a": "Polonia Świdnica", "b": "Promień Żary", "typ": "kosa"},
 { "a": "Ruch Radzionków", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Rokita Brzeg Dolny", "b": "Pogoń Świebodzin", "typ": "kosa"},
 { "a": "BKS Stal Bielsko-Biała", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Chojniczanka Chojnice", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Elana Toruń", "b": "Odra Opole", "typ": "kosa"},
 { "a": "GKS Jastrzębie", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Górnik Zabrze", "b": "Chemik Kędzierzyn-Koźle", "typ": "kosa"},
 { "a": "Legia Warszawa", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Motor Lublin", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Piast Gliwice", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Podbeskidzie Bielsko-Biała", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Polonia Warszawa", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Ruch Chorzów", "b": "Chemik Kędzierzyn-Koźle", "typ": "kosa"},
 { "a": "Ruch Chorzów", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Ruch Chorzów", "b": "Włókniarz Kietrz", "typ": "kosa"},
 { "a": "Stal Stalowa Wola", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Stomil Olsztyn", "b": "Odra Opole", "typ": "kosa"},
 { "a": "Zagłębie Sosnowiec", "b": "Odra Opole", "typ": "kosa"},
 { "a": "ROW Rybnik", "b": "Chemik Kędzierzyn-Koźle", "typ": "kosa"},
 { "a": "Unia Racibórz", "b": "Włókniarz Kietrz", "typ": "kosa"},
 {"a": "Pogoń II Świebodzin", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 {"a": "Pogoń II Świebodzin", "b": "Rokita Brzeg Dolny", "typ": "kosa"},
 {"a": "Pogoń II Świebodzin", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 {"a": "Carina II Gubin", "b": "Chrobry Głogów", "typ": "kosa"},
 {"a": "Carina II Gubin", "b": "Karkonosze Jelenia Góra", "typ": "kosa"},
 {"a": "Carina II Gubin", "b": "Lechia Zielona Góra", "typ": "kosa"},
 {"a": "Czarni II Żagań", "b": "Dozamet Nowa Sól", "typ": "kosa"},
 {"a": "Czarni II Żagań", "b": "Górnik Wałbrzych", "typ": "kosa"},
 {"a": "Czarni II Żagań", "b": "Miedź Legnica", "typ": "kosa"},
 {"a": "Czarni II Żagań", "b": "Polmo Kożuchów", "typ": "kosa"},
 {"a": "Czarni II Żagań", "b": "Promień Żary", "typ": "kosa"},
 {"a": "Korona II Kożuchów", "b": "Czarni Żagań", "typ": "kosa"},
 {"a": "Korona II Kożuchów", "b": "Meblarz Nowe Miasteczko", "typ": "kosa"},
 {"a": "Korona II Kożuchów", "b": "Miedź Legnica", "typ": "kosa"},
 {"a": "Korona II Kożuchów", "b": "Promień Żary", "typ": "kosa"},
 {"a": "Korona II Kożuchów", "b": "Sprotavia Szprotawa", "typ": "kosa"},
 {"a": "Korona II Kożuchów", "b": "Stal Jasień", "typ": "kosa"},
 {"a": "Korona II Kożuchów", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 {"a": "Sprotavia II Szprotawa", "b": "Polmo Kożuchów", "typ": "kosa"},
 {"a": "Celuloza Kostrzyn nad Odrą", "b": "Ilanka Rzepin", "typ": "kosa"},
 {"a": "Lubuszanin Drezdenko", "b": "Łucznik Strzelce", "typ": "kosa"},
 {"a": "Orzeł Międzyrzecz", "b": "Stal Gorzów Wlkp.", "typ": "kosa"},
 {"a": "Czarni Browar Witnica", "b": "Iskra Gorzów Wielkopolski", "typ": "zgoda"},
 {"a": "Maksymilian Gorzów Wielkopolski", "b": "Iskra Gorzów Wielkopolski", "typ": "kosa"},
 {"a": "Lubniewiczanka Lubniewice", "b": "Stal Gorzów Wlkp.", "typ": "kosa"},
 {"a": "Zagłębie Sosnowiec", "b": "Legia Warszawa", "typ": "zgoda"},
 {"a": "Zagłębie Sosnowiec", "b": "GKS Katowice", "typ": "kosa"},
 {"a": "Górnik Polkowice", "b": "Chrobry Głogów", "typ": "kosa"},
 {"a": "ROW 1964 Rybnik", "b": "Wisłoka Dębica", "typ": "zgoda"},
 {"a": "ROW 1964 Rybnik", "b": "GKS Jastrzębie", "typ": "kosa"},
 {"a": "Barycz Sułów", "b": "PKS Wołów", "typ": "zgoda"},
 {"a": "Barycz Sułów", "b": "Polonia Świdnica", "typ": "kosa"},
 {"a": "Karkonosze Jelenia Góra", "b": "Olimpia Kowary", "typ": "zgoda"},
 {"a": "Karkonosze Jelenia Góra", "b": "Górnik Wałbrzych", "typ": "kosa"},
 {"a": "Stilon Gorzów Wielkopolski", "b": "Chrobry Głogów (1985-1995 i od 2012 r.)", "typ": "zgoda"},
 {"a": "Stal II Brzeg", "b": "Fortuna Głogówek", "typ": "zgoda"},
 {"a": "Stal II Brzeg", "b": "Włókniarz Pabianice", "typ": "zgoda"},
 {"a": "Stal II Brzeg", "b": "Olimpia Lewin Brzeski", "typ": "kosa"},
 {"a": "Start II Namysłów", "b": "Odra Opole", "typ": "kosa"},
 {"a": "GLKS Kietrz", "b": "Odra Wodzisław Śląski", "typ": "zgoda"},
 {"a": "GLKS Kietrz", "b": "Odra Opole", "typ": "kosa"},
 {"a": "GLKS Kietrz", "b": "Ruch Chorzów", "typ": "kosa"},
 {"a": "GLKS Kietrz", "b": "Unia Racibórz", "typ": "kosa"},
 {"a": "Korona Kożuchów", "b": "Promień Żary", "typ": "kosa"},
 {"a": "Korona Kożuchów", "b": "Sprotavia Szprotawa", "typ": "kosa"},
 {"a": "Korona Kożuchów", "b": "Stilon Gorzów Wielkopolski", "typ": "kosa"},
 {"a": "Korona Kożuchów", "b": "Czarni Żagań", "typ": "kosa"},
 {"a": "Korona Kożuchów", "b": "MKS Nowe Miasteczko", "typ": "kosa"}
];

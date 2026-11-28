// Prawdziwe przyśpiewki kibiców (krótkie, z dopingu) — tylko znalezione w źródłach (śpiewniki kibiców, prace naukowe,
// fora, opisy nagrań). Wulgaryzmy w grze są wykropkowane (cenzura w engine/przyspiewki.ts); przyśpiewki z przemocą,
// rasistowskie, antysemickie i homofobiczne pominięte.
export interface Przyspiewka { tekst: string; typ: "doping" | "miasto" | "zgoda" | "rywal" | "okrzyk"; rywal?: string }
export interface PrzyspiewkiKlubu { hymn?: string; przyspiewki: Przyspiewka[] }
export const PRZYSPIEWKI: Record<string, PrzyspiewkiKlubu> = {
"Stomil Olsztyn": {
"przyspiewki": [
{
"tekst": "Historia ta! Tak długo trwa! Jesteśmy z Tobą już od wielu lat! Po życia kres! Aż trwa ta więź! Nic nie jest w stanie zniszczyć jej! Stomil ole!",
"typ": "doping"
},
{
"tekst": "Tam gdzie tysiące jezior! Pełno lasów, dzikich zwierząt! Jest kraina wiecznej wiary! Stomil Olsztyn klub nas stary!",
"typ": "miasto"
},
{
"tekst": "Moja jedyna miłość to OKS. W naszych żyłach płynie biało-niebieska krew. Dziś na stadionie nasza drużyna gra. Wstańcie koledzy z ławek, Stomil trzy punkty ma.",
"typ": "doping"
},
{
"tekst": "Zawsze za Nią pójdziemy, nawet po życia kres. Stomil my Cię kochamy, serce za OKS!",
"typ": "doping"
},
{
"tekst": "Jej oddałem serce swe. Ona najpiękniejszym snem. Nie zdradziła nigdy mnie. Kocham ją, a Ona mnie. Dwa kolory mienią się. Jezior błękit oraz biel. To drużyna z Olsztyna. A na imię Stomil ma!",
"typ": "miasto"
},
{
"tekst": "Leoleoleole! Leeeeeeooooo! Stoooooooomiiiiil! Oooooolsztyyyn!",
"typ": "okrzyk"
},
{
"tekst": "Jesteśmy zawsze tam, gdzie nasz OKS gra. Aejaooo! Hej Stomil gol!",
"typ": "doping"
},
{
"tekst": "Pamiętam, że jestem z Olsztyna. Pamiętam i mam to we krwi. Pamiętam i nie zapomnę. Nigdy nie zejdę na psy!",
"typ": "miasto"
},
{
"tekst": "To my, to my, Stomil Olsztyn to my!",
"typ": "okrzyk"
},
{
"tekst": "Olsztyński Stomil polski klub. Potężny i wspaniały. Biało-niebieskie barwy ma. A w herbie jest kormoran. I chociaż klub ten stary jest, każdy mu wierny jest.",
"typ": "miasto"
},
{
"tekst": "To my fanatycy z warmińskiej stolicy. A Stomil! Za OKS! Pójdziemy aż po życia kres!",
"typ": "miasto"
},
{
"tekst": "Olalaoli! Olalaole! Dziś Stomil wygra, a my za to najebiemy się!",
"typ": "doping"
},
{
"tekst": "Obojętnie gdzie grasz, tam spodziewaj się nas. Bo najlepszy w Polsce jest tylko Stomil OKS!",
"typ": "doping"
},
{
"tekst": "Nieważne w której lidze Stomil gra. Na zawsze swych kibiców wiernych ma. Jesteśmy zawsze tam, gdzie nasz OKS gra. Stomilu Ty nigdy nie będziesz sam.",
"typ": "doping"
},
{
"tekst": "Zabawa trwa, Stomil z Olsztyna!",
"typ": "okrzyk"
},
{
"tekst": "Lalalalalalala! I wszyscy „hej sialala”! OKS trzy punkty ma! OKS wygra mecz. A my śpiewamy pieśń…",
"typ": "doping"
},
{
"tekst": "Wczoraj obiecałaś mi na pewno, że trzy punkty dzisiaj będą. Ja zaufałem Ci… Wiara! Nasza wiara nie zachwiana! Bo jest w Tobie zakochana. Stomil! Stomil, Stomil hej OKS!",
"typ": "doping"
},
{
"tekst": "Olsztyn czeka, my czekamy! Na zdobycie pierwszej bramy!",
"typ": "okrzyk"
},
{
"tekst": "Stomil ole! Stomil ole! Stomil Olsztyn aejaoo!",
"typ": "okrzyk"
},
{
"tekst": "Dumą Warmii jest? Tylko Stomil OKS!",
"typ": "okrzyk"
},
{
"tekst": "Ludzie mówią mi: weź dorośnij ty. Głośno mówię ja: Stomil to mój świat…",
"typ": "doping"
},
{
"tekst": "Marsz! Do boju marsz! Zwycięstwo czeka nas… Więc wstań! Głowę do góry wznieś! Śpiewaj naszą pieśń! Forza OKS!",
"typ": "doping"
},
{
"tekst": "Jeden pije setek kilka, drugi piwem pasie brzuch. Nasz ideał – nożna piłka, wieczna walka wieczny trud. Hej Stomil Olsztyn! Tylko nasz OKS Olsztyn może wszystkim szczęście dać!",
"typ": "doping"
},
{
"tekst": "Forza OKS, Forza OKS, Forza Forza Forza OKS!",
"typ": "okrzyk"
},
{
"tekst": "Nie dla nas dziś porażki smak. Nie dla nas forma zła! Niech z gardeł wszystkich płynie pieśń! Stomil Olsztyn wygra mecz!",
"typ": "doping"
},
{
"tekst": "Lalala Lalala! Stomil Olsztyn! Lalala Lalala! Duma Warmii! Lalala Lalala! Tysiąc jezior! Lalala Lalala! Wszyscy wiedzą! Oooo Stomil Olsztyn! Oooo OKS!",
"typ": "miasto"
},
{
"tekst": "Kto wygra mecz? Stomil! Kto? Stomil! Kto? Stomil Stomil Stomil! Do boju, do boju, do boju OKS!",
"typ": "okrzyk"
},
{
"tekst": "Literka O! Literka K! Literka S! Jak OKS!",
"typ": "okrzyk"
},
{
"tekst": "Stomil Olsztyn kocham Cię! Tobie dałem serce swe! Serce swoje jedyne! Dałem swojej drużynie!",
"typ": "doping"
},
{
"tekst": "Czy wygrywasz, czy nie, ja i tak kocham Cię. W moim sercu Stomil i na dobre i na złe!",
"typ": "doping"
},
{
"tekst": "Sektor biało-niebieski! Sektor biało-niebieski!",
"typ": "okrzyk"
},
{
"tekst": "Stomil Olsztyn Polonia! Stomil Olsztyn Polonia! Stomil Olsztyn Polonia!",
"typ": "zgoda",
"rywal": "Polonia Bydgoszcz"
},
{
"tekst": "Wiele wrażeń, niejeden promil! Tak się bawi Hutnik i Stomil!",
"typ": "zgoda",
"rywal": "Hutnik Kraków"
}
]
},
"Granica Kętrzyn": {
"przyspiewki": [
{
"tekst": "Grać na całego, i walczyć do upadłego! Grać na całego, i walczyć do upadłego!",
"typ": "doping"
},
{
"tekst": "Tańczymy lambada, lambada, lambada, tańczymy lambada, małego walczyka, hej! Tańczą go kibice, kibice, kibice, tańczą go kibice Granicy z Kętrzyna, hej!",
"typ": "doping"
},
{
"tekst": "Trzy kolory mienią się, zieleń, błękit oraz biel, całe życie śpiewać chcę, vivat, vivat KKS!",
"typ": "doping"
},
{
"tekst": "Hej KKS-ie, klubie kochany, masz dziś 3 punkty, mecz jest wygrany, więc kto jest z nami, niech razem śpiewa: kto wygra mecz? Granica! Kto? Granica! Do boju, do boju, do boju, Granica!",
"typ": "okrzyk"
},
{
"tekst": "Granico, kocham cię, Tobie dałem serce swe, serce swoje jedyne, dałem ukochanej drużynie, lalalalalalala",
"typ": "doping"
},
{
"tekst": "Jesteśmy z wami, Granica, jesteśmy z wami!",
"typ": "doping"
},
{
"tekst": "Duma Mazur jest, tylko Kętrzyn KKS, tylko Kętrzyn KKS",
"typ": "miasto"
},
{
"tekst": "Czy wygrywasz, czy nie, ja i tak kocham cię, w moim sercu KKS, i na dobre, i na złe",
"typ": "doping"
},
{
"tekst": "Nasza Granico, my wspieramy cię, bo w naszych sercach jest kętrzyński KKS, aż po życia kres",
"typ": "doping"
},
{
"tekst": "Na północnym wschodzie Polski, gdzie niełatwo żyje się, w małym mieście urodzony, co nazywa Kętrzyn się…",
"typ": "miasto"
},
{
"tekst": "My jesteśmy kętrzyniacy, cała Polska o tym wie, naszym klubem jest Granica, czy szanujesz ją czy nie, w piękne barwy jest ubrana, za nie oddam życie swe, czy wygrywasz czy przegrywasz, ja Granicę kochać chcę",
"typ": "miasto"
},
{
"tekst": "Niebiesko-biało-zieloni, ten mecz musimy wygrać, wygramy, wygramy, wygramy! Kto wygra mecz? Granica! Do boju, do boju, do boju KKS!",
"typ": "doping"
},
{
"tekst": "Kętrzyńska Granica KKS, kętrzyńska Granica KKS",
"typ": "okrzyk"
},
{
"tekst": "Kętrzyn to my, Kętrzyn to my, heja heja Kętrzyn to my!",
"typ": "okrzyk"
},
{
"tekst": "Kętrzyn czeka, my czekamy, na zdobycie pierwszej bramy!",
"typ": "okrzyk"
},
{
"tekst": "Granica to jest potęga, Granica najlepsza jest, Granicę trzeba szanować, Granica KKS, lalalalala",
"typ": "doping"
},
{
"tekst": "Naszym klubem KKS, cała Polska o tym wie, ta drużyna z Mazur jest, to Granica KKS, lalalala",
"typ": "miasto"
},
{
"tekst": "Wczoraj obiecałaś mi na pewno, że trzy punkty dzisiaj będą, zaufaliśmy ci, wiara, nasza wiara nie zachwiana, będę śpiewać aż do rana, a ty wygrasz mecz, hej Kętrzyn gol!",
"typ": "doping"
},
{
"tekst": "Granica Kętrzyn, sialalalala, Granica Kętrzyn, sialalalala…",
"typ": "okrzyk"
},
{
"tekst": "Tooo myyyy, fanatycy z kętrzyńskiej Granicy, za Kętrzyn, za KKS, pójdziemy aż po życia kres, KKS!",
"typ": "miasto"
},
{
"tekst": "Hej Kętrzyn gol, sialalalalalala",
"typ": "okrzyk"
}
]
},
"Arka Gdynia": {
"przyspiewki": [
{
"tekst": "Poszli, znaleźli Lechię na strychu. Wpierdol spuścili, zeszli po cichu. Gdyby Lechia nie skakała, toby wpierdol nie dostała. Wedle rozkazu.",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Słuchaj, Jezu, jak Cię błaga lud, zrób z Areczki mistrza Polski, zrób",
"typ": "doping"
},
{
"tekst": "Nasz święty klub, MZKS, będziemy przy nim aż po życia kres... Więc właśnie tam, gdzie Arka gra, dopingujemy wciąż, śpiewając tak: Ole olee",
"typ": "doping"
},
{
"tekst": "To Nasz, to Nasz Święty Klub, Nasz MZKS, MZKS. My jesteśmy z Tobą! Klubie! Klubie! Klubie Ty Nasz! la la la... heja Areczka",
"typ": "doping"
},
{
"tekst": "Arka to pany, żółto-niebieskie szatany!",
"typ": "okrzyk"
},
{
"tekst": "Żółty piach plaży, niebieskie morze, barwy klubowe, Arce pomoże, znów dzisiaj Arka gra.",
"typ": "miasto"
},
{
"tekst": "Najwspanialszy klub na świecie, co kibiców wiernych ma, każdy kibic wie, że przecież to jest Arka kochana.",
"typ": "doping"
},
{
"tekst": "Nasza Areczka ole, żółto-niebieska ole, my jesteśmy tu, Ty dziś wygrasz mecz, nigdy nie zdradzimy Cię.",
"typ": "doping"
},
{
"tekst": "Do boju Areczko! My gdyńscy wierni fani, po grób oddani za swój klub",
"typ": "miasto"
},
{
"tekst": "Hej Arka goooool! Arka gol! Arka gol! Arka gol! Arka gol!",
"typ": "okrzyk"
},
{
"tekst": "Jesteśmy zawsze tam, gdzie nasza Arka gra, aejaooooo Arkowcy gol!",
"typ": "doping"
},
{
"tekst": "Jesteśmy zawsze tam, gdzie nasza Arka gra, za nią jeździmy, bo w nią wierzymy, Arkowcy to my",
"typ": "doping"
},
{
"tekst": "Znów dzisiaj Arka gra, znów Górka zaśpiewa, hej Arka gol... hej Arka gol!",
"typ": "doping"
},
{
"tekst": "Wejherowo, Wejherowo, Rumia, Tczew, Władysławowo, nawet piękna Kościerzyna kibicuje Arce Gdynia",
"typ": "miasto"
},
{
"tekst": "M-Z-MZK-MZKS-ARKA!",
"typ": "okrzyk"
},
{
"tekst": "Nigdy Cię nie zdradzimy, nie opuścimy Cię, jesteś naszą miłością, Arko kochamy Cię",
"typ": "doping"
},
{
"tekst": "W Trójmieście rządzi gdyńska Areczka, ona na zawsze w naszych sercach jest, przez wieki będzie przez nas wielbiona, dumą wybrzeża ona jest",
"typ": "miasto"
},
{
"tekst": "Zielona jest trawa, Arka wybiega, sędzia mecz zaczyna, Górka zaśpiewa: hej gola, Arkowcy gola, Arkowcy gol, gol, gol",
"typ": "doping"
},
{
"tekst": "Weź pod rękę Lechię swą, idź nad morze, utop ją i zaśpiewaj jej: jednej ku**y mniej, hej!",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Do boju Arkowcy, do boju Arkowcy, marsz, marsz, marsz, do boju marsz, zwycięstwo czeka nas",
"typ": "doping"
},
{
"tekst": "Mieszkam tam, gdzie Arka w piłkę gra, mieszka z nami też zaj**any BKS, chcesz czy nie, na stadion wpi**dol się i Lechistę chwyć, żeby sku**iel nie mógł żyć",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Bo w Trójmieście BKS jest przegrany, każdy kibic o tym wie",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Żółto-niebieski w herbie się mieni, to Areczki Gdynia znak, jej kibice są niezwyciężeni, boi się nas cały świat.",
"typ": "miasto"
},
{
"tekst": "O Areczko, Areczko, Areczko, Ty najlepszych kibiców w Polsce masz",
"typ": "doping"
},
{
"tekst": "Arka to jest potęga, Arka najlepsza jest, Arka to chuligani, Arka MZKS",
"typ": "doping"
},
{
"tekst": "Jak długo na Wawelu Zygmunta bije dzwon, tak długo nasza Arka lidze nadaje ton. Zwycięży Arka Gdynia, zwycięży gdyńska brać, a Lechia też zwycięży, jak się nauczy grać",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "To my, chłopcy z Ejsmonda, zna nas cała Polska, za Arkę MZKS pójdziemy aż po życia kres",
"typ": "miasto"
},
{
"tekst": "Boi się nas Legia Warszawa, boi się nas chorzowski Ruch, bo nasza Arka to jest sława, za nią pójdziemy w każdy bój",
"typ": "doping"
},
{
"tekst": "Czy wygrywasz, czy nie, ja i tak kocham Cię, w moim sercu Arka i na dobre i na złe",
"typ": "doping"
},
{
"tekst": "Do boju marsz – Arko! Trzy punkty masz – Arko! Jesteśmy tu – Arko! Stoimy, śpiewamy, na bramki czekamy",
"typ": "doping"
},
{
"tekst": "Hej Arka Gdynia, ukochana ma drużyna, wygrałabyś ten mecz, wygrałabyś!",
"typ": "doping"
},
{
"tekst": "Zielone jabłuszko przekrojone na krzyż, czemu ty Lechisto krzywo na mnie patrzysz. Bum tarara bum, mówi Arka Lechii: pocałuj mnie w ch**",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Chociaż by was było jak liści na dębie, będziecie spie**alać jak gdańskie gołębie",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Nie płacz Areczko ma, z żalu co serce rwie, nie płacz Areczko ma, bo w drugiej lidze nie jest źle",
"typ": "doping"
},
{
"tekst": "O moja Areczko, nie zdradzę Cię! Inni Cię zdradzili i na Ciebie pluli, ale ja nie!",
"typ": "doping"
},
{
"tekst": "Pijemy, pijemy piwo – Lechia k... jest i starą dziwą! Pijemy, pijemy wódkę – zaj...my Lechię prostytutkę!",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Arka Gdynia, Arka to nasz klub, jak w rodzinie kibic składa ślub, zawsze przy niej, zawsze razem z nią, Arka gola, podaj, strzelaj, gooool!",
"typ": "doping"
},
{
"tekst": "Chociaż gnębi nas policja, my ją olewamy, ukochanej gdyńskiej Arce swe serca oddamy. Chociaż Lechia cwaniakuje, my ją olewamy",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Heja Areczko, klubie kochany, strzelisz dwie bramy, a my pochlamy za twoje zdrowie, niech cała Polska się o tym dowie",
"typ": "doping"
},
{
"tekst": "Nie martw się kibicu mój, Arka strzeli bramek sto, chociaż mało nas tu jest, to zwycięży MZKS. W górę serca, zwycięży Areczka!",
"typ": "doping"
},
{
"tekst": "Naprzód do boju żółto-niebiescy, dzisiaj kibice pomogą wam, naprzód do boju, naprzód odważnie, z naszym dopingiem będzie wam raźniej",
"typ": "doping"
},
{
"tekst": "A Legia, Pogoń listy śle, a Lechia ku... czai się, a my kibice gdyńskiej Arki nie poddamy się",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Bo u nas w Gdyni zwyczaj jest, że kto przyjeżdża, przegra mecz",
"typ": "miasto"
},
{
"tekst": "Pierwszy gol, drugi gol, trzeci leci! Na tablicy trzy-zero się świeci! Co za szał, co za szał, co za radość! Ah ta Lechia to ku... i słabość!",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Arko, Arko, Arko, Arko, Arko, Ty strzeliłaś bramek 100, jeszcze jeden, jeszcze jeden, jeszcze jeden nowy gol",
"typ": "doping"
},
{
"tekst": "W naszym mieście Gdyni, gdzie herb cały żółty jest, mamy swą drużynę, to Areczka Gdynia jest",
"typ": "miasto"
},
{
"tekst": "Dzisiaj Arka gra, sia la la la la, i trzy punkty ma! Dzisiaj Arki nie pokona nawet słynna AS Roma",
"typ": "doping"
},
{
"tekst": "Nie potrzebna mi dziewczyna, moja miłość to Areczka, ukochana i jedyna",
"typ": "doping"
},
{
"tekst": "Nadejdzie wiosna i lepsze czasy, powróci nasza Areczka w szeregi ekstraklasy",
"typ": "doping"
},
{
"tekst": "Na dworcu jest tłok, w pociągu jest tłok, to wiara na Arkę jedzie",
"typ": "doping"
},
{
"tekst": "Nieważne jest dla nas, czy wygramy czy przegramy, najważniejsze, że Arka pany!",
"typ": "okrzyk"
},
{
"tekst": "Burza na morzu szalała, piorun pierd...lnął w szalupę, Lechia się burty trzymała, a Śląsk pierd... ją w dupę",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Que sera sera, Areczka trzy punkty ma!",
"typ": "okrzyk"
},
{
"tekst": "Que sera sera, na Wrocław napadła wsza, z widłami na Śląska szła, taka mała wsza",
"typ": "rywal",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Areczka, Areczka, Areczkaaaa!!!",
"typ": "okrzyk"
},
{
"tekst": "Czekam na wiatr, co rozgoni kurwy szczecińskiej Pogoni. Stanę wtedy na raz i plunę kurwom w twarz!",
"typ": "rywal",
"rywal": "Pogoń Szczecin"
},
{
"tekst": "Nad nami niebieskie niebo, na gdyńskiej plaży żółty piach, jesteśmy tu, aby śpiewać, by pomóc Arce mecz wygrać",
"typ": "miasto"
},
{
"tekst": "Gdy wygrywa Arka Gdynia, będą piwa, będą wina! Arka Gdynia! Arka Gdynia!",
"typ": "doping"
},
{
"tekst": "Żółto-niebieskie barwy w naszym herbie mienią się, to Areczki kibice zajebiście bawią się",
"typ": "doping"
},
{
"tekst": "Żółte jest słońce, niebieskie niebo, to właśnie barwy klubu naszego",
"typ": "miasto"
},
{
"tekst": "Dwa kolory w herbie mienią się",
"typ": "doping"
},
{
"tekst": "Macie to wygrać!",
"typ": "doping"
}
],
"hymn": "Rota – hymn kibiców Arki („Żółte jest słońce, niebieskie niebo, to właśnie barwy klubu naszego”)"
},
"Avia Świdnik": {
"przyspiewki": [
{
"tekst": "Avia pany!",
"typ": "okrzyk"
},
{
"tekst": "Historia lubi powroty",
"typ": "doping"
}
],
"hymn": "Hymn Avii Świdnik – „Mamy drużynę od wielu, wielu lat, zapisywaną w historii sportu dat”"
},
"Bałtyk Gdynia": {
"przyspiewki": [
{
"tekst": "Bałtyk, Bałtyk, Bałtyk – nasz klub z Gdyni Redłowa!",
"typ": "miasto"
},
{
"tekst": "Zjednoczony Bałtyk Gdynia",
"typ": "okrzyk"
}
],
"hymn": "Hymn Bałtyku Gdynia – „Bałtyk, Bałtyk, Bałtyk to nazwa polskiego morza, Bałtyk, Bałtyk, Bałtyk – nasz klub z Gdyni Redłowa”"
},
"Beskid Andrychów": {
"przyspiewki": [
{
"tekst": "Beskid forever!",
"typ": "okrzyk"
}
]
},
"Bruk-Bet Termalica Nieciecza": {
"przyspiewki": [
{
"tekst": "Słonie gool!",
"typ": "okrzyk"
},
{
"tekst": "Rumak do zmiany!",
"typ": "doping"
}
],
"hymn": "Hymn Bruk-Betu Termalica – „Ojciec Polak, matka Polka, polska firma, polska wioska”"
},
"Chojniczanka Chojnice": {
"przyspiewki": [
{
"tekst": "Wpuśćcie kibiców!",
"typ": "okrzyk"
},
{
"tekst": "Lechia Gdańsk...",
"typ": "zgoda",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Na dobre i na złe",
"typ": "doping"
},
{
"tekst": "Chojna i Gryf!",
"typ": "zgoda",
"rywal": "Gryf Słupsk"
}
]
},
"Chrobry Głogów": {
"przyspiewki": [
{
"tekst": "Chrobry w finale!",
"typ": "okrzyk"
}
]
},
"Cracovia": {
"przyspiewki": [
{
"tekst": "Każdy to powie, Cracovia rządzi w Krakowie!",
"typ": "miasto"
},
{
"tekst": "Cracovia pany!",
"typ": "okrzyk"
},
{
"tekst": "Wisła krakowska największa k…wa zomowska!",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Wisła, k…wy, świnie, geje, cała Polska z was się śmieje",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Lepiej siostrę mieć w burdelu niż brata za Wisłą",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Wisła szmato, co ty na to?!",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Wisła to k…wa jest milicyjna!",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Ziemia Święta na Kałuży, tu Cracovio. Zawsze będziesz miała wiernych kibiców, którzy kochają Cię, z Tobą będą po życia kres.",
"typ": "miasto"
},
{
"tekst": "Hej kibicu, zgoda święta rzecz, tylko Pasy i poznański Lech, jeden za drugim się stawi, razem dziś się bawi, przyjaźń będzie...",
"typ": "zgoda",
"rywal": "Lech Poznań"
},
{
"tekst": "Cracovia to jest duma",
"typ": "doping"
},
{
"tekst": "Nie zejdę na psy!",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Byli zdrajcami i ubekami",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Waszym ojcem Josef...",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Nie licząc dni, godzin i lat...",
"typ": "doping"
},
{
"tekst": "Nawet w chwili złej...",
"typ": "doping"
}
],
"hymn": "Hymn Cracovii (Maciej Maleńczuk) – „Kraków to stolica Polski, perła ukryta we mgle” … „nie zejdę na psy”"
},
"Elana Toruń": {
"przyspiewki": [
{
"tekst": "Sobota jest, idę na mecz, biorę mój szal, Elana gra. Mecz zaczął się, więc śpiewaj Jej, że kochasz Ją, Elana gol!",
"typ": "doping"
},
{
"tekst": "Elana matka",
"typ": "doping"
}
],
"hymn": "Chodź, pomaluj mój świat (hymn Elany)"
},
"Flota Świnoujście": {
"przyspiewki": [
{
"tekst": "Królowa Pomorza",
"typ": "miasto"
},
{
"tekst": "Nikt nie cofa się...",
"typ": "doping"
}
]
},
"GKS Katowice": {
"przyspiewki": [
{
"tekst": "GieKS to życie, stadion świątynia, nic nie zastąpi naszego młyna, szale są w górze, race się palą, wszyscy kibice głośno śpiewają, Giekaes, Giekaes.",
"typ": "doping"
},
{
"tekst": "Wygraj GieKSo, wygraj, walcz, sił nie oszczędzaj, cały stadion czeka na twój goool, hej, hej, hej hej",
"typ": "doping"
},
{
"tekst": "Gdy GKS wchodzi na boisko, wśród kibiców słychać głośny śpiew! My krzyczymy i śpiewamy głośno, nasz GKS dzisiaj wygra...",
"typ": "doping"
},
{
"tekst": "Naprzód Gieksiarze!",
"typ": "okrzyk"
},
{
"tekst": "Gieksa rusza na podbój Europy",
"typ": "doping"
},
{
"tekst": "Gramy u siebie!",
"typ": "okrzyk"
},
{
"tekst": "Pakuj walizki!",
"typ": "doping"
},
{
"tekst": "Tyskie k**** jazda!",
"typ": "rywal",
"rywal": "GKS Tychy"
}
]
},
"GKS Tychy": {
"przyspiewki": [
{
"tekst": "Za te czterdzieści lat, za piątej ligi smak, już na nas nadszedł czas, więc zwyciężaj nam, GKSie nasz",
"typ": "doping"
},
{
"tekst": "Łódzki ŁKS, tyski GKS – nasza zgoda najlepsza w Polsce jest",
"typ": "zgoda",
"rywal": "ŁKS Łódź"
},
{
"tekst": "W mieście, gdzie najlepsze piwo jest...",
"typ": "miasto"
},
{
"tekst": "Jaki tu spokój...",
"typ": "rywal",
"rywal": "GKS Katowice"
},
{
"tekst": "Nieważne gdzie – je**ć policję!",
"typ": "okrzyk"
},
{
"tekst": "Tyska banda na trybunach tutaj jest",
"typ": "miasto"
},
{
"tekst": "Tak się wabi...",
"typ": "rywal",
"rywal": "GKS Katowice"
},
{
"tekst": "Królowie Śląska",
"typ": "miasto"
},
{
"tekst": "U was biega pies w ekipie...",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "Cała Polska je**e Śląska!",
"typ": "rywal",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "U nas zawsze jest czysto",
"typ": "rywal",
"rywal": "Ruch Chorzów"
}
]
},
"Garbarnia Kraków": {
"przyspiewki": [
{
"tekst": "Nasze barwy są brązowo-białe, po to, żeby panny nas kochały",
"typ": "miasto"
},
{
"tekst": "Młode Lwy",
"typ": "okrzyk"
}
],
"hymn": "Hymn Garbarni Kraków (sł. Jan Nowicki, muz. Zygmunt Konieczny) – „Nasze barwy są brązowo-białe, po to, żeby panny nas kochały”"
},
"Goplania Inowrocław": {
"przyspiewki": [
{
"tekst": "To my, biało-niebiescy!",
"typ": "okrzyk"
}
]
},
"Gryf Wejherowo": {
"przyspiewki": [
{
"tekst": "Gryf naszym klubem, co nam przynosi chlubę, i żółto-czarne barwy w swym pięknym herbie ma!",
"typ": "miasto"
},
{
"tekst": "Wejherowski!",
"typ": "okrzyk"
}
],
"hymn": "Hymn Gryfa Wejherowo – „Gryf naszym klubem, co nam przynosi chlubę, i żółto-czarne barwy w swym pięknym herbie ma”"
},
"Górnik Zabrze": {
"przyspiewki": [
{
"tekst": "Słuchaj, Jezu, jak Cię błaga lud, zrób z Górnika mistrza Polski, zrób. My czekamy już dwadzieścia lat, a tu mistrza, mistrza Polski brak",
"typ": "doping"
},
{
"tekst": "A gdy wreszcie puchar zrobisz ten, całe Zabrze oszaleje wnet, piwo strumieniami będzie lało się",
"typ": "miasto"
},
{
"tekst": "Na Śląsku górnicze życie, tak długie jak serca bicie, Torcidy nie zwyciężycie, nasz Górnik na całe życie",
"typ": "miasto"
},
{
"tekst": "Nie żałujcie gardeł swych...",
"typ": "doping"
},
{
"tekst": "My jesteśmy chłopcy z Zabrza, cała Polska o nas wie, u nas zawsze jest kultura, chociaż piszą o nas źle",
"typ": "miasto"
},
{
"tekst": "My jeździmy na wyjazdy i śpiewamy ile sił, by nasz Górnik ukochany mistrzem Polski znowu był",
"typ": "doping"
},
{
"tekst": "Górniku nasz, kochamy Cię, będziemy z Tobą i na dobre i na złe",
"typ": "doping"
},
{
"tekst": "Torcida, Torcida, Torcida, oooo o oooo",
"typ": "okrzyk"
},
{
"tekst": "Zagraj, zagraj jak za dawnych lat",
"typ": "doping"
},
{
"tekst": "Serca płoną wciąż, dziś nasz Górnik gra, znów się bawi wielka Torcida! Wstań, zaciśnij pięść, poczuj walki smak...",
"typ": "doping"
},
{
"tekst": "Górnicze skarby pod ziemią!",
"typ": "miasto"
},
{
"tekst": "Cały tydzień czekam na mecz...",
"typ": "doping"
},
{
"tekst": "Wielkiego Górnika serce pokochało",
"typ": "doping"
},
{
"tekst": "Górnik Zabrze, kocham Cię!",
"typ": "okrzyk"
},
{
"tekst": "La Bamba (przyśpiewka Torcidy)",
"typ": "doping"
},
{
"tekst": "Cała Polska was się wstydzi!",
"typ": "rywal",
"rywal": "Widzew Łódź"
},
{
"tekst": "W domu stara suszy łeb!",
"typ": "doping"
},
{
"tekst": "Ogień Torcidy",
"typ": "okrzyk"
},
{
"tekst": "Gliwice miasto wierne i oddane Górnikowi",
"typ": "rywal",
"rywal": "Piast Gliwice"
},
{
"tekst": "Co bawią się...",
"typ": "rywal",
"rywal": "Piast Gliwice"
},
{
"tekst": "Na ulicy Cichej...",
"typ": "rywal",
"rywal": "Ruch Chorzów"
},
{
"tekst": "Trelemorele",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Lechia to...",
"typ": "rywal",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Poldi, zostań w Zabrzu!",
"typ": "doping"
},
{
"tekst": "Górnika wspieramy i jebi**y WKS",
"typ": "rywal",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "A Stambuł pierd**i się",
"typ": "doping"
},
{
"tekst": "A Śląsk Wrocław...",
"typ": "rywal",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Lepsza strona miasta",
"typ": "rywal",
"rywal": "Piast Gliwice"
}
],
"hymn": "Oficjalny hymn Górnika Zabrze – „Słynna drużyna, którą każdy zna, tyle tytułów i pucharów ma”"
},
"Górnik Łęczna": {
"przyspiewki": [
{
"tekst": "Górnik Łęczna, Górnik Łęczna, Górnik Łęczna dzisiaj gra! Lubelszczyzna jest ci wdzięczna...",
"typ": "miasto"
},
{
"tekst": "Wszystko przetrwamy",
"typ": "doping"
}
],
"hymn": "Hymn Górnika Łęczna (sł. Zbigniew Dmitroca, 2003) – „Górnik Łęczna dzisiaj gra! Lubelszczyzna jest ci wdzięczna”"
},
"Hutnik Kraków": {
"przyspiewki": [
{
"tekst": "Pamięć o Tobie nigdy nie zginie",
"typ": "doping"
},
{
"tekst": "Gdzie nasz Hutniczek gra...",
"typ": "doping"
}
]
},
"Jagiellonia Białystok": {
"przyspiewki": [
{
"tekst": "Kibicowskie życie, na stadionie, na ulicy, bo dla nas liczy się adrenalina",
"typ": "doping"
},
{
"tekst": "Tylko Ty",
"typ": "doping"
},
{
"tekst": "Viva BKS! Więc wstań, szalik w rękę weź, zaintonuj pieśń: Viva BKS",
"typ": "doping"
},
{
"tekst": "Tylko Ty! Tylko Ty! W moim sercu Ty! Jedna, jedyna! Niepokonana! Jaga kochana!",
"typ": "doping"
},
{
"tekst": "PAO OOOOO… Jagielloniooooo... kochamy Cię, Jagielloniooooo... ma drużynooooo... kochamy Cię",
"typ": "doping"
},
{
"tekst": "Pamiętam tylko to, o Jagiellonię szło, dla której...",
"typ": "doping"
},
{
"tekst": "Jagiellonio klubie mój, pokaż dziś charakter swój, wiara, siła, wola walki w nas, na mistrzostwo...",
"typ": "doping"
},
{
"tekst": "Wstań, unieś barwy...",
"typ": "miasto"
},
{
"tekst": "Jesteśmy zawsze tam...",
"typ": "doping"
},
{
"tekst": "I znowu wyjazdowy mecz...",
"typ": "doping"
}
],
"hymn": "Hymn Jagiellonii (aut. Tomasz „Kodżak” Kozak, 2010) – „W mieście Białystok, w tym w którym żyję, oddałem serce drużynie. Wstań, unieś barwy…”"
},
"KP Starogard Gdański": {
"przyspiewki": [
{
"tekst": "Starogardzcy fanatycy, ave KP Starogard!",
"typ": "miasto"
}
]
},
"Kaszubia Kościerzyna": {
"przyspiewki": [
{
"tekst": "Duma Kaszub",
"typ": "miasto"
}
]
},
"Korona Kielce": {
"przyspiewki": [
{
"tekst": "Będzie, będzie wygrana, będzie się działo, a dla nas ciągle, ciągle mało, będzie głośno, będzie radośnie, więc zaśpiewajmy wszyscy jeszcze raz",
"typ": "doping"
},
{
"tekst": "Korono niepokonana, Korono nasz MKS!",
"typ": "doping"
},
{
"tekst": "Nic was nie słychać!",
"typ": "rywal",
"rywal": "Arka Gdynia"
},
{
"tekst": "Coście tak cicho!",
"typ": "rywal",
"rywal": "Widzew Łódź"
}
],
"hymn": "Dni, których nie znamy (Marek Grechuta)"
},
"Kotwica Kołobrzeg": {
"przyspiewki": [
{
"tekst": "To jest nasza miłość, to jest nasza wiara, duma i fanatyzm, walka i wygrana",
"typ": "doping"
},
{
"tekst": "Hej Kotwa gol!",
"typ": "okrzyk"
}
],
"hymn": "Perła Bałtyku („To jest nasza miłość, to jest nasza wiara, duma i fanatyzm, walka i wygrana”)"
},
"Lech Poznań": {
"przyspiewki": [
{
"tekst": "Niebiesko-białe barwy nasz Kolejorz ma! Jemu chwała, jemu cześć!!!",
"typ": "doping"
},
{
"tekst": "Dumą Polski jesteśmy od lat",
"typ": "doping"
},
{
"tekst": "My kibice poznańskiego Lecha",
"typ": "miasto"
},
{
"tekst": "Za Lechem przemierzamy cały świat",
"typ": "doping"
},
{
"tekst": "Niebieski z białym na niebie się mieni...",
"typ": "doping"
},
{
"tekst": "Każdy z nas to wie, co w życiu liczy się",
"typ": "doping"
},
{
"tekst": "W starym grodzie Przemysława...",
"typ": "miasto"
},
{
"tekst": "Niech zwycięża Lech, wielki Kolejorz KKS, aejejejeoo...",
"typ": "doping"
},
{
"tekst": "W grodzie Przemysława, gdzie koziołki bodą się, jest taka drużyna, co się zwie poznański Lech... Lechu, Lechu, Lechu, ukochany",
"typ": "miasto"
},
{
"tekst": "Zawsze Cię wspieramy, w kilka tysięcy gardeł, idźmy po...",
"typ": "doping"
},
{
"tekst": "Cała Polska zna nasz kibicowski świat",
"typ": "doping"
},
{
"tekst": "Na trybunach śpiew, na boisku walka",
"typ": "doping"
},
{
"tekst": "Kto mistrzem jest!",
"typ": "okrzyk"
},
{
"tekst": "Hej kibicu, zgoda święta rzecz, tylko Pasy i poznański Lech, jeden za drugim się stawi, razem dziś się bawi, przyjaźń będzie...",
"typ": "zgoda",
"rywal": "Cracovia"
},
{
"tekst": "Wspaniały to był doping, nie zapomnę go nigdy",
"typ": "doping"
},
{
"tekst": "Jak się masz...",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Niebiesko-biała ma drużyna",
"typ": "doping"
},
{
"tekst": "Nasz Kolejorz to nasze życie",
"typ": "doping"
},
{
"tekst": "Dziś Lech mecz swój gra",
"typ": "doping"
},
{
"tekst": "Gdy Kolejorz gra...",
"typ": "doping"
},
{
"tekst": "Ole ola (bluzgi Lecha w Warszawie)",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Trelemorele",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Rządzie p********!",
"typ": "okrzyk"
}
],
"hymn": "Hymn Lecha Poznań (zesp. Stress) – „Ludzi tłum przez miasto gna, dziś Kolejorz mecz swój gra”"
},
"Lechia Gdańsk": {
"przyspiewki": [
{
"tekst": "Poszli, znaleźli Arkę na strychu. Wpierdol spuścili, zeszli po cichu. Gdyby Arka nie fikała, toby wpierdol nie dostała. Wedle rozkazu.",
"typ": "rywal",
"rywal": "Arka Gdynia"
},
{
"tekst": "Poszli, znaleźli Arkowca w rowie i dla przykładu dali po głowie",
"typ": "rywal",
"rywal": "Arka Gdynia"
},
{
"tekst": "W Wolnym Mieście Gdańsku, gdzie korona w herbie jest, mamy swą drużynę, która zwie się B.K.S! Alleluja, alleluja, alleluja B.K.S!!!",
"typ": "miasto"
},
{
"tekst": "Posłuchajcie tej historii, która w naszych duszach gra, o nich pieśń Wam dam, oni tworzą klan, Wojownicy Lechii Gdańsk",
"typ": "doping"
},
{
"tekst": "Zdobywając Górkę jak warowny gród, gdzie się hańbą okrył wróg",
"typ": "rywal",
"rywal": "Arka Gdynia"
},
{
"tekst": "Solidarność – Lechia Gdańsk!",
"typ": "okrzyk"
},
{
"tekst": "Precz z komuną!",
"typ": "okrzyk"
},
{
"tekst": "Ooo Nasz! Ooo Nasz! My wierzymy tylko w B.K.S. Hej Lechio! Ooo Nasz! Ooo Nasz!",
"typ": "doping"
},
{
"tekst": "Słuchaj Jezu jak Cię błaga lud, zrób z Lechijki mistrza Polski zrób. My czekamy już czterdzieści lat, a w historii klubu mistrza Polski brak",
"typ": "doping"
},
{
"tekst": "Dzisiaj we Wrzeszczu, dzisiaj we Wrzeszczu wesoła nowina, że podejmuje Lechia Karmazyna. Worek z bramkami już się otwiera, Lechia prowadzi jeden do zera",
"typ": "miasto"
},
{
"tekst": "Trójmiasto jest nasze...",
"typ": "miasto"
},
{
"tekst": "...dobrze bawimy się, aejao hej Lechia gol. Jesteśmy ch** wie gdzie, alkohol leje się, aejao wódka, piwo",
"typ": "doping"
},
{
"tekst": "Czekam na wiatr...",
"typ": "rywal",
"rywal": "Pogoń Szczecin"
},
{
"tekst": "Biało-zielono zawsze w Gdańsku jest",
"typ": "miasto"
},
{
"tekst": "Znowu od morza silniej wieje wiatr, tam, gdzie korona wieńczy krzyże dwa...",
"typ": "miasto"
},
{
"tekst": "Wielka Lechia Gdańsk!",
"typ": "okrzyk"
}
],
"hymn": "Ooo Nasz! Ooo Nasz! (My wierzymy tylko w B.K.S. – hymn kibiców)"
},
"Legia Chełmża": {
"przyspiewki": [
{
"tekst": "Wszyscy na Zawiszę!",
"typ": "rywal",
"rywal": "Zawisza Bydgoszcz"
}
]
},
"Legia Warszawa": {
"przyspiewki": [
{
"tekst": "W pociągu jest tłok, w tramwaju jest tłok, kibice na Legię jadą.",
"typ": "doping"
},
{
"tekst": "CWKS do boju Legia Warszawa, centralny wojskowy, kochany, sportowy, to jest nasz CWKS!",
"typ": "okrzyk"
},
{
"tekst": "Bo Warszawa / Bo Warszawa, bo Warszawa / Bo Warszawa jest od tego / Aby bawić się",
"typ": "miasto"
},
{
"tekst": "Ceee... / CeWuK... / CeWuKaeS Legia!",
"typ": "doping"
},
{
"tekst": "Centralny Wojskowy Kochany Sportowy! / hej!",
"typ": "okrzyk"
},
{
"tekst": "CeWuKaeSie mój / Klubie mój / Miłość ma / Wygrała dzisiaj mecz",
"typ": "doping"
},
{
"tekst": "Chociaż ciężki jest czas / PZPN gnębi nas / Będą, będą kibice za Legią szli / Nie pokona nas już nikt!",
"typ": "doping"
},
{
"tekst": "Widzew to kurwa, jebać ŁKS / Spadnie GKS na sezonów sześć",
"typ": "rywal",
"rywal": "Widzew Łódź"
},
{
"tekst": "Spadnie GKS na sezonów sześć / Wisłę przejdziemy, Lecha zajebiemy",
"typ": "rywal",
"rywal": "GKS Katowice"
},
{
"tekst": "Wisłę przejdziemy, Lecha zajebiemy / Ligę wygramy, Puchar będzie nasz",
"typ": "rywal",
"rywal": "Lech Poznań"
},
{
"tekst": "Legia CWKS / Ciebie po życia kres / będziemy wspierać / a wrogów jebać",
"typ": "doping"
},
{
"tekst": "CWKS Legia, CWKS Legia / Ja kocham tylko Legię, Legię Warszawa / CWKS Legia, CWKS Legia / ja kocham tylko Legię, Legię Warszawa",
"typ": "doping"
},
{
"tekst": "Czarna eLka w kółeczku się mieni / To jest Legii święty znak / Jej kibice są niezwyciężeni / Boi się ich cały świat",
"typ": "doping"
},
{
"tekst": "Czy wygrywasz, czy nie / Ja i tak kocham Cię / W moim sercu Legia! / I na dobre i na złe!",
"typ": "doping"
},
{
"tekst": "Do boju Legio marsz / Marsz, marsz, marsz / Do boju marsz! / Zwycięstwo czeka nas",
"typ": "doping"
},
{
"tekst": "Do końca moich dni / W mym sercu tylko Ty! / Tysiąc lat przeminie / Żyleta nie zginie",
"typ": "doping"
},
{
"tekst": "Dziś zgodnym rytmem biją nam, nasze serca które My, (które My) / Za Legię damy w każdy czas, czy czas dobry czy czas zły! / Nie dla nas jest porażki smak, nie dla nas forma zła (forma zła) / Na całe gardło krzyczmy wraz: Legia mistrza Polski ma!",
"typ": "doping"
},
{
"tekst": "Gdybym jeszcze raz / Miał urodzić się / Znów bym Tobie, Legio / Oddał życie swe!",
"typ": "doping"
},
{
"tekst": "Gooool / Hej Legia gol! / Hej Legia gooooooool!",
"typ": "doping"
},
{
"tekst": "Gwizdek sędziego rozpoczyna wielki mecz / Piotrek Włodarczyk i już jeden zero jest / Cała Żyleta dopinguje z wszystkich sił / Aby wynik lepszy był",
"typ": "doping"
},
{
"tekst": "Święty znak nosisz na sercu. / Więc ucałuj dzisiaj go! / Pomódl się za swą drużynę / Czarna eLka jest z Tobą!",
"typ": "doping"
},
{
"tekst": "Bo Polonii tutaj nie ma / Bo w Warszawie jeden klub",
"typ": "rywal",
"rywal": "Polonia Warszawa"
},
{
"tekst": "Lech poszedł się gdzieś je..ć! / Korona gdzieś dupę myje",
"typ": "rywal",
"rywal": "Lech Poznań"
},
{
"tekst": "Ja kocham Legię / la la la la la la la / Ja kocham Legię / la la la la la la la",
"typ": "doping"
},
{
"tekst": "Ja kocham Legię o o / Ja kocham Legię Warszawa",
"typ": "okrzyk"
},
{
"tekst": "Jeden gol, drugi gol, trzeci leci... / Na tablicy 3-0 się świeci / Co za szał! Co za szał! Co za radość / Ta drużyna z Poznania to słabość",
"typ": "rywal",
"rywal": "Lech Poznań"
},
{
"tekst": "Jesteśmy zawsze tam / Gdzie nasza Legia gra / Aeja o hej Legia gol!",
"typ": "doping"
},
{
"tekst": "Legia gol, Legia gol / Legia, Legia gol / Hej! / Legia gol, Legia gol",
"typ": "doping"
},
{
"tekst": "Kaziu, Kaziu, Kaziu, Kaziu / Ty strzeliłeś bramek sto / Jeszcze jeden, jeszcze jeden / Jeszcze tylko jeden gol",
"typ": "doping"
},
{
"tekst": "Kto wygra mecz? / - Legia! / - Kto? / - Legia!",
"typ": "doping"
},
{
"tekst": "Legia gol allez, allez / Legia gol! [klask] [klask] / Legia gol allez, allez",
"typ": "doping"
},
{
"tekst": "Legia gol, Legia gol, Legia gol / Legia gol, Legia gol, Legia gol, / Legia gooool !!! Legia gooooooool !!!!",
"typ": "doping"
},
{
"tekst": "Legia, Legia gol / La la la la la / Legia, Legia gol / La la la la la",
"typ": "doping"
},
{
"tekst": "Legia, Legia, Legia, Legia gol... / Legia gol... Legia goool... / Legia, Legia, Legia, Legia gol... / Legia gol... Legia goool...",
"typ": "doping"
},
{
"tekst": "(Legio, do boju naprzód marsz / Legio, zwycięstwo czeka nas / Legio, Tys najlepsza jest / Legio, my kochamy Cię)",
"typ": "doping"
},
{
"tekst": "Mistrzem Polski jest Legia / Legia najlepsza jest / Legia to jest potęga / Legia CWKS",
"typ": "doping"
},
{
"tekst": "Moja jedyna miłość to jest Legiaaa / Ja kocham ją a ona gra / La la, la la la la",
"typ": "doping"
},
{
"tekst": "Legio Warszawa / Ma Legio Warszawa / Na zawsze pokochałem Cię / Legio Warszawa",
"typ": "doping"
},
{
"tekst": "Nasza Legia najlepsza w Polsce jest / Najlepsza w Polsce jest",
"typ": "doping"
},
{
"tekst": "Nie poddawaj się / Ukochana ma / Nie poddawaj się / Legio Warszawa!",
"typ": "doping"
},
{
"tekst": "Niepokonane miasto / niepokonany klub / tysiące fanów Twych / zwycięstwa pragną dziś",
"typ": "miasto"
},
{
"tekst": "O nasza Legia! / Tylko Legia! / Warszawaaaaa / O nasza Legia!",
"typ": "doping"
},
{
"tekst": "Od kołyski aż po grób / jedno miasto, jeden klub / Za te barwy, za naszą stolicę / pójdą w bój wierni Legii kibice!",
"typ": "miasto"
},
{
"tekst": "Ole, ole / Ole, ola / I tylko Legia / Legia Warszawa",
"typ": "doping"
},
{
"tekst": "Oleeee, Legia ole ole / Legia ole ole / Legia Warszawa wygra dzisiaj mecz!",
"typ": "doping"
},
{
"tekst": "Posłuchajcie bracia opowieści mej / o kibicach i o Legii warszawskiej / Była młoda i waleczna z roku na rok coraz lepsza / a jej trener z kibicami wódkę pił",
"typ": "doping"
},
{
"tekst": "Przeżyj to sam, / Dzisiaj Legia mistrza Polski ma / Nasza Legia... Warszawa",
"typ": "doping"
},
{
"tekst": "Puchar jest nasz / Puchar do nas należy / Nie damy nikomu / Nikomu nie damy",
"typ": "doping"
},
{
"tekst": "Śpiewajmy hej sialala / Legia dziś trzy punkty ma / Wojskowych wspaniała gra / Spiewajmy hej sialala",
"typ": "doping"
},
{
"tekst": "Szkoła, praca, dziewczyna, rodzina, / wszystko to nie obchodzi dziś mnie, / kiedy gra ukochana drużyna, / której dawno oddałem serce swe.",
"typ": "doping"
},
{
"tekst": "Tańczymy labada / Labada, labada / Tańczymy labada / Małego walczyka. Hej!",
"typ": "doping"
},
{
"tekst": "Tylko Legia / Ukochana Legia / Dziś Warszawa czeka / Na zwycięstwo Twe",
"typ": "doping"
},
{
"tekst": "W tramwaju jest tłok, w pociągu jest tłok, kibice na Legię jadą, / wtem nagle ktoś wstał, zaśpiewam ja Wam, o Legii mej ukochanej. / CeWuKaeS do boju Legia Warszawa, dwie bramki Borysiuk / i dwie Rafał Wolski, i Legia ma mistrza Polski!",
"typ": "doping"
},
{
"tekst": "Warszawa najlepsza jest / Warszawa CWKS / Śpiewajmy bracia o Legii swej / O Legii warszawskiej!",
"typ": "miasto"
},
{
"tekst": "Warszawa, Warszawa, Warszawa / CeWuKaeS Legia / Warszawa, Warszawa",
"typ": "miasto"
},
{
"tekst": "Wyginam śmiało ciało / Trzy - zero? Mało!",
"typ": "okrzyk"
},
{
"tekst": "Za kibicowski trud / za święte barwy Twe / za ten syreni gród / Legio wygraj dzisiaj ten mecz",
"typ": "miasto"
},
{
"tekst": "Za nasze miasto / I za te barwy / Oddamy całe życie swe / Zwyciężaj dla nas",
"typ": "miasto"
},
{
"tekst": "Złodzieje i pijacy są / Kibice z Warszawy / Złodziejsko-przemytniczy klub / To Legia Warszawa",
"typ": "miasto"
},
{
"tekst": "Glory Glory alleluja, Legia wygra, nie ma ch…ja! Glory Glory alleluuuja, Legia wygra dzisiaj mecz!",
"typ": "doping"
},
{
"tekst": "Jak w Warszawie stawiam klocka...",
"typ": "rywal",
"rywal": "Wisła Płock"
},
{
"tekst": "Motor z Lublina to jest kawał...",
"typ": "rywal",
"rywal": "Motor Lublin"
},
{
"tekst": "Pogoń to faja, Widzewowi liże jaja",
"typ": "rywal",
"rywal": "Pogoń Szczecin"
},
{
"tekst": "Precz z komuną! MO – Gestapo!",
"typ": "okrzyk"
},
{
"tekst": "Puchar będzie nasz!",
"typ": "okrzyk"
},
{
"tekst": "Co śledziem...",
"typ": "rywal",
"rywal": "Arka Gdynia"
},
{
"tekst": "Bo Jagi nikt nie lubi",
"typ": "rywal",
"rywal": "Jagiellonia Białystok"
},
{
"tekst": "A Widzew... a Ruch to...",
"typ": "rywal",
"rywal": "Widzew Łódź"
},
{
"tekst": "Dotykał Cię brat",
"typ": "rywal",
"rywal": "Raków Częstochowa"
}
],
"hymn": "Sen o Warszawie (Czesław Niemen); przy wyjściu piłkarzy kibice śpiewają „Mistrzem Polski jest Legia”"
},
"Miedź Legnica": {
"przyspiewki": [
{
"tekst": "Wiara jest w nas",
"typ": "doping"
},
{
"tekst": "A po dymie zapalimy...",
"typ": "doping"
},
{
"tekst": "Jak was k****y dopadniemy...",
"typ": "rywal",
"rywal": "Chrobry Głogów"
},
{
"tekst": "Lubimy igrać z ogniem",
"typ": "doping"
},
{
"tekst": "Bez Śląska nic nie znaczycie",
"typ": "rywal",
"rywal": "Odra Opole"
},
{
"tekst": "W Bielsku tylko BKS",
"typ": "zgoda",
"rywal": "Podbeskidzie Bielsko-Biała"
},
{
"tekst": "Wisła Kraków, a co to...",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Legnickie koty",
"typ": "miasto"
},
{
"tekst": "Za Miedzianką do Warszawy",
"typ": "doping"
},
{
"tekst": "Kilkadziesiąt rac...",
"typ": "doping"
}
],
"hymn": "Jedno Miasto, Jeden Klub"
},
"Motor Lublin": {
"przyspiewki": [
{
"tekst": "Niech żyje Motor, Motor i Śląsk Wrocław",
"typ": "zgoda",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Tylko Motor!",
"typ": "okrzyk"
},
{
"tekst": "Miała matka syna! (zgodowy doping Motoru i Śląska)",
"typ": "zgoda",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "To żółty, biały i niebieski świat!",
"typ": "miasto"
},
{
"tekst": "Miałem piękny sen...",
"typ": "doping"
},
{
"tekst": "Czy w czas dobry, czy w czas zły",
"typ": "doping"
},
{
"tekst": "Brejdaki – do zabawy i do draki",
"typ": "zgoda",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Chodźcie do lasu!",
"typ": "rywal",
"rywal": "Stal Stalowa Wola"
},
{
"tekst": "W mieście starym jak świat drużyna lubelska gra, my wierni kibice Jej zaśpiewamy tę pieśń. Piłka okrągła, a brameczki dwie, dziś wygra Motor, każdy o tym wie",
"typ": "miasto"
},
{
"tekst": "Naprzód piłkarze, ambicja dzisiaj wam każe grać na całego i walczyć do upadłego",
"typ": "doping"
},
{
"tekst": "Nad Bystrzycą pragnę marzyć, nad Bystrzycą pragnę żyć, Motor Lublin dopingować i z Motorem w zgodzie żyć. Więc do boju eRkaesie, więc do boju naprzód marsz!",
"typ": "miasto"
},
{
"tekst": "Nie szumcie wierzby nam z żalu, co serce rwie, nie płacz Motorze mój, bo Lublin zawsze z Tobą jest",
"typ": "miasto"
},
{
"tekst": "Jestem za drużyną swą na dobre i na złe, jej oddałem serce swe, za to Ona kocha mnie. Motor, Motor RKS!",
"typ": "doping"
},
{
"tekst": "Jedyna moja miłość to jest MOTOR, więc ja ciągle wierzę w Nią, Ona gra, mistrza ma",
"typ": "doping"
},
{
"tekst": "Jesteśmy zawsze tam, gdzie nasz Motorek gra… aaeeaaoo Motorek gol!",
"typ": "doping"
},
{
"tekst": "Żółto-biało-niebiescy, ten mecz musimy wygrać! Wygramy, wygramy, wygramy! O RKS-ie, klubie ty nasz! Do boju, do boju, do boju RKS!",
"typ": "doping"
},
{
"tekst": "Na dworcu jest tłok, w pociągu jest tłok, kibice na Motor jadą, wtem jeden z nich wstał i głośno się śmiał, zaśpiewał o eRkaesie",
"typ": "doping"
},
{
"tekst": "O mój eRkaesie, nie zdradzę Cię! Inni Cię zdradzili, Tobą pogardzili, ale ja nie! A jak mi ktoś powie: lubelski psie – złapię za cegłówkę, rozpier..ę główkę i skończy się",
"typ": "doping"
},
{
"tekst": "Słuchaj Jezu, jak Cię błaga lud, zrób z Motoru mistrza Polski zrób, my czekamy już 50 lat, a w historii klubu mistrza Polski brak",
"typ": "doping"
},
{
"tekst": "Motor to jest potęga, Motor najlepszy jest, Motor zawsze zwycięża, Motor nasz RKS! Był, będzie, jest Motor RKS!",
"typ": "doping"
},
{
"tekst": "Dziś wspólnym rytmem biją nam nasze serca, które my za Motor damy w każdy czas, czy czas dobry, czy czas zły!",
"typ": "doping"
},
{
"tekst": "Napieraj, napieraj, napieraj RKS!",
"typ": "okrzyk"
},
{
"tekst": "Tańczymy labada, labada, labada, tańczymy labada małego walczyka, HEJ! Tańczą go kibice Motoru z Lublina, HEJ!",
"typ": "doping"
},
{
"tekst": "Trójkę kelnerom, Motorze, trójkę kelnerom!",
"typ": "okrzyk"
},
{
"tekst": "Żółto-biało-niebieskie zwycięskie barwy są, my wierzymy w Motor, dopingujemy go. Do boju, do boju! Niech wszyscy znają nas, niech wszyscy nas się boją",
"typ": "doping"
},
{
"tekst": "Czy wygrywasz czy nie, ja i tak kocham Cię, w sercu moim Motor, ukochany RKS, i nieważne gdzie grasz, tam spodziewaj się nas",
"typ": "doping"
},
{
"tekst": "Kaman Motor, kaman Motor, kaman Motor, kaman!",
"typ": "okrzyk"
},
{
"tekst": "Kto wygra mecz? – Motor! – Kto? – Motor! – Kto? – Motor, Motor, Motor! Do boju, do boju, do boju RKS!",
"typ": "okrzyk"
},
{
"tekst": "Czy wszyscy są szczęśliwi? – YES! – Gdy nasz Motorek gra – YES! – Bo tylko nasz Motorek – YES! – zwycięstwo pewne ma – YES!",
"typ": "okrzyk"
},
{
"tekst": "Zawsze wierni i oddani z Zygmuntowskich chuligani!",
"typ": "miasto"
},
{
"tekst": "Ejaa ejaa ejaaooo, Motor chuligani, niezniszczalna naboja!",
"typ": "okrzyk"
},
{
"tekst": "Miała matka syna, syna jedynego, chciała go wychować na fana wiernego. Niech żyje Motor, Motor i Śląsk Wrocław, niech żyje zadyma, gdzie się … dyma",
"typ": "zgoda",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Hej Motor goool! La la la la la la la…",
"typ": "okrzyk"
},
{
"tekst": "My chcemy gola, Motorze, my chcemy gola!",
"typ": "okrzyk"
},
{
"tekst": "Motor, Motor, Motor, to my, lubelski Motor!",
"typ": "okrzyk"
},
{
"tekst": "Jesteśmy z Wami, Motorze, jesteśmy z Wami! Gramy do końca, Motorze, gramy do końca!",
"typ": "doping"
},
{
"tekst": "Motor to my, Motor to my, Motor, Motor, Motor to my!",
"typ": "okrzyk"
},
{
"tekst": "Motor, klubie Ty nasz, pokaż światu, jak w piłkę grasz!",
"typ": "doping"
},
{
"tekst": "Motor, my z Wami, my za Was życie oddamy!",
"typ": "doping"
},
{
"tekst": "Chcemy zwycięstwa, Motorze, chcemy zwycięstwa!",
"typ": "okrzyk"
},
{
"tekst": "Lublin czeka, my czekamy na strzelenie pierwszej bramy…",
"typ": "miasto"
},
{
"tekst": "Od najmłodszych moich lat za Motorem jeżdżę w świat, przez te wszystkie lata walczył brat za brata, nigdy nie poddamy się!",
"typ": "doping"
},
{
"tekst": "Tylko Motor nasz R, tylko Motor nasz K, tylko Motor nasz S, tylko nasz RKS!",
"typ": "okrzyk"
},
{
"tekst": "Wielki tłum przez miasto szedł, to był Motor RKS, pod kasami wielki tłum, dzisiaj Motor rządzi tu. W górę serca, dziś Motor wygra mecz!",
"typ": "miasto"
},
{
"tekst": "Motor gol, do boju eRKaeSie, Motor gol, zwycięstwa nadszedł czas!",
"typ": "okrzyk"
},
{
"tekst": "Kwiat Lublina – fanatycy z Zygmuntowskich – z tej ulicy",
"typ": "miasto"
},
{
"tekst": "A po meczu przychodzi bój, a po boju spokój… Do Wrocławia dojedzie część, Avia stara p….",
"typ": "rywal",
"rywal": "Avia Świdnik"
},
{
"tekst": "Ze wschodniej Polski jest nasz klub, potężny i wspaniały, trójkolorowe barwy ma, Motorek ukochany",
"typ": "miasto"
},
{
"tekst": "Motor, jesteśmy z Tobą, nie opuścimy Cię, nigdy Cię nie zdradzimy, bo my kochamy Cię",
"typ": "doping"
},
{
"tekst": "Koziego Grodu Duma, to Motor z Lublina, od pokoleń jedyna, kochana drużyna, gdziekolwiek będzie grała, my będziemy tam",
"typ": "miasto"
},
{
"tekst": "Żółto-biało-niebieska banda, wierna Tobie po życia kres, to jest nasze siedlisko bezprawia, razem krzyczmy głośno RKS!",
"typ": "doping"
},
{
"tekst": "Banda frajerów!",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Wszyscy do Nowego Targu!",
"typ": "doping"
}
],
"hymn": "Koziego Grodu Duma (przyśpiewka z trybun, nagrana jako oficjalny hymn) – „Koziego Grodu Duma, to Motor z Lublina”"
},
"Odra Opole": {
"przyspiewki": [
{
"tekst": "W starym grodzie Piastów...",
"typ": "miasto"
},
{
"tekst": "Gdzie macie flagi?",
"typ": "rywal",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Oderka",
"typ": "okrzyk"
},
{
"tekst": "Wszyscy do Gliwic!",
"typ": "doping"
},
{
"tekst": "Szlak przetarty",
"typ": "doping"
}
],
"hymn": "Serce Regionu („Niebiesko-czerwona krew w naszych żyłach płynie! To OKS!”)"
},
"Okocimski KS Brzesko": {
"przyspiewki": [
{
"tekst": "OKS Piwosze",
"typ": "okrzyk"
},
{
"tekst": "90 lat tradycji",
"typ": "doping"
}
]
},
"Olimpia Grudziądz": {
"przyspiewki": [
{
"tekst": "Po życia kres",
"typ": "doping"
},
{
"tekst": "Piekielnie głośno!",
"typ": "okrzyk"
}
],
"hymn": "Hymn Olimpii Grudziądz – „Zaczęliśmy z małym składem, ale chęci były wielkie”"
},
"Orkan Rumia MKS": {
"przyspiewki": [
{
"tekst": "Na drodze do zwycięstwa",
"typ": "doping"
}
]
},
"Piast Gliwice": {
"przyspiewki": [
{
"tekst": "Kibice wierzą w swoją drużynę, bo tylko Piast, tylko Piast, tylko Piast, Piast, Piast!!! I przyjdą lata, że Piast zasłynie, Gliwice wierzą tylko w Piast!!!",
"typ": "miasto"
},
{
"tekst": "Choć niewiele nas tu jest, Alleluuuja, my za Piastem fest a fest, Alleluuuja, Górnik Zabrze ku…wą jest, Alleluuuja, zaje…any zabrski pies, Alleluuuja",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "GKS... gliwicki GKS...",
"typ": "miasto"
},
{
"tekst": "Szlachta to my! A nie k**** wy!",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "Że są dwie ku**y w Krakowie...",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Czy wygrywasz, czy nie...",
"typ": "doping"
},
{
"tekst": "Po mistrza Polski!",
"typ": "doping"
},
{
"tekst": "Szlachta wraca na Okrzei",
"typ": "miasto"
},
{
"tekst": "W Gliwicach życia nie macie",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "Jazda z ku*wami!",
"typ": "rywal",
"rywal": "GKS Katowice"
},
{
"tekst": "Chodźcie do lasu...",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "W pewnym śląskim mieście na ulicy Roosevelta...",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "Suzanna",
"typ": "doping"
}
],
"hymn": "Do boju Piast! („Tam gdzie orzeł śląskich Piastów dumnie strzeże miasta wrót”)"
},
"Podbeskidzie Bielsko-Biała": {
"przyspiewki": [
{
"tekst": "Idzie Podbeskidzie!",
"typ": "okrzyk"
},
{
"tekst": "Lalalala Podbeskidzie!",
"typ": "okrzyk"
},
{
"tekst": "W Bielsku-Białej, gdzie jest nasz dom...",
"typ": "miasto"
},
{
"tekst": "Polska stolica kultury",
"typ": "miasto"
},
{
"tekst": "W Bielsku tylko BKS!",
"typ": "miasto"
},
{
"tekst": "Nic nie znaczycie",
"typ": "rywal",
"rywal": "Zagłębie Sosnowiec"
},
{
"tekst": "Podbeskidzie Bielsko-Biała!",
"typ": "okrzyk"
}
],
"hymn": "Temat przewodni z filmu „Janosik”"
},
"Podhale Nowy Targ": {
"przyspiewki": [
{
"tekst": "Piwko wracaj!",
"typ": "okrzyk"
}
]
},
"Pogoń Grodzisk Mazowiecki": {
"przyspiewki": [
{
"tekst": "Jesteśmy zawsze tam...",
"typ": "doping"
}
],
"hymn": "Hymn Pogoni Grodzisk Mazowiecki – „Tak jak pierwszej miłości nigdy nie zapomina się”"
},
"Pogoń Miechów": {
"przyspiewki": [
{
"tekst": "W Miechowie mamy drużynę...",
"typ": "miasto"
}
],
"hymn": "W Miechowie mamy drużynę"
},
"Pogoń Szczecin": {
"przyspiewki": [
{
"tekst": "Nie rzucim ziemi, skąd nasz Klub, nie damy pogrześć sławy. Gryfa my naród, Gryfa Ród - Szczeciński Klub Sportowy.",
"typ": "doping"
},
{
"tekst": "Nie będą pyry pluć nam w twarz, ni bluzgać nas od śledzi! Do boju stanie Gryfa Ród! Tak nam dopomóż Bóg!",
"typ": "rywal",
"rywal": "Lech Poznań"
},
{
"tekst": "Na Standarze Gryf złotem się mieni – to Pogoni Szczecin znak.",
"typ": "miasto"
},
{
"tekst": "Boi się nas cała pierwsza liga, boi się nas cały świat! O Pogonio, Pogonio, Pogonio – boi się nas cały świat!",
"typ": "doping"
},
{
"tekst": "Czy wygrywasz czy nie, ja i tak kocham cię!",
"typ": "doping"
},
{
"tekst": "Jedno serce, jeden klub, Pogoń Szczecin aż po grób",
"typ": "okrzyk"
},
{
"tekst": "Szczecin czeka, my czekamy, na zdobycie pierwszej bramy",
"typ": "miasto"
},
{
"tekst": "Ole! To my młodzi kibole",
"typ": "okrzyk"
},
{
"tekst": "My stoimy, bo lubimy, wy stoicie, bo musicie!",
"typ": "okrzyk"
},
{
"tekst": "Za Pogoń damy w każdy czas, czy czas dobry, czy czas zły",
"typ": "doping"
},
{
"tekst": "W 1 lidze czy nie, my i tak kochamy cię",
"typ": "doping"
},
{
"tekst": "Pogoń Legia dwa bratanki",
"typ": "zgoda",
"rywal": "Legia Warszawa"
},
{
"tekst": "Przybyszu miej to na uwadze, Pogoń trzyma tutaj władzę",
"typ": "miasto"
},
{
"tekst": "Hej Pogoń Szczecin, kochamy Cię, będziemy z Tobą na dobre i na złe, będziemy walczyć po życia kres, hej Pogoń Szczecin, bawimy się!",
"typ": "doping"
},
{
"tekst": "Od Szczecina do Opola",
"typ": "zgoda",
"rywal": "Odra Opole"
},
{
"tekst": "Dziś zgodnym rytmem biją nam...",
"typ": "doping"
},
{
"tekst": "Od Szczecina do Opola każdy śpiewa: Pogoń gola!",
"typ": "miasto"
},
{
"tekst": "Pogoooń, Pogoooń, Pogoooooń... tralalala!",
"typ": "okrzyk"
},
{
"tekst": "Kocham Pogoń szczecińską! Dla niej oddałbym wszystko!",
"typ": "doping"
},
{
"tekst": "Tańczymy labada, tańczą go kibice szczecińskiej Pogoni!",
"typ": "doping"
},
{
"tekst": "Tylko Pogoń MKS!",
"typ": "okrzyk"
},
{
"tekst": "Pogoń! Szczecin!",
"typ": "okrzyk"
},
{
"tekst": "O mój MKS-ie, ja kocham Cię!",
"typ": "doping"
},
{
"tekst": "Ole ola, szczecińska Pogoń! I tylko Pogoń szczecińska!",
"typ": "doping"
},
{
"tekst": "Wygraj kochana! Walcz do końca dzisiaj dla nas!",
"typ": "doping"
},
{
"tekst": "Coście tak cicho?",
"typ": "rywal",
"rywal": "Piast Gliwice"
},
{
"tekst": "Z kim wy przegraliście?",
"typ": "doping"
},
{
"tekst": "Gramy u siebie!",
"typ": "okrzyk"
},
{
"tekst": "Portowcy to my!",
"typ": "okrzyk"
},
{
"tekst": "Pogoń szczecińska MKS!",
"typ": "okrzyk"
},
{
"tekst": "Na sztandarze Gryf złotem się mieni, to Pogoni Szczecin znak, jej kibice są niezwyciężeni, boi się nas cały świat",
"typ": "miasto"
},
{
"tekst": "Chociaż ciężki jest czas, PZPN gnębi nas, będą, będą kibice na Pogoń szli, nie pokona nas już nikt",
"typ": "doping"
},
{
"tekst": "Widzew to kurwa, jebać ŁKS, spadnie GKS na sezonów sześć, Wisłę przejdziemy, Lecha zajebiemy, ligę wygramy, Puchar będzie nasz",
"typ": "rywal",
"rywal": "Lech Poznań"
},
{
"tekst": "Pogoń szczecińska to najlepszy klub, kto nie wierzy, to chuj mu w dziób",
"typ": "doping"
},
{
"tekst": "Czy wygrywasz czy nie, ja i tak kocham Cię, bo najlepsza w Polsce jest Pogoń Szczecin MKS",
"typ": "doping"
},
{
"tekst": "Od Szczecina do Opola płynie piosnka ta wesoła, czy staruszek, czy małolat, każdy śpiewa: Pogoń gola! Pogoń gola, eej Pogoń gola!",
"typ": "miasto"
},
{
"tekst": "Tylko Pogoń, ukochana Pogoń, cały Szczecin czeka na zwycięstwo twe",
"typ": "miasto"
},
{
"tekst": "My fani Pogoni, niebiesko-czerwoni, za Pogoń, za MKS pójdziemy aż po życia kres",
"typ": "doping"
},
{
"tekst": "W wolnym mieście Szczecin, gdzie Gryf herbem miasta jest, mamy swą drużynę, która zwie się MKS. Alleluja, alleluja, alleluja MKS!",
"typ": "miasto"
},
{
"tekst": "Kocham Pogoń szczecińską, dla niej oddałbym wszystko, serce moje jedyne oddam swojej drużynie",
"typ": "doping"
},
{
"tekst": "Hej Pogoń, jesteśmy z Tobą, nie opuścimy Cię, nigdy Cię nie zdradzimy, bo my kochamy Cię",
"typ": "doping"
},
{
"tekst": "Wczoraj obiecałaś mi na pewno, że trzy punkty dzisiaj będą, więc my ufamy Ci. Hej, heja Pogoń, ukochana ma drużyno, wygrałabyś ten mecz",
"typ": "doping"
},
{
"tekst": "Do boju MKS, marsz, marsz, marsz, do boju marsz, zwycięstwo czeka nas!",
"typ": "doping"
},
{
"tekst": "Choć na świecie wiele klubów jest i może lepsze są, i sława większa jest, my w Szczecinie mamy taki klub, któremu serca oddaliśmy już",
"typ": "miasto"
},
{
"tekst": "Granatowo-bordowy sztandar nad stadionem powiewa, wiele tysięcy kibiców do boju zagrzewa. Więc marsz, marsz Portowcy, ukochana ma drużyno",
"typ": "doping"
},
{
"tekst": "Gdziekolwiek Pogoń będzie grać, blisko czy daleko stąd, tam będzie z nią szczecińska brać, aby dopingować ją",
"typ": "doping"
},
{
"tekst": "Kto dzisiaj mecz wygrywa? – Pogoń! Kto punkty trzy zdobywa? – Pogoń! Kto mistrzem Polski będzie? – Pogoń!",
"typ": "okrzyk"
},
{
"tekst": "Eja Pogoń, eja Pogoń, eja eja eja Pogoń!",
"typ": "okrzyk"
},
{
"tekst": "Najwspanialszy klub na świecie, co kibiców mnóstwo ma, każdy kibic wie, że przecież to jest Pogoń szczecińska",
"typ": "doping"
},
{
"tekst": "W pociągu jest tłok, w tramwaju jest tłok, kibice na Pogoń jadą, wtem nagle ktoś wstał, zaśpiewam ja wam piosenkę mą ukochaną",
"typ": "doping"
},
{
"tekst": "Zapamiętaj bracie mój...",
"typ": "doping"
},
{
"tekst": "Pogotowie! Pogotowie!",
"typ": "rywal",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Cracovia k****!",
"typ": "rywal",
"rywal": "Cracovia"
},
{
"tekst": "Moonlight Shadow (nowa przyśpiewka Pogoni)",
"typ": "doping"
},
{
"tekst": "Jedziemy z...",
"typ": "rywal",
"rywal": "ŁKS Łódź"
}
],
"hymn": "My Portowcy (Quo Vadis, 2008) – „My Portowcy, my Portowcy, granatowo-bordowa krew”"
},
"Polonia Bydgoszcz": {
"przyspiewki": [
{
"tekst": "Hej Polonia mistrzem jest!",
"typ": "okrzyk"
}
],
"hymn": "Gdy idzie Polonia z Bydgoszczy („Gdy idzie Polonia z Bydgoszczy, to w każdym podnosi się duch”)"
},
"Polonia Bytom": {
"przyspiewki": [
{
"tekst": "Śpiewają miasta, śpiewają wioski...",
"typ": "rywal",
"rywal": "Ruch Chorzów"
},
{
"tekst": "100 lat dziś Polonia ma",
"typ": "doping"
},
{
"tekst": "K**** pokonamy!",
"typ": "doping"
},
{
"tekst": "Polonia nigdy nie zginie!",
"typ": "okrzyk"
},
{
"tekst": "Zawsze z Tobą",
"typ": "doping"
},
{
"tekst": "Stadion przejęty",
"typ": "miasto"
},
{
"tekst": "Patologią jesteśmy od lat...",
"typ": "doping"
},
{
"tekst": "Wisła to stara...",
"typ": "rywal",
"rywal": "Wisła Kraków"
}
],
"hymn": "Hymn Polonii Bytom (na nutę Marszu Polonii) – „Jeszcze Polonia nie zginęła, póki my żyjemy”"
},
"Polonia Warszawa": {
"przyspiewki": [
{
"tekst": "Za te Czarne, Czarne Koszule serce, duszę bym dał, a co!",
"typ": "doping"
},
{
"tekst": "Mówią o mnie głupi, po coś ty je brał, po coś te Czarne, Czarne Koszule mocno pokochał, a co!",
"typ": "doping"
},
{
"tekst": "Śląsk cały jest nasz, Śląsk do Polonii należy, nie damy nikomu, nikomu nie damy, Śląsk do Polonii należy",
"typ": "zgoda",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Za te czterdzieści lat! Za trzeciej ligi smak! Na Mistrza Polski przyszedł czas, to Polonia Warszawa...",
"typ": "doping"
},
{
"tekst": "Serce Warszawy",
"typ": "miasto"
},
{
"tekst": "Choć wiem, że są na świecie większe kluby...",
"typ": "doping"
},
{
"tekst": "Kto nie skacze, ten za Legią!",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Dokładamy do kotła",
"typ": "doping"
},
{
"tekst": "Polonijny swing",
"typ": "doping"
}
],
"hymn": "Za te czterdzieści lat („Za te czterdzieści lat! Za trzeciej ligi smak! Na Mistrza Polski przyszedł czas”)"
},
"Puszcza Niepołomice": {
"przyspiewki": [
{
"tekst": "Puszcza to my!",
"typ": "okrzyk"
},
{
"tekst": "Żółto-zielone serca",
"typ": "doping"
}
],
"hymn": "Hymn Puszczy Niepołomice – „To nasz dzień niepołomny, wielki sen”"
},
"Radomiak Radom": {
"przyspiewki": [
{
"tekst": "Już od najmłodszych lat zielony jest nasz świat, wiara, nadzieja w nim, do końca naszych dni, już tylko Radomiak.",
"typ": "doping"
},
{
"tekst": "Być tam, gdzie Radomiak gra",
"typ": "doping"
},
{
"tekst": "Co to jest za drużyna...",
"typ": "doping"
},
{
"tekst": "Następnym razem wejdziecie, jak do nas wyjdziecie",
"typ": "rywal",
"rywal": "Korona Kielce"
},
{
"tekst": "Jak wy polskiego nie znacie",
"typ": "rywal",
"rywal": "Ruch Chorzów"
},
{
"tekst": "Że są trzy...",
"typ": "doping"
},
{
"tekst": "Na pierwszą ligę!",
"typ": "doping"
},
{
"tekst": "Być tam, gdzie Radomiak gra (na melodię „Zawsze tam, gdzie Ty” Lady Pank)",
"typ": "doping"
},
{
"tekst": "Dopóki będę żył, Radomiak w sercu mym...",
"typ": "doping"
}
],
"hymn": "Radomiak Radom, Nasza Noc"
},
"Raków Częstochowa": {
"przyspiewki": [
{
"tekst": "O mój Rakowie...",
"typ": "doping"
},
{
"tekst": "Obudź się, Rakowie!",
"typ": "doping"
},
{
"tekst": "Coście tak cicho?",
"typ": "rywal",
"rywal": "Widzew Łódź"
},
{
"tekst": "Raków, my z wami – auuu!",
"typ": "okrzyk"
},
{
"tekst": "Całe życie z wariatami",
"typ": "doping"
},
{
"tekst": "Całym naszym życiem jest Raków RKS, czerwono-niebieski świat od tak wielu lat… Oddajemy duszę Ci oraz serce swe, bo my tak kochamy Cię, Ave Raków Ave",
"typ": "doping"
},
{
"tekst": "Grafy się odmaluje",
"typ": "rywal",
"rywal": "Widzew Łódź"
}
],
"hymn": "Ave Raków, Ave („Spośród wielu życia dróg wybraliśmy tą, od kołyski aż po grób kochać jeden klub”)"
},
"Resovia": {
"przyspiewki": [
{
"tekst": "Na ulicy Hetmańskiej ma siedzibę swą Stal rzeszowska, tak nazwali k**wę tą. Powiem Ci k**wo, czemu nienawidzisz mnie: bo ja kocham Sovię i Ty dobrze o tym wiesz",
"typ": "rywal",
"rywal": "Stal Rzeszów"
},
{
"tekst": "Na ulicy Hetmańskiej...",
"typ": "rywal",
"rywal": "Stal Rzeszów"
},
{
"tekst": "Resovia rządzi...",
"typ": "miasto"
}
]
},
"Rodło Kwidzyn": {
"przyspiewki": [
{
"tekst": "Całe Rodło odpowiada...",
"typ": "doping"
}
]
},
"Ruch Chorzów": {
"przyspiewki": [
{
"tekst": "Oto jest dzień, który dał nam Pan! Weselmy się i radujmy się w nim!",
"typ": "doping"
},
{
"tekst": "Nasz Ruch Chorzów, tylko on",
"typ": "okrzyk"
},
{
"tekst": "Ruch! Ruch! HKS!",
"typ": "okrzyk"
},
{
"tekst": "Ruchu nasz ukochany...",
"typ": "doping"
},
{
"tekst": "Horto Magiko (przyśpiewka Niebieskich)",
"typ": "doping"
},
{
"tekst": "Bijcie się z nami!",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "Ole ole, ole ola...",
"typ": "doping"
},
{
"tekst": "Jesteśmy tu...",
"typ": "doping"
},
{
"tekst": "Jedziemy na wyjazd do Zabrza",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "Ruchu nasz kochany, ligowa drużyno, wszyscy Cię kochamy, chłopak wraz z dziewczyną. Hej Ruchu nasz, kochany nasz, nie zawiedź nas, nigdy nie opuścimy Cię",
"typ": "doping"
},
{
"tekst": "Niebiescy, Niebiescy, nasza to drużyna, górnicy, hutnicy, mecz się już zaczyna",
"typ": "miasto"
},
{
"tekst": "Niebieska eRka na niebie się mieni! To jest Ruchu Chorzów znak! Ich kibice są niezwyciężeni! Boi się ich cały świat!",
"typ": "doping"
},
{
"tekst": "Boją się ich kibice z Sosnowca! Boi się ich cała Małopolska! O Ruch Chorzów, Ruch Chorzów, Ruch Chorzów! Ty najlepszych kibiców w Polsce masz!",
"typ": "doping"
},
{
"tekst": "Ruchu nasz ukochany, my wspieramy zawsze Cię, głośny doping, mecz wygrany, to dziś dla nas liczy się. Ijale, ijaleo, ijaleoleole...",
"typ": "doping"
},
{
"tekst": "W pewnym śląskim mieście przy ulicy Cichej 6 jest taka drużyna, co się Ruchem Chorzów zwie. Ruchu, Ruchu, Ruchu, ty 14 mistrzów masz, Ruchu, Ruchu, Ruchu, na 15 nadszedł czas",
"typ": "miasto"
},
{
"tekst": "Moja jedyna miłość to Niebiescy! My jesteśmy z Tobą! Klubie, klubie, klubie Ty nasz, pokaż jak grasz!",
"typ": "doping"
},
{
"tekst": "To my chłopcy ze Śląska! Zna nas cała Polska! Za Ruch, za HKS! Pójdziemy aż po życia kres!",
"typ": "miasto"
},
{
"tekst": "Ruchu Chorzów kocham Cię! Tobie oddam serce swe! Serce moje jedyne oddam mojej drużynie!",
"typ": "doping"
},
{
"tekst": "Ruchu, kochany klubie nasz! Pokonasz Górnik, Górnik, Górnik, pokonasz!",
"typ": "rywal",
"rywal": "Górnik Zabrze"
},
{
"tekst": "Wielka, wielka, wielka! Niebieska eRka!",
"typ": "okrzyk"
},
{
"tekst": "Nasze życie! Jest niebieskie!",
"typ": "okrzyk"
},
{
"tekst": "Kochamy Ruch, kochamy Ruch! Kochamy nasz chorzowski klub!",
"typ": "doping"
},
{
"tekst": "Kto wygra mecz? – Ruch! – Kto? – Ruch! – Kto? – Ruch, Ruch, Ruch!",
"typ": "okrzyk"
},
{
"tekst": "Hej gola, Niebiescy gola, Niebiescy gola! Niebiescy gola, Niebiescy raz, dwa, trzy!",
"typ": "okrzyk"
},
{
"tekst": "Czy mnie kochasz, czy nie, ja i tak kocham Cię! W moim sercu jest Ruch i na dobre i na złe!",
"typ": "doping"
},
{
"tekst": "Więc wstań, do góry głowę wznieś, śpiewaj naszą pieśń, śpiewaj naszą pieśń, HKS, HKS, HKS!",
"typ": "doping"
},
{
"tekst": "Hej Ruch Chorzów, ukochana ma drużyno, wygrałabyś ten mecz, ten ważny mecz. Hej Niebiescy ole! Hej Ruch Chorzów aejao!",
"typ": "doping"
},
{
"tekst": "Hej gol, hej gol – Niebiescy gol!",
"typ": "okrzyk"
},
{
"tekst": "Niebiescy hej! Niebiescy ole ole! Nasza miłość jedyna to niebieska drużyna!",
"typ": "doping"
},
{
"tekst": "Naszym klubem HKS, każdy Ślązak o tym wie, że najlepszy w Polsce jest nasz chorzowski HKS",
"typ": "miasto"
},
{
"tekst": "HKS, HKS, HKS! Niebiescy, Niebiescy! Górny Śląsk, Górny Śląsk!",
"typ": "okrzyk"
},
{
"tekst": "Do boju Niebiescy! Marsz, marsz, marsz! Do boju marsz! Zwycięstwo czeka nas!",
"typ": "doping"
},
{
"tekst": "O la la, o li, o la la ole, Ruch Chorzów dziś wygra, a my za to naje... się!",
"typ": "doping"
},
{
"tekst": "Zawsze wierni i oddani, po kres życia Psycho Fani!",
"typ": "okrzyk"
},
{
"tekst": "Oficjalni chuligani KS Ruch!",
"typ": "okrzyk"
},
{
"tekst": "Dwukolorowa – największa mafia z Chorzowa!",
"typ": "miasto"
},
{
"tekst": "Niebiescy gol, Niebiescy gol! Niebiescy gol, gol, gol, gol, gol! Sialalalalalala!",
"typ": "okrzyk"
},
{
"tekst": "Jesteśmy zawsze tam, gdzie nasz Ruch Chorzów gra! Aejao Niebiescy gol!",
"typ": "doping"
},
{
"tekst": "Jesteśmy z Wami! Niebiescy, jesteśmy z Wami! Chorzów (klask klask klask) gola!",
"typ": "okrzyk"
},
{
"tekst": "Chorzów czeka, my czekamy na zdobycie pierwszej bramy!",
"typ": "miasto"
},
{
"tekst": "Chorzowie, gola strzel! Hej gol, hej gol, hej gol, gol, gol...",
"typ": "okrzyk"
},
{
"tekst": "Teraz bramka musi być! Teraz bramka musi być HEJ!",
"typ": "okrzyk"
},
{
"tekst": "Jeszcze jedna bramka, jeszcze jedna musi być, HEJ!",
"typ": "okrzyk"
},
{
"tekst": "O tylko Ty",
"typ": "doping"
},
{
"tekst": "Chociaż czasem bywa źle...",
"typ": "doping"
},
{
"tekst": "Chorzowskie chachary (na melodię „The Hanging Tree”)",
"typ": "miasto"
},
{
"tekst": "Tutaj wiara wielka jest",
"typ": "doping"
},
{
"tekst": "Nasz chorzowski Ruch! Ukochany klub!",
"typ": "miasto"
},
{
"tekst": "Ja Odrę...",
"typ": "rywal",
"rywal": "Odra Opole"
}
],
"hymn": "Ruchu nasz kochany („Ruchu nasz kochany, ligowa drużyno, wszyscy Cię kochamy, chłopak wraz z dziewczyną”)"
},
"Sandecja Nowy Sącz": {
"przyspiewki": [
{
"tekst": "Sialalalala, hej Sandecja!",
"typ": "okrzyk"
},
{
"tekst": "Naprzód Sandecjo, marsz!",
"typ": "doping"
},
{
"tekst": "Miasto z polskich gór",
"typ": "miasto"
},
{
"tekst": "Chodźcie śmiało, jest nas mało!",
"typ": "doping"
}
],
"hymn": "Biało-Czarne Serce („Budzi się do życia miasto Nowy Sącz, serce wypełnione biało-czarną krwią”)"
},
"Sparta Brodnica": {
"przyspiewki": [
{
"tekst": "Zawisza, dzięki za wejście!",
"typ": "rywal",
"rywal": "Zawisza Bydgoszcz"
},
{
"tekst": "Tylko Sparta BKS!",
"typ": "okrzyk"
}
]
},
"Stal Mielec": {
"przyspiewki": [
{
"tekst": "W grodzie nad Wisłoką, gdzie potężny zakład jest, jest taka drużyna, która zwie się FKS. Alleluja, alleluja, alleluja FKS!",
"typ": "miasto"
},
{
"tekst": "Stal mielecka! Au!",
"typ": "okrzyk"
},
{
"tekst": "Biało-niebiescy",
"typ": "okrzyk"
},
{
"tekst": "Gramy u siebie!",
"typ": "okrzyk"
},
{
"tekst": "Coście tak cicho, hej k..wy!",
"typ": "rywal",
"rywal": "Podbeskidzie Bielsko-Biała"
},
{
"tekst": "Śląsk, dziękujemy!",
"typ": "zgoda",
"rywal": "Śląsk Wrocław"
}
],
"hymn": "Hymn Stali Mielec – „W grodzie nad Wisłoką, gdzie potężny zakład jest, jest taka drużyna, która zwie się FKS”"
},
"Stal Rzeszów": {
"przyspiewki": [
{
"tekst": "Od zawsze tutaj byłem...",
"typ": "miasto"
},
{
"tekst": "A Resovię...",
"typ": "rywal",
"rywal": "Resovia"
},
{
"tekst": "Chodźcie do lasu!",
"typ": "rywal",
"rywal": "Resovia"
}
],
"hymn": "Hymn Stali Rzeszów (Monstrum) – „Biało-niebieska jest ich chorągiew, którą dziś tak dumnie unosi wiatr, na piersiach Żurawia znak”"
},
"Stal Stalowa Wola": {
"przyspiewki": [
{
"tekst": "Wiernym i wytrwałym będę dziś, w swojej sile będę trwać, po to by na całą Polskę dziś słynął...",
"typ": "doping"
},
{
"tekst": "Historię tego miasta...",
"typ": "miasto"
},
{
"tekst": "Derby w smrodowie",
"typ": "rywal",
"rywal": "Siarka Tarnobrzeg"
}
],
"hymn": "Hymn Stali Stalowa Wola – „Wiernym i wytrwałym będę dziś, w swojej sile będę trwać”"
},
"Start Pruszcz": {
"przyspiewki": [
{
"tekst": "Jesteśmy zawsze tam, gdzie nasz Starterek gra!",
"typ": "doping"
}
]
},
"Unia Oświęcim": {
"przyspiewki": [
{
"tekst": "Wiara, która przetrwała",
"typ": "doping"
},
{
"tekst": "W drodze po swoje...",
"typ": "doping"
},
{
"tekst": "Ruch, Ruch, HKS! (zgodowy doping)",
"typ": "zgoda",
"rywal": "Ruch Chorzów"
},
{
"tekst": "Ruda Śląska łowcy szczew...",
"typ": "rywal",
"rywal": "GKS Katowice"
}
]
},
"Unia Tarnów": {
"przyspiewki": [
{
"tekst": "Unia, Unia, Unia Pany! Unia Pany, Unia Pany!",
"typ": "okrzyk"
},
{
"tekst": "Tarnów jest nasz!",
"typ": "miasto"
},
{
"tekst": "Gotowi na wszystko",
"typ": "doping"
}
],
"hymn": "Unia Pany („Unia, Unia, Unia Pany, Unia Pany, Unia Pany”)"
},
"Victoria 1918 Jaworzno": {
"przyspiewki": [
{
"tekst": "Ultras Vicia!",
"typ": "okrzyk"
},
{
"tekst": "Puchar jest nasz!",
"typ": "okrzyk"
}
]
},
"Vineta Wolin": {
"przyspiewki": [
{
"tekst": "„Literka” – wspólna śpiewka braci z Vinety i Świtu Skolwin",
"typ": "zgoda",
"rywal": "Świt Szczecin"
}
]
},
"Warta Poznań": {
"przyspiewki": [
{
"tekst": "Na zawsze wierni, wierni i oddani ukochanej Warcie najwierniejsi fani",
"typ": "doping"
},
{
"tekst": "Zielona rewolucja!",
"typ": "okrzyk"
}
],
"hymn": "Hymn Warty Poznań (skomp. Sylwia Grzeszczak, 2011) – „Tak pisała się historia, gramy tutaj od stu lat”"
},
"Widzew Łódź": {
"przyspiewki": [
{
"tekst": "W naszym mieście Łodzi, gdzie łódeczka w herbie jest, mamy swą drużynę, która zwie się RTS! Alleluja, alleluja, alleluja - Widzew Łódź!",
"typ": "miasto"
},
{
"tekst": "Serce Łodzi bije właśnie tu!",
"typ": "miasto"
},
{
"tekst": "Tylko łódzki Widzew",
"typ": "okrzyk"
},
{
"tekst": "Wygraj nasz Widzewie, powrót do Europy to nasz cel, doping tych kibiców do zwycięstwa niech poniesie cię... la la la",
"typ": "doping"
},
{
"tekst": "Tu się wychowałem i zakochałem się, sobie obiecałem, że nie opuszczę Cię! Chociaż bywa ciężko, to moja wiara trwa, bo moim...",
"typ": "miasto"
},
{
"tekst": "W pewnym śląskim mieście...",
"typ": "zgoda",
"rywal": "Ruch Chorzów"
},
{
"tekst": "Hej Czarna, pokaż...",
"typ": "doping"
},
{
"tekst": "Brøndby (przyśpiewka na melodię Brøndby)",
"typ": "doping"
},
{
"tekst": "Jagiellonia jest zboczona, stara...",
"typ": "rywal",
"rywal": "Jagiellonia Białystok"
},
{
"tekst": "Nasz Widzewie! Roz*** te k***!",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Widzew dla mnie to jest cały świat!",
"typ": "doping"
},
{
"tekst": "Widzew, Widzew, łódzki Widzew...",
"typ": "okrzyk"
}
],
"hymn": "Taniec Eleny"
},
"Wieczysta Kraków": {
"przyspiewki": [
{
"tekst": "Jest w Krakowie przy Meissnera mały klubik, każdy wie, jego barwy żółto-czarne, a Wieczysta on się zwie",
"typ": "miasto"
}
],
"hymn": "Hymn Wieczystej Kraków (sł. Janusz Malicki) – „Jest w Krakowie przy Meissnera mały klubik, każdy wie, jego barwy żółto-czarne”"
},
"Wisła Kraków": {
"przyspiewki": [
{
"tekst": "Każdy to powie, Wisełka rządzi w Krakowie!",
"typ": "miasto"
},
{
"tekst": "Wisła pany!",
"typ": "okrzyk"
},
{
"tekst": "Na Pasy sr…my, Wisłę w sercu mamy",
"typ": "rywal",
"rywal": "Cracovia"
},
{
"tekst": "Wisła: Wisła! – Cracovia: K…wa! – Wisła: Twoja stara! – Cracovia: Was je…ała! – Wisła: Może by chciała, ale się w majty zes…ła!",
"typ": "rywal",
"rywal": "Cracovia"
},
{
"tekst": "Z tysięcy klubów ja wybrałem ten, ten boski krakowski nasz TS.",
"typ": "doping"
},
{
"tekst": "Siedzibę dał mu Kraka gród, a w herbie gwiazdę białą. Niech chwała Twoja wiecznie trwa, niech świeci gwiazda twa.",
"typ": "miasto"
},
{
"tekst": "Święte barwy swe wznieś i zaśpiewaj tę pieśń. Niech patrzy cały świat, jak nasza Wisła gra. Więc naprzód w bój, kochany klubie mój",
"typ": "doping"
},
{
"tekst": "Biała Gwiazda na niebie się mieni, / Tak powstaje Wisły znak. / Jej kibice są niezwyciężeni, / Boi się nas cały świat.",
"typ": "doping"
},
{
"tekst": "Stadion Legii pali się. / Legia płonie i nigdy nie zgaśnie,",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Biała Gwiazdo - świeć daleko stąd, / Świeć daleko, poprzez cały ląd. / Powiedz wszystkim, że Wisełka ma / Jest najlepsza i najwspanialsza. (Bis)",
"typ": "doping"
},
{
"tekst": "Bo w Krakowie Krakowie Krakowie / Gdzie najlepsi kibice w Polsce są / Hej Wisełko Wisełko Wisełko / Ty najlepszych kibiców w Polsce masz",
"typ": "miasto"
},
{
"tekst": "Być mistrzem Polski to nie łatwa rzecz / A więc Wisełko na szczyty się wznieś / Weź i pokaż jak za dawnych lay bywało / Wszystkim udowodnij żeś najlepsza jest",
"typ": "doping"
},
{
"tekst": "A kto by pomyślał Legia leci w dół (Bis)",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Chociaż w świecie wiele klubów jest, / i może większe są, / i sława większa jest. / My w Krakowie,",
"typ": "miasto"
},
{
"tekst": "Abośmy to jacy tacy, jacy tacy, jacy tacy, / Chłopcy krakowiacy, z Reymonta Wiślacy, / Czerwony szaliczek, niebieska wstążeczka / i biała gwiazdeczka.",
"typ": "miasto"
},
{
"tekst": "Ojczyzna - Polska, Miasto - Kraków / Niech żyją nam tysiące lat / Wraz z nimi, w blasku Białej Gwiazdy - / Kochana nasza Wisełka",
"typ": "miasto"
},
{
"tekst": "Boi się nas Legia Warszawa, / Boi się nas Chorzowski Ruch.",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Boi się nas gumiorski Hutnik, / Boją się nas pasiaste psy.",
"typ": "rywal",
"rywal": "Hutnik Kraków"
},
{
"tekst": "Boją się nas pasiaste psy. / Bo nasza armia to potęga",
"typ": "rywal",
"rywal": "Cracovia"
},
{
"tekst": "Czy wygrywasz czy nie, / Zawsze ja kocham Cię. / W sercu moim Wisła, / i na dobre i na złe.",
"typ": "doping"
},
{
"tekst": "Do boju Wisełka, / Marsz, marsz, marsz, / Do boju marsz, / Zwycięstwo czeka nas (2xBis)",
"typ": "doping"
},
{
"tekst": "Gdziekolwiek nasza Wisła gra / Blisko czy daleko stąd / Jest zawsze z nią Wiślacka brać / Aby dopingować Ją",
"typ": "doping"
},
{
"tekst": "Gdzieś w starym mieście jak świat, / Drużyna krakowska gra. / My wierni drużynie swej / Zaśpiewajmy tę pieśń:",
"typ": "miasto"
},
{
"tekst": "Hej na Krakowskim rynku, Flagi powiewają, flagi powiewają. / Śpiewy na Reymonta - To Wiślacy grają. / Hej na Krakowskim rynku, / Sztandary z Gwiazdami, sztandary z Gwiazdami.",
"typ": "miasto"
},
{
"tekst": "Hejże hej ! Gwiazdo ma ! / Pokaż jak lśnie gwiazda twa ! / Hejże hej ! Gwiazdo ma ! / Biała Gwiazda kochana !",
"typ": "doping"
},
{
"tekst": "Ja w Krakowie pragną marzyć, / Ja w Krakowie pragnę śnić, / I Wisełce dopingować, / I z Wisełką w zgodzie żyć.",
"typ": "miasto"
},
{
"tekst": "Jest zakątek na tej ziemi, / Gdzie przyjechać każdy chce. / To królewskie Miasto Kraków / Nawet dziecko o tym wie.",
"typ": "miasto"
},
{
"tekst": "Jestem Krakowskim Wiślakiem - Wisełka gol, Wisła gol. / Białą Gwiazdę noszę w klapie - Wisełka gol, Wisła gol. / Kiedy idę na Reymonta - Wisełka gol, Wisła gol. / Piękny szal me ciało splata - Wisełka gol, Wisła gol.",
"typ": "miasto"
},
{
"tekst": "Brać Wrocławską i brać Gdańska - Wisełka go, Wisła gol.",
"typ": "zgoda",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Już od rana pod kasami tłumy się zbierają. / Każdy pyta: Co się dzieje ? - to Wiślacy grają. / Idź Wisełko w górę idź, / Bierz trzy punkty naraz.",
"typ": "doping"
},
{
"tekst": "Kiedy nasza Wisła gra, / to każdemu radę da. / Kiedy my jesteśmy z nią, / to trzy punkty pewne są.",
"typ": "doping"
},
{
"tekst": "Mieszkam w Królewskim Krakowie, / Jej oddałem serce swe. / Moim klubem jest Wisełka / I na dobre i na złe.",
"typ": "miasto"
},
{
"tekst": "Moja jedyna miłość - to Wisełka / i my jesteśmy z Tobą, / Klubie, Klubie, Klubie ty nasz, / Wisełko ma.",
"typ": "doping"
},
{
"tekst": "Na dworze jest mrok, w tramwaju jest tłok, / kibice na Wisłę jadą. / Wtem nagle ktoś wstał - zaśpiewam ja wam / o Wiśle mej ukochanej.",
"typ": "doping"
},
{
"tekst": "Na prawo most, na lewo most, / A dołem Wisła płynie. / Tu jeden gol, tam drugi gol, / Zwycięstwo nas nie minie.",
"typ": "doping"
},
{
"tekst": "Cracovia za to trudni się obmową, / A coraz słabsze kluby do się zwie.",
"typ": "rywal",
"rywal": "Cracovia"
},
{
"tekst": "Najwspanialszy klub na świecie, / co kibiców mnóstwo ma, / Każdy kibic wie, że przecież, / To jest nasza Wisełka.",
"typ": "doping"
},
{
"tekst": "Ani Legia, Nie Zagłębie, / Tylko Wisła Mistrzem będzie.",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Nawet słynna Barcelona, / Naszej Wisły, nie pokona. / Nawet słynna AS Roma, / Naszej Wisły, nie pokona.",
"typ": "doping"
},
{
"tekst": "Nikt nam nie zrobi nic / Nic nam nie stanie się. / Bo z nami jest, / Bo z nami jest .....",
"typ": "doping"
},
{
"tekst": "O Tobie Wisło tylko marzę, o Tobie Wisło tylko śnię, / chciałbym całować gwiazdę twoją i głośno krzyczeć: Kocham Cię. / Od dawna w Tobie zakochany, po dzień dzisiejszy kocham Cię, / Na zawsze wierny i oddany, będę gorąco kochał Cię.",
"typ": "doping"
},
{
"tekst": "Wisła - znowu dzisiaj gra. / Wisła - serce moje ma. / Wisła - dzisiaj wygra mecz. / Wisła - najwspanialsza jest (Bis)",
"typ": "doping"
},
{
"tekst": "Po burzy słońce wychodzi zza chmur, / i nad Krakowem zaświeci znów. / O jednym marzę, o jednym wciąż śnię, / Mistrzem będzie Wisełka, na pewno to wiem.",
"typ": "miasto"
},
{
"tekst": "Przyjdę do Ciebie Wisełko moja, / Przyjdę do Ciebie, gdy będziesz grać. / Aby oglądać zwycięstwa twoje, / Aby podziwiać dziś twoją grę.",
"typ": "doping"
},
{
"tekst": "Płynie Wisła płynie, / Po polskiej krainie, po polskiej krainie, / Zobaczyła Kraków, nigdy go nie minie / Zobaczyła Kraków",
"typ": "miasto"
},
{
"tekst": "Quantanamera Wisełka wygra do zera / Dzisiaj niedziela Wisełka wygra do zera / Żółto-Czerwoni to bracia są z Jagielonii / Żółto-Czerwoni to bracia są z Jagielonii (Bis)",
"typ": "zgoda",
"rywal": "Jagiellonia Białystok"
},
{
"tekst": "Trzy punkty już, stracili dzisiaj jaka szkoda, / Trzy punkty już, stracili jak im żal, / Trzy punkty już, zabrała im Wisełki woda, / Trzy punkty już, odeszły dzisiaj w siną dal.",
"typ": "doping"
},
{
"tekst": "Tylko jeden Klub, / Kocham aż po grób. / Kraków to nasz gród, / Wisełko naprzód!",
"typ": "miasto"
},
{
"tekst": "Tylko Ty / W moim sercu Ty / Jedna, Jedyna, Niepokonana / Wisła kochana (Bis)",
"typ": "doping"
},
{
"tekst": "Tylko Wisła Kraków nasz TS / Wisła Kraków T / Wisła Kraków S / Tylko Wisła Kraków nasz TS (Bis)",
"typ": "miasto"
},
{
"tekst": "'U nas w mieście na Reymonta, / Gdzie najlepsza wiara jest. / Ukochana jest drużyna, / Co się Wisła Kraków zwie.",
"typ": "miasto"
},
{
"tekst": "W mieście Królewskim, którego sława / Na całym świecie jest znana / Mamy od wieku klub ukochany / Wisłą Krakowską nazwany.",
"typ": "miasto"
},
{
"tekst": "Wczoraj obiecałaś mi na pewno, / Że, trzy punkty dzisiaj będą, / Więc wygraj Wisło mecz. / Nasza, nasza wiara niezachwiana,",
"typ": "doping"
},
{
"tekst": "Wisełka gol, Wisełka gol, / Wisełka gol, gol, gol, gol, gol. / Jak dalej będziesz grał, / To mistrza Polski będziesz miał.",
"typ": "doping"
},
{
"tekst": "Wisełko wygraj mecz, / Królowo Polskich rzek / Ty musisz wygrać mecz, / Ten ważny mecz. (Bis)",
"typ": "doping"
},
{
"tekst": "Wisła niech nam żyje, / Niech rywali swoich bije, / Niech na mistrza w ekstraklasie, / I miliony w kasie.",
"typ": "doping"
},
{
"tekst": "Wisła - to jest potęga ! / Wisła - najlepsza jest ! / Wisła - trzeba szanować ! / Wisłę - ten nasz TS !",
"typ": "doping"
},
{
"tekst": "Wisło ty ma, Wisło ty ma, / Pokaż światu jak się w piłkę gra, / Niech Cię cała Polska zna. / Wygraj ten mecz, wygraj ten mecz,",
"typ": "doping"
},
{
"tekst": "Wisło Wisło ma drużyno / My kibice kochamy Cię / Wisło Wisło strzelaj bramki / I na mistrza szykuj się",
"typ": "doping"
},
{
"tekst": "Wszystko Tobie Wisło ukochana, / Nasze serca dla Ciebie biją. / Armia Twoja zawsze Ci oddana, / To kibice wierni Twoi są.",
"typ": "doping"
},
{
"tekst": "Znów przyjdzie wiosna / i lepsze czasy / Powróci nasza Wisełka / na czoło ekstraklasy (Bis)",
"typ": "doping"
},
{
"tekst": "Dlatego... Zostań z nami Wisełko / Wygraj dla nas ten mecz / Jesteś naszą Królową / Jesteś dla nas the best (2xBis)",
"typ": "doping"
},
{
"tekst": "Krakowska Wisła to nasz klub, potężny i wspaniały, siedzibę dał mu Kraka gród, odwagę orzeł biały",
"typ": "miasto"
},
{
"tekst": "W wolnym mieście Gdańsku, gdzie korona w herbie jest, mamy swego brata...",
"typ": "zgoda",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Płonie ognisko na Łazienkowskiej, stadion Legii pali się. Legia płonie i nigdy nie zgaśnie, kibice Wisły cieszą się",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Boi się nas Legia Warszawa, boi się nas chorzowski Ruch, boi się nas gumiorski Hutnik, boją się nas pasiaste psy",
"typ": "rywal",
"rywal": "Cracovia"
},
{
"tekst": "I nad Odrą we Wrocławiu, gdzie orzełek w herbie jest, mamy swego brata, który zwie się WKS. Aleluja, aleluja WKS, przyjacielem Wisły jest",
"typ": "zgoda",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Mamy swego brata, który zwie się BKS. Aleluja, aleluja BKS, przyjacielem Wisły jest",
"typ": "zgoda",
"rywal": "Lechia Gdańsk"
},
{
"tekst": "Było ich sześciu, potem dwunastu...",
"typ": "doping"
},
{
"tekst": "To my! Wściekłe psy!",
"typ": "okrzyk"
},
{
"tekst": "Naprzód Wisło, naprzód TS, naprzód Wisło, wygraj ten mecz, jesteśmy tu, by wspierać Cię, u siebie czy na...",
"typ": "doping"
},
{
"tekst": "Wisełko nasza, coraz bliżej Ekstraklasa",
"typ": "doping"
},
{
"tekst": "Zemsty przyjdzie czas",
"typ": "doping"
},
{
"tekst": "Skończyła się taryfa ulgowa!",
"typ": "doping"
},
{
"tekst": "Jestem kibicem Wisełki Kraków",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Tak się bawią ludzie...",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Święte barwy",
"typ": "doping"
},
{
"tekst": "My chłopcy z Reymonta",
"typ": "miasto"
},
{
"tekst": "Koniec głaskania!",
"typ": "doping"
},
{
"tekst": "Przegrywacie z frajerami!",
"typ": "doping"
},
{
"tekst": "Stadion Legii pali się",
"typ": "rywal",
"rywal": "Legia Warszawa"
},
{
"tekst": "Nie wybaczymy!",
"typ": "rywal",
"rywal": "Cracovia"
},
{
"tekst": "Wisła Kopenhaga",
"typ": "doping"
},
{
"tekst": "W szeregi ekstraklasy",
"typ": "doping"
}
],
"hymn": "Jak długo na Wawelu (Zwycięży Orzeł Biały, zwycięży polski ród, zwycięży nasza Wisła, bo to krakowski klub)"
},
"Wisła Płock": {
"przyspiewki": [
{
"tekst": "Wisła dzisiaj nas zaprasza na wspaniały mecz, kibicować naszym chłopcom najważniejsza rzecz",
"typ": "doping"
},
{
"tekst": "Idę na Wisłę!",
"typ": "okrzyk"
},
{
"tekst": "Reguły są proste...",
"typ": "zgoda",
"rywal": "Stomil Olsztyn"
}
],
"hymn": "Hymn Wisły Płock („Wisła dzisiaj nas zaprasza na wspaniały mecz, kibicować naszym chłopcom najważniejsza rzecz”)"
},
"Włocłavia Włocławek": {
"przyspiewki": [
{
"tekst": "Włocłavia! Włocłavia! Włocłavia! Włocłavia!",
"typ": "okrzyk"
},
{
"tekst": "W naszych sercach jest Włocłavia...",
"typ": "doping"
}
],
"hymn": "Hymn Włocłavii – „Włocłavia! Włocłavia! Włocłavia!”"
},
"Zagłębie Lubin": {
"przyspiewki": [
{
"tekst": "Barwy w górę uniesione, race mienią się, to miedziowych fanatyków armia bawi się, nie musimy się przedstawiać, każdy o tym wie, że to Wielkie Zagłębie",
"typ": "doping"
},
{
"tekst": "M! K! S! Zagłębie! Po życia kres! Wspieramy! W każdej lidze! (na dwie strony)",
"typ": "okrzyk"
},
{
"tekst": "Na zawsze wierni kibice tu są, kibice Zagłębia lubińskiego, na zawsze, la la la",
"typ": "doping"
},
{
"tekst": "Cała Polska je**e Śląska!",
"typ": "rywal",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "My się jeszcze nie zwijamy...",
"typ": "doping"
},
{
"tekst": "Wspólna wiara",
"typ": "doping"
},
{
"tekst": "Śląsk robi kupę",
"typ": "rywal",
"rywal": "Śląsk Wrocław"
},
{
"tekst": "Miedź Legnica, a co to...",
"typ": "rywal",
"rywal": "Miedź Legnica"
}
],
"hymn": "Na zawsze (Eliteboys, 2005) – „Kiedy miałem pięć lat, wziął mnie ojciec na mecz”"
},
"Zawisza Bydgoszcz": {
"przyspiewki": [
{
"tekst": "Hej, Zawiszo, Rycerzu nasz, to Twoje imię dla nas święte jest, kochamy Cię, po życia kres, z nami na zawsze WKS.",
"typ": "doping"
},
{
"tekst": "Na sobie masz święte barwy, na sercu Zawiszy herb, pamiętaj o tym, piłkarzu, wychodząc na każdy mecz.",
"typ": "doping"
},
{
"tekst": "Zawisza jest twoim klubem, a celem zwycięstwo jest, więc walcz, jak nigdy przedtem, o honor i WKS.",
"typ": "doping"
},
{
"tekst": "Ooooo nasza wiara, niezachwiana, ZAWISZO nasz, niejedni Cię zdradzili i już dawno nie ma ich, a my będziemy z Tobą do ostatnich życia chwil.",
"typ": "doping"
},
{
"tekst": "To nasz, to nasz, Święty Klub, to WKS jest, wojskowy, wojskowy. A my, a my, my wierzymy tylko w WKS wojskowy, wojskowy.",
"typ": "doping"
},
{
"tekst": "On w moim sercu jest, z nim aż po życia kres, bo to jest święty Klub i to jest miłość ma, Bydgoski ZAWISZA.",
"typ": "miasto"
},
{
"tekst": "Alle Alleluja Alleluja WKS!",
"typ": "okrzyk"
},
{
"tekst": "W górę serca, zwycięży WKS, zwycięży WKS!",
"typ": "okrzyk"
},
{
"tekst": "Nadejdzie taki czas, nadejdzie chwały blask, gdy Polska dowie się, że ekstraklasę ma Bydgoski ZAWISZA.",
"typ": "doping"
},
{
"tekst": "W mieście, gdzie przepływa rzeka Brda, potęga trwa! Niebiesko-czarna duma w piłkę tutaj gra, to Zawisza! Wszyscy razem...",
"typ": "miasto"
},
{
"tekst": "Bydgoszcz to my!",
"typ": "miasto"
},
{
"tekst": "Zostawcie dzieci",
"typ": "rywal",
"rywal": "Elana Toruń"
},
{
"tekst": "Kołobrzeg miasto Zawiszy",
"typ": "rywal",
"rywal": "Kotwica Kołobrzeg"
},
{
"tekst": "Ruch i Wisła, dwa...",
"typ": "rywal",
"rywal": "Wisła Kraków"
},
{
"tekst": "Jak wy kibiców nie macie!",
"typ": "rywal",
"rywal": "Polonia Bydgoszcz"
},
{
"tekst": "Wojowniczy Klub Sportowy!",
"typ": "okrzyk"
},
{
"tekst": "Na trybunie dym i śpiew",
"typ": "doping"
},
{
"tekst": "Zawisza till I die",
"typ": "okrzyk"
}
],
"hymn": "Nasz Dom, Nasz Klub („Jest w mieście rycerz, co zowie się Zawisza, w przepięknych barwach lśni: błękit, biel i czerń”)"
},
"Znicz Pruszków": {
"przyspiewki": [
{
"tekst": "Vivat nam pruszkowski Znicz!",
"typ": "okrzyk"
}
],
"hymn": "Vivat nam Pruszkowski Znicz! („W jednym z wielu miast, jakich setki pewnie znasz, w którym klub sportowy jest, Pruszków Znicz”)"
},
"ŁKS Łódź": {
"przyspiewki": [
{
"tekst": "My kibice Łodzi, wódka nam nie szkodzi, za Łódź, za ŁKS, pójdziemy aż po życia kres.",
"typ": "doping"
},
{
"tekst": "ŁKS-em bije serce Łodzi",
"typ": "miasto"
},
{
"tekst": "Gdy idę korytarzem...",
"typ": "doping"
},
{
"tekst": "Ludzie żyją tym!",
"typ": "doping"
},
{
"tekst": "Łódzki ŁKS, tyski GKS – nasza zgoda najlepsza w Polsce jest",
"typ": "zgoda",
"rywal": "GKS Tychy"
},
{
"tekst": "Na wyjazdach śpiew...",
"typ": "doping"
},
{
"tekst": "Jesteśmy zawsze tam...",
"typ": "doping"
},
{
"tekst": "To jest nasze miasto (na dwie trybuny)",
"typ": "miasto"
},
{
"tekst": "W sercu przeplatanka",
"typ": "doping"
},
{
"tekst": "Rycerze wiosny",
"typ": "okrzyk"
},
{
"tekst": "Do nienawiści...",
"typ": "rywal",
"rywal": "Jagiellonia Białystok"
},
{
"tekst": "Flagi kradniecie",
"typ": "rywal",
"rywal": "Widzew Łódź"
},
{
"tekst": "Na Galerze śpiew",
"typ": "miasto"
}
],
"hymn": "Rodowici – ŁKS (The Bootels) – „Żyjemy tu, gdzie nasze miejsce, Aleja Unii to nasz świat”"
},
"Śląsk Wrocław": {
"przyspiewki": [
{
"tekst": "Oddałem serce za drużynę, oddałem za nią duszę swą. I wierzę, że kiedyś zasłynie mój święty klub - WKS Śląsk",
"typ": "doping"
},
{
"tekst": "To my, kibice Śląska, zna nas cała Polska. Za Śląsk, za WKS, pójdziemy aż po życia kres!",
"typ": "doping"
},
{
"tekst": "O WKS! Nasz święty klub. Będziemy razem przy nim stali aż po grób!",
"typ": "doping"
},
{
"tekst": "O WKS! Naszym świętym klubem jest, my kibice, zróbmy wszystko, by w tej magicznej chwili śpiewem wspierać go!",
"typ": "doping"
},
{
"tekst": "Wierzę w drużynę swą, dla mnie zwycięża On, najlepszy w Polsce jest, Śląsk WuuKaaeeS!",
"typ": "doping"
},
{
"tekst": "Mistrzostwa Polski nadszedł czas, ten piękny czas, więc Śląsku prowadź nas! Będziemy z Tobą zawsze tam, gdzie będziesz grał, będziemy Ci śpiewać Śląsk Wrocław, lalala!",
"typ": "doping"
},
{
"tekst": "Słuchaj Śląsku, znów jesteśmy tu! Mistrza Polski zdobądź Śląsku znów! My czekamy już 20 lat i w historii klubu od dawna mistrza brak!",
"typ": "doping"
},
{
"tekst": "O Wrocławiu pragnę marzyć, we Wrocławiu pragnę żyć! I Śląsk Wrocław dopingować i ze Śląskiem w zgodzie żyć! Więc do boju WuKaeSie, po zwycięstwo naprzód marsz!",
"typ": "miasto"
},
{
"tekst": "U nas we Wrocławiu, gdzie najlepsze piwo jest, mamy swą drużynę, która zwie się WKS! Alleluja, alleluja, alleluja WKS! Śląsk najlepszy w Polsce jest!",
"typ": "miasto"
},
{
"tekst": "Czy wygrywasz, czy nie, ja i tak kocham Cię! W moim sercu to Śląsk, najwspanialszym klubem jest!",
"typ": "doping"
},
{
"tekst": "Nie dla nas jest porażki smak, nie dla nas forma zła! Najlepszych Śląsk kibiców ma i najlepiej w piłkę gra!",
"typ": "doping"
},
{
"tekst": "Więc wstań! Do góry głowę wznieś! Śpiewaj WKS, WKS, WKS, WKS!",
"typ": "doping"
},
{
"tekst": "Śląsk Wrocław to jest potęga, Śląsk Wrocław najlepszy jest! Śląsk Wrocław trzeba szanować! Śląsk Wrocław, nasz WKS",
"typ": "doping"
},
{
"tekst": "Kto dzisiaj wygra mecz? – Śląsk!",
"typ": "okrzyk"
},
{
"tekst": "Cała Polska w cieniu Śląska!",
"typ": "okrzyk"
},
{
"tekst": "Niech żyje Motor, Motor i Śląsk Wrocław",
"typ": "zgoda",
"rywal": "Motor Lublin"
},
{
"tekst": "Krecik i Mickey",
"typ": "rywal",
"rywal": "Zagłębie Lubin"
},
{
"tekst": "Miała matka syna! (zgodowy doping Motoru i Śląska)",
"typ": "zgoda",
"rywal": "Motor Lublin"
},
{
"tekst": "Brejdaki – do zabawy i do draki",
"typ": "zgoda",
"rywal": "Motor Lublin"
},
{
"tekst": "Wielki Śląsk Wrocław",
"typ": "doping"
},
{
"tekst": "Śląsku, my z wami – my za was serca oddamy!",
"typ": "doping"
},
{
"tekst": "Gdy pierwsze kroki stawiałem, mój ojciec powiedział mi, żebym wspierał swoją drużynę, ze Śląskiem na dobre i na złe",
"typ": "doping"
},
{
"tekst": "Oooo WKS! O WuKaeSie, klubie ty nasz",
"typ": "doping"
},
{
"tekst": "Przeżyj to sam! (zgodowy doping z Motorem)",
"typ": "zgoda",
"rywal": "Motor Lublin"
},
{
"tekst": "Leży Odra na orliku",
"typ": "rywal",
"rywal": "Odra Opole"
},
{
"tekst": "Przyszliście chamy, dlatego że my tu gramy",
"typ": "rywal",
"rywal": "Odra Opole"
},
{
"tekst": "Hej, hej, hej WKS!",
"typ": "okrzyk"
},
{
"tekst": "Gieksa prostytutka!",
"typ": "rywal",
"rywal": "GKS Katowice"
},
{
"tekst": "Wielki Śląsk Wrocław, sialalalala...",
"typ": "doping"
},
{
"tekst": "Takich jak my to ze świeczką szukać",
"typ": "doping"
},
{
"tekst": "Niepokonany Śląsk Wrocław, nasz ukochany!",
"typ": "doping"
},
{
"tekst": "Ściągać te szmaty i wyp... do chaty",
"typ": "rywal",
"rywal": "Odra Opole"
}
]
},
"Świt Szczecin": {
"przyspiewki": [
{
"tekst": "„Literka” – wspólna śpiewka braci z Vinety i Świtu Skolwin",
"typ": "zgoda",
"rywal": "Vineta Wolin"
}
]
},
"MKS Mazur Ełk": {
"przyspiewki": [
{
"tekst": "Jedno miasto, jeden klub!",
"typ": "doping"
}
]
}
};

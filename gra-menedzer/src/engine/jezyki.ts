// Języki w szatni: cudzoziemiec, który nie zna jeszcze polskiego, mówi w swoim języku (głosem w tym języku),
// a na ekranie pojawia się tłumaczenie. Z czasem uczy się polskiego: najpierw łamana polszczyzna (z akcentem),
// potem komunikatywnie, w końcu płynnie. Na tempo nauki wpływa wiek, pokrewieństwo języka (słowiańskie szybciej),
// kurs językowy opłacany przez klub, liczba rodaków w szatni („bańka") i charakter. Tłumacz klubowy pomaga
// w szatni, na konferencjach i w rozmowach; bez niego mowa trenera trafia do obcokrajowców słabiej.
import { szansa } from "./losuj";
import type { StanGry, Tlumacz, Zawodnik } from "./types";
import { losInt, wybierz } from "./losuj";

export type Jezyk = "pl" | "en" | "fr" | "es" | "pt" | "de" | "it" | "nl" | "uk" | "ru" | "cs" | "sk" | "hr" | "sr" | "hu" | "ro" | "tr" | "el" | "sv" | "ja";
export const NAZWA_JEZYKA: Record<Jezyk, string> = {
  pl: "polski", en: "angielski", fr: "francuski", es: "hiszpański", pt: "portugalski", de: "niemiecki", it: "włoski", nl: "niderlandzki", uk: "ukraiński", ru: "rosyjski",
  cs: "czeski", sk: "słowacki", hr: "chorwacki", sr: "serbski", hu: "węgierski", ro: "rumuński", tr: "turecki", el: "grecki", sv: "szwedzki", ja: "japoński",
};
export const GLOS_JEZYKA: Record<Jezyk, string> = {
  pl: "pl-PL", en: "en-GB", fr: "fr-FR", es: "es-ES", pt: "pt-BR", de: "de-DE", it: "it-IT", nl: "nl-NL", uk: "uk-UA", ru: "ru-RU",
  cs: "cs-CZ", sk: "sk-SK", hr: "hr-HR", sr: "sr-RS", hu: "hu-HU", ro: "ro-RO", tr: "tr-TR", el: "el-GR", sv: "sv-SE", ja: "ja-JP",
};
export const PO_JEZYKU: Record<Jezyk, string> = {
  pl: "po polsku", en: "po angielsku", fr: "po francusku", es: "po hiszpańsku", pt: "po portugalsku", de: "po niemiecku", it: "po włosku", nl: "po niderlandzku", uk: "po ukraińsku", ru: "po rosyjsku",
  cs: "po czesku", sk: "po słowacku", hr: "po chorwacku", sr: "po serbsku", hu: "po węgiersku", ro: "po rumuńsku", tr: "po turecku", el: "po grecku", sv: "po szwedzku", ja: "po japońsku",
};
/** Język ojczysty wg kraju. */
const KRAJ_JEZYK: Record<string, Jezyk> = {
  Anglia: "en", Szkocja: "en", Walia: "en", "Irlandia Północna": "en", "Stany Zjednoczone": "en", Kanada: "en", Australia: "en", Ghana: "en", Nigeria: "en", Gambia: "en", Kenia: "en", Uganda: "en", Erytrea: "en",
  Francja: "fr", Belgia: "fr", Senegal: "fr", Mali: "fr", Kamerun: "fr", Gwinea: "fr", "Wybrzeże Kości Słoniowej": "fr", "Demokratyczna Republika Kongo": "fr", Kongo: "fr", "Burkina Faso": "fr", Komory: "fr", Mauretania: "fr", Tunezja: "fr", Martynika: "fr",
  Hiszpania: "es", Argentyna: "es", Kolumbia: "es", Chile: "es", Wenezuela: "es", Honduras: "es", Salwador: "es", Dominikana: "es",
  Portugalia: "pt", Brazylia: "pt", Angola: "pt", "Gwinea Bissau": "pt", "Republika Zielonego Przylądka": "pt", "Wyspy Świętego Tomasza i Książęca": "pt",
  Niemcy: "de", Austria: "de", Szwajcaria: "de", Włochy: "it", Holandia: "nl", Surinam: "nl",
  Ukraina: "uk", Rosja: "ru", Białoruś: "ru", Kazachstan: "ru", Uzbekistan: "ru", Azerbejdżan: "ru", Armenia: "ru", Gruzja: "ru",
  Czechy: "cs", Słowacja: "sk", Chorwacja: "hr", "Bośnia i Hercegowina": "hr", Słowenia: "hr", Serbia: "sr", Czarnogóra: "sr", "Macedonia Północna": "sr",
  Węgry: "hu", Rumunia: "ro", Mołdawia: "ro", Turcja: "tr", Grecja: "el", Cypr: "el", Szwecja: "sv", Japonia: "ja",
};
/** Kraje, z których piłkarze zwykle porozumiewają się po angielsku (języka ojczystego nikt w szatni nie zna). */
const ANGIELSKI_ROBOCZY = new Set(["Norwegia", "Dania", "Islandia", "Finlandia", "Estonia", "Łotwa", "Litwa", "Izrael", "Iran", "Irak", "Albania", "Kosowo", "Bułgaria"]);
const SLOWIANSKIE_BLISKIE: Jezyk[] = ["uk", "cs", "sk"]; const SLOWIANSKIE: Jezyk[] = ["ru", "hr", "sr"];

export function jezykKraju(kraj?: string): Jezyk {
  if (!kraj || kraj === "Polska") return "pl";
  return KRAJ_JEZYK[kraj] ?? "en"; // np. Norweg, Litwin, Izraelczyk — w szatni po angielsku
}
export const jezykZawodnika = (z: Zawodnik): Jezyk => jezykKraju(z.kraj);
/** Czy mówi w języku ojczystym, czy „roboczym" angielskim (np. Norweg, Litwin). */
export const mowiPoAngielskuZamiastOjczystego = (z: Zawodnik) => !!z.kraj && !KRAJ_JEZYK[z.kraj] && z.kraj !== "Polska";

const h = (t: string) => { let x = 2166136261; for (const c of t) x = Math.imul(x ^ c.charCodeAt(0), 16777619); return x >>> 0; };
/** Znajomość polskiego 0–100 (Polacy 100). Gdy brak wpisu — start zależny od kraju i stażu (część obcokrajowców gra w Polsce od lat). */
export function polski(z: Zawodnik): number {
  if (!z.kraj || z.kraj === "Polska") return 100;
  if (z.polski !== undefined) return z.polski;
  const j = jezykZawodnika(z), r = h(z.id) % 100;
  const baza = SLOWIANSKIE_BLISKIE.includes(j) ? 35 : SLOWIANSKIE.includes(j) ? 20 : 0;
  return Math.min(95, baza + (r < 45 ? r * 0.2 : r < 75 ? 20 + (r - 45) : 50 + (r - 75) * 1.6)); // ~45% świeżo w Polsce, reszta z różnym stażem
}
export type Poziom = "obcy" | "podstawy" | "komunikatywny" | "plynny";
export const poziom = (p: number): Poziom => (p < 25 ? "obcy" : p < 55 ? "podstawy" : p < 80 ? "komunikatywny" : "plynny");
export const NAZWA_POZIOMU: Record<Poziom, string> = { obcy: "nie mówi po polsku", podstawy: "podstawy (łamany polski)", komunikatywny: "komunikatywny", plynny: "płynnie" };

// ——— rozmówki: kategorie wypowiedzi ———
export type Kat = "gotowy" | "tak" | "ok" | "nie" | "motywacja" | "nerwy" | "sprzet" | "pilka" | "obrona" | "skupienie" | "derby" | "lawka" | "dziekuje" | "postaram" | "zly" | "pizza" | "nierozumiem" | "zostac" | "rywal" | "puchar" | "szacunek" | "wygrac";
const PL: Record<Kat, string> = {
  gotowy: "Jestem gotowy, trenerze!", tak: "Tak jest, trenerze!", ok: "Dobra, rozumiem.", nie: "Nie zgadzam się z tym…", motywacja: "Dajemy, panowie! Do samego końca!",
  nerwy: "Trochę się denerwuję przed tym meczem.", sprzet: "Gdzie są moje getry?!", pilka: "Dajcie mi piłkę — strzelę gola!", obrona: "Rozmawiajmy ze sobą w obronie!",
  skupienie: "Pełna koncentracja od pierwszej minuty!", derby: "To derby — tego się nie przegrywa!", lawka: "Znowu ławka… ale będę gotowy.", dziekuje: "Dziękuję, trenerze, to dla mnie ważne.",
  postaram: "Postaram się, zobaczy pan.", zly: "Nie jestem zadowolony ze swojej sytuacji.", pizza: "Kto stawia pizzę po meczu?", nierozumiem: "Przepraszam… nie rozumiem.", zostac: "Chcę zostać w tym klubie.",
  rywal: "Uważajmy na ich najlepszego zawodnika.", puchar: "W pucharze nie ma jutra — gramy o wszystko!", szacunek: "Szanujemy rywala, ale przyjechaliśmy tu po zwycięstwo.", wygrac: "Moja drużyna jest gotowa. Chcemy wygrać ten mecz."
};
/** Łamana polszczyzna (poziom „podstawy"). */
const LAMANY: Record<Kat, string> = {
  gotowy: "Ja gotowy, trener!", tak: "Tak, tak, trener, dobrze!", ok: "Okej… ja rozumie.", nie: "Nie… to nie dobrze dla mnie.", motywacja: "Dawaj, dawaj! Do koniec!",
  nerwy: "Ja trochę stres dzisiaj.", sprzet: "Gdzie moje… getry? Getry!", pilka: "Daj mi piłka, ja gol!", obrona: "Gadać, gadać w obrona!",
  skupienie: "Skupienie! Od pierwsza minuta!", derby: "Derby — my nie przegrać!", lawka: "Znowu ławka… ale ja gotowy.", dziekuje: "Dziękuje, trener, to ważne dla mnie.",
  postaram: "Ja się postarać, trener.", zly: "Ja nie zadowolony, trener.", pizza: "Kto płaci pizza po mecz?", nierozumiem: "Przepraszam… ja nie rozumie.", zostac: "Ja chce zostać tu, w klub.",
  rywal: "Uwaga na ich najlepszy zawodnik!", puchar: "Puchar — my grać o wszystko!", szacunek: "My szanować rywal, ale my chcieć wygrać.", wygrac: "Moja drużyna gotowa. My chcieć wygrać."
};
const ROZMOWKI: Partial<Record<Jezyk, Record<Kat, string>>> = {
  en: { gotowy: "I'm ready, coach!", tak: "Yes, coach!", ok: "Okay, I understand.", nie: "I don't agree with that…", motywacja: "Come on, lads! Until the very end!", nerwy: "I'm a bit nervous before this game.", sprzet: "Where are my socks?!", pilka: "Give me the ball — I'll score!", obrona: "Keep talking at the back!", skupienie: "Full focus from the first minute!", derby: "It's a derby — we don't lose this one!", lawka: "Bench again… but I'll be ready.", dziekuje: "Thank you, coach, that means a lot.", postaram: "I'll do my best, you'll see.", zly: "I'm not happy with my situation.", pizza: "Who's buying pizza after the game?", nierozumiem: "Sorry… I don't understand.", zostac: "I want to stay at this club.", rywal: "Watch out for their best player.", puchar: "It's the cup — there's no tomorrow!", szacunek: "We respect the opponent, but we came here to win.", wygrac: "My team is ready. We want to win this game." },
  fr: { gotowy: "Je suis prêt, coach !", tak: "Oui, coach !", ok: "D'accord, je comprends.", nie: "Je ne suis pas d'accord…", motywacja: "Allez, les gars ! Jusqu'au bout !", nerwy: "Je suis un peu nerveux avant ce match.", sprzet: "Où sont mes chaussettes ?!", pilka: "Donnez-moi le ballon, je vais marquer !", obrona: "On se parle en défense !", skupienie: "Concentration totale dès la première minute !", derby: "C'est un derby, on ne le perd pas !", lawka: "Encore le banc… mais je serai prêt.", dziekuje: "Merci, coach, ça compte beaucoup pour moi.", postaram: "Je vais faire de mon mieux, vous verrez.", zly: "Je ne suis pas content de ma situation.", pizza: "Qui paie la pizza après le match ?", nierozumiem: "Pardon… je ne comprends pas.", zostac: "Je veux rester dans ce club.", rywal: "Attention à leur meilleur joueur.", puchar: "C'est la coupe, il n'y a pas de lendemain !", szacunek: "Nous respectons l'adversaire, mais nous sommes venus pour gagner.", wygrac: "Mon équipe est prête. Nous voulons gagner ce match." },
  es: { gotowy: "¡Estoy listo, míster!", tak: "¡Sí, míster!", ok: "Vale, entiendo.", nie: "No estoy de acuerdo…", motywacja: "¡Vamos, chicos! ¡Hasta el final!", nerwy: "Estoy un poco nervioso antes de este partido.", sprzet: "¡¿Dónde están mis medias?!", pilka: "¡Dadme el balón, voy a marcar!", obrona: "¡Hablemos en defensa!", skupienie: "¡Concentración total desde el primer minuto!", derby: "¡Es un derbi, esto no se pierde!", lawka: "Otra vez banquillo… pero estaré listo.", dziekuje: "Gracias, míster, significa mucho para mí.", postaram: "Haré lo mejor que pueda, ya verá.", zly: "No estoy contento con mi situación.", pizza: "¿Quién paga la pizza después del partido?", nierozumiem: "Perdón… no entiendo.", zostac: "Quiero quedarme en este club.", rywal: "Cuidado con su mejor jugador.", puchar: "¡Es la copa, no hay mañana!", szacunek: "Respetamos al rival, pero hemos venido a ganar.", wygrac: "Mi equipo está preparado. Queremos ganar este partido." },
  pt: { gotowy: "Estou pronto, mister!", tak: "Sim, mister!", ok: "Tudo bem, entendi.", nie: "Não concordo com isso…", motywacja: "Vamos, rapaziada! Até o fim!", nerwy: "Estou um pouco nervoso antes deste jogo.", sprzet: "Cadê as minhas meias?!", pilka: "Me dá a bola que eu faço o gol!", obrona: "Vamos conversar na defesa!", skupienie: "Concentração total desde o primeiro minuto!", derby: "É clássico — não dá para perder!", lawka: "Banco de novo… mas vou estar pronto.", dziekuje: "Obrigado, mister, isso significa muito.", postaram: "Vou dar o meu melhor, vai ver.", zly: "Não estou feliz com a minha situação.", pizza: "Quem paga a pizza depois do jogo?", nierozumiem: "Desculpa… não entendi.", zostac: "Quero ficar neste clube.", rywal: "Cuidado com o melhor jogador deles.", puchar: "É a taça — não há amanhã!", szacunek: "Respeitamos o adversário, mas viemos para vencer.", wygrac: "A minha equipa está pronta. Queremos vencer este jogo." },
  de: { gotowy: "Ich bin bereit, Trainer!", tak: "Jawohl, Trainer!", ok: "Okay, verstanden.", nie: "Damit bin ich nicht einverstanden…", motywacja: "Los, Jungs! Bis zum Schluss!", nerwy: "Ich bin vor dem Spiel etwas nervös.", sprzet: "Wo sind meine Stutzen?!", pilka: "Gebt mir den Ball, ich mache das Tor!", obrona: "Hinten miteinander reden!", skupienie: "Volle Konzentration ab der ersten Minute!", derby: "Das ist ein Derby — das verlieren wir nicht!", lawka: "Wieder Bank… aber ich bin bereit.", dziekuje: "Danke, Trainer, das bedeutet mir viel.", postaram: "Ich gebe mein Bestes, Sie werden sehen.", zly: "Ich bin mit meiner Situation unzufrieden.", pizza: "Wer zahlt die Pizza nach dem Spiel?", nierozumiem: "Entschuldigung… ich verstehe nicht.", zostac: "Ich will in diesem Verein bleiben.", rywal: "Passt auf ihren besten Spieler auf.", puchar: "Pokal — es gibt kein Morgen!", szacunek: "Wir respektieren den Gegner, aber wir sind hier, um zu gewinnen.", wygrac: "Meine Mannschaft ist bereit. Wir wollen dieses Spiel gewinnen." },
  it: { gotowy: "Sono pronto, mister!", tak: "Sì, mister!", ok: "Va bene, ho capito.", nie: "Non sono d'accordo…", motywacja: "Forza, ragazzi! Fino alla fine!", nerwy: "Sono un po' nervoso prima di questa partita.", sprzet: "Dove sono i miei calzettoni?!", pilka: "Datemi la palla, faccio gol!", obrona: "Parliamoci in difesa!", skupienie: "Concentrazione totale dal primo minuto!", derby: "È un derby, non si perde!", lawka: "Di nuovo in panchina… ma sarò pronto.", dziekuje: "Grazie, mister, per me è importante.", postaram: "Farò del mio meglio, vedrà.", zly: "Non sono contento della mia situazione.", pizza: "Chi paga la pizza dopo la partita?", nierozumiem: "Scusi… non capisco.", zostac: "Voglio restare in questo club.", rywal: "Attenti al loro giocatore migliore.", puchar: "È la coppa, non c'è un domani!", szacunek: "Rispettiamo l'avversario, ma siamo venuti per vincere.", wygrac: "La mia squadra è pronta. Vogliamo vincere questa partita." },
  nl: { gotowy: "Ik ben klaar, trainer!", tak: "Ja, trainer!", ok: "Oké, begrepen.", nie: "Daar ben ik het niet mee eens…", motywacja: "Kom op, jongens! Tot het einde!", nerwy: "Ik ben een beetje zenuwachtig.", sprzet: "Waar zijn mijn kousen?!", pilka: "Geef mij de bal, ik scoor!", obrona: "Blijf praten achterin!", skupienie: "Volledige focus vanaf de eerste minuut!", derby: "Het is een derby, die verliezen we niet!", lawka: "Weer de bank… maar ik ben klaar.", dziekuje: "Dank je, trainer, dat betekent veel.", postaram: "Ik doe mijn best, je zult zien.", zly: "Ik ben niet blij met mijn situatie.", pizza: "Wie betaalt de pizza na de wedstrijd?", nierozumiem: "Sorry… ik begrijp het niet.", zostac: "Ik wil bij deze club blijven.", rywal: "Let op hun beste speler.", puchar: "Het is de beker, er is geen morgen!", szacunek: "We respecteren de tegenstander, maar we komen hier om te winnen.", wygrac: "Mijn team is klaar. We willen deze wedstrijd winnen." },
  uk: { gotowy: "Я готовий, тренере!", tak: "Так, тренере!", ok: "Добре, зрозумів.", nie: "Я з цим не згоден…", motywacja: "Давайте, хлопці! До кінця!", nerwy: "Я трохи нервую перед цим матчем.", sprzet: "Де мої гетри?!", pilka: "Дайте мені м'яч — заб'ю!", obrona: "Говоримо в обороні!", skupienie: "Повна концентрація з першої хвилини!", derby: "Це дербі — його не програють!", lawka: "Знову лава… але я буду готовий.", dziekuje: "Дякую, тренере, це для мене важливо.", postaram: "Я постараюся, побачите.", zly: "Я незадоволений своєю ситуацією.", pizza: "Хто купує піцу після матчу?", nierozumiem: "Вибачте… я не розумію.", zostac: "Я хочу залишитися в цьому клубі.", rywal: "Обережно з їхнім найкращим гравцем.", puchar: "Це кубок — завтра не буде!", szacunek: "Ми поважаємо суперника, але приїхали перемагати.", wygrac: "Моя команда готова. Ми хочемо виграти цей матч." },
  ru: { gotowy: "Я готов, тренер!", tak: "Да, тренер!", ok: "Хорошо, понял.", nie: "Я с этим не согласен…", motywacja: "Давайте, парни! До конца!", nerwy: "Я немного нервничаю перед игрой.", sprzet: "Где мои гетры?!", pilka: "Дайте мне мяч — забью!", obrona: "Говорим в обороне!", skupienie: "Полная концентрация с первой минуты!", derby: "Это дерби — его не проигрывают!", lawka: "Опять скамейка… но я буду готов.", dziekuje: "Спасибо, тренер, это для меня важно.", postaram: "Я постараюсь, увидите.", zly: "Я недоволен своим положением.", pizza: "Кто покупает пиццу после игры?", nierozumiem: "Извините… я не понимаю.", zostac: "Я хочу остаться в этом клубе.", rywal: "Осторожно с их лучшим игроком.", puchar: "Это кубок — завтра не будет!", szacunek: "Мы уважаем соперника, но приехали побеждать.", wygrac: "Моя команда готова. Мы хотим выиграть этот матч." },
  cs: { gotowy: "Jsem připravený, trenére!", tak: "Ano, trenére!", ok: "Dobře, rozumím.", nie: "S tím nesouhlasím…", motywacja: "Do toho, kluci! Až do konce!", nerwy: "Jsem před zápasem trochu nervózní.", sprzet: "Kde mám štulpny?!", pilka: "Dejte mi míč, dám gól!", obrona: "Mluvme spolu v obraně!", skupienie: "Plné soustředění od první minuty!", derby: "Je to derby, to se neprohrává!", lawka: "Zase lavička… ale budu připravený.", dziekuje: "Děkuju, trenére, hodně to pro mě znamená.", postaram: "Budu se snažit, uvidíte.", zly: "Nejsem spokojený se svou situací.", pizza: "Kdo platí pizzu po zápase?", nierozumiem: "Promiňte… nerozumím.", zostac: "Chci zůstat v tomhle klubu.", rywal: "Pozor na jejich nejlepšího hráče.", puchar: "Je to pohár — žádné zítra není!", szacunek: "Respektujeme soupeře, ale přijeli jsme vyhrát.", wygrac: "Můj tým je připravený. Chceme tento zápas vyhrát." },
  sk: { gotowy: "Som pripravený, tréner!", tak: "Áno, tréner!", ok: "Dobre, rozumiem.", nie: "S tým nesúhlasím…", motywacja: "Poďme, chlapci! Až do konca!", nerwy: "Som pred zápasom trochu nervózny.", sprzet: "Kde mám štulpne?!", pilka: "Dajte mi loptu, dám gól!", obrona: "Rozprávajme sa v obrane!", skupienie: "Plné sústredenie od prvej minúty!", derby: "Je to derby, to sa neprehráva!", lawka: "Zase lavička… ale budem pripravený.", dziekuje: "Ďakujem, tréner, veľa to pre mňa znamená.", postaram: "Budem sa snažiť, uvidíte.", zly: "Nie som spokojný so svojou situáciou.", pizza: "Kto platí pizzu po zápase?", nierozumiem: "Prepáčte… nerozumiem.", zostac: "Chcem zostať v tomto klube.", rywal: "Pozor na ich najlepšieho hráča.", puchar: "Je to pohár — zajtrajšok nie je!", szacunek: "Rešpektujeme súpera, ale prišli sme vyhrať.", wygrac: "Môj tím je pripravený. Chceme tento zápas vyhrať." },
  hr: { gotowy: "Spreman sam, treneru!", tak: "Da, treneru!", ok: "Dobro, razumijem.", nie: "Ne slažem se s tim…", motywacja: "Ajmo, dečki! Do samog kraja!", nerwy: "Malo sam nervozan prije utakmice.", sprzet: "Gdje su mi štucne?!", pilka: "Dajte mi loptu, zabit ću!", obrona: "Razgovarajmo u obrani!", skupienie: "Puna koncentracija od prve minute!", derby: "Ovo je derbi, ovo se ne gubi!", lawka: "Opet klupa… ali bit ću spreman.", dziekuje: "Hvala, treneru, puno mi znači.", postaram: "Potrudit ću se, vidjet ćete.", zly: "Nisam zadovoljan svojom situacijom.", pizza: "Tko plaća pizzu nakon utakmice?", nierozumiem: "Oprostite… ne razumijem.", zostac: "Želim ostati u ovom klubu.", rywal: "Pazite na njihovog najboljeg igrača.", puchar: "Ovo je kup, nema sutra!", szacunek: "Poštujemo protivnika, ali došli smo pobijediti.", wygrac: "Moja momčad je spremna. Želimo pobijediti." },
  sr: { gotowy: "Spreman sam, treneru!", tak: "Da, treneru!", ok: "Dobro, razumem.", nie: "Ne slažem se sa tim…", motywacja: "Ajmo, momci! Do samog kraja!", nerwy: "Malo sam nervozan pred utakmicu.", sprzet: "Gde su mi štucne?!", pilka: "Dajte mi loptu, daću gol!", obrona: "Pričajmo u odbrani!", skupienie: "Puna koncentracija od prvog minuta!", derby: "Ovo je derbi, ovo se ne gubi!", lawka: "Opet klupa… ali biću spreman.", dziekuje: "Hvala, treneru, mnogo mi znači.", postaram: "Potrudiću se, videćete.", zly: "Nisam zadovoljan svojom situacijom.", pizza: "Ko plaća picu posle utakmice?", nierozumiem: "Izvinite… ne razumem.", zostac: "Želim da ostanem u ovom klubu.", rywal: "Pazite na njihovog najboljeg igrača.", puchar: "Ovo je kup, nema sutra!", szacunek: "Poštujemo protivnika, ali došli smo da pobedimo.", wygrac: "Moj tim je spreman. Želimo da pobedimo." },
  hu: { gotowy: "Készen állok, edző!", tak: "Igen, edző!", ok: "Rendben, értem.", nie: "Ezzel nem értek egyet…", motywacja: "Hajrá, fiúk! A végsőkig!", nerwy: "Kicsit izgulok a meccs előtt.", sprzet: "Hol a sportszárom?!", pilka: "Adjátok a labdát, gólt rúgok!", obrona: "Beszéljünk hátul!", skupienie: "Teljes koncentráció az első perctől!", derby: "Ez derbi, ezt nem lehet elveszíteni!", lawka: "Megint kispad… de készen leszek.", dziekuje: "Köszönöm, edző, ez sokat jelent.", postaram: "Mindent megteszek, meglátja.", zly: "Nem vagyok elégedett a helyzetemmel.", pizza: "Ki fizeti a pizzát a meccs után?", nierozumiem: "Elnézést… nem értem.", zostac: "Ebben a klubban akarok maradni.", rywal: "Vigyázzatok a legjobb játékosukra.", puchar: "Kupa — nincs holnap!", szacunek: "Tiszteljük az ellenfelet, de győzni jöttünk.", wygrac: "A csapatom készen áll. Meg akarjuk nyerni ezt a meccset." },
  ro: { gotowy: "Sunt pregătit, antrenore!", tak: "Da, antrenore!", ok: "Bine, am înțeles.", nie: "Nu sunt de acord…", motywacja: "Haideți, băieți! Până la capăt!", nerwy: "Sunt puțin emoționat înainte de meci.", sprzet: "Unde sunt jambierele mele?!", pilka: "Dați-mi mingea, dau gol!", obrona: "Vorbim în apărare!", skupienie: "Concentrare totală din primul minut!", derby: "E derby, nu se pierde!", lawka: "Iar pe bancă… dar voi fi pregătit.", dziekuje: "Mulțumesc, antrenore, contează mult.", postaram: "Voi da tot ce pot, veți vedea.", zly: "Nu sunt mulțumit de situația mea.", pizza: "Cine plătește pizza după meci?", nierozumiem: "Scuze… nu înțeleg.", zostac: "Vreau să rămân la acest club.", rywal: "Atenție la cel mai bun jucător al lor.", puchar: "E cupa, nu există mâine!", szacunek: "Respectăm adversarul, dar am venit să câștigăm.", wygrac: "Echipa mea este pregătită. Vrem să câștigăm acest meci." },
  tr: { gotowy: "Hazırım hocam!", tak: "Evet hocam!", ok: "Tamam, anladım.", nie: "Buna katılmıyorum…", motywacja: "Hadi beyler! Sonuna kadar!", nerwy: "Maçtan önce biraz gerginim.", sprzet: "Tozluklarım nerede?!", pilka: "Topu bana verin, golü atarım!", obrona: "Savunmada konuşalım!", skupienie: "İlk dakikadan tam konsantrasyon!", derby: "Bu bir derbi, kaybedilmez!", lawka: "Yine yedek… ama hazır olacağım.", dziekuje: "Teşekkürler hocam, benim için önemli.", postaram: "Elimden geleni yapacağım, göreceksiniz.", zly: "Durumumdan memnun değilim.", pizza: "Maçtan sonra pizzayı kim ısmarlıyor?", nierozumiem: "Pardon… anlamadım.", zostac: "Bu kulüpte kalmak istiyorum.", rywal: "En iyi oyuncularına dikkat edin.", puchar: "Bu kupa, yarın yok!", szacunek: "Rakibe saygı duyuyoruz ama kazanmaya geldik.", wygrac: "Takımım hazır. Bu maçı kazanmak istiyoruz." },
  el: { gotowy: "Είμαι έτοιμος, κόουτς!", tak: "Ναι, κόουτς!", ok: "Εντάξει, κατάλαβα.", nie: "Δεν συμφωνώ…", motywacja: "Πάμε, παιδιά! Μέχρι το τέλος!", nerwy: "Είμαι λίγο αγχωμένος.", sprzet: "Πού είναι οι κάλτσες μου;!", pilka: "Δώστε μου την μπάλα, θα σκοράρω!", obrona: "Μιλάμε στην άμυνα!", skupienie: "Πλήρης συγκέντρωση από το πρώτο λεπτό!", derby: "Είναι ντέρμπι, δεν χάνεται!", lawka: "Πάλι πάγκος… αλλά θα είμαι έτοιμος.", dziekuje: "Ευχαριστώ, κόουτς, σημαίνει πολλά.", postaram: "Θα κάνω ό,τι μπορώ, θα δείτε.", zly: "Δεν είμαι ευχαριστημένος.", pizza: "Ποιος κερνάει πίτσα μετά τον αγώνα;", nierozumiem: "Συγγνώμη… δεν καταλαβαίνω.", zostac: "Θέλω να μείνω σε αυτή την ομάδα.", rywal: "Προσοχή στον καλύτερό τους παίκτη.", puchar: "Είναι κύπελλο, δεν υπάρχει αύριο!", szacunek: "Σεβόμαστε τον αντίπαλο, αλλά ήρθαμε να νικήσουμε.", wygrac: "Η ομάδα μου είναι έτοιμη. Θέλουμε να κερδίσουμε." },
  sv: { gotowy: "Jag är redo, tränare!", tak: "Ja, tränare!", ok: "Okej, jag förstår.", nie: "Det håller jag inte med om…", motywacja: "Kom igen, grabbar! Ända till slutet!", nerwy: "Jag är lite nervös inför matchen.", sprzet: "Var är mina strumpor?!", pilka: "Ge mig bollen, jag gör mål!", obrona: "Prata med varandra bakåt!", skupienie: "Full fokus från första minuten!", derby: "Det är derby, det förlorar vi inte!", lawka: "Bänken igen… men jag är redo.", dziekuje: "Tack, tränare, det betyder mycket.", postaram: "Jag gör mitt bästa, ni får se.", zly: "Jag är inte nöjd med min situation.", pizza: "Vem bjuder på pizza efter matchen?", nierozumiem: "Förlåt… jag förstår inte.", zostac: "Jag vill stanna i klubben.", rywal: "Se upp för deras bästa spelare.", puchar: "Det är cupen — det finns ingen morgondag!", szacunek: "Vi respekterar motståndarna, men vi är här för att vinna.", wygrac: "Mitt lag är redo. Vi vill vinna den här matchen." },
  ja: { gotowy: "準備はできています、監督！", tak: "はい、監督！", ok: "わかりました。", nie: "それには賛成できません…", motywacja: "行こう、みんな！最後まで！", nerwy: "試合前で少し緊張しています。", sprzet: "僕のソックスはどこ？！", pilka: "ボールをくれ、ゴールを決める！", obrona: "守備で声を出そう！", skupienie: "最初の1分から集中！", derby: "ダービーだ、負けられない！", lawka: "またベンチか…でも準備はできている。", dziekuje: "ありがとうございます、監督。", postaram: "頑張ります、見ていてください。", zly: "今の状況に満足していません。", pizza: "試合後のピザは誰のおごり？", nierozumiem: "すみません…わかりません。", zostac: "このクラブに残りたいです。", rywal: "相手のエースに気をつけろ。", puchar: "カップ戦だ、明日はない！", szacunek: "相手には敬意を払うが、勝ちに来た。", wygrac: "チームの準備はできている。この試合に勝ちたい。" },
};

/** Kategoria wypowiedzi z polskiego tekstu (gdy nie podano wprost). */
export function kategoria(tekst: string, ton?: "plus" | "minus"): Kat {
  const t = tekst.toLowerCase();
  if (/getr|nagolenn|korki/.test(t)) return "sprzet"; if (/pizz/.test(t)) return "pizza"; if (/derby/.test(t)) return "derby"; if (/puchar/.test(t)) return "puchar";
  if (/ławk/.test(t)) return "lawka"; if (/motyl|stres|denerw|trzęs/.test(t)) return "nerwy"; if (/piłkę|strzel|gol/.test(t)) return "pilka";
  if (/obron|stałych fragment|każdy ma swojego/.test(t)) return "obrona"; if (/koncentr|skupien|piętnaście minut/.test(t)) return "skupienie";
  if (/uważaj|uważajmy/.test(t)) return "rywal"; if (/zostać|zostan|nowej umow|propozycj/.test(t)) return "zostac";
  if (/dzięk/.test(t)) return "dziekuje"; if (/postaram|pokażę|udowadnia|zrobię|wezmę się|będę pierwszy|spróbuję/.test(t)) return "postaram";
  if (/tak jest|zrobimy|dawaj|na trzy|idziemy|razem/.test(t)) return t.includes("dawaj") || t.includes("na trzy") ? "motywacja" : "tak";
  if (/gotow/.test(t)) return "gotowy";
  if (ton === "minus" || /nie |boli|zmian(y|ę) klubu|emerytur|niezadow|presja|łatwo powiedzieć|znowu/.test(t)) return /klub/.test(t) ? "zly" : "nie";
  return ton === "plus" ? "tak" : "ok";
}

export interface Wypowiedz { tekst: string; tlumaczenie?: string; glos: string; jezyk: Jezyk; poziom: Poziom; tlumacz?: boolean; tlumaczNazwa?: string }
/**
 * Jak zawodnik wypowie dane zdanie (tekst po polsku) — w swoim języku, łamaną polszczyzną albo płynnie.
 * `kat` — kategoria (gdy znana), `oficjalnie` — konferencja/media (przy niskim polskim mówi przez tłumacza).
 */
export function wypowiedz(s: StanGry, z: Zawodnik | undefined, tekstPL: string, o: { kat?: Kat; ton?: "plus" | "minus"; oficjalnie?: boolean } = {}): Wypowiedz {
  if (!z) return { tekst: tekstPL, glos: "pl-PL", jezyk: "pl", poziom: "plynny" };
  const pl = polski(z), pz = poziom(pl), j = jezykZawodnika(z);
  if (j === "pl" || pz === "plynny" || pz === "komunikatywny") return { tekst: tekstPL, glos: "pl-PL", jezyk: "pl", poziom: pz };
  const kat = o.kat ?? kategoria(tekstPL, o.ton);
  if (pz === "podstawy" && !o.oficjalnie) return { tekst: LAMANY[kat], tlumaczenie: PL[kat], glos: GLOS_JEZYKA[j], jezyk: j, poziom: pz }; // łamany polski z akcentem
  const r = ROZMOWKI[j] ?? ROZMOWKI.en!;
  const jj: Jezyk = ROZMOWKI[j] ? j : "en";
  const t = tlumaczDla(s, j);
  return { tekst: r[kat], tlumaczenie: o.oficjalnie ? `(tłumacz) ${tekstPL}` : PL[kat], glos: GLOS_JEZYKA[jj], jezyk: jj, poziom: pz, tlumacz: !!t, tlumaczNazwa: t ? `${t.imie} ${t.nazwisko}` : undefined };
}

/** Jak dobrze zawodnik rozumie mowę trenera (0–1): polski, tłumacz klubowy, rodak tłumaczący w szatni. */
export function rozumienie(s: StanGry, z: Zawodnik, kadra: Zawodnik[]): number {
  const pl = polski(z); if (pl >= 80) return 1;
  let r = 0.25 + (pl / 80) * 0.75;
  const j = jezykZawodnika(z);
  const tl = tlumaczDla(s, j); if (tl) r = Math.max(r, 0.68 + tl.jakosc * 0.05);
  // członek sztabu mówiący językiem zawodnika (i po polsku) — pomost w komunikacji
  else if (Object.values(s.kluby[s.mojKlub]?.sztab ?? {}).some((p) => p && jezykKraju(p.kraj) === j && (p.polski ?? 0) >= 55)) r = Math.max(r, 0.85);
  else if (kadra.some((x) => x.id !== z.id && jezykZawodnika(x) === j && polski(x) >= 55)) r = Math.max(r, 0.8); // rodak tłumaczy po cichu
  // trener zna język zawodnika (albo angielski, który zna większość piłkarzy)
  const lj = jezykiTrenera(s);
  if ((lj[j] ?? 0) >= 30) r = Math.max(r, 0.3 + (lj[j]! / 100) * 0.7);
  else if ((lj.en ?? 0) >= 40 && j !== "ja") r = Math.max(r, 0.25 + (lj.en! / 100) * 0.45); // rozmowa po angielsku
  return Math.min(1, r);
}

/** Języki obce trenera gracza (domyślnie: angielski na poziomie podstawowym). */
export function jezykiTrenera(s: StanGry): Partial<Record<Jezyk, number>> { return (s.jezykiTrenera ??= { en: 40 }) as Partial<Record<Jezyk, number>>; }
export const JEZYKI_DO_NAUKI: Jezyk[] = ["en", "de", "es", "fr", "it", "pt", "uk", "ru", "cs", "sk", "hr", "sr", "hu", "ro", "nl", "tr", "el", "sv", "ja"];
export const kosztKursuTrenera = (poziomKlubu: number) => [1500, 1100, 800, 600, 450, 350, 300, 250, 200][Math.min(8, poziomKlubu - 1)];
const POZIOM_TR = (v: number) => (v >= 85 ? "C1 — swobodnie" : v >= 60 ? "B2 — prowadzi odprawy" : v >= 30 ? "B1 — dogada się" : v >= 10 ? "A2 — podstawy" : "A1 — pierwsze słowa");
export const poziomJezykaTrenera = POZIOM_TR;

/** Wypowiedź trenera innego klubu (cudzoziemca): po polsku, łamanym polskim albo w swoim języku przez tłumacza. */
export function wypowiedzTrenera(trenerKraj: string | undefined, polskiTrenera: number | undefined, kat: Kat): Wypowiedz {
  const j = jezykKraju(trenerKraj), p = polskiTrenera ?? (j === "pl" ? 100 : 0), pz = poziom(p);
  if (j === "pl" || pz === "plynny" || pz === "komunikatywny") return { tekst: PL[kat], glos: "pl-PL", jezyk: "pl", poziom: pz };
  if (pz === "podstawy") return { tekst: LAMANY[kat], tlumaczenie: PL[kat], glos: GLOS_JEZYKA[j], jezyk: j, poziom: pz };
  const jj: Jezyk = ROZMOWKI[j] ? j : "en";
  return { tekst: ROZMOWKI[jj]![kat], tlumaczenie: PL[kat], glos: GLOS_JEZYKA[jj], jezyk: jj, poziom: pz, tlumacz: true };
}

/** Koszt kursu polskiego i tłumacza (zł za tydzień) wg szczebla. */
export const kosztKursu = (poziomKlubu: number) => [2400, 1800, 1200, 800, 500, 350, 250, 200, 150][Math.min(8, poziomKlubu - 1)];
export const kosztTlumacza = (poziomKlubu: number) => [6000, 4500, 3000, 2000, 1200, 900, 700, 500, 400][Math.min(8, poziomKlubu - 1)];

/** Tygodniowa nauka polskiego cudzoziemców w moim klubie + aklimatyzacja (samotność bez rodaków i języka). */
export function tydzienJezykow(s: StanGry): string[] {
  const k = s.kluby[s.mojKlub]; if (!k) return [];
  const kadra = k.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean) as Zawodnik[];
  const wp: string[] = [];
  const obcy = kadra.filter((z) => polski(z) < 100 && z.kraj && z.kraj !== "Polska");
  if (s.kursPolskiego && obcy.length) { k.kasa -= kosztKursu(k.poziom); }
  for (const t of tlumaczeKlubu(s)) k.kasa -= t.pensja;
  // trener gracza uczy się języka (kurs + kontakt z zawodnikami mówiącymi w tym języku)
  const nj = s.naukaJezykaTrenera as Jezyk | undefined;
  if (nj) {
    const lj = jezykiTrenera(s), przed = lj[nj] ?? 0;
    const kontakt = kadra.filter((z) => jezykZawodnika(z) === nj).length;
    k.kasa -= kosztKursuTrenera(k.poziom);
    lj[nj] = Math.min(100, przed + 0.8 + Math.min(0.6, kontakt * 0.2) + Math.random() * 0.5); // ok. 35–50 pkt na sezon
    for (const prog of [30, 60, 85]) if (przed < prog && lj[nj]! >= prog) wp.push(`🎓 Trener: ${NAZWA_JEZYKA[nj]} — poziom ${POZIOM_TR(lj[nj]!)}. ${prog === 30 ? "Pierwsze rozmowy z zawodnikami bez pomocy!" : prog === 60 ? "Możesz prowadzić odprawy w tym języku." : "Swobodnie — udzielasz wywiadów zagranicznym mediom."}`);
    if (lj[nj]! >= 100) { s.naukaJezykaTrenera = undefined; wp.push(`🎓 Kurs zakończony — ${NAZWA_JEZYKA[nj]} opanowany.`); }
  }
  // sztab-cudzoziemcy też się uczą (wolniej niż zawodnicy, szybciej na kursie)
  for (const p of Object.values(k.sztab ?? {})) if (p && p.kraj && p.kraj !== "Polska" && (p.polski ?? 0) < 100) {
    const przed = p.polski ?? 0; p.polski = Math.min(100, przed + (s.kursPolskiego ? 0.9 : 0.35) * (["uk", "cs", "sk"].includes(jezykKraju(p.kraj)) ? 1.6 : 1));
    if (przed < 55 && p.polski >= 55) wp.push(`🗣 ${p.imie} ${p.nazwisko} (sztab) prowadzi już zajęcia po polsku — pracuje na pełnych obrotach.`);
  }
  for (const z of obcy) {
    const przed = polski(z), j = jezykZawodnika(z);
    const rodacy = kadra.filter((x) => x.id !== z.id && jezykZawodnika(x) === j).length;
    let tempo = (z.wiek <= 21 ? 1.0 : z.wiek <= 25 ? 0.8 : z.wiek <= 29 ? 0.6 : 0.45) * (SLOWIANSKIE_BLISKIE.includes(j) ? 1.8 : SLOWIANSKIE.includes(j) ? 1.4 : 1);
    if (s.kursPolskiego) tempo *= 2.2;
    if (rodacy >= 2) tempo *= 0.7; // „bańka" rodaków — mniej okazji do polskiego
    if (z.cechy?.includes("profesjonalista")) tempo *= 1.25;
    if (tlumaczDla(s, j)) tempo *= 0.9; // z tłumaczem mniej musi
    z.polski = Math.min(100, przed + tempo * (0.7 + Math.random() * 0.6));
    const po = z.polski;
    if (przed < 25 && po >= 25) wp.push(`🗣 ${z.imie} ${z.nazwisko} (${NAZWA_JEZYKA[j]}) zaczyna mówić pierwsze zdania po polsku — łamanym, ale szatnia docenia!`);
    if (przed < 55 && po >= 55) wp.push(`🗣 ${z.imie} ${z.nazwisko} dogada się już po polsku — na odprawach nie potrzebuje tłumaczenia.`);
    if (przed < 80 && po >= 80) wp.push(`🇵🇱 ${z.imie} ${z.nazwisko} mówi płynnie po polsku! Udzielił pierwszego wywiadu bez tłumacza.`);
    // aklimatyzacja: bez języka i bez rodaków — samotność, spadek morale
    if (po < 25 && rodacy === 0 && !tlumaczDla(s, j)) { z.morale = Math.max(0, z.morale - 1.2); if (szansa(0.08)) wp.push(`😔 ${z.imie} ${z.nazwisko} czuje się wyobcowany — nie rozumie odpraw, je sam. Pomógłby kurs polskiego albo tłumacz.`); }
    else if (po < 25 && rodacy > 0) z.morale = Math.min(100, z.morale + 0.3);
  }
  return wp;
}

// ——— tłumacze klubowi (osoby z konkretnymi językami) ———
const IMIONA_TL: [string, "K" | "M"][] = [["Anna", "K"], ["Katarzyna", "K"], ["Magdalena", "K"], ["Agnieszka", "K"], ["Joanna", "K"], ["Marta", "K"], ["Olga", "K"], ["Natalia", "K"], ["Ewa", "K"], ["Julia", "K"], ["Piotr", "M"], ["Tomasz", "M"], ["Michał", "M"], ["Paweł", "M"], ["Krzysztof", "M"], ["Bartosz", "M"], ["Marek", "M"]];
const NAZW_TL = ["Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kamiński", "Lewandowski", "Zieliński", "Szymański", "Woźniak", "Dąbrowski", "Kozłowski", "Mazur", "Krawczyk", "Grabowski", "Pawłowski", "Michalski", "Król", "Wieczorek", "Jabłoński", "Majewski"];
const zenskie = (n: string) => n.replace(/ski$/, "ska").replace(/cki$/, "cka").replace(/dzki$/, "dzka");
/** Stawka tłumacza (zł/tydz.) wg jakości, liczby języków i szczebla klubu. */
export const pensjaTlumacza = (jakosc: number, ileJezykow: number, poziomKlubu: number) =>
  Math.round((350 + jakosc * 260) * (1 + (ileJezykow - 1) * 0.3) * [1.7, 1.35, 1.05, 0.8, 0.6, 0.5, 0.42, 0.36, 0.3][Math.min(8, poziomKlubu - 1)] / 10) * 10;
/** Języki, których potrzebuje szatnia (obcokrajowcy słabo mówiący po polsku + sztab), najczęstsze pierwsze. */
export function potrzebneJezyki(s: StanGry): Jezyk[] {
  const k = s.kluby[s.mojKlub]; if (!k) return [];
  const licz = new Map<Jezyk, number>();
  for (const id of k.zawodnicy) { const z = s.zawodnicy[id]; if (z && polski(z) < 55) { const j = jezykZawodnika(z); licz.set(j, (licz.get(j) ?? 0) + 1); } }
  for (const p of Object.values(k.sztab ?? {})) if (p && p.kraj && (p.polski ?? 0) < 55) { const j = jezykKraju(p.kraj); licz.set(j, (licz.get(j) ?? 0) + 1); }
  return [...licz.entries()].filter(([j]) => j !== "pl").sort((a, b) => b[1] - a[1]).map(([j]) => j);
}
export function tlumaczeKlubu(s: StanGry): Tlumacz[] {
  if (s.tlumacz && !(s.tlumacze ?? []).length) { // stary zapis: „tłumacz klubowy" → konkretna osoba z najpotrzebniejszymi językami
    const p = potrzebneJezyki(s); s.tlumacze = [nowyTlumacz(s, (p.length ? p : ["en"]).slice(0, 3) as Jezyk[], 3)];
  }
  s.tlumacz = false;
  return s.tlumacze ?? [];
}
export function tlumaczDla(s: StanGry, j: Jezyk): Tlumacz | undefined {
  if (j === "pl") return undefined;
  return tlumaczeKlubu(s).filter((t) => t.jezyki.includes(j)).sort((a, b) => b.jakosc - a.jakosc)[0];
}
function nowyTlumacz(s: StanGry, jezyki: Jezyk[], jakosc?: number): Tlumacz {
  const [im, pl] = wybierz(IMIONA_TL)!; const nz = wybierz(NAZW_TL)!;
  const jk = jakosc ?? losInt(1, 5);
  return { id: `tl${(s.licznikId = (s.licznikId ?? 0) + 1).toString(36)}`, imie: im, nazwisko: pl === "K" ? zenskie(nz) : nz, jezyki, jakosc: jk, pensja: pensjaTlumacza(jk, jezyki.length, s.kluby[s.mojKlub]?.poziom ?? 5), wiek: losInt(24, 61) };
}
/** Rynek tłumaczy: kandydaci z językami, których potrzebuje Twoja szatnia (i kilka innych). */
export function rynekTlumaczy(s: StanGry, odswiez = false): Tlumacz[] {
  if (s.rynekTlumaczy?.length && !odswiez) return s.rynekTlumaczy;
  const potrzebne = potrzebneJezyki(s), inne: Jezyk[] = ["en", "fr", "es", "pt", "uk", "ru", "de", "it", "cs", "hr", "sr", "hu", "ro"];
  const out: Tlumacz[] = [];
  for (let i = 0; i < 6; i++) {
    const glowny = (i < potrzebne.length * 2 ? potrzebne[i % Math.max(1, potrzebne.length)] : undefined) ?? wybierz(inne)!;
    const zestaw = new Set<Jezyk>([glowny]);
    // typowe pary: fr+en, es+pt, uk+ru, cs+sk, hr+sr
    const para: Partial<Record<Jezyk, Jezyk>> = { fr: "en", es: "pt", pt: "es", uk: "ru", ru: "uk", cs: "sk", sk: "cs", hr: "sr", sr: "hr", de: "en", it: "es", en: "de" };
    if (para[glowny] && Math.random() < 0.6) zestaw.add(para[glowny]!);
    if (Math.random() < 0.25) zestaw.add(wybierz(inne)!);
    out.push(nowyTlumacz(s, [...zestaw]));
  }
  s.rynekTlumaczy = out;
  return out;
}
export function zatrudnijTlumacza(s: StanGry, t: Tlumacz): string | null {
  const ma = tlumaczeKlubu(s);
  if (ma.length >= 4) return "Najwyżej czterech tłumaczy w klubie.";
  s.tlumacze = [...ma, { ...t, pensja: pensjaTlumacza(t.jakosc, t.jezyki.length, s.kluby[s.mojKlub].poziom) }];
  s.rynekTlumaczy = (s.rynekTlumaczy ?? []).filter((x) => x.id !== t.id);
  return null;
}
export function zwolnijTlumacza(s: StanGry, id: string) { s.tlumacze = tlumaczeKlubu(s).filter((t) => t.id !== id); }

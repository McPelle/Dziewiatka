// Katalog zachowań kibiców na polskich stadionach (derby, mecze podwyższonego ryzyka, zwykłe kolejki).
// Opisy są relacjami z wydarzeń (co się stało i jakie skutki), nie instrukcjami.
import type { Klub, StanGry } from "./types";

export type FazaAkcji = "przed" | "mecz" | "po";
export type MiejsceAkcji = "trybuna" | "klatka" | "dach" | "murawa" | "parking" | "miasto" | "dworzec" | "okolice";
export type Wizual = "dach" | "dron" | "kukla" | "balony" | "pirotechnika" | "graffiti" | "papier";

/**
 * Kontekst tekstów:
 * D / G – nazwy gospodarzy / gości, miastoD / miastoG – ich miasta,
 * teren – stadion lub dzielnica gospodarzy, flagaD / flagaG – nazwy grup / głównych flag,
 * mlyn – nazwa sektora najzagorzalszych kibiców gospodarzy.
 */
export interface Ctx { D: string; G: string; miastoD: string; miastoG: string; teren: string; flagaD: string; flagaG: string; mlyn: string }

export interface WzorAkcji {
  id: string; faza: FazaAkcji; miejsce: MiejsceAkcji; kto: "gospodarzy" | "gosci" | "obie";
  tylkoRyzyko?: boolean;
  minSila?: number;
  waga: number;
  tekst: (c: Ctx) => string;
  transparent?: (c: Ctx) => string;
  kara?: number;
  szkody?: number;
  opoznienie?: number;
  doping?: number;
  zatrzymani?: [number, number];
  wizual?: Wizual;
}

/** Pomocnicze typy z modelu gry – katalog nie zależy od ich struktury. */
export type KlubAkcji = Klub;
export type StanGryAkcji = StanGry;

const U = (s: string) => s.toUpperCase();

export const KATALOG_AKCJI: WzorAkcji[] = [
  // ───────────── LEGALNE: DOPING I OPRAWY ─────────────
  {
    id: "doping_caly_mecz", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 10, doping: 1, kara: 0,
    tekst: c => `📣 ${c.mlyn} prowadzi doping bez chwili przerwy – przyśpiewki niosą się po całym stadionie, a piłkarze ${c.D} wyraźnie się nakręcają.`,
  },
  {
    id: "doping_gosci_glosny", faza: "mecz", miejsce: "klatka", kto: "gosci", waga: 8, doping: 1, kara: 0,
    tekst: c => `📣 Sektor gości z ${c.miastoG} jest dziś zaskakująco głośny – momentami przekrzykuje gospodarzy.`,
  },
  {
    id: "kartoniada", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", minSila: 0.35, waga: 6, doping: 1, kara: 0,
    tekst: c => `🟥 Na wyjście drużyn trybuny układają kartoniadę w barwach ${c.D} – z wysokości kamer widać herb i napis.`,
    transparent: c => U(`${c.miastoD} – TO NASZ DOM`),
  },
  {
    id: "sektorowka", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", minSila: 0.45, waga: 6, doping: 1, kara: 0,
    tekst: c => `🎨 Nad ${c.mlyn} rozwija się ogromna malowana sektorówka – kilka tygodni pracy grupy ${c.flagaD} zebrało brawa całego stadionu.`,
    transparent: c => U(`${c.flagaD} – ZAWSZE WIERNI`),
  },
  {
    id: "sektorowka_gosci", faza: "mecz", miejsce: "klatka", kto: "gosci", minSila: 0.55, waga: 4, doping: 1, kara: 0,
    tekst: c => `🎨 Goście z ${c.miastoG} odpowiadają własną sektorówką na całą klatkę – oprawa wyjazdowa robi wrażenie.`,
    transparent: c => U(`${c.G} – WSZĘDZIE Z TOBĄ`),
  },
  {
    id: "flagi_na_kijach", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 7, doping: 1, kara: 0,
    tekst: c => `🏳️ Las flag na kijach w barwach ${c.D} faluje nad trybuną przez pierwsze minuty meczu.`,
  },
  {
    id: "folia_dwukolorowa", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", minSila: 0.3, waga: 5, doping: 1, kara: 0,
    tekst: c => `🟨 Cały ${c.mlyn} pokrywa się dwukolorową folią – prosta, ale efektowna oprawa w barwach klubu.`,
  },
  {
    id: "szaliki_w_gore", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 8, doping: 1, kara: 0,
    tekst: c => `🧣 Przy hymnie klubowym tysiące szalików idą w górę – „${c.D}, ${c.D}!” niesie się po trybunach.`,
  },
  {
    id: "doping_tylem", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", minSila: 0.3, waga: 4, doping: 1, kara: 0,
    tekst: c => `🔄 Cały ${c.mlyn} odwraca się tyłem do boiska i skacze w rytm „Poznania” – kibice gości przyglądają się w milczeniu.`,
  },
  {
    id: "doping_tylem_gosci", faza: "mecz", miejsce: "klatka", kto: "gosci", waga: 3, doping: 1, kara: 0,
    tekst: c => `🔄 Goście z ${c.miastoG} odwracają się tyłem do murawy i skaczą całym sektorem – klatka aż drży.`,
  },
  {
    id: "oprawa_pamieci", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 3, doping: 0, kara: 0,
    tekst: c => `🕯️ Oprawa pamięci zmarłego kibica ${c.D}: portret na płótnie i minuta ciszy, którą uszanował cały stadion, łącznie z sektorem gości.`,
    transparent: () => "ŚPIEWAMY DLA CIEBIE, BRACIE – [*]",
  },
  {
    id: "zbiorka_charytatywna", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 4, doping: 0, kara: 0,
    tekst: c => `❤️ Na trybunach trwa zbiórka do puszek na leczenie chorego dziecka z ${c.miastoD} – kibice uzbierali kilkadziesiąt tysięcy złotych.`,
    transparent: () => "WALCZ, MAŁY WOJOWNIKU!",
  },
  {
    id: "zbiorka_gosci", faza: "mecz", miejsce: "klatka", kto: "gosci", waga: 2, doping: 0, kara: 0,
    tekst: c => `❤️ Kibice ${c.G} zorganizowali w sektorze zbiórkę dla schroniska w ${c.miastoG} – stewardzi pomagali nosić puszki.`,
  },
  {
    id: "zgoda_wspolny_doping", faza: "mecz", miejsce: "trybuna", kto: "obie", waga: 3, doping: 1, kara: 0,
    tekst: c => `🤝 Zgoda w pełnej krasie – kibice ${c.D} i ${c.G} na przemian intonują przyśpiewki o sobie nawzajem, wspólny doping trwa kilkanaście minut.`,
    transparent: c => U(`${c.miastoD} – ${c.miastoG}: PRZYJAŹŃ NA ZAWSZE`),
  },
  {
    id: "wymiana_szalikow", faza: "po", miejsce: "okolice", kto: "obie", waga: 2, kara: 0,
    tekst: c => `🧣 Po meczu przy płocie kibice ${c.D} i ${c.G} wymieniają się szalikami i wlepkami – sympatyczne obrazki obiegają media społecznościowe.`,
  },
  {
    id: "podziekowanie_pilkarzy", faza: "po", miejsce: "trybuna", kto: "gospodarzy", waga: 6, kara: 0,
    tekst: c => `👏 Piłkarze ${c.D} podchodzą pod ${c.mlyn}, gniazdowy rzuca megafon kapitanowi – wspólne „Dziękujemy!” na koniec.`,
  },
  {
    id: "rozmowa_przy_plocie", faza: "po", miejsce: "trybuna", kto: "gospodarzy", waga: 3, doping: -1, kara: 0,
    tekst: c => `🗣️ Po słabym występie kapitan ${c.D} musi wysłuchać pod płotem kilku gorzkich słów od liderów ${c.flagaD}. Obeszło się bez incydentów.`,
  },
  {
    id: "protest_milczenia", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 4, doping: -2, kara: 0,
    tekst: c => `🤐 Protest milczenia – przez pierwsze 15 minut ${c.mlyn} nie śpiewa, a na płocie wisi tylko jeden transparent.`,
    transparent: () => "DOŚĆ ZAKAZÓW – MILCZYMY",
  },
  {
    id: "bojkot_meczu", faza: "przed", miejsce: "trybuna", kto: "gospodarzy", waga: 2, doping: -2, kara: 0,
    tekst: c => `🚫 Grupa ${c.flagaD} ogłosiła bojkot meczu – ${c.mlyn} świeci pustkami, a na stadionie słychać tylko piłkarzy.`,
  },
  {
    id: "transparent_zarzad", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 5, doping: 0, kara: 0,
    tekst: c => `🪧 Na płocie zawisa transparent wymierzony w zarząd ${c.D}. Prezes ogląda mecz z loży z kamienną twarzą.`,
    transparent: () => "ZARZĄDZIE – WON Z NASZEGO KLUBU!",
  },
  {
    id: "transparent_pzpn", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 4, doping: 0, kara: 1,
    tekst: c => `🪧 Kibice ${c.D} wywieszają transparent przeciwko PZPN i Komisji Ligi. Delegat odnotowuje treść w raporcie.`,
    transparent: () => "PZPN – KASA WAŻNIEJSZA OD KIBICA",
  },
  {
    id: "transparent_wojewoda", faza: "mecz", miejsce: "trybuna", kto: "gosci", waga: 3, doping: 0, kara: 1,
    tekst: c => `🪧 Goście z ${c.miastoG} protestują przeciwko decyzji wojewody, który wcześniej ograniczył im pulę biletów.`,
    transparent: () => "WOJEWODO – STADION TO NIE WIĘZIENIE",
  },
  {
    id: "transparent_zakazy", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 3, kara: 0,
    tekst: c => `🪧 Transparent solidarności z kibicami objętymi zakazami stadionowymi – ${c.mlyn} skanduje ich ksywki.`,
    transparent: () => "ZAKAZOWICZE – JESTEŚCIE Z NAMI",
  },
  {
    id: "transparent_docinek", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", tylkoRyzyko: true, waga: 6, doping: 1, kara: 1,
    tekst: c => `😏 Na płocie ${c.mlyn} pojawia się złośliwy transparent pod adresem ${c.G} – na sektorze gości wyraźne poruszenie.`,
    transparent: c => U(`${c.miastoG} – WIEŚ, NIE MIASTO`),
  },
  {
    id: "transparent_docinek_gosci", faza: "mecz", miejsce: "klatka", kto: "gosci", tylkoRyzyko: true, waga: 5, doping: 1, kara: 1,
    tekst: c => `😏 Goście odpowiadają transparentem z docinkiem – nawiązują do ostatniej porażki ${c.D} w derbach.`,
    transparent: c => U(`${c.D} – WASZE MIEJSCE W TABELI: NA DOLE`),
  },
  {
    id: "transparent_tabela", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 3, kara: 0,
    tekst: c => `📋 Kibice ${c.D} wywieszają „prywatną tabelę derbów” – oczywiście z ich klubem na pierwszym miejscu.`,
    transparent: c => U(`${c.miastoD} RZĄDZI – OD ZAWSZE`),
  },
  {
    id: "balony_transparent", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", minSila: 0.5, waga: 3, doping: 1, kara: 0, wizual: "balony",
    tekst: c => `🎈 Nad ${c.mlyn} unosi się pęk balonów z podwieszonym transparentem – na kilka minut wisi nad stadionem jak szyld.`,
    transparent: c => U(`${c.teren} – TWIERDZA`),
  },
  {
    id: "konfetti_papier", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 5, doping: 1, kara: 0, wizual: "papier",
    tekst: c => `🎊 Wyjście piłkarzy ${c.D} tonie w deszczu konfetti i serpentyn – trybuna na moment znika w kolorowej chmurze.`,
  },
  {
    id: "rolki_papieru", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 5, doping: 1, kara: 1, opoznienie: 3, wizual: "papier",
    tekst: c => `🧻 Na murawę lecą dziesiątki rolek papieru – sędzia wstrzymuje grę, a ballboye i stewardzi sprzątają pole karne.`,
  },
  {
    id: "rolki_gosci", faza: "mecz", miejsce: "klatka", kto: "gosci", waga: 3, doping: 1, kara: 1, opoznienie: 2, wizual: "papier",
    tekst: c => `🧻 Z sektora gości wylatują rolki papieru, część zawisa na siatce klatki. Krótka przerwa na sprzątanie.`,
  },
  {
    id: "kukla_rywala", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", tylkoRyzyko: true, minSila: 0.35, waga: 4, doping: 1, kara: 2, wizual: "kukla",
    tekst: c => `🪆 Na ${c.mlyn} pojawia się kukła w barwach ${c.G} zawieszona na pętli – zdjęcie obiega ogólnopolskie portale, delegat opisuje to w raporcie.`,
    transparent: c => U(`TAK KOŃCZY ${c.G}`),
  },
  {
    id: "kukla_spalona", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", tylkoRyzyko: true, minSila: 0.5, waga: 2, doping: 1, kara: 3, opoznienie: 3, wizual: "kukla",
    tekst: c => `🔥 Kukła w barwach ${c.G} zostaje podpalona na trybunie – gęsty dym i interwencja stewardów z gaśnicami.`,
  },
  {
    id: "dron_flaga", faza: "mecz", miejsce: "murawa", kto: "gospodarzy", tylkoRyzyko: true, minSila: 0.6, waga: 2, doping: 1, kara: 2, opoznienie: 6, wizual: "dron",
    tekst: c => `🛸 Nad boiskiem pojawia się dron z flagą ${c.flagaD}. Sędzia zbiega z piłkarzami do tunelu, a policja namierza operatora poza stadionem.`,
    transparent: c => U(`${c.miastoD} PANUJE NAD ${c.miastoG}`),
    zatrzymani: [0, 2],
  },
  {
    id: "dron_gosci", faza: "mecz", miejsce: "murawa", kto: "gosci", tylkoRyzyko: true, minSila: 0.7, waga: 1, doping: 1, kara: 2, opoznienie: 7, wizual: "dron",
    tekst: c => `🛸 Dron z flagą ${c.flagaG} krąży nad murawą – sektor gości szaleje z radości, mecz przerwany na kilka minut.`,
    transparent: c => U(`${c.G} ZAWSZE NAD WAMI`),
    zatrzymani: [0, 1],
  },
  {
    id: "dach_trybuny", faza: "mecz", miejsce: "dach", kto: "gosci", tylkoRyzyko: true, minSila: 0.6, waga: 2, doping: 1, kara: 3, szkody: 1, opoznienie: 8, wizual: "dach",
    tekst: c => `🏚️ Kilkunastu kibiców ${c.G} wydostaje się na dach trybuny i wywiesza tam flagę ${c.flagaG}. Mecz przerwany, służby ściągają ich po dłuższych negocjacjach.`,
    transparent: c => U(`${c.flagaG} BYŁ TU`),
    zatrzymani: [3, 12],
  },
  {
    id: "dach_gospodarzy", faza: "przed", miejsce: "dach", kto: "gospodarzy", tylkoRyzyko: true, minSila: 0.5, waga: 1, kara: 2, wizual: "dach",
    tekst: c => `🏚️ Rano okazuje się, że na dachu stadionu przy ${c.teren} ktoś rozwiesił wielką flagę ${c.flagaD}, widoczną z całej okolicy. Ochrona zdejmuje ją przed meczem.`,
    transparent: c => U(`${c.teren} – NASZ TEREN`),
  },
  {
    id: "flaga_rywala_odwrocona", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", tylkoRyzyko: true, minSila: 0.5, waga: 2, doping: 2, kara: 2,
    tekst: c => `🔻 ${c.mlyn} wywiesza do góry nogami flagę ${c.flagaG}, utraconą przez rywali na jednym z wcześniejszych wyjazdów. Sektor gości wpada w furię.`,
    zatrzymani: [0, 2],
  },
  {
    id: "flaga_utracona_gosci", faza: "mecz", miejsce: "klatka", kto: "gosci", tylkoRyzyko: true, minSila: 0.6, waga: 1, doping: 2, kara: 2,
    tekst: c => `🔻 Goście prezentują w klatce odwróconą flagę ${c.flagaD} – trofeum sprzed lat. Gospodarze odpowiadają gwizdami i wyzwiskami.`,
  },
  {
    id: "flaga_zdjeta_przez_policje", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 2, doping: -1, kara: 1,
    tekst: c => `👮 Na wniosek policji służby porządkowe zdejmują transparent o obraźliwej treści z ${c.mlyn}. Gwizdy na całym stadionie.`,
  },

  // ───────────── PIROTECHNIKA ─────────────
  {
    id: "race_mlyn", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", minSila: 0.3, waga: 7, doping: 2, kara: 2, opoznienie: 3, wizual: "pirotechnika",
    tekst: c => `🔥 ${c.mlyn} rozpala kilkadziesiąt rac – efektowny widok, ale dym zasnuwa boisko i sędzia przerywa grę na kilka minut.`,
  },
  {
    id: "race_gosci", faza: "mecz", miejsce: "klatka", kto: "gosci", minSila: 0.3, waga: 6, doping: 2, kara: 2, opoznienie: 3, wizual: "pirotechnika",
    tekst: c => `🔥 Cała klatka gości płonie od rac – fani ${c.G} świętują na swój sposób, delegat skrupulatnie liczy odpalone środki.`,
  },
  {
    id: "stroboskopy", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", minSila: 0.45, waga: 4, doping: 1, kara: 2, wizual: "pirotechnika",
    tekst: c => `✨ Stroboskopy migoczą na całej długości ${c.mlyn} – trybuna wygląda jak scena koncertowa.`,
  },
  {
    id: "swiece_dymne", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", minSila: 0.35, waga: 4, doping: 1, kara: 2, opoznienie: 4, wizual: "pirotechnika",
    tekst: c => `💨 Kolorowy dym w barwach ${c.D} spowija trybunę – bramkarz gości przez kilka minut nie widzi połowy boiska.`,
  },
  {
    id: "race_na_murawe", faza: "mecz", miejsce: "murawa", kto: "gosci", tylkoRyzyko: true, waga: 4, doping: 1, kara: 3, szkody: 1, opoznienie: 8, wizual: "pirotechnika",
    tekst: c => `☄️ Z sektora gości na murawę lecą płonące race – jedna ląduje tuż obok bramkarza ${c.D}. Sędzia zabiera zespoły do szatni.`,
    zatrzymani: [1, 6],
  },
  {
    id: "race_na_murawe_dom", faza: "mecz", miejsce: "murawa", kto: "gospodarzy", tylkoRyzyko: true, waga: 3, doping: 1, kara: 3, szkody: 1, opoznienie: 7, wizual: "pirotechnika",
    tekst: c => `☄️ Kibice ${c.D} rzucają race w stronę sektora gości, kilka spada na murawę i wypala trawę przy linii bocznej.`,
    zatrzymani: [1, 5],
  },
  {
    id: "petardy_hukowe", faza: "mecz", miejsce: "trybuna", kto: "obie", tylkoRyzyko: true, waga: 3, doping: 0, kara: 3, opoznienie: 2, wizual: "pirotechnika",
    tekst: () => `💥 Na trybunach eksplodują petardy hukowe – ranny ballboy trafia pod opiekę ratowników, delegat dopisuje to na czerwono w raporcie.`,
    zatrzymani: [0, 3],
  },
  {
    id: "pirotechnika_nocna", faza: "po", miejsce: "miasto", kto: "gospodarzy", tylkoRyzyko: true, waga: 2, kara: 1,
    tekst: c => `🎆 Po zwycięstwie kibice ${c.D} odpalają race pod pomnikiem w centrum ${c.miastoD}. Straż miejska spisuje kilka osób.`,
    zatrzymani: [0, 4],
  },

  // ───────────── GRAFFITI I MIASTO ─────────────
  {
    id: "graffiti_sektor_gosci", faza: "przed", miejsce: "klatka", kto: "gospodarzy", tylkoRyzyko: true, minSila: 0.4, waga: 3, kara: 1, szkody: 1, wizual: "graffiti",
    tekst: c => `🎨 Przed meczem na ścianie sektora gości pojawił się wielki napis w barwach ${c.D}. Klub zamalowuje go w pośpiechu, ale zdjęcia już krążą w sieci.`,
    transparent: c => U(`${c.miastoD} JEST NASZE`),
  },
  {
    id: "graffiti_wiadukt", faza: "przed", miejsce: "miasto", kto: "gospodarzy", tylkoRyzyko: true, waga: 5, kara: 0, szkody: 1, wizual: "graffiti",
    tekst: c => `🎨 Na wiadukcie przy wjeździe do ${c.miastoD} wyrósł kilkudziesięciometrowy mural w barwach ${c.D}. Miasto zapowiada, że obciąży klub kosztami usunięcia.`,
    transparent: c => U(`WITAMY W ${c.miastoD} – TU RZĄDZI ${c.D}`),
  },
  {
    id: "graffiti_dzielnica_rywala", faza: "przed", miejsce: "miasto", kto: "gosci", tylkoRyzyko: true, minSila: 0.4, waga: 4, kara: 0, szkody: 1, wizual: "graffiti",
    tekst: c => `🎨 W nocy przed meczem mury w okolicy ${c.teren} pokryły się napisami ${c.flagaG}. Mieszkańcy dzwonią na policję, monitoring miejski analizuje nagrania.`,
    transparent: c => U(`${c.G} BYŁ TU`),
    zatrzymani: [0, 3],
  },
  {
    id: "zamalowanie_muralu", faza: "przed", miejsce: "miasto", kto: "gosci", tylkoRyzyko: true, waga: 3, kara: 0, szkody: 1, wizual: "graffiti",
    tekst: c => `🖌️ Ktoś zamalował farbą klubowy mural ${c.D} – na ścianie zostały barwy ${c.G}. W mieście wrze, a grupa ${c.flagaD} zapowiada odpowiedź.`,
  },
  {
    id: "malowanie_barw", faza: "przed", miejsce: "miasto", kto: "gospodarzy", waga: 4, kara: 0, wizual: "graffiti",
    tekst: c => `🖌️ Kibice ${c.D} odmalowali barwami klubu słupki i krawężniki na osiedlu przy ${c.teren} – część mieszkańców jest zachwycona, część dzwoni do spółdzielni.`,
  },
  {
    id: "wlepki", faza: "przed", miejsce: "miasto", kto: "gosci", waga: 4, kara: 0,
    tekst: c => `🏷️ Centrum ${c.miastoD} oklejone wlepkami ${c.flagaG} – znaki drogowe, przystanki i latarnie w barwach gości.`,
  },
  {
    id: "flaga_na_pomniku", faza: "przed", miejsce: "miasto", kto: "gospodarzy", tylkoRyzyko: true, waga: 2, kara: 1,
    tekst: c => `🗽 Rano na jednym z pomników ${c.miastoD} zawisł szalik ${c.D} i flaga ${c.flagaD}. Straż miejska zdejmuje je dopiero po południu.`,
  },
  {
    id: "przemarsz_kibicow", faza: "przed", miejsce: "miasto", kto: "gospodarzy", minSila: 0.4, waga: 5, doping: 1, kara: 0,
    tekst: c => `🚶 Kilka tysięcy kibiców ${c.D} przechodzi zgłoszonym przemarszem z centrum ${c.miastoD} pod stadion – w asyście policji, z dopingiem i flagami.`,
  },
  {
    id: "korteo_race", faza: "przed", miejsce: "miasto", kto: "gospodarzy", tylkoRyzyko: true, minSila: 0.5, waga: 3, doping: 1, kara: 2, wizual: "pirotechnika",
    tekst: c => `🔥 Przemarsz kibiców ${c.D} rozświetlają race – ulice ${c.miastoD} toną w czerwonym świetle, policja filmuje uczestników.`,
    zatrzymani: [0, 4],
  },

  // ───────────── PODRÓŻ GOŚCI ─────────────
  {
    id: "pociag_specjalny", faza: "przed", miejsce: "dworzec", kto: "gosci", minSila: 0.45, waga: 4, kara: 0,
    tekst: c => `🚆 Pociąg specjalny z kibicami ${c.G} dojeżdża na dworzec w ${c.miastoD} z kilkugodzinnym opóźnieniem – pod eskortą policji fani są przewożeni autobusami prosto pod klatkę.`,
  },
  {
    id: "pociag_zniszczenia", faza: "po", miejsce: "dworzec", kto: "gosci", tylkoRyzyko: true, waga: 2, kara: 2, szkody: 2,
    tekst: c => `🚃 Przewoźnik wycenia straty w składzie specjalnym, którym wracali kibice ${c.G}: wybite szyby, zniszczone fotele. Rachunek trafi do klubu.`,
  },
  {
    id: "dworzec_kociol", faza: "przed", miejsce: "dworzec", kto: "gosci", tylkoRyzyko: true, waga: 3, kara: 1,
    tekst: c => `🚉 Policja zamyka kibiców ${c.G} w „kotle” na dworcu w ${c.miastoD} i przez godzinę legitymuje każdego – część spóźnia się na pierwszą połowę.`,
    zatrzymani: [0, 5],
  },
  {
    id: "autokar_zablokowany", faza: "przed", miejsce: "okolice", kto: "gospodarzy", tylkoRyzyko: true, waga: 3, kara: 2,
    tekst: c => `🚌 Grupa kibiców ${c.D} blokuje ulicę, którą miał przejechać autokar ${c.G}. Policja kieruje autokar objazdem, drużyna gości dociera na stadion na styk.`,
    zatrzymani: [0, 4],
  },
  {
    id: "autokar_kamien", faza: "przed", miejsce: "okolice", kto: "gospodarzy", tylkoRyzyko: true, waga: 1, kara: 3, szkody: 2,
    tekst: c => `🪨 W autokar ${c.G} uderza kamień – pęknięta szyba, nikt z piłkarzy nie ucierpiał, ale atmosfera przed derbami jest fatalna. Policja zabezpiecza monitoring.`,
    zatrzymani: [0, 2],
  },
  {
    id: "powitanie_autokaru", faza: "przed", miejsce: "okolice", kto: "gospodarzy", waga: 5, doping: 1, kara: 0, wizual: "pirotechnika",
    tekst: c => `🚌 Kibice ${c.D} witają autokar swojej drużyny szpalerem flag i racami przed bramą stadionu – piłkarze nagrywają to telefonami.`,
  },
  {
    id: "wyjazd_samochodami", faza: "przed", miejsce: "parking", kto: "gosci", waga: 3, kara: 0,
    tekst: c => `🚗 Kibice ${c.G} przyjechali kolumną prywatnych aut. Policja zatrzymuje kolumnę na rogatkach ${c.miastoD} do kontroli.`,
    zatrzymani: [0, 2],
  },
  {
    id: "parking_auta", faza: "mecz", miejsce: "parking", kto: "gospodarzy", tylkoRyzyko: true, waga: 3, kara: 2, szkody: 1,
    tekst: c => `🚙 Na parkingu gości kilka aut na rejestracjach z ${c.miastoG} ma porysowany lakier i przebite opony. Monitoring jest analizowany.`,
    zatrzymani: [0, 2],
  },
  {
    id: "parking_lusterka", faza: "po", miejsce: "parking", kto: "gosci", tylkoRyzyko: true, waga: 2, kara: 2, szkody: 1,
    tekst: c => `🚙 Wychodząc ze stadionu kibice ${c.G} urywają lusterka w kilku samochodach zaparkowanych przy ${c.teren}. Właściciele składają zawiadomienia.`,
    zatrzymani: [0, 3],
  },

  // ───────────── BRAMKI I BILETY ─────────────
  {
    id: "przepychanki_bramki", faza: "przed", miejsce: "okolice", kto: "gosci", tylkoRyzyko: true, waga: 5, kara: 2,
    tekst: c => `🚧 Przy bramkach do sektora gości dochodzi do przepychanek z ochroną – kibice ${c.G} protestują przeciw zbyt dokładnej kontroli. Policja używa gazu.`,
    zatrzymani: [1, 6],
  },
  {
    id: "wejscie_bez_biletu", faza: "przed", miejsce: "okolice", kto: "gospodarzy", waga: 4, kara: 1,
    tekst: c => `🎟️ Grupa młodych kibiców ${c.D} próbuje wejść na stadion bez biletów. Stewardzi i monitoring szybko kończą akcję – kilka osób zatrzymanych.`,
    zatrzymani: [2, 6],
  },
  {
    id: "falszywe_bilety", faza: "przed", miejsce: "okolice", kto: "gospodarzy", waga: 3, kara: 1,
    tekst: c => `🎫 Przy kołowrotkach wychodzi na jaw kilkadziesiąt fałszywych biletów kupionych w internecie. Rozżaleni kibice zostają przed bramą, sprawą zajmuje się policja.`,
    zatrzymani: [0, 2],
  },
  {
    id: "spoznieni_goscie", faza: "przed", miejsce: "klatka", kto: "gosci", waga: 4, doping: -1, kara: 0,
    tekst: c => `⏳ Kibice ${c.G} odmawiają wejścia na sektor w proteście przeciw przedłużającej się kontroli i pojawiają się dopiero w 20. minucie.`,
  },
  {
    id: "zakazowicze_zatrzymani", faza: "przed", miejsce: "okolice", kto: "gospodarzy", waga: 3, kara: 1,
    tekst: c => `🪪 System identyfikacji wyłapuje przy bramkach kibiców z zakazem stadionowym. Policja ich zatrzymuje, grozi im wydłużenie zakazu.`,
    zatrzymani: [1, 4],
  },
  {
    id: "zakazowicze_poza_stadionem", faza: "mecz", miejsce: "okolice", kto: "gospodarzy", waga: 2, doping: 0, kara: 0,
    tekst: c => `📻 Kilkudziesięciu kibiców z zakazami stadionowymi słucha transmisji pod stadionem – co jakiś czas ich doping słychać zza trybun.`,
  },

  // ───────────── NIEBEZPIECZNE INCYDENTY NA MECZU ─────────────
  {
    id: "wtargniecie_jednego", faza: "mecz", miejsce: "murawa", kto: "gospodarzy", waga: 3, kara: 2, opoznienie: 2,
    tekst: c => `🏃 Kibic ${c.D} wbiega na murawę, żeby uściskać strzelca bramki. Stewardzi wyprowadzają go po pościgu przy linii bocznej – czeka go zakaz stadionowy.`,
    zatrzymani: [1, 1],
  },
  {
    id: "wtargniecie_grupy", faza: "mecz", miejsce: "murawa", kto: "gospodarzy", tylkoRyzyko: true, waga: 2, kara: 4, szkody: 1, opoznienie: 15,
    tekst: c => `🚨 Kilkudziesięciu zamaskowanych kibiców ${c.D} wbiega na murawę i rusza w stronę sektora gości. Mecz przerwany, na boisko wkracza policja.`,
    zatrzymani: [8, 25],
  },
  {
    id: "rzucanie_przedmiotow", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 4, doping: 0, kara: 2, opoznienie: 2,
    tekst: c => `🥤 Przy rzucie rożnym ${c.G} na zawodnika leci deszcz kubków i zapalniczek. Sędzia wstrzymuje grę, spiker apeluje o spokój.`,
    zatrzymani: [0, 1],
  },
  {
    id: "trafiony_zawodnik", faza: "mecz", miejsce: "murawa", kto: "gosci", tylkoRyzyko: true, waga: 2, kara: 3, opoznienie: 5,
    tekst: c => `🩹 Rzucony z sektora gości przedmiot trafia asystenta sędziego. Arbiter przerywa mecz i rozważa jego zakończenie.`,
    zatrzymani: [1, 3],
  },
  {
    id: "zerwana_siatka", faza: "mecz", miejsce: "klatka", kto: "gosci", tylkoRyzyko: true, waga: 3, kara: 3, szkody: 2, opoznienie: 6,
    tekst: c => `⛓️ Kibice ${c.G} zrywają siatkę klatki i próbują przedostać się na sąsiedni sektor. Policja ustawia kordon, mecz wstrzymany.`,
    zatrzymani: [2, 10],
  },
  {
    id: "krzeselka", faza: "mecz", miejsce: "klatka", kto: "gosci", tylkoRyzyko: true, waga: 4, kara: 2, szkody: 2,
    tekst: c => `🪑 W sektorze gości wyrwano kilkaset krzesełek – część leci w stronę stewardów. Klub ${c.D} wystawi rachunek za zniszczenia.`,
    zatrzymani: [0, 4],
  },
  {
    id: "toalety", faza: "po", miejsce: "klatka", kto: "gosci", waga: 3, kara: 1, szkody: 1,
    tekst: c => `🚽 Po wyjściu kibiców ${c.G} okazuje się, że toalety w sektorze są zdemolowane. Szkody wyceniono na kilkadziesiąt tysięcy złotych.`,
  },
  {
    id: "krzeselka_dom", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", tylkoRyzyko: true, waga: 2, kara: 2, szkody: 1,
    tekst: c => `🪑 Po kontrowersyjnym karnym na ${c.mlyn} połamano kilkadziesiąt krzesełek. Klub będzie musiał zapłacić za naprawy z własnej kieszeni.`,
  },
  {
    id: "przyspiewki_obrazliwe", faza: "mecz", miejsce: "trybuna", kto: "obie", tylkoRyzyko: true, waga: 5, doping: 1, kara: 1,
    tekst: () => `🗯️ Trybuny obrzucają się wulgarnymi przyśpiewkami – delegat notuje treść, a Komisja Ligi może się tym zająć.`,
  },
  {
    id: "lasery", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 2, kara: 2, opoznienie: 1,
    tekst: c => `🔦 Ktoś z trybuny świeci laserem w oczy bramkarza ${c.G}. Spiker apeluje, monitoring namierza sprawcę.`,
    zatrzymani: [0, 1],
  },
  {
    id: "starcie_z_policja", faza: "po", miejsce: "okolice", kto: "gospodarzy", tylkoRyzyko: true, waga: 3, kara: 3, szkody: 1,
    tekst: c => `🛡️ Po meczu grupa kibiców ${c.D} próbuje dostać się pod wyjście z sektora gości. Policja używa armatki wodnej i gazu, na ulicach przy ${c.teren} chaos.`,
    zatrzymani: [10, 40],
  },
  {
    id: "goscie_przetrzymani", faza: "po", miejsce: "klatka", kto: "gosci", waga: 3, kara: 0,
    tekst: c => `⏱️ Kibice ${c.G} zostają przetrzymani w sektorze przez godzinę po meczu, zanim policja wypuści ich pod eskortą na dworzec.`,
  },
  {
    id: "ustawka_plotki", faza: "przed", miejsce: "okolice", kto: "obie", tylkoRyzyko: true, waga: 3, kara: 1,
    tekst: c => `🌲 W mieście krążą plotki o porannej „ustawce” w lesie pod ${c.miastoD}. Policja zatrzymuje kilka busów z ochraniaczami na zębach i kominiarkami.`,
    zatrzymani: [5, 30],
  },
  {
    id: "zgoda_wsparcie", faza: "mecz", miejsce: "klatka", kto: "gosci", tylkoRyzyko: true, waga: 2, doping: 1, kara: 0,
    tekst: c => `🤝 Razem z kibicami ${c.G} w klatce pojawili się fani z ich zgody – flagi kilku klubów wiszą obok siebie.`,
  },
  {
    id: "chuligani_kominiarki", faza: "mecz", miejsce: "klatka", kto: "gosci", tylkoRyzyko: true, waga: 3, kara: 2,
    tekst: c => `🥷 W sektorze gości pojawiają się zakapturzeni i zamaskowani kibice – policja zapowiada analizę nagrań i wnioski o zakazy.`,
    zatrzymani: [0, 3],
  },
  {
    id: "zniszczony_przystanek", faza: "po", miejsce: "miasto", kto: "gosci", tylkoRyzyko: true, waga: 2, kara: 1, szkody: 1,
    tekst: c => `🚏 Wracający kibice ${c.G} demolują przystanek komunikacji miejskiej w ${c.miastoD}. Sprawą zajmuje się policja, miasto szacuje straty.`,
    zatrzymani: [1, 5],
  },
  {
    id: "swietowanie_rynek", faza: "po", miejsce: "miasto", kto: "gospodarzy", minSila: 0.4, waga: 4, kara: 0,
    tekst: c => `🍻 Po końcowym gwizdku kibice ${c.D} ruszają świętować na rynek w ${c.miastoD}. Do późnej nocy słychać klubowe przyśpiewki, obywa się bez interwencji.`,
  },
  {
    id: "fani_dzieci", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 4, doping: 1, kara: 0,
    tekst: c => `👨‍👧 Sektor rodzinny ${c.D} prowadzi własny doping z bębenkami – maskotka klubu tańczy z dziećmi przy linii.`,
  },
  {
    id: "wywiad_gniazdowego", faza: "przed", miejsce: "miasto", kto: "gospodarzy", tylkoRyzyko: true, waga: 2, doping: 1, kara: 0,
    tekst: c => `🎙️ Gniazdowy ${c.flagaD} w lokalnym radiu zapowiada „najgłośniejsze derby od lat” i apeluje o komplet na ${c.teren}.`,
  },
  {
    id: "bramka_wywieszona_flaga", faza: "mecz", miejsce: "trybuna", kto: "gospodarzy", waga: 3, doping: 2, kara: 0,
    tekst: c => `🎉 Po golu kapitan ${c.D} biegnie pod ${c.mlyn} i podnosi szalik rzucony przez kibiców – trybuna eksploduje radością.`,
  },
  {
    id: "spiker_upomnienie", faza: "mecz", miejsce: "trybuna", kto: "gosci", waga: 3, doping: 0, kara: 1,
    tekst: c => `📢 Spiker po raz trzeci upomina kibiców ${c.G} – delegat zapowiada, że kolejny incydent może skończyć się przerwaniem meczu.`,
  },
  {
    id: "goscie_opuszczaja", faza: "mecz", miejsce: "klatka", kto: "gosci", waga: 2, doping: -2, kara: 0,
    tekst: c => `🚪 Przy wysokim prowadzeniu rywali kibice ${c.G} demonstracyjnie zwijają flagi i opuszczają sektor 15 minut przed końcem.`,
  },
];

// ───────────── LOSOWANIE ─────────────

function rand(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

function minutaDla(faza: FazaAkcji): number {
  if (faza === "przed") return 0;
  if (faza === "po") return 91;
  return rand(1, 90);
}

/** Losuje akcje na mecz: derby 3–6, podwyższone ryzyko 1–3, zwykły mecz 0–1 (głównie legalne: doping, oprawy). */
export function losujAkcje(
  sila: { dom: number; gosc: number },
  derby: boolean,
  ryzyko: boolean,
  goscie: boolean,
  ctx: Ctx,
): { wzor: WzorAkcji; min: number; sektor: "gospodarzy" | "gosci" }[] {
  void ctx; // teksty generuje wywołujący przez wzor.tekst(ctx)
  const podwyzszone = derby || ryzyko;
  let ile: number;
  if (derby) ile = rand(3, 6);
  else if (ryzyko) ile = rand(1, 3);
  else ile = Math.random() < 0.55 ? 1 : 0;
  if (ile === 0) return [];

  // Kandydaci: wzór + sektor, którego kibice działają.
  type Kand = { wzor: WzorAkcji; sektor: "gospodarzy" | "gosci"; w: number };
  const kand: Kand[] = [];
  for (const wzor of KATALOG_AKCJI) {
    if (wzor.tylkoRyzyko && !podwyzszone) continue;
    if (!goscie && wzor.kto !== "gospodarzy") continue;
    let sektor: "gospodarzy" | "gosci";
    let s: number;
    if (wzor.kto === "gospodarzy") { sektor = "gospodarzy"; s = sila.dom; }
    else if (wzor.kto === "gosci") { sektor = "gosci"; s = sila.gosc; }
    else {
      sektor = Math.random() < 0.5 ? "gospodarzy" : "gosci";
      s = Math.min(sila.dom, sila.gosc);
    }
    if (wzor.minSila !== undefined && s < wzor.minSila) continue;
    let w = wzor.waga;
    const kara = wzor.kara ?? 0;
    if (!podwyzszone) {
      // Zwykły mecz – prawie wyłącznie legalne zachowania.
      w *= kara === 0 ? 1 : kara === 1 ? 0.15 : 0.04;
    } else if (derby) {
      // Na derbach więcej emocji i incydentów.
      w *= 1 + 0.25 * kara;
    }
    if (w > 0) kand.push({ wzor, sektor, w });
  }

  const wynik: { wzor: WzorAkcji; min: number; sektor: "gospodarzy" | "gosci" }[] = [];
  const uzyte = new Set<string>();
  while (wynik.length < ile) {
    const dostepne = kand.filter(k => !uzyte.has(k.wzor.id));
    if (dostepne.length === 0) break;
    const suma = dostepne.reduce((a, k) => a + k.w, 0);
    let r = Math.random() * suma;
    let wybor = dostepne[dostepne.length - 1];
    for (const k of dostepne) {
      r -= k.w;
      if (r <= 0) { wybor = k; break; }
    }
    uzyte.add(wybor.wzor.id);
    wynik.push({ wzor: wybor.wzor, min: minutaDla(wybor.wzor.faza), sektor: wybor.sektor });
  }
  wynik.sort((a, b) => a.min - b.min);
  return wynik;
}

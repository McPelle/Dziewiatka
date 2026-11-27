// Oprawy kibicowskie — każda jest INNA i nigdy się nie powtarza (niepisana zasada polskich trybun).
// Generator składa oprawę z elementów: rodzaj (sektorówka, kartoniada, flagi na kijach, folie, malowany
// transparent, oprawa dwupoziomowa, choreografia z szalikami, pirotechniczna), motyw (herb, symbol miasta/regionu,
// rok założenia, kibic z szalikiem), hasło, układ barw i okazja (derby, urodziny klubu, start sezonu, pamięć…).
// Każda pokazana oprawa jest zapamiętana dla klubu (podpis) — następna musi się różnić.
import { rokZalozenia } from "../data/zalozenie";
import { barwyKlubu } from "../data/barwy";
import type { Klub, StanGry } from "./types";

export type RodzajOprawy = "sektorowka" | "kartoniada" | "flagi_na_kijach" | "folie" | "transparent_malowany" | "dwupoziomowa" | "szaliki" | "pirotechniczna";
export type UkladBarw = "pasy_pion" | "pasy_poziom" | "szachownica" | "ukos" | "promienie" | "srodek" | "fale";
export interface Oprawa {
  id: string; klub: string; rodzaj: RodzajOprawy; motyw: string; haslo: string; uklad: UkladBarw; okazja: string;
  kolory: [string, string]; herb: boolean; opis: string; sezon: number; pirotechnika: boolean;
  obrazliwa?: boolean; // prowokacja wobec rywala — delegat w protokole, kara Komisji Ligi, nakręca drugą trybunę
  rywalKolory?: [string, string];
}

export const NAZWA_RODZAJU: Record<RodzajOprawy, string> = {
  sektorowka: "sektorówka na całą trybunę", kartoniada: "kartoniada", flagi_na_kijach: "flagi na kijach", folie: "folie w barwach",
  transparent_malowany: "ręcznie malowany transparent", dwupoziomowa: "oprawa dwupoziomowa (sektorówka + kartoniada)", szaliki: "choreografia z szalikami", pirotechniczna: "pokaz pirotechniczny",
};
const SYMBOLE: Record<string, string[]> = {
  Gdańsk: ["🦁 lwy z herbu Gdańska", "🏗 żuraw nad Motławą", "⚓ okręt Hanzy"], Gdynia: ["⚓ kotwica", "⛵ żaglowiec", "🌊 morskie fale"],
  Kraków: ["🐉 smok wawelski", "🏰 Wawel", "👑 korona"], Szczecin: ["🦅 gryf pomorski", "⚓ port", "🏰 Zamek Książąt Pomorskich"],
  Bydgoszcz: ["🏹 łuczniczka", "🌉 most nad Brdą"], Toruń: ["🏰 brama miejska", "🥨 pierniki z herbem", "⭐ Kopernik i gwiazdy"],
  Warszawa: ["🧜 syrenka", "🏰 Kolumna Zygmunta"], Poznań: ["🐐 koziołki", "🔑 klucze z herbu"], Łódź: ["🛶 łódź z herbu", "🏭 fabryczne kominy"],
  Wrocław: ["🦁 lew", "🌉 mosty"], Białystok: ["🦬 żubr", "⚔️ rycerz"], Katowice: ["⛏ górnicze kilofy", "🔥 hałdy i szyby"],
};
const MOTYWY_OGOLNE = ["⚔️ rycerz z tarczą", "🦅 orzeł w koronie", "🧣 kibic z szalikiem nad głową", "🏟 stary stadion z dawnych lat", "👊 zaciśnięta pięść w barwach", "🔥 płonące serce", "🛡 tarcza z herbem", "🌅 wschodzące słońce nad miastem", "👨‍👦 ojciec z synem na trybunie", "🗝 klucz do miasta", "🏆 puchar w rękach kibiców", "🕯 znicz pamięci"];
const UKLADY: UkladBarw[] = ["pasy_pion", "pasy_poziom", "szachownica", "ukos", "promienie", "srodek", "fale"];
const RODZAJE: RodzajOprawy[] = ["sektorowka", "kartoniada", "flagi_na_kijach", "folie", "transparent_malowany", "dwupoziomowa", "szaliki", "pirotechniczna"];

const krot = (k: Klub) => k.nazwa.split(" ").filter((w) => w.length > 2 && !/^(KS|MKS|GKS|LKS|LZS|TS|SKS|KP|MZKS|ZKS|FC|II|III|Sp)$/.test(w))[0] ?? k.nazwa;

function hasla(k: Klub, okazja: string, rywal?: Klub): string[] {
  const K = krot(k), M = k.miasto, R = rywal ? krot(rywal) : "";
  const rok = rokZalozenia(k.nazwa);
  const out = [`${K} — duma ${M}`, `Jedno miasto, jeden klub — ${K}`, `Zawsze wierni ${K}`, `${M} to my`, `Dla Ciebie śpiewamy, ${K}`, `Serce bije w barwach ${K}`,
    `Od pokoleń z ${K}`, `Wierni do końca`, `Tu jest nasz dom`, `Walczcie do ostatniej kropli potu`, `Nikt nie zabierze nam marzeń`, `Razem na dobre i na złe`,
    `Nasza miłość — nasza wiara — ${K}`, `Gdzie ${K}, tam my`, `Bez względu na wynik`, `Historia pisana na trybunach`, `Kocham Cię, ${K}`, `Tylko ${K}, tylko ${M}`];
  if (rok) out.push(`${rok} — od zawsze ${K}`, `Od ${rok} roku z ${K}`);
  if (okazja.startsWith("derby") && R) out.push(`${M} jest nasze — ${R} nigdy`, `Wy macie tylko nazwę, my mamy historię`, `${R}? Tylko w waszych snach`, `Derby to święto — wygrać musimy`);
  if (okazja.startsWith("urodziny") && rok) out.push(`${new Date().getFullYear() - rok} lat legendy`, `Sto lat, ${K}!`);
  if (okazja.startsWith("pamięć")) out.push(`[*] Pamiętamy — zawsze z nami na trybunie`, `Odszedłeś, ale Twój głos wciąż tu słychać`);
  if (okazja.startsWith("awans")) out.push(`Wyżej i wyżej — ${K}`, `Ten sezon jest nasz`);
  if (okazja.startsWith("start")) out.push(`Nowy sezon — ta sama miłość`, `Znów razem — ruszamy`);
  if (okazja.startsWith("zgoda") && R) out.push(`${K} & ${R} — zgoda na wieki`, `Przyjaźń ponad podziałami — ${K} i ${R}`, `Razem od lat — ${M} i ${rywal!.miasto}`, `Bracia z ${rywal!.miasto} — witamy w domu`, `Dwa kluby, jedna rodzina`, `Wspólna droga, wspólne barwy`);
  if (okazja.startsWith("wielki") && R) out.push(`Dziś piszemy historię`, `Puchar to nasza szansa — ${K} nie pęka`, `Dawid kontra Goliat? Pokażcie im ${M}`, `Tacy rywale tylko nas nakręcają`);
  return out;
}

/** Prowokacje wobec rywala na derbach / meczach podwyższonego ryzyka („pstryczek w nos"). Wulgaryzmy wykropkowane jak w relacjach TV. */
/** Wulgaryzm na transparencie — w grze zawsze ZAMAZANY (gwiazdki w tekście, czarny pasek na banerze 3D). */
export const ZAMAZ = (slowo: string) => `{${slowo[0]}${"*".repeat(Math.max(2, slowo.length - 2))}${slowo[slowo.length - 1]}}`;
/** Tekst do wyświetlenia: {k***a} → k***a. */
export const bezNawiasow = (t: string) => t.replace(/[{}]/g, "");

/** Prowokacje wobec rywala („pstryczek w nos") — dużo wyobraźni; wulgaryzmy zawsze zamazane. Bez treści rasistowskich/religijnych. */
function prowokacje(k: Klub, r: Klub): { motyw: string; haslo: string }[] {
  const K = krot(k), R = krot(r), M = k.miasto, MR = r.miasto;
  const rok = rokZalozenia(r.nazwa), teraz = new Date().getFullYear();
  const kw = ZAMAZ("kurwa"), ch = ZAMAZ("chuje"), sp = ZAMAZ("spierdalać"), je = ZAMAZ("jebać"), pi = ZAMAZ("pizda");
  return [
    { motyw: "🐷 karykatura świni w barwach rywala", haslo: `${R} ${kw} świnia` },
    { motyw: "🐷 świnia w szaliku rywala na tle chlewika", haslo: `${R} — prosto z chlewika` },
    { motyw: "🪦 nagrobek z herbem rywala", haslo: rok ? `${R} ${rok}–${teraz} [*] Spoczywaj w niebycie` : `Tu leży ${R} — nikt nie płacze` },
    { motyw: "⚰️ trumna w barwach rywala niesiona przez „żałobników”", haslo: `Ostatnia droga ${R} — nikt nie przyszedł` },
    { motyw: "🙃 herb rywala do góry nogami", haslo: `${R} — wasze miejsce jest na dole` },
    { motyw: "🫏 osioł w szaliku rywala", haslo: `Ile trzeba mieć IQ, żeby kibicować ${R}?` },
    { motyw: "🧻 rolka papieru toaletowego w barwach rywala", haslo: `Szal ${R}? Tylko do jednego się nadaje` },
    { motyw: "🐀 szczury uciekające z miasta rywala", haslo: `${MR} — szczury uciekają pierwsze` },
    { motyw: "🍼 bobas ze smoczkiem w barwach rywala", haslo: `${R}, wróćcie, jak dorośniecie` },
    { motyw: "🗺 mapa regionu z wyciętym miastem rywala", haslo: `${M} — tu nie ma miejsca na ${R}` },
    { motyw: "🏚 rozwalająca się szopa z logo rywala", haslo: `Wasz stadion? Nasza obora ładniejsza` },
    { motyw: "🤡 klaun w koszulce rywala", haslo: `Cyrk przyjechał — witamy ${R}` },
    { motyw: "🚩 skradziona flaga rywala (do góry nogami)", haslo: `Pozdrowienia dla ${R} — flaga zostaje u nas` },
    { motyw: "📉 wykres spadku rywala przez lata", haslo: `${R} — od lat tylko w dół` },
    { motyw: "📜 „list” do rywala na całą trybunę", haslo: `Drogi ${R}! Piszemy, bo i tak nie umiecie czytać` },
    { motyw: "🧮 tablica z bilansem derbów", haslo: `Liczyć umiecie? My wygrywamy, wy płaczecie` },
    { motyw: "🐔 kurczak w barwach rywala uciekający z boiska", haslo: `${R} — tchórze, jak zawsze` },
    { motyw: "🧸 pluszowy miś z szalikiem rywala", haslo: `Przytulanki dla kibiców ${R}` },
    { motyw: "🚽 sedes z herbem rywala", haslo: `Tu jest miejsce dla ${R}` },
    { motyw: "🦆 kaczki z szalikami rywala", haslo: `Kwa kwa ${R} — więcej nie umiecie` },
    { motyw: "🧀 mysz w szaliku rywala zjadająca ser", haslo: `${R} — małe, szare, piszczące` },
    { motyw: "🚂 pociąg odjeżdżający do niższej ligi", haslo: `Odjazd ${R}: peron „niższa liga”` },
    { motyw: "🎓 świadectwo z samymi jedynkami dla rywala", haslo: `${R} — powtarzacie klasę od lat` },
    { motyw: "🔍 lupa nad kibicami rywala", haslo: `Szukamy kibiców ${R}… nie znaleziono` },
    { motyw: "📺 ekran „brak sygnału” w barwach rywala", haslo: `${R} — brak sygnału od ${rok ?? "zawsze"}` },
    { motyw: "🧯 gaśnica nad płonącym herbem rywala", haslo: `Gasimy was co sezon` },
    { motyw: "🏳 biała flaga z herbem rywala", haslo: `${R} — poddajecie się przed meczem` },
    { motyw: "🐑 owce w barwach rywala za pasterzem", haslo: `Stado ${R} — beee` },
    { motyw: "🧳 walizki rywala na dworcu", haslo: `${R} — pakujcie się, ${M} jest nasze` },
    { motyw: "👶 wózek dziecięcy z herbem rywala", haslo: `${R}: przedszkole, nie klub` },
    { motyw: "🍋 cytryna z herbem rywala", haslo: `${R} — kwaśne miny po każdych derbach` },
    { motyw: "🏁 metka „Made in ${MR}” na podróbce".replace("${MR}", MR), haslo: `${R} — podróbka prawdziwego klubu` },
    { motyw: "🐷 świnia z megafonem w barwach rywala", haslo: `${R} ${ch} — wieczni przegrani` },
    { motyw: "👉 wielki palec wskazujący drogę do wyjścia", haslo: `${R}, ${sp} z naszego miasta!` },
    { motyw: "🔥 przekreślony herb rywala w ogniu", haslo: `${je} ${R} — od zawsze i na zawsze` },
    { motyw: "🐀 szczur w koronie z herbem rywala", haslo: `${R} — ${pi}, nie klub` },
    { motyw: "🦴 pies z kością w barwach rywala", haslo: `Kość dla ${R} — więcej nie dostaniecie` },
    { motyw: "🪞 krzywe lustro z odbiciem rywala", haslo: `${R} — w lustrze też przegrywacie` },
    { motyw: "⏰ zegar zatrzymany na dacie ostatniej wygranej rywala", haslo: `${R}: czas stanął dawno temu` },
    { motyw: "🌧 chmura deszczowa nad herbem rywala", haslo: `Nad ${MR} zawsze pada — od naszych bramek` },
  ];
}

/** Nowa, NIEPOWTARZALNA oprawa dla klubu (zapamiętywana w stanie gry). */
export function nowaOprawa(s: StanGry, k: Klub, okazja: string, rywal?: Klub, sila = 0.5): Oprawa {
  const uzyte = new Set((s.oprawyUzyte ??= {})[k.nazwa] ?? []);
  const kol = barwyKlubu(k.nazwa);
  const symbole = [...(SYMBOLE[k.miasto] ?? []), ...MOTYWY_OGOLNE, "🛡 herb klubu"];
  const rodzaje = RODZAJE.filter((r) => sila > 0.35 || !["dwupoziomowa", "pirotechniczna", "folie"].includes(r));
  let o: Oprawa | undefined;
  for (let proba = 0; proba < 200 && !o; proba++) {
    const rodzaj = rodzaje[Math.floor(Math.random() * rodzaje.length)];
    const prowo = !!rywal && okazja.startsWith("derby") && Math.random() < 0.45;
    const lp = prowo ? prowokacje(k, rywal!) : []; const pr = prowo ? lp[Math.floor(Math.random() * lp.length)] : undefined;
    const motyw = pr?.motyw ?? symbole[Math.floor(Math.random() * symbole.length)];
    const hl = hasla(k, okazja, rywal); const haslo = pr?.haslo ?? hl[Math.floor(Math.random() * hl.length)];
    const uklad = UKLADY[Math.floor(Math.random() * UKLADY.length)];
    const odwr = Math.random() < 0.5;
    const podpis = `${rodzaj}|${motyw}|${haslo}|${uklad}|${odwr ? 1 : 0}`;
    if (uzyte.has(podpis)) continue;
    const kolory: [string, string] = odwr ? [kol[1], kol[0]] : [kol[0], kol[1]];
    const pir = rodzaj === "pirotechniczna" || (sila > 0.5 && Math.random() < 0.35);
    o = { id: podpis, klub: k.nazwa, rodzaj, motyw, haslo, uklad, okazja, kolory, herb: motyw.includes("herb") && !prowo, sezon: s.sezon, pirotechnika: pir, obrazliwa: prowo, rywalKolory: rywal ? barwyKlubu(rywal.nazwa) : undefined,
      opis: `${NAZWA_RODZAJU[rodzaj]} — motyw: ${motyw.replace(/^\S+\s/, "")}, hasło „${bezNawiasow(haslo)}”${pir ? ", na koniec race i stroboskopy" : ""} (${okazja}).${prowo ? ` To prowokacja wobec ${rywal!.nazwa} — druga trybuna gwiżdże i odpowiada przyśpiewkami, delegat odnotowuje w protokole.` : ""}` };
  }
  if (!o) { const n = (s.oprawyUzyte[k.nazwa] ?? []).length + 1; o = { id: `nr${n}`, klub: k.nazwa, rodzaj: "transparent_malowany", motyw: "🧣 kibic z szalikiem nad głową", haslo: `Oprawa nr ${n} — zawsze inna, zawsze nasza`, uklad: "srodek", okazja, kolory: kol, herb: false, sezon: s.sezon, pirotechnika: false, opis: `ręcznie malowany transparent nr ${n}` }; }
  (s.oprawyUzyte[k.nazwa] ??= []).push(o.id);
  if (s.oprawyUzyte[k.nazwa].length > 400) s.oprawyUzyte[k.nazwa] = s.oprawyUzyte[k.nazwa].slice(-400);
  return o;
}

/** Okazja do oprawy dla danego meczu. */
export function okazjaOprawy(s: StanGry, k: Klub, derbyNazwa: string | null, kolejka: number, rywal?: Klub, zgoda?: string | null, puchar?: boolean): string | null {
  const rok = rokZalozenia(k.nazwa);
  if (derbyNazwa) return `derby: ${derbyNazwa}`;
  if (zgoda) return `zgoda: ${zgoda}`;
  if (rywal && (puchar || rywal.poziom < k.poziom || (rywal.renoma ?? 0) > 0.75)) return puchar ? `wielki mecz w Pucharze Polski z ${rywal.nazwa}` : `wielki mecz z ${rywal.nazwa}`;
  if (kolejka === 0) return "start sezonu";
  if (rok && (s.sezon - rok) % 5 === 0 && kolejka <= 3) return `urodziny klubu — ${s.sezon - rok} lat`;
  if (Math.random() < 0.04) return "pamięć zmarłego kibica";
  if (Math.random() < 0.08) return "zwykły mecz — prezentacja grup";
  return null;
}

export interface PokazOprawy { o: Oprawa; min: number; sektor: "gospodarzy" | "gosci" }
/**
 * Plan opraw na mecz — mocne sceny robią kilka-kilkanaście opraw w sezonie; derby i podwyższone ryzyko: 2–4 oprawy
 * na mecz (wyjście drużyn, start 2. połowy, w trakcie), zgody: wspólne oprawy obu sektorów. Każda oprawa inna.
 */
export function planOpraw(s: StanGry, kd: Klub, kg: Klub, o: { derby: string | null; zgoda: string | null; puchar?: boolean; gosci: number; silaD: number; silaG: number }): PokazOprawy[] {
  const out: PokazOprawy[] = [];
  const okD = okazjaOprawy(s, kd, o.derby, s.kolejka, kg, o.zgoda, o.puchar);
  const okG = o.gosci > 0 ? (o.derby ? `derby: ${o.derby} (wyjazd)` : o.zgoda ? `zgoda: ${o.zgoda}` : (o.puchar || kd.poziom < kg.poziom) ? `wielki mecz z ${kd.nazwa}` : null) : null;
  // ile opraw: derby 2–4 u gospodarzy, zgoda 1–2 każdej stronie, wielki mecz 1–2, zwykły — zależnie od siły sceny
  const ileD = !okD ? 0 : o.derby ? 2 + Math.floor(Math.random() * 3) : o.zgoda ? 1 + Math.floor(Math.random() * 2) : okD.startsWith("wielki") ? 1 + (Math.random() < o.silaD ? 1 : 0) : Math.random() < 0.3 + o.silaD * 0.5 ? 1 : 0;
  const ileG = !okG ? 0 : o.derby ? 1 + Math.floor(Math.random() * 2) : o.zgoda ? 1 + Math.floor(Math.random() * 2) : Math.random() < o.silaG * 0.7 ? 1 : 0;
  // zwykłe mecze: mocne sceny (Ekstraklasa, I liga, kluby z tradycją) też pokazują oprawy kilka-kilkanaście razy w sezonie
  const zwykla = !okD && Math.random() < o.silaD * 0.45 ? "mecz ligowy — oprawa grup" : null;
  const minuty = [0, 46, 30 + Math.floor(Math.random() * 10), 70 + Math.floor(Math.random() * 10)];
  for (let i = 0; i < ileD; i++) out.push({ o: nowaOprawa(s, kd, okD!, kg, o.silaD), min: minuty[i] ?? 60, sektor: "gospodarzy" });
  if (zwykla) out.push({ o: nowaOprawa(s, kd, zwykla, kg, o.silaD), min: Math.random() < 0.6 ? 0 : 46, sektor: "gospodarzy" });
  for (let i = 0; i < ileG; i++) out.push({ o: nowaOprawa(s, kg, okG!, kd, o.silaG), min: [1, 47, 65][i] ?? 75, sektor: "gosci" });
  return out.sort((a, b) => a.min - b.min);
}

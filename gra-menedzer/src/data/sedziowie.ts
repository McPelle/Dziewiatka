// Kadra sędziowska świata wg realiów PZPN.
// • Szczebel centralny (Ekstraklasa, I liga, II liga, Puchar Polski) — REALNI sędziowie z uprawnieniami (odznaka FIFA).
// • Reprezentacje i puchary europejskie — REALNI sędziowie międzynarodowi (patrz sedziowie-intl.ts).
// • III liga (szczebel centralny, obsada KS PZPN — w grze generowani), IV liga → klasa B oraz puchary wojewódzkie — GENEROWANI, przydzieleni do województwa gry.
//   Szczegóły obsady wg szczebla (asystenci społeczni w klasach A/B/C): engine/obsadaSedziowska.ts.
import { wybierz } from "../engine/losuj";
import { klasaWgSzczebla, szczebelPoziomu, tylkoSedziaGlowny } from "../engine/obsadaSedziowska";
import { IMIONA, NAZWISKA } from "./nazwy";
import type { Sedziowie, SedziaOsoba, StanGry, Wynik } from "../engine/types";

type Region = "centralny" | "pomorskie" | "malopolskie" | "zachodniopomorskie" | "kujawsko-pomorskie";

// Dane wojewódzkiego ZPN wg regionu gry (mianownik, dopełniacz, nazwa pucharu, kolegia sędziowskie/okręgi).
const ZPN: Record<string, { mian: string; dop: string; puchar: string; okregi: string[] }> = {
  pomorskie: { mian: "Pomorski ZPN", dop: "Pomorskiego ZPN", puchar: "Puchar Pomorski", okregi: ["Gdańsk", "Słupsk", "Malbork", "Gdynia"] },
  malopolskie: { mian: "Małopolski ZPN", dop: "Małopolskiego ZPN", puchar: "Puchar Małopolski", okregi: ["Kraków", "Tarnów", "Nowy Sącz", "Wadowice"] },
  zachodniopomorskie: { mian: "Zachodniopomorski ZPN", dop: "Zachodniopomorskiego ZPN", puchar: "Puchar Zachodniopomorski", okregi: ["Szczecin", "Koszalin", "Stargard", "Kołobrzeg"] },
  "kujawsko-pomorskie": { mian: "Kujawsko-Pomorski ZPN", dop: "Kujawsko-Pomorskiego ZPN", puchar: "Puchar Kujawsko-Pomorski", okregi: ["Bydgoszcz", "Toruń", "Włocławek", "Grudziądz"] },
};

// ——— REALNI sędziowie szczebla centralnego (2026/27; źródła: obsady PZPN/etoto, lista FIFA) ———
const EKSTRAKLASA_GL: { imie: string; nazwisko: string; fifa?: boolean }[] = [
  { imie: "Szymon", nazwisko: "Marciniak", fifa: true }, { imie: "Paweł", nazwisko: "Raczkowski", fifa: true },
  { imie: "Bartosz", nazwisko: "Frankowski", fifa: true }, { imie: "Damian", nazwisko: "Sylwestrzak", fifa: true },
  { imie: "Łukasz", nazwisko: "Kuźma", fifa: true }, { imie: "Damian", nazwisko: "Kos", fifa: true },
  { imie: "Patryk", nazwisko: "Gryckiewicz", fifa: true }, { imie: "Wojciech", nazwisko: "Myć", fifa: true },
  { imie: "Tomasz", nazwisko: "Kwiatkowski", fifa: true }, { imie: "Daniel", nazwisko: "Stefański" },
  { imie: "Piotr", nazwisko: "Lasyk" }, { imie: "Marcin", nazwisko: "Szczerbowicz" },
  { imie: "Karol", nazwisko: "Arys" }, { imie: "Jarosław", nazwisko: "Przybył" },
  { imie: "Paweł", nazwisko: "Malec" }, { imie: "Piotr", nazwisko: "Urban" }, { imie: "Piotr", nazwisko: "Rzucidło" },
];
const ASYSTENCI: { imie: string; nazwisko: string; fifa?: boolean }[] = [
  { imie: "Paweł", nazwisko: "Sokolnicki", fifa: true }, { imie: "Tomasz", nazwisko: "Listkiewicz", fifa: true },
  { imie: "Adam", nazwisko: "Kupsik", fifa: true }, { imie: "Bartosz", nazwisko: "Heinig", fifa: true },
  { imie: "Marek", nazwisko: "Arys" }, { imie: "Dariusz", nazwisko: "Bohonos" }, { imie: "Marcin", nazwisko: "Lisowski" },
  { imie: "Filip", nazwisko: "Sierant" }, { imie: "Jakub", nazwisko: "Winkler" }, { imie: "Bartosz", nazwisko: "Tomaszuk" },
  { imie: "Sebastian", nazwisko: "Krasny" }, { imie: "Paweł", nazwisko: "Horożaniecki" }, { imie: "Rafał", nazwisko: "Szydełko" },
  { imie: "Krzysztof", nazwisko: "Stępień" }, { imie: "Błażej", nazwisko: "Granat" }, { imie: "Damian", nazwisko: "Sadowski" },
  { imie: "Andrzej", nazwisko: "Jerszewski" }, { imie: "Mateusz", nazwisko: "Mastaj" }, { imie: "Mateusz", nazwisko: "Niedzielan" },
];
const VAR_SEDZIOWIE: { imie: string; nazwisko: string }[] = [
  { imie: "Bartosz", nazwisko: "Frankowski" }, { imie: "Tomasz", nazwisko: "Kwiatkowski" }, { imie: "Damian", nazwisko: "Kos" },
  { imie: "Patryk", nazwisko: "Gryckiewicz" }, { imie: "Daniel", nazwisko: "Stefański" }, { imie: "Łukasz", nazwisko: "Szczech" },
  { imie: "Paweł", nazwisko: "Pskit" }, { imie: "Marcin", nazwisko: "Boniek" }, { imie: "Kornel", nazwisko: "Paszkiewicz" },
  { imie: "Dawid", nazwisko: "Golis" }, { imie: "Adam", nazwisko: "Karasewicz" },
];
const ILIGA_GL = [{ imie: "Tomasz", nazwisko: "Marciniak" }, { imie: "Łukasz", nazwisko: "Szczech" }, { imie: "Mariusz", nazwisko: "Myszka" }];
// Realni sędziowie główni II ligi 2026/27 — z oficjalnych obsad PZPN (Komunikaty II ligi, kolejki 1–15).
const IILIGA_GL: { imie: string; nazwisko: string }[] = [
  { imie: "Piotr", nazwisko: "Szypuła" }, { imie: "Patryk", nazwisko: "Świerczek" }, { imie: "Jan", nazwisko: "Chmielak" },
  { imie: "Paweł", nazwisko: "Maćkowiak" }, { imie: "Dorian", nazwisko: "Skwara" }, { imie: "Aleksander", nazwisko: "Borowiak" },
  { imie: "Mateusz", nazwisko: "Mastaj" }, { imie: "Adam", nazwisko: "Sekuterski" }, { imie: "Dawid", nazwisko: "Wiśniewski" },
  { imie: "Mateusz", nazwisko: "Niedzielan" }, { imie: "Kornel", nazwisko: "Paszkiewicz" }, { imie: "Anna", nazwisko: "Adamska" },
  { imie: "Mateusz", nazwisko: "Stępniak" }, { imie: "Błażej", nazwisko: "Syropiatko" }, { imie: "Leszek", nazwisko: "Lewandowski" },
  { imie: "Maciej", nazwisko: "Pelka" }, { imie: "Karol", nazwisko: "Wójcik" }, { imie: "Dawid", nazwisko: "Muc" },
  { imie: "Paweł", nazwisko: "Wrzeszczyński" }, { imie: "Rafał", nazwisko: "Szydełko" }, { imie: "Piotr", nazwisko: "Pazdecki" },
  { imie: "Łukasz", nazwisko: "Ostrowski" }, { imie: "Łukasz", nazwisko: "Szczech" }, { imie: "Dominik", nazwisko: "Sulikowski" },
  { imie: "Mariusz", nazwisko: "Myszka" }, { imie: "Paweł", nazwisko: "Szuta" }, { imie: "Łukasz", nazwisko: "Dobrzyński" },
  { imie: "Mateusz", nazwisko: "Złotnicki" },
];

/** Klasa (uprawnienia) sędziego właściwa dla szczebla rozgrywek wg PZPN. */
export function klasaSedziego(poziom: number, region: Region): string {
  switch (poziom) {
    case 1: return "Ekstraklasa (szczebel centralny)";
    case 2: return "I liga (szczebel centralny)";
    case 3: return "II liga (szczebel centralny)";
    case 4: return "III liga (szczebel centralny — obsada KS PZPN)"; // Konwencja Sędziowska PZPN: III liga = sędziowie szczebla centralnego
    case 5: return `klasa wojewódzka (${ZPN[region]?.mian ?? "Małopolski ZPN"})`;
    case 6: return "klasa okręgowa";
    case 7: return "klasa A (okręg)";
    case 8: return "klasa B (okręg)";
    default: return "klasa C (okręg)";
  }
}

/** Region świata gry wg nazw lig (pomorskie vs małopolskie). */
export function regionSwiata(s: StanGry): "pomorskie" | "malopolskie" | "zachodniopomorskie" | "kujawsko-pomorskie" {
  const nazwy = s.ligi.map((l) => l.nazwa.toLowerCase()).join(" ");
  // Kolejność ważna: „zachodniopomor" i „kujawsko" też zawierają „pomor".
  if (/zachodniopomor/.test(nazwy)) return "zachodniopomorskie";
  if (/kujawsko/.test(nazwy)) return "kujawsko-pomorskie";
  if (/pomor/.test(nazwy)) return "pomorskie";
  return "malopolskie";
}

const tag = (a: { imie: string; nazwisko: string; fifa?: boolean }[], klasa: string, region: Region): SedziaOsoba[] =>
  a.map((x) => ({ imie: x.imie, nazwisko: x.nazwisko, klasa, region, fifa: x.fifa }));

/** Buduje kadrę sędziowską świata: realni centralni + generowani sędziowie regionu gry (III liga→B klasa + puchar woj.). */
export function generujPuleSedziow(s: StanGry): void {
  const region = regionSwiata(s);
  const woj = ZPN[region].dop;
  const okregi = ZPN[region].okregi;
  const regionPula: SedziaOsoba[] = [];
  // ile generowanych sędziów na szczebel (więcej w dole piramidy)
  const ile: Record<number, number> = { 4: 14, 5: 16, 6: 20, 7: 24, 8: 24, 9: 18 };
  for (let p = 4; p <= 9; p++) {
    const klasa = klasaSedziego(p, region);
    for (let i = 0; i < ile[p]; i++) {
      regionPula.push({ imie: wybierz(IMIONA), nazwisko: wybierz(NAZWISKA), klasa: p === 4 ? `${klasa} — sędzia z ${woj}` : `${klasa} — kolegium ${wybierz(okregi)} (${woj})`, region });
    }
  }
  s.sedziowie = {
    ekstraklasa: tag(EKSTRAKLASA_GL, "Ekstraklasa (szczebel centralny)", "centralny"),
    asystenci: tag(ASYSTENCI, "asystent (szczebel centralny)", "centralny"),
    var: tag(VAR_SEDZIOWIE, "VAR (szczebel centralny)", "centralny"),
    iLiga: tag(ILIGA_GL, "I liga (szczebel centralny)", "centralny"),
    iiLiga: tag(IILIGA_GL, "II liga (szczebel centralny)", "centralny"),
    region: regionPula,
  };
}

// ——— REALNI sędziowie MIĘDZYNARODOWI (UEFA Elite / FIFA, aktywni 2026) — puchary europejskie i reprezentacje ———
const INTL_GL: { imie: string; nazwisko: string; kraj: string }[] = [
  { imie: "Szymon", nazwisko: "Marciniak", kraj: "Polska" }, { imie: "Slavko", nazwisko: "Vinčić", kraj: "Słowenia" },
  { imie: "Clément", nazwisko: "Turpin", kraj: "Francja" }, { imie: "François", nazwisko: "Letexier", kraj: "Francja" },
  { imie: "Danny", nazwisko: "Makkelie", kraj: "Holandia" }, { imie: "Felix", nazwisko: "Zwayer", kraj: "Niemcy" },
  { imie: "Daniel", nazwisko: "Siebert", kraj: "Niemcy" }, { imie: "Sven", nazwisko: "Jablonski", kraj: "Niemcy" },
  { imie: "István", nazwisko: "Kovács", kraj: "Rumunia" }, { imie: "Michael", nazwisko: "Oliver", kraj: "Anglia" },
  { imie: "Anthony", nazwisko: "Taylor", kraj: "Anglia" }, { imie: "Chris", nazwisko: "Kavanagh", kraj: "Anglia" },
  { imie: "Sandro", nazwisko: "Schärer", kraj: "Szwajcaria" }, { imie: "Espen", nazwisko: "Eskås", kraj: "Norwegia" },
  { imie: "Glenn", nazwisko: "Nyberg", kraj: "Szwecja" }, { imie: "Maurizio", nazwisko: "Mariani", kraj: "Włochy" },
  { imie: "Davide", nazwisko: "Massa", kraj: "Włochy" }, { imie: "João", nazwisko: "Pinheiro", kraj: "Portugalia" },
  { imie: "Luís", nazwisko: "Godinho", kraj: "Portugalia" }, { imie: "Halil Umut", nazwisko: "Meler", kraj: "Turcja" },
  { imie: "Alejandro", nazwisko: "Hernández Hernández", kraj: "Hiszpania" }, { imie: "Jesús", nazwisko: "Gil Manzano", kraj: "Hiszpania" },
  { imie: "Erik", nazwisko: "Lambrechts", kraj: "Belgia" }, { imie: "Irfan", nazwisko: "Peljto", kraj: "Bośnia i Hercegowina" },
  { imie: "Nicolas", nazwisko: "Walsh", kraj: "Szkocja" }, { imie: "Donatas", nazwisko: "Rumšas", kraj: "Litwa" },
  { imie: "Rade", nazwisko: "Obrenović", kraj: "Słowenia" }, { imie: "Willy", nazwisko: "Delajod", kraj: "Francja" },
];
const INTL_ASY: { imie: string; nazwisko: string; kraj: string }[] = [
  { imie: "Jan", nazwisko: "Seidel", kraj: "Niemcy" }, { imie: "Rafael", nazwisko: "Foltyn", kraj: "Niemcy" },
  { imie: "Cyril", nazwisko: "Mugnier", kraj: "Francja" }, { imie: "Mehdi", nazwisko: "Rahmouni", kraj: "Francja" },
  { imie: "Guadalupe", nazwisko: "Porras Ayuso", kraj: "Hiszpania" }, { imie: "José Enrique", nazwisko: "Naranjo Pérez", kraj: "Hiszpania" },
  { imie: "Mahbod", nazwisko: "Beigi", kraj: "Szwecja" }, { imie: "Andreas", nazwisko: "Söderkvist", kraj: "Szwecja" },
];
const INTL_VAR: { imie: string; nazwisko: string; kraj: string }[] = [
  { imie: "Jérôme", nazwisko: "Brisard", kraj: "Francja" }, { imie: "Bastian", nazwisko: "Dankert", kraj: "Niemcy" },
  { imie: "Robert", nazwisko: "Schröder", kraj: "Niemcy" }, { imie: "Carlos", nazwisko: "del Cerro Grande", kraj: "Hiszpania" },
  { imie: "Marco", nazwisko: "Di Bello", kraj: "Włochy" }, { imie: "Ivan", nazwisko: "Bebek", kraj: "Chorwacja" },
  { imie: "Dennis", nazwisko: "Higler", kraj: "Holandia" }, { imie: "Tomasz", nazwisko: "Kwiatkowski", kraj: "Polska" },
  { imie: "Bram", nazwisko: "Van Driessche", kraj: "Belgia" }, { imie: "Fedayi", nazwisko: "San", kraj: "Szwajcaria" },
];

/** Realna obsada międzynarodowa (UEFA/FIFA) na mecz pucharów europejskich lub reprezentacji. `nasz` = kraj do wykluczenia (bezstronność). */
export function obsadaMiedzynarodowa(opts: { nasz?: string; ranga?: "LM" | "LE" | "LK" | "reprezentacja" } = {}): NonNullable<Wynik["sedzia"]> {
  const nasz = opts.nasz ?? "Polska";
  const imie = (r: { imie: string; nazwisko: string; kraj: string }) => `${r.imie} ${r.nazwisko} (${r.kraj})`;
  // KOMPLET UEFA/FIFA (6 oficjeli): sędzia główny + 2 asystentów + sędzia techniczny (4.) + VAR + AVAR.
  const g = wybierz(INTL_GL.filter((r) => r.kraj !== nasz).length ? INTL_GL.filter((r) => r.kraj !== nasz) : INTL_GL);
  const uzyteKraje = new Set([nasz, g.kraj]);
  const bezUzytych = <T extends { kraj: string }>(a: T[]) => a.filter((r) => !uzyteKraje.has(r.kraj));
  const dobierzI = <T extends { kraj: string }>(a: T[]): T => { const w = bezUzytych(a); const x = w.length ? wybierz(w) : wybierz(a); uzyteKraje.add(x.kraj); return x; };
  const a1 = dobierzI(INTL_ASY), a2 = dobierzI(INTL_ASY);
  const czwarty = dobierzI(INTL_GL); // 4. sędzia (sędzia techniczny) — też sędzia z listy
  const v = dobierzI(INTL_VAR);
  const av = dobierzI(INTL_VAR);
  const rangaTxt = opts.ranga === "reprezentacja" ? "sędzia FIFA (mecz międzypaństwowy)"
    : opts.ranga === "LM" ? "sędzia UEFA — Liga Mistrzów"
    : opts.ranga === "LE" ? "sędzia UEFA — Liga Europy"
    : opts.ranga === "LK" ? "sędzia UEFA — Liga Konferencji" : "sędzia międzynarodowy UEFA/FIFA";
  return {
    glowny: imie(g),
    styl: "normalny",
    asystenci: [imie(a1), imie(a2)],
    techniczny: imie(czwarty),
    var: true, varSedzia: imie(v),
    avar: true, avarSedzia: imie(av),
    klasa: rangaTxt, fifa: true, real: true, region: "międzynarodowy",
  };
}

// ——— Dobór obsady na mecz ———
function fmt(o?: SedziaOsoba): string { return o ? `${o.imie} ${o.nazwisko}` : `${wybierz(IMIONA)} ${wybierz(NAZWISKA)}`; }
/** Losuje osobę z puli bez powtórzeń (po nazwisku); pusta pula → osoba wygenerowana ad hoc. */
function dobierz(pula: SedziaOsoba[], uzyte: Set<string>): SedziaOsoba | undefined {
  const wolne = pula.filter((o) => !uzyte.has(`${o.imie} ${o.nazwisko}`));
  const o = wolne.length ? wybierz(wolne) : undefined;
  if (o) uzyte.add(`${o.imie} ${o.nazwisko}`);
  return o;
}

/**
 * Składa obsadę sędziowską meczu wg szczebla (PZPN).
 * poziom 1–3 lub Puchar Polski → realni sędziowie centralni (+ VAR/AVAR w Ekstraklasie/PP).
 * poziom 4–9 i puchary wojewódzkie → generowani sędziowie regionu, z klasą właściwą dla szczebla.
 */
export function obsadaMeczu(s: StanGry, poziom: number, sedziaSur: number, opts: { cupPolski?: boolean; cupWoj?: boolean } = {}): NonNullable<Wynik["sedzia"]> {
  const styl = sedziaSur >= 1.15 ? "surowy" : sedziaSur <= 0.85 ? "łagodny" : "normalny";
  const uzyte = new Set<string>();
  // Obsadę centralną (realni) dostają mecze szczebla zawodowego (≤ II liga) oraz pary Pucharu Polski
  // z udziałem zespołu zawodowego; pary amatorskie Pucharu Polski prowadzą sędziowie delegowani przez ZPN.
  const centralny = poziom <= 3;

  if (centralny) {
    // pule centralne z kadry świata albo z realnych stałych (zgodność ze starymi zapisami)
    const kadEk = s.sedziowie?.ekstraklasa ?? tag(EKSTRAKLASA_GL, "Ekstraklasa (szczebel centralny)", "centralny");
    const kadAsy = s.sedziowie?.asystenci ?? tag(ASYSTENCI, "asystent (szczebel centralny)", "centralny");
    const kadVar = s.sedziowie?.var ?? tag(VAR_SEDZIOWIE, "VAR (szczebel centralny)", "centralny");
    const kadI = s.sedziowie?.iLiga ?? tag(ILIGA_GL, "I liga (szczebel centralny)", "centralny");
    const kadII = s.sedziowie?.iiLiga ?? tag(IILIGA_GL, "II liga (szczebel centralny)", "centralny");
    const glowniPula = opts.cupPolski || poziom === 1 ? kadEk
      : poziom === 2 ? (kadI.length ? [...kadI, ...kadEk] : kadEk)
      : (kadII.length ? [...kadII, ...kadI] : [...kadI, ...kadEk]);
    const kad = { ekstraklasa: kadEk, asystenci: kadAsy, var: kadVar, iLiga: kadI, iiLiga: kadII };
    const glowny = dobierz(glowniPula, uzyte);
    const asy = [dobierz(kad.asystenci, uzyte), dobierz(kad.asystenci, uzyte)].map((o) => fmt(o));
    const techn = fmt(dobierz(kad.asystenci, uzyte));
    const zVar = opts.cupPolski || poziom <= 2; // VAR: Ekstraklasa, I liga i Puchar Polski
    const zAvar = opts.cupPolski || poziom === 1;
    return {
      glowny: fmt(glowny), styl, asystenci: asy, techniczny: techn,
      var: zVar, varSedzia: zVar ? fmt(dobierz(kad.var, uzyte)) : undefined,
      avar: zAvar, avarSedzia: zAvar ? fmt(dobierz(kad.var, uzyte)) : undefined,
      klasa: opts.cupPolski ? "Puchar Polski (szczebel centralny)" : (glowny?.klasa ?? klasaSedziego(poziom, "centralny")),
      fifa: glowny?.fifa, real: true, region: "szczebel centralny",
    };
  }

  // Szczebel regionalny (III liga → klasa B, puchary wojewódzkie) — generowani sędziowie kolegium ZPN.
  const region = regionSwiata(s);
  const zpn = ZPN[region].mian;
  const klasa = klasaSedziego(poziom, region);
  const regionPula = s.sedziowie?.region ?? [];
  const rdzen = (k: string) => k.split(" (")[0]; // odporność na zmianę etykiety klasy (np. III liga) w starych zapisach
  const pula = regionPula.filter((o) => rdzen(o.klasa) === rdzen(klasa));
  const glowny = dobierz(pula, uzyte);
  // Liczba asystentów wg szczebla (nazwy ligi, nie numeru poziomu — klasa B bywa poziomem 8 albo 9): komplet 2,
  // a w klasach A/B/C czasem ZPN deleguje tylko sędziego głównego — wtedy chorągiewki trzymają asystenci społeczni
  // z klubów (dopisywani po meczu: engine/obsadaSedziowska.ts). Decyzja deterministyczna (spójna z meczem na żywo).
  const asystIle = tylkoSedziaGlowny(s, poziom) ? 0 : 2;
  const asy = Array.from({ length: asystIle }, () => fmt(dobierz(pula.length ? pula : regionPula, uzyte)));
  // Sędzia techniczny (4.) w III lidze oraz w meczach pucharowych od szczebla IV ligi wzwyż.
  const wPucharze = opts.cupWoj || opts.cupPolski;
  const maTech = poziom <= 4 || (wPucharze && poziom <= 5);
  const etykietaPuchar = opts.cupPolski
    ? `Puchar Polski (szczebel ${zpn}) — obsada ${klasa}`
    : opts.cupWoj
    ? `${ZPN[region].puchar} — obsada ${klasa}`
    : (glowny?.klasa ?? `${klasa}${klasaWgSzczebla(szczebelPoziomu(s, poziom), zpn).includes(zpn) ? "" : ` (${zpn})`}`);
  const klasaW = klasaWgSzczebla(szczebelPoziomu(s, poziom), zpn); // nazwa klasy wg ligi (nie numeru poziomu)
  return {
    glowny: fmt(glowny), styl, asystenci: asy,
    techniczny: maTech ? fmt(dobierz(pula.length ? pula : regionPula, uzyte)) : undefined,
    var: false, avar: false,
    klasa: etykietaPuchar.replace(klasa, klasaW),
    real: false, region: poziom === 4 && !opts.cupWoj && !opts.cupPolski ? "szczebel centralny (KS PZPN)" : zpn,
  };
}

// Pogoda meczowa — z wyraźnym akcentem nadmorskim (Pomorze). Wpływa na grę (mniej goli przy wietrze/deszczu/sztormie)
// i na frekwencję (w sztorm mniej kibiców). Miejscowości nad morzem łapią więcej wiatru i wichur znad Bałtyku.
import { los } from "./losuj";

// Miejscowości nad/przy Bałtyku (Pomorze + Zachodniopomorskie) — większa szansa na wiatr i sztorm.
const NADMORSKIE = [
  "Gdynia", "Gdańsk", "Sopot", "Rumia", "Reda", "Puck", "Władysławowo", "Hel", "Jastarnia", "Kosakowo",
  "Mrzezino", "Karwia", "Dębki", "Jastrzębia Góra", "Ustka", "Łeba", "Rowy", "Słupsk", "Lębork",
  "Wejherowo", "Świnoujście", "Kołobrzeg", "Koszalin", "Darłowo", "Stężyca", "Kartuzy",
  // Zachodniopomorskie — wybrzeże Bałtyku i Zalew Szczeciński (wiatr znad morza)
  "Międzyzdroje", "Dziwnów", "Kamień Pomorski", "Rewal", "Niechorze", "Trzebiatów", "Mrzeżyno",
  "Dźwirzyno", "Ustronie Morskie", "Sianów", "Mielno", "Sarbinowo", "Wolin", "Stepnica", "Police", "Nowe Warpno",
];

/** Czy miejscowość jest nadmorska / w pasie przymorskim (więcej wiatru znad Bałtyku). */
export function nadmorskie(miasto: string): boolean {
  return NADMORSKIE.some((m) => miasto.includes(m));
}

// Miejscowości górskie/podgórskie (Małopolska) — zimą śnieg i mróz.
const GORSKIE = [
  "Zakopane", "Nowy Targ", "Białka Tatrzańska", "Bukowina", "Poronin", "Muszyna", "Krynica", "Szczawnica",
  "Limanowa", "Maniowy", "Mszana Dolna", "Rabka", "Nowy Sącz", "Gorlice", "Andrychów", "Jordanów", "Sucha Beskidzka",
];
/** Czy miejscowość jest górska/podgórska (większa szansa śniegu i mrozu zimą). */
export function gorskie(miasto: string): boolean {
  return GORSKIE.some((m) => miasto.includes(m));
}

// Miejscowości w kotlinach / dolinach rzek (Małopolska) — jesienią gęste mgły radiacyjne.
const KOTLINY = [
  "Nowy Sącz", "Nowy Targ", "Jordanów", "Sucha Beskidzka", "Mszana Dolna", "Rabka", "Limanowa", "Maniowy",
  "Zakopane", "Szczawnica", "Muszyna", "Krynica", "Myślenice", "Dobczyce", "Wadowice", "Oświęcim", "Zator",
  "Tarnów", "Dębica", "Gorlice", "Bochnia", "Wieliczka",
];
/** Czy miejscowość leży w kotlinie/dolinie (większa szansa mgły jesienią). */
export function kotlina(miasto: string): boolean {
  return KOTLINY.some((m) => miasto.includes(m));
}

// Doliny rzek (Wisła/Brda/Drwęca/Noteć/Odra) i pojezierza — Kujawsko-Pomorskie + śródlądzie
// Zachodniopomorskiego. Jesienią gęste mgły radiacyjne nad wodą (jak w małopolskich kotlinach).
const DOLINY = [
  // Kujawsko-pomorskie — doliny rzek i pojezierza
  "Toruń", "Bydgoszcz", "Włocławek", "Grudziądz", "Chełmno", "Chełmża", "Świecie", "Nakło", "Brodnica",
  "Wąbrzeźno", "Golub-Dobrzyń", "Rypin", "Lipno", "Inowrocław", "Kruszwica", "Żnin", "Koronowo", "Solec Kujawski",
  // Zachodniopomorskie — śródlądzie (pojezierza, dolina Odry)
  "Szczecin", "Stargard", "Choszczno", "Wałcz", "Szczecinek", "Drawsko", "Barlinek", "Myślibórz", "Pyrzyce",
  "Dębno", "Ińsko", "Złocieniec", "Połczyn", "Świdwin",
];
/** Czy miejscowość leży w dolinie rzecznej / na pojezierzu (mgły jesienne — KP i śródlądzie ZP). */
export function dolina(miasto: string): boolean {
  return DOLINY.some((m) => miasto.includes(m));
}

export interface Pogoda {
  nazwa: string;
  ikona: string;
  gole: number; // mnożnik liczby goli (xG) — <1 = mniej goli
  frek: number; // mnożnik frekwencji — <1 = mniej kibiców
  atut: number; // mnożnik atutu własnego boiska — <1 = pogoda zrównuje szanse
}

type Kod = "slonce" | "pochmurno" | "wiatr" | "deszcz" | "sztorm" | "snieg" | "mroz" | "mgla" | "upal";

const POGODY: Record<Kod, Pogoda> = {
  upal:      { nazwa: "Upał",                  ikona: "🥵", gole: 0.92, frek: 0.97, atut: 0.97 }, // skwar: szybszy spadek sił, wolniejsza gra
  slonce:    { nazwa: "Słonecznie",            ikona: "☀️", gole: 1.0,  frek: 1.04, atut: 1.0 },
  pochmurno: { nazwa: "Pochmurno",             ikona: "☁️", gole: 1.0,  frek: 1.0,  atut: 1.0 },
  wiatr:     { nazwa: "Wietrznie",             ikona: "🌬️", gole: 0.94, frek: 0.97, atut: 0.98 },
  deszcz:    { nazwa: "Deszcz",                ikona: "🌧️", gole: 0.9,  frek: 0.85, atut: 0.97 },
  sztorm:    { nazwa: "Wichura znad morza",    ikona: "🌊", gole: 0.8,  frek: 0.7,  atut: 0.92 },
  snieg:     { nazwa: "Śnieżyca",              ikona: "❄️", gole: 0.8,  frek: 0.68, atut: 0.9 },
  mroz:      { nazwa: "Mróz",                  ikona: "🥶", gole: 0.9,  frek: 0.8,  atut: 0.95 },
  mgla:      { nazwa: "Gęsta mgła",            ikona: "🌫️", gole: 0.88, frek: 0.9,  atut: 0.88 }, // ograniczona widoczność: mniej goli, słabszy atut boiska
};

// Rozkład pogody: nadmorskie łapią znacznie więcej wiatru i wichur.
const WAGI_MORZE: [Kod, number][] = [["slonce", 16], ["pochmurno", 26], ["wiatr", 28], ["deszcz", 20], ["sztorm", 10]];
const WAGI_LAD:   [Kod, number][] = [["slonce", 30], ["pochmurno", 34], ["wiatr", 16], ["deszcz", 17], ["sztorm", 3]];
// Góry zimą (późna jesień / wczesna wiosna): sporo śniegu i mrozu, czasem mgła.
const WAGI_GORY:  [Kod, number][] = [["slonce", 12], ["pochmurno", 22], ["wiatr", 10], ["deszcz", 10], ["snieg", 26], ["mroz", 14], ["mgla", 6]];
// Kotliny jesienią: dużo mgły radiacyjnej (poranki/wieczory), mniej wiatru.
const WAGI_KOTLINA: [Kod, number][] = [["slonce", 14], ["pochmurno", 28], ["wiatr", 8], ["deszcz", 16], ["mgla", 34]];

/** Mnożnik „złej pogody" wg pory sezonu (z numeru kolejki): lato spokojnie, jesień/wczesna wiosna — wichury. */
function sezonowyMnoznik(kolejka?: number, liczba?: number): number {
  if (!kolejka || !liczba || liczba < 4) return 1;
  const frac = kolejka / liczba;
  if (frac < 0.2) return 0.55;   // start sezonu = lato (lipiec–sierpień) — sucho
  if (frac < 0.5) return 1.35;   // jesień (wrzesień–listopad) — najwięcej wiatru/deszczu/wichur
  if (frac < 0.62) return 1.2;   // wczesna wiosna (marzec) — jeszcze wietrznie
  return 1.0;                    // późna wiosna (kwiecień–maj)
}

/** Pogoda na mecz u siebie (wg miejscowości gospodarza i pory sezonu). Nadmorskie = więcej wiatru/sztormu. */
export function pogodaMeczu(miastoGospodarza: string, kolejka?: number, liczbaKolejek?: number): Pogoda {
  // Zimne okno (późna jesień / wczesna wiosna) w górach = śnieg i mróz.
  const frac = kolejka && liczbaKolejek && liczbaKolejek >= 4 ? kolejka / liczbaKolejek : 0.3;
  // Upał na starcie sezonu (lipiec–sierpień): częstszy w głębi lądu; wybrzeże chłodzi bryza znad Bałtyku.
  if (frac < 0.18 && !nadmorskie(miastoGospodarza) && los(0, 1) < (gorskie(miastoGospodarza) ? 0.2 : 0.32)) return POGODY.upal;
  const zimaGorska = gorskie(miastoGospodarza) && (frac >= 0.4 && frac <= 0.64);
  const mglaJesien = !zimaGorska && (kotlina(miastoGospodarza) || dolina(miastoGospodarza)) && (frac >= 0.2 && frac < 0.5); // jesień: kotliny (małop.) i doliny/pojezierza (KP + śródlądzie ZP)
  const baza = zimaGorska ? WAGI_GORY : mglaJesien ? WAGI_KOTLINA : nadmorskie(miastoGospodarza) ? WAGI_MORZE : WAGI_LAD;
  const m = sezonowyMnoznik(kolejka, liczbaKolejek);
  // Zła pogoda skalowana porą roku; słońce/pochmurno dopełniają.
  const wagi: [Kod, number][] = baza.map(([k, w]) => [k, (k === "wiatr" || k === "deszcz" || k === "sztorm" || k === "snieg" || k === "mroz" || k === "mgla") ? w * m : w]);
  const suma = wagi.reduce((a, [, w]) => a + w, 0);
  let r = los(0, suma);
  for (const [kod, w] of wagi) {
    if (r < w) return POGODY[kod];
    r -= w;
  }
  return POGODY.pochmurno;
}

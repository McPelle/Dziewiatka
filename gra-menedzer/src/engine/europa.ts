// Europejskie puchary — format OBOWIĄZUJĄCY OD SEZONU 2024/25 (reforma UEFA).
// LM = Liga Mistrzów, LE = Liga Europy, LK = Liga Konferencji Europy.
// Przebieg: eliminacje (dwumecze) → FAZA LIGOWA 36 drużyn (LM/LE 8 meczów, LK 6) → ranking 1–36:
//   1–8  → prosto do 1/8 finału,  9–24 → runda play-off fazy pucharowej (dwumecz),  25–36 → odpadają.
// Dalej 1/8 finału → ćwierćfinał → półfinał (dwumecze) → FINAŁ (jeden mecz, neutralny stadion).
// Silnik liczy mecze SIŁĄ klubu (realna klasa), nie pojedynczymi zawodnikami. Rywale: realne kluby z europa-kluby.ts.
import { EURO_NIZSZE, EURO_SREDNIE, EURO_TOP, type EuroKlub } from "../data/europa-kluby";
import { los, poisson, szansa, wybierz, zl } from "./losuj";
import { silaKlubu } from "./swiat";
import { obsadaMiedzynarodowa } from "../data/sedziowie";
import type { Europa, EuroRywal, MeczLigowy, StanGry } from "./types";

type TypEtapu = "kwal" | "liga" | "ko" | "final";
interface Etap { nazwa: string; typ: TypEtapu }

/** Pełna realna obsada międzynarodowa (komplet UEFA: główny + 2 asyst. + 4. + VAR + AVAR) do opisu meczu. */
function sedziaIntl(r: Europa["rozgrywki"]): string {
  const o = obsadaMiedzynarodowa({ nasz: "Polska", ranga: r });
  return `${o.glowny} · asyst.: ${o.asystenci.join(", ")}${o.techniczny ? ` · 4.: ${o.techniczny}` : ""}${o.varSedzia ? ` · VAR: ${o.varSedzia}` : ""}${o.avarSedzia ? ` · AVAR: ${o.avarSedzia}` : ""}`;
}

export const NAZWA_ROZGRYWEK: Record<Europa["rozgrywki"], string> = { LM: "Ligi Mistrzów", LE: "Ligi Europy", LK: "Ligi Konferencji" };
const NAZWA_ROZG: Record<Europa["rozgrywki"], string> = { LM: "Liga Mistrzów", LE: "Liga Europy", LK: "Liga Konferencji" };

/** Pełna sekwencja etapów danych rozgrywek (eliminacje → faza ligowa → faza pucharowa). */
function etapy(r: Europa["rozgrywki"]): Etap[] {
  const koniec: Etap[] = [
    { nazwa: "Runda play-off fazy pucharowej", typ: "ko" },
    { nazwa: "1/8 finału", typ: "ko" },
    { nazwa: "Ćwierćfinał", typ: "ko" },
    { nazwa: "Półfinał", typ: "ko" },
    { nazwa: "FINAŁ", typ: "final" },
  ];
  if (r === "LM")
    return [{ nazwa: "3. runda eliminacji", typ: "kwal" }, { nazwa: "Runda play-off eliminacji", typ: "kwal" }, { nazwa: "Faza ligowa", typ: "liga" }, ...koniec];
  if (r === "LE")
    return [{ nazwa: "Runda play-off eliminacji", typ: "kwal" }, { nazwa: "Faza ligowa", typ: "liga" }, ...koniec];
  return [{ nazwa: "2. runda eliminacji", typ: "kwal" }, { nazwa: "3. runda eliminacji", typ: "kwal" }, { nazwa: "Runda play-off eliminacji", typ: "kwal" }, { nazwa: "Faza ligowa", typ: "liga" }, ...koniec]; // LK
}

/** Lista nazw etapów do drabinki w UI. */
export function drabinkaEuropy(e: Europa): string[] { return etapy(e.rozgrywki).map((x) => x.nazwa); }

/** Liczba meczów fazy ligowej: LK = 6, pozostałe = 8. */
function meczeLigowe(r: Europa["rozgrywki"]): number { return r === "LK" ? 6 : 8; }

/** Pula realnych rywali wg rozgrywek i etapu — im dalej, tym mocniejsze kluby. */
function pulaRywali(r: Europa["rozgrywki"], runda: number): EuroKlub[] {
  if (r === "LM") return runda >= 4 ? EURO_TOP : runda >= 2 ? [...EURO_TOP, ...EURO_SREDNIE] : EURO_SREDNIE;
  if (r === "LE") return runda >= 4 ? [...EURO_TOP.slice(8), ...EURO_SREDNIE] : runda >= 2 ? EURO_SREDNIE : [...EURO_SREDNIE, ...EURO_NIZSZE];
  return runda >= 5 ? EURO_SREDNIE : EURO_NIZSZE; // LK
}
function silaRywala(k: EuroKlub): number { return k.sila + los(-3, 3); }
function daneRywala(k: EuroKlub): EuroRywal {
  return { nazwa: k.nazwa, kraj: k.kraj, miasto: k.miasto, stadion: k.stadion, pojemnosc: k.pojemnosc, zalozony: k.zalozony, kolor: k.kolor, kolor2: k.kolor2 };
}

/** Jeden mecz: moja siła (z atutem u siebie) vs siła rywala → bramki (Poisson). */
function graj(mojaSila: number, rSila: number, atut: number): [number, number, number] {
  const przewaga = (mojaSila + atut - rSila) / 9;
  const moje = Math.min(6, poisson(Math.max(0.3, 1.25 + przewaga)));
  const ich = Math.min(6, poisson(Math.max(0.3, 1.25 - przewaga)));
  return [moje, ich, przewaga];
}

/** Faza ligowa 36 drużyn: rozgrywam swoje mecze, liczę punkty i szacuję miejsce w tabeli. */
function symulujFazeLigowa(s: StanGry, e: Europa) {
  const n = meczeLigowe(e.rozgrywki);
  const pula = pulaRywali(e.rozgrywki, e.runda);
  const bazaSila = silaKlubu(s, s.mojKlub);
  const mecze: MeczLigowy[] = [];
  const uzyci = new Set<string>();
  let pkt = 0, z = 0, r = 0, p = 0;
  for (let i = 0; i < n; i++) {
    let k = wybierz(pula);
    let g = 0;
    while (uzyci.has(k.nazwa) && g++ < 25) k = wybierz(pula);
    uzyci.add(k.nazwa);
    const uSiebie = i % 2 === 0;
    const [moje, ich] = graj(bazaSila, silaRywala(k), uSiebie ? 2 : 0);
    if (moje > ich) { pkt += 3; z++; } else if (moje === ich) { pkt += 1; r++; } else p++;
    mecze.push({ przeciwnik: k.nazwa, wynik: `${moje}:${ich}`, uSiebie, dane: daneRywala(k), sedzia: sedziaIntl(e.rozgrywki) });
  }
  // Realne progi (przybliżenie tabeli 36 drużyn): top 8 bezpośrednio, 9–24 play-off, 25–36 odpadają.
  const max = n * 3;
  const progTop8 = e.rozgrywki === "LK" ? 13 : 16;
  const progPlay = e.rozgrywki === "LK" ? 7 : 11;
  let miejsce: number;
  if (pkt >= progTop8) miejsce = Math.max(1, Math.round(8 - ((pkt - progTop8) / Math.max(1, max - progTop8)) * 7));
  else if (pkt >= progPlay) miejsce = Math.round(24 - ((pkt - progPlay) / Math.max(1, progTop8 - 1 - progPlay)) * 15);
  else miejsce = Math.round(36 - (pkt / Math.max(1, progPlay - 1)) * 11);
  miejsce = Math.min(36, Math.max(1, miejsce));
  return { pkt, z, r, p, miejsce, mecze, top8: pkt >= progTop8, playoff: pkt >= progPlay && pkt < progTop8 };
}

/** Dwumecz (u siebie + wyjazd) na agregat; remis → karne. */
function symulujDwumecz(s: StanGry, k: EuroKlub): { wynik: string; awans: boolean } {
  const baza = silaKlubu(s, s.mojKlub);
  const rS = silaRywala(k);
  const [d1, g1] = graj(baza, rS, 2); // u siebie
  const [d2, g2, przewaga] = graj(baza, rS, 0); // wyjazd
  let agMoje = d1 + d2, agIch = g1 + g2;
  let karne = false;
  if (agMoje === agIch) { karne = true; if (szansa(0.5 + przewaga * 0.06)) agMoje++; else agIch++; }
  return { wynik: `${d1}:${g1}, ${d2}:${g2} → ${agMoje}:${agIch}${karne ? " k." : ""}`, awans: agMoje > agIch };
}

/** Finał: jeden mecz na neutralnym stadionie; remis → karne. */
function symulujFinal(s: StanGry, k: EuroKlub): { wynik: string; awans: boolean } {
  const [moje0, ich0, przewaga] = graj(silaKlubu(s, s.mojKlub), silaRywala(k), 0);
  let moje = moje0, ich = ich0, karne = false;
  if (moje === ich) { karne = true; if (szansa(0.5 + przewaga * 0.06)) moje++; else ich++; }
  return { wynik: `${moje}:${ich}${karne ? " (k.)" : ""}`, awans: moje > ich };
}

// Premie (zł) — rosną z fazą, LM płaci najwięcej.
function nagrodaEtapu(r: Europa["rozgrywki"], etap: Etap, pkt: number): number {
  const mn = r === "LM" ? 1 : r === "LE" ? 0.45 : 0.25;
  let baza: number;
  if (etap.typ === "kwal") baza = 3_000_000;
  else if (etap.typ === "liga") baza = 18_000_000 + pkt * 1_200_000;
  else if (etap.typ === "final") baza = 55_000_000;
  else baza = etap.nazwa === "Runda play-off fazy pucharowej" ? 12_000_000 : etap.nazwa === "1/8 finału" ? 16_000_000 : etap.nazwa === "Ćwierćfinał" ? 24_000_000 : 38_000_000;
  return Math.round((baza * mn) / 100_000) * 100_000;
}

/** Kwalifikacja europejska wg miejsca w Ekstraklasie i zdobycia Pucharu Polski (dostęp zbliżony do realnego dla Polski). */
export function kwalifikacjaEuropejska(poziom: number, miejsce: number, zdobywcaPP: boolean): Europa["rozgrywki"] | null {
  if (poziom !== 1) return null; // tylko Ekstraklasa gra w europejskich pucharach
  if (miejsce === 1) return "LM"; // mistrz → eliminacje Ligi Mistrzów
  if (zdobywcaPP) return "LE"; // zdobywca Pucharu Polski → Liga Europy
  if (miejsce === 2) return "LK"; // wicemistrz → eliminacje Ligi Konferencji
  if (miejsce === 3) return "LK";
  return null;
}

/** Tworzy europejską kampanię na nowy sezon (rozkłada etapy na kolejki). */
export function nowaEuropa(s: StanGry, rozgrywki: Europa["rozgrywki"]): Europa {
  const et = etapy(rozgrywki);
  const kolejek = s.ligi[0].terminarz.length;
  const krok = Math.max(2, Math.floor((kolejek - 2) / et.length));
  const harmonogram: number[] = [];
  for (let i = 0; i < et.length; i++) harmonogram.push(2 + i * krok);
  return { rozgrywki, faza: "w_toku", runda: 0, przeciwnik: null, nazwaRundy: et[0].nazwa, harmonogram, sciezka: [] };
}

/** Czy na tę kolejkę przypada etap europejski. */
export function europaNaKolejke(s: StanGry): boolean {
  const e = s.europa;
  return !!e && e.faza === "w_toku" && e.runda < etapy(e.rozgrywki).length && e.harmonogram.includes(s.kolejka);
}

export function rundaEuropy(s: StanGry): { rozegrano: boolean; wynik?: string } {
  const e = s.europa;
  if (!e || e.faza !== "w_toku") return { rozegrano: false };
  const et = etapy(e.rozgrywki);
  if (e.runda >= et.length) return { rozegrano: false };
  const etap = et[e.runda];
  const nazwaR = NAZWA_ROZG[e.rozgrywki];
  if (!e.sciezka) e.sciezka = [];

  // ——— FAZA LIGOWA (36 drużyn) ———
  if (etap.typ === "liga") {
    const w = symulujFazeLigowa(s, e);
    e.fazaLigowa = w.mecze;
    e.pktLigowe = w.pkt;
    e.miejsceLigowe = w.miejsce;
    const nagroda = nagrodaEtapu(e.rozgrywki, etap, w.pkt);
    s.kluby[s.mojKlub].kasa += nagroda;
    s.kluby[s.mojKlub].renoma = Math.min(1, s.kluby[s.mojKlub].renoma + 0.02);
    const bilans = `${w.z}Z ${w.r}R ${w.p}P · ${w.pkt} pkt · ${w.miejsce}. miejsce`;
    if (w.top8) {
      e.sciezka.push({ nazwa: "Faza ligowa", przeciwnik: "36 drużyn", wynik: `${bilans} → 1/8`, awans: true, uSiebie: true });
      e.sciezka.push({ nazwa: "Runda play-off fazy pucharowej", przeciwnik: "—", wynik: "awans bezpośredni (top 8)", awans: true, uSiebie: false });
      wiadomosc(s, `${nazwaR}: faza ligowa zakończona — ${bilans}. Top 8 → prosto do 1/8 finału! Premia ${zl(nagroda)}.`);
      s.zarzad = Math.min(100, s.zarzad + 6);
      e.runda += 2; // pomiń rundę play-off fazy pucharowej
    } else if (w.playoff) {
      e.sciezka.push({ nazwa: "Faza ligowa", przeciwnik: "36 drużyn", wynik: `${bilans} → play-off`, awans: true, uSiebie: true });
      wiadomosc(s, `${nazwaR}: faza ligowa — ${bilans}. Gracie rundę play-off fazy pucharowej. Premia ${zl(nagroda)}.`);
      s.zarzad = Math.min(100, s.zarzad + 3);
      e.runda += 1;
    } else {
      e.sciezka.push({ nazwa: "Faza ligowa", przeciwnik: "36 drużyn", wynik: `${bilans} — odpadacie`, awans: false, uSiebie: true });
      e.faza = "odpadl";
      wiadomosc(s, `${nazwaR}: faza ligowa zakończona — ${bilans}. Koniec w tym sezonie (miejsca 25–36 odpadają). Premia ${zl(nagroda)}.`);
      return { rozegrano: true, wynik: `${w.miejsce}. miejsce` };
    }
    e.nazwaRundy = et[Math.min(e.runda, et.length - 1)].nazwa;
    return { rozegrano: true, wynik: `${w.miejsce}. miejsce` };
  }

  // ——— MECZ(E) Z JEDNYM RYWALEM (eliminacje / faza pucharowa / finał) ———
  const klubR = wybierz(pulaRywali(e.rozgrywki, e.runda));
  const dane = daneRywala(klubR);
  e.przeciwnik = klubR.nazwa;
  e.przeciwnikDane = dane;
  const finalowy = etap.typ === "final";
  const mecz = finalowy ? symulujFinal(s, klubR) : symulujDwumecz(s, klubR);
  const nagroda = nagrodaEtapu(e.rozgrywki, etap, 0);
  s.kluby[s.mojKlub].kasa += nagroda;
  s.kluby[s.mojKlub].renoma = Math.min(1, s.kluby[s.mojKlub].renoma + 0.01);
  e.sciezka.push({ nazwa: etap.nazwa, przeciwnik: klubR.nazwa, wynik: mecz.wynik, awans: mecz.awans, uSiebie: !finalowy, dane, sedzia: sedziaIntl(e.rozgrywki) });

  if (finalowy && mecz.awans) {
    e.faza = "zdobyty";
    s.kluby[s.mojKlub].kasa += nagroda; // premia za triumf
    s.kluby[s.mojKlub].renoma = Math.min(1, s.kluby[s.mojKlub].renoma + 0.1);
    s.zarzad = Math.min(100, s.zarzad + 25);
    wiadomosc(s, `🏆🌍 ZDOBYLIŚCIE ${NAZWA_ROZGRYWEK[e.rozgrywki].toUpperCase()}! Finał z ${klubR.nazwa} wygrany ${mecz.wynik} — historyczny triumf i ${zl(nagroda)} premii!`);
    s.historia.push({ sezon: s.sezon, liga: NAZWA_ROZG[e.rozgrywki], miejsce: 1, wynik: "mistrz" });
    return { rozegrano: true, wynik: mecz.wynik };
  }
  if (!mecz.awans) {
    e.faza = "odpadl";
    const gdzie = finalowy ? `Przegraliście FINAŁ z ${klubR.nazwa} (${mecz.wynik})` : `Odpadliście z ${klubR.nazwa} (${mecz.wynik}) — ${etap.nazwa}`;
    wiadomosc(s, `${nazwaR}: ${gdzie}. Premia ${zl(nagroda)}.`);
    return { rozegrano: true, wynik: mecz.wynik };
  }
  s.zarzad = Math.min(100, s.zarzad + 3);
  wiadomosc(s, `${nazwaR}: ${etap.nazwa} — ${mecz.wynik} z ${klubR.nazwa}, awans dalej! Premia ${zl(nagroda)}.`);
  e.runda += 1;
  e.nazwaRundy = et[Math.min(e.runda, et.length - 1)].nazwa;
  return { rozegrano: true, wynik: mecz.wynik };
}

function wiadomosc(s: StanGry, tekst: string) {
  s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst });
  s.wiadomosci = s.wiadomosci.slice(0, 60);
}

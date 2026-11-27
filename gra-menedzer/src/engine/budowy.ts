// Budowy jako projekty: przetarg (fikcyjne firmy budowlane), czas budowy w dniach, zaliczka i rozliczenie,
// opóźnienia, aneksy, usterki oraz utrudnienia dla kibiców w trakcie prac (zamknięte sektory, mniejsza frekwencja).
import { losInt, szansa, wybierz, zl } from "./losuj";
import { kosztObiektu, OBIEKTY_NAZWY, poziomObiektu, MAX_POZIOM_OBIEKTU, wariantyRozbudowy, wymogObiektu } from "./sezon";
import type { Obiekty, StanGry } from "./types";
type TypObiektu = keyof Obiekty;

export type CelBudowy = { rodzaj: "stadion"; wariant: number } | { rodzaj: "obiekt"; typ: TypObiektu };
export interface Firma { id: string; nazwa: string; opis: string; cena: number; tempo: number; rzetelnosc: number; jakosc: number; tylko?: TypObiektu[] | "male" | "duze"; spec?: (TypObiektu | "stadion")[] }
export interface OfertaPrzetargu { firmaId: string; koszt: number; dni: number; gwarancja: number }
export interface Przetarg { cel: CelBudowy; nazwa: string; oferty: OfertaPrzetargu[]; waznyDo: number }
export interface Budowa {
  id: string; cel: CelBudowy; nazwa: string; firmaId: string; koszt: number; zaplacono: number;
  dniRazem: number; dniMinelo: number; opoznienie: number; ograniczenie: number; frekKara: number; zdarzenia: string[];
  miejsca?: number; // przy rozbudowie stadionu — ile miejsc przybędzie (do rysunku)
}

/** Fikcyjne firmy budowlane (nazwy zmyślone — nie odnoszą się do prawdziwych przedsiębiorstw). */
export const FIRMY: Firma[] = [
  { id: "tanibud", nazwa: "Tani-Bud Zbyszko", opis: "najtańsza oferta, ale terminy i jakość bywają różne", cena: 0.74, tempo: 1.3, rzetelnosc: 0.55, jakosc: 0.55 },
  { id: "kowalczyk", nazwa: "Kowalczyk i Synowie", opis: "lokalna firma rodzinna, rozsądna cena", cena: 0.9, tempo: 1.1, rzetelnosc: 0.75, jakosc: 0.75 },
  { id: "gpk", nazwa: "Gminne Przedsiębiorstwo Komunalne", opis: "tanio, wolno — tylko małe obiekty", cena: 0.82, tempo: 1.45, rzetelnosc: 0.8, jakosc: 0.65, tylko: "male" },
  { id: "murpol", nazwa: "Mur-Pol Budownictwo", opis: "solidny średniak — cena i termin bez niespodzianek", cena: 1, tempo: 1, rzetelnosc: 0.86, jakosc: 0.82 },
  { id: "ekogrunt", nazwa: "Eko-Grunt Drogi i Place", opis: "specjalista od parkingów, placów i bram", cena: 0.92, tempo: 0.85, rzetelnosc: 0.85, jakosc: 0.82, spec: ["parking", "kasy", "strefaKibica"] },
  { id: "staltech", nazwa: "Stal-Tech Inżynieria", opis: "konstrukcje stalowe: trybuny, dachy, telebimy", cena: 1.15, tempo: 0.85, rzetelnosc: 0.9, jakosc: 0.9, spec: ["stadion", "zadaszenie", "telebim", "loze"] },
  { id: "hotelarz", nazwa: "Hotelarz Development", opis: "kubatura: hotele, muzea, bazy treningowe", cena: 1.1, tempo: 0.9, rzetelnosc: 0.88, jakosc: 0.9, spec: ["hotel", "muzeum", "baza", "sklep", "gastronomia"] },
  { id: "arena", nazwa: "Arena Konstrukcje S.A.", opis: "największy wykonawca — szybko i porządnie, ale drogo", cena: 1.38, tempo: 0.68, rzetelnosc: 0.96, jakosc: 0.96, tylko: "duze" },
];
const MALE: TypObiektu[] = ["toalety", "kasy", "parking", "gastronomia", "sklep"];

/** Bazowy czas budowy (dni). */
const DNI_OBIEKTU: Record<TypObiektu, number> = {
  toalety: 14, kasy: 16, parking: 24, gastronomia: 20, sklep: 22, strefaKibica: 28, loze: 45, telebim: 24,
  zadaszenie: 80, muzeum: 60, hotel: 150, baza: 90,
};
const DNI_STADIONU = [24, 50, 100];
/** Utrudnienia w trakcie prac: część miejsc wyłączona + mniej chętnych (hałas, objazdy, kolejki). */
function utrudnienia(c: CelBudowy): { ograniczenie: number; frekKara: number } {
  if (c.rodzaj === "stadion") return { ograniczenie: [0.06, 0.15, 0.25][c.wariant] ?? 0.15, frekKara: 0.05 };
  const t = c.typ;
  return {
    ograniczenie: t === "zadaszenie" ? 0.12 : t === "loze" ? 0.05 : t === "telebim" ? 0.03 : 0,
    frekKara: t === "parking" ? 0.07 : t === "kasy" ? 0.06 : t === "toalety" ? 0.04 : t === "strefaKibica" || t === "gastronomia" ? 0.03 : 0.015,
  };
}
export function opisUtrudnien(c: CelBudowy): string {
  const u = utrudnienia(c);
  const t: string[] = [];
  if (u.ograniczenie > 0) t.push(`${Math.round(u.ograniczenie * 100)}% miejsc wyłączonych`);
  if (u.frekKara > 0) t.push(`−${Math.round(u.frekKara * 100)}% frekwencji (${c.rodzaj === "obiekt" && c.typ === "parking" ? "brak miejsc parkingowych" : c.rodzaj === "obiekt" && c.typ === "kasy" ? "kolejki do wejścia" : "hałas, objazdy, plac budowy"})`);
  return t.join(", ") || "praktycznie bez utrudnień";
}
const wiad = (s: StanGry, t: string) => { s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: t }); s.wiadomosci = s.wiadomosci.slice(0, 60); };
export const dzienBud = (s: StanGry) => s.licznikDni ?? 0;
export function nazwaCelu(s: StanGry, c: CelBudowy): string {
  if (c.rodzaj === "stadion") return wariantyRozbudowy(s)[c.wariant]?.nazwa ?? "Rozbudowa stadionu";
  const poz = poziomObiektu(s.kluby[s.mojKlub], c.typ);
  return `${OBIEKTY_NAZWY[c.typ]} — ${poz ? `poziom ${poz + 1}` : "budowa"}`;
}
const takiSam = (a: CelBudowy, b: CelBudowy) => a.rodzaj === b.rodzaj && (a.rodzaj === "stadion" || (b.rodzaj === "obiekt" && a.typ === b.typ));
export const budowyKlubu = (s: StanGry) => s.budowy ?? [];
export function trwaBudowa(s: StanGry, c: CelBudowy): Budowa | undefined {
  return budowyKlubu(s).find((b) => (c.rodzaj === "stadion" ? b.cel.rodzaj === "stadion" : takiSam(b.cel, c)));
}

/** Ogłoś przetarg — firmy składają oferty (cena, czas, gwarancja). */
export function oglosPrzetarg(s: StanGry, c: CelBudowy): string | null {
  const k = s.kluby[s.mojKlub];
  if (trwaBudowa(s, c)) return c.rodzaj === "stadion" ? "Na stadionie trwa już budowa — poczekaj na jej koniec." : "Ten obiekt jest już w budowie.";
  if (budowyKlubu(s).length >= 3) return "Prowadzisz już 3 budowy naraz — więcej nie udźwigniesz organizacyjnie.";
  let bazaKoszt: number, bazaDni: number;
  if (c.rodzaj === "stadion") {
    const w = wariantyRozbudowy(s)[c.wariant]; if (!w) return "Nieznany wariant.";
    bazaKoszt = w.koszt; bazaDni = DNI_STADIONU[c.wariant] + Math.round(Math.sqrt(k.pojemnosc) * 0.15);
  } else {
    if (poziomObiektu(k, c.typ) >= MAX_POZIOM_OBIEKTU) return "Osiągnięto maksymalny poziom.";
    const wym = wymogObiektu(k, c.typ); if (wym) return `Nie można budować: ${wym}.`;
    bazaKoszt = kosztObiektu(s, c.typ); bazaDni = Math.round(DNI_OBIEKTU[c.typ] * (1 + poziomObiektu(k, c.typ) * 0.12));
  }
  const typ = c.rodzaj === "stadion" ? "stadion" : c.typ;
  const duza = bazaKoszt >= 150000 || c.rodzaj === "stadion" && c.wariant === 2 || k.poziom <= 4;
  const pasuja = FIRMY.filter((f) => {
    if (f.tylko === "male") return c.rodzaj === "obiekt" && MALE.includes(c.typ) && k.poziom >= 4;
    if (f.tylko === "duze") return duza;
    return true;
  });
  const spec = pasuja.filter((f) => f.spec?.includes(typ));
  const ogolne = pasuja.filter((f) => !f.spec);
  const wybrane = new Set<Firma>(spec);
  while (wybrane.size < Math.min(4, spec.length + ogolne.length)) wybrane.add(wybierz(ogolne)!);
  const oferty = [...wybrane].map((f) => {
    const sp = f.spec?.includes(typ) ? 0.93 : 1;
    return {
      firmaId: f.id,
      koszt: Math.round(bazaKoszt * f.cena * sp * (0.95 + Math.random() * 0.12) / 100) * 100,
      dni: Math.max(5, Math.round(bazaDni * f.tempo * (sp < 1 ? 0.9 : 1) * (0.92 + Math.random() * 0.16))),
      gwarancja: f.jakosc >= 0.9 ? 5 : f.jakosc >= 0.75 ? 3 : 1,
    };
  }).sort((a, b) => a.koszt - b.koszt);
  s.przetarg = { cel: c, nazwa: nazwaCelu(s, c), oferty, waznyDo: dzienBud(s) + 14 };
  return null;
}
export const firma = (id: string) => FIRMY.find((f) => f.id === id)!;

/** Wybór oferty z przetargu: podpisanie umowy, zaliczka 30%, start robót. */
export function wybierzOferte(s: StanGry, i: number): string | null {
  const p = s.przetarg; if (!p) return "Brak przetargu.";
  const o = p.oferty[i]; if (!o) return "Brak oferty.";
  const k = s.kluby[s.mojKlub];
  if (k.kasa < o.koszt) return `Na podpisanie umowy potrzebujesz pełnego pokrycia: brakuje ${zl(o.koszt - k.kasa)}.`;
  const zaliczka = Math.round(o.koszt * 0.3 / 100) * 100;
  k.kasa -= zaliczka;
  const u = utrudnienia(p.cel);
  (s.budowy ??= []).push({ id: `b${dzienBud(s)}${losInt(0, 9999)}`, cel: p.cel, nazwa: p.nazwa, firmaId: o.firmaId, koszt: o.koszt, zaplacono: zaliczka, dniRazem: o.dni, dniMinelo: 0, opoznienie: 0, ograniczenie: u.ograniczenie, frekKara: u.frekKara, zdarzenia: [], miejsca: p.cel.rodzaj === "stadion" ? wariantyRozbudowy(s)[p.cel.wariant]?.miejsca : undefined });
  wiad(s, `🏗 Umowa podpisana: ${p.nazwa} — wykonawca ${firma(o.firmaId).nazwa}, ${o.dni} dni, ${zl(o.koszt)} (zaliczka 30%: ${zl(zaliczka)}). Utrudnienia: ${opisUtrudnien(p.cel)}.`);
  s.przetarg = undefined;
  return null;
}
export function anulujPrzetarg(s: StanGry) { s.przetarg = undefined; }

const POWODY_OPOZNIEN = [
  "ulewy — plac budowy pod wodą", "brak stali w hurtowni", "awaria dźwigu", "kontrola nadzoru budowlanego wstrzymała prace",
  "przy wykopach znaleziono niewybuch — saperzy na miejscu", "podwykonawca zszedł z budowy", "spóźniona dostawa prefabrykatów",
  "mróz — beton nie może wiązać", "archeolodzy badają znalezisko w wykopie", "brak pozwolenia na przyłącze energetyczne",
];

/** Postęp budów — jeden dzień (z kalendarza). */
export function postepBudow(s: StanGry) {
  const k = s.kluby[s.mojKlub]; if (!k) return;
  for (const b of [...budowyKlubu(s)]) {
    const f = firma(b.firmaId);
    b.dniMinelo++;
    if (szansa((1 - f.rzetelnosc) * 0.035)) {
      const ile = losInt(3, 12); b.opoznienie += ile;
      const t = `⏳ ${wybierz(POWODY_OPOZNIEN)} (+${ile} dni)`; b.zdarzenia.push(t);
      wiad(s, `🏗 ${b.nazwa}: ${t}. Nowy termin: ${b.dniRazem + b.opoznienie - b.dniMinelo} dni.`);
    }
    if (szansa((1 - f.rzetelnosc) * 0.004)) {
      const ile = Math.round(b.koszt * (0.04 + Math.random() * 0.06) / 100) * 100; b.koszt += ile;
      b.zdarzenia.push(`📄 aneks: +${zl(ile)}`);
      wiad(s, `📄 ${f.nazwa} wymusza aneks do umowy (${b.nazwa}): +${zl(ile)} — wzrost cen materiałów.`);
    }
    if (b.dniMinelo >= b.dniRazem + b.opoznienie) zakonczBudowe(s, b);
  }
}
function zakonczBudowe(s: StanGry, b: Budowa) {
  const k = s.kluby[s.mojKlub]; const f = firma(b.firmaId);
  const reszta = b.koszt - b.zaplacono; k.kasa -= reszta;
  const usterki = !szansa(f.jakosc);
  if (b.cel.rodzaj === "stadion") {
    const w = wariantyRozbudowy(s)[b.cel.wariant];
    k.pojemnosc += w.miejsca;
    k.renoma = Math.min(1, k.renoma + (b.cel.wariant === 2 ? 0.015 : 0.008) * (usterki ? 0.5 : 1));
    wiad(s, `🏟 Oddano do użytku: ${b.nazwa} (+${w.miejsca.toLocaleString("pl")} miejsc, teraz ${k.pojemnosc.toLocaleString("pl")}). Rozliczenie z ${f.nazwa}: ${zl(reszta)}.`);
  } else {
    const t = b.cel.typ;
    k.obiekty[t] = poziomObiektu(k, t) + 1;
    k.renoma = Math.min(1, k.renoma + (t === "muzeum" || t === "zadaszenie" ? 0.01 : 0.005) * (usterki ? 0.5 : 1));
    wiad(s, `🏗 Oddano do użytku: ${b.nazwa}. Rozliczenie z ${f.nazwa}: ${zl(reszta)}.`);
  }
  if (usterki) {
    const nap = Math.round(b.koszt * 0.05 / 100) * 100; k.kasa -= nap;
    wiad(s, `🔧 Odbiór z usterkami (${f.nazwa}): poprawki kosztowały ${zl(nap)}, kibice narzekają na wykończenie.`);
  }
  if (b.opoznienie > 0 && f.rzetelnosc < 0.9) {
    const kara = Math.round(b.koszt * Math.min(0.1, b.opoznienie * 0.003) / 100) * 100;
    if (kara > 0) { k.kasa += kara; wiad(s, `⚖️ Kara umowna od ${f.nazwa} za ${b.opoznienie} dni opóźnienia: +${zl(kara)}.`); }
  }
  s.budowy = budowyKlubu(s).filter((x) => x.id !== b.id);
}
/** Łączne utrudnienia na stadionie w dniu meczu (dla Twojego klubu). */
export function utrudnieniaMeczu(s: StanGry): { ograniczenie: number; frekKara: number } {
  let o = 0, f = 0;
  for (const b of budowyKlubu(s)) { o += b.ograniczenie; f += b.frekKara; }
  return { ograniczenie: Math.min(0.4, o), frekKara: Math.min(0.2, f) };
}

// Karty kolekcjonerskie zawodników (w stylu kart „Ultimate Team"): kolor/ranga wg overall (brąz/srebro/złoto)
// oraz karty specjalne zdobywane w trakcie kariery: Zawodnik Kolejki, Zawodnik Miesiąca, Legenda, Wychowanek, Debiutant.
// Karty specjalne są „zamrożonym" zdjęciem zawodnika z chwili wyróżnienia (overall, atrybuty, klub, numer).
//
// Stan trzymany w polu StanGry.kartyKolekcja (pole opcjonalne — do dodania w types.ts; tu lokalny typ + rzutowanie).
import type { Atrybuty, Pozycja, PozycjaSzczegolowa, StanGry, Zawodnik } from "./types";

export type RangaKarty = "braz" | "srebro" | "zloto";
export type TypKartySpecjalnej = "kolejki" | "miesiaca" | "legenda" | "wychowanek" | "debiutant";

/** Jedna zdobyta karta specjalna (snapshot zawodnika). */
export interface KartaSpecjalna {
  klucz: string; // unikalny klucz (typ-id-sezon-kolejka) — bez duplikatów
  typ: TypKartySpecjalnej;
  zawodnikId: string;
  sezon: number;
  kolejka: number; // 1-indeksowana
  imie: string;
  nazwisko: string;
  poz: Pozycja;
  pozS?: PozycjaSzczegolowa;
  umiej: number; // overall w chwili zdobycia (+ ewentualny bonus karty specjalnej)
  numer: number;
  klubId: string;
  klubNazwa: string;
  kraj?: string;
  atrybuty?: Atrybuty;
  opis: string; // np. „Kolejka 7: ocena 8.6", „300 meczów w karierze"
}

/** Stan kolekcji — pole StanGry.kartyKolekcja. */
export interface StanKart {
  karty: KartaSpecjalna[];
  /** Zawodnicy, którzy już dostali jednorazową kartę danego typu (legenda / wychowanek / debiutant). */
  jednorazowe: Record<string, TypKartySpecjalnej[]>;
  /** Ostatnio przetworzona kolejka (sezon*100+kolejka) — chroni przed podwójnym wywołaniem w tej samej kolejce. */
  ostatnio?: number;
}

type StanZKartami = StanGry & { kartyKolekcja?: StanKart };

export function stanKart(s: StanGry): StanKart {
  const x = s as StanZKartami;
  if (!x.kartyKolekcja) x.kartyKolekcja = { karty: [], jednorazowe: {} };
  x.kartyKolekcja.karty ??= [];
  x.kartyKolekcja.jednorazowe ??= {};
  return x.kartyKolekcja;
}
/** Karty specjalne bez tworzenia stanu (do UI). */
export function kartySpecjalne(s: StanGry): KartaSpecjalna[] {
  return (s as StanZKartami).kartyKolekcja?.karty ?? [];
}

// ——— Ranga i wygląd ———

/** Ranga karty wg overall (skala gry: Ekstraklasa ~60–80, B-klasa ~14–28). */
export function rangaKarty(umiej: number): RangaKarty {
  if (umiej >= 65) return "zloto";
  if (umiej >= 45) return "srebro";
  return "braz";
}
/** „Rzadka" (błyszcząca) wersja: górna część przedziału rangi. */
export function rzadkaKarta(umiej: number): boolean {
  return umiej >= 75 || (umiej >= 58 && umiej < 65) || (umiej >= 38 && umiej < 45);
}

export const NAZWA_RANGI: Record<RangaKarty, string> = { braz: "Brązowa", srebro: "Srebrna", zloto: "Złota" };

export const INFO_SPECJALNEJ: Record<TypKartySpecjalnej, { nazwa: string; ikona: string; skrot: string; bonus: number }> = {
  kolejki: { nazwa: "Zawodnik Kolejki", ikona: "⭐", skrot: "ZK", bonus: 1 },
  miesiaca: { nazwa: "Zawodnik Miesiąca", ikona: "🏅", skrot: "ZM", bonus: 2 },
  legenda: { nazwa: "Legenda", ikona: "👑", skrot: "LEG", bonus: 3 },
  wychowanek: { nazwa: "Wychowanek", ikona: "🌱", skrot: "WYCH", bonus: 0 },
  debiutant: { nazwa: "Debiutant", ikona: "🆕", skrot: "DEB", bonus: 0 },
};

/** Kolory karty: [tło górne, tło dolne, ramka, tekst, akcent]. */
export function koloryKarty(umiej: number, typ?: TypKartySpecjalnej): { gora: string; dol: string; ramka: string; tekst: string; akcent: string } {
  if (typ === "kolejki") return { gora: "#1b1b1f", dol: "#3a3a42", ramka: "#e8c45a", tekst: "#f6e7b0", akcent: "#e8c45a" }; // „czarna" TOTW
  if (typ === "miesiaca") return { gora: "#1a3a8f", dol: "#5b2a9e", ramka: "#7fd6ff", tekst: "#ffffff", akcent: "#7fd6ff" };
  if (typ === "legenda") return { gora: "#f7f1de", dol: "#d9c487", ramka: "#b8902e", tekst: "#3b2a0a", akcent: "#8a6512" }; // ikona
  if (typ === "wychowanek") return { gora: "#0f5a32", dol: "#3fae5a", ramka: "#b6f2a4", tekst: "#f1fff0", akcent: "#d7ff8a" };
  if (typ === "debiutant") return { gora: "#0f6f7a", dol: "#33b5c4", ramka: "#d7fbff", tekst: "#f2feff", akcent: "#fff27a" };
  const r = rangaKarty(umiej);
  const rz = rzadkaKarta(umiej);
  if (r === "zloto") return rz
    ? { gora: "#fbe38a", dol: "#c99a22", ramka: "#fff4c2", tekst: "#3a2a00", akcent: "#5a3e00" }
    : { gora: "#ecd07a", dol: "#b88f2c", ramka: "#f5e3a3", tekst: "#3a2a00", akcent: "#5a3e00" };
  if (r === "srebro") return rz
    ? { gora: "#f1f4f7", dol: "#9aa6b2", ramka: "#ffffff", tekst: "#1f2830", akcent: "#33404c" }
    : { gora: "#d9dee3", dol: "#8f99a3", ramka: "#eef1f4", tekst: "#1f2830", akcent: "#33404c" };
  return rz
    ? { gora: "#e8b285", dol: "#9b5b2c", ramka: "#f6d2b0", tekst: "#2e1607", akcent: "#4a2610" }
    : { gora: "#d09a6e", dol: "#8a5128", ramka: "#e6bb94", tekst: "#2e1607", akcent: "#4a2610" };
}

/** 6 skrótów atrybutów karty (jak TEM/STR/POD/DRY/OBR/FIZ) — wartości 1–99. */
export function szescAtrybutow(z: { poz: Pozycja; umiej: number; atrybuty?: Atrybuty }): { skrot: string; wartosc: number }[] {
  const a = z.atrybuty;
  const v = (x: number | undefined) => Math.max(1, Math.min(99, Math.round(x ?? z.umiej)));
  if (z.poz === "BR") {
    return [
      { skrot: "PAR", wartosc: v(a?.br) }, // parady
      { skrot: "UST", wartosc: v(a?.czy) }, // ustawianie się
      { skrot: "WYK", wartosc: v(a?.pod) }, // wykop / rozegranie
      { skrot: "REF", wartosc: v(a ? (a.br * 0.7 + a.szy * 0.3) : undefined) }, // refleks
      { skrot: "SZY", wartosc: v(a?.szy) },
      { skrot: "FIZ", wartosc: v(a?.fiz) },
    ];
  }
  return [
    { skrot: "TEM", wartosc: v(a?.szy) },
    { skrot: "STR", wartosc: v(a?.str) },
    { skrot: "POD", wartosc: v(a?.pod) },
    { skrot: "DRY", wartosc: v(a?.dry) },
    { skrot: "OBR", wartosc: v(a?.obr) },
    { skrot: "FIZ", wartosc: v(a?.fiz) },
  ];
}

// ——— Zdobywanie kart specjalnych ———

function snapshot(s: StanGry, z: Zawodnik, typ: TypKartySpecjalnej, opis: string, kolejka: number): KartaSpecjalna {
  const bonus = INFO_SPECJALNEJ[typ].bonus;
  const atr = z.atrybuty ? { ...z.atrybuty } : undefined;
  if (atr && bonus) for (const k of Object.keys(atr) as (keyof Atrybuty)[]) atr[k] = Math.min(99, Math.round(atr[k] + bonus));
  const klub = z.klubId ? s.kluby[z.klubId] : undefined;
  return {
    klucz: `${typ}-${z.id}-${s.sezon}-${kolejka}`,
    typ, zawodnikId: z.id, sezon: s.sezon, kolejka,
    imie: z.imie, nazwisko: z.nazwisko, poz: z.poz, pozS: z.pozS,
    umiej: Math.min(99, Math.round(z.umiej) + bonus), numer: z.numer,
    klubId: z.klubId ?? s.mojKlub, klubNazwa: klub?.nazwa ?? "",
    kraj: z.kraj, atrybuty: atr, opis,
  };
}

const JEDNORAZOWE: TypKartySpecjalnej[] = ["legenda", "wychowanek", "debiutant"];

/** Dodaje kartę (bez duplikatów). Zwraca true, jeśli nowa. */
export function dodajKarte(s: StanGry, k: KartaSpecjalna): boolean {
  const st = stanKart(s);
  if (st.karty.some((x) => x.klucz === k.klucz)) return false;
  if (JEDNORAZOWE.includes(k.typ)) {
    const j = (st.jednorazowe[k.zawodnikId] ??= []);
    if (j.includes(k.typ)) return false;
    j.push(k.typ);
  }
  st.karty.push(k);
  return true;
}

const jestWychowankiem = (s: StanGry, z: Zawodnik) => {
  const k = s.kluby[s.mojKlub];
  return !!z.wychowanek && (z.wychowanek === k.nazwa || z.wychowanek === k.id);
};
const meczeWczesniej = (z: Zawodnik) => (z.kariera ?? []).reduce((a, w) => a + (w.mecze ?? 0), 0);

/**
 * Wywoływać raz na kolejkę (po XI kolejki i Zawodniku Miesiąca). Przyznaje karty specjalne zawodnikom Twojej kadry.
 * Zwraca wiadomości do skrzynki (może być pusta).
 */
export function tydzienKart(s: StanGry): string[] {
  const out: string[] = [];
  const moj = s.kluby[s.mojKlub];
  if (!moj || s.zwolniony) return out;
  const st = stanKart(s);
  const nrKolejki = s.kolejka + 1; // liczXIKolejki zapisuje kolejkę 1-indeksowaną (r + 1)
  const znacznik = s.sezon * 100 + nrKolejki;
  if (st.ostatnio === znacznik) return out;
  st.ostatnio = znacznik;
  const kadra = new Set(moj.zawodnicy);

  // 1) Zawodnik Kolejki — Twoi zawodnicy w jedenastce kolejki
  const xi = s.xiKolejki;
  if (xi && xi.kolejka === nrKolejki) {
    const nasi = xi.gracze.filter((g) => kadra.has(g.id));
    for (const g of nasi) {
      const z = s.zawodnicy[g.id]; if (!z) continue;
      dodajKarte(s, snapshot(s, z, "kolejki", `Kolejka ${xi.kolejka} · ocena ${g.ocena.toFixed(1)}`, nrKolejki));
    }
    if (nasi.length) out.push(`🃏 Karty „Zawodnik Kolejki": ${nasi.map((g) => `${g.imie} ${g.nazwisko}`).join(", ")} — nowe karty w albumie!`);
  }

  // 2) Zawodnik Miesiąca — z komunikatu silnika (sezon.ts → zawodnikMiesiaca) z tej kolejki
  for (const w of s.wiadomosci) {
    if (w.sezon !== s.sezon || w.kolejka !== s.kolejka || !w.tekst.startsWith("⭐ Zawodnik miesiąca:")) continue;
    const z = moj.zawodnicy.map((id) => s.zawodnicy[id]).find((x) => x && w.tekst.includes(`${x.imie} ${x.nazwisko} (`));
    if (z && dodajKarte(s, snapshot(s, z, "miesiaca", `Sezon ${s.sezon}, kolejka ${nrKolejki}`, nrKolejki)))
      out.push(`🃏 Karta specjalna „Zawodnik Miesiąca": ${z.imie} ${z.nazwisko} (${Math.min(99, Math.round(z.umiej) + 2)} OVR)!`);
  }

  // 3) Jednorazowe: debiutant, wychowanek, legenda
  for (const id of moj.zawodnicy) {
    const z = s.zawodnicy[id]; if (!z) continue;
    const ma = st.jednorazowe[id] ?? [];
    if (!ma.includes("debiutant") && z.mecze >= 1 && meczeWczesniej(z) === 0 && (z.meczeKariera ?? 0) <= z.mecze && z.wiek <= 23) {
      if (dodajKarte(s, snapshot(s, z, "debiutant", `Debiut w seniorach: sezon ${s.sezon}, ${z.wiek} l.`, nrKolejki)))
        out.push(`🃏 Karta „Debiutant": ${z.imie} ${z.nazwisko} zadebiutował w seniorskiej piłce!`);
    }
    if (!ma.includes("wychowanek") && z.mecze >= 1 && jestWychowankiem(s, z)) {
      if (dodajKarte(s, snapshot(s, z, "wychowanek", `Wychowanek ${moj.nazwa}`, nrKolejki)))
        out.push(`🃏 Karta „Wychowanek": ${z.imie} ${z.nazwisko} — z akademii do pierwszego zespołu.`);
    }
    const mk = z.meczeKariera ?? 0, gk = z.goleKariera ?? 0;
    const legenda = mk >= 300 || (jestWychowankiem(s, z) && mk >= 150) || gk >= 100;
    if (!ma.includes("legenda") && legenda) {
      const opis = gk >= 100 ? `${gk} goli w karierze` : `${mk} meczów w karierze`;
      if (dodajKarte(s, snapshot(s, z, "legenda", opis, nrKolejki)))
        out.push(`🃏 Karta „Legenda": ${z.imie} ${z.nazwisko} (${opis}) — ikona klubu!`);
    }
  }
  return out;
}

/** Podsumowanie albumu: ile kart każdego typu. */
export function statystykiAlbumu(s: StanGry): Record<TypKartySpecjalnej, number> & { razem: number } {
  const w = { kolejki: 0, miesiaca: 0, legenda: 0, wychowanek: 0, debiutant: 0, razem: 0 };
  for (const k of kartySpecjalne(s)) { w[k.typ]++; w.razem++; }
  return w;
}

/** Zawodnik-„widmo" z karty specjalnej (dla komponentu karty, gdy zawodnik odszedł/zakończył karierę). */
export function zawodnikZKarty(s: StanGry, k: KartaSpecjalna): Zawodnik {
  const zyw = s.zawodnicy[k.zawodnikId];
  const baza: Zawodnik = zyw ?? ({
    id: k.zawodnikId, imie: k.imie, nazwisko: k.nazwisko, poz: k.poz, wiek: 0, umiej: k.umiej, potencjal: k.umiej, kondycja: 100, forma: 0, pensja: 0,
    klubId: k.klubId, kontuzja: 0, gole: 0, asysty: 0, czysteKonta: 0, mecze: 0, kontraktTyp: "amator", kontraktDo: 0, kartki: 0, zawieszenie: 0,
    morale: 60, prosiOTransfer: false, noga: "prawa", numer: k.numer, kariera: [],
  } as Zawodnik);
  return { ...baza, imie: k.imie, nazwisko: k.nazwisko, poz: k.poz, pozS: k.pozS, umiej: k.umiej, numer: k.numer, klubId: k.klubId, kraj: k.kraj, atrybuty: k.atrybuty };
}

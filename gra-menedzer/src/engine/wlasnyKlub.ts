// Własny klub: gracz zakłada nowy klub i zgłasza go do wybranej ligi (zastępuje jedną z drużyn).
import { BARWY_WLASNE } from "../data/barwy";
import { RENOMA_POZIOM } from "../data/renoma";
import { KADRA, KASA_START, nadajNumery, noweId, nowyZawodnik, terminarz } from "./swiat";
import type { StanGry, WlasnoscKlubu } from "./types";

export interface OpcjeKlubu {
  nazwa: string;
  skrot: string;
  miasto: string;
  rokZalozenia: number;
  barwy: [string, string];
  stadion: string;
  pojemnosc: number;
  wlasciciel: WlasnoscKlubu;
  budzet: "skromny" | "sredni" | "bogaty";
  zastepujeId: string; // klub, którego miejsce w lidze zajmuje nowy klub (Ekstraklasa → okręgówka: stała liczba drużyn)
  dolacz?: boolean; // klasa A/B (C): klub DOCHODZI jako dodatkowa drużyna — grupa powiększa się o jeden zespół
}
/** Klasy A/B/C mają zmienną liczbę drużyn (nowe zgłoszenia do ZPN) — tam nowy klub dołącza, a nie zastępuje. */
export const ligaOtwarta = (nazwaLigi: string) => /klasa [ABC]\b|[ABC] klasa|klasa-[abc]|kl\. [ABC]/i.test(nazwaLigi);

/** Rejestruje barwy klubów gracza (po wczytaniu zapisu). */
export function zarejestrujBarwy(s: StanGry) {
  for (const k of Object.values(s.kluby)) if (k.barwyWlasne) BARWY_WLASNE[k.nazwa] = k.barwyWlasne;
}

/** Tworzy własny klub w miejscu `zastepujeId` (ta sama liga). Zwraca id klubu. */
export function stworzWlasnyKlub(s: StanGry, o: OpcjeKlubu): string {
  let k = s.kluby[o.zastepujeId];
  if (o.dolacz) { // nowa drużyna w grupie A/B klasy: kopia struktury klubu z tej ligi, nowe id, grupa +1, terminarz od nowa
    const liga = s.ligi.find((l) => l.kluby.includes(o.zastepujeId))!;
    const nowy = { ...JSON.parse(JSON.stringify(k)), id: noweId(s, "k"), zawodnicy: [], juniorzy: [] } as typeof k;
    s.kluby[nowy.id] = nowy; liga.kluby.push(nowy.id);
    liga.terminarz = terminarz(liga.kluby); liga.wyniki = [];
    k = nowy;
  } else {
  for (const zid of k.zawodnicy) delete s.zawodnicy[zid];
  if (k.rezerwaId && s.kluby[k.rezerwaId]) s.kluby[k.rezerwaId].rezerwaDla = undefined;
  }
  const bazaRen = RENOMA_POZIOM[Math.min(k.poziom - 1, RENOMA_POZIOM.length - 1)] ?? 0.2;
  Object.assign(k, {
    nazwa: o.nazwa.trim(), skrot: (o.skrot.trim() || o.nazwa.trim().slice(0, 3)).toUpperCase().slice(0, 4), miasto: o.miasto.trim(),
    herb: undefined, prawdziwy: false, wlasny: true, barwyWlasne: o.barwy, zalozony: o.rokZalozenia,
    stadion: o.stadion.trim() || `Stadion Miejski w ${o.miasto.trim()}`, adres: undefined, pojemnosc: Math.max(100, Math.round(o.pojemnosc)),
    renoma: Math.max(0.05, bazaRen * 0.6), rezerwaId: undefined, rezerwaDla: undefined, wlasciciel: o.wlasciciel,
    kasa: Math.round(KASA_START[k.poziom - 1] * { skromny: 0.6, sredni: 1, bogaty: 1.8 }[o.budzet]),
    obiekty: { gastronomia: 0, parking: 0, sklep: 0 }, zawodnicy: [], juniorzy: [], trenerReal: false, trenerHistoria: undefined,
  });
  BARWY_WLASNE[k.nazwa] = o.barwy;
  // Kadra generowana na poziomie ligi (nowy klub — bez gwiazd, ale pełny skład).
  for (const poz of KADRA) { const z = nowyZawodnik(s, k.poziom, poz); z.klubId = k.id; k.zawodnicy.push(z.id); }
  nadajNumery(s, k);
  return k.id;
}

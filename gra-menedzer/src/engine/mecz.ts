import { bonusTrudnosci } from "./osiagniecia";
import { los, losInt, poisson, szansa, wybierz, wybierzWazone } from "./losuj";
import { jestMlodziezowcem, wymogMlodziezowca, liczySieJakoMlodziezowiec } from "./swiat";
import { narodowoscKraju } from "../data/narodowosci";
import { IMIONA, NAZWISKA } from "../data/nazwy";
import { dopasowanieDoKategorii, dopasowanieDoSlotu, KAT_POZ } from "../data/pozycje";
import { obsadaMeczu } from "../data/sedziowie";
import { bonusRol } from "../data/role";

/** Najlepsze dopasowanie zawodnika do linii, uwzględniając pozycję podstawową i wyuczone (0..1; 1 = naturalna). */
function dopasZaw(z: Zawodnik, poz: Pozycja): number {
  let best = dopasowanieDoKategorii(z.pozS, poz);
  for (const p of z.pozycjeDodatkowe ?? []) best = Math.max(best, dopasowanieDoKategorii(p, poz));
  return best;
}
/** Czy zawodnik gra w tej linii naturalnie (podstawowa lub wyuczona pozycja). */
function naturalnyW(z: Zawodnik, poz: Pozycja): boolean {
  return z.poz === poz || (z.pozycjeDodatkowe ?? []).some((p) => KAT_POZ[p] === poz) || dopasZaw(z, poz) >= 1;
}
import { modKontuzja, modZmeczenie, poziomSztabu, skrocenieKontuzji } from "./sztab";
import type { Nastawienie, Pozycja, PozycjaSzczegolowa, StanGry, Wynik, Zawodnik, Zdarzenie } from "./types";
import { szczebelRegionalny, zpnSciezki } from "./zpn";

/** Czy zawodnik jest Polakiem lub obywatelem UE/EOG (brak limitu). */
export function czyUE(z: Zawodnik): boolean {
  return !z.kraj || (narodowoscKraju(z.kraj)?.ue ?? true);
}
/** Limit zawodników SPOZA UE/EOG jednocześnie na boisku (2026/27): Ekstraklasa — bez limitu (uchwała VI/77 art. 9.3);
 *  Betclic 1.–3. Liga — 2 (VI/78 art. 6); IV liga i niżej — wg regulaminu ZPN (Ukraińcy nie są liczeni do limitu). */
export function limitSpozaUE(poziom: number, sciezka?: string, nazwaLigi = ""): number {
  if (poziom <= 1) return 99;
  if (poziom <= 4) return 2;
  return zpnSciezki(sciezka).spozaUE[szczebelRegionalny(nazwaLigi, poziom)];
}
/** Liczba zawodników spoza UE wśród podanych id (na szczeblu regionalnym obywatele Ukrainy nie są wliczani). */
export function ileSpozaUE(s: StanGry, ids: string[], poziom = 1): number {
  return ids.filter((id) => s.zawodnicy[id] && !czyUE(s.zawodnicy[id]) && !(poziom >= 5 && s.zawodnicy[id].kraj === "Ukraina")).length;
}

export const FORMACJE: Record<string, Record<Pozycja, number>> = {
  "4-4-2": { BR: 1, OBR: 4, POM: 4, NAP: 2 },
  "4-4-2 diament": { BR: 1, OBR: 4, POM: 4, NAP: 2 },
  "4-4-1-1": { BR: 1, OBR: 4, POM: 4, NAP: 2 },
  "4-3-3": { BR: 1, OBR: 4, POM: 3, NAP: 3 },
  "4-2-3-1": { BR: 1, OBR: 4, POM: 3, NAP: 3 },
  "4-5-1": { BR: 1, OBR: 4, POM: 5, NAP: 1 },
  "4-1-4-1": { BR: 1, OBR: 4, POM: 5, NAP: 1 },
  "4-3-2-1": { BR: 1, OBR: 4, POM: 5, NAP: 1 },
  "3-5-2": { BR: 1, OBR: 3, POM: 5, NAP: 2 },
  "3-4-1-2": { BR: 1, OBR: 3, POM: 5, NAP: 2 },
  "5-3-2": { BR: 1, OBR: 5, POM: 3, NAP: 2 },
  "5-4-1": { BR: 1, OBR: 5, POM: 4, NAP: 1 },
  "5-2-3": { BR: 1, OBR: 5, POM: 2, NAP: 3 },
  "3-4-3": { BR: 1, OBR: 3, POM: 4, NAP: 3 },
};

/** Realne sloty (pozycje szczegółowe) każdej formacji — 11 ról, zgodne z liczbami w FORMACJE. */
export const FORMACJE_SLOTY: Record<string, PozycjaSzczegolowa[]> = {
  "4-4-2": ["BR", "LO", "SO", "SO", "PO", "LP", "SP", "SP", "PP", "NAP", "NAP"],
  "4-4-2 diament": ["BR", "LO", "SO", "SO", "PO", "DP", "SP", "SP", "OP", "NAP", "NAP"],
  "4-4-1-1": ["BR", "LO", "SO", "SO", "PO", "LP", "SP", "SP", "PP", "DN", "NAP"],
  "4-3-3": ["BR", "LO", "SO", "SO", "PO", "DP", "SP", "SP", "LS", "NAP", "PS"],
  "4-2-3-1": ["BR", "LO", "SO", "SO", "PO", "DP", "DP", "OP", "LS", "NAP", "PS"],
  "4-5-1": ["BR", "LO", "SO", "SO", "PO", "LP", "DP", "SP", "PP", "OP", "NAP"],
  "4-1-4-1": ["BR", "LO", "SO", "SO", "PO", "DP", "LP", "SP", "SP", "PP", "NAP"],
  "4-3-2-1": ["BR", "LO", "SO", "SO", "PO", "DP", "SP", "SP", "OP", "OP", "NAP"],
  "3-5-2": ["BR", "SO", "SO", "SO", "LP", "DP", "SP", "OP", "PP", "NAP", "NAP"],
  "3-4-1-2": ["BR", "SO", "SO", "SO", "LP", "SP", "SP", "PP", "OP", "NAP", "NAP"],
  "5-3-2": ["BR", "LO", "SO", "SO", "SO", "PO", "DP", "SP", "OP", "NAP", "NAP"],
  "5-4-1": ["BR", "LWA", "SO", "SO", "SO", "PWA", "LP", "SP", "SP", "PP", "NAP"],
  "5-2-3": ["BR", "LWA", "SO", "SO", "SO", "PWA", "DP", "SP", "LS", "NAP", "PS"],
  "3-4-3": ["BR", "SO", "SO", "SO", "LP", "SP", "SP", "PP", "LS", "NAP", "PS"],
};

/** Przydziela zawodników jedenastki do slotów formacji.
 *  `reczne` = kolejność `sklad` odpowiada dokładnie slotom (ustawienie z edytora boiska) — bez przetasowań.
 *  W innym razie: najlepsze dopasowania najpierw (zawodnik ↔ slot), remisy rozstrzyga siła. */
export function przydzielSloty(s: StanGry, sklad: string[], formacja: string, reczne = false): { slot: PozycjaSzczegolowa; id: string | null; dopas: number }[] {
  const sloty = FORMACJE_SLOTY[formacja] ?? FORMACJE_SLOTY["4-4-2"];
  if (reczne && sklad.length === sloty.length) {
    return sloty.map((slot, i) => { const z = s.zawodnicy[sklad[i]]; return { slot, id: z ? z.id : null, dopas: z ? dopasowanieDoSlotu(z, slot) : 0 }; });
  }
  const dost = sklad.map((id) => s.zawodnicy[id]).filter(Boolean);
  const pary: { i: number; z: Zawodnik; d: number; e: number }[] = [];
  sloty.forEach((slot, i) => { for (const z of dost) pary.push({ i, z, d: dopasowanieDoSlotu(z, slot), e: efektywna(z) }); });
  pary.sort((a, b) => b.d - a.d || b.e - a.e);
  const wynik: { slot: PozycjaSzczegolowa; id: string | null; dopas: number }[] = sloty.map((slot) => ({ slot, id: null, dopas: 0 }));
  const uzyci = new Set<string>();
  for (const p of pary) {
    if (wynik[p.i].id || uzyci.has(p.z.id)) continue;
    wynik[p.i] = { slot: sloty[p.i], id: p.z.id, dopas: p.d };
    uzyci.add(p.z.id);
  }
  return wynik;
}
/** Efektywny OVR zawodnika na danej pozycji (do UI): OVR × dopasowanie. */
export function ovrNaPozycji(z: Zawodnik, slot: PozycjaSzczegolowa): number {
  return z.umiej * dopasowanieDoSlotu(z, slot);
}

export const POZYCJE: Pozycja[] = ["BR", "OBR", "POM", "NAP"];

export function dostepny(s: StanGry, z: Zawodnik): boolean {
  return z.kontuzja === 0 && z.zawieszenie === 0 && !s.niedostepni[z.id];
}

export function efektywna(z: Zawodnik): number {
  // umiejętności × kondycja, korekta formy i morale (±~8%).
  const morale = 0.92 + (z.morale ?? 68) / 625;
  return (z.umiej * (0.8 + 0.2 * (z.kondycja / 100)) + z.forma * 0.6) * morale;
}

/** Ocena przydatności zawodnika na mecz (asystent): OVR, forma, morale, a przede wszystkim KONDYCJA —
 *  zmęczony (< 75%) traci, wyczerpany (< 60%) prawie nie wchodzi w grę (ryzyko urazu, spadek w 2. połowie). */
export function ocenaNaMecz(z: Zawodnik): number {
  let e = efektywna(z);
  if (z.kondycja < 75) e *= 1 - (75 - z.kondycja) * 0.012;
  if (z.kondycja < 60) e *= 0.75;
  return e;
}

/** Najlepsza jedenastka dla formacji (asystent). Dobiera zawodników do KONKRETNYCH slotów formacji
 *  (dopasowanie pozycji × forma × kondycja × morale), potem pilnuje przepisów: młodzieżowiec (PZPN) i limit spoza UE.
 *  Zwraca skład w kolejności slotów formacji.
 *  `dodatkowi` = zawodnicy spoza kadry klubu brani pod uwagę (np. powołani do rezerw z pierwszego zespołu). */
export function autoSklad(s: StanGry, klubId: string, formacja: string, dodatkowi?: string[]): string[] {
  const sloty = FORMACJE_SLOTY[formacja] ?? FORMACJE_SLOTY["4-4-2"];
  const pula = dodatkowi?.length ? [...new Set([...s.kluby[klubId].zawodnicy, ...dodatkowi])] : s.kluby[klubId].zawodnicy;
  const kadra = pula.map((id) => s.zawodnicy[id]).filter((z) => z && dostepny(s, z));
  const wart = (z: Zawodnik, slot: PozycjaSzczegolowa) => ocenaNaMecz(z) * dopasowanieDoSlotu(z, slot);
  // Przydział: najpierw najcenniejsze pary (zawodnik, slot); bramkarza na bramkę i nikogo z pola na bramkę.
  const pary: { i: number; z: Zawodnik; v: number }[] = [];
  sloty.forEach((slot, i) => { for (const z of kadra) pary.push({ i, z, v: wart(z, slot) }); });
  pary.sort((a, b) => b.v - a.v);
  const sklad: (string | null)[] = sloty.map(() => null);
  const uzyci = new Set<string>();
  for (const p of pary) { if (sklad[p.i] || uzyci.has(p.z.id)) continue; sklad[p.i] = p.z.id; uzyci.add(p.z.id); }
  // Przepis PZPN: wymagana LICZBA młodzieżowców (U-21) na boisku wg szczebla — wymiana z najmniejszą stratą.
  const pz = s.kluby[klubId].poziom; const wymog = wymogMlodziezowca(pz, s.sciezka, s.ligi[pz - 1]?.nazwa);
  const ile = () => sklad.filter((id) => id && liczySieJakoMlodziezowiec(s.zawodnicy[id], pz, s.sciezka)).length;
  while (ile() < wymog) {
    let best: { i: number; z: Zawodnik; strata: number } | null = null;
    for (const z of kadra) {
      if (uzyci.has(z.id) || !liczySieJakoMlodziezowiec(z, pz, s.sciezka)) continue;
      sklad.forEach((id, i) => {
        if (!id || sloty[i] === "BR") return;
        const obecny = s.zawodnicy[id];
        if (liczySieJakoMlodziezowiec(obecny, pz, s.sciezka)) return;
        const strata = wart(obecny, sloty[i]) - wart(z, sloty[i]);
        if (!best || strata < best.strata) best = { i, z, strata };
      });
    }
    if (!best) break;
    const b = best as { i: number; z: Zawodnik };
    uzyci.delete(sklad[b.i]!); sklad[b.i] = b.z.id; uzyci.add(b.z.id);
  }
  // Przepis PZPN o cudzoziemcach: nie więcej niż limit zawodników spoza UE na boisku.
  const limit = limitSpozaUE(pz, s.sciezka, s.ligi[pz - 1]?.nazwa);
  const spoza = () => sklad.filter((id) => id && !czyUE(s.zawodnicy[id]) && !(pz >= 5 && s.zawodnicy[id].kraj === "Ukraina")).length;
  while (spoza() > limit) {
    let best: { i: number; z: Zawodnik; strata: number } | null = null;
    for (const z of kadra) {
      if (uzyci.has(z.id) || !czyUE(z)) continue;
      sklad.forEach((id, i) => {
        if (!id || czyUE(s.zawodnicy[id])) return;
        const strata = wart(s.zawodnicy[id], sloty[i]) - wart(z, sloty[i]);
        if (!best || strata < best.strata) best = { i, z, strata };
      });
    }
    if (!best) break;
    const b = best as { i: number; z: Zawodnik };
    uzyci.delete(sklad[b.i]!); sklad[b.i] = b.z.id; uzyci.add(b.z.id);
  }
  return sklad.filter(Boolean) as string[];
}

/** Raport asystenta: kto wypadł / wszedł względem poprzedniego składu i dlaczego. */
export function raportAsystenta(s: StanGry, przed: string[], po: string[], formacja: string): string[] {
  const out: string[] = [];
  const pS = new Set(przed), nS = new Set(po);
  for (const id of przed) {
    if (nS.has(id)) continue;
    const z = s.zawodnicy[id]; if (!z) continue;
    const pow = !dostepny(s, z) ? (z.kontuzja ? "kontuzja" : z.zawieszenie ? "pauza za kartki" : "niedostępny")
      : z.kondycja < 70 ? `odpoczynek (kondycja ${Math.round(z.kondycja)}%)` : z.forma <= -2 ? `słaba forma (${z.forma.toFixed(1)})` : "decyzja taktyczna";
    out.push(`⬇ ${z.imie} ${z.nazwisko} — ${pow}`);
  }
  const przydz = przydzielSloty(s, po, formacja, true);
  for (const r of przydz) {
    if (!r.id || pS.has(r.id)) continue;
    const z = s.zawodnicy[r.id];
    const pow = z.forma >= 2 ? `w formie (+${z.forma.toFixed(1)})` : jestMlodziezowcem(z) ? "młodzieżowiec (przepis PZPN)" : z.kondycja >= 95 ? "świeży" : "najlepszy wybór na pozycję";
    out.push(`⬆ ${z.imie} ${z.nazwisko} (${SKROT_SLOT(r.slot)}) — ${pow}`);
  }
  return out;
}
const SKROT_SLOT = (p: PozycjaSzczegolowa) => ({ SO: "ŚO", SP: "ŚP" } as Record<string, string>)[p] ?? p;

/** Siła ataku i obrony jedenastki. Każdy gra na konkretnym slocie formacji — poza swoją pozycją traci
 *  wg macierzy dopasowania (np. ŚP na LP −18%, ŚP na LO −34%, bramkarz w polu −65%). */
export function silaSkladu(s: StanGry, sklad: string[], formacja: string, reczne = false) {
  const f = FORMACJE[formacja] ?? FORMACJE["4-4-2"];
  const przydz = przydzielSloty(s, sklad, formacja, reczne);
  const sloty: Record<Pozycja, number[]> = { BR: [], OBR: [], POM: [], NAP: [] };
  for (const r of przydz) {
    const z = r.id ? s.zawodnicy[r.id] : undefined;
    sloty[KAT_POZ[r.slot]].push(z ? efektywna(z) * r.dopas : 5);
  }
  for (const poz of POZYCJE) while (sloty[poz].length < f[poz]) sloty[poz].push(5);
  const sr = (t: number[]) => t.reduce((a, b) => a + b, 0) / t.length;
  const br = sr(sloty.BR), obr = sr(sloty.OBR), pom = sr(sloty.POM), nap = sr(sloty.NAP);
  // liczba graczy w liniach też ma znaczenie
  const atak = nap * 0.5 + pom * 0.35 + obr * 0.15 + (f.NAP - 2) * 1.2 + (f.POM - 4) * 0.5;
  const obrona = obr * 0.45 + br * 0.3 + pom * 0.25 + (f.OBR - 4) * 1.2 + (f.POM - 4) * 0.4;
  // poziom trudności: dodatek do siły Twojej drużyny
  const moj = sklad.some((id) => s.zawodnicy[id]?.klubId === s.mojKlub);
  const bt = moj ? bonusTrudnosci(s) : 0;
  return { atak: atak + bt, obrona: obrona + bt };
}

const NAST: Record<Nastawienie, { swoje: number; rywala: number }> = {
  autobus: { swoje: 0.62, rywala: 0.6 },   // „zaparkowany autobus" — minimum ataku, mocno domknięta obrona
  obronne: { swoje: 0.82, rywala: 0.8 },
  zrownowazone: { swoje: 1, rywala: 1 },
  ofensywne: { swoje: 1.18, rywala: 1.15 },
};

function xg(atak: number, obronaRywala: number) {
  // Łagodniejszy wpływ różnicy sił (/11) = więcej wyrównanych meczów i remisów, mniej pogromów.
  return 1.48 * Math.exp((atak - obronaRywala) / 11); // 1.48: kalibracja po wprowadzeniu kar za grę poza pozycją (cel ~4 gole/mecz)
}

interface Druzyna {
  klubId: string;
  sklad: string[];
  formacja: string;
  nastawienie: Nastawienie;
}

/** Dostępni rezerwowi klubu (poza wyjściową XI), posortowani od najlepszych. */
function lawka(s: StanGry, klubId: string, sklad: string[]): Zawodnik[] {
  return s.kluby[klubId].zawodnicy
    .filter((id) => !sklad.includes(id))
    .map((id) => s.zawodnicy[id])
    .filter((z) => z && dostepny(s, z))
    .sort((a, b) => efektywna(b) - efektywna(a));
}

/** Dodatki do siły z cech zawodników na boisku (snajper → atak, mur → obrona, szybki → oba). */
function bonusCech(s: StanGry, linia: string[]): { atak: number; obrona: number } {
  let atak = 0, obrona = 0;
  for (const id of linia) {
    const z = s.zawodnicy[id];
    if (!z?.cechy) continue;
    if (z.cechy.includes("snajper") && (z.poz === "NAP" || z.poz === "POM")) atak += 0.6;
    if (z.cechy.includes("mur") && (z.poz === "OBR" || z.poz === "BR")) obrona += 0.6;
    if (z.cechy.includes("szybki")) { atak += 0.15; obrona += 0.1; }
  }
  return { atak, obrona };
}

const liderNaBoisku = (s: StanGry, linia: string[]) => linia.some((id) => s.zawodnicy[id]?.cechy?.includes("lider"));

/** Stały hash tekstu (FNV-1a) — stała tendencja arbitra z jego nazwiska. */
function hashTekst(t: string): number { let h = 2166136261; for (const c of t) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

export function zagrajMecz(s: StanGry, dom: Druzyna, gosc: Druzyna, zZdarzeniami: boolean, opcje?: { domAtut?: number; derby?: boolean; mojTrening?: import("./types").Trening; mojaStrona?: "dom" | "gosc"; pogoda?: number; puchar?: "woj" | "polski" }): Wynik {
  // Mecz obejrzany na żywo — rozliczamy dokładnie to, co widziałeś (gole, kartki, zmiany, urazy).
  if (zZdarzeniami && !opcje?.puchar && s.meczLive?.koniec && s.meczLive.dom.klubId === dom.klubId && s.meczLive.gosc.klubId === gosc.klubId) {
    const m = s.meczLive; s.meczLive = undefined;
    return meczZeScenariusza(s, m);
  }
  const nd = NAST[dom.nastawienie];
  const ng = NAST[gosc.nastawienie];
  const amator = 1 + (s.kluby[dom.klubId].poziom - 1) * 0.025;
  const domAtut = opcje?.domAtut ?? 1.12;
  const emo = opcje?.derby ? 1.7 : 1;
  const wielkiMecz = !!opcje?.derby || !!opcje?.puchar; // derby lub puchar — cecha „bigmecz" działa
  // Sędzia + jego TENDENCJA (C2): w meczach gracza obsada jest znana, a surowość pochodzi od KONKRETNEGO arbitra
  // (ten sam sędzia jest konsekwentnie „surowy/kartkowy" albo „pozwala grać"); w meczach tła — losowa. VAR: I–II poziom.
  const varMecz = s.kluby[dom.klubId].poziom <= 2;
  const pObsady = Math.min(s.kluby[dom.klubId].poziom, s.kluby[gosc.klubId].poziom);
  let sedzia: Wynik["sedzia"] | undefined;
  let sedziaSur: number;
  // Klasa arbitra per szczebel (C-point): im niżej, tym mniej doświadczony sędzia → większy mecz-do-meczu rozrzut (niekonsekwencja).
  const jitter = pObsady <= 3 ? 0.04 : pObsady <= 5 ? 0.09 : pObsady <= 6 ? 0.13 : 0.18; // B klasa = największa losowość decyzji
  if (zZdarzeniami) {
    sedzia = obsadaMeczu(s, pObsady, 1, { cupPolski: opcje?.puchar === "polski", cupWoj: opcje?.puchar === "woj" });
    const h = hashTekst(sedzia.glowny); // stała tendencja arbitra z nazwiska + szum meczowy (większy w niższych ligach)
    sedziaSur = Math.max(0.55, Math.min(1.5, 0.72 + (h % 1000) / 1000 * 0.56 + los(-jitter, jitter)));
    const styl: "łagodny" | "normalny" | "surowy" = sedziaSur >= 1.15 ? "surowy" : sedziaSur <= 0.85 ? "łagodny" : "normalny";
    sedzia = { ...sedzia, styl };
  } else {
    sedziaSur = los(0.6 - jitter, 1.4 + jitter);
  }
  const sedziaMn = sedziaSur * (varMecz ? 0.92 : 1); // VAR = mniej pomyłkowych czerwonych
  const t = opcje?.mojTrening;
  const mojAtak = t === "atak" ? 1.07 : t === "stale" ? 1.05 : t === "zgranie" ? 1.03 : 1;
  const mojaObrona = t === "obrona" ? 0.93 : t === "zgranie" ? 0.97 : 1;
  const domMoj = opcje?.mojaStrona === "dom", goscMoj = opcje?.mojaStrona === "gosc";
  const pog = opcje?.pogoda ?? 1;
  // Jakość boiska per szczebel: podgrzewana murawa (ekstraklasa) bezpieczna, „kartoflisko" niższych lig = więcej urazów.
  const domMurawa = s.kluby[dom.klubId].murawa;
  const boiskoMn = domMurawa === "podgrzewana" ? 0.9 : domMurawa === "sztuczna" ? 1.12 : pObsady >= 7 ? 1.2 : pObsady >= 6 ? 1.1 : 1;
  const kontuzjaMn = (pog < 1 ? 1 + (1 - pog) * 2.2 : 1) * boiskoMn; // zła pogoda + kiepskie boisko = większe ryzyko kontuzji

  const zdarzenia: Zdarzenie[] = [];
  const goleM = new Map<string, number>();
  const asyM = new Map<string, number>();
  const kartaM = new Map<string, "zolta" | "czerwona">();
  const KARA_CZERWONA = [4000, 2500, 1500, 800, 400, 250, 150, 100, 80];
  const KARA_ZOLTA = [500, 350, 200, 120, 70, 45, 30, 20, 15];
  let karaMoja = 0;

  // ——— Zdarzenia pozameczowe + ZMIANY per drużyna; zwraca końcowy skład na boisku (po zmianach). ———
  const przygotuj = (d: Druzyna): { linia: string[]; naBoisku: Set<string> } => {
    const poziomD = s.kluby[d.klubId].poziom;
    const linia = [...d.sklad];
    const naBoisku = new Set<string>(linia); // wszyscy, którzy zagrali (XI + wchodzący)
    const kontuzjowani: string[] = [];
    const czerwoni: string[] = [];
    // kondycja/mecze + kartki + kontuzje dla wyjściowej XI
    for (const id of d.sklad) {
      const z = s.zawodnicy[id];
      if (!z) continue;
      z.mecze++;
      z.meczeKariera = (z.meczeKariera ?? 0) + 1;
      z.zgranie = Math.min(100, (z.zgranie ?? 80) + 2.5); // chemia rośnie z każdym meczem w drużynie (C3)
      // Cechy behawioralne: nerwowy łapie więcej kartek, profesjonalista mniej.
      const kartkaMn = (z.cechy?.includes("nerwowy") ? 1.55 : 1) * (z.cechy?.includes("profesjonalista") ? 0.8 : 1);
      if (d.klubId === s.mojKlub && z.meczeKariera % 100 === 0) s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🎖 Jubileusz: ${z.imie} ${z.nazwisko} rozegrał ${z.meczeKariera}. mecz w karierze!` });
      { const intens = d.klubId === s.mojKlub ? (1 + (s.taktyka.pressing === "wysoki" ? 0.18 : 0) + (s.taktyka.tempo === "szybkie" ? 0.12 : 0) - (s.taktyka.tempo === "wolne" ? 0.08 : 0)) : 1;
        z.kondycja = Math.max(30, z.kondycja - los(12, 22) * intens * (d.klubId === s.mojKlub ? modZmeczenie(s) : 1)); }
      if (szansa(0.012 * emo * sedziaMn * kartkaMn)) {
        const razacy = szansa(0.3); // rażący faul / brutalność — sprawą zajmie się komisja
        z.zawieszenie = Math.max(z.zawieszenie, razacy ? losInt(3, 6) : losInt(1, 2));
        kartaM.set(z.id, "czerwona");
        s.kluby[d.klubId].kasa -= KARA_CZERWONA[poziomD - 1] * (razacy ? 2 : 1);
        if (d.klubId === s.mojKlub) karaMoja += KARA_CZERWONA[poziomD - 1] * (razacy ? 2 : 1);
        zdarzenia.push({ min: losInt(20, 90), klubId: d.klubId, typ: "czerwona", zawodnikId: z.id, opis: `pauza ${z.zawieszenie}` });
        if (d.klubId === s.mojKlub && razacy) s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `⚖️ Komisja Ligi PZPN: ${z.imie} ${z.nazwisko} za rażący faul — ${z.zawieszenie} meczów dyskwalifikacji i podwyższona kara finansowa.` });
        czerwoni.push(z.id);
      } else if (szansa(0.16 * emo * sedziaMn * kartkaMn)) {
        z.kartki++;
        if (kartaM.get(z.id) !== "czerwona") kartaM.set(z.id, "zolta");
        s.kluby[d.klubId].kasa -= KARA_ZOLTA[poziomD - 1];
        if (d.klubId === s.mojKlub) karaMoja += KARA_ZOLTA[poziomD - 1];
        zdarzenia.push({ min: losInt(1, 90), klubId: d.klubId, typ: "zolta", zawodnikId: z.id, opis: `${z.kartki}. żółta` });
        if (z.kartki % 4 === 0) {
          // Przepisy PZPN: 4. i 8. żółta = 1 mecz; od 12. (każda kolejna wielokrotność 4) = 2 mecze.
          const pauza = z.kartki >= 12 ? 2 : 1;
          z.zawieszenie = Math.max(z.zawieszenie, pauza);
          zdarzenia.push({ min: 90, klubId: d.klubId, typ: "zawieszenie", zawodnikId: z.id, opis: `${z.kartki} żółtych — pauza ${pauza} kol.` });
        }
        // Druga żółta w tym samym meczu = czerwień (pauza 1 mecz) — częściej u surowego arbitra.
        if (szansa(0.07 * emo * sedziaSur)) {
          z.kartki++;
          z.zawieszenie = Math.max(z.zawieszenie, 1);
          kartaM.set(z.id, "czerwona");
          s.kluby[d.klubId].kasa -= KARA_CZERWONA[poziomD - 1];
          if (d.klubId === s.mojKlub) karaMoja += KARA_CZERWONA[poziomD - 1];
          zdarzenia.push({ min: losInt(40, 90), klubId: d.klubId, typ: "czerwona", zawodnikId: z.id, opis: "druga żółta — pauza 1 kol." });
          czerwoni.push(z.id);
        }
      }
    }
    if (szansa(0.09 * kontuzjaMn * (d.klubId === s.mojKlub ? modKontuzja(s) : 1))) {
      // Wybór poszkodowanego ważony PODATNOŚCIĄ na urazy — „szklani" zawodnicy łapią kontuzje częściej.
      const kandydaci = d.sklad.map((id) => s.zawodnicy[id]).filter(Boolean);
      const z = kandydaci.length ? wybierzWazone(kandydaci, (p) => (p.podatnosc ?? 1) * (p.cechy?.includes("kontuzjogenny") ? 1.9 : 1) * (p.cechy?.includes("profesjonalista") ? 0.7 : 1)) : undefined;
      if (z) {
        const pod = z.podatnosc ?? 1;
        const ciezka = szansa(0.15 * Math.min(1.6, pod)); // podatni częściej łapią poważny uraz
        let tyg = ciezka ? losInt(6, 16) : losInt(1, 4);
        if (pod >= 1.2) tyg += 1; // podatni leczą się dłużej
        if (d.klubId === s.mojKlub) tyg = Math.max(1, tyg - skrocenieKontuzji(s) * (ciezka ? 2 : 1)); // fizjo skraca
        z.kontuzja = tyg;
        z.urazy = (z.urazy ?? 0) + 1; // historia urazów
        const opis = ciezka
          ? wybierz(["zerwane więzadła krzyżowe", "złamanie kości", "naderwany mięsień dwugłowy", "uszkodzenie łąkotki", "zerwane ścięgno Achillesa"])
          : wybierz(["stłuczenie", "naciągnięcie mięśnia", "uraz kostki", "przeciążenie", "uraz kolana"]);
        zdarzenia.push({ min: losInt(1, 90), klubId: d.klubId, typ: "kontuzja", zawodnikId: z.id, opis: `${opis} — ${tyg} kol.` });
        kontuzjowani.push(z.id);
        if (d.klubId === s.mojKlub && ciezka) s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🚑 Poważny uraz: ${z.imie} ${z.nazwisko} — ${opis}, pauza ok. ${tyg} kolejek. Rehabilitacja ${skrocenieKontuzji(s) ? "skrócona dzięki fizjoterapeucie" : "— rozważ zatrudnienie fizjoterapeuty"}.` });
      }
    }
    // ZMIANY (do 5): czerwoni schodzą bez zmiennika; kontuzjowani i zmęczeni zastępowani świeższymi z ławki.
    const bench = lawka(s, d.klubId, d.sklad);
    let sloty = 5;
    for (const id of czerwoni) { const i = linia.indexOf(id); if (i >= 0) linia.splice(i, 1); } // gra w osłabieniu
    const wejdzie = (zaId: string, min: number, powod: string) => {
      const poz = s.zawodnicy[zaId]?.poz;
      const idx = bench.findIndex((b) => b.poz === poz);
      const zm = idx >= 0 ? bench.splice(idx, 1)[0] : (bench.length && powod === "kontuzja" ? bench.splice(0, 1)[0] : null);
      if (!zm) return;
      const i = linia.indexOf(zaId); if (i < 0) return;
      linia[i] = zm.id; naBoisku.add(zm.id); sloty--;
      zm.mecze++; zm.kondycja = Math.max(35, zm.kondycja - los(5, 12)); // wchodzi na część meczu
      zdarzenia.push({ min, klubId: d.klubId, typ: "zmiana", zawodnikId: zm.id, opis: powod === "kontuzja" ? "za kontuzjowanego" : "zmiana" });
    };
    for (const id of kontuzjowani) { if (sloty <= 0) break; if (linia.includes(id)) wejdzie(id, losInt(20, 80), "kontuzja"); }
    // taktyczne: najsłabsi/zmęczeni z pola na świeższych lepszych (max ~3)
    let takt = 0;
    const polowi = linia.map((id) => s.zawodnicy[id]).filter((z) => z && z.poz !== "BR").sort((a, b) => efektywna(a) - efektywna(b));
    for (const z of polowi) {
      if (sloty <= 0 || takt >= 3) break;
      const idx = bench.findIndex((b) => b.poz === z.poz && efektywna(b) > efektywna(z) + 1);
      if (idx >= 0) { const zm = bench[idx]; bench.splice(idx, 1); const i = linia.indexOf(z.id); if (i >= 0) { linia[i] = zm.id; naBoisku.add(zm.id); sloty--; takt++; zm.mecze++; zm.kondycja = Math.max(35, zm.kondycja - los(5, 12)); zdarzenia.push({ min: losInt(55, 85), klubId: d.klubId, typ: "zmiana", zawodnikId: zm.id, opis: "zmiana" }); } }
    }
    // Znajomość ustawienia (C3): klub gracza „oswaja" formację z każdym meczem w niej rozegranym.
    if (d.klubId === s.mojKlub) {
      const kl = s.kluby[d.klubId];
      if (kl) { kl.znajomoscFormacji = kl.znajomoscFormacji ?? {}; kl.znajomoscFormacji[d.formacja] = (kl.znajomoscFormacji[d.formacja] ?? 0) + 1; }
    }
    return { linia, naBoisku };
  };

  const pD = przygotuj(dom);
  const pG = przygotuj(gosc);

  // Zgranie składu (C3, tylko klub gracza): świeży transfer i nieznana formacja osłabiają, zgrana drużyna gra na 100%.
  const chemiaMod = (linia: string[], formacja: string): number => {
    const zs = linia.map((id) => s.zawodnicy[id]).filter(Boolean);
    if (!zs.length) return 1;
    const mean = zs.reduce((a, z) => a + (z.zgranie ?? 80), 0) / zs.length; // 30 (nowy) … 100 (zgrany); brak = 80
    const fam = s.kluby[s.mojKlub]?.znajomoscFormacji?.[formacja] ?? 12;     // ile meczów w tej formacji
    const famPen = fam >= 8 ? 0 : (8 - fam) * 0.004;                         // nieznane ustawienie: drobny minus
    return Math.max(0.93, Math.min(1.015, 1 + (mean - 80) * 0.0006 - famPen));
  };
  // Siła: mieszanka 70% wyjściowej XI + 30% składu po zmianach (świeże nogi i lepsza ławka realnie ważą).
  const sila = (sklad: string[], linia: string[], formacja: string, klubId: string) => {
    const reczne = klubId === s.mojKlub && !!s.taktyka.reczneSloty;
    const xi = silaSkladu(s, sklad, formacja, reczne);
    const fin = silaSkladu(s, linia, formacja, reczne);
    const bc = bonusCech(s, linia);
    const rb = klubId === s.mojKlub ? bonusRol(s, linia) : { atak: 0, obrona: 0 }; // role taktyczne (tylko klub gracza)
    const lid = liderNaBoisku(s, linia) ? 1.015 : 1; // kapitan/lider — spójność drużyny
    const chem = klubId === s.mojKlub ? chemiaMod(linia, formacja) : 1; // zgranie (tylko klub gracza — AI neutralnie)
    // „Zawodnik na wielkie mecze": w derbach/pucharze gracze z cechą bigmecz podkręcają drużynę (~0,4% każdy).
    const big = wielkiMecz ? 1 + linia.reduce((n, id) => n + (s.zawodnicy[id]?.cechy?.includes("bigmecz") ? 1 : 0), 0) * 0.004 : 1;
    const mot = klubId === s.mojKlub ? 1 + (s.motywacjaMeczu ?? 0) : 1; // konferencja przedmeczowa: nakręcona / zlekceważona drużyna
    return { atak: (xi.atak * 0.7 + fin.atak * 0.3 + bc.atak + rb.atak) * lid * chem * big * mot, obrona: (xi.obrona * 0.7 + fin.obrona * 0.3 + bc.obrona + rb.obrona) * lid * chem * big * mot };
  };
  const sd = sila(dom.sklad, pD.linia, dom.formacja, dom.klubId);
  const sg = sila(gosc.sklad, pG.linia, gosc.formacja, gosc.klubId);

  // Sztab: analityk podnosi skuteczność Twojej drużyny, trener bramkarzy/analityk zmniejszają straty (tylko klub gracza).
  const anBoost = (k: string) => (k === s.mojKlub ? 1 + poziomSztabu(s, "analityk") * 0.012 : 1);
  const obrSzt = (k: string) => (k === s.mojKlub ? 1 - (poziomSztabu(s, "bramkarzy") * 0.02 + poziomSztabu(s, "analityk") * 0.008) : 1);
  // Passa: zwycięska seria dodaje pewności, seria porażek odbiera (±5% maks.).
  const seriaMod = (k: string) => 1 + Math.max(-0.05, Math.min(0.05, (s.kluby[k]?.seria ?? 0) * 0.012));
  // Instrukcje zespołowe mojego klubu (styl ataku, linia obrony, szerokość, krycie) — ryzyko/nagroda, net ~neutralne.
  // mojAtakInstr skaluje MÓJ atak, mojObrInstr skaluje atak RYWALA przeciw mnie. AI gra neutralnie.
  const stylAtak = { posiadanie: 0.98, skrzydla: 1.03, dlugie: 1.01, kontra: 0.99, normalny: 1 }[s.taktyka.stylAtaku ?? "normalny"];
  const stylKonc = { posiadanie: 0.97, skrzydla: 1.0, dlugie: 1.0, kontra: 0.95, normalny: 1 }[s.taktyka.stylAtaku ?? "normalny"];
  const liniaAtak = { wysoka: 1.04, niska: 0.97, normalna: 1 }[s.taktyka.liniaObrony ?? "normalna"];
  const liniaKonc = { wysoka: 1.06, niska: 0.94, normalna: 1 }[s.taktyka.liniaObrony ?? "normalna"];
  const szerAtak = { szeroka: 1.02, waska: 0.99, normalna: 1 }[s.taktyka.szerokosc ?? "normalna"];
  const szerKonc = { szeroka: 1.02, waska: 0.98, normalna: 1 }[s.taktyka.szerokosc ?? "normalna"];
  const krycieKonc = { za_czlowiekiem: 0.99, strefowe: 1 }[s.taktyka.krycie ?? "strefowe"];
  const mojAtakInstr = stylAtak * liniaAtak * szerAtak;
  const mojObrInstr = stylKonc * liniaKonc * szerKonc * krycieKonc;
  const instrFD = domMoj ? mojAtakInstr : goscMoj ? mojObrInstr : 1; // na atak gospodarza
  const instrFG = goscMoj ? mojAtakInstr : domMoj ? mojObrInstr : 1; // na atak gościa
  const lamD = xg(sd.atak, sg.obrona) * domAtut * nd.swoje * ng.rywala * amator * pog * (domMoj ? mojAtak : 1) * (goscMoj ? mojaObrona : 1) * anBoost(dom.klubId) * obrSzt(gosc.klubId) * seriaMod(dom.klubId) * instrFD;
  const lamG = xg(sg.atak, sd.obrona) * 0.92 * ng.swoje * nd.rywala * amator * pog * (goscMoj ? mojAtak : 1) * (domMoj ? mojaObrona : 1) * anBoost(gosc.klubId) * obrSzt(dom.klubId) * seriaMod(gosc.klubId) * instrFG;
  // Instrukcje taktyczne mojego klubu (tempo, pressing). Rywal/AI gra na ustawieniach domyślnych.
  const tempoMn = (k: string) => { const t = k === s.mojKlub ? s.taktyka.tempo : undefined; return t === "szybkie" ? 1.08 : t === "wolne" ? 0.93 : 1; };
  const pressOwn = (k: string) => { const p = k === s.mojKlub ? s.taktyka.pressing : undefined; return p === "wysoki" ? 1.05 : p === "niski" ? 0.96 : 1; };
  const pressLeak = (k: string) => { const p = k === s.mojKlub ? s.taktyka.pressing : undefined; return p === "wysoki" ? 1.05 : p === "niski" ? 0.95 : 1; };
  const tempoAll = tempoMn(dom.klubId) * tempoMn(gosc.klubId);
  let gd = Math.min(8, poisson(lamD * tempoAll * pressOwn(dom.klubId) * pressLeak(gosc.klubId)));
  let gg = Math.min(8, poisson(lamG * tempoAll * pressOwn(gosc.klubId) * pressLeak(dom.klubId)));
  if (Math.abs(gd - gg) === 1 && szansa(0.10)) { if (gd > gg) gg++; else gd++; }

  // Strzelcy z zawodników, którzy byli na boisku (XI + wchodzący). Snajper strzela częściej; egzekutor bierze karne.
  const gole = (d: Druzyna, naBoisku: Set<string>, rywalBoisku: Set<string>, ile: number) => {
    const zs = [...naBoisku].map((id) => s.zawodnicy[id]).filter(Boolean);
    if (!zs.length) return; // brak uprawnionych zawodników na boisku (skrajny przypadek) — bez strzelców
    // Wykonawcy stałych fragmentów: klub gracza — wyznaczeni (jeśli na boisku), inaczej/AI — najlepszy wg cechy fragmentu.
    const mojTeam = d.klubId === s.mojKlub;
    const naBoiskuId = (id?: string) => !!id && zs.some((z) => z.id === id);
    const ocSFG = (z: Zawodnik, r: "karne" | "wolne" | "rozne") => { const a = z.atrybuty; if (!a) return z.umiej; if (r === "karne") return a.str + (z.cechy?.includes("egzekutor") ? 8 : 0); if (r === "wolne") return a.str * 0.6 + a.dry * 0.5 + a.pod * 0.2; return a.pod * 0.6 + a.dry * 0.5; };
    const najlepszySFG = (r: "karne" | "wolne" | "rozne") => [...zs].filter((z) => z.poz !== "BR").sort((a, b) => ocSFG(b, r) - ocSFG(a, r))[0] ?? zs[0];
    const wykonawcaSFG = (r: "karne" | "wolne" | "rozne") => (mojTeam && naBoiskuId(s.wykonawcy?.[r]) ? s.zawodnicy[s.wykonawcy![r]!] : najlepszySFG(r));
    for (let i = 0; i < ile; i++) {
      // Gol samobójczy (C1): ~2% bramek — zdobywa je obrońca/bramkarz RYWALA; zaliczone drużynie (gd/gg), bez strzelca z ekipy.
      if (szansa(0.022)) {
        const obr = [...rywalBoisku].map((id) => s.zawodnicy[id]).filter((z) => z && (z.poz === "OBR" || z.poz === "BR"));
        const so = obr.length ? wybierzWazone(obr, (z) => (z.poz === "OBR" ? 3 : 1)) : undefined;
        zdarzenia.push({ min: losInt(1, 90), klubId: d.klubId, typ: "samoboj", zawodnikId: so?.id ?? "", opis: so ? `gol samobójczy (${so.imie} ${so.nazwisko})` : "gol samobójczy" });
        continue;
      }
      const karny = szansa(0.09); // część goli to rzuty karne
      const wolny = !karny && szansa(0.05); // gol z rzutu wolnego
      const rozny = !karny && !wolny && szansa(0.1); // gol po rzucie rożnym (główką) — wykonawca dośrodkowania asystuje
      let strzelec: Zawodnik;
      if (karny) strzelec = wykonawcaSFG("karne");
      else if (wolny) strzelec = wykonawcaSFG("wolne");
      else if (rozny) strzelec = wybierzWazone(zs, (z) => ({ OBR: 3, NAP: 3.2, POM: 1, BR: 0 })[z.poz] * Math.max(5, (z.atrybuty?.fiz ?? 10)));
      else strzelec = wybierzWazone(zs, (z) => ({ NAP: 5, POM: 2.2, OBR: 0.6, BR: 0.02 })[z.poz] * (z.cechy?.includes("snajper") ? 1.6 : 1) * Math.max(5, z.umiej));
      // Asysta z rożnego dla wyznaczonego wykonawcy dośrodkowań.
      if (rozny) { const as = wykonawcaSFG("rozne"); if (as && as.id !== strzelec.id) as.asysty++; }
      strzelec.gole++;
      strzelec.goleKariera = (strzelec.goleKariera ?? 0) + 1;
      if (d.klubId === s.mojKlub && [25, 50, 100, 150, 200].includes(strzelec.goleKariera)) s.wiadomosci.push({ sezon: s.sezon, kolejka: s.kolejka, tekst: `⚽ Rekord: ${strzelec.imie} ${strzelec.nazwisko} strzelił ${strzelec.goleKariera}. gola w karierze!` });
      strzelec.forma = Math.min(5, strzelec.forma + 0.6); // gol napędza gorącą passę
      // Premia kontraktowa za gola (zawodowcy, poziom 1–4) — wypłacana z kasy klubu, podnosi morale.
      { const pr = [25000, 12000, 5000, 2000][s.kluby[d.klubId].poziom - 1] ?? 0;
        if (pr) { s.kluby[d.klubId].kasa -= pr; strzelec.morale = Math.min(100, strzelec.morale + 1); } }
      goleM.set(strzelec.id, (goleM.get(strzelec.id) ?? 0) + 1);
      const min = losInt(1, 90);
      zdarzenia.push({ min, klubId: d.klubId, typ: "gol", zawodnikId: strzelec.id, opis: karny ? "rzut karny" : "" });
      if (karny) zdarzenia.push({ min, klubId: d.klubId, typ: "karny", zawodnikId: strzelec.id, opis: "wykorzystany" });
      if (!karny && szansa(0.65)) {
        const kandydaci = zs.filter((z) => z.id !== strzelec.id);
        if (kandydaci.length) { const a = wybierzWazone(kandydaci, (z) => ({ NAP: 3, POM: 4, OBR: 1.2, BR: 0.05 })[z.poz] * Math.max(5, z.umiej)); a.asysty++; asyM.set(a.id, (asyM.get(a.id) ?? 0) + 1); }
      }
    }
  };
  gole(dom, pD.naBoisku, pG.naBoisku, gd);
  gole(gosc, pG.naBoisku, pD.naBoisku, gg);

  const czysteKonto = (linia: string[], stracone: number) => {
    if (stracone > 0) return;
    const br = linia.map((id) => s.zawodnicy[id]).find((z) => z && z.poz === "BR");
    if (br) br.czysteKonta++;
  };
  czysteKonto(pD.linia, gg);
  czysteKonto(pG.linia, gd);

  // Ocena meczu 1–10 dla wszystkich, którzy zagrali (XI + wchodzący).
  const ocenDruzyne = (naBoisku: Set<string>, strzelone: number, stracone: number) => {
    const wynik = strzelone > stracone ? 1 : strzelone < stracone ? -1 : 0;
    for (const id of naBoisku) {
      const z = s.zawodnicy[id];
      if (!z) continue;
      let o = 6.0 + (z.umiej - 50) / 100 * 0.8;
      const g = goleM.get(id) ?? 0, a = asyM.get(id) ?? 0;
      o += g * (z.poz === "OBR" || z.poz === "BR" ? 1.8 : z.poz === "POM" ? 1.4 : 1.1);
      o += a * 0.8;
      if (z.poz === "BR" || z.poz === "OBR") {
        if (stracone === 0) o += z.poz === "BR" ? 1.6 : 0.8;
        else o -= Math.min(1.8, stracone * (z.poz === "BR" ? 0.5 : 0.35));
      }
      o += wynik === 1 ? 0.5 : wynik === -1 ? -0.4 : 0;
      o += z.forma * 0.06;
      const k = kartaM.get(id);
      if (k === "czerwona") o -= 2.6; else if (k === "zolta") o -= 0.3;
      o += los(-0.4, 0.4);
      z.ocenaMeczu = Math.max(1, Math.min(10, Math.round(o * 10) / 10));
    }
  };
  ocenDruzyne(pD.naBoisku, gd, gg);
  ocenDruzyne(pG.naBoisku, gg, gd);

  // ——— VAR (C1): tylko Ekstraklasa/I liga/Puchar Polski — zdarzenia opisowe, NIE zmieniają wyniku (spójne z gd/gg). ———
  if (zZdarzeniami && varMecz && szansa(0.35)) {
    const opisy = [
      "sprawdzenie bramki przez VAR — gol uznany",
      "analiza VAR w polu karnym — bez podyktowania rzutu karnego",
      "VAR sprawdza możliwy spalony — decyzja boiskowa utrzymana",
      "interwencja VAR — żółta zamiast czerwonej po powtórce",
      "VAR potwierdza prawidłową pozycję przy golu",
    ];
    zdarzenia.push({ min: losInt(10, 90), klubId: szansa(0.5) ? dom.klubId : gosc.klubId, typ: "var", zawodnikId: "", opis: wybierz(opisy) });
  }
  // ——— Doliczony czas (C1): skalowany liczbą goli, kartek, zmian i interwencji VAR; późne gole padają w doliczonym. ———
  let doliczony: Wynik["doliczony"];
  if (zZdarzeniami) {
    const przerwania = zdarzenia.filter((z) => z.typ !== "gol").length;
    const d1 = losInt(1, 3);
    const d2 = Math.max(2, Math.min(9, 2 + Math.floor((gd + gg) / 2) + Math.floor(przerwania / 3) + losInt(0, 2)));
    doliczony = [d1, d2];
    for (const z of zdarzenia) if (z.typ === "gol" && z.min >= 86 && szansa(0.5)) z.min = 90 + losInt(1, d2); // „90+N"
  }

  zdarzenia.sort((a, b) => a.min - b.min);
  // Statystyki meczu (posiadanie/strzały/celne/rożne) — pokazywane w relacji meczów gracza.
  let staty: Wynik["staty"];
  if (zZdarzeniami) {
    const sumD = sd.atak + sd.obrona, sumG = sg.atak + sg.obrona;
    const posD = Math.max(32, Math.min(68, Math.round(50 + (sumD - sumG) * 1.1)));
    const strz = (lam: number, g: number) => Math.max(g, Math.round(lam * 4 + los(-1, 2)));
    const celne = (lam: number, g: number) => Math.max(g, Math.round(g + lam * 1.4));
    const roz = (lam: number) => Math.max(0, Math.round(lam * 2.3 + los(-1, 2)));
    const strzD = strz(lamD, gd), strzG = strz(lamG, gg);
    const celD = celne(lamD, gd), celG = celne(lamG, gg);
    // xG ~ oczekiwane gole (z modelu lambda, skala zbliżona do realnych wartości); faule/spalone/słupki/obrony wyliczane spójnie.
    const xgv = (lam: number) => Math.round(lam * 10) / 10;
    const faulM = () => Math.max(4, Math.round(10 + los(-4, 6)));
    const spalM = (lam: number) => Math.max(0, Math.round(lam * 0.9 + los(-1, 2)));
    const slupkiM = (strzaly: number) => szansa(Math.min(0.6, strzaly * 0.04)) ? 1 : 0;
    staty = {
      pos: [posD, 100 - posD], strz: [strzD, strzG], celne: [celD, celG], rozne: [roz(lamD), roz(lamG)],
      xg: [xgv(lamD), xgv(lamG)], faule: [faulM(), faulM()], spalone: [spalM(lamD), spalM(lamG)],
      slupki: [slupkiM(strzD), slupkiM(strzG)],
      obronione: [Math.max(0, celG - gg), Math.max(0, celD - gd)], // obrony bramkarza = celne rywala minus gole rywala
    };
  }
  // Obsada sędziowska (sedzia) policzona na początku meczu — patrz C2 wyżej.
  return { dom: dom.klubId, gosc: gosc.klubId, gd, gg, zdarzenia: zZdarzeniami ? zdarzenia : undefined, kara: karaMoja || undefined, staty, sedzia, doliczony };
}

/** Rozliczenie meczu rozegranego na żywo (scenariusz z meczNaZywo) — te same skutki, co zwykła symulacja. */
export function meczZeScenariusza(s: StanGry, m: import("./meczNaZywo").MeczLive): Wynik {
  const zdarzenia: Zdarzenie[] = [];
  const KARA_CZERWONA = [4000, 2500, 1500, 800, 400, 250, 150, 100, 80];
  const KARA_ZOLTA = [500, 350, 200, 120, 70, 45, 30, 20, 15];
  let karaMoja = 0;
  const goleM = new Map<string, number>(), asyM = new Map<string, number>(), kartaM = new Map<string, "zolta" | "czerwona">();
  for (const zesp of [m.dom, m.gosc]) {
    const pz = s.kluby[zesp.klubId].poziom;
    for (const id of zesp.zagrali) {
      const z = s.zawodnicy[id]; if (!z) continue;
      z.mecze++; z.meczeKariera = (z.meczeKariera ?? 0) + 1; z.zgranie = Math.min(100, (z.zgranie ?? 80) + 2.5);
      z.kondycja = Math.max(30, z.kondycja);
    }
    for (const k of m.kartki.filter((x) => x.klubId === zesp.klubId)) {
      const z = s.zawodnicy[k.id]; if (!z) continue;
      if (k.typ === "zolta") {
        z.kartki++; kartaM.set(z.id, "zolta"); s.kluby[zesp.klubId].kasa -= KARA_ZOLTA[pz - 1]; if (zesp.klubId === s.mojKlub) karaMoja += KARA_ZOLTA[pz - 1];
        zdarzenia.push({ min: k.min, klubId: zesp.klubId, typ: "zolta", zawodnikId: z.id, opis: `${z.kartki}. żółta` });
        if (z.kartki % 4 === 0) { const pauza = z.kartki >= 12 ? 2 : 1; z.zawieszenie = Math.max(z.zawieszenie, pauza); zdarzenia.push({ min: 90, klubId: zesp.klubId, typ: "zawieszenie", zawodnikId: z.id, opis: `${z.kartki} żółtych — pauza ${pauza} kol.` }); }
      } else {
        const druga = k.opis === "druga żółta";
        if (druga) z.kartki++;
        z.zawieszenie = Math.max(z.zawieszenie, druga ? 1 : szansa(0.3) ? losInt(3, 6) : losInt(1, 2));
        kartaM.set(z.id, "czerwona");
        const kara = KARA_CZERWONA[pz - 1] * (z.zawieszenie >= 3 ? 2 : 1);
        s.kluby[zesp.klubId].kasa -= kara; if (zesp.klubId === s.mojKlub) karaMoja += kara;
        zdarzenia.push({ min: k.min, klubId: zesp.klubId, typ: "czerwona", zawodnikId: z.id, opis: druga ? "druga żółta — pauza 1 kol." : `pauza ${z.zawieszenie}` });
      }
    }
    for (const u of m.urazy.filter((x) => x.klubId === zesp.klubId)) {
      const z = s.zawodnicy[u.id]; if (!z) continue;
      let tyg = u.tyg; if (zesp.klubId === s.mojKlub) tyg = Math.max(1, tyg - skrocenieKontuzji(s) * (tyg >= 6 ? 2 : 1));
      z.kontuzja = tyg; z.urazy = (z.urazy ?? 0) + 1;
      zdarzenia.push({ min: u.min, klubId: zesp.klubId, typ: "kontuzja", zawodnikId: z.id, opis: `${u.opis} — ${tyg} kol.` });
    }
    for (const x of m.zmianyLog.filter((x) => x.klubId === zesp.klubId))
      zdarzenia.push({ min: x.min, klubId: zesp.klubId, typ: "zmiana", zawodnikId: x.wchodzi, opis: x.powod === "kontuzja" ? "za kontuzjowanego" : "zmiana" });
    if (zesp.klubId === s.mojKlub) { const kl = s.kluby[zesp.klubId]; kl.znajomoscFormacji = kl.znajomoscFormacji ?? {}; kl.znajomoscFormacji[zesp.formacja] = (kl.znajomoscFormacji[zesp.formacja] ?? 0) + 1; }
  }
  for (const g of m.gole) {
    if (g.typ === "samoboj") { zdarzenia.push({ min: g.min, klubId: g.klubId, typ: "samoboj", zawodnikId: g.strzelec, opis: "gol samobójczy" }); continue; }
    const z = s.zawodnicy[g.strzelec]; if (!z) continue;
    z.gole++; z.goleKariera = (z.goleKariera ?? 0) + 1; z.forma = Math.min(5, z.forma + 0.6);
    const pr = [25000, 12000, 5000, 2000][s.kluby[g.klubId].poziom - 1] ?? 0; if (pr) { s.kluby[g.klubId].kasa -= pr; z.morale = Math.min(100, z.morale + 1); }
    goleM.set(z.id, (goleM.get(z.id) ?? 0) + 1);
    zdarzenia.push({ min: g.min, klubId: g.klubId, typ: "gol", zawodnikId: z.id, opis: g.typ === "karny" ? "rzut karny" : "" });
    if (g.typ === "karny") zdarzenia.push({ min: g.min, klubId: g.klubId, typ: "karny", zawodnikId: z.id, opis: "wykorzystany" });
    if (g.asysta && s.zawodnicy[g.asysta]) { s.zawodnicy[g.asysta].asysty++; asyM.set(g.asysta, (asyM.get(g.asysta) ?? 0) + 1); }
  }
  const czyste = (zesp: typeof m.dom, stracone: number) => { if (stracone) return; const br = zesp.naBoisku.map((id) => s.zawodnicy[id]).find((z) => z?.poz === "BR"); if (br) br.czysteKonta++; };
  czyste(m.dom, m.gg); czyste(m.gosc, m.gd);
  const ocen = (zesp: typeof m.dom, str: number, stra: number) => {
    const w = str > stra ? 1 : str < stra ? -1 : 0;
    for (const id of zesp.zagrali) {
      const z = s.zawodnicy[id]; if (!z) continue;
      let o = 6.0 + (z.umiej - 50) / 100 * 0.8 + (goleM.get(id) ?? 0) * (z.poz === "OBR" || z.poz === "BR" ? 1.8 : z.poz === "POM" ? 1.4 : 1.1) + (asyM.get(id) ?? 0) * 0.8;
      if (z.poz === "BR" || z.poz === "OBR") o += stra === 0 ? (z.poz === "BR" ? 1.6 : 0.8) : -Math.min(1.8, stra * (z.poz === "BR" ? 0.5 : 0.35));
      o += w === 1 ? 0.5 : w === -1 ? -0.4 : 0; o += z.forma * 0.06;
      const k = kartaM.get(id); if (k === "czerwona") o -= 2.6; else if (k === "zolta") o -= 0.3;
      z.ocenaMeczu = Math.max(1, Math.min(10, Math.round((o + los(-0.4, 0.4)) * 10) / 10));
    }
  };
  if (m.oceny && Object.keys(m.oceny).length) { for (const zesp of [m.dom, m.gosc]) for (const id of zesp.zagrali) { const z = s.zawodnicy[id]; if (z && m.oceny[id] !== undefined) z.ocenaMeczu = Math.round(m.oceny[id] * 10) / 10; } }
  else { ocen(m.dom, m.gd, m.gg); ocen(m.gosc, m.gg, m.gd); }
  const pObsady = Math.min(s.kluby[m.dom.klubId].poziom, s.kluby[m.gosc.klubId].poziom);
  let sedzia: Wynik["sedzia"] = obsadaMeczu(s, pObsady, 1, {});
  { const h = hashTekst(sedzia.glowny); const sur = 0.72 + (h % 1000) / 1000 * 0.56; sedzia = { ...sedzia, styl: sur >= 1.15 ? "surowy" : sur <= 0.85 ? "łagodny" : "normalny" }; }
  zdarzenia.sort((a, b) => a.min - b.min);
  const st = m.staty, posD = Math.round(st.posD / Math.max(1, st.posN) * 100);
  const staty: Wynik["staty"] = {
    pos: [posD, 100 - posD], strz: st.strz, celne: st.celne, rozne: st.rozne, faule: st.faule, spalone: st.spalone,
    xg: [Math.round((st.xg?.[0] ?? 0) * 10) / 10, Math.round((st.xg?.[1] ?? 0) * 10) / 10], slupki: st.slupki ?? [0, 0],
    obronione: st.obrony ?? [Math.max(0, st.celne[1] - m.gg), Math.max(0, st.celne[0] - m.gd)],
  };
  return { dom: m.dom.klubId, gosc: m.gosc.klubId, gd: m.gd, gg: m.gg, zdarzenia, kara: karaMoja || undefined, staty, sedzia, doliczony: m.dolicz };
}

// Muzeum klubu: historia sezonów (z kadencji trenera), legendy klubu (najwięcej meczów / goli w barwach klubu),
// zastrzeżone numery (Klub.numeryZastrzezone — nadawane przy pożegnaniu legendy w nowySezon, tu też ręcznie)
// i gablota trofeów. Zawodnicy kończący kariery są usuwani ze stanu, więc dorobek legend jest zapisywany
// na bieżąco w s.muzeum (dla każdego klubu prowadzonego przez trenera).
import type { Historia, Pozycja, StanGry, TwarzCechy, Zawodnik } from "./types";

export interface LegendaKlubu {
  id: string;
  imie: string;
  nazwisko: string;
  poz: Pozycja;
  numer: number;
  mecze: number; // mecze w barwach klubu (cała historia zawodnika w klubie)
  gole: number;
  od: number; // pierwszy sezon w klubie
  do: number | null; // null = nadal w kadrze
  wychowanek?: boolean;
  kraj?: string;
  twarz?: TwarzCechy;
  kapitan?: boolean; // był kapitanem za kadencji trenera
}
export interface ZastrzezonyNumer { numer: number; imie?: string; nazwisko?: string; sezon: number; id?: string }
export interface MuzeumKlubu { klubId: string; legendy: Record<string, LegendaKlubu>; zastrzezone: ZastrzezonyNumer[] }

type ZMuzeum = StanGry & { muzeum?: Record<string, MuzeumKlubu> };

export const MAX_ZASTRZEZONYCH = 6;
/** Próg legendy (jak w nowySezon: 300 meczów, wychowanek 150) — tu łagodniej dla ręcznego zastrzeżenia numeru. */
export const progLegendy = (l: Pick<LegendaKlubu, "mecze" | "wychowanek">) => l.mecze >= (l.wychowanek ? 100 : 150);

export function muzeumKlubu(s: StanGry, klubId: string): MuzeumKlubu {
  const x = s as ZMuzeum;
  if (!x.muzeum) x.muzeum = {};
  if (!x.muzeum[klubId]) x.muzeum[klubId] = { klubId, legendy: {}, zastrzezone: [] };
  return x.muzeum[klubId];
}
/** Muzeum klubu bez tworzenia (do odczytu w UI). */
export function muzeumOdczyt(s: StanGry, klubId: string): MuzeumKlubu | undefined {
  return (s as ZMuzeum).muzeum?.[klubId];
}

/** Dorobek zawodnika w barwach klubu (zamknięte etapy kariery + bieżący sezon). */
export function dorobekWKlubie(z: Zawodnik, nazwaKlubu: string): { mecze: number; gole: number; od: number | null } {
  let mecze = 0, gole = 0, od: number | null = null;
  for (const w of z.kariera ?? []) {
    if (w.klub !== nazwaKlubu) continue;
    mecze += w.mecze || 0; gole += w.gole || 0;
    od = od == null ? w.od : Math.min(od, w.od);
    if (w.do === null) { mecze += z.mecze || 0; gole += z.gole || 0; } // bieżący sezon jeszcze nie doliczony
  }
  return { mecze, gole, od };
}

/** Aktualizuje zapis legend i zastrzeżonych numerów dla klubu gracza (idempotentne). */
export function aktualizujMuzeum(s: StanGry) {
  if (s.zwolniony) return;
  const k = s.kluby[s.mojKlub];
  if (!k) return;
  const mu = muzeumKlubu(s, k.id);
  const wKadrze = new Set(k.zawodnicy);
  for (const id of k.zawodnicy) {
    const z = s.zawodnicy[id];
    if (!z) continue;
    const d = dorobekWKlubie(z, k.nazwa);
    if (d.mecze <= 0 && d.gole <= 0) continue;
    const st = mu.legendy[id];
    mu.legendy[id] = {
      id, imie: z.imie, nazwisko: z.nazwisko, poz: z.poz, numer: z.numer || st?.numer || 0,
      mecze: Math.max(d.mecze, st?.mecze ?? 0), gole: Math.max(d.gole, st?.gole ?? 0),
      od: Math.min(d.od ?? s.sezon, st?.od ?? 9999), do: null,
      wychowanek: z.wychowanek === k.nazwa || st?.wychowanek, kraj: z.kraj, twarz: z.twarz ?? st?.twarz,
      kapitan: st?.kapitan || s.kapitan === id,
    };
  }
  for (const l of Object.values(mu.legendy)) if (l.do === null && !wKadrze.has(l.id)) l.do = s.sezon; // odszedł / zakończył karierę
  // Przycinanie: trzymaj najlepszych 40 po meczach i 40 po golach + wszystkich z zastrzeżonym numerem.
  const wszyscy = Object.values(mu.legendy);
  if (wszyscy.length > 90) {
    const zostaw = new Set<string>([
      ...[...wszyscy].sort((a, b) => b.mecze - a.mecze).slice(0, 40).map((l) => l.id),
      ...[...wszyscy].sort((a, b) => b.gole - a.gole).slice(0, 40).map((l) => l.id),
      ...mu.zastrzezone.map((n) => n.id).filter((x): x is string => !!x),
      ...k.zawodnicy,
    ]);
    for (const l of wszyscy) if (!zostaw.has(l.id)) delete mu.legendy[l.id];
  }
  // Zastrzeżone numery nadane przez silnik (pożegnanie legendy) — dopasuj nazwisko z wiadomości lub z zapisu legend.
  for (const n of k.numeryZastrzezone ?? []) {
    if (mu.zastrzezone.some((x) => x.numer === n)) continue;
    const re = new RegExp(`Mecz pożegnalny (.+?) przy kompletnych trybunach\\. Numer ${n} zostaje zastrzeżony`);
    const w = s.wiadomosci.find((x) => re.test(x.tekst));
    const imieNazw = w?.tekst.match(re)?.[1];
    const kand = Object.values(mu.legendy).filter((l) => l.numer === n && l.do !== null).sort((a, b) => b.mecze - a.mecze)[0];
    const l = imieNazw ? Object.values(mu.legendy).find((x) => `${x.imie} ${x.nazwisko}` === imieNazw) ?? kand : kand;
    mu.zastrzezone.push({ numer: n, imie: l?.imie ?? imieNazw?.split(" ")[0], nazwisko: l?.nazwisko ?? imieNazw?.split(" ").slice(1).join(" "), sezon: w?.sezon ?? s.sezon, id: l?.id });
  }
}

/** Czy można ręcznie zastrzec numer legendy (odeszła / zakończyła karierę, spełnia próg, numer wolny w kadrze). */
export function mozeZastrzec(s: StanGry, klubId: string, legendaId: string): string | null {
  const k = s.kluby[klubId];
  const mu = muzeumOdczyt(s, klubId);
  const l = mu?.legendy[legendaId];
  if (!k || !l) return "Brak zawodnika w muzeum.";
  if (klubId !== s.mojKlub || s.zwolniony) return "Numery zastrzega tylko obecny klub.";
  if (l.do === null) return "Numer zastrzega się dopiero po odejściu zawodnika.";
  if (!l.numer) return "Zawodnik nie miał numeru.";
  if (!progLegendy(l)) return `Za mały dorobek (${l.mecze} meczów; potrzeba ${l.wychowanek ? 100 : 150}).`;
  if ((k.numeryZastrzezone ?? []).includes(l.numer)) return "Ten numer jest już zastrzeżony.";
  if ((k.numeryZastrzezone ?? []).length >= MAX_ZASTRZEZONYCH) return `Klub ma już ${MAX_ZASTRZEZONYCH} zastrzeżonych numerów.`;
  if (k.zawodnicy.some((id) => s.zawodnicy[id]?.numer === l.numer)) return `Numer ${l.numer} nosi obecnie zawodnik kadry — zastrzeżenie po jego zmianie.`;
  return null;
}
/** Zastrzega numer legendy (trwale — silnik nie nada go nowym zawodnikom). Zwraca błąd albo null. */
export function zastrzezNumer(s: StanGry, klubId: string, legendaId: string): string | null {
  const blad = mozeZastrzec(s, klubId, legendaId);
  if (blad) return blad;
  const k = s.kluby[klubId];
  const l = muzeumKlubu(s, klubId).legendy[legendaId];
  k.numeryZastrzezone = [...(k.numeryZastrzezone ?? []), l.numer];
  muzeumKlubu(s, klubId).zastrzezone.push({ numer: l.numer, imie: l.imie, nazwisko: l.nazwisko, sezon: s.sezon, id: l.id });
  s.zaufanieKibicow = Math.min(100, (s.zaufanieKibicow ?? 60) + 3);
  s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🏛 Numer ${l.numer} zastrzeżony na cześć ${l.imie} ${l.nazwisko} (${l.mecze} meczów, ${l.gole} goli w klubie). Koszulka trafia do muzeum.` });
  return null;
}

/** Sezony klubu z kadencji trenera (historia przypisana po etapach trenerKariera). */
export function sezonyKlubu(s: StanGry, nazwaKlubu: string): Historia[] {
  const kar = s.trenerKariera ?? [];
  return (s.historia ?? []).filter((h) => {
    // ostatni etap obejmujący sezon decyduje (przy zmianie klubu w trakcie sezonu)
    for (let i = kar.length - 1; i >= 0; i--) { const w = kar[i]; if (w.od <= h.sezon && (w.do == null || w.do >= h.sezon)) return w.klub === nazwaKlubu; }
    return false;
  });
}

export interface Trofeum { ikona: string; nazwa: string; sezon: number }
/** Trofea klubu zdobyte za kadencji trenera (tytuły, awanse, puchary, Europa). */
export function trofeaKlubu(s: StanGry, nazwaKlubu: string): Trofeum[] {
  const t: Trofeum[] = [];
  for (const h of sezonyKlubu(s, nazwaKlubu)) {
    if (h.miejsce === 1) t.push({ ikona: "🏆", nazwa: `Mistrzostwo — ${h.liga}`, sezon: h.sezon });
    else if (h.wynik === "awans") t.push({ ikona: "⬆️", nazwa: `Awans z ${h.liga}`, sezon: h.sezon });
    if (h.puchar) t.push({ ikona: "🥇", nazwa: h.puchar === "glowny" ? "Puchar Polski" : "Puchar Polski (region)", sezon: h.sezon });
  }
  const dz = (s as StanGry & { dziennik?: { momenty: { klucz: string; sezon: number; tytul: string; klub?: string }[] } }).dziennik;
  for (const m of dz?.momenty ?? []) if (m.klucz.startsWith("europaZdobyta|") && m.klub === nazwaKlubu) t.push({ ikona: "🌍", nazwa: m.tytul.replace(/^Triumf w rozgrywkach: /, "").replace(/!$/, ""), sezon: m.sezon });
  return t.sort((a, b) => a.sezon - b.sezon);
}

/** Legendy klubu: ranking po meczach i po golach. */
export function legendyKlubu(s: StanGry, klubId: string, ile = 10): { mecze: LegendaKlubu[]; gole: LegendaKlubu[] } {
  const l = Object.values(muzeumOdczyt(s, klubId)?.legendy ?? {});
  return {
    mecze: [...l].sort((a, b) => b.mecze - a.mecze || b.gole - a.gole).slice(0, ile),
    gole: [...l].filter((x) => x.gole > 0).sort((a, b) => b.gole - a.gole || a.mecze - b.mecze).slice(0, ile),
  };
}

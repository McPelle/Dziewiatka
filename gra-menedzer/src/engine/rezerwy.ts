// Zespoły jednego klubu (I, II, III) — wspólna kadra i powołania między zespołami, wzorowane na regulaminach ZPN:
// • w górę (z rezerw do wyższego zespołu) — bez ograniczeń,
// • w dół (z wyższego zespołu do rezerw): młodzieżowcy (U-21) bez limitu; starszych, którzy zagrali w ostatnim
//   meczu wyższego zespołu, najwyżej LIMIT_STARSZYCH w jednym meczu rezerw,
// • w 4 ostatnich kolejkach zespołu niższego nie może w nim zagrać zawodnik, który rozegrał ponad połowę meczów
//   wyższego zespołu w sezonie (ochrona przed „wzmacnianiem" rezerw na finisz),
// • zawodnik gra jeden mecz w kolejce — powołany do innego zespołu jest niedostępny dla swojego.
import { jestMlodziezowcem } from "./swiat";
import type { Klub, StanGry, Zawodnik } from "./types";

export const LIMIT_STARSZYCH = 3;
const RE = /\s+(II|III|IV|2|3)(?=\s|\/|$)/;
const rdzen = (n: string) => n.replace("II/KS", "KS").replace(RE, "").replace(/\s+/g, " ").trim().toLowerCase();
const numerZespolu = (n: string) => { const m = n.match(RE); return !m ? 1 : m[1] === "II" || m[1] === "2" ? 2 : m[1] === "III" || m[1] === "3" ? 3 : 4; };

/** Wszystkie zespoły klubu obecne w grze (I, II, III…), posortowane od pierwszego. */
export function zespolyKlubu(s: StanGry, klubId: string): Klub[] {
  const k = s.kluby[klubId];
  if (!k) return [];
  const r = rdzen(k.nazwa);
  return Object.values(s.kluby).filter((x) => !x.pozaPiramida && !x.pozaLiga && rdzen(x.nazwa) === r && x.miasto === k.miasto)
    .sort((a, b) => numerZespolu(a.nazwa) - numerZespolu(b.nazwa) || a.poziom - b.poziom);
}
export const nrZespolu = (k: Klub) => numerZespolu(k.nazwa);

function ostatnioGralW(s: StanGry, z: Zawodnik, zespolId: string): boolean {
  return (s.ostatnieSklady?.[zespolId] ?? []).includes(z.id);
}
/** Czy zawodnik `z` (z innego zespołu klubu) może zagrać w najbliższym meczu zespołu `doId`. Zwraca powód odmowy albo null. */
export function blokadaPowolania(s: StanGry, z: Zawodnik, doId: string, juzPowolani: string[] = []): string | null {
  const zespoly = zespolyKlubu(s, doId);
  const docel = s.kluby[doId];
  const zrodlo = z.klubId ? s.kluby[z.klubId] : undefined;
  if (!zrodlo || !zespoly.some((k) => k.id === zrodlo.id) || zrodlo.id === doId) return "Zawodnik nie należy do innego zespołu tego klubu.";
  if (z.kontuzja > 0 || z.zawieszenie > 0) return "Kontuzjowany albo zawieszony.";
  const wDol = nrZespolu(zrodlo) < nrZespolu(docel);
  if (!wDol) return null; // w górę — bez ograniczeń
  if (!jestMlodziezowcem(z) && ostatnioGralW(s, z, zrodlo.id)) {
    const ilu = juzPowolani.map((id) => s.zawodnicy[id]).filter((x) => x && x.klubId && nrZespolu(s.kluby[x.klubId]) < nrZespolu(docel) && !jestMlodziezowcem(x) && ostatnioGralW(s, x, x.klubId)).length;
    if (ilu >= LIMIT_STARSZYCH) return `Limit: najwyżej ${LIMIT_STARSZYCH} zawodników powyżej wieku młodzieżowca, którzy grali w ostatnim meczu wyższego zespołu.`;
  }
  const ligaD = s.ligi[docel.poziom - 1];
  const zostalo = (ligaD?.terminarz.length ?? 99) - s.kolejka;
  const meczeWyzszego = s.ligi[zrodlo.poziom - 1]?.wyniki.filter(Boolean).length ?? 0;
  if (zostalo <= 4 && meczeWyzszego > 0 && z.mecze > meczeWyzszego / 2)
    return "Ostatnie 4 kolejki: zawodnik, który rozegrał ponad połowę meczów wyższego zespołu, nie może grać w rezerwach.";
  return null;
}
/** Kandydaci do powołania z innych zespołów klubu dla Twojego zespołu. */
export function kandydaciZespolow(s: StanGry): { zespol: Klub; zawodnicy: Zawodnik[] }[] {
  return zespolyKlubu(s, s.mojKlub).filter((k) => k.id !== s.mojKlub).map((k) => ({
    zespol: k,
    zawodnicy: k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && z.kontuzja === 0 && z.zawieszenie === 0).sort((a, b) => b.umiej - a.umiej),
  }));
}
/** Powołaj zawodnika z innego zespołu klubu na najbliższy mecz Twojego zespołu. */
export function powolajZZespolu(s: StanGry, zId: string): string | null {
  const z = s.zawodnicy[zId];
  if (!z) return "Brak zawodnika.";
  const lista = s.powolaniKlubowi ?? [];
  if (lista.includes(zId)) return "Już powołany.";
  const b = blokadaPowolania(s, z, s.mojKlub, lista);
  if (b) return b;
  s.powolaniKlubowi = [...lista, zId];
  s.niedostepni[zId] = `powołany do ${s.kluby[s.mojKlub].nazwa}`; // nie zagra w swoim zespole w tej kolejce
  return null;
}
export function odeslijDoZespolu(s: StanGry, zId: string) {
  s.powolaniKlubowi = (s.powolaniKlubowi ?? []).filter((x) => x !== zId);
  s.taktyka.sklad = s.taktyka.sklad.filter((x) => x !== zId);
  delete s.niedostepni[zId];
}
/** AI: powołania między zespołami klubu (rezerwy biorą ławkowiczów i młodych z wyższego zespołu wg limitów). */
export function powolaniaAI(s: StanGry, klubId: string, xiWyzszych: Set<string>): string[] {
  const docel = s.kluby[klubId];
  const out: string[] = [];
  for (const k of zespolyKlubu(s, klubId)) {
    if (k.id === klubId || nrZespolu(k) >= nrZespolu(docel)) continue; // AI: tylko z wyższych zespołów w dół
    const kand = k.zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z && !xiWyzszych.has(z.id) && !s.niedostepni[z.id])
      .sort((a, b) => (jestMlodziezowcem(b) ? 1 : 0) - (jestMlodziezowcem(a) ? 1 : 0) || b.umiej - a.umiej);
    for (const z of kand) {
      if (out.length >= 5) break;
      if (!blokadaPowolania(s, z, klubId, out)) out.push(z.id);
    }
  }
  return out;
}

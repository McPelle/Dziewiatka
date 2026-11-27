// Zespoły jednego klubu (I, II, III) — wspólna kadra i gra w różnych zespołach wg uchwały PZPN IX/140 §4
// (powtórzonej w regulaminach ZZPN, K-PZPN, Pomorskiego ZPN 2026/27 i MZPN 2025/26):
// • w GÓRĘ — bez ograniczeń;
// • zasada 48 h: kto zagrał w kolejce w jednym zespole, nie zagra w tej samej kolejce w innym (bramkarze — też, bo w grze
//   mecze zespołów jednego klubu odbywają się w tym samym weekendzie);
// • w DÓŁ — klub z zespołem w Ekstraklasie/I/II lidze: do 22 lat bez limitu, starsi tracą prawo gry w niższym zespole
//   po 450 minutach (≈5 meczach) w wyższym zespole w danej rundzie;
// • w DÓŁ — klub, którego najwyższy zespół gra w III lidze lub niżej: po rozegraniu 2/3 meczów wyższego zespołu w sezonie
//   zawodnik traci prawo gry w niższym (Pomorski ZPN: zawodnicy do 21 lat bez tego limitu);
// • po zakończeniu sezonu wyższego zespołu w niższym zagra tylko ten, kto rozegrał w nim ponad 50% meczów.
import { jestMlodziezowcem } from "./swiat";
import type { Klub, StanGry, Zawodnik } from "./types";

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
/** Mecze zawodnika w bieżącej rundzie (jesień / wiosna). */
function meczeWRundzie(s: StanGry, z: Zawodnik): number {
  const pol = Math.ceil((s.ligi[0]?.terminarz.length ?? 34) / 2);
  return s.kolejka < pol ? z.mecze : Math.max(0, z.mecze - (z.meczeJesien ?? 0));
}
/** Czy zawodnik `z` (z innego zespołu klubu) może zagrać w najbliższym meczu zespołu `doId`. Zwraca powód odmowy albo null. */
export function blokadaPowolania(s: StanGry, z: Zawodnik, doId: string, _juz: string[] = []): string | null {
  const zespoly = zespolyKlubu(s, doId);
  const docel = s.kluby[doId];
  const zrodlo = z.klubId ? s.kluby[z.klubId] : undefined;
  if (!zrodlo || !zespoly.some((k) => k.id === zrodlo.id) || zrodlo.id === doId) return "Zawodnik nie należy do innego zespołu tego klubu.";
  if (z.kontuzja > 0 || z.zawieszenie > 0) return "Kontuzjowany albo zawieszony.";
  if (nrZespolu(zrodlo) > nrZespolu(docel)) return null; // w górę — bez ograniczeń (PZPN IX/140 §4)
  const najwyzszy = Math.min(...zespoly.map((k) => k.poziom));
  const rok = s.sezon + 1; // rok, w którym kończy się sezon
  if (najwyzszy <= 3) {
    // Klub z zespołem w Ekstraklasie/I/II lidze: do 22 lat bez limitu; starsi — max 450 min (≈5 meczów) w rundzie w wyższym zespole.
    const wiekWRoku = z.wiek + (rok - s.sezon);
    if (wiekWRoku > 22 && meczeWRundzie(s, z) >= 5) return "PZPN: starszy niż 22 lata, rozegrał w tej rundzie ponad 450 minut w wyższym zespole — nie może zagrać w rezerwach.";
  } else {
    // III liga i niżej: po 2/3 meczów wyższego zespołu traci prawo gry w niższym (Pomorski ZPN: do 21 lat zwolnieni).
    const pomorskie = /^Pomorskie/.test(s.sciezka ?? "");
    const zwolniony = pomorskie && z.wiek + (rok - s.sezon) <= 21;
    const meczeWyzszego = s.ligi[zrodlo.poziom - 1]?.wyniki.filter(Boolean).length ?? 0;
    if (!zwolniony && meczeWyzszego >= 3 && z.mecze >= Math.ceil(meczeWyzszego * 2 / 3))
      return "PZPN: rozegrał już 2/3 meczów wyższego zespołu w tym sezonie — stracił prawo gry w niższym zespole.";
  }
  const ligaG = s.ligi[zrodlo.poziom - 1];
  if (ligaG && ligaG.wyniki.filter(Boolean).length >= ligaG.terminarz.length) {
    const ligaD = s.ligi[docel.poziom - 1];
    const meczeNiz = ligaD?.wyniki.filter(Boolean).length ?? 0;
    if (meczeNiz > 0 && (z.meczeRezerwy ?? 0) <= meczeNiz / 2) return "PZPN: sezon wyższego zespołu zakończony — w niższym zagrają tylko zawodnicy z ponad 50% jego meczów.";
  }
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
      if (!blokadaPowolania(s, z, klubId)) out.push(z.id);
    }
  }
  return out;
}

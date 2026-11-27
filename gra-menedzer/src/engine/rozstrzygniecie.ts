// Rozstrzyganie meczów pucharowych i barażowych (symulacja, gdy mecz nie jest oglądany na żywo) — wg Przepisów Gry IFAB:
//  • 90 minut; przy remisie (jeśli regulamin rozgrywek przewiduje) dogrywka 2×15 min;
//  • dalej remis → rzuty karne: po 5 strzałów naprzemiennie (koniec wcześniej, gdy jedna drużyna nie może już dogonić),
//    potem „nagła śmierć” — po jednym, aż do pierwszej różnicy.
//  • Dwumecz (UEFA od 2021/22): liczy się tylko suma bramek, gole na wyjeździe NIE mają znaczenia; przy remisie w dwumeczu
//    dogrywka i karne na koniec rewanżu.
// Siła drużyn = średnia jedenastki (skala umiejętności), przewaga gospodarza (brak na neutralnym stadionie).

export interface Rozstrzygniecie { gd: number; gg: number; dogrywka: boolean; karne?: [number, number]; zwyciezca: "dom" | "gosc" | null; tekst: string }

function poisson(l: number): number { const L = Math.exp(-Math.max(0.01, l)); let k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }

/** Oczekiwane gole w 90 minut dla obu stron z różnicy sił (skala umiejętności 1–100). */
export function lambdy(silaD: number, silaG: number, atutGospodarza = true): [number, number] {
  const d = (silaD - silaG) / 11 + (atutGospodarza ? 0.22 : 0);
  return [Math.max(0.2, 1.35 * Math.exp(d * 0.55)), Math.max(0.2, 1.15 * Math.exp(-d * 0.55))];
}

/** Seria rzutów karnych (IFAB): 5 + nagła śmierć. Skuteczność ~75%, lekko zależna od siły (lepsi wykonawcy i bramkarze). */
export function seriaKarnych(silaD = 50, silaG = 50): { d: boolean[]; g: boolean[]; zwyciezca: "dom" | "gosc" } {
  const pD = Math.max(0.6, Math.min(0.88, 0.75 + (silaD - silaG) / 400)), pG = Math.max(0.6, Math.min(0.88, 0.75 + (silaG - silaD) / 400));
  const d: boolean[] = [], g: boolean[] = [];
  const suma = (a: boolean[]) => a.filter(Boolean).length;
  for (let i = 0; i < 5; i++) {
    d.push(Math.random() < pD); if (suma(d) > suma(g) + (5 - g.length) || suma(g) > suma(d) + (5 - d.length)) break;
    g.push(Math.random() < pG); if (suma(d) > suma(g) + (5 - g.length) || suma(g) > suma(d) + (5 - d.length)) break;
  }
  while (suma(d) === suma(g)) { d.push(Math.random() < pD); g.push(Math.random() < pG); if (d.length > 30) break; }
  return { d, g, zwyciezca: suma(d) > suma(g) ? "dom" : "gosc" };
}

/** Jeden mecz: 90 min → (opcjonalnie) dogrywka → (opcjonalnie) karne. `wymagaZwyciezcy` = mecz pucharowy/barażowy. */
export function rozstrzygnij(silaD: number, silaG: number, o: { dogrywka: boolean; wymagaZwyciezcy?: boolean; neutralny?: boolean; startD?: number; startG?: number } ): Rozstrzygniecie {
  const [lD, lG] = lambdy(silaD, silaG, !o.neutralny);
  let gd = poisson(lD), gg = poisson(lG); let dogrywka = false; let karne: [number, number] | undefined;
  const sumD = (o.startD ?? 0) + gd, sumG = (o.startG ?? 0) + gg; // dla rewanżu: bilans dwumeczu
  let rD = sumD, rG = sumG;
  if (o.wymagaZwyciezcy !== false && rD === rG) {
    if (o.dogrywka) { dogrywka = true; const eD = poisson(lD / 3 * 0.9), eG = poisson(lG / 3 * 0.9); gd += eD; gg += eG; rD += eD; rG += eG; }
    if (rD === rG) { const s = seriaKarnych(silaD, silaG); karne = [s.d.filter(Boolean).length, s.g.filter(Boolean).length]; }
  }
  const zwyciezca = karne ? (karne[0] > karne[1] ? "dom" : "gosc") : rD > rG ? "dom" : rG > rD ? "gosc" : null;
  return { gd, gg, dogrywka, karne, zwyciezca, tekst: opisWyniku(gd, gg, dogrywka, karne) };
}

/** „2:2 po dogr., k. 4:3” / „1:0 po dogr.” / „0:0, k. 5:4”. */
export function opisWyniku(gd: number, gg: number, dogrywka: boolean, karne?: [number, number]): string {
  return `${gd}:${gg}${dogrywka ? " po dogr." : ""}${karne ? `${dogrywka ? "," : ""} k. ${karne[0]}:${karne[1]}` : ""}`;
}

/** Dwumecz UEFA: suma bramek, bez reguły goli wyjazdowych; przy remisie dogrywka + karne w rewanżu.
 *  `a` gra pierwszy mecz u siebie. Zwraca wyniki obu meczów i zwycięzcę dwumeczu. */
export function dwumecz(silaA: number, silaB: number): { m1: Rozstrzygniecie; m2: Rozstrzygniecie; aggA: number; aggB: number; zwyciezcaA: boolean; tekst: string } {
  const m1 = rozstrzygnij(silaA, silaB, { dogrywka: false, wymagaZwyciezcy: false });
  // rewanż: gospodarzem B, bilans liczony z perspektywy gospodarza rewanżu
  const m2 = rozstrzygnij(silaB, silaA, { dogrywka: true, startD: m1.gg, startG: m1.gd });
  const aggA = m1.gd + m2.gg, aggB = m1.gg + m2.gd;
  const zwyciezcaA = m2.karne ? m2.karne[1] > m2.karne[0] : aggA > aggB;
  return { m1, m2, aggA, aggB, zwyciezcaA, tekst: `${m1.gd}:${m1.gg}, ${m2.gg}:${m2.gd}${m2.dogrywka ? " po dogr." : ""}${m2.karne ? `, k. ${m2.karne[1]}:${m2.karne[0]}` : ""} (dwumecz ${aggA}:${aggB})` };
}

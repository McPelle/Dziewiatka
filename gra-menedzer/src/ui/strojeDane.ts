// Komplety strojów klubów (3 dla zawodników z pola + 3 bramkarskie) i dobór na mecz bez kolizji kolorów —
// tak jak przed meczem robi sędzia: gospodarz gra w wybranym komplecie, gość zakłada taki, który się nie zlewa,
// bramkarze muszą się różnić od obu drużyn, a sędzia zakłada kolor różny od wszystkich.
import type { Klub } from "../engine/types";
import { barwyKlubu, barwyWyjazdowe, hashNazwy, odcien } from "./barwy";

export type Wzor = "jednolity" | "pasy" | "rekaw";
export interface Kit { baza: string; dodatek: string; wzor: Wzor; nazwa: string }

export function kity(klub: Klub): { pole: Kit[]; bramkarz: Kit[] } {
  const [p, d] = barwyKlubu(klub.nazwa);
  const wzorPole: Wzor = hashNazwy(klub.nazwa) % 3 === 0 ? "pasy" : hashNazwy(klub.nazwa) % 3 === 1 ? "rekaw" : "jednolity";
  return {
    pole: [
      { baza: p, dodatek: d, wzor: wzorPole, nazwa: "Domowy" },
      { baza: barwyWyjazdowe(klub.nazwa)[0], dodatek: barwyWyjazdowe(klub.nazwa)[1], wzor: "rekaw", nazwa: "Wyjazdowy" },
      { baza: odcien(p, -0.25), dodatek: d, wzor: "jednolity", nazwa: "Trzeci" },
    ],
    bramkarz: [
      { baza: "#1b8a3a", dodatek: "#0c3d1a", wzor: "rekaw", nazwa: "BR domowy" },
      { baza: "#f1c40f", dodatek: "#1a1a1a", wzor: "jednolity", nazwa: "BR wyjazdowy" },
      { baza: "#d81b60", dodatek: "#ffffff", wzor: "rekaw", nazwa: "BR trzeci" },
    ],
  };
}

const rgb = (hex: string) => { const h = hex.replace("#", ""); const v = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
/** Różnica kolorów (0–~765) ważona jak ludzkie oko. */
export function roznicaKolorow(a: string, b: string): number {
  const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b);
  const rm = (r1 + r2) / 2;
  return Math.sqrt((2 + rm / 256) * (r1 - r2) ** 2 + 4 * (g1 - g2) ** 2 + (2 + (255 - rm) / 256) * (b1 - b2) ** 2);
}
/** Czy dwa komplety się zlewają (koszulki zbyt podobne). */
export function zlewaSie(a: Kit, b: Kit): boolean {
  const g = (k: Kit) => (k.wzor === "pasy" ? [k.baza, k.dodatek] : [k.baza]);
  const d = Math.min(...g(a).flatMap((x) => g(b).map((y) => roznicaKolorow(x, y))));
  return d < 150;
}
export interface StrojeMeczu { dom: { pole: Kit; br: Kit }; gosc: { pole: Kit; br: Kit }; sedzia: Kit; wyborDom: [number, number]; wyborGosc: [number, number]; kolizja: boolean; uwagi: string[] }

/**
 * Dobór strojów wg uchwały PZPN IX/140 § 13 (i art. 6 regulaminu 1./2./3. Ligi):
 * ust. 1 — gospodarz gra w barwach klubowych i zawiadamia gościa o strojach; gość musi to uwzględnić;
 * ust. 2 — gdy mimo to stroje są podobne, na polecenie sędziego zmienia gospodarz, a karę dyscyplinarną ponosi gość;
 * ust. 3 — koszulka bramkarza musi kontrastować z koszulkami obu drużyn (inaczej zmienia bramkarz);
 * sędzia — koszulka odmienna od wszystkich (dostarcza gospodarz).
 * `moj` = wybór gracza [pole, bramkarz] dla jego drużyny.
 */
export function dobierzStroje(dom: Klub, gosc: Klub, mojaStrona: "dom" | "gosc", moj?: [number, number]): StrojeMeczu {
  const kd = kity(dom), kg = kity(gosc);
  const uwagi: string[] = [];
  const wolny = (lista: Kit[], zajete: Kit[], start = 0) => {
    for (let i = 0; i < lista.length; i++) { const j = (start + i) % lista.length; if (!zajete.some((z) => zlewaSie(lista[j], z))) return j; }
    return -1;
  };
  // gospodarz ogłasza strój (gracz-gospodarz wybiera sam, AI — strój domowy)
  let d0 = mojaStrona === "dom" ? moj?.[0] ?? 0 : 0;
  // gość dobiera strój, który się nie zlewa (gracz-gość: jego wybór, jeśli dozwolony)
  let g0 = mojaStrona === "gosc" && moj && !zlewaSie(kg.pole[moj[0]], kd.pole[d0]) ? moj[0] : wolny(kg.pole, [kd.pole[d0]], mojaStrona === "gosc" ? moj?.[0] ?? 1 : 1);
  let kolizja = false;
  if (g0 < 0) {
    // § 13 ust. 2: gość nie ma odmiennego kompletu → gospodarz zmienia na polecenie sędziego, karę płaci gość
    kolizja = true; g0 = 0;
    const nd = wolny(kd.pole, [kg.pole[0]], d0 + 1);
    d0 = nd >= 0 ? nd : d0;
    uwagi.push(`⚠ Kolizja strojów: ${gosc.nazwa} nie przywiózł kompletu w innych barwach. Na polecenie sędziego ${dom.nazwa} zmienia stroje (§ 13 ust. 2 uchwały PZPN IX/140) — odpowiedzialność dyscyplinarną ponosi drużyna gości.`);
  }
  const pola = [kd.pole[d0], kg.pole[g0]];
  // § 13 ust. 3: bramkarze kontrastują z obiema drużynami (i ze sobą nawzajem)
  const brOk = (k: Kit) => !pola.some((p) => zlewaSie(k, p));
  let d1 = mojaStrona === "dom" && moj && brOk(kd.bramkarz[moj[1]]) ? moj[1] : wolny(kd.bramkarz, pola);
  if (d1 < 0) d1 = 0;
  let g1 = mojaStrona === "gosc" && moj && brOk(kg.bramkarz[moj[1]]) && !zlewaSie(kg.bramkarz[moj[1]], kd.bramkarz[d1]) ? moj[1] : wolny(kg.bramkarz, [...pola, kd.bramkarz[d1]], 1);
  if (g1 < 0) g1 = 1;
  if (mojaStrona === "gosc" && moj && g1 !== moj[1]) uwagi.push("🧤 Koszulka Twojego bramkarza nie kontrastowała z drużynami — bramkarz zmienił ją na polecenie sędziego (§ 13 ust. 3).");
  const wszystkie = [kd.pole[d0], kg.pole[g0], kd.bramkarz[d1], kg.bramkarz[g1]];
  const SEDZIA: Kit[] = [
    { baza: "#111111", dodatek: "#111111", wzor: "jednolity", nazwa: "czarny" }, { baza: "#f5e100", dodatek: "#111111", wzor: "jednolity", nazwa: "żółty" },
    { baza: "#e8345a", dodatek: "#111111", wzor: "jednolity", nazwa: "różowy" }, { baza: "#2fb5e8", dodatek: "#111111", wzor: "jednolity", nazwa: "błękitny" }, { baza: "#7a3fd6", dodatek: "#111111", wzor: "jednolity", nazwa: "fioletowy" },
  ];
  const sedzia = SEDZIA.find((k) => !wszystkie.some((w) => zlewaSie(k, w))) ?? SEDZIA[0];
  return { dom: { pole: kd.pole[d0], br: kd.bramkarz[d1] }, gosc: { pole: kg.pole[g0], br: kg.bramkarz[g1] }, sedzia, wyborDom: [d0, d1], wyborGosc: [g0, g1], kolizja, uwagi };
}
/** Które komplety może wybrać gracz (pole i bramkarz) — z powodem blokady. */
export function dostepneStroje(dom: Klub, gosc: Klub, mojaStrona: "dom" | "gosc", wybranePole: number): { pole: (string | null)[]; br: (string | null)[] } {
  const kd = kity(dom), kg = kity(gosc);
  const moje = mojaStrona === "dom" ? kd : kg;
  const pole = moje.pole.map((k) => {
    if (mojaStrona === "gosc" && zlewaSie(k, kd.pole[0])) return "zlewa się ze strojem gospodarza (§ 13 ust. 1 — gość musi to uwzględnić)";
    if (mojaStrona === "dom" && kg.pole.every((g) => zlewaSie(k, g))) return "rywal nie ma kompletu w innych barwach — sędzia kazałby zmienić";
    return null;
  });
  const st = dobierzStroje(dom, gosc, mojaStrona, [wybranePole, 0]);
  const pola = [st.dom.pole, st.gosc.pole];
  const br = moje.bramkarz.map((k) => (pola.some((p) => zlewaSie(k, p)) ? "nie kontrastuje z koszulkami drużyn (§ 13 ust. 3)" : null));
  return { pole, br };
}

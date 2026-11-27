// Reprezentacje: powołania w przerwach FIFA (wrzesień, październik, listopad, marzec; czerwiec — mecze po sezonie),
// kadra Polski (seniorzy i U-21) wybierana spośród WSZYSTKICH zawodników w grze, obcokrajowcy z Twojego klubu
// powoływani do swoich kadr. Mecze kadry są symulowane (2 na przerwę), zawodnicy zbierają występy i gole
// w karierze reprezentacyjnej; zmęczenie i ryzyko urazu wracają do klubu.
import { los, losInt, poisson, szansa, wybierz, wybierzWazone } from "./losuj";
import type { StanGry, Zawodnik } from "./types";

export interface MeczKadry { sezon: number; data: string; kadra: string; rywal: string; gs: number; gr: number; typ: string; strzelcy: string[]; moi: string[] }
const RYWALE = [
  ["Niemcy", 86], ["Hiszpania", 89], ["Francja", 89], ["Anglia", 87], ["Holandia", 84], ["Portugalia", 86], ["Włochy", 84], ["Belgia", 82], ["Chorwacja", 82],
  ["Szwecja", 76], ["Austria", 79], ["Szwajcaria", 79], ["Czechy", 75], ["Słowacja", 72], ["Węgry", 74], ["Serbia", 75], ["Ukraina", 76], ["Szkocja", 73],
  ["Dania", 80], ["Norwegia", 78], ["Turcja", 78], ["Rumunia", 72], ["Grecja", 73], ["Walia", 72], ["Słowenia", 71], ["Albania", 70], ["Finlandia", 69],
  ["Litwa", 62], ["Łotwa", 60], ["Estonia", 59], ["Mołdawia", 56], ["Malta", 52], ["Andora", 48], ["Wyspy Owcze", 53], ["Gruzja", 72], ["Izrael", 68],
] as [string, number][];
export const OKNA_FIFA = [9, 10, 11, 3]; // miesiące przerw w trakcie sezonu (czerwiec — po sezonie, w turnieju/ eliminacjach)

const nazwa = (z: Zawodnik) => `${z.imie} ${z.nazwisko}`;

/** Czy w tym tygodniu (data kolejki) wypada przerwa FIFA, której jeszcze nie było. */
export function czasNaKadre(s: StanGry, data: Date): boolean {
  const m = data.getMonth() + 1, kl = `${s.sezon}-${m}`;
  if (!OKNA_FIFA.includes(m) || data.getDate() < 3) return false;
  if ((s.kadraOkna ?? []).includes(kl)) return false;
  s.kadraOkna = [...(s.kadraOkna ?? []).slice(-10), kl];
  return true;
}

function sila(zs: Zawodnik[]): number {
  const xi = zs.slice(0, 11);
  return xi.length ? xi.reduce((a, z) => a + z.umiej, 0) / xi.length : 50;
}
/** Jeden mecz kadry: wynik z siły składu, występy i gole zawodników. */
function rozegraj(s: StanGry, kadra: string, sklad: Zawodnik[], ocenaKadry: number, typ: string, data: string): MeczKadry {
  const [rywal, sr] = wybierz(RYWALE.filter(([n]) => !kadra.startsWith(n)));
  const silaR = kadra.includes("U-21") ? sr - 12 + los(-3, 3) : sr + los(-3, 3);
  const lamS = 1.3 * Math.exp((ocenaKadry - silaR) / 16), lamR = 1.2 * Math.exp((silaR - ocenaKadry) / 16);
  const gs = Math.min(7, poisson(lamS)), gr = Math.min(7, poisson(lamR));
  // skład meczowy: 11 najlepszych + 3–5 zmian
  const xi = sklad.slice(0, 11), lawka = sklad.slice(11).sort(() => Math.random() - 0.5).slice(0, losInt(3, 5));
  const grali = [...xi, ...lawka];
  for (const z of grali) {
    const k = (z.kadraStat ??= { kraj: kadra, mecze: 0, gole: 0 });
    if (!k.debiut) k.debiut = `${data} vs ${rywal}`;
    k.kraj = kadra; k.mecze++;
  }
  const strzelcy: string[] = [];
  for (let i = 0; i < gs; i++) {
    const st = wybierzWazone(grali, (z) => ({ NAP: 5, POM: 2.3, OBR: 0.6, BR: 0.01 })[z.poz] * Math.max(5, z.umiej - 40));
    st.kadraStat!.gole++; strzelcy.push(st.nazwisko);
  }
  const moi = grali.filter((z) => z.klubId === s.mojKlub).map(nazwa);
  return { sezon: s.sezon, data, kadra, rywal, gs, gr, typ, strzelcy, moi };
}

/** Przerwa na kadrę: powołania, 2 mecze każdej kadry, skutki dla klubu (zmęczenie, morale, uraz, prestiż). */
export function przerwaNaKadre(s: StanGry, data: Date) {
  const wszyscy = Object.values(s.zawodnicy).filter((z) => z.klubId && z.kontuzja === 0 && !s.kluby[z.klubId]?.pozaLiga);
  const polacy = wszyscy.filter((z) => !z.kraj || z.kraj === "Polska").sort((a, b) => b.umiej - a.umiej);
  const kadry: { nazwa: string; sklad: Zawodnik[] }[] = [];
  // seniorzy: 26 najlepszych Polaków (z bramkarzami)
  const br = polacy.filter((z) => z.poz === "BR").slice(0, 3), pole = polacy.filter((z) => z.poz !== "BR").slice(0, 23);
  kadry.push({ nazwa: "Polska", sklad: [...br.slice(0, 1), ...pole.slice(0, 10), ...br.slice(1), ...pole.slice(10)] });
  const u21 = polacy.filter((z) => z.wiek <= 21 && !kadry[0].sklad.includes(z));
  const bru = u21.filter((z) => z.poz === "BR").slice(0, 2), poleU = u21.filter((z) => z.poz !== "BR").slice(0, 21);
  kadry.push({ nazwa: "Polska U-21", sklad: [...bru.slice(0, 1), ...poleU.slice(0, 10), ...bru.slice(1), ...poleU.slice(10)] });
  // obcokrajowcy z Twojego klubu — kadry swoich krajów (tylko wyróżniający się)
  for (const id of s.kluby[s.mojKlub].zawodnicy) {
    const z = s.zawodnicy[id]; if (!z || !z.kraj || z.kraj === "Polska" || z.kontuzja > 0) continue;
    const k = z.umiej >= 74 ? z.kraj : z.wiek <= 21 && z.umiej >= 64 ? `${z.kraj} U-21` : null;
    if (k) kadry.push({ nazwa: k, sklad: [z] });
  }
  const dataTxt = `${data.getDate()}.${String(data.getMonth() + 1).padStart(2, "0")}.${data.getFullYear()}`;
  const typ = data.getMonth() + 1 === 3 || data.getMonth() + 1 === 9 || data.getMonth() + 1 === 10 || data.getMonth() + 1 === 11 ? (s.sezon % 2 === 0 ? "eliminacje MŚ" : "eliminacje EURO") : "mecz towarzyski";
  const wyniki: MeczKadry[] = [];
  const moiPowolani: string[] = [];
  for (const kd of kadry) {
    if (!kd.sklad.length) continue;
    for (const z of kd.sklad) {
      z.reprezentant = kd.nazwa;
      if (z.klubId === s.mojKlub) {
        moiPowolani.push(`${nazwa(z)} (${kd.nazwa})`);
        z.morale = Math.min(100, z.morale + 6); z.kondycja = Math.max(40, z.kondycja - 9);
        if (szansa(0.035)) { z.kontuzja = losInt(1, 2); s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🚑 ${nazwa(z)} wrócił z kadry (${kd.nazwa}) z urazem — pauza ${z.kontuzja} kol.` }); }
      }
    }
    if (kd.sklad.length >= 11) {
      // realna siła kadry Polski (ranking FIFA ~30.) ≈ 79; U-21 ≈ 68 — skład z gry przesuwa ją o kilka punktów
      const oc = (kd.nazwa === "Polska" ? 79 : 68) + Math.max(-4, Math.min(4, (sila(kd.sklad) - (kd.nazwa === "Polska" ? 74 : 62)) * 0.4));
      for (let i = 0; i < 2; i++) wyniki.push(rozegraj(s, kd.nazwa, kd.sklad, oc, kd.nazwa.includes("U-21") ? "eliminacje ME U-21" : typ, dataTxt));
    } else {
      // pojedynczy obcokrajowiec — występy w swojej kadrze
      const z = kd.sklad[0]; const k = (z.kadraStat ??= { kraj: kd.nazwa, mecze: 0, gole: 0 });
      const ile = szansa(0.75) ? losInt(1, 2) : 0; k.mecze += ile; if (ile && szansa(z.poz === "NAP" ? 0.3 : 0.1)) k.gole++;
      if (!k.debiut && ile) k.debiut = dataTxt;
    }
  }
  s.kadraMecze = [...wyniki, ...(s.kadraMecze ?? [])].slice(0, 30);
  if (moiPowolani.length) { s.zarzad = Math.min(100, s.zarzad + 1); s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🇵🇱 Przerwa na kadrę — powołania z Twojego klubu: ${moiPowolani.join(", ")}. Prestiż, ale wrócą zmęczeni.` }); }
  const pl = wyniki.filter((w) => w.kadra === "Polska");
  if (pl.length) s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: `🇵🇱 Reprezentacja Polski (${typ}): ${pl.map((w) => `${w.rywal} ${w.gs}:${w.gr}${w.strzelcy.length ? ` (${w.strzelcy.join(", ")})` : ""}`).join(" · ")}.` });
}

// Podsumowanie sezonu jak w telewizyjnym magazynie: kolejne plansze (tabela, strzelcy, mecz sezonu, seria, derby,
// puchar, zawodnik sezonu, młodzież, trybuny) z narracją prowadzącego. Liczone z archiwum meczów i statystyk kadry.
import { jestDerby } from "./derby";
import { tabelaLigi } from "./swiat";
import type { StanGry } from "./types";

export interface Plansza { ikona: string; tytul: string; linie: string[]; mowa: string; herbRywala?: string }

const odm = (n: number, a: string, b: string, c: string) => (n === 1 ? a : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? b : c);

export function podsumowanieSezonu(s: StanGry): Plansza[] {
  const k = s.kluby[s.mojKlub]; const liga = s.ligi[k.poziom - 1];
  const out: Plansza[] = [];
  const sezon = `${s.sezon}/${String((s.sezon + 1) % 100).padStart(2, "0")}`;
  out.push({ ikona: "📺", tytul: `Magazyn sezonu ${sezon}`, linie: [k.nazwa, liga?.nazwa ?? "", `Trener: ${s.trener || "—"}`],
    mowa: `Dobry wieczór Państwu. Zapraszamy na magazyn podsumowujący sezon ${s.sezon} na ${s.sezon + 1}. Dziś bierzemy pod lupę ${k.nazwa} i ${liga?.nazwa ?? "ich ligę"}.` });

  // tabela
  if (liga) {
    const t = tabelaLigi(s, liga); const i = t.findIndex((w) => w.klubId === s.mojKlub); const w = t[i];
    if (w) {
      const opis = i === 0 ? "MISTRZOSTWO LIGI!" : i <= 2 ? "Podium — sezon ponad plan" : i >= t.length - 3 ? "Strefa spadkowa — trudny sezon" : i < t.length / 2 ? "Górna połowa tabeli" : "Dolna połowa tabeli";
      out.push({ ikona: "📊", tytul: `${i + 1}. miejsce — ${w.pkt} pkt`, linie: [opis, `Bilans: ${w.w} zw. · ${w.r} rem. · ${w.p} por.`, `Bramki ${w.bz}:${w.bs}`, ...t.slice(0, 3).map((x, j) => `${j + 1}. ${s.kluby[x.klubId]?.nazwa} — ${x.pkt} pkt`)],
        mowa: `${k.nazwa} kończy sezon na ${i + 1}. miejscu z dorobkiem ${w.pkt} punktów. ${w.w} ${odm(w.w, "zwycięstwo", "zwycięstwa", "zwycięstw")}, ${w.r} ${odm(w.r, "remis", "remisy", "remisów")} i ${w.p} ${odm(w.p, "porażka", "porażki", "porażek")}. ${i === 0 ? "To jest mistrzostwo! Wielkie brawa!" : i <= 2 ? "Podium — kibice mogą być zadowoleni." : i >= t.length - 3 ? "Niestety, to był sezon walki o przetrwanie." : ""}` });
    }
  }

  // strzelcy i asystenci
  const kadra = k.zawodnicy.map((id) => s.zawodnicy[id]).filter(Boolean);
  const strz = [...kadra].filter((z) => z.gole > 0).sort((a, b) => b.gole - a.gole).slice(0, 3);
  const asy = [...kadra].filter((z) => z.asysty > 0).sort((a, b) => b.asysty - a.asysty)[0];
  if (strz.length) out.push({ ikona: "⚽", tytul: "Strzelcy sezonu", linie: [...strz.map((z, j) => `${j + 1}. ${z.imie} ${z.nazwisko} — ${z.gole} ${odm(z.gole, "gol", "gole", "goli")}`), ...(asy ? [`🅰️ Najwięcej asyst: ${asy.imie} ${asy.nazwisko} (${asy.asysty})`] : [])],
    mowa: `Najskuteczniejszy w drużynie: ${strz[0].imie} ${strz[0].nazwisko}, ${strz[0].gole} ${odm(strz[0].gole, "gol", "gole", "goli")}.${asy ? ` Najwięcej asyst zanotował ${asy.imie} ${asy.nazwisko}.` : ""}` });

  // mecz sezonu i najboleśniejsza porażka
  const arch = (s.archiwumMeczow ?? []).filter((m) => m.sezon === s.sezon);
  if (arch.length) {
    const naj = [...arch].sort((a, b) => (b.my - b.oni) - (a.my - a.oni) || b.my - a.my)[0];
    const por = [...arch].filter((m) => m.my < m.oni).sort((a, b) => (a.my - a.oni) - (b.my - b.oni))[0];
    out.push({ ikona: "🎬", tytul: "Mecz sezonu", herbRywala: naj.rywal, linie: [`${naj.dom ? `${k.nazwa} ${naj.my}:${naj.oni} ${naj.rywal}` : `${naj.rywal} ${naj.oni}:${naj.my} ${k.nazwa}`}`, `kolejka ${naj.kolejka + 1}`, ...(naj.strzelcy.length ? [`Gole: ${naj.strzelcy.slice(0, 6).join(", ")}`] : []), ...(por ? [`😣 Najboleśniej: ${por.dom ? "u siebie" : "na wyjeździe"} z ${por.rywal} ${por.my}:${por.oni}`] : [])],
      mowa: `Mecz sezonu? Bez wątpienia ${naj.my} do ${naj.oni} ${/^[SsZzWw][^aeiouyąęó]/.test(naj.rywal) ? "ze" : "z"} ${naj.rywal}${naj.dom ? " przed własną publicznością" : " na wyjeździe"}.${por ? ` A najboleśniej zabolała porażka ${por.my} do ${por.oni} z ${por.rywal}.` : ""}` });
    // serie i dom/wyjazd
    let n = 0, max = 0, nw = 0, maxW = 0; for (const m of arch) { n = m.my >= m.oni ? n + 1 : 0; max = Math.max(max, n); nw = m.my > m.oni ? nw + 1 : 0; maxW = Math.max(maxW, nw); }
    const pkt = (d: boolean) => arch.filter((m) => m.dom === d).reduce((a, m) => a + (m.my > m.oni ? 3 : m.my === m.oni ? 1 : 0), 0);
    out.push({ ikona: "📈", tytul: "Liczby sezonu", linie: [`Najdłuższa seria bez porażki: ${max}`, `Najdłuższa seria zwycięstw: ${maxW}`, `🏠 U siebie: ${pkt(true)} pkt · 🚌 Na wyjeździe: ${pkt(false)} pkt`, `Czyste konta: ${arch.filter((m) => m.oni === 0).length}`],
      mowa: `Najdłuższa seria bez porażki to ${max} ${odm(max, "mecz", "mecze", "meczów")}. U siebie zespół zdobył ${pkt(true)} punktów, na wyjazdach ${pkt(false)}.` });
    // derby
    const nazwy = new Map(Object.values(s.kluby).map((x) => [x.nazwa, x.id]));
    const der = arch.filter((m) => { const id = nazwy.get(m.rywal); return id && jestDerby(s, s.mojKlub, id); });
    if (der.length) out.push({ ikona: "⚔️", tytul: "Derby", linie: der.map((m) => `${m.dom ? "🏠" : "🚌"} ${m.rywal} ${m.my}:${m.oni} ${m.my > m.oni ? "✅" : m.my === m.oni ? "➖" : "❌"}`),
      mowa: `Derby w tym sezonie: ${der.filter((m) => m.my > m.oni).length} ${odm(der.filter((m) => m.my > m.oni).length, "wygrana", "wygrane", "wygranych")} i ${der.filter((m) => m.my < m.oni).length} ${odm(der.filter((m) => m.my < m.oni).length, "porażka", "porażki", "porażek")}. ${der.some((m) => m.my > m.oni) ? "Miasto jest nasze — mówią kibice." : "Kibice liczą na rewanż."}` });
  }

  // puchar
  const sc = s.puchar?.sciezka ?? [];
  if (sc.length) {
    const ost = sc[sc.length - 1];
    out.push({ ikona: "🏆", tytul: "Puchar", linie: sc.slice(-5).map((r) => `${r.awans ? "✅" : "❌"} ${s.kluby[r.przeciwnik]?.nazwa ?? r.przeciwnik} ${r.wynik}`),
      mowa: ost.awans ? "W pucharze drużyna doszła do samego końca rozgrywek!" : `Przygoda z pucharem skończyła się na ${s.kluby[ost.przeciwnik]?.nazwa ?? "rywalu"}, wynik ${ost.wynik}.` });
  }

  // zawodnik sezonu i młodzież
  const ocena = (z: (typeof kadra)[number]) => z.gole * 3 + z.asysty * 2 + z.mecze * 0.4 + (z.poz === "BR" ? z.czysteKonta * 2.5 : 0) + (z.umiej / 10);
  const mvp = [...kadra].filter((z) => z.mecze > 0).sort((a, b) => ocena(b) - ocena(a))[0];
  if (mvp) out.push({ ikona: "⭐", tytul: "Zawodnik sezonu", linie: [`${mvp.imie} ${mvp.nazwisko}`, `${mvp.poz} · ${mvp.wiek} ${odm(mvp.wiek, "rok", "lata", "lat")}`, `${mvp.mecze} ${odm(mvp.mecze, "mecz", "mecze", "meczów")} · ${mvp.gole} ${odm(mvp.gole, "gol", "gole", "goli")} · ${mvp.asysty} ${odm(mvp.asysty, "asysta", "asysty", "asyst")}${mvp.poz === "BR" ? ` · ${mvp.czysteKonta} czystych kont` : ""}`],
    mowa: `A zawodnikiem sezonu w naszym plebiscycie zostaje ${mvp.imie} ${mvp.nazwisko}!` });
  const mlodzi = [...kadra].filter((z) => z.wiek <= 21 && z.mecze >= 3).sort((a, b) => b.mecze - a.mecze).slice(0, 3);
  if (mlodzi.length) out.push({ ikona: "🌱", tytul: "Odkrycia sezonu", linie: mlodzi.map((z) => `${z.imie} ${z.nazwisko} (${z.wiek}) — ${z.mecze} ${odm(z.mecze, "mecz", "mecze", "meczów")}${z.gole ? `, ${z.gole} ${odm(z.gole, "gol", "gole", "goli")}` : ""}`),
    mowa: `Na wyróżnienie zasłużyła młodzież. ${mlodzi[0].imie} ${mlodzi[0].nazwisko} rozegrał ${mlodzi[0].mecze} ${odm(mlodzi[0].mecze, "mecz", "mecze", "meczów")} i jest nadzieją klubu.` });

  // trybuny
  const rf = s.rekordy?.rekordFrekwencji;
  const opr = (s.oprawyUzyte?.[k.nazwa] ?? []).length;
  if ((rf && rf.sezon === s.sezon) || opr) out.push({ ikona: "🎆", tytul: "Trybuny", linie: [...(rf && rf.sezon === s.sezon ? [`Rekord frekwencji: ${rf.widzowie} widzów (z ${rf.rywal})`] : []), ...(opr ? [`Opraw kibiców w historii klubu: ${opr}`] : []), ...(s.opiniaPolicji != null ? [`Opinia policji: ${Math.round(s.opiniaPolicji)}/100`] : [])],
    mowa: rf && rf.sezon === s.sezon ? `Na trybunach rekord: ${rf.widzowie} widzów na meczu z ${rf.rywal}.` : "Kibice nie zawiedli — młyn dopingował przez cały sezon." });

  out.push({ ikona: "👋", tytul: "Do zobaczenia!", linie: ["Za chwilę awanse, spadki i okno transferowe.", "Nowy sezon już niebawem."],
    mowa: "To wszystko w dzisiejszym magazynie. Dziękujemy za uwagę i do zobaczenia w nowym sezonie!" });
  return out;
}

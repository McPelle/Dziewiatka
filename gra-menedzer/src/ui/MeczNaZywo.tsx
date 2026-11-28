import { wycisz as wyciszMuzyke } from "./muzyka";
import { useEffect, useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, Line, Rect } from "react-native-svg";
import { dzisiaj } from "../engine/dzien";
import { FORMACJE } from "../engine/mecz";
import { dograjDoKonca, krokMinuty, mowaWPrzerwie, NAZWA_NAST, okrzyk, OKRZYKI, podpowiedzi, przerwa, rozpocznijMeczNaZywo, tekstMinuty, wynikKarnych, zmianaGracza, zmienTaktyke, type MeczLive, type Mowa, type Okrzyk } from "../engine/meczNaZywo";
import { maOswietlenie } from "../engine/sezon";
import { jestDerby } from "../engine/derby";
import { godzinaMeczu } from "../engine/zywySwiat";
import type { Nastawienie, StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { LogoLigi } from "./LogoLigi";
import { CZCIONKA, K, st, G, web } from "./styl";
import { dobierzStroje, dostepneStroje, kity, type Kit } from "./strojeDane";
import { Mecz3D, type Kamera, type Ustawienia3D } from "./three/Mecz3D";
import { Szatnia3D } from "./three/Szatnia3D";
import { PrzedMeczem } from "./PrzedMeczem";
import { planZabezpieczenia, ryzykoIncydentow } from "../engine/bezpieczenstwo";
import { akcjeKibicow, dojazdKibicow, liczbaDelegacji, pozdrowieniaZgod, sektorGosci, wsparcieKibicow } from "../engine/kibice";
import { barwyKlubu } from "../data/barwy";
import { kulturaTrybun } from "../engine/flagi";
import { doGlosu } from "../engine/przyspiewki";
import { pogodaWDniuMeczu } from "../engine/pogoda";
import { reakcjaKlubu } from "../engine/zadyma";
import { planOpraw } from "../engine/oprawy";
import { zgodaKibicow } from "../engine/kibice";
import { grafika3D, lekkaGrafika } from "./three/Stadion3DWidok";
import { czyWyciszony, gwizdek, startDzwieku, stopDzwieku, wycisz } from "./three/dzwiek";
import { glosDostepny, glosWlaczony, mow, plecZImienia, ustawGlos, zamilknij } from "./three/glos";

type Zakl = "relacja" | "staty" | "sklady" | "taktyka" | "zmiany";
const KAMERY: [Kamera, string][] = [["auto", "🎬 Reżyser"], ["tv", "📺 TV"], ["bramka", "🥅 Zza bramki"], ["gora", "🛰 Z góry"], ["blisko", "🔍 Zbliżenie"], ["zawodnik", "👁 Kamera zawodnika"], ["obrot", "🔄 Obrotowa (przeciągnij)"]];

/** Warunki meczu: pora (wieczór pod reflektorami), pogoda wg miesiąca, frekwencja wg renomy. */
function warunki(s: StanGry, domId: string, goscId: string, puchar?: boolean): Ustawienia3D {
  const k = s.kluby[domId];
  const d = dzisiaj(s).data, mies = d.getMonth() + 1;
  const h = (s.sezon * 31 + s.kolejka * 7 + domId.length) % 100;
  const gm = godzinaMeczu(s, domId, s.kolejka, d);
  const noc = maOswietlenie(k) && gm.wieczor;
  const zima = mies === 12 || mies <= 2, jesien = mies >= 10 && mies <= 11;
  const pr = (domId === s.mojKlub || goscId === s.mojKlub) ? pogodaWDniuMeczu(s, k.miasto, s.kolejka, s.ligi[k.poziom - 1]?.terminarz.length ?? 30) : undefined; // ta sama pogoda co w prognozie i w wyniku
  const zPrognozy: Ustawienia3D["pogoda"] | undefined = pr?.kod ? (pr.kod === "snieg" || pr.kod === "mroz" ? "snieg" : pr.kod === "deszcz" || pr.kod === "sztorm" ? "deszcz" : pr.kod === "mgla" ? "mgla" : "slonce") : undefined;
  const pogoda: Ustawienia3D["pogoda"] = zPrognozy ?? (zima && h % 3 === 0 ? "snieg" : (jesien || mies === 3 || mies === 4) && h % 4 === 1 ? "deszcz" : jesien && h % 9 === 2 ? "mgla" : h % 11 === 3 ? "deszcz" : "slonce");
  const pusto = domId === s.mojKlub && (s.zakazTrybun ?? 0) > 0; // kara ZPN: mecz przy pustych trybunach
  const wielkiPuchar = !!puchar && s.kluby[goscId].poziom < k.poziom; // gość z wyższej ligi w pucharze — komplet
  const widzowie = pusto ? 0 : wielkiPuchar ? Math.round(k.pojemnosc * 0.97) : Math.round(k.pojemnosc * Math.min(0.95, 0.3 + k.renoma * 0.55));
  const lekka = lekkaGrafika();
  // „złota godzina”: ok. 2,5 h przed zachodem słońca w danym miesiącu (Polska, z czasem letnim) — niskie słońce, długie cienie
  const ZACHOD = [15.9, 16.8, 17.7, 19.6, 20.4, 21.0, 20.9, 20.1, 19.0, 17.9, 16.0, 15.5];
  const hm = gm.godz.split(":").map(Number), godzF = (hm[0] || 0) + (hm[1] || 0) / 60, zach = ZACHOD[mies - 1];
  const wieczor = !noc && godzF >= zach - 2.5;
  return { noc, wieczor, pogoda, widzowie, lekka, derby: !!jestDerby(s, domId, goscId), pusto, godz: gm.godz };
}

const KLUCZ_LIVE = "dz_mecz_live";
/** Zapisany mecz w trakcie (ta sama kariera, sezon, kolejka i para) — do wznowienia po zamknięciu przeglądarki. */
export function zapisanyMecz(s: StanGry, para: [string, string]): { m: MeczLive; kond: Record<string, number> } | null {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KLUCZ_LIVE) : null; if (!raw) return null;
    const z = JSON.parse(raw);
    if (z.kariera !== (s.slotId ?? s.mojKlub) || z.sezon !== s.sezon || z.kolejka !== s.kolejka || z.para[0] !== para[0] || z.para[1] !== para[1]) return null;
    return { m: z.m, kond: z.kond };
  } catch { return null; }
}
export const usunZapisMeczu = () => { try { window.localStorage.removeItem(KLUCZ_LIVE); } catch { /* */ } };
function zapiszMecz(s: StanGry, para: [string, string], m: MeczLive) {
  try {
    const kond: Record<string, number> = {};
    for (const id of [...m.dom.zagrali, ...m.dom.lawka, ...m.gosc.zagrali, ...m.gosc.lawka]) kond[id] = s.zawodnicy[id]?.kondycja ?? 0;
    window.localStorage.setItem(KLUCZ_LIVE, JSON.stringify({ kariera: s.slotId ?? s.mojKlub, sezon: s.sezon, kolejka: s.kolejka, para, m, kond }));
  } catch { /* brak miejsca — mecz i tak trwa */ }
}

export function MeczNaZywo({ s, para, puchar, onKoniec, onAnuluj }: { s: StanGry; para: [string, string]; puchar?: { nazwa: string; dogrywka: boolean; neutralny: boolean; remis?: boolean; bilans?: { d: number; g: number } }; onKoniec: (m: MeczLive) => void; onAnuluj: () => void }) {
  useEffect(() => { wyciszMuzyke(true); return () => wyciszMuzyke(false); }, []); // soundtrack cichnie na czas transmisji
  const [m] = useState<MeczLive>(() => {
    const z = zapisanyMecz(s, para);
    if (z) { for (const [id, k] of Object.entries(z.kond)) if (s.zawodnicy[id]) s.zawodnicy[id].kondycja = k; z.m.komentarz.unshift({ min: `${z.m.min}'`, typ: "info", tekst: "▶ Wznowiono zapisany mecz." }); return z.m; }
    const nm = rozpocznijMeczNaZywo(s, para[0], para[1]);
    { // bezpieczeństwo meczu: plan ochrony (u siebie płaci klub), ryzyko incydentów, oprawa na start
      const u = warunki(s, para[0], para[1], !!puchar), kd0 = s.kluby[para[0]], kg0 = s.kluby[para[1]];
      const plan = para[0] === s.mojKlub ? planZabezpieczenia(s, kd0, u.widzowie, !!u.derby) : undefined;
      nm.bezp = { ryzyko: ryzykoIncydentow(s, kd0, kg0, u.widzowie, !!u.derby, plan), plan, derby: !!u.derby, widzowie: u.widzowie };
      // oprawy — kilka w meczu (derby, zgody, wielkie mecze), każda inna, nigdy się nie powtarza
      const dn = jestDerby(s, para[0], para[1]), zg = zgodaKibicow(s, kd0, kg0);
      const sg0 = sektorGosci(s, kd0, !!u.derby);
      const planOp = u.widzowie > 0 ? planOpraw(s, kd0, kg0, { derby: dn, zgoda: zg, puchar: !!puchar, gosci: sg0.zamkniety ? 0 : sg0.miejsca, silaD: kulturaTrybun(s, kd0).pirotechnika, silaG: kulturaTrybun(s, kg0).pirotechnika }) : [];
      nm.oprawyPlan = planOp; nm.incydenty = [];
      if (zg) {
        nm.zgodaMecz = true; nm.bezp.ryzyko *= 0.08; // przyjaciele nie robią sobie zadym
        nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: `🤝 ${zg} — mecz przyjaźni! Kibice ${kd0.nazwa} i ${kg0.nazwa} siedzą razem, przemieszani w swoich barwach: szaliki obu klubów, flagi obok siebie na jednym płocie, klatka gości otwarta i pusta.` });
        nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: `🎵 Wspólny okrzyk przed gwizdkiem: „${kd0.nazwa.split(" ")[0]} i ${kg0.nazwa.split(" ")[0]} — zgoda na wieki!”` });
      }
      for (const p of planOp) {
        nm.incydenty.push({ typ: "oprawa", min: p.min, sektor: p.sektor, opis: `Oprawa ${p.sektor === "gosci" ? "gości" : "gospodarzy"}: ${p.o.opis}`, opanowany: true });
        if (p.o.obrazliwa) { nm.incydenty.push({ typ: "transparent", min: p.min + 1, sektor: p.sektor, opis: "Obraźliwa oprawa wobec rywala — delegat w protokole.", opanowany: true }); nm.bezp.ryzyko = Math.min(0.95, nm.bezp.ryzyko * 1.3); }
        if (p.o.pirotechnika) nm.incydenty.push({ typ: "race", min: p.min + 1, sektor: p.sektor, opis: "Pirotechnika podczas oprawy — zamaskowani odpalają race i stroboskopy.", opanowany: true });
      }
      nm.oprawa = planOp.find((p) => p.sektor === "gospodarzy" && p.min === 0)?.o; nm.oprawaGosci = planOp.find((p) => p.sektor === "gosci" && p.min <= 1)?.o;
      for (const p of planOp.filter((x) => x.min <= 1)) nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: `🎆 ${p.sektor === "gosci" ? "Klatka gości" : "Trybuna gospodarzy"}: ${p.o.opis}` });
      const sg = sektorGosci(s, kd0, !!u.derby);
      const gosci = u.widzowie > 0 && !sg.zamkniety ? Math.min(sg.miejsca, Math.round(sg.miejsca * (u.derby ? 0.95 : 0.35 + kg0.renoma * 0.5))) : 0;
      nm.kultura = { dom: kulturaTrybun(s, kd0), gosc: kulturaTrybun(s, kg0) };
      nm.akcjeKibicow = akcjeKibicow(s, kd0, kg0, !!u.derby, !!u.derby, gosci); nm.akcjeIdx = 0;
      for (const a of nm.akcjeKibicow.filter((x) => x.min === 0)) nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: a.tekst });
      const a0 = nm.akcjeKibicow.find((x) => x.min === 0 && x.transparent); if (a0) nm.transparentTeraz = { tekst: a0.transparent!, sektor: a0.sektor, min: 0 };
      nm.akcjeIdx = nm.akcjeKibicow.filter((x) => x.min === 0).length;
      // zgody, układy i obóz przyjeżdżają wesprzeć (na derby tłumnie, na zwykłe mecze — zgody z okolicy)
      if (u.widzowie > 0) {
        const wd = wsparcieKibicow(s, kd0, kd0.miasto, !!u.derby, kg0), wg = gosci > 0 ? wsparcieKibicow(s, kg0, kd0.miasto, !!u.derby, kd0) : [];
        const rodz = zg ? "przyjazn" as const : u.derby ? "derby" as const : "zwykly" as const;
        nm.wsparcie = { dom: wd.map((k) => ({ nazwa: k.nazwa, kolory: barwyKlubu(k.nazwa) })), gosc: wg.map((k) => ({ nazwa: k.nazwa, kolory: barwyKlubu(k.nazwa) })) };
        if (wd.length) nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: `🤝 Na trybunie gospodarzy także kibice ${wd.slice(0, 6).map((k) => `${k.nazwa} (ok. ${liczbaDelegacji(rodz, kulturaTrybun(s, k).pirotechnika)})`).join(", ")}${wd.length > 6 ? ` i inni (${wd.length})` : ""} — zgody i sympatycy stoją w młynie razem z gospodarzami.` });
        if (wg.length) nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: `🤝 W klatce gości obok ${kg0.nazwa} stoją też kibice ${wg.slice(0, 6).map((k) => `${k.nazwa} (ok. ${liczbaDelegacji(rodz, kulturaTrybun(s, k).pirotechnika)})`).join(", ")} — zgoda staje razem z gośćmi w ich sektorze.` });
        if (wg.length) nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: `🧣 W klatce szaliki zgodowe pół na pół (${kg0.nazwa.split(" ")[0]} – ${wg[0].nazwa.split(" ")[0]}), bluzy z herbami obu klubów, wspólna flaga „ZGODA” na płocie.` });
        if (wd.length) nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: `🧣 Na trybunie gospodarzy obok barw ${kd0.nazwa} widać też szaliki i koszulki ${wd.slice(0, 3).map((k) => k.nazwa).join(", ")} — przed meczem wymiana szali na znak przyjaźni.` });
        if (u.derby && wd.length + wg.length > 3) nm.bezp.ryzyko = Math.min(0.95, nm.bezp.ryzyko * 1.2);
        if (wg.length) nm.momentum -= 0.05 * Math.min(4, wg.length); if (wd.length) nm.momentum += 0.05 * Math.min(4, wd.length);
      }
      { const t = dojazdKibicow(s, kg0, kd0, gosci, !!u.derby); if (t) nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: t }); }
      { const pz = pozdrowieniaZgod(s, kd0, s.kolejka); if (pz && u.widzowie > 0) (nm.akcjeKibicow ??= []).push({ min: 20 + Math.floor(Math.random() * 50), sektor: "gospodarzy", tekst: pz }); }
      if (gosci > 0) nm.komentarz.unshift({ min: "0'", typ: "kibice", tekst: `🧱 Sektor gości („klatka”, ogrodzenie 2,2 m): ${gosci.toLocaleString("pl")} kibiców ${kg0.nazwa} na ${sg.miejsca.toLocaleString("pl")} miejsc (${Math.round(sg.procent * 100)}% stadionu; PZPN wymaga min. 5%).` });
      if (plan) nm.komentarz.unshift({ min: "0'", typ: "info", tekst: plan.masowa ? `🛡 Zabezpieczenie: ${plan.ochroniarze} stewardów, ${plan.koordynatorzy} koordynatorów${plan.zgodne ? "" : " (PONIŻEJ minimum z ustawy!)"} · policja z urzędu: ${plan.policja} funkcjonariuszy${plan.podwyzszoneRyzyko ? " — mecz podwyższonego ryzyka" : ""} · karetka na stadionie.` : `🛡 Porządek zapewnia ${plan.ochroniarze} porządkowych klubu (to nie jest impreza masowa).` });
    }
    if (puchar) {
      nm.puchar = { nazwa: puchar.nazwa, dogrywka: puchar.dogrywka, remis: puchar.remis, bilans: puchar.bilans };
      if (puchar.neutralny) nm.atut = 1;
      nm.komentarz.unshift({ min: "0'", typ: "info", tekst: `🏆 ${puchar.nazwa}. ${puchar.remis ? "Pierwszy mecz dwumeczu — remis możliwy, rozstrzygnięcie w rewanżu." : puchar.bilans ? `Rewanż — pierwszy mecz ${puchar.bilans.g}:${puchar.bilans.d} dla gości; przy remisie w dwumeczu dogrywka 2×15 min i rzuty karne.` : `Mecz o wszystko — przy remisie ${puchar.dogrywka ? "dogrywka 2×15 min, a potem rzuty karne" : "od razu rzuty karne (regulamin związku)"}.`}${puchar.neutralny ? " Neutralny obiekt — bez atutu własnego boiska." : ""}` });
    }
    return nm;
  });
  const ust = useMemo(() => warunki(s, para[0], para[1], !!puchar), []);
  const [wersja, setWersja] = useState(0);
  const [predkosc, setPredkosc] = useState(0);
  const [ostatniaPr, setOstatniaPr] = useState(1);
  const [kamera, setKamera] = useState<Kamera>("auto");
  const [zakl, setZakl] = useState<Zakl>("relacja");
  const [tylkoAkcje, setTylkoAkcje] = useState(false);
  const [autoPauza, setAutoPauza] = useState(true);
  const [powt, setPowt] = useState(false);
  const [bez3D, setBez3D] = useState(Platform.OS !== "web");
  const [schodzi, setSchodzi] = useState<string | null>(null);
  const [kom, setKom] = useState<string | null>(null);
  const [glosno, setGlosno] = useState(!czyWyciszony());
  const [glosKom, setGlosKom] = useState(glosWlaczony());
  const [startTxt, setStartTxt] = useState(() => m.min === 0);
  const [przed, setPrzed] = useState(() => m.min === 0 && !m.przedmecz?.gotowe);
  const [wyborStroju, setWyborStroju] = useState<[number, number]>(() => { const st0 = dobierzStroje(s.kluby[para[0]], s.kluby[para[1]], para[0] === s.mojKlub ? "dom" : "gosc"); return para[0] === s.mojKlub ? st0.wyborDom : st0.wyborGosc; });
  const stroje = useMemo(() => dobierzStroje(s.kluby[para[0]], s.kluby[para[1]], para[0] === s.mojKlub ? "dom" : "gosc", wyborStroju), [wyborStroju]);
  const kd = s.kluby[m.dom.klubId], kg = s.kluby[m.gosc.klubId];
  const moj = m.moja === "dom" ? m.dom : m.gosc;
  const odswiez = () => setWersja((v) => v + 1);

  const krok = () => {
    if (m.koniec) return;
    const przed = m.komentarz.length;
    krokMinuty(s, m);
    if (m.min % 3 === 0 || m.wazne) zapiszMecz(s, para, m); // zapis w trakcie meczu
    if (tylkoAkcje) { let n = 0; while (!m.koniec && !m.wazne && n++ < 12 && !m.sekwencja.some((p) => p.zdarzenie && p.zdarzenie !== "aut")) krokMinuty(s, m); }
    // komentator na głos: gole, karne, czerwone, VAR, przerwa i koniec; przy wolnym tempie także groźne akcje
    const nowe = m.komentarz.slice(0, Math.max(0, m.komentarz.length - przed)).reverse();
    for (const c of nowe) {
      if ((c.tekst.startsWith("🎵") || c.tekst.startsWith("🎤")) && predkosc <= 2) { mow(doGlosu(c.tekst.replace(/^(🎵|🎤)[^„]*„|”$/gu, "")), "spiker", { kto: "kibice-trybuna", plec: "M", emocje: 0.6 }); continue; }
      const wazny = c.typ === "gol" || c.typ === "karny" || c.typ === "var" || (c.typ === "kartka" && c.tekst.includes("🟥")) || (c.typ === "info" && /Koniec|Przerwa/.test(c.tekst));
      if (wazny || (predkosc <= 2 && (c.typ === "akcja" || c.typ === "kartka") && Math.random() < 0.5)) mow(c.tekst.replace(/\d+:\d+.*$/, ""), "komentator", { emocje: c.typ === "gol" ? 1 : c.typ === "karny" ? 0.6 : 0, przerwij: c.typ === "gol", kto: "komentator", plec: "M" });
    }
    if (m.wazne?.typ === "gol" && m.wazne.strona === "dom" && m.wazne.id) {
      const z = s.zawodnicy[m.wazne.id];
      if (z && m.gole[m.gole.length - 1]?.typ !== "samoboj") setTimeout(() => mow(`Bramkę dla ${kd.nazwa} zdobył zawodnik z numerem ${z.numer}… ${z.imie}… ${z.nazwisko}!`, "spiker", { kto: `spiker-${kd.nazwa}`, plec: "M" }), 3500);
    }
    const w = m.wazne;
    if (w) {
      if (w.typ === "przerwa" || w.typ === "koniec") { gwizdek(true, w.typ === "koniec" ? 3 : 2); setPredkosc(0); }
      else if (autoPauza && (w.typ === "czerwona" || (w.typ === "uraz" && (w.strona === m.moja)))) { setPredkosc(0); if (w.typ === "uraz") { setZakl("zmiany"); setSchodzi(w.id ?? null); } }
    }
    odswiez();
  };
  // widok 2D: zegar meczu bez silnika 3D
  useEffect(() => {
    if (!bez3D || predkosc <= 0 || m.koniec) return;
    const t = setInterval(krok, 1400 / predkosc);
    return () => clearInterval(t);
  });
  const graj = (v: number) => {
    setPredkosc(v); if (v > 0) setOstatniaPr(v);
    if (startTxt) {
      setStartTxt(false); startDzwieku(ust.widzowie / Math.max(1, kd.pojemnosc));
      for (const u of stroje.uwagi) m.komentarz.unshift({ min: "0'", typ: "info", tekst: u });
      if (stroje.kolizja) { const kara = [5000, 3000, 2000, 1000, 500, 300, 200, 150, 100][Math.min(8, kg.poziom - 1)]; kg.kasa -= kara; s.wiadomosci.unshift({ sezon: s.sezon, kolejka: s.kolejka, tekst: `⚖️ Kolizja strojów — ${kg.nazwa} ukarany kwotą ${kara} zł (§ 13 ust. 2 uchwały PZPN IX/140).` }); }
      m.komentarz.unshift({ min: "0'", typ: "info", tekst: `👕 Stroje: ${kd.nazwa} — ${stroje.dom.pole.nazwa.toLowerCase()}, ${kg.nazwa} — ${stroje.gosc.pole.nazwa.toLowerCase()}. Sędzia w kolorze: ${stroje.sedzia.nazwa}.` });
    }
  };
  const dograj = (doPrzerwy: boolean) => { dograjDoKonca(s, m, doPrzerwy); setPredkosc(0); zapiszMecz(s, para, m); odswiez(); };
  const karneW = wynikKarnych(m);
  const minuta = m.koniec ? (karneW ? `KONIEC · karne ${karneW[0]}:${karneW[1]}` : m.polowa >= 3 ? "KONIEC PO DOGRYWCE" : "KONIEC") : karneW ? `🎯 RZUTY KARNE ${karneW[0]}:${karneW[1]}` : przerwa(m) ? "PRZERWA" : m.polowa >= 3 ? `${tekstMinuty(m)} DOGRYWKA` : tekstMinuty(m);
  const posD = m.staty.posN ? Math.round((m.staty.posD / m.staty.posN) * 100) : 50;
  const nz = (id: string) => { const z = s.zawodnicy[id]; return z ? `${z.nazwisko}` : "?"; };

  const Btn = ({ t, on, akt, kol }: { t: string; on: () => void; akt?: boolean; kol?: string }) => (
    <Pressable onPress={on} style={[st.chip, { marginBottom: 6, paddingVertical: 6, paddingHorizontal: 11 }, akt && st.chipAktywny, kol ? { borderColor: kol } : null]}>
      <Text style={{ color: akt ? "#17310f" : kol ?? K.tekst, fontSize: 12.5, fontWeight: "700", fontFamily: CZCIONKA }}>{t}</Text>
    </Pressable>
  );
  const Stat = ({ et, a, b, proc }: { et: string; a: number; b: number; proc?: boolean }) => {
    const sum = a + b || 1;
    return (
      <View style={{ marginVertical: 4 }}>
        <View style={[st.wiersz, { justifyContent: "space-between" }]}><Text style={[st.tekst, { fontWeight: "800" }]}>{proc ? `${a}%` : a}</Text><Text style={st.maly}>{et}</Text><Text style={[st.tekst, { fontWeight: "800" }]}>{proc ? `${b}%` : b}</Text></View>
        <View style={{ flexDirection: "row", height: 5, borderRadius: 3, overflow: "hidden", backgroundColor: K.karta2 }}><View style={{ flex: a / sum, backgroundColor: K.akcent }} /><View style={{ flex: b / sum, backgroundColor: K.niebieski }} /></View>
      </View>
    );
  };
  const Sklad = ({ z, nazwa }: { z: typeof m.dom; nazwa: string }) => (
    <View style={{ flex: 1 }}>
      <Text style={[st.naglowek, { fontSize: 10 }]}>{nazwa} · {z.formacja}</Text>
      {[...z.naBoisku, ...z.czerwoni].map((id) => { const p = s.zawodnicy[id]; if (!p) return null; const oc = m.oceny[id] ?? 6; const cz = z.czerwoni.includes(id);
        return (
          <View key={id} style={{ paddingVertical: 2.5, opacity: cz ? 0.5 : 1 }}>
            <Text style={{ color: K.tekst, fontSize: 12, fontFamily: CZCIONKA }} numberOfLines={1}>
              <Text style={{ color: K.szary }}>{p.numer} </Text>{p.nazwisko}{z.zolte.includes(id) ? " 🟨" : ""}{cz ? " 🟥" : ""}{m.gole.filter((g) => g.strzelec === id && g.typ !== "samoboj").map(() => " ⚽").join("")}{m.urazy.some((u) => u.id === id) ? " 🚑" : ""}
              <Text style={{ color: oc >= 7.5 ? K.zielony : oc < 5.5 ? K.czerwony : K.akcent, fontWeight: "800" }}>  {oc.toFixed(1)}</Text>
            </Text>
            <View style={{ height: 3, backgroundColor: K.karta2, borderRadius: 2, marginTop: 1 }}><View style={{ width: `${Math.round(p.kondycja)}%`, height: 3, borderRadius: 2, backgroundColor: p.kondycja < 55 ? K.czerwony : p.kondycja < 70 ? K.akcent : K.zielony }} /></View>
          </View>
        ); })}
    </View>
  );

  return (
    <Modal visible animationType="slide" onRequestClose={() => {}}>
      <View style={[{ flex: 1, backgroundColor: K.tlo }, web({ backgroundImage: G.tlo })]}>
        {/* grafika wyniku jak w TV — szklana belka 3D w barwach drużyn */}
        <View style={[st.wiersz, { padding: 10, paddingTop: 14, gap: 8, backgroundColor: "#0a1f14", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)" },
          web({ backgroundImage: `linear-gradient(90deg, ${barwyKlubu(kd.nazwa)[0]}99 0%, rgba(6,19,13,0.9) 32%, rgba(6,19,13,0.9) 68%, ${barwyKlubu(kg.nazwa)[0]}99 100%)`, boxShadow: "0 8px 22px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18)" })]}>
          <Herb klub={kd} rozmiar={34} />
          <Text style={{ flex: 1, color: K.tekst, fontWeight: "800", fontSize: 13, fontFamily: CZCIONKA }} numberOfLines={1}>{kd.nazwa}</Text>
          <View style={[{ backgroundColor: "#000", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" }, web({ backgroundImage: "linear-gradient(180deg, #2a2f36 0%, #07090c 55%, #000 100%)", boxShadow: "0 4px 0 #000, 0 8px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.25)" })]}><Text style={[{ color: "#fff", fontWeight: "900", fontSize: 24, fontFamily: CZCIONKA, letterSpacing: 1 }, web({ textShadow: "0 0 10px rgba(255,255,255,0.35)" })]}>{m.gd}:{m.gg}</Text></View>
          <Text style={{ flex: 1, color: K.tekst, fontWeight: "800", fontSize: 13, textAlign: "right", fontFamily: CZCIONKA }} numberOfLines={1}>{kg.nazwa}</Text>
          <Herb klub={kg} rozmiar={34} />
        </View>
        <View style={[st.wiersz, { justifyContent: "center", gap: 10, paddingVertical: 4, backgroundColor: "#071710" }]}>
          {m.puchar ? <Text style={{ color: K.akcent, fontSize: 11, fontWeight: "800" }}>🏆 {m.puchar.nazwa}</Text> : <LogoLigi nazwa={s.ligi[kd.poziom - 1]?.nazwa ?? ""} poziom={kd.poziom} rozmiar={18} />}
          <Text style={{ color: K.akcent, fontWeight: "900", fontFamily: CZCIONKA }}>{minuta}</Text>
          <Text style={st.maly}>🕒 {ust.godz} · {ust.noc ? "🌙 pod reflektorami" : ust.wieczor ? "🌇 zachód słońca" : "☀️ dzień"} · {{ slonce: "pogodnie", deszcz: "🌧 deszcz", snieg: "❄️ śnieg (pomarańczowa piłka)", mgla: "🌫 mgła" }[ust.pogoda]} · {ust.pusto ? "🚷 puste trybuny (kara ZPN)" : `${ust.widzowie.toLocaleString("pl")} widzów`}{ust.derby ? " · ⚔ DERBY" : ""}</Text>
        </View>
        {/* pasek przewagi */}
        <View style={{ flexDirection: "row", height: 4 }}><View style={{ flex: Math.max(0.05, 0.5 + m.momentum * 0.5), backgroundColor: K.akcent }} /><View style={{ flex: Math.max(0.05, 0.5 - m.momentum * 0.5), backgroundColor: K.niebieski }} /></View>

        <ScrollView contentContainerStyle={{ padding: 10, paddingBottom: 40 }}>
          {przed ? (<>
            <PrzedMeczem s={s} m={m} stroje={stroje} ust={ust} onGotowe={() => { setPrzed(false); zapiszMecz(s, para, m); odswiez(); }}
              wyborStrojow={<WyborStrojow s={s} para={para} wybor={wyborStroju} setWybor={setWyborStroju} stroje={stroje} />} />
            <Pressable onPress={() => { for (const [id, k] of Object.entries(m.kondStart)) if (s.zawodnicy[id]) s.zawodnicy[id].kondycja = k; stopDzwieku(); zamilknij(); onAnuluj(); }} style={{ alignItems: "center", marginTop: 10 }}><Text style={[st.maly, { color: K.czerwony }]}>Wróć bez oglądania (mecz zostanie zasymulowany)</Text></Pressable>
          </>) : (<>
          {/* obraz meczu */}
          <View>
            {!bez3D ? (
              <Mecz3D key={wyborStroju.join("-")} s={s} m={m} stroje={stroje} wersja={wersja} predkosc={predkosc} kamera={kamera} ust={ust} onKoniecSekwencji={krok} onPowtorka={setPowt} onBlad={() => setBez3D(true)} />
            ) : <Boisko2D s={s} m={m} />}
            {(() => {
              const k = m.kartki[m.kartki.length - 1], z = m.zmianyLog[m.zmianyLog.length - 1];
              const swiezaK = k && m.min - k.min <= 1 && !m.koniec, swiezaZ = z && m.min - z.min <= 1 && !m.koniec;
              if (!swiezaK && !swiezaZ) return null;
              const pokazZmiane = swiezaZ && (!swiezaK || z.min >= k.min);
              const klub = s.kluby[pokazZmiane ? z.klubId : k.klubId];
              return (
                <View style={{ position: "absolute", left: 8, bottom: 10, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(8,14,30,0.88)", borderRadius: 6, overflow: "hidden" }}>
                  <View style={{ width: 6, alignSelf: "stretch", backgroundColor: pokazZmiane ? "#2fb5e8" : k.typ === "czerwona" ? "#e01010" : "#ffd600" }} />
                  <Herb klub={klub} rozmiar={22} />
                  {pokazZmiane ? (
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4 }}>
                      <Text style={{ color: "#3fd47f", fontSize: 12, fontWeight: "900" }}>▲ {s.zawodnicy[z.wchodzi]?.numer} {s.zawodnicy[z.wchodzi]?.nazwisko?.toUpperCase()}</Text>
                      <Text style={{ color: "#ff6470", fontSize: 12, fontWeight: "900" }}>▼ {s.zawodnicy[z.schodzi]?.numer} {s.zawodnicy[z.schodzi]?.nazwisko?.toUpperCase()}</Text>
                    </View>
                  ) : (
                    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 6 }}>{k.typ === "czerwona" ? "🟥" : "🟨"} {s.zawodnicy[k.id]?.nazwisko?.toUpperCase()} <Text style={{ color: "#bbb", fontWeight: "600", fontSize: 11 }}>{k.opis}</Text></Text>
                  )}
                </View>
              );
            })()}
            {powt && <View style={{ position: "absolute", top: 8, left: 8, backgroundColor: "#c8102e", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>⟲ POWTÓRKA</Text></View>}
            {m.wazne?.typ === "gol" && predkosc > 0 && <View style={{ position: "absolute", top: "38%", alignSelf: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 18, paddingVertical: 6, borderRadius: 8 }}><Text style={{ color: K.akcent, fontWeight: "900", fontSize: 28, fontFamily: CZCIONKA }}>GOOOL!</Text></View>}
            {startTxt && <Pressable onPress={() => graj(1)} style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.35)" } as any}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 20 }}>▶ Rozpocznij mecz</Text><Text style={[st.maly, { color: "#ddd" }]}>{m.zasady.opis}</Text></Pressable>}
          </View>
          {startTxt && !m.przedmecz?.gotowe && <WyborStrojow s={s} para={para} wybor={wyborStroju} setWybor={setWyborStroju} stroje={stroje} />}
          {/* sterowanie */}
          <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 8 }]}>
            <Btn t={predkosc > 0 ? "⏸ Pauza" : "▶ Graj"} on={() => (predkosc > 0 ? setPredkosc(0) : graj(ostatniaPr))} akt={predkosc === 0} />
            {[0.25, 1, 2, 4, 8].map((v) => <Btn key={v} t={v < 1 ? "🐢 ¼×" : `${v}×`} on={() => graj(v)} akt={predkosc === v} />)}
            {!bez3D && !m.koniec && (m.skroty ?? []).some((k) => k.gol) && <Btn t="🔁 Powtórka gola" on={() => { const g = [...(m.skroty ?? [])].reverse().find((k) => k.gol)!; m.sekwencja = g.sek.map((p) => ({ ...p })); setKamera("obrot"); setKom(`🔁 Powtórka (${g.min}) — przeciągnij obraz, by obrócić kamerę. ${g.tekst}`); graj(0.25); setWersja((w) => w + 1); }} />}
            <Btn t={tylkoAkcje ? "⚡ Tylko akcje ✓" : "⚡ Tylko akcje"} on={() => setTylkoAkcje(!tylkoAkcje)} akt={tylkoAkcje} />
            <Btn t={autoPauza ? "⏯ Auto-pauza ✓" : "⏯ Auto-pauza"} on={() => setAutoPauza(!autoPauza)} />
            <Btn t={glosno ? "🔊" : "🔇"} on={() => { wycisz(glosno); setGlosno(!glosno); if (glosno) zamilknij(); }} />
            {glosDostepny() && <Btn t={glosKom ? "🎙 Komentator ✓" : "🎙 Komentator"} on={() => { ustawGlos(!glosKom); setGlosKom(!glosKom); }} akt={glosKom} />}
            {!bez3D && Platform.OS === "web" && <Btn t="🗺 2D" on={() => setBez3D(true)} />}
            {bez3D && Platform.OS === "web" && <Btn t="🏟 3D" on={() => setBez3D(false)} />}
          </View>
          {!bez3D && <View style={[st.wiersz, { flexWrap: "wrap" }]}>{KAMERY.map(([k, t]) => <Btn key={k} t={t} on={() => setKamera(k)} akt={kamera === k} />)}</View>}
          <View style={[st.wiersz, { flexWrap: "wrap" }]}>
            {m.polowa === 1 && !m.koniec && <Btn t="⏭ Do przerwy" on={() => dograj(true)} />}
            {m.zadyma && !m.zadyma.koniec && (<>
              <Btn t="📢 Apel spikera" kol={K.czerwony} on={() => { setKom(reakcjaKlubu(m, "spiker")); odswiez(); }} />
              <Btn t="🧢 Kapitan pod sektor" kol={K.czerwony} on={() => { setKom(reakcjaKlubu(m, "kapitan")); odswiez(); }} />
              <Btn t="⏸ Poproś o przerwę" kol={K.czerwony} on={() => { setKom(reakcjaKlubu(m, "przerwa")); odswiez(); }} />
            </>)}
            {!m.koniec && <Btn t="⏭⏭ Dograj do końca" on={() => dograj(false)} />}
          </View>

          {/* przerwa: mowa w szatni — jedna scena 3D przez całą przerwę (przed i po mowie), mowa zmienia gesty trenera i reakcje drużyny */}
          {przerwa(m) && Platform.OS === "web" && grafika3D() && !bez3D && <View style={{ marginVertical: 8 }}><Szatnia3D s={s} klub={s.kluby[s.mojKlub]} zawodnicy={[...moj.naBoisku, ...moj.lawka]} kit={m.moja === "dom" ? stroje.dom.pole : stroje.gosc.pole} kitBr={m.moja === "dom" ? stroje.dom.br : stroje.gosc.br} nastroj={m.mowa ? (m.motMoj - 1) * 18 : (m.moja === "dom" ? m.gd - m.gg : m.gg - m.gd) * 0.3} mowi={!!m.mowa} przerwa mowa={m.mowa ?? null} /></View>}
          {przerwa(m) && !m.mowa && (
            <View style={[st.karta, { marginHorizontal: 0, borderColor: K.akcent, borderWidth: 1 }]}>
              <Text style={st.naglowek}>🗣 Szatnia — przerwa ({m.gd}:{m.gg})</Text>
              <Text style={st.maly}>Co powiesz drużynie? Efekt zależy od wyniku i charakteru zespołu.</Text>
              <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 6 }]}>
                {([["pochwala", "👏 Pochwała"], ["spokoj", "🧘 Spokojne wskazówki"], ["wiara", "💪 „Wierzę w was!”"], ["ochrzan", "😡 Ostra reprymenda"]] as [Mowa, string][]).map(([t, n]) => <Btn key={t} t={n} on={() => { mow({ pochwala: "Panowie, świetna robota. Tak trzymać!", spokoj: "Spokojnie. Trzymamy się planu, róbmy swoje.", wiara: "Wierzę w was! Wychodzimy i odwracamy ten mecz!", ochrzan: "Co to było?! Tak się nie gra! Chcę widzieć walkę!" }[t], "trener", { przerwij: true, kto: s.trener, plec: plecZImienia(s.trener) }); setKom(mowaWPrzerwie(s, m, t)); odswiez(); }} />)}
              </View>
            </View>
          )}
          {kom && <Text style={[st.maly, { color: K.akcent, marginVertical: 4 }]}>{kom}</Text>}

          {/* zakładki */}
          <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 6 }]}>
            {([["relacja", "📝 Relacja"], ["staty", "📊 Statystyki"], ["sklady", "👥 Składy"], ["taktyka", "📋 Taktyka"], ["zmiany", `🔄 Zmiany ${moj.zmiany}/${m.zasady.limit >= 99 ? "∞" : m.zasady.limit}`]] as [Zakl, string][]).map(([z, t]) => <Btn key={z} t={t} on={() => setZakl(z)} akt={zakl === z} />)}
          </View>
          <View style={[st.karta, { marginHorizontal: 0 }]}>
            {zakl === "relacja" && m.komentarz.slice(0, 40).map((c, i) => (
              <Text key={i} style={{ color: c.typ === "gol" ? K.akcent : c.typ === "kartka" ? "#ffd84d" : c.typ === "var" ? K.niebieski : K.tekst, fontSize: 12.5, marginVertical: 2.5, fontWeight: c.typ === "gol" ? "800" : "400", fontFamily: CZCIONKA }}>
                <Text style={{ color: K.szary, fontWeight: "800" }}>{c.min} </Text>{c.tekst}
              </Text>))}
            {zakl === "staty" && (<>
              <Stat et="Posiadanie" a={posD} b={100 - posD} proc />
              <Stat et="Strzały" a={m.staty.strz[0]} b={m.staty.strz[1]} />
              <Stat et="Celne" a={m.staty.celne[0]} b={m.staty.celne[1]} />
              <Stat et="xG (oczekiwane gole)" a={Math.round(m.staty.xg[0] * 10) / 10} b={Math.round(m.staty.xg[1] * 10) / 10} />
              <Stat et="Rzuty rożne" a={m.staty.rozne[0]} b={m.staty.rozne[1]} />
              <Stat et="Faule" a={m.staty.faule[0]} b={m.staty.faule[1]} />
              <Stat et="Spalone" a={m.staty.spalone[0]} b={m.staty.spalone[1]} />
              <Stat et="Słupki / poprzeczki" a={m.staty.slupki[0]} b={m.staty.slupki[1]} />
              <Stat et="Obrony bramkarza" a={m.staty.obrony[0]} b={m.staty.obrony[1]} />
              <Text style={[st.naglowek, { marginTop: 8 }]}>Mapa strzałów</Text>
              <MapaStrzalow m={m} />
              <Text style={[st.naglowek, { marginTop: 8 }]}>Aktywność zawodników (kontakty z piłką)</Text>
              {[m.dom, m.gosc].map((z, j) => (
                <View key={j} style={{ marginTop: 4 }}>
                  <Text style={st.maly}>{s.kluby[z.klubId].nazwa}</Text>
                  {z.zagrali.map((id) => ({ id, n: m.dotkniecia[id] ?? 0 })).sort((a, b) => b.n - a.n).slice(0, 5).map(({ id, n }) => {
                    const max = Math.max(1, ...Object.values(m.dotkniecia));
                    return (<View key={id} style={[st.wiersz, { gap: 6, marginVertical: 1.5 }]}>
                      <Text style={[st.maly, { width: 110 }]} numberOfLines={1}>{s.zawodnicy[id]?.nazwisko}</Text>
                      <View style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: K.karta2 }}><View style={{ width: `${(n / max) * 100}%`, height: 7, borderRadius: 4, backgroundColor: j ? K.niebieski : K.akcent }} /></View>
                      <Text style={[st.maly, { width: 26, textAlign: "right" }]}>{n}</Text>
                    </View>);
                  })}
                </View>
              ))}
            </>)}
            {zakl === "sklady" && <View style={[st.wiersz, { alignItems: "flex-start", gap: 10 }]}><Sklad z={m.dom} nazwa={kd.nazwa} /><Sklad z={m.gosc} nazwa={kg.nazwa} /></View>}
            {zakl === "taktyka" && (<>
              <Text style={st.naglowek}>Asystent podpowiada</Text>
              {podpowiedzi(s, m).map((p, i) => <Text key={i} style={[st.maly, { marginVertical: 2 }]}>{p}</Text>)}
              <Text style={[st.naglowek, { marginTop: 10 }]}>Nastawienie</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{(Object.keys(NAZWA_NAST) as Nastawienie[]).map((n) => <Btn key={n} t={NAZWA_NAST[n]} akt={moj.nastawienie === n} on={() => { zmienTaktyke(s, m, { nastawienie: n }); odswiez(); }} />)}</View>
              <Text style={[st.naglowek, { marginTop: 6 }]}>Ustawienie</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{Object.keys(FORMACJE).map((f) => <Btn key={f} t={f} akt={moj.formacja === f} on={() => { zmienTaktyke(s, m, { formacja: f }); odswiez(); }} />)}</View>
              <Text style={[st.naglowek, { marginTop: 6 }]}>Tempo i pressing</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>
                {(["wolne", "normalne", "szybkie"] as const).map((t) => <Btn key={t} t={`tempo ${t}`} akt={(s.taktyka.tempo ?? "normalne") === t} on={() => { s.taktyka.tempo = t; odswiez(); }} />)}
                {(["niski", "sredni", "wysoki"] as const).map((t) => <Btn key={t} t={`pressing ${t === "sredni" ? "średni" : t}`} akt={(s.taktyka.pressing ?? "sredni") === t} on={() => { s.taktyka.pressing = t; odswiez(); }} />)}
              </View>
              <Text style={[st.naglowek, { marginTop: 6 }]}>Okrzyk z ławki (~10 min)</Text>
              {(Object.keys(OKRZYKI) as Okrzyk[]).map((o) => (
                <Pressable key={o} onPress={() => { const b = okrzyk(s, m, o); setKom(b ?? `${OKRZYKI[o].nazwa} — ${OKRZYKI[o].opis}`); odswiez(); }} style={{ paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }}>
                  <Text style={[st.tekst, { fontSize: 13, color: m.okrzyk?.typ === o ? K.akcent : K.tekst }]}>{OKRZYKI[o].nazwa} <Text style={st.maly}>— {OKRZYKI[o].opis}</Text></Text>
                </Pressable>))}
            </>)}
            {zakl === "zmiany" && (<>
              <Text style={st.maly}>{m.zasady.opis}. {m.zasady.okna !== null ? `Przerwy na zmiany: ${moj.oknaZmian.length}/${m.zasady.okna}.` : ""}</Text>
              <Text style={[st.naglowek, { marginTop: 8 }]}>1. Kto schodzi?</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{moj.naBoisku.map((id) => { const p = s.zawodnicy[id]; return <Btn key={id} t={`${p?.numer ?? ""} ${nz(id)} ${Math.round(p?.kondycja ?? 0)}%${m.urazy.some((u) => u.id === id) ? " 🚑" : ""}`} akt={schodzi === id} on={() => setSchodzi(id)} />; })}</View>
              <Text style={[st.naglowek, { marginTop: 8 }]}>2. Kto wchodzi?</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{moj.lawka.map((id) => { const p = s.zawodnicy[id]; return <Btn key={id} t={`${p?.poz} ${nz(id)} (${Math.floor(p?.umiej ?? 0)})`} on={() => { if (!schodzi) { setKom("Najpierw wybierz, kto schodzi."); return; } const b = zmianaGracza(s, m, schodzi, id); setKom(b ?? `🔄 ${nz(id)} za ${nz(schodzi)}`); setSchodzi(null); odswiez(); }} />; })}</View>
              {!moj.lawka.length && <Text style={st.maly}>Ławka pusta.</Text>}
            </>)}
          </View>

          {m.koniec && !bez3D && (m.skroty ?? []).length > 0 && (
            <View style={{ marginTop: 6 }}>
              <Text style={[st.maly, { fontWeight: "800" }]}>📽 Skróty meczu — odtwórz w 3D (kamera zza bramki)</Text>
              <View style={[st.wiersz, { flexWrap: "wrap" }]}>{(m.skroty ?? []).map((k, i) => <Btn key={i} t={`${k.gol ? "⚽" : "🔥"} ${k.min}`} on={() => { m.sekwencja = k.sek.map((p) => ({ ...p })); setKamera(i % 2 ? "blisko" : "bramka"); setKom(k.tekst); setWersja((w) => w + 1); }} />)}</View>
            </View>)}
          {m.koniec ? (
            <Pressable style={st.przycisk} onPress={() => { stopDzwieku(); zamilknij(); usunZapisMeczu(); onKoniec(m); }}><Text style={st.przyciskTekst}>✅ Zakończ i zapisz wynik ({m.gd}:{m.gg})</Text></Pressable>
          ) : m.min > 0 ? (
            <Pressable onPress={() => { zapiszMecz(s, para, m); for (const [id, k] of Object.entries(m.kondStart)) if (s.zawodnicy[id]) s.zawodnicy[id].kondycja = k; stopDzwieku(); onAnuluj(); }} style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={[st.maly, { color: K.niebieski }]}>⏏ Wyjdź — mecz zapisany, dokończysz później („▶ Wznów")</Text>
            </Pressable>
          ) : m.min === 0 ? (
            <Pressable onPress={() => { for (const [id, k] of Object.entries(m.kondStart)) if (s.zawodnicy[id]) s.zawodnicy[id].kondycja = k; stopDzwieku(); onAnuluj(); }} style={{ alignItems: "center", marginTop: 8 }}><Text style={[st.maly, { color: K.czerwony }]}>Wróć bez oglądania (mecz zostanie zasymulowany)</Text></Pressable>
          ) : null}
          </>)}
        </ScrollView>
      </View>
    </Modal>
  );
}

/** Lekki widok 2D (słabsze telefony / bez WebGL): boisko z kropkami w miejscu akcji. */
function Boisko2D({ s, m }: { s: StanGry; m: MeczLive }) {
  const b = m.pilka;
  return (
    <Svg width="100%" viewBox="0 0 105 68" style={{ aspectRatio: 105 / 68, backgroundColor: "#2f9a4c", borderRadius: 8 }}>
      <Rect x={0.5} y={0.5} width={104} height={67} fill="none" stroke="#e9f5ea" strokeWidth={0.4} />
      <Line x1={52.5} y1={0.5} x2={52.5} y2={67.5} stroke="#e9f5ea" strokeWidth={0.4} />
      <Circle cx={52.5} cy={34} r={9.15} fill="none" stroke="#e9f5ea" strokeWidth={0.4} />
      <Rect x={0.5} y={13.8} width={16.5} height={40.3} fill="none" stroke="#e9f5ea" strokeWidth={0.4} />
      <Rect x={88} y={13.8} width={16.5} height={40.3} fill="none" stroke="#e9f5ea" strokeWidth={0.4} />
      {m.sekwencja.map((p, i) => i > 0 ? <Line key={i} x1={m.sekwencja[i - 1].x * 1.05} y1={m.sekwencja[i - 1].y * 0.68} x2={p.x * 1.05} y2={p.y * 0.68} stroke="#fff" strokeWidth={0.3} strokeDasharray="1,1" opacity={0.7} /> : null)}
      {[m.dom, m.gosc].map((z, j) => z.naBoisku.map((id, i) => {
        const x = j === 0 ? 8 + (i / 11) * 40 + (b.x - 50) * 0.3 : 97 - (i / 11) * 40 + (b.x - 50) * 0.3;
        const y = 8 + ((i * 37) % 52);
        return <Circle key={id} cx={Math.max(2, Math.min(103, x))} cy={y} r={1.6} fill={j === 0 ? "#ffce47" : "#5aa9ff"} stroke="#000" strokeWidth={0.2} />;
      }))}
      <Circle cx={b.x * 1.05} cy={b.y * 0.68} r={1} fill="#fff" stroke="#000" strokeWidth={0.2} />
    </Svg>
  );
}
function MapaStrzalow({ m }: { m: MeczLive }) {
  const [tryb, setTryb] = useState<"strzaly" | "dom" | "gosc">("strzaly");
  const c = m.cieplo; const arr = c ? (tryb === "dom" ? c.dom : c.gosc) : []; const mx = Math.max(1, ...arr);
  return (
    <View>
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
        {([["strzaly", "🎯 Strzały"], ["dom", "🔥 Heatmapa gosp."], ["gosc", "🔥 Heatmapa gości"]] as const).map(([k, n]) => (
          <Pressable key={k} onPress={() => setTryb(k)} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: tryb === k ? K.akcent : K.linia }}><Text style={{ color: tryb === k ? K.akcent : K.szary, fontSize: 11 }}>{n}</Text></Pressable>))}
      </View>
      <Svg width="100%" viewBox="0 0 105 68" style={{ aspectRatio: 105 / 68, backgroundColor: "#245f37", borderRadius: 6 }}>
        {tryb !== "strzaly" && arr.map((v, i) => v > 0 ? <Rect key={`h${i}`} x={(i % 12) * 8.75} y={Math.floor(i / 12) * 8.5} width={8.75} height={8.5} fill={v / mx > 0.66 ? "#ff3b30" : v / mx > 0.33 ? "#ff9500" : "#ffd60a"} opacity={0.15 + 0.6 * (v / mx)} /> : null)}
        <Rect x={0.5} y={0.5} width={104} height={67} fill="none" stroke="#cfe" strokeWidth={0.3} />
        <Line x1={52.5} y1={0.5} x2={52.5} y2={67.5} stroke="#cfe" strokeWidth={0.3} />
        <Rect x={0.5} y={13.85} width={16.5} height={40.3} fill="none" stroke="#cfe" strokeWidth={0.3} />
        <Rect x={88} y={13.85} width={16.5} height={40.3} fill="none" stroke="#cfe" strokeWidth={0.3} />
        {tryb === "strzaly" && m.staty.strzaly.map((p, i) => <Circle key={i} cx={p.x * 1.05} cy={p.y * 0.68} r={0.8 + p.xg * 4} fill={p.gol ? "#ffce47" : "none"} stroke={p.strona === "dom" ? "#ffce47" : "#5aa9ff"} strokeWidth={0.4} />)}
      </Svg>
    </View>
  );
}

const Probka = ({ k, wybrany, blokada, on }: { k: Kit; wybrany: boolean; blokada: string | null; on: () => void }) => (
  <Pressable onPress={blokada ? undefined : on} style={{ alignItems: "center", marginRight: 10, marginBottom: 6, opacity: blokada ? 0.35 : 1 }}>
    <View style={{ width: 46, height: 46, borderRadius: 8, overflow: "hidden", borderWidth: wybrany ? 3 : 1, borderColor: wybrany ? K.akcent : K.linia, backgroundColor: k.baza, flexDirection: "row" }}>
      {k.wzor === "pasy" && [0, 1, 2].map((i) => <View key={i} style={{ position: "absolute", left: 6 + i * 13, top: 0, bottom: 0, width: 6, backgroundColor: k.dodatek }} />)}
      {k.wzor === "rekaw" && <><View style={{ position: "absolute", left: 0, top: 0, bottom: 18, width: 10, backgroundColor: k.dodatek }} /><View style={{ position: "absolute", right: 0, top: 0, bottom: 18, width: 10, backgroundColor: k.dodatek }} /></>}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, backgroundColor: k.dodatek }} />
    </View>
    <Text style={{ color: wybrany ? K.akcent : K.szary, fontSize: 10, marginTop: 2, fontFamily: CZCIONKA }}>{k.nazwa}{blokada ? " 🚫" : ""}</Text>
  </Pressable>
);
/** Wybór strojów przed meczem — z blokadą kompletów zlewających się z rywalem (PZPN IX/140 § 13). */
function WyborStrojow({ s, para, wybor, setWybor, stroje }: { s: StanGry; para: [string, string]; wybor: [number, number]; setWybor: (w: [number, number]) => void; stroje: ReturnType<typeof dobierzStroje> }) {
  const dom = s.kluby[para[0]], gosc = s.kluby[para[1]];
  const strona = para[0] === s.mojKlub ? "dom" : "gosc";
  const moj = strona === "dom" ? dom : gosc, rywal = strona === "dom" ? gosc : dom;
  const k = kity(moj);
  const dost = dostepneStroje(dom, gosc, strona, wybor[0]);
  const rw = strona === "dom" ? stroje.gosc : stroje.dom;
  return (
    <View style={[st.karta, { marginHorizontal: 0, marginTop: 8 }]}>
      <Text style={st.naglowek}>👕 Stroje na mecz</Text>
      <Text style={[st.maly, { marginBottom: 6 }]}>{strona === "dom" ? "Jesteś gospodarzem — grasz w wybranych barwach, gość musi się dostosować (§ 13 ust. 1 uchwały PZPN IX/140)." : `Grasz na wyjeździe — gospodarz (${rywal.nazwa}) wystąpi w stroju „${rw.pole.nazwa.toLowerCase()}". Komplety zlewające się z nim są zablokowane.`}</Text>
      <Text style={[st.maly, { fontWeight: "800", color: K.tekst }]}>Zawodnicy z pola</Text>
      <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 4 }]}>{k.pole.map((kit, i) => <Probka key={i} k={kit} wybrany={wybor[0] === i} blokada={dost.pole[i]} on={() => setWybor([i, wybor[1]])} />)}</View>
      <Text style={[st.maly, { fontWeight: "800", color: K.tekst }]}>Bramkarz</Text>
      <View style={[st.wiersz, { flexWrap: "wrap", marginTop: 4 }]}>{k.bramkarz.map((kit, i) => <Probka key={i} k={kit} wybrany={(strona === "dom" ? stroje.wyborDom : stroje.wyborGosc)[1] === i} blokada={dost.br[i]} on={() => setWybor([wybor[0], i])} />)}</View>
      {[...dost.pole, ...dost.br].some(Boolean) && <Text style={[st.maly, { fontSize: 10.5 }]}>🚫 {[...dost.pole, ...dost.br].find(Boolean)}</Text>}
      <View style={[st.wiersz, { marginTop: 6, gap: 8 }]}>
        <Text style={st.maly}>Rywal ({rywal.nazwa}):</Text>
        <Probka k={rw.pole} wybrany={false} blokada={null} on={() => {}} /><Probka k={rw.br} wybrany={false} blokada={null} on={() => {}} />
        <Text style={st.maly}>Sędzia: {stroje.sedzia.nazwa}</Text>
      </View>
      {stroje.uwagi.map((u, i) => <Text key={i} style={[st.maly, { color: K.akcent }]}>{u}</Text>)}
    </View>
  );
}

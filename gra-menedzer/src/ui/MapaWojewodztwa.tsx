// Mapa województwa — prawdziwe granice województw (kontury PRG/GUGiK), morze, sąsiednie województwa, wszystkie kluby
// regionu (Ekstraklasa → B-klasa) w swoich miejscowościach: herby klubów Twojej ligi i lig wyższych, kropki w kolorach
// szczebla dla reszty. Podpisy bez nakładania się, przesuwanie palcem, przybliżanie, skala w km, filtr szczebla,
// zgody/kosy wybranego klubu jako linie, karta klubu i lista rywali z odległościami.
import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";
import Svg, { Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { GRANICE, kontur } from "../data/granice";
import { MIASTA, odlegloscDrogowa } from "../data/miasta";
import { RELACJE_KIBICOW } from "../data/relacjeKibicow";
import { wojKlubu, wojLigi } from "../engine/regiony";
import { jestDerby } from "../engine/derby";
import type { Klub, StanGry } from "../engine/types";
import { Herb, nazwaPierwszejDruzyny } from "./Herb";
import { SCIEZKI } from "../data/sciezki";
import { CZCIONKA, K, st } from "./styl";
import { nazwaLigi } from "../data/nazwyLigOficjalne";

const KOLOR_POZ = ["#ffd23f", "#ff9f43", "#ff6b6b", "#c56cf0", "#5aa9ff", "#3fd47f", "#7bed9f", "#b8c4d0", "#8a94a0"];
const NAZWY_POZ = ["Ekstraklasa", "I liga", "II liga", "III liga", "IV liga", "V liga", "Okręgówka", "A klasa", "B klasa"];
const WOJE = [["pomorskie", "Pomorskie"], ["kujawsko-pomorskie", "Kujawsko-pomorskie"], ["zachodniopomorskie", "Zachodniopomorskie"], ["małopolskie", "Małopolskie"], ["warmińsko-mazurskie", "Warmińsko-mazurskie"], ["podlaskie", "Podlaskie"]] as const;
const MORZE: Record<string, [number, number]> = { pomorskie: [54.86, 17.55], zachodniopomorskie: [54.42, 15.0] };
// obszar morza (prostokąt na północ od wybrzeża; ląd rysowany na wierzchu): [lat od, lon od]
const MORZE_OBSZAR: Record<string, [number, number]> = { pomorskie: [54.36, 0], zachodniopomorskie: [53.95, 14.22] };
const SKROT: Record<string, string> = { "kujawsko-pomorskie": "kuj.-pom.", "zachodniopomorskie": "zach.-pom.", "warmińsko-mazurskie": "warm.-maz.", "świętokrzyskie": "świętokrz." };

/** Województwo klubu na mapie: dla lig regionalnych — województwo ligi (pewniejsze niż nazwa miejscowości). */
const wojMapy = (s: StanGry, k: Klub) => { const l = s.ligi[k.poziom - 1]; return (k.poziom >= 5 && l ? wojLigi(l.nazwa)?.[0] : undefined) ?? wojKlubu(k); };
const PREFIKS: Record<string, string> = { pomorskie: "Pomorskie", "kujawsko-pomorskie": "Kujawsko-Pomorskie", zachodniopomorskie: "Zachodniopomorskie", "małopolskie": "Małopolska", "warmińsko-mazurskie": "Warmińsko-Mazurskie", podlaskie: "Podlaskie" };
const _cache = new Map<string, { k: Klub; liga: string }[]>();
/** Wszystkie kluby województwa z danych (każdy podokręg, Ekstraklasa → B-klasa; bez rezerw). */
function klubyWojewodztwa(woj: string) {
  const c = _cache.get(woj); if (c) return c;
  const m = new Map<string, { k: Klub; liga: string }>();
  for (const sc of SCIEZKI) {
    if (!sc.nazwa.startsWith(PREFIKS[woj] ?? "—")) continue;
    sc.ligi.forEach((l, i) => { for (const d of l.kluby ?? []) {
      if (nazwaPierwszejDruzyny(d.nazwa)) continue;
      if (i < 4 && wojKlubu(d) !== woj) continue; // ligi centralne i III liga — tylko kluby z tego województwa
      if (m.has(d.nazwa) && m.get(d.nazwa)!.k.poziom <= i + 1) continue;
      m.set(d.nazwa, { k: { ...(d as object), id: `map_${d.nazwa}`, nazwa: d.nazwa, miasto: d.miasto, poziom: i + 1 } as unknown as Klub, liga: l.nazwa });
    } });
  }
  const out = [...m.values()]; _cache.set(woj, out); return out;
}

export function MapaWojewodztwa({ s }: { s: StanGry }) {
  const moj = s.kluby[s.mojKlub];
  // ligi centralne i III liga (grupy z kilku województw) → mapa Polski; niższe ligi → Twoje województwo
  const [woj, setWoj] = useState<string>(() => (moj.poziom <= 4 ? "polska" : wojMapy(s, moj) ?? "pomorskie"));
  const [grupa, setGrupa] = useState(true); // „Moja grupa”: tylko kluby Twojej ligi/grupy z odległościami
  const [poziom, setPoziom] = useState<number | null>(null);
  const [relacje, setRelacje] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [srodek, setSrodek] = useState<[number, number] | null>(null);
  const [wyb, setWyb] = useState<string | null>(null);
  const [szer, setSzer] = useState(360);
  const [tryb3d, setTryb3d] = useState(false);

  // projekcja: kontur województwa → jednostki mapy (W = 1000), z poprawką cos(φ)
  const geo = useMemo(() => {
    const kt = woj === "polska" ? Object.keys(GRANICE).flatMap((w) => kontur(w)) : kontur(woj); if (!kt.length) return null;
    const lo = kt.map((p) => p[0]), la = kt.map((p) => p[1]);
    let [minLo, maxLo, minLa, maxLa] = [Math.min(...lo), Math.max(...lo), Math.min(...la), Math.max(...la)];
    const pLo = (maxLo - minLo) * 0.06, pLa = (maxLa - minLa) * 0.06; minLo -= pLo; maxLo += pLo; minLa -= pLa; maxLa += pLa;
    const cos = Math.cos(((minLa + maxLa) / 2) * Math.PI / 180);
    const W = 1000, H = W * (maxLa - minLa) / ((maxLo - minLo) * cos);
    const xy = (lat: number, lon: number): [number, number] => [((lon - minLo) / (maxLo - minLo)) * W, ((maxLa - lat) / (maxLa - minLa)) * H];
    const sciezka = (w: string) => kontur(w).map(([a, b], i) => { const [x, y] = xy(b, a); return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`; }).join("") + "Z";
    const inne = Object.keys(GRANICE).filter((w) => w !== woj && woj !== "polska").map((w) => {
      const p = kontur(w); const c = xy(p.reduce((a, q) => a + q[1], 0) / p.length, p.reduce((a, q) => a + q[0], 0) / p.length);
      return { w, d: sciezka(w), c };
    });
    const mo = MORZE_OBSZAR[woj]; const morze = mo ? (() => { const [x0, y0] = xy(mo[0], Math.max(minLo, mo[1])); return { x: x0, y: -H, w: W * 2, h: y0 + H }; })() : null;
    const wszystkieWoj = woj === "polska" ? Object.keys(GRANICE).map((w) => sciezka(w)) : [];
    return { W, H, xy, d: woj === "polska" ? "" : sciezka(woj), wszystkieWoj, inne, morze, jednKm: H / ((maxLa - minLa) * 111.2) };
  }, [woj]);

  // kluby województwa: z danych WSZYSTKICH podokręgów 4 województw (niezależnie od tego, gdzie toczy się kariera),
  // a kluby obecne w Twoim świecie gry — z aktualnym szczeblem po awansach/spadkach
  const kluby = useMemo(() => {
    if (!geo) return [];
    const zDanych = new Map<string, { k: Klub; liga: string }>();
    if (woj !== "polska") for (const d of klubyWojewodztwa(woj)) zDanych.set(d.k.nazwa, d);
    for (const k of Object.values(s.kluby)) {
      if (k.rezerwaDla && k.poziom !== moj.poziom) continue;
      if (woj === "polska" ? k.poziom === moj.poziom : zDanych.has(k.nazwa) || wojMapy(s, k) === woj) zDanych.set(k.nazwa, { k, liga: s.ligi[k.poziom - 1]?.nazwa ?? NAZWY_POZ[Math.min(8, k.poziom - 1)] });
    }
    const wszystkie = [...zDanych.values()];
    const znane = wszystkie.filter((x) => MIASTA[x.k.miasto]);
    const srodekLigi = (p: number): [number, number] => { const z = znane.filter((x) => x.k.poziom === p); const zz = z.length ? z : znane; return zz.length ? [zz.reduce((a, x) => a + MIASTA[x.k.miasto][0], 0) / zz.length, zz.reduce((a, x) => a + MIASTA[x.k.miasto][1], 0) / zz.length] : [0, 0]; };
    return wszystkie.map(({ k, liga }) => { const znana = !!MIASTA[k.miasto]; const [a, b] = znana ? MIASTA[k.miasto] : srodekLigi(k.poziom); const [x, y] = geo.xy(a, b); return { k, liga, x, y, znana }; });
  }, [geo, woj, s]);

  const mojaLiga = s.ligi[moj.poziom - 1]?.nazwa ?? "";
  const derby = useMemo(() => new Set(kluby.filter((p) => s.kluby[p.k.id] && p.k.id !== s.mojKlub && !!jestDerby(s, s.mojKlub, p.k.id)).map((p) => p.k.id)), [kluby]);
  const H = geo?.H ?? 800, W = geo?.W ?? 1000;
  const vbW = W / zoom, vbH = H / zoom;
  const ja = kluby.find((p) => p.k.id === s.mojKlub);
  const [cx0, cy0] = srodek ?? (zoom > 1 && ja ? [ja.x, ja.y] : [W / 2, H / 2]);
  const vx = Math.max(0, Math.min(W - vbW, cx0 - vbW / 2)), vy = Math.max(0, Math.min(H - vbH, cy0 - vbH / 2));
  const wys = Math.min(560, szer * H / W);
  const skala = szer / vbW; // px na jednostkę mapy
  const naEkran = (x: number, y: number): [number, number] => [(x - vx) * skala, (y - vy) * skala];

  // przesuwanie palcem / myszą
  const start = useRef<[number, number]>([0, 0]);
  const stan = useRef({ vx, vy, vbW, vbH, skala }); stan.current = { vx, vy, vbW, vbH, skala };
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6,
    onPanResponderGrant: () => { const c = stan.current; start.current = [c.vx + c.vbW / 2, c.vy + c.vbH / 2]; },
    onPanResponderMove: (_, g) => { const c = stan.current; setSrodek([start.current[0] - g.dx / c.skala, start.current[1] - g.dy / c.skala]); },
  }), []);

  // znaczniki: herby (Twoja liga, ligi wyższe, przy przybliżeniu — wszystkie), kropki dla reszty; rozsunięte w jednym mieście
  const wGrupie = (p: { liga: string; k: Klub }) => p.k.id === s.mojKlub || p.liga === mojaLiga;
  const trybGrupy = grupa && kluby.some((p) => p.liga === mojaLiga && p.k.id !== s.mojKlub);
  const widoczne = kluby.filter((p) => (trybGrupy ? wGrupie(p) : poziom == null || p.k.poziom === poziom || p.k.id === s.mojKlub));
  const kmDo = useMemo(() => new Map(kluby.filter(wGrupie).map((p) => [p.k.id, odlegloscDrogowa(moj.miasto, p.k.miasto)])), [kluby, mojaLiga]);
  // dopasowanie widoku do całej grupy (po wejściu w tryb „Moja grupa” / zmianie mapy)
  useEffect(() => {
    if (!trybGrupy || !geo) return;
    const pk = kluby.filter(wGrupie); if (!pk.length) return;
    const xs = pk.map((p) => p.x), ys = pk.map((p) => p.y);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const z = Math.max(1, Math.min(6, Math.min(geo.W / ((x1 - x0) * 1.5 + 60), geo.H / ((y1 - y0) * 1.5 + 60))));
    setZoom(z); setSrodek([(x0 + x1) / 2, (y0 + y1) / 2]);
  }, [trybGrupy, woj, kluby.length]);
  const znaczniki = useMemo(() => {
    const grupy = new Map<string, typeof widoczne>();
    for (const p of widoczne) { const kl = p.znana ? p.k.miasto : `≈${p.k.poziom}`; grupy.set(kl, [...(grupy.get(kl) ?? []), p]); }
    const out: { p: (typeof widoczne)[number]; sx: number; sy: number; r: number; herb: boolean }[] = [];
    for (const g of grupy.values()) {
      g.sort((a, b) => a.k.poziom - b.k.poziom);
      g.forEach((p, i) => {
        const herb = trybGrupy || p.k.id === s.mojKlub || p.k.id === wyb || p.liga === mojaLiga || p.k.poziom <= 4 || zoom >= 2.4 || poziom != null;
        const r = p.k.id === s.mojKlub ? 17 : herb ? 12 : 5;
        let [sx, sy] = naEkran(p.x, p.y);
        if (g.length > 1) { const kat = i * 2.39996, rr = (herb ? 13 : 7) * Math.sqrt(i) * (p.znana ? 1 : 1.6); sx += Math.cos(kat) * rr; sy += Math.sin(kat) * rr; }
        out.push({ p, sx, sy, r, herb });
      });
    }
    return out;
  }, [widoczne, vx, vy, skala, wyb, zoom, poziom, trybGrupy]);

  // podpisy bez nakładania się (priorytet: Twój klub, wybrany, Twoja liga, wyższe szczeble)
  const podpisy = useMemo(() => {
    const zajete: [number, number, number, number][] = [...znaczniki.map((z) => [z.sx - z.r, z.sy - z.r, z.sx + z.r, z.sy + z.r] as [number, number, number, number]), [szer - 50, 0, szer, 170], [0, wys - 34, 90, wys], [0, 0, 40, 30]];
    const kol = (b: [number, number, number, number]) => b[0] < 0 || b[1] < 0 || b[2] > szer || b[3] > wys || zajete.some((q) => !(b[2] < q[0] || b[0] > q[2] || b[3] < q[1] || b[1] > q[3]));
    const prio = (z: (typeof znaczniki)[number]) => (z.p.k.id === s.mojKlub ? -100 : z.p.k.id === wyb ? -90 : z.p.liga === mojaLiga ? -50 : 0) + z.p.k.poziom;
    const out: { z: (typeof znaczniki)[number]; x: number; y: number; t: string }[] = [];
    for (const z of [...znaczniki].sort((a, b) => prio(a) - prio(b))) {
      const km = trybGrupy && z.p.k.id !== s.mojKlub ? kmDo.get(z.p.k.id) : undefined;
      const t = (z.p.znana ? "" : "≈ ") + z.p.k.nazwa + (km != null ? ` · ${km} km` : ""); const w = t.length * 5.9 + 8, h = 15;
      const kand: [number, number][] = [[z.sx + z.r + 2, z.sy - h / 2], [z.sx - z.r - 2 - w, z.sy - h / 2], [z.sx - w / 2, z.sy + z.r + 1], [z.sx - w / 2, z.sy - z.r - h - 1]];
      let ok = false;
      for (const [x, y] of kand) { const b: [number, number, number, number] = [x, y, x + w, y + h]; if (!kol(b)) { zajete.push(b); out.push({ z, x, y, t }); ok = true; break; } }
      if (!ok && trybGrupy) { // w trybie grupy podpis każdego klubu musi być — przesuwamy w dół, aż znajdzie się miejsce
        for (let d = 1; d < 8 && !ok; d++) for (const [x, y] of [[z.sx + z.r + 2, z.sy - h / 2 + d * 16], [z.sx + z.r + 2, z.sy - h / 2 - d * 16], [z.sx - z.r - 2 - w, z.sy - h / 2 + d * 16]] as [number, number][]) { const b: [number, number, number, number] = [Math.max(0, Math.min(szer - w, x)), Math.max(0, Math.min(wys - h, y)), 0, 0]; b[2] = b[0] + w; b[3] = b[1] + h; if (!kol(b)) { zajete.push(b); out.push({ z, x: b[0], y: b[1], t }); ok = true; break; } }
        if (!ok) out.push({ z, x: Math.max(0, Math.min(szer - w, z.sx + z.r + 2)), y: z.sy - h / 2, t });
      }
    }
    return out;
  }, [znaczniki, szer, wys, trybGrupy, kmDo]);

  if (!geo) return null;
  const k = wyb ? kluby.find((p) => p.k.id === wyb)?.k ?? null : null;
  const relKlubu = (n: string) => RELACJE_KIBICOW.filter((r) => r.a === n || r.b === n);
  const pozByNazwa = new Map(kluby.map((p) => [p.k.nazwa, p]));
  const fokusP = (wyb ? kluby.find((p) => p.k.id === wyb) : null) ?? kluby.find((p) => p.k.id === s.mojKlub);
  const fokus = fokusP?.k ?? moj;
  const linie = relacje ? relKlubu(fokus.nazwa).map((r) => ({ r, a: pozByNazwa.get(r.a), b: pozByNazwa.get(r.b) })).filter((l) => l.a && l.b) : [];
  // skala km (ładna długość ~70–110 px)
  const pxKm = geo.jednKm * skala; const km = [2, 5, 10, 20, 25, 50, 100].find((x) => x * pxKm >= 60) ?? 100;
  const ustawZoom = (z: number) => { setZoom(z); if (z === 1) setSrodek(null); };
  const poziomy = [...new Set(kluby.map((p) => p.k.poziom))].sort((a, b) => a - b);
  const wybierz = (id: string) => { setWyb(id === wyb ? null : id); };
  const doKlubu = (id: string) => { const p = kluby.find((q) => q.k.id === id); if (!p) return; setWyb(id); if (zoom < 2) setZoom(2.4); setSrodek([p.x, p.y]); };
  const chip = (akt: boolean, t: string, on: () => void, kolor?: string) => (
    <Pressable key={t} onPress={on} style={[st.chip, { marginBottom: 0, marginRight: 0, paddingVertical: 5, paddingHorizontal: 10 }, akt && st.chipAktywny]}>
      <Text style={{ color: akt ? "#17310f" : K.tekst, fontSize: 11.5, fontFamily: CZCIONKA }}>{kolor && <Text style={{ color: akt ? "#17310f" : kolor }}>● </Text>}{t}</Text>
    </Pressable>);

  return (
    <View style={[st.karta, { marginTop: 10, padding: 12 }]}>
      <Text style={st.naglowek}>🗺 Mapa {woj === "polska" ? "Polski" : "województwa"}</Text>
      {trybGrupy && <Text style={[st.tekst, { fontSize: 13, marginBottom: 6 }]}>Twoja grupa: <Text style={{ fontWeight: "900", color: K.akcent }}>{mojaLiga}</Text> — {kluby.filter(wGrupie).length} drużyn, każda w swojej miejscowości z odległością drogową od Twojego stadionu.</Text>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {chip(trybGrupy, `📍 Moja grupa (${kluby.filter(wGrupie).length})`, () => { setGrupa(!grupa); if (grupa) { setZoom(1); setSrodek(null); } })}
        {moj.poziom <= 4 && chip(woj === "polska", "Polska", () => { setWoj("polska"); setZoom(1); setSrodek(null); setWyb(null); setPoziom(null); })}
        {WOJE.map(([w, n]) => chip(woj === w, n, () => { setWoj(w); setZoom(1); setSrodek(null); setWyb(null); setPoziom(null); }))}
      </View>
      <View onLayout={(e) => setSzer(Math.max(200, e.nativeEvent.layout.width))} style={{ transform: tryb3d ? [{ perspective: 900 }, { rotateX: "38deg" }, { scale: 0.92 }] : [], shadowColor: "#000", shadowOpacity: tryb3d ? 0.6 : 0, shadowRadius: 18, shadowOffset: { width: 0, height: 16 }, height: wys, borderRadius: 12, overflow: "hidden", backgroundColor: "#151a18", borderWidth: 1, borderColor: K.liniaMocna }} {...pan.panHandlers}>
        <Svg width={szer} height={wys} viewBox={`${vx} ${vy} ${vbW} ${vbH}`} style={{ position: "absolute", left: 0, top: 0 }}>
          <Rect x={-W} y={-H} width={W * 3} height={H * 3} fill="#151a18" />
          {geo.morze && <Rect x={geo.morze.x} y={geo.morze.y} width={geo.morze.w} height={geo.morze.h} fill="#0b2a44" />}
          {geo.inne.map((o) => <Path key={o.w} d={o.d} fill="#1a2a22" stroke="#3b5246" strokeWidth={1.2 / skala} />)}
          <Path d={geo.d} fill="#1d4a31" stroke="#9be7b0" strokeWidth={2.2 / skala} />
          {geo.inne.map((o) => <SvgText key={`n${o.w}`} x={o.c[0]} y={o.c[1]} fontSize={11 / skala} fill="#6f8a7c" textAnchor="middle" fontStyle="italic">{SKROT[o.w] ?? o.w}</SvgText>)}
          {MORZE[woj] && <SvgText x={geo.xy(...MORZE[woj])[0]} y={geo.xy(...MORZE[woj])[1]} fontSize={13 / skala} fill="#6fa6d6" textAnchor="middle" fontStyle="italic" letterSpacing={3 / skala}>Morze Bałtyckie</SvgText>}
          {geo.wszystkieWoj.map((d, i) => <Path key={`pl${i}`} d={d} fill="#1d4a31" stroke="#9be7b0" strokeWidth={1.2 / skala} />)}
          {trybGrupy && ja && widoczne.filter((p) => p.k.id !== s.mojKlub).map((p) => <Line key={`g${p.k.id}`} x1={ja.x} y1={ja.y} x2={p.x} y2={p.y} stroke="#ffce47" strokeWidth={1 / skala} opacity={0.45} />)}
          {ja && [...derby].map((id) => { const p = kluby.find((q) => q.k.id === id); return p ? <Line key={`d${id}`} x1={ja.x} y1={ja.y} x2={p.x} y2={p.y} stroke="#ff3b30" strokeWidth={1.6 / skala} strokeDasharray={`${4 / skala},${3 / skala}`} opacity={0.7} /> : null; })}
          {linie.map((l, i) => <Line key={i} x1={l.a!.x} y1={l.a!.y} x2={l.b!.x} y2={l.b!.y} stroke={l.r.typ === "kosa" ? "#ff5a5a" : l.r.typ === "uklad" ? "#5aa9ff" : "#3fe08a"} strokeWidth={2.4 / skala} strokeDasharray={l.r.typ === "uklad" ? `${6 / skala},${4 / skala}` : undefined} opacity={0.9} />)}
        </Svg>
        {znaczniki.filter((z) => !z.herb).map((z) => (
          <Pressable key={z.p.k.id} onPress={() => wybierz(z.p.k.id)} hitSlop={6} style={{ position: "absolute", left: z.sx - z.r, top: z.sy - z.r, width: z.r * 2, height: z.r * 2, borderRadius: z.r, backgroundColor: KOLOR_POZ[Math.min(8, z.p.k.poziom - 1)], borderWidth: derby.has(z.p.k.id) ? 2.2 : 1.2, borderColor: z.p.k.id === wyb ? K.akcent : derby.has(z.p.k.id) ? "#ff3b30" : "#06130d", opacity: z.p.znana ? 1 : 0.7 }} />))}
        {znaczniki.filter((z) => z.herb).map((z) => { const mj = z.p.k.id === s.mojKlub, sel = z.p.k.id === wyb; return (
          <Pressable key={z.p.k.id} onPress={() => wybierz(z.p.k.id)} style={{ position: "absolute", left: z.sx - z.r, top: z.sy - z.r, width: z.r * 2, height: z.r * 2, borderRadius: z.r, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,19,13,0.78)", borderWidth: mj || sel ? 2 : 1.5, borderColor: mj ? K.akcent : sel ? "#ffffff" : derby.has(z.p.k.id) ? "#ff3b30" : KOLOR_POZ[Math.min(8, z.p.k.poziom - 1)] }}>
            <Herb klub={z.p.k} rozmiar={z.r * 1.45} />
          </Pressable>); })}
        {podpisy.map(({ z, x, y, t }) => { const mj = z.p.k.id === s.mojKlub; return (
          <View key={`p${z.p.k.id}`} pointerEvents="none" style={{ position: "absolute", left: x, top: y, height: 15, paddingHorizontal: 4, borderRadius: 4, justifyContent: "center", backgroundColor: mj ? "rgba(255,206,71,0.92)" : "rgba(6,19,13,0.72)" }}>
            <Text numberOfLines={1} style={{ color: mj ? "#17310f" : z.p.liga === mojaLiga ? "#ffffff" : "#cfe3d8", fontSize: 10, fontWeight: mj || z.p.liga === mojaLiga ? "800" : "500", fontFamily: CZCIONKA }}>{t}</Text>
          </View>); })}
        {/* skala, róża, przybliżenie */}
        <View pointerEvents="none" style={{ position: "absolute", left: 10, bottom: 10 }}>
          <View style={{ width: km * pxKm, height: 5, borderWidth: 1.5, borderTopWidth: 0, borderColor: "#e8f5ec" }} />
          <Text style={{ color: "#e8f5ec", fontSize: 10, fontFamily: CZCIONKA }}>{km} km</Text>
        </View>
        <Text pointerEvents="none" style={{ position: "absolute", left: 10, top: 8, color: "#e8f5ec", fontSize: 12, fontWeight: "900" }}>N ↑</Text>
        <View style={{ position: "absolute", right: 8, top: 8, gap: 6 }}>
          {[["＋", () => ustawZoom(Math.min(6, zoom * 1.6))], ["－", () => ustawZoom(Math.max(1, zoom / 1.6 < 1.05 ? 1 : zoom / 1.6))], ["⌂", () => { if (ja) doKlubu(ja.k.id); }], ["⤢", () => { ustawZoom(1); setWyb(null); }]].map(([t, f]) => (
            <Pressable key={t as string} onPress={f as () => void} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(6,19,13,0.85)", borderWidth: 1, borderColor: K.liniaMocna, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: K.tekst, fontSize: 16, fontWeight: "900" }}>{t as string}</Text>
            </Pressable>))}
        </View>
      </View>
      <Text style={[st.maly, { fontSize: 11, marginTop: 5 }]}>Przesuwaj mapę palcem, dotknij herbu lub kropki. Klubów na mapie: {widoczne.length}{kluby.some((p) => !p.znana) ? " · ≈ położenie przybliżone" : ""}</Text>

      {/* filtr szczebla = legenda */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {chip(poziom == null, "Wszystkie", () => setPoziom(null))}
        {poziomy.map((p) => chip(poziom === p, `${NAZWY_POZ[Math.min(8, p - 1)]}${p === moj.poziom && kluby.some((q) => q.liga === mojaLiga) ? " (Twoja)" : ""}`, () => setPoziom(poziom === p ? null : p), KOLOR_POZ[Math.min(8, p - 1)]))}
        {chip(relacje, "Zgody / kosy", () => setRelacje(!relacje))}
        {chip(tryb3d, "🏔 Widok 3D", () => setTryb3d(!tryb3d))}
      </View>

      {/* karta wybranego klubu (albo Twojego) */}
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center", marginTop: 10, padding: 10, borderRadius: 12, backgroundColor: K.karta2, borderWidth: 1, borderColor: k ? K.akcent : K.linia }}>
        <Herb klub={fokus} rozmiar={44} />
        <View style={{ flex: 1 }}>
          <Text style={[st.tekst, { fontSize: 15, fontWeight: "800" }]}>{fokus.nazwa}{fokus.id === s.mojKlub ? " · Twój klub" : ""}</Text>
          <Text style={[st.maly, { fontSize: 12 }]}>📍 {fokus.miasto}{MIASTA[fokus.miasto] ? "" : " (≈)"} · {nazwaLigi(fokusP?.liga ?? s.ligi[fokus.poziom - 1]?.nazwa) || NAZWY_POZ[fokus.poziom - 1]}{fokus.id !== s.mojKlub ? ` · 🚌 ${odlegloscDrogowa(moj.miasto, fokus.miasto)} km` : ""}</Text>
          {relKlubu(fokus.nazwa).length > 0 && <Text style={[st.maly, { fontSize: 12, marginTop: 2 }]}>{relKlubu(fokus.nazwa).slice(0, 8).map((r) => `${r.typ === "kosa" ? "⚔️" : r.typ === "uklad" ? "🤜🤛" : "🤝"} ${r.a === fokus.nazwa ? r.b : r.a}`).join("  ")}</Text>}
        </View>
      </View>
      <Text style={[st.maly, { fontSize: 10.5, marginTop: 4 }]}><Text style={{ color: "#3fe08a" }}>━ zgoda</Text>  <Text style={{ color: "#5aa9ff" }}>┅ układ</Text>  <Text style={{ color: "#ff5a5a" }}>━ kosa</Text>  (linie dla wybranego klubu)  <Text style={{ color: "#ff3b30" }}>┅ derby Twojego klubu</Text></Text>

      {kluby.some((p) => p.liga === mojaLiga && p.k.id !== s.mojKlub) && <Text style={[st.naglowek, { marginTop: 12 }]}>Twoja liga — odległości od stadionu</Text>}
      {kluby.filter((p) => p.liga === mojaLiga && p.k.id !== s.mojKlub).map((p) => ({ p, d: odlegloscDrogowa(moj.miasto, p.k.miasto) })).sort((a, b) => a.d - b.d).map(({ p, d }) => (
        <Pressable key={p.k.id} onPress={() => doKlubu(p.k.id)} style={[st.wiersz, { gap: 10, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: K.linia, backgroundColor: p.k.id === wyb ? "rgba(255,206,71,0.1)" : "transparent" }]}>
          <Herb klub={p.k} rozmiar={24} />
          <Text style={[st.tekst, { fontSize: 13, flex: 1 }]} numberOfLines={1}>{p.k.nazwa}</Text>
          <Text style={st.maly}>{p.k.miasto} · {d} km</Text>
        </Pressable>))}
    </View>
  );
}

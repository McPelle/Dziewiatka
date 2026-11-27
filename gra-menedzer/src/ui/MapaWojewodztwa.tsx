// Mapa województwa: kluby na mapie (wg współrzędnych miast), Twoja liga wyróżniona, zgody (zielone) i kosy (czerwone) jako linie,
// obozy kibicowskie (kolor patrona). Dotknij klubu — szczegóły.
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { MIASTA } from "../data/miasta";
import { RELACJE_KIBICOW } from "../data/relacjeKibicow";
import { wojKlubu } from "../engine/regiony";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

export function MapaWojewodztwa({ s }: { s: StanGry }) {
  const moj = s.kluby[s.mojKlub];
  const [woj, setWoj] = useState<string>(() => wojKlubu(moj) ?? "pomorskie");
  const [tylkoLiga, setTylkoLiga] = useState(false);
  const [relacje, setRelacje] = useState(true);
  const [wyb, setWyb] = useState<string | null>(null);
  const dane = useMemo(() => {
    const kl = Object.values(s.kluby).filter((k) => MIASTA[k.miasto] && wojKlubu(k) === woj && !k.rezerwaDla && (!tylkoLiga || k.poziom === moj.poziom));
    const pkt = kl.map((k) => MIASTA[k.miasto]);
    const la = pkt.map((p) => p[0]), lo = pkt.map((p) => p[1]);
    const [minLa, maxLa, minLo, maxLo] = [Math.min(...la), Math.max(...la), Math.min(...lo), Math.max(...lo)];
    const W = 100, H = 100 * Math.max(0.6, (maxLa - minLa) / Math.max(0.01, (maxLo - minLo) * 0.62));
    const xy = (m: string) => { const [a, b] = MIASTA[m]; return [4 + ((b - minLo) / Math.max(0.01, maxLo - minLo)) * (W - 8), 4 + ((maxLa - a) / Math.max(0.01, maxLa - minLa)) * (H - 8)] as [number, number]; };
    // rozsuń kluby z tego samego miasta
    const licz: Record<string, number> = {};
    const poz = new Map(kl.map((k) => { const n = (licz[k.miasto] = (licz[k.miasto] ?? 0) + 1) - 1; const [x, y] = xy(k.miasto); return [k.id, [x + Math.cos(n * 2.1) * n * 1.1, y + Math.sin(n * 2.1) * n * 1.1] as [number, number]]; }));
    const nazwy = new Map(kl.map((k) => [k.nazwa, k.id]));
    const linie = RELACJE_KIBICOW.filter((r) => nazwy.has(r.a) && nazwy.has(r.b)).map((r) => ({ a: poz.get(nazwy.get(r.a)!)!, b: poz.get(nazwy.get(r.b)!)!, typ: r.typ }));
    return { kl, poz, W, H, linie };
  }, [woj, tylkoLiga]);
  const k = wyb ? s.kluby[wyb] : null;
  return (
    <View style={[st.karta, { marginTop: 10 }]}>
      <Text style={st.naglowek}>🗺 Mapa województwa</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
        {([["pomorskie", "Pomorskie"], ["kujawsko-pomorskie", "Kujawsko-pomorskie"], ["zachodniopomorskie", "Zachodniopomorskie"], ["małopolskie", "Małopolskie"]] as const).map(([w, n]) => <Pressable key={w} onPress={() => setWoj(w)} style={[st.chip, { marginBottom: 0 }, woj === w && st.chipAktywny]}><Text style={{ color: woj === w ? "#17310f" : K.tekst, fontSize: 11 }}>{n}</Text></Pressable>)}
        <Pressable onPress={() => setTylkoLiga(!tylkoLiga)} style={[st.chip, { marginBottom: 0 }, tylkoLiga && st.chipAktywny]}><Text style={{ color: tylkoLiga ? "#17310f" : K.tekst, fontSize: 11 }}>Tylko moja liga</Text></Pressable>
        <Pressable onPress={() => setRelacje(!relacje)} style={[st.chip, { marginBottom: 0 }, relacje && st.chipAktywny]}><Text style={{ color: relacje ? "#17310f" : K.tekst, fontSize: 11 }}>Zgody / kosy</Text></Pressable>
      </View>
      <View style={{ backgroundColor: "#0e2a1c", borderRadius: 10 }}>
        <Svg width="100%" viewBox={`0 0 ${dane.W} ${dane.H}`} style={{ aspectRatio: dane.W / dane.H }}>
          {relacje && dane.linie.map((l, i) => <Line key={i} x1={l.a[0]} y1={l.a[1]} x2={l.b[0]} y2={l.b[1]} stroke={l.typ === "kosa" ? "#e04848" : "#3fd47f"} strokeWidth={0.35} opacity={0.75} strokeDasharray={l.typ === "uklad" ? "1,1" : undefined} />)}
          {dane.kl.map((c) => { const [x, y] = dane.poz.get(c.id)!; const ja = c.id === s.mojKlub; const r = ja ? 1.8 : c.poziom <= 3 ? 1.4 : c.poziom <= 5 ? 1 : 0.65;
            return <Circle key={c.id} cx={x} cy={y} r={r} fill={ja ? "#ffce47" : c.poziom === moj.poziom ? "#5aa9ff" : "#9fb3a8"} stroke={wyb === c.id ? "#fff" : "#00000088"} strokeWidth={0.3} onPress={() => setWyb(c.id)} />; })}
          {dane.kl.filter((c) => c.poziom <= 2 || c.id === s.mojKlub).map((c) => { const [x, y] = dane.poz.get(c.id)!; return <SvgText key={`t${c.id}`} x={x + 2} y={y + 1} fontSize={2.6} fill="#fff">{c.nazwa}</SvgText>; })}
        </Svg>
      </View>
      <Text style={[st.maly, { marginTop: 4, fontSize: 10.5 }]}>🟡 Twój klub · 🔵 Twoja liga · ⚪ pozostałe · <Text style={{ color: "#3fd47f" }}>— zgoda</Text> · <Text style={{ color: "#3fd47f" }}>- - układ</Text> · <Text style={{ color: "#e04848" }}>— kosa</Text> · klubów na mapie: {dane.kl.length}</Text>
      {k && <Text style={[st.tekst, { marginTop: 6 }]}>📍 {k.nazwa} — {k.miasto} · {s.ligi[k.poziom - 1]?.nazwa ?? `poziom ${k.poziom}`}{RELACJE_KIBICOW.filter((r) => r.a === k.nazwa || r.b === k.nazwa).length ? ` · relacje: ${RELACJE_KIBICOW.filter((r) => r.a === k.nazwa || r.b === k.nazwa).map((r) => `${r.typ === "kosa" ? "⚔" : "🤝"} ${r.a === k.nazwa ? r.b : r.a}`).slice(0, 6).join(", ")}` : ""}</Text>}
    </View>
  );
}

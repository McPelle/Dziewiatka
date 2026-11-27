// Pulpit jak w aplikacji klubowej (#56): kafelki — forma drużyny (ostatnie 5 wyników kolorami), tabela „wokół Ciebie”,
// finanse (kasa z animowaną liczbą i bilans kolejki). Animowane liczby (#53) — wartości „dobiegają” do celu.
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { bilansKolejki } from "../engine/sezon";
import { tabelaLigi } from "../engine/swiat";
import type { StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { CZCIONKA, K, plyta3D, st } from "./styl";

const zl = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} zł`;
/** Liczba, która płynnie dobiega do nowej wartości (np. kasa po transferze). */
export function AnimLiczba({ wartosc, format = (n: number) => `${Math.round(n)}`, style }: { wartosc: number; format?: (n: number) => string; style?: object }) {
  const [v, setV] = useState(wartosc); const od = useRef(wartosc);
  useEffect(() => {
    const start = od.current, cel = wartosc, t0 = Date.now(), dl = 700; let raf = 0;
    const krok = () => { const p = Math.min(1, (Date.now() - t0) / dl), e = 1 - Math.pow(1 - p, 3); const x = start + (cel - start) * e; setV(x); od.current = x; if (p < 1) raf = requestAnimationFrame(krok); };
    raf = requestAnimationFrame(krok); return () => cancelAnimationFrame(raf);
  }, [wartosc]);
  return <Text style={style}>{format(v)}</Text>;
}

export function KafelkiPulpitu({ s }: { s: StanGry }) {
  const k = s.kluby[s.mojKlub]; const liga = s.ligi[k.poziom - 1]; if (!liga) return null;
  const t = tabelaLigi(s, liga); const i = t.findIndex((w) => w.klubId === s.mojKlub); const w = t[i];
  const okno = t.slice(Math.max(0, Math.min(i - 2, t.length - 5)), Math.max(0, Math.min(i - 2, t.length - 5)) + 5);
  const b = bilansKolejki(s);
  const kol = (r: string) => (r === "W" ? K.zielony : r === "P" ? K.czerwony : "#8a94a0");
  const Kafel = ({ tytul, children }: { tytul: string; children: React.ReactNode }) => (
    <View style={{ flexBasis: "48%", flexGrow: 1, backgroundColor: K.karta, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: K.linia, ...plyta3D }}>
      <Text style={[st.naglowek, { marginBottom: 6 }]}>{tytul}</Text>{children}
    </View>);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginHorizontal: 12, marginTop: 12 }}>
      <Kafel tytul="Forma">
        <View style={{ flexDirection: "row", gap: 5 }}>
          {(w?.forma ?? []).slice(-5).map((r, j) => <View key={j} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: kol(r), alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>{r === "W" ? "Z" : r === "P" ? "P" : "R"}</Text></View>)}
          {!(w?.forma ?? []).length && <Text style={st.maly}>Brak meczów</Text>}
        </View>
        <Text style={[st.maly, { marginTop: 6, fontSize: 12 }]}>Miejsce <Text style={{ color: K.tekst, fontWeight: "900" }}>{i + 1}.</Text> · <AnimLiczba wartosc={w?.pkt ?? 0} style={{ color: K.akcent, fontWeight: "900" }} /> pkt</Text>
      </Kafel>
      <Kafel tytul="Finanse">
        <AnimLiczba wartosc={k.kasa} format={zl} style={{ color: k.kasa < 0 ? K.czerwony : K.zielony, fontSize: 18, fontWeight: "900", fontFamily: CZCIONKA }} />
        <Text style={[st.maly, { fontSize: 12, marginTop: 4 }]}>Bilans kolejki: <Text style={{ color: b.bilans >= 0 ? K.zielony : K.czerwony, fontWeight: "800" }}>{b.bilans >= 0 ? "+" : ""}{zl(b.bilans)}</Text></Text>
      </Kafel>
      <View style={{ flexBasis: "100%", backgroundColor: K.karta, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: K.linia, ...plyta3D }}>
        <Text style={[st.naglowek, { marginBottom: 6 }]}>Tabela wokół Ciebie</Text>
        {okno.map((x) => { const nr = t.indexOf(x) + 1, ja = x.klubId === s.mojKlub; return (
          <View key={x.klubId} style={[st.wiersz, { gap: 8, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 8, backgroundColor: ja ? "rgba(255,206,71,0.14)" : "transparent" }]}>
            <Text style={{ color: K.szary, width: 22, fontWeight: "800" }}>{nr}.</Text>
            <Herb klub={s.kluby[x.klubId]} rozmiar={20} />
            <Text style={[st.tekst, { flex: 1, fontSize: 13, fontWeight: ja ? "900" : "500" }]} numberOfLines={1}>{s.kluby[x.klubId]?.nazwa}</Text>
            <Text style={[st.maly, { fontSize: 12 }]}>{x.m} m · {x.bz}:{x.bs}</Text>
            <Text style={{ color: ja ? K.akcent : K.tekst, fontWeight: "900", width: 30, textAlign: "right" }}>{x.pkt}</Text>
          </View>); })}
      </View>
    </View>
  );
}

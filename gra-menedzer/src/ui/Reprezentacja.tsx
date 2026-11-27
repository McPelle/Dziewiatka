import { Text, View } from "react-native";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

/** Reprezentacje: ostatnie mecze kadry Polski i U-21, Twoi reprezentanci i ich kariera w kadrze. */
export function Reprezentacja({ s }: { s: StanGry }) {
  const mecze = s.kadraMecze ?? [];
  const moi = s.kluby[s.mojKlub].zawodnicy.map((id) => s.zawodnicy[id]).filter((z) => z?.kadraStat && z.kadraStat.mecze > 0);
  const legendy = Object.values(s.zawodnicy).filter((z) => z.kadraStat && (z.kadraStat.kraj === "Polska") && z.kadraStat.mecze > 0)
    .sort((a, b) => b.kadraStat!.mecze - a.kadraStat!.mecze).slice(0, 8);
  return (
    <View style={[st.karta, { marginTop: 10 }]}>
      <Text style={st.naglowek}>🇵🇱 Reprezentacje</Text>
      <Text style={st.maly}>Przerwy na kadrę: wrzesień, październik, listopad, marzec. Powołania dostają najlepsi Polacy z całej gry (seniorzy i U-21) oraz wyróżniający się obcokrajowcy z Twojego klubu.</Text>
      {moi.length > 0 && (<>
        <Text style={[st.naglowek, { marginTop: 10 }]}>Twoi reprezentanci</Text>
        {moi.map((z) => <Text key={z.id} style={[st.tekst, { fontSize: 13.5, marginVertical: 2 }]}>🏅 {z.imie} {z.nazwisko} — {z.kadraStat!.kraj}: {z.kadraStat!.mecze} meczów, {z.kadraStat!.gole} goli{z.kadraStat!.debiut ? ` · debiut ${z.kadraStat!.debiut}` : ""}</Text>)}
      </>)}
      <Text style={[st.naglowek, { marginTop: 10 }]}>Ostatnie mecze</Text>
      {mecze.length === 0 ? <Text style={st.maly}>Pierwsza przerwa na kadrę we wrześniu.</Text> : mecze.slice(0, 12).map((m, i) => (
        <View key={i} style={{ paddingVertical: 4, borderTopWidth: i ? 1 : 0, borderTopColor: K.linia }}>
          <Text style={[st.tekst, { fontSize: 13.5, color: m.gs > m.gr ? K.zielony : m.gs < m.gr ? K.czerwony : K.akcent }]}>{m.kadra} — {m.rywal} {m.gs}:{m.gr} <Text style={st.maly}>· {m.typ} · {m.data}</Text></Text>
          {m.strzelcy.length > 0 && <Text style={st.maly}>⚽ {m.strzelcy.join(", ")}</Text>}
          {m.moi.length > 0 && <Text style={[st.maly, { color: K.akcent }]}>Twoi zawodnicy: {m.moi.join(", ")}</Text>}
        </View>))}
      {legendy.length > 0 && (<>
        <Text style={[st.naglowek, { marginTop: 10 }]}>Najwięcej występów w kadrze Polski (w grze)</Text>
        {legendy.map((z, i) => <Text key={z.id} style={[st.maly, { marginVertical: 1 }]}>{i + 1}. {z.imie} {z.nazwisko} ({z.klubId ? s.kluby[z.klubId]?.nazwa : "bez klubu"}) — {z.kadraStat!.mecze} m., {z.kadraStat!.gole} g.</Text>)}
      </>)}
    </View>
  );
}

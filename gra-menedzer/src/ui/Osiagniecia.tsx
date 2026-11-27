// Osiągnięcia trenera i poziom trudności (Centrum klubu).
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { OSIAGNIECIA, TRUDNOSCI, trudnosc, type Trudnosc } from "../engine/osiagniecia";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

export function Osiagniecia({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [otw, setOtw] = useState(false);
  const ma = s.osiagniecia ?? {};
  const ile = OSIAGNIECIA.filter((o) => ma[o.id]).length;
  return (
    <View style={[st.karta, { marginTop: 10 }]}>
      <Pressable onPress={() => setOtw(!otw)}>
        <Text style={st.naglowek}>🏅 Osiągnięcia — {ile}/{OSIAGNIECIA.length} {otw ? "▲" : "▼"}</Text>
        <View style={{ height: 5, backgroundColor: "#173126", borderRadius: 3, marginTop: 4 }}><View style={{ width: `${(ile / OSIAGNIECIA.length) * 100}%`, height: 5, backgroundColor: K.akcent, borderRadius: 3 }} /></View>
      </Pressable>
      <Text style={[st.naglowek, { marginTop: 10 }]}>🎚 Poziom trudności</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {(Object.keys(TRUDNOSCI) as Trudnosc[]).map((t) => <Pressable key={t} onPress={() => { s.trudnosc = t; odswiez(); }} style={[st.chip, { marginBottom: 0 }, trudnosc(s) === t && st.chipAktywny]}><Text style={{ color: trudnosc(s) === t ? "#17310f" : K.tekst, fontSize: 12, fontWeight: "700" }}>{TRUDNOSCI[t].nazwa}</Text></Pressable>)}
      </View>
      <Text style={[st.maly, { marginTop: 4 }]}>{TRUDNOSCI[trudnosc(s)].opis}</Text>
      {otw && OSIAGNIECIA.map((o) => (
        <View key={o.id} style={[st.wiersz, { gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia, opacity: ma[o.id] ? 1 : 0.45 }]}>
          <Text style={{ fontSize: 22 }}>{ma[o.id] ? o.ikona : "🔒"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.tekst, { fontSize: 13.5, fontWeight: "800" }]}>{o.nazwa}</Text>
            <Text style={st.maly}>{o.opis}{ma[o.id] ? ` · zdobyte w sezonie ${ma[o.id]}` : ""}</Text>
          </View>
        </View>))}
    </View>
  );
}

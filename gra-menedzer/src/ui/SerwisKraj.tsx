// Panel „Wiadomości z kraju”: serwis ze świata gry (Ekstraklasa, I liga, zmiany trenerów, transfery, kadra).
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { serwisKraju } from "../engine/serwisKraj";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

export function SerwisKraj({ s }: { s: StanGry }) {
  const [ile, setIle] = useState(8); const n = serwisKraju(s);
  return (
    <View style={[st.karta, { marginTop: 10 }]}>
      <Text style={st.naglowek}>📡 Wiadomości z kraju</Text>
      {n.length === 0 ? <Text style={st.maly}>Serwis ruszy po pierwszej kolejce.</Text> : n.slice(0, ile).map((x, i) => (
        <View key={i} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: K.linia }}>
          <Text style={[st.tekst, { fontWeight: "800", fontSize: 13.5 }]}>{x.ikona} {x.tytul}</Text>
          <Text style={[st.maly, { fontSize: 12 }]}>{x.tekst} · kolejka {x.kolejka + 1}</Text>
        </View>))}
      {n.length > ile && <Pressable onPress={() => setIle(ile + 10)}><Text style={[st.maly, { color: K.akcent, marginTop: 6 }]}>Więcej ›</Text></Pressable>}
    </View>
  );
}

import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import type { StanGry } from "../engine/types";
import { listaZapisow, usunSlot, wczytajSlot, type MetaZapisu } from "./zapis";
import { CZCIONKA, K, st } from "./styl";

function kiedyTekst(ms: number): string {
  const d = new Date(ms);
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}`;
}

export function WczytajGre({ onWczytaj, onWstecz }: { onWczytaj: (s: StanGry) => void; onWstecz: () => void }) {
  const [lista, setLista] = useState<MetaZapisu[] | null>(null);
  const odswiez = () => listaZapisow().then(setLista);
  useEffect(() => { odswiez(); }, []);

  const usun = async (m: MetaZapisu) => {
    const ok = Platform.OS === "web" ? window.confirm(`Usunąć zapis „${m.nazwa}"?`) : true;
    if (!ok) return;
    await usunSlot(m.id);
    odswiez();
  };
  const wczytaj = async (m: MetaZapisu) => {
    const s = await wczytajSlot(m.id);
    if (s) onWczytaj(s);
  };

  return (
    <View style={st.ekran}>
      <View style={[st.wiersz, { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: K.pas, borderBottomWidth: 1, borderBottomColor: K.liniaMocna }]}>
        <Pressable onPress={onWstecz} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: K.karta2, borderWidth: 1, borderColor: K.linia, opacity: pressed ? 0.8 : 1 }]}>
          <Text style={{ color: K.akcent, fontSize: 16, fontWeight: "900", marginRight: 4, fontFamily: CZCIONKA }}>‹</Text>
          <Text style={{ color: K.tekst, fontSize: 13, fontWeight: "700", fontFamily: CZCIONKA }}>Wstecz</Text>
        </Pressable>
        <Text style={{ color: K.tekst, fontSize: 16, fontWeight: "800", marginLeft: 12, fontFamily: CZCIONKA }}>💾 Wczytaj grę</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 28 }}>
        {lista === null ? null : lista.length === 0 ? (
          <View style={[st.karta, { alignItems: "center", paddingVertical: 30 }]}>
            <Text style={{ fontSize: 34, marginBottom: 8 }}>🗂</Text>
            <Text style={{ color: K.tekst, fontSize: 15, fontWeight: "800", fontFamily: CZCIONKA }}>Brak zapisów</Text>
            <Text style={{ color: K.szary, fontSize: 12.5, marginTop: 4, textAlign: "center", fontFamily: CZCIONKA }}>Zacznij nową karierę i użyj „Zapisz grę" w menu Więcej, aby utworzyć zapis.</Text>
          </View>
        ) : (
          lista.map((m) => (
            <View key={m.id} style={[st.karta, st.wiersz, { marginTop: 8, paddingVertical: 12 }]}>
              <View style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: K.karta2, borderWidth: 1, borderColor: K.liniaMocna, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 20 }}>⚽</Text>
              </View>
              <Pressable onPress={() => wczytaj(m)} style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: K.tekst, fontSize: 15.5, fontWeight: "800", fontFamily: CZCIONKA }}>{m.nazwa}</Text>
                <Text numberOfLines={1} style={{ color: K.szary, fontSize: 12, marginTop: 1, fontFamily: CZCIONKA }}>{m.liga} · sezon {m.sezon}</Text>
                <Text style={{ color: K.szary, fontSize: 10.5, opacity: 0.8, marginTop: 1, fontFamily: CZCIONKA }}>zapisano {kiedyTekst(m.kiedy)}</Text>
              </Pressable>
              <Pressable onPress={() => wczytaj(m)} style={({ pressed }) => [{ backgroundColor: K.akcent, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 8, marginLeft: 8, opacity: pressed ? 0.9 : 1 }]}>
                <Text style={{ color: "#15300c", fontWeight: "900", fontSize: 13, fontFamily: CZCIONKA }}>Wczytaj</Text>
              </Pressable>
              <Pressable onPress={() => usun(m)} style={({ pressed }) => [{ paddingHorizontal: 8, paddingVertical: 8, marginLeft: 2, opacity: pressed ? 0.6 : 1 }]}>
                <Text style={{ color: K.czerwony, fontSize: 16, fontWeight: "900" }}>✕</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

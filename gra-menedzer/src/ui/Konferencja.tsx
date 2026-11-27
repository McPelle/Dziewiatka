import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { odpowiedzKonferencja } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

export function KonferencjaEkran({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const k = s.konferencja;
  return (
    <Modal visible={!!k} transparent animationType="slide" onRequestClose={() => { odpowiedzKonferencja(s, -1); odswiez(); }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "88%", paddingBottom: 20 }}>
          {k && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <Text style={st.maly}>🎙 Konferencja prasowa · {k.kontekst}</Text>
              <Text style={[st.tytul, { marginTop: 6 }]}>„{k.pytanie}"</Text>
              <Text style={[st.maly, { marginTop: 8, marginBottom: 6 }]}>Twoja odpowiedź wpłynie na morale szatni i zaufanie zarządu:</Text>
              {k.opcje.map((o, i) => (
                <Pressable key={i} style={[st.karta, { marginHorizontal: 0, marginTop: 8 }]} onPress={() => { odpowiedzKonferencja(s, i); odswiez(); }}>
                  <Text style={[st.tekst, { fontSize: 15, fontWeight: "600" }]}>{o.tekst}</Text>
                  <View style={[st.wiersz, { gap: 12, marginTop: 6 }]}>
                    <Text style={[st.maly, { color: o.morale > 0 ? K.zielony : o.morale < 0 ? K.czerwony : K.szary }]}>Szatnia {o.morale > 0 ? "+" : ""}{o.morale}</Text>
                    <Text style={[st.maly, { color: o.zarzad > 0 ? K.zielony : o.zarzad < 0 ? K.czerwony : K.szary }]}>Zarząd {o.zarzad > 0 ? "+" : ""}{o.zarzad}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { odpowiedzKonferencja } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";

const Efekt = ({ et, v }: { et: string; v?: number }) => (!v ? null : (
  <Text style={[st.maly, { color: v > 0 ? K.zielony : K.czerwony, marginRight: 10 }]}>{et} {v > 0 ? "▲" : "▼"}</Text>
));

/** Konferencja prasowa (przed- lub pomeczowa): kolejne pytania dziennikarzy, każda odpowiedź ma skutki. */
export function KonferencjaEkran({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const k = s.konferencja;
  return (
    <Modal visible={!!k} transparent animationType="slide" onRequestClose={() => { odpowiedzKonferencja(s, -1); odswiez(); }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "90%", paddingBottom: 20, borderTopWidth: 2, borderColor: K.akcent }}>
          {k && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <View style={[st.wiersz, { justifyContent: "space-between" }]}>
                <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 12, letterSpacing: 0.6, fontFamily: CZCIONKA }}>
                  🎙 {k.typ === "przed" ? "KONFERENCJA PRZEDMECZOWA" : "KONFERENCJA POMECZOWA"}
                </Text>
                {k.ile ? <Text style={st.maly}>pytanie {k.nr}/{k.ile}</Text> : null}
              </View>
              <Text style={[st.maly, { marginTop: 4 }]}>{k.media ? `${k.media} · ` : ""}{k.kontekst}</Text>
              <View style={{ marginTop: 10, backgroundColor: K.karta2, borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: K.niebieski }}>
                <Text style={[st.tekst, { fontSize: 16.5, fontWeight: "800", lineHeight: 22 }]}>„{k.pytanie}"</Text>
              </View>
              <Text style={[st.maly, { marginTop: 10 }]}>Twoja odpowiedź:</Text>
              {k.opcje.map((o, i) => (
                <Pressable key={i} style={({ pressed }) => [st.karta, { marginHorizontal: 0, marginTop: 8, opacity: pressed ? 0.85 : 1 }]} onPress={() => { odpowiedzKonferencja(s, i); odswiez(); }}>
                  <Text style={[st.tekst, { fontSize: 15, fontWeight: "600" }]}>{o.tekst}</Text>
                  <View style={[st.wiersz, { marginTop: 6, flexWrap: "wrap" }]}>
                    <Efekt et="Szatnia" v={o.morale} />
                    <Efekt et="Zarząd" v={o.zarzad} />
                    <Efekt et="Kibice" v={o.kibice} />
                    <Efekt et="Motywacja na mecz" v={o.motywacja} />
                    {o.zawodnik ? <Efekt et={s.zawodnicy[o.zawodnik.id]?.nazwisko ?? "Zawodnik"} v={o.zawodnik.morale} /> : null}
                  </View>
                </Pressable>
              ))}
              <Pressable style={{ marginTop: 14, alignItems: "center" }} onPress={() => { odpowiedzKonferencja(s, -1); odswiez(); }}>
                <Text style={[st.maly, { color: K.czerwony }]}>Odmów dalszych odpowiedzi (media i zarząd będą niezadowoleni)</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { anulujPrzetarg, budowyKlubu, firma, opisUtrudnien, wybierzOferte } from "../engine/budowy";
import { zl } from "../engine/losuj";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));
const gwiazdki = (x: number) => { const n = Math.max(1, Math.min(5, Math.round((x - 0.45) / 0.11))); return "★".repeat(n) + "☆".repeat(5 - n); };

/** Otwarty przetarg: oferty firm do wyboru. */
export function PrzetargPanel({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const p = s.przetarg;
  if (!p) return null;
  const najtansza = Math.min(...p.oferty.map((o) => o.koszt)), najszybsza = Math.min(...p.oferty.map((o) => o.dni));
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => { anulujPrzetarg(s); odswiez(); }}>
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 14 }}>
    <ScrollView style={{ maxHeight: "92%" }} contentContainerStyle={{ flexGrow: 0 }}>
    <View style={[st.karta, { marginHorizontal: 0, borderColor: K.akcent, borderWidth: 1, backgroundColor: K.tlo }]}>
      <Text style={st.naglowek}>📑 Przetarg: {p.nazwa}</Text>
      <Text style={st.maly}>Utrudnienia w trakcie prac: {opisUtrudnien(p.cel)}. Płacisz 30% zaliczki przy podpisaniu, resztę przy odbiorze. Wskazówka: buduj w okresie przygotowawczym — bez meczów u siebie nikt nie odczuje utrudnień.</Text>
      {p.oferty.map((o, i) => {
        const f = firma(o.firmaId);
        return (
          <View key={o.firmaId} style={{ borderTopWidth: 1, borderTopColor: K.linia, paddingVertical: 8, marginTop: 4 }}>
            <Text style={[st.tekst, { fontWeight: "800" }]}>{f.nazwa} {o.koszt === najtansza ? <Text style={{ color: K.zielony, fontSize: 11 }}> NAJTAŃSZA</Text> : null}{o.dni === najszybsza ? <Text style={{ color: K.akcent, fontSize: 11 }}> NAJSZYBSZA</Text> : null}</Text>
            <Text style={st.maly}>{f.opis}</Text>
            <Text style={[st.maly, { marginTop: 2 }]}>💰 {zl(o.koszt)} · ⏱ {o.dni} dni · 🛡 gwarancja {o.gwarancja} {o.gwarancja === 1 ? "rok" : "lata"}</Text>
            <Text style={[st.maly, { fontSize: 11 }]}>Terminowość {gwiazdki(f.rzetelnosc)} · Jakość {gwiazdki(f.jakosc)}</Text>
            <Pressable style={[st.przyciskMaly, { marginTop: 5, alignSelf: "flex-start", borderColor: K.zielony }]}
              onPress={() => { const b = wybierzOferte(s, i); odswiez(); komunikat(b ?? `🏗 Umowa z ${f.nazwa} podpisana — robotnicy wchodzą na plac budowy.`); }}>
              <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>✍️ Wybierz tę firmę</Text>
            </Pressable>
          </View>
        );
      })}
      <Pressable onPress={() => { anulujPrzetarg(s); odswiez(); }} style={{ marginTop: 4 }}><Text style={[st.maly, { color: K.czerwony }]}>Unieważnij przetarg</Text></Pressable>
    </View>
    </ScrollView>
    </View>
    </Modal>
  );
}

/** Trwające budowy — postęp, termin, zdarzenia. */
export function TrwajaceBudowy({ s }: { s: StanGry }) {
  const lista = budowyKlubu(s);
  if (!lista.length) return null;
  return (
    <View style={[st.karta, { marginHorizontal: 0 }]}>
      <Text style={st.naglowek}>🚧 Trwające budowy ({lista.length}/3)</Text>
      {lista.map((b) => {
        const razem = b.dniRazem + b.opoznienie, proc = Math.min(1, b.dniMinelo / razem);
        return (
          <View key={b.id} style={{ borderTopWidth: 1, borderTopColor: K.linia, paddingVertical: 7 }}>
            <Text style={[st.tekst, { fontWeight: "800" }]}>{b.nazwa}</Text>
            <Text style={st.maly}>{firma(b.firmaId).nazwa} · zostało {Math.max(0, razem - b.dniMinelo)} dni{b.opoznienie ? ` (opóźnienie +${b.opoznienie})` : ""} · {zl(b.koszt)} (zapłacono {zl(b.zaplacono)})</Text>
            <View style={{ height: 8, backgroundColor: K.karta2, borderRadius: 4, marginVertical: 4, overflow: "hidden" }}>
              <View style={{ width: `${Math.round(proc * 100)}%`, height: 8, backgroundColor: b.opoznienie ? "#e0a030" : K.zielony }} />
            </View>
            <Text style={[st.maly, { fontSize: 11 }]}>Utrudnienia: {opisUtrudnien(b.cel)}</Text>
            {b.zdarzenia.slice(-2).map((z, i) => <Text key={i} style={[st.maly, { fontSize: 11 }]}>• {z}</Text>)}
          </View>
        );
      })}
    </View>
  );
}

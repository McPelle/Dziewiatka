// Panel „Wydział Gier i Kolegium Sędziów”: protesty po meczach, oceny sędziów ze skargą, zaległości płacowe i Izba PZPN.
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { StanGry } from "../engine/types";
import { oplataSkargi, wydzial, zlozProtest, zlozSkarge } from "../engine/wydzialGier";
import { K, st } from "./styl";

const zl = (n: number) => `${Math.round(n).toLocaleString("pl-PL")} zł`;
const STATUS: Record<string, string> = { mozliwy: "możesz złożyć", zlozony: "⏳ rozpatrywany", uwzgledniony: "✅ uwzględniony — walkower 3:0", odrzucony: "❌ oddalony", przepadl: "⌛ termin minął" };

export function WydzialGier({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const W = wydzial(s); const mk = s.kluby[s.mojKlub];
  const [info, setInfo] = useState<string | null>(null);
  return (
    <View style={[st.karta, { marginTop: 10 }]}>
      <Text style={st.naglowek}>⚖️ Wydział Gier · Kolegium Sędziów · Izba PZPN</Text>
      {info && <Text style={[st.tekst, { color: K.akcent, marginBottom: 6 }]}>{info}</Text>}
      {(W.zaleglosci > 0 || W.zakazTransferow) && (
        <View style={{ padding: 8, borderRadius: 10, backgroundColor: "rgba(255,100,112,0.12)", borderWidth: 1, borderColor: K.czerwony, marginBottom: 8 }}>
          <Text style={[st.tekst, { color: K.czerwony, fontWeight: "800" }]}>💸 Zaległości płacowe: {W.zaleglosci} {W.zaleglosci === 1 ? "tydzień" : "tyg."}{W.zakazTransferow ? " · ⛔ ZAKAZ TRANSFERÓW (Izba PZPN)" : ""}</Text>
          <Text style={st.maly}>Po miesiącu spada morale, po ponad 2 miesiącach zawodnicy idą do Izby PZPN i mogą rozwiązać kontrakty z winy klubu. Wyjdź z kasą nad kreskę, by spłacić.</Text>
        </View>)}
      <Text style={[st.maly, { fontWeight: "800", marginBottom: 4 }]}>Protesty</Text>
      {W.protesty.length === 0 ? <Text style={st.maly}>Brak spraw. Gdy kierownik drużyny zauważy nieprawidłowość u rywala, pojawi się tutaj.</Text> :
        W.protesty.map((o) => (
          <View key={o.id} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: K.linia }}>
            <Text style={st.tekst}>{s.kluby[o.rywal]?.nazwa} ({o.wynik}, kolejka {o.kolejka + 1})</Text>
            <Text style={st.maly}>{o.zawodnik} {o.powod} · dowody: {o.dowody >= 0.75 ? "mocne" : o.dowody >= 0.55 ? "średnie" : "słabe"} · {STATUS[o.status]}</Text>
            {o.status === "mozliwy" && <Pressable onPress={() => { setInfo(zlozProtest(s, o.id)); odswiez(); }} style={[st.przyciskMaly, { alignSelf: "flex-start", marginTop: 4 }]}><Text style={st.przyciskMalyTekst}>📨 Złóż protest ({zl(o.oplata)})</Text></Pressable>}
          </View>))}
      <Text style={[st.maly, { fontWeight: "800", marginTop: 10, marginBottom: 4 }]}>Oceny sędziów (obserwator Kolegium)</Text>
      {W.sedziowie.length === 0 ? <Text style={st.maly}>Pojawią się po pierwszym meczu.</Text> :
        W.sedziowie.slice(0, 6).map((o, i) => (
          <View key={`${o.kolejka}_${i}`} style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: K.linia }}>
            <View style={[st.wiersz, { justifyContent: "space-between" }]}>
              <Text style={[st.tekst, { flex: 1 }]} numberOfLines={1}>{o.sedzia} · vs {o.rywal}</Text>
              <Text style={{ color: o.ocena >= 8.2 ? K.zielony : o.ocena < 7.6 ? K.czerwony : K.akcent, fontWeight: "900" }}>{o.ocena.toFixed(1)}</Text>
            </View>
            {o.uwagi.length > 0 && <Text style={st.maly}>{o.uwagi.join(" · ")}</Text>}
            {o.skarga ? <Text style={st.maly}>Skarga: {o.skarga === "zlozona" ? "⏳ rozpatrywana" : o.skarga === "uznana" ? "✅ uznana" : "❌ oddalona"}</Text>
              : i < 2 && <Pressable onPress={() => { setInfo(zlozSkarge(s, i)); odswiez(); }} style={[st.przyciskMaly, { alignSelf: "flex-start", marginTop: 4 }]}><Text style={st.przyciskMalyTekst}>📝 Skarga do Kolegium ({zl(oplataSkargi(mk.poziom))})</Text></Pressable>}
          </View>))}
    </View>
  );
}

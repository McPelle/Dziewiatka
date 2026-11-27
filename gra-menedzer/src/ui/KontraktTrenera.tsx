import { useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import { zl } from "../engine/losuj";
import { latTrenera, negocjujKontraktTrenera, odrzucPropozycjeTrenera, przyjmijPropozycjeTrenera } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));

/** Karta na pulpicie: kończący się kontrakt trenera, propozycja zarządu i negocjacje przez agenta. */
export function KontraktTrenera({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const p = s.propozycjaTrenera;
  const [neg, setNeg] = useState(false);
  const [pensja, setPensja] = useState(p ? Math.round(p.pensja * 1.15 / 100) * 100 : 0);
  const [lata, setLata] = useState(p ? p.lata : 2);
  const [odp, setOdp] = useState<string | null>(null);
  if (s.zwolniony || latTrenera(s) > 0) return null;
  const krok = Math.max(100, Math.round(((p?.pensja ?? s.trenerPensja ?? 1000) * 0.05) / 100) * 100);

  if (!p) {
    return (
      <View style={[st.karta, { borderColor: K.akcent, borderWidth: 1 }]}>
        <Text style={st.naglowek}>⏳ Ostatni sezon Twojego kontraktu</Text>
        <Text style={st.maly}>Umowa obowiązuje do końca sezonu {s.sezon}/{(s.sezon + 1) % 100}. Zarząd zdecyduje o przedłużeniu po półmetku rozgrywek (zaufanie: {Math.round(s.zarzad)}%).</Text>
      </View>
    );
  }
  if (p.status !== "otwarta") {
    return (
      <View style={[st.karta, { borderColor: K.czerwony, borderWidth: 1 }]}>
        <Text style={st.naglowek}>{p.status === "wycofana" ? "🚪 Zarząd zerwał rozmowy" : "✋ Odrzuciłeś przedłużenie"}</Text>
        <Text style={st.maly}>Po sezonie umowa wygaśnie, a {s.trenerAgent ?? "agent"} zbierze oferty z innych klubów{p.status === "odrzucona" ? " (obecny klub też może jeszcze złożyć ofertę)" : ""}.</Text>
      </View>
    );
  }
  return (
    <View style={[st.karta, { borderColor: K.akcent, borderWidth: 2 }]}>
      <Text style={st.naglowek}>📝 Propozycja przedłużenia kontraktu</Text>
      <Text style={st.tekst}>{zl(p.pensja)}/sezon · {p.lata} {p.lata === 1 ? "sezon" : "sezony"} <Text style={st.maly}>(obecnie {zl(s.trenerPensja ?? 0)}/sezon)</Text></Text>
      <Text style={[st.maly, { marginTop: 2 }]}>Zaufanie zarządu {Math.round(s.zarzad)}% · runda rozmów {p.rundy}/3</Text>
      {odp ? <Text style={[st.maly, { marginTop: 6, color: K.niebieski }]}>{odp}</Text> : null}
      {!neg ? (
        <View style={[st.wiersz, { gap: 6, marginTop: 10, flexWrap: "wrap" }]}>
          <Pressable style={[st.przyciskMaly, { borderColor: K.zielony }]} onPress={() => { const b = przyjmijPropozycjeTrenera(s); odswiez(); komunikat(b ?? "Kontrakt przedłużony!"); }}>
            <Text style={[st.przyciskMalyTekst, { color: K.zielony }]}>✍ Przyjmij</Text>
          </Pressable>
          <Pressable style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={() => { setPensja(Math.round(p.pensja * 1.15 / 100) * 100); setLata(p.lata); setNeg(true); }}>
            <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>🤝 Negocjuj (agent)</Text>
          </Pressable>
          <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={() => { odrzucPropozycjeTrenera(s); odswiez(); }}>
            <Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Odrzuć</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Text style={st.maly}>Żądanie, które {s.trenerAgent ?? "agent"} przedstawi zarządowi:</Text>
          <View style={[st.wiersz, { gap: 8, marginTop: 6, alignItems: "center" }]}>
            <Text style={[st.maly, { width: 60 }]}>Pensja</Text>
            <Pressable style={st.przyciskMaly} onPress={() => setPensja((x) => Math.max(krok, x - krok))}><Text style={st.przyciskMalyTekst}>−</Text></Pressable>
            <Text style={[st.tekst, { fontWeight: "800", minWidth: 110, textAlign: "center" }]}>{zl(pensja)}</Text>
            <Pressable style={st.przyciskMaly} onPress={() => setPensja((x) => x + krok)}><Text style={st.przyciskMalyTekst}>+</Text></Pressable>
          </View>
          <View style={[st.wiersz, { gap: 6, marginTop: 6, alignItems: "center" }]}>
            <Text style={[st.maly, { width: 60 }]}>Długość</Text>
            {[1, 2, 3, 4].map((n) => (
              <Pressable key={n} style={[st.przyciskMaly, lata === n && { backgroundColor: K.akcent }]} onPress={() => setLata(n)}>
                <Text style={[st.przyciskMalyTekst, lata === n && { color: "#17310f" }]}>{n} {n === 1 ? "sez." : "sez."}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[st.wiersz, { gap: 6, marginTop: 10 }]}>
            <Pressable style={[st.przyciskMaly, { borderColor: K.akcent }]} onPress={() => {
              const r = negocjujKontraktTrenera(s, pensja, lata); setOdp(r.tekst); if (r.status !== "kontra") setNeg(false); odswiez();
            }}>
              <Text style={[st.przyciskMalyTekst, { color: K.akcent }]}>📞 Wyślij żądanie</Text>
            </Pressable>
            <Pressable style={st.przyciskMaly} onPress={() => setNeg(false)}><Text style={st.przyciskMalyTekst}>Wróć</Text></Pressable>
          </View>
          <Text style={[st.maly, { marginTop: 6, fontSize: 10.5 }]}>Wyższe zaufanie zarządu = więcej pola do negocjacji. Po 3 nieudanych rundach zarząd zrywa rozmowy.</Text>
        </View>
      )}
    </View>
  );
}

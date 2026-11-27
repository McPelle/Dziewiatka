import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { dalejDzien, doMeczu, dzisiaj, fmtData, planTygodnia } from "../engine/dzien";
import type { StanGry } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";
import { PanelOkresu } from "./PanelOkresu";

/** Panel kalendarza na pulpicie: dzisiejszy dzień, plan tygodnia, raport ostatniego dnia, przyciski Dalej / Do meczu. */
export function PanelDnia({ s, odswiez, pokazMecz }: { s: StanGry; odswiez: () => void; pokazMecz: () => void }) {
  const [rozwin, setRozwin] = useState(true);
  if (s.okres) return <PanelOkresu s={s} odswiez={odswiez} />;
  const plan = planTygodnia(s);
  const d = dzisiaj(s);
  const raport = s.raportyDni?.[0];
  const dalej = () => { const mecz = dalejDzien(s); odswiez(); if (mecz) pokazMecz(); };
  return (
    <View style={[st.karta, { borderColor: K.akcent, borderWidth: 1 }]}>
      <View style={[st.wiersz, { justifyContent: "space-between" }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 12, letterSpacing: 0.6, fontFamily: CZCIONKA }}>{d.nazwa.toUpperCase()} · {fmtData(d.data)}</Text>
          <Text style={[st.tekst, { fontSize: 17, fontWeight: "900", marginTop: 2 }]}>{d.ikona} {d.tytul}</Text>
        </View>
      </View>
      {/* pasek tygodnia */}
      <View style={[st.wiersz, { marginTop: 10, gap: 4 }]}>
        {plan.map((p) => {
          const teraz = p.idx === d.idx, minal = p.idx < d.idx;
          return (
            <View key={p.idx} style={{ flex: 1, alignItems: "center", paddingVertical: 6, borderRadius: 8, backgroundColor: teraz ? "rgba(255,206,71,0.18)" : K.karta2, borderWidth: teraz ? 1 : 0, borderColor: K.akcent, opacity: minal ? 0.45 : 1 }}>
              <Text style={{ fontSize: 10, color: K.szary, fontWeight: "800", fontFamily: CZCIONKA }}>{p.nazwa.slice(0, 3)}</Text>
              <Text style={{ fontSize: 15 }}>{p.ikona}</Text>
              <Text style={{ fontSize: 9.5, color: K.szary, fontFamily: CZCIONKA }}>{p.data.getDate()}</Text>
            </View>
          );
        })}
      </View>
      {raport && (
        <Pressable onPress={() => setRozwin(!rozwin)} style={{ marginTop: 10, backgroundColor: K.karta2, borderRadius: 10, padding: 10 }}>
          <Text style={[st.maly, { fontWeight: "800", color: K.tekst }]}>{raport.ikona} Raport: {raport.data} — {raport.tytul} {rozwin ? "▲" : "▼"}</Text>
          {rozwin && raport.wpisy.map((w, i) => <Text key={i} style={[st.maly, { marginTop: 3 }]}>{w}</Text>)}
        </Pressable>
      )}
      <View style={[st.wiersz, { gap: 8, marginTop: 12 }]}>
        <Pressable style={[st.przycisk, { flex: 1, marginHorizontal: 0, marginTop: 0 }]} onPress={dalej}>
          <Text style={st.przyciskTekst}>{d.typ === "mecz" ? "⚽ Rozegraj mecz ›" : `Dalej › ${plan[d.idx + 1]?.nazwa ?? ""}`}</Text>
        </Pressable>
        {d.typ !== "mecz" && (
          <Pressable style={[st.przyciskMaly, { justifyContent: "center", borderColor: K.niebieski }]} onPress={() => { doMeczu(s); odswiez(); }}>
            <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>⏩ Do meczu</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

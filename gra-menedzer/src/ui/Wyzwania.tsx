// Ekran trybu „Wyzwania”: wybór regionu i scenariusza → kariera startuje od razu w wyznaczonym klubie z celem.
import { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SCIEZKI } from "../data/sciezki";
import { rozpocznijKariere } from "../engine/sezon";
import { nowaGra } from "../engine/swiat";
import type { StanGry } from "../engine/types";
import { WYZWANIA, ustawWyzwanie, type DefWyzwania } from "../engine/wyzwania";
import { Herb } from "./Herb";
import { CZCIONKA, K, st } from "./styl";
import { nazwaLigi } from "../data/nazwyLigOficjalne";

export function Wyzwania({ onStart, onWstecz, ukonczone }: { onStart: (s: StanGry) => void; onWstecz: () => void; ukonczone?: Record<string, boolean | undefined> }) {
  const [region, setRegion] = useState(() => Math.max(0, SCIEZKI.findIndex((x) => x.nazwa.startsWith("Pomorskie"))));
  const [trener, setTrener] = useState("");
  const swiaty = useRef(new Map<number, StanGry>());
  const swiat = (i: number) => { let w = swiaty.current.get(i); if (!w) { w = nowaGra("Trener", SCIEZKI[i]); swiaty.current.set(i, w); } return w; };
  const s = useMemo(() => swiat(region), [region]);
  const start = (d: DefWyzwania) => {
    const w = swiat(region); swiaty.current.delete(region); // ten sam świat, który widać na liście (ten sam klub)
    const id = d.wybierzKlub(w); if (!id) return;
    w.trener = trener.trim() || "Trener";
    rozpocznijKariere(w, id); ustawWyzwanie(w, d);
    onStart(w);
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: K.tlo }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
      <Pressable onPress={onWstecz} style={{ marginBottom: 8 }}><Text style={[st.maly, { color: K.akcent, fontSize: 14 }]}>‹ Wstecz</Text></Pressable>
      <Text style={[st.tytul, { fontSize: 22, fontFamily: CZCIONKA }]}>🎯 Wyzwania</Text>
      <Text style={st.maly}>Gotowe scenariusze z celem i terminem. Klub dobiera gra — Ty masz dowieźć wynik. Po wyzwaniu kariera toczy się dalej normalnie.</Text>
      <TextInput value={trener} onChangeText={setTrener} placeholder="Imię i nazwisko trenera" placeholderTextColor={K.szary} style={{ backgroundColor: K.karta, color: K.tekst, borderRadius: 10, padding: 10, marginTop: 12, borderWidth: 1, borderColor: K.linia }} />
      <Text style={[st.naglowek, { marginTop: 12 }]}>Region</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
        {SCIEZKI.map((x, i) => <Pressable key={i} onPress={() => setRegion(i)} style={[st.chip, { marginBottom: 0, marginRight: 0, paddingVertical: 4 }, region === i && st.chipAktywny]}><Text style={{ color: region === i ? "#17310f" : K.tekst, fontSize: 10.5 }}>{x.nazwa}</Text></Pressable>)}
      </View>
      {WYZWANIA.map((d) => { const id = d.wybierzKlub(s); const k = id ? s.kluby[id] : null; const ok = ukonczone?.[`wyz_${d.id}`]; return (
        <View key={d.id} style={[st.karta, { marginHorizontal: 0, padding: 14, borderColor: ok ? K.akcent2 : K.linia }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 30 }}>{d.ikona}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[st.tekst, { fontSize: 16, fontWeight: "900" }]}>{d.nazwa}{ok ? "  ✅" : ""}</Text>
              <Text style={{ color: K.akcent, fontSize: 12 }}>{"★".repeat(d.trudnosc)}{"☆".repeat(3 - d.trudnosc)} · {d.sezony} {d.sezony === 1 ? "sezon" : "sezony"}</Text>
            </View>
          </View>
          <Text style={[st.maly, { marginTop: 6 }]}>{d.opis}</Text>
          {k ? <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Herb klub={k} rozmiar={30} />
            <View style={{ flex: 1 }}><Text style={[st.tekst, { fontSize: 13.5 }]}>{k.nazwa}</Text><Text style={[st.maly, { fontSize: 11.5 }]}>{nazwaLigi(s.ligi[k.poziom - 1]?.nazwa)}</Text></View>
            <Pressable onPress={() => start(d)} style={[st.przyciskMaly, { borderColor: K.akcent }]}><Text style={st.przyciskMalyTekst}>Podejmij ›</Text></Pressable>
          </View> : <Text style={[st.maly, { marginTop: 6 }]}>Niedostępne w tym regionie.</Text>}
        </View>); })}
    </ScrollView>
  );
}

/** Karta aktywnego wyzwania na pulpicie. */
export function KartaWyzwania({ s }: { s: StanGry }) {
  const w = s.wyzwanie; if (!w) return null;
  const d = WYZWANIA.find((x) => x.id === w.id); if (!d) return null;
  if (w.wynik && w.koniecSezon != null && s.sezon > w.koniecSezon + 1) return null; // po sezonie od rozstrzygnięcia znika
  const sez = Math.min(d.sezony, s.sezon - w.odSezonu + 1);
  return (
    <View style={[st.karta, { borderColor: w.wynik === "sukces" ? K.akcent2 : w.wynik === "porazka" ? K.czerwony : K.akcent }]}>
      <Text style={st.naglowek}>🎯 Wyzwanie</Text>
      <Text style={[st.tekst, { fontWeight: "900" }]}>{d.ikona} {d.nazwa} {w.wynik === "sukces" ? "— ZALICZONE ✅" : w.wynik === "porazka" ? "— nieudane ❌" : `— sezon ${sez}/${d.sezony}`}</Text>
      <Text style={[st.maly, { marginTop: 3 }]}>{w.powod ?? d.opis}</Text>
    </View>
  );
}

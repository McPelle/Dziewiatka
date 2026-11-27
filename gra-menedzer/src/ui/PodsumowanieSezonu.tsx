// Podsumowanie sezonu w stylu magazynu telewizyjnego: plansze z belką „na żywo”, paskiem postępu i głosem prowadzącego.
import { useEffect, useMemo, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { podsumowanieSezonu } from "../engine/podsumowanie";
import type { StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { mow } from "./three/glos";
import { CZCIONKA, K, st } from "./styl";

export function PodsumowanieSezonu({ s, onZamknij }: { s: StanGry; onZamknij: () => void }) {
  const plansze = useMemo(() => podsumowanieSezonu(s), [s]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const [anim] = useState(() => new Animated.Value(0));
  const p = plansze[i];
  useEffect(() => {
    anim.setValue(0); Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: false }).start();
    mow(p.mowa, "komentator", { przerwij: true, kto: "prowadzący magazynu" });
    if (!auto) return;
    const t = setTimeout(() => setI((x) => Math.min(plansze.length - 1, x + 1)), Math.max(6500, p.mowa.length * 75));
    return () => clearTimeout(t);
  }, [i, auto]);
  const k = s.kluby[s.mojKlub];
  const rywal = p.herbRywala ? Object.values(s.kluby).find((x) => x.nazwa === p.herbRywala) : undefined;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onZamknij}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", padding: 14 }}>
        <View style={{ borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: K.liniaMocna, backgroundColor: "#071a10" }}>
          {/* belka stacji */}
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#c8102e", paddingHorizontal: 12, paddingVertical: 6, gap: 8 }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12, letterSpacing: 1.5, fontFamily: CZCIONKA }}>📺 MAGAZYN SPORTOWY</Text>
            <View style={{ flex: 1 }} />
            <Text style={{ color: "#fff", fontSize: 11, fontFamily: CZCIONKA }}>{i + 1}/{plansze.length}</Text>
          </View>
          <View style={{ height: 3, backgroundColor: "#2a0a10" }}><View style={{ height: 3, width: `${((i + 1) / plansze.length) * 100}%`, backgroundColor: K.akcent }} /></View>
          <Animated.View style={{ padding: 18, minHeight: 330, opacity: anim, transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Herb klub={k} rozmiar={48} />
              {rywal && <><Text style={{ color: K.szary, fontWeight: "900" }}>vs</Text><Herb klub={rywal} rozmiar={48} /></>}
              <Text style={{ fontSize: 34, marginLeft: "auto" }}>{p.ikona}</Text>
            </View>
            <Text style={{ color: K.akcent, fontSize: 24, fontWeight: "900", fontFamily: CZCIONKA, marginBottom: 10 }}>{p.tytul}</Text>
            {p.linie.map((l, j) => (
              <View key={j} style={{ backgroundColor: j % 2 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)", paddingVertical: 7, paddingHorizontal: 10, borderLeftWidth: 3, borderLeftColor: j === 0 ? K.akcent : K.akcent2, marginBottom: 4 }}>
                <Text style={{ color: K.tekst, fontSize: j === 0 ? 16 : 14, fontWeight: j === 0 ? "800" : "500", fontFamily: CZCIONKA }}>{l}</Text>
              </View>))}
          </Animated.View>
          {/* pasek „napisów” z narracją */}
          <View style={{ backgroundColor: "rgba(0,0,0,0.6)", padding: 10, borderTopWidth: 1, borderTopColor: K.linia }}>
            <Text style={{ color: "#dfe9e3", fontSize: 12.5, fontStyle: "italic", fontFamily: CZCIONKA }}>🎙 {p.mowa}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <Pressable disabled={i === 0} onPress={() => { setAuto(false); setI(i - 1); }} style={[st.przyciskMaly, { flex: 1, opacity: i === 0 ? 0.4 : 1 }]}><Text style={st.przyciskMalyTekst}>‹ Wstecz</Text></Pressable>
          <Pressable onPress={() => setAuto(!auto)} style={[st.przyciskMaly, { flex: 1 }]}><Text style={st.przyciskMalyTekst}>{auto ? "⏸ Pauza" : "▶ Auto"}</Text></Pressable>
          {i < plansze.length - 1
            ? <Pressable onPress={() => { setAuto(false); setI(i + 1); }} style={[st.przyciskMaly, { flex: 1 }]}><Text style={st.przyciskMalyTekst}>Dalej ›</Text></Pressable>
            : <Pressable onPress={onZamknij} style={[st.przyciskMaly, { flex: 1, borderColor: K.akcent }]}><Text style={st.przyciskMalyTekst}>Zamknij ✓</Text></Pressable>}
        </View>
        <Pressable onPress={onZamknij} style={{ alignSelf: "center", marginTop: 8 }}><Text style={[st.maly, { fontSize: 12 }]}>Pomiń magazyn</Text></Pressable>
      </View>
    </Modal>
  );
}

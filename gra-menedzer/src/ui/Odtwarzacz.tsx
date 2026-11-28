// Odtwarzacz soundtracku (jak w grach sportowych): „Teraz gra", poprzedni/następny, pauza, losowo, głośność, cała playlista.
// Plus wyskakujący pasek „🎵 Teraz gra: …" przy zmianie utworu.
import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { aktualny, gra, glosnosc, grajUtwor, losowo, muzykaWlaczona, NAZWA_GATUNKU, nastepny, poprzedni, subskrybuj, ustawGlosnosc, ustawLosowo, ustawMuzyke, UTWORY } from "./muzyka";
import { CZCIONKA, K, st } from "./styl";

function useMuzyka() {
  const [, setT] = useState(0);
  useEffect(() => { const off = subskrybuj(() => setT((x) => x + 1)); const iv = setInterval(() => setT((x) => x + 1), 1000); return () => { off(); clearInterval(iv); }; }, []);
}

/** Pełny odtwarzacz z playlistą (menu główne, Więcej → Muzyka). */
export function Odtwarzacz({ kompakt }: { kompakt?: boolean }) {
  useMuzyka();
  const [lista, setLista] = useState(!kompakt);
  if (Platform.OS !== "web") return null;
  const a = aktualny(); const wl = muzykaWlaczona() && gra();
  const Btn = ({ t, onP, akt }: { t: string; onP: () => void; akt?: boolean }) => (
    <Pressable onPress={onP} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: akt ? K.akcent : K.karta2, borderWidth: 1, borderColor: K.liniaMocna }}>
      <Text style={{ fontSize: 18, color: akt ? "#17310f" : K.tekst }}>{t}</Text>
    </Pressable>
  );
  return (
    <View style={[st.karta, { marginHorizontal: kompakt ? 0 : 12, borderColor: K.akcent }]}>
      <Text style={{ color: K.akcent, fontSize: 11, fontWeight: "900", letterSpacing: 1, fontFamily: CZCIONKA }}>🎧 SOUNDTRACK DZIEWIĄTKI</Text>
      <Text style={[st.tekst, { fontSize: 16, fontWeight: "900", marginTop: 4 }]} numberOfLines={1}>{wl ? "▶ " : "⏸ "}{a.u.tytul}</Text>
      <Text style={st.maly}>{a.u.wykonawca} · {NAZWA_GATUNKU[a.u.gatunek]} · {a.u.bpm} BPM</Text>
      <View style={{ height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 8, overflow: "hidden" }}>
        <View style={{ width: `${Math.round(a.postep * 100)}%`, height: 4, backgroundColor: K.akcent }} />
      </View>
      <View style={[st.wiersz, { gap: 10, marginTop: 10, justifyContent: "center" }]}>
        <Btn t="⏮" onP={() => poprzedni()} />
        <Btn t={wl ? "⏸" : "▶"} akt onP={() => ustawMuzyke(!wl)} />
        <Btn t="⏭" onP={() => nastepny()} />
        <Btn t="🔀" akt={losowo()} onP={() => ustawLosowo(!losowo())} />
      </View>
      <View style={[st.wiersz, { gap: 8, marginTop: 10, justifyContent: "center" }]}>
        <Text style={st.maly}>🔈</Text>
        {[0.2, 0.4, 0.6, 0.8, 1].map((v) => (
          <Pressable key={v} onPress={() => ustawGlosnosc(v)} style={{ width: 28, height: 10 + v * 14, borderRadius: 3, backgroundColor: glosnosc() >= v - 0.01 ? K.akcent : "rgba(255,255,255,0.15)" }} />
        ))}
        <Text style={st.maly}>🔊</Text>
      </View>
      <Pressable onPress={() => setLista(!lista)} style={{ marginTop: 8, alignSelf: "center" }}><Text style={[st.maly, { color: K.akcent }]}>{lista ? "▲ Ukryj playlistę" : `▼ Playlista (${UTWORY.length} utworów)`}</Text></Pressable>
      {lista && (
        <ScrollView style={{ maxHeight: 320, marginTop: 6 }} nestedScrollEnabled>
          {UTWORY.map((u, i) => (
            <Pressable key={i} onPress={() => grajUtwor(i)} style={[st.wiersz, { paddingVertical: 7, borderTopWidth: 1, borderTopColor: K.linia, gap: 8, backgroundColor: i === a.i ? "rgba(255,206,71,0.1)" : "transparent" }]}>
              <Text style={{ width: 22, color: i === a.i ? K.akcent : K.szary, fontWeight: "800", textAlign: "center" }}>{i === a.i && wl ? "♪" : i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[st.tekst, { fontSize: 13.5, fontWeight: i === a.i ? "900" : "600" }]} numberOfLines={1}>{u.tytul}</Text>
                <Text style={st.maly} numberOfLines={1}>{u.wykonawca} · {NAZWA_GATUNKU[u.gatunek]}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
      <Text style={[st.maly, { marginTop: 6, textAlign: "center" }]}>Oryginalne utwory skomponowane dla gry — grają w menu i w trakcie kariery; w meczu na żywo cichną.</Text>
    </View>
  );
}

/** Wyskakujący pasek „Teraz gra" przy zmianie utworu (jak w grach sportowych). */
export function TerazGra() {
  const [pokaz, setPokaz] = useState<string | null>(null);
  useEffect(() => {
    let ost = -1;
    return subskrybuj(() => {
      if (!gra()) return; const a = aktualny(); if (a.i === ost) return; ost = a.i;
      setPokaz(`${a.u.tytul} — ${a.u.wykonawca}`);
      setTimeout(() => setPokaz(null), 5000);
    });
  }, []);
  if (!pokaz || Platform.OS !== "web") return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 70, left: 12, right: 12, alignItems: "center", zIndex: 999 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(6,19,13,0.92)", borderColor: K.akcent, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
        <Text style={{ fontSize: 16 }}>🎵</Text>
        <View>
          <Text style={{ color: K.akcent, fontSize: 10, fontWeight: "900", letterSpacing: 1, fontFamily: CZCIONKA }}>TERAZ GRA</Text>
          <Text style={{ color: K.tekst, fontSize: 13, fontWeight: "800", fontFamily: CZCIONKA }} numberOfLines={1}>{pokaz}</Text>
        </View>
      </View>
    </View>
  );
}

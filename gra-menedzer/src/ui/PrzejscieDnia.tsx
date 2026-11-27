// Przejście do kolejnego dnia jak w Football Managerze, ale w 3D: kartka kalendarza z poprzednim dniem odwraca się
// w przestrzeni (perspektywa, obrót w osi X), a na jej miejsce opada nowa — wielka data, dzień tygodnia, miesiąc
// i to, co dziś czeka klub (trening, mecz, wolne). Złota oprawa, poświata, cień. Dotknięcie pomija animację.
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Pressable, Text, View } from "react-native";
import { CZCIONKA, K, web } from "./styl";

export interface DzienKarty { data: Date; nazwa: string; ikona: string; tytul: string }
const MIES = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

function Kartka({ d, akcent }: { d: DzienKarty; akcent?: boolean }) {
  return (
    <View style={[{ width: 240, height: 290, borderRadius: 22, overflow: "hidden", backgroundColor: "#0f2c1d", borderWidth: 2, borderColor: K.akcent },
      web({ backgroundImage: "linear-gradient(180deg, #1d5236 0%, #0d2617 100%)", boxShadow: `0 30px 60px rgba(0,0,0,0.65), 0 0 40px ${akcent ? "rgba(255,206,71,0.45)" : "rgba(0,0,0,0)"}, inset 0 2px 0 rgba(255,255,255,0.2)` })]}>
      <View style={[{ height: 62, backgroundColor: "#c8102e", alignItems: "center", justifyContent: "center" }, web({ backgroundImage: "linear-gradient(180deg, #ef3b4f, #a50d22)", boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.3)" })]}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: 3, fontFamily: CZCIONKA }}>{d.nazwa.toUpperCase()}</Text>
      </View>
      {/* kółka spiralki */}
      <View style={{ position: "absolute", top: 6, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around" }}>{[0, 1, 2, 3].map((i) => <View key={i} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#0a1a10", borderWidth: 2, borderColor: "#d9d9d9" }} />)}</View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={[{ color: K.akcent, fontSize: 104, fontWeight: "900", lineHeight: 110, fontFamily: CZCIONKA }, web({ textShadow: "0 4px 0 #7a4a00, 0 10px 18px rgba(0,0,0,0.6)" })]}>{d.data.getDate()}</Text>
        <Text style={{ color: "#dfeee5", fontSize: 17, fontWeight: "800", fontFamily: CZCIONKA }}>{MIES[d.data.getMonth()]} {d.data.getFullYear()}</Text>
        <View style={[{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.3)" }, web({ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" })]}>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800", fontFamily: CZCIONKA }}>{d.ikona} {d.tytul}</Text>
        </View>
      </View>
    </View>
  );
}

export function PrzejscieDnia({ stary, nowy, onKoniec }: { stary: DzienKarty; nowy: DzienKarty; onKoniec: () => void }) {
  const a = useRef(new Animated.Value(0)).current; // 0..1: kartka stara odwraca się w górę
  const b = useRef(new Animated.Value(0)).current; // 0..1: nowa opada na miejsce
  const tlo = useRef(new Animated.Value(0)).current;
  const skonczone = useRef(false);
  const koniec = () => { if (skonczone.current) return; skonczone.current = true; onKoniec(); };
  useEffect(() => {
    Animated.sequence([
      Animated.timing(tlo, { toValue: 1, duration: 160, useNativeDriver: false }),
      Animated.timing(a, { toValue: 1, duration: 520, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(b, { toValue: 1, duration: 620, easing: Easing.out(Easing.back(1.4)), useNativeDriver: false }),
      Animated.delay(650),
      Animated.timing(tlo, { toValue: 0, duration: 220, useNativeDriver: false }),
    ]).start(koniec);
  }, []);
  return (
    <Modal visible transparent animationType="none" onRequestClose={koniec}>
      <Pressable onPress={koniec} style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(2,10,6,0.82)", opacity: tlo }, web({ backdropFilter: "blur(4px)" })]}>
          <Text style={{ color: K.szary, fontSize: 12, fontWeight: "900", letterSpacing: 3, marginBottom: 16, fontFamily: CZCIONKA }}>NASTĘPNY DZIEŃ</Text>
          <View style={{ width: 240, height: 290 }}>
            {/* nowa kartka pod spodem — opada z perspektywą */}
            <Animated.View style={{ position: "absolute", opacity: b, transform: [{ perspective: 900 }, { translateY: b.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }, { rotateX: b.interpolate({ inputRange: [0, 1], outputRange: ["70deg", "0deg"] }) }, { scale: b.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
              <Kartka d={nowy} akcent />
            </Animated.View>
            {/* stara kartka — zrywana i odwracana w górę */}
            <Animated.View style={{ position: "absolute", opacity: a.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }), transform: [{ perspective: 900 }, { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -170] }) }, { rotateX: a.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-100deg"] }) }, { rotateZ: a.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-8deg"] }) }] }}>
              <Kartka d={stary} />
            </Animated.View>
          </View>
          <Text style={{ color: K.szary, fontSize: 11, marginTop: 18, fontFamily: CZCIONKA }}>dotknij, aby pominąć</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

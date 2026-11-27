import { View, Text } from "react-native";
import { CZCIONKA, K } from "./styl";

// Tło w pasy skoszonej murawy (jak boisko) — subtelne, kładzione pod treść nagłówka.
export function MurawaTlo({ pasy = 10, mocne = false }: { pasy?: number; mocne?: boolean }) {
  const a = mocne ? 0.06 : 0.04;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row", overflow: "hidden" }}>
      {Array.from({ length: pasy }).map((_, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: i % 2 === 0 ? `rgba(255,255,255,${a})` : "transparent" }} />
      ))}
      {/* Delikatna poświata u góry + cień u dołu dla głębi. */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.12)" }} />
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 24, backgroundColor: "rgba(0,0,0,0.18)" }} />
    </View>
  );
}

// Herb gry „DZIEWIĄTKA" — tarcza w barwach murawy z wielką złotą 9 i piłką. Rysowany wektorowo (ostry wszędzie).
export function HerbGry({ rozmiar = 96 }: { rozmiar?: number }) {
  const r = rozmiar;
  return (
    <View style={{ width: r, height: r, alignItems: "center", justifyContent: "center" }}>
      {/* tarcza */}
      <View style={{
        position: "absolute", width: r, height: r, backgroundColor: "#0c5230",
        borderTopLeftRadius: r * 0.3, borderTopRightRadius: r * 0.3, borderBottomLeftRadius: r * 0.5, borderBottomRightRadius: r * 0.5,
        borderWidth: Math.max(3, r * 0.05), borderColor: K.akcent, overflow: "hidden",
        shadowColor: K.akcent, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
      }}>
        <MurawaTlo pasy={7} mocne />
        {/* wewnętrzny pierścień */}
        <View style={{ position: "absolute", top: r * 0.08, left: r * 0.08, right: r * 0.08, bottom: r * 0.08, borderRadius: r * 0.4, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }} />
      </View>
      {/* wielka 9 */}
      <Text style={{ fontSize: r * 0.64, fontWeight: "900", color: K.akcent, fontFamily: CZCIONKA, textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, marginTop: -r * 0.06 }}>9</Text>
      {/* piłka u dołu tarczy */}
      <Text style={{ position: "absolute", bottom: r * 0.1, fontSize: r * 0.2 }}>⚽</Text>
    </View>
  );
}

// Emblemat gry — piłka w pierścieniu, z akcentem złota. Używany na ekranie startowym.
export function Emblemat({ rozmiar = 54 }: { rozmiar?: number }) {
  return (
    <View style={{
      width: rozmiar, height: rozmiar, borderRadius: rozmiar * 0.3,
      backgroundColor: "rgba(0,0,0,0.28)", borderWidth: 2, borderColor: K.akcent,
      alignItems: "center", justifyContent: "center",
      shadowColor: K.akcent, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
    }}>
      <View style={{ position: "absolute", width: rozmiar - 10, height: rozmiar - 10, borderRadius: (rozmiar - 10) / 2, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }} />
      <Text style={{ fontSize: rozmiar * 0.52 }}>⚽</Text>
    </View>
  );
}

// Plakietka BETA (złota).
export function PlakietkaBeta() {
  return (
    <View style={{ backgroundColor: K.akcent, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ color: "#15300c", fontSize: 10.5, fontWeight: "900", letterSpacing: 1.5, fontFamily: CZCIONKA }}>BETA</Text>
    </View>
  );
}

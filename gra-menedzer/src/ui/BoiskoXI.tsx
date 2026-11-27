import { Text, View } from "react-native";
import type { GraczXI, Pozycja } from "../engine/types";
import { K } from "./styl";

const KOLOR_OCENY = (o: number) => (o >= 8.5 ? "#36d989" : o >= 7 ? "#ffce47" : o >= 5.5 ? "#8fb6a1" : "#ff6470");
// y (% od góry) dla każdej linii — atak u góry, bramkarz na dole.
const LINIA_Y: Record<Pozycja, number> = { NAP: 13, POM: 38, OBR: 64, BR: 87 };
const KOLOR_POZ: Record<Pozycja, string> = { BR: "#ffce47", OBR: "#5aa9ff", POM: "#3fd47f", NAP: "#ff6470" };

function Zawodnik({ g, x, y, moj }: { g: GraczXI; x: number; y: number; moj: boolean }) {
  return (
    <View style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: 76, marginLeft: -38, marginTop: -26, alignItems: "center" }}>
      {/* koszulka / marker */}
      <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: KOLOR_POZ[g.poz], borderWidth: moj ? 2 : 1, borderColor: moj ? "#fff" : "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" }}>
        {/* ocena w rogu */}
        <View style={{ position: "absolute", top: -8, right: -10, minWidth: 24, height: 18, paddingHorizontal: 3, borderRadius: 5, backgroundColor: KOLOR_OCENY(g.ocena), alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.3)" }}>
          <Text style={{ color: "#10231a", fontWeight: "900", fontSize: 10 }}>{g.ocena.toFixed(1)}</Text>
        </View>
        <Text style={{ color: "#10231a", fontWeight: "900", fontSize: 11 }}>{g.poz}</Text>
      </View>
      {/* nazwisko */}
      <View style={{ marginTop: 3, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 5, paddingHorizontal: 4, paddingVertical: 1, maxWidth: 76 }}>
        <Text numberOfLines={1} style={{ color: "#fff", fontSize: 10, fontWeight: moj ? "800" : "600", textAlign: "center" }}>{g.nazwisko}</Text>
      </View>
    </View>
  );
}

export function BoiskoXI({ gracze, mojaNazwa }: { gracze: GraczXI[]; mojaNazwa: string }) {
  const linia = (poz: Pozycja) => gracze.filter((g) => g.poz === poz);
  return (
    <View style={{ width: "100%", aspectRatio: 0.72, backgroundColor: "#15823f", borderRadius: 12, overflow: "hidden", borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }}>
      {/* pasy murawy */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i * 16.66}%`, height: "16.66%", backgroundColor: i % 2 ? "rgba(255,255,255,0.05)" : "transparent" }} />
      ))}
      {/* linie boiska */}
      <View style={{ position: "absolute", left: "50%", top: "50%", width: 90, height: 90, marginLeft: -45, marginTop: -45, borderRadius: 45, borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" }} />
      <View style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, backgroundColor: "rgba(255,255,255,0.3)" }} />
      {/* pole karne dół (nasza bramka) */}
      <View style={{ position: "absolute", left: "22%", right: "22%", bottom: 0, height: "14%", borderWidth: 2, borderBottomWidth: 0, borderColor: "rgba(255,255,255,0.3)" }} />
      {/* pole karne góra */}
      <View style={{ position: "absolute", left: "22%", right: "22%", top: 0, height: "14%", borderWidth: 2, borderTopWidth: 0, borderColor: "rgba(255,255,255,0.3)" }} />
      {/* zawodnicy wg formacji */}
      {(["BR", "OBR", "POM", "NAP"] as Pozycja[]).map((poz) => {
        const g = linia(poz);
        return g.map((z, i) => (
          <Zawodnik key={z.id} g={z} x={((i + 1) / (g.length + 1)) * 100} y={LINIA_Y[poz]} moj={z.klub === mojaNazwa} />
        ));
      })}
    </View>
  );
}

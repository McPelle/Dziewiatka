import { Text, View } from "react-native";
import { HerbGenerowany } from "./HerbGen";
import type { Europa, EuroRywal } from "../engine/types";

/** Oryginalny emblemat rozgrywek (WŁASNY znak, nie logo UEFA). Barwy umowne per rozgrywki. */
export function EmblematRozgrywek({ rozgrywki, rozmiar = 30 }: { rozgrywki: Europa["rozgrywki"]; rozmiar?: number }) {
  const styl: Record<Europa["rozgrywki"], { tlo: string; ring: string; txt: string; skrot: string }> = {
    LM: { tlo: "#0a1a3f", ring: "#e9c767", txt: "#ffffff", skrot: "LM" },
    LE: { tlo: "#2a1402", ring: "#ff7a00", txt: "#ffffff", skrot: "LE" },
    LK: { tlo: "#05311f", ring: "#4cd07d", txt: "#ffffff", skrot: "LK" },
  };
  const c = styl[rozgrywki];
  return (
    <View style={{ width: rozmiar, height: rozmiar, borderRadius: rozmiar / 2, backgroundColor: c.tlo, borderWidth: Math.max(2, rozmiar / 12), borderColor: c.ring, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: c.txt, fontWeight: "900", fontSize: rozmiar * 0.36, letterSpacing: 0.5 }}>{c.skrot}</Text>
    </View>
  );
}

/**
 * Oryginalny emblemat europejskiego rywala — WŁASNA tarcza w prawdziwych barwach klubu (barwy to fakt),
 * NIE kopia prawdziwego herbu (te są chronione). Kształt spójny z herbami krajowymi (HerbGen.tsx).
 */
export function HerbEuro({ rywal, rozmiar = 28 }: { rywal: Pick<EuroRywal, "nazwa" | "kolor" | "kolor2">; rozmiar?: number }) {
  // Wspólny generator z herbami krajowymi (HerbGen.tsx) — oryginalny emblemat w barwach klubu.
  return <HerbGenerowany nazwa={rywal.nazwa} tlo={rywal.kolor} akcent={rywal.kolor2} rozmiar={rozmiar} />;
}

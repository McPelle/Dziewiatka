import { Image, View } from "react-native";
import { HERBY } from "../data/herby";
import { barwyKlubu } from "../data/barwy";
import { rokZalozenia } from "../data/zalozenie";
import { HerbGenerowany } from "./HerbGen";
import type { Klub } from "../engine/types";

export function Herb({ klub, rozmiar = 28 }: { klub: Klub; rozmiar?: number }) {
  const zrodlo = klub.herb ? HERBY[klub.herb] : undefined;
  if (zrodlo) {
    // Herb bez tła (wycięty, przezroczysty) — delikatna jasna poświata dla czytelności na ciemnym tle, bez pudełka.
    return (
      <View style={{ width: rozmiar, height: rozmiar, alignItems: "center", justifyContent: "center", shadowColor: "#ffffff", shadowOpacity: 0.55, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } }}>
        <Image source={zrodlo} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
      </View>
    );
  }
  // Brak pliku → oryginalny, proceduralny herb w prawdziwych barwach klubu (patrz HerbGen.tsx).
  const [tlo, akcent] = barwyKlubu(klub.nazwa);
  return <HerbGenerowany nazwa={klub.nazwa} tlo={tlo} akcent={akcent} rok={rokZalozenia(klub.nazwa)} rozmiar={rozmiar} />;
}

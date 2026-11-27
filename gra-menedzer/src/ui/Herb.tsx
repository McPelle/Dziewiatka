import { Image, View } from "react-native";
import { HERBY } from "../data/herby";
import { HERB_PO_NAZWIE } from "../data/herbyNazwy";
import { barwyKlubu } from "../data/barwy";
import { rokZalozenia } from "../data/zalozenie";
import { HerbGenerowany } from "./HerbGen";
import type { Klub } from "../engine/types";

const REZERWA = /\s+(II|III|IV|2|3)(?=\s|\/|$)/;
/** Nazwa pierwszej drużyny dla zespołu rezerw („Arka II Gdynia" → „Arka Gdynia", „Cracovia II" → „Cracovia"). */
export function nazwaPierwszejDruzyny(nazwa: string): string | null {
  if (!REZERWA.test(nazwa)) return null;
  return nazwa.replace("II/KS", "KS").replace(REZERWA, "").replace(/\s+/g, " ").trim();
}
/** Klucz herbu klubu: rezerwy → herb pierwszej drużyny; potem pole `herb`; potem mapa po nazwie (wszystkie województwa). */
export function kluczHerbu(klub: Pick<Klub, "nazwa" | "herb">): string | undefined {
  const pierwsza = nazwaPierwszejDruzyny(klub.nazwa);
  if (pierwsza && HERB_PO_NAZWIE[pierwsza] && HERBY[HERB_PO_NAZWIE[pierwsza]]) return HERB_PO_NAZWIE[pierwsza];
  if (klub.herb && HERBY[klub.herb]) return klub.herb;
  const k = HERB_PO_NAZWIE[klub.nazwa];
  return k && HERBY[k] ? k : undefined;
}

export function Herb({ klub, rozmiar = 28 }: { klub: Klub; rozmiar?: number }) {
  const klucz = kluczHerbu(klub);
  const zrodlo = klucz ? HERBY[klucz] : undefined;
  if (zrodlo) {
    // Herb bez tła (wycięty, przezroczysty) — delikatna jasna poświata dla czytelności na ciemnym tle, bez pudełka.
    return (
      <View style={{ width: rozmiar, height: rozmiar, alignItems: "center", justifyContent: "center", shadowColor: "#ffffff", shadowOpacity: 0.55, shadowRadius: 3, shadowOffset: { width: 0, height: 0 } }}>
        <Image source={zrodlo} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
      </View>
    );
  }
  // Brak pliku → oryginalny, proceduralny herb w prawdziwych barwach klubu (patrz HerbGen.tsx).
  const nazwa = nazwaPierwszejDruzyny(klub.nazwa) ?? klub.nazwa; // rezerwy bez pliku — ten sam emblemat co pierwsza drużyna
  const [tlo, akcent] = barwyKlubu(nazwa);
  return <HerbGenerowany nazwa={nazwa} tlo={tlo} akcent={akcent} rok={rokZalozenia(nazwa)} rozmiar={rozmiar} />;
}

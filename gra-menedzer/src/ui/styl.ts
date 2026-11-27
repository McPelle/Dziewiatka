import { Platform, StyleSheet } from "react-native";

// Profesjonalny motyw „nocna murawa" — głęboka zieleń, subtelne linie, złoto jako akcent.
export const K = {
  tlo: "#06130d", // niemal czerń z zielonym tonem (premium tło)
  pas: "#0a1c13", // subtelny pas skoszonej trawy
  karta: "#0e2418", // wyniesiona powierzchnia (karty)
  karta2: "#153726", // interaktywne elementy / chipy
  linia: "rgba(255,255,255,0.07)", // delikatny podział
  liniaMocna: "rgba(255,255,255,0.16)",
  tekst: "#eefbf1",
  szary: "#8fb6a1", // stonowany zielono-szary
  akcent: "#ffce47", // złoto (CTA, aktywne)
  akcent2: "#36d989", // szmaragd (druga akcja / dodatnie)
  zielony: "#3fd47f",
  czerwony: "#ff6470",
  niebieski: "#5aa9ff",
  murawa: "#0c5230", // nagłówek — nasycona murawa
  murawaCien: "#083f24",
};

// Jednolita, czytelna czcionka (na web stos systemowych sans-serif; na natywnych — systemowa).
export const CZCIONKA = Platform.OS === "web"
  ? '"SF Pro Display", "Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif'
  : undefined;

// Delikatny cień wyniesienia dla kart (web/iOS/Android).
export const cien = {
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

export const st = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: K.tlo },
  karta: { backgroundColor: K.karta, borderRadius: 16, padding: 16, marginHorizontal: 12, marginTop: 12, borderWidth: 1, borderColor: K.linia, ...cien },
  tytul: { color: K.tekst, fontSize: 21, fontWeight: "800", letterSpacing: -0.3, fontFamily: CZCIONKA },
  naglowek: { color: K.szary, fontSize: 11.5, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 9, fontFamily: CZCIONKA },
  tekst: { color: K.tekst, fontSize: 15, fontFamily: CZCIONKA },
  maly: { color: K.szary, fontSize: 13, fontFamily: CZCIONKA },
  wiersz: { flexDirection: "row", alignItems: "center" },
  przycisk: { backgroundColor: K.akcent, borderRadius: 13, paddingVertical: 15, alignItems: "center", marginHorizontal: 12, marginTop: 12, ...cien },
  przyciskTekst: { color: "#15300c", fontSize: 16, fontWeight: "900", letterSpacing: 0.2, fontFamily: CZCIONKA },
  przyciskMaly: { backgroundColor: K.karta2, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: K.linia },
  przyciskMalyTekst: { color: K.tekst, fontSize: 14, fontWeight: "700", fontFamily: CZCIONKA },
  chip: { borderRadius: 18, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: K.karta2, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: K.linia },
  chipAktywny: { backgroundColor: K.akcent, borderColor: K.akcent },
  input: { backgroundColor: K.karta2, color: K.tekst, borderRadius: 10, padding: 13, fontSize: 16, borderWidth: 1, borderColor: K.linia, fontFamily: CZCIONKA },
});

export const KOLOR_POZ: Record<string, string> = { BR: "#ffce47", OBR: "#5aa9ff", POM: "#3fd47f", NAP: "#ff6470" };

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

// ——— Język wizualny 3D (web): gradienty, fazowania, światło na krawędziach, głębokie cienie ———
const W = Platform.OS === "web";
/** Styl tylko dla web (gradienty/cienie CSS) — na natywnych pomijany. */
export const web = (o: Record<string, unknown>) => (W ? (o as object) : {});
export const G = {
  tlo: "radial-gradient(120% 70% at 50% -10%, #1c5a37 0%, #0a2416 45%, #04100a 100%)",
  karta: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 38%, rgba(0,0,0,0.12) 100%)",
  zloto: "linear-gradient(180deg, #fff0a6 0%, #ffd54a 28%, #f2b322 62%, #d6930f 100%)",
  szklo: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.18) 100%)",
  ciemny: "linear-gradient(180deg, #1a4430 0%, #10301f 100%)",
};
const cienKarty = "0 14px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.09), inset 0 -1px 0 rgba(0,0,0,0.35)";
const cienPrzycisku = "0 5px 0 #9c6a07, 0 12px 20px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.75), inset 0 -2px 0 rgba(0,0,0,0.18)";
const cienMalego = "0 3px 0 rgba(0,0,0,0.45), 0 6px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)";

export const st = StyleSheet.create({
  ekran: { flex: 1, backgroundColor: K.tlo, ...web({ backgroundImage: G.tlo }) },
  karta: { backgroundColor: K.karta, borderRadius: 18, padding: 16, marginHorizontal: 12, marginTop: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", ...cien, ...web({ backgroundImage: G.karta, boxShadow: cienKarty }) },
  tytul: { color: K.tekst, fontSize: 21, fontWeight: "800", letterSpacing: -0.3, fontFamily: CZCIONKA, ...web({ textShadow: "0 2px 6px rgba(0,0,0,0.5)" }) },
  naglowek: { color: "#b8d9c5", fontSize: 11.5, fontWeight: "900", letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 9, fontFamily: CZCIONKA, ...web({ textShadow: "0 1px 0 rgba(0,0,0,0.6)" }) },
  tekst: { color: K.tekst, fontSize: 15, fontFamily: CZCIONKA },
  maly: { color: K.szary, fontSize: 13, fontFamily: CZCIONKA },
  wiersz: { flexDirection: "row", alignItems: "center" },
  przycisk: { backgroundColor: K.akcent, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginHorizontal: 12, marginTop: 14, marginBottom: 4, ...cien, ...web({ backgroundImage: G.zloto, boxShadow: cienPrzycisku, borderWidth: 1, borderColor: "#b47a08" }) },
  przyciskTekst: { color: "#2a1a00", fontSize: 16, fontWeight: "900", letterSpacing: 0.4, fontFamily: CZCIONKA, ...web({ textShadow: "0 1px 0 rgba(255,255,255,0.55)" }) },
  przyciskMaly: { backgroundColor: K.karta2, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", marginBottom: 3, ...web({ backgroundImage: G.szklo, boxShadow: cienMalego }) },
  przyciskMalyTekst: { color: K.tekst, fontSize: 14, fontWeight: "800", fontFamily: CZCIONKA, ...web({ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }) },
  chip: { borderRadius: 18, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: K.karta2, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", ...web({ backgroundImage: G.szklo, boxShadow: "0 2px 0 rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)" }) },
  chipAktywny: { backgroundColor: K.akcent, borderColor: "#c48a0d", ...web({ backgroundImage: G.zloto, boxShadow: "0 2px 0 #9c6a07, 0 0 12px rgba(255,206,71,0.45), inset 0 1px 0 rgba(255,255,255,0.7)" }) },
  input: { backgroundColor: K.karta2, color: K.tekst, borderRadius: 12, padding: 13, fontSize: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", fontFamily: CZCIONKA, ...web({ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)" }) },
});

export const KOLOR_POZ: Record<string, string> = { BR: "#ffce47", OBR: "#5aa9ff", POM: "#3fd47f", NAP: "#ff6470" };

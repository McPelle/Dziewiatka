import { Image, Text, View } from "react-native";
import { CZCIONKA } from "./styl";

// Oryginalne logo rozgrywek szczebla centralnego (PKO BP Ekstraklasa, Betclic 1./2./3. Liga) — z Transfermarktu (użytek prywatny).
// Niższe ligi (IV liga → klasa B) nie mają jednolitych logotypów — prowadzą je wojewódzkie ZPN: pokazujemy plakietkę ligi.
const LOGA = {
  ekstraklasa: require("../assets/ligi/ekstraklasa.png"),
  l1: require("../assets/ligi/1liga.png"),
  l2: require("../assets/ligi/2liga.png"),
  l3: require("../assets/ligi/3liga.png"),
  superpuchar: require("../assets/ligi/superpuchar.png"),
  pucharpolski: require("../assets/ligi/pucharpolski.png"),
};
export function kluczLogoLigi(nazwa: string, poziom?: number): keyof typeof LOGA | null {
  if (/Superpuchar/i.test(nazwa)) return "superpuchar";
  if (/Puchar Polski/i.test(nazwa)) return "pucharpolski";
  if (/Ekstraklasa/i.test(nazwa) || poziom === 1) return "ekstraklasa";
  if (/(^|\s)1\.?\s*Liga|^I liga/i.test(nazwa) || poziom === 2) return "l1";
  if (/(^|\s)2\.?\s*Liga|^II liga/i.test(nazwa) || poziom === 3) return "l2";
  if (/(^|\s)3\.?\s*Liga|^III liga/i.test(nazwa) || poziom === 4) return "l3";
  if (/Superpuchar/i.test(nazwa)) return "superpuchar";
  if (/Puchar Polski/i.test(nazwa)) return "pucharpolski";
  return null;
}
export function LogoLigi({ nazwa, poziom, rozmiar = 28 }: { nazwa: string; poziom?: number; rozmiar?: number }) {
  const k = kluczLogoLigi(nazwa, poziom);
  if (k) {
    const szer = k === "ekstraklasa" ? rozmiar * 4.5 : k === "pucharpolski" ? rozmiar * 0.58 : rozmiar * 0.92;
    return <Image source={LOGA[k]} style={{ width: szer, height: rozmiar, resizeMode: "contain" }} />;
  }
  const skrot = /Puchar|PP/i.test(nazwa) ? "🏆" : /IV liga/i.test(nazwa) ? "IV" : /V liga/i.test(nazwa) ? "V" : /okręg/i.test(nazwa) ? "OKR" : /klasa A|A klasa/i.test(nazwa) ? "A" : /klasa B|B klasa/i.test(nazwa) ? "B" : /klasa C|C klasa/i.test(nazwa) ? "C" : "•";
  return (
    <View style={{ width: rozmiar, height: rozmiar, borderRadius: rozmiar * 0.22, backgroundColor: "#1d3d8f", borderWidth: 1.5, borderColor: "#fff", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: rozmiar * (skrot.length > 2 ? 0.3 : 0.42), fontFamily: CZCIONKA }}>{skrot}</Text>
    </View>
  );
}

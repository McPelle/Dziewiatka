import { Image, Text, View } from "react-native";
import { CZCIONKA } from "./styl";
import { kluczLogoLigi } from "./logoKlucz";
export { kluczLogoLigi };

// Oryginalne logo rozgrywek szczebla centralnego (PKO BP Ekstraklasa, Betclic 1./2./3. Liga) — z Transfermarktu (użytek prywatny).
// Niższe ligi (IV liga → klasa B) nie mają jednolitych logotypów — prowadzą je wojewódzkie ZPN: pokazujemy plakietkę ligi.
const LOGA = {
  ekstraklasa: require("../../assets/ligi/ekstraklasa.png"),
  l1: require("../../assets/ligi/1liga.png"),
  l2: require("../../assets/ligi/2liga.png"),
  l3: require("../../assets/ligi/3liga.png"),
  superpuchar: require("../../assets/ligi/superpuchar.png"),
  pucharpolski: require("../../assets/ligi/pucharpolski.png"),
  lm: require("../../assets/ligi/ligamistrzow.png"),
  le: require("../../assets/ligi/ligaeuropy.png"),
  lk: require("../../assets/ligi/ligakonferencji.png"),
  ekstraklasaZnak: require("../../assets/ligi/ekstraklasa_znak.png"),
  zpnPom: require("../../assets/ligi/zpn_pomorski.png"),
  zpnKp: require("../../assets/ligi/zpn_kujawsko.png"),
  zpnZach: require("../../assets/ligi/zpn_zachodnio.png"),
  zpnMal: require("../../assets/ligi/zpn_malopolski.png"),
  l4Kp: require("../../assets/ligi/4liga_kujawsko.png"),
  l4Zach: require("../../assets/ligi/4liga_zachodnio.png"),
  zpnWm: require("../../assets/ligi/zpn_warminsko.png"),
  zpnPod: require("../../assets/ligi/zpn_podlaski.png"),
  l4Wm: require("../../assets/ligi/4liga_warminsko.png"),
  ppWm: require("../../assets/ligi/puchar_warminsko.png"),
  l4Mal: require("../../assets/ligi/4liga_malopolska.png"),
};
// proporcje (szerokość / wysokość) wyciętych logo — bez tła, jasne wersje dla ciemnego interfejsu
const PROP: Record<keyof typeof LOGA, number> = { ekstraklasa: 4.65, ekstraklasaZnak: 0.99, l1: 0.92, l2: 0.92, l3: 0.924, superpuchar: 0.835, pucharpolski: 0.575, lm: 1.05, le: 0.685, lk: 1.01, zpnPom: 1, zpnKp: 0.985, zpnZach: 1, zpnMal: 0.835, l4Kp: 0.785, l4Zach: 3.213, zpnWm: 0.756, l4Mal: 0.662, zpnPod: 0.835, l4Wm: 0.753, ppWm: 0.654 };
export function LogoLigi({ nazwa, poziom, rozmiar = 28, znak }: { nazwa: string; poziom?: number; rozmiar?: number; znak?: boolean }) {
  const k0 = kluczLogoLigi(nazwa, poziom); const k = k0 === "ekstraklasa" && znak ? "ekstraklasaZnak" : k0; // znak = sama piłka Ekstraklasy (małe miejsca)
  if (k) {
    const szer = rozmiar * PROP[k];
    return <Image source={LOGA[k]} style={{ width: szer, height: rozmiar, resizeMode: "contain" }} />;
  }
  const skrot = /Puchar|PP/i.test(nazwa) ? "🏆" : /IV liga/i.test(nazwa) ? "IV" : /V liga/i.test(nazwa) ? "V" : /okręg/i.test(nazwa) ? "OKR" : /klasa A|A klasa/i.test(nazwa) ? "A" : /klasa B|B klasa/i.test(nazwa) ? "B" : /klasa C|C klasa/i.test(nazwa) ? "C" : "•";
  return (
    <View style={{ width: rozmiar, height: rozmiar, borderRadius: rozmiar * 0.22, backgroundColor: "#1d3d8f", borderWidth: 1.5, borderColor: "#fff", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: rozmiar * (skrot.length > 2 ? 0.3 : 0.42), fontFamily: CZCIONKA }}>{skrot}</Text>
    </View>
  );
}

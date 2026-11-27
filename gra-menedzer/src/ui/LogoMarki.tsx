import { Text, View } from "react-native";
import { hashNazwy } from "./barwy";

// Wygenerowane logo marki (oryginalne, deterministyczne z nazwy) — bez znaków towarowych.
const PALETA: [string, string][] = [
  ["#e53935", "#ffffff"], ["#1e88e5", "#ffffff"], ["#43a047", "#ffffff"], ["#fb8c00", "#1a1a1a"],
  ["#8e24aa", "#ffffff"], ["#00897b", "#ffffff"], ["#3949ab", "#ffd54f"], ["#d81b60", "#ffffff"],
  ["#546e7a", "#ffd54f"], ["#f4511e", "#ffffff"], ["#6d4c41", "#ffd54f"], ["#00acc1", "#07303f"],
];

function monogram(nazwa: string): string {
  const slowa = nazwa.split(/[\s-]+/).filter(Boolean);
  if (slowa.length >= 2) return (slowa[0][0] + slowa[1][0]).toUpperCase();
  return nazwa.slice(0, 2).toUpperCase();
}

export function LogoMarki({ nazwa, rozmiar = 22 }: { nazwa: string; rozmiar?: number }) {
  const h = hashNazwy(nazwa);
  const [tlo, akcent] = PALETA[h % PALETA.length];
  const ksztalt = h % 3; // 0 koło, 1 kwadrat, 2 tarcza
  const promien = ksztalt === 0 ? rozmiar / 2 : ksztalt === 1 ? rozmiar * 0.18 : rozmiar * 0.14;
  const dolne = ksztalt === 2 ? rozmiar * 0.5 : promien;
  return (
    <View
      style={{
        width: rozmiar,
        height: rozmiar,
        backgroundColor: tlo,
        borderTopLeftRadius: promien,
        borderTopRightRadius: promien,
        borderBottomLeftRadius: dolne,
        borderBottomRightRadius: dolne,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: Math.max(1, rozmiar / 16),
        borderColor: akcent,
      }}
    >
      <Text style={{ color: akcent, fontWeight: "900", fontSize: rozmiar * 0.42 }}>{monogram(nazwa)}</Text>
    </View>
  );
}

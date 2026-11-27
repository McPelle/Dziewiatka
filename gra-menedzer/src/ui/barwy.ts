// Barwy klubu (z nazwy) i emblematy lig — spójne w całej grze (herb, stroje).
// Barwy pochodzą z jednego źródła prawdy: data/barwy.ts (prawdziwe barwy → słowa-kolory → hash),
// żeby stroje i herb miały identyczne, realne kolory klubu.
export { barwyKlubu, barwyWyjazdowe, kolorKolizja } from "../data/barwy";

export function hashNazwy(nazwa: string): number {
  let h = 0;
  for (const c of nazwa) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

// Emblematy lig (poziom 1 = Ekstraklasa … 9 = klasa B). Barwy odrębne dla każdej ligi.
export const EMBLEMATY: { skrot: string; nazwa: string; kolor: string }[] = [
  { skrot: "EKS", nazwa: "Ekstraklasa", kolor: "#d4af37" },
  { skrot: "I", nazwa: "I liga", kolor: "#c0392b" },
  { skrot: "II", nazwa: "II liga", kolor: "#2980b9" },
  { skrot: "III", nazwa: "III liga", kolor: "#27ae60" },
  { skrot: "IV", nazwa: "IV liga", kolor: "#8e44ad" },
  { skrot: "V", nazwa: "V liga", kolor: "#16a085" },
  { skrot: "OKR", nazwa: "Klasa okręgowa", kolor: "#e67e22" },
  { skrot: "A", nazwa: "Klasa A", kolor: "#7f8c8d" },
  { skrot: "B", nazwa: "Klasa B", kolor: "#607d8b" },
  { skrot: "C", nazwa: "Klasa C", kolor: "#546e7a" },
];

export function emblematLigi(poziom: number) {
  return EMBLEMATY[Math.min(poziom, EMBLEMATY.length) - 1];
}

/** Przyciemnia/rozjaśnia kolor hex o podany współczynnik (−1..1). */
export function odcien(hex: string, f: number): string {
  const m = hex.replace("#", "");
  const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  const k = (x: number) => Math.max(0, Math.min(255, Math.round(x + 255 * f)));
  return `#${[k(r), k(g), k(b)].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

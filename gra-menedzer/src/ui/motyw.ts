// Motyw w barwach klubu (#57): pasek klubu i aktywna zakładka w kolorach Twojego klubu (opcja w Więcej → Grafika).
import { barwyKlubu } from "../data/barwy";
import { K } from "./styl";

const ls = () => (typeof window !== "undefined" ? window.localStorage : undefined);
export const motywKlubu = () => ls()?.getItem("dz_motyw") !== "0";
export const ustawMotywKlubu = (v: boolean) => ls()?.setItem("dz_motyw", v ? "1" : "0");

const hex = (c: string): [number, number, number] => { const h = c.replace("#", ""); const f = h.length === 3 ? h.split("").map((x) => x + x).join("") : h.slice(0, 6); return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) || 0) as [number, number, number]; };
const toHex = (r: number[]) => "#" + r.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
const jasnosc = ([r, g, b]: number[]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

/** Kolory motywu: tło paska (przyciemniony kolor klubu) i akcent (jaśniejszy, czytelny na ciemnym tle). */
export function koloryMotywu(nazwa: string): { tlo: string; akcent: string } {
  if (!motywKlubu()) return { tlo: K.murawa, akcent: K.akcent };
  const [a, b] = barwyKlubu(nazwa).map(hex);
  const ciemny = jasnosc(a) <= jasnosc(b) ? a : b, jasny = ciemny === a ? b : a;
  const tlo = jasnosc(ciemny) > 0.35 ? ciemny.map((x) => x * 0.35) : ciemny.map((x) => x * 0.8 + 8);
  let ak: number[] = jasny; if (jasnosc(ak) < 0.55) ak = ak.map((x) => x + (255 - x) * 0.45);
  if (Math.abs(jasnosc(ak) - jasnosc(tlo)) < 0.3) ak = [255, 206, 71];
  return { tlo: toHex(tlo), akcent: toHex(ak) };
}

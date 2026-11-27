import { Image, View } from "react-native";
import type { TwarzCechy } from "../engine/types";
import { hashNazwy } from "./barwy";

// Generowany awatar (oryginalny, deterministyczny z nazwiska) — NIE jest zdjęciem realnej osoby.
export const SKORY = ["#f6d3ab", "#f0c49b", "#e4ac82", "#d49a6a", "#c08457", "#a56a3f", "#8a5230", "#6b3d22"];
export const WLOSY = ["#14110f", "#241a12", "#3b2a1a", "#5a3d22", "#7a5a30", "#a07c3e", "#c8a86a", "#7a7a7a", "#b8b8b8", "#d9c08a"];

// Karnacja wg kraju (realia polskich lig: większość zawodników to Polacy i Europejczycy) — zakres indeksów SKORY.
const AFRYKA = /Nigeria|Senegal|Ghana|Kamerun|Gwinea|Gambia|Angola|Kongo|Mali|Burkina|Wybrzeże|Uganda|Kenia|Erytrea|Komory|Zielonego|Tomasza|Mauretania|Martynika|Surinam|Dominikana|Honduras|Salwador/;
const POLUDNIE = /Brazylia|Hiszpania|Portugalia|Argentyna|Kolumbia|Wenezuela|Chile|Włochy|Grecja|Cypr|Albania|Kosowo|Turcja|Tunezja|Irak|Iran|Armenia|Azerbejdżan|Gruzja|Uzbekistan|Japonia/;
export function zakresSkory(kraj?: string): [number, number] {
  if (!kraj || kraj === "Polska") return [0, 2];
  if (AFRYKA.test(kraj)) return [5, 7];
  if (POLUDNIE.test(kraj)) return [1, 5];
  if (/Francja|Belgia|Holandia|Anglia|Stany|Kanada|Szwecja|Norwegia|Dania|Niemcy|Szwajcaria|Australia/.test(kraj)) return [0, 7];
  return [0, 3];
}
export function domyslneCechy(seed: string, kraj?: string): TwarzCechy {
  const h = hashNazwy(seed);
  const [a, b] = zakresSkory(kraj);
  // w krajach mieszanych (np. Francja) i tak częściej jaśniejsza karnacja — rozkład ważony
  const sk = b - a >= 6 ? ((h % 10) < 6 ? h % 3 : a + (h % (b - a + 1))) : a + (h % (b - a + 1));
  return {
    skora: sk,
    wlosy: (h >> 3) % WLOSY.length,
    stylWlosow: (h >> 7) % 5, // 0 krótkie, 1 bardzo krótkie, 2 przedziałek, 3 łysy, 4 kręcone
    zarost: (h >> 11) % 3 === 0 ? 1 : 0, // ~1/3 z brodą
  };
}

export const LICZBA = { skory: SKORY.length, wlosy: WLOSY.length, style: 5, zarost: 2 };

export function Twarz({ seed, rozmiar = 48, zdjecie, cechy, jersey = "#1f7a43", kraj }: {
  seed: string; rozmiar?: number; zdjecie?: string; cechy?: TwarzCechy; jersey?: string; kraj?: string;
}) {
  const R = rozmiar;
  const ramka = { width: R, height: R, borderRadius: R / 2, borderWidth: Math.max(1, R / 24), borderColor: "rgba(255,255,255,0.15)", overflow: "hidden" as const, backgroundColor: "#24405a" };

  if (zdjecie) {
    return <Image source={{ uri: zdjecie }} style={{ ...ramka }} resizeMode="cover" />;
  }

  const c = cechy ?? domyslneCechy(seed, kraj);
  const skora = SKORY[c.skora % SKORY.length];
  const wlosy = WLOSY[c.wlosy % WLOSY.length];
  const styl = c.stylWlosow % 5;
  const broda = c.zarost % 2 === 1;
  const lysy = styl === 3;

  const glowaW = R * 0.56, glowaH = R * 0.64;
  const glowaX = (R - glowaW) / 2, glowaY = R * 0.2;
  const ciemniej = cieniej(skora);

  return (
    <View style={ramka}>
      {/* tło gradientowe (dwa pasy) */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#2b4a66" }} />
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: R * 0.5, backgroundColor: "#22384d" }} />
      {/* koszulka / ramiona */}
      <View style={{ position: "absolute", bottom: -R * 0.06, left: R * 0.1, right: R * 0.1, height: R * 0.42, borderTopLeftRadius: R * 0.3, borderTopRightRadius: R * 0.3, backgroundColor: jersey }} />
      <View style={{ position: "absolute", bottom: 0, left: R * 0.4, right: R * 0.4, height: R * 0.18, backgroundColor: cieniej(jersey) }} />
      {/* szyja */}
      <View style={{ position: "absolute", left: R * 0.42, width: R * 0.16, top: R * 0.6, height: R * 0.2, backgroundColor: ciemniej }} />
      {/* głowa */}
      <View style={{ position: "absolute", left: glowaX, top: glowaY, width: glowaW, height: glowaH, borderRadius: glowaW / 2, backgroundColor: skora }} />
      {/* uszy */}
      <View style={{ position: "absolute", left: glowaX - R * 0.03, top: glowaY + glowaH * 0.42, width: R * 0.08, height: R * 0.12, borderRadius: R * 0.04, backgroundColor: skora }} />
      <View style={{ position: "absolute", left: glowaX + glowaW - R * 0.05, top: glowaY + glowaH * 0.42, width: R * 0.08, height: R * 0.12, borderRadius: R * 0.04, backgroundColor: skora }} />
      {/* włosy */}
      {!lysy && (
        <>
          {/* czupryna na czubku */}
          <View style={{ position: "absolute", left: glowaX - R * 0.02, top: glowaY - (styl === 4 ? R * 0.1 : R * 0.04), width: glowaW + R * 0.04, height: styl === 4 ? glowaH * 0.5 : glowaH * 0.36, borderTopLeftRadius: glowaW, borderTopRightRadius: glowaW, borderBottomLeftRadius: styl === 1 ? glowaW : R * 0.06, borderBottomRightRadius: styl === 1 ? glowaW : R * 0.06, backgroundColor: wlosy }} />
          {/* loki (kręcone) */}
          {styl === 4 && [0, 1, 2, 3, 4].map((i) => <View key={`l${i}`} style={{ position: "absolute", left: glowaX - R * 0.04 + i * (glowaW + R * 0.08) / 5, top: glowaY - R * 0.13 + (i % 2) * R * 0.03, width: R * 0.15, height: R * 0.15, borderRadius: R * 0.075, backgroundColor: wlosy }} />)}
          {/* przedziałek */}
          {styl === 2 && <View style={{ position: "absolute", left: glowaX + glowaW * 0.34, top: glowaY - R * 0.02, width: R * 0.03, height: glowaH * 0.2, backgroundColor: skora }} />}
          {/* boki */}
          {styl !== 1 && <>
            <View style={{ position: "absolute", left: glowaX - R * 0.01, top: glowaY + glowaH * 0.14, width: R * 0.06, height: glowaH * 0.34, backgroundColor: wlosy }} />
            <View style={{ position: "absolute", left: glowaX + glowaW - R * 0.05, top: glowaY + glowaH * 0.14, width: R * 0.06, height: glowaH * 0.34, backgroundColor: wlosy }} />
          </>}
        </>
      )}
      {/* łysy — lekka linia włosów po bokach */}
      {lysy && <>
        <View style={{ position: "absolute", left: glowaX, top: glowaY + glowaH * 0.34, width: R * 0.05, height: glowaH * 0.2, backgroundColor: wlosy, opacity: 0.6 }} />
        <View style={{ position: "absolute", left: glowaX + glowaW - R * 0.05, top: glowaY + glowaH * 0.34, width: R * 0.05, height: glowaH * 0.2, backgroundColor: wlosy, opacity: 0.6 }} />
      </>}
      {/* brwi */}
      <View style={{ position: "absolute", left: glowaX + glowaW * 0.2, top: glowaY + glowaH * 0.42, width: glowaW * 0.22, height: R * 0.03, borderRadius: 2, backgroundColor: wlosy }} />
      <View style={{ position: "absolute", left: glowaX + glowaW * 0.58, top: glowaY + glowaH * 0.42, width: glowaW * 0.22, height: R * 0.03, borderRadius: 2, backgroundColor: wlosy }} />
      {/* oczy */}
      <View style={{ position: "absolute", left: glowaX + glowaW * 0.26, top: glowaY + glowaH * 0.5, width: R * 0.06, height: R * 0.06, borderRadius: R * 0.03, backgroundColor: "#2a2a2a" }} />
      <View style={{ position: "absolute", left: glowaX + glowaW * 0.62, top: glowaY + glowaH * 0.5, width: R * 0.06, height: R * 0.06, borderRadius: R * 0.03, backgroundColor: "#2a2a2a" }} />
      {/* nos */}
      <View style={{ position: "absolute", left: glowaX + glowaW * 0.46, top: glowaY + glowaH * 0.56, width: R * 0.05, height: R * 0.1, borderRadius: R * 0.02, backgroundColor: ciemniej }} />
      {/* broda / usta */}
      {broda ? (
        <View style={{ position: "absolute", left: glowaX + glowaW * 0.1, top: glowaY + glowaH * 0.64, width: glowaW * 0.8, height: glowaH * 0.34, borderBottomLeftRadius: glowaW, borderBottomRightRadius: glowaW, backgroundColor: wlosy, opacity: 0.92 }} />
      ) : (
        <View style={{ position: "absolute", left: glowaX + glowaW * 0.32, top: glowaY + glowaH * 0.74, width: glowaW * 0.36, height: R * 0.03, borderRadius: 2, backgroundColor: cieniej(skora) }} />
      )}
    </View>
  );
}

/** Przyciemnia kolor hex o ~18%. */
function cieniej(hex: string): string {
  const n = hex.replace("#", "");
  if (n.length < 6) return hex;
  const f = (i: number) => Math.max(0, Math.round(parseInt(n.slice(i, i + 2), 16) * 0.82)).toString(16).padStart(2, "0");
  return `#${f(0)}${f(2)}${f(4)}`;
}

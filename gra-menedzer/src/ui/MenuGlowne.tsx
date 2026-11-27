import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { mojaLiga } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { HerbGry, PlakietkaBeta } from "./Grafika";
import { Herb } from "./Herb";
import { TloStadion } from "./TloStadion";
import { grafika3D } from "./three/Stadion3DWidok";
import { Stadion3DMenu } from "./three/Stadion3DMenu";
import type { Klub } from "../engine/types";

const KLUB_DEMO = { id: "demo", nazwa: "Dziewiątka", pojemnosc: 9000, poziom: 2, obiekty: { zadaszenie: 2, telebim: 1 }, oswietlenie: true, murawa: "naturalna", miasto: "", renoma: 0.6 } as unknown as Klub;
import { CZCIONKA, cien, K } from "./styl";
import { useEffect, useState } from "react";
import { losowaCiekawostka } from "../data/ciekawostki";
import { dzwiekiWlaczone, muzykaWlaczona, startMuzyki, stopMuzyki, ustawDzwieki, ustawMuzyke } from "./muzyka";

// Ekran tytułowy „DZIEWIĄTKA" — wektorowa scena stadionowa w tle, herb, nazwa i przyciski.
export function MenuGlowne({ stan, meta, czeka, naKontynuuj, naNowa, naWczytaj, naSzybki, naWyzwania }: { stan: StanGry | null; meta?: { nazwa: string; herb?: string; liga: string; sezon: number } | null; czeka?: boolean; naKontynuuj: () => void; naNowa: () => void; naWczytaj: () => void; naSzybki?: () => void; naWyzwania?: () => void }) {
  // zapis jeszcze się wczytuje → wizytówka klubu z szybkiego „meta" (menu od razu gotowe)
  const klub = stan ? stan.kluby[stan.mojKlub] : meta ? ({ nazwa: meta.nazwa, herb: meta.herb } as unknown as Klub) : null;
  const liga = stan ? mojaLiga(stan) : meta ? { nazwa: meta.liga } : null;
  const sezonMenu = stan ? stan.sezon : meta?.sezon;
  const [ciek, setCiek] = useState(losowaCiekawostka);
  const [muz, setMuz] = useState(muzykaWlaczona);
  const [dzw, setDzw] = useState(dzwiekiWlaczone);
  useEffect(() => { // muzyka startuje po pierwszym dotknięciu (zasady autoodtwarzania przeglądarek), gaśnie po wyjściu z menu
    if (Platform.OS !== "web") return;
    const go = () => startMuzyki(); window.addEventListener("pointerdown", go, { once: true });
    const t = setInterval(() => setCiek(losowaCiekawostka()), 12000);
    return () => { window.removeEventListener("pointerdown", go); clearInterval(t); stopMuzyki(); };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: K.tlo }}>
      {/* SCENA TYTUŁOWA */}
      <View style={{ height: "56%", borderBottomWidth: 2, borderBottomColor: K.akcent, overflow: "hidden" }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>{Platform.OS === "web" ? <Stadion3DMenu s={stan} klub={stan ? klub! : KLUB_DEMO} /> : <TloStadion />}</View>
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(4,12,8,0.35)" }} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: Platform.OS === "android" ? 20 : 0 }}>
          <HerbGry rozmiar={112} />
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 46, letterSpacing: 2, marginTop: 10, fontFamily: CZCIONKA, textShadowColor: "rgba(0,0,0,0.6)", textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 8 }}>DZIEWIĄTKA</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <View style={{ height: 1, width: 26, backgroundColor: K.akcent, opacity: 0.7 }} />
            <Text style={{ color: K.akcent, fontSize: 12.5, fontWeight: "800", letterSpacing: 4, textTransform: "uppercase", marginHorizontal: 10, fontFamily: CZCIONKA }}>Menedżer Piłkarski</Text>
            <View style={{ height: 1, width: 26, backgroundColor: K.akcent, opacity: 0.7 }} />
          </View>
          <View style={{ marginTop: 12 }}><PlakietkaBeta /></View>
        </View>
      </View>

      {/* PRZYCISKI */}
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 26, flexGrow: 1, justifyContent: "center" }}>
        {klub ? (
          <Pressable onPress={naKontynuuj} style={({ pressed }) => [{ backgroundColor: K.akcent, borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", opacity: pressed ? 0.92 : 1, ...cien }]}>
            <View style={{ borderRadius: 10, backgroundColor: "rgba(0,0,0,0.12)", padding: 3 }}><Herb klub={klub} rozmiar={36} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: "#15300c", fontSize: 11.5, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", fontFamily: CZCIONKA }}>Kontynuuj karierę</Text>
              <Text numberOfLines={1} style={{ color: "#15300c", fontSize: 17, fontWeight: "900", fontFamily: CZCIONKA }}>{klub.nazwa}</Text>
              <Text numberOfLines={1} style={{ color: "rgba(21,48,12,0.72)", fontSize: 12, fontWeight: "700", fontFamily: CZCIONKA }}>{liga?.nazwa ?? ""} · sezon {sezonMenu}{czeka ? " · wczytywanie…" : ""}</Text>
            </View>
            <Text style={{ color: "#15300c", fontSize: 24, fontWeight: "900" }}>▶</Text>
          </Pressable>
        ) : null}

        <Pressable onPress={naNowa} style={({ pressed }) => [{ marginTop: stan ? 12 : 0, backgroundColor: stan ? K.karta : K.akcent, borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: stan ? K.liniaMocna : K.akcent, opacity: pressed ? 0.9 : 1, ...cien }]}>
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: stan ? K.karta2 : "rgba(0,0,0,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: stan ? K.linia : "transparent" }}>
            <Text style={{ fontSize: 22, color: stan ? K.akcent : "#15300c", fontWeight: "900" }}>＋</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: stan ? K.tekst : "#15300c", fontSize: 17, fontWeight: "900", fontFamily: CZCIONKA }}>Nowa kariera</Text>
            <Text style={{ color: stan ? K.szary : "rgba(21,48,12,0.72)", fontSize: 12, fontWeight: "700", fontFamily: CZCIONKA }}>Wybierz ligę, województwo i klub</Text>
          </View>
          <Text style={{ color: stan ? K.akcent : "#15300c", fontSize: 22, fontWeight: "900" }}>›</Text>
        </Pressable>

        {/* Wczytaj grę */}
        <Pressable onPress={naWczytaj} style={({ pressed }) => [{ marginTop: 12, backgroundColor: K.karta, borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: K.liniaMocna, opacity: pressed ? 0.9 : 1, ...cien }]}>
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: K.karta2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: K.linia }}>
            <Text style={{ fontSize: 20 }}>💾</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: K.tekst, fontSize: 17, fontWeight: "900", fontFamily: CZCIONKA }}>Wczytaj grę</Text>
            <Text style={{ color: K.szary, fontSize: 12, fontWeight: "700", marginTop: 1, fontFamily: CZCIONKA }}>Twoje zapisane kariery</Text>
          </View>
          <Text style={{ color: K.akcent, fontSize: 22, fontWeight: "900" }}>›</Text>
        </Pressable>

        {/* Szybki mecz */}
        {naSzybki && <Pressable onPress={naSzybki} style={({ pressed }) => [{ marginTop: 12, backgroundColor: K.karta, borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: K.liniaMocna, opacity: pressed ? 0.9 : 1, ...cien }]}>
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: K.karta2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: K.linia }}>
            <Text style={{ fontSize: 20 }}>⚡</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: K.tekst, fontSize: 17, fontWeight: "900", fontFamily: CZCIONKA }}>Szybki mecz</Text>
            <Text style={{ color: K.szary, fontSize: 12, fontWeight: "700", marginTop: 1, fontFamily: CZCIONKA }}>Dowolne dwie drużyny, mecz na żywo w 3D</Text>
          </View>
          <Text style={{ color: K.akcent, fontSize: 22, fontWeight: "900" }}>›</Text>
        </Pressable>}

        {naWyzwania && <Pressable onPress={naWyzwania} style={({ pressed }) => [{ marginTop: 12, backgroundColor: K.karta, borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: K.liniaMocna, opacity: pressed ? 0.9 : 1, ...cien }]}>
          <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: K.karta2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: K.linia }}>
            <Text style={{ fontSize: 20 }}>🎯</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: K.tekst, fontSize: 17, fontWeight: "900", fontFamily: CZCIONKA }}>Wyzwania</Text>
            <Text style={{ color: K.szary, fontSize: 12, fontWeight: "700", marginTop: 1, fontFamily: CZCIONKA }}>Scenariusze z celem: ratunek, z dna na szczyt, twierdza…</Text>
          </View>
          <Text style={{ color: K.akcent, fontSize: 22, fontWeight: "900" }}>›</Text>
        </Pressable>}

        <View style={{ marginTop: 14, backgroundColor: "rgba(255,206,71,0.08)", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(255,206,71,0.25)" }}>
          <Text style={{ color: K.akcent, fontSize: 11, fontWeight: "900", letterSpacing: 1, fontFamily: CZCIONKA }}>💡 CZY WIESZ, ŻE…</Text>
          <Text style={{ color: K.tekst, fontSize: 13, marginTop: 4, fontFamily: CZCIONKA }}>{ciek}</Text>
        </View>
        {Platform.OS === "web" && <View style={{ flexDirection: "row", gap: 8, marginTop: 10, justifyContent: "center" }}>
          <Pressable onPress={() => { ustawMuzyke(!muz); setMuz(!muz); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: K.liniaMocna }}><Text style={{ color: K.szary, fontSize: 12, fontFamily: CZCIONKA }}>{muz ? "🎵 Muzyka: wł." : "🔇 Muzyka: wył."}</Text></Pressable>
          <Pressable onPress={() => { ustawDzwieki(!dzw); setDzw(!dzw); }} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: K.liniaMocna }}><Text style={{ color: K.szary, fontSize: 12, fontFamily: CZCIONKA }}>{dzw ? "🔔 Dźwięki: wł." : "🔕 Dźwięki: wył."}</Text></Pressable>
        </View>}

        {stan && <Text style={{ color: K.szary, fontSize: 11, textAlign: "center", marginTop: 12, opacity: 0.8, fontFamily: CZCIONKA }}>Nowa kariera nadpisze obecny autozapis (zapisy w „Wczytaj grę" zostają).</Text>}
        <Text style={{ color: K.szary, fontSize: 10.5, textAlign: "center", marginTop: 22, opacity: 0.55, fontFamily: CZCIONKA }}>
          wersja beta · 4 województwa · od klasy B po Ekstraklasę{Platform.OS === "web" && (window as any).__WERSJA ? ` · v.${(window as any).__WERSJA}` : ""}{Platform.OS === "web" && !grafika3D() ? " · 3D wyłączone w Więcej → Grafika" : ""}
        </Text>
      </ScrollView>
    </View>
  );
}

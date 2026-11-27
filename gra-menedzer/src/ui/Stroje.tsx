import { Text, View } from "react-native";
import { aktywniSponsorzy, producentStrojow } from "../engine/sezon";
import type { Klub, StanGry } from "../engine/types";
import { barwyKlubu, barwyWyjazdowe, emblematLigi, hashNazwy, odcien } from "./barwy";
import { Herb } from "./Herb";
import { LogoMarki } from "./LogoMarki";
import { K, st } from "./styl";

import { kity, type Kit } from "./strojeDane";
export { kity };

/** Rysunek koszulki (View) z emblematem ligi i nazwą sponsora. */
function Koszulka({ kit, klub, sponsor, producent, skrot, numer, nazwisko, tyl }: { kit: Kit; klub: Klub; sponsor?: string; producent?: string; skrot: string; numer?: number; nazwisko?: string; tyl?: boolean }) {
  const poziom = klub.poziom;
  const emb = emblematLigi(poziom);
  const jasny = (hex: string) => {
    const n = hex.replace("#", "");
    const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
  };
  const napis = jasny(kit.baza) ? "#1a1a1a" : "#ffffff";
  const W = 92;
  return (
    <View style={{ alignItems: "center", width: W + 8, marginBottom: 12 }}>
      <View style={{ width: W, alignItems: "center" }}>
        {/* ——— KOSZULKA ——— */}
        <View style={{ width: W, height: 88 }}>
          {/* rękawy */}
          <View style={{ position: "absolute", left: -6, top: 16, width: 26, height: 30, borderTopLeftRadius: 10, borderBottomLeftRadius: 4, backgroundColor: kit.wzor === "rekaw" ? kit.dodatek : kit.baza, borderWidth: 1, borderColor: "rgba(0,0,0,0.22)", transform: [{ rotate: "-16deg" }], alignItems: "center", justifyContent: "center" }}>
            {/* emblemat ligi — naszywka na rękawie */}
            <View style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: emb.kolor, alignItems: "center", justifyContent: "center", transform: [{ rotate: "16deg" }] }}>
              <Text style={{ color: "#fff", fontSize: 7, fontWeight: "900" }}>{emb.skrot}</Text>
            </View>
          </View>
          <View style={{ position: "absolute", right: -6, top: 16, width: 26, height: 30, borderTopRightRadius: 10, borderBottomRightRadius: 4, backgroundColor: kit.wzor === "rekaw" ? kit.dodatek : kit.baza, borderWidth: 1, borderColor: "rgba(0,0,0,0.22)", transform: [{ rotate: "16deg" }] }} />
          {/* mankiety */}
          <View style={{ position: "absolute", left: -4, top: 42, width: 20, height: 5, backgroundColor: kit.dodatek, transform: [{ rotate: "-16deg" }] }} />
          <View style={{ position: "absolute", right: -4, top: 42, width: 20, height: 5, backgroundColor: kit.dodatek, transform: [{ rotate: "16deg" }] }} />
          {/* korpus */}
          <View style={{ position: "absolute", left: 16, top: 8, width: W - 32, height: 78, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: kit.baza, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.28)" }}>
            {kit.wzor === "pasy" && [0, 1, 2, 3].map((i) => (
              <View key={i} style={{ position: "absolute", top: 0, bottom: 0, left: 6 + i * 16, width: 7, backgroundColor: kit.dodatek }} />
            ))}
            {/* kołnierz (tył prosty, przód V) */}
            <View style={{ alignSelf: "center", width: 26, height: tyl ? 7 : 10, backgroundColor: kit.dodatek, borderBottomLeftRadius: tyl ? 10 : 0, borderBottomRightRadius: tyl ? 10 : 0 }} />
            {!tyl && <View style={{ alignSelf: "center", width: 16, height: 8, backgroundColor: kit.baza, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, marginTop: -8 }} />}
            {tyl ? (
              <>
                {/* ——— TYŁ: nazwisko u góry + duży numer na środku ——— */}
                {nazwisko ? (
                  <Text numberOfLines={1} adjustsFontSizeToFit style={{ position: "absolute", top: 13, left: 0, right: 0, textAlign: "center", color: napis, fontSize: Math.max(5, Math.min(11, Math.floor(52 / (nazwisko.length * 0.72)))), fontWeight: "900", letterSpacing: nazwisko.length > 8 ? 0 : 0.5, textTransform: "uppercase" }}>{nazwisko}</Text>
                ) : null}
                <Text style={{ position: "absolute", top: 26, left: 0, right: 0, textAlign: "center", color: napis, fontSize: 34, fontWeight: "900", lineHeight: 38 }}>{numer && numer > 0 ? numer : kit.wzor === "rekaw" ? "1" : "10"}</Text>
              </>
            ) : (
              <>
                {/* ——— PRZÓD: herb, producent, sponsor ——— */}
                <View style={{ position: "absolute", top: 12, left: 5 }}>
                  <Herb klub={klub} rozmiar={17} />
                </View>
                {producent ? <View style={{ position: "absolute", top: 12, right: 5 }}><LogoMarki nazwa={producent} rozmiar={14} /></View> : null}
                <Text numberOfLines={1} style={{ position: "absolute", top: 40, left: 3, right: 3, textAlign: "center", color: napis, fontSize: sponsor && sponsor.length > 8 ? 8 : 10, fontWeight: "800" }}>
                  {sponsor ?? skrot}
                </Text>
              </>
            )}
          </View>
        </View>
        {/* ——— SPODENKI ——— */}
        <View style={{ width: 56, height: 36, marginTop: 5, flexDirection: "row", justifyContent: "center" }}>
          {[0, 1].map((n) => (
            <View key={n} style={{ width: 25, height: 36, marginHorizontal: 1, borderTopLeftRadius: n === 0 ? 6 : 2, borderTopRightRadius: n === 1 ? 6 : 2, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: kit.baza, borderWidth: 1, borderColor: "rgba(0,0,0,0.25)", overflow: "hidden" }}>
              <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, backgroundColor: kit.dodatek }} />
            </View>
          ))}
        </View>
        {/* ——— GETRY ——— */}
        <View style={{ flexDirection: "row", gap: 14, marginTop: 5 }}>
          {[0, 1].map((n) => (
            <View key={n} style={{ width: 13, height: 34, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: kit.baza, borderWidth: 1, borderColor: "rgba(0,0,0,0.25)", overflow: "hidden" }}>
              <View style={{ height: 8, backgroundColor: kit.dodatek }} />
            </View>
          ))}
        </View>
      </View>
      <Text style={[st.maly, { fontSize: 11, marginTop: 4, fontWeight: "700" }]}>{kit.nazwa}</Text>
    </View>
  );
}

/** Koszulka konkretnego zawodnika — strój domowy klubu z jego numerem i nazwiskiem. */
export function StrojZawodnika({ s, klub, numer, nazwisko, bramkarz }: { s: StanGry; klub: Klub; numer?: number; nazwisko?: string; bramkarz?: boolean }) {
  const k = kity(klub);
  const kit = bramkarz ? k.bramkarz[0] : k.pole[0];
  const moj = klub.id === s.mojKlub;
  const sponsorGlowny = moj ? aktywniSponsorzy(s).find((sp) => sp.typ === "glowny")?.nazwa : undefined;
  const producent = moj ? producentStrojow(s) : undefined;
  return <Koszulka kit={kit} klub={klub} sponsor={sponsorGlowny} producent={producent} skrot={klub.skrot} numer={numer} nazwisko={nazwisko} tyl />;
}

export function Stroje({ s, klub }: { s: StanGry; klub: Klub }) {
  const kit = kity(klub);
  const moj = klub.id === s.mojKlub;
  const sponsorGlowny = moj ? aktywniSponsorzy(s).find((sp) => sp.typ === "glowny")?.nazwa : undefined;
  const producent = moj ? producentStrojow(s) : undefined;
  const rzad = (kits: typeof kit.pole) => (
    <View style={[st.wiersz, { flexWrap: "wrap", justifyContent: "space-around" }]}>
      {kits.map((kt) => (
        <Koszulka key={kt.nazwa} kit={kt} klub={klub} sponsor={sponsorGlowny} producent={producent} skrot={klub.skrot} />
      ))}
    </View>
  );
  return (
    <View>
      <Text style={[st.naglowek, { marginTop: 4 }]}>Stroje zawodnika</Text>
      {rzad(kit.pole)}
      <Text style={[st.naglowek, { marginTop: 8 }]}>Stroje bramkarza</Text>
      {rzad(kit.bramkarz)}
      {moj && aktywniSponsorzy(s).length > 0 && (
        <Text style={[st.maly, { marginTop: 4 }]}>Sponsorzy na stroju: {aktywniSponsorzy(s).map((sp) => sp.nazwa).join(", ")}. Wygasły kontrakt = znika ze stroju.</Text>
      )}
    </View>
  );
}

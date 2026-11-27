import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import type { StanGry } from "../engine/types";
import { ZapiszGre } from "./ZapiszGre";
import { liczbaGlosow } from "./three/glos";
import { Reprezentacja } from "./Reprezentacja";
import { zapiszSlot } from "./zapis";
import { Finanse } from "./Finanse";
import { Sztab } from "./Sztab";
import { Trening } from "./Trening";
import { Akademia } from "./Akademia";
import { KarieraTrenera } from "./KarieraTrenera";
import { WidokKlubu } from "./WidokKlubu";
import { Sponsorzy } from "./Sponsorzy";
import { Stroje } from "./Stroje";
import { PucharEkran } from "./PucharEkran";
import { PrzegladLig } from "./PrzegladLig";
import { CZCIONKA, cien, K, st } from "./styl";

// Hub „Więcej" — pełne menu wszystkich działów klubu. Karty pogrupowane, z ikoną i krótkim opisem.
type Tryb = "modal" | "inline";
type Wpis = { key: string; ikona: string; nazwa: string; opis: string; grupa: string; tryb: Tryb };

const WPISY: Wpis[] = [
  { key: "trening", ikona: "🏃", nazwa: "Trening", opis: "Plan, fokus i intensywność", grupa: "Zespół", tryb: "modal" },
  { key: "akademia", ikona: "🎓", nazwa: "Akademia", opis: "Młodzież i wychowankowie", grupa: "Zespół", tryb: "modal" },
  { key: "sztab", ikona: "🧰", nazwa: "Sztab", opis: "Asystenci i specjaliści", grupa: "Zespół", tryb: "modal" },
  { key: "stroje", ikona: "🎽", nazwa: "Stroje", opis: "Barwy i komplety meczowe", grupa: "Zespół", tryb: "inline" },
  { key: "finanse", ikona: "💰", nazwa: "Finanse", opis: "Budżet, wpływy i koszty", grupa: "Klub", tryb: "modal" },
  { key: "sponsorzy", ikona: "🤝", nazwa: "Sponsorzy", opis: "Umowy, patroni i naming", grupa: "Klub", tryb: "inline" },
  { key: "klub", ikona: "🏟", nazwa: "Mój klub", opis: "Stadion, infrastruktura, dane", grupa: "Klub", tryb: "modal" },
  { key: "kariera", ikona: "📈", nazwa: "Kariera trenera", opis: "Historia, trofea i licencja", grupa: "Klub", tryb: "modal" },
  { key: "puchar", ikona: "🏆", nazwa: "Puchar", opis: "Drabinka i wyniki pucharów", grupa: "Rozgrywki", tryb: "inline" },
  { key: "ligi", ikona: "🌍", nazwa: "Wszystkie ligi", opis: "Każda liga, klub i zawodnik", grupa: "Rozgrywki", tryb: "modal" },
];
const GRUPY = ["Zespół", "Klub", "Rozgrywki"];

export function Wiecej({ s, odswiez }: { s: StanGry; odswiez: () => void }) {
  const [otw, setOtw] = useState<string | null>(null);
  const [oknoZapisu, setOknoZapisu] = useState(false);
  const zamknij = () => setOtw(null);

  // Ekran pełnoekranowy dla widoków typu „inline" (Sponsorzy, Stroje, Puchar) z paskiem powrotu.
  const inlineOtwarte = otw && WPISY.find((w) => w.key === otw)?.tryb === "inline" ? otw : null;
  if (inlineOtwarte) {
    const wpis = WPISY.find((w) => w.key === inlineOtwarte)!;
    return (
      <View style={st.ekran}>
        <PasekPowrotu tytul={wpis.nazwa} ikona={wpis.ikona} onBack={zamknij} />
        <View style={{ flex: 1 }}>
          {inlineOtwarte === "sponsorzy" && <Sponsorzy s={s} odswiez={odswiez} />}
          {inlineOtwarte === "stroje" && <Stroje s={s} klub={s.kluby[s.mojKlub]} />}
          {inlineOtwarte === "puchar" && <PucharEkran s={s} />}
        </View>
      </View>
    );
  }

  const klub = s.kluby[s.mojKlub];
  return (
    <View style={st.ekran}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 12, paddingTop: 14, paddingBottom: 2 }}>
          <Text style={st.tytul}>Centrum klubu</Text>
          <Text style={[st.maly, { marginTop: 3 }]}>{klub.nazwa} — wszystkie działy w jednym miejscu.</Text>
        </View>
        {Platform.OS === "web" && <UstawieniaGrafiki />}
        <Reprezentacja s={s} />
        <View style={{ flexDirection: "row", gap: 8, marginHorizontal: 12, marginTop: 10 }}>
          <Pressable
            onPress={async () => {
              try { const m = await zapiszSlot(s); const t = `⚡ Zapisano: ${m.nazwa} · sezon ${m.sezon}`; if (Platform.OS === "web") window.alert(t); }
              catch (e) { if (Platform.OS === "web") window.alert(e instanceof Error ? e.message : "Nie udało się zapisać."); }
            }}
            style={({ pressed }) => [{ flex: 1, backgroundColor: K.akcent2, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.9 : 1, ...cien }]}
          >
            <Text style={{ color: "#0c2a18", fontSize: 15, fontWeight: "900", fontFamily: CZCIONKA }}>⚡ Szybki zapis</Text>
            <Text style={{ color: "#0c2a18", fontSize: 10.5, fontFamily: CZCIONKA }}>{s.slotId ? "nadpisuje zapis tej kariery" : "tworzy zapis tej kariery"}</Text>
          </Pressable>
          <Pressable
            onPress={() => setOknoZapisu(true)}
            style={({ pressed }) => [{ flex: 1, backgroundColor: K.akcent, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.9 : 1, ...cien }]}
          >
            <Text style={{ color: "#15300c", fontSize: 15, fontWeight: "900", fontFamily: CZCIONKA }}>💾 Zapisz jako…</Text>
            <Text style={{ color: "#15300c", fontSize: 10.5, fontFamily: CZCIONKA }}>wybierz slot / nowy / plik</Text>
          </Pressable>
        </View>
        <ZapiszGre s={s} otwarte={oknoZapisu} onClose={() => setOknoZapisu(false)} />
        {GRUPY.map((grupa) => (
          <View key={grupa} style={{ marginTop: 14 }}>
            <Text style={[st.naglowek, { marginHorizontal: 16, marginBottom: 8 }]}>{grupa}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 8 }}>
              {WPISY.filter((w) => w.grupa === grupa).map((w) => (
                <View key={w.key} style={{ width: "50%", padding: 4 }}>
                  <Pressable
                    onPress={() => setOtw(w.key)}
                    style={({ pressed }) => [{
                      backgroundColor: K.karta, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: K.linia,
                      opacity: pressed ? 0.85 : 1, minHeight: 112, ...cien,
                    }]}
                  >
                    <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: K.karta2, borderWidth: 1, borderColor: K.liniaMocna, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                      <Text style={{ fontSize: 22 }}>{w.ikona}</Text>
                    </View>
                    <Text style={{ color: K.tekst, fontSize: 15.5, fontWeight: "800", fontFamily: CZCIONKA }}>{w.nazwa}</Text>
                    <Text style={{ color: K.szary, fontSize: 12, marginTop: 2, fontFamily: CZCIONKA }}>{w.opis}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
        <Text style={{ color: K.szary, fontSize: 11, textAlign: "center", marginTop: 20, opacity: 0.7, fontFamily: CZCIONKA }}>
          Menedżer Piłkarski · wersja beta
        </Text>
      </ScrollView>

      {/* Widoki typu „modal" renderują własne okno sterowane widocznością. */}
      <Finanse s={s} widoczny={otw === "finanse"} onClose={zamknij} />
      <Sztab s={s} widoczny={otw === "sztab"} onClose={zamknij} odswiez={odswiez} />
      <Trening s={s} widoczny={otw === "trening"} onClose={zamknij} odswiez={odswiez} />
      <Akademia s={s} widoczny={otw === "akademia"} onClose={zamknij} odswiez={odswiez} />
      <KarieraTrenera s={s} widoczny={otw === "kariera"} onClose={zamknij} odswiez={odswiez} />
      <WidokKlubu s={s} klubId={otw === "klub" ? s.mojKlub : null} onClose={zamknij} odswiez={odswiez} />
      <PrzegladLig s={s} widoczny={otw === "ligi"} onClose={zamknij} odswiez={odswiez} />
    </View>
  );
}

function PasekPowrotu({ tytul, ikona, onBack }: { tytul: string; ikona: string; onBack: () => void }) {
  return (
    <View style={[st.wiersz, { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: K.pas, borderBottomWidth: 1, borderBottomColor: K.liniaMocna }]}>
      <Pressable onPress={onBack} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: K.karta2, borderWidth: 1, borderColor: K.linia, opacity: pressed ? 0.8 : 1 }]}>
        <Text style={{ color: K.akcent, fontSize: 16, fontWeight: "900", marginRight: 4, fontFamily: CZCIONKA }}>‹</Text>
        <Text style={{ color: K.tekst, fontSize: 13, fontWeight: "700", fontFamily: CZCIONKA }}>Wstecz</Text>
      </Pressable>
      <Text style={{ color: K.tekst, fontSize: 16, fontWeight: "800", marginLeft: 12, fontFamily: CZCIONKA }}>{ikona} {tytul}</Text>
    </View>
  );
}

/** Ustawienia grafiki: 3D (stadion, menu, mecz) i tryb lekki dla słabszych telefonów. */
function UstawieniaGrafiki() {
  const ls = typeof window !== "undefined" ? window.localStorage : undefined;
  const [g3d, setG3d] = useState(ls?.getItem("dz_3d") !== "0");
  const [lekka, setLekka] = useState(ls?.getItem("dz_lekka") === "1");
  const Prz = ({ t, opis, on, v }: { t: string; opis: string; on: () => void; v: boolean }) => (
    <Pressable onPress={on} style={[st.wiersz, { paddingVertical: 8, borderTopWidth: 1, borderTopColor: K.linia }]}>
      <View style={{ flex: 1 }}><Text style={st.tekst}>{t}</Text><Text style={st.maly}>{opis}</Text></View>
      <View style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: v ? K.zielony : K.karta2, justifyContent: "center", padding: 3 }}><View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", alignSelf: v ? "flex-end" : "flex-start" }} /></View>
    </Pressable>
  );
  return (
    <View style={[st.karta, { marginTop: 10 }]}>
      <Text style={st.naglowek}>🎨 Grafika</Text>
      <Prz t="Grafika 3D" opis="Stadion 3D w menu i w zakładce klubu, mecz na żywo w 3D." v={g3d} on={() => { const n = !g3d; ls?.setItem("dz_3d", n ? "1" : "0"); setG3d(n); }} />
      <Text style={[st.maly, { marginTop: 8 }]}>🗣 Polskie głosy w tym urządzeniu: {liczbaGlosow().M} męskie, {liczbaGlosow().K} damskie{liczbaGlosow().inne ? `, ${liczbaGlosow().inne} inne` : ""}. Mężczyźni mówią męskim głosem, kobiety damskim; każda postać ma własny ton. Więcej głosów (iPhone): Ustawienia → Dostępność → Treść mówiona → Głosy → Polski — pobierz wszystkie, gra użyje ich sama.</Text>
      <Prz t="Lekka grafika" opis="Mniej kibiców i detali, bez poświaty i rozmycia — płynniej na starszych telefonach." v={lekka} on={() => { const n = !lekka; ls?.setItem("dz_lekka", n ? "1" : "0"); setLekka(n); }} />
    </View>
  );
}

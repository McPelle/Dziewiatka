import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, SafeAreaView, Text, View } from "react-native";
import { zl } from "./src/engine/losuj";
import { ileKolejek, mojaLiga } from "./src/engine/sezon";
import type { StanGry } from "./src/engine/types";
import { HerbGry, MurawaTlo, PlakietkaBeta } from "./src/ui/Grafika";
import { Herb } from "./src/ui/Herb";
import { MenuGlowne } from "./src/ui/MenuGlowne";
import { SzybkiMecz } from "./src/ui/SzybkiMecz";
import { Wyzwania } from "./src/ui/Wyzwania";
import { losowaCiekawostka } from "./src/data/ciekawostki";
import { metaMenu } from "./src/ui/zapis";
import { NowaGra } from "./src/ui/NowaGra";
import { Pulpit } from "./src/ui/Pulpit";
import { Sklad } from "./src/ui/Sklad";
import { CZCIONKA, cien, K, st } from "./src/ui/styl";
import { Tabela } from "./src/ui/Tabela";
import { Terminarz } from "./src/ui/Terminarz";
import { Transfery } from "./src/ui/Transfery";
import { WczytajGre } from "./src/ui/WczytajGre";
import { Wiecej } from "./src/ui/Wiecej";
import { usunZapis, wczytaj, zapisz } from "./src/ui/zapis";

type Zakladka = "pulpit" | "sklad" | "tabela" | "mecze" | "transfery" | "wiecej";
type Ekran = "szybki" | "wyzwania" | "menu" | "nowa" | "gra" | "wczytaj";
const ZAKLADKI: [Zakladka, string, string][] = [
  ["pulpit", "🏟", "Klub"],
  ["sklad", "👕", "Skład"],
  ["tabela", "📊", "Tabela"],
  ["mecze", "📅", "Mecze"],
  ["transfery", "🔁", "Transfery"],
  ["wiecej", "⋯", "Więcej"],
];

export default function App() {
  const [stan, setStan] = useState<StanGry | null>(null);
  const [laduje, setLaduje] = useState(true);
  const [, setWersja] = useState(0);
  const [zakladka, setZakladka] = useState<Zakladka>("pulpit");
  const [ekran, setEkran] = useState<Ekran>("menu");
  const [wczytywanie, setWczytywanie] = useState(false);
  const czasZapisu = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [czekaNaZapis, setCzekaNaZapis] = useState(false);
  // zapis wczytuje się w tle — menu jest od razu gotowe do klikania
  useEffect(() => {
    // wczytanie zapisu w tle; gdy pamięć telefonu nie odpowiada — ponowna próba, a menu i tak działa
    let koniec = false;
    const zTimeoutem = () => Promise.race([wczytaj(), new Promise<"czas">((r) => setTimeout(() => r("czas"), 7000))]);
    const t = setTimeout(async () => {
      let w = await zTimeoutem();
      if (w === "czas") w = await zTimeoutem();
      if (koniec) return;
      if (w === "czas") { setLaduje(false); if (Platform.OS === "web") window.alert("Nie udało się wczytać zapisu z pamięci telefonu. Zamknij grę całkiem i otwórz ponownie (zapis nie zniknął)."); return; }
      setStan(w); setLaduje(false);
    }, 30);
    return () => { koniec = true; clearTimeout(t); };
  }, []);

  const odswiez = useCallback(() => {
    setWersja((w) => w + 1);
    if (czasZapisu.current) clearTimeout(czasZapisu.current);
    // autozapis w wolnej chwili (bez przycięć przy klikaniu)
    czasZapisu.current = setTimeout(() => {
      if (!stan) return;
      zapisz(stan); // zwykły zapis po 1,5 s spokoju (requestIdleCallback na iPhonie bywa martwy)
    }, 1500);
  }, [stan]);

  // Krótki ekran wczytywania przy wejściu do gry (jak w grach na PC).
  const wejdzDoGry = () => { setZakladka("pulpit"); setWczytywanie(true); setTimeout(() => { setWczytywanie(false); setEkran("gra"); }, 120); };
  useEffect(() => { if (czekaNaZapis && !laduje) { setCzekaNaZapis(false); if (stan) wejdzDoGry(); } }, [czekaNaZapis, laduje, stan]);

  const doMenu = async (nowa?: boolean) => {
    if (nowa) {
      const ok = Platform.OS === "web" ? window.confirm("Zacząć nową karierę? Obecny zapis zniknie.") : true;
      if (!ok) return;
      await usunZapis(); setStan(null); setEkran("nowa");
    } else setEkran("menu");
  };

  if (laduje && ekran !== "menu") return <View style={[st.ekran, { justifyContent: "center" }]}><ActivityIndicator color={K.akcent} /></View>;
  if (wczytywanie) return <EkranWczytywania />;

  return (
    <SafeAreaView style={st.ekran}>
      <StatusBar style="light" />
      {ekran === "menu" && <MenuGlowne stan={stan} meta={laduje ? metaMenu() : null} czeka={czekaNaZapis} naKontynuuj={() => (laduje ? setCzekaNaZapis(true) : wejdzDoGry())} naNowa={() => setEkran("nowa")} naWczytaj={() => setEkran("wczytaj")} naSzybki={() => setEkran("szybki")} naWyzwania={() => setEkran("wyzwania")} />}
      {ekran === "szybki" && <SzybkiMecz onWstecz={() => setEkran("menu")} />}
      {ekran === "wyzwania" && <Wyzwania ukonczone={stan?.osiagnieciaFlagi} onWstecz={() => setEkran("menu")} onStart={(s) => { setStan(s); zapisz(s); wejdzDoGry(); }} />}
      {ekran === "wczytaj" && <WczytajGre onWczytaj={(s) => { setStan(s); zapisz(s); wejdzDoGry(); }} onWstecz={() => setEkran("menu")} />}
      {ekran === "nowa" && (
        <>
          <HeroStart onWstecz={stan ? () => setEkran("menu") : undefined} />
          <NowaGra onStart={(s) => { setStan(s); zapisz(s); wejdzDoGry(); }} />
        </>
      )}
      {ekran === "gra" && stan && (
        <View style={{ flex: 1 }}>
          <NaglowekKlubu s={stan} onMenu={() => setEkran("menu")} onNowa={() => doMenu(true)} />
          <View style={{ flex: 1 }}>
            {zakladka === "pulpit" && <Pulpit s={stan} odswiez={odswiez} pokazMecz={() => setZakladka("mecze")} />}
            {zakladka === "sklad" && <Sklad s={stan} odswiez={odswiez} />}
            {zakladka === "tabela" && <Tabela s={stan} />}
            {zakladka === "mecze" && <Terminarz s={stan} />}
            {zakladka === "transfery" && <Transfery s={stan} odswiez={odswiez} />}
            {zakladka === "wiecej" && <Wiecej s={stan} odswiez={odswiez} />}
          </View>
          <PasekZakladek zakladka={zakladka} na={setZakladka} />
        </View>
      )}
    </SafeAreaView>
  );
}

function EkranWczytywania() {
  return (
    <View style={{ flex: 1, backgroundColor: K.murawa, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <MurawaTlo pasy={14} mocne />
      <HerbGry rozmiar={104} />
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 30, letterSpacing: 2, marginTop: 14, fontFamily: CZCIONKA }}>DZIEWIĄTKA</Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
        <ActivityIndicator color={K.akcent} />
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginLeft: 10, fontWeight: "700", fontFamily: CZCIONKA }}>Wczytywanie…</Text>
      </View>
      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 18, marginHorizontal: 30, textAlign: "center", fontFamily: CZCIONKA }}>💡 {losowaCiekawostka()}</Text>
    </View>
  );
}

// Pasek marki nad kreatorem nowej gry.
function HeroStart({ onWstecz }: { onWstecz?: () => void }) {
  return (
    <View style={{ backgroundColor: K.murawa, borderBottomWidth: 2, borderBottomColor: K.akcent, paddingTop: Platform.OS === "android" ? 34 : 12, paddingBottom: 14, paddingHorizontal: 14, overflow: "hidden", ...cien }}>
      <MurawaTlo pasy={12} mocne />
      <View style={[st.wiersz, { alignItems: "center" }]}>
        {onWstecz && (
          <Pressable onPress={onWstecz} style={({ pressed }) => [{ paddingHorizontal: 8, paddingVertical: 6, marginRight: 6, opacity: pressed ? 0.7 : 1 }]}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>‹</Text>
          </Pressable>
        )}
        <HerbGry rozmiar={40} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 20, letterSpacing: 0.5, fontFamily: CZCIONKA }}>DZIEWIĄTKA</Text>
          <Text style={{ color: K.akcent, fontSize: 10.5, fontWeight: "800", letterSpacing: 3, textTransform: "uppercase", fontFamily: CZCIONKA }}>Nowa kariera</Text>
        </View>
        <PlakietkaBeta />
      </View>
    </View>
  );
}

function NaglowekKlubu({ s, onMenu, onNowa }: { s: StanGry; onMenu: () => void; onNowa: () => void }) {
  const klub = s.kluby[s.mojKlub];
  const liga = mojaLiga(s);
  const ile = ileKolejek(s);
  const kol = Math.min(ile, (s.kolejka ?? 0) + 1);
  return (
    <View style={[st.wiersz, { paddingHorizontal: 12, paddingTop: Platform.OS === "android" ? 32 : 8, paddingBottom: 10, backgroundColor: K.murawa, borderBottomWidth: 2, borderBottomColor: K.akcent, overflow: "hidden", ...cien }]}>
      <MurawaTlo pasy={14} />
      <Pressable onPress={onMenu} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", marginRight: 8, opacity: pressed ? 0.8 : 1 }]}>
        <Text style={{ color: K.akcent, fontSize: 16, fontWeight: "900", marginRight: 2 }}>‹</Text>
        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800", fontFamily: CZCIONKA }}>Menu</Text>
      </Pressable>
      <View style={{ borderRadius: 11, borderWidth: 1.5, borderColor: "rgba(255,206,71,0.5)", padding: 2, backgroundColor: "rgba(0,0,0,0.18)" }}>
        <Herb klub={klub} rozmiar={30} />
      </View>
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text numberOfLines={1} style={{ color: "#fff", fontWeight: "900", fontSize: 16, letterSpacing: 0.2, fontFamily: CZCIONKA }}>{klub.nazwa}</Text>
        <Text numberOfLines={1} style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: "700", marginTop: 1, fontFamily: CZCIONKA }}>{liga?.nazwa ?? "Liga"} · kolejka {kol}/{ile} · sezon {s.sezon}</Text>
      </View>
      <View style={{ alignItems: "flex-end", marginRight: 10 }}>
        <Text style={{ color: K.akcent, fontSize: 14, fontWeight: "900", fontFamily: CZCIONKA }}>{zl(klub.kasa)}</Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 9.5, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", fontFamily: CZCIONKA }}>Budżet</Text>
      </View>
      <Pressable onPress={onNowa} style={({ pressed }) => [{ backgroundColor: "rgba(0,0,0,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", borderRadius: 14, paddingHorizontal: 11, paddingVertical: 6, opacity: pressed ? 0.8 : 1 }]}>
        <Text style={{ color: "#fff", fontSize: 11.5, fontWeight: "800", fontFamily: CZCIONKA }}>Nowa</Text>
      </Pressable>
    </View>
  );
}

function PasekZakladek({ zakladka, na }: { zakladka: Zakladka; na: (z: Zakladka) => void }) {
  return (
    <View style={[st.wiersz, { borderTopWidth: 1, borderTopColor: K.liniaMocna, backgroundColor: K.pas, paddingTop: 0, paddingBottom: Platform.OS === "ios" ? 2 : 8, paddingHorizontal: 4 }]}>
      {ZAKLADKI.map(([id, ikona, nazwa]) => {
        const akt = zakladka === id;
        return (
          <Pressable key={id} onPress={() => na(id)} style={{ flex: 1, alignItems: "center" }}>
            <View style={{ height: 3, alignSelf: "stretch", marginHorizontal: 10, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: akt ? K.akcent : "transparent" }} />
            <View style={{ alignItems: "center", paddingTop: 6, paddingBottom: 4, paddingHorizontal: 4, borderRadius: 14, minWidth: 46 }}>
              <Text style={{ fontSize: 19, opacity: akt ? 1 : 0.5, marginBottom: 2 }}>{ikona}</Text>
              <Text style={{ color: akt ? K.akcent : K.szary, fontSize: 10, fontWeight: akt ? "800" : "600", letterSpacing: 0.1, fontFamily: CZCIONKA }}>{nazwa}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

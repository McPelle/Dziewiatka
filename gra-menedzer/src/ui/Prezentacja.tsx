// Prezentacja nowego zawodnika: koszulka z numerem i nazwiskiem, pierwsze słowa (cudzoziemiec — w swoim języku z tłumaczeniem),
// reakcja kibiców. Pokazywana automatycznie dla każdego nowego zawodnika w kadrze.
import { Modal, Pressable, Text, View } from "react-native";
import { jezykZawodnika, NAZWA_JEZYKA, wypowiedz } from "../engine/jezyki";
import type { StanGry } from "../engine/types";
import { kity } from "./strojeDane";
import { Twarz } from "./Twarz";
import { Herb } from "./Herb";
import { mow } from "./three/glos";
import { CZCIONKA, K, st } from "./styl";

/** Nowi zawodnicy w kadrze (od ostatniego sprawdzenia). Pierwsze wywołanie zapamiętuje obecną kadrę bez prezentacji. */
export function nowiWKlubie(s: StanGry): string[] {
  const kadra = s.kluby[s.mojKlub]?.zawodnicy ?? [];
  if (!s.znaniZawodnicy) { s.znaniZawodnicy = [...kadra]; return []; }
  const znani = new Set(s.znaniZawodnicy);
  const nowi = kadra.filter((id) => !znani.has(id) && s.zawodnicy[id]).sort((a, b) => s.zawodnicy[b].umiej - s.zawodnicy[a].umiej);
  if (nowi.length > 3) { s.znaniZawodnicy = [...s.znaniZawodnicy, ...nowi.slice(3)]; return nowi.slice(0, 3); } // przy masowych zmianach — prezentujemy 3 najlepszych
  return nowi;
}

export function Prezentacja({ s, id, onClose }: { s: StanGry; id: string; onClose: () => void }) {
  const z = s.zawodnicy[id]; const k = s.kluby[s.mojKlub];
  if (!z) return null;
  const kit = kity(k).pole[0];
  const PL = z.wiek <= 20 ? "Dla takiego chłopaka jak ja to spełnienie marzeń. Dam z siebie wszystko!" : "Cieszę się, że tu jestem. Chcę pomóc drużynie i walczyć o zwycięstwa.";
  const w = wypowiedz(s, z, PL, { kat: "gotowy" });
  const kibice = z.umiej >= 60 ? "Kibice szaleją w mediach społecznościowych — wielki transfer!" : z.wiek <= 20 ? "Kibice ciekawi młodego zawodnika — „dajmy mu czas”." : "Kibice przyjmują wzmocnienie spokojnie, czekają na pierwsze mecze.";
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", padding: 20 }}>
        <View style={[st.karta, { marginHorizontal: 0, borderColor: K.akcent, borderWidth: 1, alignItems: "center" }]}>
          <Text style={{ color: K.akcent, fontWeight: "900", letterSpacing: 1, fontFamily: CZCIONKA }}>OFICJALNIE · NOWY ZAWODNIK</Text>
          <View style={[st.wiersz, { gap: 14, marginVertical: 10, alignItems: "center" }]}>
            <Herb klub={k} rozmiar={46} />
            <Twarz seed={z.imie + z.nazwisko} rozmiar={70} zdjecie={z.zdjecie} cechy={z.twarz} kraj={z.kraj} jersey={kit.baza} />
            {/* koszulka z numerem i nazwiskiem */}
            <View style={{ width: 78, height: 84, backgroundColor: kit.baza, borderRadius: 10, borderWidth: 3, borderColor: kit.dodatek, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: kit.dodatek, fontWeight: "900", fontSize: 11 }}>{z.nazwisko.toUpperCase().slice(0, 10)}</Text>
              <Text style={{ color: kit.dodatek, fontWeight: "900", fontSize: 32 }}>{z.numer || "?"}</Text>
            </View>
          </View>
          <Text style={[st.tytul, { textAlign: "center" }]}>{z.imie} {z.nazwisko}</Text>
          <Text style={st.maly}>{z.poz} · {z.wiek} lat · {z.kraj ?? "Polska"} · OVR {Math.floor(z.umiej)}</Text>
          <View style={[st.karta, { marginHorizontal: 0, marginTop: 10, alignSelf: "stretch" }]}>
            <Text style={st.tekst}>„{w.tekst}”</Text>
            {w.tlumaczenie && <Text style={[st.maly, { fontStyle: "italic", marginTop: 3 }]}>↳ {w.tlumaczNazwa ? `tłumaczy ${w.tlumaczNazwa}` : NAZWA_JEZYKA[jezykZawodnika(z)]}: „{w.tlumaczenie}”</Text>}
          </View>
          <Text style={[st.maly, { marginTop: 6, textAlign: "center" }]}>📣 {kibice}</Text>
          <Pressable style={[st.przycisk, { alignSelf: "stretch" }]} onPress={() => { mow(w.tekst, "zawodnik", { kto: z.imie + z.nazwisko, plec: "M", jezyk: w.glos }); }}><Text style={st.przyciskTekst}>🔊 Posłuchaj</Text></Pressable>
          <Pressable style={[st.przycisk, { alignSelf: "stretch", backgroundColor: "transparent", borderWidth: 1, borderColor: K.linia }]} onPress={onClose}><Text style={[st.przyciskTekst, { color: K.tekst }]}>Witamy w drużynie!</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

// Prezentacja nowego zawodnika: koszulka z numerem i nazwiskiem, pierwsze słowa (cudzoziemiec — w swoim języku z tłumaczeniem),
// reakcja kibiców. Pokazywana automatycznie dla każdego nowego zawodnika w kadrze.
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { prezesKlubu, scenariuszPrezentacji } from "../engine/prezentacja";
import { Prezentacja3D } from "./three/Prezentacja3D";
import { grafika3D } from "./three/Stadion3DWidok";
import type { StanGry } from "../engine/types";
import { kity } from "./strojeDane";
import { Twarz } from "./Twarz";
import { Herb } from "./Herb";
import { mow, zamilknij } from "./three/glos";
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
  const [linie] = useState(() => (z ? scenariuszPrezentacji(s, z) : []));
  const [nr, setNr] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    const l = linie[nr]; if (!l || !z) return;
    if (l.kto !== "narrator") mow(l.tekst.replace(/^\(?[^:)]*[:)]\s*/, l.kto === "tlumacz" ? "" : "$&"), l.kto === "zawodnik" ? "zawodnik" : l.kto === "dziennikarz" ? "dziennikarz" : l.kto === "kibic" ? "spiker" : "trener", { kto: l.kto === "zawodnik" ? z.imie + z.nazwisko : l.kto === "prezes" ? prezesKlubu(k) : l.kto === "trener" ? s.trener : l.kto, plec: l.kto === "tlumacz" ? "K" : "M", jezyk: l.glos, przerwij: true });
    if (!auto) return;
    const t = setTimeout(() => setNr((v) => Math.min(linie.length, v + 1)), Math.min(7000, 1800 + l.tekst.length * 45));
    return () => clearTimeout(t);
  }, [nr, auto]);
  useEffect(() => () => zamilknij(), []);
  if (!z) return null;
  const kit = kity(k).pole[0];
  const kto = (x: string) => x === "prezes" ? `Prezes ${prezesKlubu(k)}` : x === "trener" ? `Trener ${s.trener ?? ""}` : x === "zawodnik" ? `${z.imie} ${z.nazwisko}` : x === "tlumacz" ? "Tłumacz" : x === "dziennikarz" ? "Dziennikarz" : x === "kibic" ? "Kibice" : "";
  const widoczne = linie.slice(0, nr + 1).slice(-4);
  const akt = linie[Math.min(nr, linie.length - 1)];
  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <ScrollView style={{ flex: 1, backgroundColor: K.tlo }} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <Text style={{ color: K.akcent, fontWeight: "900", letterSpacing: 1, fontFamily: CZCIONKA }}>OFICJALNIE · PREZENTACJA NOWEGO ZAWODNIKA</Text>
        <View style={[st.wiersz, { gap: 10, marginVertical: 8, alignItems: "center" }]}>
          <Herb klub={k} rozmiar={36} />
          <View style={{ flex: 1 }}><Text style={st.tytul}>{z.imie} {z.nazwisko}</Text><Text style={st.maly}>{z.poz} · {z.wiek} lat · {z.kraj ?? "Polska"} · OVR {Math.floor(z.umiej)} · nr {z.numer || "?"}</Text></View>
          <View style={{ width: 44, height: 48, backgroundColor: kit.baza, borderRadius: 6, borderWidth: 2, borderColor: kit.dodatek, alignItems: "center", justifyContent: "center" }}><Text style={{ color: kit.dodatek, fontWeight: "900", fontSize: 18 }}>{z.numer || "?"}</Text></View>
        </View>
        {Platform.OS === "web" && grafika3D() ? <Prezentacja3D s={s} klub={k} z={z} mowi={akt && nr < linie.length ? (akt.kto === "tlumacz" ? "zawodnik" : akt.kto) : null} akcja={akt?.akcja} />
          : <Twarz seed={z.imie + z.nazwisko} rozmiar={70} zdjecie={z.zdjecie} cechy={z.twarz} kraj={z.kraj} jersey={kit.baza} />}
        <View style={[st.karta, { marginHorizontal: 0, marginTop: 10 }]}>
          {widoczne.map((l, i) => (
            <View key={i} style={{ marginVertical: 3, opacity: i === widoczne.length - 1 ? 1 : 0.6 }}>
              {l.kto === "narrator" ? <Text style={[st.maly, { fontStyle: "italic", color: K.tekst }]}>{l.tekst}</Text>
                : <Text style={st.tekst}><Text style={{ color: l.kto === "zawodnik" ? K.akcent : l.kto === "prezes" ? K.niebieski : K.zielony, fontWeight: "800" }}>{kto(l.kto)}: </Text>„{l.tekst}”</Text>}
              {l.tlumaczenie && <Text style={[st.maly, { fontStyle: "italic" }]}>↳ „{l.tlumaczenie}”</Text>}
            </View>))}
        </View>
        <View style={[st.wiersz, { gap: 8 }]}>
          <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center" }]} onPress={() => setAuto(!auto)}><Text style={st.przyciskMalyTekst}>{auto ? "⏸ Pauza" : "▶ Dalej samo"}</Text></Pressable>
          <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center" }]} onPress={() => setNr(Math.min(linie.length, nr + 1))}><Text style={st.przyciskMalyTekst}>⏭ Następna kwestia</Text></Pressable>
        </View>
        <Pressable style={st.przycisk} onPress={() => { zamilknij(); onClose(); }}><Text style={st.przyciskTekst}>{nr >= linie.length - 1 ? "Witamy w drużynie!" : "Pomiń prezentację"}</Text></Pressable>
      </ScrollView>
    </Modal>
  );
}

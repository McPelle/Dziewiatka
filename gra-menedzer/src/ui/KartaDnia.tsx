import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { fmtData } from "../engine/dzien";
import { rywaleSparingowi, zaplanujSparing } from "../engine/okres";
import { FOKUSY, INTENSYWNOSCI, KATALOG, opisAkt, planNa, powielTygodniowo, zaplanuj, type Aktywnosc, type RodzajAkt } from "../engine/planDnia";
import type { Intensywnosc, StanGry, Trening } from "../engine/types";
import { CZCIONKA, K, st } from "./styl";

/** Karta dnia (jak w Football Managerze): co się dzieje danego dnia i planowanie zajęć drużyny. */
export function KartaDnia({ s, data, wydarzenia, dzis, zablokowany, onClose, odswiez }: {
  s: StanGry; data: Date | null; wydarzenia: { ikona: string; tekst: string; kolor?: string }[]; dzis: Date; zablokowany?: string | null; onClose: () => void; odswiez: () => void;
}) {
  const [rodzaj, setRodzaj] = useState<RodzajAkt | null>(null);
  const [fokus, setFokus] = useState<Trening>("ogolny");
  const [intens, setIntens] = useState<Intensywnosc>("normalny");
  const [kom, setKom] = useState<string | null>(null);
  if (!data) return null;
  const plan = planNa(s, data);
  const przeszly = data < new Date(dzis.getFullYear(), dzis.getMonth(), dzis.getDate());
  const idxOkresu = s.okres ? Math.round((new Date(data.getFullYear(), data.getMonth(), data.getDate()).getTime() - new Date(new Date(s.okres.start).setHours(0, 0, 0, 0)).getTime()) / 864e5) : -1;
  const wOkresie = !!s.okres && idxOkresu >= 0 && idxOkresu < s.okres.dniUrlopu + s.okres.dniPrzygotowan;
  const ustaw = (a: Aktywnosc | null) => {
    if (a?.rodzaj === "sparing" && wOkresie) {
      const r = rywaleSparingowi(s)[0]; const b = r ? zaplanujSparing(s, r.nazwa, r.typ, idxOkresu) : "Brak rywala na sparing.";
      setKom(b ?? `Zaplanowano sparing: ${r!.nazwa} (wynik w raporcie dnia).`); setRodzaj(null); odswiez(); return;
    } const b = zaplanuj(s, data, a, dzis); setKom(b ?? (a ? `Zaplanowano: ${opisAkt(a)}` : "Plan usunięty — dzień wg domyślnego rozkładu.")); setRodzaj(null); odswiez(); };
  const DZ = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
  return (
    <Modal visible={!!data} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "90%" }]}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
            <Text style={{ color: K.akcent, fontWeight: "900", fontSize: 12, letterSpacing: 0.6, fontFamily: CZCIONKA }}>{DZ[data.getDay()].toUpperCase()}</Text>
            <Text style={[st.tytul, { fontSize: 20 }]}>📅 {fmtData(data)}</Text>
            <View style={[st.karta, { marginHorizontal: 0, marginTop: 10 }]}>
              <Text style={st.naglowek}>W tym dniu</Text>
              {wydarzenia.length ? wydarzenia.map((w, i) => <Text key={i} style={[st.tekst, { fontSize: 13.5, marginVertical: 2, color: w.kolor ?? K.tekst }]}>{w.ikona} {w.tekst}</Text>) : <Text style={st.maly}>Brak meczów i wydarzeń.</Text>}
              {plan && <Text style={[st.tekst, { fontSize: 13.5, marginTop: 4, color: K.akcent, fontWeight: "800" }]}>📝 Plan: {opisAkt(plan)}</Text>}
            </View>
            {przeszly ? <Text style={st.maly}>Ten dzień już minął.</Text> : zablokowany ? <Text style={[st.maly, { color: K.akcent }]}>🔒 {zablokowany}</Text> : (
              <>
                <Text style={[st.naglowek, { marginTop: 6 }]}>Zaplanuj dzień</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {(Object.keys(KATALOG) as RodzajAkt[]).map((r) => (
                    <Pressable key={r} onPress={() => setRodzaj(r)} style={[st.chip, { marginBottom: 0 }, rodzaj === r && st.chipAktywny]}>
                      <Text style={{ color: rodzaj === r ? "#17310f" : K.tekst, fontSize: 12.5, fontWeight: "700" }}>{KATALOG[r].ikona} {KATALOG[r].nazwa}</Text>
                    </Pressable>))}
                </View>
                {rodzaj && (
                  <View style={[st.karta, { marginHorizontal: 0, marginTop: 10 }]}>
                    <Text style={[st.tekst, { fontWeight: "800" }]}>{KATALOG[rodzaj].ikona} {KATALOG[rodzaj].nazwa}</Text>
                    <Text style={st.maly}>{KATALOG[rodzaj].opis}{KATALOG[rodzaj].koszt ? ` Koszt: ${KATALOG[rodzaj].koszt!(s).toLocaleString("pl")} zł.` : ""}</Text>
                    {rodzaj === "trening" && (<>
                      <Text style={[st.naglowek, { marginTop: 8 }]}>Temat</Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>{FOKUSY.map(([f, n]) => <Pressable key={f} onPress={() => setFokus(f)} style={[st.chip, { marginBottom: 0, paddingVertical: 5 }, fokus === f && st.chipAktywny]}><Text style={{ color: fokus === f ? "#17310f" : K.tekst, fontSize: 12 }}>{n}</Text></Pressable>)}</View>
                      <Text style={[st.naglowek, { marginTop: 8 }]}>Intensywność</Text>
                      <View style={{ flexDirection: "row", gap: 5 }}>{INTENSYWNOSCI.map(([i, n]) => <Pressable key={i} onPress={() => setIntens(i)} style={[st.chip, { marginBottom: 0 }, intens === i && st.chipAktywny]}><Text style={{ color: intens === i ? "#17310f" : K.tekst, fontSize: 12 }}>{n}</Text></Pressable>)}</View>
                    </>)}
                    <Pressable style={[st.przycisk, { marginHorizontal: 0 }]} onPress={() => ustaw(rodzaj === "trening" ? { rodzaj, fokus, intens } : rodzaj === "sparing" ? { rodzaj, rywal: rywaleSparingowi(s)[0]?.nazwa } : { rodzaj })}>
                      <Text style={st.przyciskTekst}>✔ Zaplanuj</Text>
                    </Pressable>
                  </View>
                )}
                {plan && (
                  <View style={[st.wiersz, { gap: 8, marginTop: 10, flexWrap: "wrap" }]}>
                    <Pressable style={st.przyciskMaly} onPress={() => { const n = powielTygodniowo(s, data, 8); setKom(`Powtórzono w ${n} kolejnych tygodniach (ten sam dzień tygodnia).`); odswiez(); }}><Text style={st.przyciskMalyTekst}>🔁 Powtarzaj co tydzień (8 tyg.)</Text></Pressable>
                    <Pressable style={[st.przyciskMaly, { borderColor: K.czerwony }]} onPress={() => ustaw(null)}><Text style={[st.przyciskMalyTekst, { color: K.czerwony }]}>Usuń plan</Text></Pressable>
                  </View>
                )}
              </>
            )}
            {kom && <Text style={[st.maly, { color: K.akcent, marginTop: 8 }]}>{kom}</Text>}
            <Pressable style={st.przycisk} onPress={() => { setKom(null); setRodzaj(null); onClose(); }}><Text style={st.przyciskTekst}>Zamknij</Text></Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { OpcjaRozmowy, TematRozmowy, tematyRozmowy, zastosujRozmowe } from "../engine/rozmowy";
import type { StanGry, Zawodnik } from "../engine/types";
import { Twarz } from "./Twarz";
import { K, st } from "./styl";

export function Rozmowa({ s, z, widoczny, onClose, odswiez }: { s: StanGry; z: Zawodnik | undefined; widoczny: boolean; onClose: () => void; odswiez: () => void }) {
  const [temat, setTemat] = useState<TematRozmowy | null>(null);
  const [reakcja, setReakcja] = useState<string | null>(null);

  useEffect(() => { if (!widoczny) { setTemat(null); setReakcja(null); } }, [widoczny]);

  if (!z) return null;
  const tematy = tematyRozmowy(s, z);

  const wybierzOpcje = (o: OpcjaRozmowy) => { zastosujRozmowe(z, o); setReakcja(o.reakcja); odswiez(); };

  const Dymek = ({ tekst, trenera }: { tekst: string; trenera?: boolean }) => (
    <View style={[st.wiersz, { gap: 8, marginTop: 8, flexDirection: trenera ? "row-reverse" : "row" }]}>
      {trenera ? <Twarz seed={s.trener} rozmiar={32} zdjecie={s.trenerZdjecie} jersey="#2b2f45" /> : <Twarz seed={z.imie + z.nazwisko} rozmiar={32} zdjecie={z.zdjecie} cechy={z.twarz} />}
      <View style={{ flex: 1, backgroundColor: trenera ? K.karta2 : "rgba(90,169,255,0.14)", borderRadius: 12, padding: 10, maxWidth: "85%" }}>
        <Text style={st.tekst}>{tekst}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={widoczny} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: K.tlo, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: "88%", paddingBottom: 20 }}>
          <ScrollView contentContainerStyle={{ padding: 18 }}>
            <View style={[st.wiersz, { gap: 12 }]}>
              <Twarz seed={z.imie + z.nazwisko} rozmiar={44} zdjecie={z.zdjecie} cechy={z.twarz} />
              <View style={{ flex: 1 }}>
                <Text style={st.tytul}>Rozmowa: {z.imie} {z.nazwisko}</Text>
                <Text style={st.maly}>morale {Math.round(z.morale)}%{z.prosiOTransfer ? " · chce odejść" : ""}</Text>
              </View>
            </View>

            {!temat ? (
              <View style={{ marginTop: 14 }}>
                <Text style={st.naglowek}>O czym porozmawiacie?</Text>
                {tematy.map((t) => (
                  <Pressable key={t.id} style={[st.przyciskMaly, { marginTop: 8, alignItems: "flex-start" }]} onPress={() => { setTemat(t); setReakcja(null); }}>
                    <Text style={st.przyciskMalyTekst}>💬 {t.etykieta}</Text>
                  </Pressable>
                ))}
                {tematy.length === 0 && <Text style={st.maly}>Brak tematów do omówienia w tej chwili.</Text>}
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                <Dymek tekst={temat.kwestia} />
                {reakcja ? (
                  <>
                    <Dymek tekst={reakcja} />
                    <View style={[st.wiersz, { gap: 10, marginTop: 14 }]}>
                      <Pressable style={[st.przyciskMaly, { flex: 1, alignItems: "center", borderColor: K.niebieski }]} onPress={() => { setTemat(null); setReakcja(null); }}>
                        <Text style={[st.przyciskMalyTekst, { color: K.niebieski }]}>← Inny temat</Text>
                      </Pressable>
                      <Pressable style={[st.przycisk, { flex: 1, marginHorizontal: 0, marginTop: 0 }]} onPress={onClose}>
                        <Text style={st.przyciskTekst}>Zakończ</Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[st.maly, { marginBottom: 2 }]}>Twoja odpowiedź:</Text>
                    {temat.opcje.map((o, i) => (
                      <Pressable key={i} style={[st.karta, { marginHorizontal: 0, marginTop: 8 }]} onPress={() => wybierzOpcje(o)}>
                        <Text style={[st.tekst, { fontSize: 15 }]}>{o.tekst}</Text>
                        <Text style={[st.maly, { marginTop: 4, color: o.morale > 0 ? K.zielony : o.morale < 0 ? K.czerwony : K.szary }]}>
                          morale {o.morale > 0 ? "+" : ""}{o.morale}{o.zostaje ? " · może zostać" : ""}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

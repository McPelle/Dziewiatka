import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { jestDerby, jestPrzyjazn } from "../engine/derby";
import { scoutRywala } from "../engine/sezon";
import type { StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { K, KOLOR_POZ, st } from "./styl";

const KOLOR_FORMY: Record<string, string> = { Z: "#36d989", R: "#ffce47", P: "#ff6470" };

function Info({ etyk, wart, kolor }: { etyk: string; wart: string; kolor?: string }) {
  return (
    <View style={[st.wiersz, { justifyContent: "space-between", paddingVertical: 5, borderTopWidth: 1, borderTopColor: K.linia }]}>
      <Text style={st.maly}>{etyk}</Text>
      <Text style={[st.tekst, { fontSize: 14, fontWeight: "700", color: kolor ?? K.tekst, flexShrink: 1, textAlign: "right", marginLeft: 10 }]}>{wart}</Text>
    </View>
  );
}

export function Scouting({ s, rywalId, onClose }: { s: StanGry; rywalId: string | null; onClose: () => void }) {
  const d = rywalId ? scoutRywala(s, rywalId) : null;
  const derby = rywalId ? jestDerby(s, s.mojKlub, rywalId) : null;
  const przyjazn = rywalId ? jestPrzyjazn(s, s.mojKlub, rywalId) : null;
  const kolorOceny = d ? (d.ocena.includes("silniejszy") ? K.czerwony : d.ocena.includes("słabszy") ? K.zielony : K.akcent) : K.tekst;

  return (
    <Modal visible={!!rywalId} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "92%", paddingBottom: 20 }]}>
          {d && rywalId && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <View style={[st.wiersz, { gap: 14 }]}>
                <Herb klub={s.kluby[rywalId]} rozmiar={50} />
                <View style={{ flex: 1 }}>
                  <Text style={st.tytul}>🔍 {d.nazwa}</Text>
                  <Text style={st.maly}>{d.pozycja}. miejsce z {d.liczba} · {d.pkt} pkt po {d.m} meczach</Text>
                </View>
              </View>

              {(derby || przyjazn) && (
                <View style={{ marginTop: 10, alignSelf: "flex-start", backgroundColor: derby ? "rgba(255,100,112,0.16)" : "rgba(54,217,137,0.16)", borderWidth: 1, borderColor: derby ? K.czerwony : K.zielony, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: derby ? K.czerwony : K.zielony, fontWeight: "800", fontSize: 12 }}>{derby ? `⚔ ${derby}` : `🤝 ${przyjazn}`}</Text>
                </View>
              )}

              <View style={{ marginTop: 14 }}>
                <Info etyk="Ocena rywala" wart={d.ocena} kolor={kolorOceny} />
                <Info etyk="Siła (rywal / Ty)" wart={`${d.sila.toFixed(0)} / ${d.mojaSila.toFixed(0)}`} />
                <Info etyk="Bramki" wart={`${d.bz} : ${d.bs}`} />
                <Info etyk="Typowa formacja" wart={d.formacja} />
              </View>

              <Text style={[st.naglowek, { marginTop: 16 }]}>Forma (ostatnie mecze)</Text>
              {d.forma.length === 0 ? (
                <Text style={st.maly}>Brak rozegranych meczów.</Text>
              ) : (
                <View style={[st.wiersz, { gap: 6 }]}>
                  {d.forma.map((f, i) => (
                    <View key={i} style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: KOLOR_FORMY[f] ?? K.karta2, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#10231a", fontWeight: "900" }}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}

              <Text style={[st.naglowek, { marginTop: 16 }]}>Kogo pilnować</Text>
              {d.gwiazda && (
                <View style={[st.wiersz, { paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia }]}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>⭐</Text>
                  <Text style={{ color: KOLOR_POZ[d.gwiazda.poz], width: 36, fontWeight: "700", fontSize: 12 }}>{d.gwiazda.poz}</Text>
                  <Text style={[st.tekst, { flex: 1, fontSize: 14 }]} numberOfLines={1}>{d.gwiazda.imie} {d.gwiazda.nazwisko} <Text style={st.maly}>(gwiazda)</Text></Text>
                  <Text style={{ color: K.tekst, fontWeight: "800" }}>{Math.floor(d.gwiazda.umiej)}</Text>
                </View>
              )}
              {d.strzelec && d.strzelec.id !== d.gwiazda?.id && (
                <View style={[st.wiersz, { paddingVertical: 6, borderTopWidth: 1, borderTopColor: K.linia }]}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>⚽</Text>
                  <Text style={{ color: KOLOR_POZ[d.strzelec.poz], width: 36, fontWeight: "700", fontSize: 12 }}>{d.strzelec.poz}</Text>
                  <Text style={[st.tekst, { flex: 1, fontSize: 14 }]} numberOfLines={1}>{d.strzelec.imie} {d.strzelec.nazwisko}</Text>
                  <Text style={{ color: K.akcent, fontWeight: "800" }}>{d.strzelec.gole} gol.</Text>
                </View>
              )}

              <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 18 }]} onPress={onClose}>
                <Text style={st.przyciskTekst}>Zamknij</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

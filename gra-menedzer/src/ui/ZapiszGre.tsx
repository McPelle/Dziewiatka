import { useEffect, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import type { StanGry } from "../engine/types";
import { eksportujDoPliku, listaZapisow, type MetaZapisu, zapiszSlot } from "./zapis";
import { CZCIONKA, K, st } from "./styl";

const komunikat = (t: string) => (Platform.OS === "web" ? window.alert(t) : Alert.alert("", t));
const potwierdz = (t: string, ok: () => void) => {
  if (Platform.OS === "web") { if (window.confirm(t)) ok(); }
  else Alert.alert("Potwierdź", t, [{ text: "Anuluj", style: "cancel" }, { text: "Tak", onPress: ok }]);
};
export function kiedyTekst(ms: number): string {
  const d = new Date(ms);
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} ${z(d.getHours())}:${z(d.getMinutes())}`;
}

/** Okno „Zapisz grę": nadpisz bieżący zapis, wybierz dowolny slot do nadpisania, nowy zapis albo eksport do pliku. */
export function ZapiszGre({ s, otwarte, onClose }: { s: StanGry; otwarte: boolean; onClose: () => void }) {
  const [lista, setLista] = useState<MetaZapisu[]>([]);
  const [trwa, setTrwa] = useState(false);
  useEffect(() => { if (otwarte) listaZapisow().then(setLista); }, [otwarte]);

  const zapisz = async (opcje: { nowy?: boolean; id?: string }) => {
    setTrwa(true);
    try {
      const m = await zapiszSlot(s, opcje);
      setLista(await listaZapisow());
      komunikat(`✅ Zapisano: ${m.nazwa} · sezon ${m.sezon} (${kiedyTekst(m.kiedy)}).\nZnajdziesz go w „Wczytaj grę" w menu głównym.`);
      onClose();
    } catch (e) {
      komunikat(e instanceof Error ? e.message : "Nie udało się zapisać.");
    } finally { setTrwa(false); }
  };
  const biezacy = lista.find((m) => m.id === s.slotId);

  return (
    <Modal visible={otwarte} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "88%", paddingBottom: 20 }]}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text style={st.tytul}>💾 Zapisz grę</Text>
            <Text style={[st.maly, { marginTop: 2 }]}>Wybierz, gdzie zapisać bieżącą karierę.</Text>

            {biezacy && (
              <Pressable disabled={trwa} onPress={() => zapisz({ id: biezacy.id })} style={[st.karta, { marginTop: 12, borderColor: K.akcent, borderWidth: 1 }]}>
                <Text style={{ color: K.akcent, fontWeight: "900", fontFamily: CZCIONKA }}>↻ Nadpisz bieżący zapis</Text>
                <Text style={st.maly}>{biezacy.nazwa} · sezon {biezacy.sezon} · {kiedyTekst(biezacy.kiedy)}</Text>
              </Pressable>
            )}
            <Pressable disabled={trwa} onPress={() => zapisz({ nowy: true })} style={[st.karta, { marginTop: 10 }]}>
              <Text style={{ color: K.zielony, fontWeight: "900", fontFamily: CZCIONKA }}>＋ Nowy zapis</Text>
              <Text style={st.maly}>Utwórz osobny slot (poprzednie zapisy zostają).</Text>
            </Pressable>

            {lista.filter((m) => m.id !== s.slotId).length > 0 && (
              <Text style={[st.naglowek, { marginTop: 16 }]}>Nadpisz inny zapis</Text>
            )}
            {lista.filter((m) => m.id !== s.slotId).map((m) => (
              <Pressable key={m.id} disabled={trwa}
                onPress={() => potwierdz(`Nadpisać zapis „${m.nazwa}" (sezon ${m.sezon}, ${kiedyTekst(m.kiedy)})? Tamten stan gry zostanie zastąpiony.`, () => zapisz({ id: m.id }))}
                style={[st.karta, st.wiersz, { marginTop: 8, justifyContent: "space-between" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: K.tekst, fontWeight: "800", fontFamily: CZCIONKA }}>{m.nazwa}</Text>
                  <Text style={st.maly}>{m.liga} · sezon {m.sezon}{m.trener ? ` · ${m.trener}` : ""}</Text>
                  <Text style={[st.maly, { fontSize: 10.5 }]}>{kiedyTekst(m.kiedy)}</Text>
                </View>
                <Text style={{ color: K.czerwony, fontWeight: "800" }}>Nadpisz</Text>
              </Pressable>
            ))}

            {Platform.OS === "web" && (
              <Pressable onPress={() => { const b = eksportujDoPliku(s); if (b) komunikat(b); }} style={[st.karta, { marginTop: 16 }]}>
                <Text style={{ color: K.niebieski, fontWeight: "900", fontFamily: CZCIONKA }}>⬇ Eksportuj do pliku</Text>
                <Text style={st.maly}>Kopia zapasowa na dysk — przeniesiesz ją na inne urządzenie przez „Importuj z pliku".</Text>
              </Pressable>
            )}
            <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 16 }]} onPress={onClose}>
              <Text style={st.przyciskTekst}>Zamknij</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

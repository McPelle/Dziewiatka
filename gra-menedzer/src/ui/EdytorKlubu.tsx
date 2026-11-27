import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { StanGry } from "../engine/types";
import { Herb } from "./Herb";
import { K, st } from "./styl";

export function EdytorKlubu({ s, klubId, onClose, odswiez }: { s: StanGry; klubId: string | null; onClose: () => void; odswiez: () => void }) {
  const klub = klubId ? s.kluby[klubId] : undefined;
  const [nazwa, setNazwa] = useState("");
  const [skrot, setSkrot] = useState("");
  const [miasto, setMiasto] = useState("");
  const [herb, setHerb] = useState<string | undefined>(undefined);
  const [szukaj, setSzukaj] = useState("");
  const [stadion, setStadion] = useState("");
  const [pojemnosc, setPojemnosc] = useState("");
  const [adres, setAdres] = useState("");

  useEffect(() => {
    if (!klub) return;
    setNazwa(klub.nazwa); setSkrot(klub.skrot); setMiasto(klub.miasto); setHerb(klub.herb); setSzukaj("");
    setStadion(klub.stadion); setPojemnosc(String(klub.pojemnosc)); setAdres(klub.adres);
  }, [klubId]);

  // Kluby z herbem pasujące do wyszukiwania (do podmiany herbu).
  const wyniki = szukaj.trim().length < 2 ? [] :
    Object.values(s.kluby).filter((k) => k.herb && k.nazwa.toLowerCase().includes(szukaj.trim().toLowerCase())).slice(0, 12);

  const zapisz = () => {
    if (!klub) return;
    klub.nazwa = nazwa.trim() || klub.nazwa;
    klub.skrot = (skrot.trim() || klub.skrot).slice(0, 4).toUpperCase();
    klub.miasto = miasto.trim() || klub.miasto;
    klub.herb = herb;
    klub.stadion = stadion.trim() || klub.stadion;
    const p = parseInt(pojemnosc.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(p) && p > 0) klub.pojemnosc = Math.min(120000, p);
    klub.adres = adres.trim();
    odswiez();
    onClose();
  };

  const podglad = klub ? { ...klub, nazwa, skrot: skrot || "?", herb } : undefined;

  return (
    <Modal visible={!!klub} transparent animationType="slide" onRequestClose={onClose}>
      <View style={st.zaslona}>
        <View style={[st.arkusz, { maxHeight: "92%", paddingBottom: 20 }]}>
          {klub && (
            <ScrollView contentContainerStyle={{ padding: 18 }}>
              <View style={[st.wiersz, { gap: 12 }]}>
                {podglad && <Herb klub={podglad} rozmiar={48} />}
                <Text style={st.tytul}>Edytor klubu</Text>
              </View>

              <Text style={[st.naglowek, { marginTop: 14 }]}>Nazwa klubu</Text>
              <TextInput style={st.input} value={nazwa} onChangeText={setNazwa} placeholderTextColor={K.szary} />
              <View style={[st.wiersz, { gap: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[st.naglowek, { marginTop: 10 }]}>Skrót (3)</Text>
                  <TextInput style={st.input} value={skrot} onChangeText={setSkrot} maxLength={4} autoCapitalize="characters" placeholderTextColor={K.szary} />
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={[st.naglowek, { marginTop: 10 }]}>Miasto</Text>
                  <TextInput style={st.input} value={miasto} onChangeText={setMiasto} placeholderTextColor={K.szary} />
                </View>
              </View>

              <Text style={[st.naglowek, { marginTop: 10 }]}>Stadion</Text>
              <TextInput style={st.input} value={stadion} onChangeText={setStadion} placeholderTextColor={K.szary} />
              <View style={[st.wiersz, { gap: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[st.naglowek, { marginTop: 10 }]}>Pojemność</Text>
                  <TextInput style={st.input} value={pojemnosc} onChangeText={setPojemnosc} keyboardType="numeric" placeholderTextColor={K.szary} />
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={[st.naglowek, { marginTop: 10 }]}>Adres</Text>
                  <TextInput style={st.input} value={adres} onChangeText={setAdres} placeholder="ul. ..., miasto" placeholderTextColor={K.szary} />
                </View>
              </View>

              <Text style={[st.naglowek, { marginTop: 16 }]}>Herb</Text>
              <View style={[st.wiersz, { gap: 10, flexWrap: "wrap" }]}>
                <Pressable style={[st.przyciskMaly, { borderColor: herb ? K.linia : K.akcent }]} onPress={() => setHerb(undefined)}>
                  <Text style={[st.przyciskMalyTekst, { color: herb ? K.tekst : K.akcent }]}>Bez herbu (tarcza w barwach)</Text>
                </Pressable>
              </View>
              <Text style={[st.maly, { marginTop: 8 }]}>Podmień herb — wpisz nazwę klubu, którego herbu chcesz użyć:</Text>
              <TextInput style={[st.input, { marginTop: 6 }]} value={szukaj} onChangeText={setSzukaj} placeholder="np. Wisła Kraków" placeholderTextColor={K.szary} />
              {wyniki.map((k) => (
                <Pressable key={k.id} onPress={() => setHerb(k.herb)} style={[st.wiersz, { paddingVertical: 8, borderTopWidth: 1, borderTopColor: K.linia }]}>
                  <Herb klub={k} rozmiar={26} />
                  <Text style={[st.tekst, { flex: 1, marginLeft: 10, fontSize: 14 }]}>{k.nazwa}</Text>
                  {herb === k.herb && <Text style={{ color: K.akcent, fontWeight: "800" }}>✓</Text>}
                </Pressable>
              ))}

              <Pressable style={[st.przycisk, { marginHorizontal: 0, marginTop: 18 }]} onPress={zapisz}>
                <Text style={st.przyciskTekst}>Zapisz zmiany</Text>
              </Pressable>
              <Pressable style={[st.przyciskMaly, { marginTop: 10, alignItems: "center" }]} onPress={onClose}>
                <Text style={st.przyciskMalyTekst}>Anuluj</Text>
              </Pressable>
              <Text style={[st.maly, { marginTop: 10 }]}>
                Wgranie własnego pliku herbu wymaga wersji aplikacji z dostępem do galerii (dev build) — na razie można użyć herbu
                istniejącego klubu albo tarczy w barwach.
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
